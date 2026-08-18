import { afterEach, describe, expect, it } from 'vitest';
import { readSupabaseStorageConfig } from './supabase.js';

const keys = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_STORAGE_BUCKET',
] as const;
const originalEnvironment = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    const original = originalEnvironment[key];
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});

describe('Supabase Storage configuration', () => {
  it('allows all storage variables to be absent for the dev fallback', () => {
    for (const key of keys) delete process.env[key];
    expect(readSupabaseStorageConfig()).toBeNull();
  });

  it('fails closed when storage configuration is incomplete', () => {
    for (const key of keys) delete process.env[key];
    process.env.SUPABASE_URL = 'https://project.supabase.co';
    expect(() => readSupabaseStorageConfig()).toThrow('must be configured together');
  });

  it('accepts a complete HTTPS backend-only configuration', () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co/path';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret';
    process.env.SUPABASE_STORAGE_BUCKET = 'lockets';

    expect(readSupabaseStorageConfig()).toEqual({
      url: 'https://project.supabase.co',
      serviceRoleKey: 'server-secret',
      bucket: 'lockets',
    });
  });

  it('treats .env.example placeholder values as unconfigured', () => {
    process.env.SUPABASE_URL = 'https://your-project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'your-backend-only-service-role-key';
    process.env.SUPABASE_STORAGE_BUCKET = 'lockets';

    expect(readSupabaseStorageConfig()).toBeNull();
  });

  it('rejects a bucket outside the approved Locket boundary', () => {
    process.env.SUPABASE_URL = 'https://project.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret';
    process.env.SUPABASE_STORAGE_BUCKET = 'public-media';

    expect(() => readSupabaseStorageConfig()).toThrow('must be lockets');
  });
});
