/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
// Note: Ensure the path to UserContext is correct
import { useUser, User } from "@/context/UserContext"; 

// Helper component for status display (Moved outside of HomePage for cleanliness)
const StatusItem = ({ label, time, color }: { label: string, time: string | null | undefined, color: string }) => (
    <div className="p-3 bg-white rounded-md shadow-sm">
        <p className="font-medium text-gray-500 text-sm">{label}:</p>
        <p className={`font-semibold text-xl mt-1 ${color}`}>
            {time 
                ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) 
                : "N/A"}
        </p>
    </div>
);

export default function HomePage() {
    // ✅ Use Context State to get/set user data across pages
    const { user, setUser, isLoading } = useUser(); 
    const [isChecking, setIsChecking] = useState(false);

    // ========== Loading & Authentication Check ==========
    if (isLoading)
        return (
            <p className="text-center mt-10 text-gray-500">Loading user data...</p>
        );

    if (!user)
        return (
            <p className="text-center mt-10 text-red-500">Please log in to use this feature.</p>
        );

    // Helpers
    const today = new Date().toDateString();
    
    // Check In/Out status derived from Context state (which is preserved across navigation)
    const hasCheckedInToday =
        user.checkInTime &&
        new Date(user.checkInTime).toDateString() === today;

    const hasCheckedOutToday =
        user.checkOutTime &&
        new Date(user.checkOutTime).toDateString() === today;

    // ========== Handle Check In ==========
    const handleCheckIn = async () => {
        if (hasCheckedInToday)
            return toast.error("❌ You have already Checked In today!");

        setIsChecking(true);
        const res = await fetch("/api/checkin", { method: "POST" });
        const data = await res.json();
        setIsChecking(false);

        if (!res.ok) {
            return toast.error(data.error || "Unknown Check In error."); 
        }

        toast.success("✅ Check In successful!");

        // ✅ IMPORTANT: Update the Context State to immediately reflect changes
        // This ensures the status is preserved when navigating away and back.
        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                checkInTime: new Date().toISOString(),
                checkOutTime: null, // Reset Check Out on new Check In
            } as User;
        });
    };

    // ========== Handle Check Out ==========
    const handleCheckOut = async () => {
        if (!hasCheckedInToday)
            return toast.error("❌ You must Check In first!");

        if (hasCheckedOutToday)
            return toast.error("❌ You have already Checked Out today!");

        setIsChecking(true);
        const res = await fetch("/api/checkout", { method: "POST" });
        const data = await res.json();
        setIsChecking(false);

        if (!res.ok) {
            return toast.error(data.error || "Unknown Check Out error.");
        }

        toast.success("⏰ Check Out successful!");

        // ✅ IMPORTANT: Update the Context State to immediately reflect changes
        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                checkOutTime: new Date().toISOString(),
            } as User;
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 p-4">

            <Toaster position="top-right" />

            <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 border border-indigo-100">

                <h1 className="text-3xl font-extrabold text-indigo-700 mb-2 text-center">
                    👋 Welcome, {user.name}!
                </h1>

                <p className="text-gray-500 mb-6 text-center">
                    **Today:** {today}
                </p>

                {/* Admin / User navigation - Card */}
                <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                    {user.role === "admin" ? (
                        <Button
                            onClick={() => (window.location.href = "/projects/dashboard")}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                        >
                            📊 Go to Admin Dashboard
                        </Button>
                    ) : (
                        <Button
                            onClick={() => (window.location.href = "/projects/todoapp")}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                        >
                            📝 Go to Todo App Page
                        </Button>
                    )}
                </div>

                {/* Check In / Check Out UI */}
                <div className="flex gap-4 justify-center mb-8">

                    {/* CHECK IN BUTTON */}
                    <Button
                        disabled={hasCheckedInToday || isChecking}
                        onClick={handleCheckIn}
                        className={`flex-1 transition-colors ${
                            hasCheckedInToday 
                                ? "bg-green-500 hover:bg-green-600 text-white cursor-not-allowed" 
                                : "bg-indigo-500 hover:bg-indigo-600 text-white"
                        }`}
                    >
                        {isChecking ? "Processing..." : hasCheckedInToday ? "✔ Checked In" : "✅ Check In"}
                    </Button>

                    {/* CHECK OUT BUTTON */}
                    <Button
                        disabled={!hasCheckedInToday || hasCheckedOutToday || isChecking}
                        onClick={handleCheckOut}
                        className={`flex-1 transition-colors ${
                            hasCheckedOutToday 
                                ? "bg-red-500 hover:bg-red-600 text-white cursor-not-allowed" 
                                : "bg-indigo-500 hover:bg-indigo-600 text-white"
                        }`}
                    >
                        {isChecking ? "Processing..." : hasCheckedOutToday ? "✔ Checked Out" : "⏰ Check Out"}
                    </Button>
                </div>

                {/* Status Box */}
                <div className="mt-4 bg-indigo-50 shadow p-6 rounded-lg text-center border border-indigo-200">
                    <p className="font-bold text-indigo-700 mb-3 text-lg">📅 Today's Work Status:</p>

                    <div className="grid grid-cols-2 gap-4">
                        <StatusItem 
                            label="Check In" 
                            time={user.checkInTime} 
                            color="text-green-600" 
                        />
                        <StatusItem 
                            label="Check Out" 
                            time={user.checkOutTime} 
                            color="text-red-600" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}