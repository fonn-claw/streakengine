import {
  pgTable,
  serial,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { achievements } from "./achievements";

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    achievementId: integer("achievement_id")
      .notNull()
      .references(() => achievements.id),
    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_achievements_user_achievement_idx").on(
      table.userId,
      table.achievementId,
    ),
  ],
);
