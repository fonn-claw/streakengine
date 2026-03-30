import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema/users";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const DEMO_PASSWORD = "demo1234";

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

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
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
