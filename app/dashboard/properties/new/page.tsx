"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // No longer needed with server action redirect
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Save, Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { PropertyType, PropertyStatus, ListingType } from "@/lib/types";
import { createPropertyAction } from "@/server/actions/property-actions";
// import { useFormState } from "react-dom"; // Can use this for error handling
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { developers, locations } from "@/lib/dubai-real-estate-data";
import { generateSmartTitles } from "@/lib/title-generator";

const propertyTypes: { value: PropertyType; label: string }[] = [
    { value: "apartment", label: "Apartment" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Townhouse" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
];

const propertyStatuses: { value: PropertyStatus; label: string }[] = [
    { value: "available", label: "Available" },
    { value: "under_offer", label: "Under Offer" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
    { value: "off_market", label: "Off Market" },
];

const listingTypes: { value: ListingType; label: string }[] = [
    { value: "sale", label: "For Sale" },
    { value: "rent", label: "For Rent" },
];

const amenitiesOptions = [
    "Pool", "Gym", "Concierge", "Beach Access", "Marina View",
    "Private Pool", "Garden", "Maid's Room", "Driver's Room",
    "Golf Course View", "Metro Access", "Burj Khalifa View",
    "Walking Distance to Mall", "Parks", "Schools Nearby",
    "Cinema Room", "Rooftop Terrace", "360 Views", "Private Beach"
];

export default function NewPropertyPage() {
    // const router = useRouter(); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [smartTitles, setSmartTitles] = useState<string[]>([]);

    // Cascading Location State
    const [selectedArea, setSelectedArea] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState("");
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedDeveloper, setSelectedDeveloper] = useState("");

    // Details State for Smart Titles
    const [propType, setPropType] = useState<PropertyType>("apartment");
    const [bedrooms, setBedrooms] = useState("");
    const [furnished, setFurnished] = useState(false);

    // Combobox Open States
    const [openArea, setOpenArea] = useState(false);
    const [openCommunity, setOpenCommunity] = useState(false);
    const [openBuilding, setOpenBuilding] = useState(false);
    const [openDeveloper, setOpenDeveloper] = useState(false);

    // Derived Data
    const currentLoc = locations.find(l => l.name === selectedArea);
    const availableCommunities = currentLoc?.communities || [];

    // Title Generation Effect
    useEffect(() => {
        const details = {
            type: propertyTypes.find(p => p.value === propType)?.label || "Property",
            bedrooms: parseInt(bedrooms) || 0,
            area: selectedArea,
            community: selectedCommunity,
            furnishing: furnished ? "furnished" : "unfurnished",
            // Can add USP input later if needed
        };

        if (selectedArea) {
            setSmartTitles(generateSmartTitles(details));
        }
    }, [propType, bedrooms, selectedArea, selectedCommunity, furnished]);

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity)
                ? prev.filter(a => a !== amenity)
                : [...prev, amenity]
        );
    };

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        // Append amenities as they might not be captured correctly if just relying on checkbox names without value
        // But simpler: just ensure we have hidden inputs for complex state if needed, 
        // or just let the server action handle standard form data.
        // The Checkbox component from shadcn usually doesn't emit a standard name/value unless wrapped or manual hidden input.

        // Let's rely on hidden inputs for the controlled state
        await createPropertyAction({}, formData);
        setIsSubmitting(false); // Should redirect before this, but just in case
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/properties">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            Add New Property
                        </h1>
                        <p className="text-muted-foreground">
                            Create a new property listing
                        </p>
                    </div>
                </div>
            </div>

            <form action={handleFormSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Property details and classification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Property Title *</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g., Luxury 3BR Apartment in Dubai Marina"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            {/* Smart Title Suggestions */}
                            {smartTitles.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Sparkles className="h-3 w-3 text-amber-500" />
                                        Smart Suggestions:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {smartTitles.slice(0, 3).map((t, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setTitle(t)}
                                                className="text-xs bg-secondary/50 hover:bg-secondary cursor-pointer px-2 py-1 rounded-md transition-colors border border-transparent hover:border-primary/20"
                                            >
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Property Type *</Label>
                                <Select
                                    name="type"
                                    value={propType}
                                    onValueChange={(val: PropertyType) => setPropType(val)}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {propertyTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="listingType">Listing Type *</Label>
                                <Select name="listingType" defaultValue="sale">
                                    <SelectTrigger id="listingType">
                                        <SelectValue placeholder="Select listing type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listingTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select name="status" defaultValue="available">
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {propertyStatuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Price (AED) *
                                </Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="e.g., 3500000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="developer">Developer</Label>
                            <Popover open={openDeveloper} onOpenChange={setOpenDeveloper}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openDeveloper}
                                        className="w-full justify-between"
                                    >
                                        {selectedDeveloper
                                            ? developers.find((d) => d.name === selectedDeveloper)?.name
                                            : "Select developer..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search developer..." />
                                        <CommandList>
                                            <CommandEmpty>No developer found.</CommandEmpty>
                                            <CommandGroup>
                                                {developers.map((dev) => (
                                                    <CommandItem
                                                        key={dev.id}
                                                        value={dev.name}
                                                        onSelect={(currentValue) => {
                                                            setSelectedDeveloper(currentValue === selectedDeveloper ? "" : currentValue);
                                                            setOpenDeveloper(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedDeveloper === dev.name ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {dev.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="developer" value={selectedDeveloper} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Describe the property..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                        <CardDescription>Property location details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="area">Area *</Label>
                            <Popover open={openArea} onOpenChange={setOpenArea}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openArea}
                                        className="w-full justify-between"
                                    >
                                        {selectedArea
                                            ? locations.find((l) => l.name === selectedArea)?.name
                                            : "Select area..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search area..." />
                                        <CommandList>
                                            <CommandEmpty>No area found.</CommandEmpty>
                                            <CommandGroup>
                                                {locations.map((loc) => (
                                                    <CommandItem
                                                        key={loc.id}
                                                        value={loc.name}
                                                        onSelect={(currentValue) => {
                                                            setSelectedArea(currentValue === selectedArea ? "" : currentValue);
                                                            setSelectedCommunity(""); // Reset community
                                                            setSelectedBuilding(""); // Reset building
                                                            setOpenArea(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedArea === loc.name ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {loc.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="area" value={selectedArea} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="community">Community / Project *</Label>
                            <Popover open={openCommunity} onOpenChange={setOpenCommunity}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCommunity}
                                        className="w-full justify-between"
                                        disabled={!selectedArea}
                                    >
                                        {selectedCommunity
                                            ? availableCommunities.find((c) => c.name === selectedCommunity)?.name
                                            : "Select community..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search community..." />
                                        <CommandList>
                                            <CommandEmpty>No community found.</CommandEmpty>
                                            <CommandGroup>
                                                {availableCommunities.map((com) => (
                                                    <CommandItem
                                                        key={com.id}
                                                        value={com.name}
                                                        onSelect={(currentValue) => {
                                                            setSelectedCommunity(currentValue === selectedCommunity ? "" : currentValue);
                                                            setOpenCommunity(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCommunity === com.name ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {com.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <input type="hidden" name="community" value={selectedCommunity} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="building">Building</Label>
                            {/* If we had specific buildings data structure, we'd use another combobox. 
                                For now, we'll keep it as free text but maybe add suggestions later.
                                Or just reuse the logic if we expand the data.
                            */}
                            <Input
                                id="building"
                                name="building"
                                placeholder="e.g., Trident Grand Residence"
                                value={selectedBuilding}
                                onChange={(e) => setSelectedBuilding(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="e.g., Marina Walk, Dubai Marina"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Property Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                        <CardDescription>Size and specifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bedrooms">Bedrooms</Label>
                                <Input
                                    id="bedrooms"
                                    name="bedrooms"
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 3"
                                    value={bedrooms}
                                    onChange={(e) => setBedrooms(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bathrooms">Bathrooms</Label>
                                <Input
                                    id="bathrooms"
                                    name="bathrooms"
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 4"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="size">Size (sq.ft) *</Label>
                                <Input
                                    id="size"
                                    name="size"
                                    type="number"
                                    placeholder="e.g., 2150"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                                <Input
                                    id="parkingSpaces"
                                    name="parkingSpaces"
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 2"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="furnished"
                                checked={furnished}
                                onCheckedChange={(c) => setFurnished(c === true)}
                            />
                            <Label htmlFor="furnished" className="cursor-pointer">
                                Furnished
                            </Label>
                            {/* Hidden input for checkbox being submitted with formData */}
                            <input type="hidden" name="furnished" value={furnished ? "on" : "off"} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agentName">Agent Name</Label>
                            <Input
                                id="agentName"
                                name="agentName"
                                placeholder="e.g., Ahmed Hassan"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                        <CardDescription>Select available amenities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {amenitiesOptions.map((amenity) => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`amenity-${amenity}`}
                                        checked={selectedAmenities.includes(amenity)}
                                        onCheckedChange={() => toggleAmenity(amenity)}
                                    />
                                    <Label
                                        htmlFor={`amenity-${amenity}`}
                                        className="text-sm cursor-pointer"
                                    >
                                        {amenity}
                                    </Label>
                                    {/* Hidden input for this specific amenity if checked */}
                                    {selectedAmenities.includes(amenity) && (
                                        <input type="hidden" name="amenities" value={amenity} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="lg:col-span-2 flex justify-end gap-4">
                    <Link href="/dashboard/properties">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Property"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
