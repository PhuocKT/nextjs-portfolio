"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function HomePage() {
    interface User {
        id: string;
        name: string;
        email: string;
        role: "user" | "admin";
    }

const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const fetchUser = async () => {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
        };
        fetchUser();
    }, []);

    if (!user) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
        <Toaster position="top-right" reverseOrder={false} />
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
            👋 Xin chào, {user.name}!
        </h1>

        {user.role === "admin" ? (
            <button
            onClick={() => (window.location.href = "/projects/dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
            Xem Dashboard
            </button>
        ) : (
            <button
            onClick={() => (window.location.href = "/projects/todoapp")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
            ✅ Check In - Vào Task Todo
            </button>
        )}

        {user && (
            <div className="mt-6 flex gap-4">
                <button
                onClick={async () => {
                    await fetch("/api/checkin", { method: "POST" });
                    toast.success("✅ Check In thành công!");
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                ✅ Check In
                </button>

                <button
                onClick={async () => {
                    await fetch("/api/checkout", { method: "POST" });
                    toast("🕒 Đã Check Out!");
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                ⏰ Check Out
                </button>
            </div>
        )}

        </div>
    );
}
