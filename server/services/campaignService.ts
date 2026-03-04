import { PortalName } from "@/lib/types";
import {
    Campaign,
    CampaignStatus,
    AutomationRule,
    Template,
    EngagementStats,
    PortalAutomationSettings,
} from "@/lib/portals-types";

// ─── Mock Campaigns ──────────────────────────────────────────────────

const mockCampaigns: Campaign[] = [
    {
        id: "cmp-001",
        title: "Luxury Marina Penthouse Launch",
        propertyId: "prop-001",
        propertyTitle: "5BR Penthouse — Dubai Marina",
        propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
        portals: ["instagram", "facebook", "property_finder", "bayut"],
        status: "live",
        scheduledAt: "2026-02-20T09:00:00Z",
        publishedAt: "2026-02-20T09:01:23Z",
        caption: "Breathtaking views from this stunning 5BR penthouse in Dubai Marina. Full floor, private pool, smart home. 💎\n\n📍 {{location}}\n💰 {{price}}\n📐 {{size}} sqft\n\n#DubaiLuxury #DubaiMarina #Penthouse",
        hashtags: ["DubaiLuxury", "DubaiMarina", "Penthouse", "DubaiRealEstate"],
        createdAt: "2026-02-19T08:00:00Z",
        updatedAt: "2026-02-20T09:01:23Z",
        stats: { impressions: 14520, clicks: 876, leads: 23, engagement: 6.2 },
    },
    {
        id: "cmp-002",
        title: "Downtown Boulevard View Apartment",
        propertyId: "prop-002",
        propertyTitle: "3BR Apartment — Downtown Dubai",
        propertyImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
        portals: ["instagram", "dubizzle", "tiktok"],
        status: "scheduled",
        scheduledAt: "2026-02-22T10:00:00Z",
        publishedAt: null,
        caption: "Prime Downtown living with Burj Khalifa views 🏙️\n\n📍 {{location}}\n💰 {{price}}\n\nDM for private viewing! 📩\n\n#DowntownDubai #BurjKhalifa #DubaiProperty",
        hashtags: ["DowntownDubai", "BurjKhalifa", "DubaiProperty"],
        createdAt: "2026-02-21T10:00:00Z",
        updatedAt: "2026-02-21T10:00:00Z",
        stats: { impressions: 0, clicks: 0, leads: 0, engagement: 0 },
    },
    {
        id: "cmp-003",
        title: "Palm Jumeirah Villa Collection",
        propertyId: "prop-003",
        propertyTitle: "6BR Villa — Palm Jumeirah",
        propertyImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
        portals: ["youtube", "instagram", "facebook", "linkedin"],
        status: "publishing",
        scheduledAt: "2026-02-21T12:00:00Z",
        publishedAt: null,
        caption: "Experience island living at its finest 🌴\n\n📍 {{location}}\n💰 {{price}}\n🏊 Private beach access\n\n#PalmJumeirah #DubaiVilla #IslandLiving",
        hashtags: ["PalmJumeirah", "DubaiVilla", "IslandLiving"],
        createdAt: "2026-02-20T15:00:00Z",
        updatedAt: "2026-02-21T12:00:00Z",
        stats: { impressions: 320, clicks: 14, leads: 1, engagement: 4.1 },
    },
    {
        id: "cmp-004",
        title: "JBR Beachfront Studio — Quick Sale",
        propertyId: "prop-004",
        propertyTitle: "Studio — JBR Walk",
        propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
        portals: ["dubizzle", "bayut", "property_finder"],
        status: "draft",
        scheduledAt: null,
        publishedAt: null,
        caption: "Investor alert: Beachfront studio in JBR with guaranteed rental yield 📈\n\n📍 {{location}}\n💰 {{price}}",
        hashtags: ["JBR", "DubaiInvestment", "BeachfrontLiving"],
        createdAt: "2026-02-21T09:00:00Z",
        updatedAt: "2026-02-21T09:00:00Z",
        stats: { impressions: 0, clicks: 0, leads: 0, engagement: 0 },
    },
    {
        id: "cmp-005",
        title: "Creek Harbour Waterfront Launch",
        propertyId: "prop-005",
        propertyTitle: "4BR Townhouse — Creek Harbour",
        propertyImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
        portals: ["instagram", "facebook", "whatsapp", "telegram"],
        status: "scheduled",
        scheduledAt: "2026-02-23T08:00:00Z",
        publishedAt: null,
        caption: "New launch alert! 🚀 Waterfront townhouses at Creek Harbour\n\n📍 {{location}}\n💰 Starting from {{price}}\n\n#CreekHarbour #DubaiNewLaunch",
        hashtags: ["CreekHarbour", "DubaiNewLaunch", "Waterfront"],
        createdAt: "2026-02-21T07:00:00Z",
        updatedAt: "2026-02-21T07:00:00Z",
        stats: { impressions: 0, clicks: 0, leads: 0, engagement: 0 },
    },
    {
        id: "cmp-006",
        title: "Business Bay Office Space",
        propertyId: "prop-006",
        propertyTitle: "Office Space — Business Bay",
        propertyImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
        portals: ["linkedin", "property_finder"],
        status: "failed",
        scheduledAt: "2026-02-19T14:00:00Z",
        publishedAt: null,
        caption: "Premium office space in Business Bay with canal views 🏢\n\n📍 {{location}}\n💰 {{price}}/yr\n\n#BusinessBay #DubaiOffice",
        hashtags: ["BusinessBay", "DubaiOffice", "Commercial"],
        createdAt: "2026-02-18T10:00:00Z",
        updatedAt: "2026-02-19T14:05:00Z",
        stats: { impressions: 0, clicks: 0, leads: 0, engagement: 0 },
    },
    {
        id: "cmp-007",
        title: "Arabian Ranches Villa Tour",
        propertyId: "prop-007",
        propertyTitle: "5BR Villa — Arabian Ranches",
        propertyImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
        portals: ["tiktok", "youtube", "instagram", "snapchat"],
        status: "live",
        scheduledAt: "2026-02-18T16:00:00Z",
        publishedAt: "2026-02-18T16:00:30Z",
        caption: "🎬 Virtual tour of this amazing family villa in Arabian Ranches!\n\n📍 {{location}}\n💰 {{price}}\n\n#ArabianRanches #DubaiVilla #PropertyTour",
        hashtags: ["ArabianRanches", "DubaiVilla", "PropertyTour"],
        createdAt: "2026-02-17T12:00:00Z",
        updatedAt: "2026-02-18T16:00:30Z",
        stats: { impressions: 28400, clicks: 1230, leads: 45, engagement: 8.7 },
    },
    {
        id: "cmp-008",
        title: "DIFC Penthouse — VIP",
        propertyId: "prop-008",
        propertyTitle: "4BR Penthouse — DIFC",
        propertyImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
        portals: ["instagram", "linkedin", "whatsapp"],
        status: "draft",
        scheduledAt: null,
        publishedAt: null,
        caption: "Exclusive DIFC penthouse — by invitation only ✨\n\n📍 {{location}}\n💰 {{price}}\n\nContact for private viewing.\n\n#DIFC #UltraLuxury",
        hashtags: ["DIFC", "UltraLuxury", "PrivateSale"],
        createdAt: "2026-02-21T11:00:00Z",
        updatedAt: "2026-02-21T11:00:00Z",
        stats: { impressions: 0, clicks: 0, leads: 0, engagement: 0 },
    },
    {
        id: "cmp-009",
        title: "Jumeirah Village Circle Special",
        propertyId: "prop-009",
        propertyTitle: "2BR Apartment — JVC",
        propertyImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
        portals: ["dubizzle", "bayut", "facebook"],
        status: "archived",
        scheduledAt: "2026-02-10T08:00:00Z",
        publishedAt: "2026-02-10T08:01:00Z",
        caption: "Affordable luxury in JVC! 2BR apartment with pool view 🏊\n\n📍 {{location}}\n💰 {{price}}\n\n#JVC #AffordableLuxury",
        hashtags: ["JVC", "AffordableLuxury", "DubaiRental"],
        createdAt: "2026-02-09T12:00:00Z",
        updatedAt: "2026-02-15T00:00:00Z",
        stats: { impressions: 9800, clicks: 456, leads: 12, engagement: 4.8 },
    },
    {
        id: "cmp-010",
        title: "Emaar Beachfront Pre-Launch",
        propertyId: "prop-010",
        propertyTitle: "2BR Apartment — Emaar Beachfront",
        propertyImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
        portals: ["instagram", "facebook", "tiktok", "whatsapp", "property_finder"],
        status: "scheduled",
        scheduledAt: "2026-02-24T09:00:00Z",
        publishedAt: null,
        caption: "🔥 Pre-launch prices won't last! Beachfront living at Emaar\n\n📍 {{location}}\n💰 Starting {{price}}\n\n#EmaarBeachfront #PreLaunch #DubaiOff",
        hashtags: ["EmaarBeachfront", "PreLaunch", "DubaiOffPlan"],
        createdAt: "2026-02-21T08:00:00Z",
        updatedAt: "2026-02-21T08:00:00Z",
        stats: { impressions: 0, clicks: 0, leads: 0, engagement: 0 },
    },
];

// ─── Mock Automation Rules ──────────────────────────────────────────────

const mockAutomationRules: AutomationRule[] = [
    {
        id: "auto-001",
        name: "Auto-publish new luxury listings",
        trigger: "new_property_created",
        triggerConfig: { priceMin: "5000000", propertyType: "penthouse,villa" },
        actions: [
            { id: "act-001", type: "create_campaign", config: { templateId: "tpl-001", autoSchedule: true }, order: 1 },
            { id: "act-002", type: "schedule_post", config: { delayMinutes: 30 }, order: 2 },
        ],
        enabled: true,
        portals: ["instagram", "facebook", "property_finder", "bayut"],
        createdAt: "2026-02-01T00:00:00Z",
        lastTriggeredAt: "2026-02-20T09:00:00Z",
        triggerCount: 14,
    },
    {
        id: "auto-002",
        name: "Price drop notification blast",
        trigger: "price_updated",
        triggerConfig: { direction: "decrease", minPercent: "5" },
        actions: [
            { id: "act-003", type: "send_whatsapp", config: { templateId: "tpl-003", audienceType: "interested_leads" }, order: 1 },
            { id: "act-004", type: "schedule_post", config: { delayMinutes: 0 }, order: 2 },
        ],
        enabled: true,
        portals: ["whatsapp", "instagram", "dubizzle"],
        createdAt: "2026-02-05T00:00:00Z",
        lastTriggeredAt: "2026-02-19T15:30:00Z",
        triggerCount: 8,
    },
    {
        id: "auto-003",
        name: "Open house social blast",
        trigger: "open_house_scheduled",
        triggerConfig: {},
        actions: [
            { id: "act-005", type: "create_campaign", config: { templateId: "tpl-002" }, order: 1 },
            { id: "act-006", type: "send_email", config: { audienceType: "area_leads" }, order: 2 },
            { id: "act-007", type: "repost_every_x_days", config: { days: 2, maxReposts: 3 }, order: 3 },
        ],
        enabled: false,
        portals: ["instagram", "facebook", "tiktok"],
        createdAt: "2026-02-10T00:00:00Z",
        lastTriggeredAt: null,
        triggerCount: 0,
    },
    {
        id: "auto-004",
        name: "Status change → Archive old posts",
        trigger: "status_changed",
        triggerConfig: { newStatus: "sold,rented" },
        actions: [
            { id: "act-008", type: "create_campaign", config: { action: "archive_all" }, order: 1 },
        ],
        enabled: true,
        portals: [],
        createdAt: "2026-02-12T00:00:00Z",
        lastTriggeredAt: "2026-02-20T18:00:00Z",
        triggerCount: 5,
    },
];

// ─── Mock Templates ──────────────────────────────────────────────────────

const mockTemplates: Template[] = [
    {
        id: "tpl-001",
        name: "Luxury Listing Launch",
        caption: "✨ New Exclusive Listing ✨\n\n{{property_title}}\n📍 {{location}}\n💰 {{price}}\n📐 {{size}} sqft\n🛏️ {{bedrooms}} BR | 🚿 {{bathrooms}} BA\n\nContact us for a private viewing!\n\n#DubaiLuxury #{{area}} #DubaiRealEstate",
        hashtags: ["DubaiLuxury", "DubaiRealEstate", "NewListing"],
        portals: ["instagram", "facebook"],
        variables: ["{{property_title}}", "{{location}}", "{{price}}", "{{size}}", "{{bedrooms}}", "{{bathrooms}}", "{{area}}"],
        createdAt: "2026-01-15T00:00:00Z",
    },
    {
        id: "tpl-002",
        name: "Open House Invitation",
        caption: "🏠 Open House This Weekend!\n\n{{property_title}}\n📍 {{location}}\n📅 {{date}} | ⏰ {{time}}\n\nDon't miss this opportunity — RSVP now!\n\n#OpenHouse #DubaiProperty",
        hashtags: ["OpenHouse", "DubaiProperty"],
        portals: ["instagram", "facebook", "whatsapp"],
        variables: ["{{property_title}}", "{{location}}", "{{date}}", "{{time}}"],
        createdAt: "2026-01-20T00:00:00Z",
    },
    {
        id: "tpl-003",
        name: "Price Drop Alert",
        caption: "🔴 PRICE REDUCED! 🔴\n\n{{property_title}}\n📍 {{location}}\n\n~~{{old_price}}~~ → 💰 {{price}}\n\nLimited time — act fast!\n\n#PriceDrop #DubaiDeal",
        hashtags: ["PriceDrop", "DubaiDeal"],
        portals: ["dubizzle", "bayut", "whatsapp"],
        variables: ["{{property_title}}", "{{location}}", "{{old_price}}", "{{price}}"],
        createdAt: "2026-02-01T00:00:00Z",
    },
];

// ─── Mock Engagement Stats ───────────────────────────────────────────────

const mockEngagementStats: EngagementStats[] = [
    { portal: "instagram", period: "30d", postsSent: 45, leadsGenerated: 67, conversionRate: 5.2, costPerLead: 12.5, engagementRate: 6.8, impressions: 125000, clicks: 4200 },
    { portal: "facebook", period: "30d", postsSent: 38, leadsGenerated: 42, conversionRate: 3.8, costPerLead: 18.2, engagementRate: 4.1, impressions: 89000, clicks: 2800 },
    { portal: "tiktok", period: "30d", postsSent: 22, leadsGenerated: 31, conversionRate: 4.5, costPerLead: 8.9, engagementRate: 9.2, impressions: 245000, clicks: 6100 },
    { portal: "youtube", period: "30d", postsSent: 8, leadsGenerated: 15, conversionRate: 6.1, costPerLead: 22.0, engagementRate: 7.3, impressions: 45000, clicks: 1800 },
    { portal: "linkedin", period: "30d", postsSent: 15, leadsGenerated: 28, conversionRate: 8.4, costPerLead: 15.6, engagementRate: 5.5, impressions: 32000, clicks: 980 },
    { portal: "x_twitter", period: "30d", postsSent: 52, leadsGenerated: 18, conversionRate: 2.1, costPerLead: 25.3, engagementRate: 3.2, impressions: 67000, clicks: 1400 },
    { portal: "whatsapp", period: "30d", postsSent: 120, leadsGenerated: 89, conversionRate: 12.5, costPerLead: 3.2, engagementRate: 45.0, impressions: 0, clicks: 0 },
    { portal: "snapchat", period: "30d", postsSent: 12, leadsGenerated: 8, conversionRate: 2.8, costPerLead: 28.0, engagementRate: 11.2, impressions: 18000, clicks: 420 },
    { portal: "telegram", period: "30d", postsSent: 65, leadsGenerated: 34, conversionRate: 7.8, costPerLead: 4.5, engagementRate: 22.0, impressions: 0, clicks: 0 },
    { portal: "pinterest", period: "30d", postsSent: 18, leadsGenerated: 12, conversionRate: 3.2, costPerLead: 14.8, engagementRate: 4.6, impressions: 28000, clicks: 890 },
    { portal: "dubizzle", period: "30d", postsSent: 42, leadsGenerated: 56, conversionRate: 9.2, costPerLead: 8.5, engagementRate: 0, impressions: 78000, clicks: 3200 },
    { portal: "property_finder", period: "30d", postsSent: 42, leadsGenerated: 71, conversionRate: 11.3, costPerLead: 10.2, engagementRate: 0, impressions: 95000, clicks: 4100 },
    { portal: "bayut", period: "30d", postsSent: 42, leadsGenerated: 48, conversionRate: 7.5, costPerLead: 9.8, engagementRate: 0, impressions: 65000, clicks: 2600 },
];

// ─── Mock Portal Automation Settings ──────────────────────────────────────

const mockPortalSettings: PortalAutomationSettings[] = [
    { portal: "instagram", autoPublish: true, autoRepostInterval: 7, leadAssignmentRule: "round_robin", defaultTemplateId: "tpl-001", webhookUrl: null, webhookEnabled: false },
    { portal: "facebook", autoPublish: true, autoRepostInterval: 5, leadAssignmentRule: "round_robin", defaultTemplateId: "tpl-001", webhookUrl: null, webhookEnabled: false },
    { portal: "tiktok", autoPublish: false, autoRepostInterval: 0, leadAssignmentRule: "manual", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "youtube", autoPublish: false, autoRepostInterval: 0, leadAssignmentRule: "manual", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "linkedin", autoPublish: true, autoRepostInterval: 14, leadAssignmentRule: "auto_assign", defaultTemplateId: "tpl-001", webhookUrl: null, webhookEnabled: false },
    { portal: "x_twitter", autoPublish: true, autoRepostInterval: 3, leadAssignmentRule: "round_robin", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "snapchat", autoPublish: false, autoRepostInterval: 0, leadAssignmentRule: "manual", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "whatsapp", autoPublish: true, autoRepostInterval: 0, leadAssignmentRule: "auto_assign", defaultTemplateId: "tpl-003", webhookUrl: "https://api.example.com/whatsapp-hook", webhookEnabled: true },
    { portal: "telegram", autoPublish: true, autoRepostInterval: 0, leadAssignmentRule: "auto_assign", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "pinterest", autoPublish: false, autoRepostInterval: 0, leadAssignmentRule: "manual", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "dubizzle", autoPublish: true, autoRepostInterval: 7, leadAssignmentRule: "round_robin", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "property_finder", autoPublish: true, autoRepostInterval: 7, leadAssignmentRule: "round_robin", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
    { portal: "bayut", autoPublish: true, autoRepostInterval: 7, leadAssignmentRule: "round_robin", defaultTemplateId: null, webhookUrl: null, webhookEnabled: false },
];

// ─── Service ──────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const campaignService = {
    // Campaigns
    async getCampaigns(): Promise<Campaign[]> {
        await delay(80);
        return [...mockCampaigns];
    },

    async getCampaignsByStatus(status: CampaignStatus): Promise<Campaign[]> {
        await delay(50);
        return mockCampaigns.filter(c => c.status === status);
    },

    async getCampaignById(id: string): Promise<Campaign | null> {
        await delay(30);
        return mockCampaigns.find(c => c.id === id) || null;
    },

    getStatusCounts(): Record<CampaignStatus, number> {
        const counts: Record<CampaignStatus, number> = {
            draft: 0, scheduled: 0, publishing: 0, live: 0, failed: 0, archived: 0,
        };
        mockCampaigns.forEach(c => counts[c.status]++);
        return counts;
    },

    // Automation Rules
    async getAutomationRules(): Promise<AutomationRule[]> {
        await delay(60);
        return [...mockAutomationRules];
    },

    // Templates
    async getTemplates(): Promise<Template[]> {
        await delay(40);
        return [...mockTemplates];
    },

    // Engagement Stats
    async getEngagementStats(): Promise<EngagementStats[]> {
        await delay(60);
        return [...mockEngagementStats];
    },

    // Portal Automation Settings
    async getPortalSettings(): Promise<PortalAutomationSettings[]> {
        await delay(40);
        return [...mockPortalSettings];
    },

    // Aggregated stats
    async getOverviewStats() {
        await delay(40);
        const totalCampaigns = mockCampaigns.length;
        const liveCampaigns = mockCampaigns.filter(c => c.status === "live").length;
        const totalImpressions = mockEngagementStats.reduce((s, e) => s + e.impressions, 0);
        const totalLeads = mockEngagementStats.reduce((s, e) => s + e.leadsGenerated, 0);
        const totalPosts = mockEngagementStats.reduce((s, e) => s + e.postsSent, 0);
        const avgEngagement = mockEngagementStats.filter(e => e.engagementRate > 0).reduce((s, e) => s + e.engagementRate, 0) / mockEngagementStats.filter(e => e.engagementRate > 0).length;
        const avgCostPerLead = mockEngagementStats.reduce((s, e) => s + e.costPerLead, 0) / mockEngagementStats.length;
        const activeAutomations = mockAutomationRules.filter(r => r.enabled).length;

        return {
            totalCampaigns,
            liveCampaigns,
            totalImpressions,
            totalLeads,
            totalPosts,
            avgEngagement: Math.round(avgEngagement * 10) / 10,
            avgCostPerLead: Math.round(avgCostPerLead * 100) / 100,
            activeAutomations,
        };
    },
};
