import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReviewReminder } from "@/lib/mailer";

// Triggered daily by Vercel Cron (see vercel.json). Vercel sends
// `Authorization: Bearer <CRON_SECRET>` on scheduled invocations, which we
// check to keep this endpoint from being triggered by random visitors.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: dueCards, error: cardsError } = await supabase
    .from("cards")
    .select("user_id")
    .lte("next_review_at", new Date().toISOString());

  if (cardsError) {
    return NextResponse.json({ error: cardsError.message }, { status: 500 });
  }

  const countByUser = new Map<string, number>();
  for (const card of dueCards ?? []) {
    countByUser.set(card.user_id, (countByUser.get(card.user_id) ?? 0) + 1);
  }

  if (countByUser.size === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ perPage: 200 });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  let sent = 0;
  for (const user of usersData.users) {
    const count = countByUser.get(user.id);
    if (!count || !user.email) continue;
    await sendReviewReminder(user.email, count);
    sent += 1;
  }

  return NextResponse.json({ sent });
}
