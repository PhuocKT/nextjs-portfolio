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

  const today = new Date().toISOString().slice(0, 10);
  const userRecord = await User.findById(user.id);

  // Đã checkin hôm nay → chặn
  if (userRecord.checkInTime) {
    const checkInDate = userRecord.checkInTime.toISOString().slice(0, 10);
    if (checkInDate === today)
      return NextResponse.json({ error: "Bạn đã check in hôm nay rồi!" }, { status: 400 });
  }

  // Lưu check in
  userRecord.checkInTime = new Date();
  userRecord.checkOutTime = null; // reset
  userRecord.isCheckedIn = true;
  await userRecord.save();

  return NextResponse.json({ message: "✅ Check In thành công!" });
}
