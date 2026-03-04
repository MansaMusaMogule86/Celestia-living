import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { portalsService } from "@/server/services/portalsService";
import {
    portalNameSchema,
    updatePortalIntegrationSchema,
    type PortalNameEnum,
} from "@/lib/validators";
import type { PortalName as LegacyPortalName } from "@/lib/types";

const prismaToLegacyPortal: Record<PortalNameEnum, LegacyPortalName> = {
    INSTAGRAM: "instagram",
    FACEBOOK: "facebook",
    TIKTOK: "tiktok",
    YOUTUBE: "youtube",
    LINKEDIN: "linkedin",
    X_TWITTER: "x_twitter",
    SNAPCHAT: "snapchat",
    WHATSAPP: "whatsapp",
    TELEGRAM: "telegram",
    PINTEREST: "pinterest",
    DUBIZZLE: "dubizzle",
    PROPERTY_FINDER: "property_finder",
    BAYUT: "bayut",
};

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ portal: string }> }
) {
    return handleApiRoute(async () => {
        await requireAuth();

        const { portal } = await params;
        const parsedPortal = portalNameSchema.parse(portal.toUpperCase());
        const legacyPortal = prismaToLegacyPortal[parsedPortal];

        const body = await req.json();
        const validated = updatePortalIntegrationSchema.parse(body);

        const updated = await portalsService.updateIntegration(legacyPortal, validated);
        if (!updated) {
            throw new Error("Not Found");
        }

        return successResponse({
            ...updated,
            portal: parsedPortal,
        });
    });
}
