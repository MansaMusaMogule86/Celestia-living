import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Celestia Living",
    description: "Next-gen Real Estate CRM",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(
                "min-h-screen bg-background font-sans antialiased",
                inter.variable
            )}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </ThemeProvider>
                <SpeedInsights />
                <Toaster />
            </body>
        </html>
    );
}
