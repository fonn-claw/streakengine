# Phase 3: Social & Achievements - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver weekly leaderboard with friend competition, achievement/badge system with unlock triggers and celebration animations, friends list with nudge mechanic, weekly challenge progress, and full profile character sheet with RPG stat block and habit XP breakdown. Coach dashboard is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Leaderboard Display
- Compact top-3 peek on home page below the quest board (shows rank, name, weekly XP, trophy icon)
- Full leaderboard on dedicated /quests page (all friends ranked)
- Top 3 get trophy icons: icon-trophy-gold.svg (#1), icon-trophy-silver.svg (#2), icon-trophy-bronze.svg (#3)
- icon-crown.svg displayed next to #1 rank name
- Current user's row highlighted with --color-primary 4px left border, always visible even if not in top 3
- "Resets Monday" text below leaderboard in --color-text-dim
- Weekly reset is server-side: compare current week number, recalculate from habit_logs XP sums
- LDBD-05: Reset happens via date comparison, not cron — query filters by current week's Monday-Sunday range

### Achievement System
- 4 pre-defined achievements using existing SVG badges:
  - "First Week" (achievement-streak-7.svg) — 7-day streak reached
  - "Streak Master" (achievement-streak-30.svg) — 30-day streak reached
  - "Early Bird" (achievement-early-bird.svg) — Complete a habit before 7am
  - "Social Butterfly" (achievement-social.svg) — Added 5 friends
- Achievement grid on profile: 3-column layout using badge-frame.svg as container
- Locked achievements: dark square with icon-lock.svg overlay, "?" text, --color-surface-raised background
- Unlocked achievements: full color badge, name below in Silkscreen font
- Unlock triggers evaluated server-side after each habit completion — server action returns newly unlocked achievement IDs
- Achievement unlock celebration: badge scales 0→1.1→1.0 over 400ms, 4-6 pixel sparkle particles (small colored squares) scatter outward, --color-secondary glow border for 1s

### Friends & Nudges
- Friends list on dedicated /friends page (bottom nav "Friends" tab already exists)
- Each friend displayed as PixelCard row: display name, streak flame count, level badge, last active indicator
- Sorted by most active first (last habit completion date)
- Friends' streak and level visible if friendship exists (SOCL-02)
- Nudge mechanic: in-app only — stored in nudges table, shown as notification dot on Friends tab
- Fixed nudge text: "Hey! You haven't logged today!" with icon-nudge.svg
- One nudge per friend per day (prevent spam)
- Nudge appears as toast notification when recipient opens app
- Weekly challenge: blocky progress blocks (reuse Phase 2 pattern), show participating users' progress side-by-side on a challenge card with --color-surface background

### Profile Character Sheet
- Lives on /profile page (bottom nav "Profile" tab already exists)
- Layout top-to-bottom: avatar area (hero-levelup.png background) with level, display name, total XP → RPG stat block → achievement grid → habit XP breakdown
- RPG stat mapping:
  - STR (Strength) = Exercise XP percentage of total
  - INT (Intelligence) = Meditation XP percentage of total
  - DEX (Dexterity) = Water consistency (% of days target met)
  - CHA (Charisma) = Social actions count (friends added + nudges sent)
- Stats displayed as pixel bar charts with stat name label and value
- Achievement grid: 3 columns of square badges (PROF-03), reuses achievement display from ACHV section
- Habit XP breakdown: horizontal pixel bars per habit type showing % of total XP, with habit icon + name + absolute XP value

### Claude's Discretion
- Exact nudge notification implementation (toast vs inline banner)
- Loading states for leaderboard and friends list
- Empty state designs (use empty-friends.svg for friends, empty-quests.svg for empty leaderboard)
- Stat bar animation on profile load
- How to structure nudges DB table

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Design
- `DESIGN-SPEC.md` — Complete design specification. §Key Components for achievement badges, leaderboard rows, profile layout. §Motion for celebration animations.
- `BRIEF.md` — Domain context, friend/rival dynamics, achievement surprise/delight philosophy, weekly leaderboard mechanics

### Existing Code
- `src/db/schema/achievements.ts` — Achievement table schema
- `src/db/schema/user-achievements.ts` — User-achievement junction table
- `src/db/schema/friendships.ts` — Friendship table schema
- `src/db/schema/challenges.ts` — Challenge table schema
- `src/db/schema/users.ts` — User table with level, total_xp
- `src/db/schema/habit-logs.ts` — Habit completion logs (for XP calculations)
- `src/db/schema/streaks.ts` — Streak data (for achievement triggers)
- `src/lib/engine/xp.ts` — XP calculation functions (reuse for leaderboard)
- `src/lib/engine/streak.ts` — Streak evaluation logic (reuse for achievement checks)
- `src/lib/queries/habits.ts` — Habit query patterns to follow
- `src/lib/queries/streaks.ts` — Streak query patterns to follow
- `src/lib/actions/habits.ts` — Server action pattern to follow
- `src/components/ui/pixel-card.tsx` — Card component for friend rows and achievement cards
- `src/components/ui/pixel-button.tsx` — Button for nudge action
- `src/components/quest-card.tsx` — Progress block pattern to reuse for challenges

### Assets
- `public/assets/achievement-early-bird.svg` — Early Bird badge
- `public/assets/achievement-social.svg` — Social Butterfly badge
- `public/assets/achievement-streak-30.svg` — Streak Master badge
- `public/assets/achievement-streak-7.svg` — First Week badge
- `public/assets/badge-frame.svg` — Achievement grid frame
- `public/assets/icon-trophy-gold.svg` — 1st place trophy
- `public/assets/icon-trophy-silver.svg` — 2nd place trophy
- `public/assets/icon-trophy-bronze.svg` — 3rd place trophy
- `public/assets/icon-crown.svg` — Crown for #1 rank
- `public/assets/icon-people.svg` — Friends icon
- `public/assets/icon-nudge.svg` — Nudge icon
- `public/assets/icon-lock.svg` — Locked achievement overlay
- `public/assets/icon-heart-green.svg` — Healthy engagement
- `public/assets/icon-heart-yellow.svg` — Moderate engagement
- `public/assets/icon-heart-red.svg` — At-risk engagement
- `public/assets/empty-friends.svg` — Empty friends state
- `public/assets/empty-quests.svg` — Empty state fallback
- `public/assets/hero-levelup.png` — Profile header background

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/pixel-card.tsx`: Base card for friend rows, achievement cards, leaderboard rows
- `src/components/ui/pixel-button.tsx`: Button variants for nudge send action
- `src/components/quest-card.tsx`: Progress block rendering pattern — reuse for weekly challenge progress
- `src/components/xp-bar.tsx`: Segmented bar pattern — reuse for RPG stat bars on profile
- `src/components/animations/`: All 4 animation components — follow Motion v12 patterns for sparkle animation
- `src/lib/engine/xp.ts`: levelForXp(), xpForLevel(), xpProgress() — reuse for leaderboard ranking and profile display
- `src/lib/engine/streak.ts`: evaluateStreak() — reuse for achievement trigger checks

### Established Patterns
- Server actions in `src/lib/actions/` with iron-session auth via getSession()
- Database queries in `src/lib/queries/` with Drizzle ORM
- Pure engine functions in `src/lib/engine/` for domain logic
- Client components use "use client" with Motion for animations
- Server components fetch data and pass to client components as props

### Integration Points
- `src/app/(game)/page.tsx` — Add leaderboard peek below quest board
- `src/app/(game)/layout.tsx` — Game shell already wraps all player pages
- Bottom nav already has Friends and Profile tabs — need to wire /friends and /profile pages
- `src/db/schema/index.ts` — Barrel export for all schema, add any new tables here
- `src/db/relations.ts` — Add relations for any new tables

</code_context>

<specifics>
## Specific Ideas

- Achievements should feel surprising, not a checklist to grind through — unlock triggers should feel like natural milestones
- "Friendly competition creates accountability" — leaderboard is about motivation, not shaming
- Trophy icons for top 3 create aspirational targets without making others feel bad
- Nudges are playful, not passive-aggressive — "Hey! You haven't logged today!" with fun pixel icon
- Profile is a "character sheet" — lean into RPG stat block aesthetic hard
- Use hero-levelup.png as profile header background for celebratory feel

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-social-achievements*
*Context gathered: 2026-03-30*
