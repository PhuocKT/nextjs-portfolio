"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/todos";
    
    export default function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [input, setInput] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState<
        "all" | "low" | "medium" | "high"
    >("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // ===== READ =====
    useEffect(() => {
        const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Failed to load todos");
            const data: Todo[] = await res.json();
            setTodos(data);

        } catch (err) {
            console.error("Move task error:", err);
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

        const isDuplicate = todos.some(
            (todo) => todo.text.toLowerCase() === text.toLowerCase()
        );
        if (isDuplicate) {
            setError("⚠️ This task already exists!");
            return;
        }
        setError("");

        const newTodo = {
        text,
        status: "todo",
        priority,
        createdAt: new Date().toISOString(),
        };

        try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo),
        });
        const created = await res.json();
        setTodos((prev) => [...prev, created]);
        setInput("");
        toast.success("✅ Task added successfully!");
        } catch {
        toast.error("❌ Failed to add task!");
        }
    };

    // ===== UPDATE (Move Next) =====
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

    // ===== UPDATE (Move Back) =====
    const moveBack = async (id: string) => {
        const todo = todos.find((t) => t._id === id);
        if (!todo) return;

        try {
        if (todo.status === "doing") {
            await fetch(`${API_URL}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "todo", startedAt: null }),
            });
            setTodos((prev) =>
            prev.map((t) =>
                t._id === id
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ? (({ startedAt, ...rest }: Todo) => ({ ...rest, status: "todo" }))(t)
                : t
            )
            );
            toast("⬅️ Task moved back to To-Do!");
        } else if (todo.status === "done") {
            await fetch(`${API_URL}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "doing", finishedAt: null }),
            });
            setTodos((prev) =>
            prev.map((t) =>
                t._id === id
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                ? (({ finishedAt, ...rest }: Todo) => ({ ...rest, status: "doing" }))(t)
                : t
            )
            );
            toast("⬅️ Task moved back to Doing!");
        }
        } catch {
            toast.error("❌ Failed to move back!");
        }
    };

    // ===== DELETE =====
    const handleDelete = async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            setTodos((prev) => prev.filter((t) => t._id !== id));
            toast.error("🗑️ Task deleted!");
        } catch {
            toast.error("❌ Failed to delete!");
        }
    };

    // ===== Helper =====
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
        .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()))
        .filter((t) =>
        filterPriority === "all" ? true : t.priority === filterPriority
        )
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
        <Toaster position="top-right" reverseOrder={false} />
        <div className="flex justify-between">
            <button
            onClick={() => router.push("/projects")}
            className="bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4"
        >
            ◀️ Back
        </button>
        <h1 className="text-3xl font-bold text-indigo-600 mb-4 text-center">
                    To-Do App 🗂️
        </h1>
        <button
            onClick={() => router.push("/projects/dashboard")}
            className="bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4"
        >
            ▶️ DashBoard
        </button>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white rounded-2xl shadow-md p-6 mb-8">
        {/* --- Left: Input + Priority + Add button --- */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Input */}
            <div className="relative flex items-center flex-1 max-w-[350px]">
            <input
                type="text"
                placeholder="Type your task..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 pr-10 text-gray-700 placeholder-gray-400 
                    ${error ? "border-red-400 bg-red-50 focus:ring-red-300" : "border-gray-300 bg-sky-50 focus:ring-indigo-300"} 
                    focus:ring-2 focus:outline-none transition-all`}
            />
            {input && (
                <button
                onClick={() => setInput("")}
                className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                ❌
                </button>
            )}
            </div>

            {/* Priority select */}
            <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
            className="border border-gray-300 bg-sky-50 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all"
            >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
            </select>

            {/* Add button */}
            <button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm transition-all"
            >
            🛫 Add
            </button>
        </div>
            {error && (
                <p className="text-sm text-red-500 mt-1 ml-1">{error}</p>
            )}
        {/* --- Right: Search + Filter --- */}
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex items-center">
            <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 bg-sky-50 rounded-lg px-4 py-2 pr-10 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all w-[180px]"
            />
            {search && (
                <button
                onClick={() => setSearch("")}
                className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
                >
                ❌
                </button>
            )}
            </div>

            {/* Filter */}
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
        
        {/* Kanban Columns */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
            const list = filteredTodos.filter((t) => t.status === col.key);
            return (
                <div
                key={col.key}
                className="bg-white rounded-xl shadow p-4 min-h-[400px] flex flex-col"
                >
                
                <h2 className="text-xl font-bold text-indigo-600 mb-3">
                    {col.title}
                </h2>
                {loading && <p className="text-gray-500 mt-4 text-center">⏳ Loading...</p>}
                {list.length === 0 ? (
                    <div className="text-gray-400 italic text-center mt-10">
                    <Image
                        src="/notthing.webp"
                        alt="No items"
                        className="mx-auto mb-4 object-contain"
                        width={300}
                        height={200}
                    />
                    <p>No tasks here!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                    {list.map((todo) => (
                        <div
                        key={todo._id}
                        className={`border rounded-md p-3 shadow-sm ${
                            todo.status === "done"
                            ? "bg-green-50"
                            : todo.status === "doing"
                            ? "bg-yellow-50"
                            : "bg-gray-50"
                        }`}
                        >
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{todo.text}</span>
                            <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(
                                todo.priority
                            )}`}
                            >
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
                            <button
                                onClick={() => moveBack(todo._id!)}
                                className="bg-sky-200 hover:bg-sky-300 text-black text-sm px-3 py-1 rounded"
                            >
                                ⬅ Back
                            </button>
                            )}
                            {todo.status !== "done" ? (
                            <button
                                onClick={() => moveNext(todo._id!)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1 rounded"
                            >
                                Move →
                            </button>
                            ) : (
                            <button
                                onClick={() => handleDelete(todo._id!)}
                                className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                            >
                                Delete
                            </button>
                            )}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            );
            })}
        </div>
        </main>
    );
}
