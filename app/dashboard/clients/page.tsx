import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { clientsService } from "@/server/services/clientsService";
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
import { Plus, UserRound, Mail, Phone, FileText, ArrowUpRight, Filter } from "lucide-react";
import { ClientType } from "@/lib/types";

function getTypeVariant(type: ClientType) {
    switch (type) {
        case "buyer":
            return "default";
        case "seller":
            return "secondary";
        case "tenant":
            return "outline";
        case "landlord":
            return "default";
        default:
            return "outline";
    }
}

export default async function ClientsPage() {
    const session = await getSession();
    const teamId = session?.teamId;

    const clients = await clientsService.getAll(teamId);
    const stats = await clientsService.getStats(teamId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <UserRound className="h-8 w-8 text-primary" />
                        Clients
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your client database
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Link href="/dashboard/clients/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Client
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-sm text-muted-foreground">Total Clients</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{stats.buyers}</div>
                        <p className="text-sm text-muted-foreground">Buyers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.sellers}</div>
                        <p className="text-sm text-muted-foreground">Sellers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">{stats.tenants}</div>
                        <p className="text-sm text-muted-foreground">Tenants</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-600">{stats.landlords}</div>
                        <p className="text-sm text-muted-foreground">Landlords</p>
                    </CardContent>
                </Card>
            </div>

            {/* Clients Table or Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>All Clients</CardTitle>
                    <CardDescription>
                        {clients.length === 0
                            ? "No clients added yet"
                            : `${clients.length} clients in your database`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {clients.length === 0 ? (
                        <div className="text-center py-12">
                            <UserRound className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Start building your client database by adding your first client.
                            </p>
                            <Link href="/dashboard/clients/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Your First Client
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Nationality</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-semibold">
                                                        {client.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{client.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    <span className="truncate max-w-[150px]">
                                                        {client.email}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {client.type.map((type) => (
                                                    <Badge
                                                        key={type}
                                                        variant={getTypeVariant(type)}
                                                        className="capitalize"
                                                    >
                                                        {type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {client.nationality}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <FileText className="h-3.5 w-3.5" />
                                                <span>{client.documents.length}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/clients/${client.id}`}>
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
