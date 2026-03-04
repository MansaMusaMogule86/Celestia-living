import Link from "next/link";
import { leadsService } from "@/server/services/leadsService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Plus,
    Phone,
    Mail,
    Clock,
    User,
    Filter,
    ArrowUpRight,
    Users,
} from "lucide-react";
import { LeadStatus, LeadPriority, LeadSource } from "@/lib/types";

function getStatusVariant(status: LeadStatus) {
    switch (status) {
        case "new":
            return "default";
        case "contacted":
            return "secondary";
        case "qualified":
            return "outline";
        case "negotiating":
            return "default";
        case "converted":
            return "default";
        case "lost":
            return "destructive";
        default:
            return "outline";
    }
}

function getPriorityColor(priority: LeadPriority) {
    switch (priority) {
        case "urgent":
            return "text-red-600 bg-red-50";
        case "high":
            return "text-orange-600 bg-orange-50";
        case "medium":
            return "text-yellow-600 bg-yellow-50";
        case "low":
            return "text-green-600 bg-green-50";
        default:
            return "text-gray-600 bg-gray-50";
    }
}

function getSourceLabel(source: LeadSource) {
    const labels: Record<LeadSource, string> = {
        website: "Website",
        referral: "Referral",
        bayut: "Bayut",
        property_finder: "Property Finder",
        dubizzle: "Dubizzle",
        social_media: "Social Media",
        walk_in: "Walk-in",
        other: "Other",
    };
    return labels[source];
}

function formatBudget(min: number, max: number, listingType: "sale" | "rent") {
    const formatter = new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: "compact",
    });
    const suffix = listingType === "rent" ? "/yr" : "";
    return `${formatter.format(min)} - ${formatter.format(max)}${suffix}`;
}

export default async function LeadsPage() {
    const leads = await leadsService.getAll();
    const stats = await leadsService.getStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                        Leads
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and track your leads
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Link href="/dashboard/leads/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Lead
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                        <p className="text-sm text-muted-foreground">New Leads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.qualified}</div>
                        <p className="text-sm text-muted-foreground">Qualified</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">{stats.unassigned}</div>
                        <p className="text-sm text-muted-foreground">Unassigned</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Grid or Empty State */}
            {leads.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Start capturing leads from various sources to grow your business.
                            </p>
                            <Link href="/dashboard/leads/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Your First Lead
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {leads.map((lead) => (
                        <Card key={lead.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-semibold">
                                                {lead.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{lead.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {getSourceLabel(lead.source)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        className={`text-xs ${getPriorityColor(lead.priority)}`}
                                    >
                                        {lead.priority}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{lead.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{lead.phone}</span>
                                    </div>
                                </div>

                                {lead.budget && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium">
                                            Budget: {formatBudget(
                                                lead.budget.min,
                                                lead.budget.max,
                                                lead.requirements?.listingType || "sale"
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                    <Badge variant={getStatusVariant(lead.status)}>
                                        {lead.status}
                                    </Badge>
                                    <Link href={`/dashboard/leads/${lead.id}`}>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            View
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
