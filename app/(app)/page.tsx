"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GeneratedCard } from "@/lib/llm";

const TYPE_LABELS: Record<string, string> = {
  word: "单词",
  phrase: "词组",
  sentence: "句子",
  idiom: "俚语",
};

export default function HomePage() {
  const [inputText, setInputText] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<GeneratedCard | null>(null);

  async function handleGenerate() {
    if (!inputText.trim()) return;
    setError(null);
    setSaved(false);
    setGenerating(true);
    setDraft(null);

    try {
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText, sourceNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成失败");
      }
      setDraft(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("登录状态已失效，请重新登录");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("cards").insert({
      user_id: user.id,
      input_text: inputText,
      input_type: draft.type,
      meaning_zh: draft.meaning_zh,
      meaning_en: draft.meaning_en,
      usage_notes: draft.usage_notes,
      examples: draft.examples,
      source_note: sourceNote || null,
    });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }

    setSaved(true);
    setInputText("");
    setSourceNote("");
    setDraft(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-3">
        <h1 className="text-lg font-semibold">记一笔</h1>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="刚学到的单词 / 词组 / 句子 / 俚语，比如：break a leg"
          rows={3}
          className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20"
        />
        <input
          value={sourceNote}
          onChange={(e) => setSourceNote(e.target.value)}
          placeholder="来源备注（可选），比如剧名/场景"
          className="w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20"
        />
        <button
          onClick={handleGenerate}
          disabled={generating || !inputText.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {generating ? "AI 生成中…" : "AI 生成卡片"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">已保存到卡片列表 ✓</p>}

      {draft && (
        <div className="space-y-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
              {TYPE_LABELS[draft.type] ?? draft.type}
            </span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-black/50 dark:text-white/50">
              中文含义
            </label>
            <textarea
              value={draft.meaning_zh}
              onChange={(e) =>
                setDraft({ ...draft, meaning_zh: e.target.value })
              }
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-black/50 dark:text-white/50">
              English definition
            </label>
            <textarea
              value={draft.meaning_en}
              onChange={(e) =>
                setDraft({ ...draft, meaning_en: e.target.value })
              }
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-black/50 dark:text-white/50">
              日常怎么用
            </label>
            <textarea
              value={draft.usage_notes}
              onChange={(e) =>
                setDraft({ ...draft, usage_notes: e.target.value })
              }
              rows={2}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-black/50 dark:text-white/50">
              例句
            </label>
            <textarea
              value={draft.examples.join("\n")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  examples: e.target.value.split("\n"),
                })
              }
              rows={3}
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      )}
    </div>
  );
}
