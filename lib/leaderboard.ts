import type { SupabaseClient } from "@supabase/supabase-js";
import { beijingDayRangeUtc } from "./timezone";

export interface LeaderboardEntry {
  userId: string;
  email: string;
  recordedToday: number;
  reviewedToday: number;
  totalCards: number;
}

// Uses the service-role admin client, since ranking requires seeing
// every user's counts, not just the caller's own (RLS would otherwise
// only return the caller's rows).
export async function getLeaderboard(
  admin: SupabaseClient
): Promise<LeaderboardEntry[]> {
  const { startUtc, endUtc } = beijingDayRangeUtc();

  const [{ data: cards }, { data: usersData }] = await Promise.all([
    admin.from("cards").select("user_id, created_at, last_reviewed_at"),
    admin.auth.admin.listUsers({ perPage: 200 }),
  ]);

  const statsByUser = new Map<
    string,
    { recordedToday: number; reviewedToday: number; totalCards: number }
  >();

  for (const card of cards ?? []) {
    const stats = statsByUser.get(card.user_id) ?? {
      recordedToday: 0,
      reviewedToday: 0,
      totalCards: 0,
    };
    stats.totalCards += 1;

    const createdAt = new Date(card.created_at as string);
    if (createdAt >= startUtc && createdAt < endUtc) {
      stats.recordedToday += 1;
    }

    if (card.last_reviewed_at) {
      const reviewedAt = new Date(card.last_reviewed_at as string);
      if (reviewedAt >= startUtc && reviewedAt < endUtc) {
        stats.reviewedToday += 1;
      }
    }

    statsByUser.set(card.user_id, stats);
  }

  const entries: LeaderboardEntry[] = [];
  for (const u of usersData?.users ?? []) {
    if (!u.email) continue;
    const stats = statsByUser.get(u.id) ?? {
      recordedToday: 0,
      reviewedToday: 0,
      totalCards: 0,
    };
    entries.push({ userId: u.id, email: u.email, ...stats });
  }

  entries.sort(
    (a, b) =>
      b.recordedToday + b.reviewedToday - (a.recordedToday + a.reviewedToday)
  );

  return entries;
}
