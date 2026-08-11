/**
 * Moderation API client
 * Reference: docs/decisions/001-ai-moderation.md
 */

import { apiClient as api } from '../../../api/client';

export interface ModerationQueueItem {
  id: string;
  contentType: string;
  contentId: string;
  flaggedBy: string;
  category: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto_hidden';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNote: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationQueueResponse {
  data: ModerationQueueItem[];
  pagination: {
    nextCursor: string | null;
    limit: number;
  };
  filters: Record<string, unknown>;
}

export interface ModerationStats {
  total: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    auto_hidden: number;
  };
  byCategory: Record<string, number>;
  byFlaggedBy: Record<string, number>;
  flaggedToday: number;
}

export interface ModerationQueueFilters {
  status?: string;
  contentType?: string;
  flaggedBy?: string;
  minConfidence?: number;
  maxConfidence?: number;
  cursor?: string;
  limit?: number;
  sortBy?: 'createdAt' | 'confidence';
  sortOrder?: 'asc' | 'desc';
}

export const moderationApi = {
  /**
   * GET /api/moderation/queue
   */
  getQueue(filters: ModerationQueueFilters = {}): Promise<ModerationQueueResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return api
      .get<ModerationQueueResponse>(`/moderation/queue?${params.toString()}`)
      .then((r) => r.data);
  },

  /**
   * GET /api/moderation/queue/:id
   */
  getItem(id: string): Promise<ModerationQueueItem> {
    return api
      .get<ModerationQueueItem>(`/moderation/queue/${id}`)
      .then((r) => r.data);
  },

  /**
   * POST /api/moderation/queue/:id/approve
   */
  approve(id: string, note?: string): Promise<{ message: string; item: ModerationQueueItem }> {
    return api
      .post(`/moderation/queue/${id}/approve`, { note })
      .then((r) => r.data);
  },

  /**
   * POST /api/moderation/queue/:id/reject
   */
  reject(id: string, note?: string): Promise<{ message: string; item: ModerationQueueItem }> {
    return api
      .post(`/moderation/queue/${id}/reject`, { note })
      .then((r) => r.data);
  },

  /**
   * POST /api/moderation/queue/:id/auto-hide
   */
  autoHide(id: string, note?: string): Promise<{ message: string; item: ModerationQueueItem }> {
    return api
      .post(`/moderation/queue/${id}/auto-hide`, { note })
      .then((r) => r.data);
  },

  /**
   * GET /api/moderation/stats
   */
  getStats(): Promise<ModerationStats> {
    return api.get<ModerationStats>('/moderation/stats').then((r) => r.data);
  },
};