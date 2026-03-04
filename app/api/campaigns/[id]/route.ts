import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { getCampaignById, updateCampaign, archiveCampaign } from "@/server/services/campaignServiceV2";
import { updateCampaignSchema } from "@/lib/validators";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const campaign = await getCampaignById(id, session.teamId);

        if (!campaign) {
            return errorResponse("Campaign not found", 404);
        }

        return successResponse(campaign);
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const body = await req.json();

        const validatedData = updateCampaignSchema.parse(body);
        const campaign = await updateCampaign(id, validatedData, session.teamId);

        return successResponse(campaign);
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        await archiveCampaign(id, session.teamId);

        return successResponse({ message: "Campaign archived successfully" });
    });
}
