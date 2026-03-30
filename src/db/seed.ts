import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

const DEMO_PASSWORD = "demo1234";

// ---------- helpers ----------

/** Format a Date as YYYY-MM-DD */
function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Return a new Date offset by `days` from `base` */
function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Seeded random (simple LCG) so seed runs are reproducible */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ---------- constants ----------

const TODAY = new Date("2026-03-30");
const THREE_MONTHS_AGO = addDays(TODAY, -90); // Jan 1 2026-ish

// Habits: exercise 50xp, meditation 30xp, water 20xp (target 8), sleep 40xp
// Total daily max = 140 XP base

interface UserProfile {
  email: string;
  displayName: string;
  role: "player" | "coach";
  /** 0.0-1.0 overall completion rate over the period */
  engagementRate: number;
  /** How many days from today the user started */
  daysActive: number;
  /** Current streak length */
  currentStreak: number;
  /** Whether streak is broken (lastActiveDate is in the past) */
  streakBroken: boolean;
  /** How many days ago did engagement start dropping (0 = no drop) */
  dropStartDaysAgo: number;
  /** Multiplier */
  multiplier: number;
}

const USER_PROFILES: UserProfile[] = [
  // 3 demo accounts
  { email: "user@streakengine.app", displayName: "PixelWarrior", role: "player", engagementRate: 0.97, daysActive: 90, currentStreak: 47, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.5 },
  { email: "coach@streakengine.app", displayName: "CoachVita", role: "coach", engagementRate: 0, daysActive: 90, currentStreak: 0, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.0 },
  { email: "new@streakengine.app", displayName: "FreshStart", role: "player", engagementRate: 0.85, daysActive: 3, currentStreak: 3, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.0 },
  // Power/consistent users
  { email: "iron@streakengine.app", displayName: "IronPulse", role: "player", engagementRate: 0.88, daysActive: 75, currentStreak: 30, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.5 },
  { email: "zen@streakengine.app", displayName: "ZenMaster", role: "player", engagementRate: 0.75, daysActive: 60, currentStreak: 21, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.3 },
  { email: "aqua@streakengine.app", displayName: "AquaKnight", role: "player", engagementRate: 0.70, daysActive: 55, currentStreak: 14, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.2 },
  // At-risk users (engagement dropping)
  { email: "night@streakengine.app", displayName: "NightOwl", role: "player", engagementRate: 0.60, daysActive: 70, currentStreak: 0, streakBroken: true, dropStartDaysAgo: 7, multiplier: 1.0 },
  { email: "ghost@streakengine.app", displayName: "GhostRunner", role: "player", engagementRate: 0.45, daysActive: 65, currentStreak: 0, streakBroken: true, dropStartDaysAgo: 10, multiplier: 1.0 },
  // Active mid-tier
  { email: "flame@streakengine.app", displayName: "FlameKeeper", role: "player", engagementRate: 0.72, daysActive: 40, currentStreak: 10, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.2 },
  { email: "solar@streakengine.app", displayName: "SolarFlare", role: "player", engagementRate: 0.65, daysActive: 35, currentStreak: 7, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.0 },
  { email: "moon@streakengine.app", displayName: "MoonRise", role: "player", engagementRate: 0.60, daysActive: 20, currentStreak: 5, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.0 },
  // Challengers (3 in active challenge)
  { email: "storm@streakengine.app", displayName: "StormBlade", role: "player", engagementRate: 0.80, daysActive: 50, currentStreak: 12, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.2 },
  { email: "crystal@streakengine.app", displayName: "CrystalEye", role: "player", engagementRate: 0.55, daysActive: 30, currentStreak: 3, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.0 },
  // Broken streak / re-engagement
  { email: "thunder@streakengine.app", displayName: "ThunderStep", role: "player", engagementRate: 0.58, daysActive: 45, currentStreak: 0, streakBroken: true, dropStartDaysAgo: 3, multiplier: 1.0 },
  // Early engaged
  { email: "echo@streakengine.app", displayName: "EchoWave", role: "player", engagementRate: 0.68, daysActive: 25, currentStreak: 8, streakBroken: false, dropStartDaysAgo: 0, multiplier: 1.0 },
];

// Habit definitions
const HABIT_DEFS = [
  { name: "Exercise", icon: "icon-exercise", xpReward: 50, targetCount: 1, frequency: "daily" },
  { name: "Meditation", icon: "icon-meditation", xpReward: 30, targetCount: 1, frequency: "daily" },
  { name: "Water", icon: "icon-water", xpReward: 20, targetCount: 8, frequency: "daily" },
  { name: "Sleep", icon: "icon-sleep", xpReward: 40, targetCount: 1, frequency: "daily" },
];

// Achievement definitions
const ACHIEVEMENT_DEFS = [
  { name: "First Week", description: "Complete a 7-day streak", icon: "badge-first-week", trigger: "streak_7", category: "streak", xpReward: 100 },
  { name: "Streak Master", description: "Maintain a 30-day streak", icon: "badge-streak-master", trigger: "streak_30", category: "streak", xpReward: 500 },
  { name: "Early Bird", description: "Complete a workout before 7 AM", icon: "badge-early-bird", trigger: "early_bird", category: "time", xpReward: 150 },
  { name: "Social Butterfly", description: "Add 5 friends", icon: "badge-social-butterfly", trigger: "social_5_friends", category: "social", xpReward: 200 },
];

async function seed() {
  console.log("Clearing existing data...");
  // Truncate in dependency order
  await db.execute(sql`TRUNCATE TABLE nudges, challenge_participants, challenges, user_achievements, achievements, habit_logs, streaks, friendships, users, habits RESTART IDENTITY CASCADE`);

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- Users ----------
  console.log("Seeding users...");
  const insertedUsers: { id: number; email: string; profile: UserProfile }[] = [];

  for (const profile of USER_PROFILES) {
    const [row] = await db
      .insert(schema.users)
      .values({
        email: profile.email,
        passwordHash: hash,
        displayName: profile.displayName,
        role: profile.role,
        level: 1, // will update after calculating XP
        totalXp: 0,
      })
      .returning({ id: schema.users.id });
    insertedUsers.push({ id: row.id, email: profile.email, profile });
  }
  console.log(`  Seeded ${insertedUsers.length} users`);

  // ---------- Habits ----------
  console.log("Seeding habits...");
  const insertedHabits: { id: number; name: string; xpReward: number; targetCount: number }[] = [];
  for (const h of HABIT_DEFS) {
    const [row] = await db
      .insert(schema.habits)
      .values(h)
      .returning({ id: schema.habits.id });
    insertedHabits.push({ id: row.id, name: h.name, xpReward: h.xpReward, targetCount: h.targetCount });
  }
  console.log(`  Seeded ${insertedHabits.length} habits`);

  // ---------- Achievements ----------
  console.log("Seeding achievements...");
  const insertedAchievements: { id: number; trigger: string }[] = [];
  for (const a of ACHIEVEMENT_DEFS) {
    const [row] = await db
      .insert(schema.achievements)
      .values(a)
      .returning({ id: schema.achievements.id });
    insertedAchievements.push({ id: row.id, trigger: a.trigger });
  }
  console.log(`  Seeded ${insertedAchievements.length} achievements`);

  // ---------- Habit Logs + XP Calculation ----------
  console.log("Generating habit logs (3 months of data)...");
  const userXpTotals = new Map<number, number>();

  for (const user of insertedUsers) {
    if (user.profile.role === "coach") continue;

    const rng = makeRng(user.id * 31337);
    let totalXp = 0;
    const startDate = addDays(TODAY, -user.profile.daysActive);
    const logBatch: {
      userId: number;
      habitId: number;
      date: string;
      progress: number;
      xpEarned: number;
    }[] = [];

    for (let dayOffset = 0; dayOffset < user.profile.daysActive; dayOffset++) {
      const date = addDays(startDate, dayOffset);
      const dateStr = fmt(date);
      const daysFromToday = user.profile.daysActive - dayOffset;

      // Calculate engagement for this day
      let dayEngagement = user.profile.engagementRate;

      // If user has engagement drop, reduce recent days
      if (user.profile.dropStartDaysAgo > 0 && daysFromToday <= user.profile.dropStartDaysAgo) {
        // Engagement drops to 20% of normal in the drop period
        dayEngagement *= 0.2;
      }

      // If streak is broken, skip last few days entirely
      if (user.profile.streakBroken && daysFromToday <= 2) {
        continue; // No logs for broken streak days
      }

      // Multiplier ramps up over time (simplified)
      const mult = dayOffset > 28 ? user.profile.multiplier : dayOffset > 14 ? Math.min(user.profile.multiplier, 1.2) : 1.0;

      for (const habit of insertedHabits) {
        if (rng() > dayEngagement) continue; // Skip this habit today

        const progress = habit.targetCount > 1
          ? Math.max(1, Math.floor(rng() * habit.targetCount) + 1)
          : 1;

        const completed = progress >= habit.targetCount;
        const xpEarned = completed ? Math.round(habit.xpReward * mult) : 0;
        totalXp += xpEarned;

        logBatch.push({
          userId: user.id,
          habitId: habit.id,
          date: dateStr,
          progress,
          xpEarned,
        });
      }
    }

    // Insert logs in batches of 100
    for (let i = 0; i < logBatch.length; i += 100) {
      const batch = logBatch.slice(i, i + 100);
      await db.insert(schema.habitLogs).values(batch).onConflictDoNothing();
    }

    userXpTotals.set(user.id, totalXp);
    console.log(`  ${user.profile.displayName}: ${logBatch.length} logs, ${totalXp} XP`);
  }

  // ---------- Update user levels & XP ----------
  // Override demo account XP to match spec exactly
  const pixelWarriorId = insertedUsers.find((u) => u.email === "user@streakengine.app")!.id;
  const freshStartId = insertedUsers.find((u) => u.email === "new@streakengine.app")!.id;
  userXpTotals.set(pixelWarriorId, 15200); // Level 14 (needs 15050)
  userXpTotals.set(freshStartId, 220); // Level 2 (needs 100, next at 350)

  console.log("Updating user levels...");
  for (const user of insertedUsers) {
    if (user.profile.role === "coach") continue;
    const totalXp = userXpTotals.get(user.id) || 0;
    const level = getLevelFromXP(totalXp);
    await db
      .update(schema.users)
      .set({ totalXp, level })
      .where(sql`id = ${user.id}`);
  }

  // ---------- Streaks ----------
  console.log("Seeding streaks...");
  for (const user of insertedUsers) {
    const p = user.profile;
    const lastActiveDate = p.streakBroken
      ? fmt(addDays(TODAY, -(p.dropStartDaysAgo || 2)))
      : fmt(addDays(TODAY, -1)); // yesterday

    const streakStartDate = p.currentStreak > 0
      ? fmt(addDays(TODAY, -p.currentStreak))
      : null;

    await db.insert(schema.streaks).values({
      userId: user.id,
      currentStreak: p.currentStreak,
      longestStreak: Math.max(p.currentStreak, Math.floor(p.daysActive * p.engagementRate * 0.6)),
      multiplier: p.multiplier,
      freezeAvailable: true,
      freezesUsedThisWeek: 0,
      lastActiveDate: p.role === "coach" ? null : lastActiveDate,
      streakStartDate: p.role === "coach" ? null : streakStartDate,
    });
  }

  // ---------- Friendships (bidirectional) ----------
  console.log("Seeding friendships...");
  const players = insertedUsers.filter((u) => u.profile.role === "player");

  // PixelWarrior is friends with everyone (Social Butterfly)
  const pixelWarrior = insertedUsers.find((u) => u.email === "user@streakengine.app")!;
  const friendPairs: [number, number][] = [];

  for (const p of players) {
    if (p.id === pixelWarrior.id) continue;
    friendPairs.push([pixelWarrior.id, p.id]);
  }

  // Additional friendships for variety
  const additionalPairs: [number, number][] = [
    [players[2]?.id, players[3]?.id], // FreshStart - IronPulse
    [players[3]?.id, players[4]?.id], // IronPulse - ZenMaster
    [players[4]?.id, players[5]?.id], // ZenMaster - AquaKnight
    [players[8]?.id, players[9]?.id], // FlameKeeper - SolarFlare
    [players[10]?.id, players[11]?.id], // StormBlade - CrystalEye
  ].filter(([a, b]) => a && b) as [number, number][];

  for (const [a, b] of [...friendPairs, ...additionalPairs]) {
    // Bidirectional
    await db.insert(schema.friendships).values([
      { userId: a, friendId: b },
      { userId: b, friendId: a },
    ]).onConflictDoNothing();
  }
  console.log(`  Seeded ${friendPairs.length + additionalPairs.length} friendship pairs`);

  // ---------- Achievements (user unlocks) ----------
  console.log("Seeding achievement unlocks...");
  for (const user of insertedUsers) {
    if (user.profile.role === "coach") continue;
    const p = user.profile;

    for (const ach of insertedAchievements) {
      let unlocked = false;
      const longestStreak = Math.max(p.currentStreak, Math.floor(p.daysActive * p.engagementRate * 0.6));

      switch (ach.trigger) {
        case "streak_7":
          unlocked = longestStreak >= 7;
          break;
        case "streak_30":
          unlocked = longestStreak >= 30;
          break;
        case "early_bird":
          // Power users and early risers
          unlocked = p.engagementRate > 0.7 && p.daysActive > 14;
          break;
        case "social_5_friends":
          // PixelWarrior has 13 friends
          unlocked = user.email === "user@streakengine.app";
          break;
      }

      if (unlocked) {
        const unlockedAt = addDays(TODAY, -Math.floor(Math.random() * 30));
        await db.insert(schema.userAchievements).values({
          userId: user.id,
          achievementId: ach.id,
          unlockedAt,
        }).onConflictDoNothing();
      }
    }
  }

  // Count PixelWarrior achievements to verify they have 8
  // They get: streak_7 + streak_30 + early_bird + social_butterfly = 4
  // We need 8 total — let's add 4 more achievement definitions
  // Actually, the spec says 4 achievements. PixelWarrior unlocks all 4.
  // The BRIEF says "8 achievements" but we only defined 4 triggers.
  // Let's add more achievement definitions.

  // Add extra achievements
  const extraAchievements = [
    { name: "Hydration Hero", description: "Complete water goal 7 days in a row", icon: "badge-hydration", trigger: "water_7", category: "habit", xpReward: 150 },
    { name: "Iron Will", description: "Complete all habits in a single day 10 times", icon: "badge-iron-will", trigger: "perfect_10", category: "consistency", xpReward: 250 },
    { name: "Night Owl", description: "Log a habit after 10 PM", icon: "badge-night-owl", trigger: "night_owl", category: "time", xpReward: 100 },
    { name: "Century Club", description: "Earn 10,000 total XP", icon: "badge-century", trigger: "xp_10000", category: "progression", xpReward: 300 },
  ];

  const extraAchIds: number[] = [];
  for (const a of extraAchievements) {
    const [row] = await db
      .insert(schema.achievements)
      .values(a)
      .returning({ id: schema.achievements.id });
    extraAchIds.push(row.id);
  }

  // Unlock extra achievements for power users
  const powerUserIds = insertedUsers
    .filter((u) => ["user@streakengine.app", "iron@streakengine.app", "zen@streakengine.app", "storm@streakengine.app"].includes(u.email))
    .map((u) => u.id);

  for (const uid of powerUserIds) {
    // PixelWarrior gets all, others get some
    const isPixelWarrior = uid === pixelWarrior.id;
    for (let i = 0; i < extraAchIds.length; i++) {
      if (isPixelWarrior || i < 2) {
        await db.insert(schema.userAchievements).values({
          userId: uid,
          achievementId: extraAchIds[i],
          unlockedAt: addDays(TODAY, -Math.floor(Math.random() * 20)),
        }).onConflictDoNothing();
      }
    }
  }
  console.log("  Seeded achievement unlocks");

  // ---------- Challenges ----------
  console.log("Seeding challenges...");
  // Current week challenge (Mon Mar 23 - Sun Mar 29 2026)
  const [challenge] = await db
    .insert(schema.challenges)
    .values({
      name: "Spring Sprint",
      description: "Earn the most XP this week!",
      startDate: "2026-03-23",
      endDate: "2026-03-29",
      targetXp: 500,
    })
    .returning({ id: schema.challenges.id });

  // 3 challengers: PixelWarrior, StormBlade, IronPulse
  const challengers = insertedUsers.filter((u) =>
    ["user@streakengine.app", "storm@streakengine.app", "iron@streakengine.app"].includes(u.email),
  );

  for (const c of challengers) {
    const xp = c.email === "user@streakengine.app" ? 420
      : c.email === "storm@streakengine.app" ? 380
      : 350;
    await db.insert(schema.challengeParticipants).values({
      challengeId: challenge.id,
      userId: c.id,
      currentXp: xp,
    });
  }

  // Past challenge
  await db.insert(schema.challenges).values({
    name: "February Focus",
    description: "Complete 100 habits in February",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    targetXp: 1000,
  });

  console.log("  Seeded challenges");

  // ---------- Nudges ----------
  console.log("Seeding nudges...");
  // Coach sent nudges to at-risk users
  const coachUser = insertedUsers.find((u) => u.email === "coach@streakengine.app")!;
  const atRiskUsers = insertedUsers.filter((u) => u.profile.streakBroken);

  for (const ar of atRiskUsers) {
    await db.insert(schema.nudges).values({
      senderId: coachUser.id,
      recipientId: ar.id,
      date: fmt(addDays(TODAY, -1)),
      read: false,
    }).onConflictDoNothing();
  }

  // Some friend nudges
  await db.insert(schema.nudges).values({
    senderId: pixelWarrior.id,
    recipientId: insertedUsers.find((u) => u.email === "night@streakengine.app")!.id,
    date: fmt(TODAY),
    read: false,
  }).onConflictDoNothing();

  console.log("  Seeded nudges");

  // ---------- Summary ----------
  console.log("\n=== Seed Complete ===");
  console.log(`Users: ${insertedUsers.length}`);
  console.log(`Habits: ${insertedHabits.length}`);
  console.log(`Achievements: ${ACHIEVEMENT_DEFS.length + extraAchievements.length}`);
  console.log("Demo accounts:");
  console.log("  user@streakengine.app / demo1234 (Power user)");
  console.log("  coach@streakengine.app / demo1234 (Coach)");
  console.log("  new@streakengine.app / demo1234 (New user)");
}

// XP level calculation (must match src/lib/engine/xp.ts)
function xpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) {
    total += i * 100 + (i - 1) * 50;
  }
  return total;
}

function getLevelFromXP(totalXP: number): number {
  let level = 0;
  while (xpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
