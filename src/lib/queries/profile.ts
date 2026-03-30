import { db } from "@/db";
import { habitLogs, habits, nudges } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export interface HabitXPEntry {
  habitName: string;
  habitIcon: string | null;
  totalXp: number;
}

export async function getRPGStats(userId: number): Promise<HabitXPEntry[]> {
  const rows = await db
    .select({
      habitName: habits.name,
      habitIcon: habits.icon,
      totalXp: sql<number>`coalesce(sum(${habitLogs.xpEarned}), 0)`,
    })
    .from(habitLogs)
    .innerJoin(habits, eq(habits.id, habitLogs.habitId))
    .where(eq(habitLogs.userId, userId))
    .groupBy(habits.name, habits.icon);

  return rows.map((r) => ({
    habitName: r.habitName,
    habitIcon: r.habitIcon,
    totalXp: Number(r.totalXp),
  }));
}

export async function getHabitXPBreakdown(
  userId: number,
): Promise<HabitXPEntry[]> {
  return getRPGStats(userId);
}

export async function getNudgesSentCount(userId: number): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(nudges)
    .where(eq(nudges.senderId, userId));
  return Number(rows[0]?.count ?? 0);
}

export async function getWaterConsistency(
  userId: number,
): Promise<{ daysCompleted: number; totalDays: number }> {
  // Find the Water habit by name (case-insensitive match)
  const waterHabit = await db
    .select({ id: habits.id, targetCount: habits.targetCount })
    .from(habits)
    .where(sql`lower(${habits.name}) = 'water'`)
    .limit(1);

  if (waterHabit.length === 0) {
    return { daysCompleted: 0, totalDays: 0 };
  }

  const habitId = waterHabit[0].id;
  const target = waterHabit[0].targetCount;

  // Count distinct dates where progress >= targetCount
  const completedRows = await db
    .select({ count: sql<number>`count(distinct ${habitLogs.date})` })
    .from(habitLogs)
    .where(
      sql`${habitLogs.userId} = ${userId} AND ${habitLogs.habitId} = ${habitId} AND ${habitLogs.progress} >= ${target}`,
    );

  // Count total distinct dates with any habit log
  const totalRows = await db
    .select({ count: sql<number>`count(distinct ${habitLogs.date})` })
    .from(habitLogs)
    .where(eq(habitLogs.userId, userId));

  const totalDays = Number(totalRows[0]?.count ?? 0);
  if (totalDays === 0) {
    return { daysCompleted: 0, totalDays: 0 };
  }

  return {
    daysCompleted: Number(completedRows[0]?.count ?? 0),
    totalDays,
  };
}
