import { db } from "@/db";
import { streaks, habitLogs } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getTodayForUser, getYesterdayForUser } from "@/lib/utils";
import { evaluateStreak } from "@/lib/engine/streak";

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  freezeAvailable: boolean;
  freezeMessage: string | null;
  lastActiveDate: string | null;
}

/** Fetch current streak state for a user, evaluating any missed days on load */
export async function getStreakState(
  userId: number,
  timezone: string,
): Promise<StreakState> {
  const today = getTodayForUser(timezone);
  const yesterday = getYesterdayForUser(timezone);

  const streakRecord = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  if (!streakRecord) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      multiplier: 1.0,
      freezeAvailable: true,
      freezeMessage: null,
      lastActiveDate: null,
    };
  }

  // If lastActiveDate is today or yesterday, no gap evaluation needed
  if (
    streakRecord.lastActiveDate === today ||
    streakRecord.lastActiveDate === yesterday
  ) {
    return {
      currentStreak: streakRecord.currentStreak,
      longestStreak: streakRecord.longestStreak,
      multiplier: streakRecord.multiplier,
      freezeAvailable: streakRecord.freezeAvailable,
      freezeMessage: null,
      lastActiveDate: streakRecord.lastActiveDate,
    };
  }

  // There is a gap (lastActiveDate is older than yesterday or null).
  // Check if yesterday had any completions we haven't accounted for.
  const [yesterdayLogs] = await db
    .select({ cnt: count() })
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, yesterday)));

  // If yesterday had logs, the lastActiveDate should have been updated.
  // But since it wasn't, the streak state is stale. Evaluate the gap.
  const evaluation = evaluateStreak({
    currentStreak: streakRecord.currentStreak,
    lastActiveDate:
      yesterdayLogs.cnt > 0 ? yesterday : streakRecord.lastActiveDate,
    today,
    yesterday,
    freezeAvailable: streakRecord.freezeAvailable,
    freezesUsedThisWeek: streakRecord.freezesUsedThisWeek,
    multiplier: streakRecord.multiplier,
    longestStreak: streakRecord.longestStreak,
    streakStartDate: streakRecord.streakStartDate,
  });

  let freezeMessage: string | null = null;

  switch (evaluation.action) {
    case "already_active":
      // No change needed
      break;

    case "increment":
      await db
        .update(streaks)
        .set({
          currentStreak: evaluation.newStreak,
          longestStreak: evaluation.newLongest,
          lastActiveDate: yesterday, // they were active yesterday
          updatedAt: new Date(),
        })
        .where(eq(streaks.userId, userId));
      return {
        currentStreak: evaluation.newStreak,
        longestStreak: evaluation.newLongest,
        multiplier: streakRecord.multiplier,
        freezeAvailable: streakRecord.freezeAvailable,
        freezeMessage: null,
        lastActiveDate: yesterday,
      };

    case "freeze_used":
      freezeMessage = evaluation.freezeMessage;
      await db
        .update(streaks)
        .set({
          freezeAvailable: false,
          freezesUsedThisWeek: streakRecord.freezesUsedThisWeek + 1,
          updatedAt: new Date(),
        })
        .where(eq(streaks.userId, userId));
      return {
        currentStreak: streakRecord.currentStreak,
        longestStreak: streakRecord.longestStreak,
        multiplier: streakRecord.multiplier,
        freezeAvailable: false,
        freezeMessage,
        lastActiveDate: streakRecord.lastActiveDate,
      };

    case "break":
      await db
        .update(streaks)
        .set({
          currentStreak: 0,
          multiplier: 1.0,
          streakStartDate: null,
          updatedAt: new Date(),
        })
        .where(eq(streaks.userId, userId));
      return {
        currentStreak: 0,
        longestStreak: streakRecord.longestStreak,
        multiplier: 1.0,
        freezeAvailable: streakRecord.freezeAvailable,
        freezeMessage: null,
        lastActiveDate: streakRecord.lastActiveDate,
      };

    case "first_ever":
      // Shouldn't happen since record exists, but handle gracefully
      break;
  }

  return {
    currentStreak: streakRecord.currentStreak,
    longestStreak: streakRecord.longestStreak,
    multiplier: streakRecord.multiplier,
    freezeAvailable: streakRecord.freezeAvailable,
    freezeMessage: null,
    lastActiveDate: streakRecord.lastActiveDate,
  };
}
