"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, LogIn } from "lucide-react"; // Bỏ ChevronLeft, ChevronRight
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";

// 1. Bỏ props `isCollapsed` và `toggleSidebar`
export default function Navbar() {
    const router = useRouter();
    const { user, setUser, isLoading } = useUser();

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            
            if (res.ok) {
                toast.success("Logged out successfully!");
                setUser(null);
                router.push("/auth/login");
            } else {
                toast.error("Logout failed.");
            }
        } catch (err) {
            toast.error("An error occurred during logout.");
        }
    };

    if (isLoading) return null;

    return (
        // 2. Thay đổi hoàn toàn CSS:
        // - Chuyển từ 'fixed left-0 top-0 h-screen' sang 'fixed top-0 left-0 w-full h-16'
        // - Thêm 'z-50' để đảm bảo header luôn ở trên cùng
        // - Chuyển từ 'flex-col justify-between' sang 'flex-row items-center justify-between'
        // - Thêm 'px-6' (padding hai bên)
        <nav
            className={`fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg flex flex-row items-center justify-between px-6 z-50 transition-all duration-500`}
        >
            {/* Logo + Text */}
            {/* 3. Bỏ các class căn chỉnh dọc (mt-6, space-y-8) */}
            <div className="flex items-center gap-3">
                <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={48} // Điều chỉnh kích thước logo cho header
                    height={48}
                    priority={true}
                    className="rounded-full w-10 h-10" // Dùng w-10 h-10
                />
                {/* 4. Bỏ logic ẩn/hiện text, luôn hiển thị */}
                <span className="text-xl font-semibold tracking-wide whitespace-nowrap">
                    HAYWORK
                </span>
            </div>

            {/* 5. Xóa hoàn toàn nút Toggle (Chevron) */}

            {/* Nút Login / Logout */}
            {/* 6. Bỏ các class căn chỉnh dọc (mb-6) */}
            <div className="flex items-center">
                {user ? (
                    <button onClick={handleLogout} className="flex items-center bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors">
                        <LogOut size={18} />
                        {/* 7. Luôn hiển thị chữ 'Logout', bỏ logic isCollapsed */}
                        <span className="ml-2">Logout</span>
                    </button>
                ) : (
                    <button onClick={() => router.push("/auth/login")} className="flex items-center bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition-colors">
                        <LogIn size={18} />
                        {/* 8. Luôn hiển thị chữ 'Login' */}
                        <span className="ml-2">Login</span>
                    </button>
                )}
            </div>
        </nav>
    );
}