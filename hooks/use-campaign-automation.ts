import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

// ─── Campaigns ────────────────────────────────────────────────────────

export function useCampaigns(filters: any = {}) {
    return useQuery({
        queryKey: ["campaigns", filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters);
            const res = await fetch(`/api/campaigns?${params.toString()}`);
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
    });
}

export function useCampaign(id: string | null) {
    return useQuery({
        queryKey: ["campaign", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await fetch(`/api/campaigns/${id}`);
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
        enabled: !!id,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        },
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            queryClient.invalidateQueries({ queryKey: ["campaign", data.id] });
        },
    });
}

// ─── Automations ───────────────────────────────────────────────────────

export function useAutomationRules() {
    return useQuery({
        queryKey: ["automation-rules"],
        queryFn: async () => {
            const res = await fetch("/api/automation-rules");
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
    });
}

export function useCreateAutomationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/automation-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["automation-rules"] });
        },
    });
}

// ─── Analytics ─────────────────────────────────────────────────────────

export function useAnalytics(period: string = "30d") {
    return useQuery({
        queryKey: ["analytics", period],
        queryFn: async () => {
            const res = await fetch(`/api/analytics?period=${period}`);
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
    });
}

// ─── Properties ────────────────────────────────────────────────────────

export function useProperties(search: string = "") {
    return useQuery({
        queryKey: ["properties", search],
        queryFn: async () => {
            const res = await fetch(`/api/properties?search=${search}`);
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
    });
}

// ─── Portal Integrations ─────────────────────────────────────────────

export function usePortalIntegrations() {
    return useQuery({
        queryKey: ["portal-integrations"],
        queryFn: async () => {
            const res = await fetch("/api/portals");
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
    });
}

export function useUpdatePortalIntegration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ portal, data }: { portal: string; data: any }) => {
            const res = await fetch(`/api/portals/${portal}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portal-integrations"] });
        },
    });
}

export function useSyncPortalIntegration() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (portal: string) => {
            const res = await fetch(`/api/portals/${portal}/sync`, {
                method: "POST",
            });
            const json: ApiResponse<any> = await res.json();
            if (!json.success) throw new Error(json.error);
            return json.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portal-integrations"] });
        },
    });
}
