"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Users,
    User,
    Phone,
    Mail,
    MapPin,
    DollarSign,
    Calendar,
    Clock,
    Tag,
    Building2,
    MessageSquare,
    Plus,
    Bed,
    ArrowUpRight,
} from "lucide-react";
import { Lead, LeadStatus, LeadPriority, LeadSource } from "@/lib/types";

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
    new: { label: "New", color: "text-blue-700", bgColor: "bg-blue-100" },
    contacted: { label: "Contacted", color: "text-sky-700", bgColor: "bg-sky-100" },
    qualified: { label: "Qualified", color: "text-green-700", bgColor: "bg-green-100" },
    negotiating: { label: "Negotiating", color: "text-amber-700", bgColor: "bg-amber-100" },
    converted: { label: "Converted", color: "text-emerald-700", bgColor: "bg-emerald-100" },
    lost: { label: "Lost", color: "text-red-700", bgColor: "bg-red-100" },
};

const priorityConfig: Record<LeadPriority, { label: string; color: string }> = {
    urgent: { label: "Urgent", color: "text-red-600 bg-red-50" },
    high: { label: "High", color: "text-orange-600 bg-orange-50" },
    medium: { label: "Medium", color: "text-yellow-600 bg-yellow-50" },
    low: { label: "Low", color: "text-green-600 bg-green-50" },
};

const sourceLabels: Record<LeadSource, string> = {
    website: "Website",
    bayut: "Bayut",
    property_finder: "Property Finder",
    dubizzle: "Dubizzle",
    referral: "Referral",
    walk_in: "Walk-in",
    social_media: "Social Media",
    other: "Other",
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: "compact",
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function LeadDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        // Simulate fetching lead - in production, call API
        setLoading(false);
        setLead(null);
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading lead...</div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Leads
                </Button>

                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Lead not found</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                This lead doesn&apos;t exist yet. Add a new lead to get started.
                            </p>
                            <Link href="/dashboard/leads/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New Lead
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusCfg = statusConfig[lead.status];
    const priorityCfg = priorityConfig[lead.priority];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xl font-semibold">{lead.name.charAt(0)}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{lead.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${statusCfg.bgColor} ${statusCfg.color} border-0`}>
                                    {statusCfg.label}
                                </Badge>
                                <Badge className={`${priorityCfg.color} border-0`}>
                                    {priorityCfg.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    via {sourceLabels[lead.source]}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Edit Lead</Button>
                    <Button>Convert to Client</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <a href={`mailto:${lead.email}`} className="font-medium text-primary hover:underline">
                                            {lead.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <a href={`tel:${lead.phone}`} className="font-medium text-primary hover:underline">
                                            {lead.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Requirements</CardTitle>
                            <CardDescription>What this lead is looking for</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Budget Range</p>
                                        <p className="font-medium">
                                            {formatCurrency(lead.budget.min)} - {formatCurrency(lead.budget.max)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Property Types</p>
                                        <div className="flex gap-1 flex-wrap mt-0.5">
                                            {lead.requirements.type.map(t => (
                                                <Badge key={t} variant="outline" className="capitalize text-xs">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Bed className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                                        <p className="font-medium">
                                            {lead.requirements.bedrooms.join(", ")} BR
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Preferred Areas</p>
                                        <p className="font-medium">
                                            {lead.requirements.areas.join(", ")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lead.notes ? (
                                <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No notes yet</p>
                            )}

                            <div className="mt-6 pt-4 border-t">
                                <p className="text-sm font-medium mb-2">Add a note</p>
                                <Textarea
                                    placeholder="Write a note about this lead..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <Button className="mt-2 gap-2" size="sm" disabled={!newNote.trim()}>
                                    <Plus className="h-4 w-4" />
                                    Add Note
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Assigned Agent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lead.assignedTo ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <span className="font-semibold text-emerald-600">
                                            {lead.assignedTo.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{lead.assignedTo.name}</p>
                                        <p className="text-sm text-muted-foreground">Agent</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground mb-2">Not assigned</p>
                                    <Button variant="outline" size="sm">Assign Agent</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                                <Phone className="h-4 w-4" />
                                Log Call
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                                <Mail className="h-4 w-4" />
                                Send Email
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                                <Calendar className="h-4 w-4" />
                                Schedule Viewing
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                                <Building2 className="h-4 w-4" />
                                Match Properties
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Key Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Created:</span>
                                <span className="font-medium">{formatDate(lead.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="font-medium">{formatDate(lead.updatedAt)}</span>
                            </div>
                            {lead.lastContactedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Last contact:</span>
                                    <span className="font-medium">{formatDate(lead.lastContactedAt)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
