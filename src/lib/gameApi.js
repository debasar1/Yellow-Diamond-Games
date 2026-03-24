import { supabase } from './supabase';
import { GAME_CONFIG } from '../game/gameConstants';

/**
 * Saves a completed game session and credits YD Coins to the user's wallet.
 * Enforces the daily coin cap server-side via a Supabase RPC / trigger.
 *
 * @param {{ userId, score, coins, format, duration }} session
 */
export async function saveSession({ userId, score, coinsEarned, gameFormat, duration }) {
  if (!userId) return;

  // 1. Insert session record
  const { error: sessionErr } = await supabase.from('game_sessions').insert({
    user_id:          userId,
    game_format:      gameFormat,
    score,
    coins_earned:     coinsEarned,
    duration_seconds: duration
  });
  if (sessionErr) throw new Error(sessionErr.message);

  // 2. Credit coins to wallet (RPC enforces daily cap)
  const { error: walletErr } = await supabase.rpc('credit_coins', {
    p_user_id: userId,
    p_coins:   coinsEarned
  });
  if (walletErr) console.warn('[YD] Wallet credit failed:', walletErr.message);

  // 3. Increment total_sessions on users table
  await supabase.rpc('increment_sessions', { p_user_id: userId });
}

/**
 * Fetches the user's wallet (balance, total earned, total redeemed).
 */
export async function getWallet(userId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('total_coins_earned, total_coins_redeemed')
    .eq('user_id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetches today's leaderboard (top 10 by score) and the current user's rank.
 *
 * @param {string|null} userId
 */
export async function getLeaderboard(userId) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Top 10 for today
  const { data: top10, error } = await supabase
    .from('leaderboard_daily')  // a Supabase VIEW (see migration)
    .select('user_id, display_name, score')
    .gte('session_date', today)
    .order('score', { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);

  // User's own rank (if logged in)
  let myRank = null;
  if (userId) {
    const { data: rankData } = await supabase
      .rpc('get_user_daily_rank', { p_user_id: userId, p_date: today });
    myRank = rankData;
  }

  return { top10: top10 || [], myRank };
}

/**
 * Loads remote game config from Supabase (coin ratio, daily cap, etc.)
 * Falls back to local defaults if unavailable.
 */
export async function loadGameConfig() {
  const { data, error } = await supabase
    .from('game_config')
    .select('key, value');

  if (error || !data) return GAME_CONFIG;

  const remote = {};
  data.forEach(row => { remote[row.key] = row.value; });

  return {
    ...GAME_CONFIG,
    POINTS_PER_COIN: Number(remote.points_per_coin) || GAME_CONFIG.POINTS_PER_COIN,
    DAILY_COIN_CAP:  Number(remote.daily_coin_cap)  || GAME_CONFIG.DAILY_COIN_CAP,
  };
}
