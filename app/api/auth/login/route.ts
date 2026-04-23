import { NextRequest } from "next/server";
import { createSession } from "@/lib/auth/session";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { loginSchema } from "@/lib/validators";

// ─── Hardcoded Admin Credentials ────────────────────────────────────
// In production these should come from env vars.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@celestialiving.ae").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Ilan@2025";
const ADMIN_USER = {
    id: "admin-001",
    email: ADMIN_EMAIL,
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    teamId: "team-001",
};

export async function POST(req: NextRequest) {
    return handleApiRoute(async () => {
        const body = await req.json();
        const credentials = loginSchema.parse(body);

        const emailMatch = credentials.email.toLowerCase() === ADMIN_EMAIL;
        const passwordMatch = credentials.password === ADMIN_PASSWORD;

        if (!emailMatch || !passwordMatch) {
            return errorResponse("Invalid email or password", 401);
        }

        await createSession({
            userId: ADMIN_USER.id,
            teamId: ADMIN_USER.teamId,
            role: ADMIN_USER.role,
        });

        return successResponse({
            id: ADMIN_USER.id,
            email: ADMIN_USER.email,
            name: `${ADMIN_USER.firstName} ${ADMIN_USER.lastName}`,
            role: ADMIN_USER.role,
        });
    });
}
