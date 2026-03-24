import { supabase } from './supabase';

/**
 * Lightweight analytics client.
 * Stores events in Supabase `analytics_events` table.
 * All PII (mobile) is excluded — only user_id (UUID) is used.
 *
 * Usage:
 *   import { track } from '@/lib/analytics';
 *   track('game_start', { game_format: 'runner' });
 */

let _userId = null;

/** Call once after login to attach userId to all subsequent events. */
export function setAnalyticsUser(userId) {
  _userId = userId;
}

/**
 * Track an analytics event.
 * Non-blocking — failures are silently swallowed to never break gameplay.
 *
 * @param {string} event - Event name (snake_case)
 * @param {Object} props - Additional properties
 */
export async function track(event, props = {}) {
  try {
    await supabase.from('analytics_events').insert({
      event_name:  event,
      user_id:     _userId || null,
      properties:  props,
      created_at:  new Date().toISOString()
    });
  } catch (_) {
    // Silently ignore — analytics must never break the game
  }
}

// ── Typed event helpers ───────────────────────────────────────────────────────

export const Analytics = {
  gameStart:              (format)           => track('game_start',             { game_format: format }),
  gameEnd:                (score, coins, fmt, dur) => track('game_end',         { score, coins_earned: coins, game_format: fmt, duration_seconds: dur }),
  registrationStart:      ()                 => track('registration_start'),
  registrationComplete:   (city)             => track('registration_complete',  { city }),
  otpSent:                ()                 => track('otp_sent'),
  otpVerified:            (success)          => track('otp_verified',           { success }),
  walletViewed:           (balance)          => track('wallet_viewed',          { coins_balance: balance }),
  leaderboardViewed:      ()                 => track('leaderboard_viewed'),
};
