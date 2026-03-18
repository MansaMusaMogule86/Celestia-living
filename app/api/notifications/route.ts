import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { getSession } from "@/lib/auth/session";
import {
    handleApiRoute,
    successResponse,
    errorResponse,
} from "@/lib/api/utils";
import { mockStorage } from "@/lib/db/mock-storage";

let prismaEnabled = true;

export async function GET() {
    return handleApiRoute(async () => {
        const session = await getSession();
        if (!session) {
            return errorResponse("Unauthorized", 401);
        }

        if (!prismaEnabled) {
            const notifications = mockStorage.getCollection("notifications");
            return successResponse(
                notifications
                    .filter((n: any) => n.userId === session.userId)
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20)
            );
        }

        try {
            const notifications = await prisma.notification.findMany({
                where: { userId: session.userId },
                orderBy: { createdAt: "desc" },
                take: 20,
            });
            return successResponse(notifications);
        } catch (error) {
            console.error("[Notifications GET] Prisma error:", error);
            prismaEnabled = false;
            const notifications = mockStorage.getCollection("notifications");
            return successResponse(
                notifications
                    .filter((n: any) => n.userId === session.userId)
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20)
            );
        }
    });
}

export async function PATCH(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await getSession();
        if (!session) {
            return errorResponse("Unauthorized", 401);
        }

        const body = await request.json();
        const { ids, all } = body as { ids?: string[]; all?: boolean };

        if (!all && (!ids || !Array.isArray(ids) || ids.length === 0)) {
            return errorResponse(
                "Provide either { all: true } or { ids: string[] }",
                400
            );
        }

        if (!prismaEnabled) {
            const notifications = mockStorage.getCollection("notifications");
            let updateCount = 0;
            notifications.forEach((n: any) => {
                if (n.userId === session.userId && !n.read) {
                    if (all || (ids && ids.includes(n.id))) {
                        mockStorage.updateInCollection("notifications", n.id, { read: true });
                        updateCount++;
                    }
                }
            });
            return successResponse({ updated: updateCount });
        }

        try {
            const result = await prisma.notification.updateMany({
                where: {
                    userId: session.userId,
                    read: false,
                    ...(all ? {} : { id: { in: ids } }),
                },
                data: { read: true },
            });

            return successResponse({ updated: result.count });
        } catch (error) {
            console.error("[Notifications PATCH] Prisma error:", error);
            prismaEnabled = false;
            const notifications = mockStorage.getCollection("notifications");
            let updateCount = 0;
            notifications.forEach((n: any) => {
                if (n.userId === session.userId && !n.read) {
                    if (all || (ids && ids.includes(n.id))) {
                        mockStorage.updateInCollection("notifications", n.id, { read: true });
                        updateCount++;
                    }
                }
            });
            return successResponse({ updated: updateCount });
        }
    });
}
