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
import { ArrowLeft, UserRound, Loader2 } from "lucide-react";
import { Client, ClientType } from "@/lib/types";
import { toast } from "sonner";

const clientTypes: { value: ClientType; label: string }[] = [
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
    { value: "tenant", label: "Tenant" },
    { value: "landlord", label: "Landlord" },
];

const nationalities = [
    "UAE", "United Kingdom", "United States", "India", "Pakistan",
    "Egypt", "Saudi Arabia", "France", "Germany", "Russia",
    "China", "South Korea", "Japan", "Australia", "Canada", "Other",
];

export default function EditClientPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<ClientType[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        nationality: "",
        notes: "",
    });

    useEffect(() => {
        fetch(`/api/clients/${id}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    const client: Client = json.data;
                    setFormData({
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        nationality: client.nationality,
                        notes: client.notes || "",
                    });
                    setSelectedTypes(client.type);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleType = (type: ClientType) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (selectedTypes.length === 0) {
            setError("Please select at least one client type.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone.trim(),
                    nationality: formData.nationality,
                    notes: formData.notes,
                    type: selectedTypes,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json?.error || "Failed to update client");
                return;
            }

            toast.success("Client updated successfully");
            router.push(`/dashboard/clients/${id}`);
        } catch {
            setError("Failed to update client");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading client...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/clients/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <UserRound className="h-6 w-6 text-primary" />
                        Edit Client
                    </h1>
                    <p className="text-muted-foreground">Update client information</p>
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
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. John Smith"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+971 50 000 0000"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nationality">Nationality</Label>
                            <Select
                                value={formData.nationality}
                                onValueChange={(v) => setFormData((p) => ({ ...p, nationality: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select nationality" />
                                </SelectTrigger>
                                <SelectContent>
                                    {nationalities.map((n) => (
                                        <SelectItem key={n} value={n}>{n}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Client Type & Notes */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Type *</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {clientTypes.map((ct) => (
                                <div key={ct.value} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={ct.value}
                                        checked={selectedTypes.includes(ct.value)}
                                        onCheckedChange={() => toggleType(ct.value)}
                                    />
                                    <Label htmlFor={ct.value} className="cursor-pointer font-normal">
                                        {ct.label}
                                    </Label>
                                </div>
                            ))}
                            {selectedTypes.length === 0 && (
                                <p className="text-sm text-destructive">Select at least one type</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add any notes about this client..."
                                rows={5}
                            />
                        </CardContent>
                    </Card>
                </div>

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
                        <Link href={`/dashboard/clients/${id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
