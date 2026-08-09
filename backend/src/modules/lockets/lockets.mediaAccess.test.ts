import { afterEach, describe, expect, it } from 'vitest';
import { createSignedMediaUrl, verifyMediaSignature } from './lockets.mediaAccess.js';

const originalSigningSecret = process.env.LOCKET_MEDIA_SIGNING_SECRET;

afterEach(() => {
  if (originalSigningSecret === undefined) delete process.env.LOCKET_MEDIA_SIGNING_SECRET;
  else process.env.LOCKET_MEDIA_SIGNING_SECRET = originalSigningSecret;
});

describe('Locket media access', () => {
  it('accepts an unmodified signature before expiry', () => {
    process.env.LOCKET_MEDIA_SIGNING_SECRET = 'test-signing-secret';
    const now = Date.UTC(2026, 7, 9, 12, 0, 0);
    const url = createSignedMediaUrl('/api/v1/lockets/media/123.jpg', now);
    const params = new URL(`http://localhost${url}`).searchParams;

    expect(verifyMediaSignature(
      '123.jpg',
      params.get('expires'),
      params.get('signature'),
      now + 1_000,
    )).toBe(true);
  });

  it('rejects expired or key-mismatched signatures', () => {
    process.env.LOCKET_MEDIA_SIGNING_SECRET = 'test-signing-secret';
    const now = Date.UTC(2026, 7, 9, 12, 0, 0);
    const url = createSignedMediaUrl('/api/v1/lockets/media/123.jpg', now);
    const params = new URL(`http://localhost${url}`).searchParams;

    expect(verifyMediaSignature(
      'other.jpg',
      params.get('expires'),
      params.get('signature'),
      now,
    )).toBe(false);
    expect(verifyMediaSignature(
      '123.jpg',
      params.get('expires'),
      params.get('signature'),
      now + 301_000,
    )).toBe(false);
  });

  it('leaves future external storage URLs unchanged', () => {
    expect(createSignedMediaUrl('https://storage.example/locket.jpg')).toBe(
      'https://storage.example/locket.jpg',
    );
  });
});
