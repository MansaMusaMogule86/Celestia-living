"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import { Deal, DealStage } from "@/lib/types";
import { toast } from "sonner";

const dealStages: { value: DealStage; label: string }[] = [
    { value: "inquiry", label: "Inquiry" },
    { value: "viewing", label: "Viewing" },
    { value: "offer", label: "Offer" },
    { value: "negotiation", label: "Negotiation" },
    { value: "agreement", label: "Agreement" },
    { value: "closed", label: "Closed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function EditDealPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        type: "sale",
        stage: "inquiry" as DealStage,
        propertyTitle: "",
        clientName: "",
        value: "",
        commission: "",
        expectedCloseDate: "",
        notes: "",
    });

    useEffect(() => {
        fetch(`/api/deals/${id}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    const deal: Deal = json.data;
                    setFormData({
                        title: deal.title,
                        type: deal.type,
                        stage: deal.stage,
                        propertyTitle: deal.property?.title ?? "",
                        clientName: deal.client?.name ?? "",
                        value: String(deal.value ?? 0),
                        commission: String(deal.commission ?? 0),
                        expectedCloseDate: deal.expectedCloseDate
                            ? deal.expectedCloseDate.substring(0, 10)
                            : "",
                        notes: deal.notes ?? "",
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const value = Number(formData.value || 0);
        const commission = Number(formData.commission || 0);
        if (Number.isNaN(value) || Number.isNaN(commission)) {
            setError("Value and commission must be valid numbers");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/deals/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    type: formData.type,
                    stage: formData.stage,
                    property: {
                        id: `property-${formData.propertyTitle.trim().toLowerCase().replace(/\s+/g, "-")}`,
                        title: formData.propertyTitle.trim(),
                    },
                    client: {
                        id: `client-${formData.clientName.trim().toLowerCase().replace(/\s+/g, "-")}`,
                        name: formData.clientName.trim(),
                    },
                    value,
                    commission,
                    expectedCloseDate: formData.expectedCloseDate,
                    notes: formData.notes,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json?.error || "Failed to update deal");
                return;
            }

            toast.success("Deal updated successfully");
            router.push(`/dashboard/deals/${id}`);
        } catch {
            setError("Failed to update deal");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading deal...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/deals/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-primary" />
                        Edit Deal
                    </h1>
                    <p className="text-muted-foreground">Update deal information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Deal Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Deal Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="e.g. Marina Apartment Purchase"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Deal Type</Label>
                            <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sale">Sale</SelectItem>
                                    <SelectItem value="rental">Rental</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select value={formData.stage} onValueChange={(v) => updateField("stage", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {dealStages.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                            <Input
                                id="expectedCloseDate"
                                type="date"
                                value={formData.expectedCloseDate}
                                onChange={(e) => updateField("expectedCloseDate", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Parties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Parties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="propertyTitle">Property</Label>
                            <Input
                                id="propertyTitle"
                                value={formData.propertyTitle}
                                onChange={(e) => updateField("propertyTitle", e.target.value)}
                                placeholder="Property title or reference"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                value={formData.clientName}
                                onChange={(e) => updateField("clientName", e.target.value)}
                                placeholder="Client full name"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Financial */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financials (AED)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Deal Value</Label>
                            <Input
                                id="value"
                                type="number"
                                min={0}
                                value={formData.value}
                                onChange={(e) => updateField("value", e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="commission">Commission</Label>
                            <Input
                                id="commission"
                                type="number"
                                min={0}
                                value={formData.commission}
                                onChange={(e) => updateField("commission", e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder="Any notes about this deal..."
                            rows={5}
                        />
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="lg:col-span-2">
                    {error && (
                        <p className="text-sm text-destructive mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2">
                            {error}
                        </p>
                    )}
                    <div className="flex gap-3">
                        <Button type="submit" disabled={saving} className="gap-2">
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                        <Link href={`/dashboard/deals/${id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
