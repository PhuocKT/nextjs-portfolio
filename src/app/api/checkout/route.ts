// /app/api/check-out/route.ts
import { NextResponse } from "next/server";
import User from "@/models/User";
import Attendance from "@/models/Attendance";
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

    // Lấy mốc ngày hôm nay (UTC 00:00:00)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // 1. Tìm bản ghi Attendance của hôm nay
    const attendanceRecord = await Attendance.findOne({
      userId: user.id,
      date: todayStart,
    });

    // Nếu không tìm thấy bản ghi nào -> Chưa check in
    if (!attendanceRecord) {
      return NextResponse.json({ error: "Bạn chưa Check In hôm nay!" }, { status: 400 });
    }

    // Nếu đã có checkOutTime -> Đã check out rồi
    if (attendanceRecord.checkOutTime) {
      return NextResponse.json({ error: "Bạn đã Check Out hôm nay rồi!" }, { status: 400 });
    }

    const now = new Date();

    // 2. Cập nhật bản ghi Attendance (Lưu lịch sử)
    attendanceRecord.checkOutTime = now;
    await attendanceRecord.save();

    // 3. Cập nhật trạng thái User (UI Real-time)
    await User.findByIdAndUpdate(user.id, {
      isCheckedIn: false,
      checkOutTime: now,
    });

    return NextResponse.json({ message: "⏰ Check Out thành công!" });
  } catch (err) {
    console.error("Check-out Error:", err);
    return NextResponse.json({ error: "Lỗi server khi Check-out" }, { status: 500 });
  }
}