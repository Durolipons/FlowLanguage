import * as SQLite from 'expo-sqlite';
import { initialSrs, schedule, type SrsState } from '@/srs/scheduler';
import type { PhraseProgress } from '@/traveller/types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('lingua.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS lessons_completed (
          language TEXT NOT NULL,
          lesson_id TEXT NOT NULL,
          score INTEGER NOT NULL DEFAULT 0,
          total INTEGER NOT NULL DEFAULT 0,
          completed_at INTEGER NOT NULL,
          PRIMARY KEY (language, lesson_id)
        );
        CREATE TABLE IF NOT EXISTS item_progress (
          language TEXT NOT NULL,
          item_id TEXT NOT NULL,
          repetitions INTEGER NOT NULL DEFAULT 0,
          interval_days REAL NOT NULL DEFAULT 0,
          ease REAL NOT NULL DEFAULT 2.5,
          due_at INTEGER NOT NULL DEFAULT 0,
          correct INTEGER NOT NULL DEFAULT 0,
          incorrect INTEGER NOT NULL DEFAULT 0,
          lapses INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (language, item_id)
        );
        CREATE TABLE IF NOT EXISTS meta (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        CREATE TABLE IF NOT EXISTS trips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          lang TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          active INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS saved_phrases (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source TEXT NOT NULL,
          text TEXT NOT NULL,
          target_lang TEXT NOT NULL,
          category TEXT NOT NULL,
          deck_id INTEGER,
          asked_at INTEGER NOT NULL,
          saved_at INTEGER NOT NULL,
          rev_score INTEGER NOT NULL DEFAULT 0,
          rev_best INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (deck_id) REFERENCES trips(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS phrase_progress (
          save_id INTEGER PRIMARY KEY,
          repetitions INTEGER NOT NULL DEFAULT 0,
          interval_days REAL NOT NULL DEFAULT 0,
          ease REAL NOT NULL DEFAULT 2.5,
          due_at INTEGER NOT NULL DEFAULT 0,
          deck_id INTEGER,
          correct INTEGER NOT NULL DEFAULT 0,
          incorrect INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (save_id) REFERENCES saved_phrases(id) ON DELETE CASCADE,
          FOREIGN KEY (deck_id) REFERENCES trips(id) ON DELETE SET NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

/* ------------------------------- lessons -------------------------------- */

export interface LessonStatus {
  score: number;
  total: number;
  completedAt: number;
}

export async function completeLesson(
  language: string,
  lessonId: string,
  score: number,
  total: number
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO lessons_completed (language, lesson_id, score, total, completed_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(language, lesson_id) DO UPDATE SET
       score = MAX(score, excluded.score),
       total = excluded.total,
       completed_at = excluded.completed_at`,
    language,
    lessonId,
    score,
    total,
    now
  );
  await bumpXp(score);
  await touchDaily();
}

export async function getLessonStatuses(
  language: string
): Promise<Record<string, LessonStatus>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    lesson_id: string;
    score: number;
    total: number;
    completed_at: number;
  }>(
    'SELECT lesson_id, score, total, completed_at FROM lessons_completed WHERE language = ?',
    language
  );
  const map: Record<string, LessonStatus> = {};
  for (const r of rows) {
    map[r.lesson_id] = { score: r.score, total: r.total, completedAt: r.completed_at };
  }
  return map;
}

/* --------------------------- item progress / SRS ------------------------- */

export async function recordItemResult(
  language: string,
  itemId: string,
  quality: number,
  correctDelta: number,
  incorrectDelta: number
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const row = await db.getFirstAsync<{
    repetitions: number;
    interval_days: number;
    ease: number;
    due_at: number;
    lapses: number;
    correct: number;
    incorrect: number;
  }>(
    'SELECT repetitions, interval_days, ease, due_at, lapses, correct, incorrect FROM item_progress WHERE language = ? AND item_id = ?',
    language,
    itemId
  );

  const prev: SrsState = row
    ? {
        repetitions: row.repetitions,
        interval: row.interval_days,
        ease: row.ease,
        dueAt: row.due_at,
        lapses: row.lapses,
      }
    : initialSrs(now);

  const next = schedule(prev, quality, now);
  const correct = (row?.correct ?? 0) + correctDelta;
  const incorrect = (row?.incorrect ?? 0) + incorrectDelta;

  await db.runAsync(
    `INSERT INTO item_progress
       (language, item_id, repetitions, interval_days, ease, due_at, correct, incorrect, lapses)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(language, item_id) DO UPDATE SET
       repetitions = excluded.repetitions,
       interval_days = excluded.interval_days,
       ease = excluded.ease,
       due_at = excluded.due_at,
       correct = excluded.correct,
       incorrect = excluded.incorrect,
       lapses = excluded.lapses`,
    language,
    itemId,
    next.repetitions,
    next.interval,
    next.ease,
    next.dueAt,
    correct,
    incorrect,
    next.lapses
  );
}

/** Item ids that are currently due for review, oldest-due first. */
export async function getDueItemIds(language: string): Promise<string[]> {
  const db = await getDb();
  const now = Date.now();
  const rows = await db.getAllAsync<{ item_id: string }>(
    'SELECT item_id FROM item_progress WHERE language = ? AND due_at <= ? ORDER BY due_at ASC',
    language,
    now
  );
  return rows.map((r) => r.item_id);
}

/* --------------------------------- meta ---------------------------------- */

async function getMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    key
  );
  return row ? row.value : null;
}

async function setMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value
  );
}

export function todayKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(aKey: string, bKey: string): number {
  const a = new Date(aKey + 'T00:00:00').getTime();
  const b = new Date(bKey + 'T00:00:00').getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

async function bumpXp(points: number): Promise<void> {
  const current = Number((await getMeta('xp')) ?? '0');
  await setMeta('xp', String(current + points));
}

/** Update the daily streak + today's completed-lesson counter. */
async function touchDaily(): Promise<void> {
  const today = todayKey();
  const lastActive = await getMeta('last_active_date');
  let streak = Number((await getMeta('streak')) ?? '0');

  if (lastActive !== today) {
    streak = lastActive && daysBetween(lastActive, today) === 1 ? streak + 1 : 1;
    await setMeta('streak', String(streak));
    await setMeta('last_active_date', today);
    await setMeta('daily_done', '0');
  }
  const done = Number((await getMeta('daily_done')) ?? '0');
  await setMeta('daily_done', String(done + 1));
}

export interface ProgressSummary {
  streak: number;
  dailyDone: number;
  dailyGoal: number;
  xp: number;
}

export async function getSummary(): Promise<ProgressSummary> {
  const today = todayKey();
  const lastActive = await getMeta('last_active_date');
  let streak = Number((await getMeta('streak')) ?? '0');
  let dailyDone = Number((await getMeta('daily_done')) ?? '0');
  const xp = Number((await getMeta('xp')) ?? '0');
  const dailyGoal = Number((await getMeta('daily_goal')) ?? '1');

  if (lastActive !== today) {
    dailyDone = 0;
    streak = daysBetween(lastActive ?? today, today) > 1 ? 0 : streak;
  }

  return { streak, dailyDone, dailyGoal, xp };
}

export async function setDailyGoal(goal: number): Promise<void> {
  await setMeta('daily_goal', String(Math.max(1, goal)));
}

/* ------------------------------- traveller -------------------------------- */

export interface Trip {
  id: number;
  name: string;
  lang: string;
  createdAt: number;
  active: 0 | 1;
}

export async function createTrip(name: string, lang: string): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const result = await db.runAsync(
    'INSERT INTO trips (name, lang, created_at, active) VALUES (?, ?, ?, 0)',
    name,
    lang,
    now
  );
  return result.lastInsertRowId;
}

export async function getTrips(): Promise<Trip[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    lang: string;
    created_at: number;
    active: number;
  }>('SELECT id, name, lang, created_at, active FROM trips ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    lang: r.lang,
    createdAt: r.created_at,
    active: r.active as 0 | 1,
  }));
}

export async function getActiveTrip(): Promise<Trip | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    lang: string;
    created_at: number;
    active: number;
  }>('SELECT id, name, lang, created_at, active FROM trips WHERE active = 1 LIMIT 1');
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    lang: row.lang,
    createdAt: row.created_at,
    active: row.active as 0 | 1,
  };
}

export async function setActiveTrip(tripId: number | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE trips SET active = 0');
  if (tripId !== null) {
    await db.runAsync('UPDATE trips SET active = 1 WHERE id = ?', tripId);
  }
}

export async function deleteTrip(tripId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM trips WHERE id = ?', tripId);
}

export interface SavedPhraseRow {
  id: number;
  source: string;
  text: string;
  targetLang: string;
  category: string;
  deckId: number | null;
  askedAt: number;
  savedAt: number;
  revScore: number;
  revBest: number;
}

export async function savePhrase(
  source: string,
  text: string,
  targetLang: string,
  category: string,
  deckId: number | null,
  askedAt: number
): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO saved_phrases (source, text, target_lang, category, deck_id, asked_at, saved_at, rev_score, rev_best)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
    source,
    text,
    targetLang,
    category,
    deckId,
    askedAt,
    now
  );
  const saveId = result.lastInsertRowId;
  await db.runAsync(
    `INSERT INTO phrase_progress (save_id, repetitions, interval_days, ease, due_at, deck_id, correct, incorrect)
     VALUES (?, 0, 0, 2.5, ?, ?, 0, 0)`,
    saveId,
    now,
    deckId
  );
  return saveId;
}

export async function getSavedPhrases(deckId: number | null = null): Promise<SavedPhraseRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    source: string;
    text: string;
    target_lang: string;
    category: string;
    deck_id: number | null;
    asked_at: number;
    saved_at: number;
    rev_score: number;
    rev_best: number;
  }>(
    deckId === null
      ? 'SELECT * FROM saved_phrases ORDER BY saved_at DESC'
      : 'SELECT * FROM saved_phrases WHERE deck_id = ? ORDER BY saved_at DESC',
    ...(deckId === null ? [] : [deckId])
  );
  return rows.map((r) => ({
    id: r.id,
    source: r.source,
    text: r.text,
    targetLang: r.target_lang,
    category: r.category,
    deckId: r.deck_id,
    askedAt: r.asked_at,
    savedAt: r.saved_at,
    revScore: r.rev_score,
    revBest: r.rev_best,
  }));
}

export async function deleteSavedPhrase(saveId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM saved_phrases WHERE id = ?', saveId);
}

export async function recordPhraseResult(
  saveId: number,
  quality: number,
  correctDelta: number,
  incorrectDelta: number
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const row = await db.getFirstAsync<{
    repetitions: number;
    interval_days: number;
    ease: number;
    due_at: number;
    correct: number;
    incorrect: number;
  }>(
    'SELECT repetitions, interval_days, ease, due_at, correct, incorrect FROM phrase_progress WHERE save_id = ?',
    saveId
  );

  const prev: SrsState = row
    ? {
        repetitions: row.repetitions,
        interval: row.interval_days,
        ease: row.ease,
        dueAt: row.due_at,
        lapses: 0,
      }
    : initialSrs(now);

  const next = schedule(prev, quality, now);
  const correct = (row?.correct ?? 0) + correctDelta;
  const incorrect = (row?.incorrect ?? 0) + incorrectDelta;

  await db.runAsync(
    `UPDATE phrase_progress SET
       repetitions = ?,
       interval_days = ?,
       ease = ?,
       due_at = ?,
       correct = ?,
       incorrect = ?
     WHERE save_id = ?`,
    next.repetitions,
    next.interval,
    next.ease,
    next.dueAt,
    correct,
    incorrect,
    saveId
  );
}

export async function getDuePhraseIds(): Promise<number[]> {
  const db = await getDb();
  const now = Date.now();
  const rows = await db.getAllAsync<{ save_id: number }>(
    'SELECT save_id FROM phrase_progress WHERE due_at <= ? ORDER BY due_at ASC',
    now
  );
  return rows.map((r) => r.save_id);
}
/** Saved phrases filtered by target language (and optionally a trip deck). */
export async function getSavedPhrasesForLang(
  targetLang: string,
  deckId?: number | null
): Promise<SavedPhraseRow[]> {
  const all = await getSavedPhrases(deckId ?? null);
  return all.filter((p) => p.targetLang === targetLang);
}

/** Returns the save id when this exact phrase is already saved, else null. */
export async function findSavedPhrase(
  source: string,
  text: string,
  targetLang: string
): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM saved_phrases WHERE source = ? AND text = ? AND target_lang = ? LIMIT 1',
    source,
    text,
    targetLang
  );
  return row?.id ?? null;
}

export async function getPhraseProgress(saveId: number): Promise<PhraseProgress | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    repetitions: number;
    interval_days: number;
    ease: number;
    due_at: number;
    deck_id: number | null;
    correct: number;
    incorrect: number;
  }>('SELECT * FROM phrase_progress WHERE save_id = ?', saveId);
  if (!row) return null;
  return {
    saveId,
    repetitions: row.repetitions,
    intervalDays: row.interval_days,
    ease: row.ease,
    dueAt: row.due_at,
    deckId: row.deck_id,
    correct: row.correct,
    incorrect: row.incorrect,
  };
}

/** Due saved phrases joined with their progress rows (optionally one deck). */
export async function getDuePhrases(deckId?: number | null): Promise<SavedPhraseRow[]> {
  const ids = await getDuePhraseIds();
  const idSet = new Set(ids);
  const all = deckId === undefined ? await getSavedPhrases(null) : await getSavedPhrases(deckId);
  return all.filter((p) => idSet.has(p.id));
}

export interface TripStats {
  total: number;
  reviewed: number;
  mastered: number;
  due: number;
  /** 0..1 mastery ratio. */
  masteryPct: number;
}

/** Per-deck counters used by the Trips screen. */
export async function tripStats(deckId: number): Promise<TripStats> {
  const db = await getDb();
  const now = Date.now();
  const row = await db.getFirstAsync<{
    total: number;
    reviewed: number;
    mastered: number;
    due: number;
  }>(
    `SELECT
       COUNT(s.id) AS total,
       SUM(CASE WHEN (p.correct + p.incorrect) > 0 THEN 1 ELSE 0 END) AS reviewed,
       SUM(CASE WHEN p.repetitions >= 2 THEN 1 ELSE 0 END) AS mastered,
       SUM(CASE WHEN p.due_at <= ? THEN 1 ELSE 0 END) AS due
     FROM saved_phrases s
     LEFT JOIN phrase_progress p ON p.save_id = s.id
     WHERE s.deck_id = ?`,
    now,
    deckId
  );
  const total = row?.total ?? 0;
  const mastered = row?.mastered ?? 0;
  return {
    total,
    reviewed: row?.reviewed ?? 0,
    mastered,
    due: row?.due ?? 0,
    masteryPct: total > 0 ? mastered / total : 0,
  };
}

export interface RecentActivity {
  /** Most recently saved phrase, if any. */
  lastSaved: SavedPhraseRow | null;
  /** Saved phrases currently due for review. */
  dueCount: number;
  /** Total saved phrases for this language. */
  savedCount: number;
}

/** "Recent activity" strip on the Traveller home. */
export async function getRecentActivity(targetLang: string): Promise<RecentActivity> {
  const saved = await getSavedPhrasesForLang(targetLang);
  const due = await getDuePhrases();
  const dueForLang = due.filter((p) => p.targetLang === targetLang);
  return {
    lastSaved: saved[0] ?? null,
    dueCount: dueForLang.length,
    savedCount: saved.length,
  };
}

/** Map a three-button review rating to an SM-2 quality score. */
export function qualityFromRating(rating: 'easy' | 'medium' | 'hard'): number {
  return rating === 'easy' ? 5 : rating === 'medium' ? 3 : 1;
}

/** Convenience wrapper: grade a saved phrase with Easy/Medium/Hard. */
export async function recordPhraseReview(
  saveId: number,
  rating: 'easy' | 'medium' | 'hard'
): Promise<void> {
  const q = qualityFromRating(rating);
  await recordPhraseResult(saveId, q, q >= 3 ? 1 : 0, q < 3 ? 1 : 0);
}

const LAST_TRANSLATION_PREFIX = 'trav_last_translation_';

/** Remember the last phrase looked up, for the Traveller home activity strip. */
export async function setLastTranslation(
  targetLang: string,
  source: string,
  text: string
): Promise<void> {
  await setMeta(LAST_TRANSLATION_PREFIX + targetLang, JSON.stringify({ source, text, at: Date.now() }));
}

export interface LastTranslation {
  source: string;
  text: string;
  at: number;
}

export async function getLastTranslation(targetLang: string): Promise<LastTranslation | null> {
  const raw = await getMeta(LAST_TRANSLATION_PREFIX + targetLang);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LastTranslation;
    return parsed && parsed.text ? parsed : null;
  } catch {
    return null;
  }
}




export async function getPref(key: string): Promise<string | null> {
  return getMeta(key);
}

export async function setPref(key: string, value: string): Promise<void> {
  await setMeta(key, value);
}


export async function resetProgress(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM lessons_completed; DELETE FROM item_progress; DELETE FROM meta;');
}

