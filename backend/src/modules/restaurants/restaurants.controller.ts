import { Request, Response } from 'express';
import { prisma } from '../../shared/utils/prisma';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export const restaurantsController = {
  // GET /api/restaurants - Nearby and filter list
  getNearby: async (req: Request, res: Response) => {
    try {
      const { category } = req.query;

      // Query real data from the database
      const restaurants = await prisma.restaurant.findMany({
        where: {
          status: 'APPROVED',
          ...(category ? { category: String(category) } : {})
        }
      });

      // Convert Decimal to Number for Mobile Map compatibility
      const formattedRestaurants = restaurants.map(rest => ({
        ...rest,
        lat: rest.lat ? Number(rest.lat) : null,
        lng: rest.lng ? Number(rest.lng) : null,
      }));

      return res.json(formattedRestaurants);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error('Error updating status:', error);
      return res.status(500).json({ error: 'Lỗi cập nhật trạng thái quán ăn.' });
    }
  },
};
