import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }).notNull(),
  targetXp: integer("target_xp").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  currentXp: integer("current_xp").notNull().default(0),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});
