import { NextRequest, NextResponse } from "next/server";
import { dealsService } from "@/server/services/dealsService";

export async function GET() {
    const deals = await dealsService.getAll();
    return NextResponse.json(deals);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const deal = await dealsService.create(body);
        return NextResponse.json(deal, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create deal" }, { status: 400 });
    }
}
