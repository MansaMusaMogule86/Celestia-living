import {
    PortalAdapter,
    PublishPostInput,
    PublishPostResult,
    UpdatePostInput,
    DeletePostInput,
    FetchMetricsInput,
    FetchMetricsResult,
} from "./types";

/**
 * Base mock adapter with configurable latency and error rate.
 * Subclass to simulate specific portal behaviour.
 */
export class MockPortalAdapter implements PortalAdapter {
    readonly name: string;
    private latencyMs: number;
    private errorRate: number; // 0–1

    constructor(name: string, latencyMs = 800, errorRate = 0.05) {
        this.name = name;
        this.latencyMs = latencyMs;
        this.errorRate = errorRate;
    }

    private async simulateLatency(): Promise<void> {
        const jitter = Math.random() * this.latencyMs * 0.4;
        await new Promise((r) => setTimeout(r, this.latencyMs + jitter));
    }

    private shouldFail(): boolean {
        return Math.random() < this.errorRate;
    }

    private generateId(): string {
        return `${this.name}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
        await this.simulateLatency();

        if (this.shouldFail()) {
            return {
                success: false,
                platformPostId: null,
                platformUrl: null,
                error: `[${this.name}] API rate limit exceeded. Try again later.`,
            };
        }

        const postId = this.generateId();
        return {
            success: true,
            platformPostId: postId,
            platformUrl: `https://${this.name.toLowerCase()}.com/posts/${postId}`,
            error: null,
        };
    }

    async updatePost(input: UpdatePostInput): Promise<PublishPostResult> {
        await this.simulateLatency();

        if (this.shouldFail()) {
            return {
                success: false,
                platformPostId: input.platformPostId,
                platformUrl: null,
                error: `[${this.name}] Failed to update post: Service unavailable`,
            };
        }

        return {
            success: true,
            platformPostId: input.platformPostId,
            platformUrl: `https://${this.name.toLowerCase()}.com/posts/${input.platformPostId}`,
            error: null,
        };
    }

    async deletePost(input: DeletePostInput): Promise<{ success: boolean; error: string | null }> {
        await this.simulateLatency();

        if (this.shouldFail()) {
            return {
                success: false,
                error: `[${this.name}] Delete failed: Post not found or already deleted`,
            };
        }

        return { success: true, error: null };
    }

    async fetchMetrics(input: FetchMetricsInput): Promise<FetchMetricsResult> {
        await this.simulateLatency();

        // Return realistic-looking random metrics
        return {
            impressions: Math.floor(Math.random() * 50000) + 100,
            clicks: Math.floor(Math.random() * 2000) + 10,
            likes: Math.floor(Math.random() * 5000) + 5,
            comments: Math.floor(Math.random() * 200),
            shares: Math.floor(Math.random() * 500),
            saves: Math.floor(Math.random() * 300),
            reach: Math.floor(Math.random() * 40000) + 50,
        };
    }
}
