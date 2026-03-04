import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { rescheduleJob } from "@/server/services/campaignServiceV2";
import { rescheduleJobSchema } from "@/lib/validators";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const body = await req.json();

        const { scheduledAt } = rescheduleJobSchema.parse(body);
        await rescheduleJob(id, scheduledAt, session.teamId);

        return successResponse({ message: "Job rescheduled successfully" });
    });
}
