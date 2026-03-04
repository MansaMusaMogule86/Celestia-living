import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { updateAutomationRule, deleteAutomationRule } from "@/server/services/automationService";
import { updateAutomationRuleSchema } from "@/lib/validators";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        const body = await req.json();

        const validatedData = updateAutomationRuleSchema.parse(body);
        const rule = await updateAutomationRule(id, validatedData, session.teamId);

        return successResponse(rule);
    });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const { id } = await params;
        const session = await requireAuth();
        await deleteAutomationRule(id, session.teamId);

        return successResponse({ message: "Rule deleted successfully" });
    });
}
