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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { Lead, LeadStatus, LeadSource, LeadPriority, PropertyType, ListingType } from "@/lib/types";
import { toast } from "sonner";

const leadStatuses: { value: LeadStatus; label: string }[] = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "negotiating", label: "Negotiating" },
    { value: "converted", label: "Converted" },
    { value: "lost", label: "Lost" },
];

const leadSources: { value: LeadSource; label: string }[] = [
    { value: "website", label: "Website" },
    { value: "referral", label: "Referral" },
    { value: "bayut", label: "Bayut" },
    { value: "property_finder", label: "Property Finder" },
    { value: "dubizzle", label: "Dubizzle" },
    { value: "social_media", label: "Social Media" },
    { value: "walk_in", label: "Walk-in" },
    { value: "other", label: "Other" },
];

const leadPriorities: { value: LeadPriority; label: string }[] = [
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
];

const propertyTypeOptions: { value: PropertyType; label: string }[] = [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Townhouse" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
];

const dubaiAreas = [
    "Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "JBR",
    "Business Bay", "Emirates Hills", "Dubai Hills", "Arabian Ranches",
    "Jumeirah", "DIFC", "City Walk", "Jumeirah Lake Towers",
    "Motor City", "Sports City",
];

const bedroomOptions = [0, 1, 2, 3, 4, 5];

export default function EditLeadPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        status: "new" as LeadStatus,
        source: "website" as LeadSource,
        priority: "medium" as LeadPriority,
        budgetMin: "",
        budgetMax: "",
        listingType: "sale" as ListingType,
        notes: "",
    });

    useEffect(() => {
        fetch(`/api/leads/${id}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    const lead: Lead = json.data;
                    setFormData({
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        status: lead.status,
                        source: lead.source,
                        priority: lead.priority,
                        budgetMin: String(lead.budget?.min ?? 0),
                        budgetMax: String(lead.budget?.max ?? 0),
                        listingType: lead.requirements?.listingType ?? "sale",
                        notes: lead.notes ?? "",
                    });
                    setSelectedPropertyTypes(lead.requirements?.type ?? []);
                    setSelectedAreas(lead.requirements?.areas ?? []);
                    setSelectedBedrooms(lead.requirements?.bedrooms ?? []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePropertyType = (type: PropertyType) => {
        setSelectedPropertyTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const toggleArea = (area: string) => {
        setSelectedAreas((prev) =>
            prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
        );
    };

    const toggleBedroom = (bed: number) => {
        setSelectedBedrooms((prev) =>
            prev.includes(bed) ? prev.filter((b) => b !== bed) : [...prev, bed]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    status: formData.status,
                    source: formData.source,
                    priority: formData.priority,
                    budget: {
                        min: Number(formData.budgetMin) || 0,
                        max: Number(formData.budgetMax) || 0,
                    },
                    requirements: {
                        type: selectedPropertyTypes,
                        bedrooms: selectedBedrooms,
                        areas: selectedAreas,
                        listingType: formData.listingType,
                    },
                    notes: formData.notes,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json?.error || "Failed to update lead");
                return;
            }

            toast.success("Lead updated successfully");
            router.refresh();
            router.push(`/dashboard/leads/${id}`);
        } catch {
            setError("Failed to update lead");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading lead...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/leads/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Edit Lead
                    </h1>
                    <p className="text-muted-foreground">Update lead information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                    </CardContent>
                </Card>

                {/* Lead Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData((p) => ({ ...p, status: v as LeadStatus }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {leadStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Source</Label>
                            <Select value={formData.source} onValueChange={(v) => setFormData((p) => ({ ...p, source: v as LeadSource }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {leadSources.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData((p) => ({ ...p, priority: v as LeadPriority }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {leadPriorities.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Looking to</Label>
                            <Select value={formData.listingType} onValueChange={(v) => setFormData((p) => ({ ...p, listingType: v as ListingType }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sale">Buy</SelectItem>
                                    <SelectItem value="rent">Rent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Budget */}
                <Card>
                    <CardHeader>
                        <CardTitle>Budget Range (AED)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budgetMin">Minimum</Label>
                            <Input id="budgetMin" name="budgetMin" type="number" min={0} value={formData.budgetMin} onChange={handleInputChange} placeholder="500000" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="budgetMax">Maximum</Label>
                            <Input id="budgetMax" name="budgetMax" type="number" min={0} value={formData.budgetMax} onChange={handleInputChange} placeholder="2000000" />
                        </div>
                    </CardContent>
                </Card>

                {/* Property Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="mb-2 block">Property Types</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {propertyTypeOptions.map((pt) => (
                                    <div key={pt.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`pt-${pt.value}`}
                                            checked={selectedPropertyTypes.includes(pt.value)}
                                            onCheckedChange={() => togglePropertyType(pt.value)}
                                        />
                                        <Label htmlFor={`pt-${pt.value}`} className="cursor-pointer font-normal text-sm">{pt.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Bedrooms</Label>
                            <div className="flex flex-wrap gap-2">
                                {bedroomOptions.map((bed) => (
                                    <div key={bed} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`bed-${bed}`}
                                            checked={selectedBedrooms.includes(bed)}
                                            onCheckedChange={() => toggleBedroom(bed)}
                                        />
                                        <Label htmlFor={`bed-${bed}`} className="cursor-pointer font-normal text-sm">
                                            {bed === 0 ? "Studio" : `${bed} BR`}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferred Areas */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Preferred Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {dubaiAreas.map((area) => (
                                <div key={area} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`area-${area}`}
                                        checked={selectedAreas.includes(area)}
                                        onCheckedChange={() => toggleArea(area)}
                                    />
                                    <Label htmlFor={`area-${area}`} className="cursor-pointer font-normal text-sm">{area}</Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any notes about this lead..." rows={4} />
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
                        <Link href={`/dashboard/leads/${id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
