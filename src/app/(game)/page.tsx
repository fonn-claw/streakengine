import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getTodayQuests } from "@/lib/queries/habits";
import { getStreakState } from "@/lib/queries/streaks";
import { getWeeklyLeaderboard } from "@/lib/queries/leaderboard";
import { getActiveChallenge } from "@/lib/queries/challenges";
import { getUserAchievements } from "@/lib/queries/achievements";
import { QuestBoard } from "@/components/quest-board";
import { LeaderboardPeek } from "@/components/leaderboard-peek";
import { ChallengeProgress } from "@/components/challenge-progress";

export default async function HomePage() {
  const session = await requireAuth();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [quests, streakState, leaderboard, challenge, allAchievements] = await Promise.all([
    getTodayQuests(session.userId, user.timezone),
    getStreakState(session.userId, user.timezone),
    getWeeklyLeaderboard(session.userId, user.timezone),
    getActiveChallenge(session.userId, user.timezone),
    getUserAchievements(session.userId),
  ]);

  // Build achievement map for unlock celebration display
  const achievementMap: Record<number, { name: string; icon: string }> = {};
  for (const a of allAchievements) {
    achievementMap[a.id] = { name: a.name, icon: a.icon };
  }

  return (
    <div className="flex flex-col gap-4">
      <QuestBoard
        quests={quests}
        multiplier={streakState.multiplier}
        streakState={streakState}
        level={user.level}
        totalXp={user.totalXp}
        achievementMap={achievementMap}
      />
      <LeaderboardPeek entries={leaderboard} />
      <ChallengeProgress
        challenge={challenge?.challenge ?? null}
        participants={challenge?.participants ?? []}
      />
    </div>
  );
}
