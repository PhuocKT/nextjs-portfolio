import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    role: { type: String, default: "user" },
    isCheckedIn: { type: Boolean, default: false },
    });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

    export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch)
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        
        // ✅ Tạo token JWT
        const token = jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
        );

        // ✅ Trả về cookie + user info
        const res = NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: { name: user.name, email: user.email, role: user.role },
        });

        // ✅ Lưu token vào cookie (để client fetch kèm theo credentials: include)
        res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60, // 1 ngày
        });
        
        return res;
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
