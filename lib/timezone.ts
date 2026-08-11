// The app's users are all in China, so "today" throughout the app (streaks,
// the leaderboard) is defined in Beijing time, not the server's UTC clock.
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

export function beijingDateKey(date: Date): string {
  return new Date(date.getTime() + BEIJING_OFFSET_MS).toISOString().slice(0, 10);
}

export function beijingDayRangeUtc(now = new Date()) {
  const beijingNow = new Date(now.getTime() + BEIJING_OFFSET_MS);
  const y = beijingNow.getUTCFullYear();
  const m = beijingNow.getUTCMonth();
  const d = beijingNow.getUTCDate();
  const startUtc = new Date(Date.UTC(y, m, d) - BEIJING_OFFSET_MS);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc, endUtc };
}
