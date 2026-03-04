import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { getAutomationRules, createAutomationRule } from "@/server/services/automationService";
import { createAutomationRuleSchema } from "@/lib/validators";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const rules = await getAutomationRules(session.teamId);
        return successResponse(rules);
    });
}

export async function POST(req: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await req.json();

        const validatedData = createAutomationRuleSchema.parse(body);
        const rule = await createAutomationRule(validatedData, session.userId, session.teamId);

        return successResponse(rule, 201);
    });
}
