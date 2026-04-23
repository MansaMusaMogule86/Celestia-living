import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse(data: unknown, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
    const payload = details === undefined
        ? { success: false, error: message }
        : { success: false, error: message, details };

    return NextResponse.json(
        payload,
        { status }
    );
}

export async function handleApiRoute(handler: () => Promise<NextResponse>) {
    try {
        return await handler();
    } catch (error: unknown) {
        console.error("[API Error]", error);

        if (error instanceof ZodError) {
            return errorResponse("Validation failed", 400, error.issues);
        }

        const message = error instanceof Error ? error.message : "Internal Server Error";

        if (message === "Unauthorized") {
            return errorResponse("Unauthorized", 401);
        }

        if (message === "Forbidden") {
            return errorResponse("Forbidden", 403);
        }

        if (message === "Not Found") {
            return errorResponse("Not Found", 404);
        }

        return errorResponse(
            process.env.NODE_ENV === "development" ? message : "Internal Server Error",
            500
        );
    }
}
