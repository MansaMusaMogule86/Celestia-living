import { Worker, Job } from "bullmq";
import { QUEUE_NAMES } from "./config";
import type {
    PublishJobData,
    SyncJobData,
    AutomationJobData,
    MetricsFetchJobData,
} from "./config";
import { prisma } from "../db/prisma";
import { getAdapter } from "../adapters/registry";
import { eventBus } from "../events/eventBus";

// ─── Publish Worker ──────────────────────────────────────────────────

async function processPublishJob(job: Job<PublishJobData>): Promise<void> {
    const {
        campaignPostId,
        campaignId,
        portal,
        caption,
        mediaUrls,
        hashtags,
        propertyData,
        accessToken,
        accountId,
    } = job.data;

    console.log(`[PublishWorker] Publishing post ${campaignPostId} to ${portal}`);

    // Mark as publishing
    await prisma.campaignPost.update({
        where: { id: campaignPostId },
        data: { status: "PUBLISHING" },
    });

    const adapter = getAdapter(portal);

    const result = await adapter.publishPost({
        caption,
        mediaUrls,
        hashtags,
        propertyData,
        accessToken,
        accountId,
    });

    if (result.success) {
        await prisma.campaignPost.update({
            where: { id: campaignPostId },
            data: {
                status: "PUBLISHED",
                platformPostId: result.platformPostId,
                platformUrl: result.platformUrl,
                publishedAt: new Date(),
            },
        });

        // Update campaign status
        const allPosts = await prisma.campaignPost.findMany({
            where: { campaignId },
        });
        const allPublished = allPosts.every((p) => p.status === "PUBLISHED");
        if (allPublished) {
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { status: "LIVE", publishedAt: new Date() },
            });
        }

        // Log activity
        await prisma.activityLog.create({
            data: {
                action: "post.published",
                entity: "CampaignPost",
                entityId: campaignPostId,
                metadata: { portal, platformPostId: result.platformPostId },
                userId: (
                    await prisma.campaign.findUnique({
                        where: { id: campaignId },
                        select: { createdById: true },
                    })
                )!.createdById,
            },
        });

        await eventBus.emit({
            type: "post.published",
            payload: {
                campaignPostId,
                campaignId,
                portal,
                platformPostId: result.platformPostId,
            },
            teamId: (
                await prisma.campaign.findUnique({
                    where: { id: campaignId },
                    select: { teamId: true },
                })
            )!.teamId,
            userId: (
                await prisma.campaign.findUnique({
                    where: { id: campaignId },
                    select: { createdById: true },
                })
            )!.createdById,
            timestamp: new Date(),
        });

        console.log(
            `[PublishWorker] ✅ Published ${campaignPostId} to ${portal}: ${result.platformPostId}`
        );
    } else {
        const post = await prisma.campaignPost.findUnique({
            where: { id: campaignPostId },
        });
        const retryCount = (post?.retryCount ?? 0) + 1;
        const maxRetries = post?.maxRetries ?? 3;

        if (retryCount >= maxRetries) {
            await prisma.campaignPost.update({
                where: { id: campaignPostId },
                data: {
                    status: "FAILED",
                    errorMessage: result.error,
                    retryCount,
                },
            });

            // Check if all posts failed → mark campaign as failed
            const allPosts = await prisma.campaignPost.findMany({
                where: { campaignId },
            });
            const allFailed = allPosts.every(
                (p) => p.status === "FAILED" || p.status === "PUBLISHED"
            );
            const anyFailed = allPosts.some((p) => p.status === "FAILED");
            if (allFailed && anyFailed) {
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { status: "FAILED" },
                });
            }

            // Create notification
            const campaign = await prisma.campaign.findUnique({
                where: { id: campaignId },
                select: { createdById: true, title: true },
            });
            if (campaign) {
                await prisma.notification.create({
                    data: {
                        type: "CAMPAIGN_FAILED",
                        title: "Campaign post failed",
                        body: `Post to ${portal} for "${campaign.title}" failed after ${maxRetries} retries: ${result.error}`,
                        userId: campaign.createdById,
                        metadata: { campaignPostId, portal, error: result.error },
                    },
                });
            }

            await eventBus.emit({
                type: "post.failed",
                payload: {
                    campaignPostId,
                    campaignId,
                    portal,
                    error: result.error,
                    retryCount,
                },
                teamId: (
                    await prisma.campaign.findUnique({
                        where: { id: campaignId },
                        select: { teamId: true },
                    })
                )!.teamId,
                userId: campaign!.createdById,
                timestamp: new Date(),
            });

            console.error(
                `[PublishWorker] ❌ Post ${campaignPostId} to ${portal} permanently failed: ${result.error}`
            );
        } else {
            await prisma.campaignPost.update({
                where: { id: campaignPostId },
                data: {
                    retryCount,
                    errorMessage: result.error,
                },
            });

            // BullMQ's built-in retry will handle rescheduling via attempts config
            throw new Error(result.error || "Publish failed, retrying...");
        }
    }
}

// ─── Sync Worker ─────────────────────────────────────────────────────

async function processSyncJob(job: Job<SyncJobData>): Promise<void> {
    const { portalConnectionId, portal, campaignPostIds } = job.data;

    console.log(
        `[SyncWorker] Syncing ${campaignPostIds.length} posts from ${portal}`
    );

    const adapter = getAdapter(portal);

    for (const postId of campaignPostIds) {
        const post = await prisma.campaignPost.findUnique({
            where: { id: postId },
        });
        if (!post || !post.platformPostId) continue;

        try {
            const metrics = await adapter.fetchMetrics({
                platformPostId: post.platformPostId,
            });

            await prisma.engagementMetric.create({
                data: {
                    impressions: metrics.impressions,
                    clicks: metrics.clicks,
                    likes: metrics.likes,
                    comments: metrics.comments,
                    shares: metrics.shares,
                    saves: metrics.saves,
                    reach: metrics.reach,
                    portalConnectionId,
                    campaignPostId: postId,
                    period: "daily",
                },
            });

            console.log(
                `[SyncWorker] ✅ Synced metrics for post ${postId} on ${portal}`
            );
        } catch (err) {
            console.error(
                `[SyncWorker] ⚠ Failed to sync post ${postId} on ${portal}:`,
                err
            );
        }
    }
}

// ─── Automation Execution Worker ─────────────────────────────────────

async function processAutomationJob(
    job: Job<AutomationJobData>
): Promise<void> {
    const { ruleId, eventType, eventPayload, teamId, userId } = job.data;

    console.log(
        `[AutomationWorker] Executing rule ${ruleId} for event ${eventType}`
    );

    const rule = await prisma.automationRule.findUnique({
        where: { id: ruleId },
    });
    if (!rule || !rule.enabled) {
        console.log(`[AutomationWorker] Rule ${ruleId} is disabled, skipping`);
        return;
    }

    const actions = rule.actions as Array<{
        type: string;
        config: Record<string, unknown>;
        order: number;
    }>;

    const sortedActions = [...actions].sort((a, b) => a.order - b.order);

    for (const action of sortedActions) {
        console.log(
            `[AutomationWorker] Executing action: ${action.type} (order: ${action.order})`
        );

        switch (action.type) {
            case "CREATE_CAMPAIGN": {
                const propertyId = eventPayload.propertyId as string;
                if (!propertyId) break;

                const property = await prisma.property.findUnique({
                    where: { id: propertyId },
                });
                if (!property) break;

                const templateId = action.config.templateId as string | undefined;
                let caption = `New listing: ${property.title}`;
                let hashtags: string[] = [];

                if (templateId) {
                    const template = await prisma.postTemplate.findUnique({
                        where: { id: templateId },
                    });
                    if (template) {
                        caption = template.caption
                            .replace("{{property_title}}", property.title)
                            .replace("{{location}}", property.location || "")
                            .replace("{{price}}", property.price.toString())
                            .replace("{{area}}", property.area || "")
                            .replace("{{bedrooms}}", String(property.bedrooms ?? ""))
                            .replace("{{bathrooms}}", String(property.bathrooms ?? ""))
                            .replace("{{size}}", String(property.sizeSqFt ?? ""));
                        hashtags = template.hashtags;
                    }
                }

                await prisma.campaign.create({
                    data: {
                        title: `Auto: ${property.title}`,
                        caption,
                        status: action.config.autoSchedule ? "SCHEDULED" : "DRAFT",
                        scheduleType: action.config.autoSchedule ? "IMMEDIATE" : "SCHEDULED",
                        propertyId,
                        hashtags,
                        mediaUrls: property.images,
                        createdById: userId,
                        teamId,
                        templateId,
                    },
                });

                console.log(
                    `[AutomationWorker] Created campaign for property ${propertyId}`
                );
                break;
            }

            case "SEND_EMAIL": {
                // Mock email send
                console.log(
                    `[AutomationWorker] 📧 Sending email (mock) for rule ${ruleId}`
                );
                break;
            }

            case "SEND_WHATSAPP": {
                // Mock WhatsApp send
                console.log(
                    `[AutomationWorker] 📱 Sending WhatsApp (mock) for rule ${ruleId}`
                );
                break;
            }

            case "ASSIGN_LEAD": {
                // Mock lead assignment
                console.log(
                    `[AutomationWorker] 👤 Assigning lead (mock) for rule ${ruleId}`
                );
                break;
            }

            case "REPOST_EVERY_X_DAYS": {
                const days = action.config.days as number;
                console.log(
                    `[AutomationWorker] 🔄 Setting up repost every ${days} days`
                );
                break;
            }

            default:
                console.log(
                    `[AutomationWorker] Unknown action type: ${action.type}`
                );
        }
    }

    // Update rule stats
    await prisma.automationRule.update({
        where: { id: ruleId },
        data: {
            triggerCount: { increment: 1 },
            lastTriggeredAt: new Date(),
        },
    });
}

// ─── Metrics Fetch Worker ────────────────────────────────────────────

async function processMetricsFetchJob(
    job: Job<MetricsFetchJobData>
): Promise<void> {
    const { campaignPostId, platformPostId, portal, portalConnectionId } =
        job.data;

    const adapter = getAdapter(portal);
    const metrics = await adapter.fetchMetrics({ platformPostId });

    await prisma.engagementMetric.create({
        data: {
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            saves: metrics.saves,
            reach: metrics.reach,
            portalConnectionId,
            campaignPostId,
            period: "daily",
        },
    });

    console.log(
        `[MetricsWorker] ✅ Fetched metrics for post ${campaignPostId} on ${portal}`
    );
}

// ─── Worker Factory ──────────────────────────────────────────────────

export function createWorkers() {
    const connection = {
        url: process.env.REDIS_URL || "redis://localhost:6379",
    };

    const publishWorker = new Worker(
        QUEUE_NAMES.CAMPAIGN_PUBLISH,
        processPublishJob,
        {
            connection,
            concurrency: 5,
            limiter: { max: 10, duration: 1000 }, // Rate limit: 10 jobs/sec
        }
    );

    const syncWorker = new Worker(
        QUEUE_NAMES.CAMPAIGN_SYNC,
        processSyncJob,
        {
            connection,
            concurrency: 3,
        }
    );

    const automationWorker = new Worker(
        QUEUE_NAMES.AUTOMATION_EXECUTE,
        processAutomationJob,
        {
            connection,
            concurrency: 5,
        }
    );

    const metricsWorker = new Worker(
        QUEUE_NAMES.METRICS_FETCH,
        processMetricsFetchJob,
        {
            connection,
            concurrency: 3,
        }
    );

    // Event listeners for logging
    const workers = [publishWorker, syncWorker, automationWorker, metricsWorker];

    for (const worker of workers) {
        worker.on("completed", (job) => {
            console.log(`[Worker:${worker.name}] Job ${job.id} completed`);
        });

        worker.on("failed", (job, err) => {
            console.error(
                `[Worker:${worker.name}] Job ${job?.id} failed: ${err.message}`
            );
        });

        worker.on("error", (err) => {
            console.error(`[Worker:${worker.name}] Error: ${err.message}`);
        });
    }

    console.log("✅ All workers started");

    return { publishWorker, syncWorker, automationWorker, metricsWorker };
}
