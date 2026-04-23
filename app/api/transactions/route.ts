import { NextRequest } from "next/server";
import { transactionsService } from "@/server/services/transactionsService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { createTransactionSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const transactions = await transactionsService.getAll(session.teamId);
        return successResponse(transactions);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const body = await request.json();
        const payload = createTransactionSchema.parse(body);
        console.log("[API] POST /api/transactions payload:", payload);
        const transaction = await transactionsService.create(payload, {
            teamId: session.teamId,
        });
        console.log("[API] POST /api/transactions created:", transaction);
        return successResponse(transaction, 201);
    });
}
