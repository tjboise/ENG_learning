"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { nextBoxState } from "@/lib/review";
import type { Card } from "@/lib/types";

export default function ReviewPage() {
  const [queue, setQueue] = useState<Card[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const loadQueue = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cards")
      .select("*")
      .lte("next_review_at", new Date().toISOString())
      .order("next_review_at", { ascending: true });
    setQueue((data ?? []) as Card[]);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async data fetch
    loadQueue();
  }, [loadQueue]);

  async function handleAnswer(remembered: boolean) {
    if (!queue || queue.length === 0) return;
    const current = queue[0];
    setUpdating(true);

    const { box, nextReviewAt } = nextBoxState(current.box, remembered);
    const supabase = createClient();
    await supabase
      .from("cards")
      .update({
        box,
        next_review_at: nextReviewAt,
        last_reviewed_at: new Date().toISOString(),
        review_count: current.review_count + 1,
      })
      .eq("id", current.id);

    setUpdating(false);
    setRevealed(false);
    setDoneCount((n) => n + 1);
    setQueue(queue.slice(1));
  }

  if (queue === null) {
    return <p className="text-sm text-black/50 dark:text-white/50">加载中…</p>;
  }

  if (queue.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <p className="text-lg font-medium">
          {doneCount > 0 ? "今天的复习完成了 🎉" : "今天没有到期的卡片"}
        </p>
        <p className="mt-2 text-sm text-black/50 dark:text-white/50">
          {doneCount > 0
            ? `本次复习了 ${doneCount} 张卡片`
            : "去「记一笔」里加点新内容，或者等下一批卡片到期"}
        </p>
      </div>
    );
  }

  const current = queue[0];

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <p className="text-sm text-black/50 dark:text-white/50">
        待复习 {queue.length} 张
      </p>

      <div className="min-h-64 space-y-3 rounded-xl border border-black/10 p-6 dark:border-white/10">
        <p className="text-xl font-semibold">{current.input_text}</p>

        {revealed ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm">{current.meaning_zh}</p>
            {current.usage_notes && (
              <p className="text-sm text-black/60 dark:text-white/60">
                {current.usage_notes}
              </p>
            )}
            {current.examples?.length > 0 && (
              <ul className="list-disc space-y-0.5 pl-5 text-sm text-black/70 dark:text-white/70">
                {current.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
          >
            显示答案
          </button>
        )}
      </div>

      {revealed && (
        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(false)}
            disabled={updating}
            className="flex-1 rounded-md border border-black/15 px-4 py-2 text-sm disabled:opacity-50 dark:border-white/20"
          >
            不记得
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={updating}
            className="flex-1 rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            记得
          </button>
        </div>
      )}
    </div>
  );
}
