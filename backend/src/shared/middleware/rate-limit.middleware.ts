/**
 * Simple in-memory rate limit middleware
 *
 * NOTE: Dùng cho MVP. Production nên dùng Redis-based (e.g. `rate-limiter-flexible`).
 *
 * Reference: ADR-002 Discover Map §4 Rate Limiting
 */

import { Request, Response, NextFunction } from 'express';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Cleanup expired buckets mỗi 5 phút
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max, keyGenerator, message } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator ? keyGenerator(req) : req.ip ?? 'unknown';
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(max - 1));
      res.setHeader('X-RateLimit-Reset', String(Math.floor((now + windowMs) / 1000)));
      return next();
    }

    existing.count += 1;
    const remaining = Math.max(0, max - existing.count);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(existing.resetAt / 1000)));

    if (existing.count > max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: message ?? 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        },
      });
      return;
    }

    next();
  };
}