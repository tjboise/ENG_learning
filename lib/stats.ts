import type { SupabaseClient } from "@supabase/supabase-js";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeStreak(reviewDates: Set<string>): number {
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  if (!reviewDates.has(dateKey(cursor))) {
    // Haven't reviewed yet today — the streak still counts if it was
    // kept up through yesterday.
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (reviewDates.has(dateKey(cursor))) {
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
    (reviewRows ?? []).map((row) => dateKey(new Date(row.last_reviewed_at as string)))
  );

  return {
    totalCards: totalCards ?? 0,
    streakDays: computeStreak(reviewDates),
  };
}
