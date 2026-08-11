/**
 * Geo utilities - Unit tests
 * Reference: docs/decisions/002-discover-map.md
 */

import {
  haversineDistance,
  boundingBox,
  formatDistance,
  isWithinRadius,
  validateGeoPoint,
  DEFAULT_SEARCH_RADIUS_KM,
} from './geo.utils';

describe('geo.utils', () => {
  describe('haversineDistance', () => {
    const HCMC = { lat: 10.762622, lng: 106.660172 };
    const HANOI = { lat: 21.028511, lng: 105.804817 };

    it('returns 0 for same point', () => {
      expect(haversineDistance(HCMC, HCMC)).toBe(0);
    });

    it('calculates HCMC to Hanoi distance (~1160 km)', () => {
      const distance = haversineDistance(HCMC, HANOI);
      expect(distance).toBeGreaterThan(1100);
      expect(distance).toBeLessThan(1200);
    });

    it('calculates short distance correctly', () => {
      // ~1.1 km apart
      const a = { lat: 10.762622, lng: 106.660172 };
      const b = { lat: 10.772622, lng: 106.660172 };
      const distance = haversineDistance(a, b);
      expect(distance).toBeGreaterThan(1.0);
      expect(distance).toBeLessThan(1.2);
    });

    it('throws on invalid latitude', () => {
      const invalid = { lat: 91, lng: 0 };
      expect(() => haversineDistance(HCMC, invalid)).toThrow(/latitude/);
    });

    it('throws on invalid longitude', () => {
      const invalid = { lat: 0, lng: 181 };
      expect(() => haversineDistance(HCMC, invalid)).toThrow(/longitude/);
    });
  });

  describe('boundingBox', () => {
    const HCMC = { lat: 10.762622, lng: 106.660172 };

    it('returns valid bounding box for 5km radius', () => {
      const box = boundingBox(HCMC, 5);
      expect(box.minLat).toBeLessThan(HCMC.lat);
      expect(box.maxLat).toBeGreaterThan(HCMC.lat);
      expect(box.minLng).toBeLessThan(HCMC.lng);
      expect(box.maxLng).toBeGreaterThan(HCMC.lng);
    });

    it('symmetric around center', () => {
      const box = boundingBox(HCMC, 5);
      const latDelta = (box.maxLat - HCMC.lat) - (HCMC.lat - box.minLat);
      expect(Math.abs(latDelta)).toBeLessThan(0.0001);
    });

    it('throws on invalid radius', () => {
      expect(() => boundingBox(HCMC, 0)).toThrow(/radiusKm/);
      expect(() => boundingBox(HCMC, -1)).toThrow(/radiusKm/);
      expect(() => boundingBox(HCMC, 100)).toThrow(/radiusKm/);
    });
  });

  describe('formatDistance', () => {
    it('formats sub-kilometer as meters', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.123)).toBe('123 m');
    });

    it('formats >= 1 km with decimal', () => {
      expect(formatDistance(1.5)).toBe('1.5 km');
      expect(formatDistance(12.34)).toBe('12.3 km');
    });

    it('handles zero', () => {
      expect(formatDistance(0)).toBe('0 m');
    });
  });

  describe('isWithinRadius', () => {
    const HCMC = { lat: 10.762622, lng: 106.660172 };

    it('returns true for point within radius', () => {
      const nearby = { lat: 10.77, lng: 106.66 };
      expect(isWithinRadius(HCMC, nearby, 5)).toBe(true);
    });

    it('returns false for point outside radius', () => {
      const far = { lat: 11.0, lng: 106.66 };
      expect(isWithinRadius(HCMC, far, 5)).toBe(false);
    });
  });

  describe('validateGeoPoint', () => {
    it('accepts valid point', () => {
      expect(() => validateGeoPoint({ lat: 10.5, lng: 106.5 })).not.toThrow();
    });

    it('rejects non-numbers', () => {
      expect(() => validateGeoPoint({ lat: '10' as any, lng: 106 })).toThrow(/numbers/);
    });
  });

  describe('constants', () => {
    it('exports default radius', () => {
      expect(DEFAULT_SEARCH_RADIUS_KM).toBe(5);
    });
  });
});