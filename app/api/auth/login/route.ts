import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { createSession } from "@/lib/auth/session";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
    return handleApiRoute(async () => {
        const body = await req.json();
        const credentials = loginSchema.parse(body);

        const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                role: true,
                teamId: true,
            },
        });

        if (!user) {
            return errorResponse("Invalid email or password", 401);
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValidPassword) {
            return errorResponse("Invalid email or password", 401);
        }

        if (!user.teamId) {
            return errorResponse("User is not assigned to a team", 403);
        }

        await createSession({
            userId: user.id,
            teamId: user.teamId,
            role: user.role,
        });

        return successResponse({
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
        });
    });
}
