import { PortalImport, PortalName, PortalSyncStatus } from "@/lib/types";
import { prisma } from "@/server/db/prisma";

// Initial portal integrations - ready to configure
const mockPortals: PortalImport[] = [
    // Property Portals
    {
        id: "portal-001",
        portal: "dubizzle",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 6,
            importLeads: true,
        },
    },
    {
        id: "portal-002",
        portal: "property_finder",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 4,
            importLeads: true,
        },
    },
    {
        id: "portal-003",
        portal: "bayut",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 6,
            importLeads: true,
        },
    },
    // Social Media Platforms
    {
        id: "portal-004",
        portal: "instagram",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 2,
            importLeads: true,
        },
    },
    {
        id: "portal-005",
        portal: "facebook",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 2,
            importLeads: true,
        },
    },
    {
        id: "portal-006",
        portal: "tiktok",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 4,
            importLeads: true,
        },
    },
    {
        id: "portal-007",
        portal: "youtube",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 12,
            importLeads: true,
        },
    },
    {
        id: "portal-008",
        portal: "linkedin",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 6,
            importLeads: true,
        },
    },
    {
        id: "portal-009",
        portal: "x_twitter",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 2,
            importLeads: true,
        },
    },
    {
        id: "portal-010",
        portal: "snapchat",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 4,
            importLeads: true,
        },
    },
    {
        id: "portal-011",
        portal: "whatsapp",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 1,
            importLeads: true,
        },
    },
    {
        id: "portal-012",
        portal: "telegram",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 1,
            importLeads: true,
        },
    },
    {
        id: "portal-013",
        portal: "pinterest",
        status: "idle",
        lastSyncAt: "",
        propertiesSynced: 0,
        leadsImported: 0,
        settings: {
            autoSync: false,
            syncInterval: 12,
            importLeads: true,
        },
    },
];

// Sync logs for activity history
interface SyncLog {
    id: string;
    portalId: string;
    portal: PortalName;
    action: "sync_started" | "sync_completed" | "sync_failed" | "leads_imported";
    details: string;
    timestamp: string;
}

export type PortalIntegrationStatus = "CONNECTED" | "DISCONNECTED";

export interface PortalIntegration {
    portal: PortalName;
    status: PortalIntegrationStatus;
    enabled: boolean;
    autoPublish: boolean;
    importLeads: boolean;
    syncInterval: number;
    accountName: string;
    lastSyncAt: string | null;
    propertiesSynced: number;
    leadsImported: number;
}

const mockSyncLogs: SyncLog[] = [];
let prismaEnabled = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function toPrismaPortal(portal: PortalName): "INSTAGRAM" | "FACEBOOK" | "TIKTOK" | "YOUTUBE" | "LINKEDIN" | "X_TWITTER" | "SNAPCHAT" | "WHATSAPP" | "TELEGRAM" | "PINTEREST" | "DUBIZZLE" | "PROPERTY_FINDER" | "BAYUT" {
    switch (portal) {
        case "instagram": return "INSTAGRAM";
        case "facebook": return "FACEBOOK";
        case "tiktok": return "TIKTOK";
        case "youtube": return "YOUTUBE";
        case "linkedin": return "LINKEDIN";
        case "x_twitter": return "X_TWITTER";
        case "snapchat": return "SNAPCHAT";
        case "whatsapp": return "WHATSAPP";
        case "telegram": return "TELEGRAM";
        case "pinterest": return "PINTEREST";
        case "dubizzle": return "DUBIZZLE";
        case "property_finder": return "PROPERTY_FINDER";
        case "bayut": return "BAYUT";
        default: return "INSTAGRAM";
    }
}

function fromPrismaPortal(portal: string): PortalName {
    switch (portal) {
        case "INSTAGRAM": return "instagram";
        case "FACEBOOK": return "facebook";
        case "TIKTOK": return "tiktok";
        case "YOUTUBE": return "youtube";
        case "LINKEDIN": return "linkedin";
        case "X_TWITTER": return "x_twitter";
        case "SNAPCHAT": return "snapchat";
        case "WHATSAPP": return "whatsapp";
        case "TELEGRAM": return "telegram";
        case "PINTEREST": return "pinterest";
        case "DUBIZZLE": return "dubizzle";
        case "PROPERTY_FINDER": return "property_finder";
        case "BAYUT": return "bayut";
        default: return "instagram";
    }
}

async function resolveTeamId(teamId?: string): Promise<string | null> {
    try {
        if (teamId) {
            const existing = await prisma.team.findUnique({ where: { id: teamId } });
            if (existing) return existing.id;
        }

        const defaultTeam = await prisma.team.upsert({
            where: { slug: "default-team" },
            update: {},
            create: {
                name: "Default Team",
                slug: "default-team",
            },
        });

        return defaultTeam.id;
    } catch {
        return null;
    }
}

function mergeIntegrationWithState(
    portal: PortalName,
    persisted?: {
        status: string;
        autoPublish: boolean;
        accountName: string | null;
        autoRepostDays: number;
        leadAssignment: string;
    }
): PortalIntegration {
    const existing = integrationState.get(portal) || {
        status: "DISCONNECTED",
        enabled: false,
        autoPublish: false,
        importLeads: true,
        syncInterval: 6,
        accountName: "",
        lastSyncAt: null,
        propertiesSynced: 0,
        leadsImported: 0,
    };

    return {
        portal,
        status: persisted?.status === "CONNECTED" ? "CONNECTED" : "DISCONNECTED",
        enabled: persisted?.status === "CONNECTED" || existing.enabled,
        autoPublish: persisted?.autoPublish ?? existing.autoPublish,
        importLeads: persisted ? persisted.leadAssignment !== "MANUAL" : existing.importLeads,
        syncInterval: persisted?.autoRepostDays || existing.syncInterval,
        accountName: persisted?.accountName || existing.accountName,
        lastSyncAt: existing.lastSyncAt,
        propertiesSynced: existing.propertiesSynced,
        leadsImported: existing.leadsImported,
    };
}

// Categorization helpers
const PROPERTY_PORTALS: PortalName[] = ["dubizzle", "property_finder", "bayut"];
const SOCIAL_MEDIA_PORTALS: PortalName[] = [
    "instagram", "facebook", "tiktok", "youtube", "linkedin",
    "x_twitter", "snapchat", "whatsapp", "telegram", "pinterest",
];

const integrationState = new Map<PortalName, Omit<PortalIntegration, "portal">>(
    mockPortals.map((portal) => [
        portal.portal,
        {
            status: "DISCONNECTED",
            enabled: false,
            autoPublish: portal.settings.autoSync,
            importLeads: portal.settings.importLeads,
            syncInterval: portal.settings.syncInterval,
            accountName: "",
            lastSyncAt: portal.lastSyncAt || null,
            propertiesSynced: portal.propertiesSynced,
            leadsImported: portal.leadsImported,
        },
    ])
);

export const portalsService = {
    async getAll(): Promise<PortalImport[]> {
        await delay(100);
        return [...mockPortals];
    },

    async getPropertyPortals(): Promise<PortalImport[]> {
        await delay(100);
        return mockPortals.filter(p => PROPERTY_PORTALS.includes(p.portal));
    },

    async getSocialMediaPortals(): Promise<PortalImport[]> {
        await delay(100);
        return mockPortals.filter(p => SOCIAL_MEDIA_PORTALS.includes(p.portal));
    },

    async getById(id: string): Promise<PortalImport | null> {
        await delay(50);
        return mockPortals.find(p => p.id === id) || null;
    },

    async getByPortal(portal: PortalName): Promise<PortalImport | null> {
        await delay(50);
        return mockPortals.find(p => p.portal === portal) || null;
    },

    async getIntegrations(teamId?: string): Promise<PortalIntegration[]> {
        if (!prismaEnabled || !teamId) {
            await delay(100);
            return [...integrationState.entries()].map(([portal, config]) => ({
                portal,
                ...config,
            }));
        }

        try {
            const rows = await prisma.portalConnection.findMany({
                where: { teamId },
            });

            const persistedMap = new Map<PortalName, (typeof rows)[number]>(
                rows.map((row) => [fromPrismaPortal(row.portal), row])
            );

            return [...integrationState.keys()].map((portal) => {
                const merged = mergeIntegrationWithState(portal, persistedMap.get(portal));
                integrationState.set(portal, {
                    status: merged.status,
                    enabled: merged.enabled,
                    autoPublish: merged.autoPublish,
                    importLeads: merged.importLeads,
                    syncInterval: merged.syncInterval,
                    accountName: merged.accountName,
                    lastSyncAt: merged.lastSyncAt,
                    propertiesSynced: merged.propertiesSynced,
                    leadsImported: merged.leadsImported,
                });
                return merged;
            });
        } catch {
            prismaEnabled = false;
            await delay(100);
            return [...integrationState.entries()].map(([portal, config]) => ({
                portal,
                ...config,
            }));
        }
    },

    async getIntegration(portal: PortalName, teamId?: string): Promise<PortalIntegration | null> {
        const all = await this.getIntegrations(teamId);
        return all.find((item) => item.portal === portal) || null;
    },

    async updateIntegration(
        portal: PortalName,
        patch: Partial<Omit<PortalIntegration, "portal">>,
        teamId?: string
    ): Promise<PortalIntegration | null> {
        await delay(100);
        const existing = integrationState.get(portal);
        if (!existing) return null;

        const updated = {
            ...existing,
            ...patch,
        };

        integrationState.set(portal, updated);

        if (prismaEnabled && teamId) {
            try {
                const resolvedTeamId = await resolveTeamId(teamId);
                if (resolvedTeamId) {
                    await prisma.portalConnection.upsert({
                        where: {
                            teamId_portal: {
                                teamId: resolvedTeamId,
                                portal: toPrismaPortal(portal),
                            },
                        },
                        update: {
                            status: updated.status === "CONNECTED" ? "CONNECTED" : "DISCONNECTED",
                            autoPublish: updated.autoPublish,
                            autoRepostDays: updated.syncInterval,
                            accountName: updated.accountName || null,
                            leadAssignment: updated.importLeads ? "AUTO_ASSIGN" : "MANUAL",
                        },
                        create: {
                            teamId: resolvedTeamId,
                            portal: toPrismaPortal(portal),
                            status: updated.status === "CONNECTED" ? "CONNECTED" : "DISCONNECTED",
                            autoPublish: updated.autoPublish,
                            autoRepostDays: updated.syncInterval,
                            accountName: updated.accountName || null,
                            leadAssignment: updated.importLeads ? "AUTO_ASSIGN" : "MANUAL",
                        },
                    });
                }
            } catch {
                prismaEnabled = false;
            }
        }

        const portalImport = mockPortals.find((item) => item.portal === portal);
        if (portalImport) {
            portalImport.settings.autoSync = updated.autoPublish;
            portalImport.settings.importLeads = updated.importLeads;
            portalImport.settings.syncInterval = updated.syncInterval;
            portalImport.lastSyncAt = updated.lastSyncAt ?? "";
            portalImport.propertiesSynced = updated.propertiesSynced;
            portalImport.leadsImported = updated.leadsImported;
        }

        return { portal, ...updated };
    },

    async updateSettings(
        id: string,
        settings: Partial<PortalImport["settings"]>
    ): Promise<PortalImport | null> {
        await delay(100);
        const portal = mockPortals.find(p => p.id === id);
        if (!portal) return null;

        portal.settings = { ...portal.settings, ...settings };
        return portal;
    },

    async triggerSync(id: string): Promise<PortalImport | null> {
        await delay(500); // Simulate sync delay
        const portal = mockPortals.find(p => p.id === id);
        if (!portal) return null;

        // Simulate successful sync
        portal.status = "synced";
        portal.lastSyncAt = new Date().toISOString();
        portal.propertiesSynced += Math.floor(Math.random() * 3);
        portal.leadsImported += Math.floor(Math.random() * 5);
        delete portal.errorMessage;

        // Add sync log
        mockSyncLogs.unshift({
            id: `log-${Date.now()}`,
            portalId: id,
            portal: portal.portal,
            action: "sync_completed",
            details: `Successfully synced ${portal.propertiesSynced} properties`,
            timestamp: new Date().toISOString(),
        });

        return portal;
    },

    async triggerIntegrationSync(portal: PortalName, teamId?: string): Promise<PortalIntegration | null> {
        await delay(350);
        const portalImport = mockPortals.find((item) => item.portal === portal);
        if (!portalImport) return null;

        const synced = await this.triggerSync(portalImport.id);
        if (!synced) return null;

        const existing = integrationState.get(portal);
        if (!existing) return null;

        const updated = {
            ...existing,
            lastSyncAt: synced.lastSyncAt || new Date().toISOString(),
            propertiesSynced: synced.propertiesSynced,
            leadsImported: synced.leadsImported,
        };

        integrationState.set(portal, updated);

        const persisted = await this.updateIntegration(portal, {
            lastSyncAt: updated.lastSyncAt,
            propertiesSynced: updated.propertiesSynced,
            leadsImported: updated.leadsImported,
        }, teamId);

        return persisted || { portal, ...updated };
    },

    async getSyncLogs(portalId?: string): Promise<SyncLog[]> {
        await delay(100);
        if (portalId) {
            return mockSyncLogs.filter(l => l.portalId === portalId);
        }
        return [...mockSyncLogs];
    },

    async getStats(): Promise<{
        totalPropertiesSynced: number;
        totalLeadsImported: number;
        activePortals: number;
        portalsWithErrors: number;
    }> {
        await delay(50);
        return {
            totalPropertiesSynced: mockPortals.reduce((sum, p) => sum + p.propertiesSynced, 0),
            totalLeadsImported: mockPortals.reduce((sum, p) => sum + p.leadsImported, 0),
            activePortals: mockPortals.filter(p => p.status === "synced").length,
            portalsWithErrors: mockPortals.filter(p => p.status === "error").length,
        };
    },

    isPropertyPortal(portal: PortalName): boolean {
        return PROPERTY_PORTALS.includes(portal);
    },

    isSocialMediaPortal(portal: PortalName): boolean {
        return SOCIAL_MEDIA_PORTALS.includes(portal);
    },

    getPortalDisplayName(portal: PortalName): string {
        const names: Record<PortalName, string> = {
            dubizzle: "Dubizzle",
            property_finder: "Property Finder",
            bayut: "Bayut",
            instagram: "Instagram",
            facebook: "Facebook",
            tiktok: "TikTok",
            youtube: "YouTube",
            linkedin: "LinkedIn",
            x_twitter: "X (Twitter)",
            snapchat: "Snapchat",
            whatsapp: "WhatsApp",
            telegram: "Telegram",
            pinterest: "Pinterest",
        };
        return names[portal];
    },

    getPortalDescription(portal: PortalName): string {
        const descriptions: Record<PortalName, string> = {
            dubizzle: "UAE's leading classifieds platform",
            property_finder: "Premium property marketplace",
            bayut: "Region's largest property portal",
            instagram: "Visual content & stories marketing",
            facebook: "Social ads & marketplace listings",
            tiktok: "Short-form video marketing",
            youtube: "Video tours & channel marketing",
            linkedin: "Professional network & B2B leads",
            x_twitter: "Real-time updates & engagement",
            snapchat: "Ephemeral content & AR experiences",
            whatsapp: "Direct messaging & business API",
            telegram: "Channel broadcasts & bots",
            pinterest: "Visual discovery & inspiration boards",
        };
        return descriptions[portal];
    },

    getPortalColor(portal: PortalName): { gradient: string; text: string; bg: string; ring: string } {
        const colors: Record<PortalName, { gradient: string; text: string; bg: string; ring: string }> = {
            dubizzle: { gradient: "from-red-500 to-red-600", text: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
            property_finder: { gradient: "from-blue-500 to-blue-600", text: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200" },
            bayut: { gradient: "from-green-500 to-green-600", text: "text-green-600", bg: "bg-green-50", ring: "ring-green-200" },
            instagram: { gradient: "from-pink-500 via-purple-500 to-orange-400", text: "text-pink-600", bg: "bg-pink-50", ring: "ring-pink-200" },
            facebook: { gradient: "from-blue-600 to-blue-700", text: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-200" },
            tiktok: { gradient: "from-gray-900 via-gray-800 to-gray-900", text: "text-gray-900", bg: "bg-gray-50", ring: "ring-gray-300" },
            youtube: { gradient: "from-red-600 to-red-700", text: "text-red-600", bg: "bg-red-50", ring: "ring-red-200" },
            linkedin: { gradient: "from-blue-700 to-blue-800", text: "text-blue-800", bg: "bg-blue-50", ring: "ring-blue-200" },
            x_twitter: { gradient: "from-gray-800 to-black", text: "text-gray-900", bg: "bg-gray-50", ring: "ring-gray-300" },
            snapchat: { gradient: "from-yellow-400 to-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50", ring: "ring-yellow-200" },
            whatsapp: { gradient: "from-green-500 to-green-600", text: "text-green-600", bg: "bg-green-50", ring: "ring-green-200" },
            telegram: { gradient: "from-sky-400 to-sky-500", text: "text-sky-600", bg: "bg-sky-50", ring: "ring-sky-200" },
            pinterest: { gradient: "from-red-600 to-red-700", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" },
        };
        return colors[portal];
    },
};
