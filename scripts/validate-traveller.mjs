// Traveller phrase-integrity check. Run with: node scripts/validate-traveller.mjs
// Reads the curated traveller phrase files, strips TS-only bits, and evaluates them.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, '..', 'src', 'content');

const VALID_CATEGORIES = new Set([
  'airport',
  'hotel',
  'restaurant',
  'shopping',
  'emergency',
  'transport',
  'custom',
]);

function loadPhrases(file, varName) {
  let src = readFileSync(join(contentDir, file), 'utf8');
  src = src.replace(/^import[^\n]*\n/m, '');
  src = src.replace(new RegExp(`export const ${varName}: TravPhraseInput\\[\\] =`), 'return');
  // eslint-disable-next-line no-new-func
  return new Function(src)();
}

let failed = false;
const fail = (msg) => {
  failed = true;
  console.log(`  ❌ ${msg}`);
};

const LANGS = [
  ['traveller-es.ts', 'esTravellerPhrases', 'es'],
  ['traveller-fr.ts', 'frTravellerPhrases', 'fr'],
  ['traveller-pl.ts', 'plTravellerPhrases', 'pl'],
  ['traveller-ar.ts', 'arTravellerPhrases', 'ar'],
];

for (const [file, varName, lang] of LANGS) {
  const phrases = loadPhrases(file, varName);
  console.log(`\n[${lang}] ${file}:`);
  console.log(`  phrases: ${phrases.length}`);

  const ids = phrases.map((p) => p.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(`duplicate ids: ${[...new Set(dupes)].join(', ')}`);

  const byCategory = {};
  for (const p of phrases) {
    // id must be ASCII and prefixed with the language code
    if (!/^[a-z0-9-]+$/.test(p.id)) fail(`non-ASCII/malformed id: ${JSON.stringify(p.id)}`);
    if (!p.id.startsWith(`${lang}-`)) fail(`id not prefixed with "${lang}-": ${p.id}`);
    if (!VALID_CATEGORIES.has(p.category)) fail(`invalid category on ${p.id}: ${p.category}`);
    if (!p.text || !String(p.text).trim()) fail(`empty text on ${p.id}`);
    if (!p.source || !String(p.source).trim()) fail(`empty source on ${p.id}`);
    if (p.hint !== undefined && !String(p.hint).trim()) fail(`empty hint on ${p.id}`);
    byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
  }

  const emergencyCount = byCategory.emergency ?? 0;
  console.log(`  categories: ${Object.entries(byCategory).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  if (emergencyCount < 3) fail(`expected >= 3 emergency phrases, found ${emergencyCount}`);
  if (phrases.length < 20) fail(`expected >= 20 curated phrases, found ${phrases.length}`);

  // Duplicate English sources make matching ambiguous.
  const sources = phrases.map((p) => String(p.source).toLowerCase().trim());
  const srcDupes = sources.filter((s, i) => sources.indexOf(s) !== i);
  if (srcDupes.length) fail(`duplicate English sources: ${[...new Set(srcDupes)].join(' | ')}`);

  if (!failed) console.log('  all checks passed ✓');
}

/**
 * The Translate screen's example chips and the Emergency screen's five buttons
 * resolve their phrases through matchPhrase(). If these curated English sources
 * are missing, those UI entry points silently show "not in your phrasebook".
 * Mirror src/traveller/translate.ts normalize() for the comparison.
 */
const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:()[\]{}"'«»¿¡]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const REQUIRED_SOURCES = [
  // Translate screen example chips
  'I need a taxi',
  'Where is the station?',
  'Do you speak English?',
  // Emergency screen buttons
  'I need a doctor.',
  'Call the police.',
  'Where is the pharmacy?',
  'Help!',
];

console.log('\nRequired UI entry-point phrases:');
for (const [file, varName, lang] of LANGS) {
  const phrases = loadPhrases(file, varName);
  const sources = new Set(phrases.map((p) => norm(p.source)));
  const missing = REQUIRED_SOURCES.filter((s) => !sources.has(norm(s)));
  if (missing.length) {
    failed = true;
    console.log(`  ❌ [${lang}] missing exact sources: ${missing.join(' | ')}`);
  } else {
    console.log(`  ✓ [${lang}] all ${REQUIRED_SOURCES.length} resolve exactly`);
  }
}

console.log(
  failed ? '\n❌ TRAVELLER VALIDATION FAILED' : '\n✅ TRAVELLER VALIDATION PASSED'
);
process.exit(failed ? 1 : 0);