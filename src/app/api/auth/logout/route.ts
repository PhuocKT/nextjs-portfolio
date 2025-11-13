// ✅ src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Tạo response
        const res = NextResponse.json({ message: "Logged out" });

        // ✅ Xóa cookie bằng NextResponse.cookies
        res.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
        });

        return res;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
