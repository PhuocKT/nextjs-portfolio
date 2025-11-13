import { NextResponse } from "next/server";
import User from "@/models/User";
import { verifyToken } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const user = verifyToken(token); // ✅ truyền token vào
  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }

    await User.findByIdAndUpdate(user.id, { checkInTime: new Date(), checkOutTime: null });
    return NextResponse.json({ message: "✅ Checked in!" });
}
