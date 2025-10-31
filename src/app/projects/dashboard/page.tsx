"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,Line,LineChart } from "recharts";

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
    const COLORS = ["#60a5fa", "#facc15", "#34d399"]; // blue, yellow, green

    export default function DashboardPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTodos = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setTodos(data);
        } catch {
            console.error("Failed to load todos");
        } finally {
            setLoading(false);
        }
        };
        fetchTodos();
    }, []);

    if (loading) return <p className="text-center p-10 text-gray-500">⏳ Loading...</p>;

    // ====== Tính toán thống kê ======
    const total = todos.length;
    const countByStatus = {
        todo: todos.filter((t) => t.status === "todo").length,
        doing: todos.filter((t) => t.status === "doing").length,
        done: todos.filter((t) => t.status === "done").length,
    };
    const countByPriority = {
        high: todos.filter((t) => t.priority === "high").length,
        medium: todos.filter((t) => t.priority === "medium").length,
        low: todos.filter((t) => t.priority === "low").length,
    };

    // Nhóm số task hoàn thành theo tháng
    // Lấy năm hiện tại
const currentYear = new Date().getFullYear();

// Tạo mảng 12 tháng mặc định
const months = Array.from({ length: 12 }, (_, i) => `${i + 1}/${currentYear}`);

    // Gom task theo tháng
    const doneCountByMonth = todos
    .filter((t) => t.finishedAt)
    .reduce((acc: Record<string, number>, t) => {
        const date = new Date(t.finishedAt!);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    // Gộp dữ liệu — nếu tháng nào không có task thì count = 0
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const doneByMonth = months.map((m, i) => ({
    month: monthNames[i],
    count: doneCountByMonth[m] || 0,
    }));


    // Nhóm số task hoàn thành theo ngày
    const doneByDay = Object.entries(
        todos
        .filter((t) => t.finishedAt)
        .reduce((acc: Record<string, number>, t) => {
            const day = new Date(t.finishedAt!).toLocaleDateString();
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {})
    ).map(([day, count]) => ({ day, count }));

    const recentDone = todos
        .filter((t) => t.status === "done")
        .sort((a, b) => (b.finishedAt && a.finishedAt ? b.finishedAt.localeCompare(a.finishedAt) : 0))
        .slice(0, 5);
    const handleBack = () => {
            router.push("/projects");
        };
    // ====== UI ======
    return (
        <main className="p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
            <div className="flex mb-6 items-center justify-between">
                <button
                    onClick={handleBack}
                    className="left-0 bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4"
                >
                    ◀️ Back
                </button>

                <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">
                    📊 Dashboard
                </h1>

                <button
                    onClick={() => router.push("/projects/todoapp")}
                    className="bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4"
                >
                    ▶️ Todo App
                </button>
            </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Total Tasks</p>
            <p className="text-3xl font-bold text-indigo-600">{total}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-500">{countByStatus.done}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">In Progress</p>
            <p className="text-3xl font-bold text-yellow-500">{countByStatus.doing}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Todo</p>
            <p className="text-3xl font-bold text-red-500">{countByStatus.todo}</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">High</p>
            <p className="text-3xl font-bold text-red-500">{countByPriority.high}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Medium</p>
            <p className="text-3xl font-bold text-yellow-500">{countByPriority.low}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Low</p>
            <p className="text-3xl font-bold text-green-500">{countByPriority.low}</p>
            </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Status Pie Chart */}
            <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600">Task Status Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={[
                    { name: "To-Do", value: countByStatus.todo },
                    { name: "Doing", value: countByStatus.doing },
                    { name: "Done", value: countByStatus.done },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                >
                    {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
            </div>

            {/* Priority Bar Chart */}
            <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600">Tasks by Priority</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                { name: "High", count: countByPriority.high },
                { name: "Medium", count: countByPriority.medium },
                { name: "Low", count: countByPriority.low },
                ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="count">
                    
                    <Cell fill="#ef4444" /> 
                    <Cell fill="#facc15" /> 
                    <Cell fill="#22c55e" /> 
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
  {/* ✅ BarChart: Tasks Completed by Month */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600">
            📅 Tasks Completed by Month
            </h2>
            {doneByMonth.length === 0 ? (
            <p className="text-gray-400 italic">No completed tasks yet.</p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={doneByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Completed Tasks" />
                </BarChart>
            </ResponsiveContainer>
            )}
        </div>

        {/* ✅ LineChart: Tasks Completed by Day */}
        <div className="bg-white rounded-xl shadow p-6 mb-10">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600">
            📈 Tasks Completed by Day
            </h2>
            {doneByDay.length === 0 ? (
            <p className="text-gray-400 italic">No completed tasks yet.</p>
            ) : (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={doneByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 8, fill: "#059669" }}
                    name="Completed Tasks"
                />
                </LineChart>
            </ResponsiveContainer>
            )}
        </div>
        </div>



        {/* Recent tasks */}
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600">Recent Completed Tasks</h2>
            {recentDone.length === 0 ? (
            <p className="text-gray-400 italic">No recent tasks.</p>
            ) : (
            <ul className="divide-y">
                {recentDone.map((t) => (
                <li key={t._id!} className="py-2 flex justify-between">
                    <span>{t.text}</span>
                    <span className="text-sm text-gray-500">{new Date(t.finishedAt!).toLocaleString()}</span>
                </li>
                ))}
            </ul>
            )}
        </div>
        </main>
    );
}
