import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getTodayQuests } from "@/lib/queries/habits";
import { getStreakState } from "@/lib/queries/streaks";
import { QuestBoard } from "@/components/quest-board";

export default async function HomePage() {
  const session = await requireAuth();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [quests, streakState] = await Promise.all([
    getTodayQuests(session.userId, user.timezone),
    getStreakState(session.userId, user.timezone),
  ]);

  return (
    <QuestBoard
      quests={quests}
      multiplier={streakState.multiplier}
      streakState={streakState}
      level={user.level}
      totalXp={user.totalXp}
    />
  );
}
