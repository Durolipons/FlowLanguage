import type { TextStyle } from 'react-native';
import type { Direction, Script } from '@/content/schema';

/** True when the given direction renders right-to-left. */
export function isRtl(direction: Direction): boolean {
  return direction === 'rtl';
}

/** Derive text direction from a script (Arabic is RTL; Latin/CJK are LTR). */
export function directionForScript(script: Script): Direction {
  return script === 'arabic' ? 'rtl' : 'ltr';
}

/**
 * True when the string contains Arabic-script characters. Lets any component
 * render target text RTL without threading a direction prop through.
 */
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Text style overrides that render a string right-to-left. Apply to the
 * target-language Text element only (English glosses stay LTR).
 */
export function rtlTextStyle(rtl: boolean): TextStyle {
  return rtl ? { writingDirection: 'rtl', textAlign: 'right' } : {};
}