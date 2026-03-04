import { NextRequest } from "next/server";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { settingsService } from "@/server/services/settingsService";
import { updateCrmSettingsSchema } from "@/lib/validators";

export async function GET() {
    return handleApiRoute(async () => {
        await requireAuth();
        const settings = await settingsService.get();
        return successResponse(settings);
    });
}

export async function PATCH(request: NextRequest) {
    return handleApiRoute(async () => {
        await requireAuth();
        const body = await request.json();
        const updates = updateCrmSettingsSchema.parse(body);
        const settings = await settingsService.update(updates);
        return successResponse(settings);
    });
}
