import { NextRequest } from "next/server";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { activityService } from "@/server/services/activityService";

export async function GET(request: NextRequest) {
    return handleApiRoute(async () => {
        await requireAuth();
        const limitParam = request.nextUrl.searchParams.get("limit");
        const limit = limitParam ? Number(limitParam) : undefined;
        const activities = await activityService.getAll(Number.isFinite(limit) ? limit : undefined);
        return successResponse(activities);
    });
}
