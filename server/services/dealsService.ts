import { Deal, DealStage, DealType, DealActivity } from "@/lib/types";

// Empty data - starting fresh
const mockDeals: Deal[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Deal stage order for pipeline
const stageOrder: DealStage[] = ["inquiry", "viewing", "offer", "negotiation", "agreement", "closed", "cancelled"];

export const dealsService = {
    async getAll(): Promise<Deal[]> {
        await delay(100);
        return [...mockDeals];
    },

    async getById(id: string): Promise<Deal | null> {
        await delay(50);
        return mockDeals.find(d => d.id === id) || null;
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

    async getPipeline(): Promise<Record<DealStage, Deal[]>> {
        await delay(100);
        const pipeline: Record<DealStage, Deal[]> = {
            inquiry: [],
            viewing: [],
            offer: [],
            negotiation: [],
            agreement: [],
            closed: [],
            cancelled: [],
        };

        mockDeals.forEach(deal => {
            pipeline[deal.stage].push(deal);
        });

        return pipeline;
    },

    async create(deal: Omit<Deal, "id" | "activities" | "createdAt" | "updatedAt">): Promise<Deal> {
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
    },

    async update(id: string, updates: Partial<Deal>): Promise<Deal | null> {
        await delay(100);
        const index = mockDeals.findIndex(d => d.id === id);
        if (index === -1) return null;

        mockDeals[index] = {
            ...mockDeals[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return mockDeals[index];
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

    async delete(id: string): Promise<boolean> {
        await delay(100);
        const index = mockDeals.findIndex(d => d.id === id);
        if (index === -1) return false;

        mockDeals.splice(index, 1);
        return true;
    },

    async getStats(): Promise<{
        total: number;
        totalValue: number;
        totalCommission: number;
        byStage: Record<DealStage, number>;
        closedThisMonth: number;
    }> {
        await delay(50);
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const byStage = stageOrder.reduce((acc, stage) => {
            acc[stage] = mockDeals.filter(d => d.stage === stage).length;
            return acc;
        }, {} as Record<DealStage, number>);

        return {
            total: mockDeals.length,
            totalValue: mockDeals.reduce((sum, d) => sum + d.value, 0),
            totalCommission: mockDeals.reduce((sum, d) => sum + d.commission, 0),
            byStage,
            closedThisMonth: mockDeals.filter(d =>
                d.stage === "closed" && d.actualCloseDate?.startsWith(thisMonth)
            ).length,
        };
    },

    getStageOrder(): DealStage[] {
        return [...stageOrder];
    },
};
