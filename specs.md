# Yellow Diamond — "Crunch Run" Mini-Game
## Product Requirements & Technical Specifications

**Version:** V0 (MVP)
**Project Owner:** Prataap Snacks Ltd. / Yellow Diamond Brand Team
**Document Status:** Draft — For Review
**Last Updated:** 2026-03-24

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Audience](#3-target-audience)
4. [V0 Scope & Boundaries](#4-v0-scope--boundaries)
5. [Game Formats — Dual Prototype](#5-game-formats--dual-prototype)
6. [User Flow](#6-user-flow)
7. [Scoring System](#7-scoring-system)
8. [Wallet & Coin System](#8-wallet--coin-system)
9. [User Registration & Data Capture](#9-user-registration--data-capture)
10. [Technical Architecture](#10-technical-architecture)
11. [UI / UX Design Specs](#11-ui--ux-design-specs)
12. [Platform Targets](#12-platform-targets)
13. [Localization](#13-localization)
14. [Security & Anti-Fraud](#14-security--anti-fraud)
15. [Admin Panel](#15-admin-panel)
16. [Analytics & Tracking](#16-analytics--tracking)
17. [Future Roadmap (Post-V0)](#17-future-roadmap-post-v0)
18. [Risk Register](#18-risk-register)
19. [Open Questions](#19-open-questions)

---

## 1. Project Overview

**Yellow Diamond Crunch Run** is a mobile-first, browser-based mini-game built for Prataap Snacks Ltd.'s flagship brand, Yellow Diamond. The game is a brand engagement tool designed to:

- Drive repeat consumer interaction beyond the point of purchase.
- Capture first-party consumer data (mobile numbers, city, age) through a fun, zero-friction experience.
- Reward loyal players with a YD Coins wallet that in later versions converts to real purchase discounts on quick-commerce platforms (Blinkit, Zepto).

The game runs as a **Progressive Web App (PWA)** — no app download required. It launches instantly via QR codes on Yellow Diamond packaging, social media links, and WhatsApp forwards.

**Brand:** Yellow Diamond (Prataap Snacks Ltd.), Indore, Madhya Pradesh, India.
**Website:** https://www.yellowdiamond.in/
**Brand Palette:** Bright yellow (#FFD700), red accents, green highlights, playful rounded typography, cartoon mascots.

---

## 2. Goals & Success Metrics

### V0 Goals
| Goal | Description |
|---|---|
| Engagement | Deliver an immediately fun and replayable game experience with two prototype formats |
| Data Capture | Collect Name, Mobile (OTP-verified), City, Age/DOB from players |
| Score & Wallet | Display a real-time score during play; persist lifetime score/coins in a wallet per user |
| Brand Alignment | All visuals, mascots, and language reflect the Yellow Diamond brand identity |

### Success Benchmarks (V0 → Production)
| Metric | Target |
|---|---|
| Average session duration | > 3 minutes |
| Registration conversion rate | > 30% of players who open wallet |
| DAU growth | Week-over-week growth in first 3 months |
| Coupon redemption rate (post-V0) | > 15% of issued coupons |
| Virality coefficient (post-V0) | > 0.2 (1 in 5 players shares a referral link that converts) |
| Cost per acquired registered user | < ₹5 |

---

## 3. Target Audience

| Attribute | Detail |
|---|---|
| Geography | India — primary focus Tier 2 & Tier 3 cities |
| Socioeconomic | SEC B, C, D |
| Age | 12–35 years |
| Device profile | Mid-range Android: Redmi, Realme, Samsung M-series (₹10K–₹15K, 3–4GB RAM) |
| Connectivity | 4G (not Wi-Fi) — must perform on constrained networks |
| Behaviour | Mobile-first, impulse-driven, heavy WhatsApp and Instagram users |
| Language | Hindi primary, English secondary |

---

## 4. V0 Scope & Boundaries

### In Scope for V0
- Two game prototype builds: Endless Runner + Arkanoid/Brick Breaker
- User onboarding and registration (Name, Mobile OTP, City, Age/DOB)
- Real-time in-game scoring
- Score-based YD Coins accumulation saved to a per-user wallet (Supabase)
- Leaderboard (top daily scores)
- Bilingual UI: Hindi (default) + English toggle
- PWA shell — installable on Android home screen, loads in browser on iOS
- Placeholder assets where official brand assets are unavailable

### Out of Scope for V0
- Coupon generation and quick-commerce redemption (Blinkit / Zepto integration) — deferred to V1
- Referral / viral sharing loop — deferred to V1
- Admin panel (full) — V0 uses Supabase Studio directly
- Anti-bot / device fingerprinting — basic rate limiting only in V0
- iOS App Store / Google Play Store native build — V0 is browser-only
- Payment or UPI cashback flows — post-V0
- Multiplayer or social features

### Scoring Rules — Configurable Design
The scoring rules are deliberately designed to be rule-set configurable via the admin panel. V0 ships with:
- **YD Product collected / brick broken** → +points (amount varies by product type)
- **Competitor brand hit (Runner)** → **-50 points**, no life lost
- **Competitor brick broken (Breaker)** → **-30 points**, no life lost
- **Generic hazard hit (barrier / spill)** → life lost
All penalty and reward values are stored in the `game_config` Supabase table and can be tuned without a code release.

The scoring weights and competitor interaction rules can be changed without a code release by updating the game config in Supabase.

---

## 5. Game Formats — Dual Prototype

Two game formats will be prototyped in Sprint 1. The client will play-test both and select one for full development. Both must be production-quality enough to feel.

---

### Format A — Endless Runner ("Crunch Run")

**Concept:** A Yellow Diamond mascot character runs endlessly through a snack-themed world. The player swipes/taps to change lanes, jump, and slide.

**World aesthetic:** Bright yellow skies, chip-packet roads, snack-architecture (bridges made of Rings, towers of Namkeen bags), confetti on milestones. The world should feel like running _inside_ a Yellow Diamond packet.

**Gameplay loop:**
1. Mascot runs forward, speed increases over time.
2. Three lanes. Swipe left/right to switch. Swipe up to jump, swipe down to slide.
3. Collect YD Product tokens for score and YD Coins.
4. Avoid obstacles (spill hazards, construction barriers, rival snack brand obstacles — visual only in V0).
5. Power-ups (see below) appear at random intervals.
6. Game ends on third obstacle collision. Score is tallied.

**YD Products as collectibles (mapped to score multipliers):**
| Product | Visual | Score Value |
|---|---|---|
| Classic Chips | Chip packet token | +10 pts |
| Rings | Ring snack icon | +15 pts |
| Puffs | Puff cloud icon | +20 pts |
| Chulbule | Burst star icon | +25 pts |
| Namkeen | Bag icon | +30 pts |

**Power-ups:**
| Power-up | Name | Effect | Duration |
|---|---|---|---|
| Shield | Chulbule Shield | Temporary invincibility | 5 seconds |
| Magnet | Rings Magnet | Auto-collects nearby tokens | 8 seconds |
| Double Jump | Puff Jump | Enables double-jump | 10 seconds |
| Coin Burst | YD Burst | 2× YD Coin conversion | 6 seconds |

**Lives:** 3 hearts per run. One collision = one heart lost.

---

### Format B — Brick Breaker ("Snack Stack Smash")

**Concept:** Classic Arkanoid/brick breaker. The paddle is a Yellow Diamond chip packet. The ball is a Rings snack. Bricks represent different Yellow Diamond product lines.

**Gameplay loop:**
1. Use finger drag (mobile) or mouse (desktop) to control the paddle left/right.
2. Ball bounces and breaks bricks.
3. Bricks reveal product visuals and fun facts when broken ("Did you know? Yellow Diamond Rings are made with real potatoes!").
4. Clearing a row triggers a micro-animation and score bonus.
5. Special YD Coin bricks drop bonus coin tokens.
6. Ball off-screen = life lost. 3 lives per session.
7. Boss levels: giant product pack bricks that require multiple hits.

**Brick types:**
| Brick | Product Line | Hits to Break | Score Value |
|---|---|---|---|
| Yellow | Classic Chips | 1 | +10 pts |
| Orange | Rings | 1 | +15 pts |
| Green | Puffs / Chulbule | 2 | +25 pts |
| Red | Namkeen | 2 | +30 pts |
| Gold | YD Coin Brick | 1 | +50 pts + bonus coins |
| Boss | Giant Pack | 5 | +100 pts |

**Power-ups (dropped randomly by bricks):**
| Power-up | Effect |
|---|---|
| Wide Paddle | Paddle doubles in width for 10 seconds |
| Multi-Ball | Splits ball into 3 balls |
| Fireball | Ball burns through entire column |
| Slow-Mo | Ball speed halves for 8 seconds |

---

## 6. User Flow

```
[Entry Point]
    QR code on pack / social link / WhatsApp forward
            │
            ▼
[Splash Screen]  ← Brand logo, animated mascot, "TAP TO PLAY" (Hindi/English)
            │
            ▼
[Guest Play]  ←── Play immediately without registering
    Score accumulates as "pending YD Coins"
            │
            ▼
[Game Over Screen]
    "Your Score: XXXX | Pending YD Coins: XX"
    CTA: "Save your coins — Register now!"
            │                   │
    [Play Again]         [Register / Login]
                                │
                                ▼
               [Registration Screen]
               - Name (text input)
               - Mobile Number (numeric input)
               - City (dropdown — top 50 Indian cities + "Other")
               - Age / DOB (date picker, 13+ validation)
               - OTP verification via SMS
                                │
                                ▼
               [Wallet Screen]
               - Total YD Coins balance
               - Lifetime high score
               - Leaderboard rank
               - (V1) Redeem button
                                │
                                ▼
               [Play Again] ←── Returns to game with wallet active
```

---

## 7. Scoring System

### Base Scoring Rules

| Event | Score Delta | Life Impact | YD Coin Impact |
|---|---|---|---|
| Collect YD Product token (Runner) | +10 to +50 (by type) | None | Contributes to coin tally |
| Hit YD product brick (Breaker) | +10 to +100 (by type) | None | Contributes to coin tally |
| Hit competitor brand obstacle (Runner) | **-50 pts** | No life lost | None |
| Hit competitor brick (Breaker) | **-30 pts** | No life lost | None |
| Hit generic hazard (barrier / spill) | 0 pts | **Life lost** | None |
| Use power-up | 0 pts | None | Enables faster collection |
| Complete level/wave (Breaker) | +50 pts bonus | None | +5 coins bonus |
| Boss brick destroyed (Breaker) | +100 pts | None | +10 coins |

**Scoring design rationale:** Competitor hits are a _score penalty_ (not a life penalty) — this keeps the game running longer while creating a clear brand association: Yellow Diamond = gain, competitors = lose. All penalty values are stored in `game_config` and can be adjusted without a code release.

### Score → YD Coins Conversion (V0 Default)
- **1,000 points = 10 YD Coins**
- Conversion ratio is stored in Supabase `game_config` table and can be updated without a code release.
- Daily earning cap: **50 YD Coins per user per day** (to prevent abuse).
- Guest play coins are held as "pending" — only committed to wallet on registration.

### Score Storage
- Each completed session is written to `game_sessions` table: `user_id`, `score`, `coins_earned`, `game_format`, `duration_seconds`, `timestamp`.
- Leaderboard is derived from the top `score` per `user_id` per day, with real-time Supabase subscription.

---

## 8. Wallet & Coin System

### Wallet Overview
Each registered user has a persistent wallet stored in Supabase:

```
wallet
├── user_id (FK → users)
├── total_coins_earned (integer)
├── total_coins_redeemed (integer)
├── current_balance (computed: earned - redeemed)
├── last_updated (timestamp)
```

### V0 Wallet Features
- Display current YD Coins balance on home screen
- Show lifetime score and current daily leaderboard rank
- "Coming Soon: Redeem for discounts on Blinkit & Zepto" placeholder in UI

### V1 Wallet Features (planned)
- Redeem button → generates unique coupon code
- Deep-link to Blinkit / Zepto Yellow Diamond product page
- Fallback: UPI cashback via screenshot proof-of-purchase
- Referral bonus tracking

---

## 9. User Registration & Data Capture

### Fields Collected
| Field | Type | Required | Validation |
|---|---|---|---|
| Name | Text | Yes | 2–50 characters |
| Email Address | Email | Yes | Valid email format, OTP-verified |
| City | Dropdown | Yes | Predefined list of top 50 Indian cities + "Other" |
| Age / DOB | Date picker | No | Must be 13 years or older if provided |

### OTP Flow (V0 — Zero Cost)
V0 uses **Supabase built-in email OTP** — no external vendor, no SMS cost.

1. User enters email address.
2. Supabase sends a 6-digit OTP to that email (via Supabase's own SMTP — free).
3. User enters 6-digit OTP. Valid for 5 minutes.
4. On success: Supabase Auth session created; user profile upserted in `users` table.
5. Email is the unique identifier. No password required.

**V1 upgrade path:** Swap `otp.js` to call a Supabase Edge Function hitting MSG91 / Fast2SMS for mobile OTP. The registration UI requires no changes — only the lib file changes.

### Data Storage (Supabase `users` table)
```sql
users
├── id (uuid, primary key — synced with Supabase Auth)
├── email (text, unique, not null)
├── name (text)
├── city (text)
├── dob (date, nullable)
├── created_at (timestamp)
├── last_active (timestamp)
├── total_sessions (integer, default 0)
├── referral_code (text, unique) -- generated on registration
├── referred_by (uuid, FK → users.id, nullable)
-- V1: add mobile (text, unique) when switching to mobile OTP
```

### Privacy & Consent
- Consent checkbox shown before registration: "I agree to share my data with Yellow Diamond for rewards and offers." (Hindi + English)
- Data is used exclusively for game wallet, leaderboard, and (with user consent) marketing comms from Yellow Diamond.
- No data sold or shared with third parties.

---

## 10. Technical Architecture

### Stack Overview

| Layer | Technology | Rationale |
|---|---|---|
| Game Engine | **Phaser.js 3.x** | Battle-tested HTML5 game framework, large community, excellent mobile browser support |
| Frontend Shell | **React + Vite** (PWA) | Fast build, PWA capabilities, component-based UI for wallet/leaderboard screens |
| Backend | **Supabase** | Free tier, built-in Postgres, Auth, real-time subscriptions, Storage for assets |
| OTP / SMS | **MSG91** | Cost-effective for Indian mobile OTP, well-documented API |
| Hosting | **Vercel** (frontend) + Supabase cloud | Zero-cost tiers sufficient for V0, global CDN |
| CI/CD | **GitHub Actions** | Automated build, test, and deploy pipeline |
| Version Control | **Git / GitHub** | Private repo, branch-per-feature strategy |

### Supabase Database Schema (V0)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT UNIQUE NOT NULL,
  name TEXT,
  city TEXT,
  dob DATE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0
);

-- Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_coins_earned INTEGER DEFAULT 0,
  total_coins_redeemed INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  game_format TEXT CHECK (game_format IN ('runner', 'breaker')),
  score INTEGER NOT NULL,
  coins_earned INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Config (editable without code release)
CREATE TABLE game_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Seed data:
-- ('points_to_coins_ratio', '100', '100 points = 1 YD Coin')
-- ('daily_coin_cap', '50', 'Max coins per user per day')
-- ('bonus_multiplier', '1', 'Current bonus multiplier event')
-- ('otp_provider', 'msg91', 'OTP provider selection')
```

### Performance Targets

| Metric | Target |
|---|---|
| Initial payload | < 3 MB (compressed) |
| Time to interactive on 4G | < 4 seconds |
| Game FPS | 60 fps on mid-range Android (Redmi, Realme) |
| Image format | WebP for all game assets |
| Animations | Sprite sheets (not individual frames) |
| Rendering | 2D only, parallax scrolling for depth |

### Asset Pipeline
- All images: WebP, max 512×512px for sprites
- Sprite sheets: Packed with TexturePacker or free-tier alternative
- Audio: Ogg Vorbis format, < 100KB per sound effect
- Fonts: Google Fonts (Nunito / Baloo 2 for Hindi+Latin), loaded async

### PWA Configuration
```json
{
  "name": "Yellow Diamond Crunch Run",
  "short_name": "Crunch Run",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFD700",
  "theme_color": "#FFD700",
  "icons": [...]
}
```

---

## 11. UI / UX Design Specs

### Design Language
- **Primary color:** #FFD700 (Yellow Diamond yellow)
- **Accent 1:** #E53935 (Red)
- **Accent 2:** #43A047 (Green)
- **Background:** #FFF8E1 (warm off-white)
- **Font — Latin:** Baloo 2 (playful, rounded)
- **Font — Hindi:** Baloo 2 supports Devanagari
- **Corner radius:** 16px on all cards and buttons
- **Button style:** Bold, full-width on mobile, drop shadow with slight 3D press effect on tap

### Screen Inventory

| Screen | Description |
|---|---|
| Splash | Animated Yellow Diamond logo + mascot, "Tap to Play" |
| Game Canvas | Full-screen game (Phaser renders here) |
| HUD (in-game) | Score counter, lives/hearts, active power-up indicator, pause button |
| Game Over | Final score, YD Coins earned this session, Play Again / Register CTA |
| Registration | Step-by-step: Name → Mobile → OTP → City → DOB |
| Wallet / Home | Coin balance, lifetime score, leaderboard rank, Play button |
| Leaderboard | Today's top 10, user's own rank highlighted |
| Settings | Language toggle (Hindi / English), sound on/off, about |

### UI Reference
Client UI screens are available at: https://stitch.withgoogle.com/projects/4295103591751963793
These screens should be reviewed by the design/dev team and used as the visual brief for all screen implementations.

### Placeholder Assets (V0)
Where official Yellow Diamond brand assets (mascot art, product images) are not yet provided, the following placeholders are acceptable for V0:
- Mascot: Yellow stick figure with diamond icon on chest
- Product tokens: Colored circles with YD initials in brand colors
- Background: Gradient from #FFD700 to #FFA000 with repeating geometric pattern

---

## 12. Platform Targets

| Platform | V0 | V1 | Notes |
|---|---|---|---|
| Android (browser) | ✅ Primary | ✅ | Chrome on Android; PWA installable |
| iOS (browser) | ✅ Supported | ✅ | Safari on iOS; PWA limited install |
| Desktop (browser) | ✅ Supported | ✅ | Mouse controls, wider layout |
| Android (native APK) | ❌ Deferred | ✅ | Capacitor.js wrapper |
| iOS (App Store) | ❌ Deferred | ✅ | Capacitor.js wrapper |
| Windows executable | ❌ Deferred | ✅ | Electron wrapper |
| macOS executable | ❌ Deferred | ✅ | Electron wrapper |

### Minimum Device Spec (V0 target)
- Android 8.0+, Chrome 90+
- 3GB RAM, 4G connection
- Screen: 360×640px and above

---

## 13. Localization

| Language | Status | Notes |
|---|---|---|
| Hindi | ✅ Default | Devanagari script, Baloo 2 font |
| English | ✅ Toggle available | Switch in Settings |

### Localization Scope
All user-facing strings must be bilingual:
- Splash and onboarding text
- In-game HUD labels (Score, Lives, Coins)
- Game over and reward messages
- Registration form labels and error messages
- Wallet and leaderboard screens
- Push/share copy (post-V0)

### i18n Implementation
Use `react-i18next` with JSON translation files:
- `/locales/hi/translation.json` (Hindi — default)
- `/locales/en/translation.json` (English)

Language preference stored in `localStorage` and in user profile (post-registration).

---

## 14. Security & Anti-Fraud

### V0 Measures
- OTP verification on registration (mobile uniqueness enforced at DB level)
- Rate limiting on coin earning endpoint: max 50 coins / user / day (enforced server-side via Supabase Edge Functions)
- Supabase Row Level Security (RLS) policies: users can only read/write their own wallet and session records
- HTTPS enforced on all endpoints
- No sensitive data in URL parameters

### V1 Additions (Planned)
- Device fingerprinting (FingerprintJS or similar)
- CAPTCHA trigger on suspicious activity patterns (> 100 sessions/day from same device)
- Bot detection: sessions under 10 seconds with high scores flagged for review
- Admin kill switch: pause all coin earning globally within 1 minute

---

## 15. Admin Panel

### V0 (Supabase Studio — no custom build)
The Supabase Studio dashboard provides direct access to:
- View and query all tables (users, wallets, game_sessions, game_config)
- Update `game_config` values (coin ratio, daily cap, bonus multiplier)
- Export user data as CSV

### V1 Admin Panel (Custom Build)
A lightweight web dashboard (Next.js or Retool) for the brand team, providing:
- Real-time DAU / WAU / MAU metrics
- Coins earned vs. redeemed chart
- Coupon inventory and redemption rate
- Bulk CSV export of registered users
- Bonus multiplier event scheduler
- Kill switch to pause coin earning / redemptions
- Coupon generation and batch issue tools

---

## 16. Analytics & Tracking

### Events to Track (V0)
| Event | Properties |
|---|---|
| `game_start` | game_format, user_id (or guest), timestamp |
| `game_end` | score, duration, coins_earned, game_format |
| `registration_start` | timestamp |
| `registration_complete` | user_id, city, referred_by |
| `otp_sent` | mobile_hash (not raw mobile) |
| `otp_verified` | success/failure |
| `wallet_viewed` | user_id, coins_balance |
| `leaderboard_viewed` | user_id |

### V0 Analytics Stack
- Events stored in Supabase `analytics_events` table
- Dashboard: Supabase SQL views or Metabase (free tier, connect to Supabase Postgres)

### V1 Analytics (Planned)
- Integrate PostHog or Mixpanel for funnel analysis
- Referral chain tracking
- City/state heatmap of active users

---

## 17. Future Roadmap (Post-V0)

### V1 — Commerce Loop
- Coupon generation engine (unique alphanumeric codes: `YD-XXXX-XXXX`)
- Deep-link to Blinkit / Zepto Yellow Diamond product page
- Fallback: UPI cashback with screenshot proof-of-purchase verification
- Coupon table: `code`, `user_id`, `coin_value`, `inr_value`, `status`, `platform`, `created_at`, `redeemed_at`

### V1 — Virality
- Post-game shareable card: "I scored X and earned ₹Y! Beat me!" with referral link
- WhatsApp share integration
- Referral bonus: 25 YD Coins for referrer + new user on first registration

### V2 — Native Apps
- Android APK via Capacitor.js
- iOS App Store via Capacitor.js
- Push notifications for bonus multiplier events

### V2 — Advanced Engagement
- Seasonal themed worlds (Diwali, Holi, IPL)
- New YD product line launches as in-game events
- Tournament mode (weekend leaderboard competitions)
- Branded power-ups tied to new product launches

---

## 18. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Low-end device performance issues | High | High | Test on actual Redmi/Realme devices, not emulators; keep payload < 3MB |
| OTP delivery failure | Medium | High | Use MSG91 with Twilio as fallback; monitor delivery rates |
| Coin farming / bot abuse | Medium | High | Daily cap (50 coins/day), rate limiting, V1 fingerprinting |
| Coupon economics overrun | Medium | High | Monthly liability cap in admin panel; kill switch |
| QR code packaging coordination delay | Medium | Medium | Deliver QR spec + tracking URL independently; packaging team integrates separately |
| Blinkit/Zepto API partnership delay | Medium | Medium | UPI cashback fallback path built in parallel |
| Official brand assets not provided | Low | Medium | V0 ships with approved placeholders; asset handoff tracked separately |
| iOS PWA install limitations | Low | Low | Safari PWA support is limited; V1 native app resolves this |

---

## 19. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Which game format is selected after Sprint 1 play-test? | Client (Yellow Diamond) | ⏳ Pending play-test |
| 2 | What is the official coin-to-INR conversion rate? (e.g., 100 coins = ₹10) | Brand / Finance team | ⏳ Pending |
| 3 | What is the maximum monthly coupon liability budget? | Brand / Finance team | ⏳ Pending |
| 4 | Who provides official mascot art, product pack images, and brand guidelines? | Yellow Diamond marketing | ⏳ Pending asset handoff |
| 5 | MSG91 account and API key provisioning | Dev / Client | ⏳ Pending |
| 6 | Supabase project provisioning (who owns the org?) | Dev / Client | ⏳ Pending |
| 7 | Blinkit / Zepto coupon partnership — is this already in progress? | Yellow Diamond sales team | ⏳ Pending |
| 8 | What are the approved competitor brand names/logos to use as obstacle visuals? | Client / Legal | ⏳ Pending legal sign-off |
| 9 | Hindi copy review — who approves translations? | Yellow Diamond marketing | ⏳ Pending |
| 10 | QR code placement on packaging — inside or outside the packet? | Brand / Packaging team | ⏳ Pending |

---

*This document is a living specification. All sections marked ⏳ should be resolved before Sprint 2 begins. Updates to this document must be tracked via Git commit history.*
