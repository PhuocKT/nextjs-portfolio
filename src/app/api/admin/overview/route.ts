    import { NextResponse } from "next/server";
    import { connectDB } from "@/lib/mongodb";
    import { Todo } from "@/models/Todo";
    import User from "@/models/User";

    export async function GET() {
    try {
        await connectDB();

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

        return NextResponse.json({ totalTodos, totalUsers, byStatus, byPriority });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }
