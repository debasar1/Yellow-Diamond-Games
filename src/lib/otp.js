import { supabase } from './supabase';

/**
 * OTP helpers — V0 uses Supabase's built-in email OTP.
 * Zero cost, zero external vendor. No MSG91 account needed.
 *
 * Supabase sends a 6-digit OTP to the user's email via its own SMTP.
 * Free tier allows up to 3 emails/hour per user and 30 emails/hour total
 * (sufficient for V0 testing). Upgrade Supabase SMTP settings before launch.
 *
 * V1 upgrade path: swap these functions to call a Supabase Edge Function
 * that hits MSG91 / Fast2SMS for mobile OTP — no changes needed in the UI.
 */

/**
 * Sends a 6-digit OTP to the given email address.
 * Uses Supabase Auth signInWithOtp — no external service needed.
 * @param {string} email
 */
export async function sendOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,   // creates auth user if first time
      emailRedirectTo: undefined // OTP mode, not magic link
    }
  });
  if (error) throw new Error(error.message || 'Failed to send OTP');
}

/**
 * Verifies the OTP the user entered.
 * On success, Supabase creates a session automatically.
 * @param {string} email
 * @param {string} otp - 6-digit code from email
 * @returns {Promise<{ user, session }>}
 */
export async function verifyOtp(email, otp) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email'
  });
  if (error) throw new Error(error.message || 'Invalid OTP');
  return data;
}
