import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseInstance, LexicalItem, Script } from '@/content';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';
import { Transliteration } from '@/components/Transliteration';
import { colors, fontSize, radius, spacing } from '@/theme';

export interface ExerciseProps {
  exercise: ExerciseInstance;
  ttsLanguage: string;
  speechLocale: string;
  /** Writing system of the pack (drives tokenization/matching). */
  script: Script;
  /** Called when the item is resolved: 5 = first try, 3 = after retries, 1 = gave up. */
  onResolved: (quality: number) => void;
}

export type CardState = 'idle' | 'correct' | 'wrong';

export function ChoiceButton({
  item,
  mode,
  state,
  onPress,
  disabled,
}: {
  item: LexicalItem;
  mode: 'visual' | 'text';
  state: CardState;
  onPress: () => void;
  disabled?: boolean;
}) {
  const borderColor =
    state === 'correct'
      ? colors.success
      : state === 'wrong'
      ? colors.danger
      : colors.border;
  const bg =
    state === 'correct'
      ? colors.successSoft
      : state === 'wrong'
      ? colors.dangerSoft
      : colors.card;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || state === 'correct'}
      style={({ pressed }) => [
        styles.choice,
        { borderColor, backgroundColor: bg },
        pressed && { opacity: 0.9 },
      ]}
    >
      {mode === 'visual' ? (
        <Text style={styles.choiceEmoji}>{item.emoji ?? '❓'}</Text>
      ) : (
        <>
          <Text style={[styles.choiceText, rtlTextStyle(containsArabic(item.text))]}>{item.text}</Text>
          <Transliteration text={item.romanization} />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    flex: 1,
    margin: spacing(1.5),
    minHeight: 96,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(2),
  },
  choiceEmoji: {
    fontSize: 52,
  },
  choiceText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
