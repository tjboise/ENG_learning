import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCard } from "@/lib/llm";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const inputText: string | undefined = body?.inputText?.trim();
  const sourceNote: string | undefined = body?.sourceNote?.trim() || undefined;

  if (!inputText) {
    return NextResponse.json({ error: "请输入内容" }, { status: 400 });
  }

  try {
    const card = await generateCard(inputText, sourceNote);
    return NextResponse.json({ card });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 生成失败";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
