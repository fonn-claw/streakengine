import { db } from "@/db";
import { habits, habitLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getTodayForUser } from "@/lib/utils";

export interface Quest {
  id: number;
  name: string;
  icon: string | null;
  xpReward: number;
  targetCount: number;
  progress: number;
  completed: boolean;
  xpEarned: number;
}

/** Fetch today's quests with completion status for a user */
export async function getTodayQuests(
  userId: number,
  timezone: string,
): Promise<Quest[]> {
  const today = getTodayForUser(timezone);

  const rows = await db
    .select({
      id: habits.id,
      name: habits.name,
      icon: habits.icon,
      xpReward: habits.xpReward,
      targetCount: habits.targetCount,
      progress: habitLogs.progress,
      xpEarned: habitLogs.xpEarned,
    })
    .from(habits)
    .leftJoin(
      habitLogs,
      and(
        eq(habitLogs.habitId, habits.id),
        eq(habitLogs.userId, userId),
        eq(habitLogs.date, today),
      ),
    )
    .orderBy(desc(habits.xpReward));

  const quests: Quest[] = rows.map((row) => {
    const progress = row.progress ?? 0;
    const completed =
      row.targetCount === 1
        ? row.progress !== null
        : progress >= row.targetCount;
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      xpReward: row.xpReward,
      targetCount: row.targetCount,
      progress,
      completed,
      xpEarned: row.xpEarned ?? 0,
    };
  });

  // Sort: incomplete first (by xpReward desc already), then completed
  quests.sort((a, b) => {
    if (a.completed === b.completed) return b.xpReward - a.xpReward;
    return a.completed ? 1 : -1;
  });

  return quests;
}
