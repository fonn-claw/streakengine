import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserAchievements } from "@/lib/queries/achievements";
import {
  getRPGStats,
  getHabitXPBreakdown,
  getWaterConsistency,
  getNudgesSentCount,
} from "@/lib/queries/profile";
import { getFriendCount } from "@/lib/queries/friends";
import { getStreakState } from "@/lib/queries/streaks";
import { AchievementGrid } from "@/components/achievement-grid";
import { RPGStatBlock } from "@/components/rpg-stat-block";
import { HabitXPBreakdown } from "@/components/habit-xp-breakdown";

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [
    achievements,
    rpgData,
    habitBreakdown,
    waterConsistency,
    friendCount,
    nudgesSent,
    streakState,
  ] = await Promise.all([
    getUserAchievements(session.userId),
    getRPGStats(session.userId),
    getHabitXPBreakdown(session.userId),
    getWaterConsistency(session.userId),
    getFriendCount(session.userId),
    getNudgesSentCount(session.userId),
    getStreakState(session.userId, user.timezone),
  ]);

  // Compute RPG stats from raw data
  const totalXpAll = rpgData.reduce((sum, h) => sum + h.totalXp, 0);
  const findXp = (name: string) =>
    rpgData.find((h) => h.habitName.toLowerCase().includes(name))?.totalXp ?? 0;

  const stats = {
    str:
      totalXpAll > 0
        ? Math.round((findXp("exercise") / totalXpAll) * 100)
        : 0,
    int:
      totalXpAll > 0
        ? Math.round((findXp("meditation") / totalXpAll) * 100)
        : 0,
    dex:
      waterConsistency.totalDays > 0
        ? Math.round(
            (waterConsistency.daysCompleted / waterConsistency.totalDays) * 100,
          )
        : 0,
    cha: Math.min(100, (friendCount + nudgesSent) * 10),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero header */}
      <div
        className="relative h-[120px] pixel-border overflow-hidden bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: "url(/assets/hero-levelup.png)" }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <span className="font-heading text-[20px] text-primary">
            LVL {user.level}
          </span>
          <span className="font-heading text-[14px] text-text">
            {user.displayName}
          </span>
          <span className="font-body text-[10px] text-secondary">
            {user.totalXp} TOTAL XP
          </span>
          <span className="font-heading text-[11px] text-secondary">
            {streakState.currentStreak} DAY STREAK
          </span>
        </div>
      </div>

      <RPGStatBlock stats={stats} />
      <AchievementGrid achievements={achievements} />
      <HabitXPBreakdown habits={habitBreakdown} />
    </div>
  );
}
