import { supabase } from './supabase';

/**
 * Creates a new user record or updates the existing one.
 * Called after successful OTP verification.
 *
 * V0: unique on email (Supabase Auth also uses email as the unique identifier).
 * V1 upgrade path: add mobile field when switching to mobile OTP.
 *
 * @param {{ name, email, city, dob }} form
 * @returns {Promise<Object>} user row
 */
export async function createOrLoginUser({ name, email, city, dob }) {
  // Supabase Auth already created/verified the auth.users row via OTP.
  // Now upsert our public users table with the profile details.
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('No authenticated user found');

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id:          authUser.id,   // sync with Supabase Auth UUID
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

  // Ensure wallet row exists for this user
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
