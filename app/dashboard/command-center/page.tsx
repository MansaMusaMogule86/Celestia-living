"use client";

import { motion } from "framer-motion";
import { AiPulse } from "@/components/crm/ai-pulse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Bot,
    Target,
    Zap,
    MessageSquare,
    Sparkles,
    Command,
    Mic,
    Send,
    Users,
    TrendingUp,
    BrainCircuit
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { time: "09:00", actions: 0 },
    { time: "10:00", actions: 0 },
    { time: "11:00", actions: 0 },
    { time: "12:00", actions: 0 },
    { time: "13:00", actions: 0 },
    { time: "14:00", actions: 0 },
    { time: "15:00", actions: 0 },
];

export default function CommandPage() {
    return (
        <div className="h-full space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-primary" />
                        Autonomous Command Center
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of AI operations, autonomous agents, and strategic insights.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
                        <Bot className="h-4 w-4" />
                        Train Agents
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
                        <Zap className="h-4 w-4" />
                        Configure Workflows
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="grid grid-cols-3 gap-4">
                        <MetricCard
                            title="Active Agents"
                            value="0"
                            icon={Bot}
                            trend="0"
                            color="text-blue-500"
                            bg="bg-blue-500/10"
                        />
                        <MetricCard
                            title="Auto-Pilot Leads"
                            value="0"
                            icon={Users}
                            trend="0%"
                            color="text-purple-500"
                            bg="bg-purple-500/10"
                        />
                        <MetricCard
                            title="Conversion Rate"
                            value="0.0%"
                            icon={Target}
                            trend="0.0%"
                            color="text-emerald-500"
                            bg="bg-emerald-500/10"
                        />
                    </div>

                    <Card className="border-primary/10 bg-gradient-to-br from-background via-background to-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Autonomous Activity
                            </CardTitle>
                            <CardDescription>
                                AI actions performed over the last 8 hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorActions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="actions" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorActions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-20 pointer-events-none" />
                        <Card className="border-primary/20 bg-background/80 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Command className="h-5 w-5" />
                                    Direct Command Interface
                                </CardTitle>
                                <CardDescription>
                                    Issue direct instructions to the Autonomous Brain
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Sparkles className="absolute left-3 top-3 h-4 w-4 text-primary animate-pulse" />
                                        <Input placeholder="Ask the AI to generate leads, optimize ads, or analyze calls..." className="pl-10 h-12 bg-background/50 border-primary/20 focus-visible:ring-primary/50" />
                                    </div>
                                    <Button size="icon" className="h-12 w-12 shrink-0 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                                        <Mic className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" className="h-12 w-12 shrink-0 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90">
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/5 transition-colors whitespace-nowrap">
                                        "Create a cold email campaign for Dentists in Dubai"
                                    </Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/5 transition-colors whitespace-nowrap">
                                        "Optimize Google Ads for 'Luxury Real Estate'"
                                    </Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/5 transition-colors whitespace-nowrap">
                                        "Draft follow-up for leads inactive &gt; 30 days"
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>

                {/* Side Panel - AI Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <AiPulse />

                    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">System Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <StatusRow label="Lead Scoring Engine" status="Online" color="bg-emerald-500" />
                            <StatusRow label="Email Authenticity" status="Verified (99%)" color="bg-emerald-500" />
                            <StatusRow label="SMS Gateway" status="Active" color="bg-emerald-500" />
                            <StatusRow label="Knowledge Base" status="Syncing..." color="bg-amber-500" animate />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, trend, color, bg }: any) {
    return (
        <Card className="overflow-hidden relative group hover:border-primary/50 transition-colors cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${bg}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    {trend && (
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            {trend}
                        </span>
                    )}
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="text-sm text-muted-foreground">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function StatusRow({ label, status, color, animate }: any) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${color} ${animate ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{status}</span>
            </div>
        </div>
    )
}
