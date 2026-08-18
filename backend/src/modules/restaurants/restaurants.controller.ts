import { Request, Response } from 'express';
import { prisma } from '../../shared/utils/prisma';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const restaurantsController = {
  // GET /api/restaurants - Nearby and filter list
  getNearby: async (req: Request, res: Response) => {
    try {
      const { lat, lng, radiusKm, price, cuisine, search } = req.query;

      const dbRestaurants = await prisma.restaurant.findMany({
        where: { status: 'APPROVED', deletedAt: null },
        include: { photos: { orderBy: { displayOrder: 'asc' }, take: 5 } },
        orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      });

      if (dbRestaurants.length === 0) {
        return res.json([]);
      }

      const latNum = lat != null ? Number(lat) : null;
      const lngNum = lng != null ? Number(lng) : null;
      const radiusNum = radiusKm != null ? Number(radiusKm) : null;
      const priceNum = price != null ? Number(price) : null;

      const list = dbRestaurants
        .filter((r) => {
          if (priceNum != null && r.priceLevel != null && r.priceLevel > priceNum) return false;
          if (
            typeof cuisine === 'string' &&
            cuisine &&
            !(r.category ?? '').toLowerCase().includes(cuisine.toLowerCase())
          ) {
            return false;
          }
          if (
            typeof search === 'string' &&
            search &&
            !r.name.toLowerCase().includes(search.toLowerCase())
          ) {
            return false;
          }
          return true;
        })
        .map((r) => {
          const distance =
            latNum != null && lngNum != null && r.lat != null && r.lng != null
              ? haversineKm(latNum, lngNum, Number(r.lat), Number(r.lng))
              : undefined;
          return {
            id: r.id,
            name: r.name,
            address: r.address ?? undefined,
            lat: r.lat != null ? Number(r.lat) : undefined,
            lng: r.lng != null ? Number(r.lng) : undefined,
            phone: r.phone ?? undefined,
            source: r.source,
            status: r.status,
            ratingAvg: r.rating ?? 0,
            ratingCount: 0,
            category: r.category ?? undefined,
            priceLevel: r.priceLevel ?? undefined,
            photos: r.photos.map((p) => p.photoUrl),
            distance,
            createdAt: r.createdAt.toISOString(),
          };
        })
        .filter((item) => (radiusNum != null && item.distance != null ? item.distance <= radiusNum : true));

      return res.json(list);
    } catch (error: any) {
      console.error('getNearby Error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách quán ăn.' });
    }
  },

  // GET /api/restaurants/:id
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const restaurant = {
        id,
        name: 'Cơm Tấm Ba Cường',
        address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
        phone: '0901234567',
        rating: 4.8,
        reviewCount: 342,
        priceLevel: '$$',
        cuisineType: 'Cơm Tấm',
        openingHours: '06:00 - 22:00',
        photoUrls: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'
        ],
        popularDishes: ['Cơm tấm sườn bì chả', 'Cơm tấm sườn nướng mật ong', 'Canh khổ qua dồn thịt'],
      };

      return res.json(restaurant);
    } catch (error: any) {
      return res.status(500).json({ error: 'Không tìm thấy quán ăn.' });
    }
  },

  // POST /api/restaurants - User-submitted restaurant
  create: async (req: AuthRequest, res: Response) => {
    try {
      const { name, address, cuisineType, priceLevel } = req.body;

      if (!name || !address) {
        return res.status(400).json({ error: 'Tên quán và địa chỉ không được để trống.' });
      }

      const newRestaurant = {
        id: `user_rest_${Date.now()}`,
        name,
        address,
        cuisineType: cuisineType || 'Khác',
        priceLevel: priceLevel || '$$',
        approvalStatus: 'PENDING',
        submittedBy: req.user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
      };

      return res.status(201).json({
        message: 'Đề xuất quán ăn thành công! Quán đang chờ Steward kiểm duyệt.',
        restaurant: newRestaurant,
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Lỗi gửi đề xuất quán ăn.' });
    }
  },
};
