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
export declare const KEYPAD_OPERATORS: readonly KeyPadOperator[];
/** How an operator is shown on its key and in the display. */
export declare const OPERATOR_GLYPH: Record<KeyPadOperator, string>;
/** The words a screen reader says for each operator. */
export declare const OPERATOR_NAME: Record<KeyPadOperator, string>;
/** True when the entry holds an operator after its first character (a leading `-` is a sign). */
export declare function hasOperator(entry: string): boolean;
/** The number being typed: everything after the last operator. */
export declare function currentNumber(entry: string): string;
/** Digits in the entry, the measure `max-length` counts. */
export declare const digitCount: (entry: string) => number;
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
export declare function press(entry: string, key: string, rules: KeyPadRules): string;
/**
 * The entry's value, as the string the pad emits — or null when it cannot be worked out.
 * Without an operator the entry is returned as typed (a PIN keeps its leading zeros).
 */
export declare function evaluate(entry: string, rules: KeyPadRules): string | null;
/** The entry as the display shows it: operators as glyphs. */
export declare function displayText(entry: string): string;
/**
 * The ten digits in a new order, from the browser's secure random source (Fisher–Yates).
 * `random` is injectable for tests; it answers a whole number in [0, n).
 */
export declare function shuffledDigits(random?: (n: number) => number): string[];
