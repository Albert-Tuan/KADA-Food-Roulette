import type { CorsOptions } from 'cors';
import { describe, expect, it } from 'vitest';
import { createCorsOptions } from './cors.js';

async function checkOrigin(options: CorsOptions, origin?: string): Promise<boolean> {
  const originPolicy = options.origin;
  if (typeof originPolicy !== 'function') throw new Error('CORS origin callback is not configured');
  return new Promise((resolve, reject) => {
    originPolicy(origin, (error, allowed) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(allowed === true);
    });
  });
}

describe('CORS policy', () => {
  it('allows Taste Board upload headers and LAN Expo origins in development', async () => {
    const options = createCorsOptions({ NODE_ENV: 'development' });

    await expect(checkOrigin(options, 'http://192.168.1.20:8081')).resolves.toBe(true);
    expect(options.allowedHeaders).toContain('X-Device-ID');
    expect(options.allowedHeaders).toContain('X-Captured-At');
  });

  it('allows configured production origins and requests without browser origin', async () => {
    const options = createCorsOptions({
      NODE_ENV: 'production',
      CLIENT_URLS: 'https://app.example.com, https://admin.example.com',
    });

    await expect(checkOrigin(options, 'https://app.example.com')).resolves.toBe(true);
    await expect(checkOrigin(options)).resolves.toBe(true);
  });

  it('rejects unknown and development-only origins in production', async () => {
    const options = createCorsOptions({
      NODE_ENV: 'production',
      CLIENT_URL: 'https://app.example.com',
    });

    await expect(checkOrigin(options, 'https://attacker.example')).rejects.toThrow('not allowed');
    await expect(checkOrigin(options, 'http://localhost:8081')).rejects.toThrow('not allowed');
  });
});
