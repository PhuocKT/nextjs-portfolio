"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SidebarProps = {
    isCollapsed: boolean;
    toggleSidebar: () => void;
};
export default function Navbar({ isCollapsed, toggleSidebar }: SidebarProps) {
    
    const router = useRouter();
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
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="rounded-full"
            />
            <span
                className={`text-xl font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-500 ${
                isCollapsed
                    ? "opacity-0 translate-x-[-10px] w-0"
                    : "opacity-100 translate-x-0 w-auto"
                }`}
            >
                Hoàn phước
            </span>
            </div>

            {/* Menu */}
            <div className="flex flex-col space-y-3 w-full px-3">
                {[
                { icon: "🏠", text: "Home", path: "/" },
                { icon: "📁", text: "Projects", path: "/projects" },
                { icon: "📞", text: "Contact", path: "/contact" },
                ].map((item, i) => (
                <button
                    key={i}
                    onClick={() => router.push(item.path)}
                    className="hover:bg-indigo-700 rounded-md py-2 px-3 text-left transition-all duration-500 flex items-center"
                >
                    <span className="mr-2">{item.icon}</span>
                    <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${
                        isCollapsed
                        ? "opacity-0 translate-x-[-10px] w-0"
                        : "opacity-100 translate-x-0 w-auto"
                    }`}
                    >
                    {item.text}
                    </span>
                </button>
                ))}
            </div>

        </div>

        {/* Nút toggle */}
        <button
            onClick={toggleSidebar}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-indigo-600 text-white rounded-full shadow-md p-2 border border-white hover:scale-110 transition-all duration-300"
        >
            {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
        </nav>
    );
}
