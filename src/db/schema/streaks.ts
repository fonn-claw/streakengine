import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: varchar("last_active_date", { length: 10 }),
  freezesUsedThisWeek: integer("freezes_used_this_week").notNull().default(0),
  freezeAvailable: boolean("freeze_available").notNull().default(true),
  multiplier: real("multiplier").notNull().default(1.0),
  streakStartDate: varchar("streak_start_date", { length: 10 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
