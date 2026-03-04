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
