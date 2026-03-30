import { db } from "@/db";
import { users, habits, habitLogs, streaks, nudges } from "@/db/schema";
import { eq, ne, sql, and } from "drizzle-orm";
import { getTodayForUser, getWeekBounds } from "@/lib/utils";

export interface CoachUserCard {
  userId: number;
  displayName: string;
  currentStreak: number;
  weeklyXp: number;
  lastActiveDate: string | null;
  thisWeekLogs: number;
  lastWeekLogs: number;
  engagementRatio: number;
  riskLevel: "green" | "yellow" | "red";
  nudgedToday: boolean;
}

export interface HabitDay {
  habitName: string;
  habitIcon: string | null;
  days: { date: string; completed: boolean }[];
}

export async function getCoachDashboardData(
  coachId: number,
): Promise<CoachUserCard[]> {
  const today = getTodayForUser("UTC");
  const thisWeek = getWeekBounds(today);

  // Compute last week bounds by going 7 days back
  const sevenDaysAgo = new Date(today + "T12:00:00Z");
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const lastWeekDate = sevenDaysAgo.toISOString().slice(0, 10);
  const lastWeek = getWeekBounds(lastWeekDate);

  // 14 days ago for new-user threshold
  const fourteenDaysAgo = new Date(today + "T12:00:00Z");
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const rows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      createdAt: users.createdAt,
      currentStreak: sql<number>`coalesce(${streaks.currentStreak}, 0)`,
      lastActiveDate: streaks.lastActiveDate,
      thisWeekLogs: sql<number>`coalesce((
        select count(*)::int from habit_logs
        where habit_logs.user_id = ${users.id}
          and habit_logs.date between ${thisWeek.start} and ${thisWeek.end}
      ), 0)`,
      lastWeekLogs: sql<number>`coalesce((
        select count(*)::int from habit_logs
        where habit_logs.user_id = ${users.id}
          and habit_logs.date between ${lastWeek.start} and ${lastWeek.end}
      ), 0)`,
      weeklyXp: sql<number>`coalesce((
        select sum(habit_logs.xp_earned)::int from habit_logs
        where habit_logs.user_id = ${users.id}
          and habit_logs.date between ${thisWeek.start} and ${thisWeek.end}
      ), 0)`,
      nudgedToday: sql<boolean>`exists(
        select 1 from nudges
        where nudges.sender_id = ${coachId}
          and nudges.recipient_id = ${users.id}
          and nudges.date = ${today}
      )`,
    })
    .from(users)
    .leftJoin(streaks, eq(streaks.userId, users.id))
    .where(ne(users.role, "coach"));

  const cards: CoachUserCard[] = rows.map((r) => {
    const thisWeekLogs = Number(r.thisWeekLogs);
    const lastWeekLogs = Number(r.lastWeekLogs);
    const engagementRatio =
      lastWeekLogs === 0 ? 1 : thisWeekLogs / lastWeekLogs;

    // New users (< 14 days) default to green
    const isNewUser = r.createdAt > fourteenDaysAgo;

    let riskLevel: "green" | "yellow" | "red";
    if (isNewUser) {
      riskLevel = "green";
    } else if (engagementRatio < 0.7) {
      riskLevel = "red";
    } else if (engagementRatio < 0.9) {
      riskLevel = "yellow";
    } else {
      riskLevel = "green";
    }

    return {
      userId: r.userId,
      displayName: r.displayName,
      currentStreak: Number(r.currentStreak),
      weeklyXp: Number(r.weeklyXp),
      lastActiveDate: r.lastActiveDate,
      thisWeekLogs,
      lastWeekLogs,
      engagementRatio,
      riskLevel,
      nudgedToday: Boolean(r.nudgedToday),
    };
  });

  // Sort: red first, then yellow, then green; within same risk, worst ratio first
  const riskOrder = { red: 0, yellow: 1, green: 2 };
  cards.sort((a, b) => {
    const orderDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (orderDiff !== 0) return orderDiff;
    return a.engagementRatio - b.engagementRatio;
  });

  return cards;
}

export async function getUserHabitHeatmap(
  userId: number,
): Promise<HabitDay[]> {
  const today = getTodayForUser("UTC");
  const weekBounds = getWeekBounds(today);

  // Get all habits
  const allHabits = await db
    .select({
      id: habits.id,
      name: habits.name,
      icon: habits.icon,
      targetCount: habits.targetCount,
    })
    .from(habits);

  // Get habit logs for this user this week
  const logs = await db
    .select({
      habitId: habitLogs.habitId,
      date: habitLogs.date,
      progress: habitLogs.progress,
    })
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        sql`${habitLogs.date} between ${weekBounds.start} and ${weekBounds.end}`,
      ),
    );

  // Build a set for quick lookup: "habitId:date" -> max progress
  const logMap = new Map<string, number>();
  for (const log of logs) {
    const key = `${log.habitId}:${log.date}`;
    const existing = logMap.get(key) ?? 0;
    logMap.set(key, Math.max(existing, log.progress));
  }

  // Generate 7 dates (Mon-Sun) for this week
  const dates: string[] = [];
  const startDate = new Date(weekBounds.start + "T12:00:00Z");
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Build HabitDay array
  const result: HabitDay[] = allHabits.map((habit) => ({
    habitName: habit.name,
    habitIcon: habit.icon,
    days: dates.map((date) => {
      const progress = logMap.get(`${habit.id}:${date}`) ?? 0;
      const completed = progress >= habit.targetCount;
      return { date, completed };
    }),
  }));

  // Sort by habit name
  result.sort((a, b) => a.habitName.localeCompare(b.habitName));

  return result;
}
