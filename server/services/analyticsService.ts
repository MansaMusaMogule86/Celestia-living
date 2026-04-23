import { prisma } from "../db/prisma";
import type { PortalName } from "@prisma/client";

export interface OverviewStats {
    totalCampaigns: number;
    liveCampaigns: number;
    scheduledCampaigns: number;
    totalPosts: number;
    totalImpressions: number;
    totalClicks: number;
    totalLeads: number;
    avgEngagementRate: number;
    avgCostPerLead: number;
    activeAutomations: number;
}

export interface PortalBreakdown {
    portal: PortalName;
    postsSent: number;
    impressions: number;
    clicks: number;
    leads: number;
    engagementRate: number;
    conversionRate: number;
    costPerLead: number;
}

// Number of days for each period
const PERIOD_DAYS: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
};

const emptyOverviewStats: OverviewStats = {
    totalCampaigns: 0, liveCampaigns: 0, scheduledCampaigns: 0,
    totalPosts: 0, totalImpressions: 0, totalClicks: 0,
    totalLeads: 0, avgEngagementRate: 0, avgCostPerLead: 0, activeAutomations: 0,
};

export async function getOverviewStats(
    teamId: string,
    period: string = "30d"
): Promise<OverviewStats> {
    try {
    const days = PERIOD_DAYS[period] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
        campaignCounts,
        postCount,
        metricsAgg,
        leadCount,
        automationCount,
    ] = await Promise.all([
        // Campaign counts by status
        prisma.campaign.groupBy({
            by: ["status"],
            where: { teamId, isDeleted: false },
            _count: true,
        }),

        // Total posts
        prisma.campaignPost.count({
            where: {
                campaign: { teamId },
                status: "PUBLISHED",
                publishedAt: { gte: since },
            },
        }),

        // Aggregated metrics
        prisma.engagementMetric.aggregate({
            where: {
                portalConnection: { teamId },
                recordedAt: { gte: since },
            },
            _sum: {
                impressions: true,
                clicks: true,
                likes: true,
                comments: true,
                shares: true,
                saves: true,
                leadsGenerated: true,
            },
            _avg: {
                engagementRate: true,
                costPerLead: true,
            },
        }),

        // Lead count
        prisma.lead.count({
            where: { teamId, createdAt: { gte: since } },
        }),

        // Active automations
        prisma.automationRule.count({
            where: { teamId, enabled: true },
        }),
    ]);

    const totalCampaigns = campaignCounts.reduce(
        (sum, g) => sum + g._count,
        0
    );
    const liveCampaigns =
        campaignCounts.find((g) => g.status === "LIVE")?._count ?? 0;
    const scheduledCampaigns =
        campaignCounts.find((g) => g.status === "SCHEDULED")?._count ?? 0;

    return {
        totalCampaigns,
        liveCampaigns,
        scheduledCampaigns,
        totalPosts: postCount,
        totalImpressions: metricsAgg._sum.impressions ?? 0,
        totalClicks: metricsAgg._sum.clicks ?? 0,
        totalLeads: leadCount,
        avgEngagementRate: Number(metricsAgg._avg.engagementRate ?? 0),
        avgCostPerLead: Number(metricsAgg._avg.costPerLead ?? 0),
        activeAutomations: automationCount,
    };
    } catch {
        return emptyOverviewStats;
    }
}

export async function getPortalBreakdown(
    teamId: string,
    period: string = "30d"
): Promise<PortalBreakdown[]> {
    try {
    const days = PERIOD_DAYS[period] || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const connections = await prisma.portalConnection.findMany({
        where: { teamId },
        include: {
            engagementMetrics: {
                where: { recordedAt: { gte: since } },
            },
            campaignPosts: {
                where: {
                    status: "PUBLISHED",
                    publishedAt: { gte: since },
                },
            },
        },
    });

    return connections.map((conn) => {
        const metrics = conn.engagementMetrics;
        const totalImpressions = metrics.reduce(
            (s, m) => s + m.impressions,
            0
        );
        const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
        const totalLeads = metrics.reduce((s, m) => s + m.leadsGenerated, 0);
        const avgEngagement =
            metrics.length > 0
                ? metrics.reduce((s, m) => s + Number(m.engagementRate), 0) /
                metrics.length
                : 0;
        const avgConversion =
            metrics.length > 0
                ? metrics.reduce((s, m) => s + Number(m.conversionRate), 0) /
                metrics.length
                : 0;
        const avgCPL =
            metrics.length > 0
                ? metrics.reduce((s, m) => s + Number(m.costPerLead), 0) /
                metrics.length
                : 0;

        return {
            portal: conn.portal,
            postsSent: conn.campaignPosts.length,
            impressions: totalImpressions,
            clicks: totalClicks,
            leads: totalLeads,
            engagementRate: Math.round(avgEngagement * 100) / 100,
            conversionRate: Math.round(avgConversion * 100) / 100,
            costPerLead: Math.round(avgCPL * 100) / 100,
        };
    });
    } catch {
        return [];
    }
}

export async function getCampaignAnalytics(
    campaignId: string,
    teamId: string
) {
    try {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId, teamId },
        include: {
            posts: {
                include: {
                    engagementMetrics: {
                        orderBy: { recordedAt: "desc" },
                        take: 10,
                    },
                },
            },
        },
    });

    if (!campaign) return null;

    const postAnalytics = campaign.posts.map((post) => {
        const latest = post.engagementMetrics[0];
        return {
            postId: post.id,
            portal: post.portal,
            status: post.status,
            publishedAt: post.publishedAt,
            metrics: latest
                ? {
                    impressions: latest.impressions,
                    clicks: latest.clicks,
                    likes: latest.likes,
                    comments: latest.comments,
                    shares: latest.shares,
                    saves: latest.saves,
                    reach: latest.reach,
                    engagementRate: Number(latest.engagementRate),
                }
                : null,
        };
    });

    const totals = postAnalytics.reduce(
        (acc, p) => {
            if (p.metrics) {
                acc.impressions += p.metrics.impressions;
                acc.clicks += p.metrics.clicks;
                acc.likes += p.metrics.likes;
                acc.comments += p.metrics.comments;
                acc.shares += p.metrics.shares;
                acc.reach += p.metrics.reach;
            }
            return acc;
        },
        {
            impressions: 0,
            clicks: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            reach: 0,
        }
    );

    return {
        campaignId,
        title: campaign.title,
        status: campaign.status,
        totals,
        posts: postAnalytics,
    };
    } catch {
        return null;
    }
}
