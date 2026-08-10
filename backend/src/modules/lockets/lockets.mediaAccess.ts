import { createHmac, timingSafeEqual } from 'node:crypto';
import type { LocketVisibility } from '@prisma/client';

export const MEDIA_URL_TTL_SECONDS = 60 * 60;

export function mediaCacheControl(visibility: LocketVisibility): string {
  return visibility === 'PUBLIC'
    ? 'public, max-age=0, must-revalidate'
    : 'private, no-store';
}

function signingSecret(): string {
  const secret = process.env.LOCKET_MEDIA_SIGNING_SECRET ?? process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('LOCKET_MEDIA_SIGNING_SECRET or JWT_SECRET is required in production');
  }
  return 'food-roulette-dev-media-signing-key';
}

function signatureFor(key: string, expires: number): string {
  return createHmac('sha256', signingSecret())
    .update(`${key}.${expires}`)
    .digest('hex');
}

export function createSignedMediaUrl(storagePath: string, now = Date.now()): string {
  const expires = Math.floor(now / 1000) + MEDIA_URL_TTL_SECONDS;
  const signature = signatureFor(storagePath, expires);
  return `/api/v1/lockets/media/${storagePath}?expires=${expires}&signature=${signature}`;
}

export function verifyMediaSignature(
  key: string,
  expiresValue: unknown,
  signatureValue: unknown,
  now = Date.now(),
): boolean {
  if (typeof expiresValue !== 'string' || typeof signatureValue !== 'string') return false;
  if (!/^\d{10}$/.test(expiresValue) || !/^[a-f0-9]{64}$/.test(signatureValue)) return false;

  const expires = Number(expiresValue);
  if (expires < Math.floor(now / 1000)) return false;

  const expected = Buffer.from(signatureFor(key, expires), 'hex');
  const received = Buffer.from(signatureValue, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}
