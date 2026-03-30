"use server";

import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, habits, habitLogs, streaks, userAchievements } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { calculateXP, getLevelFromXP } from "@/lib/engine/xp";
import { evaluateStreak } from "@/lib/engine/streak";
import {
  evaluateAchievements,
  type AchievementContext,
} from "@/lib/engine/achievements";
import { getAchievementChecks } from "@/lib/queries/achievements";
import { getFriendCount } from "@/lib/queries/friends";
import { getTodayForUser, getYesterdayForUser } from "@/lib/utils";

async function checkAndUnlockAchievements(
  userId: number,
  currentStreak: number,
  timezone: string,
): Promise<number[]> {
  const [checks, friendCount] = await Promise.all([
    getAchievementChecks(userId),
    getFriendCount(userId),
  ]);

  const localHour = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10,
  );

  const ctx: AchievementContext = {
    currentStreak,
    completedAtHour: localHour,
    friendCount,
  };

  const newlyUnlocked = evaluateAchievements(checks, ctx);

  if (newlyUnlocked.length > 0) {
    await db
      .insert(userAchievements)
      .values(newlyUnlocked.map((achievementId) => ({ userId, achievementId })))
      .onConflictDoNothing();
  }

  return newlyUnlocked;
}

/**
 * Complete a single-completion habit (Exercise, Meditation, Sleep).
 * Awards XP, checks streak, handles double-click via unique index.
 */
export async function completeHabit(habitId: number): Promise<{
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  newTotalXp: number;
  streakIncremented: boolean;
  newStreak: number;
  newlyUnlocked: number[];
}> {
  const session = await requireAuth();
  const userId = session.userId;

  // Fetch user, habit, and streak in parallel
  const [user, habit, streakRecord] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.habits.findFirst({ where: eq(habits.id, habitId) }),
    db.query.streaks.findFirst({ where: eq(streaks.userId, userId) }),
  ]);

  if (!user) throw new Error("User not found");
  if (!habit) throw new Error("Habit not found");

  const multiplier = streakRecord?.multiplier ?? 1.0;
  const xpEarned = calculateXP(habit.xpReward, multiplier);
  const previousLevel = getLevelFromXP(user.totalXp);
  const today = getTodayForUser(user.timezone);
  const yesterday = getYesterdayForUser(user.timezone);

  // Check if this is the first completion today (for streak)
  const existingLogs = await db
    .select({ id: habitLogs.id })
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, today)))
    .limit(1);

  const isFirstToday = existingLogs.length === 0;

  // Insert habit log — unique index handles double-click
  try {
    const inserted = await db
      .insert(habitLogs)
      .values({
        userId,
        habitId,
        date: today,
        progress: 1,
        xpEarned,
      })
      .onConflictDoNothing()
      .returning({ id: habitLogs.id });

    if (inserted.length === 0) {
      // Duplicate — already completed. Return current state.
      return {
        xpEarned: 0,
        leveledUp: false,
        newLevel: previousLevel,
        newTotalXp: user.totalXp,
        streakIncremented: false,
        newStreak: streakRecord?.currentStreak ?? 0,
        newlyUnlocked: [],
      };
    }
  } catch {
    // Unique constraint violation fallback
    return {
      xpEarned: 0,
      leveledUp: false,
      newLevel: previousLevel,
      newTotalXp: user.totalXp,
      streakIncremented: false,
      newStreak: streakRecord?.currentStreak ?? 0,
      newlyUnlocked: [],
    };
  }

  // Award XP
  const [updated] = await db
    .update(users)
    .set({
      totalXp: sql`${users.totalXp} + ${xpEarned}`,
    })
    .where(eq(users.id, userId))
    .returning({ totalXp: users.totalXp });

  const newTotalXp = updated.totalXp;
  const newLevel = getLevelFromXP(newTotalXp);

  // Update user level if changed
  if (newLevel !== user.level) {
    await db
      .update(users)
      .set({ level: newLevel })
      .where(eq(users.id, userId));
  }

  // Streak logic — only on first completion today
  let streakIncremented = false;
  let newStreak = streakRecord?.currentStreak ?? 0;

  if (isFirstToday && streakRecord) {
    const evaluation = evaluateStreak({
      currentStreak: streakRecord.currentStreak,
      lastActiveDate: streakRecord.lastActiveDate,
      today,
      yesterday,
      freezeAvailable: streakRecord.freezeAvailable,
      freezesUsedThisWeek: streakRecord.freezesUsedThisWeek,
      multiplier: streakRecord.multiplier,
      longestStreak: streakRecord.longestStreak,
      streakStartDate: streakRecord.streakStartDate,
    });

    switch (evaluation.action) {
      case "increment":
        await db
          .update(streaks)
          .set({
            currentStreak: evaluation.newStreak,
            longestStreak: evaluation.newLongest,
            lastActiveDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = evaluation.newStreak;
        streakIncremented = true;
        break;

      case "first_ever":
        await db
          .update(streaks)
          .set({
            currentStreak: 1,
            longestStreak: Math.max(streakRecord.longestStreak, 1),
            lastActiveDate: today,
            streakStartDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = 1;
        streakIncremented = true;
        break;

      case "freeze_used":
        await db
          .update(streaks)
          .set({
            freezeAvailable: false,
            freezesUsedThisWeek: streakRecord.freezesUsedThisWeek + 1,
            lastActiveDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = streakRecord.currentStreak;
        break;

      case "break":
        await db
          .update(streaks)
          .set({
            currentStreak: 1,
            longestStreak: streakRecord.longestStreak,
            multiplier: 1.0,
            lastActiveDate: today,
            streakStartDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = 1;
        streakIncremented = true;
        break;

      case "already_active":
        // Mark today as active even if streak didn't change
        await db
          .update(streaks)
          .set({ lastActiveDate: today, updatedAt: new Date() })
          .where(eq(streaks.userId, userId));
        break;
    }
  } else if (isFirstToday && !streakRecord) {
    // No streak record — create one
    await db.insert(streaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      streakStartDate: today,
      multiplier: 1.0,
      freezeAvailable: true,
      freezesUsedThisWeek: 0,
    });
    newStreak = 1;
    streakIncremented = true;
  }

  const newlyUnlocked = await checkAndUnlockAchievements(userId, newStreak, user.timezone);

  revalidatePath("/");

  return {
    xpEarned,
    leveledUp: newLevel > previousLevel,
    newLevel,
    newTotalXp,
    streakIncremented,
    newStreak,
    newlyUnlocked,
  };
}

/**
 * Increment progress on a partial-progress habit (e.g., Water 3/8).
 * XP is only awarded when the daily target is reached.
 */
export async function incrementProgress(habitId: number): Promise<{
  progress: number;
  completed: boolean;
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  newTotalXp: number;
  streakIncremented: boolean;
  newStreak: number;
  newlyUnlocked: number[];
}> {
  const session = await requireAuth();
  const userId = session.userId;

  const [user, habit, streakRecord] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.habits.findFirst({ where: eq(habits.id, habitId) }),
    db.query.streaks.findFirst({ where: eq(streaks.userId, userId) }),
  ]);

  if (!user) throw new Error("User not found");
  if (!habit) throw new Error("Habit not found");

  const today = getTodayForUser(user.timezone);
  const yesterday = getYesterdayForUser(user.timezone);

  // Check existing log for today
  const existingLog = await db
    .select({ id: habitLogs.id, progress: habitLogs.progress })
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.date, today),
      ),
    )
    .limit(1);

  // Check if any log exists today (for streak)
  const anyTodayLogs = await db
    .select({ id: habitLogs.id })
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, today)))
    .limit(1);

  const isFirstToday = anyTodayLogs.length === 0;

  let newProgress: number;

  if (existingLog.length > 0) {
    // Already completed target — no more increments
    if (existingLog[0].progress >= habit.targetCount) {
      return {
        progress: existingLog[0].progress,
        completed: true,
        xpEarned: 0,
        leveledUp: false,
        newLevel: getLevelFromXP(user.totalXp),
        newTotalXp: user.totalXp,
        streakIncremented: false,
        newStreak: streakRecord?.currentStreak ?? 0,
        newlyUnlocked: [],
      };
    }

    // Increment existing
    newProgress = existingLog[0].progress + 1;
    await db
      .update(habitLogs)
      .set({ progress: newProgress })
      .where(eq(habitLogs.id, existingLog[0].id));
  } else {
    // First increment today — insert
    newProgress = 1;
    await db.insert(habitLogs).values({
      userId,
      habitId,
      date: today,
      progress: 1,
      xpEarned: 0,
    });
  }

  const completed = newProgress >= habit.targetCount;
  let xpEarned = 0;
  let newTotalXp = user.totalXp;
  const previousLevel = getLevelFromXP(user.totalXp);
  let newLevel = previousLevel;

  // Award XP on completion
  if (completed && (existingLog.length === 0 || existingLog[0].progress < habit.targetCount)) {
    const multiplier = streakRecord?.multiplier ?? 1.0;
    xpEarned = calculateXP(habit.xpReward, multiplier);

    // Update XP earned on the log
    const logToUpdate = existingLog.length > 0
      ? existingLog[0].id
      : (await db.select({ id: habitLogs.id }).from(habitLogs).where(
          and(
            eq(habitLogs.userId, userId),
            eq(habitLogs.habitId, habitId),
            eq(habitLogs.date, today),
          ),
        ))[0].id;

    await db
      .update(habitLogs)
      .set({ xpEarned })
      .where(eq(habitLogs.id, logToUpdate));

    // Award XP to user
    const [updated] = await db
      .update(users)
      .set({ totalXp: sql`${users.totalXp} + ${xpEarned}` })
      .where(eq(users.id, userId))
      .returning({ totalXp: users.totalXp });

    newTotalXp = updated.totalXp;
    newLevel = getLevelFromXP(newTotalXp);

    if (newLevel !== user.level) {
      await db
        .update(users)
        .set({ level: newLevel })
        .where(eq(users.id, userId));
    }
  }

  // Streak logic — only on first completion today
  let streakIncremented = false;
  let newStreak = streakRecord?.currentStreak ?? 0;

  if (isFirstToday && streakRecord) {
    const evaluation = evaluateStreak({
      currentStreak: streakRecord.currentStreak,
      lastActiveDate: streakRecord.lastActiveDate,
      today,
      yesterday,
      freezeAvailable: streakRecord.freezeAvailable,
      freezesUsedThisWeek: streakRecord.freezesUsedThisWeek,
      multiplier: streakRecord.multiplier,
      longestStreak: streakRecord.longestStreak,
      streakStartDate: streakRecord.streakStartDate,
    });

    switch (evaluation.action) {
      case "increment":
        await db
          .update(streaks)
          .set({
            currentStreak: evaluation.newStreak,
            longestStreak: evaluation.newLongest,
            lastActiveDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = evaluation.newStreak;
        streakIncremented = true;
        break;

      case "first_ever":
        await db
          .update(streaks)
          .set({
            currentStreak: 1,
            longestStreak: Math.max(streakRecord.longestStreak, 1),
            lastActiveDate: today,
            streakStartDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = 1;
        streakIncremented = true;
        break;

      case "freeze_used":
        await db
          .update(streaks)
          .set({
            freezeAvailable: false,
            freezesUsedThisWeek: streakRecord.freezesUsedThisWeek + 1,
            lastActiveDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = streakRecord.currentStreak;
        break;

      case "break":
        await db
          .update(streaks)
          .set({
            currentStreak: 1,
            longestStreak: streakRecord.longestStreak,
            multiplier: 1.0,
            lastActiveDate: today,
            streakStartDate: today,
            updatedAt: new Date(),
          })
          .where(eq(streaks.userId, userId));
        newStreak = 1;
        streakIncremented = true;
        break;

      case "already_active":
        await db
          .update(streaks)
          .set({ lastActiveDate: today, updatedAt: new Date() })
          .where(eq(streaks.userId, userId));
        break;
    }
  } else if (isFirstToday && !streakRecord) {
    await db.insert(streaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      streakStartDate: today,
      multiplier: 1.0,
      freezeAvailable: true,
      freezesUsedThisWeek: 0,
    });
    newStreak = 1;
    streakIncremented = true;
  }

  const newlyUnlocked = await checkAndUnlockAchievements(userId, newStreak, user.timezone);

  revalidatePath("/");

  return {
    progress: newProgress,
    completed,
    xpEarned,
    leveledUp: newLevel > previousLevel,
    newLevel,
    newTotalXp,
    streakIncremented,
    newStreak,
    newlyUnlocked,
  };
}
