"use client";

import { useState, useEffect } from "react";
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
    const [presetWeatherList, setPresetWeatherList] = useState<WeatherData[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const API_KEY = "ec6e8ff86b368c14afa137cf70ddbfab";

    // 🔹 Fetch thời tiết cho 3 thành phố mặc định
    useEffect(() => {
        const cities = ["Da Nang", "Ha Noi", "Ho Chi Minh"];
        const fetchPresetWeather = async () => {
        try {
            const results = await Promise.all(
            cities.map(async (c) => {
                const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                    c
                )}&units=metric&appid=${API_KEY}`
                );
                return await res.json();
            })
            );
            setPresetWeatherList(results);
        } catch (err) {
            console.error("Error loading preset cities:", err);
        }
        };
        fetchPresetWeather();
    }, []);

    // 🔹 Hàm tìm kiếm thủ công
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
        router.push("/projects");
    };

    return (
        <main className="ml-56 p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
        <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 font-medium px-4 py-2 rounded-md mb-4"
        >
            ◀️ Back
        </button>
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Weather App</h1>
        {/* Hiển thị sẵn 3 thành phố Việt Nam */}
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">
            Weather in Vietnam
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {presetWeatherList.map((cityData, index) => (
            <div
                key={index}
                className="bg-white rounded-xl shadow p-5 text-center hover:scale-[1.02] transition-all duration-300"
            >
                <h3 className="text-xl font-semibold text-indigo-700">
                {cityData.name}
                </h3>
                <p className="text-gray-600 mt-2">
                🌡 {cityData.main?.temp}°C
                </p>
                <p className="text-gray-600">
                ☁️ {cityData.weather?.[0]?.description}
                </p>
                <p className="text-gray-600">
                💧 {cityData.main?.humidity}% | 💨 {cityData.wind?.speed} m/s
                </p>
            </div>
            
            ))}
        </div>
        {/* Ô nhập tìm kiếm */}
        <div className="flex space-x-2 mb-4 my-6">
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

        {/* Kết quả tìm kiếm */}
        {weather && (
            <div className="bg-white rounded-xl shadow p-6 w-full max-w-md mb-8">
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
