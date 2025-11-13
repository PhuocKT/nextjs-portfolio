// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function POST() {
  try {
    await connectDB();

    // ✅ Lấy token từ cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // ✅ Cập nhật thời gian check out
    await User.findByIdAndUpdate(user.id, { checkOutTime: new Date() });

    // ✅ Xóa cookie token bằng API NextResponse
    const res = NextResponse.json({ message: "✅ Logged out successfully" });
    res.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      expires: new Date(0), // xoá cookie
    });

    return res;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
