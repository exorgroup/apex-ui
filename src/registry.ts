/**
 * Docs registry for the five controls under review.
 *
 * Entries are copied verbatim from the gallery's own registry at
 * /web/apex-ui-docs.js — the shape and the demo data are the author's, not
 * re-derived. Hand-writing them from the components' props produced a page that
 * looked plausible but rendered different demos, which is worse than useless
 * when the point is comparing the two side by side.
 *
 * Only ApexInput, ApexTextarea, ApexPassword, ApexOtp and ApexTags are here.
 * The gallery carries 84; the rest come across as each is reviewed.
 */

/** One editable control in the playground rail. */
export interface DocControl {
  key: string;
  type: 'text' | 'number' | 'bool' | 'select';
  options?: string[];
}

export interface DocEntry {
  id: string;
  name: string;
  group: string;
  blurb: string;
  model?: unknown;
  /** Props the demo starts with, and the baseline every section renders from. */
  base?: Record<string, unknown>;
  controls: DocControl[];
  /** [prop, type, default, notes] */
  props: string[][];
  events: string[][];
  slots?: string[][];
}

/**
 * All the placements the type union allows. The earlier list had seven and
 * collapsed the three float variants into one 'floating', which under-reported
 * what ApexField can do — see ApexLabelPlacement in apex-ui/src/types.ts.
 */
export const LABEL_PLACEMENTS = [
  'top', 'before', 'after', 'under',
  'float-over', 'float-on', 'float-in',
  'inline', 'hidden',
] as const;

export const SIZES = ['sm', 'md', 'lg'] as const;

export const TONE_CASES = [
  { label: 'Default', bind: {} },
  { label: 'With help', bind: { help: 'Shown when nothing is wrong.' } },
  { label: 'Error', bind: { error: 'This value is already taken.' } },
  { label: 'Warning', bind: { warning: 'Unusual, but allowed.' } },
  { label: 'Success', bind: { success: 'Checked and available.' } },
  { label: 'Required, empty', bind: { required: true, error: 'This field is required.' }, empty: true },
];

export const STATE_CASES = [
  { label: 'disabled', bind: { disabled: true } },
  { label: 'readonly', bind: { readonly: true } },
  { label: 'statusIcon = false', bind: { statusIcon: false, error: 'Something is wrong.' } },
];

export const ENTRIES: DocEntry[] = [
  {
    id: 'input', name: 'ApexInput', group: 'Text',
    blurb: 'Text, email, tel, url, search, password and slug in one control. Affixes, both icon slots, a clickable trailing action, clear button, loading state and password reveal.',
    model: 'ada.lovelace@exorgroup.com',
    base: { label: 'Email address', placeholder: 'name@company.com', type: 'email', leadingIcon: 'mail' },
    controls: [
      { key: 'type', type: 'select', options: ['text', 'email', 'tel', 'url', 'search', 'password', 'slug'] },
      { key: 'label', type: 'text' },
      { key: 'placeholder', type: 'text' },
      { key: 'help', type: 'text' },
      { key: 'prefix', type: 'text' }, { key: 'suffix', type: 'text' },
      { key: 'leadingIcon', type: 'text' }, { key: 'trailingIcon', type: 'text' },
      { key: 'keyFilter', type: 'select', options: ['', 'integer', 'number', 'money', 'hex', 'alphabetic', 'alphanumeric'] },
      { key: 'clearable', type: 'bool' }, { key: 'loading', type: 'bool' }, { key: 'mono', type: 'bool' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' }, { key: 'readonly', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string | number', '—', 'v-model'],
      ['type', "'text' | 'email' | 'tel' | 'url' | 'search' | 'password' | 'slug'", "'text'", 'slug applies the slug transform automatically'],
      ['prefix / suffix', 'string', '—', 'Static affix text inside the box'],
      ['leadingIcon / trailingIcon', 'string', '—', 'Material Symbols name'],
      ['trailingAction', '{ icon, label, disabled? }', '—', 'Clickable trailing button; emits @action'],
      ['clearable', 'boolean', 'false', 'Shows × when filled; emits @clear'],
      ['loading', 'boolean', 'false', 'Spinner in the trailing slot'],
      ['transform', "'lower' | 'upper' | 'slug' | 'trim'", '—', 'Applied live as the user types'],
      ['keyFilter', "'integer' | 'number' | 'money' | 'hex' | 'alphabetic' | 'alphanumeric' | RegExp | string", '—', 'Blocks rejected keystrokes and strips paste'],
      ['suggestions', 'ApexOption[] | string[]', '—', 'Presence turns the control into a typeahead; you own the list'],
      ['minLength', 'number', '1', 'Characters before @complete fires'],
      ['delay', 'number', '300', 'Debounce in ms'],
      ['completeOnFocus', 'boolean', 'false', 'Query again when the field gains focus'],
      ['dropdown', 'boolean', 'false', 'Chevron button that queries with an empty string'],
      ['forceSelection', 'boolean', 'false', 'Clear on blur unless the value matches a suggestion'],
      ['emptyMessage', 'string', "'No matches'", 'Shown when a query returns nothing'],
      ['mono', 'boolean', 'false', 'Monospace value — tokens, IDs, keys'],
    ],
    events: [
      ['update:modelValue', 'string'], ['change', 'string'], ['focus / blur', '—'],
      ['clear', '—'], ['action', '—'],
      ['complete', '{ query: string } — fetch and assign suggestions'], ['item-select', 'ApexOption'],
    ],
    slots: [
      ['leading', 'Replaces the leading icon'],
      ['trailing', 'Appended after the built-in trailing affordances'],
      ['option', 'Custom suggestion row; receives { option }'],
    ],
  },
  {
    id: 'textarea', name: 'ApexTextarea', group: 'Text',
    blurb: 'Multi-line text with an optional character counter.',
    model: 'Lobby screen, north entrance. Rotates every 30 seconds during business hours.',
    base: { label: 'Description', rows: 4, placeholder: 'What is this for?', counter: true, maxlength: 240 },
    controls: [
      { key: 'label', type: 'text' }, { key: 'rows', type: 'number' },
      { key: 'counter', type: 'bool' }, { key: 'maxlength', type: 'number' },
      { key: 'keyFilter', type: 'select', options: ['', 'integer', 'number', 'money', 'hex', 'alphabetic', 'alphanumeric'] },
      { key: 'mono', type: 'bool' }, { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string', '—', 'v-model'],
      ['rows', 'number', '4', 'Initial height'],
      ['keyFilter', 'preset | RegExp | string', '—', 'Restrict keystrokes; see ApexInput'],
      ['counter', 'boolean', 'false', 'Character count under the box'],
      ['maxlength', 'number', '—', 'Hard cap, shown in the counter'],
      ['autogrow', 'boolean', 'false', 'Grow to fit content'],
    ],
    events: [['update:modelValue', 'string'], ['focus / blur', '—']],
  },
  {
    id: 'password', name: 'ApexPassword', group: 'Text',
    blurb: 'ApexInput for password entry, with a mask toggle, a strength meter and a live requirements checklist — under the field, or in a popover that opens on focus.',
    model: 'Apex-2026',
    base: { label: 'New password', placeholder: 'Choose a strong password', leadingIcon: 'lock', meter: true, checklist: true },
    controls: [
      { key: 'label', type: 'text' }, { key: 'placeholder', type: 'text' },
      { key: 'leadingIcon', type: 'text' }, { key: 'toggleMask', type: 'bool' },
      { key: 'meter', type: 'bool' }, { key: 'checklist', type: 'bool' },
      { key: 'popover', type: 'bool' }, { key: 'minLength', type: 'number' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string', '—', 'v-model'],
      ['toggleMask', 'boolean', 'true', 'Eye button to show or hide the value'],
      ['meter', 'boolean', 'true', 'Four-band strength bar with a label'],
      ['checklist', 'boolean', 'true', 'Requirements list, ticked live as you type'],
      ['popover', 'boolean', 'false', 'Float the meter and checklist while the field has focus'],
      ['requirements', 'PasswordRule[]', '5 defaults', '{ label, test: RegExp | (v) => boolean, advisory? } — not to be confused with the shared `rules` formatting prop'],
      ['minLength', 'number', '8', 'Used by the default length rule'],
      ['strengthLabels', '[string, string, string, string]', "'Too weak' … 'Strong'", 'Band labels'],
    ],
    events: [['update:modelValue', 'string'], ['strength', '{ score: 0-4, label }'], ['focus / blur', '—']],
  },
  {
    id: 'otp', name: 'ApexOtp', group: 'Text',
    blurb: 'One-time-password entry. Controlled with v-model as one string; paste fills every box, arrows and backspace move between them.',
    // Deliberately partial, as the gallery has it: shows filled and empty boxes together.
    model: '482',
    base: { label: 'Verification code', length: 6, integerOnly: true, help: 'Enter the 6-digit code sent to your email.' },
    controls: [
      { key: 'label', type: 'text' }, { key: 'length', type: 'number' },
      { key: 'mask', type: 'bool' }, { key: 'integerOnly', type: 'bool' },
      { key: 'variant', type: 'select', options: ['outlined', 'filled'] },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string', '—', 'v-model — the whole code as one string'],
      ['length', 'number', '6', 'Number of boxes'],
      ['mask', 'boolean', 'false', 'Hide the characters'],
      ['integerOnly', 'boolean', 'false', 'Digits only, numeric keypad on mobile'],
      ['variant', "'outlined' | 'filled'", "'outlined'", 'Filled carries higher visual emphasis'],
    ],
    events: [['update:modelValue', 'string'], ['complete', 'string — every box filled'], ['focus / blur', '—']],
  },
  {
    id: 'tags', name: 'ApexTags', group: 'Text',
    blurb: 'Multiple tag entry. Enter adds, Backspace removes the last one, a delimiter adds as you type, and typeahead offers suggestions from a list.',
    model: ['lobby', 'north-wing'],
    base: {
      label: 'Tags', placeholder: 'Add a tag', delimiter: ',', clearable: true,
      options: ['lobby', 'north-wing', 'south-wing', 'reception', 'canteen', 'meeting-room', 'totem'],
      help: 'Enter or comma to add. Backspace removes the last.',
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'placeholder', type: 'text' },
      { key: 'delimiter', type: 'text' }, { key: 'allowDuplicate', type: 'bool' },
      { key: 'max', type: 'number' }, { key: 'restrict', type: 'bool' },
      { key: 'clearable', type: 'bool' }, { key: 'addOnBlur', type: 'bool' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string[]', '[]', 'v-model'],
      ['delimiter', 'string', '—', "Extra commit key, e.g. ','. Enter always works"],
      ['allowDuplicate', 'boolean', 'false', 'Let the same tag be added twice'],
      ['max', 'number', '—', 'Cap the number of tags; shows a n/max counter'],
      ['options', 'ApexOption[] | string[]', '—', 'Presence turns typeahead on'],
      ['restrict', 'boolean', 'false', 'Only allow values from options'],
      ['addOnBlur', 'boolean', 'true', 'Commit whatever is typed when the field loses focus'],
      ['trim', 'boolean', 'true', 'Trim whitespace and drop empty entries'],
    ],
    events: [['update:modelValue', 'string[]'], ['add', 'string'], ['remove', 'string'], ['focus / blur', '—']],
  },
];
