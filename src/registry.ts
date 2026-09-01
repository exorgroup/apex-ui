/**
 * Docs registry. The static review mirror at /web/apex-ui-docs.js carries the same data
 * in plain JS; keep the two in step when a control's props change.
 */
export interface DocEntry {
  id: string;
  name: string;
  group: string;
  blurb: string;
  model?: unknown;
  base?: Record<string, unknown>;
  props: string[][];
  events: string[][];
  noField?: boolean;
}

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'editor', label: 'Content Editor' },
  { value: 'scheduler', label: 'Scheduler' },
  { value: 'viewer', label: 'Viewer' },
];

export const LABEL_PLACEMENTS = ['top', 'before', 'after', 'under', 'floating', 'inline', 'hidden'] as const;
export const SIZES = ['sm', 'md', 'lg'] as const;

export const TONE_CASES = [
  { label: 'Default', bind: {} },
  { label: 'With help', bind: { help: 'Shown when nothing is wrong.' } },
  { label: 'Error', bind: { error: 'This value is already taken.' } },
  { label: 'Warning', bind: { warning: 'Unusual, but allowed.' } },
  { label: 'Success', bind: { success: 'Checked and available.' } },
  { label: 'Required, empty', bind: { required: true, error: 'This field is required.' }, empty: true },
];

export const ENTRIES: DocEntry[] = [
  {
    id: 'input', name: 'ApexInput', group: 'Text',
    blurb: 'Text, email, tel, url, search, password and slug in one control.',
    model: 'ada.lovelace@exorgroup.com',
    base: { label: 'Email address', type: 'email', leadingIcon: 'mail', placeholder: 'name@company.com' },
    props: [['modelValue', 'string | number'], ['type', "'text' | 'email' | … | 'slug'"], ['prefix / suffix', 'string'], ['clearable', 'boolean'], ['loading', 'boolean']],
    events: [['update:modelValue', 'string'], ['clear', '—'], ['action', '—']],
  },
  {
    id: 'textarea', name: 'ApexTextarea', group: 'Text',
    blurb: 'Multi-line text with an optional character counter.',
    model: 'Lobby screen, north entrance.',
    base: { label: 'Description', rows: 4, counter: true, maxlength: 240 },
    props: [['modelValue', 'string'], ['rows', 'number'], ['counter', 'boolean']],
    events: [['update:modelValue', 'string']],
  },
  {
    id: 'password', name: 'ApexPassword', group: 'Text',
    blurb: 'Password with a reveal toggle, strength meter and a live requirements checklist.',
    model: 'Apex-2026',
    base: { label: 'New password', placeholder: 'Choose a strong password', leadingIcon: 'lock', meter: true, checklist: true },
    props: [
      ['modelValue', 'string | null'], ['toggleMask', 'boolean'], ['meter', 'boolean'],
      ['checklist', 'boolean'], ['popover', 'boolean'], ['requirements', 'PasswordRule[]'],
      ['minLength', 'number'], ['strengthLabels', '[string, string, string, string]'],
      ['leadingIcon', 'string'], ['autocomplete', 'string'],
    ],
    events: [['update:modelValue', 'string'], ['strength', 'number'], ['focus', 'FocusEvent'], ['blur', 'FocusEvent']],
  },
  {
    id: 'otp', name: 'ApexOtp', group: 'Text',
    blurb: 'One box per character for confirmation codes. Handles paste, backspace and arrow keys across the boxes.',
    // Deliberately partial, as the gallery has it: shows the empty boxes alongside the filled.
    model: '482',
    base: { label: 'Verification code', length: 6, integerOnly: true, help: 'Enter the 6-digit code sent to your email.' },
    props: [
      ['modelValue', 'string | null'], ['length', 'number'], ['mask', 'boolean'],
      ['integerOnly', 'boolean'], ['variant', "'outlined' | 'filled'"], ['autofocus', 'boolean'],
    ],
    events: [['update:modelValue', 'string'], ['complete', 'string'], ['focus', 'FocusEvent'], ['blur', 'FocusEvent']],
  },
  {
    id: 'tags', name: 'ApexTags', group: 'Text',
    blurb: 'Free-text chips, added on Enter or a delimiter and removed with Backspace or the chip cross.',
    model: ['lobby', 'north-wing'],
    base: {
      label: 'Tags', placeholder: 'Add a tag', delimiter: ',', clearable: true,
      options: ['lobby', 'north-wing', 'south-wing', 'reception', 'canteen', 'meeting-room', 'totem'],
      help: 'Enter or comma to add. Backspace removes the last.',
    },
    props: [
      ['modelValue', 'string[]'], ['delimiter', 'string'], ['allowDuplicate', 'boolean'],
      ['max', 'number'], ['options', 'ApexOptionsInput'], ['restrict', 'boolean'],
      ['trim', 'boolean'], ['clearable', 'boolean'], ['addOnBlur', 'boolean'],
      ['leadingIcon', 'string'],
    ],
    events: [['update:modelValue', 'string[]'], ['add', 'string'], ['remove', 'string'], ['focus', 'FocusEvent'], ['blur', 'FocusEvent']],
  },
  {
    id: 'number', name: 'ApexNumber', group: 'Numbers',
    blurb: 'Numeric entry with a unit suffix or currency prefix.',
    model: 24,
    base: { label: 'Rotation interval', unit: 'sec', min: 5, max: 600 },
    props: [['modelValue', 'number | null'], ['unit / currency', 'string'], ['min / max / step', 'number']],
    events: [['update:modelValue', 'number | null']],
  },
  {
    id: 'stepper', name: 'ApexStepper', group: 'Numbers',
    blurb: 'Small integer entry; buttons disable at the bounds.',
    model: 3,
    base: { label: 'Displays included', min: 0, max: 20 },
    props: [['modelValue', 'number'], ['min / max / step', 'number']],
    events: [['update:modelValue', 'number']],
  },
  {
    id: 'select', name: 'ApexSelect', group: 'Choosers',
    blurb: 'Native select in the APEX shell.',
    model: 'split',
    base: { label: 'Zone layout', options: [{ value: 'full', label: 'Full area' }, { value: 'split', label: 'Split — 2 up' }], clearable: true },
    props: [['modelValue', 'string | number | null'], ['options', 'ApexOption[] | string[]'], ['clearable', 'boolean']],
    events: [['update:modelValue', 'value'], ['change', '—']],
  },
  {
    id: 'multiselect', name: 'ApexMultiselect', group: 'Choosers',
    blurb: 'Chips plus a searchable popover listbox.',
    model: ['admin'],
    base: { label: 'Roles', options: ROLE_OPTIONS, placeholder: 'Assign roles' },
    props: [['modelValue', 'unknown[]'], ['options', 'ApexOption[]'], ['searchable', 'boolean'], ['max', 'number']],
    events: [['update:modelValue', 'unknown[]']],
  },
  {
    id: 'switch', name: 'ApexSwitch', group: 'Choice',
    blurb: 'Boolean toggle with role="switch".',
    model: true,
    base: { label: 'Proof of play reporting' },
    props: [['modelValue', 'boolean'], ['labelPlacement', "defaults to 'after'"]],
    events: [['update:modelValue', 'boolean']],
  },
  {
    id: 'segmented', name: 'ApexSegmented', group: 'Choice',
    blurb: 'Exclusive options in one bar, roving tabindex.',
    model: 'totem',
    base: { label: 'Display kind', options: [{ value: 'room', label: 'Room' }, { value: 'totem', label: 'Totem' }, { value: 'wall', label: 'Video wall' }] },
    props: [['modelValue', 'unknown'], ['options', 'ApexOption[]'], ['block', 'boolean']],
    events: [['update:modelValue', 'unknown']],
  },
  {
    id: 'radiogroup', name: 'ApexRadioGroup', group: 'Choice',
    blurb: 'Stacked, inline, or bordered choice cards.',
    model: 'studio',
    base: { label: 'Plan', card: true, options: [{ value: 'free', label: 'Free', help: '1 display' }, { value: 'studio', label: 'Studio', help: '10 displays' }] },
    props: [['modelValue', 'unknown'], ['options', 'ApexOption[]'], ['card', 'boolean'], ['inline', 'boolean']],
    events: [['update:modelValue', 'unknown']],
  },
  {
    id: 'button', name: 'ApexButton', group: 'Actions', noField: true,
    blurb: 'Five variants, three sizes, icons, loading state.',
    base: { variant: 'primary', icon: 'check' },
    props: [['variant', "'primary' | 'secondary' | 'ghost' | 'danger' | 'outline-danger'"], ['loading', 'boolean'], ['href', 'string']],
    events: [['click', 'MouseEvent']],
  },
];
