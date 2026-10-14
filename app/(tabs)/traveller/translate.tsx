import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { speak } from '@/audio/tts';
import { useSpeechRecognition } from '@/audio/useSpeechRecognition';
import { PrimaryButton } from '@/components/ui';
import {
  EmptyState,
  MatchBadge,
  SectionTitle,
  TravHeader,
  TranslationCard,
} from '@/components/traveller';
import { setLastTranslation } from '@/db/progress';
import { lookupWord, matchPhrase, matchKindLabel, tokenize } from '@/traveller/translate';
import { useActiveTrip, useSavedPhrases, useTravellerLang } from '@/traveller/useTraveller';
import type { MatchResult, TravPhrase } from '@/traveller/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';

const EXAMPLES = ['I need a taxi', 'Where is the station?', 'Do you speak English?'];

interface WordRow {
  word: string;
  phrase: TravPhrase | null;
}

export default function TranslateScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();
  const { isSaved, toggle } = useSavedPhrases(lang);
  const { listening, error: speechError, start } = useSpeechRecognition('en-US');

  const [input, setInput] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [searched, setSearched] = useState('');

  const runLookup = async (raw: string) => {
    const query = raw.trim();
    if (!query) return;
    const res = matchPhrase(query, lang);
    setSearched(query);
    setResult(res);
    if (res.phrase) {
      await setLastTranslation(lang, query, res.phrase.text);
      if (res.kind === 'exact' || res.kind === 'close') {
        speak(res.phrase.text, pack.ttsLanguage);
      }
    }
  };

  const handleMic = async () => {
    const transcript = await start();
    if (transcript) {
      setInput(transcript);
      await runLookup(transcript);
    }
  };

  /** Per-word fallback rows for input the phrasebook cannot answer. */
  const wordRows = useMemo<WordRow[]>(() => {
    if (!searched) return [];
    return tokenize(searched).map((word) => ({
      word,
      phrase: lookupWord(word, lang)?.phrase ?? null,
    }));
  }, [searched, lang]);

  const knownWords = wordRows.filter((r) => r.phrase !== null);
  const phrase = result?.phrase ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader
        title="Translate"
        subtitle={`English → ${pack.name} · offline phrasebook lookup`}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="What would you like to say?"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
          accessibilityLabel="English text to translate"
        />

        <View style={styles.examples}>
          {EXAMPLES.map((ex) => (
            <Pressable
              key={ex}
              accessibilityRole="button"
              accessibilityLabel={`Try example: ${ex}`}
              onPress={() => {
                setInput(ex);
                void runLookup(ex);
              }}
              style={({ pressed }) => [styles.example, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.exampleText}>{ex}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttons}>
          <PrimaryButton
            label="Translate"
            onPress={() => void runLookup(input)}
            disabled={!input.trim()}
            style={{ flex: 1 }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={listening ? 'Listening' : 'Speak your phrase'}
            onPress={() => void handleMic()}
            style={({ pressed }) => [
              styles.micBtn,
              listening && styles.micBtnActive,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.micEmoji}>🎤</Text>
          </Pressable>
        </View>

        {listening ? <Text style={styles.listening}>Listening… speak now.</Text> : null}
        {speechError ? <Text style={styles.errorText}>{speechError}</Text> : null}

        {phrase && result ? (
          <>
            <SectionTitle>Result</SectionTitle>
            <TranslationCard
              phrase={phrase}
              query={searched}
              kind={result.kind}
              score={result.score}
              ttsLanguage={pack.ttsLanguage}
              saved={isSaved(phrase.source, phrase.text)}
              onSave={() => void toggle(phrase, trip?.id ?? null)}
              onLearn={() =>
                router.push({
                  pathname: '/traveller/learn',
                  params: { text: phrase.text, translation: phrase.source },
                })
              }
            />
            <Text style={styles.scopeNote}>
              {matchKindLabel(result.kind)}. Traveller Translate is a curated offline
              phrasebook — not free-form machine translation.
            </Text>
          </>
        ) : null}

        {result && result.kind === 'none' ? (
          <>
            <SectionTitle>Result</SectionTitle>
            <View style={styles.noneCard}>
              <MatchBadge kind="none" />
              <Text style={styles.noneTitle}>“{searched}” isn’t in your phrasebook.</Text>
              <Text style={styles.noneText}>
                Traveller Translate matches curated travel phrases offline. Here is what we
                do know from your {pack.name} vocabulary:
              </Text>
            </View>

            {knownWords.length > 0 ? (
              <View style={styles.wordList}>
                {knownWords.map((r) => (
                  <View key={r.word} style={styles.wordRow}>
                    <Text style={styles.wordEn}>{r.word}</Text>
                    <Text style={styles.wordArrow}>=</Text>
                    <Text style={[styles.wordTarget, rtlTextStyle(containsArabic(r.phrase?.text ?? ''))]}>{r.phrase?.text ?? '—'}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                emoji="🔍"
                title="No known words"
                text="Try the Phrasebook for curated travel phrases, or ask a shorter question."
              />
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(3) },
  input: {
    minHeight: 110,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    fontSize: fontSize.lg,
    color: colors.text,
    textAlignVertical: 'top',
  },
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  example: {
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    minHeight: 40,
    justifyContent: 'center',
  },
  exampleText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primaryDark },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  micBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  micBtnActive: { backgroundColor: colors.danger, borderColor: colors.danger },
  micEmoji: { fontSize: 24 },
  listening: { fontSize: fontSize.sm, fontWeight: '700', color: colors.danger },
  errorText: { fontSize: fontSize.sm, color: colors.danger },
  scopeNote: { fontSize: fontSize.xs, color: colors.textFaint, lineHeight: 17 },
  noneCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  noneTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  noneText: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  wordList: { gap: spacing(2) },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  wordEn: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted },
  wordArrow: { fontSize: fontSize.md, color: colors.textFaint },
  wordTarget: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
});
