import { NextRequest } from "next/server";
import { propertiesService } from "@/server/services/propertiesService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { createPropertySchema } from "@/lib/validators";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const properties = await propertiesService.getAll(session.teamId);
        return successResponse(properties);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await request.json();
        const payload = createPropertySchema.parse(body);
        console.log("[API] POST /api/properties payload:", payload);
        const property = await propertiesService.create(payload, session.userId, session.teamId);
        console.log("[API] POST /api/properties created:", property);
        return successResponse(property, 201);
    });
}
