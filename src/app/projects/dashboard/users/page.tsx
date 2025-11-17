"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { UserPlus, ArrowDownZA, ArrowUpZA, Filter, Trash2, Search, Edit, Save, X } from 'lucide-react'; 

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
    
    // TRẠNG THÁI CHỈNH SỬA
    const [isEditing, setIsEditing] = useState<string | null>(null); // Lưu _id của user đang chỉnh sửa
    const [editForm, setEditForm] = useState<Partial<User & { password?: string }>>({}); // Form cho user đang chỉnh sửa

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
    
    // --- CHỨC NĂNG DELETE
    async function handleDeleteUser(id: string) {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Deletion failed");
            toast.success("User deleted successfully");
            fetchUsers(); 
        } catch {
            toast.error("Cannot delete user");
        }
    }

    // --- CHỨC NĂNG EDIT
    function startEdit(user: User) {
        setIsEditing(user._id);
        // Không đưa passwordHash vào editForm, chỉ bao gồm các trường cần thiết
        setEditForm({ 
            _id: user._id,
            name: user.name, 
            email: user.email, 
            role: user.role,
            password: "", // Thêm trường password rỗng để người dùng nhập mới nếu muốn thay đổi
        });
    }

    async function handleSaveEdit() {
        if (!editForm.name || !editForm.email) return toast.error("Name and Email are required");
        if (editForm.password && editForm.password.length < 6 && editForm.password.length > 0) 
            return toast.error("New password must be at least 6 characters, or leave blank");
        if (!isEditing) return;

        // Chỉ gửi những trường đã thay đổi, bỏ qua password nếu rỗng
        const updatePayload: { name?: string; email?: string; role?: "user" | "admin"; password?: string } = {
            name: editForm.name,
            email: editForm.email,
            role: editForm.role,
        };

        if (editForm.password && editForm.password.length >= 6) {
            updatePayload.password = editForm.password;
        }


        try {
            const res = await fetch(`/api/admin/users/${isEditing}`, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });
            
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Editing user failed");

            toast.success("User updated successfully");
            setIsEditing(null);
            setEditForm({});
            fetchUsers(); 
        } catch (err) {
            toast.error((err as Error).message || "Cannot update user");
        }
    }

    function cancelEdit() {
        setIsEditing(null);
        setEditForm({});
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
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white transition-colors" onClick={() => router.push("/projects/dashboard")}>⬅ Back to Dashboard</Button>
            </div>

            {/* ✅ KHỐI LỌC/TÌM KIẾM ĐƯA LÊN TRÊN */}
                <Card className="p-5 mb-8 shadow-lg bg-white">
                {/* HÀNG 1: HEADER VÀ CLEAR BUTTON */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <h2 className="flex items-center text-xl font-bold text-indigo-700">
                        <Filter className="w-5 h-5 mr-2" />
                        User Filters & Search
                    </h2>
                    
                    {/* Nút Clear Filters - Đưa lên header */}
                    <Button 
                        onClick={() => { setFilterRole(""); setSortOrder("asc"); setSearchTerm(""); }}
                        // Sử dụng màu xám/trắng nhẹ, chỉ dùng icon nếu muốn rất gọn gàng
                        size="sm" className="bg-gray-500 hover:bg-gray-400"
                    >
                        Clear Filters
                    </Button>
                    {/* Clear Button (Icon Only) */}
                    
                </div>

                {/* HÀNG 2: INPUTS VÀ ACTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
                    
                    {/* 1. Search Input (2-3 cột) */}
                    <div className="relative col-span-2 lg:col-span-3">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            className="border p-2 pl-10 rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm" 
                            type="search" 
                            placeholder="Search by Name or Email..."
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>

                    {/* 2. Filter by Role (1 cột) */}
                    <div className="relative">
                        <select 
                            className="border p-2 rounded-md w-full appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm pr-8"
                            value={filterRole} 
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="">Role: All</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        {/* Icon mũi tên tùy chỉnh để trông gọn hơn */}
                        <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>

                    {/* 3. Sort by Name (1-2 cột) */}
                    <Button 
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        // Sử dụng màu Blue chủ đạo, thêm hover nhẹ nhàng
                        className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center text-sm col-span-1"
                    >
                        {sortOrder === 'asc' ? <ArrowDownZA className="w-4 h-4 mr-1" /> : <ArrowUpZA className="w-4 h-4 mr-1" />}
                        Sort Name 
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
                        value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "user" | "admin" })}>
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
                                {isEditing === u._id ? (
                                    // Giao diện EDIT
                                    <div className="w-full space-y-2">
                                        <input
                                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Name"
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                        <input
                                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Email"
                                            value={editForm.email || ''}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                        <input
                                            type="password"
                                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="New Password (Leave blank to keep old)"
                                            value={editForm.password || ''}
                                            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        />
                                        <select className="border p-2 rounded w-full"
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "user" | "admin" })}>
                                            <option value="user">Role: User</option>
                                            <option value="admin">Role: Admin</option>
                                        </select>
                                        <div className="flex justify-end space-x-2">
                                            <Button onClick={handleSaveEdit} size="sm" className="bg-green-500 hover:bg-green-600"><Save className="w-4 h-4 mr-1" /> Save</Button>
                                            <Button onClick={cancelEdit} size="sm" className="bg-gray-500 hover:bg-gray-600"><X className="w-4 h-4 mr-1" /> Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Giao diện HIỂN THỊ
                                    <>
                                        <div>
                                            <p className="font-medium text-lg">{u.name}</p>
                                            <p className="text-sm text-gray-500">{u.email}</p>
                                            <p className={`text-xs mt-1 font-bold px-2 py-0.5 rounded-full inline-block ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role.toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="space-x-2 flex-shrink-0">
                                            <Button onClick={() => startEdit(u)} size="sm" className="bg-blue-500 hover:bg-blue-600"><Edit className="w-4 h-4" /></Button>
                                            <Button onClick={() => handleDeleteUser(u._id)} size="sm" className="bg-red-500 hover:bg-red-600"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </>
                                )}
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