import Link from "next/link";
import { transactionsService } from "@/server/services/transactionsService";
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
import {
    Plus,
    ReceiptText,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    ArrowUpRight,
} from "lucide-react";
import { TransactionStatus, TransactionType } from "@/lib/types";

function getStatusConfig(status: TransactionStatus) {
    switch (status) {
        case "completed":
            return { variant: "default" as const, icon: CheckCircle, color: "text-green-600" };
        case "pending":
            return { variant: "secondary" as const, icon: Clock, color: "text-amber-600" };
        case "cancelled":
            return { variant: "destructive" as const, icon: XCircle, color: "text-red-600" };
        default:
            return { variant: "outline" as const, icon: Clock, color: "text-gray-600" };
    }
}

function getTypeLabel(type: TransactionType) {
    const labels: Record<TransactionType, string> = {
        sale: "Sale",
        rental_payment: "Rental Payment",
        commission: "Commission",
        deposit: "Deposit",
        refund: "Refund",
    };
    return labels[type];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default async function TransactionsPage() {
    const transactions = await transactionsService.getAll();
    const stats = await transactionsService.getStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ReceiptText className="h-8 w-8 text-primary" />
                        Transactions
                    </h1>
                    <p className="text-muted-foreground">
                        Track payments and commissions
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Link href="/dashboard/transactions/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Record Transaction
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.transactionCount}</div>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats.totalRevenue)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(stats.totalCommission)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total Commission</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">
                            {formatCurrency(stats.pendingAmount)}
                        </div>
                        <p className="text-sm text-muted-foreground">Pending Amount</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table or Empty State */}
            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                    <CardDescription>
                        {transactions.length === 0
                            ? "No transactions recorded yet"
                            : `${transactions.length} transactions in your records`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <ReceiptText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                Start recording transactions when deals are closed.
                            </p>
                            <Link href="/dashboard/transactions/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Record First Transaction
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Deal</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => {
                                    const statusConfig = getStatusConfig(transaction.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-mono text-sm">
                                                {transaction.reference}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getTypeLabel(transaction.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[150px]">
                                                <p className="truncate text-sm">
                                                    {transaction.deal.title}
                                                </p>
                                            </TableCell>
                                            <TableCell>{transaction.client.name}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(transaction.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                                    <Badge variant={statusConfig.variant}>
                                                        {transaction.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    View
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
