import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";
import User from "@/models/User";
import { Difficulty } from "@/models/Difficulty";

// Interface to type the MongoDB query object correctly, avoiding 'any'
interface MongooseCheckInOutQuery {
    // KHÔNG CẦN role: { $ne: string }; NỮA
    // $or will contain objects with date conditions using MongoDB operators
    $or?: Array<{
        checkInTime?: { $gte: Date; $lte: Date };
        checkOutTime?: { $gte: Date; $lte: Date };
    }>;
}

export async function GET(req: Request) {
    try {
        await connectDB();
        
        const url = new URL(req.url);
        const filterDate = url.searchParams.get("date"); // Ngày cần lọc (YYYY-MM-DD)

        // 1. ✅ ĐÃ SỬA: Lấy dữ liệu tổng quan bao gồm TẤT CẢ người dùng
        const totalTodos = await Todo.countDocuments({});
        const totalUsers = await User.countDocuments({}); // Lấy count tất cả user (bao gồm Admin)

        // 2. Aggregate theo Status và Priority (Giữ nguyên)
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
        
        // 3. ✅ ĐÃ SỬA: Lấy dữ liệu Check In/Out cho TẤT CẢ người dùng
        // Bắt đầu với query rỗng để lấy tất cả user
        const checkInOutQuery: MongooseCheckInOutQuery = {}; 
        
        if (filterDate) {
            // Lọc các bản ghi mà checkInTime hoặc checkOutTime rơi vào ngày filterDate
            const startOfDay = new Date(filterDate);
            startOfDay.setUTCHours(0, 0, 0, 0); // Bắt đầu ngày (UTC)
            
            const endOfDay = new Date(filterDate);
            endOfDay.setUTCHours(23, 59, 59, 999); // Kết thúc ngày (UTC)

            // Áp dụng điều kiện lọc ngày cho tất cả user
            checkInOutQuery.$or = [
                { checkInTime: { $gte: startOfDay, $lte: endOfDay } },
                { checkOutTime: { $gte: startOfDay, $lte: endOfDay } }
            ];
        }

        const checkInOutData = await User.find(checkInOutQuery) // Tìm kiếm theo query mới (bao gồm Admin)
            .select("name checkInTime checkOutTime")
            .sort({ checkInTime: -1, checkOutTime: -1 })
            .lean();

        // 4. Lấy danh sách Difficulties chi tiết (Giữ nguyên)
        const today = filterDate || new Date().toISOString().split("T")[0];
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 6); 
        const sevenDaysAgo = last7Days.toISOString().split('T')[0];
        
        const difficulties = await Difficulty.find({ date: { $gte: sevenDaysAgo } })
            .populate("userId", "name") // Lấy tên người dùng
            .sort({ date: -1, createdAt: -1 })
            .lean();


        return NextResponse.json({ 
            totalTodos, 
            totalUsers, 
            byStatus, 
            byPriority, 
            checkInOutData, 
            difficulties 
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}