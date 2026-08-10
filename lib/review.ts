const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
};

const MAX_BOX = 5;

export function nextBoxState(currentBox: number, remembered: boolean) {
  const box = remembered ? Math.min(currentBox + 1, MAX_BOX) : 1;
  const intervalDays = BOX_INTERVAL_DAYS[box];
  const nextReviewAt = new Date(
    Date.now() + intervalDays * 24 * 60 * 60 * 1000
  ).toISOString();
  return { box, nextReviewAt };
}
