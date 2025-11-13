import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Difficulty } from "@/models/Difficulty";
import { verifyToken } from "@/utils/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    // ✅ Lấy cookie token từ header
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: missing token" }, { status: 401 });
    }

    // ✅ Giải mã token
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: invalid token" }, { status: 401 });
    }

    // ✅ Lấy body và kiểm tra dữ liệu
    const body = await req.json();
    const text = (body.text || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // ✅ Lưu vào DB
    const doc = await Difficulty.create({
      userId: user.id,
      date: today,
      text,
    });

    return NextResponse.json({ message: "Saved", doc });
  } catch (err) {
    console.error("POST /api/difficulties error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
