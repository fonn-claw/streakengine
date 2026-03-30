import { db } from "@/db";
import { challenges, challengeParticipants, users } from "@/db/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";
import { getTodayForUser } from "@/lib/utils";

export interface ChallengeParticipant {
  userId: number;
  displayName: string;
  currentXp: number;
}

export interface ActiveChallengeResult {
  challenge: {
    id: number;
    name: string;
    description: string | null;
    targetXp: number;
    startDate: string;
    endDate: string;
  } | null;
  participants: ChallengeParticipant[];
}

export async function getActiveChallenge(
  userId: number,
  timezone: string,
): Promise<ActiveChallengeResult> {
  const today = getTodayForUser(timezone);

  const activeRows = await db
    .select()
    .from(challenges)
    .where(and(lte(challenges.startDate, today), gte(challenges.endDate, today)))
    .limit(1);

  if (activeRows.length === 0) {
    return { challenge: null, participants: [] };
  }

  const challenge = activeRows[0];

  const participantRows = await db
    .select({
      userId: users.id,
      displayName: users.displayName,
      currentXp: challengeParticipants.currentXp,
    })
    .from(challengeParticipants)
    .innerJoin(users, eq(users.id, challengeParticipants.userId))
    .where(eq(challengeParticipants.challengeId, challenge.id))
    .orderBy(sql`${challengeParticipants.currentXp} DESC`);

  return {
    challenge: {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      targetXp: challenge.targetXp,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
    },
    participants: participantRows,
  };
}
