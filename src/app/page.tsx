"use client";
import { useRouter } from "next/navigation";
export default function Home() {

    const router = useRouter();

    return (
        <main className="ml-60 flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-10 transition-all duration-500">
        <section className="max-w-3xl text-center">
            <h1 className="text-5xl font-bold mb-4">Hi, my name is <span className="text-indigo-600">Phước</span> 👋</h1>
            <p className="text-lg text-gray-600 mb-8">
            I am a Frontend developer who loves creating beautiful, modern interfaces and optimizing user experiences.
            </p>
            <div className="flex justify-center space-x-4">
            <button
                
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md shadow-md transition"
                onClick={() => router.push("/projects")}
            >
                View Projects
            </button>
            <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md shadow-md transition"
            >
                Contact Me
            </button>
            </div>
        </section>
        </main>
    );
}
