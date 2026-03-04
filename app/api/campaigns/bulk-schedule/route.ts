import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { bulkSchedule } from "@/server/services/campaignServiceV2";
import { bulkScheduleSchema } from "@/lib/validators";

export async function PATCH(req: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await req.json();

        const validatedData = bulkScheduleSchema.parse(body);
        const results = await bulkSchedule(validatedData, session.teamId);

        return successResponse(results);
    });
}
