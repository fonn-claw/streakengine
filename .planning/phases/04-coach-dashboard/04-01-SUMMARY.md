---
phase: 04-coach-dashboard
plan: 01
subsystem: api
tags: [drizzle, postgres, aggregation, engagement-risk, server-actions]

requires:
  - phase: 01-foundation
    provides: "DB schema (users, habits, habitLogs, streaks, nudges), auth, date utils"
provides:
  - "getCoachDashboardData() — aggregated player cards with risk classification"
  - "getUserHabitHeatmap() — 7-day habit completion grid per user"
  - "fetchUserDetail() — coach-guarded server action for lazy heatmap loading"
  - "CoachUserCard and HabitDay TypeScript interfaces"
affects: [04-coach-dashboard]

tech-stack:
  added: []
  patterns: [SQL subquery aggregation in Drizzle select, risk classification with engagement ratio]

key-files:
  created:
    - src/lib/queries/coach.ts
    - src/lib/actions/coach.ts
  modified: []

key-decisions:
  - "Engagement ratio uses thisWeekLogs/lastWeekLogs with fallback to 1.0 for zero last-week"
  - "New users (<14 days) forced to green regardless of engagement ratio"
  - "SQL subqueries inline in Drizzle select for single-pass aggregation"

patterns-established:
  - "Risk classification: ratio < 0.7 = red, < 0.9 = yellow, else green"
  - "Coach server actions guard on session.role === coach"

requirements-completed: [COCH-01, COCH-02, COCH-05]

duration: 2min
completed: 2026-03-30
---

# Phase 4 Plan 1: Coach Data Layer Summary

**Drizzle aggregation queries for coach dashboard with engagement risk classification (green/yellow/red) and 7-day habit heatmap, plus coach-guarded server action**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T11:19:02Z
- **Completed:** 2026-03-30T11:20:56Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Coach dashboard aggregation query with SQL subqueries for weekly logs, XP, and nudge status
- Risk classification engine: red (<0.7 ratio), yellow (<0.9), green, with new-user override
- Habit heatmap query returning 7-day completion grid per habit
- Coach-guarded server action for lazy-loading user detail

## Task Commits

Each task was committed atomically:

1. **Task 1: Coach dashboard aggregation query and types** - `5f113e2` (feat)
2. **Task 2: Coach server action for lazy-load heatmap** - `b39506b` (feat)

## Files Created/Modified
- `src/lib/queries/coach.ts` - CoachUserCard interface, getCoachDashboardData(), HabitDay interface, getUserHabitHeatmap()
- `src/lib/actions/coach.ts` - fetchUserDetail() server action with coach role guard

## Decisions Made
- Engagement ratio uses thisWeekLogs/lastWeekLogs with fallback to 1.0 when last week has zero logs
- New users (<14 days old) forced to green risk level regardless of engagement ratio
- Used inline SQL subqueries in Drizzle select for single-pass aggregation rather than multiple queries
- Heatmap checks progress >= targetCount for multi-count habits (e.g., 8 glasses of water)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data layer complete, ready for Plan 02 (coach dashboard UI) to consume
- CoachUserCard[] and HabitDay[] interfaces are the data contract for the UI

---
*Phase: 04-coach-dashboard*
*Completed: 2026-03-30*
