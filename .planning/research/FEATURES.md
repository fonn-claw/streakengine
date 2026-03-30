# Feature Landscape

**Domain:** Gamified habit & health tracking (engagement layer)
**Researched:** 2026-03-30
**Confidence:** MEDIUM-HIGH (well-documented domain with strong competitor analysis)

## Table Stakes

Features users expect from any gamified habit tracker. Missing any of these and the product feels incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Streak counter** | Core psychological hook. Duolingo users with 7-day streaks are 3.6x more likely to stay engaged. Every competitor has this. The single most important engagement mechanic in the domain. | Low | Must be the most prominent UI element. Flame icon is universal visual language. |
| **Streak freeze / grace period** | Without it, one missed day destroys weeks of momentum and causes rage-quit. Duolingo's streak freeze reduced churn by 21%. Users expect permission to be human. | Low | 1 free per week is standard. Some apps sell extras as premium currency. |
| **XP / points for completing habits** | Users need quantified progress, not just checkmarks. "Done/not done" creates no sense of growth. XP with different weights per habit type makes actions feel meaningfully different. | Low | Different XP values per habit type is important -- exercise should feel more rewarding than logging water. |
| **Leveling system with progress bar** | XP without levels is just a big number. Levels create milestones, anticipation ("almost level 13!"), and visible growth over time. Every gamified app has some form of progression tiers. | Low | Segmented/blocky progress bar fits the pixel aesthetic. Level thresholds should increase gradually (not linearly). |
| **Daily habit logging (one-tap)** | The #1 user action. Must be instant, visible, and immediately rewarding. If logging a habit requires more than one tap, completion rates drop dramatically. | Low | Inline interaction only -- no modals. Tap checkbox, see XP animation, done. |
| **Visual feedback on completion** | Users need dopamine hits. XP floating upward, checkmarks stamping, progress bars filling -- these micro-interactions are what make gamification feel like a game vs. a spreadsheet. | Medium | XP float animation, quest complete stamp, progress bar fill. These are the "game feel" of the product. |
| **Achievement / badge system** | Recognition for milestones. Expected in every gamified app. But MUST feel earned and surprising, not like a checkbox grind. Hollow badges are worse than no badges (users see through it). | Medium | Surprise unlocks > visible checklists. Locked badges as "?" create curiosity. Square badges fit pixel aesthetic. |
| **Weekly leaderboard** | Social competition drives 40% more activity (Duolingo data). Weekly reset keeps it fresh and prevents runaway leaders from demoralizing newcomers. | Medium | Reset every Monday. Show top 3 + user's position + immediate rivals. Keep scope small (friends, not global). |
| **Friend / social system** | Competition > solo grind. Accountability through visibility of others' progress. Strava's 14B+ kudos proves social recognition drives engagement. | Medium | Public/private toggle is essential. Not everyone wants visibility. |
| **Basic profile / stats view** | Users need a "look how far I've come" screen. Total XP, level, streak history, achievements earned. This is the reward for sustained engagement. | Low | Character sheet metaphor from the design spec fits perfectly here. |

## Differentiators

Features that set StreakEngine apart from the crowded habit tracking space. Not universally expected, but create genuine competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Streak multiplier** | Consecutive weeks of maintained streaks increase XP earned (1x -> 1.2x -> 1.5x). Rewards consistency over time, not just daily completion. Creates compound motivation -- the longer you maintain, the more each action is worth. Rare in competitors. | Medium | Visible badge on streak hero banner. Multiplier resets on streak break, adding weight to streak protection. |
| **At-risk detection (coach view)** | Algorithmic flagging when a user's engagement drops 30%+ over a week. Coaches/admins can intervene before the user silently churns. This is the B2B killer feature -- coaches cannot manually monitor 50+ clients. | Medium | Traffic-light system (green/yellow/red) per user. Requires rolling engagement calculation over 7-day windows. |
| **Nudge system** | Friends/coaches can poke users who haven't logged today. Social accountability with a game-like feel ("Sarah nudged you!"). Strava and Duolingo both use this to great effect. | Low | Must feel playful, not nagging. "Your party needs you!" not "You haven't completed your tasks." |
| **Weekly challenges** | Time-boxed group competitions beyond the regular leaderboard. Named challenges ("Consistency King", "Early Bird Week") with specific goals. Creates event-driven engagement on top of daily loops. | Medium | Progress shown as blocky pixel blocks, not smooth bars. Challenge completion is a separate achievement trigger. |
| **Quest board metaphor** | Reframing habits as "quests" with RPG terminology throughout. Not just cosmetic -- it changes how users think about their habits. Habits become adventures, not chores. Habitica proved this works; StreakEngine does it with better UX. | Low | This is a design/copy decision more than a feature. Permeates all UI text and interactions. |
| **Coach dashboard / party management** | Admin view showing community health as a party management screen. User cards sorted by engagement risk, expandable for detail. Challenge configuration with game terminology. The B2B angle that turns this from a consumer toy into a platform. | High | Separate screen with different information architecture. Must show aggregate trends + individual drill-down. |
| **Pixel-art game aesthetic** | Distinctive visual identity in a sea of minimalist habit trackers. Squared edges, thick borders, Press Start 2P font, bold saturated colors on dark theme. Users remember and talk about it. | Medium | This IS the brand. Every competitor is either minimalist (Streaks) or cartoony (Finch). Pixel-art is an unclaimed niche. |
| **Positive-only reinforcement** | Deliberately avoid punishment mechanics. Celebrate what was done, never scold what wasn't. "3 quests remaining -- let's go!" not "You missed 2 habits today." Research shows loss-aversion penalties trigger shame spirals and increase abandonment, especially in perfectionists. | Low | A design philosophy enforced through copy and UX patterns, not a "feature" per se. But it is a differentiator from Habitica (which uses HP loss). |

## Anti-Features

Features to deliberately NOT build. Each of these is tempting but counterproductive based on domain research.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **HP / health penalty for missed days** | Habitica uses HP loss for missed dailies. Research shows loss-aversion penalties cause shame spirals: 79% completion drops to 58% for certain personality types. Punitive mechanics increase short-term engagement but dramatically increase long-term abandonment. | Positive reinforcement only. Streak multiplier reset is consequence enough. Celebrate completions, ignore misses. |
| **Complex avatar / character system** | Avatar customization creates novelty-dependent motivation that fades fast. Cohorty research: heavy gamification users drop to 31% habit maintenance at 90 days vs 52% for light gamification. Character systems add cognitive burden without driving the core habit loop. | Keep the "character sheet" as a stat display, not a dress-up game. The user IS the character -- their stats ARE the progression. |
| **Too many simultaneous metrics** | Overwhelming users with stats kills engagement. The brief explicitly warns against this. Users need to see streak + level + XP + today's quests. Not: "Total habits completed: 234, Weekly average: 4.2, Monthly trend: +12%..." | Max 3-4 visible metrics at any time. Streak, level, XP, and today's progress. Everything else lives on the profile/character sheet. |
| **Global leaderboard** | Global competition is demoralizing for 95% of users. Only the top 0.1% enjoy it. Friend-scoped leaderboards create accountability; global boards create hopelessness. Duolingo uses leagues (small groups) not global rankings for this reason. | Friend-only leaderboard, small groups. Weekly reset keeps it competitive for everyone, not just power users. |
| **Custom habit creation (for this demo)** | Adds significant complexity (form UI, validation, flexible schemas) without demonstrating the core gamification engine. Pre-configured habits for the "Vitality" demo scenario are sufficient. | Pre-configured habit types with fixed XP values. Coach can configure challenges, but individual habit creation is out of scope. |
| **Smooth / rounded UI elements** | Against the pixel-art aesthetic. Rounded corners, pill shapes, smooth gradients, and material design patterns all kill the game energy that makes StreakEngine feel different. | Squared edges, thick borders, blocky progress bars, pixel fonts. Every UI element should feel like it came from a game, not a SaaS tool. |
| **Push notifications** | Requires native app infrastructure. Web notifications are unreliable and annoying. The nudge system from friends/coaches serves the same re-engagement purpose with social accountability instead of robot reminders. | In-app nudge system from friends/coaches. When user opens app, they see "Sarah nudged you!" -- more effective than a push notification. |
| **Light mode** | Games don't have light mode. Dark backgrounds with bold saturated colors create immersion. Light mode would require an entire parallel design system and dilute the visual identity. | Dark theme only. Bold colors on navy background. This is a game world. |
| **Real-time chat** | High complexity (WebSockets, presence, moderation), not core to the gamification loop. Chat doesn't drive habit completion. Nudges + leaderboard + achievement feeds provide sufficient social connection. | Nudges for direct interaction, leaderboard for passive competition, achievement feed for social celebration. |

## Feature Dependencies

```
Authentication ─────────────────────────────────────────────────────┐
    │                                                               │
    ├── Habit/Quest System (core CRUD + completion logging)         │
    │       │                                                       │
    │       ├── XP Award System (earn XP on completion)             │
    │       │       │                                               │
    │       │       ├── Leveling System (XP thresholds → levels)    │
    │       │       │                                               │
    │       │       └── Streak Multiplier (multiplies XP earned)    │
    │       │                                                       │
    │       ├── Streak Tracking (consecutive day counting)          │
    │       │       │                                               │
    │       │       ├── Streak Freeze (protect streak on miss)      │
    │       │       │                                               │
    │       │       └── Streak Multiplier (weeks → multiplier)      │
    │       │                                                       │
    │       └── Achievement System (triggers on milestones)         │
    │               │                                               │
    │               └── Achievement triggers depend on:             │
    │                   - Streak milestones (7, 30, etc.)           │
    │                   - Level milestones                          │
    │                   - Social milestones (friends added)         │
    │                   - Challenge completions                     │
    │                                                               │
    ├── Friend/Social System                                        │
    │       │                                                       │
    │       ├── Leaderboard (weekly XP ranking among friends)       │
    │       │                                                       │
    │       ├── Nudge System (poke inactive friends)                │
    │       │                                                       │
    │       └── Weekly Challenges (group competitions)              │
    │                                                               │
    └── Coach Dashboard (admin-only view)                           │
            │                                                       │
            ├── At-Risk Detection (engagement drop algorithm)       │
            │                                                       │
            └── Community Analytics (aggregate engagement data)     │
```

**Critical path:** Auth -> Habits -> XP -> Streaks -> Leveling. This is the core loop and must be built first. Everything else layers on top.

**Social layer** (friends, leaderboard, nudges) requires the core loop to exist first -- there's nothing to compete on without XP.

**Coach dashboard** is a separate view that reads from the same data. Can be built last as it doesn't affect the user experience.

## MVP Recommendation

**Prioritize (Phase 1 - Core Game Loop):**
1. Authentication with demo accounts
2. Habit/quest system with one-tap completion
3. XP award system with per-habit weights
4. Streak tracking with prominent counter
5. Streak freeze mechanic
6. Level system with progress bar
7. Visual feedback (XP float, quest complete stamp, streak pulse)

**Prioritize (Phase 2 - Social & Progression):**
1. Streak multiplier (consecutive weeks)
2. Achievement/badge system with surprise unlocks
3. Friend system with public/private toggle
4. Weekly leaderboard (friend-scoped, Monday reset)
5. Nudge system
6. Weekly challenges

**Prioritize (Phase 3 - B2B & Polish):**
1. Coach dashboard with user cards
2. At-risk detection algorithm
3. Community analytics
4. Level-up celebration animation
5. Achievement unlock celebration

**Defer entirely:**
- Custom habit creation (pre-configured for demo)
- Push notifications (web-only, use nudges)
- Real-time chat (overkill for this scope)
- Avatar/character customization (anti-feature per research)

**Rationale:** The core game loop (log habit -> earn XP -> see streak grow -> level up) is what makes users return daily. Without this working and feeling rewarding, social features are meaningless. Social features create retention after the core loop creates engagement. Coach dashboard is the B2B value prop but doesn't affect individual user experience.

## Sources

- [Duolingo Gamification Case Study - Trophy](https://trophy.so/blog/duolingo-gamification-case-study)
- [Duolingo's Gamification Secrets - Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [Habitica Gamification Case Study - Trophy](https://trophy.so/blog/habitica-gamification-case-study)
- [Gamification in Habit Tracking: Does It Work? - Cohorty](https://blog.cohorty.app/gamification-in-habit-tracking-does-it-work-research-real-user-data)
- [Strava Gamification Case Study - Trophy](https://trophy.so/blog/strava-gamification-case-study)
- [Streaks Gamification Case Study - Trophy](https://trophy.so/blog/streaks-gamification-case-study)
- [When Your App Needs a Streak Feature - Trophy](https://trophy.so/blog/when-your-app-needs-streak-feature)
- [How Duolingo Reignited User Growth - Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- [New Horizons in Habit-Building Gamification - Naavik](https://naavik.co/deep-dives/deep-dives-new-horizons-in-gamification/)
- [Finch Self-Care App - Yoga Journal](https://www.yogajournal.com/lifestyle/finch-self-care-app/)
- [Best Habitica Alternatives 2026 - MainQuest](https://www.mainquest.net/habitica-alternatives)
- [Gamification Strategies for Mobile App Engagement - Storyly](https://www.storyly.io/post/gamification-strategies-to-increase-app-engagement)
- [App Gamification in 2025 - StudioKrew](https://studiokrew.com/blog/app-gamification-strategies-2025/)
