import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/utils/prisma';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import {
  boundingBox,
  DEFAULT_SEARCH_RADIUS_KM,
  MAX_SEARCH_RADIUS_KM,
  validateGeoPoint,
} from '../../shared/utils/geo.utils';

/**
 * Restaurants controller - Discover Map feature
 *
 * Implements geo-nearby queries using Haversine formula
 * Reference: docs/decisions/002-discover-map.md
 */

interface NearbyQuery {
  lat?: string;
  lng?: string;
  radiusKm?: string;
  category?: string;
  priceLevel?: string;
  search?: string;
  limit?: string;
  cursor?: string;
}

const NEARBY_DEFAULT_LIMIT = 50;
const NEARBY_MAX_LIMIT = 200;

function parseNearbyQuery(query: NearbyQuery) {
  const lat = query.lat ? parseFloat(query.lat) : undefined;
  const lng = query.lng ? parseFloat(query.lng) : undefined;
  const radiusKm = query.radiusKm
    ? Math.min(parseFloat(query.radiusKm), MAX_SEARCH_RADIUS_KM)
    : DEFAULT_SEARCH_RADIUS_KM;
  const limit = Math.min(
    parseInt(query.limit ?? `${NEARBY_DEFAULT_LIMIT}`, 10) || NEARBY_DEFAULT_LIMIT,
    NEARBY_MAX_LIMIT
  );

  return { lat, lng, radiusKm, limit };
}

export const restaurantsController = {
  /**
   * GET /api/restaurants/nearby
   *
   * Query params:
   *   lat, lng (required)
   *   radiusKm (default 5, max 50)
   *   category (optional filter)
   *   priceLevel (optional filter)
   *   search (optional name search)
   *   limit (default 50, max 200)
   *   cursor (pagination cursor)
   */
  getNearby: async (req: Request, res: Response) => {
    try {
      const parsed = parseNearbyQuery(req.query as NearbyQuery);

      if (parsed.lat === undefined || parsed.lng === undefined) {
        return res.status(400).json({
          error: {
            code: 'MISSING_COORDINATES',
            message: 'lat và lng là bắt buộc',
          },
        });
      }

      const center = { lat: parsed.lat, lng: parsed.lng };
      try {
        validateGeoPoint(center);
      } catch (e: any) {
        return res.status(400).json({
          error: {
            code: 'INVALID_COORDINATES',
            message: e.message,
          },
        });
      }

      const { radiusKm, limit } = parsed;
      const box = boundingBox(center, radiusKm);
      const { category, priceLevel, search, cursor } = req.query as NearbyQuery;

      const where: Prisma.RestaurantWhereInput = {
        status: 'APPROVED',
        deletedAt: null,
        lat: { gte: box.minLat, lte: box.maxLat },
        lng: { gte: box.minLng, lte: box.maxLng },
        ...(category && { category }),
        ...(priceLevel && { priceLevel: parseInt(priceLevel, 10) }),
        ...(search && {
          name: { contains: search, mode: 'insensitive' as Prisma.QueryMode },
        }),
      };

      const restaurants = await prisma.restaurant.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          name: true,
          address: true,
          lat: true,
          lng: true,
          category: true,
          priceLevel: true,
          rating: true,
          source: true,
          photos: {
            take: 1,
            orderBy: { displayOrder: 'asc' },
            select: { photoUrl: true },
          },
        },
      });

      const hasMore = restaurants.length > limit;
      const data = (hasMore ? restaurants.slice(0, limit) : restaurants).map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        lat: r.lat ? Number(r.lat) : null,
        lng: r.lng ? Number(r.lng) : null,
        category: r.category,
        priceLevel: r.priceLevel,
        rating: r.rating,
        source: r.source,
        photoUrl: r.photos[0]?.photoUrl ?? null,
        // Distance sẽ được tính ở client (mobile/web) hoặc ở đây nếu cần.
      }));

      return res.json({
        data,
        center,
        radiusKm,
        pagination: {
          nextCursor: hasMore ? restaurants[limit - 1].id : null,
          limit,
        },
      });
    } catch (error: any) {
      console.error('[restaurants.getNearby]', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Lỗi máy chủ khi lấy danh sách quán ăn.',
        },
      });
    }
  },

  /**
   * GET /api/restaurants/:id
   */
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
          hours: { orderBy: { dayOfWeek: 'asc' } },
          photos: { orderBy: { displayOrder: 'asc' } },
          menus: {
            where: { isActive: true },
            take: 1,
            orderBy: { updatedAt: 'desc' },
          },
        },
      });

      if (!restaurant || restaurant.deletedAt) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy quán ăn.' },
        });
      }

      return res.json(restaurant);
    } catch (error: any) {
      console.error('[restaurants.getById]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Không tìm thấy quán ăn.' },
      });
    }
  },

  /**
   * POST /api/restaurants - User-submitted restaurant
   * Status mặc định là PENDING, chờ steward duyệt
   */
  create: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Cần đăng nhập.' },
        });
      }

      const { name, address, category, priceLevel, lat, lng } = req.body;

      if (!name || !address) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tên quán và địa chỉ không được để trống.',
            details: {
              fields: {
                name: !name ? 'required' : null,
                address: !address ? 'required' : null,
              },
            },
          },
        });
      }

      if (lat !== undefined || lng !== undefined) {
        try {
          validateGeoPoint(
            { lat: Number(lat), lng: Number(lng) },
            'restaurant location'
          );
        } catch (e: any) {
          return res.status(400).json({
            error: { code: 'INVALID_COORDINATES', message: e.message },
          });
        }
      }

      const newRestaurant = await prisma.restaurant.create({
        data: {
          name,
          address,
          category: category ?? null,
          priceLevel: priceLevel ?? null,
          lat: lat !== undefined ? new Prisma.Decimal(lat) : null,
          lng: lng !== undefined ? new Prisma.Decimal(lng) : null,
          source: 'USER_SUBMITTED',
          status: 'PENDING',
        },
      });

      return res.status(201).json({
        message:
          'Đề xuất quán ăn thành công! Quán đang chờ Steward kiểm duyệt.',
        restaurant: newRestaurant,
      });
    } catch (error: any) {
      console.error('[restaurants.create]', error);
      return res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Lỗi gửi đề xuất quán ăn.' },
      });
    }
  },
};