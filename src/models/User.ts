import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: "user" | "admin";
    isCheckedIn: boolean;
    checkInTime?: Date | null;
    checkOutTime?: Date | null;
    createdAt?: Date;
    }

    const UserSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isCheckedIn: { type: Boolean, default: false },
    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
});

// ⚙️ Fix lỗi re-register model khi hot reload ở Next.js
export default models.User || mongoose.model<IUser>("User", UserSchema);
