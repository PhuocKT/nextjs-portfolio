import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";
import { verifyToken } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // ✅ Nếu là admin → xem toàn bộ
    const query = user.role === "admin" ? {} : { userId: user.id };
    const todos = await Todo.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(todos);
  } catch (err) {
    console.error("GET /api/todos error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });

    let user = null;
    try {
      user = verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    if (!user)
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });

    const body = await req.json();
    const todo = await Todo.create({
      text: body.text,
      status: body.status ?? "todo",
      priority: body.priority ?? "low",
      userId: user.id,
      createdAt: new Date(),
    });

    return NextResponse.json(todo);
  } catch (err) {
    console.error("POST /api/todos error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
