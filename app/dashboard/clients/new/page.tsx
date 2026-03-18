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
import { ArrowLeft, UserRound, Save } from "lucide-react";
import { ClientType } from "@/lib/types";

const clientTypes: { value: ClientType; label: string }[] = [
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
    { value: "tenant", label: "Tenant" },
    { value: "landlord", label: "Landlord" },
];

const nationalities = [
    "UAE",
    "United Kingdom",
    "United States",
    "India",
    "Pakistan",
    "Egypt",
    "Saudi Arabia",
    "France",
    "Germany",
    "Russia",
    "China",
    "South Korea",
    "Japan",
    "Australia",
    "Canada",
    "Other",
];

const documentTypes = [
    "Emirates ID",
    "Passport",
    "Visa",
    "Title Deed",
    "POA",
    "Trade License",
    "Other",
];

export default function NewClientPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<ClientType[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        nationality: "",
        notes: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleType = (type: ClientType) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    nationality: formData.nationality,
                    notes: formData.notes,
                    type: selectedTypes,
                    documents: [],
                    properties: [],
                    deals: [],
                }),
            });

            const json = await res.json();
            console.log("[Client] create response", { status: res.status, body: json });
            if (!res.ok || !json.success) {
                setSubmitError(json?.error || "Failed to create client");
                return;
            }

            // Navigate back to the list and ensure the server data is refetched
            await router.push("/dashboard/clients");
        } catch (error) {
            console.error("Failed to create client", error);
            setSubmitError("Failed to create client");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/clients">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <UserRound className="h-6 w-6 text-primary" />
                            Add New Client
                        </h1>
                        <p className="text-muted-foreground">
                            Create a new client record
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Client personal details</CardDescription>
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
                            <Label htmlFor="nationality">Nationality</Label>
                            <Select
                                value={formData.nationality}
                                onValueChange={(value) => handleSelectChange("nationality", value)}
                            >
                                <SelectTrigger id="nationality">
                                    <SelectValue placeholder="Select nationality" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nationalities.map((nationality) => (
                                        <SelectItem key={nationality} value={nationality}>
                                            {nationality}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Client Type */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client Type</CardTitle>
                        <CardDescription>Select all that apply</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {clientTypes.map((type) => (
                                <div
                                    key={type.value}
                                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${selectedTypes.includes(type.value)
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                        }`}
                                    onClick={() => toggleType(type.value)}
                                >
                                    <Checkbox
                                        id={`type-${type.value}`}
                                        checked={selectedTypes.includes(type.value)}
                                        onCheckedChange={() => toggleType(type.value)}
                                    />
                                    <Label
                                        htmlFor={`type-${type.value}`}
                                        className="cursor-pointer font-medium"
                                    >
                                        {type.label}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        {selectedTypes.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Please select at least one client type
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                        <CardDescription>Notes and remarks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Additional notes about this client..."
                                value={formData.notes}
                                onChange={handleInputChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="lg:col-span-2 flex justify-end gap-4">
                    {submitError && <p className="text-sm text-red-600 mr-auto self-center">{submitError}</p>}
                    <Link href="/dashboard/clients">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting || selectedTypes.length === 0}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Client"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
