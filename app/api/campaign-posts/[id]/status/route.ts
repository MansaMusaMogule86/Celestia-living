import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { updatePostStatus } from "@/server/services/campaignServiceV2";
import { updatePostStatusSchema } from "@/lib/validators";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const body = await req.json();

        const { status, scheduledAt } = updatePostStatusSchema.parse(body);
        const post = await updatePostStatus(id, status, session.teamId, scheduledAt);

        return successResponse(post);
    });
}
