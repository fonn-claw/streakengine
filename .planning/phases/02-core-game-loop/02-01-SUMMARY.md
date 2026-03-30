---
phase: 02-core-game-loop
plan: 01
subsystem: engine
tags: [xp, streak, leveling, game-engine, server-actions, drizzle, timezone]

requires:
  - phase: 01-foundation
    provides: database schema (users, habits, habit_logs, streaks), auth system, design tokens

provides:
  - Pure XP/leveling engine (calculateXP, xpForLevel, getLevelFromXP, getLevelProgress)
  - Streak evaluation engine (evaluateStreak, calculateMultiplier, isWeekComplete)
  - Timezone-safe date helpers (getTodayForUser, getYesterdayForUser, getWeekBounds)
  - getTodayQuests query with completion status
  - getStreakState query with on-load gap evaluation
  - completeHabit and incrementProgress server actions
  - 4 seeded habits with correct XP values
  - Unique index preventing double-completion

affects: [02-core-game-loop, 03-social-achievements, 04-coach-dashboard, 05-demo-data-deploy]

tech-stack:
  added: []
  patterns: [pure-engine-functions, server-action-with-animation-return, timezone-safe-date-strings]

key-files:
  created:
    - src/lib/engine/xp.ts
    - src/lib/engine/streak.ts
    - src/lib/utils.ts
    - src/lib/queries/habits.ts
    - src/lib/queries/streaks.ts
    - src/lib/actions/habits.ts
  modified:
    - src/db/schema/habit-logs.ts
    - src/db/schema/index.ts
    - src/db/seed.ts

key-decisions:
  - "Schema barrel exports relations for db.query support"
  - "Streak evaluation on page load (getStreakState) handles break/freeze detection without cron"
  - "onConflictDoNothing with unique index handles double-click race conditions"

patterns-established:
  - "Pure engine pattern: game math in src/lib/engine/ with zero DB imports"
  - "Server action return pattern: actions return animation trigger data (xpEarned, leveledUp, streakIncremented)"
  - "Timezone-safe dates: always derive date strings via Intl.DateTimeFormat with user timezone"

requirements-completed: [HBIT-03, STRK-02, STRK-03, STRK-04, STRK-05, XPLV-01, XPLV-05]

duration: 4min
completed: 2026-03-30
---

# Phase 2 Plan 1: Game Engine Data Layer Summary

**Pure XP/streak engine functions, timezone-safe queries, and server actions for habit completion with streak multiplier and double-click protection**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T10:21:13Z
- **Completed:** 2026-03-30T10:24:43Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Pure game engine with XP calculation, level thresholds, streak evaluation, and multiplier logic -- all zero-DB-dependency
- Server actions (completeHabit, incrementProgress) that award XP, evaluate streaks, and return animation trigger data
- Unique index on habit_logs(userId, habitId, date) prevents double-completion even under race conditions
- Seed extended with 4 habits (Exercise=50XP, Meditation=30XP, Water=20XP/8 target, Sleep=40XP) and 3 user streak records

## Task Commits

Each task was committed atomically:

1. **Task 1: Pure game engine functions and date helpers** - `7b335cb` (feat)
2. **Task 2: Database queries, server actions, unique index, and seed extension** - `955a332` (feat)

## Files Created/Modified
- `src/lib/engine/xp.ts` - XP calculation, level thresholds, level progress
- `src/lib/engine/streak.ts` - Streak evaluation discriminated union, freeze logic, multiplier
- `src/lib/utils.ts` - Timezone-safe date helpers (today, yesterday, week bounds)
- `src/lib/queries/habits.ts` - getTodayQuests with left join and completion status
- `src/lib/queries/streaks.ts` - getStreakState with on-load gap evaluation
- `src/lib/actions/habits.ts` - completeHabit and incrementProgress server actions
- `src/db/schema/habit-logs.ts` - Added unique index on (userId, habitId, date)
- `src/db/schema/index.ts` - Added relation exports for db.query support
- `src/db/seed.ts` - Extended with 4 habits and 3 streak records

## Decisions Made
- Schema barrel now exports all relation definitions so `db.query` works everywhere (was missing)
- Streak gap evaluation happens on page load in getStreakState rather than via cron -- simpler, handles "on next login" requirement directly
- Used `onConflictDoNothing()` with returning check rather than try/catch for double-click handling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Schema barrel missing relation exports**
- **Found during:** Task 2 (seed script uses db.query)
- **Issue:** `src/db/schema/index.ts` did not export relation definitions from `src/db/relations.ts`, causing `db.query.*` to fail
- **Fix:** Added all relation exports to the schema barrel
- **Files modified:** src/db/schema/index.ts
- **Verification:** Build passes, db.query works in seed and queries
- **Committed in:** 955a332 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for db.query functionality. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All engine functions ready for UI components in Plan 02
- Server actions return animation trigger data (xpEarned, leveledUp, streakIncremented) for quest card, XP float, level-up flash
- Seed habits and streaks ready for quest board rendering

---
*Phase: 02-core-game-loop*
*Completed: 2026-03-30*
