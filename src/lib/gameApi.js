import { supabase, hasSupabase } from './supabase';
import { GAME_CONFIG } from '../game/gameConstants';

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_WALLET   = 'yd_wallet';
const LS_SESSIONS = 'yd_sessions';
const LS_USER     = 'yd_user';

function _getLocalWallet() {
  try {
    return JSON.parse(localStorage.getItem(LS_WALLET)) || { total_coins_earned: 0, total_coins_redeemed: 0 };
  } catch { return { total_coins_earned: 0, total_coins_redeemed: 0 }; }
}

function _setLocalWallet(wallet) {
  localStorage.setItem(LS_WALLET, JSON.stringify(wallet));
}

function _getLocalSessions() {
  try {
    return JSON.parse(localStorage.getItem(LS_SESSIONS)) || [];
  } catch { return []; }
}

function _pushLocalSession(session) {
  const sessions = _getLocalSessions();
  sessions.push({ ...session, created_at: new Date().toISOString() });
  localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Saves a completed game session and credits YD Coins to the user's wallet.
 * Uses Supabase when available, otherwise localStorage.
 */
export async function saveSession({ userId, score, coinsEarned, gameFormat, duration }) {
  const record = { user_id: userId, game_format: gameFormat, score, coins_earned: coinsEarned, duration_seconds: duration };

  if (hasSupabase && userId) {
    // 1. Insert session record
    const { error: sessionErr } = await supabase.from('game_sessions').insert(record);
    if (sessionErr) throw new Error(sessionErr.message);

    // 2. Credit coins to wallet (RPC enforces daily cap)
    const { error: walletErr } = await supabase.rpc('credit_coins', {
      p_user_id: userId,
      p_coins:   coinsEarned
    });
    if (walletErr) console.warn('[YD] Wallet credit failed:', walletErr.message);

    // 3. Increment total_sessions on users table
    await supabase.rpc('increment_sessions', { p_user_id: userId });
    return;
  }

  // ── localStorage fallback ──────────────────────────────────────────────────
  _pushLocalSession(record);
  const wallet = _getLocalWallet();
  wallet.total_coins_earned += (coinsEarned || 0);
  _setLocalWallet(wallet);
}

/**
 * Fetches the user's wallet (balance, total earned, total redeemed).
 */
export async function getWallet(userId) {
  if (hasSupabase && userId) {
    const { data, error } = await supabase
      .from('wallets')
      .select('total_coins_earned, total_coins_redeemed')
      .eq('user_id', userId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  return _getLocalWallet();
}

/**
 * Fetches today's leaderboard (top 10 by score) and the current user's rank.
 */
export async function getLeaderboard(userId) {
  if (hasSupabase) {
    const today = new Date().toISOString().split('T')[0];
    const { data: top10, error } = await supabase
      .from('leaderboard_daily')
      .select('user_id, display_name, score')
      .gte('session_date', today)
      .order('score', { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);

    let myRank = null;
    if (userId) {
      const { data: rankData } = await supabase
        .rpc('get_user_daily_rank', { p_user_id: userId, p_date: today });
      myRank = rankData;
    }
    return { top10: top10 || [], myRank };
  }

  // ── localStorage fallback — derive from stored sessions ────────────────────
  const sessions = _getLocalSessions();
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => (s.created_at || '').startsWith(today));

  // Best score per user_id today
  const best = {};
  todaySessions.forEach(s => {
    const uid = s.user_id || 'local';
    if (!best[uid] || s.score > best[uid].score) {
      const user = _getLocalUser();
      best[uid] = { user_id: uid, display_name: user?.name || 'You', score: s.score };
    }
  });

  const top10 = Object.values(best).sort((a, b) => b.score - a.score).slice(0, 10);
  const myIdx = top10.findIndex(e => e.user_id === (userId || 'local'));

  return { top10, myRank: myIdx >= 0 ? myIdx + 1 : null };
}

/**
 * Loads remote game config from Supabase (coin ratio, daily cap, etc.)
 * Falls back to local defaults if unavailable.
 */
export async function loadGameConfig() {
  if (!hasSupabase) return GAME_CONFIG;

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

// ── Internal ──────────────────────────────────────────────────────────────────

function _getLocalUser() {
  try { return JSON.parse(localStorage.getItem(LS_USER)); }
  catch { return null; }
}
