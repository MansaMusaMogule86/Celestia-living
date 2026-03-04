"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Users,
    Briefcase,
    BarChart3,
    Settings,
    UserRound,
    ReceiptText,
    Globe,
    BrainCircuit,
    Calendar,
    Activity,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems: Array<{ title: string; href: Route; icon: typeof LayoutDashboard }> = [
    { title: "Command Center", href: "/dashboard/command-center", icon: BrainCircuit },
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Properties", href: "/dashboard/properties", icon: Building2 },
    { title: "Leads", href: "/dashboard/leads", icon: Users },
    { title: "Clients", href: "/dashboard/clients", icon: UserRound },
    { title: "Deals", href: "/dashboard/deals", icon: Briefcase },
    { title: "Transactions", href: "/dashboard/transactions", icon: ReceiptText },
    { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { title: "Portals", href: "/dashboard/portals", icon: Globe },
    { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { title: "Activity", href: "/dashboard/activity", icon: Activity },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function MobileNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Mobile header */}
            <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        I
                    </div>
                    <span>Ilan CRM</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Slide-out drawer */}
            <div
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-72 bg-background border-r transform transition-transform duration-200 ease-in-out",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-14 flex items-center justify-between px-4 border-b">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 font-semibold"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                            I
                        </div>
                        <span>Ilan CRM</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                        >
                            <Button
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 mb-1",
                                    pathname === item.href && "bg-accent font-medium"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
