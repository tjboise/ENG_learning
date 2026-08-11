import type { SupabaseClient } from "@supabase/supabase-js";
import { beijingDateKey } from "./timezone";

function computeStreak(reviewDates: Set<string>): number {
  const cursor = new Date();

  if (!reviewDates.has(beijingDateKey(cursor))) {
    // Haven't reviewed yet today — the streak still counts if it was
    // kept up through yesterday.
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (reviewDates.has(beijingDateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function getUserStats(supabase: SupabaseClient) {
  const [{ count: totalCards }, { data: reviewRows }] = await Promise.all([
    supabase.from("cards").select("id", { count: "exact", head: true }),
    supabase.from("cards").select("last_reviewed_at").not("last_reviewed_at", "is", null),
  ]);

  const reviewDates = new Set(
    (reviewRows ?? []).map((row) => beijingDateKey(new Date(row.last_reviewed_at as string)))
  );

  return {
    totalCards: totalCards ?? 0,
    streakDays: computeStreak(reviewDates),
  };
}
