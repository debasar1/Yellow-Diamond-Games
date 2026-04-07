import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Flag: true when real Supabase credentials are configured.
 * When false, the app falls back to localStorage for all data.
 */
export const hasSupabase = !!(url && key && url !== 'https://your-project-id.supabase.co');

if (!hasSupabase) {
  console.info('[YD] Running in offline/local mode — data stored in localStorage.');
}

/**
 * Singleton Supabase client.
 * Uses the anon key — Row Level Security policies on each table
 * enforce per-user access control server-side.
 *
 * When credentials are missing (V0 local dev), supabase is null —
 * callers should check `hasSupabase` first and use localStorage fallbacks.
 */
export const supabase = hasSupabase
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
