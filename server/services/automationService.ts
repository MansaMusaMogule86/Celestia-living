import { prisma } from "../db/prisma";
import type { CreateAutomationRuleInput, UpdateAutomationRuleInput } from "@/lib/validators";
import { PortalName } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function createAutomationRule(
    input: CreateAutomationRuleInput,
    userId: string,
    teamId: string
) {
    return prisma.automationRule.create({
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
}

export async function getAutomationRules(teamId: string) {
    return prisma.automationRule.findMany({
        where: { teamId },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateAutomationRule(
    id: string,
    input: UpdateAutomationRuleInput,
    teamId: string
) {
    return prisma.automationRule.update({
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
}

export async function deleteAutomationRule(id: string, teamId: string) {
    return prisma.automationRule.delete({
        where: { id, teamId },
    });
}
