"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Building2,
    Users,
    DollarSign,
    BarChart3,
    Download,
    Calendar,
} from "lucide-react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
} from "recharts";

// Mock analytics data
const monthlyRevenue = [
    { month: "Jul", sales: 4200000, rentals: 820000 },
    { month: "Aug", sales: 3800000, rentals: 950000 },
    { month: "Sep", sales: 5100000, rentals: 780000 },
    { month: "Oct", sales: 4700000, rentals: 1100000 },
    { month: "Nov", sales: 6200000, rentals: 980000 },
    { month: "Dec", sales: 5500000, rentals: 1200000 },
    { month: "Jan", sales: 7100000, rentals: 1050000 },
    { month: "Feb", sales: 6800000, rentals: 1300000 },
];

const leadConversion = [
    { month: "Jul", leads: 45, converted: 6 },
    { month: "Aug", leads: 52, converted: 8 },
    { month: "Sep", leads: 38, converted: 5 },
    { month: "Oct", leads: 61, converted: 11 },
    { month: "Nov", leads: 55, converted: 9 },
    { month: "Dec", leads: 48, converted: 7 },
    { month: "Jan", leads: 67, converted: 13 },
    { month: "Feb", leads: 58, converted: 10 },
];

const dealsByStage = [
    { stage: "Inquiry", count: 12, value: 18000000 },
    { stage: "Viewing", count: 8, value: 14500000 },
    { stage: "Offer", count: 5, value: 9200000 },
    { stage: "Negotiation", count: 4, value: 7800000 },
    { stage: "Agreement", count: 3, value: 6100000 },
    { stage: "Closed", count: 6, value: 12400000 },
];

const propertyTypeDistribution = [
    { name: "Apartment", value: 35, color: "#3b82f6" },
    { name: "Villa", value: 18, color: "#10b981" },
    { name: "Townhouse", value: 12, color: "#f59e0b" },
    { name: "Penthouse", value: 8, color: "#8b5cf6" },
    { name: "Studio", value: 15, color: "#ef4444" },
    { name: "Office", value: 9, color: "#06b6d4" },
];

const leadSources = [
    { source: "Website", count: 42 },
    { source: "Bayut", count: 35 },
    { source: "PF", count: 28 },
    { source: "Dubizzle", count: 22 },
    { source: "Referral", count: 18 },
    { source: "Social", count: 11 },
];

const analyticsData = {
    revenue: { current: 8100000, previous: 6200000, growth: 30.6 },
    properties: { active: 47, sold: 12, rented: 8 },
    leads: { total: 156, converted: 24, conversionRate: 15.4 },
    deals: { active: 18, closed: 6, pipeline: 68000000 },
    topAreas: [
        { name: "Dubai Marina", deals: 8, revenue: 24500000 },
        { name: "Downtown Dubai", deals: 6, revenue: 31200000 },
        { name: "Palm Jumeirah", deals: 4, revenue: 28700000 },
        { name: "Business Bay", deals: 5, revenue: 15400000 },
        { name: "JBR", deals: 3, revenue: 9800000 },
    ],
    topAgents: [
        { name: "Ahmed Hassan", deals: 8, commission: 640000 },
        { name: "Sarah Mitchell", deals: 6, commission: 480000 },
        { name: "Omar Khalid", deals: 5, commission: 320000 },
    ],
};

function formatCurrency(amount: number): string {
    if (amount >= 1000000) return `AED ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `AED ${(amount / 1000).toFixed(0)}K`;
    return `AED ${amount.toLocaleString()}`;
}

function formatCompact(amount: number): string {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toString();
}

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Performance metrics and market insights
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analyticsData.revenue.current)}
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">+{analyticsData.revenue.growth}%</span>
                            <span className="text-muted-foreground">vs last period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.properties.active}</div>
                        <div className="flex gap-2 text-xs mt-1">
                            <span className="text-green-600">{analyticsData.properties.sold} sold</span>
                            <span className="text-blue-600">{analyticsData.properties.rented} rented</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lead Conversion</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.leads.conversionRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analyticsData.leads.converted} of {analyticsData.leads.total} leads
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analyticsData.deals.pipeline)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {analyticsData.deals.active} active deals
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue from sales and rentals</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={monthlyRevenue}>
                            <defs>
                                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="rentalsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                            <YAxis
                                stroke="#9ca3af"
                                fontSize={12}
                                tickFormatter={(v) => formatCompact(v)}
                            />
                            <Tooltip
                                formatter={(value: number) => [formatCurrency(value)]}
                                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#3b82f6"
                                fill="url(#salesGradient)"
                                strokeWidth={2}
                                name="Sales"
                            />
                            <Area
                                type="monotone"
                                dataKey="rentals"
                                stroke="#10b981"
                                fill="url(#rentalsGradient)"
                                strokeWidth={2}
                                name="Rentals"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Lead Conversion */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Conversion Trend</CardTitle>
                        <CardDescription>Monthly leads vs conversions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={leadConversion}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                />
                                <Legend />
                                <Bar dataKey="leads" fill="#93c5fd" name="Total Leads" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="converted" fill="#3b82f6" name="Converted" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Property Type Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Types</CardTitle>
                        <CardDescription>Distribution by property type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={propertyTypeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {propertyTypeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`${value} listings`]}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Deal Pipeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Pipeline</CardTitle>
                        <CardDescription>Deals by stage and value</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={dealsByStage} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => formatCompact(v)} />
                                <YAxis type="category" dataKey="stage" stroke="#9ca3af" fontSize={12} width={80} />
                                <Tooltip
                                    formatter={(value: number) => [formatCurrency(value)]}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" name="Pipeline Value" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Lead Sources */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                        <CardDescription>Where your leads come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={leadSources}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="source" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                />
                                <Bar dataKey="count" fill="#10b981" name="Leads" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Areas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Performing Areas</CardTitle>
                        <CardDescription>By number of deals closed</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analyticsData.topAreas.map((area, index) => (
                                <div key={area.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{area.name}</div>
                                            <div className="text-xs text-muted-foreground">{area.deals} deals</div>
                                        </div>
                                    </div>
                                    <div className="font-semibold">{formatCurrency(area.revenue)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Agents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agent Leaderboard</CardTitle>
                        <CardDescription>Top performers this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analyticsData.topAgents.map((agent, index) => (
                                <div key={agent.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"}`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{agent.name}</div>
                                            <div className="text-xs text-muted-foreground">{agent.deals} deals closed</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{formatCurrency(agent.commission)}</div>
                                        <div className="text-xs text-muted-foreground">commission</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Market Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Market Insights</CardTitle>
                    <CardDescription>Dubai real estate market trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-700 dark:text-green-400">Market Up</span>
                            </div>
                            <div className="text-2xl font-bold">+8.2%</div>
                            <p className="text-sm text-muted-foreground mt-1">Average property value increase YoY</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-700 dark:text-blue-400">High Demand</span>
                            </div>
                            <div className="text-2xl font-bold">23 days</div>
                            <p className="text-sm text-muted-foreground mt-1">Average time to sale in prime areas</p>
                        </div>
                        <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-purple-600" />
                                <span className="font-medium text-purple-700 dark:text-purple-400">Rental Yield</span>
                            </div>
                            <div className="text-2xl font-bold">6.4%</div>
                            <p className="text-sm text-muted-foreground mt-1">Average gross rental yield in Dubai</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
