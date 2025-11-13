// ✅ src/utils/jwt.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Hàm xác thực token — dùng cho API route
export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: "user" | "admin";
        };
        return decoded;
    } catch (err) {
        console.error("❌ JWT verify failed:", err);
        return null;
    }
    }

    // ✅ (Tùy chọn) Nếu muốn lấy token trực tiếp từ cookies trong API:
    import { cookies } from "next/headers";

    export async function getUserFromCookies() {
    const cookieStore = await cookies(); // 🔥 cần await ở Next.js 15
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    return verifyToken(token);
    }
