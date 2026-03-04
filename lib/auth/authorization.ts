import type { SessionPayload } from "@/lib/auth/session";

function normalizeRole(role: string): "admin" | "manager" | "agent" {
    const normalized = role.toLowerCase();
    if (normalized === "admin") return "admin";
    if (normalized === "manager") return "manager";
    return "agent";
}

export function ensureCanDelete(session: SessionPayload) {
    const role = normalizeRole(session.role);
    if (role !== "admin" && role !== "manager") {
        throw new Error("Forbidden");
    }
}
