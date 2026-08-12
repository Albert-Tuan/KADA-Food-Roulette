/**
 * Geo utilities for Discover Map feature
 * Reference: docs/decisions/002-discover-map.md
 *
 * Implements Haversine distance + bounding box calculation
 * cho MySQL 8.0 geo queries without PostGIS extension.
 */

export const EARTH_RADIUS_KM = 6371;
export const DEFAULT_SEARCH_RADIUS_KM = 5;
export const MAX_SEARCH_RADIUS_KM = 50;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Validate geographic coordinate
 * @throws Error nếu invalid
 */
export function validateGeoPoint(point: GeoPoint, label = 'coordinate'): void {
  if (typeof point.lat !== 'number' || typeof point.lng !== 'number') {
    throw new Error(`Invalid ${label}: lat/lng must be numbers`);
  }
  if (point.lat < -90 || point.lat > 90) {
    throw new Error(`Invalid ${label}: latitude must be between -90 and 90`);
  }
  if (point.lng < -180 || point.lng > 180) {
    throw new Error(`Invalid ${label}: longitude must be between -180 and 180`);
  }
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate Haversine distance between 2 points (in km)
 *
 * Formula:
 *   a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
 *   c = 2 * atan2(√a, √(1-a))
 *   d = R * c
 *
 * @param from Origin point
 * @param to Destination point
 * @returns Distance in kilometers
 */
export function haversineDistance(from: GeoPoint, to: GeoPoint): number {
  validateGeoPoint(from, 'from');
  validateGeoPoint(to, 'to');

  const lat1Rad = toRadians(from.lat);
  const lat2Rad = toRadians(to.lat);
  const deltaLatRad = toRadians(to.lat - from.lat);
  const deltaLngRad = toRadians(to.lng - from.lng);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate bounding box around a point
 *
 * Dùng để pre-filter rows trong SQL query trước khi tính Haversine.
 * Giảm dataset từ potentially millions xuống còn hundreds.
 *
 * Approximation 1 degree latitude ≈ 111 km
 * Longitude varies với latitude: 111 * cos(lat) km
 */
export function boundingBox(center: GeoPoint, radiusKm: number): BoundingBox {
  validateGeoPoint(center, 'center');

  if (radiusKm <= 0 || radiusKm > MAX_SEARCH_RADIUS_KM) {
    throw new Error(`radiusKm must be between 0 and ${MAX_SEARCH_RADIUS_KM}`);
  }

  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos(toRadians(center.lat)));

  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

/**
 * Format distance for display
 *
 * < 1 km: "500 m"
 * >= 1 km: "2.3 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Check if a point is within radius
 */
export function isWithinRadius(
  center: GeoPoint,
  point: GeoPoint,
  radiusKm: number
): boolean {
  return haversineDistance(center, point) <= radiusKm;
}