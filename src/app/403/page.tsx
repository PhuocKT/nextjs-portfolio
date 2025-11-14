"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Page403() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">403 - Forbidden</h1>
        <Button onClick={() => router.back()} className="mt-4">
            Go Back
        </Button>
        </div>
  );
}
