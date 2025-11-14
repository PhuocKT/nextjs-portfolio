"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserPlus, UserX, ArrowDownZA, ArrowUpZA, Filter, Trash2, Search } from 'lucide-react'; 

interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

export default function UsersPage() {
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
    
    // TRẠNG THÁI LỌC VÀ SẮP XẾP
    const [filterRole, setFilterRole] = useState<string>(""); 
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [searchTerm, setSearchTerm] = useState<string>("");

    async function fetchUsers() {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Cannot load users");
            const data: User[] = await res.json();
            setAllUsers(data);
        } catch {
            toast.error("Cannot load user list");
        }
    }

    useEffect(() => { fetchUsers(); }, []);

    async function handleSubmit() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return toast.error("Invalid email");
        if (form.password.length < 6) return toast.error("Password must be at least 6 characters"); 

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error);
            toast.success("User added successfully");
            setForm({ name: "", email: "", password: "", role: "user" });
            fetchUsers();
        } catch (err) {
            toast.error((err as Error).message || "Failed to add user");
        }
    }

    const filteredAndSortedUsers = useMemo(() => {
        let currentUsers = allUsers;

        if (filterRole) {
            currentUsers = currentUsers.filter(user => user.role === filterRole);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            currentUsers = currentUsers.filter(user => 
                user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
            );
        }

        currentUsers.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (sortOrder === 'asc') {
                return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
            } else {
                return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
            }
        });

        return currentUsers;
    }, [allUsers, filterRole, sortOrder, searchTerm]);


    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h1 className="text-3xl font-extrabold text-indigo-700">👤 User Management (Admin)</h1>
                <Button className="bg-gray-400 hover:bg-gray-500 text-white transition-colors" onClick={() => router.push("/projects/dashboard")}>⬅ Back to Dashboard</Button>
            </div>

            {/* ✅ KHỐI LỌC/TÌM KIẾM ĐƯA LÊN TRÊN */}
            <Card className="p-5 mb-8 shadow-lg bg-white">
                <div className="flex items-center text-xl font-semibold mb-4 text-indigo-600">
                    <Filter className="w-6 h-6 mr-2" />
                    User Filters & Search
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center">
                    
                    {/* Search Input (2 cột) */}
                    <div className="relative col-span-2">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input className="border p-2 pl-10 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                            type="search" placeholder="Search by name or email..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* Filter by Role */}
                    <select className="border p-2 rounded w-full focus:ring-indigo-500 focus:border-indigo-500"
                        value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="">Role: All</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    {/* Sort by Name */}
                    <Button 
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="bg-blue-500 hover:bg-blue-600 flex items-center justify-center">
                        {sortOrder === 'asc' ? <ArrowDownZA className="w-5 h-5 mr-2" /> : <ArrowUpZA className="w-5 h-5 mr-2" />}
                        Sort Name 
                    </Button>
                    
                    {/* Clear Filters */}
                    <Button onClick={() => { setFilterRole(""); setSortOrder("asc"); setSearchTerm(""); }}
                            className="bg-red-500 hover:bg-red-600 flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </Card>

            {/* BỐ CỤC 2 CỘT: ADD USER (1/3) & USER LIST (2/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ADD USER CARD (Chiếm 1/3 - Sticky) */}
                <Card className="p-6 shadow-xl bg-white lg:col-span-1 h-fit lg:sticky lg:top-8 border-l-4 border-green-500">
                    <h2 className="text-xl font-semibold mb-4 text-green-600 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2" /> Add New User
                    </h2>
                    <input className="border p-3 w-full mb-3 rounded focus:ring-green-500 focus:border-green-500" placeholder="Name"
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="border p-3 w-full mb-3 rounded focus:ring-green-500 focus:border-green-500" placeholder="Email"
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input type="password" className="border p-3 w-full mb-3 rounded focus:ring-green-500 focus:border-green-500" placeholder="Password (min 6 chars)"
                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    
                    <select className="border p-3 w-full mb-4 rounded focus:ring-green-500 focus:border-green-500"
                        value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="user">Role: User</option>
                        <option value="admin">Role: Admin</option>
                    </select>
                    
                    <Button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white">Add New</Button>
                </Card>

                {/* USER LIST CARD (Chiếm 2/3) */}
                <Card className="p-6 shadow-xl bg-white lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-indigo-600">User List ({filteredAndSortedUsers.length} Results)</h2>
                    <div className="space-y-3">
                        {filteredAndSortedUsers.map((u) => (
                            <div key={u._id} className="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-center hover:shadow-md transition-shadow">
                                <div>
                                    <p className="font-medium text-lg">{u.name}</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                    <p className={`text-xs mt-1 font-bold px-2 py-0.5 rounded-full inline-block ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {u.role.toUpperCase()}
                                    </p>
                                </div>
                                <div className="space-x-2 flex-shrink-0">
                                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">Edit</Button>
                                    <Button size="sm" className="bg-red-500 hover:bg-red-600">Delete</Button>
                                </div>
                            </div>
                        ))}
                        {filteredAndSortedUsers.length === 0 && (
                            <p className="text-center text-gray-400 mt-10">No users found matching current filters.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}