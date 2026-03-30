---
phase: 03-social-achievements
plan: 01
subsystem: api
tags: [drizzle, postgres, achievements, leaderboard, social, nudges, queries]

requires:
  - phase: 01-foundation
    provides: "Schema, auth, utils (getTodayForUser, getWeekBounds)"
  - phase: 02-core-game-loop
    provides: "Habit actions, XP engine, streak engine, habit logs"
provides:
  - "Nudges schema with unique sender/recipient/date index"
  - "Pure achievement evaluation engine for 4 triggers"
  - "Weekly leaderboard query with LEFT JOIN + COALESCE"
  - "Friends list, friend count, unread nudges queries"
  - "Achievement checks and user achievements queries"
  - "RPG stats, habit XP breakdown, water consistency, nudges sent count"
  - "Active challenge with participants query"
  - "sendNudge and markNudgesRead server actions"
  - "Achievement unlock integration in completeHabit and incrementProgress"
affects: [03-social-achievements]

tech-stack:
  added: []
  patterns: ["Pure engine functions for evaluation logic", "LEFT JOIN + COALESCE for zero-safe aggregation", "onConflictDoNothing for rate limiting and idempotency"]

key-files:
  created:
    - src/db/schema/nudges.ts
    - src/lib/engine/achievements.ts
    - src/lib/queries/leaderboard.ts
    - src/lib/queries/friends.ts
    - src/lib/queries/achievements.ts
    - src/lib/queries/profile.ts
    - src/lib/queries/challenges.ts
    - src/lib/actions/social.ts
  modified:
    - src/db/schema/index.ts
    - src/db/relations.ts
    - src/db/schema/user-achievements.ts
    - src/lib/actions/habits.ts

key-decisions:
  - "Achievement engine is pure function with zero DB imports — testable and portable"
  - "Leaderboard uses LEFT JOIN + COALESCE so users with 0 logs still appear ranked"
  - "userAchievements unique index on (userId, achievementId) prevents double-unlock"
  - "Water consistency query finds habit by lowercase name match for flexibility"

patterns-established:
  - "Query modules in src/lib/queries/ export typed async functions"
  - "onConflictDoNothing for idempotent social actions (nudges, achievements)"

requirements-completed: [LDBD-02, LDBD-05, ACHV-03, ACHV-05, SOCL-02, SOCL-03, PROF-02, PROF-04]

duration: 4min
completed: 2026-03-30
---

# Phase 3 Plan 1: Social Backend Infrastructure Summary

**Nudges schema, pure achievement engine with 4 triggers, 5 query modules (leaderboard/friends/achievements/profile/challenges), social actions, and achievement unlock integration into habit completion flow**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-30T10:50:51Z
- **Completed:** 2026-03-30T10:54:37Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Nudges table with unique sender/recipient/date index for once-per-day rate limiting
- Pure achievement evaluation engine handling streak_7, streak_30, early_bird, and social_5_friends triggers
- 5 query modules providing all data for leaderboard, friends, achievements, profile stats, and challenges
- Both completeHabit and incrementProgress now return newlyUnlocked achievement IDs
- sendNudge and markNudgesRead server actions with auth protection

## Task Commits

Each task was committed atomically:

1. **Task 1: Nudges schema, achievement engine, and all data queries** - `dba1945` (feat)
2. **Task 2: Integrate achievement evaluation into habit completion actions and add sendNudge action** - `49496fc` (feat)

## Files Created/Modified
- `src/db/schema/nudges.ts` - Nudges table with unique sender/recipient/date index
- `src/db/schema/index.ts` - Added nudges export and nudgesRelations
- `src/db/relations.ts` - Added nudgesRelations with sender/recipient
- `src/db/schema/user-achievements.ts` - Added unique index on userId+achievementId
- `src/lib/engine/achievements.ts` - Pure achievement evaluation function
- `src/lib/queries/leaderboard.ts` - Weekly XP leaderboard with friend ranking
- `src/lib/queries/friends.ts` - Friends list, friend count, unread nudges
- `src/lib/queries/achievements.ts` - User achievements and achievement checks
- `src/lib/queries/profile.ts` - RPG stats, XP breakdown, water consistency, nudges sent
- `src/lib/queries/challenges.ts` - Active challenge with participants
- `src/lib/actions/social.ts` - sendNudge and markNudgesRead server actions
- `src/lib/actions/habits.ts` - Achievement unlock integration in both actions

## Decisions Made
- Achievement engine is pure function with zero DB imports for testability
- Leaderboard uses LEFT JOIN + COALESCE so users with 0 weekly logs still appear
- userAchievements unique index on (userId, achievementId) prevents double-unlock via onConflictDoNothing
- Water consistency query finds habit by lowercase name match for flexibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All backend queries and actions ready for UI plans 02 and 03 to wire against
- Achievement evaluation runs automatically on every habit completion
- Social actions (nudge send/read) ready for friend UI components

---
*Phase: 03-social-achievements*
*Completed: 2026-03-30*
