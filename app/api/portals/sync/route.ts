import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { syncAllPortals } from "@/server/services/campaignServiceV2";

export async function POST() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const results = await syncAllPortals(session.teamId);
        return successResponse(results);
    });
}
