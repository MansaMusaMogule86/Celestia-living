import { NextRequest } from "next/server";
import { clientsService } from "@/server/services/clientsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { ensureCanDelete } from "@/lib/auth/authorization";
import { updateClientSchema } from "@/lib/validators";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;
        const client = await clientsService.getById(id, session.teamId);
        if (!client) {
            return errorResponse("Client not found", 404);
        }
        return successResponse(client);
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;
        const body = await req.json();
        const updates = updateClientSchema.parse(body);

        const client = await clientsService.update(id, updates, session.teamId);
        if (!client) {
            return errorResponse("Client not found", 404);
        }

        return successResponse(client);
    });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        ensureCanDelete(session);

        const { id } = await params;
        const deleted = await clientsService.delete(id, session.teamId);
        if (!deleted) {
            return errorResponse("Client not found", 404);
        }

        return successResponse({ deleted: true });
    });
}
