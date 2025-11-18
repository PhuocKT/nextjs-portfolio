import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";
import User from "@/models/User";
import { Difficulty } from "@/models/Difficulty";
import Attendance from "@/models/Attendance"; // ✅ Import Model Attendance mới
import mongoose from "mongoose";

// --- Interfaces ---
// Định nghĩa Types để TypeScript hiểu cấu trúc dữ liệu trả về từ DB
interface TodoDoc {
    createdAt: Date;
    status: string;
    finishedAt?: Date;
    userId: mongoose.Types.ObjectId;
    priority: string;
}

interface UserDoc {
    _id: mongoose.Types.ObjectId;
    name: string;
    // Các trường checkIn/Out trong User model cũ không còn quan trọng cho history nữa
}

interface AttendanceDoc {
    userId: mongoose.Types.ObjectId;
    checkInTime: Date;
    checkOutTime?: Date;
    date: Date;
}

// Helper: Lấy mốc thời gian bắt đầu (00:00:00) và kết thúc (23:59:59) của một ngày
const getDayRange = (dateStr: string) => {
    const start = new Date(dateStr);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
};

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        
        // PARAMS
        const fromStr = url.searchParams.get("from") || new Date().toISOString();
        const toStr = url.searchParams.get("to") || new Date().toISOString();
        const dailyDateStr = url.searchParams.get("dailyDate") || new Date().toISOString().split("T")[0];
        const userIdFilter = url.searchParams.get("userId"); 

        // 1. RANGE FILTER SETUP (Cho Analytics: Trend, Stats)
        const { start: rangeStart } = getDayRange(fromStr);
        const { end: rangeEnd } = getDayRange(toStr);

        // 2. DAILY FILTER SETUP (Cho Operations: Check-In Table, Logs)
        const { start: dailyStart, end: dailyEnd } = getDayRange(dailyDateStr);

        // --- ANALYTICS QUERY BUILDER ---
        const todoMatch: mongoose.FilterQuery<TodoDoc> = {
            createdAt: { $gte: rangeStart, $lte: rangeEnd }
        };
        const doneMatch: mongoose.FilterQuery<TodoDoc> = {
            status: 'done',
            finishedAt: { $gte: rangeStart, $lte: rangeEnd }
        };

        if (userIdFilter && userIdFilter !== 'all') {
            const objId = new mongoose.Types.ObjectId(userIdFilter);
            todoMatch.userId = objId;
            doneMatch.userId = objId;
        }

        // === 1. ANALYTICS DATA (Dựa trên Range & Todo Model) ===

        // A. Tổng quan số liệu
        const totalTasks = await Todo.countDocuments(todoMatch);
        const completedTasks = await Todo.countDocuments(doneMatch);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // B. Top 5 Performers
        const topPerformers = await Todo.aggregate([
            { $match: { 
                status: 'done', 
                finishedAt: { $gte: rangeStart, $lte: rangeEnd } 
            }},
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { name: "$user.name", count: 1 } }
        ]);

        // C. Task Trend
        const taskTrendMatch = {
            createdAt: { $gte: rangeStart, $lte: rangeEnd },
            ...(userIdFilter && userIdFilter !== 'all' ? { userId: new mongoose.Types.ObjectId(userIdFilter) } : {})
        };

        const taskTrendAgg = await Todo.aggregate([
            { $match: taskTrendMatch },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                created: { $sum: 1 },
                completed: { 
                    $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } 
                }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        const taskTrend = taskTrendAgg.map((t: { _id: string; created: number; completed: number }) => ({
            name: t._id.split('-').slice(1).join('/'), // MM/DD
            created: t.created,
            completed: t.completed
        }));

        // D. Status & Priority Breakdown
        const statusAgg = await Todo.aggregate([
            { $match: todoMatch }, 
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const priorityAgg = await Todo.aggregate([
            { $match: todoMatch }, 
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        const byStatus = [
            { name: 'Todo', value: 0, color: '#6366f1' },
            { name: 'Doing', value: 0, color: '#f59e0b' },
            { name: 'Done', value: 0, color: '#10b981' }
        ];
        
        statusAgg.forEach((s: { _id: string; count: number }) => {
            const idx = byStatus.findIndex(b => b.name.toLowerCase() === s._id);
            if (idx > -1) byStatus[idx].value = s.count;
        });

        const byPriority = ["low", "medium", "high"].map(p => ({
            name: p.toUpperCase(),
            count: priorityAgg.find((a: { _id: string; count: number }) => a._id === p)?.count || 0
        }));


        // === 2. DAILY OPERATIONS DATA (Dựa trên DailyDate & Attendance Model) ===
        // ✅ LOGIC MỚI: Lấy dữ liệu Lịch Sử (History) thay vì dữ liệu Real-time

        // Bước 1: Lấy danh sách tất cả User
        const allUsers = await User.find({})
            .select("_id name")
            .sort({ name: 1 })
            .lean<UserDoc[]>();

        // Bước 2: Lấy Logs điểm danh trong ngày được chọn (dailyStart)
        // Lưu ý: `dailyStart` ở đây đã được đưa về 00:00:00, khớp với field `date` trong Attendance model
        const attendanceLogs = await Attendance.find({ 
            date: dailyStart 
        }).lean<AttendanceDoc[]>();

        // Bước 3: Map user với log điểm danh tương ứng
        const checkInOutData = allUsers.map(user => {
            // Tìm log của user này trong mảng attendanceLogs
            const log = attendanceLogs.find(a => a.userId.toString() === user._id.toString());

            return {
                _id: user._id.toString(),
                name: user.name,
                // Nếu có log thì lấy giờ, không thì null
                checkInTime: log ? log.checkInTime : null,
                checkOutTime: log ? log.checkOutTime : null,
                // Logic hiển thị status "Active": Đã check in VÀ chưa check out
                isCheckedIn: !!(log?.checkInTime && !log?.checkOutTime)
            };
        });

        // Calculate active members for that specific day (Total checked in at least once OR currently active)
        // Tuỳ nhu cầu: Ở đây ta đếm số người hiện đang active (chưa checkout) vào thời điểm cuối ngày đó hoặc hiện tại
        const activeMembersCount = checkInOutData.filter(u => u.isCheckedIn).length;

        // Difficulties Log (Vẫn lấy theo ngày)
        const difficulties = await Difficulty.find({ 
            createdAt: { $gte: dailyStart, $lte: dailyEnd } 
        })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .lean();


        // === 3. META DATA ===
        // Reuse allUsers for the filter dropdown
        const usersList = allUsers.map(u => ({ _id: u._id.toString(), name: u.name }));

        return NextResponse.json({
            summary: {
                totalTasks,
                completedTasks,
                completionRate
            },
            taskTrend,
            byStatus,
            byPriority,
            topPerformers,
            dailyOps: {
                checkInOutData, // ✅ Dữ liệu chính xác theo lịch sử
                difficulties,
                activeMembers: activeMembersCount 
            },
            usersList
        });

    } catch (err) {
        console.error("Dashboard API Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}