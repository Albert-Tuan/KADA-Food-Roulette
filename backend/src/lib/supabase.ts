import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

const PLACEHOLDER_PATTERN = /your-|changeme|replace( |-)me|\.env\.example/i;

export function readSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim();

  if (!url && !serviceRoleKey && !bucket) return null;
  if (!url || !serviceRoleKey || !bucket) {
    throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET must be configured together');
  }
  if (PLACEHOLDER_PATTERN.test(url) || PLACEHOLDER_PATTERN.test(serviceRoleKey)) return null;

  const parsedUrl = new URL(url);
  const isLocalHttp = parsedUrl.protocol === 'http:'
    && (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1');
  if (parsedUrl.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('SUPABASE_URL must use HTTPS, except for localhost development');
  }
  if (bucket !== 'lockets') {
    throw new Error('SUPABASE_STORAGE_BUCKET must be lockets');
  }

  return { url: parsedUrl.origin, serviceRoleKey, bucket };
}

export function createSupabaseServerClient(config: SupabaseStorageConfig): SupabaseClient {
  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
