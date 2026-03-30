# Phase 3: Social & Achievements - Research

**Researched:** 2026-03-30
**Domain:** Social features, achievement systems, leaderboards, profile character sheet
**Confidence:** HIGH

## Summary

Phase 3 builds four interconnected feature areas on top of the established Phase 2 codebase: weekly leaderboard (home peek + full /quests page), achievement system with unlock triggers and celebration animations, friends list with nudge mechanic, and a profile character sheet with RPG stat block. All DB schemas (achievements, userAchievements, friendships, challenges, challengeParticipants) already exist and are properly related in `src/db/relations.ts`. The existing code patterns (server actions with `requireAuth()`, Drizzle queries, Motion v12 animations, PixelCard components) provide clear templates for all new features.

The primary technical challenge is the achievement unlock evaluation -- it must run server-side after each habit completion, check multiple trigger conditions (streak milestones, time-based, social counts), and return newly unlocked IDs so the client can display celebration animations. The leaderboard requires a weekly XP aggregation query filtered by Monday-Sunday date range (reusing `getWeekBounds()` from utils). The nudges table is the only new schema needed beyond what exists.

**Primary recommendation:** Extend the existing `completeHabit`/`incrementProgress` server actions to also evaluate achievement triggers and return unlock results, keeping the single request-response cycle intact for immediate celebration feedback.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Leaderboard: compact top-3 peek on home page below quest board, full leaderboard on /quests page
- Top 3 get trophy icons: icon-trophy-gold.svg (#1), icon-trophy-silver.svg (#2), icon-trophy-bronze.svg (#3)
- icon-crown.svg displayed next to #1 rank name
- Current user's row highlighted with --color-primary 4px left border
- Weekly reset via date comparison (not cron) -- query filters by current week Monday-Sunday range
- 4 pre-defined achievements: First Week (7-day streak), Streak Master (30-day streak), Early Bird (habit before 7am), Social Butterfly (5 friends)
- Achievement grid: 3-column layout using badge-frame.svg as container
- Locked: dark square with icon-lock.svg overlay, "?" text; Unlocked: full color with Silkscreen name
- Unlock triggers evaluated server-side after each habit completion
- Achievement celebration: scale 0->1.1->1.0 over 400ms, 4-6 pixel sparkle particles, --color-secondary glow border 1s
- Friends list on /friends page, each friend as PixelCard row with display name, streak, level, last active
- Nudge: in-app only, stored in nudges table, one per friend per day, fixed text "Hey! You haven't logged today!"
- Nudge appears as toast notification when recipient opens app
- Profile layout: avatar area (hero-levelup.png background) -> RPG stat block -> achievement grid -> habit XP breakdown
- RPG stats: STR=Exercise XP%, INT=Meditation XP%, DEX=Water consistency%, CHA=Social actions count
- Stats as pixel bar charts; habit XP breakdown as horizontal pixel bars

### Claude's Discretion
- Exact nudge notification implementation (toast vs inline banner)
- Loading states for leaderboard and friends list
- Empty state designs (use empty-friends.svg, empty-quests.svg)
- Stat bar animation on profile load
- How to structure nudges DB table

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LDBD-01 | Weekly leaderboard on home screen (compact peek) | Aggregation query on habit_logs.xp_earned filtered by week bounds; compact 3-row component below QuestBoard |
| LDBD-02 | Leaderboard shows rank, username, weekly XP | Drizzle SQL sum + rank query joining users and habit_logs; friend filter via friendships table |
| LDBD-03 | Top 3 users get trophy icons (gold/silver/bronze) | Conditional rendering of icon-trophy-{gold,silver,bronze}.svg based on rank index |
| LDBD-04 | Current user's row is highlighted | Compare row userId to session userId; apply border-l-4 border-primary style |
| LDBD-05 | Leaderboard resets every Monday | getWeekBounds(today) from utils.ts provides Monday-Sunday range for query filter |
| ACHV-01 | Achievement grid on profile (square badges) | 3-column CSS grid of badge-frame.svg containers; query userAchievements joined with achievements |
| ACHV-02 | Locked achievements show as dark squares with "?" | Filter all achievements vs user's unlocked; render locked with icon-lock.svg overlay |
| ACHV-03 | Achievements unlock on specific triggers | Server-side evaluation engine: checkAchievements() called after habit completion |
| ACHV-04 | Achievement unlock triggers celebration animation | Motion v12 scale + particle animation; server action returns newlyUnlocked IDs |
| ACHV-05 | Pre-defined achievements: First Week, Streak Master, Early Bird, Social Butterfly | Seed 4 rows in achievements table; trigger logic in engine function |
| SOCL-01 | User can view friends list | /friends page server component; query friendships joined with users and streaks |
| SOCL-02 | User can see friends' streak and level | Join friendships -> users (level, totalXp) + streaks (currentStreak) |
| SOCL-03 | User can send nudge to friend | Server action: insert into nudges table with rate limit (1/friend/day via unique index) |
| SOCL-04 | Weekly challenge shows progress with blocky progress blocks | Query challengeParticipants joined with users for active challenge; reuse progress block pattern from QuestCard |
| PROF-01 | Character sheet with level, total XP, streak history | /profile page; user data + streak data queries; hero-levelup.png background header |
| PROF-02 | RPG stat block display (STR, INT, DEX, CHA) | Aggregate habit_logs by habit type for XP percentages; water consistency from daily completion ratio |
| PROF-03 | Achievement grid (3 columns of square badges) | Reuse achievement grid component from ACHV-01/ACHV-02 |
| PROF-04 | Habit XP breakdown | Aggregate habit_logs.xp_earned grouped by habit.name; horizontal pixel bars |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App framework | Already in use |
| react | 19.2.4 | UI | Already in use |
| drizzle-orm | 0.45.2 | Database ORM | Already in use, schemas defined |
| motion | 12.38.0 | Animations (sparkle, celebration) | Already in use for XP float, done stamp |
| iron-session | 8.0.4 | Auth sessions | Already in use via requireAuth() |
| date-fns | 4.1.0 | Date math (week bounds) | Already in use in utils.ts |
| clsx | 2.1.1 | Conditional classes | Already in use |

### Supporting
No additional packages needed. All Phase 3 features are implementable with the existing stack.

## Architecture Patterns

### New Files Structure
```
src/
  lib/
    engine/
      achievements.ts       # Pure function: checkAchievements() trigger evaluation
    queries/
      leaderboard.ts        # Weekly XP aggregation + friend ranking queries
      friends.ts            # Friends list, friend stats queries
      achievements.ts       # User achievements, all achievements queries
      profile.ts            # Profile data: RPG stats, habit XP breakdown
      challenges.ts         # Active challenge + participant progress
    actions/
      social.ts             # Server actions: sendNudge
      achievements.ts       # Server action: evaluateAndUnlockAchievements (called from habit actions)
  components/
    leaderboard-peek.tsx    # Home page compact 3-row leaderboard (client)
    leaderboard-full.tsx    # Full leaderboard for /quests page (client)
    friend-row.tsx          # Single friend PixelCard row with nudge button (client)
    friends-list.tsx        # Friends list container (client)
    achievement-grid.tsx    # 3-column badge grid (client, used on profile + after unlock)
    achievement-unlock.tsx  # Celebration animation component (client)
    rpg-stat-block.tsx      # STR/INT/DEX/CHA pixel bar chart (client)
    habit-xp-breakdown.tsx  # Horizontal bars per habit type (client)
    challenge-progress.tsx  # Weekly challenge card with participant blocks (client)
    nudge-toast.tsx         # Toast notification for received nudges (client)
  db/
    schema/
      nudges.ts             # New table: nudges (only new schema)
  app/
    (game)/
      page.tsx              # MODIFY: add leaderboard peek + challenge section
      friends/page.tsx      # REPLACE: full friends list
      profile/page.tsx      # REPLACE: character sheet
      quests/page.tsx       # REPLACE: full leaderboard + quest management
```

### Pattern 1: Weekly XP Leaderboard Query
**What:** Aggregate habit_logs.xp_earned for the current week, filtered to friends only
**When to use:** Home page peek and /quests full leaderboard
**Example:**
```typescript
// src/lib/queries/leaderboard.ts
import { db } from "@/db";
import { habitLogs, friendships, users } from "@/db/schema";
import { eq, and, gte, lte, sql, or } from "drizzle-orm";
import { getWeekBounds, getTodayForUser } from "@/lib/utils";

export async function getWeeklyLeaderboard(userId: number, timezone: string) {
  const today = getTodayForUser(timezone);
  const { start, end } = getWeekBounds(today);

  // Get friend IDs + self
  const friendRows = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(eq(friendships.userId, userId));

  const participantIds = [userId, ...friendRows.map(r => r.friendId)];

  // Aggregate weekly XP per participant
  const rows = await db
    .select({
      userId: habitLogs.userId,
      displayName: users.displayName,
      weeklyXp: sql<number>`coalesce(sum(${habitLogs.xpEarned}), 0)`.as("weekly_xp"),
    })
    .from(habitLogs)
    .innerJoin(users, eq(users.id, habitLogs.userId))
    .where(
      and(
        sql`${habitLogs.userId} = ANY(${participantIds})`,
        gte(habitLogs.date, start),
        lte(habitLogs.date, end),
      )
    )
    .groupBy(habitLogs.userId, users.displayName)
    .orderBy(sql`weekly_xp DESC`);

  return rows.map((row, i) => ({
    rank: i + 1,
    userId: row.userId,
    displayName: row.displayName,
    weeklyXp: Number(row.weeklyXp),
    isCurrentUser: row.userId === userId,
  }));
}
```

### Pattern 2: Achievement Trigger Evaluation (Pure Engine Function)
**What:** Check all achievement conditions after a habit completion
**When to use:** Called from server actions after habit/streak updates
**Example:**
```typescript
// src/lib/engine/achievements.ts
export interface AchievementCheck {
  achievementId: number;
  trigger: string;
  alreadyUnlocked: boolean;
}

export interface AchievementContext {
  currentStreak: number;
  completedAt: Date; // for Early Bird check (hour < 7)
  friendCount: number;
}

export function evaluateAchievements(
  checks: AchievementCheck[],
  ctx: AchievementContext,
): number[] {
  const newlyUnlocked: number[] = [];

  for (const check of checks) {
    if (check.alreadyUnlocked) continue;

    switch (check.trigger) {
      case "streak_7":
        if (ctx.currentStreak >= 7) newlyUnlocked.push(check.achievementId);
        break;
      case "streak_30":
        if (ctx.currentStreak >= 30) newlyUnlocked.push(check.achievementId);
        break;
      case "early_bird":
        if (ctx.completedAt.getHours() < 7) newlyUnlocked.push(check.achievementId);
        break;
      case "social_5_friends":
        if (ctx.friendCount >= 5) newlyUnlocked.push(check.achievementId);
        break;
    }
  }

  return newlyUnlocked;
}
```

### Pattern 3: Nudges Table Design
**What:** New schema for in-app nudge notifications
**When to use:** Nudge send/receive
**Example:**
```typescript
// src/db/schema/nudges.ts
import { pgTable, serial, integer, varchar, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const nudges = pgTable("nudges", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD for rate limiting
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("nudges_sender_recipient_date_idx").on(
    table.senderId, table.recipientId, table.date
  ),
]);
```

### Pattern 4: Achievement Celebration Animation
**What:** Motion v12 scale + sparkle particles on unlock
**When to use:** When server action returns newlyUnlocked achievement IDs
**Example:**
```typescript
// Follows existing Motion v12 patterns from animations/ directory
// Scale: initial={scale:0} -> animate={scale:1.1} -> animate={scale:1.0}
// Particles: 4-6 small colored divs animated outward with random angles
// Glow: box-shadow with --color-secondary for 1s then fade

<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: [0, 1.1, 1.0] }}
  transition={{ duration: 0.4, times: [0, 0.7, 1] }}
>
  {/* badge content */}
</motion.div>
```

### Anti-Patterns to Avoid
- **Real-time WebSocket for nudges:** Nudges are checked on page load, not pushed in real-time. No WebSocket needed.
- **Client-side achievement evaluation:** Triggers MUST be server-side to prevent manipulation. Client only handles display.
- **Cron-based leaderboard reset:** No cron needed. The query itself filters by current week bounds.
- **Separate API route for achievement checks:** Use server actions, not API routes. Keep the pattern consistent with Phase 2.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date/week calculations | Manual ISO week math | `date-fns` startOfWeek/endOfWeek + existing `getWeekBounds()` | Edge cases with year boundaries, locale-aware week starts |
| Nudge rate limiting | Application-level checks | Postgres unique index (sender, recipient, date) + `onConflictDoNothing` | Race-condition safe, zero extra queries |
| Achievement trigger timing | Separate background job | Inline check in existing server actions | Keeps single request-response; achievements are cheap checks |
| Sparkle particle positions | Manual pixel math | Motion v12 staggerChildren + random initial positions | Handles cleanup, unmounting, and re-triggering |

## Common Pitfalls

### Pitfall 1: Leaderboard Shows Zero for Users with No Logs This Week
**What goes wrong:** Users who haven't logged any habits this week don't appear in the leaderboard at all (LEFT JOIN returns null, or they're excluded by INNER JOIN).
**Why it happens:** The aggregation query only returns users with habit_logs rows in the date range.
**How to avoid:** Start from the friends list (+ self), then LEFT JOIN to habit_logs. Use COALESCE for zero XP. Alternatively, union the participant list with the aggregation to ensure all friends appear.
**Warning signs:** New users or inactive friends missing from the leaderboard.

### Pitfall 2: Achievement Double-Unlock
**What goes wrong:** Same achievement is unlocked multiple times if two habit completions happen in quick succession.
**Why it happens:** Race condition between check and insert.
**How to avoid:** Add a unique index on (user_id, achievement_id) in user_achievements table and use `onConflictDoNothing`. Same pattern used for habit_logs double-click handling.
**Warning signs:** Duplicate rows in user_achievements.

### Pitfall 3: Early Bird Achievement Timezone Mismatch
**What goes wrong:** "Early Bird" (habit before 7am) is evaluated using server time (UTC) instead of user's local timezone.
**Why it happens:** `completedAt` timestamp stored as UTC; comparing `.getHours()` checks UTC hours.
**How to avoid:** Convert the server timestamp to the user's timezone before checking the hour. Use `Intl.DateTimeFormat` with the user's timezone to get local hour.
**Warning signs:** Users in UTC+ timezones unlocking Early Bird at wrong times.

### Pitfall 4: Friend Relationship Directionality
**What goes wrong:** Friendships table has (userId, friendId) but queries only check one direction, missing the reverse relationship.
**Why it happens:** The existing schema stores one-directional rows. If user A adds user B, only (A, B) exists, not (B, A).
**How to avoid:** Either insert both directions on friendship creation (A->B and B->A), or query with OR condition: `WHERE (userId = X AND friendId = Y) OR (userId = Y AND friendId = X)`. The bidirectional insert is simpler for queries.
**Warning signs:** User B doesn't see User A in their friends list.

### Pitfall 5: RPG Stats Division by Zero
**What goes wrong:** New users with 0 total XP cause division by zero when calculating XP percentages for STR/INT.
**Why it happens:** STR = exercise_xp / total_xp * 100.
**How to avoid:** Guard with `totalXp > 0 ? (typeXp / totalXp * 100) : 0`. Same for DEX (water consistency with zero total days).
**Warning signs:** NaN or Infinity in stat display for new users.

## Code Examples

### Nudge Server Action
```typescript
// src/lib/actions/social.ts
"use server";

import { db } from "@/db";
import { nudges } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getTodayForUser } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export async function sendNudge(friendId: number): Promise<{ sent: boolean }> {
  const session = await requireAuth();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  if (!user) throw new Error("User not found");

  const today = getTodayForUser(user.timezone);

  const inserted = await db
    .insert(nudges)
    .values({
      senderId: session.userId,
      recipientId: friendId,
      date: today,
    })
    .onConflictDoNothing()
    .returning({ id: nudges.id });

  return { sent: inserted.length > 0 };
}
```

### Profile RPG Stats Query
```typescript
// src/lib/queries/profile.ts
import { db } from "@/db";
import { habitLogs, habits, friendships, nudges } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getRPGStats(userId: number) {
  // XP by habit type
  const xpByHabit = await db
    .select({
      habitName: habits.name,
      habitIcon: habits.icon,
      totalXp: sql<number>`coalesce(sum(${habitLogs.xpEarned}), 0)`.as("total_xp"),
    })
    .from(habitLogs)
    .innerJoin(habits, eq(habits.id, habitLogs.habitId))
    .where(eq(habitLogs.userId, userId))
    .groupBy(habits.name, habits.icon);

  // Friend count for CHA
  const friendCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendships)
    .where(eq(friendships.userId, userId));

  // Nudges sent count for CHA
  const nudgeCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(nudges)
    .where(eq(nudges.senderId, userId));

  return { xpByHabit, friendCount: Number(friendCount[0]?.count ?? 0), nudgeCount: Number(nudgeCount[0]?.count ?? 0) };
}
```

### Integration: Achievement Check in Habit Completion
```typescript
// After XP award and streak update in completeHabit():
// 1. Fetch all achievements + user's unlocked set
// 2. Call evaluateAchievements() pure function
// 3. Bulk insert newly unlocked into user_achievements
// 4. Return newlyUnlocked IDs in the response
// This adds ~2 queries to the existing action (acceptable for the reward feedback loop)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API routes for mutations | Server actions with "use server" | Next.js 14+ (stable) | All mutations use server actions, consistent with Phase 2 |
| framer-motion import | motion/react import | Motion v12 | Import from "motion/react", not "framer-motion" |
| Separate animation library | Motion v12 built-in | Current | AnimatePresence + motion.div for all animations |

## Open Questions

1. **Bidirectional friendships: dual rows or OR queries?**
   - What we know: Schema has one-directional (userId -> friendId). Demo data will seed friendships.
   - What's unclear: Whether to seed both directions or handle in query logic.
   - Recommendation: Seed both directions (A->B and B->A). Simpler queries, clearer data model. Costs one extra row per friendship.

2. **Achievement evaluation in existing actions vs. separate action call?**
   - What we know: CONTEXT.md says "evaluated server-side after each habit completion"
   - What's unclear: Whether to add the check inline to completeHabit/incrementProgress or have the client call a second server action after completion.
   - Recommendation: Inline in the existing actions. One round-trip is better UX, and the check is lightweight (fetch 4 achievements + user's unlocked set, run pure function). Return `newlyUnlocked: number[]` in the response.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet configured (Next.js project, no test runner detected) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LDBD-05 | Weekly reset via date filtering | unit | `npx vitest run tests/leaderboard.test.ts -t "week bounds"` | Wave 0 |
| ACHV-03 | Achievement trigger evaluation | unit | `npx vitest run tests/achievements.test.ts -t "evaluate"` | Wave 0 |
| ACHV-05 | 4 pre-defined achievement triggers | unit | `npx vitest run tests/achievements.test.ts -t "triggers"` | Wave 0 |
| SOCL-03 | Nudge rate limit (1/friend/day) | unit | `npx vitest run tests/nudge.test.ts -t "rate limit"` | Wave 0 |
| PROF-02 | RPG stat calculation | unit | `npx vitest run tests/rpg-stats.test.ts -t "stats"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx next build` (type check + build verification)
- **Per wave merge:** `npx next build` + manual smoke test
- **Phase gate:** Full build green before verify

### Wave 0 Gaps
- [ ] `vitest` not installed -- would need `npm install -D vitest` if unit tests required
- [ ] No test config exists -- would need `vitest.config.ts`
- [ ] Achievement engine function is pure and highly testable -- Wave 0 candidate
- Note: Given this is a demo/build project with `mode: "yolo"`, validation is primarily via `next build` type checking and visual smoke testing rather than a full test suite.

## Sources

### Primary (HIGH confidence)
- Existing codebase: All schemas, patterns, components examined directly
- `src/lib/engine/xp.ts`, `src/lib/engine/streak.ts` -- pure function patterns to follow
- `src/lib/actions/habits.ts` -- server action pattern with requireAuth(), onConflictDoNothing
- `src/lib/queries/habits.ts` -- Drizzle query pattern with joins
- `src/lib/utils.ts` -- getWeekBounds() already implements Monday-Sunday range
- `src/components/animations/xp-float.tsx` -- Motion v12 AnimatePresence pattern
- `package.json` -- confirmed versions: motion 12.38.0, drizzle-orm 0.45.2, date-fns 4.1.0, next 16.2.1

### Secondary (MEDIUM confidence)
- Motion v12 animation patterns (scale, stagger) based on existing usage in codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- clear patterns from Phase 1/2 to extend
- Pitfalls: HIGH -- identified from code review (timezone, directionality, race conditions)
- Achievement engine: HIGH -- pure function pattern matches existing streak.ts

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable stack, no external dependencies changing)
