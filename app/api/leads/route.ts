import { NextRequest } from "next/server";
import { leadsService } from "@/server/services/leadsService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { createLeadSchema } from "@/lib/validators";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const leads = await leadsService.getAll(session.teamId);
        return successResponse(leads);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await request.json();
        const payload = createLeadSchema.parse(body);
        const lead = await leadsService.create(payload, {
            teamId: session.teamId,
            userId: session.userId,
        });
        return successResponse(lead, 201);
    });
}
