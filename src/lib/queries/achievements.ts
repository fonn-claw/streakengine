import { db } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { AchievementCheck } from "@/lib/engine/achievements";

export interface UserAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  trigger: string;
  category: string;
  xpReward: number;
  unlockedAt: Date | null;
}

export async function getUserAchievements(
  userId: number,
): Promise<UserAchievement[]> {
  const rows = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      icon: achievements.icon,
      trigger: achievements.trigger,
      category: achievements.category,
      xpReward: achievements.xpReward,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(achievements)
    .leftJoin(
      userAchievements,
      sql`${userAchievements.achievementId} = ${achievements.id} AND ${userAchievements.userId} = ${userId}`,
    );

  return rows;
}

export async function getAchievementChecks(
  userId: number,
): Promise<AchievementCheck[]> {
  const rows = await db
    .select({
      achievementId: achievements.id,
      trigger: achievements.trigger,
      unlockedAt: userAchievements.unlockedAt,
    })
    .from(achievements)
    .leftJoin(
      userAchievements,
      sql`${userAchievements.achievementId} = ${achievements.id} AND ${userAchievements.userId} = ${userId}`,
    );

  return rows.map((r) => ({
    achievementId: r.achievementId,
    trigger: r.trigger,
    alreadyUnlocked: r.unlockedAt !== null,
  }));
}
