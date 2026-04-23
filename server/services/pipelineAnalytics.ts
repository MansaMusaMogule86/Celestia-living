import { Deal, DealStage } from "@/lib/types";

export interface PipelineMetrics {
    // Pipeline Health
    totalPipelineValue: number;
    weightedPipelineValue: number;
    avgDealSize: number;
    totalDeals: number;

    // Velocity
    avgDaysToClose: number;

    // Conversion
    winRate: number; // closed / (closed + cancelled) %
    stageConversion: Array<{
        from: string;
        to: string;
        rate: number;
    }>;

    // By Stage
    byStage: Array<{
        stage: DealStage;
        count: number;
        value: number;
        avgValue: number;
        percentage: number;
    }>;

    // By Type
    salesCount: number;
    salesValue: number;
    rentalCount: number;
    rentalValue: number;

    // Forecasting
    forecastedRevenue: number; // weighted by stage probability
    pipelineCoverage: number; // total pipeline / target
}

const STAGE_PROBABILITIES: Record<DealStage, number> = {
    inquiry: 0.1,
    viewing: 0.2,
    offer: 0.4,
    negotiation: 0.6,
    agreement: 0.8,
    closed: 1.0,
    cancelled: 0.0,
};

const STAGE_ORDER: DealStage[] = [
    "inquiry",
    "viewing",
    "offer",
    "negotiation",
    "agreement",
    "closed",
    "cancelled",
];

export function calculatePipelineMetrics(
    deals: Deal[],
    revenueTarget?: number
): PipelineMetrics {
    if (deals.length === 0) {
        return {
            totalPipelineValue: 0,
            weightedPipelineValue: 0,
            avgDealSize: 0,
            totalDeals: 0,
            avgDaysToClose: 0,
            winRate: 0,
            stageConversion: [],
            byStage: STAGE_ORDER.map((stage) => ({
                stage,
                count: 0,
                value: 0,
                avgValue: 0,
                percentage: 0,
            })),
            salesCount: 0,
            salesValue: 0,
            rentalCount: 0,
            rentalValue: 0,
            forecastedRevenue: 0,
            pipelineCoverage: 0,
        };
    }

    // Pipeline Health
    const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
    const totalDeals = deals.length;
    const avgDealSize = totalDeals > 0 ? totalPipelineValue / totalDeals : 0;

    // Weighted pipeline value
    const weightedPipelineValue = deals.reduce(
        (sum, d) => sum + d.value * STAGE_PROBABILITIES[d.stage],
        0
    );

    // Velocity: average days to close for closed deals
    const closedDeals = deals.filter(
        (d) => d.stage === "closed" && d.actualCloseDate && d.createdAt
    );
    let avgDaysToClose = 0;
    if (closedDeals.length > 0) {
        const totalDays = closedDeals.reduce((sum, d) => {
            const created = new Date(d.createdAt).getTime();
            const closed = new Date(d.actualCloseDate!).getTime();
            const days = Math.max(
                0,
                (closed - created) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
        }, 0);
        avgDaysToClose = Math.round(totalDays / closedDeals.length);
    }

    // Conversion: win rate
    const closedCount = deals.filter((d) => d.stage === "closed").length;
    const cancelledCount = deals.filter((d) => d.stage === "cancelled").length;
    const resolvedCount = closedCount + cancelledCount;
    const winRate =
        resolvedCount > 0
            ? Math.round((closedCount / resolvedCount) * 100)
            : 0;

    // Stage conversion rates
    const activePipelineStages: DealStage[] = [
        "inquiry",
        "viewing",
        "offer",
        "negotiation",
        "agreement",
        "closed",
    ];
    const stageCounts: Record<string, number> = {};
    for (const stage of STAGE_ORDER) {
        stageCounts[stage] = deals.filter((d) => d.stage === stage).length;
    }

    // For conversion, count deals that are at or past each stage
    const stageConversion: Array<{ from: string; to: string; rate: number }> =
        [];
    for (let i = 0; i < activePipelineStages.length - 1; i++) {
        const fromStage = activePipelineStages[i];
        const toStage = activePipelineStages[i + 1];
        const fromIdx = activePipelineStages.indexOf(fromStage);
        const toIdx = activePipelineStages.indexOf(toStage);

        // Count deals at or past the "from" stage
        const atOrPastFrom = deals.filter((d) => {
            const dealIdx = activePipelineStages.indexOf(d.stage);
            return dealIdx >= fromIdx;
        }).length;

        // Count deals at or past the "to" stage
        const atOrPastTo = deals.filter((d) => {
            const dealIdx = activePipelineStages.indexOf(d.stage);
            return dealIdx >= toIdx;
        }).length;

        const rate =
            atOrPastFrom > 0
                ? Math.round((atOrPastTo / atOrPastFrom) * 100)
                : 0;
        stageConversion.push({ from: fromStage, to: toStage, rate });
    }

    // By Stage
    const byStage = STAGE_ORDER.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const value = stageDeals.reduce((sum, d) => sum + d.value, 0);
        const count = stageDeals.length;
        return {
            stage,
            count,
            value,
            avgValue: count > 0 ? Math.round(value / count) : 0,
            percentage:
                totalPipelineValue > 0
                    ? Math.round((value / totalPipelineValue) * 100)
                    : 0,
        };
    });

    // By Type
    const salesDeals = deals.filter((d) => d.type === "sale");
    const rentalDeals = deals.filter((d) => d.type === "rental");

    const salesCount = salesDeals.length;
    const salesValue = salesDeals.reduce((sum, d) => sum + d.value, 0);
    const rentalCount = rentalDeals.length;
    const rentalValue = rentalDeals.reduce((sum, d) => sum + d.value, 0);

    // Forecasting
    const forecastedRevenue = weightedPipelineValue;
    const target = revenueTarget ?? 0;
    const pipelineCoverage =
        target > 0
            ? Math.round((totalPipelineValue / target) * 100)
            : 0;

    return {
        totalPipelineValue,
        weightedPipelineValue,
        avgDealSize,
        totalDeals,
        avgDaysToClose,
        winRate,
        stageConversion,
        byStage,
        salesCount,
        salesValue,
        rentalCount,
        rentalValue,
        forecastedRevenue,
        pipelineCoverage,
    };
}
