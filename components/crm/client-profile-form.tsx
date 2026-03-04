"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ClientStatusSelector } from "./client-status"
import { LeadOriginSelector } from "./lead-origin"
import { PreferenceBuilder, PreferencesData } from "./preference-builder"

// Schema
const clientFormSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number is required"),
    address: z.string().optional(),
    dateOfBirth: z.date().optional(),
    status: z.string(),
    leadOrigin: z.string(),
    notes: z.string().optional(),
    // Preferences will be handled separately but integrated in submission
})

export type ClientFormValues = z.infer<typeof clientFormSchema> & {
    preferences: PreferencesData
}

interface ClientProfileFormProps {
    initialData?: Partial<ClientFormValues> & { id?: string }
    onSubmit: (data: ClientFormValues) => Promise<void>
    isSubmitting?: boolean
}

export function ClientProfileForm({ initialData, onSubmit, isSubmitting }: ClientProfileFormProps) {
    const form = useForm<z.infer<typeof clientFormSchema>>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            address: initialData?.address || "",
            dateOfBirth: initialData?.dateOfBirth,
            status: initialData?.status || "LEAD_COLD",
            leadOrigin: initialData?.leadOrigin || "DIRECT",
            notes: initialData?.notes || "",
        },
    })

    const [preferences, setPreferences] = React.useState<PreferencesData>(
        initialData?.preferences || {
            budgetMin: 1000000,
            budgetMax: 5000000,
            locations: [],
            bedroomsMin: 1,
            bathroomsMin: 1,
            propertyType: "apartment",
            paymentType: "mortgage",
            mustHave: { balcony: false, pool: false, parking: false },
            niceToHave: { seaView: false, creekView: false, branded: false, highFloor: false },
        }
    )

    const handleSubmit = async (values: z.infer<typeof clientFormSchema>) => {
        await onSubmit({
            ...values,
            preferences,
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <Tabs defaultValue="info" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <TabsList>
                            <TabsTrigger value="info">Personal Info</TabsTrigger>
                            <TabsTrigger value="preferences">Matchers & Preferences</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Client
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="info">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Status, origin and contact details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Status</FormLabel>
                                                <ClientStatusSelector
                                                    status={field.value}
                                                    onStatusChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="leadOrigin"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Lead Origin</FormLabel>
                                                <LeadOriginSelector
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+971 50 000 0000" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Date of Birth</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Street, City, Country" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preferences">
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Matching</CardTitle>
                                <CardDescription>
                                    These preferences are used to automatically find the best properties (Result Score 0-100%).
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PreferenceBuilder
                                    defaultValues={preferences}
                                    onChange={setPreferences}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notes">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notes & Remarks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any additional context, meeting notes, or specific requirements here..."
                                                    className="min-h-[300px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    )
}
