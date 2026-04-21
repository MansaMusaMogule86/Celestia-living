"use client";

import React, { useState, useMemo } from "react";
import {
    useCampaigns,
    useAutomationRules,
    useAnalytics,
    useProperties,
    useCreateCampaign,
    usePortalIntegrations,
    useUpdatePortalIntegration,
    useSyncPortalIntegration,
} from "@/hooks/use-campaign-automation";
import {
    PortalName,
    CampaignStatus,
    AutomationTrigger,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Zap, Plus, CalendarDays, LayoutGrid, List, BarChart3, RefreshCw,
    Clock, CheckCircle, AlertCircle, Archive, Loader2, FileEdit,
    Copy, Pause, Play, MoreHorizontal, Eye, Users,
    TrendingUp, DollarSign, Send, Hash, Sparkles,
    ChevronRight, ChevronLeft, Building2, Share2, Workflow,
    Settings, Webhook, Mail, MessageSquare, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────

const PORTAL_DISPLAY_NAMES: Record<string, string> = {
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    PROPERTY_FINDER: "Property Finder",
    BAYUT: "Bayut",
    DUBIZZLE: "Dubizzle",
    TIKTOK: "TikTok",
    YOUTUBE: "YouTube",
    LINKEDIN: "LinkedIn",
    WHATSAPP: "WhatsApp",
    X_TWITTER: "X (Twitter)",
    SNAPCHAT: "Snapchat",
    TELEGRAM: "Telegram",
    PINTEREST: "Pinterest",
};

const TRIGGER_LABELS: Record<string, string> = {
    PROPERTY_CREATED: "New Property Created",
    PROPERTY_UPDATED: "Property Updated",
    PRICE_CHANGED: "Price Changed",
    STATUS_CHANGED: "Status Changed",
    OPEN_HOUSE_SCHEDULED: "Open House Scheduled",
    MANUAL: "Manual Trigger",
};

const ACTION_LABELS: Record<string, string> = {
    CREATE_CAMPAIGN: "Create Campaign",
    SEND_WHATSAPP: "Send WhatsApp",
    SEND_EMAIL: "Send Email",
    ASSIGN_LEAD: "Assign Lead",
    REPOST: "Identify & Repost",
};

const ALL_SUPPORTED_PORTALS = [
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
] as const;

type IntegrationStatus = "CONNECTED" | "DISCONNECTED";

interface IntegrationConfig {
    enabled: boolean;
    status: IntegrationStatus;
    autoPublish: boolean;
    importLeads: boolean;
    syncInterval: number;
    accountName: string;
    lastSyncAt: string | null;
}

interface CampaignPost {
    id: string;
    portal: string;
}

interface CampaignItem {
    id: string;
    title: string;
    status: string;
    scheduledAt?: string | null;
    property?: {
        title?: string;
        images?: string[];
    };
    posts?: CampaignPost[];
}

interface PropertyOption {
    id: string;
    title: string;
    price: number;
    images?: string[];
}

interface AutomationAction {
    type: string;
}

interface AutomationRuleItem {
    id: string;
    name: string;
    trigger: string;
    enabled: boolean;
    actions?: AutomationAction[];
}

interface AnalyticsOverview {
    liveCampaigns?: number;
    totalImpressions?: number;
    totalLeads?: number;
    avgEngagement?: number;
    avgCostPerLead?: number;
}

interface AnalyticsData {
    overview?: AnalyticsOverview;
}

const DEFAULT_INTEGRATIONS: Record<string, IntegrationConfig> = {
    INSTAGRAM: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 2, accountName: "", lastSyncAt: null },
    FACEBOOK: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 2, accountName: "", lastSyncAt: null },
    TIKTOK: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 4, accountName: "", lastSyncAt: null },
    YOUTUBE: { enabled: false, status: "DISCONNECTED", autoPublish: false, importLeads: true, syncInterval: 12, accountName: "", lastSyncAt: null },
    LINKEDIN: { enabled: false, status: "DISCONNECTED", autoPublish: false, importLeads: true, syncInterval: 6, accountName: "", lastSyncAt: null },
    X_TWITTER: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 2, accountName: "", lastSyncAt: null },
    SNAPCHAT: { enabled: false, status: "DISCONNECTED", autoPublish: false, importLeads: true, syncInterval: 4, accountName: "", lastSyncAt: null },
    WHATSAPP: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 1, accountName: "", lastSyncAt: null },
    TELEGRAM: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 1, accountName: "", lastSyncAt: null },
    PINTEREST: { enabled: false, status: "DISCONNECTED", autoPublish: false, importLeads: true, syncInterval: 12, accountName: "", lastSyncAt: null },
    DUBIZZLE: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 6, accountName: "", lastSyncAt: null },
    PROPERTY_FINDER: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 4, accountName: "", lastSyncAt: null },
    BAYUT: { enabled: false, status: "DISCONNECTED", autoPublish: true, importLeads: true, syncInterval: 6, accountName: "", lastSyncAt: null },
};

function getPortalDisplayName(portal: string): string {
    return PORTAL_DISPLAY_NAMES[portal.toUpperCase()] || portal;
}

// ─── Components ───────────────────────────────────────────────────────

function PortalDot({ portal }: { portal: string }) {
    const colors: Record<string, string> = {
        INSTAGRAM: "bg-gradient-to-br from-pink-500 to-orange-400",
        FACEBOOK: "bg-blue-600",
        PROPERTY_FINDER: "bg-blue-500",
        BAYUT: "bg-green-600",
        TIKTOK: "bg-black",
    };
    return (
        <div
            className={`w-5 h-5 rounded-full ${colors[portal.toUpperCase()] || "bg-gray-400"} flex items-center justify-center ring-2 ring-white`}
            title={getPortalDisplayName(portal)}
        >
            <span className="text-white text-[8px] font-bold">
                {getPortalDisplayName(portal).charAt(0)}
            </span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
        DRAFT: { color: "text-slate-600", bg: "bg-slate-100 border-slate-200", icon: <FileEdit className="h-3 w-3" /> },
        SCHEDULED: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock className="h-3 w-3" /> },
        PUBLISHING: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
        LIVE: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: <CheckCircle className="h-3 w-3" /> },
        FAILED: { color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <AlertCircle className="h-3 w-3" /> },
        ARCHIVED: { color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: <Archive className="h-3 w-3" /> },
    };
    const c = config[status.toUpperCase()] || config.DRAFT;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.color}`}>
            {c.icon}
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
    );
}

// ─── Main Views ───────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: CampaignItem }) {
    const primaryImage = campaign.property?.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80";

    return (
        <motion.div
            layout
            className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
            <div className="relative h-32">
                <img src={primaryImage} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 right-2"><StatusBadge status={campaign.status} /></div>
                <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-white text-sm font-semibold truncate">{campaign.title}</h4>
                    <p className="text-white/80 text-[10px] truncate">{campaign.property?.title}</p>
                </div>
            </div>
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                        {campaign.posts?.map((p) => (
                            <PortalDot key={p.id} portal={p.portal} />
                        ))}
                    </div>
                    {campaign.scheduledAt && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(campaign.scheduledAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 pt-1 border-t border-stone-100">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><FileEdit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                </div>
            </div>
        </motion.div>
    );
}

function BoardView({ campaigns }: { campaigns: CampaignItem[] }) {
    const columns = [
        { id: "DRAFT", title: "Drafts", color: "text-slate-500", bg: "bg-slate-50" },
        { id: "SCHEDULED", title: "Scheduled", color: "text-amber-600", bg: "bg-amber-50" },
        { id: "PUBLISHING", title: "Publishing", color: "text-blue-600", bg: "bg-blue-50" },
        { id: "LIVE", title: "Live", color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className="w-72 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-sm font-bold text-stone-700">{col.title}</h3>
                        <Badge variant="secondary" className="h-5 px-1.5">{campaigns.filter(c => c.status === col.id).length}</Badge>
                    </div>
                    <div className={`space-y-3 p-2 rounded-xl border border-dashed border-stone-200 min-h-[300px] ${col.bg}`}>
                        {campaigns.filter(c => c.status === col.id).map(c => (
                            <CampaignCard key={c.id} campaign={c} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Composer ─────────────────────────────────────────────────────────

function ContentComposer({ onComplete }: { onComplete: () => void }) {
    const { data: properties, isLoading: propsLoading } = useProperties("");
    const createMutation = useCreateCampaign();
    const propertyOptions = (properties as PropertyOption[] | undefined) || [];

    const [formData, setFormData] = useState({
        title: "",
        caption: "",
        propertyId: "",
        portals: [] as string[],
        scheduleType: "IMMEDIATE" as "IMMEDIATE" | "SCHEDULED" | "DRAFT",
        scheduledAt: null as string | null,
        hashtags: [] as string[],
        mediaUrls: [] as string[],
    });

    const handleSubmit = async () => {
        if (!formData.propertyId || !formData.title || formData.portals.length === 0) {
            alert("Please fill in required fields");
            return;
        }

        // Auto-fill media from property if empty
        const prop = propertyOptions.find((p) => p.id === formData.propertyId);
        const media = formData.mediaUrls.length > 0 ? formData.mediaUrls : prop?.images || [];

        await createMutation.mutateAsync({
            ...formData,
            mediaUrls: media,
        });

        onComplete();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Select Property</label>
                    <Select onValueChange={(v) => setFormData({ ...formData, propertyId: v })}>
                        <SelectTrigger><SelectValue placeholder="Search properties..." /></SelectTrigger>
                        <SelectContent>
                            {propertyOptions.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.title} - ${p.price}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Campaign Title</label>
                    <Input
                        placeholder="e.g. Luxury Palm Villa Launch"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Target Portals</label>
                <div className="flex flex-wrap gap-2">
                    {ALL_SUPPORTED_PORTALS.map(p => (
                        <Badge
                            key={p}
                            variant={formData.portals.includes(p) ? "default" : "outline"}
                            className="cursor-pointer py-1.5 px-3"
                            onClick={() => setFormData({
                                ...formData,
                                portals: formData.portals.includes(p)
                                    ? formData.portals.filter(x => x !== p)
                                    : [...formData.portals, p]
                            })}
                        >
                            {getPortalDisplayName(p)}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Caption</label>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1"><Sparkles className="h-3 w-3" /> AI Improve</Button>
                </div>
                <Textarea
                    placeholder="Write your story... Use {{price}} for dynamic mapping."
                    className="min-h-[120px] bg-stone-50"
                    value={formData.caption}
                    onChange={e => setFormData({ ...formData, caption: e.target.value })}
                />
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="flex items-center gap-4">
                    <Button
                        variant={formData.scheduleType === "IMMEDIATE" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, scheduleType: "IMMEDIATE" })}
                    >Now</Button>
                    <Button
                        variant={formData.scheduleType === "SCHEDULED" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, scheduleType: "SCHEDULED" })}
                    >Schedule</Button>
                </div>
                {formData.scheduleType === "SCHEDULED" && (
                    <Input
                        type="datetime-local"
                        className="w-40 h-8 text-xs"
                        onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                    />
                )}
            </div>

            <DialogFooter>
                <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-violet-600 hover:bg-violet-700">
                    {createMutation.isPending ? "Starting..." : "Launch Campaign"}
                </Button>
            </DialogFooter>
        </div>
    );
}

function IntegrationCard({
    portal,
    config,
    onToggleConnection,
    onToggleEnabled,
    onUpdate,
    onSync,
}: {
    portal: string;
    config: IntegrationConfig;
    onToggleConnection: (portal: string) => void;
    onToggleEnabled: (portal: string) => void;
    onUpdate: (portal: string, patch: Partial<IntegrationConfig>) => void;
    onSync: (portal: string) => void;
}) {
    const isConnected = config.status === "CONNECTED";

    return (
        <Card className="border-stone-200 shadow-sm">
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h4 className="font-semibold text-stone-900">{getPortalDisplayName(portal)}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            {config.accountName || "No ad account connected"}
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className={isConnected
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"}
                    >
                        {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-700">Enable integration</span>
                        <Switch
                            checked={config.enabled}
                            onCheckedChange={() => onToggleEnabled(portal)}
                            disabled={!isConnected}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-700">Auto publish</span>
                        <Switch
                            checked={config.autoPublish}
                            onCheckedChange={(checked) => onUpdate(portal, { autoPublish: checked })}
                            disabled={!config.enabled || !isConnected}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-700">Import leads</span>
                        <Switch
                            checked={config.importLeads}
                            onCheckedChange={(checked) => onUpdate(portal, { importLeads: checked })}
                            disabled={!config.enabled || !isConnected}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700">Sync interval (hours)</label>
                    <Select
                        value={String(config.syncInterval)}
                        onValueChange={(value) => onUpdate(portal, { syncInterval: Number(value) })}
                        disabled={!config.enabled || !isConnected}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 4, 6, 12, 24].map(hours => (
                                <SelectItem key={hours} value={String(hours)}>{hours}h</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                        Last sync: {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : "Never"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant={isConnected ? "outline" : "default"}
                        className="h-8"
                        onClick={() => onToggleConnection(portal)}
                    >
                        {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        disabled={!config.enabled || !isConnected}
                        onClick={() => onSync(portal)}
                    >
                        Sync now
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────

export default function CommandCenter() {
    const [activeTab, setActiveTab] = useState("campaigns");
    const [viewMode, setViewMode] = useState<"board" | "list" | "calendar">("board");
    const [showComposer, setShowComposer] = useState(false);
    const [search, setSearch] = useState("");

    const { data: campaignRes, isLoading: campaignsLoading } = useCampaigns({ search });
    const { data: rules, isLoading: rulesLoading } = useAutomationRules();
    const { data: analytics, isLoading: statsLoading } = useAnalytics("30d");
    const { data: integrationList } = usePortalIntegrations();
    const updateIntegrationMutation = useUpdatePortalIntegration();
    const syncIntegrationMutation = useSyncPortalIntegration();

    const campaigns = ((campaignRes as { campaigns?: CampaignItem[] } | undefined)?.campaigns) || [];
    const automationRules = (rules as AutomationRuleItem[] | undefined) || [];
    const analyticsData = (analytics as AnalyticsData | undefined);
    const integrationRecords = (integrationList as Array<IntegrationConfig & { portal: string }> | undefined) || [];
    const integrationByPortal = useMemo(() => {
        return integrationRecords.reduce<Record<string, IntegrationConfig>>((acc, integration) => {
            acc[integration.portal] = {
                enabled: integration.enabled,
                status: integration.status,
                autoPublish: integration.autoPublish,
                importLeads: integration.importLeads,
                syncInterval: integration.syncInterval,
                accountName: integration.accountName,
                lastSyncAt: integration.lastSyncAt,
            };
            return acc;
        }, {});
    }, [integrationRecords]);

    const connectedIntegrations = integrationRecords.filter((item) => item.status === "CONNECTED").length;
    const enabledIntegrations = integrationRecords.filter((item) => item.enabled).length;

    const getPortalConfig = (portal: string): IntegrationConfig => integrationByPortal[portal] || DEFAULT_INTEGRATIONS[portal];

    const updateIntegration = (portal: string, patch: Partial<IntegrationConfig>) => {
        void updateIntegrationMutation.mutateAsync({ portal, data: patch });
    };

    const toggleConnection = (portal: string) => {
        const current = getPortalConfig(portal);
        const isConnected = current.status === "CONNECTED";

        void updateIntegrationMutation.mutateAsync({
            portal,
            data: {
                status: isConnected ? "DISCONNECTED" : "CONNECTED",
                enabled: isConnected ? false : true,
                accountName: isConnected ? "" : `${getPortalDisplayName(portal)} Business Account`,
                lastSyncAt: isConnected ? null : new Date().toISOString(),
            },
        });
    };

    const toggleEnabled = (portal: string) => {
        const current = getPortalConfig(portal);
        void updateIntegrationMutation.mutateAsync({
            portal,
            data: { enabled: !current.enabled },
        });
    };

    const runSync = (portal: string) => {
        void syncIntegrationMutation.mutateAsync(portal);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        Multi-Channel Command Center
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Automate, schedule, and distribute property campaigns across all channels
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 h-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {analyticsData?.overview?.liveCampaigns ?? 0} Live
                    </Badge>
                    <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 h-8">
                        {automationRules.length} Automations
                    </Badge>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap bg-white rounded-xl border border-stone-200 p-2 shadow-sm">
                <Dialog open={showComposer} onOpenChange={setShowComposer}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 h-9">
                            <Plus className="h-4 w-4 mr-1.5" /> Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-violet-500" />
                                Multi-Platform Content Composer
                            </DialogTitle>
                        </DialogHeader>
                        <ContentComposer onComplete={() => setShowComposer(false)} />
                    </DialogContent>
                </Dialog>

                <div className="h-6 w-px bg-stone-200 mx-1" />

                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                        placeholder="Filter campaigns..."
                        className="pl-9 h-9 bg-stone-50 border-stone-200 focus:bg-white transition-all text-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="ml-auto flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                    <Button
                        variant={viewMode === "board" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setViewMode("board")}
                    ><LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Board</Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => setViewMode("list")}
                    ><List className="h-3.5 w-3.5 mr-1.5" /> List</Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-stone-100 p-1 mb-4">
                    <TabsTrigger value="campaigns" className="gap-2 text-xs">
                        <Share2 className="h-3.5 w-3.5" /> Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="automations" className="gap-2 text-xs">
                        <Workflow className="h-3.5 w-3.5" /> Automations
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2 text-xs">
                        <BarChart3 className="h-3.5 w-3.5" /> Analytics
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 text-xs">
                        <Settings className="h-3.5 w-3.5" /> Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="campaigns">
                    {campaignsLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm">Loading campaigns...</p>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl bg-stone-50/50">
                            <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                                <Archive className="h-6 w-6 text-stone-400" />
                            </div>
                            <p className="text-sm font-medium text-stone-600">No campaigns found</p>
                                <Button variant="link" onClick={() => setShowComposer(true)}>Launch your first campaign</Button>
                        </div>
                    ) : (
                        viewMode === "board" ? <BoardView campaigns={campaigns} /> : <div className="p-12 text-center text-muted-foreground">List and Calendar views coming soon...</div>
                    )}
                </TabsContent>

                <TabsContent value="automations">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {automationRules.map((rule) => (
                            <Card key={rule.id} className="border-stone-200 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <Switch checked={rule.enabled} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-900">{rule.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{TRIGGER_LABELS[rule.trigger]}</p>
                                    </div>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {rule.actions?.map((a, i: number) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] uppercase font-bold">
                                                {ACTION_LABELS[a.type] || a.type}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <Button variant="outline" className="border-dashed h-full min-h-[160px] flex flex-col gap-2 border-2 hover:bg-stone-50 border-stone-200">
                            <Plus className="h-6 w-6 text-stone-400" />
                            <span className="text-sm font-medium text-stone-500">Add Automation</span>
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Impressions</p>
                                <h2 className="text-3xl font-bold mt-1 text-indigo-600">{analyticsData?.overview?.totalImpressions?.toLocaleString() || 0}</h2>
                                <p className="text-xs text-emerald-600 font-medium mt-1">↑ 12% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Leads Generated</p>
                                <h2 className="text-3xl font-bold mt-1 text-emerald-600">{analyticsData?.overview?.totalLeads || 0}</h2>
                                <p className="text-xs text-emerald-600 font-medium mt-1">↑ 8% conversion rate</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Avg Engagement</p>
                                <h2 className="text-3xl font-bold mt-1">{analyticsData?.overview?.avgEngagement}%</h2>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Cost per Lead</p>
                                <h2 className="text-3xl font-bold mt-1">${analyticsData?.overview?.avgCostPerLead}</h2>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Supported Platforms</p>
                                <h2 className="text-3xl font-bold mt-1">{ALL_SUPPORTED_PORTALS.length}</h2>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Connected</p>
                                <h2 className="text-3xl font-bold mt-1 text-emerald-600">{connectedIntegrations}</h2>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-stone-500">Active Integrations</p>
                                <h2 className="text-3xl font-bold mt-1 text-violet-600">{enabledIntegrations}</h2>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {ALL_SUPPORTED_PORTALS.map((portal) => (
                            <IntegrationCard
                                key={portal}
                                portal={portal}
                                config={getPortalConfig(portal)}
                                onToggleConnection={toggleConnection}
                                onToggleEnabled={toggleEnabled}
                                onUpdate={updateIntegration}
                                onSync={runSync}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
