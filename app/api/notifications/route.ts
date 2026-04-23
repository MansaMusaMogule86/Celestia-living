import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
    handleApiRoute,
    successResponse,
    errorResponse,
} from "@/lib/api/utils";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await getSession();
        if (!session) {
            return errorResponse("Unauthorized", 401);
        }
        // Notifications not yet implemented — return empty list
        return successResponse([]);
    });
}

export async function PATCH(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await getSession();
        if (!session) {
            return errorResponse("Unauthorized", 401);
        }
        // Notifications not yet implemented
        return successResponse({ updated: 0 });
    });
}
