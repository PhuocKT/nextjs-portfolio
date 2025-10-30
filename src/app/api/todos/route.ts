import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";

// ✅ GET - lấy danh sách
export async function GET() {
    try {
        await connectDB();
        const todos = await Todo.find().sort({ createdAt: -1 });
        return NextResponse.json(todos);
    } catch (err) {
        console.error("GET /api/todos error:", err);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
    }

    // ✅ POST - thêm mới
    export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const todo = await Todo.create({
        text: body.text,
        status: body.status ?? "todo",
        priority: body.priority ?? "low",
        createdAt: new Date(),
        });
        return NextResponse.json(todo);
    } catch (err) {
        console.error("POST /api/todos error:", err);
        return NextResponse.json({ message: "Failed to create todo" }, { status: 500 });
    }
}
