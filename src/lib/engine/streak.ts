/**
 * Streak evaluation, freeze logic, and multiplier calculation.
 * Pure functions — zero DB imports.
 */

export type StreakEvaluation =
  | { action: "already_active" }
  | {
      action: "increment";
      newStreak: number;
      newLongest: number;
    }
  | {
      action: "freeze_used";
      freezeMessage: string;
    }
  | {
      action: "break";
      newStreak: number;
      freezeMessage: null;
    }
  | {
      action: "first_ever";
      newStreak: number;
    };

export interface StreakParams {
  currentStreak: number;
  lastActiveDate: string | null;
  today: string;
  yesterday: string;
  freezeAvailable: boolean;
  freezesUsedThisWeek: number;
  multiplier: number;
  longestStreak: number;
  streakStartDate: string | null;
}

/**
 * Pure function: evaluate what should happen to the streak given current state.
 * Returns a discriminated union describing the action to take.
 */
export function evaluateStreak(params: StreakParams): StreakEvaluation {
  const {
    currentStreak,
    lastActiveDate,
    today,
    yesterday,
    freezeAvailable,
    freezesUsedThisWeek,
    longestStreak,
  } = params;

  // First time ever
  if (lastActiveDate === null) {
    return { action: "first_ever", newStreak: 1 };
  }

  // Already logged today
  if (lastActiveDate === today) {
    return { action: "already_active" };
  }

  // Active yesterday — streak continues
  if (lastActiveDate === yesterday) {
    const newStreak = currentStreak + 1;
    return {
      action: "increment",
      newStreak,
      newLongest: Math.max(longestStreak, newStreak),
    };
  }

  // Missed yesterday (or more) — check freeze
  if (freezeAvailable && freezesUsedThisWeek < 1) {
    return {
      action: "freeze_used",
      freezeMessage: "Freeze saved your streak!",
    };
  }

  // No freeze — streak breaks, start fresh at 1
  return { action: "break", newStreak: 1, freezeMessage: null };
}

/**
 * Multiplier based on consecutive complete weeks.
 * 0-1 weeks = 1.0, 2 weeks = 1.2, 3 weeks = 1.3, 4+ weeks = 1.5 (cap).
 */
export function calculateMultiplier(consecutiveCompleteWeeks: number): number {
  if (consecutiveCompleteWeeks <= 1) return 1.0;
  if (consecutiveCompleteWeeks === 2) return 1.2;
  if (consecutiveCompleteWeeks === 3) return 1.3;
  return 1.5;
}

/**
 * Check if every day in a Mon-Sun range has at least one habit log.
 * @param habitLogDates — array of "YYYY-MM-DD" date strings with at least one log
 * @param weekStart — Monday "YYYY-MM-DD"
 * @param weekEnd — Sunday "YYYY-MM-DD"
 */
export function isWeekComplete(
  habitLogDates: string[],
  weekStart: string,
  weekEnd: string,
): boolean {
  const dateSet = new Set(habitLogDates);
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const cursor = new Date(start);
  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(dateStr)) return false;
    cursor.setDate(cursor.getDate() + 1);
  }
  return true;
}
