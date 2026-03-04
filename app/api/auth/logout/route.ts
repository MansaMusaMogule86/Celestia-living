import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { deleteSession } from "@/lib/auth/session";

export async function POST() {
    return handleApiRoute(async () => {
        await deleteSession();
        return successResponse({ message: "Logged out successfully" });
    });
}
