"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; 
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const router = useRouter();
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
                setUser(data.user); 

                if (data.user && data.user.role === "admin") {
                    router.push("/"); 
                } else {
                    router.push("/"); 
                }
            } else {
                toast.error(data.error || "Login failed.");
                setIsLoading(false);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Toaster position="top-right" />
            
            {/* LEFT COLUMN: IMAGE */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-indigo-700 relative">
                <Image
                    // Use a relevant, high-resolution image for the background
                    src="/haywork.jpg" 
                    alt="HAYWORK GLOBAL Office Building"
                    layout="fill"
                    objectFit="cover"
                    priority={true}
                    className="opacity-70"
                />
                
            </div>

            {/* RIGHT COLUMN: LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 lg:p-12">
                <form 
                    onSubmit={handleSubmit} 
                    className="w-full max-w-md p-10 bg-white shadow-2xl rounded-xl border border-indigo-100"
                >
                    <div className="flex flex-col items-center mb-8">
                        <Image
                            src="/logo.jpg" 
                            alt="Logo"
                            width={80}
                            height={80}
                            className="rounded-full w-20 h-20 mb-3"
                        />
                        <h2 className="text-3xl font-bold text-indigo-700">
                            Employee Login
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 font-semibold transition-colors"
                        >
                            {isLoading ? "Authenticating..." : "Login"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}