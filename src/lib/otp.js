import { supabase, hasSupabase } from './supabase';

/**
 * OTP helpers.
 *
 * When Supabase is configured: uses Supabase's built-in email OTP (zero cost).
 * When running locally (V0 dev): uses a mock OTP flow — any 6-digit code works.
 *
 * V1 upgrade path: swap these functions to call a Supabase Edge Function
 * that hits MSG91 / Fast2SMS for mobile OTP — no changes needed in the UI.
 */

// ── Mock OTP store for local dev ──────────────────────────────────────────────
let _mockOtp = null;

/**
 * Sends a 6-digit OTP to the given email address.
 * @param {string} email
 */
export async function sendOtp(email) {
  if (hasSupabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined
      }
    });
    if (error) throw new Error(error.message || 'Failed to send OTP');
    return;
  }

  // ── Local mock: generate OTP and log it to console ──────────────────────────
  _mockOtp = String(Math.floor(100000 + Math.random() * 900000));
  console.info(`[YD Mock OTP] Code for ${email}: ${_mockOtp}  (any 6-digit code works in dev mode)`);
}

/**
 * Verifies the OTP the user entered.
 * @param {string} email
 * @param {string} otp - 6-digit code
 * @returns {Promise<{ user, session }>}
 */
export async function verifyOtp(email, otp) {
  if (hasSupabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });
    if (error) throw new Error(error.message || 'Invalid OTP');
    return data;
  }

  // ── Local mock: accept any 6-digit code ─────────────────────────────────────
  if (otp.length !== 6) throw new Error('OTP must be 6 digits');
  const localUser = {
    id: 'local-' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
    email
  };
  return { user: localUser, session: { user: localUser } };
}
