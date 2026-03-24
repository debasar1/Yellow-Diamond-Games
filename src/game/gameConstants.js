/**
 * gameConstants.js
 *
 * Central configuration for all game tuning values.
 * Many of these are synced from the Supabase `game_config` table at runtime.
 * Defaults here are used if the remote config is unavailable (offline fallback).
 */

export const GAME_CONFIG = {
  LIVES: 3,

  RUNNER: {
    BASE_SPEED:           400,   // pixels per second
    MAX_SPEED:            900,
    SPEED_INCREMENT:      15,    // added every SPEED_RAMP_INTERVAL_MS
    SPEED_RAMP_INTERVAL_MS: 5000,
    SPAWN_INTERVAL_MS:    1200,
    JUMP_HEIGHT:          180,   // pixels above ground
    LANE_COUNT:           3
  },

  BREAKER: {
    BALL_SPEED:           420,   // pixels per second
    PADDLE_SPEED:         600,
  },

  // Power-up durations in milliseconds
  POWER_UPS: {
    'pu-shield':    { duration: 5000,  label: 'Chulbule Shield' },
    'pu-magnet':    { duration: 8000,  label: 'Rings Magnet' },
    'pu-jump':      { duration: 10000, label: 'Puff Jump' },
    'pu-coinburst': { duration: 6000,  label: 'Coin Burst 2×' }
  },

  // Coin economy (matches Supabase game_config defaults)
  POINTS_PER_COIN:  100,   // 100 points = 1 YD Coin
  DAILY_COIN_CAP:   50,    // Max YD Coins a user can earn per day
};

export const SCORE_CONFIG = {
  // Runner collectibles: key matches loaded texture, points and coins per collect
  RUNNER_TOKENS: [
    { key: 'token-chips',    points: 10, coins: 0 },
    { key: 'token-rings',    points: 15, coins: 0 },
    { key: 'token-puffs',    points: 20, coins: 0 },
    { key: 'token-chulbule', points: 25, coins: 1 },
    { key: 'token-namkeen',  points: 30, coins: 1 },
    { key: 'token-coin',     points: 50, coins: 5 },  // special YD Coin token
  ],

  // Obstacle scoring rules
  // - obs-rival (competitor brand) → lose points, NO life lost
  // - obs-barrier / obs-spill (generic hazards) → lose a life
  OBSTACLES: {
    'obs-rival':   { type: 'competitor', pointPenalty: 50, losesLife: false },
    'obs-barrier': { type: 'hazard',     pointPenalty: 0,  losesLife: true  },
    'obs-spill':   { type: 'hazard',     pointPenalty: 0,  losesLife: true  },
  },

  // Competitor penalty can be changed via Supabase game_config without a code release
  COMPETITOR_PENALTY: 50,   // points deducted per competitor brand hit

  // Breaker: competitor bricks deduct points when broken (ball bounces through them)
  // YD bricks add points as normal
  BREAKER_COMPETITOR_PENALTY: 30,

  // Breaker level-complete bonus
  LEVEL_BONUS: 50,

  // Fun facts shown when a brick breaks (bilingual)
  FUN_FACTS: {
    'brick-chips':      'क्या आप जानते हैं? Yellow Diamond Chips असली आलू से बनते हैं! / Did you know? Made from real potatoes!',
    'brick-rings':      'Yellow Diamond Rings — कुरकुरे Rings, असली मज़ा! / Crunchy Rings, real fun!',
    'brick-puffs':      'Puffs हल्के और स्वादिष्ट — बच्चों के बीच सबसे लोकप्रिय! / Light and tasty — kids love them!',
    'brick-namkeen':    'Namkeen — भारतीय स्वाद, हर घर में! / Classic Indian flavour, in every home!',
    'brick-gold':       '🎉 YD Coin मिली! Coins जमा करके इनाम जीतें! / YD Coin! Collect coins to win rewards!',
    'brick-boss':       '🏆 Boss तोड़ा! शाबाश! / Boss smashed! Well done!',
    'brick-rival':      '❌ प्रतिद्वंद्वी Brand! -30 अंक! / Rival brand! -30 points! Stick with Yellow Diamond! 🟡'
  },

  // Which brick keys are competitor bricks (penalise instead of reward)
  COMPETITOR_BRICK_KEYS: ['brick-rival']
};

/**
 * Breaker level layouts.
 * Each level defines an array of rows (top → bottom).
 * Rows cycle for levels beyond the defined set.
 */
export const BREAKER_LAYOUT = [
  // Level 1 — Intro: all YD bricks, no rivals yet
  {
    rows: [
      { key: 'brick-chips',   hp: 1, points: 10,  coins: 0 },
      { key: 'brick-rings',   hp: 1, points: 15,  coins: 0 },
      { key: 'brick-puffs',   hp: 2, points: 25,  coins: 0 },
      { key: 'brick-namkeen', hp: 2, points: 30,  coins: 0 },
      { key: 'brick-gold',    hp: 1, points: 50,  coins: 5 },
    ]
  },
  // Level 2 — Rivals introduced: one row of competitor bricks (avoid for score)
  {
    rows: [
      { key: 'brick-namkeen', hp: 2, points: 30,  coins: 0 },
      { key: 'brick-rival',   hp: 1, points: -30, coins: 0 },  // ❌ competitor — loses 30 pts
      { key: 'brick-puffs',   hp: 2, points: 25,  coins: 0 },
      { key: 'brick-rings',   hp: 1, points: 15,  coins: 0 },
      { key: 'brick-gold',    hp: 1, points: 50,  coins: 5 },
      { key: 'brick-chips',   hp: 1, points: 10,  coins: 0 },
      { key: 'brick-boss',    hp: 5, points: 100, coins: 10 },
    ]
  },
  // Level 3+ — Two rival rows mixed in for higher challenge
  {
    rows: [
      { key: 'brick-boss',    hp: 5, points: 100, coins: 10 },
      { key: 'brick-rival',   hp: 1, points: -30, coins: 0  },  // ❌ competitor
      { key: 'brick-gold',    hp: 1, points: 50,  coins: 5  },
      { key: 'brick-namkeen', hp: 3, points: 35,  coins: 0  },
      { key: 'brick-rival',   hp: 1, points: -30, coins: 0  },  // ❌ competitor
      { key: 'brick-puffs',   hp: 3, points: 30,  coins: 0  },
      { key: 'brick-rings',   hp: 2, points: 20,  coins: 0  },
      { key: 'brick-chips',   hp: 1, points: 10,  coins: 0  },
    ]
  }
];
