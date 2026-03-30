/**
 * Achievement evaluation — pure function, zero DB imports.
 */

export interface AchievementCheck {
  achievementId: number;
  trigger: string;
  alreadyUnlocked: boolean;
}

export interface AchievementContext {
  currentStreak: number;
  completedAtHour: number; // local hour (0-23) in user's timezone
  friendCount: number;
}

export function evaluateAchievements(
  checks: AchievementCheck[],
  ctx: AchievementContext,
): number[] {
  const newlyUnlocked: number[] = [];
  for (const check of checks) {
    if (check.alreadyUnlocked) continue;
    switch (check.trigger) {
      case "streak_7":
        if (ctx.currentStreak >= 7) newlyUnlocked.push(check.achievementId);
        break;
      case "streak_30":
        if (ctx.currentStreak >= 30) newlyUnlocked.push(check.achievementId);
        break;
      case "early_bird":
        if (ctx.completedAtHour < 7) newlyUnlocked.push(check.achievementId);
        break;
      case "social_5_friends":
        if (ctx.friendCount >= 5) newlyUnlocked.push(check.achievementId);
        break;
    }
  }
  return newlyUnlocked;
}
