import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  xpReward: integer("xp_reward").notNull().default(10),
  targetCount: integer("target_count").notNull().default(1),
  frequency: varchar("frequency", { length: 20 }).notNull().default("daily"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
