import { Schema, model, models } from "mongoose";

const TodoSchema = new Schema(
    {
        text: { type: String, required: true },
        status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
        priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
        createdAt: { type: Date, default: () => new Date() },
        startedAt: { type: Date, default: null },
        finishedAt: { type: Date, default: null },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export const Todo = models.Todo || model("Todo", TodoSchema);
