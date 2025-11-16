"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react"; // Import a relevant icon

export default function Page403() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
            <div className="flex flex-col items-center justify-center bg-white p-12 rounded-xl shadow-2xl border border-red-200 w-full max-w-md">
                
                <ShieldX size={80} className="text-red-500 mb-6 animate-pulse" />

                <h1 className="text-5xl font-extrabold text-gray-800 mb-2">
                    403
                </h1>
                
                <h2 className="text-xl font-semibold text-red-500 mb-6">
                    Access Denied
                </h2>
                
                <p className="text-gray-600 mb-8">
                    You do not have permission to view this page. Please contact your administrator if you believe this is an error.
                </p>

                <Button 
                    onClick={() => router.back()} 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 transition-colors"
                >
                    Go Back
                </Button>
            </div>
        </div>
    );
}