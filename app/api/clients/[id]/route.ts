import { NextRequest } from "next/server";
import { clientsService } from "@/server/services/clientsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";

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
