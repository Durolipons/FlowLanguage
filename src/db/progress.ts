import * as SQLite from 'expo-sqlite';
import { initialSrs, schedule, type SrsState } from '@/srs/scheduler';

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

