# Architecture Research

**Domain:** Gamified Habit & Health Tracking Platform
**Researched:** 2026-03-30
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+---------------------------------------------------------------+
|                     Presentation Layer                         |
|  +----------+  +----------+  +----------+  +-----------+      |
|  |  Home/   |  |  Quest   |  | Friends/ |  | Profile/  |      |
|  |  Dashboard|  |  Board   |  | Leader   |  | Character |      |
|  +----+-----+  +----+-----+  +----+-----+  +-----+-----+      |
|       |              |             |              |             |
+-------+--------------+-------------+--------------+------------+
|                     Shared UI Layer                             |
|  [StreakBanner] [QuestCard] [LeaderRow] [AchievementBadge]     |
|  [XPBar] [LevelIndicator] [AnimationEngine] [BottomNav]       |
+---------------------------------------------------------------+
|                     Server Action Layer                        |
|  +-------------+  +------------+  +-------------+              |
|  | Habit/Quest |  | Social/    |  | Admin/Coach |              |
|  | Actions     |  | Friend     |  | Actions     |              |
|  +------+------+  +-----+------+  +------+------+              |
|         |               |                |                     |
+---------------------------------------------------------------+
|                     Domain Logic Layer                         |
|  +---------+ +----------+ +----------+ +----------+            |
|  | Streak  | | XP/Level | | Leader-  | | Achieve- |            |
|  | Engine  | | Engine   | | board    | | ment     |            |
|  +---------+ +----------+ +----------+ +----------+            |
|  +---------+ +----------+ +----------+                         |
|  | Streak  | | At-Risk  | | Challenge|                         |
|  | Freeze  | | Detector | | Manager  |                         |
|  +---------+ +----------+ +----------+                         |
+---------------------------------------------------------------+
|                     Data Access Layer                          |
|  +-----------------------------------------------------+      |
|  |              Drizzle ORM (Type-safe queries)         |      |
|  +-----------------------------------------------------+      |
|  +-----------------------------------------------------+      |
|  |              Neon Postgres (Serverless)               |      |
|  +-----------------------------------------------------+      |
+---------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Streak Engine | Calculate current streak, handle resets, apply freeze logic, compute multiplier | Pure function: given user's habit log history, return streak state |
| XP/Level Engine | Award XP per action (weighted), calculate level from total XP, apply streak multiplier | Pure function: action type + multiplier -> XP awarded; total XP -> level |
| Leaderboard | Weekly XP ranking, reset every Monday, friend-scoped and global views | SQL query with weekly window + rank(); cached per request |
| Achievement Engine | Check unlock conditions after each action, track progress toward hidden achievements | Rule-based: list of predicates checked after habit completion |
| At-Risk Detector | Flag users whose 7-day rolling engagement drops 30%+ vs prior 7 days | SQL comparison of two 7-day windows of habit completions |
| Challenge Manager | Weekly challenges with named goals, track progress across participants | Challenge definition + per-user progress tracking |
| Streak Freeze | Track freeze availability (1/week), apply when streak would break | State per user per week: available/used/expired |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Route group: login page
│   │   └── login/page.tsx
│   ├── (game)/                 # Route group: authenticated game screens
│   │   ├── layout.tsx          # Game shell: nav bar, auth check
│   │   ├── page.tsx            # Home / daily quest board
│   │   ├── quests/page.tsx     # Full quest history / details
│   │   ├── friends/page.tsx    # Friends list + leaderboard
│   │   └── profile/page.tsx    # Character sheet
│   ├── (coach)/                # Route group: admin/coach views
│   │   ├── layout.tsx          # Coach shell with different nav
│   │   └── dashboard/page.tsx  # Community engagement view
│   ├── api/                    # API routes (if needed for cron/webhooks)
│   │   └── cron/
│   │       └── daily/route.ts  # Daily streak evaluation, weekly reset
│   └── layout.tsx              # Root layout: fonts, global CSS, providers
├── components/                 # Shared UI components
│   ├── streak-banner.tsx       # Hero banner with streak, level, XP
│   ├── quest-card.tsx          # Individual habit/quest item
│   ├── leaderboard.tsx         # Leaderboard display
│   ├── achievement-badge.tsx   # Single achievement display
│   ├── achievement-grid.tsx    # Grid of achievements (inventory style)
│   ├── xp-bar.tsx              # Segmented pixel XP progress bar
│   ├── bottom-nav.tsx          # Mobile tab bar
│   ├── top-nav.tsx             # Desktop navigation strip
│   ├── animations/             # XP float, streak pulse, level-up flash
│   └── ui/                     # Primitive pixel-styled components
├── lib/                        # Domain logic + utilities
│   ├── actions/                # Server Actions (mutations)
│   │   ├── habits.ts           # Complete habit, log progress
│   │   ├── social.ts           # Add friend, send nudge
│   │   └── admin.ts            # Coach actions (configure challenges)
│   ├── queries/                # Data fetching (read-only)
│   │   ├── habits.ts           # Today's quests, habit history
│   │   ├── streaks.ts          # Current streak, freeze status
│   │   ├── leaderboard.ts      # Weekly rankings
│   │   ├── achievements.ts     # Unlocked + locked achievements
│   │   ├── profile.ts          # User stats, character sheet data
│   │   └── admin.ts            # Community health, at-risk users
│   ├── engine/                 # Pure domain logic (no DB)
│   │   ├── streak.ts           # Streak calculation, freeze logic, multiplier
│   │   ├── xp.ts               # XP per action, level thresholds, multiplier
│   │   ├── achievements.ts     # Achievement rule definitions + checker
│   │   └── risk.ts             # At-risk detection algorithm
│   ├── auth.ts                 # Cookie-based session auth
│   └── utils.ts                # Date helpers, formatters
├── db/                         # Database layer
│   ├── index.ts                # Drizzle client + Neon connection
│   ├── schema/                 # Schema files (one per resource)
│   │   ├── users.ts            # Users table
│   │   ├── habits.ts           # Habits definition table
│   │   ├── habit-logs.ts       # Daily habit completion logs
│   │   ├── streaks.ts          # Streak state per user
│   │   ├── achievements.ts     # Achievement definitions + user unlocks
│   │   ├── friendships.ts      # Friend/rival relationships
│   │   ├── challenges.ts       # Weekly challenges + participation
│   │   └── nudges.ts           # Friend nudge messages
│   ├── relations.ts            # All Drizzle relations (avoids circular deps)
│   └── seed.ts                 # Demo data seeding (15 users, 3 months)
└── styles/
    └── globals.css             # CSS custom properties, pixel-art design tokens
```

### Structure Rationale

- **`app/` with route groups:** `(auth)`, `(game)`, `(coach)` cleanly separate the three personas without affecting URLs. Each group gets its own layout shell (different nav, different auth requirements).
- **`lib/engine/` pure functions:** Streak calculation, XP math, and achievement checking are pure logic with no DB dependency. This makes them testable, composable, and reusable across server actions and queries.
- **`lib/actions/` vs `lib/queries/`:** Strict read/write separation. Queries are called from Server Components for data loading. Actions are called from Client Components for mutations. Never mix.
- **`db/schema/` one file per resource:** Avoids the "one giant schema file" problem. Drizzle relations are separated into `relations.ts` to prevent circular imports between schema files.
- **`components/animations/`:** The pixel-art animations (XP float, streak pulse, level-up flash) are client-only and isolated. They wrap server-rendered content without blocking it.

## Architectural Patterns

### Pattern 1: Server Components for Data, Client Components for Interaction

**What:** Pages are Server Components that fetch data directly (no API layer needed). Interactive elements (quest completion, animations) are Client Components that call Server Actions for mutations.
**When to use:** Every page in this app. The home screen fetches today's quests, streak state, leaderboard data server-side, then hands interactive quest cards to client components.
**Trade-offs:** Minimal client JS bundle. But requires careful boundaries -- the quest card needs `"use client"` for the tap-to-complete interaction, while the list that renders them can stay server-side.

**Example:**
```typescript
// app/(game)/page.tsx — Server Component
import { getTodayQuests } from "@/lib/queries/habits";
import { getStreakState } from "@/lib/queries/streaks";
import { QuestCard } from "@/components/quest-card";
import { StreakBanner } from "@/components/streak-banner";

export default async function HomePage() {
  const [quests, streak] = await Promise.all([
    getTodayQuests(),
    getStreakState(),
  ]);
  return (
    <>
      <StreakBanner streak={streak} />
      {quests.map((q) => (
        <QuestCard key={q.id} quest={q} multiplier={streak.multiplier} />
      ))}
    </>
  );
}
```

### Pattern 2: Server Actions for All Mutations

**What:** Every state change (complete habit, send nudge, apply freeze) goes through a Server Action. No API routes needed for user-facing mutations. Server Actions handle validation, domain logic, DB write, and revalidation in one atomic flow.
**When to use:** All user interactions that modify data.
**Trade-offs:** Simpler than building REST endpoints. But Server Actions are sequential per user -- fine for this app's scale, problematic at thousands of concurrent mutations.

**Example:**
```typescript
// lib/actions/habits.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { habitLogs } from "@/db/schema/habit-logs";
import { calculateXP } from "@/lib/engine/xp";
import { checkAchievements } from "@/lib/engine/achievements";

export async function completeHabit(habitId: string) {
  const user = await requireAuth();
  const xpEarned = calculateXP(habit.xpBase, user.streakMultiplier);

  await db.transaction(async (tx) => {
    // 1. Log the completion
    await tx.insert(habitLogs).values({ userId: user.id, habitId, completedAt: new Date() });
    // 2. Award XP
    await tx.update(users).set({ totalXp: sql`total_xp + ${xpEarned}` }).where(eq(users.id, user.id));
    // 3. Check achievements (inside same transaction)
    const newAchievements = await checkAchievements(tx, user.id);
  });

  revalidatePath("/");
  return { xpEarned, newAchievements };
}
```

### Pattern 3: Pure Engine Functions for Domain Logic

**What:** Core game mechanics (streak calculation, XP math, level thresholds, achievement rules) live as pure functions with no DB access. They receive data, return results. The calling code handles persistence.
**When to use:** Any calculation that defines how the gamification works.
**Trade-offs:** Highly testable and portable. But requires the caller to fetch inputs and persist outputs, which adds a thin coordination layer.

**Example:**
```typescript
// lib/engine/streak.ts
export interface StreakState {
  currentStreak: number;
  multiplier: number;
  freezeAvailable: boolean;
  freezeUsedThisWeek: boolean;
}

export function calculateMultiplier(consecutiveWeeks: number): number {
  if (consecutiveWeeks >= 4) return 1.5;
  if (consecutiveWeeks >= 2) return 1.2;
  return 1.0;
}

export function evaluateStreak(
  lastCompletionDate: Date | null,
  today: Date,
  freezeAvailable: boolean
): { streakBroken: boolean; freezeConsumed: boolean } {
  if (!lastCompletionDate) return { streakBroken: true, freezeConsumed: false };
  const daysSince = diffDays(lastCompletionDate, today);
  if (daysSince <= 1) return { streakBroken: false, freezeConsumed: false };
  if (daysSince === 2 && freezeAvailable) return { streakBroken: false, freezeConsumed: true };
  return { streakBroken: true, freezeConsumed: false };
}
```

## Data Flow

### Request Flow (Page Load)

```
[User navigates to Home]
    |
[Next.js Server Component]
    |
[lib/queries/habits.ts]  ──> Drizzle query ──> Neon Postgres
[lib/queries/streaks.ts]  ──> Drizzle query ──> Neon Postgres
[lib/queries/leaderboard.ts] ──> Drizzle query ──> Neon Postgres
    |
[Parallel data fetch via Promise.all]
    |
[Server-rendered HTML with streak, quests, leaderboard]
    |
[Hydrate client components: QuestCard (interactive), Animations]
```

### Mutation Flow (Complete Habit)

```
[User taps quest checkbox]
    |
[Client Component calls Server Action]
    |
[lib/actions/habits.ts]
    |
    +---> [lib/engine/xp.ts] ──> Calculate XP (pure function)
    +---> [lib/engine/achievements.ts] ──> Check unlocks (pure function)
    |
[DB Transaction via Drizzle]
    +---> INSERT habit_logs (completion record)
    +---> UPDATE users SET total_xp = total_xp + earned
    +---> INSERT user_achievements (if newly unlocked)
    |
[revalidatePath("/")]
    |
[Server re-renders page with updated data]
    |
[Client receives: { xpEarned, newAchievements }]
    |
[Animation engine: XP float, possible level-up flash, achievement unlock]
```

### Daily Streak Evaluation Flow (Cron)

```
[Vercel Cron hits /api/cron/daily at midnight UTC]
    |
[For each user with active streak]
    |
    +---> [lib/engine/streak.ts] ──> evaluateStreak()
    |       |
    |       +---> Streak intact: no action
    |       +---> Streak at risk + freeze available: consume freeze
    |       +---> Streak broken: reset streak counter, reset multiplier
    |
[Batch UPDATE streaks table]
    |
[Monday? Reset weekly leaderboard XP to 0]
[Monday? Reset freeze availability for all users]
```

### Key Data Flows

1. **Habit Completion -> XP -> Level:** User completes habit -> Server Action calculates XP (base * multiplier) -> updates total XP -> if XP crosses level threshold, level increments -> client shows XP float animation + possible level-up flash.

2. **Daily Cron -> Streak Evaluation:** Midnight cron evaluates all users -> checks last completion date -> applies freeze or breaks streak -> updates streak counter and multiplier. This is the only process that can break a streak (not real-time, evaluated once daily).

3. **Leaderboard Aggregation:** Leaderboard is a read-time query: `SUM(xp_earned) WHERE completed_at >= start_of_week GROUP BY user_id ORDER BY sum DESC`. No separate leaderboard table needed at this scale -- computed on read.

4. **At-Risk Detection:** Coach dashboard queries: compare each user's habit completions in last 7 days vs prior 7 days. If current < 70% of prior, flag as at-risk. Computed on read, not stored.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is fine. Computed leaderboards, no caching needed. Neon serverless handles connection pooling. |
| 1k-100k users | Cache leaderboard results (recompute every 5 min, not per request). Add database indexes on `habit_logs(user_id, completed_at)` and `habit_logs(completed_at)`. Consider materialized weekly XP view. |
| 100k+ users | Move leaderboard to Redis sorted sets. Streak evaluation cron needs batching/queuing. Consider splitting read replicas for coach analytics queries. |

### Scaling Priorities

1. **First bottleneck: Leaderboard queries.** As user count grows, the `SUM/GROUP BY/ORDER BY` query for leaderboards gets expensive. Fix: add a `weekly_xp` column updated on each habit completion, then leaderboard is just `ORDER BY weekly_xp DESC LIMIT 20`.
2. **Second bottleneck: Streak cron at scale.** Evaluating every user's streak at midnight is O(n). Fix: only evaluate users who had a streak yesterday (skip users with no active streak). Index on `streaks.current_streak > 0`.

## Anti-Patterns

### Anti-Pattern 1: Real-Time Streak Breaking

**What people do:** Break the streak immediately when a day passes without a habit log, triggered by real-time checks.
**Why it's wrong:** Timezone issues make this a nightmare. A user in UTC-8 logs a habit at 11pm their time, but the server (UTC) thinks it's the next day. Results in false streak breaks and furious users.
**Do this instead:** Evaluate streaks once daily via cron, using the user's configured timezone or a generous grace period. Streaks are sacred -- false breaks destroy trust.

### Anti-Pattern 2: Storing Leaderboard Rankings

**What people do:** Maintain a separate `leaderboard` table with pre-computed rankings updated on every XP change.
**Why it's wrong:** At small scale, it's unnecessary complexity. At large scale, it creates write contention (every habit completion triggers a re-rank). The ranking is a derived view, not source data.
**Do this instead:** Compute rankings on read from the source `habit_logs` table (or a `weekly_xp` denormalized column). Use SQL `RANK() OVER (ORDER BY ...)` window function.

### Anti-Pattern 3: Fat Client State for Game Mechanics

**What people do:** Calculate XP, streaks, levels, and achievements on the client, then sync to the server.
**Why it's wrong:** Game state must be authoritative on the server. Client-side calculation enables cheating and creates sync bugs. If a user opens two tabs, client state diverges.
**Do this instead:** All game mechanics compute on the server (in Server Actions). The client only renders the result and plays animations. The "source of truth" is always the database.

### Anti-Pattern 4: One Giant Schema File

**What people do:** Define all Drizzle tables, relations, and types in a single `schema.ts` file.
**Why it's wrong:** Becomes unreadable quickly (this app has 8+ tables). Circular dependency issues when defining relations between tables in the same file.
**Do this instead:** One schema file per resource in `db/schema/`. Separate `relations.ts` file for all inter-table relations. This is Drizzle's own recommended pattern.

### Anti-Pattern 5: Using API Routes for Everything

**What people do:** Create REST API routes (`/api/habits/complete`, `/api/streaks`, etc.) and call them from the client with `fetch()`.
**Why it's wrong:** With Next.js App Router, this adds unnecessary indirection. Server Components can query the DB directly. Server Actions handle mutations with built-in revalidation. API routes are only needed for external consumers (cron jobs, webhooks).
**Do this instead:** Server Components for reads, Server Actions for writes. Reserve API routes for cron (`/api/cron/daily`) and any external integrations.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon Postgres | Drizzle `neon-http` driver via `@neondatabase/serverless` | Serverless-friendly, no persistent connections needed. Use connection string from `DATABASE_URL` env var. |
| Vercel Cron | `vercel.json` cron config -> `/api/cron/daily` route | Daily streak evaluation + weekly leaderboard reset. Secure with `CRON_SECRET` header check. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components <-> DB | Direct Drizzle queries via `lib/queries/` | No API layer in between. Queries run server-side only. |
| Client Components <-> Server | Server Actions via `lib/actions/` | Type-safe, no manual fetch. Return values drive client animations. |
| Engine functions <-> Actions | Direct function calls | Engine functions are pure -- actions call them, pass in data, persist results. |
| Cron <-> DB | API route calls engine functions + Drizzle | Same engine functions used by actions and cron (no logic duplication). |
| Auth <-> All routes | Middleware + `lib/auth.ts` | Cookie-based sessions. Middleware redirects unauthenticated users. `requireAuth()` helper in actions. |

## Database Schema Overview

```
users
  id, email, password_hash, display_name, role (user/coach)
  total_xp, level, created_at

habits (definitions, not per-user)
  id, name, icon, xp_base, frequency (daily/weekly), target_count

habit_logs (the core activity table)
  id, user_id, habit_id, completed_at, xp_earned
  INDEX: (user_id, completed_at), (completed_at)

streaks
  id, user_id, current_streak, longest_streak, streak_start_date
  multiplier, freeze_available, freeze_used_at, last_evaluated_at

achievements (definitions)
  id, name, description, icon, condition_type, condition_value

user_achievements
  id, user_id, achievement_id, unlocked_at

friendships
  id, user_id, friend_id, status (pending/accepted), created_at

challenges
  id, name, description, start_date, end_date, goal_type, goal_value

challenge_participants
  id, challenge_id, user_id, progress, joined_at

nudges
  id, from_user_id, to_user_id, message, sent_at, read_at
```

### Key Indexes

- `habit_logs(user_id, completed_at DESC)` -- streak evaluation, user history
- `habit_logs(completed_at)` -- daily cron batch processing
- `streaks(user_id)` UNIQUE -- one streak record per user
- `friendships(user_id, friend_id)` UNIQUE -- no duplicate friendships
- `user_achievements(user_id, achievement_id)` UNIQUE -- no duplicate unlocks

## Build Order (Dependencies)

The architecture implies this build sequence:

1. **Database schema + auth** -- Everything depends on users and the DB connection
2. **Habit definitions + logging** -- Core loop: define habits, log completions
3. **Streak engine + XP engine** -- Depends on habit logs existing
4. **Home screen (quest board)** -- Depends on habits, streaks, XP
5. **Achievement system** -- Depends on habit logs + streak data for rule checking
6. **Social layer (friends + leaderboard)** -- Depends on users + XP data
7. **Coach dashboard** -- Depends on all user data being available
8. **Cron jobs (daily streak eval, weekly reset)** -- Depends on streak engine
9. **Demo data seeding** -- Depends on complete schema
10. **Animations + polish** -- Depends on all functional components existing

## Sources

- [Gamification Architecture: Technical Considerations And Best Practices](https://smartico.ai/gamification-architecture-best-practices/) -- gamification system component patterns
- [Leaderboard System Design](https://systemdesign.one/leaderboard-system-design/) -- leaderboard architecture and scaling
- [Drizzle ORM - Todo App with Neon Postgres](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) -- official Drizzle + Neon + Next.js patterns
- [Next.js App Router: The Patterns That Actually Matter in 2026](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146) -- current App Router patterns
- [Next.js Architecture in 2026 -- Server-First, Client-Islands](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router) -- project structure patterns

---
*Architecture research for: StreakEngine -- Habit & Health Gamification Platform*
*Researched: 2026-03-30*
