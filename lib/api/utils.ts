import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse(data: any, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, details?: any) {
    return NextResponse.json(
        { success: false, error: message, ...(details && { details }) },
        { status }
    );
}

export async function handleApiRoute(handler: () => Promise<NextResponse>) {
    try {
        return await handler();
    } catch (error: any) {
        console.error("[API Error]", error);

        if (error instanceof ZodError) {
            return errorResponse("Validation failed", 400, error.issues);
        }

        if (error.message === "Unauthorized") {
            return errorResponse("Unauthorized", 401);
        }

        if (error.message === "Forbidden") {
            return errorResponse("Forbidden", 403);
        }

        if (error.message === "Not Found") {
            return errorResponse("Not Found", 404);
        }

        return errorResponse(
            process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
            500
        );
    }
}
