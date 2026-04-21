"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Activity,
    Search,
    Filter,
    Building2,
    Users,
    Briefcase,
    UserRound,
    DollarSign,
    Settings,
    Globe,
    Clock,
    ArrowUpRight,
} from "lucide-react";

interface ActivityEntry {
    id: string;
    action: string;
    entityType: "property" | "lead" | "client" | "deal" | "transaction" | "portal" | "settings";
    entityId: string;
    entityName: string;
    userId: string;
    userName: string;
    metadata?: Record<string, string>;
    createdAt: string;
}

const entityConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
    property: { icon: Building2, color: "text-blue-600", bgColor: "bg-blue-100" },
    lead: { icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-100" },
    client: { icon: UserRound, color: "text-purple-600", bgColor: "bg-purple-100" },
    deal: { icon: Briefcase, color: "text-amber-600", bgColor: "bg-amber-100" },
    transaction: { icon: DollarSign, color: "text-green-600", bgColor: "bg-green-100" },
    portal: { icon: Globe, color: "text-sky-600", bgColor: "bg-sky-100" },
    settings: { icon: Settings, color: "text-gray-600", bgColor: "bg-gray-100" },
};

const mockActivities: ActivityEntry[] = [];

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-AE", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityEntry[]>(mockActivities);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch("/api/activity", { cache: "no-store" });
                const result = await response.json();

                if (!response.ok || !result?.success) {
                    throw new Error(result?.error || "Failed to load activity");
                }

                setActivities(result.data || []);
            } catch (loadError: unknown) {
                const message = loadError instanceof Error ? loadError.message : "Failed to load activity";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, []);

    const filteredActivities = activities.filter(a => {
        const matchesSearch =
            !searchQuery ||
            a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.userName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === "all" || a.entityType === filterType;

        return matchesSearch && matchesType;
    });

    // Group activities by date
    const groupedActivities: Record<string, ActivityEntry[]> = {};
    filteredActivities.forEach(a => {
        const dateKey = new Date(a.createdAt).toLocaleDateString("en-AE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        if (!groupedActivities[dateKey]) {
            groupedActivities[dateKey] = [];
        }
        groupedActivities[dateKey].push(a);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-8 w-8 text-primary" />
                        Activity Log
                    </h1>
                    <p className="text-muted-foreground">
                        Track all actions across your CRM
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="property">Properties</SelectItem>
                        <SelectItem value="lead">Leads</SelectItem>
                        <SelectItem value="client">Clients</SelectItem>
                        <SelectItem value="deal">Deals</SelectItem>
                        <SelectItem value="transaction">Transactions</SelectItem>
                        <SelectItem value="portal">Portals</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Activity List */}
            {loading ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center text-muted-foreground">Loading activity...</div>
                    </CardContent>
                </Card>
            ) : error ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center text-destructive">{error}</div>
                    </CardContent>
                </Card>
            ) : filteredActivities.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Activity className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Activities will appear here as you interact with the CRM.
                                Create properties, add leads, or manage deals to see activity.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedActivities).map(([dateKey, dateActivities]) => (
                        <div key={dateKey}>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">{dateKey}</h3>
                            <Card>
                                <CardContent className="divide-y p-0">
                                    {dateActivities.map((activity) => {
                                        const config = entityConfig[activity.entityType];
                                        const Icon = config.icon;

                                        return (
                                            <div key={activity.id} className="flex items-start gap-4 p-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                                                    <Icon className={`h-5 w-5 ${config.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">
                                                        <span className="font-medium">{activity.userName}</span>
                                                        {" "}
                                                        <span className="text-muted-foreground">{activity.action}</span>
                                                        {" "}
                                                        <span className="font-medium">{activity.entityName}</span>
                                                    </p>
                                                    {activity.metadata && (
                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                            {Object.entries(activity.metadata).map(([key, value]) => (
                                                                <Badge key={key} variant="outline" className="text-xs">
                                                                    {key}: {value}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span title={formatFullDate(activity.createdAt)}>
                                                            {formatRelativeTime(activity.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="flex-shrink-0">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
