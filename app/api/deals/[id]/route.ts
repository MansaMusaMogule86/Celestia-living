import { NextRequest } from "next/server";
import { dealsService } from "@/server/services/dealsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { ensureCanDelete } from "@/lib/auth/authorization";
import { updateDealSchema } from "@/lib/validators";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;
        const deal = await dealsService.getById(id, session.teamId);
        if (!deal) {
            return errorResponse("Deal not found", 404);
        }
        return successResponse(deal);
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
        const updates = updateDealSchema.parse(body);

        const deal = await dealsService.update(id, updates, session.teamId);
        if (!deal) {
            return errorResponse("Deal not found", 404);
        }

        return successResponse(deal);
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
        const deleted = await dealsService.delete(id, session.teamId);
        if (!deleted) {
            return errorResponse("Deal not found", 404);
        }

        return successResponse({ deleted: true });
    });
}
