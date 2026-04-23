"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Activity } from "lucide-react";

export function AiPulse() {
    return (
        <Card className="h-[600px] flex flex-col border-primary/20 bg-background/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <CardTitle>AI Neural Stream</CardTitle>
                </div>
                <CardDescription>Real-time autonomous decision making</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-3">
                    <Activity className="h-10 w-10 mx-auto opacity-30" />
                    <p className="text-sm">No activity yet</p>
                    <p className="text-xs opacity-70">Events will appear here when AI agents are active</p>
                </div>
            </CardContent>
        </Card>
    );
}
