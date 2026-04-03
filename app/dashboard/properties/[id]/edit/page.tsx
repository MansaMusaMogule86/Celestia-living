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
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { Property, PropertyType, PropertyStatus, ListingType } from "@/lib/types";
import { toast } from "sonner";

const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Townhouse" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
];

const propertyStatuses: { value: PropertyStatus; label: string }[] = [
    { value: "available", label: "Available" },
    { value: "under_offer", label: "Under Offer" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
    { value: "off_market", label: "Off Market" },
];

const amenitiesOptions = [
    "Pool", "Gym", "Concierge", "Beach Access", "Marina View",
    "Private Pool", "Garden", "Maid's Room", "Driver's Room",
    "Golf Course View", "Metro Access", "Burj Khalifa View",
    "Walking Distance to Mall", "Parks", "Schools Nearby",
    "Cinema Room", "Rooftop Terrace", "360 Views", "Private Beach",
];

export default function EditPropertyPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        type: "apartment" as PropertyType,
        status: "available" as PropertyStatus,
        listingType: "sale" as ListingType,
        price: "",
        area: "",
        community: "",
        building: "",
        developer: "",
        address: "",
        bedrooms: "",
        bathrooms: "",
        size: "",
        parkingSpaces: "",
        agentName: "",
        description: "",
    });

    useEffect(() => {
        fetch(`/api/properties/${id}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    const p: Property = json.data;
                    setFormData({
                        title: p.title,
                        type: p.type,
                        status: p.status,
                        listingType: p.listingType,
                        price: String(p.price),
                        area: p.location?.area ?? "",
                        community: p.location?.community ?? "",
                        building: p.location?.building ?? "",
                        developer: p.location?.developer ?? "",
                        address: p.location?.address ?? "",
                        bedrooms: String(p.details?.bedrooms ?? 0),
                        bathrooms: String(p.details?.bathrooms ?? 0),
                        size: String(p.details?.size ?? 0),
                        parkingSpaces: String(p.details?.parkingSpaces ?? 0),
                        agentName: p.agent?.name ?? "",
                        description: p.description ?? "",
                    });
                    setSelectedAmenities(p.amenities ?? []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities((prev) =>
            prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const price = Number(formData.price || 0);
        if (Number.isNaN(price)) {
            setError("Price must be a valid number");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    type: formData.type,
                    status: formData.status,
                    listingType: formData.listingType,
                    price,
                    location: {
                        area: formData.area.trim(),
                        community: formData.community.trim(),
                        building: formData.building.trim() || undefined,
                        developer: formData.developer.trim() || undefined,
                        address: formData.address.trim(),
                    },
                    details: {
                        bedrooms: Number(formData.bedrooms) || 0,
                        bathrooms: Number(formData.bathrooms) || 0,
                        size: Number(formData.size) || 0,
                        parkingSpaces: Number(formData.parkingSpaces) || 0,
                        amenities: selectedAmenities,
                    },
                    agent: formData.agentName ? { id: "agent-current", name: formData.agentName.trim() } : undefined,
                    description: formData.description,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json?.error || "Failed to update property");
                return;
            }

            toast.success("Property updated successfully");
            router.refresh();
            router.push(`/dashboard/properties/${id}`);
        } catch {
            setError("Failed to update property");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading property...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/properties/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary" />
                        Edit Property
                    </h1>
                    <p className="text-muted-foreground">Update property listing</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Property Title *</Label>
                            <Input id="title" value={formData.title} onChange={(e) => updateField("title", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Property Type *</Label>
                            <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {propertyTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {propertyStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Listing Type *</Label>
                            <Select value={formData.listingType} onValueChange={(v) => updateField("listingType", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sale">For Sale</SelectItem>
                                    <SelectItem value="rent">For Rent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (AED) *</Label>
                            <Input id="price" type="number" min={0} value={formData.price} onChange={(e) => updateField("price", e.target.value)} required />
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="area">Area *</Label>
                            <Input id="area" value={formData.area} onChange={(e) => updateField("area", e.target.value)} placeholder="e.g. Dubai Marina" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="community">Community *</Label>
                            <Input id="community" value={formData.community} onChange={(e) => updateField("community", e.target.value)} placeholder="e.g. Marina Promenade" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="building">Building</Label>
                            <Input id="building" value={formData.building} onChange={(e) => updateField("building", e.target.value)} placeholder="e.g. Tower A" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="developer">Developer</Label>
                            <Input id="developer" value={formData.developer} onChange={(e) => updateField("developer", e.target.value)} placeholder="e.g. Emaar" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address *</Label>
                            <Input id="address" value={formData.address} onChange={(e) => updateField("address", e.target.value)} required />
                        </div>
                    </CardContent>
                </Card>

                {/* Property Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bedrooms">Bedrooms</Label>
                            <Input id="bedrooms" type="number" min={0} value={formData.bedrooms} onChange={(e) => updateField("bedrooms", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bathrooms">Bathrooms</Label>
                            <Input id="bathrooms" type="number" min={0} value={formData.bathrooms} onChange={(e) => updateField("bathrooms", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="size">Size (sqft)</Label>
                            <Input id="size" type="number" min={0} value={formData.size} onChange={(e) => updateField("size", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parkingSpaces">Parking</Label>
                            <Input id="parkingSpaces" type="number" min={0} value={formData.parkingSpaces} onChange={(e) => updateField("parkingSpaces", e.target.value)} />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="agentName">Agent Name</Label>
                            <Input id="agentName" value={formData.agentName} onChange={(e) => updateField("agentName", e.target.value)} placeholder="Agent name" />
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            placeholder="Describe the property..."
                            rows={6}
                        />
                    </CardContent>
                </Card>

                {/* Amenities */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {amenitiesOptions.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`amenity-${amenity}`}
                                        checked={selectedAmenities.includes(amenity)}
                                        onCheckedChange={() => toggleAmenity(amenity)}
                                    />
                                    <Label htmlFor={`amenity-${amenity}`} className="cursor-pointer font-normal text-sm">
                                        {amenity}
                                    </Label>
                                </div>
                            ))}
                        </div>
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
                        <Link href={`/dashboard/properties/${id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
