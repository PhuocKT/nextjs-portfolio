// src/app/api/todos/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Todo } from "@/models/Todo";

function getIdFromReq(req: Request) {
  // Extract last path segment as id (works for /api/todos/:id)
    try {
        const url = new URL(req.url);
        const parts = url.pathname.split("/").filter(Boolean); // remove empty parts
        return parts[parts.length - 1];
    } catch {
        return null;
    }
    }

    export async function PATCH(req: Request) {
    const id = getIdFromReq(req);
    if (!id) {
        return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    try {
        await connectDB();
        const body = await req.json();
        // Optional: sanitize/validate body here
        const updated = await Todo.findByIdAndUpdate(id, body, { new: true }).lean();
        if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        console.error("PATCH /api/todos/:id error:", err);
        return NextResponse.json({ message: "Failed to update" }, { status: 500 });
    }
    }

    export async function DELETE(req: Request) {
    const id = getIdFromReq(req);
    if (!id) {
        return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    try {
        await connectDB();
        // If you want soft delete, use findByIdAndUpdate(..., { deleted: true, deletedAt: new Date() })
        const deleted = await Todo.findByIdAndDelete(id).lean();
        if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Deleted successfully", deleted });
    } catch (err) {
        console.error("DELETE /api/todos/:id error:", err);
        return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
    }
    }
