---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [tailwind-v4, pixel-art, design-system, responsive-nav, next-font, google-fonts]

requires:
  - phase: 01-foundation-01
    provides: "Tailwind v4 @theme tokens, Press Start 2P + Silkscreen fonts, route group stubs, auth server actions"
provides:
  - Pixel-art design system with globals.css utilities (bg-game, font-pixel, scrollbar styling)
  - PixelButton component (primary/secondary/danger variants, sm/md/lg sizes)
  - PixelCard component (bg-surface, pixel-border)
  - BottomNav mobile tab bar (4 pixel-art SVG icons, md:hidden)
  - TopNav desktop nav strip (logo, tabs, logout, hidden md:block)
  - Styled login page with hero-login.png, logo.svg, bg-pattern.png background
  - Game layout shell with responsive nav and 720px max-width content
  - Coach layout shell with dedicated nav and COACH DASHBOARD label
affects: [02-core-game-loop, 03-social-achievements, 04-coach-dashboard, 05-demo-deploy]

tech-stack:
  added: [clsx]
  patterns: [pixel-border-utility, bg-game-pattern, bottom-nav-mobile, top-nav-desktop, pixel-button-variants]

key-files:
  created:
    - src/components/ui/pixel-button.tsx
    - src/components/ui/pixel-card.tsx
    - src/components/ui/bottom-nav.tsx
    - src/components/ui/top-nav.tsx
  modified:
    - src/app/globals.css
    - src/app/(auth)/login/page.tsx
    - src/app/(game)/layout.tsx
    - src/app/(game)/page.tsx
    - src/app/(coach)/layout.tsx
    - src/app/(coach)/dashboard/page.tsx

key-decisions:
  - "PixelButton uses Tailwind border-3 utility class instead of inline border style"
  - "Nav tabs use img tags for SVG icons (static assets, not React components)"
  - "Coach layout has its own dedicated nav strip separate from game TopNav"

patterns-established:
  - "PixelButton: variant-based button with 3px border, active:translate-y-[1px] press feel"
  - "PixelCard: bg-surface + pixel-border wrapper for content panels"
  - "BottomNav: fixed bottom, md:hidden, usePathname for active state"
  - "TopNav: hidden md:block, 720px max-width centered, logo + tabs + logout"
  - "Login page: bg-game pattern + hero image + logo + pixel-art form"

requirements-completed: [UIDN-01, UIDN-02, UIDN-03, UIDN-04, UIDN-05, UIDN-06]

duration: 2min
completed: 2026-03-30
---

# Phase 1 Plan 02: UI Design System & Layout Shell Summary

**Pixel-art design system with PixelButton/PixelCard components, responsive bottom/top navigation using SVG icons, and styled login page with hero image and bg-pattern**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-30T09:56:44Z
- **Completed:** 2026-03-30T09:59:07Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Complete pixel-art design system: globals.css with scrollbar styling, bg-game tileable pattern, font-pixel utility
- Reusable PixelButton (3 variants, 3 sizes, active press feedback) and PixelCard components
- Mobile bottom tab bar with 4 pixel-art SVG icons (flame/sword/people/shield) and active state indicators
- Desktop top nav strip with logo, tabs, logout button, 720px max-width content
- Login page fully styled with hero-login.png, logo.svg wordmark, bg-pattern.png background, pixel-art form inputs
- Game and coach layout shells with distinct navigation patterns

## Task Commits

Each task was committed atomically:

1. **Task 1: Design system -- Tailwind v4 tokens, global styles, fonts, and core UI components** - `7efca3e` (feat)
2. **Task 2: Responsive navigation (BottomNav + TopNav) and styled login page** - `82ed7da` (feat)

## Files Created/Modified
- `src/app/globals.css` - Added scrollbar styling, bg-game pattern, font-pixel utility
- `src/components/ui/pixel-button.tsx` - Squared pixel-art button with variant/size system
- `src/components/ui/pixel-card.tsx` - Squared pixel-art card/panel component
- `src/components/ui/bottom-nav.tsx` - Mobile bottom tab bar with 4 SVG icon tabs
- `src/components/ui/top-nav.tsx` - Desktop top nav strip with logo, tabs, logout
- `src/app/(auth)/login/page.tsx` - Full pixel-art login with hero image, logo, bg-pattern
- `src/app/(game)/layout.tsx` - Game shell with TopNav + BottomNav + 720px content
- `src/app/(game)/page.tsx` - Quest board placeholder with empty-quests.svg and PixelCard
- `src/app/(coach)/layout.tsx` - Coach shell with dedicated nav and COACH DASHBOARD label
- `src/app/(coach)/dashboard/page.tsx` - Coach dashboard placeholder with PixelCard

## Decisions Made
- PixelButton uses Tailwind border-3 utility class rather than inline CSS border style for consistency
- Nav tab icons use img tags referencing /assets/ paths (static assets, not imported React components)
- Coach layout has its own dedicated nav strip separate from game TopNav to allow distinct branding

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All UI components ready for Phase 2 (PixelButton, PixelCard, BottomNav, TopNav)
- Layout shells render correctly with responsive breakpoints
- Login page fully styled and functional with useActionState
- Quest board and coach dashboard have placeholder content ready to be replaced

## Self-Check: PASSED

- All 11 key files verified present
- All 2 task commits verified (7efca3e, 82ed7da)
- Build passes with zero errors

---
*Phase: 01-foundation*
*Completed: 2026-03-30*
