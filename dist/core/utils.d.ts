import type { ApexOption, ApexOptionsInput } from '../types';
/** Accepts ['a','b'] or [{value,label,help,icon,disabled}] and returns the object form. */
export declare function normaliseOptions<V = unknown>(input?: ApexOptionsInput<V>): ApexOption<V>[];
export declare const slugify: (s: string) => string;
export declare function applyTransform(v: string, t?: 'lower' | 'upper' | 'slug' | 'trim'): string;
export declare const TONE_ICON: Record<string, string>;
export declare const APEX_FIELD_KEYS: readonly ["label", "labelIcon", "labelPlacement", "labelWidth", "help", "error", "warning", "success", "tone", "rules", "context", "required", "disabled", "readonly", "size", "statusIcon", "id", "name", "background", "borderColor", "borderWidth", "radius", "hoverBorderColor", "focusBorderColor", "focusRing", "disabledBackground", "textColor", "placeholderColor", "controlHeight", "fontSize", "paddingInline", "iconSize", "iconColor", "affixColor", "buttonColor", "labelColor", "labelFontSize", "messageColor", "messageFontSize", "requiredColor", "popoverBackground", "popoverBorderColor", "optionHoverBackground", "ui"];
/** Picks only the ApexField props out of a control's props, so nothing leaks onto the DOM. */
export declare function pickFieldProps<T extends Record<string, unknown>>(props: T): Record<string, unknown>;
