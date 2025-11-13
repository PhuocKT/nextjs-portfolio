import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) {
        return NextResponse.json({ error: "No token" }, { status: 401 });
        }

        const token = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

        if (!token) {
        return NextResponse.json({ error: "Token missing" }, { status: 401 });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        return NextResponse.json({ user: decoded });
    } catch (err) {
        console.error("Auth check error:", err);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}
