import { PortalName } from "./types";

// ─── Campaign Types ───────────────────────────────────────────────────

export type CampaignStatus = "draft" | "scheduled" | "publishing" | "live" | "failed" | "archived";

export interface Campaign {
    id: string;
    title: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    portals: PortalName[];
    status: CampaignStatus;
    scheduledAt: string | null;
    publishedAt: string | null;
    caption: string;
    hashtags: string[];
    createdAt: string;
    updatedAt: string;
    stats: CampaignStats;
}

export interface CampaignStats {
    impressions: number;
    clicks: number;
    leads: number;
    engagement: number; // percentage
}

// ─── Campaign Posts ───────────────────────────────────────────────────

export type PostStatus = "pending" | "published" | "failed" | "paused";

export interface CampaignPost {
    id: string;
    campaignId: string;
    portal: PortalName;
    status: PostStatus;
    publishedAt: string | null;
    platformPostId: string | null;
    stats: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
        clicks: number;
    };
}

// ─── Scheduled Jobs ───────────────────────────────────────────────────

export type JobType = "publish" | "repost" | "unpublish" | "update";

export interface ScheduledJob {
    id: string;
    campaignId: string;
    type: JobType;
    scheduledAt: string;
    executedAt: string | null;
    status: "pending" | "running" | "completed" | "failed";
    retryCount: number;
}

// ─── Automation Rules ──────────────────────────────────────────────────

export type AutomationTrigger =
    | "new_property_created"
    | "price_updated"
    | "status_changed"
    | "open_house_scheduled";

export type AutomationAction =
    | "create_campaign"
    | "schedule_post"
    | "assign_lead"
    | "send_whatsapp"
    | "send_email"
    | "repost_every_x_days";

export interface AutomationRule {
    id: string;
    name: string;
    trigger: AutomationTrigger;
    triggerConfig: Record<string, string>;
    actions: AutomationActionItem[];
    enabled: boolean;
    portals: PortalName[];
    createdAt: string;
    lastTriggeredAt: string | null;
    triggerCount: number;
}

export interface AutomationActionItem {
    id: string;
    type: AutomationAction;
    config: Record<string, string | number | boolean>;
    order: number;
}

// ─── Templates ─────────────────────────────────────────────────────────

export interface Template {
    id: string;
    name: string;
    caption: string;
    hashtags: string[];
    portals: PortalName[];
    variables: string[]; // e.g. ["{{price}}", "{{location}}"]
    createdAt: string;
}

// ─── Engagement Stats ──────────────────────────────────────────────────

export interface EngagementStats {
    portal: PortalName;
    period: "7d" | "30d" | "90d";
    postsSent: number;
    leadsGenerated: number;
    conversionRate: number;
    costPerLead: number;
    engagementRate: number;
    impressions: number;
    clicks: number;
}

// ─── Portal Automation Settings ─────────────────────────────────────────

export interface PortalAutomationSettings {
    portal: PortalName;
    autoPublish: boolean;
    autoRepostInterval: number; // days, 0 = disabled
    leadAssignmentRule: "round_robin" | "manual" | "auto_assign";
    defaultTemplateId: string | null;
    webhookUrl: string | null;
    webhookEnabled: boolean;
}

// ─── View Types ────────────────────────────────────────────────────────

export type ViewMode = "board" | "calendar" | "list";

// ─── Kanban Column Definition ──────────────────────────────────────────

export interface KanbanColumn {
    id: CampaignStatus;
    title: string;
    color: string;
    bgColor: string;
    icon: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
    { id: "draft", title: "Draft", color: "text-slate-600", bgColor: "bg-slate-100", icon: "edit" },
    { id: "scheduled", title: "Scheduled", color: "text-amber-600", bgColor: "bg-amber-50", icon: "clock" },
    { id: "publishing", title: "Publishing", color: "text-blue-600", bgColor: "bg-blue-50", icon: "loader" },
    { id: "live", title: "Live", color: "text-green-600", bgColor: "bg-green-50", icon: "check" },
    { id: "failed", title: "Failed", color: "text-red-600", bgColor: "bg-red-50", icon: "alert" },
    { id: "archived", title: "Archived", color: "text-gray-400", bgColor: "bg-gray-50", icon: "archive" },
];

// ─── Trigger/Action Labels ─────────────────────────────────────────────

export const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
    new_property_created: "New Property Created",
    price_updated: "Price Updated",
    status_changed: "Status Changed",
    open_house_scheduled: "Open House Scheduled",
};

export const ACTION_LABELS: Record<AutomationAction, string> = {
    create_campaign: "Create Campaign",
    schedule_post: "Schedule Post",
    assign_lead: "Assign Lead",
    send_whatsapp: "Send WhatsApp",
    send_email: "Send Email",
    repost_every_x_days: "Repost Every X Days",
};
