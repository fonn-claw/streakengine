# Phase 2: Core Game Loop - Research

**Researched:** 2026-03-30
**Domain:** Gamification engine (streak tracking, XP/leveling, quest completion), Next.js server actions + Motion animations
**Confidence:** HIGH

## Summary

Phase 2 builds the daily engagement loop: users see habits as quest cards, complete them with one tap, earn XP (weighted by habit type, boosted by streak multiplier), watch their streak counter grow, and level up. This is the core value delivery -- everything else in the app exists to make this loop more meaningful.

The existing codebase provides a solid foundation. All database tables are defined (`habits`, `habit_logs`, `streaks`, `users` with XP/level/timezone columns). The pixel-art design system is in place (CSS tokens, PixelCard, PixelButton, nav components). What's missing is the entire game logic layer (`lib/engine/`, `lib/queries/`, `lib/actions/habits.ts`) and the UI components (StreakBanner, QuestCard, XP bar, animations).

Key architectural concern: habits are global (no userId on the habits table), meaning all players share the same 4 habit definitions. This is correct for a "Vitality" app where everyone tracks the same wellness habits. The `habit_logs` table connects users to habits with a `date` varchar column for timezone-safe daily tracking and a `progress` integer for partial-completion habits like water intake.

**Primary recommendation:** Build bottom-up: pure engine functions first (XP math, streak logic, level thresholds), then server actions that orchestrate DB reads + engine calls + DB writes in transactions, then the UI components wired to those actions with optimistic updates and Motion animations.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single click on checkbox area triggers completion -- no confirmation dialog
- Instant visual feedback: checkbox fills green (0ms) -> DONE stamp (100ms) -> XP float (600ms) -> hero XP bar updates
- Partial-progress habits (e.g., water 3/8): each increment is a separate tap (+1), shows inline pixel progress blocks, XP awarded only when daily target is reached
- No undo -- once completed, done for the day
- Quest card ordering: incomplete first sorted by XP value (highest reward first), then completed quests below
- XP per habit type: Exercise=50, Meditation=30, Water (full target)=20, Sleep=40
- Streak multiplier applies on top of base XP: earned = base * multiplier
- Level threshold formula: Level N requires cumulative XP of sum(i=1 to N) of (i*100 + (i-1)*50)
- Server-side streak evaluation based on user timezone
- Streak increments when user completes at least 1 habit in a calendar day (user's timezone)
- Streak freeze: automatic -- if user misses a day and has a freeze available, auto-applied silently. 1 freeze per week, resets Monday.
- Streak multiplier: tracks consecutive complete weeks (Mon-Sun). Week 1=1x, Week 2=1.2x, Week 3=1.3x, Week 4+=1.5x (cap).
- All 4 animations locked per DESIGN-SPEC.md: XP Float, Streak Pulse, Level Up Flash, Quest Complete Stamp
- Hero Banner layout locked: flame icon, streak count 32px, multiplier badge, segmented XP bar, level/XP numbers, freeze indicator
- Use Motion (framer-motion) v12 for all animations -- already in package.json

### Claude's Discretion
- Exact server action implementation pattern for habit completion
- Database query optimization for streak calculation
- Error handling for concurrent completions
- Loading states between server action calls
- How to structure the game engine logic (pure functions vs server actions)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HBIT-01 | User sees today's habits as quest cards on home screen | QuestCard component + getTodayQuests query; habits are global, join with habit_logs to get today's completion status |
| HBIT-02 | User can complete a habit with one click (inline, no modal) | completeHabit server action; optimistic UI via useOptimistic or useTransition |
| HBIT-03 | Completing a habit awards XP based on habit type | Engine function: calculateXP(baseXP, multiplier); server action updates users.totalXp in transaction |
| HBIT-04 | Partial-progress habits show inline progress blocks | habit_logs.progress column tracks increments; QuestCard renders pixel blocks for progress |
| HBIT-05 | Completed quests show pixel "DONE" stamp animation | Motion AnimatePresence for stamp overlay; Quest Complete Stamp animation spec from DESIGN-SPEC |
| STRK-01 | User sees prominent streak counter with flame icon at top of home screen | StreakBanner component; getStreakState query reads streaks table |
| STRK-02 | Streak increments daily when user completes at least one habit | evaluateStreak in completeHabit action -- check if this is first completion today, increment streak if so |
| STRK-03 | Streak breaks if user misses an entire day | On login/page load: compare lastActiveDate to today (user timezone); if gap > 1 day and no freeze, break streak |
| STRK-04 | Streak freeze: 1 free freeze per week auto-applied on missed day | Freeze logic in streak evaluation; streaks.freezeAvailable + freezesUsedThisWeek columns exist |
| STRK-05 | Streak multiplier increases with consecutive weeks | calculateMultiplier pure function; streaks.multiplier column stores current value |
| STRK-06 | Streak flame pulses when active, stops when at risk | Motion animate on streak flame img; conditional based on streak state |
| XPLV-01 | User earns XP for each completed habit (weighted by habit type) | habits.xpReward column has per-habit values; set Exercise=50, Meditation=30, Water=20, Sleep=40 |
| XPLV-02 | XP progress bar shows progress toward next level (blocky/segmented) | XPBar component with segmented blocks; calculateLevelProgress engine function |
| XPLV-03 | Level-up triggers flash animation and "LEVEL UP!" text | Level Up Flash animation via Motion; detect level change in server action return value |
| XPLV-04 | XP float animation (+50 XP) appears on quest completion | XP Float animation component; triggered by server action response |
| XPLV-05 | Streak multiplier applies to all XP earned | Applied in calculateXP: earned = base * multiplier; multiplier from streaks table |

</phase_requirements>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | Full-stack framework | Already installed. App Router, server actions, RSC. |
| react | 19.2.4 | UI rendering | Already installed. useOptimistic for instant quest feedback. |
| drizzle-orm | 0.45.2 | Database queries | Already installed. Type-safe SQL for habit queries and streak updates. |
| motion | 12.38.0 | Animations | Already installed. All 4 signature animations require AnimatePresence and spring physics. Import from `motion/react`. |
| date-fns | 4.1.0 | Date manipulation | Already installed. Streak day diff, start-of-week for multiplier, timezone-aware date strings. |
| zod | 3.25.76 | Input validation | Already installed. Validate habit completion action inputs. |
| clsx | 2.1.1 | Conditional classnames | Already installed. Toggle quest card states, active/completed styling. |

### No New Dependencies Needed

All libraries required for Phase 2 are already in package.json. No additional packages to install.

## Architecture Patterns

### Recommended Project Structure (new files for Phase 2)

```
src/
├── lib/
│   ├── engine/              # Pure domain logic (NEW)
│   │   ├── xp.ts            # XP calculation, level thresholds
│   │   └── streak.ts        # Streak evaluation, freeze logic, multiplier
│   ├── queries/             # Data fetching (NEW)
│   │   ├── habits.ts        # Today's quests with completion status
│   │   └── streaks.ts       # Current streak state for user
│   └── actions/
│       └── habits.ts        # completeHabit, incrementProgress (NEW)
├── components/
│   ├── streak-banner.tsx    # Hero banner (NEW)
│   ├── quest-card.tsx       # Individual quest item (NEW)
│   ├── xp-bar.tsx           # Segmented XP progress bar (NEW)
│   └── animations/          # Animation wrappers (NEW)
│       ├── xp-float.tsx     # +XP floating text
│       ├── streak-pulse.tsx # Flame pulse animation
│       ├── level-up.tsx     # Level up flash
│       └── done-stamp.tsx   # Quest complete stamp
└── app/(game)/
    └── page.tsx             # Rewired from placeholder to quest board
```

### Pattern 1: Pure Engine Functions (lib/engine/)

**What:** All game math lives as pure functions with zero DB access. They receive data, return computed results.
**When to use:** XP calculation, level threshold lookup, streak evaluation, multiplier computation.
**Why:** Testable without DB, reusable across server actions and cron jobs, no side effects.

```typescript
// lib/engine/xp.ts
export function calculateXP(baseXP: number, multiplier: number): number {
  return Math.round(baseXP * multiplier);
}

// Level N requires cumulative XP: sum(i=1..N) of (i*100 + (i-1)*50)
export function xpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += i * 100 + (i - 1) * 50;
  }
  return total;
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

export function getLevelProgress(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressXP: number;
} {
  const level = getLevelFromXP(totalXP);
  const currentThreshold = xpForLevel(level);
  const nextThreshold = xpForLevel(level + 1);
  return {
    level,
    currentLevelXP: currentThreshold,
    nextLevelXP: nextThreshold,
    progressXP: totalXP - currentThreshold,
  };
}
```

### Pattern 2: Server Actions with Transaction + Return Value

**What:** Server actions validate input, run engine functions, execute DB writes in a transaction, revalidate the path, and return a result object that the client uses to trigger animations.
**When to use:** Every mutation (completeHabit, incrementProgress).

```typescript
// lib/actions/habits.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { habitLogs, users, streaks } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { calculateXP, getLevelFromXP } from "@/lib/engine/xp";

export async function completeHabit(habitId: number) {
  const session = await requireAuth();

  // Get user's streak for multiplier
  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, session.userId),
  });

  const habit = await db.query.habits.findFirst({
    where: eq(habits.id, habitId),
  });

  if (!habit) throw new Error("Habit not found");

  const multiplier = streak?.multiplier ?? 1.0;
  const xpEarned = calculateXP(habit.xpReward, multiplier);
  const previousLevel = getLevelFromXP(user.totalXp);

  // Transaction: log + award XP + update streak
  const result = await db.transaction(async (tx) => {
    // Insert habit log
    await tx.insert(habitLogs).values({
      userId: session.userId,
      habitId,
      date: getTodayDateString(user.timezone),
      xpEarned,
    });

    // Award XP
    const [updated] = await tx
      .update(users)
      .set({ totalXp: sql`total_xp + ${xpEarned}` })
      .where(eq(users.id, session.userId))
      .returning({ totalXp: users.totalXp });

    // Update streak if first completion today
    // ... streak increment logic

    return { newTotalXP: updated.totalXp };
  });

  const newLevel = getLevelFromXP(result.newTotalXP);
  const leveledUp = newLevel > previousLevel;

  revalidatePath("/");
  return { xpEarned, leveledUp, newLevel };
}
```

### Pattern 3: Server Component Page + Client Islands

**What:** The home page is a Server Component that fetches all data. Interactive elements (QuestCard, animations) are "use client" components receiving data as props.
**When to use:** The quest board home page.

```typescript
// app/(game)/page.tsx -- Server Component
export default async function HomePage() {
  const session = await requireAuth();
  const [quests, streakState] = await Promise.all([
    getTodayQuests(session.userId),
    getStreakState(session.userId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <StreakBanner streak={streakState} />
      <QuestBoard quests={quests} multiplier={streakState.multiplier} />
    </div>
  );
}
```

### Pattern 4: Optimistic UI for Quest Completion

**What:** Use React 19's useOptimistic or useTransition to show instant completion feedback before the server responds.
**Why:** The CONTEXT.md demands "instant visual feedback: checkbox fills green (0ms)". We cannot wait for a server round-trip.

```typescript
// components/quest-card.tsx (client component)
"use client";

import { useTransition } from "react";
import { completeHabit } from "@/lib/actions/habits";

export function QuestCard({ quest, multiplier }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);

  function handleComplete() {
    // Optimistic: immediately show completed state
    startTransition(async () => {
      const res = await completeHabit(quest.id);
      setResult(res); // triggers XP float animation
    });
  }
  // ...
}
```

### Anti-Patterns to Avoid

- **Client-side XP/streak calculation:** All game math is authoritative on the server. Client only renders results and plays animations.
- **Polling for streak updates:** Streak state is fetched on page load (RSC). No need for real-time subscriptions or polling.
- **Smooth progress bars:** XP bar MUST be blocky/segmented per design spec. Do not use CSS transitions on width.
- **Confirmation dialogs on quest completion:** Explicitly prohibited. Single tap = done.
- **Undo functionality:** Explicitly prohibited. Once completed, done for the day.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mount/unmount animations | CSS keyframe + display toggle | Motion AnimatePresence | XP float needs exit animation (fade while floating up). CSS alone cannot animate elements being removed from DOM. |
| Date string in user timezone | Manual UTC offset math | date-fns `formatInTimeZone` or construct date string using Intl.DateTimeFormat | Timezone math is error-prone. Off-by-one on day boundaries causes false streak breaks. |
| Level-from-XP lookup | Linear search every render | Pre-computed lookup or memoized function | The formula is deterministic. Calculate once, cache result. |
| Concurrent completion guard | Custom locking | Drizzle unique constraint on (userId, habitId, date) | Database-level constraint prevents double-completion even with race conditions. |

**Key insight:** The "date" varchar column on habit_logs is the timezone-safe mechanism. Convert the user's current time to their timezone, format as YYYY-MM-DD, and use that as the date. All queries filter by this string, never by timestamp comparison.

## Common Pitfalls

### Pitfall 1: Timezone-Incorrect Day Boundaries
**What goes wrong:** Using `new Date()` server-side (UTC) to determine "today" for a user in UTC-8. A habit completed at 11pm PST shows as tomorrow's completion.
**Why it happens:** Server runs in UTC. User's "today" depends on their timezone setting.
**How to avoid:** Always derive the date string using the user's timezone column. Use `Intl.DateTimeFormat` with the user's timezone to format a YYYY-MM-DD string.
**Warning signs:** Streaks breaking unexpectedly for users not in UTC. Habits appearing on wrong day.

```typescript
function getTodayForUser(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  // Returns "2026-03-30" format
}
```

### Pitfall 2: Double Completion Race Condition
**What goes wrong:** User double-clicks the complete button, two server actions fire, two habit_logs rows inserted, XP doubled.
**Why it happens:** No unique constraint and no client-side debounce.
**How to avoid:** Add a unique index on `habit_logs(user_id, habit_id, date)` for single-completion habits. For partial-progress habits (water), use upsert pattern. Also disable the button client-side after first click.
**Warning signs:** Duplicate habit_log rows for same user/habit/date.

### Pitfall 3: Streak Increment on Every Completion
**What goes wrong:** User completes 4 habits in a day, streak increments by 4 instead of 1.
**Why it happens:** Streak increment logic runs on every completeHabit call without checking if it's the first completion today.
**How to avoid:** In the completeHabit action, check if any habit_logs exist for this user + today's date BEFORE inserting. If none exist, this is the first completion today -> increment streak. If logs already exist, skip streak update.

### Pitfall 4: Level Threshold Formula Off-by-One
**What goes wrong:** User levels up at wrong XP amount, or getLevelFromXP returns wrong level.
**Why it happens:** Confusion between "XP required FOR level N" vs "XP required TO REACH level N".
**How to avoid:** The formula from CONTEXT.md: Level N requires cumulative XP of sum(i=1 to N) of (i*100 + (i-1)*50). This means:
- Level 1: 100 XP total
- Level 2: 100 + 250 = 350 XP total (wait -- need to verify)
- Actually: Level 1 threshold = 1*100 + 0*50 = 100. Level 2 threshold = 100 + (2*100 + 1*50) = 350. Level 3 = 350 + (3*100 + 2*50) = 750.
- Build a test that verifies the first 20 levels match expected values.

### Pitfall 5: Streak Multiplier Not Updating After Week Completion
**What goes wrong:** User completes a full week but multiplier stays at 1x.
**Why it happens:** Multiplier calculation requires tracking "consecutive complete weeks" which is more complex than daily streak counting.
**How to avoid:** Track multiplier in the streaks table. On each daily streak evaluation, if today is Monday and the previous week was fully complete (7 consecutive days of at least 1 habit), increment consecutive weeks counter and recalculate multiplier. If any day was missed (even with a freeze), reset consecutive weeks to 0.

### Pitfall 6: Habits Not Seeded
**What goes wrong:** Quest board shows empty because no habits exist in the database.
**Why it happens:** Current seed.ts only creates 3 users, no habit definitions.
**How to avoid:** Extend seed.ts to insert the 4 core habits (Exercise xp=50, Meditation xp=30, Water xp=20 target_count=8, Sleep xp=40) and create streak records for each user.

## Code Examples

### Timezone-Safe Date Helper

```typescript
// lib/utils.ts
export function getTodayForUser(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  // "en-CA" locale produces YYYY-MM-DD format
}

export function getYesterdayForUser(timezone: string): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
```

### Today's Quests Query

```typescript
// lib/queries/habits.ts
import { db } from "@/db";
import { habits, habitLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getTodayForUser } from "@/lib/utils";

export async function getTodayQuests(userId: number, timezone: string) {
  const today = getTodayForUser(timezone);

  // Get all habits with today's logs for this user
  const allHabits = await db.query.habits.findMany({
    with: {
      habitLogs: {
        where: and(
          eq(habitLogs.userId, userId),
          eq(habitLogs.date, today),
        ),
      },
    },
  });

  return allHabits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    xpReward: habit.xpReward,
    targetCount: habit.targetCount,
    progress: habit.habitLogs[0]?.progress ?? 0,
    completed: habit.targetCount === 1
      ? habit.habitLogs.length > 0
      : (habit.habitLogs[0]?.progress ?? 0) >= habit.targetCount,
    xpEarned: habit.habitLogs[0]?.xpEarned ?? 0,
  }));
}
```

### Segmented XP Bar

```typescript
// components/xp-bar.tsx
"use client";

import clsx from "clsx";

interface XPBarProps {
  current: number;  // XP into current level
  total: number;    // XP needed for next level
  segments?: number; // number of blocks
}

export function XPBar({ current, total, segments = 20 }: XPBarProps) {
  const filled = Math.floor((current / total) * segments);

  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: segments }, (_, i) => (
        <div
          key={i}
          className={clsx(
            "h-3 flex-1 border border-border",
            i < filled ? "bg-xp-bar" : "bg-surface-raised"
          )}
        />
      ))}
    </div>
  );
}
```

### XP Float Animation

```typescript
// components/animations/xp-float.tsx
"use client";

import { motion, AnimatePresence } from "motion/react";

interface XPFloatProps {
  amount: number | null;
  onComplete: () => void;
}

export function XPFloat({ amount, onComplete }: XPFloatProps) {
  return (
    <AnimatePresence>
      {amount !== null && (
        <motion.span
          className="absolute font-heading text-secondary text-xs pointer-events-none"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={onComplete}
        >
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}
```

### Done Stamp Animation

```typescript
// components/animations/done-stamp.tsx
"use client";

import { motion } from "motion/react";

export function DoneStamp() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ scale: 2, rotate: -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 5, opacity: 1 }}
      transition={{ type: "spring", damping: 12, stiffness: 200 }}
    >
      <span className="font-heading text-success text-lg border-3 border-success px-3 py-1 bg-surface/80">
        DONE
      </span>
    </motion.div>
  );
}
```

### Streak Pulse Animation

```typescript
// components/animations/streak-pulse.tsx
"use client";

import { motion } from "motion/react";

interface StreakFlameProps {
  active: boolean;
  atRisk: boolean;
}

export function StreakFlame({ active, atRisk }: StreakFlameProps) {
  const src = atRisk ? "/assets/icon-flame-danger.svg" : "/assets/icon-flame.svg";

  return (
    <motion.img
      src={src}
      alt="Streak flame"
      width={24}
      height={24}
      animate={active && !atRisk ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={active && !atRisk ? { repeat: Infinity, duration: 2 } : {}}
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| framer-motion import | motion/react import | Motion v12 (2024) | Package renamed. Import from `motion/react`, not `framer-motion`. |
| useFormState | useActionState | React 19 (2024) | For server action form binding. useActionState is the new name. |
| API routes for mutations | Server Actions | Next.js 14+ (2023) | No need for /api/habits/complete endpoints. Direct function calls. |
| Smooth CSS width transitions | Segmented block bars | N/A (design choice) | Pixel-art aesthetic requires blocky segmented bars, not smooth. |

## Database Considerations

### Missing Index (must add)

The habit_logs table needs a unique constraint to prevent double-completion:

```sql
CREATE UNIQUE INDEX habit_logs_user_habit_date_idx
ON habit_logs(user_id, habit_id, date);
```

In Drizzle, add to the table definition or create via migration. For partial-progress habits (water), the constraint still works because we upsert (increment progress) rather than insert new rows.

### Seed Data Extension

Current seed only creates 3 users. Phase 2 needs:
- 4 habits: Exercise (xp=50, target=1), Meditation (xp=30, target=1), Water (xp=20, target=8), Sleep (xp=40, target=1)
- 1 streak record per user
- A few habit_logs for the power user to show the quest board with mixed completion states

### Query Pattern: Habits with Today's Logs

The core query joins habits with habit_logs filtered by user and date. Use Drizzle's `with` syntax (relational queries) for clean eager loading, or use a left join if the relational query doesn't support filtering nested relations efficiently.

If Drizzle relational `with` filtering is awkward, fall back to raw SQL join:

```typescript
const quests = await db
  .select({
    id: habits.id,
    name: habits.name,
    icon: habits.icon,
    xpReward: habits.xpReward,
    targetCount: habits.targetCount,
    progress: habitLogs.progress,
    xpEarned: habitLogs.xpEarned,
  })
  .from(habits)
  .leftJoin(
    habitLogs,
    and(
      eq(habitLogs.habitId, habits.id),
      eq(habitLogs.userId, userId),
      eq(habitLogs.date, today),
    ),
  )
  .orderBy(habits.xpReward);
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HBIT-01 | Today's quests display | integration | Manual browser verification | N/A |
| HBIT-02 | One-click habit completion | integration | Manual browser verification | N/A |
| HBIT-03 | XP awarded by habit type | unit | Pure function test (if framework added) | N/A |
| HBIT-04 | Partial progress display | integration | Manual browser verification | N/A |
| HBIT-05 | DONE stamp animation | visual | Manual browser verification | N/A |
| STRK-01 | Streak counter display | integration | Manual browser verification | N/A |
| STRK-02 | Streak increments daily | unit | Pure function test (if framework added) | N/A |
| STRK-03 | Streak breaks on missed day | unit | Pure function test (if framework added) | N/A |
| STRK-04 | Streak freeze auto-applied | unit | Pure function test (if framework added) | N/A |
| STRK-05 | Multiplier increases weekly | unit | Pure function test (if framework added) | N/A |
| STRK-06 | Flame pulse animation | visual | Manual browser verification | N/A |
| XPLV-01 | XP earned per habit | unit | Pure function test (if framework added) | N/A |
| XPLV-02 | Segmented XP bar | visual | Manual browser verification | N/A |
| XPLV-03 | Level-up flash animation | visual | Manual browser verification | N/A |
| XPLV-04 | XP float animation | visual | Manual browser verification | N/A |
| XPLV-05 | Multiplier applies to XP | unit | Pure function test (if framework added) | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (type-check + build verification)
- **Per wave merge:** `npm run build` + manual browser check of quest board
- **Phase gate:** Build passes + all quest interactions work in browser

### Wave 0 Gaps
- No test framework installed (vitest/jest). Engine pure functions are ideal unit test candidates but no framework exists.
- Recommendation: Do NOT add a test framework in this phase. Verify via build + manual browser testing. Engine functions are pure and deterministic -- easily testable later.

## Open Questions

1. **Drizzle relational query filtering for nested with**
   - What we know: Drizzle supports `with` for eager loading relations.
   - What's unclear: Whether `with` supports `where` clauses on the nested relation (filter habit_logs by userId and date). Some Drizzle versions have limited filtering in relational queries.
   - Recommendation: Start with relational query. If filtering doesn't work as expected, fall back to the leftJoin SQL builder pattern shown above. Both are valid.

2. **Streak evaluation timing**
   - What we know: CONTEXT.md says streak evaluates "on next login" (check if previous day had 0 completions).
   - What's unclear: Whether to run this in the page's server component (on every page load) or in a cron job.
   - Recommendation: Evaluate on page load in the getStreakState query function. This is simpler than a cron for Phase 2 and handles the "on next login" requirement directly. Can migrate to cron later if needed. On page load: compare lastActiveDate to today. If gap > 1 day, check freeze, apply break or freeze, update streaks table.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/db/schema/*`, `src/lib/auth.ts`, `src/lib/actions/auth.ts`, `src/components/ui/*`
- CONTEXT.md Phase 2 decisions: XP values, animation specs, interaction patterns
- DESIGN-SPEC.md: Component layouts, color tokens, motion specs
- ARCHITECTURE.md: Data flow patterns, project structure

### Secondary (MEDIUM confidence)
- Motion v12 API (AnimatePresence, motion.div, spring transitions) -- based on training data, consistent with installed version
- Drizzle ORM relational query API -- based on training data for v0.45.x
- React 19 useTransition for optimistic patterns -- stable API

### Tertiary (LOW confidence)
- Drizzle `with` clause filtering on nested relations -- needs validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages already installed, versions verified from package.json
- Architecture: HIGH - patterns established in Phase 1 codebase, ARCHITECTURE.md research is comprehensive
- Engine logic: HIGH - pure functions with deterministic math, formulas locked in CONTEXT.md
- Animation specs: HIGH - all 4 animations fully specified in DESIGN-SPEC.md and CONTEXT.md
- Drizzle query patterns: MEDIUM - relational query filtering may need runtime validation
- Pitfalls: HIGH - timezone, double-completion, streak increment are well-documented failure modes

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable -- no fast-moving dependencies)
