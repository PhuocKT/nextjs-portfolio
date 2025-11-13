// src/types/index.ts
export interface Todo {
    _id?: string;
    text: string;
    status: "todo" | "doing" | "done";
    priority: "low" | "medium" | "high";
    createdAt: string;
    startedAt?: string;
    finishedAt?: string;
    userId?: string;
    userName?: string;
    difficulty?: string;
}
export interface User {
    _id: string;
    name: string;
    email: string;
    checkInTime?: string; // Ví dụ thuộc tính
    checkOutTime?: string;
    createdAt?: Date; // Ví dụ thuộc tính
    // ... các thuộc tính khác của User

}