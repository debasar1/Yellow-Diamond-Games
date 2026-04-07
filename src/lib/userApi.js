import { supabase, hasSupabase } from './supabase';

const LS_USER = 'yd_user';

/**
 * Creates a new user record or updates the existing one.
 * Called after successful OTP verification.
 *
 * V0: unique on email (Supabase Auth also uses email as the unique identifier).
 * V1 upgrade path: add mobile field when switching to mobile OTP.
 *
 * @param {{ name, email, city, dob }} form
 * @param {Object|null} authUser - user object from OTP verification (for local mode)
 * @returns {Promise<Object>} user row
 */
export async function createOrLoginUser({ name, email, city, dob }, authUser = null) {
  if (hasSupabase) {
    const { data: { user: sbUser } } = await supabase.auth.getUser();
    if (!sbUser) throw new Error('No authenticated user found');

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id:          sbUser.id,
          email,
          name,
          city,
          dob:         dob || null,
          last_active: new Date().toISOString()
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from('wallets')
      .upsert({ user_id: data.id }, { onConflict: 'user_id', ignoreDuplicates: true });

    return data;
  }

  // ── localStorage fallback ──────────────────────────────────────────────────
  const userId = authUser?.id || 'local-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const userRow = {
    id: userId,
    email,
    name,
    city,
    dob: dob || null,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
    total_sessions: 0
  };
  localStorage.setItem(LS_USER, JSON.stringify(userRow));
  return userRow;
}

/**
 * Fetch a user's public profile by ID.
 */
export async function getUserProfile(userId) {
  if (hasSupabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, city, created_at, total_sessions')
      .eq('id', userId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // ── localStorage fallback ──────────────────────────────────────────────────
  try {
    return JSON.parse(localStorage.getItem(LS_USER));
  } catch {
    return null;
  }
}
