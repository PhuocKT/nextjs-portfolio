import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITodo extends Document {
    text: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    createdAt: Date;
    startedAt?: Date;
    finishedAt?: Date;
    }

    // 🔧 Định nghĩa Schema
    const TodoSchema = new Schema<ITodo>(
    {
        text: { type: String, required: true, unique: true },
        status: {
        type: String,
        enum: ["todo", "doing", "done"],
        default: "todo",
        },
        priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
        },
        createdAt: { type: Date, default: Date.now },
        startedAt: Date,
        finishedAt: Date,
    },
    { timestamps: true }
    );

    // ⚙️ Nếu Model tồn tại, dùng lại (tránh lỗi khi reload)
    export const Todo: Model<ITodo> =
    mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);
