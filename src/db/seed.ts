import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { users } from "./schema/users";
import { habits } from "./schema/habits";
import { streaks } from "./schema/streaks";
import * as schema from "./schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DEMO_PASSWORD = "demo1234";

function getYesterdayDateString(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Users ---
  await db
    .insert(users)
    .values([
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
    ])
    .onConflictDoNothing();

  console.log("Seeded 3 demo accounts");

  // --- Habits ---
  await db
    .insert(habits)
    .values([
      {
        name: "Exercise",
        icon: "icon-exercise",
        xpReward: 50,
        targetCount: 1,
        frequency: "daily",
      },
      {
        name: "Meditation",
        icon: "icon-meditation",
        xpReward: 30,
        targetCount: 1,
        frequency: "daily",
      },
      {
        name: "Water",
        icon: "icon-water",
        xpReward: 20,
        targetCount: 8,
        frequency: "daily",
      },
      {
        name: "Sleep",
        icon: "icon-sleep",
        xpReward: 40,
        targetCount: 1,
        frequency: "daily",
      },
    ])
    .onConflictDoNothing();

  console.log("Seeded 4 habits");

  // --- Streaks (look up user IDs by email) ---
  const yesterday = getYesterdayDateString();

  const pixelWarrior = await db.query.users.findFirst({
    where: eq(users.email, "user@streakengine.app"),
  });
  const coachVita = await db.query.users.findFirst({
    where: eq(users.email, "coach@streakengine.app"),
  });
  const freshStart = await db.query.users.findFirst({
    where: eq(users.email, "new@streakengine.app"),
  });

  if (pixelWarrior) {
    await db
      .insert(streaks)
      .values({
        userId: pixelWarrior.id,
        currentStreak: 47,
        longestStreak: 47,
        multiplier: 1.5,
        freezeAvailable: true,
        freezesUsedThisWeek: 0,
        lastActiveDate: yesterday,
        streakStartDate: "2026-02-11",
      })
      .onConflictDoNothing();
  }

  if (coachVita) {
    await db
      .insert(streaks)
      .values({
        userId: coachVita.id,
        currentStreak: 0,
        longestStreak: 0,
        multiplier: 1.0,
        freezeAvailable: true,
        freezesUsedThisWeek: 0,
      })
      .onConflictDoNothing();
  }

  if (freshStart) {
    await db
      .insert(streaks)
      .values({
        userId: freshStart.id,
        currentStreak: 3,
        longestStreak: 3,
        multiplier: 1.0,
        freezeAvailable: true,
        freezesUsedThisWeek: 0,
        lastActiveDate: yesterday,
        streakStartDate: "2026-03-27",
      })
      .onConflictDoNothing();
  }

  console.log("Seeded streak records");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
