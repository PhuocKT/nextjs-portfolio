"use client";

import { useRouter } from "next/navigation";

export default function ProjectsPage() {
    const router = useRouter();

    const projects = [
        {
            title: "ToDo App",
            icon: "📝",
            description: "Simple task management app built with Next.js",
            path: "/projects/todoapp",
        },
        {
            title: "Weather App",
            icon: "⛅",
            description: "App to view weather forecasts by city using the OpenWeatherMap API",
            path: "/projects/weather",
        },
        {
            title: "Dashboard App",
            icon: "📊",
            description: "App to view chart of task flowwing to do app",
            path: "/projects/dashboard",
        },
    ];

    return (
        <main className=" p-8 min-h-screen bg-sky-100">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">My Projects</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <div>
                <h2 className="text-xl font-semibold text-gray-800">{p.title}</h2>
                <span className="text-9xl ">{p.icon}</span>
                <p className="text-gray-500 mt-2">{p.description}</p>
                </div>
                <button
                    onClick={() => router.push(p.path)}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all"
                >
                    More details →
                </button>
            </div>
            ))}
        </div>
        </main>
    );
}
