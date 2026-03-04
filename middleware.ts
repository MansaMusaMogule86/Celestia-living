import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const hasSession = Boolean(req.cookies.get("session")?.value);

    const isDashboardRoute = pathname.startsWith("/dashboard");
    const isPublicAuthRoute = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    if (isDashboardRoute && !hasSession) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("redirect", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (isPublicAuthRoute && hasSession) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
