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

  /* Parts only some controls render. Ignored by the controls that do not. */
  /** ApexOtp — one digit box. */
  box?: string;
  /** ApexStepper and ApexSelect — the displayed value. */
  value?: string;
  /** ApexStepper — the unit tag. */
  unit?: string;
  /** ApexSelect — the tick beside the selected row. */
  tick?: string;
  /** ApexSelect and ApexMultiselect — the search box in the overlay. */
  filter?: string;
  /** ApexMultiselect — the select-all row. */
  selectAll?: string;
  /** ApexMultiselect — the checkbox on a row. */
  checkbox?: string;
  /** ApexTextarea — the character counter. */
  counter?: string;
  /** ApexPassword — the meter and checklist panel. */
  panel?: string;
  /** ApexPassword — the four-band strength bar. */
  meter?: string;
  /** ApexPassword — the strength label under the bar. */
  strength?: string;
  /** ApexPassword — the requirements list. */
  rules?: string;
  /** ApexTags — one tag chip. */
  chip?: string;
  /** ApexStepper — the decrement and increment buttons. */
  decrement?: string;
  increment?: string;
  /** ApexKnob — the unfilled rail, the filled arc, the centre text. */
  range?: string;
  valueArc?: string;
  text?: string;
  /** ApexSlider — the rail, the filled portion, a handle, the value bubble. */
  track?: string;
  fill?: string;
  handle?: string;
  tooltip?: string;
  /** ApexDatePicker — the calendar popover and the row above the grid. The
      prev/next buttons are .apex-ctl__btn inside `nav`, so reach them from
      there rather than through `button`, which is the field's own. */
  calendar?: string;
  nav?: string;
  title?: string;
  /** The month columns — `months` is the row, `month` one column, `monthLabel`
      the caption that appears once numberOfMonths is above one. */
  months?: string;
  month?: string;
  monthLabel?: string;
  /** The seven-column grid, a weekday heading, one day. */
  grid?: string;
  weekday?: string;
  day?: string;
  /** The month and year grids behind the title. */
  pick?: string;
  /** The time row, one hour/minute/second spinner, the AM-PM toggle. */
  time?: string;
  spin?: string;
  meridiem?: string;
  /** The Today / Clear bar. */
  bar?: string;
  /** ApexColorPicker — the popover, the saturation/value square and the
      marker you drag across it. */
  picker?: string;
  area?: string;
  thumb?: string;
  /** The hue and alpha tracks: `sliders` is the pair, `slider` each one. */
  sliders?: string;
  slider?: string;
  /** The hex/rgb/hsl/hsb switcher, and one segment of it. */
  formats?: string;
  format?: string;
  /** The numeric channel boxes, and one box with its caption. */
  channels?: string;
  channel?: string;
  /** The row holding the serialised colour, and the preset row. */
  output?: string;
  presets?: string;
  /** Every swatch — the trigger, the one beside the output, and each preset.
      They are one part, so scope by ancestor to reach a single kind. */
  swatch?: string;
  /** ApexSelect and ApexMultiselect — the text shown when nothing is chosen,
      the open/close arrow, and the no-results message. */
  placeholder?: string;
  chevron?: string;
  empty?: string;
  /** An option's thumbnail, in the box and in the overlay row alike, and the
      secondary line under a row's label. */
  thumbnail?: string;
  optionHelp?: string;
  /** The "Add new" row at the foot of the overlay. */
  addNew?: string;
}

/**
 * Appearance shared by every control built on .apex-btn — ApexButton,
 * ApexSplitButton, ApexSpeedDial's trigger and ApexButtonGroup.
 *
 * The four colours are the whole severity system, not a subset of it. A
 * severity is nothing more than these four values, and all four variants
 * (solid, outlined, text, link) are written against them — so setting them is
 * how you define a severity the library does not ship, and it works across
 * every variant without further help.
 */
export interface ApexButtonAppearance {
  /** Base colour: solid background, outlined and text foreground. */
  color?: string;
  /** Hover colour. */
  hoverColor?: string;
  /** Text colour on a solid button. */
  labelColor?: string;
  /** The soft tint behind an outlined or text button on hover, and the focus ring. */
  tintColor?: string;

  /** Sizing, beyond the three `size` presets. Any CSS length. */
  height?: string;
  fontSize?: string;
  paddingInline?: string;
  radius?: string;

  /** Your own class on any part. */
  ui?: ApexButtonClasses;
}

/** Your own classes, per part of a button-family control. */
export interface ApexButtonClasses {
  /** The button element itself, or the root of a composite. */
  root?: string;
  /** ApexButton — the label span and the corner badge. */
  label?: string;
  badge?: string;
  /** ApexSplitButton — the default action and the chevron half. */
  action?: string;
  toggle?: string;
  /** ApexSpeedDial — the trigger, the fan, one action, the page mask, a tooltip. */
  trigger?: string;
  items?: string;
  item?: string;
  mask?: string;
  tooltip?: string;
  /** ApexButtonGroup — the frame, its legend and the help line. */
  frame?: string;
  legend?: string;
  help?: string;
  /** ApexSplitButton — the overlay and its rows, headers, hints and rules. */
  menu?: string;
  menuItem?: string;
  menuHeader?: string;
  menuHint?: string;
  menuSeparator?: string;
  /** ApexSpeedDial — one action button, inside its positioner. */
  action?: string;
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
  /**
   * Decides whether a control may offer its "Add new" row, given the control's
   * `resource`. Register it once and every chooser in the app is gated the same
   * way, instead of each call site repeating the check.
   *
   * Nothing here is tied to any particular authorisation library: return a
   * boolean however you like. With apex-autentica that is
   * `canCreate: (r) => can(permissions, r, 'create')`; with a plain array it is
   * `canCreate: (r) => allowed.includes(r)`.
   *
   * This is UX only. The endpoint that creates the record still has to
   * authorise the request itself.
   */
  canCreate?: (resource: string) => boolean;
}

export interface ApexStrings {
  'apexui.select': string;
  'apexui.clear': string;
  'apexui.remove': string;
  'apexui.search': string;
  'apexui.noResults': string;
  'apexui.addNew': string;
  'apexui.showPassword': string;
  'apexui.hidePassword': string;
  'apexui.loading': string;
  'apexui.required': string;
  'apexui.optional': string;
  'apexui.increment': string;
  'apexui.decrement': string;
  'apexui.errorSummaryTitle': string;
}
