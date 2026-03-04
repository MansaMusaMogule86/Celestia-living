import { Client, ClientType } from "@/lib/types";
import { prisma } from "@/server/db/prisma";

// Empty data - starting fresh
const mockClients: Client[] = [];
let prismaEnabled = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapClientTypeToPrisma(type: ClientType): "BUYER" | "SELLER" | "TENANT" | "LANDLORD" {
    switch (type) {
        case "buyer":
            return "BUYER";
        case "seller":
            return "SELLER";
        case "tenant":
            return "TENANT";
        case "landlord":
            return "LANDLORD";
        default:
            return "BUYER";
    }
}

function mapClientTypeFromPrisma(type: string): ClientType {
    switch (type) {
        case "BUYER":
            return "buyer";
        case "SELLER":
            return "seller";
        case "TENANT":
            return "tenant";
        case "LANDLORD":
            return "landlord";
        default:
            return "buyer";
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

function toAppClient(prismaClient: any): Client {
    return {
        id: prismaClient.id,
        name: [prismaClient.firstName, prismaClient.lastName].filter(Boolean).join(" ").trim() || "Unnamed Client",
        email: prismaClient.email || "",
        phone: prismaClient.phone || "",
        type: (prismaClient.type || []).map(mapClientTypeFromPrisma),
        nationality: prismaClient.nationality || "",
        documents: [],
        properties: [],
        deals: prismaClient.deals?.map((deal: { id: string }) => deal.id) || [],
        notes: prismaClient.notes || "",
        createdAt: prismaClient.createdAt.toISOString(),
        updatedAt: prismaClient.updatedAt.toISOString(),
    };
}

export const clientsService = {
    async getAll(teamId?: string): Promise<Client[]> {
        if (!prismaEnabled) {
            await delay(100);
            return [...mockClients];
        }

        try {
            const rows = await prisma.client.findMany({
                where: teamId ? { teamId } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    deals: {
                        select: { id: true },
                    },
                },
            });
            return rows.map(toAppClient);
        } catch {
            prismaEnabled = false;
            await delay(100);
            return [...mockClients];
        }
    },

    async getById(id: string, teamId?: string): Promise<Client | null> {
        if (!prismaEnabled) {
            await delay(50);
            return mockClients.find(c => c.id === id) || null;
        }

        try {
            const row = await prisma.client.findFirst({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
                include: {
                    deals: {
                        select: { id: true },
                    },
                },
            });
            return row ? toAppClient(row) : null;
        } catch {
            prismaEnabled = false;
            await delay(50);
            return mockClients.find(c => c.id === id) || null;
        }
    },

    async getByType(type: ClientType): Promise<Client[]> {
        await delay(100);
        return mockClients.filter(c => c.type.includes(type));
    },

    async getByNationality(nationality: string): Promise<Client[]> {
        await delay(100);
        return mockClients.filter(c =>
            c.nationality.toLowerCase() === nationality.toLowerCase()
        );
    },

    async create(client: Omit<Client, "id" | "createdAt" | "updatedAt">, options?: { teamId?: string }): Promise<Client> {
        if (!prismaEnabled) {
            await delay(100);
            const newClient: Client = {
                ...client,
                id: `client-${String(mockClients.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockClients.push(newClient);
            return newClient;
        }

        try {
            const resolvedTeamId = await resolveTeamId(options?.teamId);
            if (!resolvedTeamId) {
                throw new Error("Unable to resolve team");
            }

            const [firstName, ...rest] = client.name.trim().split(/\s+/);
            const lastName = rest.join(" ") || "Client";

            const created = await prisma.client.create({
                data: {
                    firstName: firstName || "Client",
                    lastName,
                    email: client.email || null,
                    phone: client.phone || null,
                    nationality: client.nationality || null,
                    type: client.type.map(mapClientTypeToPrisma),
                    notes: client.notes || null,
                    teamId: resolvedTeamId,
                },
                include: {
                    deals: {
                        select: { id: true },
                    },
                },
            });

            return toAppClient(created);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const newClient: Client = {
                ...client,
                id: `client-${String(mockClients.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockClients.push(newClient);
            return newClient;
        }
    },

    async update(id: string, updates: Partial<Client>, teamId?: string): Promise<Client | null> {
        if (!prismaEnabled) {
            await delay(100);
            const index = mockClients.findIndex(c => c.id === id);
            if (index === -1) return null;

            mockClients[index] = {
                ...mockClients[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return mockClients[index];
        }

        try {
            const existing = await this.getById(id, teamId);
            if (!existing) return null;

            const merged: Client = {
                ...existing,
                ...updates,
            };

            const [firstName, ...rest] = merged.name.trim().split(/\s+/);
            const lastName = rest.join(" ") || "Client";

            const updated = await prisma.client.update({
                where: { id },
                data: {
                    firstName: firstName || "Client",
                    lastName,
                    email: merged.email || null,
                    phone: merged.phone || null,
                    nationality: merged.nationality || null,
                    type: merged.type.map(mapClientTypeToPrisma),
                    notes: merged.notes || null,
                },
                include: {
                    deals: {
                        select: { id: true },
                    },
                },
            });

            return toAppClient(updated);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const index = mockClients.findIndex(c => c.id === id);
            if (index === -1) return null;

            mockClients[index] = {
                ...mockClients[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return mockClients[index];
        }
    },

    async addDocument(
        clientId: string,
        document: { type: string; name: string; url: string }
    ): Promise<Client | null> {
        const client = mockClients.find(c => c.id === clientId);
        if (!client) return null;

        const newDoc = {
            id: `doc-${Date.now()}`,
            ...document,
        };
        client.documents.push(newDoc);
        client.updatedAt = new Date().toISOString();
        return client;
    },

    async removeDocument(clientId: string, documentId: string): Promise<Client | null> {
        const client = mockClients.find(c => c.id === clientId);
        if (!client) return null;

        client.documents = client.documents.filter(d => d.id !== documentId);
        client.updatedAt = new Date().toISOString();
        return client;
    },

    async delete(id: string, teamId?: string): Promise<boolean> {
        if (!prismaEnabled) {
            await delay(100);
            const index = mockClients.findIndex(c => c.id === id);
            if (index === -1) return false;
            mockClients.splice(index, 1);
            return true;
        }

        try {
            const deleted = await prisma.client.deleteMany({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
            });
            return deleted.count > 0;
        } catch {
            prismaEnabled = false;
            await delay(100);
            const index = mockClients.findIndex(c => c.id === id);
            if (index === -1) return false;
            mockClients.splice(index, 1);
            return true;
        }
    },

    async search(query: string): Promise<Client[]> {
        await delay(100);
        const lowerQuery = query.toLowerCase();
        return mockClients.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.email.toLowerCase().includes(lowerQuery) ||
            c.phone.includes(query)
        );
    },

    async getStats(teamId?: string): Promise<{
        total: number;
        buyers: number;
        sellers: number;
        tenants: number;
        landlords: number;
    }> {
        const clients = await this.getAll(teamId);
        return {
            total: clients.length,
            buyers: clients.filter(c => c.type.includes("buyer")).length,
            sellers: clients.filter(c => c.type.includes("seller")).length,
            tenants: clients.filter(c => c.type.includes("tenant")).length,
            landlords: clients.filter(c => c.type.includes("landlord")).length,
        };
    },
};
