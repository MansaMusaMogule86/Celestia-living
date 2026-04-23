import { prisma } from "../db/prisma";
import type { CreateAutomationRuleInput, UpdateAutomationRuleInput } from "@/lib/validators";
import { PortalName } from "@prisma/client";
import { Prisma } from "@prisma/client";

let prismaEnabled = true;

// In-memory store for mock automation rules
const mockRules: Array<{
    id: string; name: string; trigger: string; triggerConfig: Record<string, unknown>;
    actions: unknown; portals: string[]; enabled: boolean;
    createdById: string; teamId: string; createdAt: Date; updatedAt: Date;
}> = [];

export async function createAutomationRule(
    input: CreateAutomationRuleInput,
    userId: string,
    teamId: string
) {
    const mock = {
        id: `rule-${Date.now()}`,
        name: input.name,
        trigger: input.trigger,
        triggerConfig: (input.triggerConfig ?? {}) as Record<string, unknown>,
        actions: input.actions,
        portals: input.portals as string[],
        enabled: input.enabled ?? true,
        createdById: userId,
        teamId,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    if (!prismaEnabled) {
        mockRules.push(mock);
        return mock;
    }
    try {
        return await prisma.automationRule.create({
            data: {
                name: input.name,
                trigger: input.trigger,
                triggerConfig: input.triggerConfig,
                actions: input.actions as Prisma.InputJsonValue,
                portals: input.portals as PortalName[],
                enabled: input.enabled,
                createdById: userId,
                teamId,
            },
        });
    } catch (err) {
        prismaEnabled = false;
        console.error("[automationService] createAutomationRule Prisma error, falling back to mock:", err);
        mockRules.push(mock);
        return mock;
    }
}

export async function getAutomationRules(teamId: string) {
    if (!prismaEnabled) {
        return mockRules.filter(r => r.teamId === teamId);
    }
    try {
        return await prisma.automationRule.findMany({
            where: { teamId },
            orderBy: { createdAt: "desc" },
        });
    } catch (err) {
        prismaEnabled = false;
        console.error("[automationService] getAutomationRules Prisma error, falling back to mock:", err);
        return mockRules.filter(r => r.teamId === teamId);
    }
}

export async function updateAutomationRule(
    id: string,
    input: UpdateAutomationRuleInput,
    teamId: string
) {
    if (!prismaEnabled) {
        const idx = mockRules.findIndex(r => r.id === id && r.teamId === teamId);
        if (idx === -1) throw new Error("Not Found");
        mockRules[idx] = { ...mockRules[idx], ...input, updatedAt: new Date() };
        return mockRules[idx];
    }
    try {
        return await prisma.automationRule.update({
            where: { id, teamId },
            data: {
                ...(input.name && { name: input.name }),
                ...(input.trigger && { trigger: input.trigger }),
                ...(input.triggerConfig && { triggerConfig: input.triggerConfig }),
                ...(input.actions && { actions: input.actions as Prisma.InputJsonValue }),
                ...(input.portals && { portals: input.portals as PortalName[] }),
                ...(input.enabled !== undefined && { enabled: input.enabled }),
            },
        });
    } catch (err) {
        prismaEnabled = false;
        console.error("[automationService] updateAutomationRule Prisma error, falling back to mock:", err);
        const idx = mockRules.findIndex(r => r.id === id && r.teamId === teamId);
        if (idx === -1) throw new Error("Not Found");
        mockRules[idx] = { ...mockRules[idx], ...input, updatedAt: new Date() };
        return mockRules[idx];
    }
}

export async function deleteAutomationRule(id: string, teamId: string) {
    if (!prismaEnabled) {
        const idx = mockRules.findIndex(r => r.id === id && r.teamId === teamId);
        if (idx !== -1) mockRules.splice(idx, 1);
        return;
    }
    try {
        await prisma.automationRule.delete({ where: { id, teamId } });
    } catch (err) {
        prismaEnabled = false;
        console.error("[automationService] deleteAutomationRule Prisma error, falling back to mock:", err);
        const idx = mockRules.findIndex(r => r.id === id && r.teamId === teamId);
        if (idx !== -1) mockRules.splice(idx, 1);
    }
}
