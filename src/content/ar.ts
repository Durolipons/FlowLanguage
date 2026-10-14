import type { LanguagePack } from './schema';

/**
 * Arabic (Modern Standard Arabic) — starter pack.
 *
 * - `script: 'arabic'` + `direction: 'rtl'` drive RTL rendering and Arabic-aware
 *   normalization (tashkeel/hamza folding) in `src/utils/text.ts`.
 * - `romanizationScheme: 'transliteration'` — each item carries a Latin
 *   transliteration so learners can read pronunciation before knowing the script.
 *
 * This is a starter (one unit) to prove the Arabic/RTL path; the full course is
 * built out in the content phase.
 */
export const arPack: LanguagePack = {
  code: 'ar',
  name: 'العربية',
  englishName: 'Arabic',
  flag: '🇸🇦',
  speechLocale: 'ar-SA',
  ttsLanguage: 'ar-SA',
  script: 'arabic',
  direction: 'rtl',
  romanizationScheme: 'transliteration',
  items: {
    // Greetings
    'ar-marhaban': { id: 'ar-marhaban', text: 'مرحبا', translation: 'hello', emoji: '👋', romanization: 'marhaban' },
    'ar-sabah-al-khayr': { id: 'ar-sabah-al-khayr', text: 'صباح الخير', translation: 'good morning', emoji: '🌅', romanization: 'ṣabāḥ al-khayr' },
    'ar-masa-al-khayr': { id: 'ar-masa-al-khayr', text: 'مساء الخير', translation: 'good evening', emoji: '🌆', romanization: 'masāʾ al-khayr' },
    'ar-maa-as-salama': { id: 'ar-maa-as-salama', text: 'مع السلامة', translation: 'goodbye', emoji: '🚪', romanization: 'maʿa as-salāma' },
    // Polite words
    'ar-shukran': { id: 'ar-shukran', text: 'شكرا', translation: 'thank you', emoji: '🙏', romanization: 'shukran' },
    'ar-afwan': { id: 'ar-afwan', text: 'عفوا', translation: "you're welcome", emoji: '😊', romanization: 'ʿafwan' },
    'ar-min-fadlik': { id: 'ar-min-fadlik', text: 'من فضلك', translation: 'please', emoji: '🤲', romanization: 'min faḍlik' },
    'ar-asif': { id: 'ar-asif', text: 'آسف', translation: 'sorry', emoji: '🙇', romanization: 'āsif' },
    'ar-naam': { id: 'ar-naam', text: 'نعم', translation: 'yes', emoji: '✅', romanization: 'naʿam' },
    'ar-la': { id: 'ar-la', text: 'لا', translation: 'no', emoji: '❌', romanization: 'lā' },
    // Introductions
    'ar-kayfa-haluk': { id: 'ar-kayfa-haluk', text: 'كيف حالك؟', translation: 'how are you?', emoji: '🙂', romanization: 'kayfa ḥāluk?' },
    'ar-bi-khayr': { id: 'ar-bi-khayr', text: 'بخير', translation: 'fine / well', emoji: '👍', romanization: 'bi-khayr' },
    'ar-ismi': { id: 'ar-ismi', text: 'اسمي', translation: 'my name is', emoji: '📛', romanization: 'ismī' },
    'ar-tasharrafna': { id: 'ar-tasharrafna', text: 'تشرفنا', translation: 'nice to meet you', emoji: '🤝', romanization: 'tasharrafnā' },
    'ar-ma-ismuk': { id: 'ar-ma-ismuk', text: 'ما اسمك؟', translation: "what's your name?", emoji: '❓', romanization: 'mā ismuk?' },
    'ar-ana-bi-khayr': { id: 'ar-ana-bi-khayr', text: 'أنا بخير', translation: "I'm fine", emoji: '🙂', romanization: 'anā bi-khayr' },
  },
  units: [
    {
      id: 'ar-basics',
      title: 'التحية والأساسيات',
      subtitle: 'Greetings & Essentials',
      emoji: '👋',
      lessons: [
        {
          id: 'ar-greetings',
          title: 'Greetings',
          itemIds: [
            'ar-marhaban',
            'ar-sabah-al-khayr',
            'ar-masa-al-khayr',
            'ar-maa-as-salama',
            'ar-shukran',
            'ar-afwan',
            'ar-min-fadlik',
            'ar-asif',
          ],
        },
        {
          id: 'ar-introductions',
          title: 'Introductions',
          itemIds: [
            'ar-naam',
            'ar-la',
            'ar-kayfa-haluk',
            'ar-bi-khayr',
            'ar-ismi',
            'ar-tasharrafna',
            'ar-ma-ismuk',
            'ar-ana-bi-khayr',
          ],
        },
      ],
    },
  ],
};