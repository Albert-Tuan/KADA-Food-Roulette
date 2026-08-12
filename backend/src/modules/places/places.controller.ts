 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/middleware/auth.middleware';
import { prisma } from '../../shared/utils/prisma';

// Google Places API integration
// Spec: SITEMAP §19.5 - Seed from Google Places + User-submitted + Steward duyệt
//
// Two main use cases:
// 1. searchNearby(lat, lng, radius) - Find places near a location
// 2. savePlace(place) - Save a Google Place as Restaurant (status=APPROVED)
//
// Auth: API key from env (GOOGLE_PLACES_API_KEY)
// If API key missing -> fallback to mock dataset (dev mode).

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const GOOGLE_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Mock dataset for development (used when API key missing)
const MOCK_PLACES = [
  {
    place_id: 'mock_place_001',
    name: 'Bún Chả Hà Nội',
    vicinity: '23 Nguyễn Văn Cừ, Quận 1, TP.HCM',
    geometry: { location: { lat: 10.763000, lng: 106.683000 } },
    types: ['restaurant'],
    rating: 4.7,
    user_ratings_total: 280,
    price_level: 2,
  },
  {
    place_id: 'mock_place_002',
    name: 'Cà Phê Sài Gòn Roastery',
    vicinity: '15 Trần Hưng Đạo, Quận 1, TP.HCM',
    geometry: { location: { lat: 10.770000, lng: 106.690000 } },
    types: ['cafe'],
    rating: 4.8,
    user_ratings_total: 410,
    price_level: 3,
  },
];

interface NearbyPlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
}

// Haversine for filtering
const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

// Map Google Place to our Restaurant format
const mapPlaceToRestaurant = (p: NearbyPlace, distanceKm?: number) => ({
  googlePlaceId: p.place_id,
  name: p.name,
  address: p.vicinity,
  lat: p.geometry.location.lat,
  lng: p.geometry.location.lng,
  category: p.types?.[0] || 'restaurant',
  priceLevel: p.price_level ?? null,
  rating: p.rating ?? 0,
  distance: distanceKm,
});

export const googlePlacesService = {
  // Search nearby places via Google Places API
  // Falls back to mock dataset if API key missing.
  async searchNearby(
    lat: number,
    lng: number,
    radiusKm = 2,
    type = 'restaurant'
  ): Promise<NearbyPlace[]> {
    // DEV MODE: use mock if no API key
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('[GOOGLE_PLACES] No GOOGLE_PLACES_API_KEY, using mock data');
      return MOCK_PLACES.filter(
        (p) => haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng) <= radiusKm
      );
    }

    try {
      const radiusMeters = Math.round(radiusKm * 1000);
      const url = `${GOOGLE_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Google Places API error: ${res.status}`);
      }

      const data: any = await res.json();
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API status: ${data.status}`);
      }

      const places: NearbyPlace[] = data.results || [];
      // Filter by actual distance (Google's radius is approximate)
      return places
        .filter(
          (p) =>
            haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng) <= radiusKm
        )
        .map((p) => ({
          ...p,
          distance: haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
        }));
    } catch (error: any) {
      console.error('[GOOGLE_PLACES] searchNearby failed:', error.message);
      // Graceful fallback
      return MOCK_PLACES.filter(
        (p) => haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng) <= radiusKm
      );
    }
  },

  // Save a Google Place as Restaurant (auto-approve since source=GOOGLE_PLACES)
  async savePlaceAsRestaurant(place: NearbyPlace): Promise<string> {
    // Check if already exists (by googlePlaceId)
    const existing = await prisma.restaurant.findUnique({
      where: { googlePlaceId: place.place_id },
    });
    if (existing) {
      return existing.id;
    }

    const created = await prisma.restaurant.create({
      data: {
        name: place.name,
        address: place.vicinity,
        googlePlaceId: place.place_id,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        category: place.types?.[0] || 'restaurant',
        priceLevel: place.price_level ?? null,
        rating: place.rating ?? 0,
        source: 'GOOGLE_PLACES',
        status: 'APPROVED', // Auto-approve Google Places (per SITEMAP §19.5)
      },
    });

    return created.id;
  },

  // Bulk seed nearby places (used when user opens Discover screen in a new area)
  async seedNearby(
    lat: number,
    lng: number,
    radiusKm = 2
  ): Promise<{ added: number; skipped: number; places: any[] }> {
    const places = await this.searchNearby(lat, lng, radiusKm);

    let added = 0;
    let skipped = 0;

    for (const place of places) {
      const existing = await prisma.restaurant.findUnique({
        where: { googlePlaceId: place.place_id },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await this.savePlaceAsRestaurant(place);
      added++;
    }

    return { added, skipped, places: places.map((p) => mapPlaceToRestaurant(p)) };
  },
};

export const googlePlacesController = {
  // GET /api/v1/places/nearby?lat=..&lng=..&radiusKm=..
  searchNearby: async (req: Request, res: Response) => {
    try {
      const { lat, lng, radiusKm, type } = req.query;

      const latNum = Number(lat);
      const lngNum = Number(lng);
      const radiusNum = radiusKm ? Number(radiusKm) : 2;

      if (isNaN(latNum) || isNaN(lngNum)) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp lat/lng hợp lệ.',
        });
      }

      const places = await googlePlacesService.searchNearby(
        latNum,
        lngNum,
        radiusNum,
        type ? String(type) : 'restaurant'
      );

      return res.json({
        success: true,
        data: places.map((p) => mapPlaceToRestaurant(p)),
        count: places.length,
      });
    } catch (error: any) {
      console.error('[GOOGLE_PLACES] searchNearby controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi tìm quán lân cận.',
      });
    }
  },

  // POST /api/v1/places/seed
  // Seed nearby Google Places into our database (auto-approve)
  seed: async (req: AuthRequest, res: Response) => {
    try {
      const { lat, lng, radiusKm } = req.body;
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const radiusNum = radiusKm ? Number(radiusKm) : 2;

      if (isNaN(latNum) || isNaN(lngNum)) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp lat/lng hợp lệ.',
        });
      }

      const result = await googlePlacesService.seedNearby(latNum, lngNum, radiusNum);

      return res.json({
        success: true,
        message: `Đã thêm ${result.added} quán mới, bỏ qua ${result.skipped} quán đã có.`,
        data: {
          added: result.added,
          skipped: result.skipped,
          places: result.places,
        },
      });
    } catch (error: any) {
      console.error('[GOOGLE_PLACES] seed error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi seed quán từ Google Places.',
      });
    }
  },
};