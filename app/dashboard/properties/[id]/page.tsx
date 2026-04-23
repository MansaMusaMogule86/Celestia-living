import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { propertiesService } from "@/server/services/propertiesService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyDetailActions } from "@/components/crm/PropertyDetailActions";
import {
    ArrowLeft,
    Bed,
    Bath,
    Maximize,
    Car,
    MapPin,
    User,
    Calendar,
} from "lucide-react";
import { PropertyStatus } from "@/lib/types";

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
}

function formatPrice(price: number, listingType: string): string {
    const formatted = new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        maximumFractionDigits: 0,
    }).format(price);
    return listingType === "rent" ? `${formatted}/yr` : formatted;
}

function getStatusVariant(status: PropertyStatus) {
    switch (status) {
        case "available":
            return "success";
        case "under_offer":
            return "warning";
        case "sold":
        case "rented":
            return "secondary";
        case "off_market":
            return "outline";
        default:
            return "default";
    }
}

function formatStatus(status: PropertyStatus): string {
    return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
    const session = await getSession();
    const teamId = session?.teamId;

    const { id } = await params;
    const property = await propertiesService.getById(id, teamId);

    if (!property) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/properties">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {property.title}
                        </h1>
                        <Badge variant={getStatusVariant(property.status)}>
                            {formatStatus(property.status)}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.location.address}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <PropertyDetailActions id={property.id} title={property.title} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Property Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                        <Bed className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{property.details.bedrooms}</div>
                                        <div className="text-xs text-muted-foreground">Bedrooms</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                        <Bath className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{property.details.bathrooms}</div>
                                        <div className="text-xs text-muted-foreground">Bathrooms</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                        <Maximize className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{property.details.size.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Sq. Ft.</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                        <Car className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{property.details.parkingSpaces}</div>
                                        <div className="text-xs text-muted-foreground">Parking</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {property.description}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Amenities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities.map((amenity) => (
                                    <Badge key={amenity} variant="secondary">
                                        {amenity}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {formatPrice(property.price, property.listingType)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">
                                {property.listingType === "rent" ? "Annual Rent" : "Sale Price"}
                            </p>
                            <div className="mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    {property.details.furnished ? "Furnished" : "Unfurnished"}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <div className="text-sm text-muted-foreground">Area</div>
                                <div className="font-medium">{property.location.area}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Community</div>
                                <div className="font-medium">{property.location.community}</div>
                            </div>
                            {property.location.building && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Building</div>
                                    <div className="font-medium">{property.location.building}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Listing Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Agent</div>
                                    <div className="font-medium">{property.agent.name}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Listed</div>
                                    <div className="font-medium">{formatDate(property.createdAt)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Updated</div>
                                    <div className="font-medium">{formatDate(property.updatedAt)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
