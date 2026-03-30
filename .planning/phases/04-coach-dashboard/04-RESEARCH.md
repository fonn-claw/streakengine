# Phase 4: Coach Dashboard - Research

**Researched:** 2026-03-30
**Domain:** Next.js server components, Drizzle ORM aggregation queries, engagement analytics
**Confidence:** HIGH

## Summary

Phase 4 builds the coach dashboard -- a grid of user cards sorted by engagement risk with expandable detail views and nudge capability. The entire codebase pattern is well-established from phases 1-3: server components fetch data via Drizzle queries, pass props to client components that use Motion for animations. No new libraries are needed.

The core technical challenge is the engagement risk calculation: comparing current week's habit log count vs previous week's for each user, then sorting and categorizing users into green/yellow/red tiers. This is a single SQL aggregation query against the existing `habit_logs` table. The expand/collapse behavior uses client-side state with Motion's `AnimatePresence`.

**Primary recommendation:** Build as a server component page with one aggregation query, one client component for the interactive card grid. Reuse existing `sendNudge` action and UI components directly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Grid layout: 2 columns mobile, 3 desktop (max-width 720px)
- Each card: display name, streak count + flame, weekly XP, risk heart, last active time
- Sort: red first, then yellow, then green; within tier by engagement drop % descending
- Cards use PixelCard with 3px borders, squared edges
- Risk heart icon top-right of each card
- At-risk thresholds: green < 10% drop, yellow 10-30%, red >= 30%
- Calculation: sum(habit_logs this week) / sum(habit_logs last week); ratio < 0.7 = red, < 0.9 = yellow, else green
- New users (< 2 weeks data) default to green
- Red heart gets subtle pulsing animation (reuse streak-pulse pattern)
- Expand is accordion-style inline, no modal
- Expanded view: 7-day heatmap grid (rows = habits, cols = Mon-Sun)
- Completed blocks use --color-success, missed use --color-surface-raised
- Send Nudge button inside expanded card, reuses sendNudge action from Phase 3
- Nudge button disabled if already nudged today (1/day limit)

### Claude's Discretion
- Exact grid responsive breakpoints
- Loading states for coach dashboard
- Empty state if coach has no users
- How to handle coach's own data (exclude from grid or show differently)
- Animation timing for card expand/collapse

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COCH-01 | Coach sees grid of user cards sorted by engagement risk | Aggregation query pattern + sorted grid layout |
| COCH-02 | Each user card shows streak status, weekly XP, risk indicator (green/yellow/red heart) | User data join query + heart SVG assets already in public/assets/ |
| COCH-03 | Coach can expand user card to see quest completion patterns | Accordion expand with 7-day habit heatmap query |
| COCH-04 | Coach can send nudge directly from expanded user card | Reuse existing sendNudge() server action |
| COCH-05 | At-risk detection: flag users with 30%+ engagement drop over 7 days | Engagement ratio calculation in aggregation query |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | App Router, server components | Already in project |
| Drizzle ORM | 0.45.2 | SQL query builder for aggregation queries | Already in project |
| Motion | 12.38.0 | AnimatePresence for expand/collapse, pulse animation | Already in project |
| date-fns | 4.1.0 | Week bounds calculation via getWeekBounds() | Already in project |

### Supporting
No new libraries needed. All functionality builds on existing stack.

### Alternatives Considered
None -- phase uses only existing libraries.

## Architecture Patterns

### Recommended File Structure
```
src/
  app/(coach)/dashboard/
    page.tsx                    # Server component: fetches all data, renders grid
  components/coach/
    user-card-grid.tsx          # "use client" - manages expand state, renders grid
    user-card.tsx               # Single user card with expand/collapse
    habit-heatmap.tsx           # 7-day habit completion grid (rows=habits, cols=days)
  lib/queries/
    coach.ts                    # getCoachDashboardData() - main aggregation query
```

### Pattern 1: Single Aggregation Query
**What:** One query fetches all user data the coach needs (streaks, weekly XP, engagement ratio, last active date). Avoid N+1 by joining in SQL.
**When to use:** Always for the main dashboard load.
**Example:**
```typescript
// src/lib/queries/coach.ts
import { db } from "@/db";
import { users, habitLogs, streaks, nudges } from "@/db/schema";
import { sql, eq, and, ne, between } from "drizzle-orm";
import { getWeekBounds, getTodayForUser } from "@/lib/utils";

export interface CoachUserCard {
  userId: number;
  displayName: string;
  currentStreak: number;
  weeklyXp: number;
  lastActiveDate: string | null;
  thisWeekLogs: number;
  lastWeekLogs: number;
  engagementRatio: number; // thisWeek / lastWeek
  riskLevel: "green" | "yellow" | "red";
  nudgedToday: boolean;
}

export async function getCoachDashboardData(coachId: number): Promise<CoachUserCard[]> {
  const today = getTodayForUser("UTC"); // coach sees UTC-normalized view
  const thisWeek = getWeekBounds(today);

  // Calculate last week bounds
  const lastWeekDate = new Date(thisWeek.start + "T12:00:00Z");
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeek = getWeekBounds(lastWeekDate.toISOString().slice(0, 10));

  // Query all players with their engagement data
  // Uses subqueries for this week / last week log counts
  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      currentStreak: streaks.currentStreak,
      lastActiveDate: streaks.lastActiveDate,
      thisWeekLogs: sql<number>`coalesce((
        select count(*) from habit_logs
        where habit_logs.user_id = ${users.id}
        and habit_logs.date between ${thisWeek.start} and ${thisWeek.end}
      ), 0)`,
      lastWeekLogs: sql<number>`coalesce((
        select count(*) from habit_logs
        where habit_logs.user_id = ${users.id}
        and habit_logs.date between ${lastWeek.start} and ${lastWeek.end}
      ), 0)`,
      weeklyXp: sql<number>`coalesce((
        select sum(xp_earned) from habit_logs
        where habit_logs.user_id = ${users.id}
        and habit_logs.date between ${thisWeek.start} and ${thisWeek.end}
      ), 0)`,
      nudgedToday: sql<boolean>`exists(
        select 1 from nudges
        where nudges.sender_id = ${coachId}
        and nudges.recipient_id = ${users.id}
        and nudges.date = ${today}
      )`,
    })
    .from(users)
    .leftJoin(streaks, eq(streaks.userId, users.id))
    .where(ne(users.role, "coach"));

  // Calculate engagement ratio and risk level in JS
  return rows.map(row => {
    const thisW = Number(row.thisWeekLogs);
    const lastW = Number(row.lastWeekLogs);
    const ratio = lastW === 0 ? 1 : thisW / lastW; // new users default healthy
    const riskLevel = ratio < 0.7 ? "red" : ratio < 0.9 ? "yellow" : "green";
    return {
      ...row,
      currentStreak: row.currentStreak ?? 0,
      thisWeekLogs: thisW,
      lastWeekLogs: lastW,
      weeklyXp: Number(row.weeklyXp),
      nudgedToday: Boolean(row.nudgedToday),
      engagementRatio: ratio,
      riskLevel,
    };
  }).sort((a, b) => {
    const riskOrder = { red: 0, yellow: 1, green: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return a.engagementRatio - b.engagementRatio; // worst ratio first within tier
  });
}
```

### Pattern 2: Lazy-Load Expanded Detail
**What:** The 7-day habit heatmap data is fetched on-demand when a card is expanded, not upfront for all users.
**When to use:** When expanding a user card.
**Example:**
```typescript
// src/lib/queries/coach.ts (additional export)
export interface HabitDay {
  habitName: string;
  habitIcon: string | null;
  days: { date: string; completed: boolean }[];
}

export async function getUserHabitHeatmap(
  userId: number
): Promise<HabitDay[]> {
  // Get all habits
  const allHabits = await db.select().from(habits);

  // Get last 7 days of logs for this user
  const today = getTodayForUser("UTC");
  const weekBounds = getWeekBounds(today);

  const logs = await db
    .select({
      habitId: habitLogs.habitId,
      date: habitLogs.date,
      progress: habitLogs.progress,
    })
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        between(habitLogs.date, weekBounds.start, weekBounds.end),
      )
    );

  // Build heatmap grid
  // ... map habits x days
}
```

### Pattern 3: Server Action for Expand Data
**What:** Use a server action to fetch heatmap data when user clicks expand, avoiding full page reload.
**When to use:** For the accordion expand interaction.
**Example:**
```typescript
// src/lib/actions/coach.ts
"use server";
import { requireAuth } from "@/lib/auth";
import { getUserHabitHeatmap } from "@/lib/queries/coach";

export async function fetchUserDetail(userId: number) {
  const session = await requireAuth();
  if (session.role !== "coach") throw new Error("Unauthorized");
  return getUserHabitHeatmap(userId);
}
```

### Anti-Patterns to Avoid
- **N+1 queries:** Do NOT fetch each user's data individually. The main query must aggregate all users in one pass.
- **Client-side data fetching:** The grid data comes from server component props. Only the expand detail uses a server action.
- **Modal for expand:** CONTEXT.md explicitly says accordion-style inline, no modal.
- **Fetching all heatmap data upfront:** With 15 users x 4 habits x 7 days, it is small enough to fetch all upfront OR lazy-load. Lazy-load is cleaner.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Nudge sending | Custom nudge logic | Existing `sendNudge()` from `src/lib/actions/social.ts` | Already handles dedup via unique index |
| Week date bounds | Manual date math | `getWeekBounds()` from `src/lib/utils.ts` | Already handles Monday-start weeks |
| Pulse animation | Custom CSS animation | Motion's animate prop (see StreakFlame pattern) | Consistent with existing animations |
| Card component | Custom card div | `PixelCard` from `src/components/ui/pixel-card.tsx` | Design system consistency |

**Key insight:** Phase 4 is primarily a data aggregation + display phase. Every UI primitive and server action already exists from phases 1-3.

## Common Pitfalls

### Pitfall 1: Wrong Engagement Ratio for New Users
**What goes wrong:** Users with < 2 weeks of data get flagged as red because lastWeekLogs is 0, making the ratio undefined/Infinity/0.
**Why it happens:** Division by zero or missing data.
**How to avoid:** When lastWeekLogs is 0, default ratio to 1.0 (green). Also check user createdAt -- if < 14 days old, force green.
**Warning signs:** New demo users showing up as red on first load.

### Pitfall 2: Timezone Mismatch in Date Ranges
**What goes wrong:** Coach query uses UTC dates but user habit_logs use the user's local timezone date strings.
**Why it happens:** habit_logs.date is stored as the user's local date (via getTodayForUser(user.timezone)).
**How to avoid:** For the coach dashboard, this is acceptable approximation since we're comparing week-over-week ratios, not exact daily counts. The comparison is self-consistent per user. Document this as a known simplification.
**Warning signs:** Edge case where a user near midnight in their timezone has slightly off weekly counts.

### Pitfall 3: sendNudge Auth Check
**What goes wrong:** The existing sendNudge() action checks the sender is authenticated but does not verify the sender is a coach.
**Why it happens:** It was built for peer-to-peer nudges where any authenticated user can nudge.
**How to avoid:** This is actually fine -- coaches ARE authenticated users sending nudges. The unique index on (senderId, recipientId, date) prevents double-nudging. No change needed to sendNudge().
**Warning signs:** None -- this works as-is.

### Pitfall 4: Card Expand State Lost on Nudge
**What goes wrong:** After sending a nudge (server action), the expanded card might collapse if the component re-renders.
**Why it happens:** Server action response triggers state update.
**How to avoid:** Use useTransition for the nudge action (already established pattern from Phase 3). Keep expand state in the client component's useState, which persists across transitions.
**Warning signs:** Card collapsing after clicking "Send Nudge".

## Code Examples

### Accordion Expand with AnimatePresence
```typescript
// Established pattern using Motion
"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function UserCard({ user }: { user: CoachUserCard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <PixelCard
      className="cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Card summary content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Heatmap + nudge button */}
          </motion.div>
        )}
      </AnimatePresence>
    </PixelCard>
  );
}
```

### Red Heart Pulse Animation (reuse streak-pulse pattern)
```typescript
// Same pattern as StreakFlame in src/components/animations/streak-pulse.tsx
<motion.img
  src={`/assets/icon-heart-${riskLevel}.svg`}
  alt={`${riskLevel} risk`}
  width={24}
  height={24}
  animate={
    riskLevel === "red"
      ? { scale: [1, 1.05, 1] }
      : { scale: 1 }
  }
  transition={
    riskLevel === "red"
      ? { repeat: Infinity, duration: 2 }
      : {}
  }
/>
```

### Relative Time Display
```typescript
// Using date-fns formatDistanceToNow (already installed)
import { formatDistanceToNow } from "date-fns";

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr + "T12:00:00Z");
  return formatDistanceToNow(date, { addSuffix: true });
}
// Output: "2 days ago", "5 hours ago", etc.
```

## State of the Art

No technology changes needed. All libraries are current versions already in use.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A | Server components + server actions | Next.js 13+ (2023) | Already using this pattern |
| N/A | Motion (was framer-motion) | motion v12 (2025) | Already using `motion/react` import |

## Open Questions

1. **Coach's own user entry**
   - What we know: Coach has role="coach" in users table
   - What's unclear: Should the coach appear in their own grid?
   - Recommendation: Exclude coach from grid (filter `where role != 'coach'`). Coach is managing others, not themselves.

2. **Heatmap data loading strategy**
   - What we know: 15 users x 4 habits x 7 days = 420 cells. Small dataset.
   - What's unclear: Lazy-load per expand or fetch all upfront?
   - Recommendation: Fetch all heatmap data upfront in a second query from the server component. With only 15 users, the data is trivially small and avoids client-server roundtrip on expand. Pass as a map keyed by userId.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no test framework in package.json) |
| Config file | None |
| Quick run command | `npm run build` (type-check + build) |
| Full suite command | `npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COCH-01 | Grid sorted by engagement risk | manual | Visual inspection of coach dashboard | N/A |
| COCH-02 | Card shows streak, XP, risk heart | manual | Visual inspection | N/A |
| COCH-03 | Expand card shows heatmap | manual | Click expand, verify heatmap renders | N/A |
| COCH-04 | Send nudge from expanded card | manual | Click nudge, verify nudge record created | N/A |
| COCH-05 | 30%+ drop flagged red | manual | Check demo user with declining engagement shows red heart | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (catches type errors and build failures)
- **Per wave merge:** `npm run build`
- **Phase gate:** Build passes + visual verification of all 5 requirements

### Wave 0 Gaps
None -- no test framework installed in this project. Validation is via build check + manual verification. This is consistent with phases 1-3.

## Sources

### Primary (HIGH confidence)
- Project codebase: All patterns directly observed from existing code in phases 1-3
- `src/lib/actions/social.ts`: sendNudge() implementation verified
- `src/db/schema/habit-logs.ts`: habit_logs table structure verified
- `src/db/schema/nudges.ts`: nudge unique index verified
- `src/lib/utils.ts`: getWeekBounds() and getTodayForUser() verified
- `src/components/animations/streak-pulse.tsx`: Pulse animation pattern verified

### Secondary (MEDIUM confidence)
- date-fns formatDistanceToNow: standard API, well-known

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and in use
- Architecture: HIGH - follows exact patterns from phases 1-3
- Pitfalls: HIGH - identified from reading actual codebase patterns

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable project, no external dependency changes)
