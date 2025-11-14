/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, User, MessageSquare } from 'lucide-react'; 

// Utility function to format date
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getTodayDate = () => formatDate(new Date());

type Difficulty = {
    _id: string;
    text: string;
    date: string;
    userId: { name: string } | null;
    createdAt: string;
}

type OverviewResponse = {
    totalTodos: number;
    totalUsers: number;
    byStatus: { name: string; count: number }[];
    byPriority: { name: string; count: number }[];
    checkInOutData: { 
        name: string; 
        checkInTime: string | null; 
        checkOutTime: string | null; 
    }[];
    difficulties: Difficulty[]; 
};

// Component for Check-In/Out Item remains the same
const CheckInOutItem = ({ name, checkInTime, checkOutTime }: OverviewResponse['checkInOutData'][0]) => {
    const formatTime = (time: string | null) => time 
        ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) 
        : 'N/A';

    return (
        <div className="flex justify-between items-center py-2 border-b last:border-b-0 text-sm">
            <span className="font-medium text-gray-700">{name}</span>
            <div className="flex gap-4">
                <span className={`font-mono text-xs ${checkInTime ? 'text-green-600' : 'text-gray-400'}`}>
                    IN: {formatTime(checkInTime)}
                </span>
                <span className={`font-mono text-xs ${checkOutTime ? 'text-red-600' : 'text-gray-400'}`}>
                    OUT: {formatTime(checkOutTime)}
                </span>
            </div>
        </div>
    );
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<OverviewResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // TRẠNG THÁI LỊCH (Date Navigator)
    const [currentDate, setCurrentDate] = useState<string>(getTodayDate()); 

    const fetchOverview = useCallback(async (date: string) => {
        setLoading(true);
        try {
            // Truyền filterDate qua query string
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
        // Tự động fetch lại data khi currentDate thay đổi
        fetchOverview(currentDate);
    }, [fetchOverview, currentDate]);

    // LOGIC CHUYỂN NGÀY (áp dụng chung cho cả 2 log)
    const handleDateChange = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(formatDate(newDate));
    };

    const displayDate = useMemo(() => {
        const date = new Date(currentDate);
        // Hiển thị ngày dưới dạng: Friday, November 14, 2025
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }, [currentDate]);

    return (
        <main className="p-8 min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h1 className="text-3xl font-extrabold text-indigo-700">📊 Admin Dashboard Overview</h1>
                <div className="space-x-2 flex">
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white transition-colors" onClick={() => router.push("/projects/dashboard/tasks")}>Manage Tasks</Button>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white transition-colors" onClick={() => router.push("/projects/dashboard/users")}>Manage Users</Button>
                </div>
            </div>

            {loading && <p className="text-gray-500 text-center mt-10">⏳ Loading overview data...</p>}

            {data && (
                <>
                    {/* KEY METRICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Card className="p-6 text-center shadow-lg border-l-4 border-indigo-500">
                            <p className="text-sm text-gray-500">Total Tasks</p>
                            <p className="text-4xl font-extrabold text-indigo-700 mt-1">{data.totalTodos}</p>
                        </Card>
                        <Card className="p-6 text-center shadow-lg border-l-4 border-blue-500">
                            <p className="text-sm text-gray-500">Total Users (Non-Admin)</p>
                            <p className="text-4xl font-extrabold text-blue-700 mt-1">{data.totalUsers}</p>
                        </Card>
                    </div>

                    {/* CHARTS AND LOGS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Task Status Chart */}
                        <Card className="p-6 lg:col-span-2 shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-indigo-600">Task Status Distribution (Count)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.byStatus} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#6366f1" />
                                    <YAxis allowDecimals={false} stroke="#6366f1" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                                    <Legend />
                                    <Bar dataKey="count" fill="#6366f1" name="Number of Tasks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        
                        {/* Task Priority Chart (Đã đổi chỗ xuống đây) */}
                        <Card className="p-6 shadow-xl">
                            <h3 className="text-xl font-semibold mb-4 text-orange-600">Task Priority Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.byPriority} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="name" stroke="#f97316" />
                                    <YAxis allowDecimals={false} stroke="#f97316" />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#f97316" 
                                        strokeWidth={3} 
                                        name="Number of Tasks"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                        
                        {/* Difficulties List (Đã đổi chỗ lên vị trí này) */}
                        <Card className="p-6 lg:col-span-2 shadow-xl">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-xl font-semibold text-red-600">Difficulty Log by Date</h3>
                                <Button onClick={() => setCurrentDate(getTodayDate())} variant="outline" className="text-sm">
                                    Today
                                </Button>
                            </div>
                            
                            {/* Date Navigator (Áp dụng cho Difficulties) */}
                            <div className="flex items-center justify-center space-x-4 mb-4 bg-red-50 p-2 rounded-lg">
                                <Button size="icon" onClick={() => handleDateChange(-1)} variant="outline">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <span className="font-bold text-lg text-gray-800">{displayDate}</span>
                                <Button size="icon" onClick={() => handleDateChange(1)} variant="outline">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                            
                            <div className="h-[250px] overflow-y-auto pr-2 space-y-3">
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
                        
                        {/* Recent Check In/Out Log  */}
                        <Card className="p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-xl font-semibold text-green-600">User Check-In/Out Log (Today's Date)</h3>
                                <Button onClick={() => setCurrentDate(getTodayDate())} variant="outline" className="text-sm">
                                    Today
                                </Button>
                            </div>
                            
                            {/* Date Navigator  */}
                            <div className="flex items-center justify-center space-x-4 mb-4 bg-gray-100 p-2 rounded-lg">
                                <Button size="icon" onClick={() => handleDateChange(-1)} variant="outline">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <span className="font-bold text-lg text-gray-800">{displayDate}</span>
                                <Button size="icon" onClick={() => handleDateChange(1)} variant="outline">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                            
                            <div className="h-[250px] overflow-y-auto pr-2">
                                {data.checkInOutData.length > 0 ? (
                                    data.checkInOutData.map((item, index) => (
                                        <CheckInOutItem key={index} {...item} />
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center mt-10">No check-in/out data found for this date.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </main>
    );
}