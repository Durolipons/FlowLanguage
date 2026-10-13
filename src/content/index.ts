import type { Dialogue, LanguagePack, Lesson, LexicalItem } from './schema';
import { generateExercises } from './engine';
import { esPack } from './es';
import { frPack } from './fr';
import { plPack } from './pl';
import { dialogues } from './dialogues';

/** Register every available language pack here. */
export const packs: LanguagePack[] = [esPack, frPack, plPack];

export const defaultLanguageCode = packs[0].code;

export function getPack(code: string): LanguagePack | undefined {
  return packs.find((p) => p.code === code);
}

export function requirePack(code: string): LanguagePack {
  const pack = getPack(code);
  if (!pack) throw new Error(`Unknown language pack: ${code}`);
  return pack;
}

/** Flatten all lessons in a pack (in order) for "continue"/"next" logic. */
export interface FlatLesson {
  unitId: string;
  unitTitle: string;
  lesson: Lesson;
}

export function allLessons(pack: LanguagePack): FlatLesson[] {
  const out: FlatLesson[] = [];
  for (const unit of pack.units) {
    for (const lesson of unit.lessons) {
      out.push({ unitId: unit.id, unitTitle: unit.title, lesson });
    }
  }
  return out;
}

export function findLesson(pack: LanguagePack, lessonId: string): FlatLesson | undefined {
  return allLessons(pack).find((l) => l.lesson.id === lessonId);
}

/** Resolve a lexical item by id. */
export function getItem(pack: LanguagePack, itemId: string): LexicalItem | undefined {
  return pack.items[itemId];
}

/** All dialogues for a language pack. */
export function getDialogues(code: string): Dialogue[] {
  return dialogues.filter((d) => d.language === code);
}

/** Look up a dialogue by id. */
export function getDialogue(id: string): Dialogue | undefined {
  return dialogues.find((d) => d.id === id);
}

/** Build the exercise list for a lesson. */
export function lessonExercises(lesson: Lesson, pack: LanguagePack) {
  return generateExercises(lesson, pack);
}

export { buildExercise, buildChoicePool, generateExercises, shuffle } from './engine';

export * from './schema';

