import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// 🔐 Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const encoder = new TextEncoder();
const secretKey = encoder.encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    console.log("🧩 Middleware Token:", token);

    // Cho phép truy cập trang login, đăng ký, hoặc static files
    if (
        pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/register") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.next();
    }

    // Nếu không có token → quay về login
    if (!token) {
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // ✅ Giải mã JWT bằng jose
        const { payload } = await jwtVerify(token, secretKey);
        const { role } = payload as { role: "user" | "admin" };

        // Nếu user truy cập dashboard admin => chặn
        if (role !== "admin" && pathname.startsWith("/projects/dashboard")) {
        const noAccessUrl = new URL("/403", req.url);
        return NextResponse.redirect(noAccessUrl);
        }

        // Nếu admin truy cập trang todoapp => cho phép (hoặc có thể chặn nếu muốn)
        return NextResponse.next();
    } catch (err) {
        console.error("JWT verify error:", err);
        const loginUrl = new URL("/auth/login", req.url);
        return NextResponse.redirect(loginUrl);
    }
    }

    // ✅ Áp dụng middleware cho các route cần bảo vệ
    export const config = {
    matcher: [
        "/",                 // Trang home
        "/projects/:path*",  // Toàn bộ dự án con
    ],
};
