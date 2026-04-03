import { Lead, LeadStatus, LeadSource, LeadPriority } from "@/lib/types";
import { prisma, PortalName as PrismaPortalName } from "@/server/db/prisma";
import { mockStorage } from "@/lib/db/mock-storage";

let prismaEnabled = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapStatusFromPrisma(status: string): LeadStatus {
    switch (status) {
        case "NEW":
            return "new";
        case "CONTACTED":
            return "contacted";
        case "QUALIFIED":
            return "qualified";
        case "NEGOTIATING":
            return "negotiating";
        case "WON":
            return "converted";
        case "LOST":
            return "lost";
        default:
            return "new";
    }
}

function mapStatusToPrisma(status: LeadStatus): "NEW" | "CONTACTED" | "QUALIFIED" | "NEGOTIATING" | "WON" | "LOST" {
    switch (status) {
        case "new":
            return "NEW";
        case "contacted":
            return "CONTACTED";
        case "qualified":
            return "QUALIFIED";
        case "negotiating":
            return "NEGOTIATING";
        case "converted":
            return "WON";
        case "lost":
            return "LOST";
        default:
            return "NEW";
    }
}

function mapSourceToPrisma(source: LeadSource): PrismaPortalName | null {
    switch (source) {
        case "bayut":
            return "BAYUT";
        case "property_finder":
            return "PROPERTY_FINDER";
        case "dubizzle":
            return "DUBIZZLE";
        default:
            return null;
    }
}

function mapSourceFromPrisma(source: PrismaPortalName | null, fallback?: LeadSource): LeadSource {
    if (source === "BAYUT") return "bayut";
    if (source === "PROPERTY_FINDER") return "property_finder";
    if (source === "DUBIZZLE") return "dubizzle";
    return fallback || "other";
}

function parseLeadPayload(message?: string | null): {
    notes: string;
    priority: LeadPriority;
    budget: { min: number; max: number };
    requirements: {
        type: Lead["requirements"]["type"];
        bedrooms: number[];
        areas: string[];
        listingType: Lead["requirements"]["listingType"];
    };
    sourceFallback?: LeadSource;
} {
    if (!message) {
        return {
            notes: "",
            priority: "medium",
            budget: { min: 0, max: 0 },
            requirements: { type: [], bedrooms: [], areas: [], listingType: "sale" },
        };
    }

    try {
        const parsed = JSON.parse(message);
        return {
            notes: parsed.notes || "",
            priority: parsed.priority || "medium",
            budget: {
                min: Number(parsed.budget?.min || 0),
                max: Number(parsed.budget?.max || 0),
            },
            requirements: {
                type: parsed.requirements?.type || [],
                bedrooms: parsed.requirements?.bedrooms || [],
                areas: parsed.requirements?.areas || [],
                listingType: parsed.requirements?.listingType || "sale",
            },
            sourceFallback: parsed.sourceFallback,
        };
    } catch {
        return {
            notes: message,
            priority: "medium",
            budget: { min: 0, max: 0 },
            requirements: { type: [], bedrooms: [], areas: [], listingType: "sale" },
        };
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

function toAppLead(prismaLead: any): Lead {
    const parsedPayload = parseLeadPayload(prismaLead.message);

    return {
        id: prismaLead.id,
        name: [prismaLead.firstName, prismaLead.lastName].filter(Boolean).join(" ").trim() || "Unnamed Lead",
        email: prismaLead.email || "",
        phone: prismaLead.phone || "",
        status: mapStatusFromPrisma(prismaLead.status),
        source: mapSourceFromPrisma(prismaLead.source, parsedPayload.sourceFallback),
        priority: parsedPayload.priority,
        budget: parsedPayload.budget,
        requirements: parsedPayload.requirements,
        notes: parsedPayload.notes,
        assignedTo: prismaLead.assignedTo
            ? {
                id: prismaLead.assignedTo.id,
                name: [prismaLead.assignedTo.firstName, prismaLead.assignedTo.lastName].filter(Boolean).join(" ").trim(),
            }
            : undefined,
        createdAt: prismaLead.createdAt.toISOString(),
        updatedAt: prismaLead.updatedAt.toISOString(),
    };
}

export const leadsService = {
    async getAll(teamId?: string): Promise<Lead[]> {
        if (!prismaEnabled) {
            await delay(100);
            return mockStorage.getCollection("leads");
        }

        try {
            const resolvedTeamId = teamId ? await resolveTeamId(teamId) : null;
            const rows = await prisma.lead.findMany({
                where: resolvedTeamId ? { teamId: resolvedTeamId } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });
            return rows.map(toAppLead);
        } catch {
            prismaEnabled = false;
            await delay(100);
            return mockStorage.getCollection("leads");
        }
    },

    async getById(id: string, teamId?: string): Promise<Lead | null> {
        if (!prismaEnabled) {
            await delay(50);
            const leads = mockStorage.getCollection("leads");
            return leads.find((l: Lead) => l.id === id) || null;
        }

        try {
            const row = await prisma.lead.findFirst({
                where: { id },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });

            return row ? toAppLead(row) : null;
        } catch {
            prismaEnabled = false;
            await delay(50);
            const leads = mockStorage.getCollection("leads");
            return leads.find((l: Lead) => l.id === id) || null;
        }
    },

    async getByStatus(status: LeadStatus): Promise<Lead[]> {
        if (!prismaEnabled) {
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.status === status);
        }

        try {
            const rows = await prisma.lead.findMany({
                where: { status: mapStatusToPrisma(status) },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });
            return rows.map(toAppLead);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.status === status);
        }
    },

    async getBySource(source: LeadSource): Promise<Lead[]> {
        if (!prismaEnabled) {
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.source === source);
        }

        try {
            const prismaSource = mapSourceToPrisma(source);
            const rows = await prisma.lead.findMany({
                where: { source: prismaSource },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });
            return rows.map(toAppLead);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.source === source);
        }
    },

    async getByPriority(priority: LeadPriority): Promise<Lead[]> {
        if (!prismaEnabled) {
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.priority === priority);
        }

        try {
            const rows = await prisma.lead.findMany({
                where: { message: { contains: `"priority":"${priority}"` } }, // Assuming priority is stored in message JSON
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });
            return rows.map(toAppLead).filter(l => l.priority === priority); // Filter again to be safe if JSON search is not exact
        } catch {
            prismaEnabled = false;
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.priority === priority);
        }
    },

    async getUnassigned(): Promise<Lead[]> {
        if (!prismaEnabled) {
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => !l.assignedTo);
        }

        try {
            const rows = await prisma.lead.findMany({
                where: { assignedToId: null },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });
            return rows.map(toAppLead);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => !l.assignedTo);
        }
    },

    async getByAgent(agentId: string): Promise<Lead[]> {
        if (!prismaEnabled) {
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.assignedTo?.id === agentId);
        }

        try {
            const rows = await prisma.lead.findMany({
                where: { assignedToId: agentId },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });
            return rows.map(toAppLead);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            return leads.filter((l: Lead) => l.assignedTo?.id === agentId);
        }
    },

    async create(lead: Omit<Lead, "id" | "createdAt" | "updatedAt">, options?: { teamId?: string; userId?: string }): Promise<Lead> {
        if (!prismaEnabled) {
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            const newLead: Lead = {
                ...lead,
                id: `lead-${String(leads.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockStorage.addToCollection("leads", newLead);
            return newLead;
        }

        try {
            const resolvedTeamId = await resolveTeamId(options?.teamId);
            if (!resolvedTeamId) {
                throw new Error("Unable to resolve team");
            }

            const [firstName, ...rest] = lead.name.trim().split(/\s+/);
            const lastName = rest.join(" ") || "Lead";

            const created = await prisma.lead.create({
                data: {
                    firstName: firstName || "Lead",
                    lastName,
                    email: lead.email || null,
                    phone: lead.phone || null,
                    status: mapStatusToPrisma(lead.status),
                    source: mapSourceToPrisma(lead.source),
                    message: JSON.stringify({
                        notes: lead.notes,
                        priority: lead.priority,
                        budget: lead.budget,
                        requirements: lead.requirements,
                        sourceFallback: lead.source,
                    }),
                    tags: [
                        `priority:${lead.priority}`,
                        `listingType:${lead.requirements.listingType}`,
                    ],
                    assignedToId: lead.assignedTo?.id || null,
                    teamId: resolvedTeamId,
                },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });

            return toAppLead(created);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const leads = mockStorage.getCollection("leads");
            const newLead: Lead = {
                ...lead,
                id: `lead-${String(leads.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockStorage.addToCollection("leads", newLead);
            return newLead;
        }
    },

    async update(id: string, updates: Partial<Lead>, teamId?: string): Promise<Lead | null> {
        if (!prismaEnabled) {
            await delay(100);
            const lead = await this.getById(id, teamId);
            if (!lead) return null;

            const updatedLead = {
                ...lead,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            mockStorage.updateInCollection("leads", id, updatedLead);
            return updatedLead;
        }

        try {
            const existing = await this.getById(id, teamId);
            if (!existing) return null;

            const merged: Lead = {
                ...existing,
                ...updates,
                budget: {
                    ...existing.budget,
                    ...(updates.budget || {}),
                },
                requirements: {
                    ...existing.requirements,
                    ...(updates.requirements || {}),
                },
            };

            const [firstName, ...rest] = merged.name.trim().split(/\s+/);
            const lastName = rest.join(" ") || "Lead";

            const updated = await prisma.lead.update({
                where: { id },
                data: {
                    firstName: firstName || "Lead",
                    lastName,
                    email: merged.email || null,
                    phone: merged.phone || null,
                    status: mapStatusToPrisma(merged.status),
                    source: mapSourceToPrisma(merged.source),
                    message: JSON.stringify({
                        notes: merged.notes,
                        priority: merged.priority,
                        budget: merged.budget,
                        requirements: merged.requirements,
                        sourceFallback: merged.source,
                    }),
                    tags: [
                        `priority:${merged.priority}`,
                        `listingType:${merged.requirements.listingType}`,
                    ],
                    assignedToId: merged.assignedTo?.id || null,
                },
                include: {
                    assignedTo: {
                        select: { id: true, firstName: true, lastName: true },
                    },
                },
            });

            return toAppLead(updated);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const lead = await this.getById(id, teamId);
            if (!lead) return null;

            const updatedLead = {
                ...lead,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            mockStorage.updateInCollection("leads", id, updatedLead);
            return updatedLead;
        }
    },

    async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
        return this.update(id, { status });
    },

    async assignTo(id: string, agent: { id: string; name: string }): Promise<Lead | null> {
        return this.update(id, { assignedTo: agent });
    },

    async delete(id: string, teamId?: string): Promise<boolean> {
        if (!prismaEnabled) {
            await delay(100);
            const lead = await this.getById(id, teamId);
            if (!lead) return false;
            mockStorage.removeFromCollection("leads", id);
            return true;
        }

        try {
            const deleted = await prisma.lead.deleteMany({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
            });
            return deleted.count > 0;
        } catch {
            prismaEnabled = false;
            await delay(100);
            const lead = await this.getById(id, teamId);
            if (!lead) return false;
            mockStorage.removeFromCollection("leads", id);
            return true;
        }
    },

    async search(query: string): Promise<Lead[]> {
        await delay(100);
        const lowerQuery = query.toLowerCase();
        const leads = mockStorage.getCollection("leads");
        return leads.filter((l: Lead) =>
            l.name.toLowerCase().includes(lowerQuery) ||
            l.email.toLowerCase().includes(lowerQuery) ||
            l.phone.includes(query)
        );
    },

    async getStats(teamId?: string): Promise<{
        total: number;
        new: number;
        contacted: number;
        qualified: number;
        converted: number;
        lost: number;
        unassigned: number;
    }> {
        const leads = await this.getAll(teamId);
        return {
            total: leads.length,
            new: leads.filter(l => l.status === "new").length,
            contacted: leads.filter(l => l.status === "contacted").length,
            qualified: leads.filter(l => l.status === "qualified").length,
            converted: leads.filter(l => l.status === "converted").length,
            lost: leads.filter(l => l.status === "lost").length,
            unassigned: leads.filter(l => !l.assignedTo).length,
        };
    },
};
