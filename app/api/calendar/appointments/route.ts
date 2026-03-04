import { NextRequest } from "next/server";
import { handleApiRoute, successResponse } from "@/lib/api/utils";
import { requireAuth } from "@/lib/auth/session";
import { createAppointmentSchema } from "@/lib/validators";
import { calendarService } from "@/server/services/calendarService";

export async function GET() {
    return handleApiRoute(async () => {
        await requireAuth();
        const appointments = await calendarService.getAll();
        return successResponse(appointments);
    });
}

export async function POST(request: NextRequest) {
    return handleApiRoute(async () => {
        await requireAuth();
        const body = await request.json();
        const payload = createAppointmentSchema.parse(body);
        const appointment = await calendarService.create(payload);
        return successResponse(appointment, 201);
    });
}
