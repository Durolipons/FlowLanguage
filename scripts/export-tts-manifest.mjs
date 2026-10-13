// Exports the vocabulary text for every language into scripts/tts/manifest.json
// so the voice generator (scripts/tts/generate_voices.py) knows what to say.
// Run with: npm run tts:manifest
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');

function loadPack(file, varName) {
  let src = readFileSync(join(contentDir, file), 'utf8');
  src = src.replace(/^import[^\n]*\n/m, '');
  src = src.replace(new RegExp(`export const ${varName}: LanguagePack =`), 'return');
  return new Function(src)();
}
function loadDialogues() {
  let src = readFileSync(join(contentDir, 'dialogues.ts'), 'utf8');
  src = src.replace(/^import[^\n]*\n/m, '');
  src = src.replace(/export const dialogues: Dialogue\[\] =/, 'return');
  return new Function(src)();
}

const out = {};
for (const [file, name, code] of [
  ['es.ts', 'esPack', 'es'],
  ['fr.ts', 'frPack', 'fr'],
  ['pl.ts', 'plPack', 'pl'],
]) {
  const pack = loadPack(file, name);
  out[code] = Object.values(pack.items).map((i) => ({ id: i.id, text: i.text }));
}

mkdirSync(join(root, 'scripts', 'tts'), { recursive: true });
writeFileSync(join(root, 'scripts', 'tts', 'manifest.json'), JSON.stringify(out, null, 2) + '\n');
const total = Object.values(out).reduce((n, a) => n + a.length, 0);
console.log(`Wrote scripts/tts/manifest.json (${total} items across ${Object.keys(out).length} languages)`);

const dlg = loadDialogues();
writeFileSync(join(root, 'scripts', 'tts', 'dialogues.json'), JSON.stringify(dlg, null, 2) + '\n');
console.log(`Wrote scripts/tts/dialogues.json (${dlg.length} dialogues)`);
