import { NextRequest, NextResponse } from "next/server";
import { propertiesService } from "@/server/services/propertiesService";

export async function GET() {
    const properties = await propertiesService.getAll();
    return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const property = await propertiesService.create(body);
        return NextResponse.json(property, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create property" }, { status: 400 });
    }
}
