# StreakEngine — Design Specification

## UI Paradigm: Quest Board

This is a **quest board** — a game interface where daily habits are quests, streaks are your power level, and friends are your party. Not a dashboard. Not a tracker. A game you play every day.

The mental model is a single-player RPG with social features: you wake up, check your quest log, complete quests to earn XP, watch your character grow, and compare progress with rivals. The streak counter is your HP bar — always visible, always felt.

Think: the daily screen in Duolingo crossed with a Minecraft inventory, wrapped in Habbo Hotel's blocky pixel aesthetic.

## Primary Interaction: Log & Level

The user's #1 action is **logging a completed habit**. This must be:
- One tap/click from the home screen
- Immediately rewarding (XP animation, progress bar movement, sound-like visual feedback)
- Visually distinct from everything else on screen

Every other feature exists to make this action more meaningful: streaks add stakes, XP adds weight, leaderboards add audience, achievements add surprise.

## Layout Structure: Stacked Hero + Quest Log

**Mobile-first stacked layout** (no sidebar, no hamburger menu for core features):

```
+------------------------------------------+
|  STREAK HERO BANNER                      |
|  [flame icon] 47-day streak  [1.5x mult] |
|  Level 14 =====[###########====] 2,340 XP |
+------------------------------------------+
|  TODAY'S QUESTS                           |
|  [ ] Exercise        +50 XP              |
|  [x] Meditation      +30 XP  [done!]    |
|  [ ] Water (3/8)     +20 XP              |
|  [ ] Sleep 7+ hrs    +40 XP              |
+------------------------------------------+
|  WEEKLY CHALLENGE                        |
|  "Consistency King" — 5/7 days complete  |
|  [progress blocks: ##### ##]             |
+------------------------------------------+
|  LEADERBOARD PEEK                        |
|  1. Sarah  1,240 XP  [crown]            |
|  2. You    1,180 XP  [fire]             |
|  3. Mike   980 XP                        |
+------------------------------------------+
|                                          |
|  [home] [quests] [friends] [profile]     |
+------------------------------------------+
```

**Desktop**: Same stacked structure but wider — quest log and leaderboard sit side-by-side below the hero banner. Max content width 720px, centered. The game should feel contained, not sprawled across a monitor.

**Bottom tab bar** (mobile) / **top nav strip** (desktop): Home, Quests, Friends, Profile. Four items max. No dropdown menus, no settings gear in the nav — this is a game, not enterprise software.

## Anti-patterns for This App

- **Stat cards / KPI grids** — This is not a business dashboard. No "Total Habits Completed: 234" cards. Progress is shown through the streak/XP/level system, not summary statistics.
- **Tables** — Habits are never shown in a table. They're quest items with chunky visual treatment.
- **Muted/pastel colors** — Kills the game energy. Colors must pop.
- **Rounded corners / pill shapes** — Against the pixel-art aesthetic. Everything is squared, blocky, hard-edged.
- **Thin hairline borders** — Borders are thick (2-3px), visible, part of the aesthetic. Not subtle dividers.
- **Empty minimalism** — Whitespace is fine, but this app should feel full of energy, not zen.
- **Punitive language** — No "You missed 2 habits today." Instead: "3 quests remaining — let's go!"
- **Generic material design** — No floating action buttons, no elevation shadows, no ripple effects. Custom game UI only.
- **Sidebar navigation** — Wastes space, feels like a tool. Tab bar or top strip only.
- **Modals for primary actions** — Logging a habit must never require opening a modal. Inline interaction only.

---

## Design System

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#1A1A2E` | Deep navy background — game-world dark |
| `--color-surface` | `#16213E` | Card/panel background |
| `--color-surface-raised` | `#0F3460` | Elevated panels, active states |
| `--color-border` | `#533483` | Thick borders on all panels — purple pixel grid |
| `--color-primary` | `#E94560` | Primary actions, streak flame, XP bar fill — hot coral red |
| `--color-secondary` | `#FFD460` | XP numbers, level-up flash, achievements — game gold |
| `--color-accent` | `#00D2FF` | Links, friend activity, streak freeze — electric cyan |
| `--color-text` | `#EAEAEA` | Primary text — off-white on dark |
| `--color-text-dim` | `#8B8B9E` | Secondary text, labels |
| `--color-success` | `#4ADE80` | Completed quests, positive streaks — pixel green |
| `--color-warning` | `#FBBF24` | At-risk streaks, declining engagement |
| `--color-danger` | `#F43F5E` | Broken streaks, streak-about-to-die |
| `--color-xp-bar` | `#A855F7` | XP progress bar fill — electric purple |

Dark theme only. No light mode. Games don't have light mode.

### Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| Headings, streak counter, level | **Press Start 2P** | 400 | Google Fonts. Pixel-art bitmap font. Used sparingly — streak number, level, section headers |
| Body, quest text, UI labels | **Silkscreen** | 400, 700 | Google Fonts. Readable pixel font. Everything else |
| Numbers (XP amounts, countdowns) | **Press Start 2P** | 400 | Numbers always in the pixel font for game feel |

Font sizes are small by modern standards — pixel fonts need it:
- Streak counter: 32px
- Section headings: 14px
- Body / quest text: 12px (Silkscreen is readable at this size)
- XP numbers: 12px

### Key Components

**Streak Hero Banner**
The most important component in the app. Always visible at top of home screen.
- Full-width, `--color-surface` background, 3px `--color-border` border on all sides
- Streak flame icon (animated pixel fire) on the left
- Streak count in Press Start 2P at 32px, `--color-primary`
- Multiplier badge (e.g., "1.5x") in `--color-secondary`, small pixel border
- XP progress bar below: blocky segmented bar (not smooth), `--color-xp-bar` fill on `--color-surface-raised` track
- Level number on left of bar, XP count on right

**Quest Card**
Each habit is a quest card — the primary interactive element.
- Full-width, 3px `--color-border` border
- Left side: pixel checkbox (unchecked = hollow square, checked = filled with `--color-success` + pixel checkmark)
- Center: habit name in Silkscreen 700, habit details in Silkscreen 400
- Right side: XP reward in Press Start 2P, `--color-secondary`
- On completion: card background flashes `--color-success` briefly, XP number floats upward and fades
- Partial progress (e.g., "3/8 glasses"): inline pixel progress blocks

**Leaderboard Row**
- Rank number in Press Start 2P
- Username in Silkscreen 700
- XP count right-aligned in `--color-secondary`
- Top 3 get trophy icons (gold/silver/bronze pixel trophies)
- Current user's row highlighted with `--color-surface-raised` background

**Achievement Badge**
- Square (never circular), 3px border
- Icon in center (pixel art)
- Title below in Silkscreen
- Unlocked: full color. Locked: grayscale with `?` overlay
- On unlock: 2-second celebration animation (pixel sparkles radiate outward)

**Streak Freeze Indicator**
- Small shield/snowflake icon in `--color-accent`
- "1 freeze available" or "Freeze used" text
- Positioned near streak counter

**Bottom Tab Bar (mobile) / Top Nav Strip (desktop)**
- 4 items: Home (flame), Quests (sword), Friends (people), Profile (shield)
- Active tab: `--color-primary` icon + 2px underline
- Inactive: `--color-text-dim`
- All icons are pixel-art style, 24x24

### Motion

**XP Float** — When a quest is completed, the XP amount (+50 XP) appears at the quest card and floats upward 40px while fading out over 600ms. This is the signature animation — it makes every completion feel rewarding.

**Streak Pulse** — The streak flame icon gently pulses (scale 1.0 to 1.05) on a 2-second loop when the user has an active streak. Stops pulsing if streak is at risk. Creates a "living" feeling.

**Level Up Flash** — When enough XP is earned to level up, the entire hero banner flashes `--color-secondary` for 200ms, then the level number increments with a brief scale-up (1.0 to 1.3 to 1.0 over 400ms). Text "LEVEL UP!" appears in Press Start 2P for 2 seconds.

**Quest Complete Stamp** — On habit completion, a pixel "DONE" stamp (rotated 5deg) appears over the quest card, then settles into place. Think: a chunky rubber stamp, not a smooth checkbox animation.

---

## Screens

### 1. Home — The Daily Game Screen

**What the user sees first:**
The streak hero banner dominates the top third. Below it, today's quests are listed as interactive cards. Below that, a compact leaderboard showing the user's position and their immediate rivals. The bottom tab bar provides navigation.

**What they interact with most:**
Quest cards — tapping/clicking the checkbox to complete habits. This happens 3-8 times per day. The interaction is: tap checkbox -> instant visual feedback (color change, XP float animation) -> hero banner XP bar updates.

**What makes it feel different:**
Everything is a game element. There are no form fields, no settings, no "manage habits" buttons visible. The screen feels like a game HUD: your stats (streak/level/XP) at the top, your objectives (quests) in the middle, your competition (leaderboard) at the bottom. The dark background with bold colored elements creates an immersive game-world feeling, not a utility feeling.

The weekly challenge section (between quests and leaderboard) shows a named challenge with blocky progress indicators — think Minecraft hearts, not a smooth progress bar.

### 2. Profile — The Character Sheet

**What the user sees first:**
Their "character" — a large display of their level, total XP, streak history (a pixel-art flame chart showing streak lengths over time), and achievement grid. This is the "look how far I've come" screen.

**What they interact with most:**
Achievement badges — tapping to see details, share unlocked ones. The streak history visualization — seeing patterns. The habit breakdown — which habits contribute most XP.

**What makes it feel different:**
This is a character sheet from an RPG, not a settings page. The achievement grid (3-4 columns of square badges) looks like an inventory screen. Locked achievements show as dark squares with "?" marks, creating curiosity. The streak history uses a pixel-art flame chart — taller flames for longer streaks, with different colors for active vs. broken. Stats are displayed in a retro "stat block" format:

```
STR: 47-day streak
INT: Level 14
DEX: 8 achievements
CHA: 12 friends
```

### 3. Coach Dashboard — The Command Center (Admin view)

**What the coach sees first:**
A community health overview — not charts, but a grid of user "cards" sorted by engagement risk. Each card shows: user avatar (pixel-art generated), streak status (flame intensity), this week's XP, and a risk indicator (green/yellow/red pixel heart).

**What they interact with most:**
The risk-sorted user grid — identifying who needs attention. Tapping a user card expands to show their quest completion patterns and streak history. The coach can send nudges directly from expanded cards.

**What makes it feel different:**
The user grid feels like a party management screen in an RPG — you're managing your team's health. At-risk users have dimming/flickering flame icons. The nudge button looks like a game action button ("Send Nudge!" in pixel font), not a corporate "Send Notification" link. Challenge configuration is a separate screen with a quest-builder feel — setting XP values, durations, and names using game terminology.

---

## Asset Manifest

### Tier 1 — Functional SVGs (Pixel-Art Style)

All Tier 1 SVGs use a pixel-grid approach: shapes built from aligned rectangles to achieve a blocky, pixel-art look. No curves, no gradients. Max 3 colors per icon. Stroke-width: 2px where strokes are used, but prefer filled rectangles for the pixel look.

| Filename | Dimensions | Colors | Usage |
|---|---|---|---|
| `logo.svg` | 200x48 | `#E94560`, `#FFD460`, `#EAEAEA` | App wordmark — "STREAK ENGINE" in pixel blocks |
| `favicon.svg` | 32x32 | `#E94560`, `#FFD460` | Favicon — pixel flame |
| `icon-flame.svg` | 24x24 | `#E94560`, `#FFD460` | Streak flame — nav, hero banner |
| `icon-flame-danger.svg` | 24x24 | `#F43F5E`, `#FBBF24` | At-risk streak flame (dimmer) |
| `icon-sword.svg` | 24x24 | `#E94560`, `#EAEAEA` | Quests nav icon |
| `icon-people.svg` | 24x24 | `#00D2FF`, `#EAEAEA` | Friends nav icon |
| `icon-shield.svg` | 24x24 | `#A855F7`, `#EAEAEA` | Profile nav icon |
| `icon-trophy-gold.svg` | 24x24 | `#FFD460`, `#E94560` | 1st place leaderboard |
| `icon-trophy-silver.svg` | 24x24 | `#C0C0C0`, `#8B8B9E` | 2nd place leaderboard |
| `icon-trophy-bronze.svg` | 24x24 | `#CD7F32`, `#8B5E3C` | 3rd place leaderboard |
| `icon-xp-star.svg` | 24x24 | `#FFD460`, `#E94560` | XP indicator |
| `icon-freeze.svg` | 24x24 | `#00D2FF`, `#EAEAEA` | Streak freeze available |
| `icon-exercise.svg` | 24x24 | `#E94560`, `#EAEAEA` | Exercise habit |
| `icon-meditation.svg` | 24x24 | `#A855F7`, `#EAEAEA` | Meditation habit |
| `icon-water.svg` | 24x24 | `#00D2FF`, `#EAEAEA` | Water intake habit |
| `icon-sleep.svg` | 24x24 | `#533483`, `#EAEAEA` | Sleep habit |
| `icon-check.svg` | 24x24 | `#4ADE80` | Completed quest checkmark |
| `icon-lock.svg` | 24x24 | `#8B8B9E` | Locked achievement |
| `icon-crown.svg` | 24x24 | `#FFD460` | Weekly leader crown |
| `icon-nudge.svg` | 24x24 | `#00D2FF`, `#FFD460` | Send nudge action |
| `icon-heart-green.svg` | 24x24 | `#4ADE80` | Healthy engagement (coach) |
| `icon-heart-yellow.svg` | 24x24 | `#FBBF24` | At-risk engagement (coach) |
| `icon-heart-red.svg` | 24x24 | `#F43F5E` | Critical engagement (coach) |
| `empty-quests.svg` | 200x160 | `#533483`, `#8B8B9E`, `#E94560` | No quests today empty state |
| `empty-friends.svg` | 200x160 | `#533483`, `#8B8B9E`, `#00D2FF` | No friends yet empty state |
| `badge-frame.svg` | 64x64 | `#533483`, `#FFD460` | Achievement badge frame/border |
| `achievement-streak-7.svg` | 48x48 | `#E94560`, `#FFD460` | "First Week" achievement |
| `achievement-streak-30.svg` | 48x48 | `#E94560`, `#FFD460`, `#A855F7` | "Streak Master" achievement |
| `achievement-early-bird.svg` | 48x48 | `#FFD460`, `#00D2FF` | "Early Bird" achievement |
| `achievement-social.svg` | 48x48 | `#00D2FF`, `#A855F7` | "Social Butterfly" achievement |

### Tier 2 — Decorative (DALL-E Generated)

| Filename | Size | Prompt Summary | Usage |
|---|---|---|---|
| `hero-login.png` | 1024x1024 | Pixel-art game world scene with flame characters | Login / landing page hero |
| `hero-levelup.png` | 1024x1024 | Pixel-art celebration with XP stars and trophies | Level-up overlay background |
| `bg-pattern.png` | 512x512 | Tileable dark pixel-art grid texture | Subtle page background texture |
