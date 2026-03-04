import { prisma } from "../db/prisma";
import { campaignPublishQueue, campaignSyncQueue } from "../queue/config";
import { eventBus } from "../events/eventBus";
import type { Prisma, CampaignStatus, PortalName } from "@prisma/client";
import type {
    CreateCampaignInput,
    UpdateCampaignInput,
    BulkScheduleInput,
    CampaignSearchInput,
} from "@/lib/validators";

// ─── Campaign CRUD ───────────────────────────────────────────────────

export async function createCampaign(
    input: CreateCampaignInput,
    userId: string,
    teamId: string
) {
    const campaign = await prisma.campaign.create({
        data: {
            title: input.title,
            caption: input.caption,
            propertyId: input.propertyId,
            templateId: input.templateId,
            scheduleType: input.scheduleType,
            scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
            hashtags: input.hashtags,
            mediaUrls: input.mediaUrls,
            status:
                input.scheduleType === "IMMEDIATE"
                    ? "PUBLISHING"
                    : input.scheduleType === "SCHEDULED"
                        ? "SCHEDULED"
                        : "DRAFT",
            createdById: userId,
            teamId,
        },
        include: { property: true },
    });

    // Create CampaignPost records per portal
    const portalConnections = await prisma.portalConnection.findMany({
        where: {
            teamId,
            portal: { in: input.portals as PortalName[] },
        },
    });

    const posts = await Promise.all(
        input.portals.map(async (portal) => {
            const connection = portalConnections.find(
                (pc) => pc.portal === portal
            );

            // Auto-create connection if missing
            const connectionId = connection
                ? connection.id
                : (
                    await prisma.portalConnection.create({
                        data: {
                            portal: portal as PortalName,
                            teamId,
                            status: "CONNECTED",
                        },
                    })
                ).id;

            return prisma.campaignPost.create({
                data: {
                    campaignId: campaign.id,
                    portalConnectionId: connectionId,
                    portal: portal as PortalName,
                    status: "PENDING",
                },
            });
        })
    );

    // If immediate, enqueue publish jobs
    if (input.scheduleType === "IMMEDIATE") {
        for (const post of posts) {
            await campaignPublishQueue.add(
                `publish-${post.id}`,
                {
                    campaignPostId: post.id,
                    campaignId: campaign.id,
                    portal: post.portal,
                    caption: campaign.caption,
                    mediaUrls: campaign.mediaUrls,
                    hashtags: campaign.hashtags,
                    propertyData: {
                        title: campaign.property.title,
                        price: Number(campaign.property.price),
                        area: campaign.property.area || "",
                        bedrooms: campaign.property.bedrooms ?? 0,
                        bathrooms: campaign.property.bathrooms ?? 0,
                        size: campaign.property.sizeSqFt ?? 0,
                        location: campaign.property.location || "",
                    },
                },
                { priority: 1 }
            );
        }
    }

    // If scheduled, create ScheduledJob entries
    if (input.scheduleType === "SCHEDULED" && input.scheduledAt) {
        const delay = new Date(input.scheduledAt).getTime() - Date.now();

        for (const post of posts) {
            const job = await prisma.scheduledJob.create({
                data: {
                    type: "PUBLISH",
                    status: "PENDING",
                    scheduledAt: new Date(input.scheduledAt!),
                    campaignId: campaign.id,
                    payload: {
                        campaignPostId: post.id,
                        portal: post.portal,
                    },
                },
            });

            // Enqueue with delay
            const bullJob = await campaignPublishQueue.add(
                `scheduled-${post.id}`,
                {
                    campaignPostId: post.id,
                    campaignId: campaign.id,
                    portal: post.portal,
                    caption: campaign.caption,
                    mediaUrls: campaign.mediaUrls,
                    hashtags: campaign.hashtags,
                    propertyData: {
                        title: campaign.property.title,
                        price: Number(campaign.property.price),
                        area: campaign.property.area || "",
                        bedrooms: campaign.property.bedrooms ?? 0,
                        bathrooms: campaign.property.bathrooms ?? 0,
                        size: campaign.property.sizeSqFt ?? 0,
                        location: campaign.property.location || "",
                    },
                },
                { delay: Math.max(delay, 0) }
            );

            // Store BullMQ job ID for pause/cancel
            await prisma.scheduledJob.update({
                where: { id: job.id },
                data: { bullJobId: bullJob.id },
            });
        }
    }

    // Activity log
    await prisma.activityLog.create({
        data: {
            action: "campaign.created",
            entity: "Campaign",
            entityId: campaign.id,
            userId,
            metadata: {
                title: campaign.title,
                portals: input.portals,
                scheduleType: input.scheduleType,
            },
        },
    });

    await eventBus.emit({
        type: "campaign.created",
        payload: { campaignId: campaign.id },
        teamId,
        userId,
        timestamp: new Date(),
    });

    return campaign;
}

export async function updateCampaign(
    id: string,
    input: UpdateCampaignInput,
    teamId: string
) {
    const campaign = await prisma.campaign.update({
        where: { id, teamId, isDeleted: false },
        data: {
            ...(input.title && { title: input.title }),
            ...(input.caption && { caption: input.caption }),
            ...(input.hashtags && { hashtags: input.hashtags }),
            ...(input.mediaUrls && { mediaUrls: input.mediaUrls }),
            ...(input.scheduleType && { scheduleType: input.scheduleType }),
            ...(input.scheduledAt !== undefined && {
                scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
            }),
            ...(input.status && { status: input.status }),
        },
        include: {
            posts: true,
            property: true,
        },
    });

    return campaign;
}

export async function duplicateCampaign(
    id: string,
    userId: string,
    teamId: string
) {
    const source = await prisma.campaign.findUnique({
        where: { id, teamId, isDeleted: false },
        include: { posts: true },
    });

    if (!source) throw new Error("Campaign not found");

    const clone = await prisma.campaign.create({
        data: {
            title: `${source.title} (Copy)`,
            caption: source.caption,
            status: "DRAFT",
            scheduleType: "SCHEDULED",
            hashtags: source.hashtags,
            mediaUrls: source.mediaUrls,
            propertyId: source.propertyId,
            templateId: source.templateId,
            createdById: userId,
            teamId,
        },
    });

    // Clone posts
    for (const post of source.posts) {
        await prisma.campaignPost.create({
            data: {
                campaignId: clone.id,
                portalConnectionId: post.portalConnectionId,
                portal: post.portal,
                status: "PENDING",
            },
        });
    }

    return clone;
}

export async function archiveCampaign(id: string, teamId: string) {
    return prisma.campaign.update({
        where: { id, teamId },
        data: {
            status: "ARCHIVED",
            archivedAt: new Date(),
            isDeleted: true,
        },
    });
}

export async function getCampaignById(id: string, teamId: string) {
    return prisma.campaign.findUnique({
        where: { id, teamId, isDeleted: false },
        include: {
            posts: {
                include: {
                    portalConnection: true,
                    engagementMetrics: {
                        orderBy: { recordedAt: "desc" },
                        take: 1,
                    },
                },
            },
            property: true,
            template: true,
            scheduledJobs: true,
            createdBy: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
            },
        },
    });
}

// ─── Search & Pagination ─────────────────────────────────────────────

export async function searchCampaigns(input: CampaignSearchInput, teamId: string) {
    const where: Prisma.CampaignWhereInput = {
        teamId,
        isDeleted: false,
    };

    if (input.search) {
        where.OR = [
            { title: { contains: input.search, mode: "insensitive" } },
            { caption: { contains: input.search, mode: "insensitive" } },
            { property: { title: { contains: input.search, mode: "insensitive" } } },
        ];
    }

    if (input.status) {
        where.status = input.status;
    }

    if (input.portal) {
        where.posts = {
            some: { portal: input.portal },
        };
    }

    if (input.dateFrom || input.dateTo) {
        where.createdAt = {};
        if (input.dateFrom) where.createdAt.gte = new Date(input.dateFrom);
        if (input.dateTo) where.createdAt.lte = new Date(input.dateTo);
    }

    // Cursor pagination
    const cursor = input.cursor ? { id: input.cursor } : undefined;
    const skip = cursor ? 1 : 0;

    const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
            where,
            include: {
                posts: {
                    include: {
                        portalConnection: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        price: true,
                        area: true,
                    },
                },
                createdBy: {
                    select: { id: true, firstName: true, lastName: true, avatar: true },
                },
            },
            orderBy: { [input.sortBy]: input.sortOrder },
            take: input.limit,
            skip,
            cursor,
        }),
        prisma.campaign.count({ where }),
    ]);

    const nextCursor =
        campaigns.length === input.limit
            ? campaigns[campaigns.length - 1].id
            : null;

    return {
        campaigns,
        total,
        nextCursor,
        hasMore: nextCursor !== null,
    };
}

// ─── Bulk Schedule ───────────────────────────────────────────────────

export async function bulkSchedule(input: BulkScheduleInput, teamId: string) {
    const scheduledAt = new Date(input.scheduledAt);
    const delay = scheduledAt.getTime() - Date.now();

    const results = [];

    for (const campaignId of input.campaignIds) {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId, teamId, isDeleted: false },
            include: { posts: true, property: true },
        });

        if (!campaign) continue;

        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: "SCHEDULED",
                scheduleType: "SCHEDULED",
                scheduledAt,
            },
        });

        for (const post of campaign.posts) {
            const job = await prisma.scheduledJob.create({
                data: {
                    type: "PUBLISH",
                    status: "PENDING",
                    scheduledAt,
                    campaignId,
                    payload: {
                        campaignPostId: post.id,
                        portal: post.portal,
                    },
                },
            });

            const bullJob = await campaignPublishQueue.add(
                `bulk-${post.id}`,
                {
                    campaignPostId: post.id,
                    campaignId,
                    portal: post.portal,
                    caption: campaign.caption,
                    mediaUrls: campaign.mediaUrls,
                    hashtags: campaign.hashtags,
                    propertyData: {
                        title: campaign.property.title,
                        price: Number(campaign.property.price),
                        area: campaign.property.area || "",
                        bedrooms: campaign.property.bedrooms ?? 0,
                        bathrooms: campaign.property.bathrooms ?? 0,
                        size: campaign.property.sizeSqFt ?? 0,
                        location: campaign.property.location || "",
                    },
                },
                { delay: Math.max(delay, 0) }
            );

            await prisma.scheduledJob.update({
                where: { id: job.id },
                data: { bullJobId: bullJob.id },
            });
        }

        results.push({ campaignId, status: "scheduled" });
    }

    return results;
}

// ─── Post Status Update ──────────────────────────────────────────────

export async function updatePostStatus(
    postId: string,
    status: string,
    teamId: string,
    scheduledAt?: string
) {
    const post = await prisma.campaignPost.findFirst({
        where: {
            id: postId,
            campaign: { teamId },
        },
        include: { campaign: { include: { property: true } } },
    });

    if (!post) throw new Error("Post not found");

    // Update the post status
    await prisma.campaignPost.update({
        where: { id: postId },
        data: {
            status: status as "PENDING" | "PUBLISHING" | "PUBLISHED" | "FAILED" | "PAUSED" | "DELETED",
        },
    });

    // Handle specific transitions
    if (status === "PUBLISHING") {
        // Trigger immediate publish
        await campaignPublishQueue.add(`manual-publish-${postId}`, {
            campaignPostId: postId,
            campaignId: post.campaignId,
            portal: post.portal,
            caption: post.campaign.caption,
            mediaUrls: post.campaign.mediaUrls,
            hashtags: post.campaign.hashtags,
            propertyData: {
                title: post.campaign.property.title,
                price: Number(post.campaign.property.price),
                area: post.campaign.property.area || "",
                bedrooms: post.campaign.property.bedrooms ?? 0,
                bathrooms: post.campaign.property.bathrooms ?? 0,
                size: post.campaign.property.sizeSqFt ?? 0,
                location: post.campaign.property.location || "",
            },
        });

        await prisma.campaign.update({
            where: { id: post.campaignId },
            data: { status: "PUBLISHING" },
        });
    }

    if (status === "PENDING" && scheduledAt) {
        const delay = new Date(scheduledAt).getTime() - Date.now();

        const job = await prisma.scheduledJob.create({
            data: {
                type: "PUBLISH",
                status: "PENDING",
                scheduledAt: new Date(scheduledAt),
                campaignId: post.campaignId,
                payload: { campaignPostId: postId, portal: post.portal },
            },
        });

        const bullJob = await campaignPublishQueue.add(
            `reschedule-${postId}`,
            {
                campaignPostId: postId,
                campaignId: post.campaignId,
                portal: post.portal,
                caption: post.campaign.caption,
                mediaUrls: post.campaign.mediaUrls,
                hashtags: post.campaign.hashtags,
                propertyData: {
                    title: post.campaign.property.title,
                    price: Number(post.campaign.property.price),
                    area: post.campaign.property.area || "",
                },
            },
            { delay: Math.max(delay, 0) }
        );

        await prisma.scheduledJob.update({
            where: { id: job.id },
            data: { bullJobId: bullJob.id },
        });

        await prisma.campaign.update({
            where: { id: post.campaignId },
            data: { status: "SCHEDULED", scheduledAt: new Date(scheduledAt) },
        });
    }

    return post;
}

// ─── Pause Campaign ──────────────────────────────────────────────────

export async function pauseCampaign(id: string, teamId: string) {
    const campaign = await prisma.campaign.findUnique({
        where: { id, teamId },
        include: { scheduledJobs: true },
    });

    if (!campaign) throw new Error("Campaign not found");

    // Pause pending scheduled jobs
    for (const job of campaign.scheduledJobs) {
        if (job.status === "PENDING" && job.bullJobId) {
            try {
                const bullJob = await campaignPublishQueue.getJob(job.bullJobId);
                if (bullJob) {
                    await bullJob.remove();
                }
            } catch {
                // Job may already be completed/removed
            }

            await prisma.scheduledJob.update({
                where: { id: job.id },
                data: { status: "PAUSED" },
            });
        }
    }

    // Pause pending posts
    await prisma.campaignPost.updateMany({
        where: { campaignId: id, status: "PENDING" },
        data: { status: "PAUSED" },
    });

    return prisma.campaign.update({
        where: { id },
        data: { status: "DRAFT" },
    });
}

// ─── Sync All Portals ────────────────────────────────────────────────

export async function syncAllPortals(teamId: string) {
    const connections = await prisma.portalConnection.findMany({
        where: { teamId, status: "CONNECTED" },
    });

    const results = [];

    for (const conn of connections) {
        const posts = await prisma.campaignPost.findMany({
            where: {
                portalConnectionId: conn.id,
                status: "PUBLISHED",
                platformPostId: { not: null },
            },
            select: { id: true },
        });

        if (posts.length === 0) continue;

        await campaignSyncQueue.add(`sync-${conn.id}`, {
            portalConnectionId: conn.id,
            portal: conn.portal,
            campaignPostIds: posts.map((p) => p.id),
        });

        results.push({
            portal: conn.portal,
            postsToSync: posts.length,
        });
    }

    return results;
}

// ─── Reschedule Job ──────────────────────────────────────────────────

export async function rescheduleJob(
    jobId: string,
    scheduledAt: string,
    teamId: string
) {
    const job = await prisma.scheduledJob.findFirst({
        where: { id: jobId, campaign: { teamId } },
        include: { campaign: { include: { property: true } } },
    });

    if (!job) throw new Error("Job not found");

    // Remove old BullMQ job
    if (job.bullJobId) {
        try {
            const oldJob = await campaignPublishQueue.getJob(job.bullJobId);
            if (oldJob) await oldJob.remove();
        } catch {
            // Ignore
        }
    }

    const delay = new Date(scheduledAt).getTime() - Date.now();
    const payload = job.payload as { campaignPostId: string; portal: string };

    // Create new BullMQ job
    const newBullJob = await campaignPublishQueue.add(
        `reschedule-${payload.campaignPostId}`,
        {
            campaignPostId: payload.campaignPostId,
            campaignId: job.campaignId,
            portal: payload.portal,
            caption: job.campaign.caption,
            mediaUrls: job.campaign.mediaUrls,
            hashtags: job.campaign.hashtags,
            propertyData: {
                title: job.campaign.property.title,
                price: Number(job.campaign.property.price),
                area: job.campaign.property.area || "",
            },
        },
        { delay: Math.max(delay, 0) }
    );

    // Update scheduled job
    await prisma.scheduledJob.update({
        where: { id: jobId },
        data: {
            scheduledAt: new Date(scheduledAt),
            bullJobId: newBullJob.id,
            status: "PENDING",
        },
    });

    // Update campaign scheduledAt
    await prisma.campaign.update({
        where: { id: job.campaignId },
        data: { scheduledAt: new Date(scheduledAt) },
    });

    return { success: true };
}
