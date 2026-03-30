# Technology Stack

**Project:** StreakEngine -- Habit & Health Gamification Platform
**Researched:** 2026-03-30

## Recommended Stack

### Core Framework (Mandated)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x (latest stable) | Full-stack React framework | Mandated. App Router for RSC, server actions, API routes. Vercel-native deployment. |
| React | 19.x | UI rendering | Ships with Next.js 15. Needed for server components, `useOptimistic` for instant quest completion feedback. |
| TypeScript | 5.x | Type safety | Non-negotiable for a project with complex gamification state (XP, streaks, multipliers, levels). |

### Database & ORM (Mandated)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon Postgres | -- | Primary database | Mandated. Serverless Postgres, scales to zero, branches for dev. Perfect for Vercel deployment. |
| `drizzle-orm` | 0.45.x | ORM / query builder | Mandated. Type-safe SQL, lightweight, excellent Neon integration via `drizzle-orm/neon-http`. |
| `drizzle-kit` | latest | Migrations & introspection | Companion to drizzle-orm. Generates and runs migrations. `drizzle-kit push` for rapid dev, `drizzle-kit generate` for production migrations. |
| `@neondatabase/serverless` | 1.0.x | Neon driver | HTTP-based driver for serverless. Use `neon-http` mode with Drizzle (not WebSocket) since Vercel functions are short-lived. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first config in v4 makes custom design tokens trivial. Define all pixel-art color tokens, thick borders, squared corners directly in CSS with `@theme`. No config file needed. |
| `@tailwindcss/postcss` | 4.x | PostCSS integration | Required for Next.js integration with Tailwind v4. Replaces the old tailwind.config.js approach. |
| Google Fonts (Press Start 2P, Silkscreen) | -- | Pixel-art typography | Loaded via `next/font/google`. Both are bitmap/pixel fonts specified in the design spec. |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `iron-session` | 8.x | Encrypted cookie sessions | Lightweight, zero-dependency session management. Perfect for demo apps with cookie-based auth. No external auth providers needed. Works with App Router via `cookies()` from `next/headers`. |
| `bcryptjs` | 2.x | Password hashing | Pure JS bcrypt implementation. Use `bcryptjs` (not `bcrypt`) because it has no native dependencies, works everywhere Next.js runs, and avoids Edge Runtime issues. |

**Why not NextAuth/Auth.js:** Overkill for a demo app with 3 hardcoded accounts and email/password only. iron-session is 10x simpler -- encrypt user ID into a cookie, read it back on every request. No providers, no callbacks, no database adapters.

**Why not Better-Auth:** Newer library with good DX but unnecessary complexity for credential-only demo auth. iron-session is battle-tested and minimal.

### Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `motion` (formerly framer-motion) | 12.x | React animations | The design spec demands 4 specific animations (XP float, streak pulse, level-up flash, quest complete stamp). Motion provides `AnimatePresence`, layout animations, and spring physics needed for game-feel microinteractions. Import from `motion/react`. |

**Why not CSS-only animations:** The XP float (spawn at element, float upward, fade) and quest complete stamp (appear, rotate, settle) require coordinated mount/unmount animations that CSS alone handles poorly. Motion's `AnimatePresence` makes exit animations trivial.

**Why not GSAP:** Heavier, imperative API, licensing concerns for commercial use. Motion is React-native and declarative.

### Date & Time

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `date-fns` | 3.x | Date manipulation | Streak calculations (consecutive days), weekly resets (every Monday), "time since last activity" for at-risk detection. Tree-shakeable, functional style, ~3KB for the functions we need. |

**Why not dayjs:** Both work fine. date-fns is more natural in a functional React codebase (pure functions vs. chainable objects). Tree-shaking is better with date-fns since you import only what you use.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` | 2.x | Conditional classnames | Everywhere -- toggling active states on quest cards, leaderboard highlights, streak danger states. |
| `zod` | 3.x | Schema validation | Validate server action inputs (habit completion, login forms). Type-safe at runtime boundaries. |
| `next-themes` | -- | **DO NOT USE** | Dark theme only. No theme switching needed. Set dark colors in CSS variables directly. |

### Dev Dependencies

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `drizzle-kit` | latest | DB migrations | Companion to drizzle-orm. |
| `dotenv` | 16.x | Env var loading | For local dev DATABASE_URL. Vercel handles prod. |
| `eslint` | 9.x | Linting | Ships with create-next-app. |
| `@types/bcryptjs` | 2.x | Type definitions | TypeScript support for bcryptjs. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth | iron-session | NextAuth/Auth.js | Massive overkill for 3 demo accounts with password login. Adds provider abstraction, database adapter, callback chains -- none needed here. |
| Auth | iron-session | Better-Auth | Good library but unnecessary abstraction layer for simple cookie auth. |
| Animation | motion | CSS keyframes | Cannot handle mount/unmount animations (XP float appearing and disappearing) or coordinated sequences. |
| Animation | motion | react-spring | Less ecosystem support, fewer examples, motion is the React animation standard. |
| Dates | date-fns | dayjs | Both work. date-fns tree-shakes better and has a more functional API. |
| Dates | date-fns | Native Intl/Date | Streak calculation across timezones, "start of week" logic, and relative time formatting are painful with raw Date API. |
| Styling | Tailwind v4 | CSS Modules | The pixel-art design system has 12+ color tokens, thick borders, and specific component patterns. Utility classes compose these faster than writing custom CSS for every component. |
| Styling | Tailwind v4 | Styled Components | Runtime CSS-in-JS is being deprecated in the React ecosystem. Tailwind is zero-runtime. |
| ORM | Drizzle | Prisma | Mandated choice aside, Drizzle is lighter, faster cold starts on serverless, and the SQL-like API is more predictable for complex queries (leaderboard rankings, streak calculations). |
| State | React state + server actions | Zustand/Redux | No complex client state. Habits, XP, streaks all live in the DB. Server actions handle mutations, RSC handles reads. Client state is limited to UI (animation triggers, optimistic updates). |

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Prisma | Not mandated, heavier bundle, slower cold starts on Vercel serverless. |
| NextAuth/Auth.js | Massive abstraction for simple password auth. |
| Redux/Zustand | No complex client-side state to manage. Server components + server actions handle everything. |
| next-themes | Dark-only app. Unnecessary dependency. |
| shadcn/ui | Components are rounded, minimal, corporate -- the exact opposite of the pixel-art game aesthetic. Would fight the design system constantly. |
| Radix UI | Same problem as shadcn -- designed for accessible corporate UIs, not blocky game interfaces. Build custom pixel components instead. |
| Chart.js / Recharts | The coach dashboard uses pixel-art styled engagement indicators (flame intensity, heart colors), not standard charts. Custom pixel components are more appropriate. |
| Socket.io / real-time | Out of scope per PROJECT.md. All interactions are request/response. |

## Installation

```bash
# Initialize Next.js project with Tailwind v4
npx create-next-app@latest streakengine --ts --tailwind --eslint --app --src-dir

# Core dependencies
npm install drizzle-orm @neondatabase/serverless iron-session bcryptjs motion date-fns clsx zod

# Dev dependencies
npm install -D drizzle-kit @types/bcryptjs dotenv
```

## Key Configuration Notes

### Drizzle + Neon Connection

```typescript
// src/lib/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

Use `neon-http` (not `neon-serverless` WebSocket mode). HTTP is simpler, stateless, and matches Vercel's serverless model.

### Tailwind v4 CSS-First Config

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-bg: #1A1A2E;
  --color-surface: #16213E;
  --color-surface-raised: #0F3460;
  --color-border: #533483;
  --color-primary: #E94560;
  --color-secondary: #FFD460;
  --color-accent: #00D2FF;
  --color-xp-bar: #A855F7;
  /* ... all design tokens from DESIGN-SPEC.md */
}
```

### iron-session Setup

```typescript
// src/lib/session.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: number;
  role: "user" | "admin";
  isLoggedIn: boolean;
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: "streakengine-session",
  });
}
```

### Motion Animation Import

```typescript
// Use the new import path (not framer-motion)
import { motion, AnimatePresence } from "motion/react";
```

## Confidence Assessment

| Technology | Confidence | Reason |
|------------|------------|--------|
| Next.js 15 + App Router | HIGH | Official docs, widely deployed, mandated |
| Drizzle ORM 0.45.x | HIGH | Official Neon integration docs, actively maintained |
| @neondatabase/serverless 1.0.x | HIGH | Official Neon docs, stable v1 release |
| Tailwind CSS v4 | HIGH | Official docs, Next.js integration documented |
| iron-session 8.x | HIGH | Official Next.js auth guide recommends it for stateless sessions |
| bcryptjs | HIGH | Standard approach, documented in Next.js auth guide |
| motion 12.x | HIGH | Dominant React animation library, v12 stable |
| date-fns 3.x | HIGH | Stable, tree-shakeable, widely used |
| zod 3.x | HIGH | De facto validation standard in Next.js ecosystem |

## Sources

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official session management recommendations
- [Drizzle ORM + Neon Setup](https://orm.drizzle.team/docs/get-started/neon-new) - Official integration guide
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver) - Driver documentation
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) - v4 release and CSS-first config
- [Motion for React](https://motion.dev/docs/react) - Animation library docs
- [iron-session GitHub](https://github.com/vvo/iron-session) - Session management library
- [drizzle-orm npm](https://www.npmjs.com/package/drizzle-orm) - Latest version 0.45.2
- [@neondatabase/serverless npm](https://www.npmjs.com/package/@neondatabase/serverless) - Latest version 1.0.2
