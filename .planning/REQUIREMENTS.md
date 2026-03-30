# Requirements: StreakEngine

**Defined:** 2026-03-30
**Core Value:** Users feel compelled to return daily because breaking their streak has real psychological weight, earning XP feels meaningful, and friendly competition creates accountability.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can log in with email and password (3 demo accounts)
- [x] **AUTH-02**: User session persists across browser refresh (cookie-based)
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: Different UI routes based on user role (player vs coach)

### Habits & Quests

- [x] **HBIT-01**: User sees today's habits as quest cards on home screen
- [x] **HBIT-02**: User can complete a habit with one click (inline, no modal)
- [x] **HBIT-03**: Completing a habit awards XP based on habit type (different weights)
- [x] **HBIT-04**: Partial-progress habits show inline progress blocks (e.g., water 3/8)
- [x] **HBIT-05**: Completed quests show pixel "DONE" stamp animation

### Streaks

- [x] **STRK-01**: User sees prominent streak counter with flame icon at top of home screen
- [x] **STRK-02**: Streak increments daily when user completes at least one habit
- [x] **STRK-03**: Streak breaks if user misses an entire day (no habits completed)
- [x] **STRK-04**: Streak freeze: 1 free freeze per week auto-applied on missed day
- [x] **STRK-05**: Streak multiplier increases with consecutive weeks (1x → 1.2x → 1.5x)
- [x] **STRK-06**: Streak flame pulses when active, stops when at risk

### XP & Leveling

- [x] **XPLV-01**: User earns XP for each completed habit (weighted by habit type)
- [x] **XPLV-02**: XP progress bar shows progress toward next level (blocky/segmented)
- [x] **XPLV-03**: Level-up triggers flash animation and "LEVEL UP!" text
- [x] **XPLV-04**: XP float animation (+50 XP) appears on quest completion
- [x] **XPLV-05**: Streak multiplier applies to all XP earned

### Leaderboard

- [ ] **LDBD-01**: User sees weekly leaderboard on home screen (compact peek)
- [x] **LDBD-02**: Leaderboard shows rank, username, weekly XP
- [ ] **LDBD-03**: Top 3 users get trophy icons (gold/silver/bronze)
- [ ] **LDBD-04**: Current user's row is highlighted
- [x] **LDBD-05**: Leaderboard resets every Monday

### Achievements

- [ ] **ACHV-01**: User can view achievement grid on profile (square badges, never circular)
- [ ] **ACHV-02**: Locked achievements show as dark squares with "?" overlay
- [x] **ACHV-03**: Achievements unlock based on specific triggers (streak milestones, social actions, time-based)
- [ ] **ACHV-04**: Achievement unlock triggers celebration animation (pixel sparkles)
- [x] **ACHV-05**: Pre-defined achievements: First Week, Streak Master (30 days), Early Bird, Social Butterfly

### Social & Friends

- [ ] **SOCL-01**: User can view friends list
- [x] **SOCL-02**: User can see friends' streak and level (if public)
- [x] **SOCL-03**: User can send nudge to friend ("You haven't logged today!")
- [ ] **SOCL-04**: Weekly challenge shows progress with blocky progress blocks

### Coach Dashboard

- [ ] **COCH-01**: Coach sees grid of user cards sorted by engagement risk
- [ ] **COCH-02**: Each user card shows streak status, weekly XP, risk indicator (green/yellow/red heart)
- [ ] **COCH-03**: Coach can expand user card to see quest completion patterns
- [ ] **COCH-04**: Coach can send nudge directly from expanded user card
- [ ] **COCH-05**: At-risk detection: flag users with 30%+ engagement drop over 7 days

### Profile

- [ ] **PROF-01**: User sees character sheet with level, total XP, streak history
- [x] **PROF-02**: RPG stat block display (STR, INT, DEX, CHA mapped to game metrics)
- [ ] **PROF-03**: Achievement grid (3-4 columns of square badges)
- [x] **PROF-04**: Habit XP breakdown (which habits contribute most)

### UI & Design

- [x] **UIDN-01**: Pixel-art game aesthetic with squared edges, thick borders (3px), bold colors
- [x] **UIDN-02**: Dark theme only (--color-bg: #1A1A2E)
- [x] **UIDN-03**: Press Start 2P font for headings/numbers, Silkscreen for body text
- [x] **UIDN-04**: Mobile-first stacked layout with bottom tab bar (Home/Quests/Friends/Profile)
- [x] **UIDN-05**: Desktop: top nav strip, content max-width 720px centered
- [x] **UIDN-06**: All pre-generated pixel-art assets from public/assets/ used appropriately
- [x] **UIDN-07**: Rewarding animations: XP float, streak pulse, level-up flash, quest complete stamp

### Demo Data

- [ ] **DEMO-01**: 15 users seeded at various engagement stages (new, engaged, at-risk, power)
- [ ] **DEMO-02**: Power user: 47-day streak, level 14, 8 achievements unlocked
- [ ] **DEMO-03**: Broken streak user: streak broke yesterday (re-engagement scenario)
- [ ] **DEMO-04**: 3 users in active weekly challenge competing for top XP
- [ ] **DEMO-05**: 3 months of realistic habit completion history
- [ ] **DEMO-06**: Mix of habits: exercise (5x/week), meditation (daily), water (8 glasses), sleep (7+ hours)
- [ ] **DEMO-07**: 3 demo accounts functional: user@streakengine.app, coach@streakengine.app, new@streakengine.app

## v2 Requirements

### Notifications

- **NOTF-01**: In-app notification feed for achievements, nudges, challenge results
- **NOTF-02**: Email digest of weekly progress

### Advanced Social

- **ASOC-01**: User can add/remove friends
- **ASOC-02**: Public/private profile toggle
- **ASOC-03**: Friend activity feed

### Habit Customization

- **CUST-01**: User can create custom habits with custom XP values
- **CUST-02**: User can set habit frequency (daily, 3x/week, etc.)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Push notifications | Requires native app infrastructure |
| Real-time chat | High complexity, not core to gamification loop |
| OAuth/social login | Email/password sufficient for demo |
| Native mobile app | Web-first, responsive design |
| Payment/subscription | B2B billing is separate concern |
| Light mode | Games don't have light mode; design spec mandates dark only |
| Complex avatar/character system | Research shows light gamification outperforms heavy; overkill for demo |
| HP loss / punishment mechanics | Research shows punitive mechanics cause shame spirals, 41% worse performance |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| UIDN-01 | Phase 1 | Complete |
| UIDN-02 | Phase 1 | Complete |
| UIDN-03 | Phase 1 | Complete |
| UIDN-04 | Phase 1 | Complete |
| UIDN-05 | Phase 1 | Complete |
| UIDN-06 | Phase 1 | Complete |
| UIDN-07 | Phase 1 | Complete |
| HBIT-01 | Phase 2 | Complete |
| HBIT-02 | Phase 2 | Complete |
| HBIT-03 | Phase 2 | Complete |
| HBIT-04 | Phase 2 | Complete |
| HBIT-05 | Phase 2 | Complete |
| STRK-01 | Phase 2 | Complete |
| STRK-02 | Phase 2 | Complete |
| STRK-03 | Phase 2 | Complete |
| STRK-04 | Phase 2 | Complete |
| STRK-05 | Phase 2 | Complete |
| STRK-06 | Phase 2 | Complete |
| XPLV-01 | Phase 2 | Complete |
| XPLV-02 | Phase 2 | Complete |
| XPLV-03 | Phase 2 | Complete |
| XPLV-04 | Phase 2 | Complete |
| XPLV-05 | Phase 2 | Complete |
| LDBD-01 | Phase 3 | Pending |
| LDBD-02 | Phase 3 | Complete |
| LDBD-03 | Phase 3 | Pending |
| LDBD-04 | Phase 3 | Pending |
| LDBD-05 | Phase 3 | Complete |
| ACHV-01 | Phase 3 | Pending |
| ACHV-02 | Phase 3 | Pending |
| ACHV-03 | Phase 3 | Complete |
| ACHV-04 | Phase 3 | Pending |
| ACHV-05 | Phase 3 | Complete |
| SOCL-01 | Phase 3 | Pending |
| SOCL-02 | Phase 3 | Complete |
| SOCL-03 | Phase 3 | Complete |
| SOCL-04 | Phase 3 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Complete |
| PROF-03 | Phase 3 | Pending |
| PROF-04 | Phase 3 | Complete |
| COCH-01 | Phase 4 | Pending |
| COCH-02 | Phase 4 | Pending |
| COCH-03 | Phase 4 | Pending |
| COCH-04 | Phase 4 | Pending |
| COCH-05 | Phase 4 | Pending |
| DEMO-01 | Phase 5 | Pending |
| DEMO-02 | Phase 5 | Pending |
| DEMO-03 | Phase 5 | Pending |
| DEMO-04 | Phase 5 | Pending |
| DEMO-05 | Phase 5 | Pending |
| DEMO-06 | Phase 5 | Pending |
| DEMO-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after roadmap creation*
