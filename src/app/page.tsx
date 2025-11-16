/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useUser, User } from "@/context/UserContext"; 
import Image from "next/image"; // Added Image import

// Helper component for status display (Moved outside of HomePage for cleanliness)
const StatusItem = ({ label, time, color }: { label: string, time: string | null | undefined, color: string }) => (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-100 text-center">
        <p className="font-medium text-gray-500 text-sm">{label}:</p>
        <p className={`font-extrabold text-2xl mt-1 ${color}`}>
            {time 
                ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) 
                : "N/A"}
        </p>
    </div>
);

export default function HomePage() {
    const { user, setUser, isLoading } = useUser(); 
    const [isChecking, setIsChecking] = useState(false);

    // ========== Loading & Authentication Check ==========
    if (isLoading)
        return (
            <p className="text-center mt-10 text-gray-500">Loading user data...</p>
        );

    if (!user)
        return (
            <p className="text-center mt-10 text-red-500">
                <a href="/auth/login" className="underline text-blue-600">Please log in</a> to use this feature.
            </p>
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

    // ... (handleCheckIn and handleCheckOut functions remain the same)
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

        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                checkInTime: new Date().toISOString(),
                checkOutTime: null,
            } as User;
        });
    };

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

        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                checkOutTime: new Date().toISOString(),
            } as User;
        });
    };
    // ... (End of handle functions)

    return (
        <div className="flex min-h-[calc(100vh-4rem)] p-8"> {/* Adjusted min-h for new fixed header (h-16 = 4rem) */}
            <Toaster position="top-right" />
            
            {/* LEFT COLUMN: IMAGE / MOTIVATIONAL */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-indigo-50 rounded-xl p-12 shadow-inner border border-indigo-100 mr-8">
                <div className="text-center">
                    {/* Placeholder for the main office image or a related graphic */}
                    <Image
                        src="/logo.jpg"
                        alt="HAYWORK Global Building"
                        width={400}
                        height={300}
                        priority={true}
                        className="rounded-lg shadow-xl mb-6"
                    />
                    <h2 className="text-3xl font-bold text-indigo-700">
                        Focus on Impact.
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Your dedication drives our global success.
                    </p>
                </div>
            </div>

            {/* RIGHT COLUMN: CHECK IN/OUT UI */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white shadow-2xl rounded-xl p-10 border border-indigo-200">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-2 text-center">
                    👋 Welcome, {user.name}!
                </h1>

                <p className="text-gray-500 mb-6 text-center text-lg">
                    **Today:** {today}
                </p>

                {/* Admin / User navigation - Card */}
                <div className="mb-8 p-4 w-full bg-indigo-50 border border-indigo-200 rounded-lg text-center">
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
                            📝 Go to Project Page
                        </Button>
                    )}
                </div>

                {/* Check In / Check Out UI */}
                <div className="flex gap-4 justify-center w-full mb-8">
                    {/* CHECK IN BUTTON */}
                    <Button
                        disabled={hasCheckedInToday || isChecking}
                        onClick={handleCheckIn}
                        className={`flex-1 h-12 text-lg font-semibold transition-colors ${
                            hasCheckedInToday 
                                ? "bg-green-600 hover:bg-green-700 text-white cursor-not-allowed" 
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {isChecking ? "Processing..." : hasCheckedInToday ? "✔ Checked In" : "✅ Check In"}
                    </Button>

                    {/* CHECK OUT BUTTON */}
                    <Button
                        disabled={!hasCheckedInToday || hasCheckedOutToday || isChecking}
                        onClick={handleCheckOut}
                        className={`flex-1 h-12 text-lg font-semibold transition-colors ${
                            hasCheckedOutToday 
                                ? "bg-red-600 hover:bg-red-700 text-white cursor-not-allowed" 
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {isChecking ? "Processing..." : hasCheckedOutToday ? "✔ Checked Out" : "⏰ Check Out"}
                    </Button>
                </div>

                {/* Status Box */}
                <div className="mt-4 bg-indigo-50 shadow p-6 rounded-lg text-center w-full border border-indigo-200">
                    <p className="font-bold text-indigo-700 mb-4 text-xl">📅 Today's Time Log:</p>

                    <div className="grid grid-cols-2 gap-4">
                        <StatusItem 
                            label="Check In Time" 
                            time={user.checkInTime} 
                            color="text-green-700" 
                        />
                        <StatusItem 
                            label="Check Out Time" 
                            time={user.checkOutTime} 
                            color="text-red-700" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}