/** @exorgroup/apex-ui — shared types */

export type ApexSize = 'sm' | 'md' | 'lg';
export type ApexTone = 'default' | 'danger' | 'warning' | 'success';
/**
 * 'float-over' | 'float-on' | 'float-in' animate the label out of the field on
 * focus or fill — above it, onto its border, or up inside the box.
 * 'floating' is kept as an alias of 'float-on'.
 */
export type ApexLabelPlacement =
  | 'top' | 'before' | 'after' | 'under'
  | 'float-over' | 'float-on' | 'float-in' | 'floating'
  | 'inline' | 'hidden';

export interface ApexOption<V = unknown> {
  value: V;
  label: string;
  help?: string;
  icon?: string;
  /** Thumbnail URL — flags, avatars, product shots. Rendered before the label. */
  image?: string;
  disabled?: boolean;
}
/** Options may be given as bare strings; normaliseOptions() widens them. */
export type ApexOptionsInput<V = unknown> = Array<ApexOption<V> | string | number>;

/**
 * Condition — the same grammar apex-form uses, evaluated against a scope.
 * For a standalone control the scope is `{ value, ...context }` and `field`
 * defaults to `'value'`, so `{ eq: 3 }` means "this control's value is 3".
 */
export interface ApexCondition {
  field?: string;
  eq?: unknown; ne?: unknown;
  gt?: number | string; gte?: number | string; lt?: number | string; lte?: number | string;
  in?: unknown[]; nin?: unknown[];
  includes?: unknown;
  truthy?: boolean; falsy?: boolean; empty?: boolean;
  matches?: string;
  all?: ApexCondition[]; any?: ApexCondition[]; not?: ApexCondition;
  /** long form */
  op?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'includes' | 'truthy' | 'falsy' | 'empty' | 'notEmpty' | 'matches';
  value?: unknown;
}

/** Value-driven conditional formatting. Evaluated on every change, top to bottom; last match wins. */
export interface ApexRule {
  when: ApexCondition;
  tone?: ApexTone;
  message?: string;
  /** Extra class applied to the field root when the rule matches. */
  class?: string;
}

/** A trailing affordance rendered inside the control. */
export interface ApexTrailingAction {
  icon: string;
  label: string;
  disabled?: boolean;
}

/** Props every control accepts, forwarded to ApexField. */
/**
 * Your own classes, per part of a field.
 *
 * Dark mode is not a key here on purpose: the library already puts `.dark` on
 * the root, so one class plus `.dark .my-class { ... }` in your own stylesheet
 * covers both themes and keeps the two definitions next to each other.
 */
export interface ApexFieldClasses {
  /** The .apex-field root — wraps label, control and message. */
  root?: string;
  label?: string;
  /** The wrapper around the control and its message line. */
  body?: string;
  message?: string;
  /** The control box, .apex-ctl. */
  control?: string;
  /** The <input> or equivalent inside the box. */
  input?: string;
  /** Leading and trailing icons. */
  icon?: string;
  /** Static prefix and suffix text. */
  affix?: string;
  /** Clear, reveal, trailing action and dropdown buttons. */
  button?: string;
  /** The typeahead overlay, where the control has one. */
  popover?: string;
  /** A row inside that overlay. */
  option?: string;
}

export interface ApexFieldProps {
  label?: string;
  labelIcon?: string;
  labelPlacement?: ApexLabelPlacement;
  labelWidth?: string;
  help?: string;
  error?: string | string[] | null;
  warning?: string | null;
  success?: string | null;
  tone?: ApexTone;
  rules?: ApexRule[];
  /** Extra values `rules` conditions may reference by name. */
  context?: Record<string, unknown>;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  size?: ApexSize;
  statusIcon?: boolean;
  id?: string;
  name?: string;

  /* ------------------------------------------------------------------ *
   * Appearance. Every one of these sets a CSS variable on the field root,
   * so anything a prop can do a stylesheet can also do — see the variable
   * table on the ApexField page. Props are the quick path; classes are the
   * one that survives states and media queries.
   * ------------------------------------------------------------------ */

  /** The control box. */
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  radius?: string;
  hoverBorderColor?: string;
  focusBorderColor?: string;
  /** The whole focus ring shorthand, e.g. `color-mix(...)` or a flat colour. */
  focusRing?: string;
  disabledBackground?: string;

  /** The value and its placeholder. */
  textColor?: string;
  placeholderColor?: string;

  /** Sizing, beyond the three `size` presets. Any CSS length. */
  controlHeight?: string;
  fontSize?: string;
  paddingInline?: string;
  iconSize?: string;

  /** Icons, affixes and the trailing buttons. */
  iconColor?: string;
  affixColor?: string;
  buttonColor?: string;

  /** Label, message line and the required asterisk. */
  labelColor?: string;
  labelFontSize?: string;
  messageColor?: string;
  messageFontSize?: string;
  requiredColor?: string;

  /** The typeahead overlay, where the control has one. */
  popoverBackground?: string;
  popoverBorderColor?: string;
  optionHoverBackground?: string;

  /** Your own class on any part. See ApexFieldClasses. */
  ui?: ApexFieldClasses;
}

/** Resolved display state, provided to controls by ApexField. */
export interface ApexFieldState {
  id: string;
  describedBy: string | undefined;
  tone: ApexTone;
  invalid: boolean;
  message: string | undefined;
  size: ApexSize;
  disabled: boolean;
}

/** Validation adapter contract — wire Zod, Laravel Precognition, or anything else. */
export interface ApexValidationAdapter {
  /** Field-level check. Return an error string, or null/undefined when valid. */
  validateField?(name: string, value: unknown, all?: Record<string, unknown>): string | null | undefined | Promise<string | null | undefined>;
  /** Whole-payload check. Return a map of field name → first error message. */
  validate?(values: Record<string, unknown>): Record<string, string> | Promise<Record<string, string>>;
  /** Called on blur so server-backed adapters can debounce a round trip. */
  touch?(name: string): void;
}

export interface ApexUiOptions {
  /** Component name prefix. Default 'Apex'. */
  prefix?: string;
  /** Default size for every control. Default 'md'. */
  size?: ApexSize;
  /** Default label placement. Default 'top'. */
  labelPlacement?: ApexLabelPlacement;
  /** Fallback strings, used when vue-i18n is not installed. */
  messages?: Partial<ApexStrings>;
  /** Global validation adapter. */
  adapter?: ApexValidationAdapter;
  /** Icon resolver — swap Material Symbols for another set. */
  iconResolver?: (name: string) => string;
}

export interface ApexStrings {
  'apexui.select': string;
  'apexui.clear': string;
  'apexui.remove': string;
  'apexui.search': string;
  'apexui.noResults': string;
  'apexui.showPassword': string;
  'apexui.hidePassword': string;
  'apexui.loading': string;
  'apexui.required': string;
  'apexui.optional': string;
  'apexui.increment': string;
  'apexui.decrement': string;
  'apexui.errorSummaryTitle': string;
}
