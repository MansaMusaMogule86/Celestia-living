"use client";

import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Command Center",
        href: "/dashboard/command-center",
        icon: BrainCircuit,
    },
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Properties",
        href: "/dashboard/properties",
        icon: Building2,
    },
    {
        title: "Leads",
        href: "/dashboard/leads",
        icon: Users,
    },
    {
        title: "Clients",
        href: "/dashboard/clients",
        icon: UserRound,
    },
    {
        title: "Deals",
        href: "/dashboard/deals",
        icon: Briefcase,
    },
    {
        title: "Transactions",
        href: "/dashboard/transactions",
        icon: ReceiptText,
    },
    {
        title: "Calendar",
        href: "/dashboard/calendar",
        icon: Calendar,
    },
    {
        title: "Portals",
        href: "/dashboard/portals",
        icon: Globe,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
    },
    {
        title: "Activity",
        href: "/dashboard/activity",
        icon: Activity,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sticky top-0 h-screen w-64 border-r bg-sidebar hidden md:flex flex-col">
            <div className="h-14 flex items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                        I
                    </div>
                    <span className="text-sidebar-foreground">Ilan CRM</span>
                </Link>
            </div>

            <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                    >
                        <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 mb-1",
                                pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Button>
                    </Link>
                ))}
            </div>

            <div className="p-3 mt-auto border-t">
                <Link href="/dashboard/settings">
                    <Button variant="ghost" className="w-full justify-start gap-3">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                </Link>
            </div>
        </aside>
    );
}
