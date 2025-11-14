    import { NextResponse } from "next/server";
    import { connectDB } from "@/lib/mongodb";
    import User from "@/models/User";
    import bcrypt from "bcrypt";

    const SALT_ROUNDS = 10;

    export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
    ) {
    try {
        await connectDB();
        const { id } = await context.params;

        const body = await req.json();

        const update: {
        name?: string;
        email?: string;
        role?: "user" | "admin";
        passwordHash?: string;
        } = {};

        if (body.name) update.name = body.name;
        if (body.email) update.email = body.email;
        if (body.role) update.role = body.role;
        if (body.password)
        update.passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

        const updated = await User.findByIdAndUpdate(id, update, {
        new: true,
        })
        .select("-passwordHash")
        .lean();

        if (!updated)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(updated);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }

    export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
    ) {
    try {
        await connectDB();
        const { id } = await context.params;

        const deleted = await User.findByIdAndDelete(id).lean();
        if (!deleted)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ message: "Deleted" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    }
