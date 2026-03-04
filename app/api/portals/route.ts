import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { portalsService } from "@/server/services/portalsService";
import type { PortalName as LegacyPortalName } from "@/lib/types";

const legacyToPrismaPortal: Record<LegacyPortalName, string> = {
    instagram: "INSTAGRAM",
    facebook: "FACEBOOK",
    tiktok: "TIKTOK",
    youtube: "YOUTUBE",
    linkedin: "LINKEDIN",
    x_twitter: "X_TWITTER",
    snapchat: "SNAPCHAT",
    whatsapp: "WHATSAPP",
    telegram: "TELEGRAM",
    pinterest: "PINTEREST",
    dubizzle: "DUBIZZLE",
    property_finder: "PROPERTY_FINDER",
    bayut: "BAYUT",
};

export async function GET() {
    return handleApiRoute(async () => {
        await requireAuth();

        const integrations = await portalsService.getIntegrations();
        const mapped = integrations.map((item) => ({
            ...item,
            portal: legacyToPrismaPortal[item.portal],
        }));

        return successResponse(mapped);
    });
}
