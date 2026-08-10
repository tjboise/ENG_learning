"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { nextReviewState, QUALITY, type ReviewQuality } from "@/lib/review";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/card-meta";
import type { Card } from "@/lib/types";

const ANSWER_BUTTONS: {
  label: string;
  quality: ReviewQuality;
  className: string;
}[] = [
  {
    label: "忘记了",
    quality: QUALITY.AGAIN,
    className: "bg-red-500 text-white hover:bg-red-600",
  },
  {
    label: "有点难",
    quality: QUALITY.HARD,
    className: "bg-amber-500 text-white hover:bg-amber-600",
  },
  {
    label: "记得",
    quality: QUALITY.GOOD,
    className: "bg-accent text-accent-foreground hover:opacity-90",
  },
  {
    label: "很简单",
    quality: QUALITY.EASY,
    className: "bg-emerald-500 text-white hover:bg-emerald-600",
  },
];

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

  async function handleAnswer(quality: ReviewQuality) {
    if (!queue || queue.length === 0) return;
    const current = queue[0];
    setUpdating(true);

    const { easeFactor, intervalDays, repetitions, nextReviewAt } =
      nextReviewState(
        {
          easeFactor: current.ease_factor,
          intervalDays: current.interval_days,
          repetitions: current.repetitions,
        },
        quality
      );

    const supabase = createClient();
    await supabase
      .from("cards")
      .update({
        ease_factor: easeFactor,
        interval_days: intervalDays,
        repetitions: repetitions,
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
    return <p className="text-sm text-muted">加载中…</p>;
  }

  if (queue.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        <p className="text-3xl">{doneCount > 0 ? "🎉" : "☕️"}</p>
        <p className="mt-2 text-lg font-medium">
          {doneCount > 0 ? "今天的复习完成了" : "今天没有到期的卡片"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {doneCount > 0
            ? `本次复习了 ${doneCount} 张卡片`
            : "去「记一笔」里加点新内容，或者等下一批卡片到期"}
        </p>
      </div>
    );
  }

  const current = queue[0];
  const total = doneCount + queue.length;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>待复习 {queue.length} 张</span>
          <span>
            {doneCount} / {total}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flip-card h-80" onClick={() => !revealed && setRevealed(true)}>
        <div className={`flip-card-inner ${revealed ? "is-flipped" : ""}`}>
          <div className="flip-card-face flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
            {current.input_type && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">
                {TYPE_ICONS[current.input_type]}{" "}
                {TYPE_LABELS[current.input_type] ?? current.input_type}
              </span>
            )}
            <p className="text-2xl font-semibold">{current.input_text}</p>
            <p className="text-xs text-muted">
              已记忆 {current.review_count} 次
            </p>
            <span className="mt-2 rounded-lg border border-border px-4 py-2 text-sm text-muted">
              点击显示答案
            </span>
          </div>

          <div className="flip-card-face flip-card-back flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-medium text-muted">
              {current.input_text}
            </p>
            <p className="text-base">{current.meaning_zh}</p>
            {current.usage_notes && (
              <p className="text-sm text-muted">{current.usage_notes}</p>
            )}
            {current.examples?.length > 0 && (
              <ul className="list-disc space-y-0.5 pl-5 text-sm text-foreground/80">
                {current.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          {ANSWER_BUTTONS.map(({ label, quality, className }) => (
            <button
              key={label}
              onClick={() => handleAnswer(quality)}
              disabled={updating}
              className={`rounded-lg px-2 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50 ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
