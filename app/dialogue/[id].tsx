import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDialogue, requirePack } from '@/content';
import { playTurnAudio, stopItemAudio } from '@/audio/player';
import { PrimaryButton } from '@/components/ui';
import { colors, fontSize, radius, spacing } from '@/theme';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';

function estimateDuration(text: string): number {
  return Math.min(9000, 700 + text.length * 115);
}

export default function DialogueScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dialogue = useMemo(() => getDialogue(id), [id]);
  const [showTranslations, setShowTranslations] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const runIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pack = dialogue ? requirePack(dialogue.language) : null;

  useEffect(
    () => () => {
      runIdRef.current++;
      if (timerRef.current) clearTimeout(timerRef.current);
      stopItemAudio();
    },
    []
  );

  if (!dialogue || !pack) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.missing}>Dialogue not found.</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const sides = new Map<string, 'left' | 'right'>();
  dialogue.speakers.forEach((s, i) => sides.set(s, i === 0 ? 'right' : 'left'));

  const stopAll = () => {
    runIdRef.current++;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlayingAll(false);
    setActiveIndex(null);
    stopItemAudio();
  };

  const playFrom = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (index >= dialogue.turns.length) {
      setPlayingAll(false);
      setActiveIndex(null);
      return;
    }
    const runId = ++runIdRef.current;
    setActiveIndex(index);
    const turn = dialogue.turns[index];
    playTurnAudio(turn, pack.ttsLanguage, `${dialogue.id}:${index}`, {
      onDone: () => {
        if (runIdRef.current === runId) playFrom(index + 1);
      },
    });
    timerRef.current = setTimeout(() => {
      if (runIdRef.current === runId) playFrom(index + 1);
    }, estimateDuration(turn.text));
  };

  const playAll = () => {
    if (playingAll) {
      stopAll();
      return;
    }
    setPlayingAll(true);
    playFrom(0);
  };

  const tapTurn = (index: number) => {
    if (playingAll) stopAll();
    runIdRef.current++;
    setActiveIndex(index);
    playTurnAudio(dialogue.turns[index], pack.ttsLanguage, `${dialogue.id}:${index}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            stopAll();
            router.back();
          }}
          hitSlop={12}
        >
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.title}>
            {dialogue.emoji ? `${dialogue.emoji} ` : ''}
            {dialogue.title}
          </Text>
          <Text style={styles.subtitle}>
            {pack.flag} {pack.name}
          </Text>
        </View>
        <Pressable onPress={() => setShowTranslations((v) => !v)} hitSlop={8}>
          <Text style={styles.toggle}>{showTranslations ? 'EN ✓' : 'EN'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false}>
        {dialogue.turns.map((turn, i) => {
          const side = sides.get(turn.speaker) ?? 'left';
          const active = activeIndex === i;
          return (
            <Pressable
              key={`${dialogue.id}-${i}`}
              onPress={() => tapTurn(i)}
              style={[styles.row, side === 'right' ? styles.rowRight : styles.rowLeft]}
            >
              <Text style={styles.speaker}>{turn.speaker}</Text>
              <View style={[styles.bubble, side === 'right' ? styles.bubbleRight : styles.bubbleLeft, active && styles.bubbleActive]}>
                <Text style={[styles.bubbleText, side === 'right' && styles.bubbleTextRight, rtlTextStyle(containsArabic(turn.text))]}>{turn.text}</Text>
                {showTranslations && turn.translation ? (
                  <Text style={[styles.translation, side === 'right' && styles.translationRight]}>{turn.translation}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={playingAll ? '⏹  Stop' : '▶  Play all'}
          tone={playingAll ? 'danger' : 'primary'}
          onPress={playAll}
        />
        <Text style={styles.hint}>Tap any line to hear it again.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing(4), padding: spacing(6) },
  missing: { fontSize: fontSize.lg, color: colors.textMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    gap: spacing(2),
  },
  back: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700', width: 60 },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.xs, color: colors.textMuted },
  toggle: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700', width: 44, textAlign: 'right' },
  chat: { padding: spacing(4), gap: spacing(3) },
  row: { marginBottom: spacing(1) },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  speaker: { fontSize: fontSize.xs, color: colors.textFaint, marginBottom: 2, marginHorizontal: spacing(2), textTransform: 'capitalize' },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bubbleLeft: { backgroundColor: colors.card, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleRight: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleActive: { borderColor: colors.accent },
  bubbleText: { fontSize: fontSize.md, color: colors.text, fontWeight: '600' },
  bubbleTextRight: { color: colors.white },
  translation: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  translationRight: { color: colors.primarySoft },
  footer: { padding: spacing(5), gap: spacing(2), borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
});

