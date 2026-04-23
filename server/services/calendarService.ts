import { CreateAppointmentInput } from "@/lib/validators";
import { mockStorage } from "@/lib/db/mock-storage";

export interface AppointmentRecord {
    id: string;
    title: string;
    type: "viewing" | "meeting" | "follow_up" | "call" | "other";
    date: string;
    startTime: string;
    endTime: string;
    client?: string;
    property?: string;
    location?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const calendarService = {
    async getAll(): Promise<AppointmentRecord[]> {
        await delay(60);
        return mockStorage.getCollection<AppointmentRecord>("appointments").sort((a, b) =>
            a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
        );
    },

    async create(input: CreateAppointmentInput): Promise<AppointmentRecord> {
        await delay(90);
        const now = new Date().toISOString();
        const record: AppointmentRecord = {
            id: `apt-${Date.now()}`,
            ...input,
            client: input.client || undefined,
            property: input.property || undefined,
            location: input.location || undefined,
            notes: input.notes || undefined,
            createdAt: now,
            updatedAt: now,
        };
        mockStorage.addToCollection("appointments", record);
        return record;
    },
};
