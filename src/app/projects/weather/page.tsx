"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
type WeatherData = {
    name: string;
    sys: { country: string };
    main: { temp: number; humidity: number };
    weather: { description: string }[];
    wind: { speed: number };
};

export default function WeatherApp() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const API_KEY = "ec6e8ff86b368c14afa137cf70ddbfab"; // Replace with a real key
    const router = useRouter();
    const getWeather = async () => {
        if (!city) {
            setError("Please enter a city name!");
            setWeather(null);
            return;
        }

        setLoading(true);
        setError("");
        setWeather(null);

        try {
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                    city
                )}&units=metric&appid=${API_KEY}`
            );
            const data = await res.json();

            if (data.cod === "404") {
                setError("City not found!");
                setWeather(null);
            } else {
                setWeather(data);
                setError("");
            }
        } catch {
            setError("Error fetching weather data.");
        } finally {
            setLoading(false);
        }
    };
    const handleBack = () => {
        router.push('/projects');
    };
    return (
        <main className="ml-56 p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
            <button
                    onClick={handleBack}
                    className="bg-gray-200 hover:bg-gray-300 font-medium px-4 py-2 rounded-md mb-4"
                >
                    ◀️ Back
                </button>
            <h1 className="text-3xl font-bold text-indigo-700 mb-6">Weather App</h1>

            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    placeholder="Enter city name..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2"
                />
                <button
                    onClick={getWeather}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                    Search
                </button>
            </div>

            {loading && <p className="text-gray-500 mt-4">⏳ Loading...</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {weather && (
                <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
                    <h2 className="text-2xl font-semibold text-indigo-700">
                        {weather.name}
                        {weather.sys?.country && `, ${weather.sys.country}`}
                    </h2>
                    <p className="text-gray-600 mt-2 text-lg">
                        🌡 Temperature: {weather.main?.temp}°C
                    </p>
                    <p className="text-gray-600">
                        ☁️ Condition: {weather.weather?.[0]?.description}
                    </p>
                    <p className="text-gray-600">💨 Wind: {weather.wind?.speed} m/s</p>
                    <p className="text-gray-600">💧 Humidity: {weather.main?.humidity}%</p>
                </div>
            )}
        </main>
    );
}
