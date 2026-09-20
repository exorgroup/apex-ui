/**
 * Keystroke filtering for ApexInput and ApexTextarea.
 *
 * `keyFilter` takes a preset name or a RegExp / pattern string. The regex is
 * tested against the WHOLE candidate value, not the single character, so
 * position-sensitive rules (one decimal point, a leading minus) work.
 */
export type KeyFilterPreset = 'integer' | 'number' | 'money' | 'hex' | 'alphabetic' | 'alphanumeric';
export type KeyFilter = KeyFilterPreset | RegExp | string;
export declare function resolveKeyFilter(filter?: KeyFilter | null): RegExp | null;
/** True when `value` is acceptable for the filter. Empty is always allowed. */
export declare function keyFilterAccepts(value: string, filter?: KeyFilter | null): boolean;
/**
 * The value that would result from a keypress, so the filter can be tested
 * against the whole string rather than one character.
 */
export declare function candidateValue(el: HTMLInputElement | HTMLTextAreaElement, insert: string): string;
/** keydown handler: blocks a keystroke that would make the value invalid. */
export declare function guardKeydown(e: KeyboardEvent, filter?: KeyFilter | null): void;
/** paste/drop handler: strips characters the filter rejects. */
export declare function guardPaste(e: ClipboardEvent, filter?: KeyFilter | null): string | null;
