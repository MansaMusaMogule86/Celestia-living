import { NextRequest, NextResponse } from "next/server";
import { clientsService } from "@/server/services/clientsService";

export async function GET() {
    const clients = await clientsService.getAll();
    return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const client = await clientsService.create(body);
        return NextResponse.json(client, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create client" }, { status: 400 });
    }
}
