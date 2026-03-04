import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { createCampaign, searchCampaigns } from "@/server/services/campaignServiceV2";
import { createCampaignSchema, campaignSearchSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();

        const { searchParams } = new URL(req.url);
        const query = {
            search: searchParams.get("search") || undefined,
            status: (searchParams.get("status") as any) || undefined,
            portal: (searchParams.get("portal") as any) || undefined,
            dateFrom: searchParams.get("dateFrom") || undefined,
            dateTo: searchParams.get("dateTo") || undefined,
            cursor: searchParams.get("cursor") || undefined,
            limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
            sortBy: (searchParams.get("sortBy") as any) || undefined,
            sortOrder: (searchParams.get("sortOrder") as any) || undefined,
        };

        const validatedQuery = campaignSearchSchema.parse(query);
        const result = await searchCampaigns(validatedQuery, session.teamId);

        return successResponse(result);
    });
}

export async function POST(req: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await req.json();

        const validatedData = createCampaignSchema.parse(body);
        const campaign = await createCampaign(validatedData, session.userId, session.teamId);

        return successResponse(campaign, 201);
    });
}
