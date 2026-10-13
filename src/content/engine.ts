import type { ExerciseInstance, ExerciseType, LanguagePack, Lesson, LexicalItem } from './schema';

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hasVisual(item: LexicalItem): boolean {
  return Boolean(item.image || item.emoji);
}

function isPhrase(item: LexicalItem): boolean {
  return item.text.trim().split(/\s+/).filter(Boolean).length > 1;
}

/**
 * A pool of distractor candidates: all pack items with a visual, de-duplicated
 * by their visual so that matching exercises never present two identical images.
 */
export function buildChoicePool(pack: LanguagePack): LexicalItem[] {
  const seen = new Set<string>();
  const pool: LexicalItem[] = [];
  for (const item of Object.values(pack.items)) {
    if (!hasVisual(item)) continue;
    const key = item.image ?? item.emoji ?? '';
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    pool.push(item);
  }
  return pool;
}

function pickDistractors(target: LexicalItem, pool: LexicalItem[], count = 3): LexicalItem[] {
  const targetVisual = target.image ?? target.emoji ?? '';
  const candidates = pool.filter(
    (p) =>
      p.id !== target.id &&
      (p.image ?? p.emoji ?? '') !== targetVisual &&
      p.text.toLowerCase() !== target.text.toLowerCase()
  );
  return shuffle(candidates).slice(0, count);
}

function makeInstance(
  key: string,
  type: ExerciseType,
  item: LexicalItem,
  pool: LexicalItem[]
): ExerciseInstance {
  if (type === 'listen_match' || type === 'text_to_image' || type === 'image_to_text') {
    const distractors = pickDistractors(item, pool, 3);
    const choices = shuffle([item, ...distractors]);
    return { key, type, item, choices };
  }
  return { key, type, item, choices: [] };
}

/** Build a single exercise instance (used by the review queue). */
export function buildExercise(
  pack: LanguagePack,
  type: ExerciseType,
  item: LexicalItem
): ExerciseInstance {
  const pool = buildChoicePool(pack);
  return makeInstance(`review-${item.id}-${type}`, type, item, pool);
}


/**
 * Turn a lesson into a flat, ordered list of exercises.
 *
 * If the lesson has an explicit `plan`, honor it. Otherwise auto-generate a
 * varied set per item: listen → (image/text by parity) → pronounce, plus a
 * sentence-building step for multi-word phrases.
 */
export function generateExercises(lesson: Lesson, pack: LanguagePack): ExerciseInstance[] {
  const pool = buildChoicePool(pack);
  const instances: ExerciseInstance[] = [];

  if (lesson.plan && lesson.plan.length > 0) {
    lesson.plan.forEach((step, si) => {
      const item = pack.items[step.itemId];
      if (!item) return;
      step.types.forEach((type, ti) => {
        instances.push(makeInstance(`${lesson.id}-${si}-${ti}`, type, item, pool));
      });
    });
    return instances;
  }

  lesson.itemIds.forEach((id, i) => {
    const item = pack.items[id];
    if (!item) return;
    const types: ExerciseType[] = [];
    if (hasVisual(item)) types.push('listen_match');
    if (hasVisual(item)) types.push(i % 2 === 0 ? 'text_to_image' : 'image_to_text');
    types.push('pronounce');
    if (isPhrase(item)) types.push('build_sentence');
    types.forEach((type, ti) => {
      instances.push(makeInstance(`${lesson.id}-${id}-${ti}`, type, item, pool));
    });
  });

  return instances;
}
