import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length === 0) {
        return NextResponse.json({
            success: true,
            data: {
                properties: [],
                clients: [],
                leads: [],
                deals: [],
                total: 0,
            },
        });
    }

    const teamId = session.teamId;

    try {
        const [properties, clients, leads, deals] = await Promise.all([
            prisma.property
                .findMany({
                    where: {
                        teamId,
                        isDeleted: false,
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { area: { contains: query, mode: "insensitive" } },
                            { location: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                        area: true,
                        price: true,
                    },
                    take: 5,
                    orderBy: { updatedAt: "desc" },
                })
                .catch(() => []),

            prisma.client
                .findMany({
                    where: {
                        teamId,
                        OR: [
                            { firstName: { contains: query, mode: "insensitive" } },
                            { lastName: { contains: query, mode: "insensitive" } },
                            { email: { contains: query, mode: "insensitive" } },
                            { phone: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        type: true,
                        status: true,
                    },
                    take: 5,
                    orderBy: { updatedAt: "desc" },
                })
                .catch(() => []),

            prisma.lead
                .findMany({
                    where: {
                        teamId,
                        OR: [
                            { firstName: { contains: query, mode: "insensitive" } },
                            { lastName: { contains: query, mode: "insensitive" } },
                            { email: { contains: query, mode: "insensitive" } },
                            { phone: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        status: true,
                        source: true,
                    },
                    take: 5,
                    orderBy: { updatedAt: "desc" },
                })
                .catch(() => []),

            prisma.deal
                .findMany({
                    where: {
                        teamId,
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                        ],
                    },
                    select: {
                        id: true,
                        title: true,
                        stage: true,
                        value: true,
                    },
                    take: 5,
                    orderBy: { updatedAt: "desc" },
                })
                .catch(() => []),
        ]);

        const formattedClients = clients.map((c) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            email: c.email,
            type: c.type,
            status: c.status,
        }));

        const formattedLeads = leads.map((l) => ({
            id: l.id,
            name: `${l.firstName} ${l.lastName}`,
            email: l.email,
            status: l.status,
            source: l.source,
        }));

        const total =
            properties.length +
            clients.length +
            leads.length +
            deals.length;

        return NextResponse.json({
            success: true,
            data: {
                properties,
                clients: formattedClients,
                leads: formattedLeads,
                deals,
                total,
            },
        });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            {
                success: false,
                data: {
                    properties: [],
                    clients: [],
                    leads: [],
                    deals: [],
                    total: 0,
                },
            },
            { status: 500 }
        );
    }
}
