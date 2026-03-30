"use server";

import { db } from "@/db";
import { nudges, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getTodayForUser } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

export async function sendNudge(
  friendId: number,
): Promise<{ sent: boolean }> {
  const session = await requireAuth();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  if (!user) throw new Error("User not found");

  const today = getTodayForUser(user.timezone);
  const inserted = await db
    .insert(nudges)
    .values({ senderId: session.userId, recipientId: friendId, date: today })
    .onConflictDoNothing()
    .returning({ id: nudges.id });

  return { sent: inserted.length > 0 };
}

export async function markNudgesRead(nudgeIds: number[]): Promise<void> {
  const session = await requireAuth();
  for (const id of nudgeIds) {
    await db
      .update(nudges)
      .set({ read: true })
      .where(and(eq(nudges.id, id), eq(nudges.recipientId, session.userId)));
  }
}
