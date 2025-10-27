"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

type Todo = {
    id: number;
    text: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    createdAt: string;
    startedAt?: string;
    finishedAt?: string;
    };

export default function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [input, setInput] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState<
        "all" | "low" | "medium" | "high"
    >("all");
    const [error, setError] = useState("");
    const router = useRouter();

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("todos_v4");
        if (saved) setTodos(JSON.parse(saved));
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("todos_v4", JSON.stringify(todos));
    }, [todos]);

    const handleBackToProjects = () => router.push("/projects");

    // Add job
    const handleAdd = () => {
        const text = input.trim();
        if (!text) {
            setError("⚠️ You must enter a task name!");
            return;
        }

        // ✅ Kiểm tra trùng tên (không phân biệt hoa thường)
        const isDuplicate = todos.some(
            (todo) => todo.text.toLowerCase() === text.toLowerCase()
        );

        if (isDuplicate) {
            setError("⚠️ This task already exists!");
            return;
        }

        setError("");

        const newTodo: Todo = {
            id: Date.now(),
            text,
            status: "todo",
            priority,
            createdAt: new Date().toLocaleString(),
        };

        setTodos((prev) => [...prev, newTodo]);
        toast.success("Task added successfully!");
        setInput("");
    };


    // Move forward (Todo -> Doing -> Done)
    const moveNext = (id: number) => {
        setTodos((prev) =>
        prev.map((t) => {
            if (t.id === id) {
                if (t.status === "todo")
                    return {
                    ...t,
                    status: "doing",
                    startedAt: new Date().toLocaleString(),
                    };
                if (t.status === "doing")
                    return {
                    ...t,
                    status: "done",
                    finishedAt: new Date().toLocaleString(),
                };
            }
            return t;
        }));
        toast("➡️ Task moved forward!");
    };

    // Move back (Done -> Doing -> Todo)
    const moveBack = (id: number) => {
        setTodos((prev) =>
        prev.map((t) => {
            if (t.id === id) {
                if (t.status === "doing") {
                    // Reset started time
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { startedAt, ...rest } = t;
                        return { ...rest, status: "todo" };
                    }
                    if (t.status === "done") {
                        // Reset finished time
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { finishedAt, ...rest } = t;
                        return { ...rest, status: "doing" };
                }
            }
            return t;
        }));
        toast("⬅️ Task moved back!");
    };

    const handleDelete = (id: number) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        toast.error("Task deleted!");
    };



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

    const columns = [
        { title: "📝 To-Do", key: "todo" },
        { title: "⚙️ Doing", key: "doing" },
        { title: "✅ Done", key: "done" },
    ] as const;

    // Filter + Search + Sort
    const filteredTodos = todos
        .filter((t) => t.text.toLowerCase().includes(search.toLowerCase()))
        .filter((t) => (filterPriority === "all" ? true : t.priority === filterPriority))
        .sort((a, b) => {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
        });

    return (
        <main className="ml-5 p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
        {/* Header */}
        <Toaster position="top-right" reverseOrder={false} />
        <button
            onClick={handleBackToProjects}
            className="bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4 transition-all duration-200"
        >
            ◀️ Back
        </button>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
            {/* Unified Input + Search + Filter Row */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <h1 className="flex flex-wrap justify-start text-3xl font-bold text-indigo-600 mb-4 text-center">
                    To-Do App 🗂️
                </h1>
                <div className="flex flex-wrap justify-center gap-3 items-center flex-1 min-w-[280px]">
                    <div className="relative flex items-center w-full max-w-[400px]">
                    <input
                        type="text"
                        placeholder="Type your job..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="border border-gray-300 bg-sky-100 rounded-md px-4 py-2 flex-1 min-w-[200px] max-w-[400px] pr-8"
                    />
                    {input && (
                        <button
                        onClick={() => setInput("")}
                        className="absolute right-2 text-gray-500 hover:text-red-500"
                        title="Clear"
                        >
                        ❌
                        </button>
                    )}
                </div>
                    <select
                    value={priority}
                    onChange={(e) =>
                        setPriority(e.target.value as "low" | "medium" | "high")
                    }
                    className="border border-gray-300 bg-sky-100 rounded-md px-3 py-2"
                    >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                    </select>
                    <button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md"
                    >
                    Add
                    </button>
                    
                </div>

                <div className="flex flex-wrap gap-3 items-center min-w-[280px] justify-end">
                    <div className="relative flex items-center w-fit">
                        <input
                            type="text"
                            placeholder="🔍 Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-gray-300 bg-sky-100 rounded-md px-3 py-2 w-[180px] pr-8"
                        />
                        {search && (
                            <button
                            onClick={() => setSearch("")}
                            className="absolute right-2 text-gray-500 hover:text-red-500"
                            title="Clear search"
                            >
                            ❌
                            </button>
                        )}
                    </div>
                    <select
                    value={filterPriority}
                    onChange={(e) =>
                        setFilterPriority(
                        e.target.value as "all" | "low" | "medium" | "high"
                        )
                    }
                    className="border border-gray-300 bg-sky-100 font-medium rounded-md px-3 py-2"
                    >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
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
                {list.length === 0 ? (
                    <div className="text-gray-400 italic text-center mt-10">
                    <Image src="/notthing.webp" alt="No items" className="mx-auto mb-4 object-contain" width={200} height={200} />
                    <p>No tasks here!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                    {list.map((todo) => (
                        <div
                        key={todo.id}
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
                            <p>🕒 Created: {todo.createdAt}</p>
                            {todo.startedAt && <p>🚀 Started: {todo.startedAt}</p>}
                            {todo.finishedAt && <p>🏁 Finished: {todo.finishedAt}</p>}
                        </div>

                        <div className="flex justify-end mt-3 space-x-2">
                            {todo.status !== "todo" && (
                            <button
                                onClick={() => moveBack(todo.id)}
                                className="bg-sky-200 hover:bg-sky-300 text-black text-sm px-3 py-1 rounded"
                            >
                                ⬅ Back
                            </button>
                            )}
                            {todo.status !== "done" ? (
                            <button
                                onClick={() => moveNext(todo.id)}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-3 py-1 rounded"
                            >
                                Move →
                            </button>
                            ) : (
                            <button
                                onClick={() => handleDelete(todo.id)}
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
