import { CreateAppointmentInput } from "@/lib/validators";

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
const appointmentsState: AppointmentRecord[] = [];

export const calendarService = {
    async getAll(): Promise<AppointmentRecord[]> {
        await delay(60);
        return [...appointmentsState].sort((a, b) =>
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
        appointmentsState.push(record);
        return record;
    },
};
