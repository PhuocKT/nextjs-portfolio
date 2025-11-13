    import { NextResponse } from "next/server";
    import { connectDB } from "@/lib/mongodb";
    import { Todo } from "@/models/Todo";

    export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();
        const updated = await Todo.findByIdAndUpdate(id, { ...body }, { new: true }).populate("userId", "name email").lean();
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }

    export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;
        const body = await req.json();
        const updated = await Todo.findByIdAndUpdate(id, { ...body }, { new: true }).populate("userId", "name email").lean();
        if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }

    export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;
        const deleted = await Todo.findByIdAndDelete(id).lean();
        if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }
