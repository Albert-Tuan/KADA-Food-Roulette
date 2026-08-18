import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { prisma } from '../../shared/utils/prisma';
import { PreferenceLearnerService } from '../../shared/services/preferenceLearner.service';

export const rouletteController = {
  // POST /api/spin/personal
  spinPersonal: async (req: AuthRequest, res: Response) => {
    try {
      const { cuisine } = req.body;

      const restaurants = await prisma.restaurant.findMany({
        where: { status: 'APPROVED', deletedAt: null },
        include: { photos: { orderBy: { displayOrder: 'asc' }, take: 5 } },
      });

      if (restaurants.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Chưa có nhà hàng nào để quay. Vui lòng thử lại sau.',
        });
      }

      let candidates = restaurants;
      if (typeof cuisine === 'string' && cuisine) {
        candidates = candidates.filter((r) =>
          (r.category ?? '').toLowerCase().includes(cuisine.toLowerCase())
        );
      }
      if (candidates.length === 0) {
        candidates = restaurants;
      }

      const selected = candidates[Math.floor(Math.random() * candidates.length)];

      return res.json({
        success: true,
        data: {
          sessionId: `spin_${Date.now()}`,
          restaurant: {
            id: selected.id,
            name: selected.name,
            address: selected.address ?? undefined,
            lat: selected.lat != null ? Number(selected.lat) : undefined,
            lng: selected.lng != null ? Number(selected.lng) : undefined,
            phone: selected.phone ?? undefined,
            source: selected.source,
            status: selected.status,
            ratingAvg: selected.rating ?? 0,
            ratingCount: 0,
            category: selected.category ?? undefined,
            priceLevel: selected.priceLevel ?? undefined,
            photos: selected.photos.map((p) => p.photoUrl),
            distance: 0,
            createdAt: selected.createdAt.toISOString(),
          },
          xpEarned: 10,
          coinsEarned: 5,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: 'Lỗi thực hiện quay chọn quán.' });
    }
  },

  // POST /api/spin/accept
  acceptResult: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { cuisine } = req.body;

      if (userId && cuisine) {
        await PreferenceLearnerService.updateFromAction(userId, {
          type: 'SPIN_ACCEPTED',
          cuisine,
        });
      }

      return res.json({ success: true, message: 'Đã lưu lựa chọn của bạn.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Lỗi xác nhận lựa chọn.' });
    }
  },

  // POST /api/spin/reroll
  rerollResult: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { cuisine } = req.body;

      if (userId && cuisine) {
        await PreferenceLearnerService.updateFromAction(userId, {
          type: 'SPIN_REROLL',
          cuisine,
        });
      }

      return res.json({ success: true, message: 'Đã ghi nhận phản hồi quay lại.' });
    } catch (error: any) {
      return res.status(500).json({ error: 'Lỗi ghi nhận phản hồi.' });
    }
  },

  // GET /api/spin/history
  getHistory: async (req: AuthRequest, res: Response) => {
    try {
      const history = [
        {
          id: 'spin_101',
          spunAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          restaurantName: 'Cơm Tấm Ba Cường',
          cuisineType: 'Cơm Tấm',
          wasAccepted: true,
        },
        {
          id: 'spin_102',
          spunAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          restaurantName: 'Bún Bò Huế Chị Mây',
          cuisineType: 'Bún Bò',
          wasAccepted: true,
        },
      ];

      return res.json(history);
    } catch (error: any) {
      return res.status(500).json({ error: 'Lỗi lấy lịch sử quay.' });
    }
  },
};

