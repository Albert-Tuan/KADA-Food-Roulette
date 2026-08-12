/**
 * Moderation Controller - Steward moderation queue API
 *
 * Reference: docs/decisions/001-ai-moderation.md §API Endpoints
 */

import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/utils/prisma';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { ModerationService } from '../../shared/services/moderation.service';
import { OpenAIModerationAdapter } from '../../shared/services/openai-moderation.adapter';
import { NsfwAdapter } from '../../shared/services/nsfw-moderation.adapter';

// Singleton moderation service
let moderationServiceInstance: ModerationService | null = null;
function getModerationService(): ModerationService {
  if (!moderationServiceInstance) {
    moderationServiceInstance = new ModerationService(
      new OpenAIModerationAdapter(),
      new NsfwAdapter()
    );
  }
  return moderationServiceInstance;
}

interface QueueListQuery {
  status?: string;
  contentType?: string;
  minConfidence?: string;
  maxConfidence?: string;
  flaggedBy?: string;
  limit?: string;
  cursor?: string;
  sortBy?: 'createdAt' | 'confidence';
  sortOrder?: 'asc' | 'desc';
}

function requireSteward(req: AuthRequest, res: Response): boolean {
  const role = req.user?.role;
  if (role !== 'STEWARD' && role !== 'ADMIN') {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Chỉ Steward hoặc Admin mới có quyền.' },
    });
    return false;
  }
  return true;
}

export const moderationController = {
  /**
   * GET /api/moderation/queue
   * List moderation queue items với filters
   */
  getQueue: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const q = req.query as QueueListQuery;
      const limit = Math.min(parseInt(q.limit ?? '50', 10) || 50, 200);
      const cursor = q.cursor;

      const where: Prisma.ModerationQueueWhereInput = {
        ...(q.status && { status: q.status }),
        ...(q.contentType && { contentType: q.contentType }),
        ...(q.flaggedBy && { flaggedBy: q.flaggedBy }),
        ...((q.minConfidence || q.maxConfidence) && {
          confidence: {
            ...(q.minConfidence && { gte: parseFloat(q.minConfidence) }),
            ...(q.maxConfidence && { lte: parseFloat(q.maxConfidence) }),
          },
        }),
      };

      const sortBy = q.sortBy ?? 'createdAt';
      const sortOrder = q.sortOrder ?? 'desc';

      const items = await prisma.moderationQueue.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { [sortBy]: sortOrder },
      });

      const hasMore = items.length > limit;
      const data = (hasMore ? items.slice(0, limit) : items).map((item) => ({
        ...item,
        payload: item.payload ? JSON.parse(item.payload) : null,
      }));

      return res.json({
        data,
        pagination: {
          nextCursor: hasMore ? items[limit - 1].id : null,
          limit,
        },
        filters: where,
      });
    } catch (error: any) {
      console.error('[moderation.getQueue]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi lấy moderation queue.' },
      });
    }
  },

  /**
   * GET /api/moderation/queue/:id
   * Item detail
   */
  getItem: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const { id } = req.params;
      const item = await prisma.moderationQueue.findUnique({ where: { id } });

      if (!item) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy moderation item.' },
        });
      }

      return res.json({
        ...item,
        payload: item.payload ? JSON.parse(item.payload) : null,
      });
    } catch (error: any) {
      console.error('[moderation.getItem]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi lấy moderation item.' },
      });
    }
  },

  /**
   * POST /api/moderation/queue/:id/approve
   * Approve flagged content (mark as not violating)
   */
  approve: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const { id } = req.params;
      const { note } = req.body ?? {};

      const item = await prisma.moderationQueue.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
          reviewerNote: note ?? null,
        },
      });

      return res.json({
        message: 'Đã duyệt nội dung. Nội dung sẽ hiển thị bình thường.',
        item,
      });
    } catch (error: any) {
      console.error('[moderation.approve]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi approve.' },
      });
    }
  },

  /**
   * POST /api/moderation/queue/:id/reject
   * Reject flagged content (confirm violation, will hide)
   */
  reject: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const { id } = req.params;
      const { note } = req.body ?? {};

      const item = await prisma.moderationQueue.update({
        where: { id },
        data: {
          status: 'rejected',
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
          reviewerNote: note ?? null,
        },
      });

      // TODO: Trường implement hide content effect (set isHidden=true on Review/Locket)

      return res.json({
        message: 'Đã từ chối nội dung. Nội dung sẽ bị ẩn.',
        item,
      });
    } catch (error: any) {
      console.error('[moderation.reject]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi reject.' },
      });
    }
  },

  /**
   * POST /api/moderation/queue/:id/auto-hide
   * Auto-hide triggered (for items with auto_hide action)
   */
  autoHide: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const { id } = req.params;
      const { note } = req.body ?? {};

      const item = await prisma.moderationQueue.update({
        where: { id },
        data: {
          status: 'auto_hidden',
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
          reviewerNote: note ?? null,
        },
      });

      return res.json({
        message: 'Đã ẩn nội dung tự động.',
        item,
      });
    } catch (error: any) {
      console.error('[moderation.autoHide]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi auto-hide.' },
      });
    }
  },

  /**
   * GET /api/moderation/stats
   * Stats cho dashboard
   */
  getStats: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const [total, pending, approved, rejected, autoHidden] = await Promise.all([
        prisma.moderationQueue.count(),
        prisma.moderationQueue.count({ where: { status: 'pending' } }),
        prisma.moderationQueue.count({ where: { status: 'approved' } }),
        prisma.moderationQueue.count({ where: { status: 'rejected' } }),
        prisma.moderationQueue.count({ where: { status: 'auto_hidden' } }),
      ]);

      const byCategory = await prisma.moderationQueue.groupBy({
        by: ['category'],
        _count: true,
      });

      const byFlaggedBy = await prisma.moderationQueue.groupBy({
        by: ['flaggedBy'],
        _count: true,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const flaggedToday = await prisma.moderationQueue.count({
        where: { createdAt: { gte: today } },
      });

      return res.json({
        total,
        byStatus: {
          pending,
          approved,
          rejected,
          auto_hidden: autoHidden,
        },
        byCategory: Object.fromEntries(
          byCategory.map((c) => [c.category, c._count])
        ),
        byFlaggedBy: Object.fromEntries(
          byFlaggedBy.map((f) => [f.flaggedBy, f._count])
        ),
        flaggedToday,
      });
    } catch (error: any) {
      console.error('[moderation.getStats]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi lấy stats.' },
      });
    }
  },

  /**
   * POST /api/moderation/check
   * Manual moderation check (cho testing hoặc explicit request)
   * Body: { contentType, contentId, text?, imageUrl? }
   */
  checkContent: async (req: AuthRequest, res: Response) => {
    if (!requireSteward(req, res)) return;

    try {
      const { contentType, contentId, text, imageUrl } = req.body ?? {};

      if (!contentType || !contentId) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'contentType và contentId là bắt buộc.',
          },
        });
      }

      const service = getModerationService();
      const verdict = await service.moderate({
        contentType,
        contentId,
        text,
        imageUrl,
      });

      // Persist to queue nếu flagged
      if (verdict.flagged) {
        await prisma.moderationQueue.create({
          data: {
            contentType,
            contentId,
            flaggedBy: 'manual',
            category: verdict.category!,
            confidence: verdict.confidence,
            status: 'pending',
            payload: JSON.stringify(verdict.rawResponse ?? verdict.scores),
          },
        });
      }

      return res.json(verdict);
    } catch (error: any) {
      console.error('[moderation.checkContent]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi check content.' },
      });
    }
  },
};