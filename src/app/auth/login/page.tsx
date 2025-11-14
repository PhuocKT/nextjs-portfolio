"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; // <-- 1. Import Context
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function LoginPage() {
    const router = useRouter();
    
    // ✅ 2. Lấy hàm 'setUser' từ Context
    const { setUser } = useUser(); 

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Login successful! Redirecting...");
                
                // ✅ 3. CẬP NHẬT CONTEXT NGAY LẬP TỨC
                // API login của bạn trả về { user: {...} }
                setUser(data.user); 

                // ✅ 4. CHUYỂN HƯỚNG DỰA TRÊN ROLE
                if (data.user && data.user.role === "admin") {
                    // Chuyển thẳng đến Dashboard nếu là Admin
                    router.push("/projects/dashboard"); 
                } else {
                    // Chuyển về trang chủ nếu là User thường
                    router.push("/"); 
                }
            } else {
                toast.error(data.error || "Login failed.");
                setIsLoading(false);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
            <Toaster position="top-right" />
            <form 
                onSubmit={handleSubmit} 
                className="w-full max-w-sm p-8 bg-white shadow-lg rounded-lg border"
            >
                <div className="flex gap-1 justify-center items-center">
                    <Image
                                        src="/logo.jpg" // Sử dụng placeholder
                                        alt="Logo"
                                        width={100}
                                        height={100}
                                        priority={true}
                                        className="rounded-full w-16"
                                    />
                <h2 className="text-3xl font-bold text-center text-indigo-700 mb-2">
                    Login
                </h2>
                </div>
                
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>

                <div className="flex justify-center ">
                    <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-1/2 bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
                </div>
            </form>
        </div>
    );
}