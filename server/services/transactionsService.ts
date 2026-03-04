import { Transaction, TransactionType, TransactionStatus } from "@/lib/types";

// Empty data - starting fresh
const mockTransactions: Transaction[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const transactionsService = {
    async getAll(): Promise<Transaction[]> {
        await delay(100);
        return [...mockTransactions];
    },

    async getById(id: string): Promise<Transaction | null> {
        await delay(50);
        return mockTransactions.find(t => t.id === id) || null;
    },

    async getByType(type: TransactionType): Promise<Transaction[]> {
        await delay(100);
        return mockTransactions.filter(t => t.type === type);
    },

    async getByStatus(status: TransactionStatus): Promise<Transaction[]> {
        await delay(100);
        return mockTransactions.filter(t => t.status === status);
    },

    async getByDeal(dealId: string): Promise<Transaction[]> {
        await delay(100);
        return mockTransactions.filter(t => t.deal.id === dealId);
    },

    async getByClient(clientId: string): Promise<Transaction[]> {
        await delay(100);
        return mockTransactions.filter(t => t.client.id === clientId);
    },

    async create(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
        await delay(100);
        const newTransaction: Transaction = {
            ...transaction,
            id: `txn-${String(mockTransactions.length + 1).padStart(3, "0")}`,
            createdAt: new Date().toISOString(),
        };
        mockTransactions.push(newTransaction);
        return newTransaction;
    },

    async update(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
        await delay(100);
        const index = mockTransactions.findIndex(t => t.id === id);
        if (index === -1) return null;

        mockTransactions[index] = {
            ...mockTransactions[index],
            ...updates,
        };
        return mockTransactions[index];
    },

    async complete(id: string): Promise<Transaction | null> {
        return this.update(id, {
            status: "completed",
            completedAt: new Date().toISOString(),
        });
    },

    async cancel(id: string): Promise<Transaction | null> {
        return this.update(id, { status: "cancelled" });
    },

    async getStats(): Promise<{
        totalRevenue: number;
        totalCommission: number;
        pendingAmount: number;
        transactionCount: number;
    }> {
        await delay(50);
        const completed = mockTransactions.filter(t => t.status === "completed");
        const pending = mockTransactions.filter(t => t.status === "pending");

        return {
            totalRevenue: completed
                .filter(t => t.type === "sale" || t.type === "rental_payment")
                .reduce((sum, t) => sum + t.amount, 0),
            totalCommission: completed
                .filter(t => t.type === "commission")
                .reduce((sum, t) => sum + t.amount, 0),
            pendingAmount: pending.reduce((sum, t) => sum + t.amount, 0),
            transactionCount: mockTransactions.length,
        };
    },
};
