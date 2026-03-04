"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    Building2,
    User,
    Bell,
    Lock,
    Palette,
    Save,
    CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        companyName: "Ilan Real Estate",
        email: "admin@ilanrealestate.com",
        phone: "+971 4 123 4567",
        address: "Business Bay, Dubai, UAE",
        currency: "AED",
        emailNotifications: true,
        smsNotifications: false,
        autoSync: true,
        darkMode: false,
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Simulate save
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="h-8 w-8 text-primary" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your CRM preferences
                    </p>
                </div>
                <Button onClick={handleSave} className="gap-2">
                    {saved ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Company Information
                        </CardTitle>
                        <CardDescription>Your business details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={settings.companyName}
                                onChange={(e) => setSettings(s => ({ ...s, companyName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={settings.address}
                                onChange={(e) => setSettings(s => ({ ...s, address: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={settings.phone}
                                    onChange={(e) => setSettings(s => ({ ...s, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    value={settings.currency}
                                    onChange={(e) => setSettings(s => ({ ...s, currency: e.target.value }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Profile */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            User Profile
                        </CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl font-semibold">A</span>
                            </div>
                            <div>
                                <p className="font-medium">Admin User</p>
                                <p className="text-sm text-muted-foreground">Administrator</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings(s => ({ ...s, email: e.target.value }))}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Lock className="h-4 w-4" />
                            Change Password
                        </Button>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive updates via email
                                </p>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) =>
                                    setSettings(s => ({ ...s, emailNotifications: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">SMS Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Receive updates via SMS
                                </p>
                            </div>
                            <Switch
                                checked={settings.smsNotifications}
                                onCheckedChange={(checked) =>
                                    setSettings(s => ({ ...s, smsNotifications: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Auto-sync Portals</p>
                                <p className="text-sm text-muted-foreground">
                                    Automatically sync with property portals
                                </p>
                            </div>
                            <Switch
                                checked={settings.autoSync}
                                onCheckedChange={(checked) =>
                                    setSettings(s => ({ ...s, autoSync: checked }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize the look and feel</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-sm text-muted-foreground">
                                    Use dark theme
                                </p>
                            </div>
                            <Switch
                                checked={settings.darkMode}
                                onCheckedChange={(checked) =>
                                    setSettings(s => ({ ...s, darkMode: checked }))
                                }
                            />
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-3">Theme Colors</p>
                            <div className="flex gap-2">
                                <button
                                    className="w-8 h-8 rounded-full bg-blue-600 ring-2 ring-offset-2 ring-blue-600"
                                    title="Blue theme"
                                    aria-label="Select blue theme"
                                />
                                <button
                                    className="w-8 h-8 rounded-full bg-emerald-600"
                                    title="Emerald theme"
                                    aria-label="Select emerald theme"
                                />
                                <button
                                    className="w-8 h-8 rounded-full bg-purple-600"
                                    title="Purple theme"
                                    aria-label="Select purple theme"
                                />
                                <button
                                    className="w-8 h-8 rounded-full bg-amber-600"
                                    title="Amber theme"
                                    aria-label="Select amber theme"
                                />
                                <button
                                    className="w-8 h-8 rounded-full bg-rose-600"
                                    title="Rose theme"
                                    aria-label="Select rose theme"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Info */}
            <Card>
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>CRM details and status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Version</p>
                            <p className="font-medium">1.0.0</p>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-green-600">Active</Badge>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">Last Backup</p>
                            <p className="font-medium">Never</p>
                        </div>
                        <div className="p-4 rounded-lg border">
                            <p className="text-sm text-muted-foreground">License</p>
                            <p className="font-medium">Pro</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
