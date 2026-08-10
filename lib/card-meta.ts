import type { CardType } from "@/lib/llm";

export const TYPE_LABELS: Record<CardType, string> = {
  word: "单词",
  phrase: "词组",
  sentence: "句子",
  idiom: "俚语",
};

export const TYPE_ICONS: Record<CardType, string> = {
  word: "🔤",
  phrase: "🧩",
  sentence: "📝",
  idiom: "💬",
};
