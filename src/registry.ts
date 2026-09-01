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

/**
 * Field props every control accepts, shown in the rail under their own separator.
 *
 * Copied from COMMON_CONTROLS in web/apex-ui-shell.js. Without these the rail only
 * exposes what a control adds on top of the field shell, which makes the thinner
 * controls — ApexTextarea has eight of its own — look like they do far less than
 * they do.
 */
export const COMMON_CONTROLS: DocControl[] = [
  { key: 'labelPlacement', type: 'select', options: [...LABEL_PLACEMENTS] },
  { key: 'labelIcon', type: 'text' },
  { key: 'labelWidth', type: 'text' },
  { key: 'size', type: 'select', options: [...SIZES] },
  { key: 'tone', type: 'select', options: ['default', 'danger', 'warning', 'success'] },
  { key: 'help', type: 'text' },
  { key: 'error', type: 'text' },
  { key: 'warning', type: 'text' },
  { key: 'success', type: 'text' },
  { key: 'statusIcon', type: 'bool' },
  { key: 'required', type: 'bool' },
  { key: 'disabled', type: 'bool' },
  { key: 'readonly', type: 'bool' },
];

/** What the playground opens with, matching the gallery's DEFAULTS. */
export const PLAYGROUND_DEFAULTS: Record<string, unknown> = { size: 'md', labelPlacement: 'top' };

/** Named under the props table, since none of them appear in a control's own rows. */
export const SHARED_FIELD_PROPS = [
  'label', 'labelIcon', 'labelPlacement', 'labelWidth', 'help', 'error', 'warning',
  'success', 'tone', 'rules', 'context', 'required', 'disabled', 'readonly', 'size',
  'statusIcon', 'name',
];

export const TONE_CASES = [
  { label: 'Default', bind: {} },
  { label: 'With help', bind: { help: 'Shown when nothing is wrong.' } },
  { label: 'Error', bind: { error: 'This value is already taken.' } },
  { label: 'Warning', bind: { warning: 'Unusual, but allowed.' } },
  { label: 'Success', bind: { success: 'Checked and available.' } },
  { label: 'Required, empty', bind: { required: true, error: 'This field is required.' }, empty: true },
];

/**
 * The rule the Conditional formatting section demonstrates. `empty` is a real
 * ApexCondition operator (see ApexCondition in apex-ui/src/types.ts), evaluated
 * on every change — so clearing the field brings the warning back.
 */
export const FORMATTING_RULE = [
  { when: { empty: true }, tone: 'warning', message: 'Nothing selected yet.' },
];

export const STATE_CASES = [
  { label: 'disabled', bind: { disabled: true } },
  { label: 'readonly', bind: { readonly: true } },
  { label: 'statusIcon = false', bind: { statusIcon: false, error: 'Something is wrong.' } },
];

/* ------------------------------------------------------------------ *
 * ApexInput-only sections.
 *
 * The gallery hand-authors these four in its template rather than
 * driving them from its registry, so they are transcribed here as data
 * — same demos, same labels, same values. CITIES is copied from
 * apex-ui-docs.js; the key-filter seeds from apex-ui-shell.js.
 * ------------------------------------------------------------------ */

/** One demo cell: a tag, a starting value and the props to bind. */
export interface DocCase {
  tag: string;
  value: unknown;
  bind: Record<string, unknown>;
}

/** The suggestion list `acSearch` filters against. */
export const CITIES = [
  { value: 'Valletta', label: 'Valletta', help: 'Malta' },
  { value: 'Sliema', label: 'Sliema', help: 'Malta' },
  { value: 'St Julian’s', label: 'St Julian’s', help: 'Malta' },
  { value: 'Mosta', label: 'Mosta', help: 'Malta' },
  { value: 'Birkirkara', label: 'Birkirkara', help: 'Malta' },
  { value: 'Victoria', label: 'Victoria', help: 'Gozo' },
  { value: 'Marsaxlokk', label: 'Marsaxlokk', help: 'Malta' },
  { value: 'Mdina', label: 'Mdina', help: 'Malta' },
];

export const AUTOCOMPLETE_SNIPPET = `<ApexInput v-model="city" label="City"
  :suggestions="hits" :loading="busy" dropdown clearable
  @complete="search" @item-select="pick" />

async function search({ query }) {
  busy.value = true;
  hits.value = await api.cities(query);
  busy.value = false;
}`;

export const ICON_SLOT_CASES: DocCase[] = [
  { tag: 'leadingIcon', value: 'ada.lovelace', bind: { label: 'Username', leadingIcon: 'person' } },
  { tag: 'trailingIcon', value: 'EUR', bind: { label: 'Currency', trailingIcon: 'euro' } },
  { tag: 'labelIcon', value: 'lobby-north', bind: { label: 'Screen', labelIcon: 'tv' } },
  {
    tag: 'trailingAction', value: 'tok_9F2K1AZQ',
    bind: { label: 'API token', mono: true, trailingAction: { icon: 'refresh', label: 'Regenerate token' } },
  },
  { tag: 'clearable', value: 'north entrance', bind: { label: 'Search', leadingIcon: 'search', clearable: true } },
  { tag: 'loading', value: 'checking…', bind: { label: 'Domain', suffix: '.apexpando.com', loading: true } },
  { tag: 'type="password"', value: 'correct-horse', bind: { label: 'Password', type: 'password' } },
  {
    tag: 'status icon on error', value: 'ada@',
    bind: { label: 'Email', type: 'email', error: 'Enter a valid email address.' },
  },
];

export const AFFIX_CASES: DocCase[] = [
  { tag: 'prefix', value: 'exorgroup', bind: { label: 'Handle', prefix: '@' } },
  { tag: 'suffix', value: 'demo', bind: { label: 'Workspace', suffix: '.apexpando.com' } },
  {
    tag: 'type="slug"', value: 'north-lobby-totem',
    bind: { label: 'Slug', type: 'slug', help: 'Typing is slugified live.' },
  },
  { tag: 'mono', value: '0F14-1C2A-88B0', bind: { label: 'Device ID', mono: true } },
];

/** Two-way bound, so typing a rejected key visibly does nothing. */
export const KEY_FILTER_CASES: Array<{ key: string; tag: string; seed: string; bind: Record<string, unknown> }> = [
  { key: 'integer', tag: 'keyFilter="integer"', seed: '24', bind: { label: 'Display count', keyFilter: 'integer', mono: true } },
  { key: 'number', tag: 'keyFilter="number"', seed: '1.5', bind: { label: 'Scale factor', keyFilter: 'number', mono: true } },
  { key: 'money', tag: 'keyFilter="money"', seed: '89.50', bind: { label: 'Monthly fee', keyFilter: 'money', prefix: '€', mono: true } },
  { key: 'hex', tag: 'keyFilter="hex"', seed: '0B5FFF', bind: { label: 'Brand colour', keyFilter: 'hex', prefix: '#', mono: true } },
  { key: 'alphabetic', tag: 'keyFilter="alphabetic"', seed: 'Ada Lovelace', bind: { label: 'Contact name', keyFilter: 'alphabetic' } },
  {
    key: 'alphanumeric', tag: 'keyFilter="alphanumeric"', seed: 'MT01',
    bind: { label: 'Site code', keyFilter: 'alphanumeric', transform: 'upper', mono: true },
  },
  {
    key: 'custom', tag: ':key-filter="/^[A-Z]{0,3}-?\\d{0,4}$/"', seed: 'APX-0142',
    bind: {
      label: 'Asset tag', keyFilter: '^[A-Z]{0,3}-?\\d{0,4}$', mono: true,
      help: 'Custom pattern: up to 3 capitals, a dash, up to 4 digits.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Foundations — prose pages, not control pages.
 *
 * Bodies are copied from the DOCS blob in web/apex-ui-shell.js. Two of
 * them carry a live demo below the prose, defined in App.vue.
 * ------------------------------------------------------------------ */

export interface DocPage {
  id: string;
  name: string;
  group: string;
  body: string;
}

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super Admin', icon: 'shield_person', help: 'Full access, including billing' },
  { value: 'editor', label: 'Content Editor', icon: 'edit_document', help: 'Create and publish adverts' },
  { value: 'scheduler', label: 'Scheduler', icon: 'calendar_month', help: 'Book slots and rotations' },
  { value: 'viewer', label: 'Viewer', icon: 'visibility', help: 'Read-only across the workspace' },
  { value: 'billing', label: 'Billing Contact', icon: 'receipt_long', help: 'Invoices and payment methods' },
];

/** Swatches rendered under the Theming page, straight from the live stylesheet. */
export const TOKEN_SWATCHES = [
  '--bg-app', '--bg-surface', '--bg-muted', '--border-default', '--fg-default',
  '--fg-muted', '--accent-primary', '--accent-success', '--accent-warning', '--accent-danger',
];

/** The rules the Conditional formatting page demonstrates live. */
export const QUANTITY_RULES = [
  { when: { eq: 3 }, tone: 'danger', message: 'Three is not a valid quantity' },
  { when: { gte: 50 }, tone: 'warning', message: 'Large order — needs approval' },
];

export const SUMMARY_ERRORS = {
  email: 'Enter a valid email address.',
  roles: 'Assign at least one role.',
};

export const PAGES: DocPage[] = [
  {
    id: 'theming', name: 'Theming & tokens', group: 'Foundations',
    body: `
      <h2>Tokens</h2>
      <p>Everything reads CSS custom properties from <code>tokens.css</code>. Override any of
      them in your own stylesheet — no build configuration, no preprocessor.</p>
      <h2>Dark mode</h2>
      <p>Both <code>prefers-color-scheme</code> and a <code>.dark</code> /
      <code>[data-theme="dark"]</code> class are supported; the class wins, so a user
      preference always beats the OS. <code>@apexUiTheme</code> writes the class before
      first paint. Toggle it in the top bar to check any example.</p>
      <h2>Density and RTL</h2>
      <p>Three sizes — <code>sm</code>, <code>md</code>, <code>lg</code> — set as a prop or as a
      plugin-wide default. All spacing uses logical properties, so <code>dir="rtl"</code>
      mirrors the whole library with no overrides. The RTL switch in the top bar flips this
      page.</p>`,
  },
  {
    id: 'anatomy', name: 'Field anatomy', group: 'Foundations',
    body: `
      <h2>Parts</h2>
      <p>Every control renders one <code>ApexField</code>: a label, the control shell, and one
      message line. The message is a single slot with a precedence order, so a control never
      shows two competing lines.</p>
      <table class="doc-table"><thead><tr><th>Precedence</th><th>Source</th><th>Tone</th></tr></thead><tbody>
        <tr><td>1</td><td><code>error</code></td><td>danger</td></tr>
        <tr><td>2</td><td><code>warning</code></td><td>warning</td></tr>
        <tr><td>3</td><td><code>success</code></td><td>success</td></tr>
        <tr><td>4</td><td>matching <code>rules</code> entry</td><td>the rule's tone</td></tr>
        <tr><td>5</td><td><code>help</code></td><td>default</td></tr>
      </tbody></table>
      <h2>Using it directly</h2>
      <pre class="doc-pre">&lt;ApexField label="Port" :value="port" v-slot="{ id, describedBy, invalid }"&gt;
  &lt;input :id="id" v-model="port" :aria-describedby="describedBy" :aria-invalid="invalid" /&gt;
&lt;/ApexField&gt;</pre>
      <h2>Accessibility</h2>
      <ul class="doc-list">
        <li>Label is always associated by <code>for</code>/<code>id</code>; <code>labelPlacement="hidden"</code> keeps it in the accessibility tree via <code>aria-label</code>.</li>
        <li><code>aria-describedby</code> points at the message line whenever one is shown.</li>
        <li><code>aria-invalid</code> tracks the danger tone.</li>
        <li>Segmented uses roving tabindex; the multiselect is a <code>combobox</code> with a listbox popover.</li>
        <li>Focus rings are visible on every interactive element and survive dark mode.</li>
      </ul>`,
  },
  {
    id: 'formatting', name: 'Conditional formatting', group: 'Foundations',
    body: `
      <h2>rules</h2>
      <p>Value-driven formatting, separate from validation. Rules never block a submit — they
      colour the field and swap the message. They are evaluated top to bottom on every change;
      the last match wins.</p>
      <pre class="doc-pre">&lt;ApexNumber v-model="qty" label="Quantity"
  :rules="[
    { when: { eq: 3 },   tone: 'danger',  message: 'Three is not a valid quantity' },
    { when: { gte: 50 }, tone: 'warning', message: 'Large order — needs approval' },
  ]" /&gt;</pre>
      <h2>Condition grammar</h2>
      <p>The same grammar apex-form uses. <code>field</code> defaults to <code>value</code>, so
      <code>{ eq: 3 }</code> reads this control. Name any other key to read from
      <code>context</code>.</p>
      <table class="doc-table"><thead><tr><th>Operator</th><th>Meaning</th></tr></thead><tbody>
        <tr><td><code>eq</code> <code>ne</code></td><td>strict equality</td></tr>
        <tr><td><code>gt</code> <code>gte</code> <code>lt</code> <code>lte</code></td><td>numeric compare</td></tr>
        <tr><td><code>in</code> <code>nin</code></td><td>membership of a list</td></tr>
        <tr><td><code>includes</code></td><td>array value contains</td></tr>
        <tr><td><code>truthy</code> <code>falsy</code> <code>empty</code></td><td>presence</td></tr>
        <tr><td><code>matches</code></td><td>regular expression</td></tr>
        <tr><td><code>all</code> <code>any</code> <code>not</code></td><td>composition</td></tr>
      </tbody></table>`,
  },
  {
    id: 'validation', name: 'Validation & errors', group: 'Foundations',
    body: `
      <h2>The controls own nothing</h2>
      <p>No control validates. Bind <code>:error</code> yourself, or register an adapter and let
      a parent form drive it.</p>
      <pre class="doc-pre">import { zodAdapter, precognitionAdapter } from '@exorgroup/apex-ui';

app.use(ApexUI, { adapter: zodAdapter(UserSchema) });

// or, server-side truth:
const form = useForm('post', '/users', { name: '' });
app.use(ApexUI, { adapter: precognitionAdapter(form) });</pre>
      <h2>Presentations</h2>
      <p>Inline message, tinted border, status icon in the field, and a summary list at the top
      of the form — plus non-blocking warning and success tones.</p>`,
  },
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
