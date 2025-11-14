"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, LogIn } from "lucide-react";
// ✅ SỬA LỖI 1: Thay đổi đường dẫn import để khớp với Context chúng ta đã tạo
import { useUser } from "@/context/UserContext"; 
import toast from "react-hot-toast"; // Thêm import toast

type SidebarProps = {
    isCollapsed: boolean;
    toggleSidebar: () => void;
};

export default function Navbar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const router = useRouter();
    
    // ✅ Lấy user VÀ setUser từ Context
    const { user, setUser, isLoading } = useUser(); 

    // ✅ SỬA LỖI 2: Cập nhật hàm Logout với logic đầy đủ
    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            
            if (res.ok) {
                toast.success("Logged out successfully!");
                
                // ✅ RẤT QUAN TRỌNG: Cập nhật Global State
                setUser(null); 
                
                // Chuyển hướng về trang login
                router.push("/auth/login");
            } else {
                toast.error("Logout failed.");
                console.error("Logout failed");
            }
        } catch (err) {
            toast.error("An error occurred during logout.");
            console.error("Network error:", err);
        }
    };

    // Đổi 'loading' thành 'isLoading' để khớp với Context
    if (isLoading) return null; 

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
                        src="/logo.jpg" // Sử dụng placeholder
                        alt="Logo"
                        width={100}
                        height={100}
                        priority={true}
                        className="rounded-full w-12"
                    />
                    <span
                        className={`text-xl font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-500 ${
                            isCollapsed
                                ? "opacity-0 translate-x-[-10px] w-0"
                                : "opacity-100 translate-x-0 w-auto"
                        }`}
                    >
                        HAYWORK
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

            {/* Nút Login / Logout - Đã sửa logic */}
            <div className="flex flex-col items-center mb-6">
                {user ? (
                    <button onClick={handleLogout} className="flex items-center bg-red-500 px-4 py-2 rounded">
                        <LogOut size={18} /> 
                        {/* ✅ SỬA LỖI 3: Thêm chữ "Logout" */}
                        {!isCollapsed && <span className="ml-2">Logout</span>}
                    </button>
                ) : (
                    <button onClick={() => router.push("/auth/login")} className="flex items-center bg-green-500 px-4 py-2 rounded">
                        <LogIn size={18} /> 
                        {/* ✅ SỬA LỖI 3: Thêm chữ "Login" */}
                        {!isCollapsed && <span className="ml-2">Login</span>}
                    </button>
                )}
            </div>
        </nav>
    );
}