import { db } from "@/db";
import { users, friendships, habitLogs } from "@/db/schema";
import { eq, sql, and, gte, lte, inArray } from "drizzle-orm";
import { getTodayForUser, getWeekBounds } from "@/lib/utils";

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  weeklyXp: number;
  isCurrentUser: boolean;
}

export async function getWeeklyLeaderboard(
  userId: number,
  timezone: string,
): Promise<LeaderboardEntry[]> {
  const today = getTodayForUser(timezone);
  const { start, end } = getWeekBounds(today);

  // Get friend IDs (both directions)
  const friendRows = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(eq(friendships.userId, userId));

  const participantIds = [userId, ...friendRows.map((r) => r.friendId)];

  if (participantIds.length === 0) return [];

  // LEFT JOIN users with habit_logs filtered by date range
  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      weeklyXp: sql<number>`coalesce(sum(${habitLogs.xpEarned}), 0)`.as(
        "weekly_xp",
      ),
    })
    .from(users)
    .leftJoin(
      habitLogs,
      and(
        eq(habitLogs.userId, users.id),
        gte(habitLogs.date, start),
        lte(habitLogs.date, end),
      ),
    )
    .where(inArray(users.id, participantIds))
    .groupBy(users.id, users.displayName)
    .orderBy(sql`weekly_xp DESC`);

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    displayName: row.displayName,
    weeklyXp: Number(row.weeklyXp),
    isCurrentUser: row.userId === userId,
  }));
}
