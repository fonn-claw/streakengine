"use server";

import { requireAuth } from "@/lib/auth";
import { getUserHabitHeatmap, type HabitDay } from "@/lib/queries/coach";

export async function fetchUserDetail(userId: number): Promise<HabitDay[]> {
  const session = await requireAuth();
  if (session.role !== "coach") {
    throw new Error("Unauthorized");
  }
  return getUserHabitHeatmap(userId);
}
