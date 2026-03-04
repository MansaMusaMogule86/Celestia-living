import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { getOverviewStats, getPortalBreakdown } from "@/server/services/analyticsService";

export async function GET(req: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();

        const { searchParams } = new URL(req.url);
        const period = searchParams.get("period") || "30d";

        const [overview, breakdown] = await Promise.all([
            getOverviewStats(session.teamId, period),
            getPortalBreakdown(session.teamId, period),
        ]);

        return successResponse({ overview, breakdown });
    });
}
