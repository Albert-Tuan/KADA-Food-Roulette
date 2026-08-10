import { afterEach, describe, expect, it } from 'vitest';
import {
  createSignedMediaUrl,
  mediaCacheControl,
  verifyMediaSignature,
} from './lockets.mediaAccess.js';

const originalSigningSecret = process.env.LOCKET_MEDIA_SIGNING_SECRET;

afterEach(() => {
  if (originalSigningSecret === undefined) delete process.env.LOCKET_MEDIA_SIGNING_SECRET;
  else process.env.LOCKET_MEDIA_SIGNING_SECRET = originalSigningSecret;
});

describe('Locket media access', () => {
  it('accepts an unmodified signature before expiry', () => {
    process.env.LOCKET_MEDIA_SIGNING_SECRET = 'test-signing-secret';
    const now = Date.UTC(2026, 7, 9, 12, 0, 0);
    const path = 'lockets/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/original.jpg';
    const url = createSignedMediaUrl(path, now);
    const params = new URL(`http://localhost${url}`).searchParams;

    expect(verifyMediaSignature(
      path,
      params.get('expires'),
      params.get('signature'),
      now + 1_000,
    )).toBe(true);
  });

  it('rejects expired or key-mismatched signatures', () => {
    process.env.LOCKET_MEDIA_SIGNING_SECRET = 'test-signing-secret';
    const now = Date.UTC(2026, 7, 9, 12, 0, 0);
    const path = 'lockets/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/original.jpg';
    const url = createSignedMediaUrl(path, now);
    const params = new URL(`http://localhost${url}`).searchParams;

    expect(verifyMediaSignature(
      path.replace('original.jpg', 'thumbnail.jpg'),
      params.get('expires'),
      params.get('signature'),
      now,
    )).toBe(false);
    expect(verifyMediaSignature(
      path,
      params.get('expires'),
      params.get('signature'),
      now + 3_601_000,
    )).toBe(false);
  });

  it('issues local capability URLs with a one-hour expiry', () => {
    const now = Date.UTC(2026, 7, 9, 12, 0, 0);
    const url = createSignedMediaUrl(
      'lockets/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/original.jpg',
      now,
    );
    const expires = new URL(`http://localhost${url}`).searchParams.get('expires');
    expect(Number(expires)).toBe(Math.floor(now / 1000) + 3_600);
  });

  it('only permits shared caching for public media and requires revalidation', () => {
    expect(mediaCacheControl('PUBLIC')).toBe('public, max-age=0, must-revalidate');
    expect(mediaCacheControl('FRIENDS')).toBe('private, no-store');
    expect(mediaCacheControl('PRIVATE')).toBe('private, no-store');
  });
});
