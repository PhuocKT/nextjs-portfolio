// /app/api/check-in/route.ts
import { NextResponse } from "next/server";
import User from "@/models/User";
import Attendance from "@/models/Attendance"; // Import model mới
import { verifyToken } from "@/utils/jwt";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";

export async function POST() {
  try {
    await connectDB();

    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyToken(token);
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // Lấy thời gian bắt đầu của ngày hôm nay (UTC 00:00:00) để so sánh chính xác
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // 1. Kiểm tra trong bảng Attendance xem đã có bản ghi nào của ngày hôm nay chưa
    const existingAttendance = await Attendance.findOne({
      userId: user.id,
      date: todayStart,
    });

    if (existingAttendance) {
      return NextResponse.json({ error: "Bạn đã check in hôm nay rồi!" }, { status: 400 });
    }

    const now = new Date();

    // 2. Tạo bản ghi Lịch sử mới (Quan trọng cho Dashboard lọc ngày)
    await Attendance.create({
      userId: user.id,
      checkInTime: now,
      date: todayStart, // Lưu mốc ngày để dễ query
    });

    // 3. Cập nhật trạng thái User (Quan trọng cho UI Real-time)
    await User.findByIdAndUpdate(user.id, {
      isCheckedIn: true,
      checkInTime: now,
      checkOutTime: null, // Reset checkout cũ
    });

    return NextResponse.json({ message: "✅ Check In thành công!" });
  } catch (err) {
    console.error("Check-in Error:", err);
    return NextResponse.json({ error: "Lỗi server khi Check-in" }, { status: 500 });
  }
}