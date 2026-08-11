import type { SupabaseClient } from "@supabase/supabase-js";

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

// "今天" is defined in Beijing time, not UTC, so a card added at 7am
// Beijing still counts toward the previous UTC day's boundary otherwise.
function beijingDayRangeUtc(now = new Date()) {
  const beijingNow = new Date(now.getTime() + BEIJING_OFFSET_MS);
  const y = beijingNow.getUTCFullYear();
  const m = beijingNow.getUTCMonth();
  const d = beijingNow.getUTCDate();
  const startUtc = new Date(Date.UTC(y, m, d) - BEIJING_OFFSET_MS);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc, endUtc };
}

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
