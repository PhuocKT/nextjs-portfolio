"use client";
import { useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    }

    /**
     * ✅ Hook useUser — kiểm tra user hiện tại dựa trên cookie token
     * (không dùng localStorage, vì Next.js cookie đã tự lưu khi login)
     */
    export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
        try {
            // ✅ Gửi request lấy thông tin user dựa trên token trong cookie
            const res = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include", // cookie tự động gửi
            });

            if (!res.ok) {
            setUser(null);
            return;
            }

            const data = await res.json();
            setUser(data.user || null);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
        };

        fetchUser();
    }, []);

    // ✅ Hàm đăng xuất client-side
    const clearUser = async () => {
        try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (err) {
        console.error("Logout error:", err);
        } finally {
        setUser(null);
        }
    };

    return { user, loading, clearUser };
}
