import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseProps } from './common';
import { playItemAudio } from '@/audio/player';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';
import { colors, fontSize, radius, spacing } from '@/theme';

/** Lowercase + strip punctuation for lenient cloze comparison. */
function normWord(s: string): string {
  return s.replace(/[.,!?;:¿¡"']/g, '').toLowerCase();
}

/**
 * Fill-in-the-blank ("cloze"): a real sentence with one word missing; the
 * learner picks the correct word from a set of choices. Mirrors Rosetta
 * Stone's sentence-completion drill (multiple choice, not typing).
 */
export function ClozeExercise({ exercise, ttsLanguage, onResolved }: ExerciseProps) {
  const cloze = exercise.cloze;
  const { item } = exercise;
  const rtl = containsArabic(item.text);
  const attempts = useRef(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);

  // Split the sentence into tokens, marking the blank (the answer) slot.
  const tokens = useMemo(() => {
    if (!cloze) return [];
    const answer = normWord(cloze.answer);
    let blanked = false;
    return cloze.sentence.split(/\s+/).map((tok) => {
      const isBlank = !blanked && normWord(tok) === answer;
      if (isBlank) blanked = true;
      return { tok, isBlank };
    });
  }, [cloze]);

  if (!cloze) return null;

  const pick = (choice: string) => {
    if (correct) return;
    if (normWord(choice) === normWord(cloze.answer)) {
      attempts.current += 1;
      setSelected(choice);
      setCorrect(true);
      const quality = attempts.current === 1 ? 5 : 3;
      setTimeout(() => onResolved(quality), 700);
    } else {
      attempts.current += 1;
      setWrongChoice(choice);
      setTimeout(() => setWrongChoice(null), 600);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.translation}>{item.translation}</Text>
        <Pressable onPress={() => playItemAudio(item, ttsLanguage)} hitSlop={8}>
          <Text style={styles.speaker}>🔊</Text>
        </Pressable>
      </View>

      <View style={styles.sentenceBox}>
        {item.emoji ? <Text style={styles.sceneEmoji}>{item.emoji}</Text> : null}
        <View style={[styles.sentence, rtl && { flexDirection: 'row-reverse' }]}>
          {tokens.map((t, idx) =>
            t.isBlank ? (
              <View key={idx} style={[styles.blank, correct && styles.blankCorrect]}>
                <Text style={[styles.blankText, correct && styles.blankTextCorrect]}>
                  {correct && selected ? selected : '______'}
                </Text>
              </View>
            ) : (
              <Text key={idx} style={[styles.token, rtlTextStyle(rtl)]}>
                {t.tok}
              </Text>
            )
          )}
        </View>
      </View>

      <View style={styles.choices}>
        {cloze.choices.map((choice) => {
          const isChosen = correct && selected === choice;
          const isWrong = wrongChoice === choice;
          return (
            <Pressable
              key={choice}
              onPress={() => pick(choice)}
              disabled={correct}
              style={({ pressed }) => [
                styles.choice,
                isChosen && styles.choiceCorrect,
                isWrong && styles.choiceWrong,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.choiceText, isChosen && styles.choiceTextCorrect]}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.hint}>Pick the word that completes the sentence</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
    gap: spacing(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  translation: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textMuted,
    fontWeight: '600',
  },
  speaker: {
    fontSize: 28,
  },
  sentenceBox: {
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(2),
  },
  sceneEmoji: {
    fontSize: 48,
  },
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    minHeight: 64,
    paddingHorizontal: spacing(2),
  },
  token: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  blank: {
    minWidth: 96,
    minHeight: 46,
    paddingHorizontal: spacing(3),
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankCorrect: {
    borderStyle: 'solid',
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  blankText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  blankTextCorrect: {
    color: colors.success,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing(2),
  },
  choice: {
    minWidth: 96,
    alignItems: 'center',
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  choiceCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  choiceWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  choiceText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  choiceTextCorrect: {
    color: colors.success,
  },
  hint: {
    textAlign: 'center',
    color: colors.textFaint,
    fontSize: fontSize.sm,
  },
});

