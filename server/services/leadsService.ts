import { Lead, LeadStatus, LeadSource, LeadPriority } from "@/lib/types";

// Empty data - starting fresh
const mockLeads: Lead[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const leadsService = {
    async getAll(): Promise<Lead[]> {
        await delay(100);
        return [...mockLeads];
    },

    async getById(id: string): Promise<Lead | null> {
        await delay(50);
        return mockLeads.find(l => l.id === id) || null;
    },

    async getByStatus(status: LeadStatus): Promise<Lead[]> {
        await delay(100);
        return mockLeads.filter(l => l.status === status);
    },

    async getBySource(source: LeadSource): Promise<Lead[]> {
        await delay(100);
        return mockLeads.filter(l => l.source === source);
    },

    async getByPriority(priority: LeadPriority): Promise<Lead[]> {
        await delay(100);
        return mockLeads.filter(l => l.priority === priority);
    },

    async getUnassigned(): Promise<Lead[]> {
        await delay(100);
        return mockLeads.filter(l => !l.assignedTo);
    },

    async getByAgent(agentId: string): Promise<Lead[]> {
        await delay(100);
        return mockLeads.filter(l => l.assignedTo?.id === agentId);
    },

    async create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">): Promise<Lead> {
        await delay(100);
        const newLead: Lead = {
            ...lead,
            id: `lead-${String(mockLeads.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockLeads.push(newLead);
        return newLead;
    },

    async update(id: string, updates: Partial<Lead>): Promise<Lead | null> {
        await delay(100);
        const index = mockLeads.findIndex(l => l.id === id);
        if (index === -1) return null;

        mockLeads[index] = {
            ...mockLeads[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return mockLeads[index];
    },

    async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
        return this.update(id, { status });
    },

    async assignTo(id: string, agent: { id: string; name: string }): Promise<Lead | null> {
        return this.update(id, { assignedTo: agent });
    },

    async delete(id: string): Promise<boolean> {
        await delay(100);
        const index = mockLeads.findIndex(l => l.id === id);
        if (index === -1) return false;

        mockLeads.splice(index, 1);
        return true;
    },

    async search(query: string): Promise<Lead[]> {
        await delay(100);
        const lowerQuery = query.toLowerCase();
        return mockLeads.filter(l =>
            l.name.toLowerCase().includes(lowerQuery) ||
            l.email.toLowerCase().includes(lowerQuery) ||
            l.phone.includes(query)
        );
    },

    async getStats(): Promise<{
        total: number;
        new: number;
        contacted: number;
        qualified: number;
        converted: number;
        lost: number;
        unassigned: number;
    }> {
        await delay(50);
        return {
            total: mockLeads.length,
            new: mockLeads.filter(l => l.status === "new").length,
            contacted: mockLeads.filter(l => l.status === "contacted").length,
            qualified: mockLeads.filter(l => l.status === "qualified").length,
            converted: mockLeads.filter(l => l.status === "converted").length,
            lost: mockLeads.filter(l => l.status === "lost").length,
            unassigned: mockLeads.filter(l => !l.assignedTo).length,
        };
    },
};
