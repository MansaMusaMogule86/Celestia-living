import { NextRequest } from "next/server";
import { clientsService } from "@/server/services/clientsService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { createClientSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const clients = await clientsService.getAll(session.teamId);
        return successResponse(clients);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await request.json();
        const payload = createClientSchema.parse(body);
        console.log("[API] POST /api/clients payload:", payload);
        const client = await clientsService.create(payload, {
            teamId: session.teamId,
        });
        console.log("[API] POST /api/clients created:", client);
        return successResponse(client, 201);
    });
}
