import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { habits } from "./habits";

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    habitId: integer("habit_id")
      .notNull()
      .references(() => habits.id),
    completedAt: timestamp("completed_at").notNull().defaultNow(),
    progress: integer("progress").notNull().default(1),
    xpEarned: integer("xp_earned").notNull().default(0),
    date: varchar("date", { length: 10 }).notNull(),
  },
  (table) => [
    uniqueIndex("habit_logs_user_habit_date_idx").on(
      table.userId,
      table.habitId,
      table.date,
    ),
  ],
);
