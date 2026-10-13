import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseInstance } from '@/content';
import { ExerciseView } from '@/exercises/ExerciseView';
import { ProgressBar } from '@/components/ui';
import { recordItemResult } from '@/db/progress';
import { stopSpeaking } from '@/audio/tts';
import { colors, fontSize, spacing } from '@/theme';

interface Props {
  exercises: ExerciseInstance[];
  language: string;
  ttsLanguage: string;
  speechLocale: string;
  onComplete: (score: number, total: number) => void;
  onExit?: () => void;
}

export function ExercisePlayer({
  exercises,
  language,
  ttsLanguage,
  speechLocale,
  onComplete,
  onExit,
}: Props) {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const scoreRef = useRef(0);

  const total = exercises.length;
  const current = exercises[index];

  useEffect(() => () => stopSpeaking(), []);

  const handleResolved = (quality: number) => {
    if (!current) return;
    const correctDelta = quality >= 3 ? 1 : 0;
    const incorrectDelta = quality >= 3 ? 0 : 1;
    void recordItemResult(language, current.item.id, quality, correctDelta, incorrectDelta);
    if (quality >= 3) scoreRef.current += 1;

    const next = indexRef.current + 1;
    if (next >= total) {
      onComplete(scoreRef.current, total);
    } else {
      indexRef.current = next;
      setIndex(next);
    }
  };

  if (!current) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {onExit ? (
          <Pressable onPress={onExit} hitSlop={12}>
            <Text style={styles.exit}>✕</Text>
          </Pressable>
        ) : (
          <View style={{ width: 20 }} />
        )}
        <View style={styles.barWrap}>
          <ProgressBar progress={total ? index / total : 0} />
        </View>
        <Text style={styles.count}>
          {index + 1}/{total}
        </Text>
      </View>

      <View style={styles.body}>
        <ExerciseView
          key={current.key}
          exercise={current}
          ttsLanguage={ttsLanguage}
          speechLocale={speechLocale}
          onResolved={handleResolved}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3),
    paddingBottom: spacing(2),
    gap: spacing(3),
  },
  exit: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    fontWeight: '700',
  },
  barWrap: {
    flex: 1,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '700',
    width: 40,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(5),
  },
});
