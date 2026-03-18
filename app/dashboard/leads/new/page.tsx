"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Users, Save } from "lucide-react";
import { LeadStatus, LeadSource, LeadPriority, PropertyType, ListingType } from "@/lib/types";

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

const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Townhouse" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
];

const dubaiAreas = [
    "Dubai Marina",
    "Downtown Dubai",
    "Palm Jumeirah",
    "JBR",
    "Business Bay",
    "Emirates Hills",
    "Dubai Hills",
    "Arabian Ranches",
    "Jumeirah",
    "DIFC",
    "City Walk",
    "Jumeirah Lake Towers",
    "Motor City",
    "Sports City",
];

export default function NewLeadPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
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
        assignedAgent: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePropertyType = (type: PropertyType) => {
        setSelectedPropertyTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const toggleArea = (area: string) => {
        setSelectedAreas(prev =>
            prev.includes(area)
                ? prev.filter(a => a !== area)
                : [...prev, area]
        );
    };

    const toggleBedroom = (bedroom: number) => {
        setSelectedBedrooms(prev =>
            prev.includes(bedroom)
                ? prev.filter(b => b !== bedroom)
                : [...prev, bedroom]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        const budgetMin = formData.budgetMin ? Number(formData.budgetMin) : 0;
        const budgetMax = formData.budgetMax ? Number(formData.budgetMax) : 0;

        if (Number.isNaN(budgetMin) || Number.isNaN(budgetMax)) {
            setSubmitError("Budget values must be valid numbers.");
            setIsSubmitting(false);
            return;
        }

        if (budgetMin > budgetMax) {
            setSubmitError("Min budget cannot be higher than max budget.");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                status: formData.status,
                source: formData.source,
                priority: formData.priority,
                budget: {
                    min: budgetMin,
                    max: budgetMax,
                },
                requirements: {
                    type: selectedPropertyTypes,
                    areas: selectedAreas,
                    bedrooms: selectedBedrooms,
                    listingType: formData.listingType,
                },
                notes: formData.notes,
                ...(formData.assignedAgent.trim()
                    ? {
                        assignedTo: {
                            id: `agent-${formData.assignedAgent.trim().toLowerCase().replace(/\s+/g, "-")}`,
                            name: formData.assignedAgent.trim(),
                        },
                    }
                    : {}),
            };

            const response = await fetch("/api/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("[Lead] create response", { status: response.status, body: result });

            if (!response.ok || !result.success) {
                setSubmitError(result?.error || "Failed to create lead. Please try again.");
                return;
            }

            // Navigate back to the list and ensure the server data is refetched
            await router.push("/dashboard/leads");
        } catch (error) {
            console.error("Failed to create lead", error);
            setSubmitError("Failed to create lead. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/leads">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Add New Lead
                        </h1>
                        <p className="text-muted-foreground">
                            Create a new lead record
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Lead personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., John Smith"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="e.g., john.smith@email.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="e.g., +971 50 123 4567"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Additional notes about this lead..."
                                value={formData.notes}
                                onChange={handleInputChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Lead Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Status</CardTitle>
                        <CardDescription>Classification and assignment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadStatuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value) => handleSelectChange("priority", value)}
                                >
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadPriorities.map((priority) => (
                                            <SelectItem key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="source">Lead Source *</Label>
                            <Select
                                value={formData.source}
                                onValueChange={(value) => handleSelectChange("source", value)}
                            >
                                <SelectTrigger id="source">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leadSources.map((source) => (
                                        <SelectItem key={source.value} value={source.value}>
                                            {source.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="assignedAgent">Assigned Agent</Label>
                            <Input
                                id="assignedAgent"
                                name="assignedAgent"
                                placeholder="e.g., Ahmed Hassan"
                                value={formData.assignedAgent}
                                onChange={handleInputChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Budget */}
                <Card>
                    <CardHeader>
                        <CardTitle>Budget</CardTitle>
                        <CardDescription>Lead's budget range</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="listingType">Looking to</Label>
                            <Select
                                value={formData.listingType}
                                onValueChange={(value) => handleSelectChange("listingType", value)}
                            >
                                <SelectTrigger id="listingType">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sale">Buy</SelectItem>
                                    <SelectItem value="rent">Rent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="budgetMin">
                                    Min Budget (AED) {formData.listingType === "rent" ? "/year" : ""}
                                </Label>
                                <Input
                                    id="budgetMin"
                                    name="budgetMin"
                                    type="number"
                                    placeholder="e.g., 2000000"
                                    value={formData.budgetMin}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budgetMax">
                                    Max Budget (AED) {formData.listingType === "rent" ? "/year" : ""}
                                </Label>
                                <Input
                                    id="budgetMax"
                                    name="budgetMax"
                                    type="number"
                                    placeholder="e.g., 3500000"
                                    value={formData.budgetMax}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Requirements</CardTitle>
                        <CardDescription>What the lead is looking for</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Property Types</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {propertyTypes.map((type) => (
                                    <div key={type.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`type-${type.value}`}
                                            checked={selectedPropertyTypes.includes(type.value)}
                                            onCheckedChange={() => togglePropertyType(type.value)}
                                        />
                                        <Label
                                            htmlFor={`type-${type.value}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {type.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Bedrooms</Label>
                            <div className="flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map((bedroom) => (
                                    <Button
                                        key={bedroom}
                                        type="button"
                                        variant={selectedBedrooms.includes(bedroom) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleBedroom(bedroom)}
                                    >
                                        {bedroom === 0 ? "Studio" : `${bedroom} BR`}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Preferred Areas</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {dubaiAreas.map((area) => (
                                    <div key={area} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`area-${area}`}
                                            checked={selectedAreas.includes(area)}
                                            onCheckedChange={() => toggleArea(area)}
                                        />
                                        <Label
                                            htmlFor={`area-${area}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {area}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="lg:col-span-2 flex justify-end gap-4">
                    {submitError && (
                        <p className="text-sm text-red-600 mr-auto self-center">{submitError}</p>
                    )}
                    <Link href="/dashboard/leads">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Lead"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
