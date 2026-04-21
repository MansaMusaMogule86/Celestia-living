"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Bell,
    Megaphone,
    AlertTriangle,
    UserPlus,
    Zap,
    AlertCircle,
    Info,
    CheckCheck,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    CAMPAIGN_PUBLISHED: Megaphone,
    CAMPAIGN_FAILED: AlertTriangle,
    NEW_LEAD: UserPlus,
    AUTOMATION_TRIGGERED: Zap,
    PORTAL_ERROR: AlertCircle,
    SYSTEM: Info,
};

function timeAgo(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) return;
            const json = await res.json();
            if (json.success) {
                setNotifications(json.data);
            }
        } catch {
            // silently ignore fetch errors
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchNotifications();
        }, 0);

        const interval = setInterval(() => {
            void fetchNotifications();
        }, 30_000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = async () => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: true }),
            });
            if (res.ok) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                );
            }
        } catch {
            // silently ignore
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-80 p-0"
                sideOffset={8}
            >
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <CheckCheck className="h-3 w-3" />
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-40" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const Icon =
                                typeIcons[notification.type] || Info;
                            return (
                                <div
                                    key={notification.id}
                                    className={`flex gap-3 border-b px-4 py-3 last:border-b-0 ${
                                        notification.read
                                            ? "opacity-60"
                                            : "bg-muted/50"
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-tight">
                                            {notification.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                            {notification.body}
                                        </p>
                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            {timeAgo(notification.createdAt)}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="mt-1.5 shrink-0">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
