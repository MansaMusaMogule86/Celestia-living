import { NextRequest } from "next/server";
import { propertiesService } from "@/server/services/propertiesService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";

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
