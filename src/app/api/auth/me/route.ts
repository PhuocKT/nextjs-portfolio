    import { NextResponse } from "next/server";
    import jwt from "jsonwebtoken";

    // Thay thế bằng logic DB thực tế của bạn (ví dụ: Prisma, Mongoose, hoặc một ORM khác)
    // Dưới đây là một hàm giả định:
    // Nó phải fetch người dùng từ DB, bao gồm checkInTime và checkOutTime
    async function findUserById(userId: string) {
        // --- START: DB Mock Data (Thay thế phần này bằng code DB thật) ---
        // Giả định bạn có một bảng User và lưu check-in/out state vào đó
        const mockDb = new Map(); 
        // Giả sử dữ liệu đã được lưu:
        mockDb.set("user_123", {
            id: "user_123",
            name: "Test User",
            email: "test@example.com",
            role: "user",
            // ✅ Dữ liệu cần thiết được load từ DB
            checkInTime: "2025-11-14T08:00:00.000Z", 
            checkOutTime: null,
        });
        // --- END: DB Mock Data ---

        // Trong thực tế, bạn sẽ dùng: 
        // const user = await db.user.findUnique({ where: { id: userId } });
        const user = mockDb.get(userId); 
        return user; 
    }


    const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

    export async function GET(req: Request) {
        try {
            const cookieHeader = req.headers.get("cookie");
            if (!cookieHeader) {
                return NextResponse.json({ error: "No token" }, { status: 401 });
            }

            const token = cookieHeader
                .split(";")
                .find((c) => c.trim().startsWith("token="))
                ?.split("=")[1];

            if (!token) {
                return NextResponse.json({ error: "Token missing" }, { status: 401 });
            }

            // 1. Xác thực Token (Lấy ID người dùng)
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string }; // Cần biết ID có trong JWT
            const userId = decoded.id; // Lấy ID

            if (!userId) {
                return NextResponse.json({ error: "Token corrupted: missing user ID" }, { status: 401 });
            }

            // 2. Truy vấn DB để lấy dữ liệu đầy đủ
            const user = await findUserById(userId); 

            if (!user) {
                return NextResponse.json({ error: "User not found in database" }, { status: 404 });
            }
            
            // 3. Trả về dữ liệu người dùng đầy đủ từ DB
            return NextResponse.json({ user }); 

        } catch (err) {
            console.error("Auth check error:", err);
            // Trả về lỗi 401 nếu token không hợp lệ/hết hạn
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }
    }