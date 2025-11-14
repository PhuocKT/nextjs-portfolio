    import { NextResponse } from "next/server";
    import User from "@/models/User";
    import { verifyToken } from "@/utils/jwt";
    import { cookies } from "next/headers";
    import { connectDB } from "@/lib/mongodb";

    export async function GET() {
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

    const userRecord = await User.findById(user.id);

    const today = new Date().toISOString().slice(0, 10);

    const checkedIn =
        userRecord.checkInTime &&
        userRecord.checkInTime.toISOString().slice(0, 10) === today;

    const checkedOut =
        userRecord.checkOutTime &&
        userRecord.checkOutTime.toISOString().slice(0, 10) === today;

    return NextResponse.json({ checkedIn, checkedOut });
    }
