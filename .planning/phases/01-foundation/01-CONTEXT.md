# Phase 1: Foundation - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver authentication (3 demo accounts), full database schema, pixel-art design system with Tailwind v4 tokens, and responsive layout shell (mobile bottom tab bar / desktop top nav strip). Users can log in and see a game-styled empty shell routed by role (player → quest board layout, coach → dashboard layout).

</domain>

<decisions>
## Implementation Decisions

### Login Page Design
- Hero image (hero-login.png) displayed prominently as background/decoration — the first visual impression
- Logo.svg wordmark ("STREAK ENGINE") above the login form
- Simple email/password form styled in pixel-art aesthetic (squared inputs, thick borders, pixel font labels)
- Pixel-styled inline error messages below form fields (red border, --color-danger, game-themed copy)
- Always-remember session (persistent cookie) — no "remember me" checkbox needed for demo app
- bg-pattern.png as subtle tileable background texture

### Navigation Behavior
- Mobile: bottom tab bar with 4 items (Home/flame, Quests/sword, Friends/people, Profile/shield)
- Desktop: top nav strip, content area max-width 720px centered
- Active tab: icon color changes to --color-primary with 2px bottom border (per DESIGN-SPEC.md)
- Inactive tabs: --color-text-dim
- No page transitions between tabs — instant content swap for game-snappy feel
- Nav does NOT show streak/XP summary — hero banner on home handles that

### Design System Scope
- Core layout components only in Phase 1: PixelButton, PixelCard, NavBar/TabBar, layout wrappers
- All DESIGN-SPEC.md color tokens defined in Tailwind v4 CSS-first @theme blocks in globals.css
- Press Start 2P + Silkscreen Google Fonts imported and configured
- Squared border utilities (no rounded corners anywhere)
- 3px border-width as default for panels/cards
- Quest-specific components (QuestCard, HeroBanner, ProgressBar) built in Phase 2 when needed
- All 33 pre-generated assets in public/assets/ available via standard Next.js image paths

### Database Schema
- Full schema created upfront: users, habits, habit_logs, streaks, achievements, user_achievements, friendships, challenges
- Avoids migration churn in later phases — all tables ready from day 1
- Users table includes: id, email, password_hash, display_name, role (player/coach), timezone, level, total_xp, created_at
- @neondatabase/serverless with HTTP driver for Vercel compatibility
- Drizzle ORM with drizzle-kit for migrations
- Connection string from DATABASE_URL environment variable

### Authentication
- iron-session for encrypted cookie-based sessions (lightweight, no JWT complexity)
- 3 demo accounts seeded: user@streakengine.app, coach@streakengine.app, new@streakengine.app (all password: demo1234)
- Middleware checks session and redirects unauthenticated users to /login
- Role-based routing: coach role → /coach routes, player role → / (quest board)
- bcrypt for password hashing

### Claude's Discretion
- Exact spacing/padding values within the pixel-art design constraints
- Loading states and skeleton screen designs
- Specific Drizzle schema column types and index choices
- Error boundary implementation details
- Middleware implementation pattern (Next.js middleware vs server action checks)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Visual Design
- `DESIGN-SPEC.md` — Complete design specification: colors, typography, components, layout structure, animations, anti-patterns. This is the authoritative source for all visual decisions.
- `BRIEF.md` — Domain context, user personas, demo data scenarios, game psychology principles

### Assets
- `public/assets/` — 33 pre-generated pixel-art SVG icons, achievement badges, DALL-E hero images, tileable background. Asset manifest in DESIGN-SPEC.md § Asset Manifest.

### Research
- `.planning/research/STACK.md` — Technology recommendations: iron-session, Tailwind v4, Motion v12, @neondatabase/serverless
- `.planning/research/ARCHITECTURE.md` — System structure, 8-table schema design, component boundaries, build order
- `.planning/research/PITFALLS.md` — Neon cold starts, timezone handling, pixel font rendering concerns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/assets/*.svg` — 30 pixel-art SVG icons ready for use (nav icons, habit icons, trophies, hearts, achievements)
- `public/assets/*.png` — 3 DALL-E images (hero-login.png, hero-levelup.png, bg-pattern.png)

### Established Patterns
- None — greenfield project. This phase establishes all patterns.

### Integration Points
- None — first phase. All subsequent phases build on the foundation created here.

</code_context>

<specifics>
## Specific Ideas

- The login page should feel like launching a game, not logging into a tool. Hero-login.png sets the mood.
- "If Duolingo and Minecraft had a baby that tracked your habits" — this aesthetic must be evident from the very first screen
- The pixel fonts (Press Start 2P at 32px for headings, Silkscreen at 12px for body) are small by modern standards — this is intentional for game feel
- Dark theme only. No light mode. Games don't have light mode.
- Bottom tab bar icons are pixel-art style, 24x24, matching the assets in public/assets/

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-30*
