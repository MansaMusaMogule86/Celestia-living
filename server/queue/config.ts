import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

// ─── Redis Connection ────────────────────────────────────────────────

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export function createRedisConnection(): IORedis {
    return new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
    });
}

// Singleton for the app process
const globalForRedis = globalThis as unknown as { redis?: IORedis };
export const redis = globalForRedis.redis ?? createRedisConnection();
if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Prevent unhandled error events from crashing the process or spamming the console
redis.on("error", (err) => {
    // console.error("[Redis] Connection error:", err.message);
});

// ─── Queue Names ─────────────────────────────────────────────────────

export const QUEUE_NAMES = {
    CAMPAIGN_PUBLISH: "campaign-publish",
    CAMPAIGN_SYNC: "campaign-sync",
    AUTOMATION_EXECUTE: "automation-execute",
    METRICS_FETCH: "metrics-fetch",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── Queue Instances ─────────────────────────────────────────────────

const defaultQueueOptions = {
    connection: redis as unknown as import("bullmq").ConnectionOptions,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential" as const,
            delay: 2000,
        },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
    },
};

export const campaignPublishQueue = new Queue(
    QUEUE_NAMES.CAMPAIGN_PUBLISH,
    defaultQueueOptions
);

export const campaignSyncQueue = new Queue(
    QUEUE_NAMES.CAMPAIGN_SYNC,
    defaultQueueOptions
);

export const automationExecuteQueue = new Queue(
    QUEUE_NAMES.AUTOMATION_EXECUTE,
    defaultQueueOptions
);

export const metricsFetchQueue = new Queue(
    QUEUE_NAMES.METRICS_FETCH,
    defaultQueueOptions
);

// Prevent unhandled error events from BullMQ crashing or spamming the console
[campaignPublishQueue, campaignSyncQueue, automationExecuteQueue, metricsFetchQueue].forEach(q => {
    q.on("error", (err) => {
        // console.error(`[Queue Error]`, err.message);
    });
});

// ─── Queue Events (for real-time UI updates) ─────────────────────────

export function createQueueEvents(name: QueueName): QueueEvents {
    return new QueueEvents(name, { connection: createRedisConnection() as unknown as import("bullmq").ConnectionOptions });
}

// ─── Job Types ───────────────────────────────────────────────────────

export interface PublishJobData {
    campaignPostId: string;
    campaignId: string;
    portal: string;
    caption: string;
    mediaUrls: string[];
    hashtags: string[];
    propertyData: Record<string, string | number>;
    accessToken?: string;
    accountId?: string;
}

export interface SyncJobData {
    portalConnectionId: string;
    portal: string;
    campaignPostIds: string[];
}

export interface AutomationJobData {
    ruleId: string;
    eventType: string;
    eventPayload: Record<string, unknown>;
    teamId: string;
    userId: string;
}

export interface MetricsFetchJobData {
    campaignPostId: string;
    platformPostId: string;
    portal: string;
    portalConnectionId: string;
}
