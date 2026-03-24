import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('[YD] Supabase env vars missing. Check .env.local');
}

/**
 * Singleton Supabase client.
 * Uses the anon key — Row Level Security policies on each table
 * enforce per-user access control server-side.
 */
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
