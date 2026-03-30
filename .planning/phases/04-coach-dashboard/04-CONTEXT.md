# Phase 4: Coach Dashboard - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the coach/admin dashboard: a grid of user cards sorted by engagement risk, with green/yellow/red heart indicators, expandable cards showing quest completion patterns, direct nudge capability, and automatic at-risk detection flagging users with 30%+ engagement drop over 7 days. This is the coach@ account experience.

</domain>

<decisions>
## Implementation Decisions

### User Card Grid
- Grid layout: 2 columns on mobile, 3 on desktop (max-width matches existing 720px constraint)
- Each card shows: display name, streak count with flame icon, weekly XP total, risk heart indicator, last active relative time
- Sorted by risk level: red (at-risk) first, then yellow (moderate), then green (healthy)
- Within same risk level, sorted by engagement drop percentage descending (worst first)
- Cards use PixelCard component base with 3px borders, squared edges
- Risk heart icon is the primary visual cue — prominently placed top-right of each card

### At-Risk Detection
- Compare current week's daily habit completion count vs previous week's
- Risk thresholds:
  - Green (healthy): engagement drop < 10% (icon-heart-green.svg)
  - Yellow (moderate): engagement drop 10-30% (icon-heart-yellow.svg)
  - Red (at-risk): engagement drop >= 30% (icon-heart-red.svg, COCH-05)
- Calculation: sum(habit_logs this week) / sum(habit_logs last week). If ratio < 0.7 → red, < 0.9 → yellow, else green
- New users (< 2 weeks of data): default to green
- Red heart gets subtle pulsing animation (reuse streak-pulse pattern from Phase 2)

### Expanded User View
- Click card to expand inline (accordion-style, no modal)
- Expanded section shows: quest completion heatmap for past 7 days as pixel blocks (filled = completed, empty = missed, per habit)
- Each row = one habit, each column = one day (Mon-Sun)
- Completed blocks use --color-success, missed use --color-surface-raised
- "Send Nudge" PixelButton inside expanded card — reuses sendNudge action from Phase 3
- Nudge button disabled if already nudged today (1/day limit from SOCL-03)

### Claude's Discretion
- Exact grid responsive breakpoints
- Loading states for coach dashboard
- Empty state if coach has no users
- How to handle the coach's own data (exclude from grid or show differently)
- Animation timing for card expand/collapse

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Design
- `DESIGN-SPEC.md` — Complete design specification. §Key Components for card layouts, risk indicators.
- `BRIEF.md` — Coach persona description, at-risk detection requirements

### Existing Code
- `src/app/(coach)/layout.tsx` — Coach layout shell (already exists from Phase 1)
- `src/app/(coach)/dashboard/page.tsx` — Placeholder dashboard page (replace with real implementation)
- `src/lib/actions/social.ts` — sendNudge() server action (reuse for coach nudge)
- `src/lib/queries/habits.ts` — Habit query patterns
- `src/lib/queries/profile.ts` — getRPGStats pattern for user data aggregation
- `src/db/schema/habit-logs.ts` — Habit completion logs (source for engagement calculation)
- `src/db/schema/users.ts` — User table with role column (filter for coach's users)
- `src/db/schema/nudges.ts` — Nudge tracking (check if already nudged today)
- `src/components/ui/pixel-card.tsx` — Card component for user cards
- `src/components/ui/pixel-button.tsx` — Button for nudge action
- `src/components/animations/streak-pulse.tsx` — Pulse animation pattern to reuse for red hearts

### Assets
- `public/assets/icon-heart-green.svg` — Healthy engagement indicator
- `public/assets/icon-heart-yellow.svg` — Moderate engagement indicator
- `public/assets/icon-heart-red.svg` — At-risk engagement indicator
- `public/assets/icon-flame.svg` — Streak flame for user cards
- `public/assets/icon-nudge.svg` — Nudge button icon

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/pixel-card.tsx`: Base card for user grid cards
- `src/components/ui/pixel-button.tsx`: Nudge button
- `src/components/animations/streak-pulse.tsx`: Pulse animation for at-risk heart indicators
- `src/lib/actions/social.ts`: sendNudge() — reuse directly for coach nudge
- `src/lib/queries/profile.ts`: Pattern for aggregating user stats from habit_logs
- `src/lib/utils.ts`: getWeekBounds() for weekly engagement comparison

### Established Patterns
- Server actions in `src/lib/actions/` with iron-session auth via getSession()
- Database queries in `src/lib/queries/` with Drizzle ORM
- Server components fetch data, pass to client components as props
- Client components use "use client" with Motion for animations

### Integration Points
- `src/app/(coach)/dashboard/page.tsx` — Replace placeholder with real dashboard
- `src/app/(coach)/layout.tsx` — Coach shell already routes coach role here
- Coach role check: getSession() returns role="coach" for coach@streakengine.app
- All player users queryable from users table where role != "coach"

</code_context>

<specifics>
## Specific Ideas

- "Users don't usually tell you they're leaving. They just slowly disappear" — the dashboard should make invisible engagement drops visible
- Red hearts should feel urgent but not alarming — the coach is a helper, not a surveillance tool
- Expansion should feel natural — click to see patterns, not a complex drill-down
- Nudge from coach should use the same friendly tone as peer nudges

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-coach-dashboard*
*Context gathered: 2026-03-30*
