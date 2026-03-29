"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ClientDetailActionsProps {
    id: string;
    name: string;
}

export function ClientDetailActions({ id, name }: ClientDetailActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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
                <Link href={`/dashboard/clients/${id}/edit`}>
                    <Button variant="outline" disabled={loading}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
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