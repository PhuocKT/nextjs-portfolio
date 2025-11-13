    "use client";
    import { useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import { Button } from "@/components/ui/button";
    import { Card } from "@/components/ui/card";
    import toast from "react-hot-toast";

    interface Todo {
    _id: string;
    text: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    userId?: { _id: string; name: string; email: string };
    createdAt?: string;
    }

    interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    }

    export default function TasksPage() {
    const router = useRouter();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [form, setForm] = useState({ text: "", status: "todo", priority: "low", userId: "" });
    const [editId, setEditId] = useState<string | null>(null);

    async function fetchAll() {
        try {
        const [tRes, uRes] = await Promise.all([
            fetch("/api/admin/tasks"),
            fetch("/api/admin/users"),
        ]);
        if (!tRes.ok) throw new Error("Failed to load tasks");
        if (!uRes.ok) throw new Error("Failed to load users");
        const tJson: Todo[] = await tRes.json();
        const uJson: User[] = await uRes.json();
        setTodos(tJson);
        setUsers(uJson.filter((u) => u.role !== "admin"));
        } catch {
        toast.error("Không thể tải dữ liệu");
        }
    }

    useEffect(() => { fetchAll(); }, []);

    async function handleSubmit() {
        try {
        const res = await fetch("/api/admin/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Thêm task thất bại");
        toast.success("Thêm task thành công");
        setForm({ text: "", status: "todo", priority: "low", userId: "" });
        fetchAll();
        } catch {
        toast.error("Không thể thêm task");
        }
    }

    return (
        <div className="p-6">
        <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">Quản lý Todos</h1>
            <Button onClick={() => router.push("/projects/dashboard")}>⬅ Quay lại</Button>
        </div>

        <Card className="p-4 mb-6">
            <h2 className="text-xl mb-2">Thêm Todo</h2>
            <input className="border p-2 w-full mb-2" placeholder="Nội dung"
            value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            <select className="border p-2 w-full mb-2"
            value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            </select>
            <select className="border p-2 w-full mb-2"
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
            </select>
            <select className="border p-2 w-full mb-2"
            value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
            <option value="">-- Gán user --</option>
            {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name}</option>
            ))}
            </select>
            <Button onClick={handleSubmit}>Thêm</Button>
        </Card>

        <Card className="p-4">
            <h2 className="text-xl mb-2">Danh sách Todos</h2>
            {todos.map((todo) => (
            <div key={todo._id} className="border-b py-2 flex justify-between">
                <div>
                <p>{todo.text}</p>
                <p className="text-sm text-gray-500">
                    Priority: {todo.priority} | Status: {todo.status}
                </p>
                {todo.userId && (
                    <p className="text-xs text-gray-400">
                    Giao cho: {todo.userId.name} ({todo.userId.email})
                    </p>
                )}
                </div>
            </div>
            ))}
        </Card>
        </div>
    );
    }
