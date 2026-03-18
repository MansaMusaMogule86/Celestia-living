"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import GlobalSearch from "@/components/crm/GlobalSearch";
import NotificationBell from "@/components/crm/NotificationBell";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Topbar() {
    const { setTheme, theme } = useTheme();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <header className="h-14 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <NotificationBell />

                {/* User Avatar */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                                MA
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
