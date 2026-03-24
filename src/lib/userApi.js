import { supabase } from './supabase';

/**
 * Creates a new user record or returns the existing one.
 * Called after successful OTP verification.
 *
 * @param {{ name, mobile, city, dob }} form
 * @returns {Promise<Object>} user row
 */
export async function createOrLoginUser({ name, mobile, city, dob }) {
  // Upsert user — unique on mobile
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { mobile, name, city, dob: dob || null, last_active: new Date().toISOString() },
      { onConflict: 'mobile', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Ensure wallet row exists
  await supabase
    .from('wallets')
    .upsert({ user_id: data.id }, { onConflict: 'user_id', ignoreDuplicates: true });

  return data;
}

/**
 * Fetch a user's public profile by ID.
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, city, created_at, total_sessions')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
