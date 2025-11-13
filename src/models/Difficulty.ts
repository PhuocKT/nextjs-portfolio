// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose, { Schema, model, models } from "mongoose";

const DifficultySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    text: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date() },
});

export const Difficulty = models.Difficulty || model("Difficulty", DifficultySchema);
