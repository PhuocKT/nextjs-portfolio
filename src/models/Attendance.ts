    // /models/Attendance.ts
    import mongoose, { Schema, Document, models } from "mongoose";

    export interface IAttendance extends Document {
    userId: mongoose.Types.ObjectId;
    checkInTime: Date;
    checkOutTime?: Date | null;
    date: Date; // Dùng để query chính xác theo ngày (lưu mốc 00:00:00)
    }

    const AttendanceSchema = new Schema<IAttendance>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        checkInTime: { type: Date, required: true },
        checkOutTime: { type: Date, default: null },
        date: { type: Date, required: true, index: true }, // Index giúp tìm kiếm nhanh hơn
    },
    { timestamps: true }
    );

    export default models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);