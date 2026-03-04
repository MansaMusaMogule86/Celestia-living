import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { manualTriggerRule } from "@/server/services/automationEngine";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const body = await req.json();

        await manualTriggerRule(id, session.userId, body.payload || {});

        return successResponse({ message: "Rule triggered successfully" });
    });
}
