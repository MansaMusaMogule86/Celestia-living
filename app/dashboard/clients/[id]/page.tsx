import Link from "next/link";
import { notFound } from "next/navigation";
import { clientsService } from "@/server/services/clientsService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientDetailActions } from "@/components/crm/ClientDetailActions";
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    Building2,
    Briefcase,
    FileText,
} from "lucide-react";
import { ClientType } from "@/lib/types";

interface ClientDetailPageProps {
    params: Promise<{ id: string }>;
}

function getTypeVariant(type: ClientType) {
    switch (type) {
        case "buyer":
            return "default";
        case "seller":
            return "secondary";
        case "tenant":
            return "outline";
        case "landlord":
            return "success";
    }
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
    const { id } = await params;
    const client = await clientsService.getById(id);

    if (!client) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {client.name}
                        </h1>
                        <div className="flex gap-1">
                            {client.type.map((t) => (
                                <Badge key={t} variant={getTypeVariant(t)}>
                                    {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Client since {formatDate(client.createdAt)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ClientDetailActions id={client.id} name={client.name} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Email</div>
                                    <div className="font-medium">{client.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Phone</div>
                                    <a href={`tel:${client.phone}`} className="font-medium text-primary hover:underline">
                                        {client.phone}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {client.notes || "No notes added yet."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {client.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {client.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{doc.name}</div>
                                                <div className="text-xs text-muted-foreground">{doc.type}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">
                                    No documents uploaded yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Client Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Nationality</div>
                                <div className="font-medium">{client.nationality || "Not specified"}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Client Types</div>
                                <div className="flex gap-1 mt-1">
                                    {client.type.map((t) => (
                                        <Badge key={t} variant="secondary" className="capitalize">
                                            {t}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Properties */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Properties
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {client.properties.length > 0 ? (
                                <div className="space-y-2">
                                    {client.properties.map((propertyId) => (
                                        <Link
                                            key={propertyId}
                                            href={`/dashboard/properties/${propertyId}`}
                                            className="block p-2 rounded-lg border hover:bg-secondary/50 transition-colors"
                                        >
                                            Property #{propertyId}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4 text-sm">
                                    No properties associated
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Deals */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Deals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {client.deals.length > 0 ? (
                                <div className="space-y-2">
                                    {client.deals.map((dealId) => (
                                        <Link
                                            key={dealId}
                                            href={`/dashboard/deals/${dealId}`}
                                            className="block p-2 rounded-lg border hover:bg-secondary/50 transition-colors"
                                        >
                                            Deal #{dealId}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4 text-sm">
                                    No deals associated
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Created</div>
                                    <div className="font-medium">{formatDate(client.createdAt)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Last Updated</div>
                                    <div className="font-medium">{formatDate(client.updatedAt)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
