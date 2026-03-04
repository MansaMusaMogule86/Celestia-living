import Link from "next/link";
import { dealsService } from "@/server/services/dealsService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Building2, User, Calendar, DollarSign, Briefcase, ArrowUpRight } from "lucide-react";
import { DealStage, Deal } from "@/lib/types";

const stageConfig: Record<DealStage, { label: string; color: string; bgColor: string }> = {
    inquiry: { label: "Inquiry", color: "text-slate-600", bgColor: "bg-slate-100 border-slate-200" },
    viewing: { label: "Viewing", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
    offer: { label: "Offer", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
    negotiation: { label: "Negotiation", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
    agreement: { label: "Agreement", color: "text-purple-600", bgColor: "bg-purple-50 border-purple-200" },
    closed: { label: "Closed", color: "text-green-600", bgColor: "bg-green-50 border-green-200" },
    cancelled: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
};

function formatCurrency(amount: number): string {
    if (amount === 0) return "TBD";
    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(amount);
}

function DealCard({ deal }: { deal: Deal }) {
    const config = stageConfig[deal.stage];

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <p className="font-medium text-sm line-clamp-2">{deal.title}</p>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span className="truncate">{deal.client.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{formatCurrency(deal.value)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="capitalize text-xs">
                        {deal.type}
                    </Badge>
                    <Link href={`/dashboard/deals/${deal.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default async function DealsPage() {
    const pipeline = await dealsService.getPipeline();
    const stats = await dealsService.getStats();
    const stages = dealsService.getStageOrder().filter(s => s !== "cancelled");

    const hasDeals = stats.total > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Briefcase className="h-8 w-8 text-primary" />
                        Deal Pipeline
                    </h1>
                    <p className="text-muted-foreground">
                        Track and manage your deals
                    </p>
                </div>
                <Link href="/dashboard/deals/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Deal
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Active Deals</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalCommission)}</div>
                        <p className="text-sm text-muted-foreground">Expected Commission</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.closedThisMonth}</div>
                        <p className="text-sm text-muted-foreground">Closed This Month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pipeline or Empty State */}
            {!hasDeals ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No deals yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Create your first deal to start tracking your sales pipeline.
                            </p>
                            <Link href="/dashboard/deals/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Your First Deal
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {stages.map((stage) => {
                        const config = stageConfig[stage];
                        const deals = pipeline[stage];

                        return (
                            <div key={stage} className="space-y-3">
                                <div className={`p-3 rounded-lg border ${config.bgColor}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`font-medium text-sm ${config.color}`}>
                                            {config.label}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                            {deals.length}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-3 min-h-[200px]">
                                    {deals.map((deal) => (
                                        <DealCard key={deal.id} deal={deal} />
                                    ))}
                                    {deals.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            No deals
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
