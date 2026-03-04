import { NextRequest } from "next/server";
import { clientsService } from "@/server/services/clientsService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { createClientSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
    return handleApiRoute(async () => {
        await requireAuth();
        const clients = await clientsService.getAll();
        return successResponse(clients);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        await requireAuth();
        const body = await request.json();
        const payload = createClientSchema.parse(body);
        const client = await clientsService.create(payload);
        return successResponse(client, 201);
    });
}
