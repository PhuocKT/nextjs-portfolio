"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ✅ Kiểu dữ liệu cho kết quả thời tiết từ API
type WeatherData = {
        name: string;
        sys: { country: string };
        main: { temp: number; humidity: number };
        weather: { description: string; icon: string }[];
        wind: { speed: number };
        };

        export default function WeatherApp() {
        // ======================== STATE CƠ BẢN ========================
        const [city, setCity] = useState(""); // Thành phố người dùng nhập
        const [weather, setWeather] = useState<WeatherData | null>(null); // Kết quả tìm kiếm
        const [presetWeatherList, setPresetWeatherList] = useState<WeatherData[]>([]); // 3 TP mặc định
        const [error, setError] = useState(""); // Thông báo lỗi
        const [loading, setLoading] = useState(false); // Trạng thái đang tải
        const [refreshing, setRefreshing] = useState(false); // Trạng thái refresh 3 TP
        const [loading1, setLoading1] = useState(false); // Trạng thái đang tải
        const router = useRouter();

        // 🔑 API key (từ OpenWeatherMap)
        const API_KEY = "ec6e8ff86b368c14afa137cf70ddbfab";

        // ======================== HÀM CHUẨN HÓA TÊN ========================
        const normalizeCityName = (name: string) => {
            if (name === "Turan") return "Đà Nẵng"; // OpenWeather trả “Turan”
            return name;
        };

        // ======================== HÀM FETCH 3 TP VIỆT NAM ========================
        const fetchPresetWeather = async () => {
            const cities = ["Da Nang", "Ha Noi", "Ho Chi Minh"];
            setLoading1(true);
            try {
            setRefreshing(true);
            const results = await Promise.all(
                cities.map(async (c) => {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(c)}&units=metric&appid=${API_KEY}`
                );
                const data = await res.json();

                // ✅ Đổi Turan → Đà Nẵng
                data.name = normalizeCityName(data.name);

                return data;
                })
            );
            setPresetWeatherList(results);
            } catch (err) {
            console.error("Error loading preset cities:", err);
            } finally {
                setLoading1(false);
                setRefreshing(false);
            }
        };

        // 🔹 Gọi fetchPresetWeather khi trang load
        useEffect(() => {
            fetchPresetWeather();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // ======================== HÀM SEARCH CITY ========================
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
                // ✅ Chuẩn hóa “Turan” luôn ở kết quả tìm kiếm
                data.name = normalizeCityName(data.name);
                setWeather(data);
                setError("");
            }
            } catch {
            setError("Error fetching weather data.");
            } finally {
            setLoading(false);
            }
        };

        // ======================== HÀM QUAY LẠI ========================
        const handleBack = () => {
            router.push("/projects");
        };

        // ==============================================================
        return (
            <main className=" p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100">
            {/* 🔙 Nút quay lại */}
            <div className="relative flex items-center justify-center">
                <button
                    onClick={handleBack}
                    className="absolute left-0 bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4"
                >
                    ◀️ Back
                </button>

                <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">
                    Weather App 🌤️
                </h1>
            </div>


            {/* ======================= TÌM KIẾM ======================= */}
            <div className="flex space-x-2 mb-4 justify-center">
                <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 max-w-[400px]"
                />
                <button
                onClick={getWeather}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                Search
                </button>
            </div>

            <div className="h-64">
                {/* Loading + Error */}
            {loading && <p className="text-gray-500 mt-4">⏳ Loading...</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* ======================= KẾT QUẢ TÌM KIẾM ======================= */}
            {weather && (
                <div className="bg-white rounded-xl shadow px-6 py-3 w-full max-w-md  text-center mx-auto">
                <h2 className="text-2xl font-semibold text-indigo-700">
                    {weather.name}
                    {weather.sys?.country && `, ${weather.sys.country}`}
                </h2>

                {/* Icon thời tiết */}
                {weather.weather?.[0]?.icon && (
                    <Image
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt={weather.weather[0].description}
                        width={80}
                        height={80}
                        className="mx-auto"
                    />

                )}

                <p className="text-gray-600 mt-2 text-lg">
                    🌡 Temperature: {weather.main?.temp}°C
                </p>
                <p className="text-gray-600 capitalize">
                    ☁️ Condition: {weather.weather?.[0]?.description}
                </p>
                <p className="text-gray-600">💨 Wind: {weather.wind?.speed} m/s</p>
                <p className="text-gray-600">💧 Humidity: {weather.main?.humidity}%</p>
                </div>
            )}
            </div>

            {/* 🇻🇳 KHU VỰC 3 THÀNH PHỐ VIỆT NAM */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-indigo-600">
                Weather in Vietnam
                </h2>
                {loading1 && <p className="text-gray-500 mt-4 text-center">⏳ Loading...</p>}
                {/* 🔁 Nút Refresh */}
                <button
                onClick={fetchPresetWeather}
                disabled={refreshing}
                className={`px-4 py-2 rounded-md text-white font-medium transition-all ${
                    refreshing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
                </button>
            </div>

            {/* GRID hiển thị 3 TP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {presetWeatherList.map((cityData, index) => (
                <div
                    key={index}
                    className="bg-white rounded-xl shadow p-5 text-center hover:scale-[1.02] transition-all duration-300"
                >
                    {/* Tên thành phố */}
                    
                    <h3 className="text-xl font-semibold text-indigo-700">
                    {cityData.name}
                    </h3>

                    {/* Icon thời tiết (ảnh từ API) */}
                    {cityData.weather?.[0]?.icon && (
                    <Image
                        src={`https://openweathermap.org/img/wn/${cityData.weather[0].icon}@2x.png`}
                        alt={cityData.weather[0].description}
                        width={100}    
                        height={100}    
                        className="mx-auto"
                        />
                    )}

                    <p className="text-gray-600 mt-2">
                    🌡 {cityData.main?.temp}°C
                    </p>
                    <p className="text-gray-600 capitalize">
                    ☁️ {cityData.weather?.[0]?.description}
                    </p>
                    <p className="text-gray-600">
                    💧 {cityData.main?.humidity}% | 💨 {cityData.wind?.speed} m/s
                    </p>
                </div>
                ))}
            </div>
            </main>
        );
}
