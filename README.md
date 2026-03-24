# 🟡 Yellow Diamond — Crunch Run

A mobile-first, browser-based mini-game for **Yellow Diamond** (Prataap Snacks Ltd.).
Built as a Progressive Web App — no download required.

## Quick Links
- [Product Spec](./specs.md) — Full requirements, architecture, and roadmap
- [UI Reference](https://stitch.withgoogle.com/projects/4295103591751963793) — Google Stitch screens

## Stack
| Layer | Technology |
|---|---|
| Game Engine | Phaser.js 3.x |
| Frontend | React + Vite (PWA) |
| Backend | Supabase |
| OTP / SMS | MSG91 |
| Hosting | Vercel |

## V0 Goals
- Dual game prototype: **Endless Runner** + **Brick Breaker**
- User registration (Name, Mobile OTP, City, Age)
- Score → YD Coins wallet
- Bilingual UI: Hindi (default) + English

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure (planned)
```
yellow-diamond-crunch-run/
├── public/             # Static assets, PWA manifest
├── src/
│   ├── game/           # Phaser.js game scenes and logic
│   │   ├── scenes/     # Boot, Preload, Runner, Breaker, GameOver
│   │   ├── objects/    # Player, Collectibles, Obstacles, PowerUps
│   │   └── config.js   # Phaser game config
│   ├── components/     # React UI components (Wallet, Leaderboard, Registration)
│   ├── pages/          # Route pages (Home, Game, Wallet, Leaderboard)
│   ├── lib/            # Supabase client, OTP helpers, analytics
│   ├── locales/        # i18n translations (hi, en)
│   └── styles/         # Global styles, brand tokens
├── supabase/
│   └── migrations/     # DB schema migrations
├── specs.md            # Product requirements document
└── README.md
```

## Branch Strategy
| Branch | Purpose |
|---|---|
| `main` | Production-ready, tagged releases only |
| `develop` | Integration branch — all features merge here |
| `feature/*` | Individual feature branches |
| `fix/*` | Bug fix branches |

## Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MSG91_API_KEY=
```

## Contributing
1. Branch off `develop`: `git checkout -b feature/your-feature`
2. Commit with clear messages (see commit style below)
3. Open a PR to `develop` — never directly to `main`

### Commit Message Style
```
feat: add endless runner game scene
fix: correct coin accumulation on game over
chore: update dependencies
docs: expand specs with admin panel details
```

---
*Yellow Diamond Crunch Run — Built with ❤️ for Prataap Snacks Ltd.*
