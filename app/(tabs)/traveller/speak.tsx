import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { speak } from '@/audio/tts';
import { useSpeechRecognition } from '@/audio/useSpeechRecognition';
import { EmptyState, TravHeader, TranslationCard } from '@/components/traveller';
import { setLastTranslation } from '@/db/progress';
import { matchPhrase } from '@/traveller/translate';
import { useActiveTrip, useSavedPhrases, useTravellerLang } from '@/traveller/useTraveller';
import type { MatchResult } from '@/traveller/types';
import { colors, fontSize, radius, spacing } from '@/theme';

interface Turn {
  id: number;
  transcript: string;
  result: MatchResult;
}

export default function SpeakScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();
  const { isSaved, toggle } = useSavedPhrases(lang);
  const { listening, transcript, error, available, start, stop } =
    useSpeechRecognition('en-US');

  const [turns, setTurns] = useState<Turn[]>([]);

  const handleMic = async () => {
    if (listening) {
      stop();
      return;
    }
    const heard = await start();
    const text = (heard || transcript).trim();
    if (!text) return;
    const result = matchPhrase(text, lang);
    setTurns((prev) => [{ id: Date.now(), transcript: text, result }, ...prev]);
    if (result.phrase) {
      await setLastTranslation(lang, text, result.phrase.text);
      speak(result.phrase.text, pack.ttsLanguage);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader
        title="Speak"
        subtitle="Say it in English, hear it back"
        onBack={() => router.back()}
      />

      <View style={styles.pairRow}>
        <Text style={styles.pairLang}>English</Text>
        <Text style={styles.pairArrow}>→</Text>
        <Text style={styles.pairLangActive}>
          {pack.flag} {pack.name}
        </Text>
      </View>

      <View style={styles.micArea}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Stop listening' : 'Start listening'}
          onPress={() => void handleMic()}
          style={({ pressed }) => [
            styles.micBtn,
            listening && styles.micBtnActive,
            pressed && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.micEmoji}>🎤</Text>
        </Pressable>
        <Text style={styles.micState}>
          {listening ? 'Listening… tap to stop' : 'Tap to speak'}
        </Text>
        {listening && transcript ? (
          <Text style={styles.liveTranscript}>“{transcript}”</Text>
        ) : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {available === false ? (
          <Text style={styles.errorText}>
            Speech recognition is not available on this device. Use Translate to type
            instead.
          </Text>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.history} showsVerticalScrollIndicator={false}>
        <Text style={styles.historyTitle}>Conversation</Text>
        {turns.length === 0 ? (
          <EmptyState
            emoji="🗣️"
            title="Nothing yet"
            text="Tap the microphone and say a phrase in English."
          />
        ) : (
          turns.map((t) =>
            t.result.phrase ? (
              <TranslationCard
                key={t.id}
                phrase={t.result.phrase}
                query={t.transcript}
                kind={t.result.kind}
                score={t.result.score}
                ttsLanguage={pack.ttsLanguage}
                saved={isSaved(t.result.phrase.source, t.result.phrase.text)}
                onSave={() => void toggle(t.result.phrase!, trip?.id ?? null)}
                onLearn={() =>
                  router.push({
                    pathname: '/traveller/learn',
                    params: {
                      text: t.result.phrase!.text,
                      translation: t.result.phrase!.source,
                    },
                  })
                }
                big
              />
            ) : (
              <View key={t.id} style={styles.missCard}>
                <Text style={styles.missTranscript}>“{t.transcript}”</Text>
                <Text style={styles.missText}>
                  Not in your offline phrasebook. Try the Phrasebook or a shorter phrase.
                </Text>
              </View>
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
    paddingVertical: spacing(2),
  },
  pairLang: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted },
  pairLangActive: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary },
  pairArrow: { fontSize: fontSize.md, color: colors.textFaint },
  micArea: { alignItems: 'center', gap: spacing(2), paddingVertical: spacing(4) },
  micBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  micBtnActive: { backgroundColor: colors.danger },
  micEmoji: { fontSize: 48 },
  micState: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  liveTranscript: {
    fontSize: fontSize.md,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing(6),
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing(6),
  },
  history: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(3) },
  historyTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  missCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(1),
    borderWidth: 1,
    borderColor: colors.border,
  },
  missTranscript: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  missText: { fontSize: fontSize.sm, color: colors.textMuted },
});