import { prisma } from "../db/prisma";
import { eventBus, DomainEvent } from "../events/eventBus";
import { automationExecuteQueue } from "../queue/config";
import type { AutomationTrigger } from "@prisma/client";

/**
 * Maps domain event types to automation trigger types.
 */
const EVENT_TO_TRIGGER: Record<string, AutomationTrigger> = {
    "property.created": "PROPERTY_CREATED",
    "property.updated": "PROPERTY_UPDATED",
    "property.price_changed": "PRICE_CHANGED",
    "property.status_changed": "STATUS_CHANGED",
    "property.open_house_scheduled": "OPEN_HOUSE_SCHEDULED",
};

/**
 * Evaluate automation rules when a domain event fires.
 * Matching rules are enqueued for async execution.
 */
async function evaluateRules(event: DomainEvent): Promise<void> {
    const trigger = EVENT_TO_TRIGGER[event.type];
    if (!trigger) return;

    // Find enabled rules that match the trigger
    const rules = await prisma.automationRule.findMany({
        where: {
            teamId: event.teamId,
            trigger,
            enabled: true,
        },
    });

    if (rules.length === 0) return;

    console.log(
        `[AutomationEngine] Event ${event.type} matched ${rules.length} rule(s)`
    );

    for (const rule of rules) {
        // Check trigger config conditions
        if (!matchesTriggerConfig(rule.triggerConfig as Record<string, string>, event.payload as Record<string, unknown>)) {
            continue;
        }

        console.log(
            `[AutomationEngine] Enqueuing rule "${rule.name}" (${rule.id})`
        );

        await automationExecuteQueue.add(
            `automation-${rule.id}`,
            {
                ruleId: rule.id,
                eventType: event.type,
                eventPayload: event.payload as Record<string, unknown>,
                teamId: event.teamId,
                userId: event.userId,
            },
            {
                priority: 1,
                removeOnComplete: true,
            }
        );
    }
}

/**
 * Check if the event payload matches the rule's trigger configuration.
 */
function matchesTriggerConfig(
    config: Record<string, string>,
    payload: Record<string, unknown>
): boolean {
    if (!config || Object.keys(config).length === 0) return true;

    // Price min check
    if (config.priceMin) {
        const price = Number(payload.price ?? payload.newPrice ?? 0);
        if (price < Number(config.priceMin)) return false;
    }

    // Price max check
    if (config.priceMax) {
        const price = Number(payload.price ?? payload.newPrice ?? 0);
        if (price > Number(config.priceMax)) return false;
    }

    // Property type check
    if (config.propertyType) {
        const types = config.propertyType.split(",").map((t) => t.trim().toLowerCase());
        const propType = String(payload.type ?? "").toLowerCase();
        if (!types.includes(propType)) return false;
    }

    // Direction check (for price changes)
    if (config.direction) {
        const oldPrice = Number(payload.oldPrice ?? 0);
        const newPrice = Number(payload.newPrice ?? 0);
        if (config.direction === "decrease" && newPrice >= oldPrice) return false;
        if (config.direction === "increase" && newPrice <= oldPrice) return false;
    }

    // Min percent check
    if (config.minPercent) {
        const pct = Number(payload.percentChange ?? 0);
        if (Math.abs(pct) < Number(config.minPercent)) return false;
    }

    // Status check
    if (config.newStatus) {
        const statuses = config.newStatus.split(",").map((s) => s.trim().toLowerCase());
        const newStatus = String(payload.newStatus ?? "").toLowerCase();
        if (!statuses.includes(newStatus)) return false;
    }

    return true;
}

/**
 * Bootstrap the automation engine by subscribing to relevant events.
 */
export function startAutomationEngine(): void {
    const propertyEvents = [
        "property.created",
        "property.updated",
        "property.price_changed",
        "property.status_changed",
        "property.open_house_scheduled",
    ] as const;

    for (const eventType of propertyEvents) {
        eventBus.on(eventType, evaluateRules);
    }

    console.log("✅ Automation engine started, listening for events");
}

/**
 * Manually trigger a rule (for the "Manual trigger" option).
 */
export async function manualTriggerRule(
    ruleId: string,
    userId: string,
    payload: Record<string, unknown> = {}
): Promise<void> {
    const rule = await prisma.automationRule.findUnique({
        where: { id: ruleId },
    });

    if (!rule) throw new Error(`Rule ${ruleId} not found`);
    if (!rule.enabled) throw new Error(`Rule ${ruleId} is disabled`);
    if (rule.trigger !== "MANUAL") {
        throw new Error("This rule does not support manual triggering");
    }

    await automationExecuteQueue.add(
        `manual-${rule.id}`,
        {
            ruleId: rule.id,
            eventType: "manual",
            eventPayload: payload,
            teamId: rule.teamId,
            userId,
        },
        { priority: 1 }
    );
}
