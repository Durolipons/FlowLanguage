import React from 'react';
import type { ExerciseProps } from './common';
import { MatchingExercise } from './MatchingExercise';
import { PronounceExercise } from './PronounceExercise';
import { BuildSentenceExercise } from './BuildSentenceExercise';

/** Renders the correct exercise component for a given instance. */
export function ExerciseView(props: ExerciseProps) {
  const { type } = props.exercise;
  switch (type) {
    case 'listen_match':
      return <MatchingExercise {...props} variant="listen_match" />;
    case 'text_to_image':
      return <MatchingExercise {...props} variant="text_to_image" />;
    case 'image_to_text':
      return <MatchingExercise {...props} variant="image_to_text" />;
    case 'pronounce':
      return <PronounceExercise {...props} />;
    case 'build_sentence':
      return <BuildSentenceExercise {...props} />;
    default:
      return null;
  }
}
