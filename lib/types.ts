import type { CardType } from "@/lib/llm";

export interface Card {
  id: string;
  user_id: string;
  input_text: string;
  input_type: CardType | null;
  meaning_zh: string;
  meaning_en: string | null;
  usage_notes: string | null;
  examples: string[];
  source_note: string | null;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  review_count: number;
  created_at: string;
}
