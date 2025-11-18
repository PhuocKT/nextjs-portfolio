import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({}, "-passwordHash").sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (err) {
        console.error("GET /api/admin/users error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password)
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });

        // SỬA ĐỔI: Kiểm tra trùng lặp email HOẶC name (không phân biệt hoa thường)
        const exists = await User.findOne({
            $or: [
                // $options: 'i' = case-insensitive
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { name: { $regex: new RegExp(`^${name}$`, 'i') } }
            ]
        });

        if (exists) {
            // Kiểm tra xem cái nào bị trùng để trả về lỗi cụ thể
            if (exists.email.toLowerCase() === email.toLowerCase()) {
                return NextResponse.json({ error: "Email already exists" }, { status: 400 });
            }
            if (exists.name.toLowerCase() === name.toLowerCase()) {
                return NextResponse.json({ error: "User name already exists" }, { status: 400 });
            }
        }
        
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            passwordHash,
            role: role || "user",
            createdAt: new Date(),
        });
        
        // Không trả về passwordHash
        const userResponse = newUser.toObject();
        delete userResponse.passwordHash;

        return NextResponse.json(userResponse, { status: 201 });
    } catch (err) {
        console.error("POST /api/admin/users error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}