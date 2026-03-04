import { NextRequest } from "next/server";
import { dealsService } from "@/server/services/dealsService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { createDealSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const deals = await dealsService.getAll(session.teamId);
        return successResponse(deals);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await request.json();
        const payload = createDealSchema.parse(body);
        const deal = await dealsService.create(payload, {
            teamId: session.teamId,
            userId: session.userId,
        });
        return successResponse(deal, 201);
    });
}
