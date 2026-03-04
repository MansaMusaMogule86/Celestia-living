import { NextRequest } from "next/server";
import { leadsService } from "@/server/services/leadsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        await requireAuth();
        const { id } = await params;

        const lead = await leadsService.getById(id);
        if (!lead) {
            return errorResponse("Lead not found", 404);
        }

        return successResponse(lead);
    });
}
