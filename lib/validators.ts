import { z } from "zod";

// ─── Portal Names ────────────────────────────────────────────────────

export const portalNameSchema = z.enum([
    "INSTAGRAM",
    "FACEBOOK",
    "TIKTOK",
    "YOUTUBE",
    "LINKEDIN",
    "X_TWITTER",
    "SNAPCHAT",
    "WHATSAPP",
    "TELEGRAM",
    "PINTEREST",
    "DUBIZZLE",
    "PROPERTY_FINDER",
    "BAYUT",
]);

export type PortalNameEnum = z.infer<typeof portalNameSchema>;

// ─── Auth Schemas ───────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const createLeadSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().min(5).max(30),
    status: z.enum(["new", "contacted", "qualified", "negotiating", "converted", "lost"]).default("new"),
    source: z.enum(["website", "bayut", "property_finder", "dubizzle", "referral", "walk_in", "social_media", "other"]),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    budget: z.object({
        min: z.number().nonnegative(),
        max: z.number().nonnegative(),
    }),
    requirements: z.object({
        type: z.array(z.enum(["apartment", "villa", "townhouse", "penthouse", "studio", "office", "retail"])),
        bedrooms: z.array(z.number().int().nonnegative()),
        areas: z.array(z.string()),
        listingType: z.enum(["sale", "rent"]),
    }),
    notes: z.string().max(5000).default(""),
    assignedTo: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const createClientSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().min(5).max(30),
    type: z.array(z.enum(["buyer", "seller", "tenant", "landlord"]))
        .min(1)
        .max(4),
    nationality: z.string().default(""),
    documents: z.array(z.object({
        id: z.string(),
        type: z.string(),
        name: z.string(),
        url: z.string(),
    })).default([]),
    properties: z.array(z.string()).default([]),
    deals: z.array(z.string()).default([]),
    notes: z.string().max(5000).default(""),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const createDealSchema = z.object({
    title: z.string().min(1).max(200),
    type: z.enum(["sale", "rental"]),
    stage: z.enum(["inquiry", "viewing", "offer", "negotiation", "agreement", "closed", "cancelled"]),
    property: z.object({
        id: z.string(),
        title: z.string(),
    }),
    client: z.object({
        id: z.string(),
        name: z.string(),
    }),
    value: z.number().nonnegative(),
    commission: z.number().nonnegative(),
    agent: z.object({
        id: z.string(),
        name: z.string(),
    }),
    expectedCloseDate: z.string(),
    actualCloseDate: z.string().optional(),
    notes: z.string().max(5000).default(""),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const createTransactionSchema = z.object({
    type: z.enum(["sale", "rental_payment", "commission", "deposit", "refund"]),
    status: z.enum(["pending", "completed", "failed", "cancelled"]),
    amount: z.number().nonnegative(),
    currency: z.string().default("AED"),
    deal: z.object({
        id: z.string(),
        title: z.string(),
    }),
    client: z.object({
        id: z.string(),
        name: z.string(),
    }),
    description: z.string().max(5000).default(""),
    paymentMethod: z.string().max(120),
    reference: z.string().max(120),
    completedAt: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const createPropertySchema = z.object({
    title: z.string().min(1).max(200),
    type: z.enum(["apartment", "villa", "townhouse", "penthouse", "studio", "office", "retail"]),
    status: z.enum(["available", "under_offer", "sold", "rented", "off_market"]),
    listingType: z.enum(["sale", "rent"]),
    price: z.number().nonnegative(),
    location: z.object({
        area: z.string().min(1),
        community: z.string().min(1),
        building: z.string().optional(),
        developer: z.string().optional(),
        address: z.string().min(1),
    }),
    details: z.object({
        bedrooms: z.number().int().nonnegative(),
        bathrooms: z.number().int().nonnegative(),
        size: z.number().nonnegative(),
        parkingSpaces: z.number().int().nonnegative(),
        furnished: z.boolean(),
    }),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    description: z.string().max(10000).default(""),
    agent: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// ─── Campaign Schemas ────────────────────────────────────────────────

export const campaignStatusSchema = z.enum([
    "DRAFT",
    "SCHEDULED",
    "PUBLISHING",
    "LIVE",
    "FAILED",
    "ARCHIVED",
]);

export const scheduleTypeSchema = z.enum([
    "IMMEDIATE",
    "SCHEDULED",
    "RECURRING",
]);

export const createCampaignSchema = z.object({
    title: z.string().min(1).max(200),
    caption: z.string().min(1).max(10000),
    propertyId: z.string().min(1),
    portals: z.array(portalNameSchema).min(1, "Select at least one portal"),
    templateId: z.string().optional(),
    scheduleType: scheduleTypeSchema,
    scheduledAt: z.string().datetime().optional().nullable(),
    hashtags: z.array(z.string()).default([]),
    mediaUrls: z.array(z.string().url()).default([]),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    caption: z.string().min(1).max(10000).optional(),
    portals: z.array(portalNameSchema).min(1).optional(),
    scheduleType: scheduleTypeSchema.optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
    hashtags: z.array(z.string()).optional(),
    mediaUrls: z.array(z.string().url()).optional(),
    status: campaignStatusSchema.optional(),
});

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export const bulkScheduleSchema = z.object({
    campaignIds: z.array(z.string().min(1)).min(1, "Select at least one campaign"),
    scheduledAt: z.string().datetime(),
});

export type BulkScheduleInput = z.infer<typeof bulkScheduleSchema>;

// ─── Campaign Post ───────────────────────────────────────────────────

export const postStatusSchema = z.enum([
    "PENDING",
    "PUBLISHING",
    "PUBLISHED",
    "FAILED",
    "PAUSED",
    "DELETED",
]);

export const updatePostStatusSchema = z.object({
    status: postStatusSchema,
    scheduledAt: z.string().datetime().optional(),
});

export type UpdatePostStatusInput = z.infer<typeof updatePostStatusSchema>;

// ─── Automation Rules ────────────────────────────────────────────────

export const automationTriggerSchema = z.enum([
    "PROPERTY_CREATED",
    "PROPERTY_UPDATED",
    "PRICE_CHANGED",
    "STATUS_CHANGED",
    "OPEN_HOUSE_SCHEDULED",
    "MANUAL",
]);

export const automationActionTypeSchema = z.enum([
    "CREATE_CAMPAIGN",
    "ASSIGN_LEAD",
    "SEND_WHATSAPP",
    "SEND_EMAIL",
    "REPOST_EVERY_X_DAYS",
    "SCHEDULE_POST",
]);

export const automationActionSchema = z.object({
    type: automationActionTypeSchema,
    config: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    order: z.number().int().min(0),
});

export const createAutomationRuleSchema = z.object({
    name: z.string().min(1).max(200),
    trigger: automationTriggerSchema,
    triggerConfig: z.record(z.string(), z.string()).default({}),
    actions: z.array(automationActionSchema).min(1, "Add at least one action"),
    portals: z.array(portalNameSchema).default([]),
    enabled: z.boolean().default(true),
});

export type CreateAutomationRuleInput = z.infer<typeof createAutomationRuleSchema>;

export const updateAutomationRuleSchema = createAutomationRuleSchema.partial();

export type UpdateAutomationRuleInput = z.infer<typeof updateAutomationRuleSchema>;

// ─── Scheduled Job ───────────────────────────────────────────────────

export const rescheduleJobSchema = z.object({
    scheduledAt: z.string().datetime(),
});

export type RescheduleJobInput = z.infer<typeof rescheduleJobSchema>;

// ─── Search / Pagination ─────────────────────────────────────────────

export const campaignSearchSchema = z.object({
    search: z.string().optional(),
    status: campaignStatusSchema.optional(),
    portal: portalNameSchema.optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(["createdAt", "updatedAt", "scheduledAt"]).default("updatedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CampaignSearchInput = z.infer<typeof campaignSearchSchema>;

// ─── Analytics ───────────────────────────────────────────────────────

export const analyticsQuerySchema = z.object({
    period: z.enum(["7d", "30d", "90d"]).default("30d"),
    portal: portalNameSchema.optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;

// ─── Portal Integrations ────────────────────────────────────────────

export const integrationStatusSchema = z.enum(["CONNECTED", "DISCONNECTED"]);

export const updatePortalIntegrationSchema = z.object({
    status: integrationStatusSchema.optional(),
    enabled: z.boolean().optional(),
    autoPublish: z.boolean().optional(),
    importLeads: z.boolean().optional(),
    syncInterval: z.coerce.number().int().min(1).max(24).optional(),
    accountName: z.string().max(120).optional(),
    lastSyncAt: z.string().datetime().nullable().optional(),
});

export type UpdatePortalIntegrationInput = z.infer<typeof updatePortalIntegrationSchema>;

// ─── Post Template ───────────────────────────────────────────────────

export const createTemplateSchema = z.object({
    name: z.string().min(1).max(200),
    caption: z.string().min(1).max(10000),
    hashtags: z.array(z.string()).default([]),
    portals: z.array(portalNameSchema).default([]),
    variables: z.array(z.string()).default([]),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
