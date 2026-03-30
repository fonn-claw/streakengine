# Phase 1: Foundation - Research

**Researched:** 2026-03-30
**Domain:** Auth, database schema, pixel-art design system, layout shell (Next.js 16 + Neon Postgres + Tailwind v4)
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire foundation: authentication with iron-session, the complete 8-table Drizzle ORM schema on Neon Postgres, a pixel-art design system using Tailwind v4 CSS-first tokens, and the responsive layout shell (mobile bottom tab bar / desktop top nav strip). The three demo accounts must be functional.

**Critical version discovery:** Next.js is now at **16.2.1** (not 15.x as in the earlier stack research). This introduces several breaking changes that affect Phase 1 directly: `middleware.ts` is renamed to `proxy.ts`, the `cookies()` API is fully async (no sync fallback), Turbopack is the default bundler, and ESLint flat config is the default. The STACK.md research assumed Next.js 15 -- all patterns remain valid but naming and async handling must be updated.

**Primary recommendation:** Use Next.js 16.2.1 with `proxy.ts` (not middleware.ts), fully async `cookies()` calls in iron-session, Tailwind v4 CSS-first `@theme` config, and Drizzle ORM 0.45.2 with `@neondatabase/serverless` HTTP driver. Use Zod 3.x (not 4.x) to avoid unnecessary migration complexity for a greenfield project -- Zod 4 has significant API changes and most examples/tutorials still target v3.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Login page: hero-login.png as background/decoration, logo.svg wordmark above form, email/password form with pixel-art styling, inline error messages, always-remember session (persistent cookie), bg-pattern.png as tileable background
- Navigation: Mobile bottom tab bar (4 items: Home/flame, Quests/sword, Friends/people, Profile/shield), Desktop top nav strip, content max-width 720px centered, active tab with --color-primary + 2px bottom border, no page transitions, nav does NOT show streak/XP
- Design system scope: Core layout components only (PixelButton, PixelCard, NavBar/TabBar, layout wrappers), all DESIGN-SPEC.md color tokens in Tailwind v4 @theme, Press Start 2P + Silkscreen Google Fonts, squared borders (no rounded corners), 3px border-width default. Quest-specific components deferred to Phase 2.
- Database: Full schema upfront (users, habits, habit_logs, streaks, achievements, user_achievements, friendships, challenges). Users table includes timezone column. @neondatabase/serverless with HTTP driver. Drizzle ORM with drizzle-kit.
- Authentication: iron-session for encrypted cookie sessions, 3 demo accounts seeded (user/coach/new @streakengine.app, all demo1234), proxy checks session and redirects unauthenticated to /login, role-based routing (coach -> /coach, player -> /)
- bcrypt for password hashing

### Claude's Discretion
- Exact spacing/padding values within pixel-art design constraints
- Loading states and skeleton screen designs
- Specific Drizzle schema column types and index choices
- Error boundary implementation details
- Proxy implementation pattern (Next.js proxy vs server action checks)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password (3 demo accounts) | iron-session 8.0.4 + bcryptjs 3.0.3, login server action, proxy.ts redirect pattern |
| AUTH-02 | User session persists across browser refresh (cookie-based) | iron-session encrypted cookies with long TTL, always-remember pattern |
| AUTH-03 | User can log out from any page | Server action to destroy session, redirect to /login |
| AUTH-04 | Different UI routes based on user role (player vs coach) | Route groups: (game) for players, (coach) for coaches, proxy.ts role check |
| UIDN-01 | Pixel-art game aesthetic with squared edges, thick borders (3px), bold colors | Tailwind v4 @theme tokens, custom utility classes, no rounded corners |
| UIDN-02 | Dark theme only (--color-bg: #1A1A2E) | CSS variables in @theme block, no theme switching |
| UIDN-03 | Press Start 2P font for headings/numbers, Silkscreen for body text | next/font/google import, CSS variable assignment |
| UIDN-04 | Mobile-first stacked layout with bottom tab bar | BottomNav component, 4 tabs with pixel-art SVG icons from public/assets/ |
| UIDN-05 | Desktop: top nav strip, content max-width 720px centered | TopNav component, responsive breakpoint switching |
| UIDN-06 | All pre-generated pixel-art assets from public/assets/ used appropriately | 33 assets available (30 SVG + 3 PNG), referenced via /assets/ paths |
| UIDN-07 | Rewarding animations: XP float, streak pulse, level-up flash, quest complete stamp | Motion 12.38.0 installed in Phase 1; actual animation components built when needed in Phase 2-3. Phase 1 installs the library only. |
</phase_requirements>

## Standard Stack

### Core (Verified 2026-03-30)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack React framework | Latest stable. App Router, Turbopack default, proxy.ts for auth redirects. |
| React | 19.2.x | UI rendering | Ships with Next.js 16. Server Components, useOptimistic. |
| TypeScript | 5.x | Type safety | Ships with create-next-app. |
| Tailwind CSS | 4.2.2 | Utility-first CSS | CSS-first config via @theme directive. No tailwind.config.js needed. |
| @tailwindcss/postcss | 4.2.2 | PostCSS integration | Required for Next.js + Tailwind v4 integration. |
| drizzle-orm | 0.45.2 | Type-safe ORM | Mandated. Excellent Neon HTTP integration. |
| @neondatabase/serverless | 1.0.2 | Neon Postgres driver | HTTP mode for serverless. No WebSocket needed for short-lived functions. |
| iron-session | 8.0.4 | Encrypted cookie sessions | Lightweight, zero-dep, App Router compatible via async cookies(). |
| bcryptjs | 3.0.3 | Password hashing | Pure JS, no native deps, built-in TypeScript types (no @types needed). |
| motion | 12.38.0 | React animations | For Phase 2+ animations. Install now, use later. Import from "motion/react". |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional classnames | All component className logic |
| zod | 3.24.x | Schema validation | Use Zod 3, NOT Zod 4. Zod 4 has breaking API changes (z.strictObject replaces .strict(), UUID validation changed, error APIs overhauled). Zod 3 is stable and well-documented. |
| date-fns | 4.1.0 | Date manipulation | Streak calculations, weekly resets. v4 is latest stable. |

### Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| drizzle-kit | 0.31.10 | DB migrations and push |
| dotenv | 16.x | Local env var loading |

### What Changed from STACK.md

| Item | STACK.md Said | Actual Current |
|------|---------------|----------------|
| Next.js | 15.x | **16.2.1** -- breaking changes (proxy.ts, async cookies, Turbopack default) |
| bcryptjs | 2.x + @types/bcryptjs | **3.0.3** with built-in types -- drop @types/bcryptjs |
| zod | 3.x | **4.3.6 available** but use 3.24.x for stability |
| date-fns | 3.x | **4.1.0** -- major version bump, tree-shakeable |

**Installation:**
```bash
# Initialize Next.js 16 project
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir

# Core dependencies
npm install drizzle-orm @neondatabase/serverless iron-session bcryptjs motion date-fns clsx zod@3

# Dev dependencies
npm install -D drizzle-kit dotenv
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 scope)
```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Login page with hero image
│   ├── (game)/
│   │   ├── layout.tsx            # Player shell: bottom nav (mobile), top nav (desktop)
│   │   ├── page.tsx              # Home (empty shell in Phase 1)
│   │   ├── quests/page.tsx       # Placeholder
│   │   ├── friends/page.tsx      # Placeholder
│   │   └── profile/page.tsx      # Placeholder
│   ├── (coach)/
│   │   ├── layout.tsx            # Coach shell (different nav)
│   │   └── dashboard/page.tsx    # Placeholder
│   ├── layout.tsx                # Root: fonts, globals.css, <html> dark theme
│   └── proxy.ts                  # Auth redirect + role routing (NOT middleware.ts)
├── components/
│   └── ui/
│       ├── pixel-button.tsx      # Squared button with 3px border
│       ├── pixel-card.tsx        # Squared card/panel component
│       ├── bottom-nav.tsx        # Mobile tab bar
│       └── top-nav.tsx           # Desktop nav strip
├── lib/
│   ├── auth.ts                   # iron-session helpers (getSession, requireAuth)
│   └── actions/
│       └── auth.ts               # login/logout server actions
├── db/
│   ├── index.ts                  # Drizzle client + Neon connection
│   ├── schema/
│   │   ├── users.ts
│   │   ├── habits.ts
│   │   ├── habit-logs.ts
│   │   ├── streaks.ts
│   │   ├── achievements.ts
│   │   ├── user-achievements.ts
│   │   ├── friendships.ts
│   │   └── challenges.ts
│   ├── relations.ts              # All Drizzle relations (avoids circular deps)
│   └── seed.ts                   # Seed 3 demo accounts only (full seed in Phase 5)
└── styles/
    └── globals.css               # @theme tokens, pixel font config, utilities
```

### Pattern 1: Next.js 16 Proxy for Auth (NOT middleware.ts)

**What:** Next.js 16 renamed middleware.ts to proxy.ts. The exported function must be named `proxy` (not `middleware`). Runs on Node.js runtime (not Edge).

**When to use:** Auth redirect checks on every navigation.

**Example:**
```typescript
// src/app/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),  // MUST await - no sync access in Next.js 16
    sessionOptions
  );

  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === "/login") {
    if (session.isLoggedIn) {
      // Redirect logged-in users away from login
      const url = session.role === "coach" ? "/coach/dashboard" : "/";
      return NextResponse.redirect(new URL(url, request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role routing
  if (pathname.startsWith("/coach") && session.role !== "coach") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
```

**CRITICAL NOTE:** In Next.js 16, `cookies()` from `next/headers` MUST be awaited. The sync fallback from Next.js 15 is removed. This affects iron-session's `getIronSession()` call -- always pass `await cookies()`.

### Pattern 2: iron-session with Async Cookies

**What:** Session helper that wraps iron-session with Next.js 16's async cookies API.

```typescript
// src/lib/auth.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: number;
  role: "player" | "coach";
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "streakengine-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    // Long TTL for always-remember behavior
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Unauthorized");
  }
  return session;
}
```

### Pattern 3: Tailwind v4 CSS-First Design Tokens

**What:** All pixel-art design tokens defined in globals.css using @theme directive. No tailwind.config.js needed.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors from DESIGN-SPEC.md */
  --color-bg: #1A1A2E;
  --color-surface: #16213E;
  --color-surface-raised: #0F3460;
  --color-border: #533483;
  --color-primary: #E94560;
  --color-secondary: #FFD460;
  --color-accent: #00D2FF;
  --color-text: #EAEAEA;
  --color-text-dim: #8B8B9E;
  --color-success: #4ADE80;
  --color-warning: #FBBF24;
  --color-danger: #F43F5E;
  --color-xp-bar: #A855F7;

  /* Font families (assigned via next/font CSS variables) */
  --font-heading: var(--font-press-start);
  --font-body: var(--font-silkscreen);
}

/* Pixel-art utilities -- no rounded corners anywhere */
* {
  border-radius: 0 !important;
}

/* Default thick border for panels */
.pixel-border {
  border: 3px solid var(--color-border);
}

/* Body defaults */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}
```

### Pattern 4: Google Fonts via next/font

```typescript
// src/app/layout.tsx
import { Press_Start_2P, Silkscreen } from "next/font/google";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-silkscreen",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pressStart.variable} ${silkscreen.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Pattern 5: Drizzle + Neon HTTP Connection

```typescript
// src/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Anti-Patterns to Avoid

- **Using middleware.ts:** Next.js 16 renamed it to proxy.ts. Using the old name is deprecated and will break.
- **Sync cookies() access:** Removed in Next.js 16. Always `await cookies()`.
- **tailwind.config.js for colors:** Tailwind v4 uses CSS-first @theme. No JS config needed for design tokens.
- **@types/bcryptjs:** bcryptjs 3.x includes its own types. Installing @types/bcryptjs will cause duplicate type errors.
- **Zod 4 for a new project:** Zod 4 has significant API changes (z.strictObject, new error APIs). Most tutorials and examples target Zod 3. Use `zod@3` explicitly.
- **Rounded corners anywhere:** The design spec forbids them. Use `border-radius: 0 !important` globally.
- **shadcn/ui or Radix UI:** Corporate aesthetic, fights the pixel-art design. Build custom components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session encryption | Custom JWT or token system | iron-session 8 | Sealed/encrypted cookies with zero config. Battle-tested. |
| Password hashing | Custom crypto | bcryptjs 3 | Timing-safe, salted, configurable rounds. |
| Database queries | Raw SQL strings | Drizzle ORM | Type-safe, composable, migration support. |
| CSS design tokens | Custom CSS variable system | Tailwind v4 @theme | Automatically generates utility classes from tokens. |
| Font loading | Manual <link> tags | next/font/google | Automatic self-hosting, font-display swap, CSS variables. |
| Route protection | Custom redirect logic in every page | proxy.ts | Centralized auth check, runs before page renders. |

## Common Pitfalls

### Pitfall 1: middleware.ts vs proxy.ts in Next.js 16
**What goes wrong:** Developer creates `middleware.ts` because all tutorials/examples before 2026 use that filename. Next.js 16 has deprecated it.
**Why it happens:** Every tutorial, Stack Overflow answer, and blog post before Next.js 16 uses `middleware.ts`.
**How to avoid:** Create `proxy.ts` at the app root. Export a function named `proxy` (not `middleware`). The config export with `matcher` still works the same way.
**Warning signs:** Deprecation warning in console, or auth redirects not firing.

### Pitfall 2: Sync cookies() Call
**What goes wrong:** `getIronSession(cookies(), options)` fails because `cookies()` returns a Promise in Next.js 16.
**Why it happens:** Next.js 15 had a sync compatibility layer. Next.js 16 removed it entirely.
**How to avoid:** Always `await cookies()` before passing to any function. `getIronSession(await cookies(), options)`.
**Warning signs:** Runtime error about cookies being a Promise, not a ReadonlyRequestCookies.

### Pitfall 3: Neon Cold Start on First Demo Visit
**What goes wrong:** First page load after idle takes 500ms-2000ms due to Neon compute activation.
**Why it happens:** Neon scales to zero after 5 min inactivity. Demo apps sit idle between reviews.
**How to avoid:** Use skeleton loading UI that feels intentional. Consider setting Neon auto-suspend timeout higher for demo. Use `@neondatabase/serverless` HTTP driver (fewer roundtrips than TCP).
**Warning signs:** First login attempt after idle feels broken or times out.

### Pitfall 4: Pixel Font Layout Shift
**What goes wrong:** Page content jumps when Press Start 2P / Silkscreen fonts load.
**Why it happens:** Pixel fonts have very different metrics than system fallbacks.
**How to avoid:** Use `next/font/google` with `display: "swap"` and CSS variables. Set explicit dimensions on text containers. The fonts load fast via self-hosting but the initial render uses fallback.
**Warning signs:** Visible text reflow on page load, especially on headings.

### Pitfall 5: Timezone Column Missing from Users Table
**What goes wrong:** Streak calculations break for non-UTC users (detailed in PITFALLS.md).
**Why it happens:** Developers forget timezone column in initial schema.
**How to avoid:** Include `timezone` column (text, default 'UTC') in users table from day one. This is explicitly called out in CONTEXT.md decisions and PITFALLS.md.

### Pitfall 6: Turbopack Build Failures with Custom Webpack Config
**What goes wrong:** Next.js 16 uses Turbopack by default. If any dependency adds webpack config, the build fails.
**Why it happens:** Turbopack is now the default bundler; webpack config is incompatible.
**How to avoid:** Don't add custom webpack config. If a library requires it, use `--webpack` flag. For this project's stack (Tailwind, Drizzle, iron-session), no custom webpack config is needed.

## Code Examples

### Drizzle Schema: Users Table
```typescript
// src/db/schema/users.ts
import { pgTable, serial, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["player", "coach"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  role: roleEnum("role").notNull().default("player"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  level: integer("level").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### Login Server Action
```typescript
// src/lib/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Invalid email or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  redirect(user.role === "coach" ? "/coach/dashboard" : "/");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
```

### Seed Script (3 Demo Accounts)
```typescript
// src/db/seed.ts
import bcrypt from "bcryptjs";
import { db } from "./index";
import { users } from "./schema/users";

const DEMO_PASSWORD = "demo1234";

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await db.insert(users).values([
    {
      email: "user@streakengine.app",
      passwordHash: hash,
      displayName: "PixelWarrior",
      role: "player",
      level: 14,
      totalXp: 9240,
    },
    {
      email: "coach@streakengine.app",
      passwordHash: hash,
      displayName: "CoachVita",
      role: "coach",
      level: 1,
      totalXp: 0,
    },
    {
      email: "new@streakengine.app",
      passwordHash: hash,
      displayName: "FreshStart",
      role: "player",
      level: 2,
      totalXp: 180,
    },
  ]).onConflictDoNothing();
}

seed().then(() => console.log("Seeded!")).catch(console.error);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (2025) | File rename + function rename required |
| Sync cookies() | Async cookies() | Next.js 16 (2025) | All cookie access must be awaited |
| tailwind.config.js | globals.css @theme | Tailwind v4 (2025) | Design tokens in CSS, not JS |
| Webpack default | Turbopack default | Next.js 16 (2025) | Faster builds, no webpack config |
| @types/bcryptjs | Built-in types | bcryptjs 3.0 (2025) | Remove @types/bcryptjs from devDeps |
| next lint | ESLint CLI directly | Next.js 16 (2025) | next lint command removed |

**Deprecated/outdated:**
- `middleware.ts` filename (use `proxy.ts`)
- Sync `cookies()`, `headers()`, `params` access (all async-only in Next.js 16)
- `@types/bcryptjs` (types now built into bcryptjs 3.x)
- `next lint` command (removed in Next.js 16, use eslint directly)
- `experimental.turbopack` config (moved to top-level `turbopack` in next.config)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- greenfield project |
| Config file | None -- see Wave 0 |
| Quick run command | `npx jest --passWithNoTests` or `npx vitest run` |
| Full suite command | Same as quick run for Phase 1 |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login with email/password works for 3 demo accounts | integration | `curl -X POST /login` with demo creds | No -- Wave 0 |
| AUTH-02 | Session persists across refresh | integration | Check cookie set after login | No -- Wave 0 |
| AUTH-03 | Logout destroys session | integration | POST to logout action, verify redirect | No -- Wave 0 |
| AUTH-04 | Role-based routing (player vs coach) | integration | Login as coach, verify redirect to /coach/dashboard | No -- Wave 0 |
| UIDN-01 | Pixel-art aesthetic (squared edges, 3px borders) | manual-only | Visual inspection | N/A |
| UIDN-02 | Dark theme only | manual-only | Visual inspection -- bg is #1A1A2E | N/A |
| UIDN-03 | Correct fonts loaded | manual-only | Check computed font-family in browser | N/A |
| UIDN-04 | Mobile bottom tab bar | manual-only | Responsive view check | N/A |
| UIDN-05 | Desktop top nav strip, 720px max | manual-only | Browser width check | N/A |
| UIDN-06 | Assets from public/assets/ used | manual-only | Visual inspection of nav icons | N/A |
| UIDN-07 | Animation library installed | unit | `import { motion } from "motion/react"` compiles | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** Build check (`next build`) -- confirms no compile errors
- **Per wave merge:** Build + manual login test with all 3 demo accounts
- **Phase gate:** All 3 demo accounts can log in, see correct shell, log out. Build succeeds.

### Wave 0 Gaps
- [ ] Test framework selection and setup (recommend keeping it minimal -- `next build` success is the primary gate for Phase 1)
- [ ] No unit tests needed for Phase 1 -- the deliverables are mostly infrastructure and UI shell. Build success + manual demo account login is the validation.

## Open Questions

1. **Proxy.ts + iron-session compatibility**
   - What we know: iron-session 8 works with `await cookies()`. Next.js 16 proxy.ts runs on Node.js runtime (not Edge).
   - What's unclear: Whether reading session inside proxy.ts has performance implications (cookie decryption on every request).
   - Recommendation: Implement in proxy.ts first. If perf issues arise, move auth checks to layout-level server component instead.

2. **create-next-app with Next.js 16 defaults**
   - What we know: `create-next-app@latest` creates a Next.js 16 project with Turbopack, no middleware.ts template.
   - What's unclear: Whether the template still includes tailwind setup with `--tailwind` flag for v4.
   - Recommendation: Use `create-next-app@latest` and verify the generated structure. May need to manually configure Tailwind v4 @theme block.

3. **Zod 3 vs Zod 4 for login validation**
   - What we know: `npm install zod@3` will install latest Zod 3. Zod 4 is a breaking change.
   - What's unclear: Whether `zod@3` still resolves correctly given Zod 4 is latest.
   - Recommendation: Pin `zod@3` in package.json. Use `z.object()` and `.parse()` as documented.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- proxy.ts rename, async cookies, Turbopack default, all breaking changes
- [Next.js 16.2 Blog](https://nextjs.org/blog/next-16-2) -- Latest release details
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- @theme directive, CSS-first config
- [iron-session GitHub](https://github.com/vvo/iron-session) -- v8 API, App Router usage
- [Drizzle ORM + Neon](https://orm.drizzle.team/docs/connect-neon) -- neon-http driver setup
- npm registry -- all version numbers verified via `npm view`

### Secondary (MEDIUM confidence)
- [Neon Connection Methods for Vercel](https://neon.com/docs/guides/vercel-connection-methods) -- HTTP driver recommendation
- [Zod 4 Migration Guide](https://zod.dev/v4/changelog) -- breaking changes justifying Zod 3 recommendation

### Tertiary (LOW confidence)
- bcryptjs 3.0 built-in types -- verified via npm info but no explicit changelog found

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, Next.js 16 breaking changes confirmed via official docs
- Architecture: HIGH -- patterns from ARCHITECTURE.md validated, updated for Next.js 16 proxy.ts
- Pitfalls: HIGH -- Next.js 16 migration pitfalls are well-documented, Neon cold start is known issue

**Research date:** 2026-03-30
**Valid until:** 2026-04-30 (stable stack, no anticipated breaking changes in 30 days)
