    "use client";
    import { useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import { Button } from "@/components/ui/button";
    import { Card } from "@/components/ui/card";
    import toast from "react-hot-toast";

    interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    }

    export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [editId, setEditId] = useState<string | null>(null);

    async function fetchUsers() {
        try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Cannot load users");
        const data: User[] = await res.json();
        setUsers(data);
        } catch {
        toast.error("Không thể tải danh sách user");
        }
    }

    useEffect(() => { fetchUsers(); }, []);

    async function handleSubmit() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return toast.error("Email không hợp lệ");

        try {
        const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        toast.success("Thêm user thành công");
        setForm({ name: "", email: "", password: "", role: "user" });
        fetchUsers();
        } catch (err) {
        toast.error((err as Error).message || "Lỗi thêm user");
        }
    }

    return (
        <div className="p-6">
        <div className="flex justify-between mb-4">
            <h1 className="text-2xl font-bold">Quản lý Users</h1>
            <Button onClick={() => router.push("/projects/dashboard")}>⬅ Quay lại</Button>
        </div>

        <Card className="p-4 mb-6">
            <h2 className="text-xl mb-2">Thêm User mới</h2>
            <input className="border p-2 w-full mb-2" placeholder="Tên"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="border p-2 w-full mb-2" placeholder="Email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" className="border p-2 w-full mb-2" placeholder="Mật khẩu"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <select className="border p-2 w-full mb-2"
            value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            </select>
            <Button onClick={handleSubmit}>Thêm mới</Button>
        </Card>

        <Card className="p-4">
            <h2 className="text-xl mb-2">Danh sách Users</h2>
            {users.map((u) => (
            <div key={u._id} className="border-b py-2 flex justify-between">
                <div>
                <p>{u.name} - <span className="text-gray-500">{u.email}</span></p>
                <p className="text-xs text-gray-400">{u.role}</p>
                </div>
            </div>
            ))}
        </Card>
        </div>
    );
    }
