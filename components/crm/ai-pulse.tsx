"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuit, Activity, Zap, CheckCircle2, AlertTriangle, MessageSquare, Terminal } from "lucide-react";

interface AiEvent {
    id: string;
    type: "action" | "insight" | "alert";
    message: string;
    timestamp: Date;
    confidence: number;
}

export function AiPulse() {
    const [events, setEvents] = useState<AiEvent[]>([]);

    useEffect(() => {
        // Simulate incoming AI events
        const interval = setInterval(() => {
            const newEvent: AiEvent = {
                id: Math.random().toString(36).substring(7),
                type: Math.random() > 0.7 ? "alert" : Math.random() > 0.4 ? "action" : "insight",
                message: generateAiMessage(),
                timestamp: new Date(),
                confidence: Math.round(Math.random() * 20 + 80), // 80-100% confidence
            };
            setEvents((prev) => [newEvent, ...prev].slice(0, 50));
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="h-[600px] flex flex-col border-primary/20 bg-background/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
                        <CardTitle>AI Neural Stream</CardTitle>
                    </div>
                    <Badge variant="outline" className="animate-pulse border-primary/50 text-primary">
                        LIVE PROCESSING
                    </Badge>
                </div>
                <CardDescription>Real-time autonomous decision making</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-6">
                    <div className="space-y-4">
                        {events.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className={`flex gap-3 p-3 rounded-lg border text-sm relative group overflow-hidden ${event.type === "alert"
                                        ? "bg-destructive/10 border-destructive/20"
                                        : event.type === "action"
                                            ? "bg-primary/10 border-primary/20"
                                            : "bg-muted/50 border-border/50"
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                                <div className="mt-0.5">
                                    {event.type === "alert" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                    {event.type === "action" && <Zap className="h-4 w-4 text-primary" />}
                                    {event.type === "insight" && <Activity className="h-4 w-4 text-muted-foreground" />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`font-mono font-medium ${event.type === "alert" ? "text-destructive" : "text-foreground"
                                            }`}>
                                            {event.type.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {event.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground/90">{event.message}</p>
                                    <div className="flex items-center gap-2 text-xs opacity-70">
                                        <span className="font-mono">Confidence: {event.confidence}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {events.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground animate-pulse">
                                Initializing Neural Network...
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function generateAiMessage() {
    const messages = [
        "Detected high intent from Lead #4829 (Click-through rate > 15%)",
        "Autonomously scheduled meeting with Sarah J. for tomorrow at 2 PM",
        "Optimizing email campaign 'Q3 Outreach' based on open rates",
        "Flagged negative sentiment in conversation with TechCorp Inc.",
        "Identified new prospect: John Doe (CTO at StartupX)",
        "Enriched profile data for Acryllic Dental: Revenue $2M+",
        "Updating lead score for Mark S. +15 points (Website Visit)",
        "Drafting personalized follow-up for inactive leads (30 days)",
        "Syncing calendar availability across all agents",
        "Analyzing competitor pricing for market positioning",
        "Responding to inquire from automated chat widget",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}
