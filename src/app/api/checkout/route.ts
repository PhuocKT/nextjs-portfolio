import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyToken } from "@/utils/jwt";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";

export async function POST() {
  await connectDB();

  const token = (await cookies()).get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const userRecord = await User.findById(user.id);

  const today = new Date().toISOString().slice(0, 10);

  // Chưa check in
  if (!userRecord.checkInTime)
    return NextResponse.json({ error: "Bạn chưa Check In!" }, { status: 400 });

  // Check in ngày khác
  if (userRecord.checkInTime.toISOString().slice(0, 10) !== today)
    return NextResponse.json({ error: "Bạn chưa Check In hôm nay!" }, { status: 400 });

  // Đã check out rồi
  if (userRecord.checkOutTime?.toISOString().slice(0, 10) === today)
    return NextResponse.json({ error: "Bạn đã Check Out hôm nay rồi!" }, { status: 400 });

  // Lưu checkout
  userRecord.checkOutTime = new Date();
  userRecord.isCheckedIn = false;
  await userRecord.save();

  return NextResponse.json({ message: "⏰ Check Out thành công!" });
}
