import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  trigger: varchar("trigger", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
});
