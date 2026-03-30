---
phase: 02-core-game-loop
plan: 02
subsystem: ui
tags: [react, motion, animations, pixel-art, gamification, quest-board]

requires:
  - phase: 02-core-game-loop/01
    provides: "XP engine, streak engine, server actions, queries"
  - phase: 01-foundation
    provides: "PixelCard, auth, schema, CSS tokens, nav"
provides:
  - "StreakBanner hero component with animated flame and segmented XP bar"
  - "QuestCard with one-click completion and inline progress blocks"
  - "QuestBoard client wrapper managing state, level-up detection, re-sorting"
  - "4 signature animations: XP float, streak pulse, level-up flash, done stamp"
  - "Home page wired as server component fetching real quest and streak data"
affects: [social, achievements, profile, coach-dashboard]

tech-stack:
  added: []
  patterns: ["Motion v12 AnimatePresence for mount/unmount animations", "Optimistic UI with manual state for instant feedback", "Server component data fetching -> client island rendering"]

key-files:
  created:
    - src/components/animations/xp-float.tsx
    - src/components/animations/streak-pulse.tsx
    - src/components/animations/level-up.tsx
    - src/components/animations/done-stamp.tsx
    - src/components/xp-bar.tsx
    - src/components/streak-banner.tsx
    - src/components/quest-card.tsx
    - src/components/quest-board.tsx
  modified:
    - src/app/(game)/page.tsx

key-decisions:
  - "useRef counter for XPFloat key to ensure AnimatePresence triggers new animation each time"
  - "Manual state management in QuestCard instead of useOptimistic for simpler animation choreography"
  - "QuestBoard handles all state updates from quest completions and re-sorts completed quests to bottom"

patterns-established:
  - "Animation components accept show/active props and use AnimatePresence for enter/exit"
  - "Quest completion flow: optimistic update -> stamp delay -> server action -> XP float -> parent callback"
  - "Server component page fetches all data, passes to single client QuestBoard island"

requirements-completed: [HBIT-01, HBIT-02, HBIT-04, HBIT-05, STRK-01, STRK-06, XPLV-02, XPLV-03, XPLV-04]

duration: 3min
completed: 2026-03-30
---

# Phase 02 Plan 02: Quest Board UI Summary

**Quest board home screen with StreakBanner hero (32px streak counter, animated flame, segmented XP bar), QuestCards with one-click completion and pixel progress blocks, and 4 Motion v12 animations (XP float, streak pulse, level-up flash, done stamp)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-30T10:26:44Z
- **Completed:** 2026-03-30T10:29:17Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Built all 4 signature animations (XP float, streak pulse, level-up flash, done stamp) using Motion v12 AnimatePresence
- Created segmented XP bar with 20 discrete blocks matching pixel-art aesthetic
- StreakBanner hero with 32px Press Start 2P streak counter, animated flame, multiplier badge, freeze indicator
- QuestCard with one-click completion for single habits and +1 increment for partial-progress habits (water)
- QuestBoard client wrapper managing level-up detection, XP tracking, and completed quest re-sorting
- Home page rewired as server component fetching real data from getTodayQuests and getStreakState

## Task Commits

Each task was committed atomically:

1. **Task 1: Animation components and XP bar** - `ba96fbc` (feat)
2. **Task 2: StreakBanner, QuestCard, QuestBoard, and home page wiring** - `74b4ef1` (feat)

## Files Created/Modified
- `src/components/animations/xp-float.tsx` - XP float-up animation (+N XP text)
- `src/components/animations/streak-pulse.tsx` - Streak flame pulse animation
- `src/components/animations/level-up.tsx` - Level up flash and text animation
- `src/components/animations/done-stamp.tsx` - DONE stamp spring animation
- `src/components/xp-bar.tsx` - Segmented blocky XP progress bar (20 blocks)
- `src/components/streak-banner.tsx` - Hero banner with streak count, flame, XP bar, freeze
- `src/components/quest-card.tsx` - Quest item with completion interaction and animations
- `src/components/quest-board.tsx` - Client wrapper managing quest list state and animations
- `src/app/(game)/page.tsx` - Server component wiring StreakBanner + QuestBoard

## Decisions Made
- Used useRef counter for XPFloat animation key to ensure AnimatePresence triggers new animation each completion
- Chose manual state management in QuestCard over useOptimistic for simpler animation timing choreography
- QuestBoard manages all state centrally: XP totals, level tracking, quest completion status, re-sorting

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Core daily engagement loop is fully interactive
- Quest completion triggers full animation chain: optimistic UI -> DONE stamp -> XP float -> banner XP update -> level-up flash
- Ready for Phase 3: social features (leaderboard, friends, achievements) can reference QuestBoard and StreakBanner patterns

---
*Phase: 02-core-game-loop*
*Completed: 2026-03-30*
