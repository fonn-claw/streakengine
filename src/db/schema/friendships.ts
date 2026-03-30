import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  friendId: integer("friend_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
