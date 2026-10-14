import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { speak } from '@/audio/tts';
import { PrimaryButton } from '@/components/ui';
import { AudioButton, EmergencyButton, TravHeader } from '@/components/traveller';
import { matchPhrase } from '@/traveller/translate';
import { useActiveTrip, useSavedPhrases, useTravellerLang } from '@/traveller/useTraveller';
import type { TravPhrase } from '@/traveller/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';

/** The five one-tap emergency actions, resolved against the curated phrasebook. */
const EMERGENCIES: { emoji: string; label: string; source: string }[] = [
  { emoji: '🚑', label: 'Doctor', source: 'I need a doctor.' },
  { emoji: '🚓', label: 'Police', source: 'Call the police.' },
  { emoji: '🚕', label: 'Taxi', source: 'I need a taxi.' },
  { emoji: '🏥', label: 'Pharmacy', source: 'Where is the pharmacy?' },
  { emoji: '🆘', label: 'Help', source: 'Help!' },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();
  const { isSaved, toggle } = useSavedPhrases(lang);
  const [open, setOpen] = useState<string | null>(null);

  const items = useMemo(
    () =>
      EMERGENCIES.map((e) => ({
        ...e,
        phrase: matchPhrase(e.source, lang).phrase as TravPhrase | null,
      })),
    [lang]
  );

  const toggleOpen = (label: string, phrase: TravPhrase | null) => {
    const next = open === label ? null : label;
    setOpen(next);
    // One tap should be enough: speak it aloud as soon as it is revealed.
    if (next && phrase) speak(phrase.text, pack.ttsLanguage);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader
        title="Emergency"
        subtitle={`${pack.flag} ${pack.name} · one tap, plays aloud, works offline`}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <EmergencyButton
            key={item.label}
            emoji={item.emoji}
            label={item.label}
            expanded={open === item.label}
            onPress={() => toggleOpen(item.label, item.phrase)}
          >
            {item.phrase ? (
              <>
                <Text style={[styles.target, rtlTextStyle(containsArabic(item.phrase.text))]}>{item.phrase.text}</Text>
                <Text style={styles.source}>{item.phrase.source}</Text>
                {item.phrase.hint ? (
                  <View style={styles.hintBox}>
                    <Text style={styles.hintLabel}>Pronunciation</Text>
                    <Text style={styles.hintText}>{item.phrase.hint}</Text>
                  </View>
                ) : null}
                <View style={styles.actions}>
                  <AudioButton
                    text={item.phrase.text}
                    language={pack.ttsLanguage}
                    size="lg"
                    tone="solid"
                    label={`Play ${item.label} phrase aloud`}
                  />
                  <PrimaryButton
                    label={
                      isSaved(item.phrase.source, item.phrase.text) ? 'Saved ⭐' : 'Save phrase'
                    }
                    tone={isSaved(item.phrase.source, item.phrase.text) ? 'success' : 'neutral'}
                    onPress={() => void toggle(item.phrase!, trip?.id ?? null)}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            ) : (
              <Text style={styles.missing}>
                No curated {pack.name} phrase for this yet. Check the Phrasebook.
              </Text>
            )}
          </EmergencyButton>
        ))}

        <Text style={styles.footnote}>
          These are curated phrases stored on your device — they work with no network. For
          a real emergency, always call the local emergency number first.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(3) },
  target: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  source: { fontSize: fontSize.md, color: colors.textMuted },
  hintBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing(3),
    gap: 2,
  },
  hintLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#0369a1',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hintText: { fontSize: fontSize.sm, color: colors.text },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(1) },
  missing: { fontSize: fontSize.sm, color: colors.textMuted },
  footnote: { fontSize: fontSize.xs, color: colors.textFaint, lineHeight: 17 },
});