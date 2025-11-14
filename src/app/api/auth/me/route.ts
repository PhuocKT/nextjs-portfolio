// ✅ src/app/api/auth/me/route.ts

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb"; // Import hàm kết nối DB
import User from "@/models/User"; // Import Mongoose Model User

// Bạn KHÔNG cần hàm findUserById giả định nữa.
// async function findUserById(userId: string) { ... } 

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
    try {
        // 1. Kết nối DB
        await connectDB(); 

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

        // 2. Xác thực Token (Lấy ID người dùng)
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const userId = decoded.id; // Lấy ID

        if (!userId) {
            return NextResponse.json({ error: "Token corrupted: missing user ID" }, { status: 401 });
        }

        // 3. 🎯 TRUY VẤN DB THẬT để lấy dữ liệu đầy đủ
        const userRecord = await User.findById(userId).select('-passwordHash');

        if (!userRecord) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }
        
        // 4. Trả về dữ liệu người dùng đầy đủ (đã bao gồm checkInTime/checkOutTime)
        // ✅ Đảm bảo chuyển Date thành ISO string (định dạng string) để truyền qua JSON
        return NextResponse.json({ 
            user: {
                id: userRecord._id.toString(),
                name: userRecord.name,
                email: userRecord.email,
                role: userRecord.role,
                checkInTime: userRecord.checkInTime ? userRecord.checkInTime.toISOString() : null, 
                checkOutTime: userRecord.checkOutTime ? userRecord.checkOutTime.toISOString() : null,
            }
        }); 

    } catch (err) {
        console.error("Auth check error:", err);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
}