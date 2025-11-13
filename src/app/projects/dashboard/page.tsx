"use client";

import { useEffect, useState } from "react";
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

type OverviewResponse = {
  totalTodos: number;
  totalUsers: number;
  byStatus: { name: string; count: number }[];
  byPriority: { name: string; count: number }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/overview");
        if (!res.ok) throw new Error("Failed to load overview");
        const json: OverviewResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <main className="p-8 min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">📊 Admin Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push("/projects/dashboard/tasks")}>Tasks</Button>
          <Button onClick={() => router.push("/projects/dashboard/users")}>Users</Button>
        </div>
      </div>

      {loading && <p className="text-gray-500">⏳ Loading overview...</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-3xl font-bold text-indigo-600">{data.totalTodos}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-indigo-600">{data.totalUsers}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-sm text-gray-500">Statuses (Today/All)</p>
              <p className="text-3xl font-bold text-indigo-600">
                | {data.byStatus?.reduce((s, cur) => s + cur.count, 0)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-indigo-600">Task Status</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.byStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3 text-indigo-600">Task Priority</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.byPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </main>
  );
}
