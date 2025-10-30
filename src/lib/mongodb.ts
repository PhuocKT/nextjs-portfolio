    // src/lib/mongodb.ts
    import mongoose, { Mongoose } from "mongoose";

    // ✅ Định nghĩa kiểu rõ ràng cho cache
    interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
    }

    const MONGODB_URI: string = process.env.MONGODB_URI || "";
    if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }

    // ✅ Dùng globalThis để tránh lỗi hot-reload
    declare global {
    var mongooseCache: MongooseCache | undefined;
    }

    // ✅ const thay vì let (vì không gán lại)
    const cached: MongooseCache = global.mongooseCache || {
    conn: null,
    promise: null,
    };

    // ✅ Gán lại global cache nếu chưa có
    if (!global.mongooseCache) {
    global.mongooseCache = cached;
    }

    export async function connectDB(): Promise<Mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
        dbName: "todoapp",
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
    }
