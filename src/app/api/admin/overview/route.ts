// /app/api/admin/overview/route.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";
import User from "@/models/User"; 
import { Difficulty } from "@/models/Difficulty"; 

// Utility function to get start and end of a date (UTC)
const getDayRange = (dateStr: string) => {
    // 1. Tạo Date object từ chuỗi YYYY-MM-DD.
    // Việc này đảm bảo điểm bắt đầu là 00:00:00 theo giờ local/server, 
    // sau đó ta chuyển nó sang UTC.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const date = new Date(dateStr); 
    
    // 2. Chuẩn hóa thành ngày bắt đầu (UTC 00:00:00 của ngày đó)
    // Lấy YYYY-MM-DD từ dateStr và tạo Date object mới, Mongoose sẽ tự động hiểu nó là UTC.
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');

    // 3. Chuẩn hóa thành ngày kết thúc (UTC 23:59:59.999 của ngày đó)
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');
    
    // Nếu vẫn có lỗi lệch ngày, hãy thử dùng setUTCHours() để đảm bảo:
    // const startOfDay = new Date(dateStr); startOfDay.setUTCHours(0, 0, 0, 0);
    // const endOfDay = new Date(dateStr); endOfDay.setUTCHours(23, 59, 59, 999);
    
    return { startOfDay, endOfDay };
};

export async function GET(req: Request) {
    try {
        await connectDB();
        
        const url = new URL(req.url);
        const filterDate = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
        
        const { startOfDay, endOfDay } = getDayRange(filterDate);

        // === 1. TỔNG QUAN TOÀN HỆ THỐNG ===
        const totalTodos = await Todo.countDocuments({});
        const totalUsers = await User.countDocuments({});
        
        const byStatusAgg = await Todo.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const byPriorityAgg = await Todo.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);
        
        const byStatus = ["todo", "doing", "done"].map((s) => ({
            name: String(s).toUpperCase(),
            count: byStatusAgg.find((x) => x._id === s)?.count ?? 0,
        }));
        const byPriority = ["low", "medium", "high"].map((p) => ({
            name: String(p).toUpperCase(),
            count: byPriorityAgg.find((x) => x._id === p)?.count ?? 0,
        }));

        // === 2. CHỈ SỐ HOẠT ĐỘNG TRONG NGÀY (Lọc theo filterDate) ===
        // 🚀 Dùng startOfDay/endOfDay đã chuẩn hóa UTC
        const tasksCreatedToday = await Todo.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        const tasksCompletedToday = await Todo.countDocuments({
            status: 'done',
            finishedAt: { $gte: startOfDay, $lte: endOfDay }
        });
        const activeMembers = await User.countDocuments({
            isCheckedIn: true 
        });
        
        const todayStats = {
            tasksCreatedToday,
            tasksCompletedToday,
            activeMembers
        };

        // === 3. XU HƯỚNG 7 NGÀY ===
        const taskTrend = [];
        for (let i = 6; i >= 0; i--) {
            // Lấy ngày cần truy vấn
            const date = new Date(startOfDay);
            date.setUTCDate(date.getUTCDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const { startOfDay: dayStart, endOfDay: dayEnd } = getDayRange(dateStr);

            const created = await Todo.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });
            const completed = await Todo.countDocuments({
                status: 'done',
                finishedAt: { $gte: dayStart, $lte: dayEnd }
            });
            
            taskTrend.push({
                name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                created,
                completed
            });
        }

        // === 4. LOGS VÀ TRẠNG THÁI ===

        // 🟢 FIX STATUS: Luôn lấy TRẠNG THÁI HIỆN TẠI (Real-time status) của TẤT CẢ user, KHÔNG lọc theo ngày.
        // Dùng .lean() để trả về plain JS objects (quan trọng với Date/Boolean)
        const checkInOutData = await User.find({}) 
            .select("name checkInTime checkOutTime isCheckedIn")
            .sort({ name: 1 }) 
            .lean();

        // Difficulty Log (Giữ nguyên lọc theo `filterDate`)
        const difficulties = await Difficulty.find({ date: filterDate }) 
            .populate("userId", "name")
            .sort({ createdAt: -1 })
            .lean();

        // === 5. TRẢ VỀ DỮ LIỆU ===
        return NextResponse.json({ 
            totalTodos, 
            totalUsers, 
            byStatus, 
            byPriority, 
            todayStats,
            taskTrend,
            checkInOutData, 
            difficulties 
        });
    } catch (err) {
        console.error(err);
        const errorMessage = (err instanceof Error) ? err.message : "An unknown error occurred";
        return NextResponse.json({ error: "Server error", details: errorMessage }, { status: 500 });
    }
}