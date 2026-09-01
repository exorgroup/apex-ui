/**
 * Keystroke filtering for ApexInput and ApexTextarea.
 *
 * `keyFilter` takes a preset name or a RegExp / pattern string. The regex is
 * tested against the WHOLE candidate value, not the single character, so
 * position-sensitive rules (one decimal point, a leading minus) work.
 */
export type KeyFilterPreset = 'integer' | 'number' | 'money' | 'hex' | 'alphabetic' | 'alphanumeric';
export type KeyFilter = KeyFilterPreset | RegExp | string;

/** Whole-value patterns, permissive enough to allow partial input while typing. */
const PRESETS: Record<KeyFilterPreset, RegExp> = {
  integer: /^-?\d*$/,
  number: /^-?\d*([.,]\d*)?$/,
  money: /^-?\d*(\.\d{0,2})?$/,
  hex: /^[0-9a-fA-F]*$/,
  alphabetic: /^[a-zA-Z\s]*$/,
  alphanumeric: /^[a-zA-Z0-9\s]*$/,
};

/** Money allows thousands separators too; kept separate so typing stays fluid. */
const MONEY_LOOSE = /^-?[\d,]*(\.\d{0,2})?$/;

export function resolveKeyFilter(filter?: KeyFilter | null): RegExp | null {
  if (!filter) return null;
  if (filter instanceof RegExp) return filter;
  if (filter in PRESETS) return filter === 'money' ? MONEY_LOOSE : PRESETS[filter as KeyFilterPreset];
  try { return new RegExp(filter); } catch { return null; }
}

/** True when `value` is acceptable for the filter. Empty is always allowed. */
export function keyFilterAccepts(value: string, filter?: KeyFilter | null): boolean {
  const re = resolveKeyFilter(filter);
  if (!re) return true;
  if (value === '') return true;
  re.lastIndex = 0;
  return re.test(value);
}

/**
 * The value that would result from a keypress, so the filter can be tested
 * against the whole string rather than one character.
 */
export function candidateValue(el: HTMLInputElement | HTMLTextAreaElement, insert: string): string {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  return el.value.slice(0, start) + insert + el.value.slice(end);
}

const CONTROL_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown',
]);

/** keydown handler: blocks a keystroke that would make the value invalid. */
export function guardKeydown(e: KeyboardEvent, filter?: KeyFilter | null): void {
  if (!filter) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (CONTROL_KEYS.has(e.key) || e.key.length !== 1) return;
  const el = e.target as HTMLInputElement | HTMLTextAreaElement;
  if (!keyFilterAccepts(candidateValue(el, e.key), filter)) e.preventDefault();
}

/** paste/drop handler: strips characters the filter rejects. */
export function guardPaste(e: ClipboardEvent, filter?: KeyFilter | null): string | null {
  if (!filter) return null;
  const el = e.target as HTMLInputElement | HTMLTextAreaElement;
  const text = e.clipboardData?.getData('text') ?? '';
  if (!text) return null;
  e.preventDefault();
  // keep the longest acceptable prefix, character by character
  let out = '';
  for (const ch of text) {
    if (keyFilterAccepts(candidateValue(el, out + ch), filter)) out += ch;
  }
  return candidateValue(el, out);
}
