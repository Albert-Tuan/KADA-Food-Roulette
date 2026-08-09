import { createHmac, timingSafeEqual } from 'node:crypto';

const MEDIA_URL_TTL_SECONDS = 5 * 60;

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

export function createSignedMediaUrl(imageUrl: string, now = Date.now()): string {
  const prefix = '/api/v1/lockets/media/';
  if (!imageUrl.startsWith(prefix)) return imageUrl;

  const key = imageUrl.slice(prefix.length);
  const expires = Math.floor(now / 1000) + MEDIA_URL_TTL_SECONDS;
  const signature = signatureFor(key, expires);
  return `${imageUrl}?expires=${expires}&signature=${signature}`;
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
