import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { transactionsService } from "@/server/services/transactionsService";
import { dealsService } from "@/server/services/dealsService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Receipt,
  Building2,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const transaction = await transactionsService.getById(id);

  if (!transaction) {
    notFound();
  }

  const statusConfig = {
    completed: { icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200", label: "Completed" },
    pending: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Pending" },
    failed: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Failed" },
    cancelled: { icon: AlertCircle, color: "text-gray-600 bg-gray-50 border-gray-200", label: "Cancelled" },
  };

  const config = statusConfig[transaction.status];
  const StatusIcon = config.icon;

  const handleDelete = async () => {
    "use server";
    const deleted = await transactionsService.delete(id);
    if (deleted) {
      redirect("/dashboard/transactions" as Route);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
            <p className="text-muted-foreground">Reference: {transaction.reference || transaction.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <form action={handleDelete}>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{transaction.type.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <span className="font-medium capitalize">{transaction.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">
                    {transaction.currency} {transaction.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{transaction.paymentMethod || "N/A"}</p>
                </div>
              </div>

              {transaction.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{transaction.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Related Entities */}
          <Card>
            <CardHeader>
              <CardTitle>Related Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transaction.deal?.id && (
                <Link
                  href={`/dashboard/deals/${transaction.deal.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{transaction.deal.title}</p>
                    <p className="text-sm text-muted-foreground">Deal</p>
                  </div>
                </Link>
              )}

              {transaction.client?.id && (
                <Link
                  href={`/dashboard/clients/${transaction.client.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{transaction.client.name}</p>
                    <p className="text-sm text-muted-foreground">Client</p>
                  </div>
                </Link>
              )}

              {!transaction.deal?.id && !transaction.client?.id && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No related records
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className={`border-2 ${config.color}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {transaction.status === "completed"
                  ? "This transaction has been successfully completed."
                  : transaction.status === "pending"
                    ? "This transaction is awaiting completion."
                    : transaction.status === "failed"
                      ? "This transaction failed to process."
                      : "This transaction was cancelled."}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {transaction.completedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">
                      {new Date(transaction.completedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reference Info */}
          {transaction.reference && (
            <Card>
              <CardHeader>
                <CardTitle>Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm break-all">{transaction.reference}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
