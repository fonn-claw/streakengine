# StreakEngine — Habit & Health Gamification Platform

## What This Is

A gamified habit and health tracking platform that uses game mechanics — streaks, XP, levels, achievements, and friend competition — to drive sustained engagement. Think Duolingo meets Minecraft for wellness habits. Built as a B2B-ready platform where coaches can monitor community engagement and intervene when users are at risk of churning.

## Core Value

Users feel compelled to return daily because breaking their streak has real psychological weight, earning XP feels meaningful, and friendly competition creates accountability.

## Requirements

### Validated

- ✓ Authentication with demo accounts (3 personas) — Phase 1
- ✓ Pixel-art game aesthetic with design system — Phase 1
- ✓ Mobile-first responsive layout with nav — Phase 1
- ✓ Habit/quest system with XP rewards tied to specific actions — Phase 2
- ✓ Streak tracking with loss aversion (prominent counter, flame icon, multiplier) — Phase 2
- ✓ Streak freeze mechanic (1 free freeze per week) — Phase 2
- ✓ Streak multiplier (consecutive weeks increase XP: 1x → 1.2x → 1.5x) — Phase 2
- ✓ XP and leveling system with progress bars — Phase 2
- ✓ Rewarding animations (XP float, streak pulse, level-up flash, quest complete stamp) — Phase 2

### Active

- [ ] Weekly leaderboard (resets Monday) with friend competition
- [ ] Achievement/badge system with surprise unlocks
- [ ] Weekly challenges with progress tracking
- [ ] Friend/rival system with nudges
- [ ] Coach/admin dashboard with engagement analytics
- [ ] At-risk user detection (30%+ engagement drop flags user)
- [ ] Realistic demo data: 15 users, 3 months of engagement history

### Out of Scope

- Push notifications — requires native app infrastructure
- Real-time chat — high complexity, not core to gamification loop
- OAuth/social login — email/password sufficient for demo
- Native mobile app — web-first, responsive design
- Payment/subscription — B2B billing is a separate concern
- Custom habit creation by end users — pre-configured habits for demo
- Light mode — games don't have light mode

## Context

- Visual identity is pixel-art/retro-game: Press Start 2P + Silkscreen fonts, squared edges, thick borders, bold saturated colors on dark navy background
- Pre-generated assets exist in `public/assets/` (33 files: pixel SVG icons, achievement badges, DALL-E hero images, tileable background)
- Demo scenario: wellness app called "Vitality" with 15 users at various engagement stages
- Three demo accounts with distinct personas and experiences
- The app should feel rewarding, not punishing — celebrate what was done, don't scold what wasn't
- UI paradigm is "Quest Board" — habits are quests, profile is a character sheet, coach view is party management

## Constraints

- **Tech Stack**: Next.js App Router, Neon Postgres, Drizzle ORM — mandated
- **Database**: Neon Postgres only (NOT SQLite)
- **Deploy**: Vercel with custom domain streakengine.demos.fonnit.com
- **Design**: Must follow DESIGN-SPEC.md exactly — pixel-art aesthetic, specific color tokens, specific fonts, specific layout structure
- **Assets**: Must use pre-generated assets in public/assets/ as documented
- **Session**: Single-session build — complete everything without context resets

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark theme only | Games don't have light mode; matches pixel-art aesthetic | — Pending |
| Mobile-first stacked layout | Quest board paradigm; no sidebar | — Pending |
| Press Start 2P + Silkscreen fonts | Pixel-art bitmap fonts for game feel | — Pending |
| Demo data seeded in DB | Realistic 3-month engagement history for all personas | — Pending |
| Cookie-based auth (no JWT) | Simpler for demo, session-based | — Pending |

---
*Last updated: 2026-03-30 after Phase 2 completion*
