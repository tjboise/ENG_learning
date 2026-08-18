import OpenAI from "openai";

export type CardType = "word" | "phrase" | "sentence" | "idiom";

export interface GeneratedCard {
  type: CardType;
  meaning_zh: string;
  meaning_en: string;
  usage_notes: string;
  examples: string[];
}

function getClient() {
  return new OpenAI({
    baseURL: process.env.LAB_LLM_BASE_URL,
    apiKey: process.env.LAB_LLM_API_KEY,
  });
}

const SYSTEM_PROMPT = `You are an assistant that turns a piece of English (a word, phrase, sentence, or idiom) a language learner picked up from watching TV shows into a study flashcard.

Reply with ONLY a single JSON object, no markdown fences, no extra text, matching exactly this shape:
{
  "type": "word" | "phrase" | "sentence" | "idiom",
  "meaning_zh": string,   // 中文含义解释
  "meaning_en": string,   // a short English definition
  "usage_notes": string,  // 中文说明：语域/常见场景/日常怎么用，口语还是书面语等
  "examples": string[]    // 2-3 natural example sentences using it, in English
}`;

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1);
  }
  return raw.trim();
}

async function requestCard(
  inputText: string,
  sourceNote?: string
): Promise<GeneratedCard> {
  const client = getClient();

  const userContent = sourceNote
    ? `Text: ${inputText}\nSource/context (may help disambiguate): ${sourceNote}`
    : `Text: ${inputText}`;

  const stream = await client.chat.completions.create({
    model: process.env.LAB_LLM_MODEL || "qwen3-32b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    max_tokens: 1024,
    stream: true,
    // @ts-expect-error - gateway-specific field to disable Qwen3 thinking mode
    chat_template_kwargs: { enable_thinking: false },
  });

  // Streaming (rather than waiting for one big buffered response) keeps
  // bytes flowing on the connection the whole time, so network hops between
  // Vercel and the lab gateway don't mistake a long "thinking" pause for a
  // dead connection and cut it.
  let raw = "";
  for await (const chunk of stream) {
    raw += chunk.choices[0]?.delta?.content ?? "";
  }
  const jsonText = extractJson(raw);

  let parsed: GeneratedCard;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI 返回的内容不是合法 JSON，请重试一次。");
  }

  if (!parsed.meaning_zh || !Array.isArray(parsed.examples)) {
    throw new Error("AI 返回的卡片内容不完整，请重试一次。");
  }

  return parsed;
}

export async function generateCard(
  inputText: string,
  sourceNote?: string
): Promise<GeneratedCard> {
  try {
    return await requestCard(inputText, sourceNote);
  } catch {
    // The lab LLM gateway (local machine + ngrok tunnel) occasionally drops
    // the connection mid-generation; one retry recovers most of these.
    return await requestCard(inputText, sourceNote);
  }
}
