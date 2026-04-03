"use client";

import { motion } from "framer-motion";
import { AiPulse } from "@/components/crm/ai-pulse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Bot,
    Target,
    Users,
    TrendingUp,
    BrainCircuit,
    Construction,
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
            >
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    Autonomous Command Center
                </h1>
                <p className="text-muted-foreground mt-1">
                    Overview of AI operations, autonomous agents, and strategic insights.
                </p>
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
                            color="text-blue-500"
                            bg="bg-blue-500/10"
                        />
                        <MetricCard
                            title="Auto-Pilot Leads"
                            value="0"
                            icon={Users}
                            color="text-purple-500"
                            bg="bg-purple-500/10"
                        />
                        <MetricCard
                            title="Conversion Rate"
                            value="0.0%"
                            icon={Target}
                            color="text-emerald-500"
                            bg="bg-emerald-500/10"
                        />
                    </div>

                    <Card className="border-primary/10">
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
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="actions" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorActions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-muted">
                        <CardContent className="py-12 text-center space-y-3">
                            <Construction className="h-10 w-10 mx-auto text-muted-foreground/40" />
                            <h3 className="font-semibold text-muted-foreground">AI Workflow Engine</h3>
                            <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
                                Automated workflows, agent training, and direct command interface are coming soon.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Side Panel */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <AiPulse />

                    <Card className="border-dashed border-2 border-muted">
                        <CardContent className="py-8 text-center space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">System Status</p>
                            <p className="text-xs text-muted-foreground/60">No systems configured yet</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${bg}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="text-sm text-muted-foreground">{title}</p>
                </div>
            </CardContent>
        </Card>
    );
}
