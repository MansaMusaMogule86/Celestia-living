import Link from "next/link";
import { propertiesService } from "@/server/services/propertiesService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Building2, Bed, Bath, Maximize, ArrowUpRight, Filter } from "lucide-react";
import { PropertyStatus, ListingType } from "@/lib/types";
import { getSession } from "@/lib/auth/session";

function formatPrice(price: number, listingType: ListingType): string {
    if (price === 0) return "Price on request";
    const formatted = new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
    return listingType === "rent" ? `${formatted}/year` : formatted;
}

function getStatusVariant(status: PropertyStatus) {
    switch (status) {
        case "available":
            return "default";
        case "under_offer":
            return "secondary";
        case "sold":
        case "rented":
            return "outline";
        case "off_market":
            return "destructive";
        default:
            return "outline";
    }
}

export default async function PropertiesPage() {
    const session = await getSession();
    const teamId = session?.teamId || "default";

    const properties = await propertiesService.getAll(teamId);
    const stats = await propertiesService.getStats(teamId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-primary" />
                        Properties
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your property listings
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Link href="/dashboard/properties/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Property
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Properties</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                        <p className="text-sm text-muted-foreground">Available</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{stats.forSale}</div>
                        <p className="text-sm text-muted-foreground">For Sale</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">{stats.forRent}</div>
                        <p className="text-sm text-muted-foreground">For Rent</p>
                    </CardContent>
                </Card>
            </div>

            {/* Properties Table or Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>All Properties</CardTitle>
                    <CardDescription>
                        {properties.length === 0
                            ? "No properties added yet"
                            : `${properties.length} properties in your portfolio`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {properties.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Start building your portfolio by adding your first property listing.
                            </p>
                            <Link href="/dashboard/properties/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Your First Property
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {properties.map((property) => (
                                    <TableRow key={property.id}>
                                        <TableCell className="font-medium max-w-[200px]">
                                            <p className="truncate">{property.title}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {property.location.developer && (
                                                    <p className="font-medium text-xs text-primary mb-0.5">
                                                        {property.location.developer}
                                                    </p>
                                                )}
                                                <p>{property.location.area}</p>
                                                <p className="text-muted-foreground">
                                                    {property.location.community}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {property.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Bed className="h-3.5 w-3.5" />
                                                    {property.details.bedrooms}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Bath className="h-3.5 w-3.5" />
                                                    {property.details.bathrooms}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Maximize className="h-3.5 w-3.5" />
                                                    {property.details.size}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatPrice(property.price, property.listingType)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(property.status)}>
                                                {property.status.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/properties/${property.id}`}>
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    View
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
