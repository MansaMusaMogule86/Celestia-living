"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type MessageRole = "user" | "ai" | "system";

export interface Message {
    id: string;
    role: MessageRole;
    content: string;
    timestamp: Date;
}

interface AiEvent {
    id: string;
    type: "action" | "insight" | "alert";
    message: string;
    timestamp: Date;
    confidence: number;
}

interface CommandContextType {
    messages: Message[];
    events: AiEvent[];
    isProcessing: boolean;
    sendCommand: (content: string) => Promise<void>;
    addEvent: (event: Omit<AiEvent, "id" | "timestamp">) => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [events, setEvents] = useState<AiEvent[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial event stimulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Only add routine events if looking idle
            if (Math.random() > 0.7) {
                const newEvent: AiEvent = {
                    id: Math.random().toString(36).substring(7),
                    type: Math.random() > 0.7 ? "alert" : Math.random() > 0.4 ? "action" : "insight",
                    message: generateAiMessage(),
                    timestamp: new Date(),
                    confidence: Math.round(Math.random() * 20 + 80),
                };
                setEvents((prev) => [newEvent, ...prev].slice(0, 50));
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const addEvent = (event: Omit<AiEvent, "id" | "timestamp">) => {
        const newEvent = {
            ...event,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
        };
        setEvents((prev) => [newEvent, ...prev].slice(0, 50));
    };

    const sendCommand = async (content: string) => {
        const userMsg: Message = {
            id: Math.random().toString(36),
            role: "user",
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            const aiMsg: Message = {
                id: Math.random().toString(36),
                role: "ai",
                content: `I've received your command: "${content}". I'm initiating the necessary workflows now.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);

            addEvent({
                type: "action",
                message: `Executing command: ${content.substring(0, 20)}...`,
                confidence: 99
            });

            setIsProcessing(false);
        }, 1500);
    };

    return (
        <CommandContext.Provider value={{ messages, events, isProcessing, sendCommand, addEvent }}>
            {children}
        </CommandContext.Provider>
    );
}

export function useCommand() {
    const context = useContext(CommandContext);
    if (context === undefined) {
        throw new Error("useCommand must be used within a CommandProvider");
    }
    return context;
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
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}
