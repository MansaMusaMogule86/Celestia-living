import Link from "next/link";
import type { Route } from "next";
import { getSession } from "@/lib/auth/session";
import { dealsService } from "@/server/services/dealsService";
import { leadsService } from "@/server/services/leadsService";
import { transactionsService } from "@/server/services/transactionsService";
import { clientsService } from "@/server/services/clientsService";
import { calculatePipelineMetrics } from "@/server/services/pipelineAnalytics";
import { scoreLeads } from "@/server/services/leadScoring";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    BarChart3,
    TrendingUp,
    DollarSign,
    Target,
    Percent,
    ArrowRight,
    Users,
    Briefcase,
    Building2,
    Home,
    Download,
    Calendar,
    ChevronDown,
    Zap,
    ArrowUpRight,
    Clock,
    Flame,
} from "lucide-react";
import { DealStage } from "@/lib/types";

function formatCurrency(amount: number): string {
    if (amount === 0) return "AED 0";
    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(amount);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-AE").format(Math.round(value));
}

const stageLabels: Record<DealStage, string> = {
    inquiry: "Inquiry",
    viewing: "Viewing",
    offer: "Offer",
    negotiation: "Negotiation",
    agreement: "Agreement",
    closed: "Closed",
    cancelled: "Cancelled",
};

const stageColors: Record<DealStage, string> = {
    inquiry: "bg-slate-100 text-slate-700",
    viewing: "bg-blue-100 text-blue-700",
    offer: "bg-amber-100 text-amber-700",
    negotiation: "bg-orange-100 text-orange-700",
    agreement: "bg-purple-100 text-purple-700",
    closed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

export default async function ReportsPage() {
    const session = await getSession();
    const teamId = session?.teamId;

    const [deals, leads, transactions, clientStats, transactionStats] =
        await Promise.all([
            dealsService.getAll(teamId),
            leadsService.getAll(teamId),
            transactionsService.getAll(teamId),
            clientsService.getStats(teamId),
            transactionsService.getStats(teamId),
        ]);

    const metrics = calculatePipelineMetrics(deals);
    const scoredLeads = scoreLeads(leads);
    const topLeads = scoredLeads.slice(0, 10);

    // Lead funnel counts
    const leadStatusCounts = {
        new: leads.filter((l) => l.status === "new").length,
        contacted: leads.filter((l) => l.status === "contacted").length,
        qualified: leads.filter((l) => l.status === "qualified").length,
        negotiating: leads.filter((l) => l.status === "negotiating").length,
        converted: leads.filter((l) => l.status === "converted").length,
        lost: leads.filter((l) => l.status === "lost").length,
    };

    const funnelStages = [
        { key: "new", label: "New", count: leadStatusCounts.new, color: "bg-blue-500" },
        { key: "contacted", label: "Contacted", count: leadStatusCounts.contacted, color: "bg-sky-500" },
        { key: "qualified", label: "Qualified", count: leadStatusCounts.qualified, color: "bg-amber-500" },
        { key: "negotiating", label: "Negotiating", count: leadStatusCounts.negotiating, color: "bg-orange-500" },
        { key: "converted", label: "Won", count: leadStatusCounts.converted, color: "bg-green-500" },
        { key: "lost", label: "Lost", count: leadStatusCounts.lost, color: "bg-red-500" },
    ];

    // Completed transactions summary
    const completedTransactions = transactions.filter((t) => t.status === "completed");
    const pendingTransactions = transactions.filter((t) => t.status === "pending");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Pipeline Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Comprehensive pipeline health, conversions, and forecasting
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 bg-background/50 backdrop-blur-sm border-muted"
                    >
                        <Calendar className="h-4 w-4" />
                        This Month
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                        asChild
                        className="gap-2 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <a href="/api/reports/export">
                            <Download className="h-4 w-4" />
                            Export Report
                        </a>
                    </Button>
                </div>
            </div>

            {/* A) Pipeline Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Pipeline Value
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(metrics.totalPipelineValue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics.totalDeals} active deals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Weighted Forecast
                        </CardTitle>
                        <Target className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(metrics.forecastedRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Probability-adjusted value
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Win Rate
                        </CardTitle>
                        <Percent className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{metrics.winRate}%</span>
                            <Badge
                                variant={metrics.winRate >= 50 ? "default" : "secondary"}
                                className={
                                    metrics.winRate >= 50
                                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                                        : ""
                                }
                            >
                                {metrics.winRate >= 50 ? "Healthy" : "Needs attention"}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Closed vs cancelled
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Avg Deal Size
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(metrics.avgDealSize)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics.avgDaysToClose > 0
                                ? `${metrics.avgDaysToClose} avg days to close`
                                : "No closed deals yet"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pipeline" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>

                {/* Pipeline Tab */}
                <TabsContent value="pipeline" className="space-y-6">
                    {/* B) Pipeline by Stage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline by Stage</CardTitle>
                            <CardDescription>
                                Deal distribution across pipeline stages
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {metrics.totalDeals === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                    <p>No deals in the pipeline yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                                    Stage
                                                </th>
                                                <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                                    Count
                                                </th>
                                                <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                                    Value
                                                </th>
                                                <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                                    Avg Value
                                                </th>
                                                <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                                    % of Pipeline
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {metrics.byStage.map((s) => (
                                                <tr
                                                    key={s.stage}
                                                    className="border-b last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="py-3 px-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={stageColors[s.stage]}
                                                        >
                                                            {stageLabels[s.stage]}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-right py-3 px-2 font-medium">
                                                        {s.count}
                                                    </td>
                                                    <td className="text-right py-3 px-2 font-medium">
                                                        {formatCurrency(s.value)}
                                                    </td>
                                                    <td className="text-right py-3 px-2 text-muted-foreground">
                                                        {formatCurrency(s.avgValue)}
                                                    </td>
                                                    <td className="text-right py-3 px-2">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary rounded-full"
                                                                    style={{
                                                                        width: `${s.percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-muted-foreground w-8 text-right">
                                                                {s.percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stage Conversion Rates */}
                    {metrics.stageConversion.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Stage Conversion Rates</CardTitle>
                                <CardDescription>
                                    How deals progress through each stage
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-2">
                                    {metrics.stageConversion.map((conv, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-sm font-medium capitalize">
                                                {conv.from}
                                            </span>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                                                <ArrowRight className="h-3 w-3" />
                                                <span className="text-xs font-semibold">
                                                    {conv.rate}%
                                                </span>
                                            </div>
                                            {idx === metrics.stageConversion.length - 1 && (
                                                <span className="text-sm font-medium capitalize">
                                                    {conv.to}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* C) Sales vs Rental Split */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-base">Sales</CardTitle>
                                    <CardDescription>Sale-type deals</CardDescription>
                                </div>
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(metrics.salesValue)}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">
                                        {metrics.salesCount}{" "}
                                        {metrics.salesCount === 1 ? "deal" : "deals"}
                                    </Badge>
                                    {metrics.totalDeals > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round(
                                                (metrics.salesCount / metrics.totalDeals) * 100
                                            )}
                                            % of pipeline
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div>
                                    <CardTitle className="text-base">Rentals</CardTitle>
                                    <CardDescription>Rental-type deals</CardDescription>
                                </div>
                                <Home className="h-5 w-5 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(metrics.rentalValue)}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary">
                                        {metrics.rentalCount}{" "}
                                        {metrics.rentalCount === 1 ? "deal" : "deals"}
                                    </Badge>
                                    {metrics.totalDeals > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round(
                                                (metrics.rentalCount / metrics.totalDeals) * 100
                                            )}
                                            % of pipeline
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Leads Tab */}
                <TabsContent value="leads" className="space-y-6">
                    {/* D) Lead Funnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Lead Funnel
                            </CardTitle>
                            <CardDescription>
                                Lead progression from new to conversion ({leads.length} total leads)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {leads.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                    <p>No leads yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {funnelStages.map((stage, idx) => {
                                        const prevCount =
                                            idx > 0 ? funnelStages[idx - 1].count : stage.count;
                                        const conversionFromPrev =
                                            prevCount > 0 && idx > 0
                                                ? Math.round(
                                                      (stage.count / prevCount) * 100
                                                  )
                                                : 100;
                                        const maxCount = Math.max(
                                            ...funnelStages.map((s) => s.count),
                                            1
                                        );
                                        const barWidth = Math.max(
                                            (stage.count / maxCount) * 100,
                                            2
                                        );

                                        return (
                                            <div key={stage.key}>
                                                {idx > 0 && (
                                                    <div className="flex items-center gap-2 py-1 pl-4">
                                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {conversionFromPrev}% conversion
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <span className="w-24 text-sm font-medium text-right">
                                                        {stage.label}
                                                    </span>
                                                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
                                                        <div
                                                            className={`h-full ${stage.color} rounded-md transition-all`}
                                                            style={{
                                                                width: `${barWidth}%`,
                                                            }}
                                                        />
                                                        <span className="absolute inset-0 flex items-center pl-2 text-xs font-semibold text-white mix-blend-difference">
                                                            {stage.count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* E) Top Scored Leads */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flame className="h-5 w-5" />
                                Top Scored Leads
                            </CardTitle>
                            <CardDescription>
                                Top 10 leads ranked by multi-dimensional scoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topLeads.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Zap className="h-10 w-10 mx-auto mb-3 opacity-40" />
                                    <p>No leads to score yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                                    Lead
                                                </th>
                                                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                                    Status
                                                </th>
                                                <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                                                    Source
                                                </th>
                                                <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                                    Score
                                                </th>
                                                <th className="text-center py-3 px-2 font-medium text-muted-foreground">
                                                    Rating
                                                </th>
                                                <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topLeads.map((lead) => {
                                                const score = lead.scoreBreakdown.total;
                                                let ratingBadge: {
                                                    label: string;
                                                    className: string;
                                                };
                                                if (score >= 75) {
                                                    ratingBadge = {
                                                        label: "Hot",
                                                        className:
                                                            "bg-green-100 text-green-700 hover:bg-green-100",
                                                    };
                                                } else if (score >= 55) {
                                                    ratingBadge = {
                                                        label: "Warm",
                                                        className:
                                                            "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                                                    };
                                                } else if (score >= 35) {
                                                    ratingBadge = {
                                                        label: "Cool",
                                                        className:
                                                            "bg-blue-100 text-blue-700 hover:bg-blue-100",
                                                    };
                                                } else {
                                                    ratingBadge = {
                                                        label: "Cold",
                                                        className:
                                                            "bg-gray-100 text-gray-600 hover:bg-gray-100",
                                                    };
                                                }

                                                return (
                                                    <tr
                                                        key={lead.id}
                                                        className="border-b last:border-0 hover:bg-muted/50"
                                                    >
                                                        <td className="py-3 px-2">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {lead.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {lead.email || lead.phone || "No contact info"}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="capitalize"
                                                            >
                                                                {lead.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-2 text-muted-foreground capitalize">
                                                            {lead.source.replace(/_/g, " ")}
                                                        </td>
                                                        <td className="text-right py-3 px-2 font-bold tabular-nums">
                                                            {score}
                                                        </td>
                                                        <td className="text-center py-3 px-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className={ratingBadge.className}
                                                            >
                                                                {ratingBadge.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-right py-3 px-2">
                                                            <Link
                                                                href={
                                                                    `/dashboard/leads/${lead.id}` as Route
                                                                }
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 px-2"
                                                                >
                                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                    {/* F) Revenue Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Revenue Summary
                            </CardTitle>
                            <CardDescription>
                                Transaction and revenue overview
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 rounded-lg border text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Total Revenue
                                    </p>
                                    <p className="text-2xl font-bold mt-1">
                                        {formatCurrency(transactionStats.totalRevenue)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Commission Earned
                                    </p>
                                    <p className="text-2xl font-bold mt-1 text-green-600">
                                        {formatCurrency(transactionStats.totalCommission)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Pending Amount
                                    </p>
                                    <p className="text-2xl font-bold mt-1 text-amber-600">
                                        {formatCurrency(transactionStats.pendingAmount)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Total Transactions
                                    </p>
                                    <p className="text-2xl font-bold mt-1">
                                        {transactionStats.transactionCount}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction Breakdown */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Completed Transactions
                                </CardTitle>
                                <CardDescription>
                                    Successfully processed transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {completedTransactions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No completed transactions yet
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Count
                                            </span>
                                            <span className="font-bold">
                                                {completedTransactions.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Total Amount
                                            </span>
                                            <span className="font-bold text-green-600">
                                                {formatCurrency(
                                                    completedTransactions.reduce(
                                                        (s, t) => s + t.amount,
                                                        0
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Avg per Transaction
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(
                                                    completedTransactions.length > 0
                                                        ? completedTransactions.reduce(
                                                              (s, t) => s + t.amount,
                                                              0
                                                          ) / completedTransactions.length
                                                        : 0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Pending Transactions
                                </CardTitle>
                                <CardDescription>
                                    Awaiting processing or completion
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pendingTransactions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No pending transactions
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Count
                                            </span>
                                            <span className="font-bold">
                                                {pendingTransactions.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Total Pending
                                            </span>
                                            <span className="font-bold text-amber-600">
                                                {formatCurrency(
                                                    pendingTransactions.reduce(
                                                        (s, t) => s + t.amount,
                                                        0
                                                    )
                                                )}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Avg per Transaction
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(
                                                    pendingTransactions.length > 0
                                                        ? pendingTransactions.reduce(
                                                              (s, t) => s + t.amount,
                                                              0
                                                          ) / pendingTransactions.length
                                                        : 0
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Client Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Client Overview</CardTitle>
                            <CardDescription>
                                Client base distribution by type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="p-3 rounded-lg bg-muted/50 text-center">
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold mt-1">
                                        {clientStats.total}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 text-center">
                                    <p className="text-xs text-muted-foreground">Buyers</p>
                                    <p className="text-xl font-bold mt-1 text-blue-700">
                                        {clientStats.buyers}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 text-center">
                                    <p className="text-xs text-muted-foreground">Sellers</p>
                                    <p className="text-xl font-bold mt-1 text-green-700">
                                        {clientStats.sellers}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50 text-center">
                                    <p className="text-xs text-muted-foreground">Tenants</p>
                                    <p className="text-xl font-bold mt-1 text-amber-700">
                                        {clientStats.tenants}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-50 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        Landlords
                                    </p>
                                    <p className="text-xl font-bold mt-1 text-purple-700">
                                        {clientStats.landlords}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Empty state when no data at all */}
            {deals.length === 0 && leads.length === 0 && transactions.length === 0 && (
                <Card className="border-dashed border-2">
                    <CardContent className="py-12">
                        <div className="text-center max-w-md mx-auto">
                            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                No data to analyze yet
                            </h3>
                            <p className="text-muted-foreground">
                                Start adding deals, leads, and transactions to see pipeline
                                analytics and performance metrics here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
