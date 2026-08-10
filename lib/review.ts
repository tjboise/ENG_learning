// SM-2 spaced-repetition algorithm (the classic Ebbinghaus-forgetting-curve
// scheduler used by Anki and most vocab apps).

export const QUALITY = {
  AGAIN: 0, // 忘记了
  HARD: 3, // 有点难
  GOOD: 4, // 记得
  EASY: 5, // 很简单
} as const;

export type ReviewQuality = (typeof QUALITY)[keyof typeof QUALITY];

export interface SM2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

const MIN_EASE_FACTOR = 1.3;

export function nextReviewState(
  { easeFactor, intervalDays, repetitions }: SM2State,
  quality: ReviewQuality
) {
  let newRepetitions: number;
  let newIntervalDays: number;

  if (quality < 3) {
    newRepetitions = 0;
    newIntervalDays = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (repetitions === 0) {
      newIntervalDays = 1;
    } else if (repetitions === 1) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(intervalDays * easeFactor);
    }
  }

  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewAt = new Date(
    Date.now() + newIntervalDays * 24 * 60 * 60 * 1000
  ).toISOString();

  return {
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitions: newRepetitions,
    nextReviewAt,
  };
}
