import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ExerciseProps } from './common';
import { Visual } from '@/components/Visual';
import { PrimaryButton } from '@/components/ui';
import { playItemAudio } from '@/audio/player';
import { useSpeechRecognition } from '@/audio/useSpeechRecognition';
import { phrasesMatch } from '@/utils/text';
import { colors, fontSize, radius, spacing } from '@/theme';

export function PronounceExercise({ exercise, ttsLanguage, speechLocale, onResolved }: ExerciseProps) {
  const { item } = exercise;
  const { listening, transcript, error, available, start } = useSpeechRecognition(speechLocale);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [busy, setBusy] = useState(false);
  const attempts = useRef(0);
  const done = useRef(false);

  const play = () => playItemAudio(item, ttsLanguage);

  const handleRecord = async () => {
    if (busy || done.current) return;
    setBusy(true);
    attempts.current += 1;
    const result = await start();
    setBusy(false);
    if (done.current) return;

    if (result && phrasesMatch(item.text, result)) {
      done.current = true;
      setFeedback('correct');
      const quality = attempts.current === 1 ? 5 : 3;
      setTimeout(() => onResolved(quality), 650);
    } else {
      setFeedback('wrong');
    }
  };

  const unavailable = available === false || Boolean(error);
  const fg =
    feedback === 'correct'
      ? colors.success
      : feedback === 'wrong'
      ? colors.danger
      : colors.text;

  return (
    <View style={styles.container}>
      <View style={styles.prompt}>
        <Visual item={item} size={150} />
        <Text style={styles.word}>{item.text}</Text>
      </View>

      <View style={styles.controls}>
        <PrimaryButton
          label="🔊  Play"
          onPress={play}
          tone="neutral"
          style={styles.playBtn}
        />

        {unavailable ? (
          <View style={styles.fallback}>
            <Text style={styles.fallbackText}>
              Speech recognition isn’t available here. Practice out loud, then mark it done.
            </Text>
            <PrimaryButton
              label="✓  I said it"
              tone="success"
              onPress={() => {
                if (done.current) return;
                done.current = true;
                setFeedback('correct');
                onResolved(4);
              }}
            />
          </View>
        ) : (
          <>
            <PrimaryButton
              label={listening ? '🎙️  Listening…' : busy ? '…' : '🎤  Say it'}
              onPress={handleRecord}
              disabled={listening || busy || done.current}
              tone={feedback === 'correct' ? 'success' : 'primary'}
              style={styles.micBtn}
            />
            <Text style={[styles.feedback, { color: fg }]}>
              {feedback === 'correct'
                ? '¡Perfecto! Nice pronunciation.'
                : feedback === 'wrong'
                ? `Heard: “${transcript || '…'}” — try again`
                : listening
                ? 'Listening…'
                : 'Tap the mic and repeat the phrase'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: spacing(4),
  },
  prompt: {
    alignItems: 'center',
  },
  word: {
    marginTop: spacing(3),
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  controls: {
    alignItems: 'center',
  },
  playBtn: {
    marginBottom: spacing(3),
  },
  micBtn: {
    minWidth: 220,
  },
  feedback: {
    marginTop: spacing(3),
    fontSize: fontSize.sm,
    textAlign: 'center',
    minHeight: 20,
  },
  fallback: {
    alignItems: 'center',
    gap: spacing(3),
    paddingHorizontal: spacing(4),
  },
  fallbackText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    borderRadius: radius.md,
  },
});
