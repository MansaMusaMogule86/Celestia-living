import { Property, PropertyType, PropertyStatus, ListingType } from "@/lib/types";

// Empty data - starting fresh
const mockProperties: Property[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const propertiesService = {
    async getAll(_teamId?: string): Promise<Property[]> {
        await delay(100);
        return [...mockProperties];
    },

    async getById(id: string, _teamId?: string): Promise<Property | null> {
        await delay(50);
        return mockProperties.find(p => p.id === id) || null;
    },

    async getByStatus(status: PropertyStatus): Promise<Property[]> {
        await delay(100);
        return mockProperties.filter(p => p.status === status);
    },

    async getByType(type: PropertyType): Promise<Property[]> {
        await delay(100);
        return mockProperties.filter(p => p.type === type);
    },

    async getByListingType(listingType: ListingType): Promise<Property[]> {
        await delay(100);
        return mockProperties.filter(p => p.listingType === listingType);
    },

    async create(data: Omit<Property, "id" | "createdAt" | "updatedAt">, _userId?: string, _teamId?: string): Promise<Property> {
        await delay(100);
        const newProperty: Property = {
            ...data,
            id: `prop-${String(mockProperties.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockProperties.push(newProperty);
        return newProperty;
    },

    async update(id: string, updates: Partial<Property>, _userId?: string, _teamId?: string): Promise<Property | null> {
        await delay(100);
        const index = mockProperties.findIndex(p => p.id === id);
        if (index === -1) return null;

        mockProperties[index] = {
            ...mockProperties[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return mockProperties[index];
    },

    async delete(id: string, _teamId?: string): Promise<boolean> {
        await delay(100);
        const index = mockProperties.findIndex(p => p.id === id);
        if (index === -1) return false;

        mockProperties.splice(index, 1);
        return true;
    },

    async search(query: string): Promise<Property[]> {
        await delay(100);
        const lowerQuery = query.toLowerCase();
        return mockProperties.filter(p =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.location.area.toLowerCase().includes(lowerQuery) ||
            p.location.community.toLowerCase().includes(lowerQuery)
        );
    },

    async getStats(_teamId?: string): Promise<{
        total: number;
        available: number;
        underOffer: number;
        sold: number;
        rented: number;
        forSale: number;
        forRent: number;
    }> {
        await delay(50);
        return {
            total: mockProperties.length,
            available: mockProperties.filter(p => p.status === "available").length,
            underOffer: mockProperties.filter(p => p.status === "under_offer").length,
            sold: mockProperties.filter(p => p.status === "sold").length,
            rented: mockProperties.filter(p => p.status === "rented").length,
            forSale: mockProperties.filter(p => p.listingType === "sale").length,
            forRent: mockProperties.filter(p => p.listingType === "rent").length,
        };
    },
};
