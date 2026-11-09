/**
 * ApexKeyPad's arithmetic and entry rules — no DOM, so they are tested on their own.
 *
 * An entry is a string of digits, `.` and the operators `+ - * /` (shown as + − × ÷). It is
 * worked out by a small parser in STANDARD order (× and ÷ before + and −): `2+3*4` = 14. Never
 * `eval` — an entry is user input.
 *
 * A sum that cannot be worked out — division by zero, a result with more decimals than allowed or
 * longer than the pad's length, an entry that ends on an operator — answers `null`; the pad shows
 * "Can't work that out" and emits nothing (TBX TL5 D16, D18).
 */

export type KeyPadOperator = '+' | '-' | '*' | '/';

/** A key the screen adds to the pad; `function` is emitted with its `id` and the result. */
export interface KeyPadFunctionKey {
  id: string;
  label: string;
  disabled?: boolean;
}

export const KEYPAD_OPERATORS: readonly KeyPadOperator[] = ['/', '*', '-', '+'];

/** How an operator is shown on its key and in the display. */
export const OPERATOR_GLYPH: Record<KeyPadOperator, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };

/** The words a screen reader says for each operator. */
export const OPERATOR_NAME: Record<KeyPadOperator, string> = { '+': 'Plus', '-': 'Minus', '*': 'Times', '/': 'Divide by' };

const isOperator = (c: string): c is KeyPadOperator => c === '+' || c === '-' || c === '*' || c === '/';

/** True when the entry holds an operator after its first character (a leading `-` is a sign). */
export function hasOperator(entry: string): boolean {
  return [...entry].some((c, i) => isOperator(c) && i > 0);
}

/** The number being typed: everything after the last operator. */
export function currentNumber(entry: string): string {
  for (let i = entry.length - 1; i > 0; i--) if (isOperator(entry[i])) return entry.slice(i + 1);
  return entry.startsWith('-') ? entry.slice(1) : entry;
}

/** Digits in the entry, the measure `max-length` counts. */
export const digitCount = (entry: string): number => entry.replace(/\D/g, '').length;

export interface KeyPadRules {
  /** Places a number may carry after `.`; 0 refuses the dot. */
  decimals: number;
  /** Digits the entry may hold; undefined = no limit. */
  maxLength?: number;
  /** Keep leading zeros — a code (a PIN) rather than a number. */
  code?: boolean;
}

/**
 * The entry after one key, or the same string when the key is refused.
 * Keys: `0`–`9`, `00`, `.`, an operator, `del`, `clear`.
 */
export function press(entry: string, key: string, rules: KeyPadRules): string {
  if (key === 'clear') return '';
  if (key === 'del') return entry.slice(0, -1);

  const num = currentNumber(entry);
  if (isOperator(key)) {
    if (entry === '') return key === '-' ? '-' : entry;      // a leading minus is a sign
    if (entry === '-') return entry;
    const last = entry[entry.length - 1];
    if (isOperator(last)) return entry.slice(0, -1) + key; // a second operator replaces the first
    if (last === '.') return entry;
    return entry + key;
  }
  if (key === '.') {
    if (rules.decimals <= 0 || num.includes('.')) return entry;
    return entry + (num === '' ? '0.' : '.');
  }
  if (key === '00' || /^\d$/.test(key)) {
    const add = key.length;
    if (rules.maxLength !== undefined && digitCount(entry) + add > rules.maxLength) return entry;
    const dot = num.indexOf('.');
    if (dot >= 0 && num.length - dot - 1 + add > rules.decimals) return entry;
    if (key === '00' && !rules.code && (num === '' || num === '0')) return press(entry, '0', rules); // "00" on nothing is one zero
    if (num === '0' && !rules.code) return entry.slice(0, -1) + key;      // no leading zeros: "0" then "5" is "5"
    return entry + key;
  }
  return entry;
}

/**
 * The entry's value, as the string the pad emits — or null when it cannot be worked out.
 * Without an operator the entry is returned as typed (a PIN keeps its leading zeros).
 */
export function evaluate(entry: string, rules: KeyPadRules): string | null {
  if (entry === '' || entry === '-') return null;
  if (!hasOperator(entry)) return /^-?\d*\.?\d*$/.test(entry) && /\d/.test(entry) ? entry.replace(/\.$/, '') : null;

  const tokens: (number | KeyPadOperator)[] = [];
  let i = 0;
  while (i < entry.length) {
    const c = entry[i];
    if (isOperator(c) && !(c === '-' && i === 0)) { tokens.push(c); i++; continue; }
    let j = i + (c === '-' ? 1 : 0);
    while (j < entry.length && /[\d.]/.test(entry[j])) j++;
    const text = entry.slice(i, j);
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(text)) return null;
    tokens.push(Number(text));
    i = j;
  }
  if (typeof tokens[tokens.length - 1] !== 'number') return null;

  // Work in integers of 10^-scale, so 0.1 + 0.2 is 0.3 and never 0.30000000000000004.
  const scale = Math.max(0, ...tokens.filter((t): t is number => typeof t === 'number').map(decimalsOf));

  // × and ÷ first, left to right; then + and −.
  const sums: number[] = [tokens[0] as number];
  const signs: ('+' | '-')[] = [];
  for (let k = 1; k < tokens.length; k += 2) {
    const op = tokens[k] as KeyPadOperator, n = tokens[k + 1] as number;
    if (op === '*') sums[sums.length - 1] = sums[sums.length - 1] * n;
    else if (op === '/') sums[sums.length - 1] = sums[sums.length - 1] / n; // ÷ 0 → ±Infinity / NaN, refused below
    else { signs.push(op); sums.push(n); }
  }
  let result = round(sums[0], scale + 6);
  sums.slice(1).forEach((n, k) => { result = round(signs[k] === '+' ? result + n : result - n, scale + 6); });

  if (!Number.isFinite(result)) return null;
  const fixed = round(result, rules.decimals);
  if (Math.abs(fixed - result) > 1e-9) return null;          // more decimals than allowed: refuse, never round money
  const text = trim(fixed.toFixed(rules.decimals));
  if (rules.maxLength !== undefined && digitCount(text) > rules.maxLength) return null;
  return text === '-0' ? '0' : text;
}

/** The entry as the display shows it: operators as glyphs. */
export function displayText(entry: string): string {
  return [...entry].map((c, i) => (isOperator(c) && i > 0 ? ` ${OPERATOR_GLYPH[c]} ` : c === '-' ? '−' : c)).join('');
}

/**
 * The ten digits in a new order, from the browser's secure random source (Fisher–Yates).
 * `random` is injectable for tests; it answers a whole number in [0, n).
 */
export function shuffledDigits(random: (n: number) => number = secureRandom): string[] {
  const d = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = d.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function secureRandom(n: number): number {
  const c = globalThis.crypto;
  if (!c?.getRandomValues) return Math.floor(Math.random() * n);
  // Rejection sampling, so every index is equally likely.
  const limit = Math.floor(0x100000000 / n) * n;
  const buf = new Uint32Array(1);
  do c.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % n;
}

function decimalsOf(n: number): number {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
}

function round(n: number, places: number): number {
  const f = 10 ** places;
  return Math.sign(n) * Math.round(Math.abs(n) * f + 1e-9) / f;
}

function trim(s: string): string {
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}
