"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ClientDetailActionsProps {
    id: string;
    name: string;
}

export function ClientDetailActions({ id, name }: ClientDetailActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleEdit = async () => {
        const nextName = window.prompt("Update client name", name)?.trim();
        if (!nextName || nextName === name) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nextName }),
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                toast.error(json.message || "Failed to update client");
                return;
            }

            toast.success("Client updated");
            router.refresh();
        } catch {
            toast.error("Failed to update client");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Delete this client? This action cannot be undone.");
        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
            const json = await res.json();

            if (!res.ok || !json.success) {
                if (res.status === 403) {
                    toast.error("Only managers or admins can delete clients");
                    return;
                }
                toast.error(json.message || "Failed to delete client");
                return;
            }

            toast.success("Client deleted");
            router.push("/dashboard/clients");
        } catch {
            toast.error("Failed to delete client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit} disabled={loading}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
            <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={loading}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </Button>
        </div>
    );
}