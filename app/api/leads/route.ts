import { NextRequest, NextResponse } from "next/server";
import { leadsService } from "@/server/services/leadsService";

export async function GET() {
    const leads = await leadsService.getAll();
    return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const lead = await leadsService.create(body);
        return NextResponse.json(lead, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create lead" }, { status: 400 });
    }
}
