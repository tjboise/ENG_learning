import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";
import { CardsList } from "./cards-list";

export default async function CardsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">加载失败：{error.message}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-4 text-lg font-semibold">卡片列表</h1>
      <CardsList cards={(data ?? []) as Card[]} />
    </div>
  );
}
