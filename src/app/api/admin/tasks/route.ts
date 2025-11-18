import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";

export async function GET() {
    try {
        await connectDB();
        const todos = await Todo.find({})
            .populate("userId", "name email role")
            .sort({ createdAt: -1 });
        return NextResponse.json(todos);
    } catch (err) {
        console.error("GET /api/admin/tasks error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        
        // SỬA ĐỔI: Không nhận 'status' từ request body
        const { text, priority, userId } = await req.json();
        
        if (!text)
            return NextResponse.json({ error: "Missing text" }, { status: 400 });

        const todo = await Todo.create({
            text,
            status: "todo", // SỬA ĐỔI: Luôn mặc định là 'todo' khi tạo mới
            priority: priority || "low",
            userId,
            createdAt: new Date(),
        });
        return NextResponse.json(todo, { status: 201 });
    } catch (err) {
        console.error("POST /api/admin/tasks error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}