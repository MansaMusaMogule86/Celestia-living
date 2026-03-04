import Link from "next/link";
import type { Route } from "next";
import { propertiesService } from "@/server/services/propertiesService";
import { leadsService } from "@/server/services/leadsService";
import { dealsService } from "@/server/services/dealsService";
import { transactionsService } from "@/server/services/transactionsService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  // Fetch all stats
  const [propertyStats, leadStats, dealStats, transactionStats] = await Promise.all([
    propertiesService.getStats("default"),
    leadsService.getStats(),
    dealsService.getStats(),
    transactionsService.getStats(),
  ]);

  // Get recent leads and deals
  const recentLeads = await leadsService.getAll();
  const recentDeals = await dealsService.getAll();

  const statsCards: Array<{
    title: string;
    value: number | string;
    description: string;
    icon: typeof Building2;
    color: string;
    bgColor: string;
    href: Route;
  }> = [
    {
      title: "Properties",
      value: propertyStats.total,
      description: `${propertyStats.available} available`,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/properties",
    },
    {
      title: "Leads",
      value: leadStats.total,
      description: `${leadStats.new} new`,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: "/dashboard/leads",
    },
    {
      title: "Active Deals",
      value: dealStats.total,
      description: `${dealStats.closedThisMonth} closed this month`,
      icon: Briefcase,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/dashboard/deals",
    },
    {
      title: "Revenue",
      value: `AED ${transactionStats.totalRevenue.toLocaleString()}`,
      description: `${transactionStats.transactionCount} transactions`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/dashboard/transactions",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your CRM.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/properties/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </Link>
          <Link href="/dashboard/leads/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/properties/new">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Building2 className="h-5 w-5" />
                <span>New Property</span>
              </Button>
            </Link>
            <Link href="/dashboard/leads/new">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>New Lead</span>
              </Button>
            </Link>
            <Link href="/dashboard/clients/new">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Plus className="h-5 w-5" />
                <span>New Client</span>
              </Button>
            </Link>
            <Link href="/dashboard/deals">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Briefcase className="h-5 w-5" />
                <span>View Deals</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest lead activity</CardDescription>
            </div>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No leads yet</p>
                <Link href="/dashboard/leads/new">
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add your first lead
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        lead.status === "new"
                          ? "default"
                          : lead.status === "qualified"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Deals</CardTitle>
              <CardDescription>Current deal pipeline</CardDescription>
            </div>
            <Link href="/dashboard/deals">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDeals.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No deals yet</p>
                <Link href="/dashboard/deals">
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create a deal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDeals.slice(0, 5).map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {deal.client.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        AED {deal.value.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {deal.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Deal Pipeline Summary</CardTitle>
          <CardDescription>Overview of deals by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-7">
            {Object.entries(dealStats.byStage).map(([stage, count]) => (
              <div
                key={stage}
                className="text-center p-4 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-sm text-muted-foreground capitalize mt-1">
                  {stage}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started - shown when no data */}
      {propertyStats.total === 0 && leadStats.total === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">
                Welcome to Ilan CRM!
              </h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first property or lead. Your CRM
                dashboard will come to life as you add data.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard/properties/new">
                  <Button variant="outline" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Add Property
                  </Button>
                </Link>
                <Link href="/dashboard/leads/new">
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
