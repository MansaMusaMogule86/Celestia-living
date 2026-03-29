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
import { ArrowLeft, ReceiptText, Loader2 } from "lucide-react";
import { Transaction, TransactionType, TransactionStatus } from "@/lib/types";
import { toast } from "sonner";

const transactionTypes: { value: TransactionType; label: string }[] = [
    { value: "sale", label: "Sale" },
    { value: "rental_payment", label: "Rental Payment" },
    { value: "commission", label: "Commission" },
    { value: "deposit", label: "Deposit" },
    { value: "refund", label: "Refund" },
];

const transactionStatuses: { value: TransactionStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
];

const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "cheque", label: "Cheque" },
    { value: "cash", label: "Cash" },
    { value: "credit_card", label: "Credit Card" },
    { value: "crypto", label: "Crypto" },
];

export default function EditTransactionPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: "sale" as TransactionType,
        status: "pending" as TransactionStatus,
        amount: "",
        dealTitle: "",
        clientName: "",
        description: "",
        paymentMethod: "bank_transfer",
        reference: "",
    });

    useEffect(() => {
        fetch(`/api/transactions/${id}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
                if (json.success) {
                    const txn: Transaction = json.data;
                    setFormData({
                        type: txn.type,
                        status: txn.status,
                        amount: String(txn.amount),
                        dealTitle: txn.deal?.title ?? "",
                        clientName: txn.client?.name ?? "",
                        description: txn.description ?? "",
                        paymentMethod: txn.paymentMethod ?? "bank_transfer",
                        reference: txn.reference ?? "",
                    });
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const amount = Number(formData.amount || 0);
        if (Number.isNaN(amount) || amount < 0) {
            setError("Amount must be a valid positive number");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formData.type,
                    status: formData.status,
                    amount,
                    currency: "AED",
                    deal: {
                        id: `deal-${formData.dealTitle.trim().toLowerCase().replace(/\s+/g, "-")}`,
                        title: formData.dealTitle.trim(),
                    },
                    client: {
                        id: `client-${formData.clientName.trim().toLowerCase().replace(/\s+/g, "-")}`,
                        name: formData.clientName.trim(),
                    },
                    description: formData.description,
                    paymentMethod: formData.paymentMethod,
                    reference: formData.reference,
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json?.error || "Failed to update transaction");
                return;
            }

            toast.success("Transaction updated successfully");
            router.push(`/dashboard/transactions/${id}`);
        } catch {
            setError("Failed to update transaction");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading transaction...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/transactions/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ReceiptText className="h-6 w-6 text-primary" />
                        Edit Transaction
                    </h1>
                    <p className="text-muted-foreground">Update transaction details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Transaction Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {transactionTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {transactionStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (AED) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                min={0}
                                value={formData.amount}
                                onChange={(e) => updateField("amount", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={formData.paymentMethod} onValueChange={(v) => updateField("paymentMethod", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference Number</Label>
                            <Input
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => updateField("reference", e.target.value)}
                                placeholder="TXN-XXXX-XXXX"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Parties & Notes */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Related Parties</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="dealTitle">Deal Title</Label>
                                <Input
                                    id="dealTitle"
                                    value={formData.dealTitle}
                                    onChange={(e) => updateField("dealTitle", e.target.value)}
                                    placeholder="Associated deal title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clientName">Client Name</Label>
                                <Input
                                    id="clientName"
                                    value={formData.clientName}
                                    onChange={(e) => updateField("clientName", e.target.value)}
                                    placeholder="Client full name"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Any notes or description for this transaction..."
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
                        <Link href={`/dashboard/transactions/${id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
