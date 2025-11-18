"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast, { Toaster } from "react-hot-toast";
import { Search, Filter, Calendar, User, Trash2, Tag, ListTodo, Edit, Save, X } from 'lucide-react'; // Import icons

interface Todo {
    _id: string;
    text: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    // Đảm bảo userId có thể là object hoặc undefined (như khi lấy từ API)
    userId?: { _id: string; name: string; email: string };
    createdAt?: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

// Interface cho form chỉnh sửa (userId phải là string ID)
interface EditForm extends Omit<Partial<Todo>, 'userId'> {
    userId?: string; 
}


export default function TasksPage() {
    const router = useRouter();
    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    // Mặc định status là 'todo'
    const [form, setForm] = useState({ text: "", status: "todo", priority: "low", userId: "" });
    
    // TRẠNG THÁI CHỈNH SỬA
    const [isEditing, setIsEditing] = useState<string | null>(null); // Lưu _id của task đang chỉnh sửa
    const [editForm, setEditForm] = useState<EditForm>({}); // Form cho task đang chỉnh sửa

    // TRẠNG THÁI LỌC
    const [filterUser, setFilterUser] = useState<string>(""); 
    const [filterDate, setFilterDate] = useState<string>(""); 
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterPriority, setFilterPriority] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>(""); 

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
            setAllTodos(tJson);
            // Lọc ra admin vì chỉ muốn gán task cho user
            setUsers(uJson.filter((u) => u.role !== "admin")); 
        } catch {
            toast.error("Cannot load data");
        }
    }

    useEffect(() => { fetchAll(); }, []);

    async function handleSubmit() {
        if (!form.text.trim()) return toast.error("Task content cannot be empty");
        
        try {
            const res = await fetch("/api/admin/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form), // Gửi 'status: "todo"' đi
            });
            if (!res.ok) throw new Error("Adding task failed");
            toast.success("Task added successfully");
            setForm({ text: "", status: "todo", priority: "low", userId: "" });
            fetchAll();
        } catch {
            toast.error("Cannot add task");
        }
    }

    // --- CHỨC NĂNG DELETE
    async function handleDeleteTask(id: string) {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            const res = await fetch(`/api/admin/tasks/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Deletion failed");
            toast.success("Task deleted successfully");
            fetchAll(); 
        } catch {
            toast.error("Cannot delete task");
        }
    }

    // --- CHỨC NĂNG EDIT
    function startEdit(todo: Todo) {
        setIsEditing(todo._id);
        setEditForm({ 
            _id: todo._id,
            text: todo.text, 
            status: todo.status, 
            priority: todo.priority, 
            // FIX LỖI 2322: Gán object thành string ID
            userId: todo.userId?._id || "" 
        });
    }

    async function handleSaveEdit() {
        if (!editForm.text || !editForm.text.trim()) return toast.error("Task content cannot be empty");
        if (!isEditing) return;

        try {
            const res = await fetch(`/api/admin/tasks/${isEditing}`, {
                method: "PATCH", // Sử dụng PATCH cho cập nhật một phần
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            
            if (!res.ok) throw new Error("Editing task failed");

            toast.success("Task updated successfully");
            setIsEditing(null);
            setEditForm({});
            fetchAll(); // Tải lại danh sách
        } catch {
            toast.error("Cannot update task");
        }
    }
    // Hủy chỉnh sửa
    function cancelEdit() {
        setIsEditing(null);
        setEditForm({});
    }


    const filteredTodos = useMemo(() => {
        let currentTodos = allTodos;

        if (filterUser) {
            currentTodos = currentTodos.filter(todo => todo.userId?._id === filterUser);
        }

        if (filterDate) {
            const filterDateString = new Date(filterDate).toISOString().split('T')[0];
            currentTodos = currentTodos.filter(todo => 
                todo.createdAt && new Date(todo.createdAt).toISOString().split('T')[0] === filterDateString
            );
        }
        
        if (filterStatus) {
            currentTodos = currentTodos.filter(todo => todo.status === filterStatus);
        }
        
        if (filterPriority) {
            currentTodos = currentTodos.filter(todo => todo.priority === filterPriority);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            currentTodos = currentTodos.filter(todo => 
                todo.text.toLowerCase().includes(term) ||
                (todo.userId?.name.toLowerCase() ?? '').includes(term)
            );
        }

        return currentTodos;
    }, [allTodos, filterUser, filterDate, searchTerm, filterStatus, filterPriority]);
    
    const handleClearFilters = () => {
        setFilterUser(""); 
        setFilterDate(""); 
        setSearchTerm(""); 
        setFilterStatus("");
        setFilterPriority("");
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <Toaster position="top-right" toastOptions={{ style: { background: '#334155', color: '#fff' } }} />
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h1 className="text-3xl font-extrabold text-indigo-700">📝 Task Management (Admin)</h1>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white transition-colors" onClick={() => router.push("/projects/dashboard")}>⬅ Back to Dashboard</Button>
            </div>

            {/* ✅ FILTER & SEARCH SECTION - TỐI ƯU */}
            <Card className="p-5 mb-8 shadow-lg bg-white">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <div className="flex items-center text-xl font-semibold text-indigo-600">
                        <Filter className="w-6 h-6 mr-2" />
                        Task Filters & Search
                    </div>
                    {/* Clear Button (Icon Only) */}
                    <Button variant="outline" onClick={handleClearFilters} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">Clear Filters</Button>
                </div>
                
                {/* DÒNG 1: SEARCH VÀ DATE */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {/* Search */}
                    <div className="relative col-span-2">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input className="border p-2 pl-10 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" 
                            type="search" placeholder="Search by text or User..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    {/* Filter Date */}
                    <div className="relative col-span-1">
                        <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input className="border p-2 pl-10 rounded w-full focus:ring-indigo-500 focus:border-indigo-500" type="date"
                            // FIX LỖI 2339: Sửa lỗi đánh máy
                            value={filterDate} onChange={(e) => setFilterDate(e.target.value)} /> 
                    </div>
                </div>

                {/* DÒNG 2: FILTERS CHI TIẾT */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    
                    {/* Filter User */}
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select className="border p-2 pl-10 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                            <option value="">User: All</option>
                            {users.map((u) => (
                                <option key={u._id} value={u._id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Status */}
                    <div className="relative">
                        <ListTodo className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select className="border p-2 pl-10 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Status: All</option>
                            <option value="todo">To Do</option>
                            <option value="doing">Doing</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    {/* Filter Priority */}
                    <div className="relative">
                        <Tag className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select className="border p-2 pl-10 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                            value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                            <option value="">Priority: All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ADD TODO CARD */}
                <Card className="p-6 shadow-xl bg-white lg:col-span-1 h-fit sticky top-6 border-l-4 border-green-500">
                    <h2 className="text-xl font-semibold mb-4 text-green-600">Add New Task</h2>
                    <input className="border p-3 w-full mb-3 rounded focus:ring-green-500 focus:border-green-500" placeholder="Task content"
                        value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
                    
                    <select className="border p-3 w-full mb-3 rounded focus:ring-green-500 focus:border-green-500"
                        value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" })}>
                        <option value="low">Priority: Low</option>
                        <option value="medium">Priority: Medium</option>
                        <option value="high">Priority: High</option>
                    </select>
                    
                    {/* ===== TRƯỜNG STATUS ĐÃ BỊ XÓA KHỎI ĐÂY ===== */}
                    
                    <select className="border p-3 w-full mb-4 rounded focus:ring-green-500 focus:border-green-500"
                        value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
                        <option value="">Assign To: (Unassigned)</option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                    
                    <Button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white">Add Task</Button>
                </Card>

                {/* TASK LIST CARD (UI enhanced) */}
                <Card className="p-6 shadow-xl bg-white lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-indigo-600">Task List ({filteredTodos.length} Results)</h2>
                    <div className="space-y-3">
                        {filteredTodos.map((todo) => (
                            <div key={todo._id} className="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-start hover:shadow-md transition-shadow">
                                {isEditing === todo._id ? (
                                    // Giao diện EDIT
                                    <div className="w-full space-y-2">
                                        <input
                                            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
                                            value={editForm.text || ''}
                                            onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                        />
                                        <div className="grid grid-cols-3 gap-2">
                                            <select className="border p-2 rounded w-full"
                                                value={editForm.priority}
                                                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as "low" | "medium" | "high" })}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            <select className="border p-2 rounded w-full"
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "todo" | "doing" | "done" })}>
                                                <option value="todo">To Do</option>
                                                <option value="doing">Doing</option>
                                                <option value="done">Done</option>
                                            </select>
                                            <select className="border p-2 rounded w-full"
                                                // FIX LỖI 2322: Đảm bảo giá trị là string ID
                                                value={editForm.userId || ""} 
                                                onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}>
                                                <option value="">(Unassigned)</option>
                                                {users.map((u) => (
                                                    <option key={u._id} value={u._id}>{u.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <Button onClick={handleSaveEdit} size="sm" className="bg-green-500 hover:bg-green-600"><Save className="w-4 h-4 mr-1" /> Save</Button>
                                            <Button onClick={cancelEdit} size="sm" className="bg-gray-500 hover:bg-gray-600"><X className="w-4 h-4 mr-1" /> Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Giao diện HIỂN THỊ
                                    <>
                                        <div>
                                            <p className="font-medium text-lg">{todo.text}</p>
                                            <p className="text-sm mt-1">
                                                <span className={`font-semibold ${todo.priority === 'high' ? 'text-red-500' : todo.priority === 'medium' ? 'text-orange-500' : 'text-gray-500'}`}>
                                                    P: {todo.priority.toUpperCase()}
                                                </span> | 
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                                                    todo.status === 'done' ? 'bg-green-100 text-green-700' :
                                                    todo.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    S: {todo.status.toUpperCase().replace('TODO', 'TO DO')}
                                                </span>
                                            </p>
                                            {todo.userId && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Assigned to: <span className="font-medium text-gray-600">{todo.userId.name}</span>
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                Created: {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString('en-US') : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-x-2 flex-shrink-0">
                                            <Button onClick={() => startEdit(todo)} size="sm" className="bg-blue-500 hover:bg-blue-600"><Edit className="w-4 h-4" /></Button>
                                            <Button onClick={() => handleDeleteTask(todo._id)} size="sm" className="bg-red-500 hover:bg-red-600"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {filteredTodos.length === 0 && (
                            <p className="text-center text-gray-400 mt-10">No tasks found matching current filters.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}