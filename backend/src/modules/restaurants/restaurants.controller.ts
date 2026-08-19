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
      const { category, lat, lng, radiusKm, price, cuisine, search } = req.query;

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
    } catch (error) {
      console.error('getNearby Error:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách quán ăn.' });
    }
  },

  // GET /api/restaurants/:id
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: id as string }
      });

      if (!restaurant) {
        return res.status(404).json({ error: 'Không tìm thấy quán ăn.' });
      }

      const formattedRestaurant = {
        ...restaurant,
        lat: restaurant.lat ? Number(restaurant.lat) : null,
        lng: restaurant.lng ? Number(restaurant.lng) : null,
      };

      return res.json(formattedRestaurant);
    } catch (error) {
      console.error('Error fetching restaurant by id:', error);
      return res.status(500).json({ error: 'Không tìm thấy quán ăn.' });
    }
  },

  // POST /api/restaurants - User-submitted restaurant
  create: async (req: AuthRequest, res: Response) => {
    try {
      const { name, address, category, priceLevel, lat, lng } = req.body;

      if (!name || !address || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Tên quán, địa chỉ và tọa độ không được để trống.' });
      }

      const numLat = Number(lat);
      const numLng = Number(lng);

      // Check for duplicates within 50m
      const existingRestaurants = await prisma.restaurant.findMany({
        where: {
          lat: { not: null },
          lng: { not: null },
        }
      });

      const EARTH_RADIUS_KM = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      
      const isDuplicate = existingRestaurants.some((rest) => {
        const restLat = Number(rest.lat);
        const restLng = Number(rest.lng);
        const dLat = toRad(restLat - numLat);
        const dLng = toRad(restLng - numLng);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(numLat)) * Math.cos(toRad(restLat)) * Math.sin(dLng / 2) ** 2;
        const distanceKm = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
        
        return distanceKm <= 0.05; // 50 meters
      });

      if (isDuplicate) {
        return res.status(409).json({ error: 'Đã có quán ăn khác tồn tại trong vòng bán kính 50m.' });
      }

      // Save to database
      const newRestaurant = await prisma.restaurant.create({
        data: {
          name,
          address,
          lat: numLat,
          lng: numLng,
          category: category || 'Khác',
          priceLevel: typeof priceLevel === 'number' ? priceLevel : 2,
          status: 'PENDING',
          source: 'USER_SUBMITTED',
          rating: 0
        }
      });

      return res.status(201).json({
        message: 'Đề xuất quán ăn thành công! Quán đang chờ Steward kiểm duyệt.',
        data: {
          ...newRestaurant,
          lat: newRestaurant.lat ? Number(newRestaurant.lat) : null,
          lng: newRestaurant.lng ? Number(newRestaurant.lng) : null,
        },
      });
    } catch (error) {
      console.error('Error creating restaurant:', error);
      return res.status(500).json({ error: 'Lỗi gửi đề xuất quán ăn.' });
    }
  },

  // PUT /api/restaurants/:id
  updateStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
      }

      const updated = await prisma.restaurant.update({
        where: { id: id as string },
        data: { status }
      });

      return res.json({ message: 'Đã cập nhật trạng thái.', data: updated });
    } catch (error) {
      console.error('Error updating status:', error);
      return res.status(500).json({ error: 'Lỗi cập nhật trạng thái quán ăn.' });
    }
  },
};
