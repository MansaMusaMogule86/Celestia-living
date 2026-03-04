// Core data models for Ilan CRM

export type PropertyType = "apartment" | "villa" | "townhouse" | "penthouse" | "studio" | "office" | "retail";
export type PropertyStatus = "available" | "under_offer" | "sold" | "rented" | "off_market";
export type ListingType = "sale" | "rent";

export interface Property {
    id: string;
    title: string;
    type: PropertyType;
    status: PropertyStatus;
    listingType: ListingType;
    price: number;
    location: {
        area: string;
        community: string;
        building?: string;
        developer?: string;
        address: string;
    };
    details: {
        bedrooms: number;
        bathrooms: number;
        size: number; // sqft
        parkingSpaces: number;
        furnished: boolean;
    };
    amenities: string[];
    images: string[];
    description: string;
    agent: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "negotiating" | "converted" | "lost";
export type LeadSource = "website" | "bayut" | "property_finder" | "dubizzle" | "referral" | "walk_in" | "social_media" | "other";
export type LeadPriority = "low" | "medium" | "high" | "urgent";

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: LeadStatus;
    source: LeadSource;
    priority: LeadPriority;
    budget: {
        min: number;
        max: number;
    };
    requirements: {
        type: PropertyType[];
        bedrooms: number[];
        areas: string[];
        listingType: ListingType;
    };
    notes: string;
    assignedTo?: {
        id: string;
        name: string;
    };
    lastContactedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export type ClientType = "buyer" | "seller" | "tenant" | "landlord";

export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: ClientType[];
    nationality: string;
    documents: {
        id: string;
        type: string;
        name: string;
        url: string;
    }[];
    properties: string[]; // Property IDs
    deals: string[]; // Deal IDs
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export type DealStage = "inquiry" | "viewing" | "offer" | "negotiation" | "agreement" | "closed" | "cancelled";
export type DealType = "sale" | "rental";

export interface Deal {
    id: string;
    title: string;
    type: DealType;
    stage: DealStage;
    property: {
        id: string;
        title: string;
    };
    client: {
        id: string;
        name: string;
    };
    value: number;
    commission: number;
    agent: {
        id: string;
        name: string;
    };
    expectedCloseDate: string;
    actualCloseDate?: string;
    notes: string;
    activities: DealActivity[];
    createdAt: string;
    updatedAt: string;
}

export interface DealActivity {
    id: string;
    type: "note" | "viewing" | "offer" | "call" | "email" | "meeting";
    description: string;
    createdAt: string;
    createdBy: {
        id: string;
        name: string;
    };
}

export type TransactionType = "sale" | "rental_payment" | "commission" | "deposit" | "refund";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    currency: string;
    deal: {
        id: string;
        title: string;
    };
    client: {
        id: string;
        name: string;
    };
    description: string;
    paymentMethod: string;
    reference: string;
    createdAt: string;
    completedAt?: string;
}

// User types for auth
export type UserRole = "admin" | "agent" | "manager";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

// Portal sync types
export type PortalName =
    | "dubizzle"
    | "property_finder"
    | "bayut"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "youtube"
    | "linkedin"
    | "x_twitter"
    | "snapchat"
    | "whatsapp"
    | "telegram"
    | "pinterest";
export type PortalSyncStatus = "synced" | "syncing" | "error" | "pending" | "idle";

export interface PortalImport {
    id: string;
    portal: PortalName;
    status: PortalSyncStatus;
    lastSyncAt: string;
    propertiesSynced: number;
    leadsImported: number;
    errorMessage?: string;
    settings: {
        autoSync: boolean;
        syncInterval: number; // hours
        importLeads: boolean;
    };
}
