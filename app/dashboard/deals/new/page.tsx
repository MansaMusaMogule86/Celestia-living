"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Briefcase } from "lucide-react";

export default function NewDealPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        type: "sale",
        stage: "inquiry",
        propertyTitle: "",
        clientName: "",
        value: "",
        commission: "",
        expectedCloseDate: "",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        const value = Number(formData.value || 0);
        const commission = Number(formData.commission || 0);

        if (Number.isNaN(value) || Number.isNaN(commission)) {
            setSubmitError("Value and commission must be valid numbers");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
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
                agent: {
                    id: "agent-current",
                    name: "Current Agent",
                },
            };

            const res = await fetch("/api/deals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            console.log("[Deal] create response", { status: res.status, body: json });
            if (!res.ok || !json.success) {
                setSubmitError(json?.error || "Failed to create deal");
                return;
            }

            // Navigate back to the list and ensure the server data is refetched
            router.refresh();
            await router.push("/dashboard/deals");
        } catch (error) {
            console.error("Failed to create deal", error);
            setSubmitError("Failed to create deal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/deals">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-primary" />
                        Create New Deal
                    </h1>
                    <p className="text-muted-foreground">
                        Add a new deal to your pipeline
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Deal Information</CardTitle>
                                <CardDescription>
                                    Basic details about the deal
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Deal Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., 3BR Apartment Sale - Dubai Marina"
                                        value={formData.title}
                                        onChange={(e) => updateField("title", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Deal Type *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => updateField("type", value)}
                                        >
                                            <SelectTrigger id="type" aria-label="Select deal type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sale">Sale</SelectItem>
                                                <SelectItem value="rental">Rental</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="stage">Current Stage *</Label>
                                        <Select
                                            value={formData.stage}
                                            onValueChange={(value) => updateField("stage", value)}
                                        >
                                            <SelectTrigger id="stage" aria-label="Select deal stage">
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="inquiry">Inquiry</SelectItem>
                                                <SelectItem value="viewing">Viewing</SelectItem>
                                                <SelectItem value="offer">Offer</SelectItem>
                                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                                <SelectItem value="agreement">Agreement</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="propertyTitle">Property *</Label>
                                    <Input
                                        id="propertyTitle"
                                        placeholder="Enter property title or select from existing"
                                        value={formData.propertyTitle}
                                        onChange={(e) => updateField("propertyTitle", e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        In full version, this would be a searchable dropdown of your properties
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientName">Client *</Label>
                                    <Input
                                        id="clientName"
                                        placeholder="Enter client name or select from existing"
                                        value={formData.clientName}
                                        onChange={(e) => updateField("clientName", e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        In full version, this would be a searchable dropdown of your clients
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Details</CardTitle>
                                <CardDescription>
                                    Deal value and commission
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Deal Value (AED) *</Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            placeholder="e.g., 2500000"
                                            value={formData.value}
                                            onChange={(e) => updateField("value", e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="commission">Commission (AED)</Label>
                                        <Input
                                            id="commission"
                                            type="number"
                                            placeholder="e.g., 50000"
                                            value={formData.commission}
                                            onChange={(e) => updateField("commission", e.target.value)}
                                        />
                                    </div>
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                                <CardDescription>
                                    Additional information about the deal
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any notes about the deal, client requirements, negotiation history..."
                                    value={formData.notes}
                                    onChange={(e) => updateField("notes", e.target.value)}
                                    className="min-h-[120px]"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting ? "Creating..." : "Create Deal"}
                                </Button>
                                <Link href="/dashboard/deals" className="block">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>• Link deals to existing properties and clients for better tracking</p>
                                <p>• Set realistic expected close dates for pipeline forecasting</p>
                                <p>• Update the stage as the deal progresses</p>
                                <p>• Add notes after each client interaction</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
