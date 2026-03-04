import { MockPortalAdapter } from "./mockAdapter";
import {
    PublishPostInput,
    PublishPostResult,
    FetchMetricsInput,
    FetchMetricsResult,
} from "./types";

// ─── Bayut Adapter ───────────────────────────────────────────────────

export class BayutAdapter extends MockPortalAdapter {
    constructor() {
        super("Bayut", 1200, 0.03); // Slower API, lower error rate
    }

    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
        // Bayut requires specific property data fields
        const required = ["price", "bedrooms", "area"];
        for (const field of required) {
            if (!input.propertyData[field]) {
                return {
                    success: false,
                    platformPostId: null,
                    platformUrl: null,
                    error: `[Bayut] Missing required field: ${field}`,
                };
            }
        }
        return super.publishPost(input);
    }
}

// ─── Property Finder Adapter ────────────────────────────────────────

export class PropertyFinderAdapter extends MockPortalAdapter {
    constructor() {
        super("PropertyFinder", 1000, 0.04);
    }

    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
        if (!input.mediaUrls.length) {
            return {
                success: false,
                platformPostId: null,
                platformUrl: null,
                error: "[PropertyFinder] At least one image is required",
            };
        }
        return super.publishPost(input);
    }
}

// ─── Instagram Adapter ──────────────────────────────────────────────

export class InstagramAdapter extends MockPortalAdapter {
    constructor() {
        super("Instagram", 600, 0.06);
    }

    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
        // Instagram caption limit
        if (input.caption.length > 2200) {
            return {
                success: false,
                platformPostId: null,
                platformUrl: null,
                error: "[Instagram] Caption exceeds 2,200 character limit",
            };
        }
        if (!input.mediaUrls.length) {
            return {
                success: false,
                platformPostId: null,
                platformUrl: null,
                error: "[Instagram] At least one image or video is required",
            };
        }
        return super.publishPost(input);
    }

    async fetchMetrics(input: FetchMetricsInput): Promise<FetchMetricsResult> {
        const base = await super.fetchMetrics(input);
        // Instagram typically has higher engagement
        return {
            ...base,
            likes: base.likes * 2,
            saves: base.saves * 3,
            engagementRate: undefined as unknown as number, // not in base
        } as FetchMetricsResult;
    }
}

// ─── Facebook Adapter ───────────────────────────────────────────────

export class FacebookAdapter extends MockPortalAdapter {
    constructor() {
        super("Facebook", 700, 0.05);
    }

    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
        if (input.caption.length > 63206) {
            return {
                success: false,
                platformPostId: null,
                platformUrl: null,
                error: "[Facebook] Caption exceeds character limit",
            };
        }
        return super.publishPost(input);
    }
}
