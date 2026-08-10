"use client";

import { useMemo, useState } from "react";
import type { Card } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  word: "单词",
  phrase: "词组",
  sentence: "句子",
  idiom: "俚语",
};

export function CardsList({ cards }: { cards: Card[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.input_text.toLowerCase().includes(q) ||
        c.meaning_zh.toLowerCase().includes(q)
    );
  }, [cards, query]);

  if (cards.length === 0) {
    return (
      <p className="text-sm text-black/50 dark:text-white/50">
        还没有卡片，去「记一笔」里加一个吧。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索…"
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
      />

      <ul className="space-y-3">
        {filtered.map((card) => (
          <li
            key={card.id}
            className="rounded-xl border border-black/10 p-4 dark:border-white/10"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium">{card.input_text}</span>
              {card.input_type && (
                <span className="text-xs rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
                  {TYPE_LABELS[card.input_type] ?? card.input_type}
                </span>
              )}
              <span className="text-xs text-black/40 dark:text-white/40">
                已记忆 {card.review_count} 次
              </span>
            </div>
            <p className="text-sm">{card.meaning_zh}</p>
            {card.usage_notes && (
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {card.usage_notes}
              </p>
            )}
            {card.examples?.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-black/70 dark:text-white/70">
                {card.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            )}
            {card.source_note && (
              <p className="mt-2 text-xs text-black/40 dark:text-white/40">
                来源：{card.source_note}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
