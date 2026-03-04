import { PortalAdapter } from "./types";
import { MockPortalAdapter } from "./mockAdapter";
import {
    BayutAdapter,
    PropertyFinderAdapter,
    InstagramAdapter,
    FacebookAdapter,
} from "./portalAdapters";

/**
 * Registry that maps PortalName enum → adapter instance.
 * All unmapped portals get a generic MockPortalAdapter.
 */

const adapters: Record<string, PortalAdapter> = {
    BAYUT: new BayutAdapter(),
    PROPERTY_FINDER: new PropertyFinderAdapter(),
    INSTAGRAM: new InstagramAdapter(),
    FACEBOOK: new FacebookAdapter(),
    TIKTOK: new MockPortalAdapter("TikTok", 500, 0.08),
    YOUTUBE: new MockPortalAdapter("YouTube", 1500, 0.04),
    LINKEDIN: new MockPortalAdapter("LinkedIn", 900, 0.03),
    X_TWITTER: new MockPortalAdapter("X_Twitter", 400, 0.07),
    SNAPCHAT: new MockPortalAdapter("Snapchat", 600, 0.06),
    WHATSAPP: new MockPortalAdapter("WhatsApp", 300, 0.02),
    TELEGRAM: new MockPortalAdapter("Telegram", 250, 0.02),
    PINTEREST: new MockPortalAdapter("Pinterest", 700, 0.05),
    DUBIZZLE: new MockPortalAdapter("Dubizzle", 1100, 0.04),
};

export function getAdapter(portalName: string): PortalAdapter {
    const adapter = adapters[portalName.toUpperCase()];
    if (!adapter) {
        console.warn(`[AdapterRegistry] No adapter for "${portalName}", using generic mock.`);
        return new MockPortalAdapter(portalName);
    }
    return adapter;
}

export function listAdapters(): string[] {
    return Object.keys(adapters);
}
