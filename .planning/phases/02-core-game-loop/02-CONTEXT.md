# Phase 2: Core Game Loop - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the daily engagement loop: users see today's habits as quest cards, complete them with one tap to earn XP, watch their streak counter grow, and level up. Includes streak freeze mechanic and streak multiplier. All 4 signature animations (XP float, streak pulse, level-up flash, quest complete stamp) are implemented. Leaderboard, achievements, friends, and profile are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Quest Completion Interaction
- Single click on checkbox area triggers completion — no confirmation dialog
- Instant visual feedback: checkbox fills green (0ms) → DONE stamp (100ms) → XP float (600ms) → hero XP bar updates
- Partial-progress habits (e.g., water 3/8): each increment is a separate tap (+1), shows inline pixel progress blocks, XP awarded only when daily target is reached
- No undo — once completed, done for the day. Prevents gaming the system.
- Quest card ordering: incomplete first sorted by XP value (highest reward first), then completed quests below

### XP Values and Leveling Curve
- XP per habit type: Exercise=50, Meditation=30, Water (full target)=20, Sleep=40
- Streak multiplier applies on top of base XP: earned = base * multiplier
- Level threshold formula: Level N requires cumulative XP of sum(i=1 to N) of (i*100 + (i-1)*50)
  - Level 1: 100 XP, Level 2: 250 XP total, Level 3: 450 XP total, Level 4: 700 XP total...
  - Creates meaningful early progress that naturally slows
- Level-up triggers: hero banner flashes --color-secondary for 200ms, level number scales 1.0→1.3→1.0 over 400ms, "LEVEL UP!" in Press Start 2P for 2 seconds

### Streak Calculation
- Server-side evaluation based on user timezone (timezone column exists on users table from Phase 1)
- Streak increments when user completes at least 1 habit in a calendar day (user's timezone)
- Break detection: on next login, check if previous day had 0 completions → streak breaks
- Streak freeze: automatic — if user misses a day and has a freeze available, auto-applied silently. User sees "Freeze saved your streak!" message on next login. 1 freeze per week, resets Monday.
- Streak multiplier: tracks consecutive complete weeks (Mon-Sun where at least 1 habit completed each day). Missing any day in a week resets to 1x. Week 1=1x, Week 2=1.2x, Week 3=1.3x, Week 4+=1.5x (cap).

### Animation Choreography (from DESIGN-SPEC.md — locked)
- **XP Float**: +50 XP text appears at quest card, floats upward 40px, fades out over 600ms. Press Start 2P font, --color-secondary color.
- **Streak Pulse**: Flame icon gently pulses (scale 1.0→1.05) on 2-second loop when streak active. Stops when at risk.
- **Level Up Flash**: Entire hero banner flashes --color-secondary for 200ms, level number scales 1.0→1.3→1.0 over 400ms, "LEVEL UP!" text for 2 seconds.
- **Quest Complete Stamp**: Pixel "DONE" stamp appears rotated 5deg over quest card, settles into place. Chunky rubber stamp feel.
- Use Motion (framer-motion) v12 for all animations — already installed in package.json

### Hero Banner (Streak Display)
- Full-width, --color-surface background, 3px --color-border on all sides
- Streak flame icon (animated pixel fire from public/assets/icon-flame.svg) on left
- Streak count in Press Start 2P at 32px, --color-primary
- Multiplier badge (e.g., "1.5x") in --color-secondary with pixel border
- XP progress bar below: blocky segmented bar (not smooth), --color-xp-bar fill on --color-surface-raised track
- Level number on left of XP bar, XP count on right
- Streak freeze indicator: small shield icon (icon-freeze.svg) in --color-accent, "1 freeze available" text

### Claude's Discretion
- Exact server action implementation pattern for habit completion
- Database query optimization for streak calculation
- Error handling for concurrent completions
- Loading states between server action calls
- How to structure the game engine logic (pure functions vs server actions)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Design
- `DESIGN-SPEC.md` — Complete design specification. §Key Components for Streak Hero Banner, Quest Card, Streak Freeze Indicator. §Motion for all 4 animation specs.
- `BRIEF.md` — Domain context, XP weights, streak multiplier values, habit types, streak freeze mechanic

### Existing Code
- `src/db/schema/habits.ts` — Habit table schema (name, type, xp_value, target_count, frequency)
- `src/db/schema/habit-logs.ts` — Habit completion log (habit_id, user_id, completed_at, value)
- `src/db/schema/streaks.ts` — Streak tracking (user_id, current_streak, longest_streak, freeze_available, freeze_used_at, multiplier, last_completed_at)
- `src/db/schema/users.ts` — User table with level, total_xp, timezone columns
- `src/components/ui/pixel-card.tsx` — Reusable pixel-art card component (base for quest cards)
- `src/components/ui/pixel-button.tsx` — Pixel-art button with variants
- `src/lib/auth.ts` — Session management (getSession helper)
- `src/lib/actions/auth.ts` — Server action pattern reference

### Assets
- `public/assets/icon-flame.svg` — Streak flame icon
- `public/assets/icon-flame-danger.svg` — At-risk streak flame
- `public/assets/icon-freeze.svg` — Streak freeze indicator
- `public/assets/icon-exercise.svg` — Exercise habit icon
- `public/assets/icon-meditation.svg` — Meditation habit icon
- `public/assets/icon-water.svg` — Water habit icon
- `public/assets/icon-sleep.svg` — Sleep habit icon
- `public/assets/icon-check.svg` — Quest completion checkmark
- `public/assets/icon-xp-star.svg` — XP indicator

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/pixel-card.tsx`: Base card component — extend for QuestCard with checkbox, XP display, habit icon
- `src/components/ui/pixel-button.tsx`: Button with primary/secondary/ghost variants — use for any interactive elements
- `src/components/ui/bottom-nav.tsx` + `top-nav.tsx`: Navigation already wired — home tab routes to quest board
- `src/db/schema/*`: All 8 tables exist with relations — habits, habit_logs, streaks tables ready for game logic

### Established Patterns
- Server actions in `src/lib/actions/` — follow auth.ts pattern for game actions
- iron-session via `getSession()` from `src/lib/auth.ts` — use for user identification in all game actions
- Tailwind v4 CSS-first tokens in `src/app/globals.css` — all design tokens available as CSS variables
- Press Start 2P + Silkscreen fonts configured globally via CSS variables

### Integration Points
- `src/app/(game)/page.tsx` — Currently placeholder, becomes the quest board home screen
- `src/app/(game)/layout.tsx` — Game layout shell with nav, wraps all player pages
- Hero banner component goes at top of game layout or home page
- Quest cards fill the main content area of the home page

</code_context>

<specifics>
## Specific Ideas

- "XP should feel earned, not given" — different weights per habit type reflect effort/impact
- Quest cards are THE primary interactive element — one tap from home screen, immediately rewarding
- Streak counter is the most prominent element on the entire home screen — sacred
- "The dopamine of not breaking the streak keeps them coming back"
- Streak freeze is a safety net, not a feature to promote — auto-apply silently, inform after the fact
- "Celebrate what was done, don't scold what wasn't" — no punitive language anywhere

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-game-loop*
*Context gathered: 2026-03-30*
