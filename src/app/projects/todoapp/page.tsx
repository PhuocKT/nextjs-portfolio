    "use client";

    import Image from "next/image";
    import { useState, useEffect } from "react";
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
    const [savingDifficulty, setSavingDifficulty] = useState(false);
    const router = useRouter();

    // ===== FETCH TODOS =====
    useEffect(() => {
        const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/todos", {
            method: "GET",
            credentials: "include",
            });

            if (res.status === 401) {
            toast.error("⚠️ Session expired. Please login again!");
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
        setError("⚠️ Task name is required!");
        return;
        }
        setError("");

        const isDuplicate = todos.some(
        (todo) => todo.text && todo.text.toLowerCase() === text.toLowerCase()
        );
        if (isDuplicate) {
        setError("⚠️ Task already exists!");
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
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo),
        });

        if (res.status === 401) {
            toast.error("⚠️ Unauthorized access!");
            return;
        }

        const created = await res.json();
        setTodos((prev) => [...prev, created]);
        setInput("");
        toast.success("✅ Task added!");
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
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });

        if (!res.ok) throw new Error("Failed to update task");

        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
        toast.success("🚀 Status updated!");
        } catch (err) {
        console.error(err);
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
            prev.map((t) => (t._id === id ? { ...t, ...updateData } : t))
        );
        toast.success("↩️ Task reverted!");
        } catch {
        toast.error("❌ Failed to revert!");
        }
    };

    // ===== DELETE =====
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
        await fetch(`/api/todos/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        setTodos((prev) => prev.filter((t) => t._id !== id));
        toast.success("🗑️ Task deleted!");
        } catch {
        toast.error("❌ Failed to delete!");
        }
    };

    // ===== SAVE DIFFICULTY =====
    const handleSaveDifficulty = async () => {
        if (!difficultyText.trim()) return toast.error("Content is empty");
        setSavingDifficulty(true);
        try {
        const res = await fetch("/api/difficulties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text: difficultyText }),
        });

        if (!res.ok) throw new Error("Failed");

        toast.success("📝 Issue logged!");
        setDifficultyText("");
        } catch (err) {
        console.error(err);
        toast.error("❌ Failed to save issue");
        } finally {
        setSavingDifficulty(false);
        }
    };

    // ===== UI HELPERS & FILTERS =====
    const getPriorityBadge = (p: string) => {
        switch (p) {
        case "low":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "medium":
            return "bg-amber-100 text-amber-700 border-amber-200";
        case "high":
            return "bg-rose-100 text-rose-700 border-rose-200";
        default:
            return "bg-slate-100 text-slate-600";
        }
    };

    const getPriorityBorder = (p: string) => {
        switch (p) {
        case "low": return "border-l-emerald-500";
        case "medium": return "border-l-amber-500";
        case "high": return "border-l-rose-500";
        default: return "border-l-slate-300";
        }
    };

    // --- LOGIC QUAN TRỌNG: LỌC TASK DONE SAU 7 NGÀY ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const filteredTodos = todos
        .filter((t) => {
        // 1. Search filter
        if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
        
        // 2. Priority filter
        if (filterPriority !== "all" && t.priority !== filterPriority) return false;

        // 3. Date filter for DONE tasks (Ẩn sau 7 ngày)
        if (t.status === "done" && t.finishedAt) {
            const finishedDate = new Date(t.finishedAt);
            // Nếu ngày hoàn thành nhỏ hơn (trước) ngày cách đây 7 ngày -> Ẩn
            if (finishedDate < sevenDaysAgo) return false;
        }

        return true;
        })
        .sort((a, b) => {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
        });

    const columns = [
        { title: "To-Do", key: "todo", icon: "📋", color: "bg-slate-50 border-slate-200" },
        { title: "In Progress", key: "doing", icon: "⚡", color: "bg-blue-50/50 border-blue-100" },
        { title: "Done (Last 7 Days)", key: "done", icon: "✅", color: "bg-green-50/50 border-green-100" },
    ] as const;

    function formatDateSimple(iso?: string | null) {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#fff' } }} />
        
        {/* HEADER */}
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Workplace <span className="text-indigo-600">Board</span></h1>
                <p className="text-slate-500 text-sm">Manage your tasks efficiently</p>
            </div>
            <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
            >
            <span>🔙</span> Home
            </button>
        </div>

        <div className="max-w-7xl mx-auto">
            {/* CONTROL PANEL (INPUT & DIFFICULTY) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* LEFT: ADD TASK & FILTERS */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Add Task Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">New Task</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                            <select
                                value={priority}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="border border-slate-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🔴 High</option>
                            </select>
                            <button
                                onClick={handleAdd}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md shadow-indigo-200 transition-all"
                            >
                                Add Task
                            </button>
                        </div>
                        {error && <p className="text-sm text-rose-500 mt-2 font-medium">{error}</p>}
                    </div>

                    {/* Filters Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Filter tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-none bg-transparent focus:ring-0 text-slate-700 placeholder-slate-400 w-full"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500">Priority:</span>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setFilterPriority(p)}
                                        className={`px-3 py-1 rounded-md capitalize transition-all ${
                                            filterPriority === p ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: DIFFICULTY LOG */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                            <span>📝 Daily Issues / Blockers</span>
                        </h3>
                        <textarea
                            value={difficultyText}
                            onChange={(e) => setDifficultyText(e.target.value)}
                            placeholder="Log technical difficulties or blockers here..."
                            className="flex-1 w-full border border-slate-200 bg-slate-50 rounded-lg p-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all mb-3 min-h-[80px]"
                        />
                        <button
                            onClick={handleSaveDifficulty}
                            disabled={savingDifficulty}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-2 rounded-lg transition-all disabled:opacity-50"
                        >
                            {savingDifficulty ? "Saving..." : "Log Issue"}
                        </button>
                    </div>
                </div>
            </div>

            {/* KANBAN COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => {
                const list = filteredTodos.filter((t) => t.status === col.key);
                return (
                <div key={col.key} className={`flex flex-col rounded-xl ${col.color} min-h-[500px] border`}>
                    {/* Column Header */}
                    <div className="p-4 border-b border-slate-200/60 flex justify-between items-center bg-white/50 rounded-t-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{col.icon}</span>
                            <h2 className="font-bold text-slate-700">{col.title}</h2>
                        </div>
                        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                            {list.length}
                        </span>
                    </div>

                    {/* Task List */}
                    <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[800px]">
                    {loading && <div className="animate-pulse space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>)}</div>}
                    
                    {!loading && list.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <Image src="/notthing.webp" alt="No items" width={300} height={300} priority={true} className="mx-auto" />
                            <p className="text-sm">No tasks</p>
                        </div>
                    )}

                    {list.map((todo) => (
                        <div
                            key={todo._id}
                            className={`group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all border border-slate-100 relative overflow-hidden ${getPriorityBorder(todo.priority)} border-l-4`}
                        >
                            {/* Priority & Date Header */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(todo.priority)}`}>
                                    {todo.priority}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                    {formatDateSimple(todo.createdAt)}
                                </span>
                            </div>

                            {/* Content */}
                            <p className="text-slate-700 font-medium text-sm leading-relaxed mb-4 break-words">
                                {todo.text}
                            </p>

                            {/* Footer / Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                                {/* Move Back Button */}
                                <div>
                                    {todo.status !== "todo" && (
                                        <button 
                                            onClick={() => moveBack(todo._id!)} 
                                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                                            title="Move Back"
                                        >
                                            <span className="text-lg">⬅️</span>
                                        </button>
                                    )}
                                </div>

                                {/* Main Action Button */}
                                <div>
                                    {todo.status !== "done" ? (
                                        <button 
                                            onClick={() => moveNext(todo._id!)} 
                                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded transition-all"
                                        >
                                            Next Step ➡️
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleDelete(todo._id!)} 
                                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded hover:bg-rose-50"
                                            title="Delete Permanently"
                                        >
                                            <span className="text-lg">🗑️</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
                );
            })}
            </div>
        </div>
        </main>
    );
    }