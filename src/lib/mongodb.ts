import mongoose, { Mongoose } from "mongoose";

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
    }

    const MONGODB_URI = process.env.MONGODB_URI!;
    if (!MONGODB_URI) throw new Error("❌ Missing MONGODB_URI in .env.local");

    declare global {
    var mongooseCache: MongooseCache | undefined;
    }

    const cached = global.mongooseCache || { conn: null, promise: null };
    if (!global.mongooseCache) global.mongooseCache = cached;

    export async function connectDB(): Promise<Mongoose> {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { dbName: "todoapp" });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
