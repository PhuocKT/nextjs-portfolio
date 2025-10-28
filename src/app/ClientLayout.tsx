"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    return (
        <div className="flex min-h-screen transition-all duration-500 ease-in-out">
        {/* 🟢 Navbar có width động */}
        <div
            className={`transition-all duration-500 ease-in-out ${
            isCollapsed ? "w-20" : "w-60"
            }`}
        >
            <Navbar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        </div>

        {/* 🟣 Main tự chiếm phần còn lại, mượt theo navbar */}
        <main
            className={`flex-1 transition-all duration-500 ease-in-out bg-gradient-to-br from-sky-100 to-indigo-100 ${
            isCollapsed ? "ml-0" : "ml-0"
            }`}
        >
            {children}
            <Footer />
        </main>
        </div>
        
    );
}
