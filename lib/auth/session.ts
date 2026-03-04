import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "ilan-crm-secret-key-12345";

export interface SessionPayload {
    userId: string;
    teamId: string;
    role: string;
}

export async function createSession(payload: SessionPayload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    (await cookies()).set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET) as SessionPayload;
    } catch (err) {
        return null;
    }
}

export async function deleteSession() {
    (await cookies()).delete("session");
}

/**
 * Higher-order function to protect API routes.
 */
export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error("Unauthorized");
    }
    return session;
}
