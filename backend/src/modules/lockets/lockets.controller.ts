import { Request, Response } from 'express';
import prisma from '../../shared/utils/prisma';
import { responseHelper } from '../../shared/utils/responseHelper';

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const locketsController = {
  create: async (req: AuthRequest, res: Response) => {
    try {
      const {
        restaurantId,
        dishName,
        note,
        rating,
        tags,
        imageUrl,
        thumbnailUrl,
        deviceHash,
        capturedAt,
        lat,
        lng,
        visibility,
        groupId
      } = req.body;

      if (!req.user?.id) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      if (rating && (rating < 1 || rating > 5)) {
        return responseHelper.error(res, 'Đánh giá không hợp lệ', 400);
      }

      const captureTime = new Date(capturedAt);
      const serverTime = new Date();
      if (Math.abs(serverTime.getTime() - captureTime.getTime()) > 60000) {
        return responseHelper.error(res, 'Thời gian không hợp lệ', 400);
      }

      const locket = await prisma.locket.create({
        data: {
          userId: req.user.id,
          restaurantId,
          dishName,
          note,
          rating,
          tags: tags ? JSON.stringify(tags) : undefined,
          imageUrl,
          thumbnailUrl,
          deviceHash,
          capturedAt: captureTime,
          lat,
          lng,
          visibility: visibility || 'FRIENDS',
          groupId
        },
        include: {
          restaurant: true
        }
      });

      return responseHelper.created(res, locket);
    } catch (error: any) {
      return responseHelper.error(res, 'Lỗi tạo locket', 500);
    }
  },

  getFeed: async (req: AuthRequest, res: Response) => {
    try {
      const { cursor, limit = 20 } = req.query;
      const take = Number(limit);
      const userId = req.user?.id;

      let whereClause: any = { visibility: 'PUBLIC', status: 'ACTIVE' };

      if (userId) {
        const friendships = await prisma.friendship.findMany({
          where: {
            OR: [
              { requesterId: userId },
              { addresseeId: userId }
            ],
            status: 'ACCEPTED'
          }
        });

        const friendIds = friendships.map(f =>
          f.requesterId === userId ? f.addresseeId : f.requesterId
        );

        whereClause = {
          status: 'ACTIVE',
          OR: [
            { userId: userId },
            { userId: { in: friendIds }, visibility: { in: ['PUBLIC', 'FRIENDS'] } },
            { visibility: 'PUBLIC' }
          ]
        };
      }

      const lockets = await prisma.locket.findMany({
        take,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: String(cursor) } : undefined,
        where: whereClause,
        orderBy: { capturedAt: 'desc' },
        include: {
          user: {
            select: {
              publicId: true,
              displayNamePublic: true,
              avatarUrl: true
            }
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              category: true
            }
          }
        }
      });

      const nextCursor = lockets.length === take ? lockets[take - 1].id : null;

      return res.status(200).json({
        success: true,
        data: lockets,
        meta: { nextCursor }
      });
    } catch (error: any) {
      return responseHelper.error(res, 'Lỗi lấy bảng tin', 500);
    }
  },

  getMyLockets: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const lockets = await prisma.locket.findMany({
        where: { userId: req.user.id, status: 'ACTIVE' },
        orderBy: { capturedAt: 'desc' },
        include: { restaurant: true }
      });

      return responseHelper.success(res, lockets);
    } catch (error: any) {
      return responseHelper.error(res, 'Lỗi lấy danh sách', 500);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const locket = await prisma.locket.findUnique({
        where: { id },
        include: {
          user: true,
          restaurant: true
        }
      });

      if (!locket || locket.status === 'REMOVED') {
        return responseHelper.error(res, 'Không tìm thấy locket', 404);
      }

      return responseHelper.success(res, locket);
    } catch (error: any) {
      return responseHelper.error(res, 'Lỗi máy chủ', 500);
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { dishName, note, rating, tags, visibility } = req.body;

      if (rating && (rating < 1 || rating > 5)) {
        return responseHelper.error(res, 'Đánh giá không hợp lệ', 400);
      }

      const locket = await prisma.locket.update({
        where: { id },
        data: {
          ...(dishName !== undefined && { dishName }),
          ...(note !== undefined && { note }),
          ...(rating !== undefined && { rating }),
          ...(tags !== undefined && { tags: JSON.stringify(tags) }),
          ...(visibility !== undefined && { visibility })
        }
      });

      return responseHelper.success(res, locket);
    } catch (error: any) {
      return responseHelper.error(res, 'Lỗi cập nhật locket', 500);
    }
  },

  remove: async (req: AuthRequest, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await prisma.locket.update({
        where: { id },
        data: {
          status: 'REMOVED'
        }
      });

      return responseHelper.success(res, { message: 'Đã xoá locket' });
    } catch (error: any) {
      return responseHelper.error(res, 'Lỗi xoá locket', 500);
    }
  }
};
