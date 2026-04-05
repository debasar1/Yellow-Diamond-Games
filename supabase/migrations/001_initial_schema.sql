-- ============================================================
-- Yellow Diamond Crunch Run — V0 Database Schema
-- Supabase (Postgres) migration
-- Run via: supabase db push  OR  paste in Supabase SQL Editor
--
-- V0 Auth: Supabase email OTP (zero cost, no external vendor)
-- V1 upgrade: add mobile column, switch OTP to MSG91 / Fast2SMS
-- ============================================================

-- ── Users ──────────────────────────────────────────────────────────────────
-- id is synced with Supabase Auth (auth.users.id) so RLS works seamlessly.
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  city          TEXT,
  dob           DATE,
  -- V1: add mobile TEXT UNIQUE when switching to mobile OTP
  referral_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  referred_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_active   TIMESTAMPTZ DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0
);

-- ── Wallets ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_coins_earned   INTEGER DEFAULT 0 CHECK (total_coins_earned >= 0),
  total_coins_redeemed INTEGER DEFAULT 0 CHECK (total_coins_redeemed >= 0),
  last_updated         TIMESTAMPTZ DEFAULT NOW()
);

-- ── Game Sessions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  game_format      TEXT NOT NULL CHECK (game_format IN ('runner', 'breaker')),
  score            INTEGER NOT NULL DEFAULT 0,
  coins_earned     INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Analytics Events ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  TEXT NOT NULL,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  properties  JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Game Config (admin-editable without code release) ─────────────────────
CREATE TABLE IF NOT EXISTS game_config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO game_config (key, value, description) VALUES
  ('points_per_coin',            '100',  '100 game points = 1 YD Coin'),
  ('daily_coin_cap',             '50',   'Max YD Coins a user can earn per day'),
  ('bonus_multiplier',           '1',    'Global coin multiplier (1 = normal, 2 = double event)'),
  ('competitor_penalty_runner',  '50',   'Points deducted per competitor hit in Runner'),
  ('competitor_penalty_breaker', '30',   'Points deducted per competitor brick in Breaker'),
  ('registration_required',      'false','Force registration before first play'),
  ('otp_provider',               'supabase_email', 'V0: supabase_email | V1: msg91 | fast2sms')
ON CONFLICT (key) DO NOTHING;

-- ── Leaderboard daily VIEW ─────────────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard_daily AS
  SELECT
    gs.user_id,
    COALESCE(u.name, 'Player') AS display_name,
    MAX(gs.score)              AS score,
    DATE(gs.created_at)        AS session_date
  FROM game_sessions gs
  LEFT JOIN users u ON u.id = gs.user_id
  GROUP BY gs.user_id, u.name, DATE(gs.created_at);

-- ── RPC: credit_coins ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION credit_coins(p_user_id UUID, p_coins INTEGER)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_cap          INTEGER;
  v_earned_today INTEGER;
  v_to_credit    INTEGER;
BEGIN
  SELECT value::INTEGER INTO v_cap FROM game_config WHERE key = 'daily_coin_cap';
  v_cap := COALESCE(v_cap, 50);

  SELECT COALESCE(SUM(coins_earned), 0) INTO v_earned_today
  FROM game_sessions
  WHERE user_id = p_user_id
    AND DATE(created_at) = CURRENT_DATE;

  v_to_credit := LEAST(p_coins, v_cap - v_earned_today);
  IF v_to_credit <= 0 THEN RETURN; END IF;

  INSERT INTO wallets (user_id, total_coins_earned)
    VALUES (p_user_id, v_to_credit)
  ON CONFLICT (user_id) DO UPDATE
    SET total_coins_earned = wallets.total_coins_earned + v_to_credit,
        last_updated = NOW();
END;
$$;

-- ── RPC: increment_sessions ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_sessions(p_user_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users
  SET total_sessions = total_sessions + 1, last_active = NOW()
  WHERE id = p_user_id;
END;
$$;

-- ── RPC: get_user_daily_rank ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_daily_rank(p_user_id UUID, p_date DATE)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT rank INTO v_rank FROM (
    SELECT user_id, RANK() OVER (ORDER BY score DESC) AS rank
    FROM leaderboard_daily
    WHERE session_date = p_date
  ) ranked
  WHERE user_id = p_user_id;
  RETURN COALESCE(v_rank, NULL);
END;
$$;

-- ── Row Level Security ────────────────────────────────────────────────────
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events  ENABLE ROW LEVEL SECURITY;

-- Users: read/write own row only
CREATE POLICY "users_self" ON users
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Wallets: read/write own row only
CREATE POLICY "wallets_self" ON wallets
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Game sessions: insert own or guest (null), read own
CREATE POLICY "sessions_self_insert" ON game_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "sessions_self_read" ON game_sessions FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Analytics: insert only (no client-side reads)
CREATE POLICY "analytics_insert" ON analytics_events FOR INSERT
  WITH CHECK (true);

-- game_config: readable by all (no sensitive data)
CREATE POLICY "config_read" ON game_config FOR SELECT USING (true);

-- ── Indexes ───────────────────────────────────────────────────────────────
-- Note: DATE(created_at) cannot be used in an index (TIMESTAMPTZ cast is STABLE not IMMUTABLE).
-- Index on (user_id, created_at) covers the same daily-query patterns efficiently.
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON game_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_score     ON game_sessions (score DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event    ON analytics_events (event_name, created_at DESC);
