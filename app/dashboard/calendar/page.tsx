"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    MapPin,
    User,
    Building2,
    Eye,
    Phone,
    Users,
} from "lucide-react";

interface Appointment {
    id: string;
    title: string;
    type: "viewing" | "meeting" | "follow_up" | "call" | "other";
    date: string;
    startTime: string;
    endTime: string;
    client?: string;
    property?: string;
    location?: string;
    notes?: string;
}

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    viewing: { label: "Viewing", color: "text-blue-700", bgColor: "bg-blue-100", icon: Eye },
    meeting: { label: "Meeting", color: "text-purple-700", bgColor: "bg-purple-100", icon: Users },
    follow_up: { label: "Follow Up", color: "text-amber-700", bgColor: "bg-amber-100", icon: Phone },
    call: { label: "Call", color: "text-green-700", bgColor: "bg-green-100", icon: Phone },
    other: { label: "Other", color: "text-gray-700", bgColor: "bg-gray-100", icon: CalendarIcon },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const mockAppointments: Appointment[] = [];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [creatingAppointment, setCreatingAppointment] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newAppointment, setNewAppointment] = useState({
        title: "",
        type: "viewing" as Appointment["type"],
        startTime: "09:00",
        endTime: "10:00",
        client: "",
        property: "",
        location: "",
        notes: "",
    });

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                setLoadingAppointments(true);
                setError(null);
                const response = await fetch("/api/calendar/appointments", { cache: "no-store" });
                const result = await response.json();

                if (!response.ok || !result?.success) {
                    throw new Error(result?.error || "Failed to load appointments");
                }

                setAppointments(result.data || []);
            } catch (loadError: any) {
                setError(loadError.message || "Failed to load appointments");
            } finally {
                setLoadingAppointments(false);
            }
        };

        loadAppointments();
    }, []);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        setSelectedDate(todayStr);
    };

    const getAppointmentsForDate = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return appointments.filter(a => a.date === dateStr);
    };

    const handleCreateAppointment = async () => {
        if (!selectedDate || !newAppointment.title) return;

        try {
            setCreatingAppointment(true);
            setError(null);
            const response = await fetch("/api/calendar/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newAppointment.title,
                    type: newAppointment.type,
                    date: selectedDate,
                    startTime: newAppointment.startTime,
                    endTime: newAppointment.endTime,
                    client: newAppointment.client || undefined,
                    property: newAppointment.property || undefined,
                    location: newAppointment.location || undefined,
                    notes: newAppointment.notes || undefined,
                }),
            });

            const result = await response.json();
            if (!response.ok || !result?.success) {
                throw new Error(result?.error || "Failed to create appointment");
            }

            setAppointments((previous) => [...previous, result.data]);
            setShowNewDialog(false);
            setNewAppointment({
                title: "",
                type: "viewing",
                startTime: "09:00",
                endTime: "10:00",
                client: "",
                property: "",
                location: "",
                notes: "",
            });
        } catch (createError: any) {
            setError(createError.message || "Failed to create appointment");
        } finally {
            setCreatingAppointment(false);
        }
    };

    const selectedDateAppointments = selectedDate
        ? appointments.filter(a => a.date === selectedDate)
        : [];

    // Build calendar grid
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        calendarDays.push(d);
    }

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarIcon className="h-8 w-8 text-primary" />
                        Calendar
                    </h1>
                    <p className="text-muted-foreground">
                        Schedule viewings, meetings, and follow-ups
                    </p>
                </div>
                <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Appointment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Appointment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    placeholder="e.g., Property Viewing - Dubai Marina"
                                    value={newAppointment.title}
                                    onChange={(e) => setNewAppointment(a => ({ ...a, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={newAppointment.type}
                                    onValueChange={(v) => setNewAppointment(a => ({ ...a, type: v as Appointment["type"] }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewing">Property Viewing</SelectItem>
                                        <SelectItem value="meeting">Client Meeting</SelectItem>
                                        <SelectItem value="follow_up">Follow Up</SelectItem>
                                        <SelectItem value="call">Phone Call</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={newAppointment.startTime}
                                        onChange={(e) => setNewAppointment(a => ({ ...a, startTime: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={newAppointment.endTime}
                                        onChange={(e) => setNewAppointment(a => ({ ...a, endTime: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Client (optional)</Label>
                                <Input
                                    placeholder="Client name"
                                    value={newAppointment.client}
                                    onChange={(e) => setNewAppointment(a => ({ ...a, client: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location (optional)</Label>
                                <Input
                                    placeholder="Meeting location"
                                    value={newAppointment.location}
                                    onChange={(e) => setNewAppointment(a => ({ ...a, location: e.target.value }))}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={handleCreateAppointment}
                                disabled={!newAppointment.title || !selectedDate || creatingAppointment}
                            >
                                {selectedDate
                                    ? creatingAppointment
                                        ? "Creating..."
                                        : "Create Appointment"
                                    : "Select a date first"
                                }
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Calendar Grid */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">
                            {MONTHS[currentMonth]} {currentYear}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={goToToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-2">
                            {DAYS.map(day => (
                                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => {
                                if (day === null) {
                                    return <div key={`empty-${index}`} className="h-24" />;
                                }

                                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                const dayAppointments = getAppointmentsForDate(day);
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`h-24 p-1.5 rounded-lg border text-left transition-colors hover:bg-accent/50 ${
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : isToday
                                                    ? "border-primary/50 bg-primary/5"
                                                    : "border-transparent"
                                        }`}
                                    >
                                        <span className={`text-sm font-medium ${
                                            isToday
                                                ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                                                : ""
                                        }`}>
                                            {day}
                                        </span>
                                        <div className="mt-1 space-y-0.5">
                                            {dayAppointments.slice(0, 2).map(apt => {
                                                const cfg = typeConfig[apt.type];
                                                return (
                                                    <div
                                                        key={apt.id}
                                                        className={`text-[10px] px-1 py-0.5 rounded truncate ${cfg.bgColor} ${cfg.color}`}
                                                    >
                                                        {apt.startTime} {apt.title}
                                                    </div>
                                                );
                                            })}
                                            {dayAppointments.length > 2 && (
                                                <div className="text-[10px] text-muted-foreground px-1">
                                                    +{dayAppointments.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar - Selected Date */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {selectedDate
                                    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-AE", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "Select a date"
                                }
                            </CardTitle>
                            <CardDescription>
                                {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? "s" : ""}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingAppointments ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Loading appointments...</p>
                            ) : (
                                !selectedDate ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Click on a date to view appointments
                                    </p>
                                ) : selectedDateAppointments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                        <p className="text-sm text-muted-foreground mb-4">
                                            No appointments on this day
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setShowNewDialog(true)}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Appointment
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedDateAppointments.map(apt => {
                                            const cfg = typeConfig[apt.type];
                                            const Icon = cfg.icon;
                                            return (
                                                <div
                                                    key={apt.id}
                                                    className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bgColor}`}>
                                                            <Icon className={`h-4 w-4 ${cfg.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm">{apt.title}</p>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                {apt.startTime} - {apt.endTime}
                                                            </div>
                                                            {apt.client && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                                    <User className="h-3 w-3" />
                                                                    {apt.client}
                                                                </div>
                                                            )}
                                                            {apt.location && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                                    <MapPin className="h-3 w-3" />
                                                                    {apt.location}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Upcoming</CardTitle>
                            <CardDescription>Next 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {appointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No upcoming appointments
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments
                                        .filter(a => a.date >= todayStr)
                                        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                                        .slice(0, 5)
                                        .map(apt => {
                                            const cfg = typeConfig[apt.type];
                                            return (
                                                <div key={apt.id} className="flex items-center gap-3 text-sm">
                                                    <Badge className={`${cfg.bgColor} ${cfg.color} border-0 text-[10px]`}>
                                                        {cfg.label}
                                                    </Badge>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate font-medium">{apt.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(apt.date + "T00:00:00").toLocaleDateString("en-AE", { month: "short", day: "numeric" })} at {apt.startTime}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
