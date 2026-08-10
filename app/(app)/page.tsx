import { createClient } from "@/lib/supabase/server";
import { getUserStats } from "@/lib/stats";
import { NewCardForm } from "./new-card-form";

export default async function HomePage() {
  const supabase = await createClient();
  const { totalCards, streakDays } = await getUserStats(supabase);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
          <p className="text-2xl font-semibold text-accent">{totalCards}</p>
          <p className="text-xs text-muted">已保存卡片</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm">
          <p className="text-2xl font-semibold text-accent">
            {streakDays} {streakDays > 0 && "🔥"}
          </p>
          <p className="text-xs text-muted">连续复习天数</p>
        </div>
      </div>

      <NewCardForm />
    </div>
  );
}
