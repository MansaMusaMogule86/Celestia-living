"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const statuses = [
    { value: "LEAD_COLD", label: "Cold Lead", color: "bg-slate-500" },
    { value: "LEAD_WARM", label: "Warm Lead", color: "bg-orange-500" },
    { value: "CONTACTED", label: "Contacted", color: "bg-blue-500" },
    { value: "QUALIFIED", label: "Qualified", color: "bg-indigo-500" },
    { value: "VIP", label: "VIP", color: "bg-purple-600" },
    { value: "REFERRAL", label: "Referral", color: "bg-pink-500" },
    { value: "CONVERTED", label: "Converted", color: "bg-green-600" },
    { value: "LOST", label: "Lost", color: "bg-red-500" },
]

interface ClientStatusSelectorProps {
    status: string
    onStatusChange: (status: string) => void
    disabled?: boolean
}

export function ClientStatusSelector({
    status,
    onStatusChange,
    disabled,
}: ClientStatusSelectorProps) {
    const [open, setOpen] = React.useState(false)

    const currentStatus = statuses.find((s) => s.value === status) || statuses[0]

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[180px] justify-between"
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        <div className={cn("h-2.5 w-2.5 rounded-full", currentStatus.color)} />
                        {currentStatus.label}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
                <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandList>
                        <CommandEmpty>No status found.</CommandEmpty>
                        <CommandGroup>
                            {statuses.map((s) => (
                                <CommandItem
                                    key={s.value}
                                    value={s.value}
                                    onSelect={(currentValue) => {
                                        onStatusChange(s.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            status === s.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full", s.color)} />
                                        {s.label}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export function ClientStatusBadge({ status }: { status: string }) {
    const s = statuses.find((item) => item.value === status) || statuses[0]

    // Custom badge styling based on color mapping
    // We use utility classes but map the bg color dynamically if possible, or use the predefined class

    return (
        <Badge variant="outline" className="gap-1.5 pr-2.5 font-normal">
            <div className={cn("h-2 w-2 rounded-full", s.color)} />
            {s.label}
        </Badge>
    )
}
