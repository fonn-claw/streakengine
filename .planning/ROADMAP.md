# Roadmap: StreakEngine

## Overview

StreakEngine delivers a gamified habit tracking platform in five phases: foundation (auth + pixel-art design system), core game loop (habits, streaks, XP, leveling), social layer (leaderboard, achievements, friends, profile), coach dashboard (admin analytics and at-risk detection), and demo data with polish (narrative-driven seed data and deployment). Each phase delivers a complete, verifiable capability that the next phase builds on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Auth, database schema, pixel-art design system, layout shell
- [ ] **Phase 2: Core Game Loop** - Daily quests, streak tracking, XP/leveling engine
- [ ] **Phase 3: Social & Achievements** - Leaderboard, achievements, friends, profile
- [ ] **Phase 4: Coach Dashboard** - Admin engagement analytics and at-risk detection
- [ ] **Phase 5: Demo Data & Deploy** - Narrative-driven seed data and Vercel deployment

## Phase Details

### Phase 1: Foundation
**Goal**: Users can log in to a pixel-art game shell that routes them to the correct experience based on role
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, UIDN-01, UIDN-02, UIDN-03, UIDN-04, UIDN-05, UIDN-06, UIDN-07
**Success Criteria** (what must be TRUE):
  1. User can log in with demo credentials and sees a game-styled home screen with pixel fonts and dark theme
  2. User session survives browser refresh without re-login
  3. User can log out from any page and is returned to login
  4. Coach account routes to a distinct dashboard layout; player accounts route to quest board layout
  5. Mobile view shows bottom tab bar navigation; desktop view shows top nav strip with centered content
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold, 8-table Drizzle schema, iron-session auth with 3 demo accounts
- [ ] 01-02-PLAN.md — Pixel-art design system, responsive navigation, styled login page, layout shells

### Phase 2: Core Game Loop
**Goal**: Users experience the daily engagement loop -- complete quests, earn XP, watch streaks grow, level up
**Depends on**: Phase 1
**Requirements**: HBIT-01, HBIT-02, HBIT-03, HBIT-04, HBIT-05, STRK-01, STRK-02, STRK-03, STRK-04, STRK-05, STRK-06, XPLV-01, XPLV-02, XPLV-03, XPLV-04, XPLV-05
**Success Criteria** (what must be TRUE):
  1. User sees today's habits as quest cards and can complete them with one tap, seeing XP float animation and quest complete stamp
  2. Streak counter with flame icon is the most prominent element on home screen; flame pulses when active
  3. Completing at least one habit per day increments the streak; missing an entire day breaks it unless a freeze is available
  4. XP progress bar fills toward next level; leveling up triggers flash animation with "LEVEL UP!" text
  5. Streak multiplier visibly increases XP earned after consecutive weeks of activity
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Game engine (XP/streak pure functions), server actions, queries, seed extension
- [ ] 02-02-PLAN.md — StreakBanner, QuestCard, animations (XP float, streak pulse, level-up flash, done stamp), home page wiring

### Phase 3: Social & Achievements
**Goal**: Users compete with friends, unlock achievements, and view their character progression
**Depends on**: Phase 2
**Requirements**: LDBD-01, LDBD-02, LDBD-03, LDBD-04, LDBD-05, ACHV-01, ACHV-02, ACHV-03, ACHV-04, ACHV-05, SOCL-01, SOCL-02, SOCL-03, SOCL-04, PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria** (what must be TRUE):
  1. User sees weekly leaderboard with ranked friends showing XP, trophy icons for top 3, and their own row highlighted
  2. User can view friends list, see friends' streak and level, and send a nudge
  3. Achievement grid on profile shows unlocked badges as pixel art and locked ones as dark "?" squares; unlocking triggers sparkle animation
  4. Profile displays character sheet with level, total XP, RPG stat block, and habit XP breakdown
  5. Weekly challenge shows progress with blocky progress blocks for participating users
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Nudges schema, achievement engine, all data queries (leaderboard, friends, achievements, profile, challenges), server actions, habit action integration
- [ ] 03-02-PLAN.md — Leaderboard components (home peek + full), friends list with nudge mechanic, challenge progress card, page wiring (home, friends, quests)
- [ ] 03-03-PLAN.md — Achievement grid, celebration animation, RPG stat block, habit XP breakdown, profile page, QuestBoard achievement unlock integration

### Phase 4: Coach Dashboard
**Goal**: Coaches can monitor community engagement and intervene when users are at risk of churning
**Depends on**: Phase 3
**Requirements**: COCH-01, COCH-02, COCH-03, COCH-04, COCH-05
**Success Criteria** (what must be TRUE):
  1. Coach sees a grid of user cards sorted by engagement risk with green/yellow/red heart indicators
  2. Coach can expand a user card to see quest completion patterns over time
  3. Coach can send a nudge directly from an expanded user card
  4. Users with 30%+ engagement drop over 7 days are automatically flagged as at-risk
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Demo Data & Deploy
**Goal**: The app tells a compelling story with realistic data across all three demo personas
**Depends on**: Phase 4
**Requirements**: DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05, DEMO-06, DEMO-07
**Success Criteria** (what must be TRUE):
  1. Logging in as user@streakengine.app shows a power user with 47-day streak, level 14, 8 achievements, mid-week challenge
  2. Logging in as new@streakengine.app shows a day-3 user with onboarding-stage progression and first achievements
  3. Logging in as coach@streakengine.app shows community analytics with 15 users at various engagement stages including at-risk alerts
  4. Leaderboard, achievement history, and habit logs reflect 3 months of mathematically consistent engagement data
  5. App is deployed and accessible at streakengine.demos.fonnit.com
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In Progress|  |
| 2. Core Game Loop | 0/2 | Not started | - |
| 3. Social & Achievements | 1/3 | In Progress|  |
| 4. Coach Dashboard | 0/1 | Not started | - |
| 5. Demo Data & Deploy | 0/2 | Not started | - |
