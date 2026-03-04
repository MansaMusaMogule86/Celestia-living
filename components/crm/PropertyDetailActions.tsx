"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PropertyDetailActionsProps {
    id: string;
    title: string;
}

export function PropertyDetailActions({ id, title }: PropertyDetailActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleEdit = async () => {
        const nextTitle = window.prompt("Update property title", title)?.trim();
        if (!nextTitle || nextTitle === title) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: nextTitle }),
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                toast.error(json.message || "Failed to update property");
                return;
            }

            toast.success("Property updated");
            router.refresh();
        } catch {
            toast.error("Failed to update property");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Delete this property? This action cannot be undone.");
        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
            const json = await res.json();

            if (!res.ok || !json.success) {
                if (res.status === 403) {
                    toast.error("Only managers or admins can delete properties");
                    return;
                }
                toast.error(json.message || "Failed to delete property");
                return;
            }

            toast.success("Property deleted");
            router.push("/dashboard/properties");
        } catch {
            toast.error("Failed to delete property");
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