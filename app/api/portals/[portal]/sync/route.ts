import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { portalsService } from "@/server/services/portalsService";
import { portalNameSchema, type PortalNameEnum } from "@/lib/validators";
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

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ portal: string }> }
) {
    return handleApiRoute(async () => {
        await requireAuth();

        const { portal } = await params;
        const parsedPortal = portalNameSchema.parse(portal.toUpperCase());
        const legacyPortal = prismaToLegacyPortal[parsedPortal];

        const synced = await portalsService.triggerIntegrationSync(legacyPortal);
        if (!synced) {
            throw new Error("Not Found");
        }

        return successResponse({
            ...synced,
            portal: parsedPortal,
        });
    });
}
