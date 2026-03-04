import { Client, ClientType } from "@/lib/types";

// Empty data - starting fresh
const mockClients: Client[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const clientsService = {
    async getAll(): Promise<Client[]> {
        await delay(100);
        return [...mockClients];
    },

    async getById(id: string): Promise<Client | null> {
        await delay(50);
        return mockClients.find(c => c.id === id) || null;
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

    async create(client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<Client> {
        await delay(100);
        const newClient: Client = {
            ...client,
            id: `client-${String(mockClients.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockClients.push(newClient);
        return newClient;
    },

    async update(id: string, updates: Partial<Client>): Promise<Client | null> {
        await delay(100);
        const index = mockClients.findIndex(c => c.id === id);
        if (index === -1) return null;

        mockClients[index] = {
            ...mockClients[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return mockClients[index];
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

    async delete(id: string): Promise<boolean> {
        await delay(100);
        const index = mockClients.findIndex(c => c.id === id);
        if (index === -1) return false;

        mockClients.splice(index, 1);
        return true;
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

    async getStats(): Promise<{
        total: number;
        buyers: number;
        sellers: number;
        tenants: number;
        landlords: number;
    }> {
        await delay(50);
        return {
            total: mockClients.length,
            buyers: mockClients.filter(c => c.type.includes("buyer")).length,
            sellers: mockClients.filter(c => c.type.includes("seller")).length,
            tenants: mockClients.filter(c => c.type.includes("tenant")).length,
            landlords: mockClients.filter(c => c.type.includes("landlord")).length,
        };
    },
};
