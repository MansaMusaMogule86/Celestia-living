import Link from "next/link";
import type { Route } from "next";
import { getSession } from "@/lib/auth/session";
import { propertiesService } from "@/server/services/propertiesService";
import { leadsService } from "@/server/services/leadsService";
import { dealsService } from "@/server/services/dealsService";
import { transactionsService } from "@/server/services/transactionsService";
import { clientsService } from "@/server/services/clientsService";
import { scoreLeads } from "@/server/services/leadScoring";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LeadSourcesChart,
  PipelineBarChart,
} from "@/components/crm/DashboardCharts";
import type {
  LeadSourceDatum,
  PipelineStageDatum,
} from "@/components/crm/DashboardCharts";
import {
  Building2,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  Target,
  Percent,
  BarChart3,
  Activity,
  UserPlus,
  FileText,
  Flame,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtCurrency(n: number): string {
  return `AED ${fmt(n)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-AE", {
    month: "short",
    day: "numeric",
  });
}

function scoreBadgeColor(score: number): string {
  if (score >= 75) return "bg-red-500/15 text-red-700 border-red-200";
  if (score >= 55) return "bg-orange-500/15 text-orange-700 border-orange-200";
  if (score >= 35) return "bg-yellow-500/15 text-yellow-700 border-yellow-200";
  return "bg-slate-500/15 text-slate-600 border-slate-200";
}

function priorityLabel(p: string): string {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

const ENTITY_ICONS: Record<string, typeof Building2> = {
  property: Building2,
  lead: Users,
  client: UserPlus,
  deal: Briefcase,
  transaction: DollarSign,
  portal: Activity,
};

const STAGE_COLORS: Record<string, string> = {
  inquiry: "bg-slate-400",
  viewing: "bg-indigo-500",
  offer: "bg-amber-500",
  negotiation: "bg-orange-500",
  agreement: "bg-emerald-500",
  closed: "bg-green-600",
  cancelled: "bg-red-500",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const session = await getSession();
  const teamId = session?.teamId;

  // -- Fetch all data in parallel --
  const [
    propertyStats,
    leadStats,
    dealStats,
    transactionStats,
    allLeads,
    allDeals,
    allTransactions,
    allClients,
    allProperties,
  ] = await Promise.all([
    propertiesService.getStats(teamId),
    leadsService.getStats(teamId),
    dealsService.getStats(teamId),
    transactionsService.getStats(teamId),
    leadsService.getAll(teamId),
    dealsService.getAll(teamId),
    transactionsService.getAll(teamId),
    clientsService.getAll(teamId),
    propertiesService.getAll(teamId),
  ]);

  // -- Derived metrics --
  const conversionRate =
    leadStats.total > 0
      ? ((dealStats.byStage.closed / leadStats.total) * 100).toFixed(1)
      : "0";

  const avgDealValue =
    dealStats.total > 0
      ? Math.round(dealStats.totalValue / dealStats.total)
      : 0;

  // -- Lead Sources aggregation --
  const sourceMap = new Map<string, number>();
  allLeads.forEach((l) => {
    sourceMap.set(l.source, (sourceMap.get(l.source) || 0) + 1);
  });
  const leadSourceData: LeadSourceDatum[] = Array.from(
    sourceMap.entries()
  ).map(([source, count]) => ({ source, count }));

  // -- Pipeline stage data --
  const stageOrder = dealsService.getStageOrder();
  const pipelineData: PipelineStageDatum[] = stageOrder
    .filter((s) => s !== "cancelled")
    .map((stage) => {
      const stageDeals = allDeals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      };
    });

  // -- Pipeline with values for funnel visual --
  const activePipelineStages = stageOrder.filter(
    (s) => s !== "cancelled" && s !== "closed"
  );
  const totalPipelineDeals = activePipelineStages.reduce(
    (sum, s) => sum + dealStats.byStage[s],
    0
  );

  // -- Hot leads (scored) --
  const scoredLeads = scoreLeads(allLeads);
  const hotLeads = scoredLeads.slice(0, 5);

  // -- Recent activity feed --
  type ActivityItem = {
    id: string;
    type: string;
    icon: typeof Building2;
    title: string;
    subtitle: string;
    time: string;
    href: Route;
  };

  const activityItems: ActivityItem[] = [];

  allLeads.slice(0, 4).forEach((lead) => {
    activityItems.push({
      id: `lead-${lead.id}`,
      type: "lead",
      icon: Users,
      title: `New lead: ${lead.name}`,
      subtitle: `Source: ${lead.source.replace(/_/g, " ")} - ${lead.status}`,
      time: lead.createdAt,
      href: `/dashboard/leads` as Route,
    });
  });

  allDeals.slice(0, 4).forEach((deal) => {
    activityItems.push({
      id: `deal-${deal.id}`,
      type: "deal",
      icon: Briefcase,
      title: `Deal: ${deal.title}`,
      subtitle: `${deal.client.name} - ${deal.stage} - AED ${deal.value.toLocaleString()}`,
      time: deal.createdAt,
      href: `/dashboard/deals` as Route,
    });
  });

  allTransactions.slice(0, 4).forEach((txn) => {
    activityItems.push({
      id: `txn-${txn.id}`,
      type: "transaction",
      icon: DollarSign,
      title: `Transaction: ${txn.reference || txn.type}`,
      subtitle: `AED ${txn.amount.toLocaleString()} - ${txn.status}`,
      time: txn.completedAt || txn.createdAt,
      href: `/dashboard/transactions` as Route,
    });
  });

  allProperties.slice(0, 4).forEach((prop) => {
    activityItems.push({
      id: `prop-${prop.id}`,
      type: "property",
      icon: Building2,
      title: `Property: ${prop.title}`,
      subtitle: `${prop.location.area} - ${prop.status}`,
      time: prop.createdAt,
      href: `/dashboard/properties` as Route,
    });
  });

  const recentActivity = activityItems
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your executive overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={"/dashboard/properties/new" as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Building2 className="h-4 w-4" />
              Property
            </Button>
          </Link>
          <Link href={"/dashboard/leads/new" as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserPlus className="h-4 w-4" />
              Lead
            </Button>
          </Link>
          <Link href={"/dashboard/clients/new" as Route}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="h-4 w-4" />
              Client
            </Button>
          </Link>
          <Link href={"/dashboard/deals" as Route}>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* KPI Row  (6 cards)                                               */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Properties */}
        <Link href={"/dashboard/properties" as Route}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Properties
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{propertyStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {propertyStats.available} available
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Active Leads */}
        <Link href={"/dashboard/leads" as Route}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active Leads
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {leadStats.new} new this period
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Pipeline Value */}
        <Link href={"/dashboard/deals" as Route}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pipeline
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-50">
                <Briefcase className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fmtCurrency(dealStats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dealStats.total} active deals
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Revenue */}
        <Link href={"/dashboard/transactions" as Route}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Revenue
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-50">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fmtCurrency(transactionStats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactionStats.transactionCount} transactions
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Conversion Rate */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Conversion
            </CardTitle>
            <div className="p-2 rounded-lg bg-cyan-50">
              <Percent className="h-4 w-4 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dealStats.byStage.closed} closed / {leadStats.total} leads
            </p>
          </CardContent>
        </Card>

        {/* Avg Deal Value */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Avg Deal
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50">
              <BarChart3 className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtCurrency(avgDealValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              per deal average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Pipeline Funnel Visual                                           */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                Deal Pipeline
              </CardTitle>
              <CardDescription>
                {totalPipelineDeals} active deals across{" "}
                {activePipelineStages.length} stages
              </CardDescription>
            </div>
            <Link href={"/dashboard/deals" as Route}>
              <Button variant="ghost" size="sm" className="gap-1">
                View pipeline
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {totalPipelineDeals === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active deals in the pipeline yet
            </div>
          ) : (
            <div className="space-y-3">
              {activePipelineStages.map((stage) => {
                const count = dealStats.byStage[stage];
                const stageDeals = allDeals.filter((d) => d.stage === stage);
                const stageValue = stageDeals.reduce(
                  (sum, d) => sum + d.value,
                  0
                );
                const widthPercent =
                  totalPipelineDeals > 0
                    ? Math.max((count / totalPipelineDeals) * 100, 4)
                    : 0;

                return (
                  <div key={stage} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium capitalize text-right shrink-0">
                      {stage}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-muted rounded-md overflow-hidden">
                        <div
                          className={`h-full rounded-md ${STAGE_COLORS[stage] || "bg-slate-400"} transition-all duration-500 flex items-center px-3`}
                          style={{ width: `${widthPercent}%`, minWidth: "40px" }}
                        >
                          <span className="text-xs font-semibold text-white whitespace-nowrap">
                            {count}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-28 text-right shrink-0">
                      <span className="text-sm font-medium">
                        {fmtCurrency(stageValue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Charts Row                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lead Sources</CardTitle>
            <CardDescription>Where your leads are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadSourcesChart data={leadSourceData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline by Stage</CardTitle>
            <CardDescription>Deal count and value per stage</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineBarChart data={pipelineData} />
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Hot Leads + Recent Activity                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Hot Leads Table -- takes 3/5 */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-5 w-5 text-orange-500" />
                Hot Leads
              </CardTitle>
              <CardDescription>
                Top leads ranked by AI scoring
              </CardDescription>
            </div>
            <Link href={"/dashboard/leads" as Route}>
              <Button variant="ghost" size="sm" className="gap-1">
                All leads
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {hotLeads.length === 0 ? (
              <div className="text-center py-10">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No leads yet. Add your first lead to see scoring.
                </p>
                <Link href={"/dashboard/leads/new" as Route}>
                  <Button variant="outline" size="sm" className="mt-4 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Add Lead
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Source</th>
                      <th className="text-center py-2 font-medium">Score</th>
                      <th className="text-center py-2 font-medium">Priority</th>
                      <th className="text-right py-2 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b last:border-0 hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold">
                                {lead.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {lead.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {lead.email || lead.phone || "--"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 capitalize">
                          {lead.source.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs font-bold ${scoreBadgeColor(lead.scoreBreakdown.total)}`}
                          >
                            {lead.scoreBreakdown.total}
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          <Badge
                            variant={
                              lead.scoreBreakdown.priority === "urgent"
                                ? "destructive"
                                : lead.scoreBreakdown.priority === "high"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {priorityLabel(lead.scoreBreakdown.priority)}
                          </Badge>
                        </td>
                        <td className="py-3 text-right text-muted-foreground text-xs">
                          {timeAgo(lead.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity -- takes 2/5 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across the CRM</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.id} href={item.href}>
                      <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="mt-0.5 p-1.5 rounded-md bg-muted shrink-0">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                          {timeAgo(item.time)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Quick Actions                                                    */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href={"/dashboard/properties/new" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Building2 className="h-4 w-4" />
                New Property
              </Button>
            </Link>
            <Link href={"/dashboard/leads/new" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <UserPlus className="h-4 w-4" />
                New Lead
              </Button>
            </Link>
            <Link href={"/dashboard/clients/new" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Users className="h-4 w-4" />
                New Client
              </Button>
            </Link>
            <Link href={"/dashboard/deals" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Briefcase className="h-4 w-4" />
                View Deals
              </Button>
            </Link>
            <Link href={"/dashboard/transactions" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <DollarSign className="h-4 w-4" />
                Transactions
              </Button>
            </Link>
            <Link href={"/dashboard/properties" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="h-4 w-4" />
                All Properties
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Getting Started (empty state)                                    */}
      {/* ---------------------------------------------------------------- */}
      {propertyStats.total === 0 && leadStats.total === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">
                Welcome to Ilan CRM!
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first property or lead. Your
                dashboard will come to life as you add data.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={"/dashboard/properties/new" as Route}>
                  <Button variant="outline" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Add Property
                  </Button>
                </Link>
                <Link href={"/dashboard/leads/new" as Route}>
                  <Button className="gap-2">
                    <Users className="h-4 w-4" />
                    Add Lead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
