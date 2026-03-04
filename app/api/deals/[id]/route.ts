import { NextRequest } from "next/server";
import { dealsService } from "@/server/services/dealsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        await requireAuth();
        const { id } = await params;
        const deal = await dealsService.getById(id);
        if (!deal) {
            return errorResponse("Deal not found", 404);
        }
        return successResponse(deal);
    });
}
