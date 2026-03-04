import { NextRequest } from "next/server";
import { transactionsService } from "@/server/services/transactionsService";
import { handleApiRoute, successResponse, errorResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { ensureCanDelete } from "@/lib/auth/authorization";
import { updateTransactionSchema } from "@/lib/validators";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;

        const transaction = await transactionsService.getById(id, session.teamId);
        if (!transaction) {
            return errorResponse("Transaction not found", 404);
        }

        return successResponse(transaction);
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        const { id } = await params;
        const body = await req.json();
        const updates = updateTransactionSchema.parse(body);

        const transaction = await transactionsService.update(id, updates, session.teamId);
        if (!transaction) {
            return errorResponse("Transaction not found", 404);
        }

        return successResponse(transaction);
    });
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    return handleApiRoute(async () => {
        const session = await requireAuth();
        ensureCanDelete(session);

        const { id } = await params;
        const deleted = await transactionsService.delete(id, session.teamId);
        if (!deleted) {
            return errorResponse("Transaction not found", 404);
        }

        return successResponse({ deleted: true });
    });
}
