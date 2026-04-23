import { clientsService } from "@/server/services/clientsService";
import { dealsService } from "@/server/services/dealsService";
import { leadsService } from "@/server/services/leadsService";
import { propertiesService } from "@/server/services/propertiesService";
import { transactionsService } from "@/server/services/transactionsService";
import { portalsService } from "@/server/services/portalsService";

export interface ActivityEntry {
    id: string;
    action: string;
    entityType: "property" | "lead" | "client" | "deal" | "transaction" | "portal" | "settings";
    entityId: string;
    entityName: string;
    userId: string;
    userName: string;
    metadata?: Record<string, string>;
    createdAt: string;
}

const DEFAULT_USER = {
    userId: "system-admin",
    userName: "Admin User",
};

function mapPortalLabel(portal: string) {
    return portal
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export const activityService = {
    async getAll(limit?: number): Promise<ActivityEntry[]> {
        const [properties, leads, clients, deals, transactions, integrations] = await Promise.all([
            propertiesService.getAll(),
            leadsService.getAll(),
            clientsService.getAll(),
            dealsService.getAll(),
            transactionsService.getAll(),
            portalsService.getIntegrations(),
        ]);

        const events: ActivityEntry[] = [
            ...properties.map((item) => ({
                id: `act-property-${item.id}`,
                action: "created property",
                entityType: "property" as const,
                entityId: item.id,
                entityName: item.title,
                metadata: {
                    status: item.status,
                    listingType: item.listingType,
                },
                createdAt: item.createdAt,
                ...DEFAULT_USER,
            })),
            ...leads.map((item) => ({
                id: `act-lead-${item.id}`,
                action: "added lead",
                entityType: "lead" as const,
                entityId: item.id,
                entityName: item.name,
                metadata: {
                    source: item.source,
                    status: item.status,
                },
                createdAt: item.createdAt,
                ...DEFAULT_USER,
            })),
            ...clients.map((item) => ({
                id: `act-client-${item.id}`,
                action: "created client",
                entityType: "client" as const,
                entityId: item.id,
                entityName: item.name,
                metadata: {
                    type: item.type.join(", "),
                },
                createdAt: item.createdAt,
                ...DEFAULT_USER,
            })),
            ...deals.map((item) => ({
                id: `act-deal-${item.id}`,
                action: "opened deal",
                entityType: "deal" as const,
                entityId: item.id,
                entityName: item.title,
                metadata: {
                    stage: item.stage,
                    value: String(item.value),
                },
                createdAt: item.createdAt,
                ...DEFAULT_USER,
            })),
            ...transactions.map((item) => ({
                id: `act-transaction-${item.id}`,
                action: item.status === "completed" ? "completed transaction" : "recorded transaction",
                entityType: "transaction" as const,
                entityId: item.id,
                entityName: item.reference || item.id,
                metadata: {
                    type: item.type,
                    amount: String(item.amount),
                    status: item.status,
                },
                createdAt: item.completedAt || item.createdAt,
                ...DEFAULT_USER,
            })),
            ...integrations
                .filter((integration) => integration.lastSyncAt)
                .map((integration) => ({
                    id: `act-portal-${integration.portal}`,
                    action: "synced portal",
                    entityType: "portal" as const,
                    entityId: integration.portal,
                    entityName: mapPortalLabel(integration.portal),
                    metadata: {
                        status: integration.status,
                        autoPublish: integration.autoPublish ? "on" : "off",
                        importLeads: integration.importLeads ? "on" : "off",
                    },
                    createdAt: integration.lastSyncAt as string,
                    ...DEFAULT_USER,
                })),
        ];

        const sorted = events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return typeof limit === "number" && limit > 0 ? sorted.slice(0, limit) : sorted;
    },
};
