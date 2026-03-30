import { db } from "@/db";
import { users, friendships, streaks, habitLogs, nudges } from "@/db/schema";
import { eq, and, sql, desc, max } from "drizzle-orm";

export interface FriendInfo {
  userId: number;
  displayName: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  lastActive: Date | null;
}

export async function getFriendsList(userId: number): Promise<FriendInfo[]> {
  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      level: users.level,
      totalXp: users.totalXp,
      currentStreak: sql<number>`coalesce(${streaks.currentStreak}, 0)`,
      lastActive: max(habitLogs.completedAt),
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.friendId))
    .leftJoin(streaks, eq(streaks.userId, friendships.friendId))
    .leftJoin(habitLogs, eq(habitLogs.userId, friendships.friendId))
    .where(eq(friendships.userId, userId))
    .groupBy(
      users.id,
      users.displayName,
      users.level,
      users.totalXp,
      streaks.currentStreak,
    )
    .orderBy(desc(max(habitLogs.completedAt)));

  return rows.map((r) => ({
    userId: r.userId,
    displayName: r.displayName,
    level: r.level,
    totalXp: r.totalXp,
    currentStreak: Number(r.currentStreak),
    lastActive: r.lastActive,
  }));
}

export async function getFriendCount(userId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendships)
    .where(eq(friendships.userId, userId));
  return Number(rows[0]?.count ?? 0);
}

export interface UnreadNudge {
  id: number;
  senderName: string;
  date: string;
}

export async function getUnreadNudges(
  userId: number,
): Promise<UnreadNudge[]> {
  const rows = await db
    .select({
      id: nudges.id,
      senderName: users.displayName,
      date: nudges.date,
    })
    .from(nudges)
    .innerJoin(users, eq(users.id, nudges.senderId))
    .where(and(eq(nudges.recipientId, userId), eq(nudges.read, false)));

  return rows;
}
