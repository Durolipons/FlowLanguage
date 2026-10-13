import { create } from 'zustand';
import { defaultLanguageCode, getPack } from '@/content';
import {
  completeLesson as dbCompleteLesson,
  getDueItemIds,
  getLessonStatuses,
  getPref,
  getSummary,
  setPref,
  type LessonStatus,
  type ProgressSummary,
} from '@/db/progress';
import { setTtsLanguage } from '@/audio/tts';

const ACTIVE_LANG_KEY = 'active_language';

interface AppState {
  ready: boolean;
  languageCode: string;
  summary: ProgressSummary;
  lessonStatuses: Record<string, LessonStatus>;
  dueCount: number;
  init: () => Promise<void>;
  setLanguage: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
  completeLesson: (lessonId: string, score: number, total: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  languageCode: defaultLanguageCode,
  summary: { streak: 0, dailyDone: 0, dailyGoal: 1, xp: 0 },
  lessonStatuses: {},
  dueCount: 0,

  async init() {
    const saved = await getPref(ACTIVE_LANG_KEY);
    const code = saved && getPack(saved) ? saved : defaultLanguageCode;
    setTtsLanguage(getPack(code)?.ttsLanguage ?? 'en-US');
    set({ languageCode: code });
    await get().refresh();
    set({ ready: true });
  },

  async setLanguage(code) {
    if (!getPack(code)) return;
    setTtsLanguage(getPack(code)?.ttsLanguage ?? 'en-US');
    await setPref(ACTIVE_LANG_KEY, code);
    set({ languageCode: code });
    await get().refresh();
  },

  async refresh() {
    const { languageCode } = get();
    const [summary, lessonStatuses, due] = await Promise.all([
      getSummary(),
      getLessonStatuses(languageCode),
      getDueItemIds(languageCode),
    ]);
    set({ summary, lessonStatuses, dueCount: due.length });
  },

  async completeLesson(lessonId, score, total) {
    const { languageCode } = get();
    await dbCompleteLesson(languageCode, lessonId, score, total);
    await get().refresh();
  },
}));
