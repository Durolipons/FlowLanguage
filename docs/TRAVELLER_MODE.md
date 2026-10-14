# Traveller Mode — UX Design (Deliverables 1–6)

> Companion to `docs/ARCHITECTURE.md`. Scope note: this app runs fully offline
> inside Expo, so "Translate" is **offline phrasebook + vocabulary lookup**
> (curated travel phrases + pack items), not cloud/neural MT. Argos/MarianMT are
> Python-side generation tools, not in-app engines. Speech uses on-device
> recognition (`expo-speech-recognition`) and on-device TTS (`expo-speech`).

## 1. Design goals
Combine **Phrasebook + Translator + Pronunciation coach + Flashcards + Travel
trainer** in one offline travel companion. Core loop: **LEARN → USE → SAVE → REVIEW**.
Feels like Translate (instant lookup/speak) + Rosetta (image/voice lessons) + Anki
(SRS review of saved phrases). Offline-first: every screen works with zero network.

Tab mapping (spec tabs → this app): Learn=`/` home · Practice=`/dialogues`
(conversation practice) · Traveller=`/traveller` · Review=`/review` (word SRS;
trip-deck review lives at `/traveller/review`) · Settings=`/settings` (new).

## 2. Screen structure & navigation flow
```
/(tabs)
  /            Learn home (+Traveller Mode card)
  /dialogues   Practice · /review  Review · /traveller Traveller home · /settings
/traveller/translate   input/examples → Translate/Mic → result card
/traveller/speak       mic → transcript → match → history (Repeat/Save/Learn)
/traveller/learn?text=&translation=  word components + lesson links
/traveller/phrasebook  search + categories (Airport/Hotel/Restaurant/Shopping/
                       Emergency/Transport + Custom=saved) + per-phrase audio/save
/traveller/trips       Trip decks (create/select/stats) — phrases auto-join active deck
/traveller/review      deck review session (Easy/Medium/Hard → SM-2)
/traveller/emergency   large buttons: Doctor/Police/Taxi/Pharmacy/Help
/lesson, /unit, /dialogue, /languages stay on the root Stack (URLs unchanged:
route groups are URL-transparent).
```
Home → Traveller tab via bottom nav or the dashboard "Traveller Mode" card.
Emergency is one tap from Traveller home (also add a home-dashboard shortcut).

## 3. Wireframes (text)

**Traveller home** — Header "Traveller Mode / Learn while you travel." 4 large
cards: Translate ("Type or speak a phrase instantly"), Speak ("Translate and play
aloud"), Phrasebook ("Saved travel phrases"), Review Trip Deck ("Practice phrases
you've used"). Then 🚨 Emergency Mode button. Then Recent Activity: last
translated phrase · last saved phrase · review-due count.

**Translate** — big TextInput ("What would you like to say?") + 3 tappable
examples ("I need a taxi", "Where is the station?", "Do you speak English?").
[Translate] [🎤]. Result: source block → ↓ → target block → optional hint block,
then Play Audio · Save ⭐ · Learn This · Copy.

**Learn This** — target sentence, then per-word rows: `Necesito = I need`,
`un = a`, `taxi = taxi` (unknown words show "—"); each known word links its
lesson when found in a pack. Buttons: [Save Vocabulary] [Start Practice].

**Speak** — top: `English → Spanish` pair. Center: large mic button (listening
state). Bottom: conversation history cards (transcript → result, Repeat/Save/Learn).

**Phrasebook** — Search box; category chips; `Phrase — Translation [🔊][⭐]`.

**Trips** — input + [New trip]; DeckCards: name, counts, mastery %, [Use][🗑].

**Trip review** — progress `3/12`; prompt "How do you say: …"; [Reveal] → answer;
[Easy][Medium][Hard]; done state → back.

**Emergency** — 5 full-width large buttons (🚑🚓🚕🏥🆘 → label); each expands:
Phrase, Translation, hint, 🔊 (large).

## 4. Component hierarchy
```
app/(tabs)/traveller.tsx            TravellerModePage
app/traveller/{translate,speak,learn,phrasebook,trips,review,emergency}.tsx
src/traveller/translate.ts          matchPhrase(), lookupWord(), decompose()
src/traveller/traveller.ts          types: TravPhrase/TravCategory/TripDeck +
                                    CATEGORIES meta (shared ids/icons)
src/content/traveller-{es,fr,pl}.ts curated phrases per language + emergencies
src/components/traveller.tsx        TranslationCard, PhraseCard, AudioPlayerButton,
                                    PronunciationPanel, DeckCard, EmergencyButton
src/db/progress.ts (extended)       trips/saved_phrases/phrase_progress + review fns
```

---

## 5. Data models

```ts
interface TravPhrase {                       // one phrasebook/translation unit
  id: string;             // `es:taxi` / `fr:hotel` (built-in) or saved:<n>
  lang: string;           // target pack code ('es' | 'fr' | 'pl')
  text: string;           // target side, e.g. 'Necesito un taxi.'
  source: string;         // English query it answers, e.g. 'I need a taxi.'
  category: string;       // 'airport' | 'hotel' | 'restaurant' | 'shopping' |
                          // 'emergency' | 'transport' | 'custom'
  hint?: string;          // short pronunciation gloss (authored/curated only)
  audioKey?: string;      // bundled audio registry key (else TTS)
}
interface TripDeck {
  id: number; name: string; lang: string; createdAt: number; active: 0 | 1;
}
// Saved rows add: source, text, target_lang, category, deckId,
// askedAt, savedAt; progress rows add: quality SM-2 + deckId.
```

Matching rule: normalized input (strip accents/case/punct; drop leading
`please|can you|i need|could you` openers) equals a curated `source` → **exact
match**; 3+ shared words with ≥1 content word → **close match** (flagged as
such); pack-item text/translation → **word**.

## 6. Database schema additions (all `CREATE TABLE IF NOT EXISTS`, additive)

```sql
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, lang TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')), active INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_trips_active ON trips(lang, active);
CREATE TABLE IF NOT EXISTS saved_phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT NOT NULL, text TEXT NOT NULL,
  target_lang TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'custom',
  deck_id INTEGER, asked_at INTEGER, saved_at INTEGER, rev_score INTEGER DEFAULT 0,
  rev_best INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS idx_saved_phrases_lang_saved ON saved_phrases(target_lang, saved_at);
CREATE TABLE IF NOT EXISTS phrase_progress (
  save_id INTEGER PRIMARY KEY REFERENCES saved_phrases(id) ON DELETE CASCADE,
  repetitions INTEGER NOT NULL DEFAULT 0, interval_days REAL NOT NULL DEFAULT 0,
  ease REAL NOT NULL DEFAULT 2.5, due_at INTEGER NOT NULL DEFAULT 0,
  deck_id INTEGER, correct INTEGER NOT NULL DEFAULT 0, incorrect INTEGER NOT NULL DEFAULT 0);
```
Access: `listTrips/createTrip/deleteTrip/setActiveTrip/tripStats` ·
`savePhrase/getRecentActivity/getSavedPhrases/getDuePhrases/isSaved` ·
`recordPhraseReview/qualityFromRating`, deck-aware SRS via `recordPhraseResult()`.

## 7. Design details & explicit scope limits
- **Offline guarantee:** translate/speak/phrasebook/review/emergency all run on
  `expo-speech` + `expo-speech-recognition` + local phrase data. `net.ts` kept only
  for an **offline pill** ("works offline" — no capabilities read off-network).
- **Translate is matched-phrase lookup**, clearly labelled, ~50 curated phrases per
  language (+pack words) — NOT free-form MT. Unknown input falls back to
  per-word meaning rows (known words) or an honest "not in your phrasebook".
- **Pronunciation** = Play-audio + word hints + Practice link. Numeric phonetics
  (`neh-seh-SEE-toh`) are unsustainable without a phonetic dictionary, so only
  curated per-phrase hint blocks ship — no fabricated syllable guides.
- **Learn This** decomposes against the phrasebook; unknown words render "—".
- **Emergency** = big buttons + expanded phrase rows; zero network.
- **Accessibility:** ≥48 dp targets, labelled icon buttons, visible listening state,
  clear error text; dark-mode inherits app theme. Offline Copy helper exists but
  buttons reference platform widgets.

## 8. Implementation plan & roadmap
Order: docs → types/category meta + offline engine → curated es/fr/pl phrases +
emergencies → DB tables → shared components → screens (translate → speak/learn →
phrasebook → trips → review → emergency) → tabs + entries → `tsc` + web export →
preview sitemap. Per-screen acceptance: Translate (guided lookup + labelled match
bars), Speak (transcribe → match → play), Learn (≥1 known word decomposes + lesson
linkage works), Phrasebook (search + filters + save/unsave), Trips (stats/update),
Review (Easy/Medium/Hard → SM-2), Emergency (one-tap, offline).

## 9–10. Screenshots/mockups + initial build
No simulator/device here, so validation is `tsc --noEmit` + `expo export --web`
(bundling incl. static/PNG assets) + expo-doctor. Scaffolding lands screens +
components behind one flag in the Traveller entry (`traveller.ts`) — safe to
remove or extend.

