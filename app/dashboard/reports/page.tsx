import { propertiesService } from "@/server/services/propertiesService";
import { leadsService } from "@/server/services/leadsService";
import { dealsService } from "@/server/services/dealsService";
import { transactionsService } from "@/server/services/transactionsService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Building2,
    Users,
    Briefcase,
    DollarSign,
    Download,
    Calendar,
    ChevronDown,
} from "lucide-react";

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(amount);
}

export default async function ReportsPage() {
    // Fetch all data
    const [propertyStats, leadStats, dealStats, transactionStats] = await Promise.all([
        propertiesService.getStats(),
        leadsService.getStats(),
        dealsService.getStats(),
        transactionsService.getStats(),
    ]);

    // Calculate some metrics
    const conversionRate = leadStats.total > 0
        ? Math.round((leadStats.converted / leadStats.total) * 100)
        : 0;

    const avgDealValue = dealStats.total > 0
        ? Math.round(dealStats.totalValue / dealStats.total)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Performance insights and metrics
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm border-muted">
                        <Calendar className="h-4 w-4" />
                        This Month
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button className="gap-2 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Properties
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{propertyStats.total}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <span>{propertyStats.available} available</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Leads
                        </CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leadStats.total}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <span>{leadStats.new} new this period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Deals
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dealStats.total}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <span>{dealStats.closedThisMonth} closed</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(transactionStats.totalRevenue)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <span>{transactionStats.transactionCount} transactions</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Lead Conversion */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Conversion</CardTitle>
                        <CardDescription>Lead funnel metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{conversionRate}%</span>
                            <Badge variant="outline">Conversion Rate</Badge>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">New Leads</span>
                                <span className="font-medium">{leadStats.new}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Qualified</span>
                                <span className="font-medium">{leadStats.qualified}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Converted</span>
                                <span className="font-medium">{leadStats.converted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Lost</span>
                                <span className="font-medium">{leadStats.lost}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deal Pipeline Value */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pipeline Value</CardTitle>
                        <CardDescription>Deal value by stage</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                                {formatCurrency(dealStats.totalValue)}
                            </span>
                            <Badge variant="outline">Total Pipeline</Badge>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(dealStats.byStage).map(([stage, count]) => (
                                <div key={stage} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground capitalize">{stage}</span>
                                    <Badge variant="secondary">{count} deals</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Property Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Property Portfolio</CardTitle>
                    <CardDescription>Distribution by type and status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <h4 className="text-sm font-medium mb-3">By Listing Type</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                                    <span className="text-sm">For Sale</span>
                                    <Badge>{propertyStats.forSale}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50">
                                    <span className="text-sm">For Rent</span>
                                    <Badge variant="secondary">{propertyStats.forRent}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-3">By Status</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                                    <span className="text-sm">Available</span>
                                    <Badge>{propertyStats.available}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
                                    <span className="text-sm">Under Offer</span>
                                    <Badge variant="secondary">{propertyStats.underOffer}</Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium mb-3">Summary</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                    <span className="text-sm">Total Properties</span>
                                    <span className="font-bold">{propertyStats.total}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                    <span className="text-sm">Avg Deal Value</span>
                                    <span className="font-bold">{formatCurrency(avgDealValue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Commission Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Commission & Revenue</CardTitle>
                    <CardDescription>Financial performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 rounded-lg border text-center">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold mt-1">
                                {formatCurrency(transactionStats.totalRevenue)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border text-center">
                            <p className="text-sm text-muted-foreground">Total Commission</p>
                            <p className="text-2xl font-bold mt-1 text-green-600">
                                {formatCurrency(transactionStats.totalCommission)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border text-center">
                            <p className="text-sm text-muted-foreground">Pending Amount</p>
                            <p className="text-2xl font-bold mt-1 text-amber-600">
                                {formatCurrency(transactionStats.pendingAmount)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border text-center">
                            <p className="text-sm text-muted-foreground">Expected Commission</p>
                            <p className="text-2xl font-bold mt-1 text-blue-600">
                                {formatCurrency(dealStats.totalCommission)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Empty State Message when no data */}
            {propertyStats.total === 0 && leadStats.total === 0 && dealStats.total === 0 && (
                <Card className="border-dashed border-2">
                    <CardContent className="py-12">
                        <div className="text-center max-w-md mx-auto">
                            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No data to report yet</h3>
                            <p className="text-muted-foreground">
                                Start adding properties, leads, and deals to see your performance metrics here.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
