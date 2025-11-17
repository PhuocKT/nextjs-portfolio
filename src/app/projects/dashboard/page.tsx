// /app/projects/dashboard/(admin)/page.tsx

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ResponsiveContainer,
    BarChart, Bar,
    LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation"; 
import { 
    ChevronLeft, ChevronRight, 
    Clock, User, MessageSquare, 
    CheckSquare, ListTodo, Users,
    MoveLeft, MoveRight, CalendarIcon 
} from 'lucide-react'; // 🗑️ ĐÃ XÓA 'Settings'
import { format } from "date-fns"; 
import { Calendar } from "@/components/ui/calendar"; 
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Utility functions
const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');
const getTodayDate = (): string => formatDate(new Date());

// === CÁC TYPES (KHÔNG DÙNG 'ANY') ===
type Difficulty = {
    _id: string;
    text: string;
    date: string;
    userId: { name: string } | null;
    createdAt: string;
};

type CheckInOut = {
    name: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    isCheckedIn: boolean; // Dữ liệu trực tiếp từ DB cho trạng thái hiện tại
};

type TaskTrendData = {
    name: string;
    created: number;
    completed: number;
};

type OverviewResponse = {
    totalTodos: number;
    totalUsers: number; 
    byStatus: { name: string; count: number }[];
    byPriority: { name: string; count: number }[];
    todayStats: {
        tasksCreatedToday: number;
        tasksCompletedToday: number;
        activeMembers: number;
    };
    taskTrend: TaskTrendData[];
    checkInOutData: CheckInOut[];
    difficulties: Difficulty[]; 
};

// === COMPONENT BỘ ĐIỀU HƯỚNG NGÀY NÂNG CAO ===
interface DateNavigatorProps {
    currentDate: string;
    setCurrentDate: (date: string) => void;
}

const DateNavigator = ({ currentDate, setCurrentDate }: DateNavigatorProps) => {
    const isToday = useMemo(() => currentDate === getTodayDate(), [currentDate]);
    
    // Chuyển string "YYYY-MM-DD" sang Date object (cần thiết cho react-day-picker)
    // Dùng UTC để tránh bị lệch ngày khi new Date(YYYY-MM-DD)
    const selectedDate = useMemo(() => new Date(currentDate + 'T00:00:00Z'), [currentDate]);

    const displayDate = useMemo(() => {
        return format(selectedDate, 'EEEE, LLLL do, yyyy'); 
    }, [selectedDate]);

    // Xử lý thay đổi ngày (từ nút)
    const handleDayChange = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(formatDate(newDate));
    };

    // Xử lý thay đổi tháng (từ nút)
    const handleMonthChange = (months: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + months);
        setCurrentDate(formatDate(newDate));
    };
    
    // Xử lý chọn ngày từ Lịch Popover
    const handleCalendarSelect = (date: Date | undefined) => {
        if (date) {
            setCurrentDate(formatDate(date));
        }
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 p-4 bg-white rounded-lg shadow">
            {/* Hiển thị ngày */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">{displayDate}</h2>
            
            <div className="flex flex-wrap justify-center items-center gap-2">
                {/* Lọc theo Tháng */}
                <Button size="icon" onClick={() => handleMonthChange(-1)} variant="outline">
                    <MoveLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium hidden sm:inline">Month</span>
                <Button size="icon" onClick={() => handleMonthChange(1)} variant="outline">
                    <MoveRight className="w-5 h-5" />
                </Button>
                
                {/* Dấu phân cách */}
                <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

                {/* Lọc theo Ngày */}
                <Button size="icon" onClick={() => handleDayChange(-1)} variant="outline">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium hidden sm:inline">Day</span>
                <Button size="icon" onClick={() => handleDayChange(1)} variant="outline" disabled={isToday}>
                    <ChevronRight className="w-5 h-5" />
                </Button>
                
                {/* Lịch & Nút Today */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[150px] justify-start text-left font-normal",
                                !currentDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Pick a date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleCalendarSelect}
                            initialFocus
                            disabled={(date: Date) => date > new Date()} 
                        />
                    </PopoverContent>
                </Popover>
                
                <Button onClick={() => setCurrentDate(getTodayDate())} variant="outline" disabled={isToday}>
                    Today
                </Button>
            </div>
        </div>
    );
};

// === COMPONENT BẢNG CHECK-IN/OUT ===
const CheckInOutTable = ({ data }: { data: CheckInOut[] }) => {
    // Hàm này chỉ để hiển thị thời gian theo múi giờ local của người dùng
    const formatTime = (time: string | null) => {
        if (!time) return 'N/A';
        // Tạo Date object, sau đó hiển thị giờ theo múi giờ local
        return new Date(time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });
    }

    const todayDateStr = getTodayDate(); 

    return (
        <div className="h-[300px] overflow-y-auto pr-2">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-3">Member</th>
                        <th scope="col" className="px-4 py-3">Check-In</th>
                        <th scope="col" className="px-4 py-3">Check-Out</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? data.map((item, index) => {
                        
                        // ✅ CHUYỂN DATE TỪ DB SANG CHUỖI NGÀY ĐỂ SO SÁNH
                        // Quan trọng: Sử dụng item.checkInTime/checkOutTime trực tiếp để tạo Date object
                        const checkInDate = item.checkInTime ? formatDate(new Date(item.checkInTime)) : null;
                        const checkOutDate = item.checkOutTime ? formatDate(new Date(item.checkOutTime)) : null;

                        let status;
                        if (item.isCheckedIn && checkInDate === todayDateStr) {
                            // 🟢 CASE 1: Đã Check-In HÔM NAY và item.isCheckedIn = true (Chưa check-out)
                            status = "Active";
                        } else if (checkInDate === todayDateStr && checkOutDate === todayDateStr) {
                            // ⚪ CASE 2: Đã Check-In VÀ đã Check-Out HÔM NAY (isCheckedIn sẽ là false)
                            status = "Offline";
                        } else {
                            // 🔴 CASE 3: Chưa Check-In HÔM NAY (Dù isCheckedIn là false hay true từ ngày hôm qua)
                            // Hoặc checkInTime/checkOutTime thuộc về ngày khác.
                            status = "Absent";
                        }
                        
                        // CSS cho cột Check-In/Out chỉ hiển thị thời gian nếu nó thuộc ngày hôm nay
                        const displayCheckIn = checkInDate === todayDateStr ? formatTime(item.checkInTime) : 'N/A';
                        const displayCheckOut = checkOutDate === todayDateStr ? formatTime(item.checkOutTime) : 'N/A';


                        return (
                            <tr key={index} className="bg-white border-b last:border-b-0 hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                <td className={`px-4 py-3 font-mono ${status !== 'Absent' ? 'text-green-600' : 'text-gray-400'}`}>
                                    {displayCheckIn}
                                </td>
                                <td className={`px-4 py-3 font-mono ${status === 'Offline' ? 'text-red-600' : 'text-gray-400'}`}>
                                    {displayCheckOut}
                                </td>
                                <td className="px-4 py-3">
                                    {status === 'Active' ? (
                                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Active</span>
                                    ) : status === 'Absent' ? (
                                        <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Absent</span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Offline</span>
                                    )}
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={4} className="text-center text-gray-400 pt-10">
                                No members found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// === COMPONENT CHÍNH: ADMIN DASHBOARD ===
export default function AdminDashboardPage() {
    const router = useRouter(); 
    const [data, setData] = useState<OverviewResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentDate, setCurrentDate] = useState<string>(getTodayDate()); 

    const fetchOverview = useCallback(async (date: string) => {
        setLoading(true);
        try {
            // API cần nhận ngày để lọc các dữ liệu khác (tasks, difficulties)
            const res = await fetch(`/api/admin/overview?date=${date}`); 
            if (!res.ok) throw new Error("Failed to load overview");
            const json: OverviewResponse = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            toast.error("Cannot load dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOverview(currentDate);
    }, [fetchOverview, currentDate]);


    return (
        <main className="p-4 md:p-8 min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            
            {/* KHU VỰC TIÊU ĐỀ VÀ NÚT ROUTER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b gap-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-700">📊 Admin Dashboard</h1>
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                        <span>🔙</span> Home
                    </Button>
                    <Button onClick={() => router.push('/projects/dashboard/tasks')} variant="default" className="bg-indigo-600 hover:bg-indigo-700">
                        <ListTodo className="w-4 h-4 mr-2"/> Manage Tasks
                    </Button>
                    <Button onClick={() => router.push('/projects/dashboard/users')} variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
                        <Users className="w-4 h-4 mr-2"/> Manage Users
                    </Button>
                    
                </div>
            </div>

            {/* BỘ ĐIỀU HƯỚNG NGÀY NÂNG CẤP */}
            <DateNavigator 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
            />

            {loading && <p className="text-gray-500 text-center mt-10">⏳ Loading overview data...</p>}

            {data && (
                <div className="space-y-8">
                    {/* HÀNG 1: HOẠT ĐỘNG TRONG NGÀY (Lọc theo ngày) */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-3">Activity for Selected Date</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 shadow-lg border-l-4 border-blue-500">
                                <p className="text-sm text-gray-500 flex items-center"><ListTodo className="w-4 h-4 mr-2"/> Tasks Created</p>
                                <p className="text-4xl font-extrabold text-blue-700 mt-1">{data.todayStats.tasksCreatedToday}</p>
                            </Card>
                            <Card className="p-6 shadow-lg border-l-4 border-green-500">
                                <p className="text-sm text-gray-500 flex items-center"><CheckSquare className="w-4 h-4 mr-2"/> Tasks Completed</p>
                                <p className="text-4xl font-extrabold text-green-700 mt-1">{data.todayStats.tasksCompletedToday}</p>
                            </Card>
                            <Card className="p-6 shadow-lg border-l-4 border-cyan-500">
                                <p className="text-sm text-gray-500 flex items-center"><Users className="w-4 h-4 mr-2"/> Active Members (Real-time)</p>
                                <p className="text-4xl font-extrabold text-cyan-700 mt-1">{data.todayStats.activeMembers}</p>
                            </Card>
                        </div>
                    </div>

                    {/* HÀNG 2: XU HƯỚNG (Lọc theo 7 ngày gần nhất) */}
                    <Card className="p-6 shadow-xl lg:col-span-3">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-600">Task Trend (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.taskTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" stroke="#6366f1" />
                                <YAxis allowDecimals={false} stroke="#6366f1" />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                                <Legend />
                                <Line type="monotone" dataKey="created" name="Tasks Created" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="completed" name="Tasks Completed" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* HÀNG 3: LOGS VÀ TRẠNG THÁI */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Difficulty Log (Lọc theo ngày) */}
                        <Card className="p-6 lg:col-span-2 shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-red-600">Difficulty Log (for Selected Date)</h3>
                            <div className="h-[300px] overflow-y-auto pr-2 space-y-3">
                                {data.difficulties.length > 0 ? (
                                    data.difficulties.map((d) => (
                                        <div key={d._id} className="p-3 border rounded-lg bg-red-50">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <div className="flex items-center"><User className="w-3 h-3 mr-1" /> {d.userId?.name || 'Unknown'}</div>
                                                <div className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(d.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                                            </div>
                                            <p className="font-medium text-gray-800 text-sm flex items-start">
                                                <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                                                {d.text}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center mt-10">No difficulty logs found for this date.</p>
                                )}
                            </div>
                        </Card>
                        
                        {/* Trạng thái hiện tại */}
                        <Card className="p-6 shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-green-600">Current Member Status (Real-time)</h3>
                            <CheckInOutTable data={data.checkInOutData} />
                        </Card>
                    </div>

                    {/* HÀNG 4: TỔNG QUAN HỆ THỐNG (Không lọc) */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-3 mt-8">All-Time System Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <Card className="p-6 text-center shadow-lg border-l-4 border-gray-500">
                                <p className="text-sm text-gray-500">Total Tasks (All-Time)</p>
                                <p className="text-4xl font-extrabold text-gray-700 mt-1">{data.totalTodos}</p>
                            </Card>
                            <Card className="p-6 text-center shadow-lg border-l-4 border-gray-500">
                                <p className="text-sm text-gray-500">Total Members</p> 
                                <p className="text-4xl font-extrabold text-gray-700 mt-1">{data.totalUsers}</p>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="p-6 lg:col-span-2 shadow-xl">
                                <h3 className="text-xl font-semibold mb-4 text-indigo-600">Task Status (All-Time)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.byStatus} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#6366f1" name="Number of Tasks" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            
                            <Card className="p-6 shadow-xl">
                                <h3 className="text-xl font-semibold mb-4 text-orange-600">Task Priority (All-Time)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.byPriority} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} name="Tasks" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}