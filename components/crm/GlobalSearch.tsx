"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    Loader2,
    Command,
    Building2,
    UserRound,
    Users,
    Briefcase,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PropertyResult {
    id: string;
    title: string;
    type: string;
    status: string;
    area: string | null;
    price: number;
}

interface ClientResult {
    id: string;
    name: string;
    email: string | null;
    type: string[];
    status: string;
}

interface LeadResult {
    id: string;
    name: string;
    email: string | null;
    status: string;
    source: string | null;
}

interface DealResult {
    id: string;
    title: string;
    stage: string;
    value: number;
}

interface SearchResults {
    properties: PropertyResult[];
    clients: ClientResult[];
    leads: LeadResult[];
    deals: DealResult[];
    total: number;
}

interface FlatItem {
    category: "properties" | "clients" | "leads" | "deals";
    item: PropertyResult | ClientResult | LeadResult | DealResult;
}

const categoryConfig = {
    properties: {
        label: "Properties",
        icon: Building2,
        path: "/dashboard/properties",
    },
    clients: {
        label: "Clients",
        icon: UserRound,
        path: "/dashboard/clients",
    },
    leads: {
        label: "Leads",
        icon: Users,
        path: "/dashboard/leads",
    },
    deals: {
        label: "Deals",
        icon: Briefcase,
        path: "/dashboard/deals",
    },
} as const;

function getItemLabel(category: string, item: FlatItem["item"]): string {
    if (category === "properties") {
        return (item as PropertyResult).title;
    }
    if (category === "clients") {
        return (item as ClientResult).name;
    }
    if (category === "leads") {
        return (item as LeadResult).name;
    }
    if (category === "deals") {
        return (item as DealResult).title;
    }
    return "";
}

function getItemSubtext(category: string, item: FlatItem["item"]): string {
    if (category === "properties") {
        const p = item as PropertyResult;
        return [p.type, p.area, p.status].filter(Boolean).join(" - ");
    }
    if (category === "clients") {
        const c = item as ClientResult;
        return c.email || c.status;
    }
    if (category === "leads") {
        const l = item as LeadResult;
        return [l.email, l.status].filter(Boolean).join(" - ");
    }
    if (category === "deals") {
        const d = item as DealResult;
        return d.stage;
    }
    return "";
}

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Flatten results into a single list for keyboard navigation
    const flatItems: FlatItem[] = React.useMemo(() => {
        if (!results) return [];
        const items: FlatItem[] = [];
        const categories = ["properties", "clients", "leads", "deals"] as const;
        for (const cat of categories) {
            for (const item of results[cat]) {
                items.push({ category: cat, item });
            }
        }
        return items;
    }, [results]);

    // Ctrl+K / Cmd+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when dialog opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setQuery("");
            setResults(null);
            setActiveIndex(0);
        }
    }, [open]);

    // Debounced search
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
                `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
            );
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setResults(json.data);
                    setActiveIndex(0);
                }
            }
        } catch {
            // Silently fail on network errors
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const navigateToItem = useCallback(
        (flatItem: FlatItem) => {
            const config = categoryConfig[flatItem.category];
            router.push(`${config.path}/${flatItem.item.id}`);
            setOpen(false);
        },
        [router]
    );

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < flatItems.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : flatItems.length - 1
            );
        } else if (e.key === "Enter" && flatItems.length > 0) {
            e.preventDefault();
            navigateToItem(flatItems[activeIndex]);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.querySelector(
                `[data-index="${activeIndex}"]`
            );
            activeEl?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    // Render results grouped by category
    const renderResults = () => {
        if (loading) {
            return (
                <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Searching...</p>
                </div>
            );
        }

        if (results && results.total === 0) {
            return (
                <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">No results found for &quot;{query}&quot;</p>
                </div>
            );
        }

        if (!results) {
            return (
                <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">Start typing to search across properties, clients, leads, and deals.</p>
                </div>
            );
        }

        let globalIndex = 0;
        const categories = ["properties", "clients", "leads", "deals"] as const;

        return (
            <div ref={listRef} className="max-h-80 overflow-y-auto">
                {categories.map((cat) => {
                    const items = results[cat];
                    if (items.length === 0) return null;

                    const config = categoryConfig[cat];
                    const Icon = config.icon;

                    return (
                        <div key={cat}>
                            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {config.label}
                            </div>
                            {items.map((item) => {
                                const currentIndex = globalIndex++;
                                const isActive = currentIndex === activeIndex;

                                return (
                                    <button
                                        key={item.id}
                                        data-index={currentIndex}
                                        onClick={() =>
                                            navigateToItem({ category: cat, item })
                                        }
                                        onMouseEnter={() =>
                                            setActiveIndex(currentIndex)
                                        }
                                        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-md transition-colors cursor-pointer ${
                                            isActive
                                                ? "bg-accent text-accent-foreground"
                                                : "hover:bg-accent/50"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {getItemLabel(cat, item)}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {getItemSubtext(cat, item)}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {/* Trigger button styled like a search input */}
            <button
                onClick={() => setOpen(true)}
                className="relative flex items-center h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm text-muted-foreground hover:bg-accent/50 transition-colors cursor-pointer"
            >
                <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                <span>Search properties, leads...</span>
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    <Command className="h-3 w-3" />K
                </kbd>
            </button>

            {/* Search Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 gap-0 max-w-lg top-[20%] translate-y-0">
                    <VisuallyHidden>
                        <DialogTitle>Global Search</DialogTitle>
                    </VisuallyHidden>

                    {/* Search Input */}
                    <div className="flex items-center border-b px-3">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search properties, clients, leads, deals..."
                            className="flex h-11 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        {loading && (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Results */}
                    <div className="p-2">{renderResults()}</div>

                    {/* Footer */}
                    {results && results.total > 0 && (
                        <div className="border-t px-3 py-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                                    ↑↓
                                </kbd>{" "}
                                navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                                    ↵
                                </kbd>{" "}
                                select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                                    esc
                                </kbd>{" "}
                                close
                            </span>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
