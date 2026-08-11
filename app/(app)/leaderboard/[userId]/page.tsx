import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { CardsList } from "../../cards/cards-list";
import type { Card } from "@/lib/types";

export default async function LeaderboardUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const admin = createAdminClient();

  const [{ data: userData }, { data: cards, error }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin
      .from("cards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (!userData?.user) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Link
        href="/leaderboard"
        className="text-sm text-accent hover:underline"
      >
        ← 返回排行榜
      </Link>
      <h1 className="text-lg font-semibold">{userData.user.email} 的卡片</h1>

      {error ? (
        <p className="text-sm text-red-600">加载失败：{error.message}</p>
      ) : (
        <CardsList cards={(cards ?? []) as Card[]} />
      )}
    </div>
  );
}
