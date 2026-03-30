import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["player", "coach"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  role: roleEnum("role").notNull().default("player"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  level: integer("level").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
