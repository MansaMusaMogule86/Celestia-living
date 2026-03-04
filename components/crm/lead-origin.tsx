"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe, Users, Share2, Megaphone, Calendar, Handshake, HelpCircle } from "lucide-react"
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

const origins = [
    { value: "DIRECT", label: "Direct", icon: Users },
    { value: "REFERRAL", label: "Referral", icon: Handshake },
    { value: "WEBSITE", label: "Website", icon: Globe },
    { value: "SOCIAL_MEDIA", label: "Social Media", icon: Share2 },
    { value: "ADVERTISEMENT", label: "Advertisement", icon: Megaphone },
    { value: "EVENT", label: "Event", icon: Calendar },
    { value: "PARTNER", label: "Partner", icon: Users },
    { value: "OTHER", label: "Other", icon: HelpCircle },
]

interface LeadOriginSelectorProps {
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export function LeadOriginSelector({
    value,
    onChange,
    disabled,
}: LeadOriginSelectorProps) {
    const [open, setOpen] = React.useState(false)

    const currentOrigin = origins.find((item) => item.value === value) || origins[0]
    const Icon = currentOrigin.icon

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
                        <Icon className="h-4 w-4 opacity-50" />
                        {currentOrigin.label}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
                <Command>
                    <CommandInput placeholder="Search origin..." />
                    <CommandList>
                        <CommandEmpty>No origin found.</CommandEmpty>
                        <CommandGroup>
                            {origins.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={() => {
                                        onChange(item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <item.icon className="mr-2 h-4 w-4 opacity-50" />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
