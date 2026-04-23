import { NextRequest } from "next/server";
import { propertiesService } from "@/server/services/propertiesService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { ensureCanDelete } from "@/lib/auth/authorization";
import { updatePropertySchema } from "@/lib/validators";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;

        const property = await propertiesService.getById(id, session.teamId);
        if (!property) {
            return errorResponse("Property not found", 404);
        }

        return successResponse(property);
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
        const updates = updatePropertySchema.parse(body);

        const property = await propertiesService.update(id, updates, session.userId, session.teamId);
        if (!property) {
            return errorResponse("Property not found", 404);
        }

        return successResponse(property);
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
        const deleted = await propertiesService.delete(id, session.teamId);
        if (!deleted) {
            return errorResponse("Property not found", 404);
        }

        return successResponse({ deleted: true });
    });
}
