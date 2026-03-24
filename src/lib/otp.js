import { supabase } from './supabase';

/**
 * OTP helpers — delegate to Supabase Edge Functions.
 *
 * The Edge Function calls MSG91 with the API key stored as a secret
 * (never exposed to the frontend).
 *
 * Edge function endpoints (to be deployed to Supabase):
 *   POST /functions/v1/send-otp    { mobile: "9876543210" }
 *   POST /functions/v1/verify-otp  { mobile, otp }
 */

/**
 * Sends a 6-digit OTP to the given Indian mobile number.
 * @param {string} mobile - 10-digit Indian mobile (without +91)
 */
export async function sendOtp(mobile) {
  const { data, error } = await supabase.functions.invoke('send-otp', {
    body: { mobile }
  });
  if (error) throw new Error(error.message || 'Failed to send OTP');
  return data;
}

/**
 * Verifies the OTP entered by the user.
 * On success, Supabase Edge Function creates/returns a session.
 * @param {string} mobile
 * @param {string} otp
 */
export async function verifyOtp(mobile, otp) {
  const { data, error } = await supabase.functions.invoke('verify-otp', {
    body: { mobile, otp }
  });
  if (error) throw new Error(error.message || 'Invalid OTP');
  return data;
}
