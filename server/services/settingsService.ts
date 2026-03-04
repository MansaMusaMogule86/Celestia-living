import { CrmSettingsInput, UpdateCrmSettingsInput } from "@/lib/validators";

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

let settingsState: CrmSettingsInput = { ...defaultSettings };

export const settingsService = {
    async get(): Promise<CrmSettingsInput> {
        await delay(60);
        return { ...settingsState };
    },

    async update(updates: UpdateCrmSettingsInput): Promise<CrmSettingsInput> {
        await delay(80);
        settingsState = {
            ...settingsState,
            ...updates,
        };
        return { ...settingsState };
    },

    async reset(): Promise<CrmSettingsInput> {
        await delay(50);
        settingsState = { ...defaultSettings };
        return { ...settingsState };
    },
};
