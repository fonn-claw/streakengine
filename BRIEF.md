# StreakEngine — Habit & Health Gamification Platform

## The Problem
Habit and fitness apps have an 80%+ churn rate within 30 days. Users start
motivated, then slowly disappear. Most apps try to fix this with shallow
gamification — points, badges, leaderboards — that users see through immediately.

What actually works is different: streaks that create loss aversion, XP tied
to meaningful actions (not just checkmarks), friend competition that creates
accountability, and progression systems that make users feel growth.

From a fitness coach who built a gamified app: "Users don't usually tell you
they're leaving. They just slowly disappear... engagement drops slightly,
then one day they're just gone."

From a developer who cracked it: "What actually drives engagement: XP tied
to actions, friend leaderboards (competition > solo grind), streak multipliers
(consistency rewards), public vs private toggles."

What doesn't work: "Too many metrics at once (overwhelming), punishments for
missing days (demotivating), meaningless badges (people see through it)."

## The Domain
Health and habit tracking — specifically the engagement layer. Think of this
as what Duolingo does for language learning, applied to any health/wellness
habit: exercise, meditation, water intake, sleep, nutrition, medication.

A user's daily loop:
1. Wake up, open the app — see their streak count, today's challenges
2. Complete a habit (logged a workout, drank water, meditated)
3. Earn XP, see progress bar move, maybe level up
4. Check how friends are doing — friendly competition
5. End of week: see weekly recap, unlock achievements, streak multiplier grows
6. The dopamine of not breaking the streak keeps them coming back

The psychology matters: streaks create loss aversion ("I can't lose my 47-day
streak"), XP creates progress ("I'm level 12, almost 13"), friend boards
create accountability ("Sarah is beating me this week"), and achievements
create surprise and delight.

## Visual Identity — IMPORTANT
The UI must feel **playful and game-like**. Think squared/blocky pixel-art
aesthetic inspired by Habbo Hotel and Minecraft — chunky borders, pixel-style
icons, blocky progress bars, retro-game achievement badges. NOT a sleek
corporate SaaS dashboard.

This should feel like opening a game, not opening a productivity tool.
Rounded corners are out — squared edges, thick borders, pixel-grid alignment.
Colors should be bold and saturated, not muted pastels. Achievements should
look like game trophies, not corporate certificates.

The vibe: if Duolingo and Minecraft had a baby that tracked your habits.

## Users & What They Need

### The Habit Builder (primary user)
- Needs to feel progress daily — not just "done/not done" but meaningful growth
- Needs accountability — someone or something that notices when they slip
- Needs to see their streak and feel the weight of protecting it
- Needs challenges that adapt — too easy is boring, too hard causes dropout
- Needs to celebrate milestones — not hollow badges, but genuine "wow I've come far" moments
- Needs social connection — seeing friends' progress, friendly competition, cheering each other on

### The Friend/Rival
- Can see the habit builder's progress (if public)
- Compete on weekly XP leaderboards
- Send nudges ("You haven't logged today!")
- Celebrate each other's achievements

### The Admin (for B2B context — a fitness coach or wellness program manager)
- Needs to see engagement across their community/clients
- Needs to understand what mechanics are working (which habits have highest completion?)
- Needs to configure challenges, rewards, and progression rules
- Needs to identify at-risk users (streak about to break, engagement declining)

## Demo Data
A wellness app called "Vitality" with 3 months of engagement data.

Active scenario:
- 15 users at various stages (new, engaged, at-risk, power users)
- 1 power user with a 47-day streak, level 14, 8 achievements unlocked
- 1 user whose streak just broke yesterday (re-engagement opportunity)
- 3 users in a weekly challenge competing for top XP
- Mix of habits tracked: exercise (5x/week), meditation (daily), water (8 glasses), sleep (7+ hours)
- Achievement history: "First Week", "Streak Master (30 days)", "Early Bird (7am workout)", "Social Butterfly (added 5 friends)"
- Weekly XP leaderboard with real competition

### Demo Accounts
- user@streakengine.app / demo1234 — Power user (47-day streak, level 14, mid-week challenge)
- coach@streakengine.app / demo1234 — Admin/coach view (community engagement, at-risk alerts)
- new@streakengine.app / demo1234 — New user (day 3, onboarding experience, first achievements)

## Tech Stack
- Next.js with App Router
- Neon Postgres (NOT SQLite)
- Drizzle ORM
- Deploy to Vercel

## Notes
- Streaks are sacred — the streak counter should be the most prominent element
- XP should feel earned, not given — tied to specific actions with different weights
- Achievements should feel surprising — not a checklist to grind through
- The weekly leaderboard resets every Monday — keeps competition fresh
- "Streak freeze" mechanic: users get 1 free freeze per week (miss a day without breaking streak)
- Streak multiplier: consecutive weeks increase XP earned (week 1 = 1x, week 2 = 1.2x, week 4 = 1.5x)
- At-risk detection: if a user's daily engagement drops 30%+ over a week, flag them
- The app should feel rewarding to use, not punishing. Celebrate what was done, don't scold what wasn't.
