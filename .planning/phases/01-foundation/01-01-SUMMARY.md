---
phase: 01-foundation
plan: 01
subsystem: database, auth
tags: [next.js-16, drizzle-orm, neon-postgres, iron-session, bcryptjs, tailwind-v4, pixel-art]

requires: []
provides:
  - 8-table Drizzle ORM schema on Neon Postgres (users, habits, habit_logs, streaks, achievements, user_achievements, friendships, challenges)
  - iron-session auth with getSession/requireAuth helpers
  - Login/logout server actions with zod validation
  - proxy.ts auth redirect and role-based routing
  - 3 demo account seed script
  - Pixel-art design tokens in Tailwind v4 @theme
  - Press Start 2P + Silkscreen Google Fonts
affects: [01-02, 02-core-game-loop, 03-social-achievements, 04-coach-dashboard, 05-demo-deploy]

tech-stack:
  added: [next.js-16.2.1, react-19.2.4, drizzle-orm-0.45.2, neon-serverless-1.0.2, iron-session-8.0.4, bcryptjs-3.0.3, motion-12.38.0, zod-3.25.x, date-fns-4.1.0, clsx-2.1.1, tailwind-v4.2.2]
  patterns: [proxy.ts-auth-redirect, async-cookies, neon-http-driver, css-first-tailwind-theme, pixel-art-no-rounded-corners]

key-files:
  created:
    - src/db/schema/users.ts
    - src/db/schema/habits.ts
    - src/db/schema/habit-logs.ts
    - src/db/schema/streaks.ts
    - src/db/schema/achievements.ts
    - src/db/schema/user-achievements.ts
    - src/db/schema/friendships.ts
    - src/db/schema/challenges.ts
    - src/db/index.ts
    - src/db/relations.ts
    - src/db/seed.ts
    - src/lib/auth.ts
    - src/lib/actions/auth.ts
    - src/app/proxy.ts
    - drizzle.config.ts
  modified:
    - package.json
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "Used proxy.ts (Next.js 16 pattern) instead of middleware.ts"
  - "VARCHAR date columns for timezone-safe streak tracking"
  - "Zod 3 over Zod 4 for stability and ecosystem compatibility"
  - "Neon HTTP driver for serverless cold start optimization"

patterns-established:
  - "proxy.ts: auth check and role-based routing via iron-session"
  - "Async cookies(): always await cookies() before passing to getIronSession"
  - "Tailwind v4 @theme: design tokens as CSS variables, no JS config"
  - "Pixel-art aesthetic: border-radius: 0 globally, 3px borders, squared edges"
  - "Server actions: login/logout as 'use server' functions with zod validation"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, UIDN-07]

duration: 5min
completed: 2026-03-30
---

# Phase 1 Plan 01: Database, Auth & Project Foundation Summary

**8-table Drizzle schema on Neon Postgres with iron-session cookie auth, proxy.ts role routing, and pixel-art Tailwind v4 design tokens**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-30T09:48:03Z
- **Completed:** 2026-03-30T09:53:53Z
- **Tasks:** 3
- **Files modified:** 36

## Accomplishments
- Next.js 16.2.1 project scaffolded with Turbopack, Tailwind v4 CSS-first config, and all dependencies
- Complete 8-table Drizzle ORM schema with relations, Neon HTTP driver connection, and 3-account seed script
- iron-session auth with 30-day persistent cookies, login/logout server actions, proxy.ts auth redirect and role-based routing
- All route group stubs: (auth)/login, (game)/{home,quests,friends,profile}, (coach)/dashboard

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 project and install all dependencies** - `ef8e12f` (feat)
2. **Task 2: Create complete 8-table Drizzle schema, DB connection, relations, and seed script** - `4239312` (feat)
3. **Task 3: Implement iron-session auth with login/logout server actions and proxy.ts routing** - `0bfe207` (feat)

## Files Created/Modified
- `package.json` - Next.js 16 project with all dependencies and db scripts
- `drizzle.config.ts` - Drizzle Kit config for Neon Postgres
- `src/app/globals.css` - Tailwind v4 @theme with pixel-art design tokens
- `src/app/layout.tsx` - Root layout with Press Start 2P + Silkscreen fonts
- `src/db/schema/*.ts` - 8 schema files (users, habits, habit_logs, streaks, achievements, user_achievements, friendships, challenges)
- `src/db/index.ts` - Neon HTTP driver + Drizzle connection
- `src/db/relations.ts` - All table relations
- `src/db/seed.ts` - 3 demo account seeder
- `src/lib/auth.ts` - iron-session getSession/requireAuth helpers
- `src/lib/actions/auth.ts` - Login/logout server actions with zod validation
- `src/app/proxy.ts` - Auth redirect and role-based routing
- `src/app/(auth)/login/page.tsx` - Login form with useActionState
- `src/app/(game)/*.tsx` - Game route stubs (home, quests, friends, profile)
- `src/app/(coach)/dashboard/page.tsx` - Coach dashboard stub

## Decisions Made
- Used proxy.ts (Next.js 16 pattern) instead of deprecated middleware.ts
- VARCHAR date columns for streak tracking to avoid timezone conversion issues
- Zod 3 over Zod 4 for stability and ecosystem compatibility
- Neon HTTP driver for serverless cold start optimization
- Separate seed.ts with its own Drizzle connection (not importing from src/db/index.ts which relies on Next.js env loading)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npx` command not working directly in the environment -- resolved by using `npm exec -- create-next-app@latest` instead
- create-next-app cannot scaffold into a directory with existing files -- scaffolded to /tmp and copied files back

## User Setup Required

DATABASE_URL must be set to a valid Neon Postgres connection string before running `npm run db:push` and `npm run db:seed`.

## Next Phase Readiness
- All route stubs ready for Plan 02 UI shell (nav components, layout wrappers, design system components)
- Auth system complete and ready for integration testing once DATABASE_URL is configured
- Design tokens established in Tailwind v4 @theme for consistent pixel-art styling

## Self-Check: PASSED

- All 22 key files verified present
- All 3 task commits verified (ef8e12f, 4239312, 0bfe207)
- Build passes with zero errors

---
*Phase: 01-foundation*
*Completed: 2026-03-30*
