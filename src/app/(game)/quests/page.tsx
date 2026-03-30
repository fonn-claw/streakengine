import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getWeeklyLeaderboard } from "@/lib/queries/leaderboard";
import { LeaderboardFull } from "@/components/leaderboard-full";

export default async function QuestsPage() {
  const session = await requireAuth();

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const leaderboard = await getWeeklyLeaderboard(
    session.userId,
    user.timezone,
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-[14px] text-primary">LEADERBOARD</h1>
      <LeaderboardFull entries={leaderboard} />
    </div>
  );
}
