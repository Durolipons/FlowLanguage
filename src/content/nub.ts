import type { LanguagePack } from './schema';

/**
 * Nobiin (Nòbíín) — the largest Nubian language (~685,000 speakers, Sudan/Egypt).
 *
 * ⚠️  LOW-RESOURCE STARTER — every item below is sourced and verified:
 *   - Wiktionary Nobiin entries (derived from Browne 1996, Old Nubian Dictionary,
 *     and Werner 1987, Grammatik des Nobiin) — áman 'water', màšà 'sun', nōg 'house',
 *     fāb 'father', een 'mother', nàjà 'hill/desert', irki 'village', diffi 'town',
 *     eše 'country', ūru 'king', áŋàr 'eye' etc.
 *   - Global Lexicostatistical Database Nobiin basic lexicon (Werner1987 data;
 *     starling.rinet.ru) — pronouns, body parts, animals, colours, bare verb stems.
 * No numbers/greetings could be verified from these sources, so they are omitted
 * rather than invented. This pack should be reviewed by a Nobiin speaker before
 * release. Orthography: Latin with tone marks; ŋ written "ng" (common practice).
 *
 * Audio: no TTS engine or voice model exists for Nobiin. ttsLanguage is a
 * best-effort fallback only — bundled WAVs (recorded or VoxCPM-generated on GPU)
 * are the real path, per docs/tts.
 */
export const nubPack: LanguagePack = {
  code: 'fia',
  name: 'Nobiin',
  englishName: 'Nobiin (Nubian)',
  flag: '🇸🇩',
  speechLocale: 'en-US', // no Nobiin speech recognition exists; fallback only
  ttsLanguage: 'en-US', // no Nobiin TTS voice exists; best-effort fallback
  script: 'latin',
  direction: 'ltr',
  romanizationScheme: 'none',
  items: {
    // ——— Lidé / People (Wiktionary standard pronouns, Proto-Nubian/Old Nubian derivations) ———
    'fia-ay': { id: 'fia-ay', text: 'ày', translation: 'I', emoji: '🙋' },
    'fia-ir': { id: 'fia-ir', text: 'ìr', translation: 'you', emoji: '👉' },
    'fia-tar': { id: 'fia-tar', text: 'tàr', translation: 'he / she / it' },
    'fia-uu': { id: 'fia-uu', text: 'ùù', translation: 'we', emoji: '👥' },
    'fia-ur': { id: 'fia-ur', text: 'úr', translation: 'you (plural)' },
    'fia-ter': { id: 'fia-ter', text: 'tér', translation: 'they', emoji: '👥' },
    'fia-ayiin': { id: 'fia-ayiin', text: 'āyíín', translation: 'my' },
    'fia-tariin': { id: 'fia-tariin', text: 'tàríín', translation: 'his / her / its' },
    'fia-terin': { id: 'fia-terin', text: 'téríín', translation: 'their' },
    'fia-irnin': { id: 'fia-irnin', text: 'ìríín', translation: 'your (singular)' },
    'fia-uunin': { id: 'fia-uunin', text: 'ùùnín', translation: 'our' },
    'fia-nob': { id: 'fia-nob', text: 'nob', translation: 'Nubian', emoji: '🏺' },
    'fia-urrutan': { id: 'fia-urrutan', text: 'urrutān', translation: 'Nobiin (language)', emoji: '🗣️' },
    'fia-uru': { id: 'fia-uru', text: 'ūru', translation: 'king', emoji: '👑' },
    // ——— Čísla / Numbers (Wiktionary numerals, Old Nubian derivations — only verified ones) ———
    'fia-wer': { id: 'fia-wer', text: 'wēr', translation: 'one', emoji: '1️⃣' },
    'fia-kolod': { id: 'fia-kolod', text: 'kolod', translation: 'seven', emoji: '7️⃣' },
    'fia-oskoda': { id: 'fia-oskoda', text: 'oskoda', translation: 'nine', emoji: '9️⃣' },
    // ——— Rodina / Family (Wiktionary) ———
    'fia-fab': { id: 'fia-fab', text: 'fāb', translation: 'father', emoji: '👨' },
    'fia-een': { id: 'fia-een', text: 'een', translation: 'mother', emoji: '👩' },
    // ——— Tělo / Body (GLD) ———
    'fia-awu': { id: 'fia-awu', text: 'àwù', translation: 'head', emoji: '🙂' },
    'fia-angar': { id: 'fia-angar', text: 'ángàr', translation: 'eye', emoji: '👁️' },
    'fia-kuku': { id: 'fia-kuku', text: 'kùkù', translation: 'ear', emoji: '👂' },
    'fia-immi': { id: 'fia-immi', text: 'ímmì', translation: 'nose', emoji: '👃' },
    'fia-lebbe': { id: 'fia-lebbe', text: 'lébbè', translation: 'tongue', emoji: '👅' },
    'fia-illi': { id: 'fia-illi', text: 'ìllì', translation: 'tooth', emoji: '🦷' },
    'fia-abbe': { id: 'fia-abbe', text: 'ábbè', translation: 'mouth', emoji: '👄' },
    'fia-ngara': { id: 'fia-ngara', text: 'ngàrà', translation: 'hair', emoji: '💇' },
    'fia-kinu': { id: 'fia-kinu', text: 'kínù', translation: 'blood', emoji: '🩸' },
    'fia-okolo': { id: 'fia-okolo', text: 'òkòlò', translation: 'knee', emoji: '🦵' },
    'fia-elle': { id: 'fia-elle', text: 'éllè', translation: 'belly', emoji: '🤰' },
    'fia-odobo': { id: 'fia-odobo', text: 'òdòbò', translation: 'heart', emoji: '❤️' },
    'fia-ngale': { id: 'fia-ngale', text: 'ngàlè', translation: 'breast' },
    // ——— Místa / Places (Wiktionary + GLD) ———
    'fia-nog': { id: 'fia-nog', text: 'nōg', translation: 'house', emoji: '🏠' },
    'fia-irki': { id: 'fia-irki', text: 'irki', translation: 'village', emoji: '🏘️' },
    'fia-diffi': { id: 'fia-diffi', text: 'diffi', translation: 'town', emoji: '🏙️' },
    'fia-ese': { id: 'fia-ese', text: 'eše', translation: 'country' },
    'fia-naja': { id: 'fia-naja', text: 'nàjà', translation: 'hill', emoji: '🏜️' },
    'fia-edde': { id: 'fia-edde', text: 'èddè', translation: 'sand', emoji: '🏖️' },
    // ——— Místa jménem / Named places (Wiktionary proper nouns, Old Nubian/Arabic derivations) ———
    'fia-masser': { id: 'fia-masser', text: 'Másser', translation: 'Egypt / Cairo', emoji: '🇪🇬' },
    'fia-sudan': { id: 'fia-sudan', text: 'Sudān', translation: 'Sudan', emoji: '🇸🇩' },
    'fia-habas': { id: 'fia-habas', text: 'Habáš', translation: 'Ethiopia', emoji: '🇪🇹' },
    'fia-tungul': { id: 'fia-tungul', text: 'Túngul', translation: 'Dongola', emoji: '🏙️' },
    'fia-aman-dawu': { id: 'fia-aman-dawu', text: 'Áman Dawū', translation: 'the Nile', emoji: '🌊' },
    // ——— Příroda / Nature (Wiktionary + GLD) ———
    'fia-aman': { id: 'fia-aman', text: 'áman', translation: 'water', emoji: '💧' },
    'fia-masa': { id: 'fia-masa', text: 'màšà', translation: 'sun', emoji: '☀️' },
    'fia-aje': { id: 'fia-aje', text: 'àjè', translation: 'tree', emoji: '🌳' },
    'fia-ngaga': { id: 'fia-ngaga', text: 'ngàgà', translation: 'leaf', emoji: '🍃' },
    'fia-adi': { id: 'fia-adi', text: 'àdì', translation: 'root', emoji: '🪵' },
    'fia-ajjo': { id: 'fia-ajjo', text: 'àjjò', translation: 'seed', emoji: '🌱' },
    'fia-ngare': { id: 'fia-ngare', text: 'ngàrè', translation: 'thorn', emoji: '🌵' },
    // ——— Zvířata / Animals (GLD) ———
    'fia-abu': { id: 'fia-abu', text: 'àbù', translation: 'dog', emoji: '🐕' },
    'fia-ang': { id: 'fia-ang', text: 'àŋ', translation: 'fish', emoji: '🐟' },
    'fia-ol': { id: 'fia-ol', text: 'òòl', translation: 'worm', emoji: '🪱' },
    'fia-idde': { id: 'fia-idde', text: 'ìddè', translation: 'louse', emoji: '🐛' },
    // ——— Barvy / Colors (GLD) ———
    'fia-ulle': { id: 'fia-ulle', text: 'ùllè', translation: 'red', emoji: '🔴' },
    'fia-esse': { id: 'fia-esse', text: 'èssè', translation: 'black', emoji: '⚫' },
    // ——— Činnosti / Actions (GLD bare verb stems) ———
    'fia-ngima': { id: 'fia-ngima', text: 'ngímà', translation: 'to cry', emoji: '😢' },
    'fia-ngee': { id: 'fia-ngee', text: 'ngèè', translation: 'to sleep', emoji: '😴' },
    'fia-ngooro': { id: 'fia-ngooro', text: 'ngòòrò', translation: 'to die' },
    'fia-ngadoo': { id: 'fia-ngadoo', text: 'ngáàdò', translation: 'to know' },
    'fia-ngaa': { id: 'fia-ngaa', text: 'ngàà', translation: 'to say' },
    'fia-ngaaan': { id: 'fia-ngaaan', text: 'ngàànà', translation: 'to hear', emoji: '👂' },
    'fia-ngago': { id: 'fia-ngago', text: 'ngàgò', translation: 'to walk', emoji: '🚶' },
    'fia-kulu': { id: 'fia-kulu', text: 'kùlù', translation: 'to stand', emoji: '🧍' },
    'fia-ogo': { id: 'fia-ogo', text: 'ògò', translation: 'to take' },
    'fia-oro': { id: 'fia-oro', text: 'òòrò', translation: 'to run', emoji: '🏃' },
    'fia-ogo-blow': { id: 'fia-ogo-blow', text: 'òògò', translation: 'to blow', emoji: '💨' },
    'fia-ata': { id: 'fia-ata', text: 'átà', translation: 'to vomit' },
    'fia-ngana': { id: 'fia-ngana', text: 'ngànà', translation: 'to spit' },
  },
  units: [
    {
      id: 'fia-u1', title: 'People', subtitle: 'Pronouns', emoji: '🙋',
      lessons: [{ id: 'fia-people', title: 'Pronouns', itemIds: ['fia-ay', 'fia-ir', 'fia-tar', 'fia-uu', 'fia-ur', 'fia-ter', 'fia-ayiin', 'fia-tariin', 'fia-terin', 'fia-irnin', 'fia-uunin', 'fia-nob', 'fia-urrutan', 'fia-uru'] }],
    },
    {
      id: 'fia-u9', title: 'Numbers', subtitle: 'Numbers (verified)', emoji: '🔢',
      lessons: [{ id: 'fia-numbers', title: 'Known numerals', itemIds: ['fia-wer', 'fia-kolod', 'fia-oskoda'] }],
    },
    {
      id: 'fia-u2', title: 'Family', subtitle: 'Family', emoji: '👨‍👩‍👧',
      lessons: [{ id: 'fia-family', title: 'Family', itemIds: ['fia-fab', 'fia-een'] }],
    },
    {
      id: 'fia-u3', title: 'Body', subtitle: 'Body', emoji: '🧍',
      lessons: [{ id: 'fia-body', title: 'Body parts', itemIds: ['fia-awu', 'fia-angar', 'fia-kuku', 'fia-immi', 'fia-lebbe', 'fia-illi', 'fia-abbe', 'fia-ngara', 'fia-kinu', 'fia-okolo', 'fia-elle', 'fia-odobo', 'fia-ngale'] }],
    },
    {
      id: 'fia-u4', title: 'Places', subtitle: 'Places & landscape', emoji: '🏘️',
      lessons: [{ id: 'fia-places', title: 'Places & landscape', itemIds: ['fia-nog', 'fia-irki', 'fia-diffi', 'fia-ese', 'fia-naja', 'fia-edde', 'fia-masser', 'fia-sudan', 'fia-habas', 'fia-tungul', 'fia-aman-dawu'] }],
    },
    {
      id: 'fia-u5', title: 'Nature', subtitle: 'Nature', emoji: '🌿',
      lessons: [{ id: 'fia-nature', title: 'Nature', itemIds: ['fia-aman', 'fia-masa', 'fia-aje', 'fia-ngaga', 'fia-adi', 'fia-ajjo', 'fia-ngare'] }],
    },
    {
      id: 'fia-u6', title: 'Animals', subtitle: 'Animals', emoji: '🐕',
      lessons: [{ id: 'fia-animals', title: 'Animals', itemIds: ['fia-abu', 'fia-ang', 'fia-ol', 'fia-idde'] }],
    },
    {
      id: 'fia-u7', title: 'Colors', subtitle: 'Colors', emoji: '🎨',
      lessons: [{ id: 'fia-colors', title: 'Colors', itemIds: ['fia-ulle', 'fia-esse'] }],
    },
    {
      id: 'fia-u8', title: 'Actions', subtitle: 'Actions', emoji: '🏃',
      lessons: [{ id: 'fia-actions', title: 'Verb stems', itemIds: ['fia-ngima', 'fia-ngee', 'fia-ngooro', 'fia-ngadoo', 'fia-ngaa', 'fia-ngaaan', 'fia-ngago', 'fia-kulu', 'fia-ogo', 'fia-oro', 'fia-ogo-blow', 'fia-ata', 'fia-ngana'] }],
    },
  ],
};
