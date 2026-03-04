import { NextRequest } from "next/server";
import { transactionsService } from "@/server/services/transactionsService";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { createTransactionSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth/session";

export async function GET() {
    return handleApiRoute(async () => {
        await requireAuth();
        const transactions = await transactionsService.getAll();
        return successResponse(transactions);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        await requireAuth();
        const body = await request.json();
        const payload = createTransactionSchema.parse(body);
        const transaction = await transactionsService.create(payload);
        return successResponse(transaction, 201);
    });
}
