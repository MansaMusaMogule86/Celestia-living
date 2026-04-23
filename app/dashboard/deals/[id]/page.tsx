"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Briefcase,
    User,
    Building2,
    DollarSign,
    Calendar,
    Clock,
    MessageSquare,
    Phone,
    Mail,
    Eye,
    FileText,
    Plus,
    CheckCircle2,
} from "lucide-react";
import { Deal, DealStage, DealActivity } from "@/lib/types";
import { toast } from "sonner";

const stageConfig: Record<DealStage, { label: string; color: string; bgColor: string; step: number }> = {
    inquiry: { label: "Inquiry", color: "text-slate-600", bgColor: "bg-slate-100", step: 1 },
    viewing: { label: "Viewing", color: "text-blue-600", bgColor: "bg-blue-100", step: 2 },
    offer: { label: "Offer", color: "text-amber-600", bgColor: "bg-amber-100", step: 3 },
    negotiation: { label: "Negotiation", color: "text-orange-600", bgColor: "bg-orange-100", step: 4 },
    agreement: { label: "Agreement", color: "text-purple-600", bgColor: "bg-purple-100", step: 5 },
    closed: { label: "Closed", color: "text-green-600", bgColor: "bg-green-100", step: 6 },
    cancelled: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-100", step: 0 },
};

const activityIcons: Record<string, React.ElementType> = {
    note: MessageSquare,
    viewing: Eye,
    offer: FileText,
    call: Phone,
    email: Mail,
    meeting: User,
};

function formatCurrency(amount: number): string {
    if (amount === 0) return "TBD";
    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// Mock deal for demo when no real data
const emptyDeal: Deal = {
    id: "",
    title: "",
    type: "sale",
    stage: "inquiry",
    property: { id: "", title: "" },
    client: { id: "", name: "" },
    value: 0,
    commission: 0,
    agent: { id: "", name: "" },
    expectedCloseDate: "",
    notes: "",
    activities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

export default function DealDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [newNote, setNewNote] = useState("");

    const dealStageOrder: DealStage[] = ["inquiry", "viewing", "offer", "negotiation", "agreement", "closed"];

    const handleAdvanceStage = async () => {
        if (!deal) {
            return;
        }

        const currentIndex = dealStageOrder.indexOf(deal.stage);
        if (currentIndex < 0 || currentIndex >= dealStageOrder.length - 1) {
            toast.message("Deal is already at the final stage");
            return;
        }

        const nextStage = dealStageOrder[currentIndex + 1];
        setActionLoading(true);
        try {
            const res = await fetch(`/api/deals/${deal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stage: nextStage }),
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                toast.error(json.message || "Failed to advance deal stage");
                return;
            }

            setDeal(json.data as Deal);
            toast.success("Deal stage updated");
        } catch {
            toast.error("Failed to advance deal stage");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteDeal = async () => {
        if (!deal) {
            return;
        }

        const confirmed = window.confirm("Delete this deal? This action cannot be undone.");
        if (!confirmed) {
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
            const json = await res.json();

            if (!res.ok || !json.success) {
                if (res.status === 403) {
                    toast.error("Only managers or admins can delete deals");
                    return;
                }
                toast.error(json.message || "Failed to delete deal");
                return;
            }

            toast.success("Deal deleted");
            router.refresh();
            router.push("/dashboard/deals");
        } catch {
            toast.error("Failed to delete deal");
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const dealId = Array.isArray(params.id) ? params.id[0] : params.id;
                const res = await fetch(`/api/deals/${dealId}`, { cache: "no-store" });
                const json = await res.json();
                if (!res.ok || !json.success) {
                    setDeal(null);
                    return;
                }
                setDeal(json.data as Deal);
            } catch {
                setDeal(null);
            } finally {
                setLoading(false);
            }
        };

        void run();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading deal...</div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Deals
                </Button>

                <Card>
                    <CardContent className="py-16">
                        <div className="text-center">
                            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Deal not found</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                This deal doesn&apos;t exist yet. Create a new deal to get started.
                            </p>
                            <Link href="/dashboard/deals/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create New Deal
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const stages = Object.entries(stageConfig).filter(([key]) => key !== "cancelled");
    const currentStep = stageConfig[deal.stage].step;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{deal.title}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="capitalize">{deal.type}</Badge>
                            <Badge className={`${stageConfig[deal.stage].bgColor} ${stageConfig[deal.stage].color} border-0`}>
                                {stageConfig[deal.stage].label}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/dashboard/deals/${deal.id}/edit`}>
                        <Button variant="outline">Edit Deal</Button>
                    </Link>
                    <Button onClick={handleAdvanceStage} disabled={actionLoading}>
                        Advance Stage
                    </Button>
                    <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={handleDeleteDeal}
                        disabled={actionLoading}
                    >
                        Delete Deal
                    </Button>
                </div>
            </div>

            {/* Stage Progress */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        {stages.map(([key, config], index) => (
                            <div key={key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                                            config.step <= currentStep
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-muted text-muted-foreground border-muted"
                                        }`}
                                    >
                                        {config.step <= currentStep ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            config.step
                                        )}
                                    </div>
                                    <span className="text-xs font-medium">{config.label}</span>
                                </div>
                                {index < stages.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 ${
                                            config.step < currentStep ? "bg-primary" : "bg-muted"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Deal Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Deal Value</p>
                                        <p className="font-semibold text-lg">{formatCurrency(deal.value)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Commission</p>
                                        <p className="font-semibold text-lg">{formatCurrency(deal.commission)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Property</p>
                                        <Link
                                            href={`/dashboard/properties/${deal.property.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {deal.property.title}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Expected Close</p>
                                        <p className="font-medium">{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "Not set"}</p>
                                    </div>
                                </div>
                            </div>

                            {deal.notes && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm">{deal.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Timeline</CardTitle>
                            <CardDescription>All activities related to this deal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {deal.activities.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    No activities recorded yet
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {deal.activities.map((activity) => {
                                        const Icon = activityIcons[activity.type] || MessageSquare;
                                        return (
                                            <div key={activity.id} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Icon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium capitalize">{activity.type}</p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(activity.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        by {activity.createdBy.name}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Add Note */}
                            <div className="mt-6 pt-4 border-t">
                                <p className="text-sm font-medium mb-2">Add a note</p>
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Write a note about this deal..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </div>
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
                    {/* Client Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Client</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="font-semibold">
                                        {deal.client.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <Link
                                        href={`/dashboard/clients/${deal.client.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {deal.client.name}
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Agent Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Assigned Agent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <span className="font-semibold text-emerald-600">
                                        {deal.agent.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{deal.agent.name}</p>
                                    <p className="text-sm text-muted-foreground">Agent</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Key Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Created:</span>
                                <span className="font-medium">{formatDate(deal.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="font-medium">{formatDate(deal.updatedAt)}</span>
                            </div>
                            {deal.actualCloseDate && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-muted-foreground">Closed:</span>
                                    <span className="font-medium">{formatDate(deal.actualCloseDate)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
