# Project Research Summary

**Project:** StreakEngine -- Habit & Health Gamification Platform
**Domain:** Gamified habit & health tracking (engagement layer)
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

StreakEngine is a gamified habit tracking platform that applies Duolingo-style engagement mechanics (streaks, XP, leveling, leaderboards) to health and wellness habits. The domain is well-studied: Duolingo, Habitica, Strava, and Finch have collectively proven which mechanics drive retention and which cause churn. The winning formula is streaks (loss aversion), XP tied to meaningful actions (progress), friend-scoped leaderboards (accountability), and progressive achievements (surprise and delight). The losing formula is punishment for missed days, too many metrics, global leaderboards, and hollow badges. StreakEngine's pixel-art game aesthetic is a genuine differentiator in a space dominated by minimalist or cartoony UIs.

The recommended approach is a server-first Next.js 15 architecture with Neon Postgres, Drizzle ORM, and iron-session for lightweight auth. All gamification logic (streak calculation, XP math, achievement rules) should live as pure functions in an engine layer, called by server actions for mutations and queries for reads. No complex client state management is needed -- the database is the source of truth, and server components handle data fetching. The pixel-art design system uses Tailwind v4 with CSS-first config for design tokens, Press Start 2P / Silkscreen fonts, and Motion (framer-motion) for the four key animations (XP float, streak pulse, level-up flash, quest complete stamp).

The primary risks are: (1) timezone-ignorant streak calculation silently breaking streaks for non-UTC users, (2) XP inflation making the leveling curve meaningless because values were assigned without modeling the math, (3) Neon cold starts destroying the first impression for demo reviewers, and (4) demo data that tells no coherent story. All four are preventable by addressing them in the correct phase -- timezone awareness in schema design, leveling curve modeling before XP values are set, serverless driver configuration at infrastructure setup, and narrative-driven seed scripts in the final phase.

## Key Findings

### Recommended Stack

The stack is fully mandated (Next.js, Neon Postgres, Drizzle ORM) with well-researched additions. All technologies are at stable versions with high confidence.

**Core technologies:**
- **Next.js 15 + App Router:** Full-stack framework with RSC for data loading and server actions for mutations. Vercel-native deployment.
- **Neon Postgres + @neondatabase/serverless:** Serverless Postgres via HTTP driver (neon-http mode). No persistent connections needed.
- **Drizzle ORM 0.45.x:** Type-safe SQL with lightweight footprint and fast serverless cold starts. One schema file per resource.
- **iron-session 8.x:** Encrypted cookie sessions. Perfect for demo app with 3 accounts. No auth provider complexity.
- **Tailwind CSS v4:** CSS-first config for pixel-art design tokens. No tailwind.config.js needed.
- **Motion 12.x (framer-motion):** Required for XP float, streak pulse, level-up flash, quest complete stamp animations. Import from `motion/react`.
- **date-fns 3.x:** Streak calculation, weekly resets, timezone-aware date operations.

**Explicitly excluded:** shadcn/ui and Radix UI (fight the pixel aesthetic), NextAuth (overkill for demo auth), Redux/Zustand (no complex client state), Chart.js (pixel-art indicators replace standard charts).

### Expected Features

**Must have (table stakes):**
- Streak counter with prominent flame icon -- the single most important UI element
- Streak freeze (1 free per week, auto-applied) -- without it, one miss causes rage-quit
- XP per habit completion with different weights per habit type
- Leveling system with segmented pixel progress bar
- One-tap daily habit logging (inline, no modals)
- Visual feedback: XP float animation, quest complete stamp, progress bar fill
- Achievement/badge system with surprise unlocks (mystery "?" for locked)
- Weekly friend-scoped leaderboard (Monday reset)
- Friend/social system with public/private toggle
- Profile/character sheet with stats

**Should have (differentiators):**
- Streak multiplier (consecutive weeks increase XP: 1x -> 1.2x -> 1.5x)
- At-risk detection for coach view (30% engagement drop over 7-day window)
- Nudge system ("Your party needs you!" from friends/coach)
- Weekly challenges with named goals and group competition
- Quest board metaphor (RPG terminology throughout)
- Coach dashboard with party management view
- Positive-only reinforcement (no punishment mechanics)

**Defer entirely:**
- Custom habit creation (pre-configured for demo)
- Push notifications (use in-app nudges)
- Real-time chat (overkill)
- Avatar/character customization (anti-feature per research)
- Light mode (dark-only game aesthetic)

### Architecture Approach

Server-first architecture with four clean layers: presentation (RSC pages), server actions (mutations), pure engine functions (domain logic), and Drizzle data access. Pages are server components that fetch data via `Promise.all`. Interactive elements (quest completion, animations) are client component islands. All game mechanics compute server-side -- the client renders results and plays animations. Route groups `(auth)`, `(game)`, `(coach)` separate the three personas without affecting URLs.

**Major components:**
1. **Streak Engine** -- Pure function: given habit log history, return streak state (count, multiplier, freeze status)
2. **XP/Level Engine** -- Pure function: action type + multiplier -> XP awarded; total XP -> level via designed curve
3. **Achievement Engine** -- Rule-based predicate checker triggered after each habit completion
4. **Leaderboard** -- SQL aggregation query with `RANK()` window function; computed on read, not stored
5. **At-Risk Detector** -- Compare 7-day rolling engagement windows; computed on read for coach dashboard
6. **Daily Cron** -- Evaluates all active streaks at midnight; applies freezes or breaks; resets weekly data on Monday

**Database:** 10 tables (users, habits, habit_logs, streaks, achievements, user_achievements, friendships, challenges, challenge_participants, nudges) with critical indexes on `habit_logs(user_id, completed_at)` and `habit_logs(completed_at)`.

### Critical Pitfalls

1. **Timezone-ignorant streak calculation** -- Store user timezone in DB from day one. Calculate day boundaries in user's local timezone, not UTC. False streak breaks destroy trust permanently. Address in Phase 1 schema design.

2. **Streak loss without recovery path** -- Auto-apply streak freeze (don't require pre-activation). Show personal best when streak breaks ("Amazing 47-day run!"). Add "at risk" state to data model. Address in Phase 2 engine design.

3. **XP inflation / broken leveling curve** -- Design the leveling curve formula BEFORE assigning XP values. Model expected daily XP, work backward to ensure level 14 at ~45 days. Demo data must be mathematically consistent. Address in Phase 2 engine design.

4. **Neon cold start on first visit** -- Use `@neondatabase/serverless` HTTP driver with connection pooler. Add skeleton UI during cold starts. Consider wake-up route for demo. Address in Phase 1 infrastructure.

5. **Demo data with no narrative** -- Write user stories first, then generate data backward from today. Power user's 47-day streak must have exactly 47 days of completion records. XP totals must match leveling curve. Address in final phase with significant time budget.

6. **Punitive UX language** -- Never use "missed," "failed," or "lost" in user-facing copy. Frame positively: "3 quests completed!" not "2 remaining." No red/danger colors on user dashboard for incomplete items. Address throughout UI implementation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Database, Auth, Infrastructure)
**Rationale:** Everything depends on the database schema and auth. Timezone column on users table must exist from day one (Pitfall #1). Neon driver configuration must be correct from the start (Pitfall #4).
**Delivers:** Working database with all tables, Neon connection with serverless driver, iron-session auth with 3 demo accounts, project scaffolding with Tailwind v4 pixel-art tokens, font loading, root layout.
**Addresses:** Authentication (table stakes), infrastructure foundation
**Avoids:** Timezone-ignorant streaks (schema includes timezone), Neon cold start (correct driver from start)

### Phase 2: Core Game Loop (Habits, XP, Streaks, Leveling)
**Rationale:** This is the critical path from FEATURES.md: Auth -> Habits -> XP -> Streaks -> Leveling. The core loop must work and feel rewarding before anything social is built. The leveling curve formula must be designed before XP values are assigned (Pitfall #3).
**Delivers:** Daily quest board with one-tap completion, XP award with per-habit weights, streak tracking with freeze mechanic, leveling system with progress bar, streak multiplier, streak banner hero component.
**Addresses:** Streak counter, streak freeze, XP system, leveling, one-tap logging, visual feedback (XP float, streak pulse, quest stamp)
**Avoids:** XP inflation (curve designed first), streak loss rage-quit (freeze + personal best), punitive UX (positive framing)

### Phase 3: Social Layer (Friends, Leaderboard, Achievements, Nudges)
**Rationale:** Social features require the core loop to exist -- there is nothing to compete on without XP. Friend-scoped leaderboard, nudges, and achievements all layer on top of the existing habit completion data.
**Delivers:** Friend system with public/private toggle, weekly leaderboard (friend-scoped, Monday reset), achievement system with surprise unlocks, nudge system, weekly challenges.
**Addresses:** Weekly leaderboard, friend system, achievements, nudges, weekly challenges
**Avoids:** Leaderboard N+1 queries (single aggregation query), global leaderboard (friend-scoped only), achievement checklist grind (mystery unlocks)

### Phase 4: Coach Dashboard (Admin/B2B View)
**Rationale:** Coach dashboard is a separate read-only view over existing data. Does not affect user experience and can be built last. At-risk detection is a query pattern, not new data.
**Delivers:** Coach dashboard with user cards sorted by engagement risk, at-risk detection (traffic light system), community analytics, challenge configuration.
**Addresses:** Coach dashboard, at-risk detection, community analytics
**Avoids:** Overwhelming metrics (focused traffic-light view), punitive language in at-risk labels

### Phase 5: Demo Data and Polish
**Rationale:** Demo data seeding depends on the complete schema and must tell a coherent narrative (Pitfall #6). Polish pass ensures animations feel right, copy passes the punitive language check, and XP totals are mathematically consistent with the leveling curve.
**Delivers:** 15 users with 3 months of narrative-driven data, 3 demo accounts with distinct stories (power user, coach, new user), level-up celebration animation, final copy review, responsive design verification, deployment to Vercel.
**Addresses:** Demo data narrative, animation polish, deployment
**Avoids:** Random/incoherent demo data, inconsistent XP/level/streak numbers, punitive copy slipping through

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** Schema design decisions (timezone column, index choices, table structure) constrain everything built on top. Getting the foundation wrong means rewriting queries later.
- **Phase 2 before Phase 3:** The core game loop (habit -> XP -> streak -> level) is the dependency for all social features. Leaderboards rank XP that does not exist until Phase 2. Achievements trigger on streak/level milestones from Phase 2.
- **Phase 3 before Phase 4:** Coach dashboard reads from social data (friend networks, leaderboard standings, challenge participation). Building it after social features means real data to display.
- **Phase 5 last:** Demo data must be seeded against the final schema and must be consistent with the leveling curve, streak logic, and achievement rules -- all of which are defined in earlier phases.
- **Animations integrated in Phase 2-3, polished in Phase 5:** Core animations (XP float, streak pulse) should be built alongside the features they accompany, but the final polish pass happens at the end.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Core Game Loop):** Leveling curve design requires mathematical modeling. XP values, level thresholds, and multiplier math must be worked out as a system before implementation. The pure engine functions need careful design.
- **Phase 5 (Demo Data):** Narrative-driven seed scripts are complex. Each of the 15 users needs a realistic 3-month engagement story that is mathematically consistent with all game mechanics. Budget significant time.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented stack. Drizzle + Neon + iron-session all have official integration guides. Standard Next.js project setup.
- **Phase 3 (Social Layer):** Leaderboard queries, friend systems, and achievement patterns are well-documented. The aggregation query and `RANK()` window function are standard SQL.
- **Phase 4 (Coach Dashboard):** Read-only dashboard over existing data. Standard data display patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies mandated or well-established. Official integration guides exist for every combination. Stable versions. |
| Features | MEDIUM-HIGH | Strong competitor analysis (Duolingo, Habitica, Strava). Clear table stakes vs. differentiators. Minor uncertainty around ideal XP/leveling values. |
| Architecture | HIGH | Server-first Next.js App Router is the documented standard. Pure engine functions, server actions, and RSC data loading are established patterns. |
| Pitfalls | HIGH | Timezone issues, streak psychology, and XP inflation are well-documented in the domain. Neon cold start is documented in Neon's own docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Leveling curve formula:** Research identifies this as critical but does not provide the specific formula. Must be designed during Phase 2 planning. Recommendation: exponential curve where level N requires `base * N^1.5` XP, calibrated so level 14 aligns with ~45 days of consistent engagement.
- **Exact XP values per habit type:** Research says different weights matter but does not prescribe values. Must be derived from the leveling curve during Phase 2. Start with: exercise ~50 XP, meditation ~30 XP, water ~10 XP, sleep ~20 XP, then validate against the curve.
- **Vercel Cron reliability for streak evaluation:** Daily cron at midnight is the recommended pattern, but Vercel Cron has a minimum granularity of 1 minute and no timezone awareness. The cron itself runs in UTC. Needs validation during Phase 1 infrastructure setup.
- **Pixel font performance:** Press Start 2P is a bitmap font that may render poorly at certain sizes or cause layout shift. Needs testing during Phase 1 with `next/font/google` preloading and explicit text container dimensions.

## Sources

### Primary (HIGH confidence)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) -- session management, iron-session recommendation
- [Drizzle ORM + Neon Setup](https://orm.drizzle.team/docs/get-started/neon-new) -- official integration
- [Neon Serverless Driver Docs](https://neon.com/docs/serverless/serverless-driver) -- connection patterns
- [Neon Connection Latency](https://neon.com/docs/connect/connection-latency) -- cold start mitigation
- [Motion for React](https://motion.dev/docs/react) -- animation library
- [Lenny's Newsletter: How Duolingo Reignited User Growth](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) -- streak psychology

### Secondary (MEDIUM confidence)
- [Trophy: Duolingo Gamification Case Study](https://trophy.so/blog/duolingo-gamification-case-study) -- engagement mechanics analysis
- [Cohorty: Gamification in Habit Tracking](https://blog.cohorty.app/gamification-in-habit-tracking-does-it-work-research-real-user-data) -- research on heavy vs light gamification
- [Smashing Magazine: Designing a Streak System](https://www.smashingmagazine.com/2026/02/designing-streak-system-ux-psychology/) -- streak UX patterns
- [System Design: Leaderboard System Design](https://systemdesign.one/leaderboard-system-design/) -- leaderboard architecture
- [Smartico: Gamification Architecture Best Practices](https://smartico.ai/gamification-architecture-best-practices/) -- component patterns

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
