/**
 * In-process event bus for the automation engine.
 * Emits domain events that automation rules subscribe to.
 * In production, replace with Redis Pub/Sub or a dedicated message broker.
 */

export type DomainEventType =
    | "property.created"
    | "property.updated"
    | "property.price_changed"
    | "property.status_changed"
    | "property.open_house_scheduled"
    | "campaign.created"
    | "campaign.published"
    | "campaign.failed"
    | "lead.created"
    | "post.published"
    | "post.failed";

export interface DomainEvent<T = unknown> {
    type: DomainEventType;
    payload: T;
    teamId: string;
    userId: string;
    timestamp: Date;
}

type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void> | void;

class EventBus {
    private handlers: Map<DomainEventType, EventHandler[]> = new Map();
    private globalHandlers: EventHandler[] = [];

    on<T = unknown>(type: DomainEventType, handler: EventHandler<T>): () => void {
        const handlers = this.handlers.get(type) || [];
        handlers.push(handler as EventHandler);
        this.handlers.set(type, handlers);

        return () => {
            const current = this.handlers.get(type) || [];
            this.handlers.set(
                type,
                current.filter((h) => h !== handler)
            );
        };
    }

    onAny(handler: EventHandler): () => void {
        this.globalHandlers.push(handler);
        return () => {
            this.globalHandlers = this.globalHandlers.filter((h) => h !== handler);
        };
    }

    async emit<T = unknown>(event: DomainEvent<T>): Promise<void> {
        const handlers = this.handlers.get(event.type) || [];
        const allHandlers = [...handlers, ...this.globalHandlers];

        await Promise.allSettled(
            allHandlers.map(async (handler) => {
                try {
                    await handler(event as DomainEvent);
                } catch (err) {
                    console.error(
                        `[EventBus] Handler error for ${event.type}:`,
                        err
                    );
                }
            })
        );
    }

    removeAll(): void {
        this.handlers.clear();
        this.globalHandlers = [];
    }
}

// Singleton
const globalForBus = globalThis as unknown as { eventBus?: EventBus };
export const eventBus = globalForBus.eventBus ?? new EventBus();
if (process.env.NODE_ENV !== "production") globalForBus.eventBus = eventBus;

// ─── Typed event helpers ─────────────────────────────────────────────

export interface PropertyCreatedPayload {
    propertyId: string;
    title: string;
    type: string;
    price: number;
    area: string | null;
}

export interface PropertyPriceChangedPayload {
    propertyId: string;
    oldPrice: number;
    newPrice: number;
    percentChange: number;
}

export interface PropertyStatusChangedPayload {
    propertyId: string;
    oldStatus: string;
    newStatus: string;
}

export interface CampaignPublishedPayload {
    campaignId: string;
    postCount: number;
}

export interface PostPublishedPayload {
    campaignPostId: string;
    campaignId: string;
    portal: string;
    platformPostId: string | null;
}

export interface PostFailedPayload {
    campaignPostId: string;
    campaignId: string;
    portal: string;
    error: string;
    retryCount: number;
}

export interface LeadCreatedPayload {
    leadId: string;
    source: string;
    email?: string;
    phone?: string;
}
