
import fs from 'node:fs';
import path from 'node:path';

// Simple persistent JSON storage for mock data
const STORAGE_FILE = path.join(process.cwd(), 'mock-db.json');

const defaultData = {
    leads: [],
    clients: [],
    transactions: [],
    properties: [],
    deals: [],
    teams: [],
    users: [],
    notifications: [],
};

function readData() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            fs.writeFileSync(STORAGE_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const content = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error('Error reading mock storage:', err);
        return defaultData;
    }
}

function writeData(data: any) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error writing mock storage:', err);
    }
}

export const mockStorage = {
    getCollection(name: keyof typeof defaultData) {
        const data = readData();
        return data[name] || [];
    },
    
    addToCollection(name: keyof typeof defaultData, item: any) {
        const data = readData();
        if (!data[name]) data[name] = [];
        data[name].push(item);
        writeData(data);
    },
    
    updateInCollection(name: keyof typeof defaultData, id: string, updates: any) {
        const data = readData();
        if (!data[name]) return;
        const index = data[name].findIndex((i: any) => i.id === id);
        if (index !== -1) {
            data[name][index] = { ...data[name][index], ...updates };
            writeData(data);
        }
    },
    
    removeFromCollection(name: keyof typeof defaultData, id: string) {
        const data = readData();
        if (!data[name]) return;
        data[name] = data[name].filter((i: any) => i.id !== id);
        writeData(data);
    }
};
