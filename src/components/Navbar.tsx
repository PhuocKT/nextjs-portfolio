"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, LogIn } from "lucide-react";
import { useUser } from "@/hooks/useUser"; // ✅ Hook kiểm tra user đăng nhập

type SidebarProps = {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    };

    export default function Navbar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const router = useRouter();
    const { user, loading } = useUser(); // ✅ Lấy user từ hook

    // ✅ Hàm Logout
    const handleLogout = async () => {
        try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        if (res.ok) {
            router.push("/auth/login");
             // ✅ Quay lại trang login sau khi logout
        } else {
            console.error("Logout failed");
        }
        } catch (err) {
        console.error("Network error:", err);
        }
    };

    if (loading) return null;

    return (
        <nav
        className={`fixed left-0 top-0 h-screen bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg flex flex-col justify-between transition-all duration-500 ${
            isCollapsed ? "w-20" : "w-60"
        }`}
        >
        {/* Logo + Text */}
        <div className="flex flex-col items-center mt-6 space-y-8">
            <div className="flex items-center gap-3 transition-all duration-500">
            <Image
                src="/logo.jpg"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
            />
            <span
                className={`text-xl font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-500 ${
                isCollapsed
                    ? "opacity-0 translate-x-[-10px] w-0"
                    : "opacity-100 translate-x-0 w-auto"
                }`}
            >
                HAYWORK GLOBAL
            </span>
            </div>
        </div>

        {/* Nút Toggle */}
        <button
            onClick={toggleSidebar}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-indigo-600 text-white rounded-full shadow-md p-2 border border-white hover:scale-110 transition-all duration-300"
        >
            {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>

        {/* Nút Login / Logout */}
        <div className="flex flex-col items-center mb-6">
            {user ? (
                <button onClick={handleLogout} className="bg-blue-500 px-4 py-2 rounded">
                    <LogOut size={18} /> {!isCollapsed && <span></span>}
                </button>
                ) : (
                <button onClick={() => router.push("/auth/login")} className="bg-blue-500 px-4 py-2 rounded">
                    <LogIn size={18} /> {!isCollapsed && <span></span>}
                </button>
            )}

        </div>
        </nav>
    );
    }
