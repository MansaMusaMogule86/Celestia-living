/**
 * Portal Adapter interface.
 * Every portal (Bayut, Instagram, etc.) implements this contract.
 */

export interface PublishPostInput {
    caption: string;
    mediaUrls: string[];
    hashtags: string[];
    propertyData: Record<string, string | number>;
    accountId?: string;
    accessToken?: string;
}

export interface PublishPostResult {
    success: boolean;
    platformPostId: string | null;
    platformUrl: string | null;
    error: string | null;
}

export interface UpdatePostInput {
    platformPostId: string;
    caption?: string;
    mediaUrls?: string[];
    accessToken?: string;
}

export interface DeletePostInput {
    platformPostId: string;
    accessToken?: string;
}

export interface FetchMetricsInput {
    platformPostId: string;
    accessToken?: string;
}

export interface FetchMetricsResult {
    impressions: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
}

export interface PortalAdapter {
    readonly name: string;

    publishPost(input: PublishPostInput): Promise<PublishPostResult>;
    updatePost(input: UpdatePostInput): Promise<PublishPostResult>;
    deletePost(input: DeletePostInput): Promise<{ success: boolean; error: string | null }>;
    fetchMetrics(input: FetchMetricsInput): Promise<FetchMetricsResult>;
}
