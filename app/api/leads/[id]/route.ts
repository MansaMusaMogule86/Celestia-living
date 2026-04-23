import { NextRequest } from "next/server";
import { leadsService } from "@/server/services/leadsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { ensureCanDelete } from "@/lib/auth/authorization";
import { updateLeadSchema } from "@/lib/validators";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;

        const lead = await leadsService.getById(id, session.teamId);
        if (!lead) {
            return errorResponse("Lead not found", 404);
        }

        return successResponse(lead);
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
        const updates = updateLeadSchema.parse(body);

        const lead = await leadsService.update(id, updates, session.teamId);
        if (!lead) {
            return errorResponse("Lead not found", 404);
        }

        return successResponse(lead);
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
        const deleted = await leadsService.delete(id, session.teamId);
        if (!deleted) {
            return errorResponse("Lead not found", 404);
        }

        return successResponse({ deleted: true });
    });
}
