import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiRoute } from "@/lib/api/utils";
import { propertiesService } from "@/server/services/propertiesService";
import { leadsService } from "@/server/services/leadsService";
import { dealsService } from "@/server/services/dealsService";
import { transactionsService } from "@/server/services/transactionsService";

function toCsv(rows: Array<[string, string | number]>) {
    const header = "metric,value";
    const lines = rows.map(([metric, value]) => {
        const escapedMetric = `"${String(metric).replace(/"/g, '""')}"`;
        const escapedValue = `"${String(value).replace(/"/g, '""')}"`;
        return `${escapedMetric},${escapedValue}`;
    });
    return [header, ...lines].join("\n");
}

export async function GET() {
    return handleApiRoute(async () => {
        await requireAuth();

        const [propertyStats, leadStats, dealStats, transactionStats] = await Promise.all([
            propertiesService.getStats(),
            leadsService.getStats(),
            dealsService.getStats(),
            transactionsService.getStats(),
        ]);

        const conversionRate = leadStats.total > 0
            ? Math.round((leadStats.converted / leadStats.total) * 100)
            : 0;
        const avgDealValue = dealStats.total > 0
            ? Math.round(dealStats.totalValue / dealStats.total)
            : 0;

        const csv = toCsv([
            ["generated_at", new Date().toISOString()],
            ["properties_total", propertyStats.total],
            ["properties_available", propertyStats.available],
            ["properties_under_offer", propertyStats.underOffer],
            ["properties_for_sale", propertyStats.forSale],
            ["properties_for_rent", propertyStats.forRent],
            ["leads_total", leadStats.total],
            ["leads_new", leadStats.new],
            ["leads_qualified", leadStats.qualified],
            ["leads_converted", leadStats.converted],
            ["leads_lost", leadStats.lost],
            ["lead_conversion_rate_percent", conversionRate],
            ["deals_total", dealStats.total],
            ["deals_total_value", dealStats.totalValue],
            ["deals_total_commission", dealStats.totalCommission],
            ["deals_closed_this_month", dealStats.closedThisMonth],
            ["deals_avg_value", avgDealValue],
            ["transactions_total_revenue", transactionStats.totalRevenue],
            ["transactions_total_commission", transactionStats.totalCommission],
            ["transactions_pending_amount", transactionStats.pendingAmount],
            ["transactions_count", transactionStats.transactionCount],
        ]);

        const fileName = `crm-report-${new Date().toISOString().split("T")[0]}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename=\"${fileName}\"`,
                "Cache-Control": "no-store",
            },
        });
    });
}
