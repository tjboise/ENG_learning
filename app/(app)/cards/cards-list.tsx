"use client";

import { useMemo, useState } from "react";
import type { Card } from "@/lib/types";
import { TYPE_ICONS, TYPE_LABELS } from "@/lib/card-meta";

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
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-2xl">🗒️</p>
        <p className="mt-2 text-sm text-muted">
          还没有卡片，去「记一笔」里加一个吧。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索…"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
      />

      <ul className="space-y-3">
        {filtered.map((card) => (
          <li
            key={card.id}
            className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-medium">{card.input_text}</span>
              {card.input_type && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                  {TYPE_ICONS[card.input_type]}{" "}
                  {TYPE_LABELS[card.input_type] ?? card.input_type}
                </span>
              )}
              <span className="text-xs text-muted">
                已记忆 {card.review_count} 次
              </span>
            </div>
            <p className="text-sm">{card.meaning_zh}</p>
            {card.usage_notes && (
              <p className="mt-1 text-sm text-muted">{card.usage_notes}</p>
            )}
            {card.examples?.length > 0 && (
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-foreground/80">
                {card.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            )}
            {card.source_note && (
              <p className="mt-2 text-xs text-muted">来源：{card.source_note}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
