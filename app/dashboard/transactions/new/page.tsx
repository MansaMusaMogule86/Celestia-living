"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, ReceiptText } from "lucide-react";

export default function NewTransactionPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: "sale",
        status: "pending",
        amount: "",
        dealTitle: "",
        clientName: "",
        description: "",
        paymentMethod: "bank_transfer",
        reference: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        const amount = Number(formData.amount || 0);
        if (Number.isNaN(amount)) {
            setSubmitError("Amount must be a valid number");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
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
                reference: formData.reference || generateReference(),
            };

            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            console.log("[Transaction] create response", { status: res.status, body: json });
            if (!res.ok || !json.success) {
                setSubmitError(json?.error || "Failed to create transaction");
                return;
            }

            // Navigate back to the list and ensure the server data is refetched
            router.refresh();
            await router.push("/dashboard/transactions");
        } catch (error) {
            console.error("Failed to create transaction", error);
            setSubmitError("Failed to create transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Generate a reference number automatically
    const generateReference = () => {
        const prefix = "TXN";
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/transactions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ReceiptText className="h-6 w-6 text-primary" />
                        Record New Transaction
                    </h1>
                    <p className="text-muted-foreground">
                        Record a payment or commission
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Details</CardTitle>
                                <CardDescription>
                                    Basic transaction information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Transaction Type *</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => updateField("type", value)}
                                        >
                                            <SelectTrigger id="type" aria-label="Select transaction type">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sale">Sale</SelectItem>
                                                <SelectItem value="rental_payment">Rental Payment</SelectItem>
                                                <SelectItem value="commission">Commission</SelectItem>
                                                <SelectItem value="deposit">Deposit</SelectItem>
                                                <SelectItem value="refund">Refund</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => updateField("status", value)}
                                        >
                                            <SelectTrigger id="status" aria-label="Select transaction status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (AED) *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="e.g., 50000"
                                        value={formData.amount}
                                        onChange={(e) => updateField("amount", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dealTitle">Related Deal *</Label>
                                    <Input
                                        id="dealTitle"
                                        placeholder="Enter deal title or select from existing"
                                        value={formData.dealTitle}
                                        onChange={(e) => updateField("dealTitle", e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        In full version, this would be a searchable dropdown of your deals
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientName">Client *</Label>
                                    <Input
                                        id="clientName"
                                        placeholder="Enter client name or select from existing"
                                        value={formData.clientName}
                                        onChange={(e) => updateField("clientName", e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        In full version, this would be a searchable dropdown of your clients
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                                <CardDescription>
                                    How and when the payment was made
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                                        <Select
                                            value={formData.paymentMethod}
                                            onValueChange={(value) => updateField("paymentMethod", value)}
                                        >
                                            <SelectTrigger id="paymentMethod" aria-label="Select payment method">
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="cheque">Cheque</SelectItem>
                                                <SelectItem value="cash">Cash</SelectItem>
                                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                                <SelectItem value="manager_cheque">Manager's Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reference">Reference Number</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="reference"
                                                placeholder="e.g., TXN-12345"
                                                value={formData.reference}
                                                onChange={(e) => updateField("reference", e.target.value)}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => updateField("reference", generateReference())}
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Additional details about the transaction..."
                                        value={formData.description}
                                        onChange={(e) => updateField("description", e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {isSubmitting ? "Recording..." : "Record Transaction"}
                                </Button>
                                <Link href="/dashboard/transactions" className="block">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p>• Always link transactions to a deal for proper tracking</p>
                                <p>• Generate a unique reference for each transaction</p>
                                <p>• Mark status as "Completed" once payment is verified</p>
                                <p>• Record commission separately from sale transactions</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
