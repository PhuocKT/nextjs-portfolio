"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";


type Todo = {
    _id?: string;
    id?: string;
    text: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    createdAt: string;
    startedAt?: string | null;
    finishedAt?: string | null;
    };

    export default function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [input, setInput] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [difficultyText, setDifficultyText] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [savingDifficulty, setSavingDifficulty] = useState(false);
    const router = useRouter();


    // ===== FETCH TODOS =====
    useEffect(() => {
        const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/todos", {
            method: "GET",
            credentials: "include", // ✅ cookie tự động gửi
            });

            if (res.status === 401) {
            toast.error("⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            return;
            }

            if (!res.ok) throw new Error("Failed to load todos");
            const data: Todo[] = await res.json();
            setTodos(data);
        } catch (err) {
            console.error("Fetch tasks error:", err);
            toast.error("❌ Cannot load tasks from server!");
        } finally {
            setLoading(false);
        }
        };

        fetchTodos();
    }, []);

    // ===== CREATE =====
    const handleAdd = async () => {
        const text = input.trim();
        if (!text) {
        setError("⚠️ You must enter a task name!");
        return;
        }
        setError("");

        const isDuplicate = todos.some(
        (todo) => todo.text && todo.text.toLowerCase() === text.toLowerCase()
        );
        if (isDuplicate) {
        setError("⚠️ This task already exists!");
        return;
        }

        const newTodo = {
        text,
        status: "todo",
        priority,
        createdAt: new Date().toISOString(),
        };

        try {
        const res = await fetch("/api/todos", {
            method: "POST",
            credentials: "include", // ✅ gửi cookie
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo),
        });

        if (res.status === 401) {
            toast.error("⚠️ Bạn cần đăng nhập để thêm task!");
            return;
        }

        const created = await res.json();
        setTodos((prev) => [...prev, created]);
        setInput("");
        toast.success("✅ Task added successfully!");
        } catch {
        toast.error("❌ Failed to add task!");
        }
    };

    // ===== MOVE NEXT =====
    const moveNext = async (id: string) => {
        const todo = todos.find((t) => t._id === id);
        if (!todo) return;

        let updateData = {};
        if (todo.status === "todo") {
        updateData = { status: "doing", startedAt: new Date().toISOString() };
        } else if (todo.status === "doing") {
        updateData = { status: "done", finishedAt: new Date().toISOString() };
        }

        try {
        const res = await fetch(`/api/todos/${id}`, {
            method: "PATCH",
            credentials: "include", // ✅ cookie
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });

        if (!res.ok) throw new Error("Failed to update task");

        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        toast.success("➡️ Task moved forward!");
        } catch (err) {
        console.error("Move task error:", err);
        toast.error("❌ Failed to move task!");
        }
    };

    // ===== MOVE BACK =====
    const moveBack = async (id: string) => {
        const todo = todos.find((t) => t._id === id);
        if (!todo) return;

        let updateData = {};
        if (todo.status === "doing") {
        updateData = { status: "todo", startedAt: null };
        } else if (todo.status === "done") {
        updateData = { status: "doing", finishedAt: null };
        }

        try {
        await fetch(`/api/todos/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });
        setTodos((prev) =>
            prev.map((t) =>
            t._id === id ? { ...t, ...updateData } : t
            )
        );
        toast.success("⬅️ Task moved back!");
        } catch {
        toast.error("❌ Failed to move back!");
        }
    };

    // ===== DELETE =====
    const handleDelete = async (id: string) => {
        try {
        await fetch(`/api/todos/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        setTodos((prev) => prev.filter((t) => t._id !== id));
        toast.error("🗑️ Task deleted!");
        } catch {
        toast.error("❌ Failed to delete!");
        }
    };

    // ===== SAVE DIFFICULTY =====
    const handleSaveDifficulty = async () => {
        if (!difficultyText.trim()) return toast.error("Please enter content");

        try {
            const res = await fetch("/api/difficulties", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // ✅ gửi cookie tự động
            body: JSON.stringify({ text: difficultyText }),
            });

            if (!res.ok) {
            const data = await res.json();
            throw new Error(data?.error || "Failed");
            }

            toast.success("✅ Issue saved successfully!");
            setDifficultyText("");
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to save issue");
        }
        };


    // ===== UI =====
    const getPriorityColor = (p: string) => {
        switch (p) {
        case "low":
            return "bg-green-200 text-green-800";
        case "medium":
            return "bg-yellow-200 text-yellow-800";
        case "high":
            return "bg-red-200 text-red-800";
        default:
            return "";
        }
    };

    const filteredTodos = todos
        .filter((t) => t.text && t.text.toLowerCase().includes(search.toLowerCase()))
        .filter((t) => (filterPriority === "all" ? true : t.priority === filterPriority))
        .sort((a, b) => {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
        });

    const columns = [
        { title: "📝 To-Do", key: "todo" },
        { title: "⚙️ Doing", key: "doing" },
        { title: "✅ Done", key: "done" },
    ] as const;

    function formatDateISO(iso?: string | null) {
        if (!iso) return "";
        try {
            const dt = new Date(iso);
            return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            }).format(dt);
        } catch {
            return iso;
        }
    }

    function timeAgo(iso?: string | null) {
        if (!iso) return "";
            const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
        if (isNaN(seconds)) return "";
            const intervals: [number, Intl.RelativeTimeFormatUnit][] = [
                [60, "second"],
                [60, "minute"],
                [24, "hour"],
                [7, "day"],
                [4.34524, "week"],
                [12, "month"],
                [Number.POSITIVE_INFINITY, "year"],
            ];
        let value = seconds;
        let unit: Intl.RelativeTimeFormatUnit = "second";
        for (let i = 0; i < intervals.length; i++) {
            const [limit, u] = intervals[i];
            if (Math.abs(value) < limit) {
                unit = u;
                break;
            }
            value = Math.round(value / limit);
        }
        const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
        return rtf.format(-value, unit);
    }
    
    return (
        <main className="ml-5 p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
        <Toaster position="top-right" />
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-indigo-600">To-Do App 🗂️</h1>
            
            <button
                onClick={() => router.push("/")}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg shadow transition-all duration-200"
            >
                🏠 Về Trang chủ
            </button>
        </div>


        {/* Input Area */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <input
                type="text"
                placeholder="Type your task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 bg-sky-50 focus:ring-2 focus:ring-indigo-300 outline-none"
            />
            <select
                value={priority}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e) => setPriority(e.target.value as any)}
                className="border bg-sky-50 rounded-lg px-3 py-2 text-gray-700"
            >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
            </select>
            <button
                onClick={handleAdd}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg"
            >
                Add
            </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <div className="flex flex-wrap items-center gap-3">
            <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 bg-sky-50 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all"
            />
            <select
                value={filterPriority}
                onChange={(e) =>
                setFilterPriority(e.target.value as "all" | "low" | "medium" | "high")
                }
                className="border border-gray-300 bg-sky-50 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all"
            >
                <option value="all">All</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
            </select>
            </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
            const list = filteredTodos.filter((t) => t.status === col.key);
            return (
                <div key={col.key} className="bg-white rounded-xl shadow p-4 min-h-[400px]">
                <h2 className="text-xl font-bold text-indigo-600 mb-3">{col.title}</h2>
                {loading && <p className="text-gray-500 text-center">⏳ Loading...</p>}
                {list.length === 0 ? (
                    <div className="text-gray-400 italic text-center mt-10">
                    <Image src="/notthing.webp" alt="No items" width={200} height={150} className="mx-auto" />
                    <p>No tasks here!</p>
                    </div>
                ) : (
                    list.map((todo) => (
                    <div key={todo._id} className={`border rounded-md p-3 mb-3 ${todo.status === "done" ? "bg-green-50" : todo.status === "doing" ? "bg-yellow-50" : "bg-gray-50"}`}>
                        <div className="flex justify-between items-center">
                        <span>{todo.text}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>
                            {todo.priority.toUpperCase()}
                        </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                            <p>🕒 Created: {formatDateISO(todo.createdAt)} {todo.createdAt && <span>• {timeAgo(todo.createdAt)}</span>}</p>
                            {todo.startedAt && <p>🚀 Started: {formatDateISO(todo.startedAt)} {todo.startedAt && <span>• {timeAgo(todo.startedAt)}</span>}</p>}
                            {todo.finishedAt && <p>🏁 Finished: {formatDateISO(todo.finishedAt)} {todo.finishedAt && <span>• {timeAgo(todo.finishedAt)}</span>}</p>}
                        </div>
                        <div className="flex justify-end mt-3 space-x-2">
                        {todo.status !== "todo" && (
                            <button onClick={() => moveBack(todo._id!)} className="bg-sky-200 hover:bg-sky-300 px-3 py-1 rounded text-sm">
                            ⬅ Back
                            </button>
                        )}
                        {todo.status !== "done" ? (
                            <button onClick={() => moveNext(todo._id!)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                            Move →
                            </button>
                        ) : (
                            <button onClick={() => handleDelete(todo._id!)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                            Delete
                            </button>
                        )}
                        </div>
                    </div>
                    ))
                )}
                </div>
            );
            })}
        </div>

        {/* Difficulties */}
        <div className="mt-8 bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">📝 Daily Difficulties</h3>
            <div className="flex gap-3 items-start">
            <textarea
                value={difficultyText}
                onChange={(e) => setDifficultyText(e.target.value)}
                placeholder="Write down your difficulties or notes for today..."
                className="flex-1 border rounded-md p-3 min-h-[80px]"
            />
            <button
                onClick={handleSaveDifficulty}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                disabled={savingDifficulty}
            >
                {savingDifficulty ? "Saving..." : "Save"}
            </button>
            </div>
        </div>
        </main>
    );
}
