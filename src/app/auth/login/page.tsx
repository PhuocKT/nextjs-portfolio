"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
        setError(data.error || "Login failed");
        return;
        }

        alert(`✅ Xin chào ${data.user.name}!`);

        // ✅ Dùng router.push để chuyển trang sau khi cookie set thành công
        if (data.user.role === "admin") {
        router.push("/projects/dashboard");
        } else {
        router.push("/");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200">
        <form
            onSubmit={handleLogin}
            className="bg-white shadow-md rounded-xl p-8 w-80 flex flex-col gap-4"
        >
            <h2 className="text-2xl font-bold text-center text-indigo-700 mb-2">
            🔐 Login
            </h2>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <input
            type="email"
            placeholder="Email"
            className="border rounded-md px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Password"
            className="border rounded-md px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />

            <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium"
            >
            Login
            </button>
        </form>
        </div>
    );
}
