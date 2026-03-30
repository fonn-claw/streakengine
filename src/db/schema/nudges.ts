import {
  pgTable,
  serial,
  integer,
  varchar,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const nudges = pgTable(
  "nudges",
  {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id),
    recipientId: integer("recipient_id")
      .notNull()
      .references(() => users.id),
    date: varchar("date", { length: 10 }).notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("nudges_sender_recipient_date_idx").on(
      table.senderId,
      table.recipientId,
      table.date,
    ),
  ],
);
