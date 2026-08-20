/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';
import { prisma } from '../../shared/utils/prisma';

// Google Places & OpenStreetMap (OSM) dynamic integration
// Spec: SITEMAP §19.5 - Seed real places from Google Places / OpenStreetMap (Free 100%)

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const GOOGLE_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=800&q=80',
  'https://images.unsplash.com/photo-1581514467005-4f404edc0082?w=800&q=80',
  'https://images.unsplash.com/photo-1596649283311-66779b7b901a?w=800&q=80',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80',
  'https://images.unsplash.com/photo-1633511130906-8d80f83dd717?w=800&q=80',
  'https://images.unsplash.com/photo-1626804475297-41609ae065c7?w=800&q=80',
  'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
];

function getRandomImage(): string {
  return FOOD_IMAGES[Math.floor(Math.random() * FOOD_IMAGES.length)];
}

interface NearbyPlace {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photo_url?: string;
}

// Haversine for distance calculation
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

function formatCategory(rawCategory?: string): string {
  if (!rawCategory) return 'Quán Ăn';
  const lower = rawCategory.toLowerCase();
  if (lower.includes('cafe') || lower.includes('coffee')) return 'Cà phê';
  if (lower.includes('tea') || lower.includes('tra') || lower.includes('trà')) return 'Trà Sữa';
  if (lower.includes('pho') || lower.includes('phở')) return 'Phở';
  if (lower.includes('bun') || lower.includes('bún')) return 'Bún';
  if (lower.includes('com') || lower.includes('cơm')) return 'Cơm';
  if (lower.includes('noodle') || lower.includes('mì') || lower.includes('hu tieu') || lower.includes('hủ tiếu')) return 'Mì - Hủ Tiếu';
  if (lower.includes('bbq') || lower.includes('nuong') || lower.includes('nướng')) return 'Đồ Nướng';
  if (lower.includes('hotpot') || lower.includes('lau') || lower.includes('lẩu')) return 'Lẩu';
  if (lower.includes('pizza') || lower.includes('burger') || lower.includes('fast_food')) return 'Fast Food';
  if (lower.includes('bar') || lower.includes('pub') || lower.includes('beer')) return 'Quán Nhậu';
  if (lower.includes('ice_cream') || lower.includes('che') || lower.includes('chè')) return 'Ăn Vặt';
  return 'Ẩm thực';
}

// Map Place to standard Restaurant response format
const mapPlaceToRestaurant = (p: NearbyPlace, distanceKm?: number) => ({
  googlePlaceId: p.place_id,
  name: p.name,
  address: p.vicinity,
  lat: p.geometry.location.lat,
  lng: p.geometry.location.lng,
  category: formatCategory(p.types?.[0]),
  priceLevel: p.price_level ?? 2,
  rating: p.rating ?? 4.5,
  distance: distanceKm,
  photoUrl: p.photo_url || getRandomImage(),
});

export const googlePlacesService = {
  // Search nearby places via Google Places (or OpenStreetMap Free Fallback)
  async searchNearby(
    lat: number,
    lng: number,
    radiusKm = 3,
    type = 'restaurant'
  ): Promise<NearbyPlace[]> {
    // 1. If Google API Key is provided, use Google Places API
    if (GOOGLE_PLACES_API_KEY) {
      try {
        const radiusMeters = Math.round(radiusKm * 1000);
        const url = `${GOOGLE_BASE_URL}/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data: any = await res.json();
          if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
            const places: NearbyPlace[] = data.results || [];
            return places
              .filter(
                (p) =>
                  haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng) <= radiusKm
              )
              .map((p) => ({
                ...p,
                distance: haversineKm(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
              }));
          }
        }
      } catch (error: any) {
        console.warn('[PLACES] Google Places API failed, falling back to OpenStreetMap:', error.message);
      }
    }

    // 2. 100% Free Live Fallback: Query OpenStreetMap Overpass API in Real-time
    try {
      const radiusMeters = Math.min(Math.round(radiusKm * 1000), 5000);
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"~"restaurant|cafe|fast_food|food_court|ice_cream|bar|pub"](around:${radiusMeters},${lat},${lng});
        );
        out body;
      `;
      const osmUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      console.log(`[PLACES] Fetching real places from OpenStreetMap around (${lat}, ${lng}) with radius ${radiusMeters}m...`);

      const res = await fetch(osmUrl, {
        headers: {
          'User-Agent': 'FoodRoulette/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const data: any = await res.json();
        const elements: any[] = data.elements || [];
        const nodes = elements.filter((e) => e.type === 'node' && e.tags && e.tags.name);

        console.log(`[PLACES] Successfully fetched ${nodes.length} real locations from OpenStreetMap!`);

        return nodes.map((node) => {
          const name = node.tags.name;
          const nodeLat = node.lat;
          const nodeLng = node.lon;
          const rawCat = node.tags.cuisine || node.tags.amenity || 'restaurant';
          const street = node.tags['addr:street'] || '';
          const houseNo = node.tags['addr:housenumber'] || '';
          const vicinity = `${houseNo} ${street}`.trim() || 'Khu vực lân cận';
          const dist = haversineKm(lat, lng, nodeLat, nodeLng);

          return {
            place_id: `osm_node_${node.id}`,
            name,
            vicinity,
            geometry: { location: { lat: nodeLat, lng: nodeLng } },
            types: [rawCat],
            rating: parseFloat((Math.random() * (4.9 - 4.1) + 4.1).toFixed(1)),
            user_ratings_total: Math.floor(Math.random() * 150) + 10,
            price_level: Math.floor(Math.random() * 3) + 1,
            photo_url: getRandomImage(),
            distance: dist,
          };
        });
      }
    } catch (osmErr: any) {
      console.warn('[PLACES] OpenStreetMap Overpass fetch failed:', osmErr.message);
    }

    return [];
  },

  // Save a Place as Restaurant (auto-approve into Database)
  async savePlaceAsRestaurant(place: NearbyPlace): Promise<string> {
    // Check if already exists (by googlePlaceId or exact name+location)
    const existing = await prisma.restaurant.findFirst({
      where: {
        OR: [
          { googlePlaceId: place.place_id },
          { name: place.name, lat: place.geometry.location.lat, lng: place.geometry.location.lng },
        ],
      },
    });

    if (existing) {
      return existing.id;
    }

    const photo = place.photo_url || getRandomImage();

    const created = await prisma.restaurant.create({
      data: {
        name: place.name,
        address: place.vicinity || 'Việt Nam',
        googlePlaceId: place.place_id,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        category: formatCategory(place.types?.[0]),
        priceLevel: place.price_level ?? 2,
        rating: place.rating ?? 4.5,
        source: 'GOOGLE_PLACES',
        status: 'APPROVED',
        photos: {
          create: [
            {
              photoUrl: photo,
              displayOrder: 1,
            },
          ],
        },
      },
    });

    return created.id;
  },

  // Bulk seed nearby places into DB
  async seedNearby(
    lat: number,
    lng: number,
    radiusKm = 3
  ): Promise<{ added: number; skipped: number; places: any[] }> {
    const places = await this.searchNearby(lat, lng, radiusKm);

    let added = 0;
    let skipped = 0;

    for (const place of places) {
      const existing = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { googlePlaceId: place.place_id },
            { name: place.name, lat: place.geometry.location.lat, lng: place.geometry.location.lng },
          ],
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await this.savePlaceAsRestaurant(place);
      added++;
    }

    return { added, skipped, places: places.map((p) => mapPlaceToRestaurant(p, (p as any).distance)) };
  },
};

export const googlePlacesController = {
  // GET /api/v1/places/nearby?lat=..&lng=..&radiusKm=..
  searchNearby: async (req: Request, res: Response) => {
    try {
      const { lat, lng, radiusKm, type } = req.query;

      const latNum = Number(lat);
      const lngNum = Number(lng);
      const radiusNum = radiusKm ? Number(radiusKm) : 3;

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
        data: places.map((p) => mapPlaceToRestaurant(p, (p as any).distance)),
        count: places.length,
      });
    } catch (error: any) {
      console.error('[PLACES] searchNearby controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi tìm quán lân cận.',
      });
    }
  },

  // POST /api/v1/places/seed
  seed: async (req: Request, res: Response) => {
    try {
      const { lat, lng, radiusKm } = req.body;
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const radiusNum = radiusKm ? Number(radiusKm) : 3;

      if (isNaN(latNum) || isNaN(lngNum)) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng cung cấp lat/lng hợp lệ.',
        });
      }

      const result = await googlePlacesService.seedNearby(latNum, lngNum, radiusNum);

      return res.json({
        success: true,
        message: `Đã cập nhật ${result.added} quán mới quanh vị trí của bạn, bỏ qua ${result.skipped} quán đã có.`,
        data: {
          added: result.added,
          skipped: result.skipped,
          places: result.places,
        },
      });
    } catch (error: any) {
      console.error('[PLACES] seed error:', error);
      return res.status(500).json({
        success: false,
        error: 'Lỗi nạp quán thực tế lân cận.',
      });
    }
  },
};