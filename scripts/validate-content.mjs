// Throwaway content-integrity check. Run with: node scripts/validate-content.mjs
// It reads the TS language packs, strips the TS-only bits, and evaluates them.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, '..', 'src', 'content');

function loadPack(file, varName) {
  let src = readFileSync(join(contentDir, file), 'utf8');
  src = src.replace(/^import[^\n]*\n/m, '');
  src = src.replace(new RegExp(`export const ${varName}: LanguagePack =`), 'return');
  // eslint-disable-next-line no-new-func
  return new Function(src)();
}

let failed = false;
for (const [file, name] of [
  ['es.ts', 'esPack'],
  ['fr.ts', 'frPack'],
  ['pl.ts', 'plPack'],
]) {
  const pack = loadPack(file, name);
  const itemKeys = Object.keys(pack.items);
  const itemKeySet = new Set(itemKeys);
  let lessons = 0;
  let refs = 0;
  const missing = [];
  for (const unit of pack.units) {
    for (const lesson of unit.lessons) {
      lessons++;
      for (const id of lesson.itemIds) {
        refs++;
        if (!itemKeySet.has(id)) missing.push(`${lesson.id} -> ${id}`);
      }
    }
  }
  const phrases = itemKeys.filter((k) => k in pack.items && String(pack.items[k].text).trim().split(/\s+/).length > 1).length;
  console.log(`\n[${pack.code}] ${pack.englishName}:`);
  console.log(`  units:   ${pack.units.length}`);
  console.log(`  lessons: ${lessons}`);
  console.log(`  items:   ${itemKeys.length}`);
  console.log(`  phrases (multi-word): ${phrases}`);
  console.log(`  itemId refs: ${refs}`);
  if (missing.length) {
    failed = true;
    console.log(`  MISSING REFERENCES: ${missing.join(', ')}`);
  } else {
    console.log(`  all itemId references resolve ✓`);
  }
}

// Duplicate id check
for (const [file, name] of [
  ['es.ts', 'esPack'],
  ['fr.ts', 'frPack'],
  ['pl.ts', 'plPack'],
]) {
  const pack = loadPack(file, name);
  const ids = Object.values(pack.items).map((i) => i.id);
  const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  if (dupes.length) {
    failed = true;
    console.log(`[${pack.code}] DUPLICATE item ids: ${dupes.join(', ')}`);
  }
}

console.log(failed ? '\n❌ CONTENT VALIDATION FAILED' : '\n✅ CONTENT VALIDATION PASSED');
process.exit(failed ? 1 : 0);
