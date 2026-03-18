import { Transaction, TransactionType, TransactionStatus } from "@/lib/types";
import { prisma } from "@/server/db/prisma";
import { mockStorage } from "@/lib/db/mock-storage";

let prismaEnabled = true;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function mapTypeToPrisma(type: TransactionType): "SALE" | "RENTAL_PAYMENT" | "COMMISSION" | "DEPOSIT" | "REFUND" {
    switch (type) {
        case "sale":
            return "SALE";
        case "rental_payment":
            return "RENTAL_PAYMENT";
        case "commission":
            return "COMMISSION";
        case "deposit":
            return "DEPOSIT";
        case "refund":
            return "REFUND";
        default:
            return "SALE";
    }
}

function mapTypeFromPrisma(type: string): TransactionType {
    switch (type) {
        case "SALE":
            return "sale";
        case "RENTAL_PAYMENT":
            return "rental_payment";
        case "COMMISSION":
            return "commission";
        case "DEPOSIT":
            return "deposit";
        case "REFUND":
            return "refund";
        default:
            return "sale";
    }
}

function mapStatusToPrisma(status: TransactionStatus): "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" {
    switch (status) {
        case "pending":
            return "PENDING";
        case "completed":
            return "COMPLETED";
        case "failed":
            return "FAILED";
        case "cancelled":
            return "CANCELLED";
        default:
            return "PENDING";
    }
}

function mapStatusFromPrisma(status: string): TransactionStatus {
    switch (status) {
        case "PENDING":
            return "pending";
        case "COMPLETED":
            return "completed";
        case "FAILED":
            return "failed";
        case "CANCELLED":
            return "cancelled";
        default:
            return "pending";
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

function toAppTransaction(prismaTransaction: any): Transaction {
    return {
        id: prismaTransaction.id,
        type: mapTypeFromPrisma(prismaTransaction.type),
        status: mapStatusFromPrisma(prismaTransaction.status),
        amount: Number(prismaTransaction.amount || 0),
        currency: prismaTransaction.currency || "AED",
        deal: prismaTransaction.deal
            ? {
                id: prismaTransaction.deal.id,
                title: prismaTransaction.deal.title,
            }
            : { id: "", title: "" },
        client: prismaTransaction.client
            ? {
                id: prismaTransaction.client.id,
                name: [prismaTransaction.client.firstName, prismaTransaction.client.lastName].filter(Boolean).join(" ").trim(),
            }
            : { id: "", name: "" },
        description: prismaTransaction.description || "",
        paymentMethod: prismaTransaction.paymentMethod || "",
        reference: prismaTransaction.reference || "",
        createdAt: prismaTransaction.createdAt.toISOString(),
        completedAt: prismaTransaction.completedAt ? prismaTransaction.completedAt.toISOString() : undefined,
    };
}

export const transactionsService = {
    async getAll(teamId?: string): Promise<Transaction[]> {
        if (!prismaEnabled) {
            await delay(100);
            return mockStorage.getCollection("transactions");
        }

        try {
            const rows = await prisma.transaction.findMany({
                where: teamId ? { teamId } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    deal: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            return rows.map(toAppTransaction);
        } catch {
            prismaEnabled = false;
            await delay(100);
            return mockStorage.getCollection("transactions");
        }
    },

    async getById(id: string, teamId?: string): Promise<Transaction | null> {
        if (!prismaEnabled) {
            await delay(50);
            const transactions = mockStorage.getCollection("transactions");
            return transactions.find((t: Transaction) => t.id === id) || null;
        }

        try {
            const row = await prisma.transaction.findFirst({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
                include: {
                    deal: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                },
            });
            return row ? toAppTransaction(row) : null;
        } catch {
            prismaEnabled = false;
            await delay(50);
            const transactions = mockStorage.getCollection("transactions");
            return transactions.find((t: Transaction) => t.id === id) || null;
        }
    },

    async getByType(type: TransactionType): Promise<Transaction[]> {
        await delay(100);
        const transactions = mockStorage.getCollection("transactions");
        return transactions.filter((t: Transaction) => t.type === type);
    },

    async getByStatus(status: TransactionStatus): Promise<Transaction[]> {
        await delay(100);
        const transactions = mockStorage.getCollection("transactions");
        return transactions.filter((t: Transaction) => t.status === status);
    },

    async getByDeal(dealId: string): Promise<Transaction[]> {
        await delay(100);
        const transactions = mockStorage.getCollection("transactions");
        return transactions.filter((t: Transaction) => t.deal.id === dealId);
    },

    async getByClient(clientId: string): Promise<Transaction[]> {
        await delay(100);
        const transactions = mockStorage.getCollection("transactions");
        return transactions.filter((t: Transaction) => t.client.id === clientId);
    },

    async create(transaction: Omit<Transaction, "id" | "createdAt">, options?: { teamId?: string }): Promise<Transaction> {
        if (!prismaEnabled) {
            await delay(100);
            const transactions = mockStorage.getCollection("transactions");
            const newTransaction: Transaction = {
                ...transaction,
                id: `txn-${String(transactions.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
            };
            mockStorage.addToCollection("transactions", newTransaction);
            return newTransaction;
        }

        try {
            const resolvedTeamId = await resolveTeamId(options?.teamId);
            if (!resolvedTeamId) {
                throw new Error("Unable to resolve team");
            }

            const created = await prisma.transaction.create({
                data: {
                    type: mapTypeToPrisma(transaction.type),
                    status: mapStatusToPrisma(transaction.status),
                    amount: transaction.amount,
                    currency: transaction.currency || "AED",
                    description: transaction.description || null,
                    paymentMethod: transaction.paymentMethod || null,
                    reference: transaction.reference || null,
                    dealId: transaction.deal.id || null,
                    clientId: transaction.client.id || null,
                    completedAt: transaction.completedAt ? new Date(transaction.completedAt) : null,
                    teamId: resolvedTeamId,
                },
                include: {
                    deal: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                },
            });

            return toAppTransaction(created);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const transactions = mockStorage.getCollection("transactions");
            const newTransaction: Transaction = {
                ...transaction,
                id: `txn-${String(transactions.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
            };
            mockStorage.addToCollection("transactions", newTransaction);
            return newTransaction;
        }
    },

    async update(id: string, updates: Partial<Transaction>, teamId?: string): Promise<Transaction | null> {
        if (!prismaEnabled) {
            await delay(100);
            const transaction = await this.getById(id, teamId);
            if (!transaction) return null;

            const updatedTransaction = {
                ...transaction,
                ...updates,
            };
            mockStorage.updateInCollection("transactions", id, updatedTransaction);
            return updatedTransaction;
        }

        try {
            const existing = await this.getById(id, teamId);
            if (!existing) return null;

            const merged: Transaction = {
                ...existing,
                ...updates,
                deal: {
                    ...existing.deal,
                    ...(updates.deal || {}),
                },
                client: {
                    ...existing.client,
                    ...(updates.client || {}),
                },
            };

            const updated = await prisma.transaction.update({
                where: { id },
                data: {
                    type: mapTypeToPrisma(merged.type),
                    status: mapStatusToPrisma(merged.status),
                    amount: merged.amount,
                    currency: merged.currency || "AED",
                    description: merged.description || null,
                    paymentMethod: merged.paymentMethod || null,
                    reference: merged.reference || null,
                    dealId: merged.deal.id || null,
                    clientId: merged.client.id || null,
                    completedAt: merged.completedAt ? new Date(merged.completedAt) : null,
                },
                include: {
                    deal: { select: { id: true, title: true } },
                    client: { select: { id: true, firstName: true, lastName: true } },
                },
            });

            return toAppTransaction(updated);
        } catch {
            prismaEnabled = false;
            await delay(100);
            const transaction = await this.getById(id, teamId);
            if (!transaction) return null;

            const updatedTransaction = {
                ...transaction,
                ...updates,
            };
            mockStorage.updateInCollection("transactions", id, updatedTransaction);
            return updatedTransaction;
        }
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

    async delete(id: string, teamId?: string): Promise<boolean> {
        if (!prismaEnabled) {
            await delay(100);
            const transaction = await this.getById(id, teamId);
            if (!transaction) return false;
            mockStorage.removeFromCollection("transactions", id);
            return true;
        }

        try {
            const deleted = await prisma.transaction.deleteMany({
                where: {
                    id,
                    ...(teamId ? { teamId } : {}),
                },
            });
            return deleted.count > 0;
        } catch {
            prismaEnabled = false;
            await delay(100);
            const transaction = await this.getById(id, teamId);
            if (!transaction) return false;
            mockStorage.removeFromCollection("transactions", id);
            return true;
        }
    },

    async getStats(teamId?: string): Promise<{
        totalRevenue: number;
        totalCommission: number;
        pendingAmount: number;
        transactionCount: number;
    }> {
        const transactions = await this.getAll(teamId);
        const completed = transactions.filter(t => t.status === "completed");
        const pending = transactions.filter(t => t.status === "pending");

        return {
            totalRevenue: completed
                .filter(t => t.type === "sale" || t.type === "rental_payment")
                .reduce((sum, t) => sum + t.amount, 0),
            totalCommission: completed
                .filter(t => t.type === "commission")
                .reduce((sum, t) => sum + t.amount, 0),
            pendingAmount: pending.reduce((sum, t) => sum + t.amount, 0),
            transactionCount: transactions.length,
        };
    },
};
