 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { Request, Response } from 'express';
import { prisma } from '../../shared/utils/prisma';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

// Helper: format review for client
const formatReview = (r: any) => ({
  id: r.id,
  userId: r.userId,
  restaurantId: r.restaurantId,
  overallRating: r.overallRating,
  tasteRating: r.tasteRating,
  serviceRating: r.serviceRating,
  ambienceRating: r.ambienceRating,
  valueRating: r.valueRating,
  content: r.content,
  photoUrls: r.photoUrls,
  tags: r.tags,
  helpfulCount: r.helpfulCount,
  isVerifiedVisit: r.isVerifiedVisit,
  createdAt: r.createdAt.toISOString(),
  author: r.user
    ? {
        id: r.user.id,
        displayNamePublic: r.user.displayNamePublic,
        avatarUrl: r.user.avatarUrl,
      }
    : undefined,
});

export const reviewsController = {
  // GET /api/v1/reviews?restaurantId=xxx
  // List reviews for a restaurant, with pagination + sort
  listByRestaurant: async (req: Request, res: Response) => {
    try {
      const { restaurantId } = req.query;
      const sort = String(req.query.sort || 'recent'); // recent | helpful | rating_high | rating_low
      const page = Math.max(1, Number(req.query.page) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 20));

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp restaurantId.',
        });
      }

      const orderBy: any =
        sort === 'helpful'
          ? { helpfulCount: 'desc' }
          : sort === 'rating_high'
            ? { overallRating: 'desc' }
            : sort === 'rating_low'
              ? { overallRating: 'asc' }
              : { createdAt: 'desc' };

      const [reviews, total, agg] = await Promise.all([
        (prisma as any).review.findMany({
          where: { restaurantId: String(restaurantId), deletedAt: null },
          orderBy,
          take: pageSize,
          skip: (page - 1) * pageSize,
          include: {
            user: {
              select: {
                id: true,
                displayNamePublic: true,
                avatarUrl: true,
              },
            },
          },
        }),
        (prisma as any).review.count({
          where: { restaurantId: String(restaurantId), deletedAt: null },
        }),
        (prisma as any).review.aggregate({
          where: { restaurantId: String(restaurantId), deletedAt: null },
          _avg: {
            overallRating: true,
            tasteRating: true,
            serviceRating: true,
            ambienceRating: true,
            valueRating: true,
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          reviews: reviews.map(formatReview),
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
          summary: {
            avgOverall: agg._avg.overallRating ?? 0,
            avgTaste: agg._avg.tasteRating ?? null,
            avgService: agg._avg.serviceRating ?? null,
            avgAmbience: agg._avg.ambienceRating ?? null,
            avgValue: agg._avg.valueRating ?? null,
            total,
          },
        },
      });
    } catch (error: any) {
      console.error('[REVIEWS] listByRestaurant error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi lấy danh sách review.',
      });
    }
  },

  // POST /api/v1/reviews/upload
  // Upload a photo for a review
  uploadPhoto: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Không tìm thấy file ảnh' });
      }
      // Return the relative URL so frontend can store it
      const photoUrl = `/uploads/${req.file.filename}`;
      return res.status(200).json({ success: true, url: photoUrl });
    } catch (error: any) {
      console.error('[REVIEWS] uploadPhoto error:', error);
      return res.status(500).json({ success: false, error: 'Lỗi upload ảnh' });
    }
  },

  // POST /api/v1/reviews
  // Create a new review (requires auth)
  create: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Bạn cần đăng nhập để viết review.',
        });
      }

      const {
        restaurantId,
        overallRating,
        tasteRating,
        serviceRating,
        ambienceRating,
        valueRating,
        content,
        photoUrls,
        tags,
      } = req.body;

      // Validate required fields
      if (!restaurantId || !overallRating) {
        return res.status(400).json({
          success: false,
          error: 'restaurantId và overallRating là bắt buộc.',
        });
      }

      // Validate rating range
      const ratings = [overallRating, tasteRating, serviceRating, ambienceRating, valueRating];
      for (const r of ratings) {
        if (r !== undefined && r !== null && (r < 1 || r > 5)) {
          return res.status(400).json({
            success: false,
            error: 'Rating phải trong khoảng 1-5.',
          });
        }
      }

      // Validate restaurant exists
      const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, deletedAt: null },
      });
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy quán.',
        });
      }

      // Validate photoUrls max 5 (SITEMAP §13)
      if (Array.isArray(photoUrls) && photoUrls.length > 5) {
        return res.status(400).json({
          success: false,
          error: 'Tối đa 5 ảnh.',
        });
      }

      // Validate tags max 5 (SITEMAP §13)
      if (Array.isArray(tags) && tags.length > 5) {
        return res.status(400).json({
          success: false,
          error: 'Tối đa 5 tag.',
        });
      }

      // Check if user has a verified check-in at this restaurant (boost isVerifiedVisit)
      const verifiedCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId,
          restaurantId,
          status: 'VERIFIED',
        },
      });

      const review = await (prisma as any).review.create({
        data: {
          userId,
          restaurantId,
          overallRating,
          tasteRating: tasteRating ?? null,
          serviceRating: serviceRating ?? null,
          ambienceRating: ambienceRating ?? null,
          valueRating: valueRating ?? null,
          content: content || null,
          photoUrls: photoUrls || [],
          tags: tags || [],
          isVerifiedVisit: !!verifiedCheckIn,
        },
        include: {
          user: {
            select: {
              id: true,
              displayNamePublic: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Update restaurant.rating (avg)
      const avg = await (prisma as any).review.aggregate({
        where: { restaurantId, deletedAt: null },
        _avg: { overallRating: true },
        _count: true,
      });

      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          rating: avg._avg.overallRating ?? 0,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Đăng review thành công!',
        data: formatReview(review),
      });
    } catch (error: any) {
      console.error('[REVIEWS] create error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi tạo review.',
      });
    }
  },

  // DELETE /api/v1/reviews/:id
  // Soft-delete own review
  delete: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Bạn cần đăng nhập.',
        });
      }

      const review = await (prisma as any).review.findFirst({
        where: { id, deletedAt: null },
      });
      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy review.',
        });
      }

      if (review.userId !== userId && req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Bạn không có quyền xóa review này.',
        });
      }

      await (prisma as any).review.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return res.json({
        success: true,
        message: 'Đã xóa review.',
      });
    } catch (error: any) {
      console.error('[REVIEWS] delete error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi xóa review.',
      });
    }
  },

  // POST /api/v1/reviews/:id/helpful
  // Mark a review as helpful (increment counter)
  markHelpful: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const id = String(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Bạn cần đăng nhập.',
        });
      }

      const review = await (prisma as any).review.findFirst({
        where: { id, deletedAt: null },
      });
      if (!review) {
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy review.',
        });
      }

      const updated = await (prisma as any).review.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } },
      });

      return res.json({
        success: true,
        data: { helpfulCount: updated.helpfulCount },
      });
    } catch (error: any) {
      console.error('[REVIEWS] markHelpful error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi đánh dấu helpful.',
      });
    }
  },
};