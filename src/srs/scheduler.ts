/** Spaced-repetition scheduler (simplified SM-2). */

export interface SrsState {
  repetitions: number;
  /** Review interval in days. */
  interval: number;
  /** Ease factor (higher = easier item). */
  ease: number;
  /** Epoch ms when the item is next due. */
  dueAt: number;
  /** Number of times the learner got it wrong. */
  lapses: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_EASE = 2.5;

export function initialSrs(now: number): SrsState {
  return { repetitions: 0, interval: 0, ease: DEFAULT_EASE, dueAt: now, lapses: 0 };
}

/**
 * Compute the next SRS state from a graded answer.
 * @param quality 5 = correct first try, 3 = correct after retries, 1 = wrong.
 */
export function schedule(state: SrsState, quality: number, now: number): SrsState {
  let { repetitions, interval, ease, lapses } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
    lapses += 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.max(1, Math.round(interval * ease));
    repetitions += 1;
  }

  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  ease = Math.max(1.3, ease);

  return { repetitions, interval, ease, dueAt: now + interval * DAY_MS, lapses };
}

export function isDue(state: SrsState, now: number): boolean {
  return state.dueAt <= now;
}
