import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChoiceButton, type CardState, type ExerciseProps } from './common';
import { Visual } from '@/components/Visual';
import { PrimaryButton } from '@/components/ui';
import { speak } from '@/audio/tts';
import { colors, fontSize, spacing } from '@/theme';

type Variant = 'listen_match' | 'text_to_image' | 'image_to_text';

/** Shared engine for all three matching exercise variants. */
export function MatchingExercise({
  exercise,
  ttsLanguage,
  onResolved,
  variant,
}: ExerciseProps & { variant: Variant }) {
  const { item, choices } = exercise;
  const [states, setStates] = useState<Record<string, CardState>>({});
  const [resolved, setResolved] = useState(false);
  const attempts = useRef(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback(() => {
    speak(item.text, ttsLanguage);
  }, [item.text, ttsLanguage]);

  useEffect(() => {
    if (variant === 'listen_match') play();
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, [variant, play]);

  const handlePress = (choiceId: string) => {
    if (resolved) return;
    attempts.current += 1;
    if (choiceId === item.id) {
      setResolved(true);
      setStates({ [choiceId]: 'correct' });
      const quality = attempts.current === 1 ? 5 : 3;
      advanceTimer.current = setTimeout(() => onResolved(quality), 650);
    } else {
      setStates({ [choiceId]: 'wrong' });
      setTimeout(() => setStates({}), 550);
    }
  };

  const choiceMode = variant === 'image_to_text' ? 'text' : 'visual';

  return (
    <View style={styles.container}>
      <View style={styles.prompt}>
        {variant === 'listen_match' && (
          <>
            <PrimaryButton label="🔊  Listen" onPress={play} style={styles.listenBtn} />
            <Text style={styles.hint}>Tap the image you hear</Text>
          </>
        )}
        {variant === 'text_to_image' && (
          <>
            <Text style={styles.bigText}>{item.text}</Text>
            <Text style={styles.hint}>Tap the matching image</Text>
          </>
        )}
        {variant === 'image_to_text' && (
          <>
            <Visual item={item} size={140} />
            <Text style={styles.hint}>Tap the matching word</Text>
          </>
        )}
      </View>

      <View style={styles.grid}>
        {choices.map((c) => (
          <ChoiceButton
            key={c.id}
            item={c}
            mode={choiceMode}
            state={states[c.id] ?? 'idle'}
            onPress={() => handlePress(c.id)}
            disabled={resolved}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
  },
  prompt: {
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  listenBtn: {
    paddingHorizontal: spacing(10),
  },
  bigText: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing(2),
  },
  hint: {
    marginTop: spacing(3),
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing(1.5),
  },
});
