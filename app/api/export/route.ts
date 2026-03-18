import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { leadsService } from "@/server/services/leadsService";
import { clientsService } from "@/server/services/clientsService";
import { propertiesService } from "@/server/services/propertiesService";
import { dealsService } from "@/server/services/dealsService";
import { transactionsService } from "@/server/services/transactionsService";

type EntityType = "leads" | "clients" | "properties" | "deals" | "transactions";

function escapeCsvField(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function toCsvRow(fields: (string | number | undefined | null)[]): string {
    return fields.map(escapeCsvField).join(",");
}

async function exportLeads(teamId: string): Promise<string> {
    const leads = await leadsService.getAll(teamId);
    const headers = ["Name", "Email", "Phone", "Status", "Source", "Priority", "Created At"];
    const rows = leads.map((lead) =>
        toCsvRow([lead.name, lead.email, lead.phone, lead.status, lead.source, lead.priority, lead.createdAt])
    );
    return [toCsvRow(headers), ...rows].join("\n");
}

async function exportClients(teamId: string): Promise<string> {
    const clients = await clientsService.getAll(teamId);
    const headers = ["Name", "Email", "Phone", "Type", "Status", "Nationality", "Created At"];
    const rows = clients.map((client) =>
        toCsvRow([client.name, client.email, client.phone, client.type.join("; "), "", client.nationality, client.createdAt])
    );
    return [toCsvRow(headers), ...rows].join("\n");
}

async function exportProperties(teamId: string): Promise<string> {
    const properties = await propertiesService.getAll(teamId);
    const headers = ["Title", "Type", "Purpose", "Status", "Price", "Area", "Bedrooms", "Bathrooms", "Size (sqft)", "Created At"];
    const rows = properties.map((property) =>
        toCsvRow([
            property.title,
            property.type,
            property.listingType,
            property.status,
            property.price,
            property.location.area,
            property.details.bedrooms,
            property.details.bathrooms,
            property.details.size,
            property.createdAt,
        ])
    );
    return [toCsvRow(headers), ...rows].join("\n");
}

async function exportDeals(teamId: string): Promise<string> {
    const deals = await dealsService.getAll(teamId);
    const headers = ["Title", "Type", "Stage", "Value", "Commission", "Client", "Expected Close", "Created At"];
    const rows = deals.map((deal) =>
        toCsvRow([deal.title, deal.type, deal.stage, deal.value, deal.commission, deal.client.name, deal.expectedCloseDate, deal.createdAt])
    );
    return [toCsvRow(headers), ...rows].join("\n");
}

async function exportTransactions(teamId: string): Promise<string> {
    const transactions = await transactionsService.getAll(teamId);
    const headers = ["Type", "Status", "Amount", "Currency", "Payment Method", "Reference", "Created At"];
    const rows = transactions.map((transaction) =>
        toCsvRow([
            transaction.type,
            transaction.status,
            transaction.amount,
            transaction.currency,
            transaction.paymentMethod,
            transaction.reference,
            transaction.createdAt,
        ])
    );
    return [toCsvRow(headers), ...rows].join("\n");
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const entity = searchParams.get("entity") as EntityType | null;

        if (!entity || !["leads", "clients", "properties", "deals", "transactions"].includes(entity)) {
            return NextResponse.json(
                { error: "Invalid entity. Must be one of: leads, clients, properties, deals, transactions" },
                { status: 400 }
            );
        }

        let csv: string;

        switch (entity) {
            case "leads":
                csv = await exportLeads(session.teamId);
                break;
            case "clients":
                csv = await exportClients(session.teamId);
                break;
            case "properties":
                csv = await exportProperties(session.teamId);
                break;
            case "deals":
                csv = await exportDeals(session.teamId);
                break;
            case "transactions":
                csv = await exportTransactions(session.teamId);
                break;
        }

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${entity}-export-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        );
    }
}
