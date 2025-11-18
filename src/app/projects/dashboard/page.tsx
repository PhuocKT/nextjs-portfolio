    "use client";

    import { useEffect, useState, useCallback } from "react";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Button } from "@/components/ui/button";
    import {
        ResponsiveContainer,
        BarChart, Bar,
        PieChart, Pie, Cell,
        CartesianGrid, XAxis, YAxis, Tooltip, Legend,
        AreaChart, Area
    } from "recharts";
    import toast, { Toaster } from "react-hot-toast";
    import { useRouter } from "next/navigation";
    import {
        Calendar as CalendarIcon,
        ListTodo, Users,
        Trophy, Filter, ArrowRight, Loader2
    } from 'lucide-react';
    import { format, subDays } from "date-fns";
    import { Calendar } from "@/components/ui/calendar";
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from "@/components/ui/popover";
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from "@/components/ui/select";
    // ⚠️ LƯU Ý: Nếu chưa có Tabs, hãy chạy: npx shadcn@latest add tabs
    import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { cn } from "@/lib/utils";

    // --- TYPES DEFINITIONS (Fix lỗi 'any') ---
    type DateRange = {
        from: Date;
        to: Date;
    };

    // Định nghĩa kiểu dữ liệu cho CheckInOut
    interface CheckInOutItem {
        _id?: string;
        name: string;
        checkInTime: string | null;
        checkOutTime: string | null;
        isCheckedIn: boolean;
    }

    // Định nghĩa kiểu dữ liệu cho Difficulty
    interface DifficultyItem {
        _id: string;
        text: string;
        createdAt: string;
        userId: { name: string } | null;
    }

    // Định nghĩa response tổng thể
    interface OverviewResponse {
        summary: {
            totalTasks: number;
            completedTasks: number;
            completionRate: number;
        };
        taskTrend: { name: string; created: number; completed: number }[];
        byStatus: { name: string; value: number; color: string }[];
        byPriority: { name: string; count: number }[];
        topPerformers: { name: string; count: number }[];
        dailyOps: {
            activeMembers: number;
            checkInOutData: CheckInOutItem[]; // Sử dụng type cụ thể thay vì any[]
            difficulties: DifficultyItem[];   // Sử dụng type cụ thể thay vì any[]
        };
        usersList: { _id: string; name: string }[];
    }

    // --- CONSTANTS ---
    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

    export default function AdminDashboardPage() {
        const router = useRouter();
        
        // Sử dụng loading state để hiển thị UI chờ
        const [loading, setLoading] = useState<boolean>(true);
        const [data, setData] = useState<OverviewResponse | null>(null);

        // STATE 1: ANALYTICS FILTER
        const [dateRange, setDateRange] = useState<DateRange>({
            from: subDays(new Date(), 6),
            to: new Date()
        });
        const [selectedUserId, setSelectedUserId] = useState<string>("all");
        const [rangeLabel, setRangeLabel] = useState<string>("7d");

        // STATE 2: DAILY OPERATIONS FILTER
        const [dailyDate, setDailyDate] = useState<Date>(new Date());

        const handleRangeChange = (val: string) => {
            setRangeLabel(val);
            const today = new Date();
            if (val === '7d') setDateRange({ from: subDays(today, 6), to: today });
            if (val === '30d') setDateRange({ from: subDays(today, 29), to: today });
            if (val === 'month') {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateRange({ from: start, to: today });
            }
        };

        const fetchDashboardData = useCallback(async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    from: format(dateRange.from, 'yyyy-MM-dd'),
                    to: format(dateRange.to, 'yyyy-MM-dd'),
                    userId: selectedUserId,
                    dailyDate: format(dailyDate, 'yyyy-MM-dd')
                });

                const res = await fetch(`/api/admin/overview?${query.toString()}`);
                if (!res.ok) throw new Error("Failed to load data");
                const json: OverviewResponse = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                toast.error("Could not load dashboard data");
            } finally {
                setLoading(false);
            }
        }, [dateRange, selectedUserId, dailyDate]);

        useEffect(() => {
            fetchDashboardData();
        }, [fetchDashboardData]);

        // Loading State UI
        if (loading && !data) {
            return (
                <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <p className="text-sm text-slate-500">Loading dashboard data...</p>
                    </div>
                </div>
            );
        }

        return (
            <main className="p-4 md:p-8 min-h-screen bg-slate-50/50 space-y-8">
                <Toaster position="top-right" />

                {/* HEADER */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage projects, track performance, and monitor team status.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => router.push("/")} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">Home</Button>
                        <Button onClick={() => router.push('/projects/dashboard/tasks')} className="bg-indigo-600 hover:bg-indigo-700">
                            <ListTodo className="w-4 h-4 mr-2" /> Tasks
                        </Button>
                        <Button onClick={() => router.push('/projects/dashboard/users')} variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                            <Users className="w-4 h-4 mr-2" /> Members
                        </Button>
                    </div>
                </div>

                {/* --- SECTION 1: ANALYTICS --- */}
                <div className="space-y-6">
                    {/* FILTER BAR */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <span className="font-semibold text-slate-700">Analytics Filter:</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <Tabs value={rangeLabel} onValueChange={handleRangeChange} className="w-auto">
                                <TabsList>
                                    <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
                                    <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
                                    <TabsTrigger value="month">This Month</TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>{format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}</>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            if (range?.from) {
                                                setDateRange({ from: range.from, to: range.to || range.from });
                                                setRangeLabel("custom");
                                            }
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Members</SelectItem>
                                    {data?.usersList.map(u => (
                                        <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="shadow-sm border-l-4 border-indigo-500">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Tasks (In Range)</CardTitle></CardHeader>
                            <CardContent><div className="text-3xl font-bold text-indigo-700">{data?.summary.totalTasks ?? 0}</div></CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-green-500">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Completed Tasks</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end">
                                    <div className="text-3xl font-bold text-green-700">{data?.summary.completedTasks ?? 0}</div>
                                    <div className="text-sm font-medium text-green-600 mb-1">{data?.summary.completionRate ?? 0}% Rate</div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm border-l-4 border-amber-500">
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Top Performer</CardTitle></CardHeader>
                            <CardContent>
                                {data?.topPerformers && data.topPerformers.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-8 h-8 text-amber-500" />
                                        <div>
                                            <div className="text-lg font-bold text-slate-800">{data.topPerformers[0].name}</div>
                                            <div className="text-xs text-slate-500">{data.topPerformers[0].count} tasks done</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-400 italic">No data yet</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* CHARTS ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 shadow-md">
                            <CardHeader><CardTitle>Task Productivity Trend</CardTitle></CardHeader>
                            <CardContent className="pl-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data?.taskTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Area type="monotone" dataKey="created" stroke="#6366f1" fillOpacity={1} fill="url(#colorCreated)" name="Created" />
                                        <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Top Performers</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data?.topPerformers.slice(0, 5).map((user, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full font-bold text-white", 
                                                    idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-indigo-200 text-indigo-600'
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span className="font-medium text-slate-700">{user.name}</span>
                                            </div>
                                            <span className="font-bold text-indigo-600">{user.count} <span className="text-xs font-normal text-slate-400">tasks</span></span>
                                        </div>
                                    ))}
                                    {(!data?.topPerformers.length) && <p className="text-center text-gray-400 py-4">No performance data in this range.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CHARTS ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="shadow-md">
                            <CardHeader><CardTitle>Task Status Breakdown {selectedUserId !== 'all' && "(Selected User)"}</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={data?.byStatus}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data?.byStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="shadow-md">
                            <CardHeader><CardTitle>Task Priority Distribution {selectedUserId !== 'all' && "(Selected User)"}</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data?.byPriority} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={30}>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="border-t border-slate-200 my-8"></div>

                {/* --- SECTION 2: DAILY OPERATIONS --- */}
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Daily Operations & Logs</h2>
                        <p className="text-slate-500">Detailed check-in logs and difficulties for a specific day.</p>
                    </div>
                    
                    {/* Sub-component nhúng trực tiếp */}
                    <DateNavigator currentDate={format(dailyDate, 'yyyy-MM-dd')} setCurrentDate={(d) => setDailyDate(new Date(d))} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <Card className="lg:col-span-2 shadow-md border-t-4 border-blue-500">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-blue-700">Member Attendance</CardTitle>
                                <div className="text-xs font-normal px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                                    Viewing: {format(dailyDate, 'MMM do, yyyy')}
                                </div>
                            </CardHeader>
                            <CardContent>
                            <CheckInOutTable data={data?.dailyOps.checkInOutData || []} targetDate={format(dailyDate, 'yyyy-MM-dd')} />
                            </CardContent>
                        </Card>

                        <Card className="shadow-md border-t-4 border-red-500">
                            <CardHeader>
                                <CardTitle className="text-red-700">Difficulties Reported</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <DifficultyLog difficulties={data?.dailyOps.difficulties || []} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        );
    }

    // === SUB-COMPONENTS (Định nghĩa trực tiếp tại đây để tránh lỗi module not found) ===

    const DateNavigator = ({ currentDate, setCurrentDate }: { currentDate: string, setCurrentDate: (d: string) => void }) => {
        const dateObj = new Date(currentDate);
        return (
            <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'))}>
                        <ArrowRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <div className="text-lg font-semibold min-w-[200px] text-center">
                        {format(dateObj, 'EEEE, MMMM do, yyyy')}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(format(new Date(dateObj.setDate(dateObj.getDate() + 1)), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')}>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(format(new Date(), 'yyyy-MM-dd'))} disabled={currentDate === format(new Date(), 'yyyy-MM-dd')}>
                    Back to Today
                </Button>
            </div>
        )
    }

    const CheckInOutTable = ({ data, targetDate }: { data: CheckInOutItem[], targetDate: string }) => {
        const isToday = targetDate === format(new Date(), 'yyyy-MM-dd');
        
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Member</th>
                            <th className="px-4 py-3">Check-In</th>
                            <th className="px-4 py-3">Check-Out</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => {
                            const ciDate = item.checkInTime ? format(new Date(item.checkInTime), 'yyyy-MM-dd') : null;
                            const coDate = item.checkOutTime ? format(new Date(item.checkOutTime), 'yyyy-MM-dd') : null;
                            
                            const displayCI = ciDate === targetDate && item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';
                            const displayCO = coDate === targetDate && item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';
                            
                            let status = "Absent";
                            if (ciDate === targetDate) {
                                if (!item.checkOutTime || coDate !== targetDate) status = isToday && item.isCheckedIn ? "Active" : "Working (No Checkout)";
                                if (coDate === targetDate) status = "Offline";
                            }

                            return (
                                <tr key={idx} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3 text-green-600 font-mono">{displayCI}</td>
                                    <td className="px-4 py-3 text-red-600 font-mono">{displayCO}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", 
                                            status === 'Active' ? "bg-green-100 text-green-800" : 
                                            status === 'Offline' ? "bg-gray-100 text-gray-800" : 
                                            status === 'Absent' ? "bg-red-50 text-red-800" : "bg-yellow-100 text-yellow-800"
                                        )}>
                                            {status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                        {data.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-gray-400">No records found.</td></tr>}
                    </tbody>
                </table>
            </div>
        )
    }

    const DifficultyLog = ({ difficulties }: { difficulties: DifficultyItem[] }) => (
        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {difficulties.length > 0 ? difficulties.map((d) => (
                <div key={d._id} className="p-3 border rounded-lg bg-red-50 border-red-100">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="font-bold text-gray-700">{d.userId?.name || 'Unknown'}</span>
                        <span>{new Date(d.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-gray-800">{d.text}</p>
                </div>
            )) : <p className="text-center text-gray-400 mt-8">No difficulties reported.</p>}
        </div>
    );