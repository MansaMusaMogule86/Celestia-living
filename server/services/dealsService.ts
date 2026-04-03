import { Deal, DealStage, DealType, DealActivity } from "@/lib/types";
import { prisma } from "@/server/db/prisma";

// Empty data - starting fresh
const mockDeals: Deal[] = [];
let prismaEnabled = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Deal stage order for pipeline
const stageOrder: DealStage[] = ["inquiry", "viewing", "offer", "negotiation", "agreement", "closed", "cancelled"];

function mapDealTypeFromPrisma(type: string): DealType {
    return type === "RENTAL" ? "rental" : "sale";
}

function mapDealTypeToPrisma(type: DealType): "SALE" | "RENTAL" {
    return type === "rental" ? "RENTAL" : "SALE";
}

function mapDealStageFromPrisma(stage: string): DealStage {
    switch (stage) {
        case "INQUIRY":
            return "inquiry";
        case "VIEWING":
            return "viewing";
        case "OFFER":
            return "offer";
        case "NEGOTIATION":
            return "negotiation";
        case "AGREEMENT":
            return "agreement";
        case "CLOSED":
            return "closed";
        case "CANCELLED":
            return "cancelled";
        default:
            return "inquiry";
    }
}

function mapDealStageToPrisma(stage: DealStage): "INQUIRY" | "VIEWING" | "OFFER" | "NEGOTIATION" | "AGREEMENT" | "CLOSED" | "CANCELLED" {
    switch (stage) {
        case "inquiry":
            return "INQUIRY";
        case "viewing":
            return "VIEWING";
        case "offer":
            return "OFFER";
        case "negotiation":
            return "NEGOTIATION";
        case "agreement":
            return "AGREEMENT";
        case "closed":
            return "CLOSED";
        case "cancelled":
            return "CANCELLED";
        default:
            return "INQUIRY";
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

function toAppDeal(prismaDeal: any): Deal {
    return {
        id: prismaDeal.id,
        title: prismaDeal.title,
        type: mapDealTypeFromPrisma(prismaDeal.type),
        stage: mapDealStageFromPrisma(prismaDeal.stage),
        property: {
            id: prismaDeal.property.id,
            title: prismaDeal.property.title,
        },
        client: {
            id: prismaDeal.client.id,
            name: [prismaDeal.client.firstName, prismaDeal.client.lastName].filter(Boolean).join(" ").trim(),
        },
        value: Number(prismaDeal.value || 0),
        commission: Number(prismaDeal.commission || 0),
        agent: {
            id: prismaDeal.agent.id,
            name: [prismaDeal.agent.firstName, prismaDeal.agent.lastName].filter(Boolean).join(" ").trim(),
        },
        expectedCloseDate: prismaDeal.expectedCloseDate
            ? prismaDeal.expectedCloseDate.toISOString().split("T")[0]
            : "",
        actualCloseDate: prismaDeal.actualCloseDate
            ? prismaDeal.actualCloseDate.toISOString().split("T")[0]
            : undefined,
        notes: prismaDeal.notes || "",
        activities: (prismaDeal.activities || []).map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            description: activity.description,
            createdAt: activity.createdAt.toISOString(),
            createdBy: {
                id: activity.createdBy.id,
                name: [activity.createdBy.firstName, activity.createdBy.lastName].filter(Boolean).join(" ").trim(),
            },
        })),
        createdAt: prismaDeal.createdAt.toISOString(),
        updatedAt: prismaDeal.updatedAt.toISOString(),
    };
}

export const dealsService = {
    async getAll(teamId?: string): Promise<Deal[]> {
        if (!prismaEnabled) {
            await delay(100);
            return [...mockDeals];
        }

        try {
            const resolvedTeamId = teamId ? await resolveTeamId(teamId) : null;
            const rows = await prisma.deal.findMany({
                where: resolvedTeamId ? { teamId: resolvedTeamId } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    property: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                    agent: { select: { id: true, firstName: true, lastName: true } },
                    activities: {
                        include: {
                            createdBy: { select: { id: true, firstName: true, lastName: true } },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

            return rows.map(toAppDeal);
        } catch {
            prismaEnabled = false;
            await delay(100);
            return [...mockDeals];
        }
    },

    async getById(id: string, teamId?: string): Promise<Deal | null> {
        if (!prismaEnabled) {
            await delay(50);
            return mockDeals.find(d => d.id === id) || null;
        }

        try {
            const row = await prisma.deal.findFirst({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
                include: {
                    property: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                    agent: { select: { id: true, firstName: true, lastName: true } },
                    activities: {
                        include: {
                            createdBy: { select: { id: true, firstName: true, lastName: true } },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

            return row ? toAppDeal(row) : null;
        } catch {
            prismaEnabled = false;
            await delay(50);
            return mockDeals.find(d => d.id === id) || null;
        }
    },

    async getByStage(stage: DealStage): Promise<Deal[]> {
        await delay(100);
        return mockDeals.filter(d => d.stage === stage);
    },

    async getByType(type: DealType): Promise<Deal[]> {
        await delay(100);
        return mockDeals.filter(d => d.type === type);
    },

    async getByAgent(agentId: string): Promise<Deal[]> {
        await delay(100);
        return mockDeals.filter(d => d.agent.id === agentId);
    },

    async getByClient(clientId: string): Promise<Deal[]> {
        await delay(100);
        return mockDeals.filter(d => d.client.id === clientId);
    },

    async getPipeline(teamId?: string): Promise<Record<DealStage, Deal[]>> {
        const deals = await this.getAll(teamId);
        const pipeline: Record<DealStage, Deal[]> = {
            inquiry: [],
            viewing: [],
            offer: [],
            negotiation: [],
            agreement: [],
            closed: [],
            cancelled: [],
        };

        deals.forEach(deal => {
            pipeline[deal.stage].push(deal);
        });

        return pipeline;
    },

    async create(
        deal: Omit<Deal, "id" | "activities" | "createdAt" | "updatedAt">,
        options?: { teamId?: string; userId?: string }
    ): Promise<Deal> {
        if (!prismaEnabled) {
            await delay(100);
            const newDeal: Deal = {
                ...deal,
                id: `deal-${String(mockDeals.length + 1).padStart(3, "0")}`,
                activities: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockDeals.push(newDeal);
            return newDeal;
        }

        try {
            const resolvedTeamId = await resolveTeamId(options?.teamId);
            if (!resolvedTeamId) {
                throw new Error("Unable to resolve team");
            }

            const created = await prisma.deal.create({
                data: {
                    title: deal.title,
                    type: mapDealTypeToPrisma(deal.type),
                    stage: mapDealStageToPrisma(deal.stage),
                    value: deal.value,
                    commission: deal.commission,
                    expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null,
                    actualCloseDate: deal.actualCloseDate ? new Date(deal.actualCloseDate) : null,
                    notes: deal.notes || null,
                    propertyId: deal.property.id,
                    clientId: deal.client.id,
                    agentId: deal.agent.id,
                    teamId: resolvedTeamId,
                },
                include: {
                    property: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                    agent: { select: { id: true, firstName: true, lastName: true } },
                    activities: {
                        include: {
                            createdBy: { select: { id: true, firstName: true, lastName: true } },
                        },
                    },
                },
            });

            return toAppDeal(created);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const newDeal: Deal = {
                ...deal,
                id: `deal-${String(mockDeals.length + 1).padStart(3, "0")}`,
                activities: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockDeals.push(newDeal);
            return newDeal;
        }
    },

    async update(id: string, updates: Partial<Deal>, teamId?: string): Promise<Deal | null> {
        if (!prismaEnabled) {
            await delay(100);
            const index = mockDeals.findIndex(d => d.id === id);
            if (index === -1) return null;

            mockDeals[index] = {
                ...mockDeals[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return mockDeals[index];
        }

        try {
            const existing = await this.getById(id, teamId);
            if (!existing) return null;

            const merged: Deal = {
                ...existing,
                ...updates,
                property: {
                    ...existing.property,
                    ...(updates.property || {}),
                },
                client: {
                    ...existing.client,
                    ...(updates.client || {}),
                },
                agent: {
                    ...existing.agent,
                    ...(updates.agent || {}),
                },
            };

            const updated = await prisma.deal.update({
                where: { id },
                data: {
                    title: merged.title,
                    type: mapDealTypeToPrisma(merged.type),
                    stage: mapDealStageToPrisma(merged.stage),
                    value: merged.value,
                    commission: merged.commission,
                    expectedCloseDate: merged.expectedCloseDate ? new Date(merged.expectedCloseDate) : null,
                    actualCloseDate: merged.actualCloseDate ? new Date(merged.actualCloseDate) : null,
                    notes: merged.notes || null,
                    propertyId: merged.property.id,
                    clientId: merged.client.id,
                    agentId: merged.agent.id,
                },
                include: {
                    property: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                    agent: { select: { id: true, firstName: true, lastName: true } },
                    activities: {
                        include: {
                            createdBy: { select: { id: true, firstName: true, lastName: true } },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                },
            });

            return toAppDeal(updated);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const index = mockDeals.findIndex(d => d.id === id);
            if (index === -1) return null;

            mockDeals[index] = {
                ...mockDeals[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return mockDeals[index];
        }
    },

    async updateStage(id: string, stage: DealStage): Promise<Deal | null> {
        const updates: Partial<Deal> = { stage };
        if (stage === "closed") {
            updates.actualCloseDate = new Date().toISOString().split("T")[0];
        }
        return this.update(id, updates);
    },

    async addActivity(
        dealId: string,
        activity: Omit<DealActivity, "id" | "createdAt">
    ): Promise<Deal | null> {
        const deal = mockDeals.find(d => d.id === dealId);
        if (!deal) return null;

        const newActivity: DealActivity = {
            ...activity,
            id: `act-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        deal.activities.push(newActivity);
        deal.updatedAt = new Date().toISOString();
        return deal;
    },

    async delete(id: string, teamId?: string): Promise<boolean> {
        if (!prismaEnabled) {
            await delay(100);
            const index = mockDeals.findIndex(d => d.id === id);
            if (index === -1) return false;

            mockDeals.splice(index, 1);
            return true;
        }

        try {
            const deleted = await prisma.deal.deleteMany({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
            });
            return deleted.count > 0;
        } catch {
            prismaEnabled = false;
            await delay(100);
            const index = mockDeals.findIndex(d => d.id === id);
            if (index === -1) return false;

            mockDeals.splice(index, 1);
            return true;
        }
    },

    async getStats(teamId?: string): Promise<{
        total: number;
        totalValue: number;
        totalCommission: number;
        byStage: Record<DealStage, number>;
        closedThisMonth: number;
    }> {
        const deals = await this.getAll(teamId);
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const byStage = stageOrder.reduce((acc, stage) => {
            acc[stage] = deals.filter(d => d.stage === stage).length;
            return acc;
        }, {} as Record<DealStage, number>);

        return {
            total: deals.length,
            totalValue: deals.reduce((sum, d) => sum + d.value, 0),
            totalCommission: deals.reduce((sum, d) => sum + d.commission, 0),
            byStage,
            closedThisMonth: deals.filter(d =>
                d.stage === "closed" && d.actualCloseDate?.startsWith(thisMonth)
            ).length,
        };
    },

    getStageOrder(): DealStage[] {
        return [...stageOrder];
    },
};
