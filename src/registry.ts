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
  type: 'text' | 'number' | 'bool' | 'select' | 'color';
  options?: string[];
}

export interface DocEntry {
  id: string;
  name: string;
  group: string;
  blurb: string;
  /** No ApexField shell, so the label/tone/state sections do not apply. */
  noField?: boolean;
  /**
   * How the live stage renders this one. Omitted means the default: the
   * component with v-model and the playground props.
   */
  demo?: 'icon' | 'button' | 'split' | 'dial' | 'group' | 'field';
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

/** The eight colour roles ApexButton and friends share. */
export const SEVERITIES = [
  'primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger', 'contrast',
] as const;

/** Menu for the ApexSplitButton demos — headers, hints, a separator, nested submenus. */
export const SPLIT_MODEL = [
  { header: 'Save' },
  { label: 'Save and publish', icon: 'publish', hint: 'Cmd+Enter' },
  { label: 'Save as draft', icon: 'draft', hint: 'Cmd+S' },
  { label: 'Save a copy', icon: 'content_copy' },
  { separator: true },
  {
    label: 'Export',
    icon: 'download',
    items: [
      { label: 'PDF report', icon: 'picture_as_pdf' },
      { label: 'CSV data', icon: 'table_view' },
      { separator: true },
      {
        label: 'Proof of play',
        icon: 'fact_check',
        items: [
          { label: 'Last 7 days' },
          { label: 'Last 30 days' },
          { label: 'Custom range' },
        ],
      },
    ],
  },
  { label: 'Schedule', icon: 'schedule' },
  { separator: true },
  { label: 'Discard changes', icon: 'delete', disabled: true },
];

export const DIAL_ITEMS = [
  { icon: 'add', label: 'New playlist', tooltip: 'New playlist' },
  { icon: 'upload', label: 'Upload media', tooltip: 'Upload media' },
  { icon: 'edit', label: 'Edit zone', tooltip: 'Edit zone' },
  { icon: 'refresh', label: 'Sync displays', tooltip: 'Sync displays' },
  { icon: 'delete', label: 'Remove', tooltip: 'Remove' },
];

/** Swatches offered by a `color` control. Copied from PG_COLORS in apex-ui-shell.js. */
export const PG_COLORS = ['#0B5FFF', '#137C4A', '#C24A06', '#C41E1E', '#7C3AED', '#0F141C', '#8794A6'];

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

/** The Reference grid on the ApexIcon page — a working set, grouped by role. */
export const ICON_SETS = [
  {
    label: 'Navigation',
    names: ['home', 'dashboard', 'menu', 'close', 'arrow_back', 'arrow_forward',
      'chevron_left', 'chevron_right', 'expand_more', 'expand_less', 'more_vert', 'search'],
  },
  {
    label: 'Actions',
    names: ['add', 'remove', 'edit', 'delete', 'save', 'content_copy',
      'download', 'upload', 'refresh', 'check', 'undo', 'share'],
  },
  {
    label: 'Status',
    names: ['check_circle', 'error', 'warning', 'info', 'help',
      'schedule', 'visibility', 'visibility_off', 'lock', 'lock_open', 'star', 'favorite'],
  },
  {
    label: 'Domain',
    names: ['tv', 'smartphone', 'playlist_play', 'campaign', 'storefront',
      'inventory_2', 'assessment', 'group', 'public', 'calendar_month', 'payments', 'handyman'],
  },
];

export const ICON_RESOLVER_SNIPPET = `app.use(ApexUI, {
  iconResolver: (name) => MY_MAP[name] ?? name,
});`;

/** Used by the ApexSelect in ApexIcon's "In context" section. */
export const ZONE_OPTIONS = [
  { value: 'full', label: 'Full area', icon: 'crop_free', help: 'One advert, whole screen' },
  { value: 'split', label: 'Split — 2 up', icon: 'vertical_split', help: 'Two zones side by side' },
  { value: 'ticker', label: 'Ticker strip', icon: 'view_stream', help: 'Bottom strip, scrolling' },
  { value: 'sidebar', label: 'Sidebar panel', icon: 'view_sidebar', help: 'Narrow rail plus main' },
  { value: 'quad', label: 'Quad grid', icon: 'grid_view', help: 'Four equal zones' },
  { value: 'hero', label: 'Hero + rail', icon: 'featured_video', help: 'Large primary, small secondary' },
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


/* ------------------------------------------------------------------ *
 * Customisation reference, shown on the ApexField page.
 *
 * Values here are read off apex-ui/src/styles/apex-ui.css and
 * ApexField.vue rather than written from memory — a documented default
 * that does not match the stylesheet is worse than no default at all.
 * ------------------------------------------------------------------ */

/** [class, what it is, which control renders it] */
export const FIELD_PARTS: string[][] = [
  ['.apex-field', 'The root. Carries data-size, data-lp, data-tone, data-disabled, data-focused, and every CSS variable below.', 'every field'],
  ['.apex-field__label', 'The label, with its optional icon.', 'every field'],
  ['.apex-field__req', 'The required asterisk.', 'every field'],
  ['.apex-field__body', 'Wraps the control and its message line.', 'every field'],
  ['.apex-field__msg', 'The one message line. Carries data-tone.', 'every field'],
  ['.apex-ctl', 'The control box — border, background, radius, height, padding.', 'Input, Textarea, Number, Select, Multiselect, Tags'],
  ['.apex-ctl__input', 'The input element itself.', 'Input, Textarea, Number'],
  ['.apex-ctl__icon', 'Leading and trailing icons.', 'Input, Select, Multiselect, Tags'],
  ['.apex-ctl__affix', 'Static prefix and suffix text.', 'Input, Number'],
  ['.apex-ctl__btn', 'Clear, reveal, trailing action, dropdown chevron.', 'Input, Select, Multiselect, Tags'],
  ['.apex-ctl__status', 'The tone glyph inside the box.', 'most fields'],
  ['.apex-pop', 'The typeahead overlay.', 'Input, Select, Multiselect, Tags'],
  ['.apex-pop__opt', 'A row in the overlay. Carries data-active and aria-selected.', 'Input, Select, Multiselect, Tags'],
  ['.apex-otp__box', 'One digit box.', 'Otp'],
  ['.apex-stepper__val', 'The displayed number.', 'Stepper'],
];

/** [variable, default, what it sets] */
export const FIELD_VARS: string[][] = [
  ['--apex-ctl-bg', 'var(--bg-surface)', 'Box background'],
  ['--apex-ctl-border', 'var(--border-default)', 'Box border colour'],
  ['--apex-ctl-border-w', '1px', 'Box border width'],
  ['--apex-ctl-radius', 'var(--r-md)', 'Box corner radius'],
  ['--apex-ctl-border-hover', 'var(--border-strong)', 'Border on hover'],
  ['--apex-ctl-border-focus', 'var(--accent-primary)', 'Border on focus'],
  ['--apex-ctl-ring', 'color-mix(… 15%)', 'The focus ring'],
  ['--apex-ctl-bg-disabled', 'var(--bg-muted)', 'Box background when disabled'],
  ['--apex-ctl-fg', 'var(--fg-default)', 'Value text'],
  ['--apex-ctl-placeholder', 'var(--fg-subtle)', 'Placeholder text'],
  ['--apex-ctl-fg-disabled', 'var(--fg-muted)', 'Value text when disabled'],
  ['--apex-ctl-h', '42px', 'Box height. 34 / 50 at sm / lg'],
  ['--apex-ctl-fs', '14.5px', 'Value font size'],
  ['--apex-ctl-pad', '12px', 'Box inline padding'],
  ['--apex-icon-size', '20px', 'Icon size inside the box'],
  ['--apex-ctl-icon', 'var(--fg-subtle)', 'Icon colour'],
  ['--apex-ctl-affix', 'var(--fg-subtle)', 'Prefix and suffix colour'],
  ['--apex-ctl-btn', 'var(--fg-subtle)', 'Button colour'],
  ['--apex-ctl-btn-hover', 'var(--fg-default)', 'Button colour on hover'],
  ['--apex-ctl-btn-hover-bg', 'var(--bg-muted)', 'Button background on hover'],
  ['--apex-label-fg', 'var(--fg-default)', 'Label colour'],
  ['--apex-label-fs', '13px', 'Label font size'],
  ['--apex-label-w', '160px', 'Label column width for before / after'],
  ['--apex-msg-fg', 'var(--fg-subtle)', 'Message colour at the default tone'],
  ['--apex-msg-fs', '12.5px', 'Message font size'],
  ['--apex-field-danger', 'var(--accent-danger)', 'The whole danger tone'],
  ['--apex-field-warning', 'var(--accent-warning)', 'The whole warning tone'],
  ['--apex-field-success', 'var(--accent-success)', 'The whole success tone'],
  ['--apex-field-required', 'var(--accent-danger)', 'The required asterisk'],
  ['--apex-pop-bg', 'var(--bg-elevated)', 'Overlay background'],
  ['--apex-pop-border', 'var(--border-default)', 'Overlay border'],
  ['--apex-pop-radius', 'var(--r-md)', 'Overlay radius'],
  ['--apex-opt-fg', 'var(--fg-default)', 'Row text'],
  ['--apex-opt-hover-bg', 'var(--bg-muted)', 'Row background when active'],
  ['--apex-opt-selected-fg', 'var(--accent-primary)', 'Row text when selected'],
];

/** [group, prop, variable it sets] */
export const FIELD_STYLE_PROPS: string[][] = [
  ['Box', 'background', '--apex-ctl-bg'],
  ['Box', 'borderColor', '--apex-ctl-border'],
  ['Box', 'borderWidth', '--apex-ctl-border-w'],
  ['Box', 'radius', '--apex-ctl-radius'],
  ['Box', 'hoverBorderColor', '--apex-ctl-border-hover'],
  ['Box', 'focusBorderColor', '--apex-ctl-border-focus'],
  ['Box', 'focusRing', '--apex-ctl-ring'],
  ['Box', 'disabledBackground', '--apex-ctl-bg-disabled'],
  ['Text', 'textColor', '--apex-ctl-fg'],
  ['Text', 'placeholderColor', '--apex-ctl-placeholder'],
  ['Size', 'controlHeight', '--apex-ctl-h'],
  ['Size', 'fontSize', '--apex-ctl-fs'],
  ['Size', 'paddingInline', '--apex-ctl-pad'],
  ['Size', 'iconSize', '--apex-icon-size'],
  ['Parts', 'iconColor', '--apex-ctl-icon'],
  ['Parts', 'affixColor', '--apex-ctl-affix'],
  ['Parts', 'buttonColor', '--apex-ctl-btn'],
  ['Shell', 'labelColor', '--apex-label-fg'],
  ['Shell', 'labelFontSize', '--apex-label-fs'],
  ['Shell', 'labelWidth', '--apex-label-w'],
  ['Shell', 'messageColor', '--apex-msg-fg'],
  ['Shell', 'messageFontSize', '--apex-msg-fs'],
  ['Shell', 'requiredColor', '--apex-field-required'],
  ['Overlay', 'popoverBackground', '--apex-pop-bg'],
  ['Overlay', 'popoverBorderColor', '--apex-pop-border'],
  ['Overlay', 'optionHoverBackground', '--apex-opt-hover-bg'],
];

/** [key, part it lands on, which controls honour it] */
export const UI_KEYS: string[][] = [
  ['root', '.apex-field', 'every field'],
  ['label', '.apex-field__label', 'every field'],
  ['body', '.apex-field__body', 'every field'],
  ['message', '.apex-field__msg', 'every field'],
  ['control', '.apex-ctl', 'Input, Textarea, Number, Select, Multiselect, Tags'],
  ['input', '.apex-ctl__input', 'Input, Textarea, Number'],
  ['icon', '.apex-ctl__icon', 'Input, Select, Multiselect, Tags'],
  ['affix', '.apex-ctl__affix', 'Input, Number'],
  ['button', '.apex-ctl__btn', 'Input, Select, Multiselect, Tags'],
  ['popover', '.apex-pop', 'Input, Select, Multiselect, Tags'],
  ['option', '.apex-pop__opt', 'Input, Select, Multiselect, Tags'],
  ['box', '.apex-otp__box', 'Otp'],
  ['value', '.apex-stepper__val / .apex-ctl__value', 'Stepper, Select'],
  ['unit', '.apex-stepper__unit', 'Stepper'],
  ['tick', '.apex-pop__tick', 'Select'],
  ['filter', '.apex-pop__filter', 'Select, Multiselect'],
  ['selectAll', '.apex-pop__all', 'Multiselect'],
  ['checkbox', '.apex-pop__box', 'Multiselect'],
];

export const SNIP_PROPS = `<ApexInput
  v-model="email"
  label="Email address"
  background="#101820"
  border-color="#C24A06"
  focus-border-color="#E4863F"
  radius="14px"
  text-color="#F5E9DF"
  label-color="#C24A06"
  control-height="52px"
/>`;

export const SNIP_UI = `<ApexInput v-model="email" label="Email address"
  :ui="{ control: 'brand-box', input: 'brand-text', label: 'brand-label' }" />`;

/** Every property .apex-ctl responds to, as it ships. */
export const SNIP_CTL = `/* .apex-ctl as the library defines it. Override any line —
   or set the variable instead and leave the rule alone. */
.apex-ctl {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: var(--apex-ctl-h);         /* 42px, 34 / 50 at sm / lg */
  padding-inline: var(--apex-ctl-pad);   /* 12px */
  border: var(--apex-ctl-border-w)       /* 1px */
         solid var(--apex-ctl-border);   /* var(--border-default) */
  border-radius: var(--apex-ctl-radius); /* var(--r-md) */
  background: var(--apex-ctl-bg);        /* var(--bg-surface) */
  transition: border-color var(--dur-fast),
              box-shadow var(--dur-fast),
              background var(--dur-fast);
  position: relative;
}

.apex-ctl:hover:not([data-disabled="true"]) {
  border-color: var(--apex-ctl-border-hover);
}

.apex-ctl[data-focused="true"] {
  border-color: var(--apex-ctl-border-focus);
  box-shadow: 0 0 0 3px var(--apex-ctl-ring);
}

.apex-ctl[data-disabled="true"] {
  background: var(--apex-ctl-bg-disabled);
  cursor: not-allowed;
}`;

export const SNIP_CLASS = `/* Your stylesheet. The .apex-ctl on the same element raises
   specificity above the library rule, so no !important. */
.brand-box.apex-ctl {
  background: #FFF8F2;
  border-color: #C24A06;
  border-radius: 14px;
}
.brand-box.apex-ctl[data-focused="true"] {
  border-color: #E4863F;
  box-shadow: 0 0 0 3px rgb(196 74 6 / 0.18);
}
.brand-label.apex-field__label { color: #C24A06; letter-spacing: .02em; }
.brand-text.apex-ctl__input   { font-family: var(--font-mono); }`;

export const SNIP_DARK = `/* One class, both themes. The library puts .dark on the root,
   so the two definitions sit next to each other. */
.brand-box.apex-ctl {
  background: #FFF8F2;
  border-color: #C24A06;
}
.dark .brand-box.apex-ctl {
  background: #1A1210;
  border-color: #E4863F;
}`;

export const SNIP_TONE = `/* One variable per tone, and it reaches every control —
   the border, the label, the status glyph and the message. */
.apex-field { --apex-field-danger: #B4004E; }

/* Or on one field only */
<ApexInput :ui="{ root: 'pink-errors' }" />
.pink-errors { --apex-field-danger: #B4004E; }`;


/** The action controls, whose shared half lives on ApexButton rather than ApexField. */
export const BUTTON_FAMILY = ['button', 'splitbutton', 'speeddial', 'buttongroup'];

/** Per-control customisation: [ui key, part, variables it responds to]. */
export const OWN_PARTS: Record<string, string[][]> = {
  datepicker: [
    ['calendar', '.apex-cal', '--apex-cal-bg, --apex-cal-border, --apex-cal-radius, --apex-cal-shadow'],
    ['nav', '.apex-cal__nav', 'the prev/next buttons are .apex-ctl__btn inside it'],
    ['title', '.apex-cal__title', '--apex-cal-nav-fg, --apex-cal-nav-hover-bg, --apex-cal-nav-hover-fg'],
    ['months', '.apex-cal__months', 'the row of columns — layout only'],
    ['month', '.apex-cal__month', 'one column — layout only'],
    ['monthLabel', '.apex-cal__mlabel', '--apex-cal-month-fg (shown once numberOfMonths is above one)'],
    ['grid', '.apex-cal__grid', 'the seven columns — layout only'],
    ['weekday', '.apex-cal__wd', '--apex-cal-wd-fg'],
    ['day', '.apex-cal__day', '--apex-cal-day-fg, --apex-cal-day-radius, --apex-cal-day-hover-bg, --apex-cal-day-selected-bg, --apex-cal-day-selected-fg, --apex-cal-day-today-ring, --apex-cal-day-outside-fg, --apex-cal-day-range-bg'],
    ['pick', '.apex-cal__pick', '--apex-cal-pick-fg, --apex-cal-pick-hover-bg, --apex-cal-pick-selected-bg, --apex-cal-pick-selected-fg (month and year grids)'],
    ['time', '.apex-cal__time', '--apex-cal-time-border, --apex-cal-time-fg, --apex-cal-time-font'],
    ['spin', '.apex-cal__spin', '--apex-cal-spin-fg, --apex-cal-spin-hover-bg, --apex-cal-spin-hover-fg'],
    ['meridiem', '.apex-cal__mer', '--apex-cal-mer-bg, --apex-cal-mer-fg, --apex-cal-mer-border, --apex-cal-mer-hover'],
    ['bar', '.apex-cal__bar', '--apex-cal-bar-border, --apex-cal-bar-fg, --apex-cal-bar-hover-bg'],
  ],
  textarea: [
    ['counter', '.apex-ctl__counter', '--apex-counter-fg'],
  ],
  password: [
    ['panel', '.apex-pw__panel', '--apex-pw-panel-bg, --apex-pw-panel-border, --apex-pw-panel-radius'],
    ['meter', '.apex-pw__meter', '--apex-pw-meter-h, --apex-pw-meter-track, --apex-pw-band-1…4'],
    ['strength', '.apex-pw__label', 'inherits the band colour for the current score'],
    ['rules', '.apex-pw__rules', '--apex-pw-rule-on, --apex-pw-rule-off'],
  ],
  otp: [
    ['box', '.apex-otp__box', '--apex-otp-bg, --apex-otp-fg, --apex-otp-border, --apex-otp-border-focus, --apex-otp-ring, --apex-otp-radius'],
  ],
  tags: [
    ['chip', '.apex-chip', '--apex-chip-bg, --apex-chip-fg, --apex-chip-border, --apex-chip-radius'],
  ],
  stepper: [
    ['control', '.apex-stepper', 'the shared --apex-ctl-* set — the box behaves like any field box'],
    ['decrement', '.apex-stepper__btn (first)', '--apex-stepper-btn-w, -bg, -fg, -hover-bg, -hover-fg'],
    ['increment', '.apex-stepper__btn (last)', 'the same variables — both buttons share them'],
    ['value', '.apex-stepper__val', 'inherits --apex-ctl-fg and --apex-ctl-fs'],
    ['unit', '.apex-stepper__unit', ''],
  ],
  knob: [
    ['range', '.apex-knob__range', '--apex-knob-range; thickness from railWidth'],
    ['valueArc', '.apex-knob__value', '--apex-knob-value; thickness from strokeWidth'],
    ['text', '.apex-knob__text', '--apex-knob-text, --apex-knob-text-size'],
  ],
  button: [
    ['root', '.apex-btn', 'the four colour variables plus --apex-btn-h / -fs / -pad / -radius'],
    ['label', '.apex-btn__txt', 'inherits the button font size'],
    ['badge', '.apex-btn__badge', 'redefines the colour pair for itself'],
  ],
  splitbutton: [
    ['root', '.apex-split', 'the wrapper; colours cascade to both halves'],
    ['action', '.apex-split__action', 'an .apex-btn — same four colours'],
    ['toggle', '.apex-split__toggle', 'an .apex-btn — same four colours'],
    ['menu', '.apex-menu', '--apex-menu-bg, --apex-menu-border, --apex-menu-radius'],
    ['menuItem', '.apex-menu__row', '--apex-menu-fg, --apex-menu-hover-bg, --apex-menu-hover-fg, --apex-menu-icon'],
    ['menuHeader', '.apex-menu__header', '--apex-menu-header-fg'],
    ['menuHint', '.apex-menu__hint', '--apex-menu-hint-fg'],
    ['menuSeparator', '.apex-menu__sep', '--apex-menu-sep'],
  ],
  speeddial: [
    ['root', '.apex-dial', ''],
    ['trigger', '.apex-dial__trigger', 'an .apex-btn — same four colours'],
    ['items', '.apex-dial__items', 'the fan'],
    ['item', '.apex-dial__item', 'positions one action on the arc — no paint of its own'],
    ['action', '.apex-dial__btn', '--apex-dial-action-bg, -fg, -border, -radius, -hover-fg, -hover-border'],
    ['mask', '.apex-dial__mask', 'maskColor and maskOpacity props'],
    ['tooltip', '.apex-dial__tip', ''],
  ],
  buttongroup: [
    ['root', '.apex-btngroup', 'the unframed group'],
    ['frame', '.apex-btngroup', 'the framed variant, when `label` is set'],
    ['help', '.apex-btngroup__help', '--apex-btngroup-help-fg, --apex-btngroup-help-fs'],
  ],
  icon: [
    ['root', '.apex-icon', '--apex-icon-size, --apex-icon-wght, --apex-icon-fill'],
  ],
  slider: [
    ['track', '.apex-slider__track', '--apex-slider-track, --apex-slider-size'],
    ['fill', '.apex-slider__fill', '--apex-slider-color'],
    ['handle', '.apex-slider__handle', '--apex-slider-handle, --apex-slider-handle-size'],
    ['tooltip', '.apex-slider__tip', '--apex-slider-tip-bg, --apex-slider-tip-fg'],
  ],
};

export const SNIP_OWN: Record<string, string> = {
  datepicker: `<!-- Twelve props cover the popover and every state a day can be in.
     They are sugar over --apex-cal-*, so this and the CSS below do the
     same thing. -->
<ApexDatePicker v-model="when" label="Campaign start" show-icon
  calendar-background="#101820" calendar-border-color="#243040"
  calendar-radius="14px" calendar-shadow="0 10px 34px #0009"
  day-color="#E8EEF7" day-hover-background="#1D2735" day-radius="10px"
  day-selected-background="#7AA2F7" day-selected-color="#0B0F14"
  day-today-ring="#3B4A61" day-outside-color="#5A6B7D"
  day-range-background="#16202C" />

/* Set daySelectedColor whenever you set daySelectedBackground. A selected
   day's text is #fff by default, which a light background leaves
   unreadable — that was the one part of the calendar with no way in. */

/* The other twenty-two variables have no prop. They are the calendar's
   chrome — title and nav, the month and year grids, the time spinners,
   the meridiem toggle, the Today/Clear bar — which usually wants to
   follow the theme rather than be set per instance. Reach them by
   scoping a class of your own. */
.booking-cal {
  --apex-cal-nav-hover-fg: #7AA2F7;
  --apex-cal-wd-fg: #6B7789;
  --apex-cal-pick-selected-bg: #7AA2F7;
  --apex-cal-pick-selected-fg: #0B0F14;
  --apex-cal-time-border: #243040;
  --apex-cal-spin-hover-fg: #7AA2F7;
  --apex-cal-mer-bg: #16202C;
  --apex-cal-bar-fg: #7AA2F7;
}

<!-- ui puts your class on any part. The keys below are the calendar's own;
     control, input, icon and button reach the box, as on every field. -->
<ApexDatePicker v-model="when" label="Campaign start"
  :ui="{ calendar: 'booking-cal', day: 'booking-day', bar: 'booking-bar' }" />

/* The prev/next arrows are .apex-ctl__btn, the field's own class, so they
   are reached through nav rather than through button — which means the
   box's buttons and the calendar's never restyle each other. */
.booking-nav .apex-ctl__btn { color: #7AA2F7; }`,
  textarea: `<ApexTextarea v-model="notes" label="Description" counter :maxlength="240"
  :ui="{ counter: 'my-counter' }" />

.my-counter.apex-ctl__counter { font-variant-numeric: tabular-nums; font-weight: 600; }`,

  password: `<ApexPassword v-model="pw" label="New password"
  :ui="{ panel: 'pw-panel', meter: 'pw-meter', rules: 'pw-rules' }" />

/* The four bands are where a house palette usually diverges —
   the default runs danger, warning, blue, success. */
.pw-meter.apex-pw__meter {
  --apex-pw-meter-h: 7px;
  --apex-pw-band-1: #C41E1E;
  --apex-pw-band-2: #C24A06;
  --apex-pw-band-3: #7C3AED;
  --apex-pw-band-4: #137C4A;
}
.pw-rules.apex-pw__rules { --apex-pw-rule-on: #137C4A; }`,

  otp: `<ApexOtp v-model="code" label="Verification code" :length="6"
  :ui="{ box: 'code-box' }" />

.code-box.apex-otp__box {
  --apex-otp-bg: #0B0E13;
  --apex-otp-border: #2A3240;
  --apex-otp-border-focus: #0B5FFF;
  --apex-otp-radius: 10px;
}`,

  stepper: `<!-- The box is a field box, so the shared props work here exactly
     as they do on an ApexInput. -->
<!-- Either a Material Symbols name, or a literal character. -->
<ApexStepper v-model="qty" decrement-icon="expand_more" increment-icon="expand_less" />
<ApexStepper v-model="qty" decrement-text="−" increment-text="+" />

<ApexStepper v-model="qty" label="Displays" unit="screens"
  background="#101820" border-color="#C24A06" radius="12px"
  :ui="{ decrement: 'step-btn', increment: 'step-btn' }" />

.step-btn.apex-stepper__btn {
  --apex-stepper-btn-w: 34px;
  --apex-stepper-btn-fg: #C24A06;
  --apex-stepper-btn-hover-bg: #FFF1E5;
}`,

  knob: `<!-- arc is the sweep in degrees; the gap stays centred at the bottom -->
<ApexKnob v-model="volume" label="Volume" :arc="180" />

<ApexKnob v-model="volume" label="Volume"
  value-color="#C24A06" :rail-width="6" :text-size="24"
  :ui="{ range: 'k-rail', text: 'k-text' }" />

/* railWidth is new: the unfilled arc used to be forced to strokeWidth,
   so a thin rail behind a thick value arc was not expressible. */
.k-rail.apex-knob__range { --apex-knob-range: #EADFD6; }
.k-text.apex-knob__text  { font-weight: 700; }`,

  slider: `<ApexSlider v-model="brightness" label="Brightness" show-tooltip
  color="#C24A06" :handle-size="24"
  tooltip-background="#C24A06" tooltip-color="#fff"
  :ui="{ track: 's-track', handle: 's-handle' }" />

/* The value bubble was pinned to the sidebar surface with no way out. */
.s-track.apex-slider__track  { --apex-slider-track: #EADFD6; }
.s-handle.apex-slider__handle { box-shadow: 0 2px 8px rgb(196 74 6 / 0.4); }`,

  button: `<!-- A severity is four variables. Set them and every variant follows:
     solid uses color for the background, outlined and text use it for the
     foreground, and all three use tintColor for the hover wash. -->
<ApexButton
  color="#6F2A03" hover-color="#8F3A08"
  label-color="#FFF8F2" tint-color="rgb(111 42 3 / 0.12)"
>Cocoa</ApexButton>

<ApexButton variant="outlined" color="#6F2A03" tint-color="rgb(111 42 3 / 0.12)">Cocoa</ApexButton>

/* Or as a reusable class, which is closer to a real severity. */
.sev-cocoa.apex-btn {
  --apex-btn-color: #6F2A03;
  --apex-btn-hover: #8F3A08;
  --apex-btn-label: #FFF8F2;
  --apex-btn-tint:  rgb(111 42 3 / 0.12);
}`,

  splitbutton: `<!-- Both halves are .apex-btn, so one set of colours covers them. -->
<ApexSplitButton label="Save" :model="items"
  color="#6F2A03" hover-color="#8F3A08" label-color="#fff"
  :ui="{ action: 'sb-action', toggle: 'sb-toggle' }" />

<!-- The overlay is a second surface with its own colours. It sits inside
     .apex-split, so the menu-* props ride on the same element as the
     button's own — there is no separate wrapper to reach for. -->
<ApexSplitButton label="Save" :model="items"
  menu-background="#101820" menu-border-color="#243040" menu-radius="12px"
  menu-color="#E8EEF7" menu-hover-background="#1D2735" menu-hover-color="#fff"
  menu-icon-color="#7AA2F7" menu-header-color="#8B98AD"
  menu-hint-color="#6B7789" menu-separator-color="#243040"
  :ui="{ menu: 'sb-menu', menuItem: 'sb-row' }" />

/* The class map follows the recursion, so a submenu's rows carry
   menuItem too — you style one level and get every level. */`,

  speeddial: `<ApexSpeedDial :items="items" color="#6F2A03" mask mask-color="#2A1206"
  :ui="{ trigger: 'dial-trigger', action: 'dial-action', tooltip: 'dial-tip' }" />

<!-- The trigger takes the shared button props; the small round actions it
     fans out are their own surface. actionSize sets the trigger diameter
     and, six pixels smaller, each action. -->
<ApexSpeedDial :items="items"
  action-background="#101820" action-color="#E8EEF7"
  action-border-color="#243040" action-radius="10px"
  action-hover-color="#7AA2F7" action-hover-border-color="#7AA2F7"
  action-size="64px" :ui="{ action: 'dial-action' }" />

/* ui.action is the button you see; ui.item is the wrapper that places it
   on the arc. Paint the first, position with the second. */

/* radius on this control is the arc radius in pixels, not a corner radius —
   it predates the shared appearance props, which stand aside here. */`,

  buttongroup: `<ApexButtonGroup label="View mode" help="Applies to every display."
  :ui="{ frame: 'vm-frame', help: 'vm-help' }" />

/* The help line has its own class. It used to be .apex-field__msg, so a
   field-message override restyled it by accident. */
.vm-help.apex-btngroup__help { --apex-btngroup-help-fg: #6F2A03; }`,

  icon: `<!-- All three are already variables, set from the props. -->
<ApexIcon name="star" :size="30" :weight="600" fill :ui="{ root: 'gold' }" />

.gold.apex-icon { color: #C9971B; }

/* An icon paints in currentColor, so most of the time the containing
   element's colour is the only thing you need to set. */`,

  tags: `<ApexTags v-model="tags" label="Tags" :ui="{ chip: 'brand-chip' }" />

.brand-chip.apex-chip {
  --apex-chip-bg: #FFF1E5;
  --apex-chip-fg: #6F2A03;
  --apex-chip-border: #C24A06;
  --apex-chip-radius: 6px;
}`,
};

export const ENTRIES: DocEntry[] = [
  {
    id: 'icon', name: 'ApexIcon', group: 'Foundations',
    demo: 'icon',
    blurb: 'Material Symbols rendered as a ligature span. Size, weight, fill and a spin state are props; weight follows the surrounding text unless you pin it. Every other control renders icons through this one, so swapping icon sets is a single plugin option.',
    noField: true,
    base: { name: 'settings', size: 28 },
    controls: [
      { key: 'name', type: 'text' }, { key: 'size', type: 'number' },
      { key: 'weight', type: 'number' }, { key: 'fill', type: 'bool' },
      { key: 'spin', type: 'bool' }, { key: 'label', type: 'text' },
    ],
    props: [
      ['name', 'string', '—', 'Material Symbols glyph name, e.g. calendar_month'],
      ['size', 'number | string', 'inherited', 'Pixels, or any CSS length as a string'],
      ['weight', 'number', 'inherited', 'Weight axis, 200–700. Unset, it follows the surrounding text'],
      ['fill', 'boolean', 'false', 'Solid rather than outlined'],
      ['spin', 'boolean', 'false', 'Rotates continuously — for progress_activity'],
      ['label', 'string', '—', 'Accessible name. Without it the icon is aria-hidden, which is right for decoration'],
    ],
    events: [],
  },
  {
    id: 'field', name: 'ApexField', group: 'Text',
    blurb: 'The shell every other field is built on \u2014 label, control, one message line. Not usually used directly, but it is where the shared props, the CSS variables and the class hooks live, so it is the page to read when you want a field to look like something else.',
    demo: 'field',
    base: { label: 'Port', help: 'Between 1 and 65535.' },
    controls: [],
    props: [
      ['label / labelIcon', 'string', '\u2014', 'The label and an optional glyph beside it'],
      ['labelPlacement', 'ApexLabelPlacement', "'top'", 'Nine placements \u2014 see the section below'],
      ['labelWidth', 'string', "'160px'", 'Label column width for before and after'],
      ['help / error / warning / success', 'string', '\u2014', 'The message line, in precedence order'],
      ['tone', "'default' | 'danger' | 'warning' | 'success'", "'default'", 'Forces a tone; otherwise derived from the messages'],
      ['rules', 'ApexRule[]', '\u2014', 'Value-driven formatting \u2014 see Conditional formatting'],
      ['required / disabled / readonly', 'boolean', 'false', ''],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Sets the height, font size, padding and icon size'],
      ['statusIcon', 'boolean', 'true', 'The tone glyph inside the box'],
      ['value', 'unknown', '\u2014', 'What the rules evaluate, and what marks the field filled'],
      ['ui', 'ApexFieldClasses', '\u2014', 'Your own class on any part \u2014 see Class hooks'],
    ],
    events: [],
    slots: [['default', 'The control. Receives { id, describedBy, invalid, tone, size, disabled, statusGlyph, ui }']],
  },
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
  {
    id: 'number', name: 'ApexNumber', group: 'Numbers',
    blurb: 'Numeric entry with a currency prefix or unit suffix. Clamps to min/max on blur.',
    model: 24,
    base: { label: 'Rotation interval', unit: 'sec', min: 5, max: 600, align: 'center', help: 'Between 5 and 600 seconds.' },
    controls: [
      { key: 'label', type: 'text' }, { key: 'unit', type: 'text' }, { key: 'currency', type: 'text' },
      { key: 'align', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'min', type: 'number' }, { key: 'max', type: 'number' }, { key: 'step', type: 'number' },
      { key: 'clamp', type: 'bool' }, { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'number | null', '—', 'v-model'],
      ['unit', 'string', '—', 'Suffix tag — sec, %, days'],
      ['currency', 'string', '—', 'Prefix tag — €, $'],
      ['min / max / step', 'number', '—', 'Native constraints'],
      ['precision', 'number', '—', 'Decimals to round to on blur'],
      ['clamp', 'boolean', 'true', 'Pull out-of-range values back on blur'],
      ['align', "'start' | 'center' | 'end'", "'center'", 'Where the value sits between the affixes'],
    ],
    events: [['update:modelValue', 'number | null'], ['focus / blur', '—']],
  },
  {
    id: 'stepper', name: 'ApexStepper', group: 'Numbers',
    blurb: 'Small integer entry. Buttons disable at the bounds.',
    model: 3,
    base: { label: 'Displays included', min: 0, max: 20, step: 1, unit: 'screens', align: 'center' },
    controls: [
      { key: 'label', type: 'text' }, { key: 'unit', type: 'text' },
      { key: 'align', type: 'select', options: ['start', 'center', 'end'] }, { key: 'min', type: 'number' },
      { key: 'max', type: 'number' }, { key: 'step', type: 'number' },
      { key: 'decrementIcon', type: 'text' }, { key: 'incrementIcon', type: 'text' },
      { key: 'decrementText', type: 'text' }, { key: 'incrementText', type: 'text' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'number', '0', 'v-model'],
      ['min / max', 'number', '—', 'Buttons disable at the bound'],
      ['step', 'number', '1', 'Increment'],
      ['unit', 'string', '—', 'Suffix tag inside the box, as on ApexNumber'],
      ['decrementIcon / incrementIcon', 'string', "'remove' / 'add'", 'Material Symbols name on each button'],
      ['decrementText / incrementText', 'string', '—', 'A literal character instead of the icon; wins when both are set'],
      ['align', "'start' | 'center' | 'end'", "'center'", 'Where the value sits between the buttons'],
    ],
    events: [['update:modelValue', 'number']],
  },
  {
    id: 'knob', name: 'ApexKnob', group: 'Numbers',
    blurb: 'A dial for number entry. Drag around it, scroll while focused, or use the arrow keys. Boundaries, step, diameter, stroke width and colours are all configurable.',
    model: 42,
    base: { label: 'Volume', min: 0, max: 100, step: 1, diameter: 120, strokeWidth: 14 },
    controls: [
      { key: 'label', type: 'text' }, { key: 'min', type: 'number' }, { key: 'max', type: 'number' },
      { key: 'step', type: 'number' }, { key: 'arc', type: 'number' },
      { key: 'diameter', type: 'number' }, { key: 'strokeWidth', type: 'number' },
      { key: 'railWidth', type: 'number' }, { key: 'textSize', type: 'number' },
      { key: 'valueColor', type: 'text' }, { key: 'rangeColor', type: 'text' }, { key: 'textColor', type: 'text' },
      { key: 'hideValue', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'number', 'min', 'v-model'],
      ['min / max', 'number', '0 / 100', 'Boundaries'],
      ['step', 'number', '1', 'Size of each movement'],
      ['arc', 'number', '270', 'Sweep in degrees. 180 is a half dial, 360 a closed ring; the gap stays centred at the bottom. Clamped to 20–360'],
      ['diameter', 'number', '110', 'Diameter in pixels'],
      ['strokeWidth', 'number', '14', 'Value arc thickness in pixels'],
      ['railWidth', 'number', 'strokeWidth', 'Unfilled arc thickness, when it should differ'],
      ['textSize', 'number', '19', 'Centre text size in pixels'],
      ['valueColor / rangeColor / textColor', 'string', 'tokens', 'Any CSS colour'],
      ['hideValue', 'boolean', 'false', 'Hide the centre number'],
      ['valueTemplate', '(v: number) => string', '—', "Format the centre text, e.g. v => v + '%'"],
    ],
    events: [['update:modelValue', 'number'], ['change', 'number']],
  },
  {
    id: 'slider', name: 'ApexSlider', group: 'Numbers',
    blurb: 'Drag a handle along a track. Single value or a two-handle range, horizontal or vertical, with a configurable step and a minimum gap between handles.',
    model: 42,
    base: { label: 'Brightness', min: 0, max: 100, step: 1, showTooltip: true },
    controls: [
      { key: 'label', type: 'text' }, { key: 'min', type: 'number' }, { key: 'max', type: 'number' },
      { key: 'step', type: 'number' }, { key: 'range', type: 'bool' },
      { key: 'minStepsBetweenHandles', type: 'number' },
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'length', type: 'number' }, { key: 'trackSize', type: 'number' },
      { key: 'showTooltip', type: 'bool' },
      { key: 'color', type: 'color' }, { key: 'trackColor', type: 'color' }, { key: 'handleColor', type: 'color' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'number | number[]', 'min', 'v-model; an array in range mode'],
      ['min / max', 'number', '0 / 100', 'Boundaries'],
      ['step', 'number', '1', 'Size of each movement'],
      ['range', 'boolean', 'false', 'Two handles; the value becomes an array'],
      ['minStepsBetweenHandles', 'number', '0', 'Minimum steps the handles keep apart'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", ''],
      ['length', 'number', '180', 'Track length in pixels — sets the vertical track length, and floors the horizontal track width'],
      ['trackSize', 'number', '6', 'Track thickness in pixels'],
      ['showTooltip', 'boolean', 'false', 'Value bubble on hover, focus and drag'],
      ['color / trackColor / handleColor', 'string', 'tokens', 'Any CSS colour'],
    ],
    events: [['update:modelValue', 'number | number[]'], ['change', 'fired during the drag'], ['slideend', 'fired once the drag completes']],
  },
  {
    id: 'datepicker', name: 'ApexDatePicker', group: 'Dates',
    blurb: 'Calendar popup on the same shell as the selects. Single, multiple or range selection; date, month or year views; optional time picker; boundaries, locales, button bar and inline mode.',
    /* The gallery seeds this with `new Date()`. Here the value is JSON-cloned
       when you switch pages or press reset, which would turn a Date into an
       ISO string the dd/mm/yy parser then rejects. A string in the field's own
       format survives the round trip, and `modelType: 'date'` still hands your
       code a real Date once a day is picked. */
    model: '14/03/2026',
    base: { label: 'Campaign start', dateFormat: 'dd/mm/yy', showIcon: true, showButtonBar: true, clearable: true },
    controls: [
      { key: 'label', type: 'text' }, { key: 'dateFormat', type: 'text' },
      { key: 'selectionMode', type: 'select', options: ['single', 'multiple', 'range'] },
      { key: 'view', type: 'select', options: ['date', 'month', 'year'] },
      { key: 'modelType', type: 'select', options: ['date', 'string'] },
      { key: 'numberOfMonths', type: 'number' },
      { key: 'showIcon', type: 'bool' }, { key: 'showTime', type: 'bool' },
      { key: 'hourFormat', type: 'select', options: ['24', '12'] },
      { key: 'showSeconds', type: 'bool' }, { key: 'timeOnly', type: 'bool' },
      { key: 'showButtonBar', type: 'bool' }, { key: 'inline', type: 'bool' },
      { key: 'readonlyInput', type: 'bool' }, { key: 'clearable', type: 'bool' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'Date | string | (Date|string)[]', '—', 'v-model; an array for multiple and range'],
      ['dateFormat', 'string', "'dd/mm/yy'", "d dd o oo D DD m mm M MM y yy @ ! '…' — anything else is literal"],
      ['modelType', "'date' | 'string'", "'date'", 'What v-model holds'],
      ['selectionMode', "'single' | 'multiple' | 'range'", "'single'", ''],
      ['view', "'date' | 'month' | 'year'", "'date'", 'Month-only and year-only pickers'],
      ['locale', 'Partial<ApexDateLocale>', 'English', 'Day and month names, firstDayOfWeek, button labels'],
      ['numberOfMonths', 'number', '1', 'Months shown side by side'],
      ['minDate / maxDate', 'Date', '—', 'Permitted boundaries'],
      ['disabledDates', 'Date[]', '—', 'Specific dates to block'],
      ['disabledDays', 'number[]', '—', 'Weekday indexes to block, 0 = Sunday'],
      ['showIcon / icon', 'boolean / string', 'false', 'Calendar button beside the field'],
      ['showButtonBar', 'boolean', 'false', 'Today and Clear in the footer'],
      ['showTime / timeOnly', 'boolean', 'false', 'Time picker, with or without the calendar'],
      ['hourFormat', "'12' | '24'", "'24'", ''],
      ['showSeconds / stepMinute', 'boolean / number', 'false / 1', ''],
      ['inline', 'boolean', 'false', 'Render the calendar in place'],
      ['readonlyInput', 'boolean', 'false', 'Calendar only, no typing'],
    ],
    events: [['update:modelValue', 'Date | string | array'], ['change', '—'], ['month-change', '{ month, year }']],
    slots: [['date', 'Custom cell content; receives { date, outside, selected }']],
  },
  {
    id: 'button', name: 'ApexButton', group: 'Actions',
    blurb: 'Eight severities \u00d7 four variants, three sizes, four icon positions, raised elevation, pill and circular shapes, a corner badge and a loading state. Renders an <a> when given href.',
    noField: true, demo: 'button',
    base: { severity: 'primary', variant: 'solid', icon: 'check', label: 'Save changes' },
    controls: [
      { key: 'severity', type: 'select', options: [...SEVERITIES] },
      { key: 'variant', type: 'select', options: ['solid', 'outlined', 'text', 'link'] },
      { key: 'label', type: 'text' }, { key: 'icon', type: 'text' }, { key: 'trailingIcon', type: 'text' },
      { key: 'iconPos', type: 'select', options: ['left', 'right', 'top', 'bottom'] },
      { key: 'badge', type: 'text' },
      { key: 'badgeSeverity', type: 'select', options: ['contrast', ...SEVERITIES.filter((x) => x !== 'contrast')] },
      { key: 'raised', type: 'bool' }, { key: 'rounded', type: 'bool' }, { key: 'iconOnly', type: 'bool' },
      { key: 'loading', type: 'bool' }, { key: 'disabled', type: 'bool' }, { key: 'block', type: 'bool' },
    ],
    props: [
      ['severity', "'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'contrast'", "'primary'", 'Colour role'],
      ['variant', "'solid' | 'outlined' | 'text' | 'link'", "'solid'", 'Legacy values (ghost, outline-danger\u2026) still resolve'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['icon / trailingIcon', 'string', '\u2014', 'Material Symbols name'],
      ['iconPos', "'left' | 'right' | 'top' | 'bottom'", "'left'", 'Top and bottom stack the icon over the label'],
      ['raised', 'boolean', 'false', 'Elevation shadow; lifts text and outlined onto a surface'],
      ['rounded', 'boolean', 'false', 'Circular border radius'],
      ['iconOnly', 'boolean', 'false', 'Square, or circular with rounded \u2014 needs `label` for the accessible name'],
      ['label', 'string', '\u2014', 'Accessible name, and the fallback for the default slot'],
      ['badge / badgeSeverity', 'string | number / severity', '\u2014 / contrast', 'Corner badge'],
      ['loading', 'boolean', 'false', 'Spinner replaces the icon; disables the button'],
      ['block', 'boolean', 'false', 'Full width'],
      ['href / target', 'string', '\u2014', 'Renders an anchor instead of a button'],
    ],
    events: [['click', 'MouseEvent']],
    slots: [['default', 'Button content; falls back to `label`']],
  },
  {
    id: 'splitbutton', name: 'ApexSplitButton', group: 'Actions',
    blurb: 'A default action plus an overlay of related commands. Icons, separators, section headers and nested submenus, with the full button vocabulary \u2014 severity, variant, raised, rounded, sizes.',
    noField: true, demo: 'split',
    base: { label: 'Save', icon: 'check', model: SPLIT_MODEL },
    controls: [
      { key: 'label', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'severity', type: 'select', options: [...SEVERITIES] },
      { key: 'variant', type: 'select', options: ['solid', 'outlined', 'text', 'link'] },
      { key: 'raised', type: 'bool' }, { key: 'rounded', type: 'bool' },
      { key: 'menuAlign', type: 'select', options: ['end', 'start'] },
      { key: 'menuIcon', type: 'text' },
      { key: 'loading', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['label / icon', 'string', '\u2014', 'The default action'],
      ['model', 'MenuItem[]', '[]', '{ label, icon?, hint?, disabled?, href?, items? }, { separator: true }, { header }'],
      ['severity', 'ApexSeverity', "'primary'", 'Same eight roles as ApexButton'],
      ['variant', "'solid' | 'outlined' | 'text' | 'link'", "'solid'", ''],
      ['raised / rounded', 'boolean', 'false', 'Elevation, circular radius'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['menuAlign', "'start' | 'end'", "'end'", 'Which edge the overlay opens to'],
      ['menuIcon / menuLabel', 'string', "'keyboard_arrow_down' / 'More options'", 'Chevron glyph and its accessible name'],
      ['loading / disabled', 'boolean', 'false', ''],
    ],
    events: [['click', 'MouseEvent \u2014 the default action'], ['item-click', '{ item, event }'], ['show / hide', '\u2014']],
    slots: [['default', 'Action label; falls back to `label`']],
  },
  {
    id: 'speeddial', name: 'ApexSpeedDial', group: 'Actions',
    blurb: 'A floating trigger that fans related actions out around it. Linear, circle, semi-circle or quarter-circle, with a staggered entrance and an optional page mask.',
    noField: true, demo: 'dial',
    base: { items: DIAL_ITEMS, type: 'linear', direction: 'up', tooltip: true },
    controls: [
      { key: 'type', type: 'select', options: ['linear', 'circle', 'semi-circle', 'quarter-circle'] },
      { key: 'direction', type: 'select', options: ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'] },
      { key: 'radius', type: 'number' }, { key: 'gap', type: 'number' },
      { key: 'transitionDelay', type: 'number' },
      { key: 'icon', type: 'text' }, { key: 'activeIcon', type: 'text' },
      { key: 'severity', type: 'select', options: [...SEVERITIES] },
      { key: 'tooltip', type: 'bool' }, { key: 'hover', type: 'bool' },
      { key: 'mask', type: 'bool' },
      { key: 'maskColor', type: 'color' }, { key: 'maskOpacity', type: 'number' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['items', 'SpeedDialItem[]', '[]', '{ icon?, label?, tooltip?, disabled?, href?, target? } \u2014 plus anything else, returned on @item-click'],
      ['type', "'linear' | 'circle' | 'semi-circle' | 'quarter-circle'", "'linear'", 'Item layout'],
      ['direction', "'up' | 'down' | 'left' | 'right' | four diagonals", "'up'", 'Diagonals apply to linear and quarter-circle'],
      ['radius', 'number', '92', 'Arc radius in pixels \u2014 circle, semi-circle, quarter-circle'],
      ['gap', 'number', '48', 'Spacing between linear items, in pixels'],
      ['transitionDelay', 'number', '30', "Delay between each item's appearance, in ms \u2014 reversed on close"],
      ['icon / activeIcon', 'string', "'add' / 'close'", 'Trigger glyph while closed and open'],
      ['severity', 'ApexSeverity', "'primary'", 'Trigger colour role'],
      ['mask', 'boolean', 'false', 'Dim the page behind the open items'],
      ['maskColor / maskOpacity', 'string / number', "'#0F141C' / 0.4", 'Mask colour and opacity'],
      ['tooltip', 'boolean', 'false', 'Show each label on hover and focus'],
      ['hover', 'boolean', 'false', 'Open on hover instead of click'],
      ['position', "'inline' | four corners", "'inline'", 'Pin to a viewport corner'],
    ],
    events: [['item-click', '{ item, index, event }'], ['update:open', 'boolean'], ['show / hide', '\u2014']],
  },
  {
    id: 'buttongroup', name: 'ApexButtonGroup', group: 'Actions',
    blurb: 'Wraps ApexButtons into one seamless bar \u2014 inner radii drop and shared borders collapse. Horizontal or vertical.',
    noField: true, demo: 'group',
    base: {},
    controls: [
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'block', type: 'bool' }, { key: 'label', type: 'text' },
      { key: 'hideLabel', type: 'bool' }, { key: 'help', type: 'text' },
    ],
    props: [
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", ''],
      ['block', 'boolean', 'false', 'Full width, equal-width buttons'],
      ['size', "'sm' | 'md' | 'lg'", '\u2014', "Sizes every button in the group, overriding each button's own size"],
      ['label', 'string', '\u2014', 'Frames the group and sits on the border, like a fieldset legend'],
      ['hideLabel', 'boolean', 'false', 'Keep `label` as the accessible name without drawing the frame'],
      ['help', 'string', '\u2014', 'Help text under the frame'],
    ],
    events: [],
    slots: [['default', 'The ApexButtons']],
  },
];
