import { Transaction, TransactionType, TransactionStatus } from "@/lib/types";
import { prisma } from "@/server/db/prisma";

// Empty data - starting fresh
const mockTransactions: Transaction[] = [];
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
            return [...mockTransactions];
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
            return [...mockTransactions];
        }
    },

    async getById(id: string, teamId?: string): Promise<Transaction | null> {
        if (!prismaEnabled) {
            await delay(50);
            return mockTransactions.find(t => t.id === id) || null;
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
            return mockTransactions.find(t => t.id === id) || null;
        }
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

    async create(transaction: Omit<Transaction, "id" | "createdAt">, options?: { teamId?: string }): Promise<Transaction> {
        if (!prismaEnabled) {
            await delay(100);
            const newTransaction: Transaction = {
                ...transaction,
                id: `txn-${String(mockTransactions.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
            };
            mockTransactions.push(newTransaction);
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
            const newTransaction: Transaction = {
                ...transaction,
                id: `txn-${String(mockTransactions.length + 1).padStart(3, "0")}`,
                createdAt: new Date().toISOString(),
            };
            mockTransactions.push(newTransaction);
            return newTransaction;
        }
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
