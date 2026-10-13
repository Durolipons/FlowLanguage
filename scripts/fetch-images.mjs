// Auto-fetch a suitable image for vocabulary items from open image sources.
//
// Priority (all commercially usable): Openverse (keyless, CC) -> Wikimedia
// Commons (keyless, CC/PD) -> Pixabay (key) -> Unsplash (key). The first source
// that returns a downloadable image wins. Attribution is recorded per image.
//
// Usage:
//   # fill images for every item in a pack that doesn't have one yet
//   npm run fetch:images -- --lang es --missing
//   # fetch for one specific item (query defaults to its English translation)
//   npm run fetch:images -- --lang es --id es-manzana
//   # standalone / override the search term
//   npm run fetch:images -- --lang es --id es-manzana --query apple
//   npm run fetch:images -- --query apple --out assets/images/es/apple
//
// Keys (optional; sources without a key are skipped if unset):
//   PIXABAY_KEY, UNSPLASH_ACCESS_KEY
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'src', 'content');
const assetsDir = join(root, 'assets');
const UA = 'FlowLanguage/1.0 (educational app; contact: you@example.com)';

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function getBuffer(url, headers = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, ...headers }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get('content-type') || '' };
}
function extFrom(contentType, url, def = '.jpg') {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fromUrl)) return fromUrl;
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('png')) return '.png';
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  return def;
}

async function fromOpenverse(query) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&page_size=10&mature=false`;
  const data = await getJson(url);
  const r = (data.results || []).find((x) => x.url);
  if (!r) return null;
  const { buf, contentType } = await getBuffer(r.url);
  return { buf, contentType, creator: r.creator || '', license: r.license || '', sourceUrl: r.foreign_landing_url || r.url, source: 'openverse' };
}

async function fromWikimedia(query) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=900`;
  const data = await getJson(api);
  for (const p of Object.values(data.query?.pages || {})) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png|webp)/.test(ii.mime || '')) continue;
    const url = ii.thumburl || ii.url;
    const { buf, contentType } = await getBuffer(url);
    const meta = ii.extmetadata || {};
    return {
      buf,
      contentType,
      creator: (meta.Artist?.value || '').replace(/<[^>]*>/g, '').trim(),
      license: meta.LicenseShortName?.value || '',
      sourceUrl: ii.descriptionurl || url,
      source: 'wikimedia',
    };
  }
  return null;
}

async function fromPixabay(query) {
  const key = process.env.PIXABAY_KEY;
  if (!key) return null;
  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=photo&safesearch=true&per_page=10`;
  const data = await getJson(url);
  const h = (data.hits || [])[0];
  if (!h) return null;
  const imgUrl = h.largeImageURL || h.webformatURL;
  const { buf, contentType } = await getBuffer(imgUrl);
  return { buf, contentType, creator: h.user || '', license: 'Pixabay Content License', sourceUrl: h.pageURL || imgUrl, source: 'pixabay' };
}

async function fromUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10`;
  const data = await getJson(url, { Authorization: `Client-ID ${key}` });
  const r = (data.results || [])[0];
  if (!r || !r.urls?.regular) return null;
  const { buf, contentType } = await getBuffer(r.urls.regular);
  return { buf, contentType, creator: r.user?.name || '', license: 'Unsplash License', sourceUrl: r.links?.html || r.urls.regular, source: 'unsplash' };
}

const SOURCES = { openverse: fromOpenverse, wikimedia: fromWikimedia, pixabay: fromPixabay, unsplash: fromUnsplash };

async function fetchImage(query, preferred) {
  const order = preferred ? [preferred] : ['openverse', 'wikimedia', 'pixabay', 'unsplash'];
  for (const name of order) {
    try {
      const res = await SOURCES[name](query);
      if (res && res.buf?.length) return res;
    } catch (e) {
      console.warn(`    ${name}: ${e.message}`);
    }
  }
  return null;
}

function loadPack(file, varName) {
  let src = readFileSync(join(contentDir, file), 'utf8');
  src = src.replace(/^import[^\n]*\n/m, '');
  src = src.replace(new RegExp(`export const ${varName}: LanguagePack =`), 'return');
  return new Function(src)();
}
function packFor(lang) {
  const map = { es: ['es.ts', 'esPack'], fr: ['fr.ts', 'frPack'], pl: ['pl.ts', 'plPack'] };
  if (!map[lang]) throw new Error(`No pack for language '${lang}'`);
  return loadPack(map[lang][0], map[lang][1]);
}
function hasImage(lang, slug) {
  const dir = join(assetsDir, 'images', lang);
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f.startsWith(slug + '.'));
}
function recordAttribution(entries) {
  const path = join(assetsDir, 'images', 'ATTRIBUTION.json');
  let list = [];
  if (existsSync(path)) {
    try {
      list = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      /* ignore */
    }
  }
  list.push(...entries);
  writeFileSync(path, JSON.stringify(list, null, 2) + '\n');
}
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const lang = args.lang;
  const source = args.source;
  const force = !!args.force;
  const limit = args.limit ? parseInt(args.limit, 10) : Infinity;

  const tasks = [];
  if (args.out) {
    const slug = args.out.split(/[\\/]/).pop();
    tasks.push({ lang: lang || 'misc', slug, query: args.query || slug, outBase: args.out });
  } else {
    if (!lang) {
      console.error('Provide --lang (with --id or --missing), or use --out.');
      process.exit(1);
    }
    const pack = packFor(lang);
    if (args.id) {
      const item = pack.items[args.id];
      if (!item) {
        console.error(`Item '${args.id}' not found in the ${lang} pack.`);
        process.exit(1);
      }
      const slug = item.id.replace(/^[a-z]{2}-/, '');
      tasks.push({ lang, slug, query: args.query || item.translation || item.text, outBase: join(assetsDir, 'images', lang, slug) });
    } else if (args.missing) {
      for (const item of Object.values(pack.items)) {
        const slug = item.id.replace(/^[a-z]{2}-/, '');
        if (!force && hasImage(lang, slug)) continue;
        tasks.push({ lang, slug, query: item.translation || item.text, outBase: join(assetsDir, 'images', lang, slug) });
      }
    } else {
      console.error('Provide --id <itemId> or --missing (or use --out).');
      process.exit(1);
    }
  }

  const toRun = tasks.slice(0, limit);
  console.log(`Fetching images for ${toRun.length} item(s)...`);
  const attrib = [];
  let ok = 0;
  let fail = 0;
  let skip = 0;
  for (const t of toRun) {
    if (!args.out && !force && hasImage(t.lang, t.slug)) {
      skip++;
      continue;
    }
    console.log(`  ${t.slug}  ("${t.query}")`);
    const res = await fetchImage(t.query, source);
    if (!res) {
      fail++;
      console.warn('    no image found');
      continue;
    }
    const ext = extFrom(res.contentType, res.sourceUrl, '.jpg');
    const dir = join(assetsDir, 'images', t.lang);
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir)) if (f.startsWith(t.slug + '.')) rmSync(join(dir, f));
    const outPath = `${t.outBase}${ext}`;
    writeFileSync(outPath, res.buf);
    attrib.push({ lang: t.lang, slug: t.slug, query: t.query, file: `images/${t.lang}/${t.slug}${ext}`, source: res.source, creator: res.creator, license: res.license, sourceUrl: res.sourceUrl });
    ok++;
    console.log(`    ok -> images/${t.lang}/${t.slug}${ext}  [${res.source}${res.license ? ', ' + res.license : ''}]`);
  }
  if (attrib.length) recordAttribution(attrib);
  console.log(`\nDone. fetched=${ok} skipped=${skip} failed=${fail}`);
  console.log('Attribution: assets/images/ATTRIBUTION.json');
  console.log('Register bundled images with:  npm run register:images');
}
main();

