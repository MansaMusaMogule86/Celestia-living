"use client"

import * as React from "react"
import { Check, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface PreferencesData {
    budgetMin: number
    budgetMax: number
    locations: string[]
    bedroomsMin: number
    bathroomsMin: number
    propertyType: string
    paymentType: string
    mustHave: {
        balcony: boolean
        pool: boolean
        parking: boolean
    }
    niceToHave: {
        seaView: boolean
        creekView: boolean
        branded: boolean
        highFloor: boolean
    }
}

interface PreferenceBuilderProps {
    defaultValues?: Partial<PreferencesData>
    onChange: (data: PreferencesData) => void
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        maximumFractionDigits: 0,
    }).format(value)
}

export function PreferenceBuilder({ defaultValues, onChange }: PreferenceBuilderProps) {
    const [data, setData] = React.useState<PreferencesData>({
        budgetMin: defaultValues?.budgetMin || 1000000,
        budgetMax: defaultValues?.budgetMax || 5000000,
        locations: defaultValues?.locations || [],
        bedroomsMin: defaultValues?.bedroomsMin || 1,
        bathroomsMin: defaultValues?.bathroomsMin || 1,
        propertyType: defaultValues?.propertyType || "apartment",
        paymentType: defaultValues?.paymentType || "mortgage",
        mustHave: defaultValues?.mustHave || {
            balcony: false,
            pool: false,
            parking: false,
        },
        niceToHave: defaultValues?.niceToHave || {
            seaView: false,
            creekView: false,
            branded: false,
            highFloor: false,
        },
    })

    // Update parent whenever data changes
    React.useEffect(() => {
        onChange(data)
    }, [data, onChange])

    const [locationInput, setLocationInput] = React.useState("")

    const addLocation = () => {
        if (locationInput.trim() && !data.locations.includes(locationInput.trim())) {
            setData(prev => ({ ...prev, locations: [...prev.locations, locationInput.trim()] }))
            setLocationInput("")
        }
    }

    const removeLocation = (loc: string) => {
        setData(prev => ({ ...prev, locations: prev.locations.filter(l => l !== loc) }))
    }

    const updateMustHave = (key: keyof typeof data.mustHave, val: boolean) => {
        setData(prev => ({ ...prev, mustHave: { ...prev.mustHave, [key]: val } }))
    }

    const updateNiceToHave = (key: keyof typeof data.niceToHave, val: boolean) => {
        setData(prev => ({ ...prev, niceToHave: { ...prev.niceToHave, [key]: val } }))
    }

    return (
        <div className="space-y-6 rounded-lg border p-4 bg-muted/5">
            <div>
                <h3 className="text-lg font-medium">Matching Preferences</h3>
                <p className="text-sm text-muted-foreground">
                    Define what the client is looking for to enable automatic property matching.
                </p>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Budget & Payment */}
                <div className="space-y-4">
                    <Label>Budget Range (AED)</Label>
                    <div className="pt-2 px-2">
                        <Slider
                            defaultValue={[data.budgetMin, data.budgetMax]}
                            max={20000000}
                            step={100000}
                            onValueChange={(vals) => setData(prev => ({ ...prev, budgetMin: vals[0], budgetMax: vals[1] }))}
                            className="mb-6"
                        />
                        <div className="flex justify-between text-sm font-medium">
                            <span>{formatCurrency(data.budgetMin)}</span>
                            <span>{formatCurrency(data.budgetMax)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Type</Label>
                        <ToggleGroup
                            type="single"
                            value={data.paymentType}
                            onValueChange={(val) => val && setData(prev => ({ ...prev, paymentType: val }))}
                            className="justify-start"
                        >
                            <ToggleGroupItem value="cash" className="w-24">Cash</ToggleGroupItem>
                            <ToggleGroupItem value="mortgage" className="w-24">Mortgage</ToggleGroupItem>
                            <ToggleGroupItem value="crypto" className="w-24">Crypto</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                {/* Property Specs */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Property Type</Label>
                        <Select
                            value={data.propertyType}
                            onValueChange={(val) => setData(prev => ({ ...prev, propertyType: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="apartment">Apartment</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="townhouse">Townhouse</SelectItem>
                                <SelectItem value="penthouse">Penthouse</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <Label>Min Bedrooms</Label>
                            <Input
                                type="number"
                                min={0}
                                value={data.bedroomsMin}
                                onChange={(e) => setData(prev => ({ ...prev, bedroomsMin: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label>Min Bathrooms</Label>
                            <Input
                                type="number"
                                min={0}
                                value={data.bathroomsMin}
                                onChange={(e) => setData(prev => ({ ...prev, bathroomsMin: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Locations */}
            <div className="space-y-3">
                <Label>Preferred Locations</Label>
                <div className="flex gap-2">
                    <Input
                        placeholder="E.g. Dubai Marina, Business Bay..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                    />
                    <Button type="button" onClick={addLocation} variant="secondary">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {data.locations.length === 0 && (
                        <span className="text-sm text-muted-foreground py-2">No locations added yet.</span>
                    )}
                    {data.locations.map(loc => (
                        <Badge key={loc} variant="secondary" className="pl-2 pr-1 py-1 text-sm">
                            {loc}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                onClick={() => removeLocation(loc)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label className="text-base text-primary">Must Have (Hard Requirements)</Label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="mh-balcony" className="font-normal cursor-pointer">Balcony</Label>
                            <Switch id="mh-balcony" checked={data.mustHave.balcony} onCheckedChange={(c) => updateMustHave('balcony', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="mh-pool" className="font-normal cursor-pointer">Private Pool</Label>
                            <Switch id="mh-pool" checked={data.mustHave.pool} onCheckedChange={(c) => updateMustHave('pool', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="mh-parking" className="font-normal cursor-pointer">Dedicated Parking</Label>
                            <Switch id="mh-parking" checked={data.mustHave.parking} onCheckedChange={(c) => updateMustHave('parking', c)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base text-primary">Nice To Have (Bonus Points)</Label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="nth-view" className="font-normal cursor-pointer">Sea / Water View</Label>
                            <Switch id="nth-view" checked={data.niceToHave.seaView} onCheckedChange={(c) => updateNiceToHave('seaView', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="nth-creek" className="font-normal cursor-pointer">Creek / Lagoon View</Label>
                            <Switch id="nth-creek" checked={data.niceToHave.creekView} onCheckedChange={(c) => updateNiceToHave('creekView', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="nth-branded" className="font-normal cursor-pointer">Branded Residence</Label>
                            <Switch id="nth-branded" checked={data.niceToHave.branded} onCheckedChange={(c) => updateNiceToHave('branded', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="nth-floor" className="font-normal cursor-pointer">High Floor</Label>
                            <Switch id="nth-floor" checked={data.niceToHave.highFloor} onCheckedChange={(c) => updateNiceToHave('highFloor', c)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
