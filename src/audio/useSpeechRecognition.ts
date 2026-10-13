import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface SpeechResultEvent {
  results?: Array<{ transcript?: string }>;
  isFinal?: boolean;
}
interface SpeechErrorEvent {
  message?: string;
  error?: string;
}

/**
 * Speech-to-text hook built on expo-speech-recognition (native iOS/Android and
 * the web Speech API). `start()` resolves with the final transcript, or an empty
 * string if recognition is unavailable / produces nothing.
 */
export function useSpeechRecognition(locale: string) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const resolveRef = useRef<((t: string) => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      setAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setAvailable(false);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const finish = useCallback((text: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setListening(false);
    const resolve = resolveRef.current;
    resolveRef.current = null;
    resolve?.(text);
  }, []);

  useSpeechRecognitionEvent('result', (e) => {
    const ev = e as SpeechResultEvent;
    const t = ev.results?.[0]?.transcript ?? '';
    setTranscript(t);
    if (ev.isFinal) finish(t);
  });
  useSpeechRecognitionEvent('end', () => finish(''));
  useSpeechRecognitionEvent('error', (e) => {
    const ev = e as SpeechErrorEvent;
    setError(ev.message ?? ev.error ?? 'Speech recognition error');
    finish('');
  });

  const start = useCallback((): Promise<string> => {
    setError(null);
    setTranscript('');

    try {
      const perm = ExpoSpeechRecognitionModule.requestPermissionsAsync();
      void perm;
    } catch {
      /* ignore — start() will surface an error event if not allowed */
    }

    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setError('Speech recognition is not available on this device.');
        return Promise.resolve('');
      }
    } catch {
      setError('Speech recognition is not available on this device.');
      return Promise.resolve('');
    }

    setListening(true);
    return new Promise<string>((resolve) => {
      resolveRef.current = resolve;
      try {
        ExpoSpeechRecognitionModule.start({
          lang: locale,
          interimResults: true,
          continuous: false,
        });
        // Safety net: auto-stop if the recognizer never ends on its own.
        timeoutRef.current = setTimeout(() => {
          try {
            ExpoSpeechRecognitionModule.stop();
          } catch {
            /* ignore */
          }
        }, 6000);
      } catch (err) {
        setError(String(err));
        finish('');
      }
    });
  }, [locale, finish]);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const abort = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      /* ignore */
    }
  }, []);

  return { listening, transcript, error, available, start, stop, abort };
}
