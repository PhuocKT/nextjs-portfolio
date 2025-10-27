"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type WeatherData = {
    name: string;
    sys: { country: string };
    main: { temp: number; humidity: number; };
    weather: { description: string}[];
    wind: { speed: number; };
};
export default function WeatherApp() {
const [city, setCity] = useState("");
const [weather, setWeather] = useState<WeatherData | null>(null);
const [presetWeatherList, setPresetWeatherList] = useState<WeatherData[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const router = useRouter();

const API_Key = "ec6e8ff86b368c14afa137cf70ddbfab";


const normalizeCityName = (name: string) => {
    if (name === "Turan") return "Đà Nẵng"; // OpenWeather trả “Turan”
    return name;
    };

useEffect(() => {
    const cities = ["Da Nang", "Ha Noi", "Ho Chi Minh"];
    const fetchPresetWeather = async () => {
        try {
            const results = await Promise.all(
                cities.map(async (c) => {
                    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(c)}&units=metric&appid=${API_Key}`);
                    return await res.json();
                })
            );
            setPresetWeatherList(results);
        } catch (err) {
            console.error("Error fetching preset weather data:", err);
        }
    };
    fetchPresetWeather();
}, []);

const getWeater = async () => {
    if (!city) {
        setError("Please enter a city name!");
        setWeather(null);
        return;
    }
    setLoading(true);
    setError("");
    setWeather(null);

    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_Key}`);
        const data = await res.json();
        if (data.cod === '404') {
            setError("City not found!");
            setWeather(null);
        } else {
            setWeather(data);
            setError("");
        }
    } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("Failed to fetch weather data.");
    } finally {
        setLoading(false);
    }
};
const [isCollapsed, setIsCollapsed] = useState(false);
const handleBack = () => {
    router.push("/projects");
};

return (
    <main className = {`ml-56 p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-200 ${isCollapsed ? "ml-16" : "ml-56"}`}>
        <button onClick={handleBack} className="bg-sky-300 hover:bg-sky-400 font-medium px-4 py-2 rounded-md mb-4">◀️ Back</button>

        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
            Weather App 🌤️
        </h1>


    </main>
);
}