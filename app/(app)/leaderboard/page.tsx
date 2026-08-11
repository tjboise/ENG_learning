import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLeaderboard } from "@/lib/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const admin = createAdminClient();
  const entries = await getLeaderboard(admin);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold">今日排行榜</h1>
        <p className="text-sm text-muted">看看大家今天记了多少、复习了多少</p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted">还没有人记录</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, i) => (
            <li key={entry.userId}>
              <Link
                href={`/leaderboard/${entry.userId}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-6 shrink-0 text-center text-lg">
                    {MEDALS[i] ?? i + 1}
                  </span>
                  <div className="overflow-hidden">
                    <p className="truncate font-medium">{entry.email}</p>
                    <p className="text-xs text-muted">
                      共 {entry.totalCards} 张卡片
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-4 text-right text-sm">
                  <div>
                    <p className="font-semibold text-accent">
                      {entry.recordedToday}
                    </p>
                    <p className="text-xs text-muted">今日记录</p>
                  </div>
                  <div>
                    <p className="font-semibold text-accent">
                      {entry.reviewedToday}
                    </p>
                    <p className="text-xs text-muted">今日复习</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
