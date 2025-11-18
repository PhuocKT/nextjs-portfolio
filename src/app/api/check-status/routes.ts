// /app/api/check-status/route.ts
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance"; // Query từ Attendance chính xác hơn
import { verifyToken } from "@/utils/jwt";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ checkedIn: false, checkedOut: false });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ checkedIn: false, checkedOut: false });
    }

    // Lấy mốc ngày hôm nay (UTC 00:00:00)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Tìm bản ghi Attendance của hôm nay
    const attendanceRecord = await Attendance.findOne({
      userId: user.id,
      date: todayStart,
    });

    // Xác định trạng thái dựa trên bản ghi Attendance
    const checkedIn = !!attendanceRecord; // Có bản ghi = Đã Check In
    const checkedOut = !!(attendanceRecord && attendanceRecord.checkOutTime); // Có bản ghi & có giờ ra = Đã Check Out

    return NextResponse.json({ checkedIn, checkedOut });
  } catch (err) {
    console.error("Check-status Error:", err);
    return NextResponse.json({ checkedIn: false, checkedOut: false }, { status: 500 });
  }
}