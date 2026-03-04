import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { duplicateCampaign } from "@/server/services/campaignServiceV2";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const clone = await duplicateCampaign(id, session.userId, session.teamId);

        return successResponse(clone, 201);
    });
}
