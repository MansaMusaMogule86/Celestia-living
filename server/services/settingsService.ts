import { CrmSettingsInput, UpdateCrmSettingsInput } from "@/lib/validators";
import { mockStorage } from "@/lib/db/mock-storage";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const defaultSettings: CrmSettingsInput = {
    companyName: "Ilan Real Estate",
    email: "admin@ilanrealestate.com",
    phone: "+971 4 123 4567",
    address: "Business Bay, Dubai, UAE",
    currency: "AED",
    emailNotifications: true,
    smsNotifications: false,
    autoSync: true,
    darkMode: false,
};

const SETTINGS_KEY = "crm_settings";

function getStoredSettings(): CrmSettingsInput {
    const all = mockStorage.getCollection<CrmSettingsInput & { id: string }>("settings");
    const stored = all.find((s) => s.id === SETTINGS_KEY);
    return stored ?? { ...defaultSettings };
}

export const settingsService = {
    async get(): Promise<CrmSettingsInput> {
        await delay(60);
        return getStoredSettings();
    },

    async update(updates: UpdateCrmSettingsInput): Promise<CrmSettingsInput> {
        await delay(80);
        const current = getStoredSettings();
        const updated: CrmSettingsInput & { id: string } = {
            ...current,
            ...updates,
            id: SETTINGS_KEY,
        };
        const all = mockStorage.getCollection<CrmSettingsInput & { id: string }>("settings");
        if (all.find((s) => s.id === SETTINGS_KEY)) {
            mockStorage.updateInCollection("settings", SETTINGS_KEY, updated);
        } else {
            mockStorage.addToCollection("settings", updated);
        }
        return updated;
    },

    async reset(): Promise<CrmSettingsInput> {
        await delay(50);
        const reset: CrmSettingsInput & { id: string } = { ...defaultSettings, id: SETTINGS_KEY };
        const all = mockStorage.getCollection<CrmSettingsInput & { id: string }>("settings");
        if (all.find((s) => s.id === SETTINGS_KEY)) {
            mockStorage.updateInCollection("settings", SETTINGS_KEY, reset);
        } else {
            mockStorage.addToCollection("settings", reset);
        }
        return { ...defaultSettings };
    },
};
