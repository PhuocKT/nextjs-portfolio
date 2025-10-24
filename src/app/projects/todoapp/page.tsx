"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function TodoApp() {
    const [todos, setTodos] = useState<{ id:number; text: string; completed: boolean} []>([]);
    const router = useRouter();

    const handleBack = () => {
        router.push('/projects');
    };

    useEffect(() => {
        const saveTodos = localStorage.getItem("todos");
        if (saveTodos) {
            setTodos(JSON.parse(saveTodos));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]); 

    const [input, setInput] = useState("");

    const [editId , setEditId] = useState<number | null>(null);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");


    const handleAdd = () => {
        const text = input.trim();
        if (!text) {
            setError("You must to type a title!");
            return;
        }
        setError("");

        if(editId !==null) {
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === editId ? {...todo, text } : todo
                )
            );
            setEditId(null);
            setInput("");
            return;
        }

        const newTodo = { id:Date.now(), text, completed: false };
        setTodos((prev) => [...prev, newTodo]);
        setInput("");
    };

    const handleDelete = (id: number) => {
        setTodos(todos.filter((todo) => todo.id !== id));
        setInput("");
        setEditId(null);
    };


    const handleToggle = (id: number) => {
        setTodos(
            todos.map((todo) => 
                todo.id === id ? {...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleEdit = (id: number) => {
        const todoToEdit = todos.find((t) => t.id === id);
        if (todoToEdit) {
            setInput(todoToEdit.text);
            setEditId(id);
        }
    };

    const filteredTodos = todos.filter((todo) => {
        const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "all"
            ? true
            : filter === "active"
            ? !todo.completed
            : todo.completed;

            return matchesSearch && matchesFilter;
    });


    return (
        
        <main className="ml-56 p-8 min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100 ">
            <button
                onClick={handleBack}
                className="bg-gray-200 hover:bg-gray-300 font-medium px-4 py-2 rounded-md mb-4"
            >
                ◀️ Back
            </button>
            <div className="max-w xl mx-auto bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-indigo-600 text-center flex-1">
                Todo App
                </h1>
            </div>

            <div className="flex items-center space-x-2">
                <input
                type="text"
                placeholder="Type your job..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 w-full"
                />
                <button
                onClick={handleAdd}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                {editId ? "Save" : "Add"}
                </button>
                <button
                onClick={() => { setInput(""); }}
                className="bg-gray-200 hover:bg-gray-300 font-medium px-4 py-2 rounded-md "
            >
                Clear
            </button>
            </div>
            {error && <p className="text-red-500 text-sm my-2 ml-2">{error}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between mt-4 gap-2 ">
                <input
                    type="text"
                    placeholder="🔍 Search todos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 flex-1 min-w-[200px]"
                />
                <button
                    onClick={() => { setSearch(""); }}
                    className="bg-gray-200 hover:bg-gray-300 font-medium px-4 py-2 rounded-md "
                >
                    Clear
                </button>
                <div className="flex space-x-2 ml-10">
                    {["all", "active", "completed"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type as "all" | "active" | "completed")}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                        filter === type
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        {type === "all"
                        ? "All"
                        : type === "active"
                        ? "Active"
                        : "Completed"}
                    </button>
                    ))}
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
                Summary amount work of {filter.toUpperCase()}: {filteredTodos.length}
            </p>
            <ul className="space-y-2">
                {filteredTodos.map((todo) => (
                    <li
                    key={todo.id}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded"
                    >
                    <span
                    onClick={()=> handleToggle(todo.id)}
                    className={`cursor-pointer ${
                        todo.completed ? "line-through text-gray-400" : ""
                        }`}
                    >
                    {todo.text}</span>
                    <div className="flex space-x-2">
                        <button   
                            onClick={()=> handleDelete(todo.id)}
                            className="text-red-500 hover:text-red-700">
                                ❌
                        </button>
                        <button
                            onClick={()=> handleEdit(todo.id)}
                            className="text-blue-500 hover:text-blue-700"
                            >
                            ✏️
                        </button>
                        
                    </div>
                    </li>
                ))}
            </ul>
            
        </main>
        
    );

}