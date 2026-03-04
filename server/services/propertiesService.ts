import { Property, PropertyType, PropertyStatus, ListingType } from "@/lib/types";
import { prisma } from "@/server/db/prisma";

// Empty data - starting fresh
const mockProperties: Property[] = [];
let prismaEnabled = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapTypeToPrisma(type: PropertyType): "APARTMENT" | "VILLA" | "TOWNHOUSE" | "PENTHOUSE" | "STUDIO" | "OFFICE" | "COMMERCIAL" {
    switch (type) {
        case "apartment": return "APARTMENT";
        case "villa": return "VILLA";
        case "townhouse": return "TOWNHOUSE";
        case "penthouse": return "PENTHOUSE";
        case "studio": return "STUDIO";
        case "office": return "OFFICE";
        case "retail": return "COMMERCIAL";
        default: return "APARTMENT";
    }
}

function mapTypeFromPrisma(type: string): PropertyType {
    switch (type) {
        case "APARTMENT": return "apartment";
        case "VILLA": return "villa";
        case "TOWNHOUSE": return "townhouse";
        case "PENTHOUSE": return "penthouse";
        case "STUDIO": return "studio";
        case "OFFICE": return "office";
        case "COMMERCIAL": return "retail";
        default: return "apartment";
    }
}

function mapPurposeToListingType(purpose: string): ListingType {
    return purpose === "RENT" || purpose === "SHORT_TERM_RENT" ? "rent" : "sale";
}

function mapListingTypeToPurpose(listingType: ListingType): "SALE" | "RENT" {
    return listingType === "rent" ? "RENT" : "SALE";
}

function mapStatusFromPrisma(status: string): PropertyStatus {
    switch (status) {
        case "AVAILABLE": return "available";
        case "UNDER_OFFER": return "under_offer";
        case "SOLD": return "sold";
        case "RENTED": return "rented";
        case "OFF_MARKET": return "off_market";
        default: return "available";
    }
}

function mapStatusToPrisma(status: PropertyStatus): "AVAILABLE" | "UNDER_OFFER" | "SOLD" | "RENTED" | "OFF_MARKET" {
    switch (status) {
        case "available": return "AVAILABLE";
        case "under_offer": return "UNDER_OFFER";
        case "sold": return "SOLD";
        case "rented": return "RENTED";
        case "off_market": return "OFF_MARKET";
        default: return "AVAILABLE";
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

function packDescription(data: Omit<Property, "id" | "createdAt" | "updatedAt">): string {
    return JSON.stringify({
        text: data.description || "",
        community: data.location.community,
        building: data.location.building,
        developer: data.location.developer,
        parkingSpaces: data.details.parkingSpaces,
        furnished: data.details.furnished,
        amenities: data.amenities,
        agent: data.agent,
    });
}

function unpackDescription(raw?: string | null): {
    text: string;
    community?: string;
    building?: string;
    developer?: string;
    parkingSpaces?: number;
    furnished?: boolean;
    amenities?: string[];
    agent?: { id: string; name: string };
} {
    if (!raw) return { text: "" };

    try {
        const parsed = JSON.parse(raw);
        return {
            text: parsed.text || "",
            community: parsed.community,
            building: parsed.building,
            developer: parsed.developer,
            parkingSpaces: typeof parsed.parkingSpaces === "number" ? parsed.parkingSpaces : undefined,
            furnished: typeof parsed.furnished === "boolean" ? parsed.furnished : undefined,
            amenities: Array.isArray(parsed.amenities) ? parsed.amenities : undefined,
            agent: parsed.agent,
        };
    } catch {
        return { text: raw };
    }
}

function toAppProperty(row: any): Property {
    const meta = unpackDescription(row.description);

    return {
        id: row.id,
        title: row.title,
        type: mapTypeFromPrisma(row.type),
        status: mapStatusFromPrisma(row.status),
        listingType: mapPurposeToListingType(row.purpose),
        price: Number(row.price || 0),
        location: {
            area: row.area || "",
            community: meta.community || "",
            building: meta.building,
            developer: meta.developer,
            address: row.location || "",
        },
        details: {
            bedrooms: row.bedrooms ?? 0,
            bathrooms: row.bathrooms ?? 0,
            size: row.sizeSqFt ?? 0,
            parkingSpaces: meta.parkingSpaces ?? 0,
            furnished: meta.furnished ?? false,
        },
        amenities: meta.amenities || [],
        images: row.images || [],
        description: meta.text || "",
        agent: meta.agent || { id: "", name: "" },
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

export const propertiesService = {
    async getAll(teamId?: string): Promise<Property[]> {
        if (!prismaEnabled) {
            await delay(100);
            return [...mockProperties];
        }

        try {
            const rows = await prisma.property.findMany({
                where: {
                    isDeleted: false,
                    ...(teamId ? { teamId } : {}),
                },
                orderBy: { createdAt: "desc" },
            });
            return rows.map(toAppProperty);
        } catch {
            prismaEnabled = false;
            await delay(100);
            return [...mockProperties];
        }
    },

    async getById(id: string, teamId?: string): Promise<Property | null> {
        if (!prismaEnabled) {
            await delay(50);
            return mockProperties.find(p => p.id === id) || null;
        }

        try {
            const row = await prisma.property.findFirst({
                where: {
                    id,
                    isDeleted: false,
                    ...(teamId ? { teamId } : {}),
                },
            });
            return row ? toAppProperty(row) : null;
        } catch {
            prismaEnabled = false;
            await delay(50);
            return mockProperties.find(p => p.id === id) || null;
        }
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

    async create(data: Omit<Property, "id" | "createdAt" | "updatedAt">, _userId?: string, teamId?: string): Promise<Property> {
        if (!prismaEnabled) {
            await delay(100);
            const newProperty: Property = {
                ...data,
                id: `prop-${String(mockProperties.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockProperties.push(newProperty);
            return newProperty;
        }

        try {
            const resolvedTeamId = await resolveTeamId(teamId);
            if (!resolvedTeamId) {
                throw new Error("Unable to resolve team");
            }

            const created = await prisma.property.create({
                data: {
                    title: data.title,
                    description: packDescription(data),
                    type: mapTypeToPrisma(data.type),
                    purpose: mapListingTypeToPurpose(data.listingType),
                    status: mapStatusToPrisma(data.status),
                    price: data.price,
                    area: data.location.area,
                    location: data.location.address,
                    bedrooms: data.details.bedrooms,
                    bathrooms: data.details.bathrooms,
                    sizeSqFt: data.details.size,
                    images: data.images,
                    teamId: resolvedTeamId,
                },
            });

            return toAppProperty(created);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const newProperty: Property = {
                ...data,
                id: `prop-${String(mockProperties.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockProperties.push(newProperty);
            return newProperty;
        }
    },

    async update(id: string, updates: Partial<Property>, _userId?: string, teamId?: string): Promise<Property | null> {
        if (!prismaEnabled) {
            await delay(100);
            const index = mockProperties.findIndex(p => p.id === id);
            if (index === -1) return null;

            mockProperties[index] = {
                ...mockProperties[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return mockProperties[index];
        }

        try {
            const existing = await this.getById(id, teamId);
            if (!existing) return null;

            const merged: Omit<Property, "id" | "createdAt" | "updatedAt"> = {
                ...existing,
                ...updates,
                location: {
                    ...existing.location,
                    ...(updates.location || {}),
                },
                details: {
                    ...existing.details,
                    ...(updates.details || {}),
                },
                agent: {
                    ...existing.agent,
                    ...(updates.agent || {}),
                },
            };

            const updated = await prisma.property.update({
                where: { id },
                data: {
                    title: merged.title,
                    description: packDescription(merged),
                    type: mapTypeToPrisma(merged.type),
                    purpose: mapListingTypeToPurpose(merged.listingType),
                    status: mapStatusToPrisma(merged.status),
                    price: merged.price,
                    area: merged.location.area,
                    location: merged.location.address,
                    bedrooms: merged.details.bedrooms,
                    bathrooms: merged.details.bathrooms,
                    sizeSqFt: merged.details.size,
                    images: merged.images,
                },
            });

            return toAppProperty(updated);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const index = mockProperties.findIndex(p => p.id === id);
            if (index === -1) return null;

            mockProperties[index] = {
                ...mockProperties[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            return mockProperties[index];
        }
    },

    async delete(id: string, teamId?: string): Promise<boolean> {
        if (!prismaEnabled) {
            await delay(100);
            const index = mockProperties.findIndex(p => p.id === id);
            if (index === -1) return false;

            mockProperties.splice(index, 1);
            return true;
        }

        try {
            const updated = await prisma.property.updateMany({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                    isDeleted: false,
                },
                data: {
                    isDeleted: true,
                },
            });
            return updated.count > 0;
        } catch {
            prismaEnabled = false;
            await delay(100);
            const index = mockProperties.findIndex(p => p.id === id);
            if (index === -1) return false;

            mockProperties.splice(index, 1);
            return true;
        }
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

    async getStats(teamId?: string): Promise<{
        total: number;
        available: number;
        underOffer: number;
        sold: number;
        rented: number;
        forSale: number;
        forRent: number;
    }> {
        const properties = await this.getAll(teamId);
        return {
            total: properties.length,
            available: properties.filter(p => p.status === "available").length,
            underOffer: properties.filter(p => p.status === "under_offer").length,
            sold: properties.filter(p => p.status === "sold").length,
            rented: properties.filter(p => p.status === "rented").length,
            forSale: properties.filter(p => p.listingType === "sale").length,
            forRent: properties.filter(p => p.listingType === "rent").length,
        };
    },
};
