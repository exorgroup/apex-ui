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

/**
 * How to drive a service-backed control from the playground.
 *
 * Four of these exist and they differ only in which composable and method to
 * call, so naming them beats a branch per control in the stage.
 */
export interface ServiceSpec {
  /** Composable to call, e.g. 'useApexToast'. Resolved from a fixed map. */
  composable: string;
  /** What the snippet names the returned handle, e.g. 'toast'. */
  handle?: string;
  /** The method the trigger fires, e.g. 'add'. Receives the rail's options. */
  method: string;
  /** Singleton host the harness mounts once at the app root, e.g. 'ApexToast'. */
  host?: string;
  /** Trigger label. Default 'Show'. */
  trigger?: string;
  /**
   * Further buttons, as [label, method]. A service that queues needs a way to
   * clear the queue, or a few clicks bury the page in toasts.
   */
  extras?: string[][];
}

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
   *
   * `plain` is for a control that renders from its props and has no model at
   * all — ApexIcon, ApexBadge, ApexAvatar.
   */
  demo?: 'plain' | 'chip' | 'meter' | 'inplace' | 'block' | 'scrolltop'
    | 'button' | 'split' | 'dial' | 'group' | 'field' | 'order' | 'container'
    | 'overlay' | 'menu';
  model?: unknown;
  /** Props the demo starts with, and the baseline every section renders from. */
  base?: Record<string, unknown>;
  controls: DocControl[];
  /** [prop, type, default, notes] */
  props: string[][];
  events: string[][];
  slots?: string[][];
  /** [name, what it does] — what defineExpose offers, where a control has one. */
  exposed?: string[][];
  /**
   * A directive rather than a component: `apex-ripple` renders as
   * `v-apex-ripple` on a host element.
   *
   * These still have a props table and a playground — the bindings are props
   * in every sense that matters, and they are worth trying. What differs is
   * that a directive has no tag of its own, so the snippet and the stage both
   * need a host to put it on, which is what hostTag and hostLabel supply.
   */
  directiveName?: string;
  hostTag?: 'div' | 'button';
  hostLabel?: string;
  /**
   * An imperative service rather than a component you place: the API is a
   * function you call, and the visible part is a singleton host mounted once
   * near the app root. ApexToast, ApexAlert, ApexDynamicDialog.
   *
   * The playground still works, but it means something different. There is no
   * tag to bind props to, so the rail assembles the *options object* the call
   * takes, and a trigger button makes the call. What appears is transient, and
   * appears wherever the host is — not inside the stage.
   */
  service?: ServiceSpec;
  /**
   * The options interface this control's props table documents, when that is
   * an interface under core/ rather than a component's defineProps — every
   * directive and every service. 'TooltipOptions', 'ToastMessage'.
   *
   * The guards resolve the page against this instead of a .vue file. Without
   * it they silently skip the control: there is no component to compare
   * against, so nothing is checked and everything reads as clean.
   */
  optionsType?: string;
  /**
   * Default-slot text for the playground stage, where the control renders
   * nothing without children. ApexMessage is a box around its content: bound
   * to props alone it is an empty tinted strip, and every rail control looks
   * like it does nothing.
   */
  slotText?: string;
  /** Opening attributes for the usage snippet, before the playground props. */
  lead?: string[];
  /**
   * Closing text for the usage snippet, where the default `/>` is wrong —
   * a self-closing tag for a control that takes no children, or the closing
   * tag plus slot markup for one that does.
   */
  tail?: string;
  /**
   * A companion the props table cannot describe: a wrapper, an imperative
   * service, a set of helper classes. ApexBadge's is ApexOverlayBadge.
   * [name, type, notes]
   */
  serviceTitle?: string;
  serviceRows?: string[][];
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
 * The switch's in-track labels, shown live rather than quoted — what is worth
 * seeing is that the track does NOT resize as the word changes, which a code
 * block cannot demonstrate. The pairs deliberately vary in length.
 */
export const SWITCH_LABEL_CASES: Array<{ tag: string; bind: Record<string, unknown> }> = [
  { tag: 'ON / OFF', bind: { onLabel: 'ON', offLabel: 'OFF', label: 'Accepting bookings' } },
  { tag: 'Enabled / Disabled', bind: { onLabel: 'Enabled', offLabel: 'Disabled', label: 'Door sales' } },
  { tag: 'YES / NO', bind: { onLabel: 'YES', offLabel: 'NO', label: 'Send receipts' } },
  { tag: 'on-label only', bind: { onLabel: 'LIVE', label: 'Broadcast' } },
  { tag: 'no labels', bind: { label: 'The default' } },
  { tag: 'label before', bind: { onLabel: 'ON', offLabel: 'OFF', label: 'Reminders', labelPlacement: 'before' } },
];

export const SWITCH_LABELS_SNIPPET = `<!-- Both words are rendered into one grid cell, the hidden one still taking
     up its space, so the track measures the wider of the two and toggling
     never changes its width. Nothing to configure. -->
<ApexSwitch v-model="live" label="Accepting bookings" on-label="ON" off-label="OFF" />

<!-- Give only one and the other side shows nothing — useful for a switch that
     announces itself when on and stays quiet when off. -->
<ApexSwitch v-model="onAir" label="Broadcast" on-label="LIVE" />

/* The colours, if the defaults do not suit. The off word takes --fg-default
   rather than white, because the off track is --border-strong and the two flip
   together with the theme; set both if you set a track colour of your own. */
.live-switch {
  --apex-switch-on-bg: #137C4A;
  --apex-switch-on-fg: #fff;
  --apex-switch-off-bg: #3A4657;
  --apex-switch-off-fg: #0F141C;
}

<ApexSwitch v-model="live" on-label="ON" off-label="OFF" :ui="{ control: 'live-switch' }" />`;

/* --- The container examples, ported from the gallery ---------------- */

/** The three tabs every ApexTabs example uses, so the panels line up. */
export const TAB_ITEMS = [
  { label: 'Account Info', icon: 'person' },
  { label: 'Payment', icon: 'credit_card', badge: 'New', badgeSeverity: 'primary' },
  { label: 'Preferences', icon: 'settings' },
];

/** Ten tabs, which is more than the strip can hold — the scrollable example. */
export const TAB_MANY = [
  'Overview', 'Displays', 'Playlists', 'Schedules', 'Reports',
  'Proof of play', 'Billing', 'Team', 'Integrations', 'Audit log',
].map((label) => ({ label }));

export const TAB_VARIANTS = ['underline', 'pill', 'enclosed'] as const;
export const TAB_PLACEMENTS = ['top', 'bottom', 'left', 'right'] as const;

/** One disabled tab in the middle, to show the arrow keys stepping over it. */
export const TAB_ONE_DISABLED = [
  { label: 'Active' }, { label: 'Blocked', disabled: true }, { label: 'Also fine' },
];

export const TAB_BADGED = [
  { label: 'Inbox', icon: 'inbox', badge: 12, badgeSeverity: 'primary' },
  { label: 'Flagged', icon: 'flag', badge: 3, badgeSeverity: 'danger' },
  { label: 'Archive', icon: 'archive', badge: 0 },
];

/** The toolbar's navigation-bar example: link labels, then the wrap example's. */
export const TBAR_LINKS = ['Products', 'Solutions', 'Resources', 'Pricing'];
export const TBAR_MARKS = ['Bold', 'Italic', 'Underline'];

/** The three steps every ApexSteps example walks through. */
export const STEP_ITEMS = [
  { label: 'Account', subtitle: 'Your details', icon: 'person' },
  { label: 'Payment', subtitle: 'Card or invoice', icon: 'credit_card' },
  { label: 'Confirm', subtitle: 'Review and submit', icon: 'task_alt' },
];

/** A publishing flow, for the connector-less indicator. */
export const STEP_PIPELINE = [
  { label: 'Draft' }, { label: 'Review' }, { label: 'Scheduled' }, { label: 'Live' },
];

export const STEP_PLANS = [
  { value: 'free', label: 'Free', help: '1 display' },
  { value: 'studio', label: 'Studio', help: '10 displays' },
];

/** Five messages for the splitter's advanced mail-client example. */
export const SPLIT_MAILS = [
  { from: 'A. Borg', time: '10:24', subject: 'Q1 marketing report', body: 'Please review the campaign metrics before Friday.' },
  { from: 'L. Rossi', time: '09:15', subject: 'Design system update', body: 'The new tokens are ready for review.' },
  { from: 'K. Weber', time: 'Yesterday', subject: 'Sprint retrospective', body: 'Notes from yesterday, key actions inside.' },
  { from: 'S. de Vries', time: 'Yesterday', subject: 'Server migration plan', body: 'Migration to the new cloud starts Monday.' },
  { from: 'M. Dubois', time: 'Monday', subject: 'New component release', body: 'Version 4.0 of the library is available.' },
];

export const SPLIT_PAIR = [{}, {}];
export const SPLIT_THIRDS = [{ size: 25, minSize: 15, maxSize: 40 }, { size: 50 }, { size: 25, minSize: 10 }];
export const SPLIT_COLLAPSIBLE = [{ size: 30, minSize: 18, collapsible: true, collapsedSize: 4 }, {}];
export const SPLIT_NESTED = [{ size: 25, minSize: 10 }, { size: 75 }];
export const SPLIT_EVENTS = [{ minSize: 15 }, { minSize: 15 }];
export const SPLIT_STATEFUL = [{ size: 40 }, { size: 60 }];
export const SPLIT_NAV = [
  { size: 32, minSize: 18, maxSize: 50, collapsible: true, collapsedSize: 0 }, {},
];

export const PANEL_REPEAT = [
  { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' },
];

export const LEGEND_ALIGNS = ['start', 'center', 'end'] as const;

/** The accordion's four panels. One is disabled, to show keys skipping it. */
export const FAQ_PANELS = [
  { value: 'about', header: 'What is APEX Pando?', icon: 'help',
    content: 'A digital signage platform: schedule playlists, pair displays and report on every playback.' },
  { value: 'secure', header: 'Is my data secure?', icon: 'lock',
    content: 'Everything is encrypted in transit and at rest, and proof-of-play logs are retained for seven years.' },
  { value: 'plan', header: 'Can I change plan later?', icon: 'sync_alt', badge: 'New',
    content: 'Yes — upgrade or downgrade at any time from account settings. Changes apply on the next billing cycle.' },
  { value: 'support', header: 'How do I reach support?', icon: 'support_agent', disabled: true,
    content: 'Enterprise plans include a named contact.' },
];

/** Built from a list, which is the point of the dynamic-panels example. */
export const FAQ_ZONES = [1, 2, 3, 4, 5].map((i) => ({
  value: `z${i}`,
  header: `Zone ${i}`,
  icon: 'grid_view',
  content: `Zone ${i} plays the default loop between 08:00 and 20:00.`,
}));

/** The three product shots the card's media examples use. */
export const CARD_MEDIA = ['totem-43', 'wall-55', 'menu-board'];

/** Six measurements over one disk, for the meter playground. They deliberately
    sum to 63 rather than 100: the remainder is the point of a meter, and a set
    that filled the track would hide it. */
export const MTR_DISK = [
  { label: 'Apps', value: 14 }, { label: 'Messages', value: 12 },
  { label: 'Media', value: 8 }, { label: 'System', value: 12 },
  { label: 'Documents', value: 6 }, { label: 'Cache', value: 11 },
];

/* ── AnimateOnScroll's four rows ──────────────────────────────────────────
   Each row demonstrates a different axis of the animation vocabulary:
   direction, alternating direction with a longer distance, rotation and
   scale, then scale with a stagger. One row would show only that it works. */

export const AOS_PLANS = [
  { title: 'Individual', icon: 'person', from: 'apex-from-l', blurb: 'One seat, everything included, cancel whenever.' },
  { title: 'Team', icon: 'group', from: '', blurb: 'Shared workspaces and role-based permissions.' },
  { title: 'Enterprise', icon: 'apartment', from: 'apex-from-r', blurb: 'SSO, audit logs and a dedicated environment.' },
];

export const AOS_PEOPLE = [
  { name: 'Jenna Thompson', role: 'Head of Design' },
  { name: 'Isabel Garcia', role: 'Staff Engineer' },
  { name: 'Xavier Mason', role: 'Product Lead' },
];

export const AOS_STATS = [
  { value: '850K', label: 'Customers', anim: 'apex-spin-45', blurb: 'Accounts active in the last 30 days.' },
  { value: '$1.5M', label: 'Revenue', anim: 'apex-zoom-50', blurb: 'Recurring revenue booked this quarter.' },
  { value: '140K', label: 'Sales', anim: 'apex-spin-n45', blurb: 'Orders processed since January.' },
];

export const AOS_ZOOMS = [
  { label: 'Bandwidth', icon: 'wifi', anim: 'apex-zoom-50', bg: '#6D4AC4', blurb: 'Unmetered transfer on every plan.' },
  { label: 'Storage', icon: 'database', anim: 'apex-zoom-75', bg: '#0E8C86', blurb: 'Object storage in three regions.' },
  { label: 'Requests', icon: 'swap_vert', anim: 'apex-zoom-50', bg: '#3F51B5', blurb: 'Burst capacity without pre-provisioning.' },
];

/** The lazy-loaded table inside ApexInplace. Four columns and a handful of
    rows: enough to look like real content arriving, small enough that the
    point is the fetch rather than the table. */
export const INP_COLUMNS = [
  { field: 'code', header: 'Code' },
  { field: 'name', header: 'Name' },
  { field: 'category', header: 'Category' },
  { field: 'quantity', header: 'Quantity' },
];

export const INP_ROWS = [
  { code: 'f230fh', name: 'Bamboo Watch', category: 'Accessories', quantity: 24 },
  { code: 'nvklal', name: 'Black Watch', category: 'Accessories', quantity: 61 },
  { code: 'zz21cz', name: 'Blue Band', category: 'Fitness', quantity: 2 },
  { code: '244wgerg', name: 'Blue T-Shirt', category: 'Clothing', quantity: 25 },
  { code: 'h456wer53', name: 'Bracelet', category: 'Accessories', quantity: 73 },
];

/** One item per colour notation the component accepts — oklch, hex, rgb —
    which is the point the Colour example is making. */
export const MTR_COLOURS = [
  { label: 'Violet', value: 12, color: 'oklch(0.55 0.20 300)' },
  { label: 'Emerald', value: 14, color: '#10B981' },
  { label: 'Rose', value: 10, color: 'rgb(244, 63, 94)' },
  { label: 'Blue', value: 8, color: '#3B82F6' },
  { label: 'Amber', value: 10, color: '#EAB308' },
];

/** Four items carrying icons, which replace their markers. */
export const MTR_ICONS = [
  { label: 'Apps', value: 25, color: 'oklch(0.55 0.20 300)', icon: 'grid_view' },
  { label: 'Messages', value: 15, color: '#10B981', icon: 'mail' },
  { label: 'Media', value: 20, color: '#F59E0B', icon: 'image' },
  { label: 'System', value: 10, color: '#3B82F6', icon: 'settings' },
];

/** Seven people for the avatar examples. Only the first three carry a status,
    so the group examples show both states without looking uniform. */
export const CREW = [
  { label: 'A. Borg', status: 'online' },
  { label: 'L. Rossi', status: 'busy' },
  { label: 'K. Weber', status: 'away' },
  { label: 'S. de Vries' },
  { label: 'M. Dubois' },
  { label: 'C. Ruiz' },
  { label: 'J. Camilleri' },
];

/** The removable-chip demo's starting tags, kept here so the Reset button has
    something to restore them from. */
export const CHIP_TAGS = ['Rotation A', 'Menu boards', 'Sliema', 'Evening loop'];

/** ApexChip's severities — the badge set plus `neutral`, its default. */
export const CHIP_SEVERITIES = [
  'neutral', 'primary', 'secondary', 'success', 'warn', 'danger', 'info', 'contrast',
] as const;

/** Twelve options for the selectable-chip example: enough to wrap onto more
    than one row, which is where a chip group earns its keep. */
export const CHIP_INTERESTS = [
  { label: 'Music', icon: 'music_note' }, { label: 'Movies', icon: 'movie' },
  { label: 'Travel', icon: 'flight' }, { label: 'Food', icon: 'restaurant' },
  { label: 'Sports', icon: 'sports_soccer' }, { label: 'Gaming', icon: 'sports_esports' },
  { label: 'Reading', icon: 'menu_book' }, { label: 'Photography', icon: 'photo_camera' },
  { label: 'Fitness', icon: 'fitness_center' }, { label: 'Technology', icon: 'memory' },
  { label: 'Art', icon: 'palette' }, { label: 'Nature', icon: 'park' },
];

/** ApexBadge's own severities — not the field set: it has `warn`, no
    `warning`, and neither `help` nor a plain `info` ordering. */
export const BDG_SEVERITIES = [
  'primary', 'secondary', 'success', 'warn', 'danger', 'info', 'contrast',
] as const;

/** A different count per severity, so the severity row does not read as one
    repeated number. */
export const BDG_COUNT: Record<string, number> = {
  primary: 2, secondary: 5, success: 8, warn: 3, danger: 9, info: 4, contrast: 7,
};

/** Fifteen makes with a count each — the ScrollArea's list content. */
export const AUTOMOBILES = [
  ['Audi', 200], ['BMW', 350], ['Mercedes-Benz', 420], ['Volkswagen', 510], ['Toyota', 610],
  ['Honda', 280], ['Hyundai', 390], ['Kia', 260], ['Ford', 470], ['Renault', 530],
  ['Peugeot', 310], ['Volvo', 180], ['Skoda', 240], ['Seat', 150], ['Fiat', 130],
].map(([label, value]) => ({ label: label as string, value: value as number }));

export const SCROLL_VARIANTS = ['auto', 'hover', 'scroll', 'always', 'hidden'] as const;

/** Wide content for the horizontal-axis example. */
export const SCROLL_WIDE = [
  { value: 'a', label: 'Doors open' }, { value: 'b', label: 'Support act' },
  { value: 'c', label: 'Interval' }, { value: 'd', label: 'Headline set' },
];

export const SCROLL_IN_PANEL_SNIPPET = `<!-- flush removes the panel's body padding so it does not stack with the
     scroll area's. Put the padding on the scroll area instead: the bar then
     sits at the panel's edge rather than floating inside a second inset. -->
<ApexPanel header="Recent bookings" flush>
  <ApexScrollArea max-height="200px" padding="14px" mask>
    <p v-for="b in bookings" :key="b.id">…</p>
  </ApexScrollArea>
</ApexPanel>

/* Give the scroll area maxHeight rather than height, and a short list keeps
   the panel short instead of leaving a gap under it. */`;

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
/** Every placement ApexToast's position union allows. */
export const TOAST_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right', 'center',
] as const;

/**
 * A line per severity for the toast Severity section. Six buttons firing the
 * same sentence would show the tints but say nothing about when each is used.
 */
export const TOAST_LINES: Record<string, string> = {
  success: 'Your changes are live.',
  info: 'A new version is available.',
  warn: 'Two seats are still unassigned.',
  error: 'The upload could not be completed.',
  secondary: 'Processing may take a few moments.',
  contrast: 'You are currently in offline mode.',
};

/**
 * One line per severity, so the Variant section can show the same four
 * messages twice without repeating their text in the template.
 */
export const MSG_TEXT: Record<string, string> = {
  success: 'Your account is now ready.',
  info: 'Upgrade now and save 5%.',
  warn: 'Your subscription is about to expire.',
  error: 'Something went wrong.',
};

/**
 * ApexDialog's nine placements, in the reading order the 3×3 grid needs —
 * corners and edges interleaved, so the buttons sit where the dialog will.
 */
export const DLG_POSITIONS = [
  'topleft', 'top', 'topright',
  'left', 'center', 'right',
  'bottomleft', 'bottom', 'bottomright',
] as const;

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
  ['.apex-pop__filter', 'The search row inside the overlay. Listbox and OrderList flatten it into the panel.', 'Select, Multiselect, Listbox, OrderList, TreeSelect'],
  ['.apex-pop__all', 'The select-all row, with its n/total count.', 'Multiselect, Listbox'],
  ['.apex-pop__box', 'The tick box on a row.', 'Multiselect'],
  ['.apex-pop__help', 'The secondary line under a row.', 'Select, Multiselect'],
  ['.apex-pop__empty', 'Shown when nothing matches the filter.', 'every control with an overlay'],
  ['.apex-cb', 'The shared checkbox, with .apex-cb__box and .apex-cb__help. Also has a --card variant.', 'Checkbox, CheckboxGroup, Listbox, OrderList, PickList, Tree, TreeTable, DataTable'],
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
  ['--apex-opt-radius', 'var(--r-sm)', 'Row corner radius'],
  ['--apex-pop-shadow', 'var(--shadow-md)', 'Overlay lift'],
  ['--apex-pop-max-h', '260px', 'Height at which the overlay starts scrolling'],
  ['--apex-pop-focus-border', 'var(--accent-primary)', 'Overlay border while the box has focus'],
  ['--apex-pop-filter-bg', 'var(--bg-elevated)', 'The search row inside the overlay'],
  ['--apex-pop-filter-border', 'var(--border-subtle)', 'Rule under the search row'],
  ['--apex-pop-filter-fg', 'var(--fg-default)', 'Search text'],
  ['--apex-pop-filter-placeholder', 'var(--fg-subtle)', 'Search placeholder'],
  ['--apex-pop-filter-icon', 'var(--fg-subtle)', 'Search icon'],
  ['--apex-pop-filter-flat-bg', 'var(--bg-subtle)', 'The search row where Listbox and OrderList flatten it into the panel'],
  ['--apex-pop-all-fg', 'var(--accent-primary)', 'The select-all row'],
  ['--apex-pop-all-hover-bg', 'var(--bg-muted)', 'Select-all under the pointer'],
  ['--apex-pop-all-border', 'var(--border-subtle)', 'Rule under select-all'],
  ['--apex-pop-all-count-fg', 'var(--fg-subtle)', 'The n/total beside it'],
  ['--apex-pop-box-border', 'var(--border-strong)', 'Tick box on a multi-select row'],
  ['--apex-pop-box-radius', 'var(--r-xs)', 'Tick box corner'],
  ['--apex-pop-box-on-bg', 'var(--accent-primary)', 'Tick box when checked'],
  ['--apex-pop-box-fg', '#fff', 'The tick itself — set it whenever you set a light on-bg'],
  ['--apex-pop-help-fg', 'var(--fg-subtle)', 'Secondary line under a row'],
  ['--apex-pop-empty-fg', 'var(--fg-subtle)', 'The no-results message'],
  ['--apex-cb-size', '18px', 'The shared checkbox, used by Listbox, OrderList, Multiselect, Tree and others'],
  ['--apex-cb-radius', 'var(--r-xs)', 'Checkbox corner'],
  ['--apex-cb-border', 'var(--border-strong)', 'Checkbox border'],
  ['--apex-cb-bg', 'var(--bg-surface)', 'Checkbox background'],
  ['--apex-cb-on-bg', 'var(--accent-primary)', 'Checked and indeterminate'],
  ['--apex-cb-tick', '#fff', 'The tick — same caveat as the overlay box'],
  ['--apex-cb-fg', 'var(--fg-default)', 'Checkbox label'],
  ['--apex-cb-help-fg', 'var(--fg-subtle)', 'Checkbox help line'],
  ['--apex-cb-focus-ring', 'var(--focus-ring)', 'Ring on keyboard focus'],
  ['--apex-cb-card-bg', 'var(--bg-surface)', 'The card variant'],
  ['--apex-cb-card-border', 'var(--border-default)', 'Card border'],
  ['--apex-cb-card-radius', 'var(--r-md)', 'Card corner'],
  ['--apex-cb-card-hover-border', 'var(--border-strong)', 'Card border on hover'],
  ['--apex-cb-card-on-border', 'var(--accent-primary)', 'Card border when checked'],
  ['--apex-cb-card-on-bg', 'color-mix(— 5%)', 'Card background when checked'],

  ['--apex-tree-row-fg', 'var(--fg-default)', 'ApexTreeSelect — a node at rest'],
  ['--apex-tree-row-radius', 'var(--r-sm)', 'Node corner'],
  ['--apex-tree-row-pad', '8px', 'Node vertical padding'],
  ['--apex-tree-row-fs', '14px', 'Node text size'],
  ['--apex-tree-row-hover-bg', 'var(--bg-muted)', 'Node under the pointer'],
  ['--apex-tree-row-selected-bg', 'color-mix(— 12%)', 'Selected node'],
  ['--apex-tree-row-selected-fg', 'var(--accent-primary)', 'Selected node text'],
  ['--apex-tree-twisty-fg', 'var(--fg-subtle)', 'The expand/collapse chevron'],
  ['--apex-tree-twisty-size', '20px', 'Chevron box — the leaf spacer reads this too, so rows stay in line'],
  ['--apex-tree-twisty-radius', 'var(--r-xs)', 'Chevron corner'],
  ['--apex-tree-twisty-hover-bg', 'var(--bg-subtle)', 'Chevron under the pointer'],
  ['--apex-tree-twisty-hover-fg', 'var(--fg-default)', 'Chevron glyph on hover'],
  ['--apex-tree-indent', '18px', 'How far each level steps in'],

  ['--apex-order-panel-bg', 'var(--bg-surface)', 'ApexOrderList — the framed panel'],
  ['--apex-order-panel-border', 'var(--border-default)', 'Panel edge'],
  ['--apex-order-panel-radius', 'var(--r-md)', 'Panel corner'],
  ['--apex-order-row-fg', 'var(--fg-default)', 'A row at rest'],
  ['--apex-order-row-radius', 'var(--r-sm)', 'Row corner'],
  ['--apex-order-row-pad', '9px', 'Row vertical padding'],
  ['--apex-order-row-fs', '14px', 'Row text size'],
  ['--apex-order-row-hover-bg', 'var(--bg-muted)', 'Row under the pointer'],
  ['--apex-order-row-selected-bg', 'color-mix(— 10%)', 'Chosen row'],
  ['--apex-order-row-selected-border', 'color-mix(— 30%)', 'Chosen row edge'],
  ['--apex-order-row-selected-fg', 'var(--accent-primary)', 'Chosen row text'],
  ['--apex-order-row-dragover-bg', 'var(--bg-subtle)', 'The row being dragged over'],
  ['--apex-order-row-dragover-border', 'var(--accent-primary)', 'Its edge — the only feedback the drag gives'],
  ['--apex-order-btn-bg', 'var(--bg-surface)', 'A move button'],
  ['--apex-order-btn-fg', 'var(--fg-muted)', 'Its glyph'],
  ['--apex-order-btn-border', 'var(--border-default)', 'Its edge'],
  ['--apex-order-btn-radius', 'var(--r-sm)', 'Its corner'],
  ['--apex-order-btn-size', '34px', 'Its box, both axes'],
  ['--apex-order-btn-hover-bg', 'var(--bg-subtle)', 'Move button under the pointer'],
  ['--apex-order-btn-hover-fg', 'var(--accent-primary)', 'Its glyph on hover'],
  ['--apex-order-btn-hover-border', 'var(--accent-primary)', 'Its edge on hover'],
  ['--apex-order-grip-fg', 'var(--fg-subtle)', 'The drag handle'],
  ['--apex-order-num-fg', 'var(--fg-subtle)', 'The position number'],
  ['--apex-order-num-fs', '11px', 'Its size'],
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

/**
 * "Add new" — the row both choosers can offer at the foot of their list.
 * One block, shown on ApexSelect and ApexMultiselect alike, because the API
 * and the flows are identical on both.
 */
export const ADD_NEW_PERMISSION = (Ctl: string, kind: AddNewKind = 'single') => {
  /* Same reason as the modal snippet: printing `:options` on the two that do
     not take it would show code that cannot run on the page it is shown on. */
  const list = kind === 'tree' ? ':nodes="localities"'
    : kind === 'order' ? '' : ':options="localities"';
  const model = kind === 'order' ? 'localities' : 'locality';
  const bind = `v-model="${model}"${list ? ` ${list}` : ''}`;
  return `// main.ts — register the resolver once and every chooser is gated.
// It is tied to no authorisation library: return a boolean however you like.
app.use(ApexUI, {
  canCreate: (resource) => permissions.value[resource]?.includes('create') ?? false,
});

// With apex-autentica, the same option reads its permission map:
import { can, useCan } from '@exorgroup/apex-autentica';
const { permissions } = useCan();
app.use(ApexUI, { canCreate: (r) => can(permissions.value, r, 'create') });

// Without any library at all — a plain list is perfectly valid:
const allowed = ['localities', 'venues'];
app.use(ApexUI, { canCreate: (r) => allowed.includes(r) });

<!-- Then a control only names what it creates. -->
<${Ctl} ${bind} add-new resource="localities" />

<!-- canAddNew overrides the resolver, in either direction. Useful for a
     screen-specific rule the resolver cannot know about. -->
<${Ctl} ${bind} add-new :can-add-new="form.editable" />

/* Denied means the row is hidden, not disabled: a greyed-out "Add new"
   still advertises a feature the user cannot have. And this is UX only —
   the endpoint that creates the record must authorise the request itself. */`;
};

/**
 * The six choosers take their list three different ways, so the snippet is
 * built per shape rather than printing `:options` for all of them:
 *   single / multi — `options`, and a scalar or array value
 *   tree           — `nodes`, and the event carries the branch
 *   order          — no list prop at all: v-model IS the collection
 */
export type AddNewKind = 'single' | 'multi' | 'cascade' | 'tree' | 'order';

/** The branch key differs: the cascade reads `value`, the tree reads `key`. */
const ID = { cascade: 'value', tree: 'key' } as const;

const FLAT = (C: string) => `<${C} v-model="locality" :options="localities" add-new resource="localities"
  filter @add-new="createLocality" />`;

const MODAL_TAG: Record<AddNewKind, (Ctl: string) => string> = {
  single: FLAT,
  multi: FLAT,
  // No filter: the cascade has none, so `query` always arrives empty.
  cascade: (C) => `<${C} v-model="locality" :options="localities" add-new
  resource="localities" @add-new="createLocality" />`,
  tree: (C) => `<${C} v-model="locality" :nodes="localities" add-new resource="localities"
  filter @add-new="createLocality" />`,
  order: (C) => `<!-- No list prop: v-model is the collection, in its current order. -->
<${C} v-model="localities" add-new resource="localities"
  filter @add-new="createLocality" />`,
};

const LEVELLED_SIG = (where: string) => `/* \`path\` is the branch the row sat under, root first — empty ${where}.
   One handler therefore serves every level. */
function createLocality({ query, path }) {
  const parent = path.length ? path[path.length - 1] : null;`;

const MODAL_SIG: Record<AddNewKind, string> = {
  single: 'function createLocality({ query }) {',
  multi: 'function createLocality({ query }) {',
  cascade: LEVELLED_SIG('at the first column'),
  tree: LEVELLED_SIG('at the foot'),
  order: 'function createLocality({ query }) {',
};

const LEVELLED_CLOSE = (id: string) => `      // The app owns the tree: insert under the branch, or at the root.
      const at = parent ? findNode(localities.value, parent.${id}) : null;
      if (at) (at.children ||= []).push(data);
      else localities.value.push(data);
      locality.value = data.${id};`;

const MODAL_CLOSE: Record<AddNewKind, string> = {
  single: `      localities.value.push(data);     // the app owns the list…
      locality.value = data.value;     // …and the value`,
  multi: `      localities.value.push(data);     // the app owns the list…
      locality.value = [...locality.value, data.value];  // …and the value`,
  cascade: LEVELLED_CLOSE(ID.cascade),
  tree: LEVELLED_CLOSE(ID.tree),
  order: `      // The collection IS the model, so appending puts the record last,
      // ready for the user to drag into place.
      localities.value = [...localities.value, data];`,
};

const PLAIN_HEADER = "{ header: 'New locality', width: '420px', modal: true }";
const LEVELLED_HEADER = "{ header: parent ? `New entry under ${parent.label}` : 'New locality', width: '420px', modal: true }";

const MODAL_HEADER: Record<AddNewKind, string> = {
  single: PLAIN_HEADER,
  multi: PLAIN_HEADER,
  cascade: LEVELLED_HEADER,
  tree: LEVELLED_HEADER,
  order: PLAIN_HEADER,
};

export const ADD_NEW_MODAL = (Ctl: string, kind: AddNewKind) => `<!-- The control emits and steps back. It never mutates the list or the
     value, so the same handler covers a dialog, a route or an inline form. -->
${MODAL_TAG[kind](Ctl)}

<script setup>
import { useApexDialog } from '@exorgroup/apex-ui';
import LocalityForm from './LocalityForm.vue';

const localities = ref([...]);
const locality = ref(${kind === 'multi' ? '[]' : 'null'});
const dialog = useApexDialog();

/* \`query\` is whatever was typed in the filter, so the form opens with the
   name already filled in — the user typed it once and should not retype it. */
${MODAL_SIG[kind]}
  dialog.open(LocalityForm, {
    props: ${MODAL_HEADER[kind]},
    contentProps: { name: query },
    onClose: ({ data }) => {
      if (!data) return;               // dismissed
${MODAL_CLOSE[kind]}
    },
  });
}
<\/script>

<!-- LocalityForm.vue — a small form that hands its record back. -->
<script setup>
const props = defineProps({ name: String });
const dialogRef = inject('dialogRef');   // plain object, not a ref
const form = reactive({ label: props.name ?? '', code: '' });

async function save() {
  const saved = await api.post('/localities', form);
  /* dialogRef is a plain object, not a ref — no .value. */
  dialogRef.close({ value: saved.id, label: saved.name });
}
<\/script>

/* The redirect flow needs none of this. Navigate in the handler; when the
   user comes back the page has refetched its options anyway. Worth knowing
   that leaving the page discards anything unsaved on the form behind it,
   which is the reason to prefer the dialog. */
function createLocality() { router.visit('/localities/create'); }`;

export const ADD_NEW_CASCADED = (Ctl: string) => `<!-- Cascaded: the form opened from the ${Ctl} above contains a chooser of
     its own, and that one offers Add New too. Nothing extra is needed —
     useApexDialog holds a stack, so each dialog sits above the one that
     opened it and closes independently.

     The inner control here is an ApexSelect whatever the outer one is: a
     country is one value off a short list, which is what a select is for.
     Any of the six would stack the same way. -->

<!-- LocalityForm.vue, opened from the picker above -->
<template>
  <ApexInput v-model="form.label" label="Locality" />

  <!-- …and this one can create a country without leaving the form. -->
  <ApexSelect v-model="form.country" :options="countries" label="Country"
    add-new resource="countries" filter @add-new="createCountry" />
</template>

<script setup>
const dialog = useApexDialog();
const countries = ref([...]);

function createCountry({ query }) {
  /* Opens a SECOND dialog over this one. z-index is handled: each instance
     gets 1000 + index * 10, so the new form is always on top. */
  dialog.open(CountryForm, {
    props: { header: 'New country', width: '380px', modal: true },
    contentProps: { name: query },
    onClose: ({ data }) => {
      if (!data) return;
      countries.value.push(data);
      form.country = data.value;   // back on the locality form, unharmed
    },
  });
}
<\/script>

/* One layout caveat, stated rather than discovered: a dialog panel is
   overflow:hidden and its body overflow:auto, so a select's overlay opened
   near the foot of a short dialog is clipped at the body edge and scrolls
   into view rather than floating over it. Give a dialog that hosts a
   chooser enough height, or put the chooser away from the bottom edge. */`;

/** Per-control customisation: [ui key, part, variables it responds to]. */
export const OWN_PARTS: Record<string, string[][]> = {
  listbox: [
    ['control', '.apex-listbox', '--apex-listbox-bg, --apex-listbox-border, --apex-listbox-radius'],
    ['list', '.apex-listbox__list', '--apex-listbox-focus-ring; scrollHeight caps its height'],
    ['group', '.apex-listbox__group', '--apex-listbox-group-fg — the heading a nested array produces'],
    ['option', '.apex-listbox__opt', '--apex-listbox-opt-fg, --apex-listbox-opt-radius, --apex-listbox-opt-hover-bg, --apex-listbox-opt-selected-bg, --apex-listbox-opt-selected-fg'],
    ['addNew', '.apex-pop__add', '--apex-pop-add-bg, --apex-pop-add-border, --apex-pop-add-fg, --apex-pop-add-hover-bg, --apex-pop-add-icon'],
    ['filter / selectAll / checkbox / empty', '.apex-pop__filter, .apex-pop__all, .apex-cb__box, .apex-pop__empty', 'shared — all on ApexField'],
  ],
  cascadeselect: [
    ['cascade', '.apex-cascade', 'the overlay holding the columns — layout only'],
    ['column', '.apex-cascade__panel', 'each column is also .apex-pop, so every --apex-pop-* applies'],
    ['heading', '.apex-cascade__heading', '--apex-cascade-heading-fg, --apex-cascade-heading-border (first column only)'],
    ['footer', '.apex-cascade__footer', '--apex-cascade-footer-fg, --apex-cascade-footer-border, --apex-cascade-footer-radius, --apex-cascade-footer-hover-bg'],
    ['addNew', '.apex-pop__add', '--apex-pop-add-bg, --apex-pop-add-border, --apex-pop-add-fg, --apex-pop-add-hover-bg, --apex-pop-add-icon — one per open column'],
    ['option / tick / empty', '.apex-pop__opt, .apex-pop__tick, .apex-pop__empty', 'shared — all on ApexField. The tick doubles as the branch arrow'],
  ],
  toolbar: [
    ['root', '.apex-tbar', '--apex-toolbar-bg, --apex-toolbar-border, --apex-toolbar-fg, --apex-toolbar-radius, --apex-toolbar-pad'],
    ['region', '.apex-tbar__region', '--apex-toolbar-gap — one of start / center / end'],
  ],
  tabs: [
    ['root', '.apex-tabs', '--apex-tabs-border, --apex-tabs-radius'],
    ['striparea / scroll', '.apex-tabs__striparea, .apex-tabs__scroll', 'the strip and its scroller — layout only'],
    ['strip', '.apex-tabs__strip', '--apex-tabs-strip-bg, --apex-tabs-strip-w (vertical placements)'],
    ['tab', '.apex-tabs__tab', '--apex-tabs-fg, --apex-tabs-active, --apex-tabs-fs, --apex-tabs-pad, --apex-tabs-tab-x, --apex-tabs-tab-y'],
    ['label / badge', '.apex-tabs__label, .apex-tabs__badge', 'the text and its count'],
    ['bar', '.apex-tabs__bar', '--apex-tabs-indicator. Its position and width are --apex-tabs-pos and --apex-tabs-size, which the component rewrites on every change — do not set them'],
    ['panels / panel', '.apex-tabs__panels, .apex-tabs__panel', 'the panel area, and one panel'],
  ],
  steps: [
    ['root', '.apex-st', '--apex-steps-fs'],
    ['item', '.apex-st__item', 'one step and everything in it'],
    ['marker', '.apex-st__marker', '--apex-steps-marker, --apex-steps-active, --apex-steps-complete — the numbered circle'],
    ['rail', '.apex-st__rail', '--apex-steps-line — the line joining the markers'],
    ['text / label / sub', '.apex-st__text, .apex-st__label, .apex-st__sub', 'the two lines beside a marker'],
    ['body / panel', '.apex-st__body, .apex-st__panel', "the current step's content"],
    ['nav / list', '.apex-st__nav, .apex-st__list', 'the Back / Next bar, and the rail as a list'],
  ],
  splitter: [
    ['root', '.apex-sp', '--apex-splitter-h, --apex-splitter-radius, --apex-splitter-border'],
    ['panel', '.apex-sp__panel', 'one pane — its width is a percentage the component owns'],
    ['gutter', '.apex-sp__gutter', '--apex-splitter-gutter, --apex-splitter-gutter-bg, --apex-splitter-gutter-hover'],
    ['grip', '.apex-sp__grip', 'the handle drawn on the gutter'],
  ],
  scrollarea: [
    ['root', '.apex-sa', '--apex-scroll-w, --apex-scroll-fade'],
    ['viewport', '.apex-sa__viewport', '--apex-scroll-h, --apex-scroll-max-h, --apex-scroll-pad — the clipping box'],
    ['content', '.apex-sa__content', 'what scrolls inside it'],
    ['bar', '.apex-sa__bar', '--apex-scroll-track, --apex-scroll-size, --apex-scroll-radius'],
    ['thumb', '.apex-sa__thumb', '--apex-scroll-thumb, --apex-scroll-thumb-hover'],
  ],
  panel: [
    ['root', '.apex-pn', '--apex-panel-bg, --apex-panel-border, --apex-panel-radius, --apex-panel-pad, --apex-panel-fs'],
    ['head', '.apex-pn__head', '--apex-panel-head-bg, --apex-panel-head-fg'],
    ['toggle / icon', '.apex-pn__toggle, .apex-pn__icon', 'the chevron and the header icon'],
    ['title / sub', '.apex-pn__title, .apex-pn__sub', 'the two header lines'],
    ['body / foot', '.apex-pn__body, .apex-pn__foot', 'content and footer; `flush` removes the body padding'],
  ],
  fieldset: [
    ['root', '.apex-fs', '--apex-fieldset-bg, --apex-fieldset-border, --apex-fieldset-radius, --apex-fieldset-pad, --apex-fieldset-fs'],
    ['legend', '.apex-fs__legend', '--apex-fieldset-legend-bg — the element that straddles the border'],
    ['label', '.apex-fs__label', '--apex-fieldset-legend-fg — the legend text, a button when toggleable'],
    ['toggle / icon', '.apex-fs__toggle, .apex-fs__icon', 'the chevron and the legend icon'],
    ['body', '.apex-fs__body', 'the grouped controls'],
  ],
  card: [
    ['root', '.apex-cd', '--apex-card-bg, --apex-card-border, --apex-card-radius, --apex-card-pad'],
    ['media', '.apex-cd__media', '--apex-card-media-h — the image band'],
    ['head / title / sub', '.apex-cd__head, .apex-cd__title, .apex-cd__sub', 'the header'],
    ['body / foot', '.apex-cd__body, .apex-cd__foot', 'content and footer'],
  ],
  accordion: [
    ['root', '.apex-ac', '--apex-accordion-gap, --apex-accordion-border, --apex-accordion-radius, --apex-accordion-fs'],
    ['panel', '.apex-ac__panel', 'one item, header and body together'],
    ['heading / head', '.apex-ac__heading, .apex-ac__header', '--apex-accordion-head-bg, --apex-accordion-head-fg, --apex-accordion-active-bg, --apex-accordion-active-fg, --apex-accordion-pad-x, --apex-accordion-pad-y'],
    ['toggle / icon', '.apex-ac__toggle, .apex-ac__icon', 'the chevron and the item icon'],
    ['title', '.apex-ac__title', 'the header text'],
    ['badge', '.apex-dt__badge', "borrows the DataTable's badge class rather than owning one, so restyling that class reaches both. The ui key is scoped to this control"],
    ['body / inner', '.apex-ac__body, .apex-ac__inner', '--apex-accordion-body-bg — the collapsing region and its padded content'],
  ],
  radio: [
    ['control', '.apex-radio', 'the row, when the radio stands alone; inside a group it is `option` instead'],
    ['dot', '.apex-radio__dot', '--apex-radio-size, --apex-radio-border, --apex-radio-on, --apex-radio-on-width, --apex-radio-focus-ring'],
    ['lead', '.apex-radio__lead', 'the label row beside the dot — was an inline style until this round'],
    ['text', '.apex-radio__txt', 'label and hint stacked'],
    ['optionHelp', '.apex-radio__help', '--apex-radio-help-fg, --apex-radio-help-fs'],
    ['thumbnail', '.apex-radio__img', "the option's image"],
    ['— (card)', '.apex-radio--card', '--apex-radio-card-bg, --apex-radio-card-border, --apex-radio-card-radius, --apex-radio-card-hover-border, --apex-radio-card-on-border, --apex-radio-card-on-bg'],
  ],
  radiogroup: [
    ['group', '.apex-radios', '--apex-radios-gap; --apex-radio-cols when `columns` is set'],
    ['option', '.apex-radio', 'one row — every ApexRadio key above applies, since the rows are ApexRadio'],
    ['dot / lead / text / optionHelp', '.apex-radio__*', 'passed straight through to each row'],
  ],
  checkbox: [
    ['control', '.apex-cb', 'the row, when the checkbox stands alone; inside a group it is `option`'],
    ['checkbox', '.apex-cb__box', '--apex-cb-size, --apex-cb-radius, --apex-cb-border, --apex-cb-bg, --apex-cb-on-bg, --apex-cb-tick — shared with every control that draws a tick box'],
    ['lead', '.apex-cb__lead', 'the label row beside the box'],
    ['text', '.apex-cb__txt', 'label and hint stacked'],
    ['optionHelp', '.apex-cb__help', '--apex-cb-help-fg'],
    ['— (card)', '.apex-cb--card', '--apex-cb-card-bg, --apex-cb-card-border, --apex-cb-card-radius, --apex-cb-card-hover-border, --apex-cb-card-on-border, --apex-cb-card-on-bg'],
  ],
  checkboxgroup: [
    ['group', '.apex-checks', '--apex-checks-gap; --apex-check-cols when `columns` is set'],
    ['selectAll', '.apex-checks__all', '--apex-checks-all-fg — the select-all / clear-all link'],
    ['option', '.apex-cb', 'one row — every ApexCheckbox key above applies, since the rows are ApexCheckbox'],
  ],
  switch: [
    ['control', '.apex-switch', '--apex-switch-off-bg, --apex-switch-on-bg — the track in each state'],
    ['handle', '.apex-switch i', '--apex-switch-knob'],
    ['text', '.apex-switch__text', '--apex-switch-on-fg, --apex-switch-off-fg — the words inside the track. Both are rendered into one grid cell, so the track sizes to the longer and never reflows as it toggles'],
  ],
  segmented: [
    ['control', '.apex-seg', '--apex-seg-bg, --apex-seg-border, --apex-seg-radius'],
    ['option', '.apex-seg__btn', '--apex-seg-fg, --apex-seg-btn-radius, --apex-seg-hover-fg, --apex-seg-on-bg, --apex-seg-on-fg, --apex-seg-on-ring'],
  ],
  selectbutton: [
    ['control', '.apex-sb', '--apex-sb-bg, --apex-sb-border, --apex-sb-radius'],
    ['option', '.apex-sb__btn', '--apex-sb-muted, --apex-sb-hover-bg, --apex-sb-hover-fg, --apex-sb-color, --apex-sb-text, --apex-sb-focus-ring'],
    ['— (help)', '.apex-sb__help', "the second line under a button's label"],
    ['— (image)', '.apex-sb__img', "an option's image"],
  ],
  togglebutton: [
    ['control', '.apex-tb', 'off: --apex-tb-bg, --apex-tb-fg, --apex-tb-border, --apex-tb-radius, --apex-tb-hover-fg, --apex-tb-hover-border. On: --apex-tb-on, --apex-tb-on-text'],
  ],
  rating: [
    ['control', '.apex-rating', '--apex-rating-size, --apex-rating-gap'],
    ['option', '.apex-rating__star', 'one star — the box the two glyphs sit in'],
    ['range', '.apex-rating__bg', '--apex-rating-empty — the unfilled glyph underneath'],
    ['fill', '.apex-rating__fill', '--apex-rating-color — the filled glyph, clipped to the value'],
    ['button', '.apex-rating__cancel', '--apex-rating-cancel-fg, --apex-rating-cancel-hover-fg, --apex-rating-cancel-hover-bg'],
    ['value', '.apex-rating__value', '--apex-rating-value-fg, --apex-rating-value-fs'],
  ],
  treeselect: [
    ['branch', '.apex-tree__branch', 'a node and everything under it — layout only'],
    ['option', '.apex-tree__row', '--apex-tree-row-fg, --apex-tree-row-radius, --apex-tree-row-pad, --apex-tree-row-fs, --apex-tree-row-hover-bg, --apex-tree-row-selected-bg, --apex-tree-row-selected-fg'],
    ['twisty', '.apex-tree__twisty', '--apex-tree-twisty-fg, --apex-tree-twisty-size, --apex-tree-twisty-radius, --apex-tree-twisty-hover-bg, --apex-tree-twisty-hover-fg'],
    ['— (indent)', '.apex-tree__row padding', '--apex-tree-indent — how far each level steps in. The leaf spacer reads the same --apex-tree-twisty-size, so rows stay in line'],
    ['addNew', '.apex-pop__add', '--apex-pop-add-bg, --apex-pop-add-border, --apex-pop-add-fg, --apex-pop-add-hover-bg, --apex-pop-add-icon — one per open branch, plus one for the root'],
    ['popover / filter / checkbox / tick / empty', '.apex-pop, .apex-pop__filter, .apex-cb__box, .apex-pop__tick, .apex-pop__empty', 'shared — all on ApexField'],
    ['chip', '.apex-chip', 'the chips in the box under multiple/checkbox; --apex-token-* as on Multiselect'],
  ],
  orderlist: [
    ['panel', '.apex-order__panel', '--apex-order-panel-bg, --apex-order-panel-border, --apex-order-panel-radius'],
    ['controls', '.apex-order__controls', 'the column of move buttons — layout only; `controls` and `controlsAlign` place it'],
    ['moveButton', '.apex-order__btn', '--apex-order-btn-bg, --apex-order-btn-fg, --apex-order-btn-border, --apex-order-btn-radius, --apex-order-btn-size, --apex-order-btn-hover-bg, --apex-order-btn-hover-fg, --apex-order-btn-hover-border'],
    ['list', '.apex-order__list', 'the scrolling list; scrollHeight caps its height'],
    ['option', '.apex-order__row', '--apex-order-row-fg, --apex-order-row-radius, --apex-order-row-pad, --apex-order-row-fs, --apex-order-row-hover-bg, --apex-order-row-selected-bg, --apex-order-row-selected-border, --apex-order-row-selected-fg, --apex-order-row-dragover-bg, --apex-order-row-dragover-border'],
    ['grip', '.apex-order__grip', '--apex-order-grip-fg — the drag handle, hidden while a filter is live'],
    ['index', '.apex-order__num', '--apex-order-num-fg, --apex-order-num-fs — the position in the whole collection, not in the filtered view'],
    ['addNew', '.apex-pop__add', 'flattened into the panel, so it takes the panel border rather than the overlay one'],
    ['filter / checkbox / empty', '.apex-pop__filter, .apex-cb__box, .apex-pop__empty', 'shared — all on ApexField'],
  ],
  select: [
    ['placeholder', '.apex-ctl__ph', '--apex-ctl-placeholder, i.e. the placeholderColor prop'],
    ['value', '.apex-ctl__value', '--apex-ctl-fg, i.e. the textColor prop'],
    ['chevron', '.apex-ctl__chev', 'the open/close arrow; --apex-ctl-icon like any other'],
    ['thumbnail', '.apex-ctl__img and .apex-pop__img', "an option's image, in the box and in the row alike"],
    ['optionHelp', '.apex-pop__help', '--apex-pop-help-fg'],
    ['empty', '.apex-pop__empty', '--apex-pop-empty-fg'],
    ['tick', '.apex-pop__tick', 'the check beside the chosen row'],
    ['popover / option / filter', '.apex-pop, .apex-pop__opt, .apex-pop__filter', 'the shared overlay — all 26 --apex-pop-* and --apex-opt-* variables are on ApexField'],
    ['—' , '.apex-ctl--select option', '--apex-ctl-select-opt-bg, --apex-ctl-select-opt-fg, --apex-ctl-select-opt-disabled-fg, --apex-ctl-select-opt-selected-bg (native only; the OS draws this menu, so these are all it will honour)'],
  ],
  multiselect: [
    ['chip', '.apex-chip', '--apex-token-bg, --apex-token-fg, --apex-token-border, --apex-token-radius, --apex-token-remove, --apex-token-remove-hover'],
    ['chip (overflow)', '.apex-chip--more', '--apex-token-more-bg, --apex-token-more-fg — the "+N" pill, which takes the chip key too'],
    ['thumbnail', '.apex-chip__img and .apex-pop__img', "an option's image, on the chip and in the row"],
    ['placeholder', '.apex-ctl__ph', '--apex-ctl-placeholder'],
    ['chevron', '.apex-ctl__chev', 'the open/close arrow'],
    ['optionHelp', '.apex-pop__help', '--apex-pop-help-fg'],
    ['empty', '.apex-pop__empty', '--apex-pop-empty-fg'],
    ['selectAll / checkbox', '.apex-pop__all, .apex-pop__box', 'the shared overlay — --apex-pop-all-* and --apex-pop-box-* are on ApexField'],
  ],
  colorpicker: [
    ['picker', '.apex-picker', '--apex-picker-bg, --apex-picker-border, --apex-picker-radius, --apex-picker-shadow'],
    ['area', '.apex-picker__area', '--apex-picker-area-h, --apex-picker-area-w, --apex-picker-area-radius — its gradient is the colour maths and is not themeable'],
    ['thumb', '.apex-picker__thumb', '--apex-picker-thumb-size, --apex-picker-thumb-border — the fill always shows the colour under it'],
    ['sliders', '.apex-picker__sliders', 'the pair of tracks — layout only'],
    ['slider', '.apex-picker__slider', '--apex-picker-slider-h, --apex-picker-slider-length (vertical only), --apex-picker-slider-radius, --apex-picker-slider-border, --apex-picker-slider-thumb, --apex-picker-slider-thumb-size, --apex-picker-check'],
    ['formats', '.apex-picker__formats', '--apex-picker-formats-bg, --apex-picker-formats-border, --apex-picker-formats-radius'],
    ['format', '.apex-picker__formats button', '--apex-picker-format-fg, --apex-picker-format-radius, --apex-picker-format-on-bg, --apex-picker-format-on-fg, --apex-picker-format-on-shadow'],
    ['channels', '.apex-picker__channels', 'the row of boxes — layout only'],
    ['channel', '.apex-picker__channels label', '--apex-picker-channel-fg, and the input set below'],
    ['output', '.apex-picker__value', '--apex-picker-input-bg, --apex-picker-input-fg, --apex-picker-input-border, --apex-picker-input-focus-border, --apex-picker-input-radius, --apex-picker-input-font — shared with the channel boxes'],
    ['presets', '.apex-picker__presets', '--apex-picker-presets-border, --apex-swatch-preset-size, --apex-swatch-preset-radius'],
    ['swatch', '.apex-swatch', '--apex-swatch-size, --apex-swatch-border, --apex-swatch-radius, --apex-swatch-hover-border, --apex-swatch-check, --apex-swatch-on-gap, --apex-swatch-on-ring'],
  ],
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
    ['chip', '.apex-chip', '--apex-token-bg, --apex-token-fg, --apex-token-border, --apex-token-radius'],
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
  toolbar: `.event-bar {
  --apex-toolbar-bg: #101820;
  --apex-toolbar-border: #243040;
  --apex-toolbar-fg: #E8EEF7;
  --apex-toolbar-gap: 10px;
  --apex-toolbar-pad: 10px 14px;
}

<ApexToolbar :ui="{ root: 'event-bar', region: 'event-bar-region' }">
  <template #start>…</template>
  <template #center>…</template>
  <template #end>…</template>
</ApexToolbar>

/* Start and end grow equally from a zero basis, so the centre region sits on
   the bar's midpoint whatever the sides hold. Fill only start and end and the
   middle stays empty rather than the sides drifting. */`,

  tabs: `.report-tabs {
  --apex-tabs-strip-bg: #0B1017;
  --apex-tabs-border: #243040;
  --apex-tabs-fg: #6B7789;
  --apex-tabs-active: #7AA2F7;
  --apex-tabs-indicator: #7AA2F7;
}

<ApexTabs v-model="tab" :tabs="TABS"
  :ui="{ root: 'report-tabs', strip: 'report-strip', bar: 'report-bar' }" />

/* --apex-tabs-pos and --apex-tabs-size are NOT yours to set. The component
   rewrites both on every change so the indicator can slide to the active tab;
   anything you put there is overwritten on the next click. */

/* One slot per tab, named for its value: */
<ApexTabs v-model="tab" :tabs="TABS">
  <template #sales>…</template>
  <template #refunds>…</template>
</ApexTabs>`,

  steps: `.checkout-steps {
  --apex-steps-marker: #243040;
  --apex-steps-active: #7AA2F7;
  --apex-steps-complete: #137C4A;
  --apex-steps-line: #243040;
}

<ApexSteps v-model="step" :steps="STEPS" show-nav
  :ui="{ root: 'checkout-steps', marker: 'step-marker', rail: 'step-rail' }" />

/* linear gates forward movement, so a step cannot be skipped until the one
   before it is done. Without it every step is reachable at any time — right
   for a settings wizard, wrong for a checkout. */
<ApexSteps v-model="step" :steps="STEPS" linear show-nav @finish="submit" />`,

  splitter: `.map-split {
  --apex-splitter-h: 420px;
  --apex-splitter-border: #243040;
  --apex-splitter-gutter: 10px;
  --apex-splitter-gutter-bg: #101820;
  --apex-splitter-gutter-hover: #7AA2F7;
}

<ApexSplitter :panels="[{ min: 30 }, { min: 20 }]" state-key="seatmap"
  :ui="{ root: 'map-split', gutter: 'map-gutter' }">
  <template #panel-1>…</template>
  <template #panel-2>…</template>
</ApexSplitter>

/* Sizes are percentages, so the split survives a window resize rather than
   drifting the way fixed pixels would. stateKey remembers where the user
   left the gutter. */`,

  scrollarea: `.log-scroll {
  --apex-scroll-max-h: 320px;
  --apex-scroll-size: 10px;
  --apex-scroll-track: #101820;
  --apex-scroll-thumb: #2C3A4D;
  --apex-scroll-thumb-hover: #3A4657;
  --apex-scroll-radius: 6px;
}

<ApexScrollArea max-height="320px" mask :ui="{ root: 'log-scroll', thumb: 'log-thumb' }">
  …
</ApexScrollArea>

/* Or with props, no stylesheet — every variable above has one: */
<ApexScrollArea max-height="320px" :scrollbar-size="10"
  thumb-color="#2C3A4D" thumb-hover-color="#3A4657"
  track-color="#101820" thumb-radius="6px" />

/* Leave height and maxHeight unset and the box sizes to its content — the
   variables fall back to auto, so nothing is capped until you say so. */

/* The viewport is exposed, for the times a ref is the only way: */
const area = ref();
area.value.scrollTo({ top: 0, behavior: 'smooth' });
area.value.measure();   // after content the ResizeObserver cannot see`,

  panel: `.fees-panel {
  --apex-panel-bg: #101820;
  --apex-panel-border: #243040;
  --apex-panel-radius: 12px;
  --apex-panel-pad: 16px;
  --apex-panel-head-bg: #0B1017;
  --apex-panel-head-fg: #E8EEF7;
}

<ApexPanel header="Fees" subheader="Per order" icon="payments" toggleable
  :ui="{ root: 'fees-panel', head: 'fees-head', body: 'fees-body' }" />

/* flush removes the body padding, for a table or list that brings its own —
   otherwise the two paddings stack and the content sits oddly inset. */
<ApexPanel header="Bookings" flush><ApexDataTable … /></ApexPanel>`,

  fieldset: `.booker-fs {
  --apex-fieldset-border: #243040;
  --apex-fieldset-radius: 10px;
  --apex-fieldset-pad: 16px;
  /* The legend sits ON the border, so its background must match whatever is
     behind the fieldset or the border will show through the text. */
  --apex-fieldset-legend-bg: #0F141C;
  --apex-fieldset-legend-fg: #E8EEF7;
}

<ApexFieldset legend="Lead booker" icon="person"
  :ui="{ root: 'booker-fs', legend: 'booker-legend', body: 'booker-body' }">
  <ApexInput label="Name" />
</ApexFieldset>

/* This is a real <fieldset>, which is the reason to use it over a panel:
   disabled turns off every control inside in one go. */
<ApexFieldset legend="Billing" :disabled="sameAsDelivery">…</ApexFieldset>`,

  card: `.event-card {
  --apex-card-bg: #101820;
  --apex-card-border: #243040;
  --apex-card-radius: 14px;
  --apex-card-pad: 16px;
  --apex-card-media-h: 180px;
}

<ApexCard title="Aida" subtitle="14 March" image="/aida.jpg"
  :ui="{ root: 'event-card', media: 'event-media', title: 'event-title' }" />

/* Give it href or clickable and it renders as <a> or <button> rather than a
   div with a click handler — so the keyboard and screen readers get the
   affordance for free. */
<ApexCard title="Aida" href="/events/aida" hoverable />`,

  accordion: `.faq-acc {
  --apex-accordion-gap: 8px;
  --apex-accordion-border: #243040;
  --apex-accordion-radius: 10px;
  --apex-accordion-head-bg: #101820;
  --apex-accordion-head-fg: #E8EEF7;
  --apex-accordion-active-bg: #16202C;
  --apex-accordion-active-fg: #7AA2F7;
  --apex-accordion-body-bg: #0B1017;
}

<ApexAccordion v-model:value="open" :items="FAQ"
  :ui="{ root: 'faq-acc', head: 'faq-head', body: 'faq-body' }" />

/* multiple lets several stand open and turns the model into an array.
   collapsible={false} keeps one always open, which suits a settings page
   where an empty state would be meaningless. */
<ApexAccordion v-model:value="openList" :items="FAQ" multiple />

/* The badge borrows the DataTable's class rather than owning one, so
   .apex-dt__badge dresses both. Scope it with the ui key if you mean only
   this accordion. */`,

  radio: `/* The dot and the card are this control's own; the label, message and
   tone come from the shared field surface. */
.plan-radio {
  --apex-radio-size: 20px;
  --apex-radio-border: #3A4657;
  --apex-radio-on: #7AA2F7;
  --apex-radio-help-fg: #6B7789;
  /* The card variant, for choose-one-of-these layouts. */
  --apex-radio-card-bg: #101820;
  --apex-radio-card-border: #243040;
  --apex-radio-card-on-border: #7AA2F7;
  --apex-radio-card-on-bg: #16202C;
}

<ApexRadio v-model="plan" value="pro" label="Pro" name="plan" card
  :ui="{ control: 'plan-radio', dot: 'plan-dot' }" />

/* A group passes its ui straight down, so one map dresses every row. Inside
   a group a row is "option", not "control" — the group is the control. */
<ApexRadioGroup v-model="plan" :options="PLANS" label="Plan" card
  :ui="{ group: 'plan-list', option: 'plan-radio', dot: 'plan-dot' }" />`,

  radiogroup: `/* The rows ARE ApexRadio, so everything on that page applies here and the
   ui map is passed straight through. The group owns only the layout. */
.plan-list {
  --apex-radios-gap: 12px;
  /* Set by the "columns" prop; set it yourself to vary by breakpoint. */
  --apex-radio-cols: 2;
}

<ApexRadioGroup v-model="plan" :options="PLANS" label="Plan" :columns="2"
  :ui="{ group: 'plan-list', option: 'plan-radio', dot: 'plan-dot' }" />`,

  checkbox: `/* The tick box is shared with Listbox, OrderList, Multiselect and Tree, so
   --apex-cb-* dresses all of them at once. Scope it if you mean only this. */
.terms-check {
  --apex-cb-size: 20px;
  --apex-cb-radius: 6px;
  --apex-cb-border: #3A4657;
  --apex-cb-on-bg: #7AA2F7;
  /* Set the tick whenever you set a light on-bg, or it disappears. */
  --apex-cb-tick: #0F141C;
}

<ApexCheckbox v-model="agreed" label="I agree" hint="Required to continue"
  :ui="{ control: 'terms-check', checkbox: 'terms-box' }" />

/* indeterminate is the mixed state for a parent box. Visual only — clicking
   still checks, because a parent should resolve its children, not cycle. */
<ApexCheckbox v-model="allOn" :indeterminate="someOn" label="Select all" />`,

  checkboxgroup: `/* The rows ARE ApexCheckbox, so that page's keys apply and the ui map is
   passed straight down. The group owns the layout and the select-all row. */
.roles-list {
  --apex-checks-gap: 10px;
  --apex-check-cols: 2;
  --apex-checks-all-fg: #7AA2F7;
}

<ApexCheckboxGroup v-model="roles" :options="ROLES" label="Roles" toggle-all
  :columns="2" :ui="{ group: 'roles-list', selectAll: 'roles-all', option: 'roles-row' }" />

/* max caps the selection by disabling the rows that are not chosen, rather
   than accepting the click and silently dropping it. */
<ApexCheckboxGroup v-model="roles" :options="ROLES" :max="2" />`,

  switch: `.live-switch {
  --apex-switch-off-bg: #3A4657;
  --apex-switch-on-bg: #137C4A;
  --apex-switch-knob: #fff;
}

<ApexSwitch v-model="live" label="Accepting bookings"
  :ui="{ control: 'live-switch', handle: 'live-knob' }" />

/* onLabel / offLabel put the state inside the track. Both words are rendered
   into one grid cell with the inactive one hidden but still taking up space,
   so the track sizes to the longer of the two and toggling never changes its
   width. Keep them short — this is a switch, not a button. */
<ApexSwitch v-model="live" on-label="ON" off-label="OFF" label="Accepting bookings" />

/* The off word takes --fg-default rather than white, because the off track is
   --border-strong and the two flip together with the theme. Override both if
   you set a track colour of your own. */
.live-switch { --apex-switch-off-fg: #0F141C; --apex-switch-on-fg: #fff; }`,

  segmented: `.view-seg {
  --apex-seg-bg: #0B1017;
  --apex-seg-border: #243040;
  --apex-seg-fg: #6B7789;
  --apex-seg-on-bg: #1D2735;
  --apex-seg-on-fg: #7AA2F7;
  /* The hairline around the chosen segment. */
  --apex-seg-on-ring: #2C3A4D;
}

<ApexSegmented v-model="view" :options="VIEWS" label="View"
  :ui="{ control: 'view-seg', option: 'view-seg-btn' }" />

/* Or without a stylesheet: */
<ApexSegmented v-model="view" :options="VIEWS"
  selected-background="#1D2735" selected-color="#7AA2F7" />`,

  selectbutton: `.range-sb {
  --apex-sb-bg: #101820;
  --apex-sb-border: #243040;
  --apex-sb-muted: #6B7789;
  --apex-sb-hover-bg: #1D2735;
  --apex-sb-color: #7AA2F7;      /* the chosen button */
  --apex-sb-text: #0F141C;       /* its label — set both, or it may not read */
}

<ApexSelectButton v-model="range" :options="RANGES" label="Range"
  :ui="{ control: 'range-sb', option: 'range-sb-btn' }" />

/* multiple turns the radiogroup into a set of independent toggles, and the
   model becomes an array. */
<ApexSelectButton v-model="days" :options="DAYS" multiple block />`,

  togglebutton: `.live-tb {
  /* Off. */
  --apex-tb-bg: #101820;
  --apex-tb-fg: #6B7789;
  --apex-tb-border: #243040;
  --apex-tb-hover-fg: #E8EEF7;
  /* On. Set both — the label sits on the fill. */
  --apex-tb-on: #137C4A;
  --apex-tb-on-text: #fff;
}

<ApexToggleButton v-model="live" on-label="Live" off-label="Paused"
  on-icon="play_arrow" off-icon="pause" :ui="{ control: 'live-tb' }" />

/* variant="outline" keeps the on state transparent with a coloured ring,
   for when a filled button would shout too loudly in a toolbar. */
<ApexToggleButton v-model="live" variant="outline" on-label="Live" off-label="Paused" />`,

  rating: `.score-rating {
  --apex-rating-size: 30px;
  --apex-rating-gap: 5px;
  --apex-rating-color: #C24A06;   /* filled */
  --apex-rating-empty: #243040;   /* unfilled — set it whenever you set the fill */
  --apex-rating-value-fg: #6B7789;
  --apex-rating-cancel-hover-fg: #C41E1E;
}

<ApexRating v-model="score" label="Rating" :stars="5" allow-half cancel show-value
  :ui="{ control: 'score-rating', option: 'score-star', fill: 'score-fill' }" />

/* Or with props, no stylesheet: */
<ApexRating v-model="score" :star-size="30" color="#C24A06" empty-color="#243040" />

/* shape swaps the glyph without touching the behaviour — star, triangle, dot
   or square — and icon/emptyIcon override it with any two glyph names. */
<ApexRating v-model="score" shape="dot" :stars="3" />`,

  treeselect: `<!-- The overlay is a plain .apex-pop, so the shared variables dress it.
     Only the rows, the chevron and the indent are this control's own. -->
.locality-tree {
  --apex-tree-row-fg: #E8EEF7;
  --apex-tree-row-hover-bg: #1D2735;
  --apex-tree-row-selected-bg: #16202C;
  --apex-tree-row-selected-fg: #7AA2F7;
  --apex-tree-twisty-fg: #6B7789;
  --apex-tree-twisty-hover-bg: #1D2735;
  /* One step per level. The leaf spacer reads the twisty size, so a leaf
     still lines up with its siblings when you change either. */
  --apex-tree-indent: 22px;
  /* Shared, but this is where you would set them. */
  --apex-pop-bg: #101820;
  --apex-pop-border: #243040;
}

<ApexTreeSelect v-model="where" :nodes="tree" label="Locality"
  :ui="{ popover: 'locality-tree', option: 'loc-row', twisty: 'loc-twisty' }" />

/* The same three props do it without a stylesheet. */
<ApexTreeSelect v-model="where" :nodes="tree"
  node-selected-background="#16202C" node-selected-color="#7AA2F7" indent="22px" />

/* Add new works as it does on the cascade, because a tree has levels too:
   every OPEN branch gets its own row at its children's depth, and one more
   sits at the foot for a record that belongs under no branch. The event
   carries that branch, so one handler serves every level. */
<ApexTreeSelect v-model="where" :nodes="tree" filter
  add-new resource="localities" @add-new="createLocality" />

function createLocality({ query, path }) {
  // path is [] at the foot, [Malta] under Malta,
  // [Malta, Northern Harbour] under that branch.
  const parent = path.length ? path[path.length - 1].key : null;
  dialog.open(LocalityForm, { contentProps: { name: query, parent } /* … */ });
}`,

  orderlist: `<!-- The panel, the move buttons and the rows are this control's own.
     The filter row and the tick boxes are shared. -->
.running-order {
  --apex-order-panel-bg: #101820;
  --apex-order-panel-border: #243040;
  --apex-order-panel-radius: 12px;
  --apex-order-row-fg: #E8EEF7;
  --apex-order-row-hover-bg: #1D2735;
  --apex-order-row-selected-bg: #16202C;
  --apex-order-row-selected-fg: #7AA2F7;
  /* The row you are dragging over. Worth making obvious — it is the only
     feedback the drag gives. */
  --apex-order-row-dragover-border: #7AA2F7;
  --apex-order-grip-fg: #6B7789;
  --apex-order-num-fg: #6B7789;
  --apex-order-btn-size: 38px;
  --apex-order-btn-hover-fg: #7AA2F7;
}

<ApexOrderList v-model="acts" v-model:selection="picked" label="Running order"
  :ui="{ control: 'running-order', panel: 'ro-panel', moveButton: 'ro-btn',
         option: 'ro-row', grip: 'ro-grip', index: 'ro-num' }" />

/* Add new sits at the foot, flattened into the panel. The control never
   touches the collection itself — push the new record onto v-model and it
   appears at the end, ready to be dragged into place. */
<ApexOrderList v-model="acts" filter add-new resource="acts" @add-new="createAct" />`,

  listbox: `<!-- The box, its list and its rows are this control's own. The filter,
     select-all row, tick boxes and empty state are shared, so their
     variables live on ApexField. -->
.location-list {
  --apex-listbox-bg: #101820;
  --apex-listbox-border: #243040;
  --apex-listbox-radius: 12px;
  --apex-listbox-group-fg: #6B7789;
  --apex-listbox-opt-fg: #E8EEF7;
  --apex-listbox-opt-hover-bg: #1D2735;
  --apex-listbox-opt-selected-bg: #16202C;
  --apex-listbox-opt-selected-fg: #7AA2F7;
  /* The ring drawn on the list itself when it takes keyboard focus. */
  --apex-listbox-focus-ring: #7AA2F7;
}

<ApexListbox v-model="where" :options="options" label="Screen location"
  :ui="{ control: 'location-list', group: 'loc-group', option: 'loc-row' }" />

/* Add new sits at the foot of the list. There is no overlay to close here,
   so the list stays exactly where it is when the row is used. */
<ApexListbox v-model="where" :options="options" filter
  add-new resource="locations" @add-new="createLocation" />`,

  cascadeselect: `<!-- Each column is itself an .apex-pop, so the shared overlay variables
     dress the columns and only the extras below are this control's own. -->
.region-cascade {
  --apex-cascade-heading-fg: #6B7789;
  --apex-cascade-heading-border: #243040;
  --apex-cascade-footer-fg: #7AA2F7;
  --apex-cascade-footer-border: #243040;
  --apex-cascade-footer-hover-bg: #1D2735;
  /* Shared, but worth setting here: these dress every column. */
  --apex-pop-bg: #101820;
  --apex-pop-border: #243040;
  --apex-opt-hover-bg: #1D2735;
}

<ApexCascadeSelect v-model="region" :options="tree" label="Region"
  heading="Country" show-path
  :ui="{ cascade: 'region-cascade', column: 'region-col', heading: 'region-head' }" />

/* Add new differs here, because a tree has levels. Every open column gets
   its own row, and the event carries the branch above it — so the same
   handler can create a country at the first column and a locality at the
   third. query is always empty: this control has no filter. */
<ApexCascadeSelect v-model="region" :options="tree"
  add-new resource="regions" @add-new="createRegion" />

function createRegion({ path }) {
  // path is [] on the first column, [Malta] on the second,
  // [Malta, Northern Harbour] on the third.
  const parent = path.length ? path[path.length - 1].value : null;
  dialog.open(RegionForm, { contentProps: { parent } , /* … */ });
}

/* footerAction is a different thing and can be shown at the same time: a
   general button on the first column that emits @action, with no permission
   gate and no notion of level. Use it for "Manage regions", not for a
   create. */`,
  select: `<!-- Almost everything here is shared. The box, the overlay, the rows
     and the filter are the same parts every chooser draws, so their
     variables live on ApexField and the props work here unchanged. -->
<ApexSelect v-model="zone" label="Zone layout" :options="options"
  placeholder-color="#5A6B7D" text-color="#E8EEF7" />

/* Those two were inert on this control until recently: the placeholder and
   value spans read the raw tokens instead of --apex-ctl-placeholder and
   --apex-ctl-fg, so the props were accepted and ignored. */

/* What ApexSelect adds is the native branch. Pass native and the browser
   draws the menu, so only these four reach it — everything else about that
   list belongs to the operating system. */
.zone-select {
  --apex-ctl-select-opt-bg: #101820;
  --apex-ctl-select-opt-fg: #E8EEF7;
  --apex-ctl-select-opt-disabled-fg: #5A6B7D;
  --apex-ctl-select-opt-selected-bg: #1D2735;
}

<!-- ui reaches every part it renders. -->
<ApexSelect v-model="zone" label="Zone layout" :options="options"
  :ui="{ control: 'zone-ctl', popover: 'zone-pop', option: 'zone-opt',
         placeholder: 'zone-ph', chevron: 'zone-chev', empty: 'zone-empty' }" />`,

  multiselect: `<!-- The chips are what this control adds; the trigger, overlay,
     select-all row and tick boxes are shared and documented on ApexField. -->
<ApexMultiselect v-model="roles" label="Roles" :options="options" :max-chips="3" />

.role-picker {
  --apex-token-bg: #16202C;
  --apex-token-fg: #E8EEF7;
  --apex-token-border: #243040;
  --apex-token-remove: #6B7789;
  --apex-token-remove-hover: #E11D48;
  /* The "+N" pill shown once maxChips is passed. */
  --apex-token-more-bg: #1D2735;
  --apex-token-more-fg: #8B98AD;
}

<!-- One chip key covers both the ordinary chips and the overflow pill, so
     reach the pill on its own through .apex-chip--more when you need to. -->
<ApexMultiselect v-model="roles" label="Roles" :options="options"
  :ui="{ control: 'role-picker', chip: 'role-chip', selectAll: 'role-all',
         checkbox: 'role-box', thumbnail: 'role-thumb' }" />`,
  colorpicker: `<!-- Twelve props cover the popover, the square, the tracks and the
     swatches. They are sugar over --apex-picker-* and --apex-swatch-*. -->
<ApexColorPicker v-model="brand" label="Brand colour" show-format-toggle
  picker-background="#101820" picker-border-color="#243040"
  picker-radius="14px" picker-shadow="0 10px 34px #0009"
  area-height="190px" area-width="260px" area-radius="8px"
  thumb-color="#0B0F14" slider-height="16px" slider-length="190px"
  slider-thumb-color="#E8EEF7"
  swatch-size="28px" swatch-border-color="#243040" />

/* Two things are deliberately not settable, because they are what the
   control measures rather than how it looks: the hue spectrum on the hue
   track, and the saturation/value square's own gradient. So are --hue,
   --solid and --sw, which the component rewrites on every render. Theming
   any of them would let the picker show one colour and report another. */

/* The remaining twenty-eight variables have no prop — the format
   switcher, the channel boxes, the output row, the preset row. Scope a
   class of your own to reach them. */
.brand-picker {
  --apex-picker-formats-bg: #0B0F14;
  --apex-picker-format-fg: #6B7789;
  --apex-picker-format-on-bg: #16202C;
  --apex-picker-format-on-fg: #7AA2F7;
  --apex-picker-input-bg: #0B0F14;
  --apex-picker-input-fg: #E8EEF7;
  --apex-picker-input-border: #243040;
  --apex-picker-input-focus-border: #7AA2F7;
  --apex-picker-presets-border: #243040;
  --apex-swatch-on-ring: #7AA2F7;
  /* The chequerboard behind a transparent colour, on the alpha track and
     on every swatch. */
  --apex-picker-check: #1D2735;
  --apex-swatch-check: #1D2735;
}

<!-- ui puts your class on any part. control and input reach the box, as on
     every field. -->
<ApexColorPicker v-model="brand" label="Brand colour"
  :ui="{ picker: 'brand-picker', area: 'brand-area', swatch: 'brand-swatch' }" />

/* swatch is one part in three places: the trigger in the box, the one
   beside the output, and each preset. Scope by ancestor to reach one
   kind — .apex-picker__presets .brand-swatch, and so on. */`,
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
  --apex-token-bg: #FFF1E5;
  --apex-token-fg: #6F2A03;
  --apex-token-border: #C24A06;
  --apex-token-radius: 6px;
}`,
};

export const ENTRIES: DocEntry[] = [
  {
    id: 'icon', name: 'ApexIcon', group: 'Foundations',
    demo: 'plain',
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
    id: 'select', name: 'ApexSelect', group: 'Choosers',
    blurb: 'Popover listbox matched to the field. Pass native for a real <select> when a mobile picker or a plain form post matters more than the styling.',
    model: 'split',
    base: {
      label: 'Zone layout', options: ZONE_OPTIONS, placeholder: 'Choose a layout',
      leadingIcon: 'dashboard', clearable: true, filter: true,
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'placeholder', type: 'text' },
      { key: 'leadingIcon', type: 'text' }, { key: 'clearable', type: 'bool' },
      { key: 'native', type: 'bool' }, { key: 'filter', type: 'bool' },
      { key: 'filterPlaceholder', type: 'text' },
      { key: 'loading', type: 'bool' }, { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string | number | null', '—', 'v-model'],
      ['options', 'Array<{value,label,help?,icon?,image?,disabled?}> | string[]', '[]', 'image is a thumbnail URL — flags, avatars, product shots'],
      ['clearable', 'boolean', 'false', 'Reset to null'],
      ['leadingIcon', 'string', '—', 'Icon before the value'],
      ['native', 'boolean', 'false', "Use the browser's <select>; the OS draws that menu and it cannot be styled"],
      ['filter', 'boolean', 'false', 'Search box at the top of the popover'],
      ['filterPlaceholder', 'string', "'Search'", 'Placeholder for that box'],
      ['filterThreshold', 'number', '—', 'Show the filter automatically past this many options'],
    ],
    events: [['update:modelValue', 'value'], ['change', '—']],
  },
  {
    id: 'multiselect', name: 'ApexMultiselect', group: 'Choosers',
    blurb: 'ApexSelect with multiple selection — same trigger, same popover, same filter and icon support. Chips in the field, ticks in the list. Down and Up move, Enter toggles, Backspace removes the last chip, Esc closes.',
    model: ['admin', 'scheduler'],
    base: {
      label: 'Roles', options: ROLE_OPTIONS, placeholder: 'Assign roles', filter: true,
      toggleAll: true, clearable: true, help: 'Roles stack — the widest permission wins.',
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'placeholder', type: 'text' },
      { key: 'filter', type: 'bool' }, { key: 'toggleAll', type: 'bool' },
      { key: 'clearable', type: 'bool' }, { key: 'max', type: 'number' }, { key: 'maxChips', type: 'number' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown[]', '[]', 'v-model'],
      ['options', 'ApexOption[] | string[]', '[]', 'Same shape as ApexSelect — icon, image, help'],
      ['filter', 'boolean', 'false', 'Search box at the top of the popover'],
      ['filterThreshold', 'number', '—', 'Show the filter automatically past this many options'],
      ['toggleAll', 'boolean', 'false', 'Select all / clear all row with a running count'],
      ['max', 'number', '—', 'Cap the number of selections'],
      ['maxChips', 'number', '—', 'Collapse to "+N" past this many chips'],
      ['clearable', 'boolean', 'false', 'Clear every selection'],
    ],
    events: [['update:modelValue', 'unknown[]'], ['change', '—']],
  },
  {
    id: 'listbox', name: 'ApexListbox', group: 'Choosers',
    blurb: 'An always-visible option list. Single selection by default, multiple for many, checkbox for a box per option, built-in filtering, and grouped options from a nested array.',
    model: 'sliema',
    base: {
      label: 'Screen location', filter: true, scrollHeight: 240,
      options: [
        { label: 'Malta', icon: 'public', items: [
          { value: 'sliema', label: 'Sliema', help: 'Northern Harbour' },
          { value: 'msida', label: 'Msida', help: 'Northern Harbour' },
          { value: 'zejtun', label: 'Żejtun', help: 'South Eastern' },
        ] },
        { label: 'Gozo', icon: 'public', items: [
          { value: 'victoria', label: 'Victoria', help: 'Central' },
          { value: 'xewkija', label: 'Xewkija', help: 'Central' },
        ] },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'multiple', type: 'bool' }, { key: 'checkbox', type: 'bool' },
      { key: 'filter', type: 'bool' }, { key: 'filterPlaceholder', type: 'text' },
      { key: 'toggleAll', type: 'bool' }, { key: 'max', type: 'number' },
      { key: 'scrollHeight', type: 'number' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown | unknown[]', '—', 'v-model; an array once multiple or checkbox is on'],
      ['options', 'ApexOption[] | string[] | { label, items }[]', '[]', 'A nested array renders group headers'],
      ['multiple', 'boolean', 'false', 'Choose more than one'],
      ['checkbox', 'boolean', 'false', 'A checkbox per option; implies multiple'],
      ['filter', 'boolean', 'false', 'Built-in search pinned to the top'],
      ['toggleAll', 'boolean', 'false', 'Select all / clear all with a running count'],
      ['max', 'number', '—', 'Cap the number of selections'],
      ['scrollHeight', 'number', '260', 'Max list height in pixels'],
    ],
    events: [['update:modelValue', 'value | value[]'], ['change', '—']],
    slots: [['option', 'Custom row content; receives { option }']],
  },
  {
    id: 'cascadeselect', name: 'ApexCascadeSelect', group: 'Choosers',
    /* Written from the component's API: this is the one control with no entry
       in the design gallery, so nothing here was inherited. */
    blurb: 'Drill through nested options one column at a time. Each level opens the next beside it, and only a leaf commits a value — useful when a flat list would be too long to scan.',
    model: 'mt-nh-sliema',
    base: {
      label: 'Region', placeholder: 'Choose a locality', heading: 'Country',
      showPath: true, clearable: true,
      options: [
        { value: 'mt', label: 'Malta', icon: 'public', children: [
          { value: 'mt-nh', label: 'Northern Harbour', children: [
            { value: 'mt-nh-sliema', label: 'Sliema' },
            { value: 'mt-nh-msida', label: 'Msida' },
          ] },
          { value: 'mt-se', label: 'South Eastern', children: [
            { value: 'mt-se-zejtun', label: 'Żejtun' },
          ] },
        ] },
        { value: 'go', label: 'Gozo', icon: 'public', children: [
          { value: 'go-c', label: 'Central', children: [
            { value: 'go-c-victoria', label: 'Victoria' },
          ] },
        ] },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'placeholder', type: 'text' },
      { key: 'heading', type: 'text' }, { key: 'showPath', type: 'bool' },
      { key: 'pathSeparator', type: 'text' }, { key: 'leadingIcon', type: 'text' },
      { key: 'clearable', type: 'bool' }, { key: 'loading', type: 'bool' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown', '—', "v-model — a leaf's value. Choosing a branch only opens it"],
      ['options', 'CascadeOption[]', '[]', 'Nested through `children`; a node without children is a leaf'],
      ['heading', 'string', '—', 'Caption above the first column'],
      ['showPath', 'boolean', 'false', 'Show the whole branch in the field rather than just the leaf'],
      ['pathSeparator', 'string', "'›'", 'What joins the parts of that path'],
      ['leadingIcon', 'string', '—', 'Icon before the value'],
      ['clearable', 'boolean', 'false', 'Reset to null'],
      ['footerAction', '{ label, icon? }', '—', 'A button under the first column; emits @action rather than selecting'],
    ],
    events: [['update:modelValue', 'value'], ['change', '—'], ['action', 'the footer button was pressed']],
  },
  {
    id: 'treeselect', name: 'ApexTreeSelect', group: 'Choosers',
    blurb: 'A popover tree for hierarchical data. One node, or many with checkbox propagation and a partial state on a half-ticked branch. Filtering keeps the branch a match sits under, so a result is never left floating without its context.',
    model: 'sliema',
    base: {
      label: 'Locality', placeholder: 'Choose a locality', filter: true,
      showPath: true, clearable: true,
      nodes: [
        { key: 'mt', label: 'Malta', icon: 'public', children: [
          { key: 'mt-nh', label: 'Northern Harbour', children: [
            { key: 'sliema', label: 'Sliema', help: 'Coastal' },
            { key: 'msida', label: 'Msida' },
          ] },
          { key: 'mt-se', label: 'South Eastern', children: [
            { key: 'zejtun', label: 'Żejtun' },
            { key: 'marsascala', label: 'Marsascala' },
          ] },
        ] },
        { key: 'go', label: 'Gozo', icon: 'public', children: [
          { key: 'go-c', label: 'Central', children: [
            { key: 'victoria', label: 'Victoria' },
            { key: 'xewkija', label: 'Xewkija' },
          ] },
        ] },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'placeholder', type: 'text' },
      { key: 'multiple', type: 'bool' }, { key: 'checkbox', type: 'bool' },
      { key: 'leafOnly', type: 'bool' }, { key: 'filter', type: 'bool' },
      { key: 'expandAll', type: 'bool' }, { key: 'showPath', type: 'bool' },
      { key: 'pathSeparator', type: 'text' }, { key: 'maxChips', type: 'number' },
      { key: 'scrollHeight', type: 'number' }, { key: 'clearable', type: 'bool' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string | string[]', '—', 'A node key; an array once multiple or checkbox is on'],
      ['nodes', 'TreeNode[]', '[]', '{ key, label, icon?, image?, help?, disabled?, children? }'],
      ['multiple', 'boolean', 'false', 'Choose more than one node'],
      ['checkbox', 'boolean', 'false', 'A box per node. Implies multiple, and ticking a branch ticks its descendants'],
      ['leafOnly', 'boolean', 'false', 'Only leaves are selectable; clicking a branch expands it instead'],
      ['filter', 'boolean', 'false', 'Search box in the overlay. A match brings its ancestors with it'],
      ['expandAll', 'boolean', 'false', 'Start with every branch open'],
      ['showPath', 'boolean', 'false', 'Show the whole branch in the field rather than just the node'],
      ['pathSeparator', 'string', "'›'", 'What joins the parts of that path'],
      ['maxChips', 'number', '—', 'Cap the chips shown; the rest collapse into a "+N" pill'],
      ['scrollHeight', 'number', '280', 'Max overlay height in pixels'],
      ['addNew', 'boolean', 'false', 'A row under each open branch, and one at the foot for the root'],
      ['resource / canAddNew', 'string / boolean', '—', 'Permission for that row — see Add new'],
    ],
    events: [
      ['update:modelValue', 'key | key[]'], ['change', '—'],
      ['node-expand / node-collapse', 'the TreeNode'],
      ['add-new', '{ query, path } — path is the branch, root first, or [] at the foot'],
    ],
  },
  {
    id: 'orderlist', name: 'ApexOrderList', group: 'Choosers',
    blurb: 'Put a collection into an order. Drag a row, or use the move controls; alt+arrow moves the focused row without a selection. v-model is the collection itself, so the order you see is the order you hold.',
    /* v-model IS the collection here, so the stage seeds it from `model` like
       any other control. The chosen rows are a second model, which the stage
       binds through demo: 'order' — the move buttons act on that, and without
       it they would sit permanently disabled. */
    demo: 'order',
    model: [
      { value: 'doors', label: 'Doors open', help: '19:00' },
      { value: 'support', label: 'Support act', help: '19:45' },
      { value: 'interval', label: 'Interval', help: '20:30' },
      { value: 'headline', label: 'Headline set', help: '21:00' },
      { value: 'encore', label: 'Encore', help: '22:15' },
    ],
    base: { label: 'Running order', filter: true, checkbox: true, scrollHeight: 240 },
    controls: [
      { key: 'label', type: 'text' },
      { key: 'controls', type: 'select', options: ['start', 'end', 'top', 'none'] },
      { key: 'controlsAlign', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'extremes', type: 'bool' }, { key: 'checkbox', type: 'bool' },
      { key: 'multiple', type: 'bool' }, { key: 'filter', type: 'bool' },
      { key: 'noDrag', type: 'bool' }, { key: 'scrollHeight', type: 'number' },
      { key: 'filterPlaceholder', type: 'text' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'ApexOption[] | string[]', '[]', 'v-model — the collection, in its current order'],
      ['selection', 'unknown[]', '[]', 'v-model:selection — the chosen values, which the move buttons act on'],
      ['checkbox', 'boolean', 'false', 'A box per row. Implies multiple, and clicks accumulate rather than replace'],
      ['multiple', 'boolean', 'false', 'Allow several rows; without checkbox, hold ctrl/cmd/shift'],
      ['filter', 'boolean', 'false', 'Search above the list. Dragging and the move buttons are suspended while a query is live, since the visible order is only part of the whole'],
      ['controls', "'start' | 'end' | 'top' | 'none'", "'start'", 'Where the move buttons sit'],
      ['controlsAlign', "'start' | 'center' | 'end'", "'start'", 'How they align along the list'],
      ['extremes', 'boolean', 'true', 'Include jump-to-top and jump-to-bottom'],
      ['noDrag', 'boolean', 'false', 'Buttons and keyboard only'],
      ['scrollHeight', 'number', '280', 'Max list height in pixels'],
      ['addNew', 'boolean', 'false', 'A row at the foot of the list'],
      ['resource / canAddNew', 'string / boolean', '—', 'Permission for that row — see Add new'],
    ],
    events: [
      ['update:modelValue', 'the reordered collection'],
      ['update:selection', 'value[]'],
      ['reorder', '{ from, to }'], ['change', '—'],
      ['add-new', '{ query }'],
    ],
    slots: [['item', 'Custom row content; receives { item, index }']],
  },
  /* ── Layout ────────────────────────────────────────────
     Containers, not controls: no value, no label or message line, no tone.
     They take `noField` for the page and `demo: 'container'` for the stage,
     which renders sample content inside each — a frame around nothing shows
     nothing. Their class map is ApexContainerClasses, not ApexFieldClasses. */
  {
    id: 'toolbar', name: 'ApexToolbar', group: 'Layout', noField: true, demo: 'container',
    blurb: 'A bar with start, center and end regions. Contents are slotted, since a toolbar holds whatever the screen needs; the component owns the layout and the chrome. Start and end grow equally from zero, so the centre sits on the bar’s midpoint whatever the sides hold.',
    base: { size: 'md', bordered: true },
    controls: [
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'gap', type: 'text' }, { key: 'padding', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'bordered', type: 'bool' }, { key: 'raised', type: 'bool' },
      { key: 'wrap', type: 'bool' },
      { key: 'sticky', type: 'bool' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' }, { key: 'color', type: 'color' },
    ],
    props: [
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Padding and the gap between items'],
      ['gap', 'string', "'8px'", 'Gap within a region'],
      ['wrap', 'boolean', 'false', 'Wrap the regions onto more lines instead of scrolling'],
      ['background / borderColor / color', 'string', 'tokens', 'Chrome colours'],
      ['radius / padding', 'string', 'tokens', ''],
      ['bordered', 'boolean', 'true', 'Draw a border'],
      ['raised', 'boolean', 'false', 'Elevation instead of a border'],
      ['sticky', 'boolean', 'false', 'Stick to the top of the scroll container'],
    ],
    events: [],
    slots: [
      ['start', 'Leading region \u2014 grows equally with end, which is what centres the middle'],
      ['center', 'Middle region'],
      ['end', 'Trailing region'],
      ['default', 'Used instead of the regions when you want to lay the bar out yourself'],
    ],
  },
  {
    id: 'tabs', name: 'ApexTabs', group: 'Layout', noField: true, demo: 'container',
    blurb: 'Tabbed panels with a sliding indicator. Four variants, either orientation, optional scrolling when the strip outgrows its box, and lazy panels that mount on first view.',
    base: { variant: 'underline', size: 'md' },
    controls: [
      { key: 'placement', type: 'select', options: ['top', 'bottom', 'left', 'right'] },
      { key: 'variant', type: 'select', options: ['underline', 'pill', 'enclosed'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'align', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'fill', type: 'bool' }, { key: 'bordered', type: 'bool' },
      { key: 'selectOnFocus', type: 'bool' }, { key: 'lazy', type: 'bool' },
      { key: 'unmountInactive', type: 'bool' }, { key: 'tabsOnly', type: 'bool' },
      { key: 'stripWidth', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'radius', type: 'text' },
      { key: 'activeColor', type: 'color' }, { key: 'indicatorColor', type: 'color' },
      { key: 'tabColor', type: 'color' }, { key: 'stripBackground', type: 'color' },
      { key: 'borderColor', type: 'color' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['tabs', 'TabItem[]', '[]', '{ value?, label?, icon?, badge?, badgeSeverity?, disabled?, lazy? }'],
      ['modelValue', 'string | number', 'first enabled', "v-model \u2014 the active tab's value, or its 1-based index when unset"],
      ['placement', "'top' | 'bottom' | 'left' | 'right'", "'top'", 'Which edge the strip sits on'],
      ['variant', "'underline' | 'pill' | 'enclosed'", "'underline'", 'Moving bar, filled tab, or folder tabs'],
      ['selectOnFocus', 'boolean', 'false', 'Arrow keys activate as they move, rather than only moving focus'],
      ['lazy', 'boolean', 'false', 'Defer every panel until its tab is first shown; per-tab lazy overrides'],
      ['unmountInactive', 'boolean', 'false', 'Discard a panel when it deactivates, so it re-initialises next time'],
      ['tabsOnly', 'boolean', 'false', 'Tabs without panels \u2014 a nav strip for router-view'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['fill / align', "boolean / 'start' | 'center' | 'end'", "false / 'start'", 'Stretch the tabs, or align the strip'],
      ['activeColor / indicatorColor / tabColor', 'string', 'tokens', 'Active label, the bar, and idle labels'],
      ['stripBackground / borderColor / radius / padding', 'string', 'tokens', 'Chrome and panel padding'],
      ['bordered', 'boolean', 'false', 'Frame the whole component'],
      ['stripWidth', 'string', "'180px'", 'Strip width for the left and right placements'],
      ['disabled', 'boolean', 'false', 'Every tab becomes unselectable'],
    ],
    events: [
      ['update:modelValue', 'string | number'],
      ['tab-change', '{ value, index, previous }'],
    ],
    slots: [
      ['panel-1, panel-2, \u2026', 'Content per tab; receives { tab, index, active }'],
      ['tab-1, tab-2, \u2026', 'Replaces a tab\u2019s contents; receives { tab, index, active }'],
    ],
  },
  {
    id: 'steps', name: 'ApexSteps', group: 'Layout', noField: true, demo: 'container',
    blurb: 'A numbered sequence with a panel per step. `linear` gates forward movement until the current step is complete; the optional nav bar gives Back and Next without wiring them yourself.',
    base: { orientation: 'horizontal', showNav: true },
    controls: [
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'linear', type: 'bool' }, { key: 'stepsOnly', type: 'bool' },
      { key: 'showNav', type: 'bool' }, { key: 'showComplete', type: 'bool' },
      { key: 'hideConnector', type: 'bool' },
      { key: 'as', type: 'select', options: ['button', 'div'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'markerSize', type: 'number' },
      { key: 'activeColor', type: 'color' }, { key: 'completeColor', type: 'color' },
      { key: 'connectorColor', type: 'color' },
      { key: 'completeIcon', type: 'text' },
      { key: 'backLabel', type: 'text' }, { key: 'nextLabel', type: 'text' }, { key: 'finishLabel', type: 'text' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['steps', 'StepsStep[]', '[]', '{ value?, label?, subtitle?, icon?, disabled?, completed?, incomplete? }'],
      ['modelValue', 'string | number', 'first step', "v-model — the active step's value, or its 1-based index when unset"],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Vertical interleaves each panel with its own header'],
      ['linear', 'boolean', 'false', 'Only the current step, those behind it, and the next unblocked one are reachable'],
      ['stepsOnly', 'boolean', 'false', 'Header only — a bare progress indicator'],
      ['as', "'button' | 'div'", "'button'", 'What a header renders as'],
      ['showNav', 'boolean', 'false', 'Built-in Back / Next under each panel'],
      ['backLabel / nextLabel / finishLabel', 'string', "'Back' / 'Next' / 'Finish'", ''],
      ['showComplete / completeIcon', 'boolean / string', "true / 'check'", 'Tick on completed steps'],
      ['hideConnector', 'boolean', 'false', 'Drop the rail between markers'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['markerSize', 'number', 'from size', 'Marker diameter in pixels'],
      ['activeColor / completeColor / connectorColor', 'string', 'tokens', ''],
      ['disabled', 'boolean', 'false', 'Every header becomes unreachable'],
    ],
    events: [
      ['update:modelValue', 'string | number'],
      ['step-change', '{ value, index, previous }'],
      ['finish', '{ value, index } — Next on the last step'],
    ],
    slots: [
      ['panel-1, panel-2, …', 'Content per step; receives { step, index, back, next }'],
      ['step-1, step-2, …', 'Replaces a header; receives { step, index, active, complete }'],
    ],
  },
  {
    id: 'splitter', name: 'ApexSplitter', group: 'Layout', noField: true, demo: 'container',
    blurb: 'Resizable panes with a draggable gutter. Sizes are percentages, so the split survives a window resize; `stateKey` remembers where the user left it.',
    base: { layout: 'horizontal', height: '220px' },
    controls: [
      { key: 'layout', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'height', type: 'text' }, { key: 'gutterSize', type: 'number' },
      { key: 'step', type: 'number' }, { key: 'showHandle', type: 'bool' },
      { key: 'disabled', type: 'bool' }, { key: 'bordered', type: 'bool' },
      { key: 'radius', type: 'text' }, { key: 'borderColor', type: 'color' },
      { key: 'gutterColor', type: 'color' }, { key: 'gutterHoverColor', type: 'color' },
    ],
    props: [
      ['panels', 'SplitterPanel[]', '[{}, {}]', '{ size?, minSize?, maxSize?, collapsible?, collapsedSize?, key? } — all percentages'],
      ['sizes', 'number[]', '—', 'v-model:sizes — percentages, one per panel'],
      ['layout', "'horizontal' | 'vertical'", "'horizontal'", ''],
      ['step', 'number', '5', 'Percent moved per arrow-key press'],
      ['gutterSize', 'number', '6', 'Gutter thickness in pixels'],
      ['stateKey / stateStorage', "string / 'local' | 'session'", "— / 'local'", 'Persist sizes without bookkeeping; v-model:sizes does the same by hand'],
      ['disabled', 'boolean', 'false', 'Every gutter becomes non-interactive; the root carries data-disabled'],
      ['height / bordered / radius / borderColor', 'string / boolean / string', "'260px' / true", 'Chrome'],
      ['gutterColor / gutterHoverColor / showHandle', 'string / string / boolean', 'tokens / true', 'Gutter appearance'],
    ],
    events: [
      ['update:sizes', 'number[]'],
      ['resizestart / resize / resizeend', '{ sizes, index }'],
      ['collapse', '{ index, collapsed, sizes }'],
    ],
    slots: [
      ['panel-1, panel-2, …', 'Content per panel; receives { size, index }'],
      ['gutter', 'Replaces the grip; receives { index }'],
    ],
  },
  {
    id: 'scrollarea', name: 'ApexScrollArea', group: 'Layout', noField: true, demo: 'container',
    blurb: 'A box that scrolls with styled bars instead of the browser’s. Scrolling itself stays native — wheel, trackpad, keyboard, touch and scroll-anchoring all behave normally; only the bars are drawn by the component, and the thumb is measured so it tracks content that changes size.',
    base: { height: '180px', variant: 'auto' },
    controls: [
      { key: 'variant', type: 'select', options: ['auto', 'hover', 'scroll', 'always', 'hidden'] },
      { key: 'height', type: 'text' }, { key: 'maxHeight', type: 'text' },
      { key: 'width', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'mask', type: 'bool' }, { key: 'scrollbarSize', type: 'number' },
      { key: 'thumbColor', type: 'color' }, { key: 'thumbHoverColor', type: 'color' },
      { key: 'trackColor', type: 'color' }, { key: 'thumbRadius', type: 'text' },
    ],
    props: [
      ['variant', "'auto' | 'hover' | 'scroll' | 'always' | 'hidden'", "'auto'", 'auto — bars only while the axis can scroll · hover — as auto but faded until hovered · scroll — visible only while scrolling · always — never hidden · hidden — no bars, scrolling still works'],
      ['height / maxHeight / width', 'string', 'auto', 'Unset means size to content'],
      ['padding', 'string', '—', 'Inside the viewport'],
      ['mask', 'boolean', 'false', 'Gradient fade at whichever edges have more content beyond them'],
      ['scrollbarSize', 'number', '8', 'Bar thickness in pixels'],
      ['thumbColor / thumbHoverColor / trackColor / thumbRadius', 'string', '—', 'Over --apex-scroll-*'],
    ],
    events: [['scroll', '{ top, left }']],
    slots: [['default', 'The scrolling content']],
    exposed: [
      ['viewport', 'The scrolling element itself'],
      ['measure()', 'Re-measure after changing content the ResizeObserver cannot see'],
      ['scrollTo(options)', 'Forwards to the viewport'],
    ],
  },
  {
    id: 'panel', name: 'ApexPanel', group: 'Layout', noField: true, demo: 'container',
    blurb: 'A titled section, optionally collapsible. Where ApexFieldset groups form controls with a legend on its border, a panel is the general-purpose block: a header with actions, a body, and a footer.',
    base: { header: 'Fees', subheader: 'Applied per order', icon: 'payments', bordered: true },
    controls: [
      { key: 'header', type: 'text' }, { key: 'subheader', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'toggleable', type: 'bool' },
      { key: 'togglePosition', type: 'select', options: ['start', 'end'] },
      { key: 'expandIcon', type: 'text' }, { key: 'collapseIcon', type: 'text' },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'bordered', type: 'bool' }, { key: 'flush', type: 'bool' },
      { key: 'shadow', type: 'select', options: ['none', 'sm', 'md'] },
      { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
      { key: 'headerBackground', type: 'color' }, { key: 'headerColor', type: 'color' },
    ],
    props: [
      ['header / subheader / icon', 'string', '—', 'Header bar shortcuts; the header slot replaces all three'],
      ['toggleable', 'boolean', 'false', 'Adds a toggle to the header bar'],
      ['collapsed', 'boolean', 'false', 'v-model:collapsed — the state is yours to read or set'],
      ['expandIcon / collapseIcon', 'string', 'chevrons', 'Indicator glyphs'],
      ['togglePosition', "'start' | 'end'", "'end'", 'Before the title, or at the end of the bar'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Padding and title scale'],
      ['shadow', "'none' | 'sm' | 'md'", "'none'", ''],
      ['bordered / radius / borderColor / background / padding', 'boolean / string', 'true / tokens', 'Chrome'],
      ['headerBackground / headerColor', 'string', 'tokens', 'Header bar colours'],
      ['flush', 'boolean', 'false', 'Drop the divider under the header'],
    ],
    events: [['update:collapsed', 'boolean'], ['toggle', '{ collapsed }']],
    slots: [
      ['default', 'Body content'],
      ['header', 'Replaces the icon, title and subtitle'],
      ['icons', 'Actions at the end of the header bar'],
      ['toggleicon', 'The indicator; receives { collapsed }'],
      ['footer', 'Below the body'],
    ],
  },
  {
    id: 'fieldset', name: 'ApexFieldset', group: 'Layout', noField: true, demo: 'container',
    blurb: 'A real <fieldset> whose legend straddles the border, optionally collapsible. Use it to group related form controls — `disabled` disables every control inside it in one go, which a plain div cannot do.',
    base: { legend: 'Lead booker', icon: 'person', bordered: true },
    controls: [
      { key: 'legend', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'toggleable', type: 'bool' },
      { key: 'legendAlign', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'bordered', type: 'bool' }, { key: 'disabled', type: 'bool' },
      { key: 'expandIcon', type: 'text' }, { key: 'collapseIcon', type: 'text' },
      { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
      { key: 'legendBackground', type: 'color' }, { key: 'legendColor', type: 'color' },
    ],
    props: [
      ['legend / icon', 'string', '—', 'Legend text and an optional glyph; the legend slot replaces both'],
      ['toggleable', 'boolean', 'false', 'Makes the legend a button that collapses the content'],
      ['collapsed', 'boolean', 'false', 'v-model:collapsed — the state is yours to read or set'],
      ['expandIcon / collapseIcon', 'string', "'add' / 'remove'", 'Indicator glyphs'],
      ['legendAlign', "'start' | 'center' | 'end'", "'start'", ''],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Padding and type scale'],
      ['bordered / radius / borderColor / background / padding', 'boolean / string', 'true / tokens', 'Chrome'],
      ['legendBackground / legendColor', 'string', 'tokens', 'The legend chip — set the background to match a tinted panel'],
      ['disabled', 'boolean', 'false', 'Disables the fieldset, and every control inside it'],
    ],
    events: [['update:collapsed', 'boolean'], ['toggle', '{ collapsed }']],
    slots: [
      ['default', 'The grouped content'],
      ['legend', 'Replaces the legend text'],
      ['toggleicon', 'The indicator; receives { collapsed }'],
    ],
  },
  {
    id: 'card', name: 'ApexCard', group: 'Layout', noField: true, demo: 'container',
    blurb: 'Media, header, body and footer, each a slot. The common cases are props, so a plain card needs no markup at all. Give it `href` or `clickable` and it renders as a link or a button rather than a div with a click handler.',
    base: { title: 'Aida', subtitle: 'Teatru Manoel · 14 March', bordered: true, shadow: 'sm' },
    controls: [
      { key: 'title', type: 'text' }, { key: 'subtitle', type: 'text' },
      { key: 'shadow', type: 'select', options: ['none', 'sm', 'md', 'lg'] },
      { key: 'bordered', type: 'bool' }, { key: 'hoverable', type: 'bool' },
      { key: 'clickable', type: 'bool' }, { key: 'horizontal', type: 'bool' },
      { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
      { key: 'imageHeight', type: 'text' },
    ],
    props: [
      ['title / subtitle', 'string', '—', 'Header shortcuts; the header slot replaces both'],
      ['image / imageAlt / imageHeight', 'string', '—', 'Media across the top; the media slot replaces it'],
      ['bordered / borderColor / radius / background / padding', 'boolean / string', 'true / tokens', 'Chrome'],
      ['shadow', "'none' | 'sm' | 'md' | 'lg'", "'sm'", ''],
      ['hoverable', 'boolean', 'false', 'Lift on hover'],
      ['clickable / href', 'boolean / string', 'false', 'Renders a button or an anchor and emits click'],
      ['horizontal', 'boolean', 'false', 'Media beside the content rather than above it'],
    ],
    events: [['click', 'MouseEvent — when clickable or href is set']],
    slots: [
      ['default', 'Body content'],
      ['header', 'Replaces title and subtitle'],
      ['media', 'Replaces the image — for an image plus an overlaid avatar, say'],
      ['footer', 'Actions below the body'],
    ],
  },
  {
    id: 'accordion', name: 'ApexAccordion', group: 'Layout', noField: true, demo: 'container',
    blurb: 'Stacked collapsible panels. One at a time by default; `multiple` lets several stand open and turns the model into an array. `lazy` mounts a panel’s content on first open.',
    base: { bordered: true },
    controls: [
      { key: 'multiple', type: 'bool' }, { key: 'collapsible', type: 'bool' }, { key: 'lazy', type: 'bool' },
      { key: 'togglePosition', type: 'select', options: ['start', 'end'] },
      { key: 'expandIcon', type: 'text' }, { key: 'collapseIcon', type: 'text' },
      { key: 'gap', type: 'text' }, { key: 'bordered', type: 'bool' },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'radius', type: 'text' }, { key: 'borderColor', type: 'color' },
      { key: 'headerBackground', type: 'color' }, { key: 'headerColor', type: 'color' },
      { key: 'activeBackground', type: 'color' }, { key: 'activeColor', type: 'color' },
      { key: 'contentBackground', type: 'color' },
    ],
    props: [
      ['items', 'AccordionPanel[]', '[]', '{ value, header?, content?, icon?, badge?, disabled?, data? }'],
      ['value', 'string | number | array | null', '—', 'v-model:value — the open panel, or panels when multiple'],
      ['multiple', 'boolean', 'false', 'Allow several panels open at once'],
      ['collapsible', 'boolean', 'true', 'Allow closing the only open panel'],
      ['lazy', 'boolean', 'false', 'Build a panel\'s content the first time it opens, then keep it'],
      ['togglePosition', "'start' | 'end'", "'end'", 'Which side the indicator sits on'],
      ['expandIcon / collapseIcon', 'string', 'chevrons', 'Indicator glyphs'],
      ['gap', 'string', '—', 'A length turns the joined stack into separated cards'],
      ['bordered / radius / borderColor', 'boolean / string / string', 'true / token', 'Chrome'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Padding and type scale'],
      ['headerBackground / headerColor', 'string', 'tokens', 'Header colours'],
      ['activeBackground / activeColor', 'string', 'tokens', 'Open and hovered header'],
      ['contentBackground', 'string', 'token', 'Panel body'],
    ],
    events: [['update:value', 'value | value[] | null'], ['panel-open / panel-close', 'AccordionPanel']],
    slots: [
      ['header', 'Header content; receives { panel, active, index }'],
      ['content', 'Panel body; receives { panel, active, index }. The default slot works too'],
      ['toggleicon', 'The indicator; receives { panel, active }'],
    ],
  },
  {
    id: 'checkbox', name: 'ApexCheckbox', group: 'Choice',
    blurb: 'One box. Binary by default; give it a `value` and several boxes share one array model. `indeterminate` draws the mixed state for a parent box — visual only, since clicking a parent should resolve its children rather than cycle through three states.',
    model: true,
    base: { label: 'I agree to the terms', hint: 'Required before checkout' },
    controls: [
      { key: 'label', type: 'text' }, { key: 'hint', type: 'text' },
      { key: 'labelPlacement', type: 'select', options: ['after', 'before'] },
      { key: 'card', type: 'bool' }, { key: 'indeterminate', type: 'bool' },
      { key: 'icon', type: 'text' }, { key: 'required', type: 'bool' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'boolean | unknown[]', 'false', 'A boolean on its own; an array when `value` is given'],
      ['value', 'unknown', '—', 'Given, the box toggles this inside a modelValue array'],
      ['indeterminate', 'boolean', 'false', 'The mixed state. Visual only — clicking still checks'],
      ['card', 'boolean', 'false', 'Bordered choice card'],
      ['hint', 'string', '—', 'Second line under the label'],
      ['icon / image', 'string', '—', 'Before the label'],
      ['labelPlacement', "'after' | 'before'", "'after'", 'Which side of the box the label sits. A checkbox always draws its own label, so the other placements do not apply'],
    ],
    events: [['update:modelValue', 'boolean | value[]'], ['change', 'boolean']],
    slots: [['default', 'Replaces the label, for links inside it']],
  },
  {
    id: 'checkboxgroup', name: 'ApexCheckboxGroup', group: 'Choice',
    blurb: 'Boxes generated from a list, with the chosen values as an array. The rows are ApexCheckbox, so anything on that page applies here. `max` caps the selection by disabling the rows that are not chosen, rather than accepting the click and dropping it.',
    model: ['events.view', 'events.edit'],
    base: {
      label: 'Permissions', toggleAll: true,
      options: [
        { value: 'events.view', label: 'View events', help: 'Read-only access' },
        { value: 'events.edit', label: 'Edit events', help: 'Create and amend' },
        { value: 'events.delete', label: 'Delete events', help: 'Irreversible' },
        { value: 'reports.all', label: 'All reports', disabled: true, help: 'Admin only' },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'inline', type: 'bool' },
      { key: 'columns', type: 'number' }, { key: 'card', type: 'bool' },
      { key: 'toggleAll', type: 'bool' }, { key: 'max', type: 'number' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown[]', '[]', 'The chosen values'],
      ['options', 'ApexOption[] | string[]', '[]', 'Strings, or objects with icon, image, help and disabled'],
      ['inline', 'boolean', 'false', 'Lay the boxes out in a row'],
      ['columns', 'number', '—', 'Fixed column count instead of one per row'],
      ['card', 'boolean', 'false', 'Bordered choice cards'],
      ['toggleAll', 'boolean', 'false', 'Select all / clear all above the list'],
      ['max', 'number', '—', 'Cap the number of selections'],
    ],
    events: [['update:modelValue', 'value[]'], ['change', '—']],
    slots: [['option', 'Custom row content; receives { option }']],
  },
  {
    id: 'radio', name: 'ApexRadio', group: 'Choice',
    blurb: 'One radio. Usually you want ApexRadioGroup, which generates these from a list; reach for this when the layout is yours — radios in table cells, or spread across a form. Every radio sharing a model must share `name`, or the browser will not treat them as one group.',
    model: 'pro',
    base: { label: 'Pro', value: 'pro', name: 'plan-demo', hint: 'Ten events a month' },
    controls: [
      { key: 'label', type: 'text' }, { key: 'hint', type: 'text' },
      { key: 'card', type: 'bool' }, { key: 'icon', type: 'text' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown', '—', 'The chosen value, shared with the others in the group'],
      ['value', 'unknown', '—', 'What this one contributes when chosen'],
      ['name', 'string', 'generated', 'The shared group name. Falls back to a generated one so a lone radio still groups'],
      ['card', 'boolean', 'false', 'Bordered choice card'],
      ['hint', 'string', '—', 'Second line under the label'],
      ['bare', 'boolean', 'false', 'No field shell — set by ApexRadioGroup for its rows, since the group has already drawn one'],
    ],
    events: [['update:modelValue', 'value'], ['change', 'value']],
    slots: [['default', 'Replaces the label']],
  },
  {
    id: 'radiogroup', name: 'ApexRadioGroup', group: 'Choice',
    blurb: 'Radios generated from a list, stacked, inline or in columns. The rows are ApexRadio, so the markup for a radio lives in one place and anything on that page applies here.',
    model: 'pro',
    base: {
      label: 'Plan', card: true,
      options: [
        { value: 'free', label: 'Free', help: 'One event, no fees' },
        { value: 'pro', label: 'Pro', help: 'Ten events a month' },
        { value: 'max', label: 'Unlimited', help: 'Talk to us' },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'card', type: 'bool' },
      { key: 'inline', type: 'bool' }, { key: 'columns', type: 'number' },
      { key: 'required', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown', '—', 'The chosen value'],
      ['options', 'ApexOption[] | string[]', '[]', 'Strings, or objects with icon, image, help and disabled'],
      ['card', 'boolean', 'false', 'Each option as a bordered choice card'],
      ['inline', 'boolean', 'false', 'Lay them out in a row'],
      ['columns', 'number', '—', 'Fixed column count'],
    ],
    events: [['update:modelValue', 'value'], ['change', 'value']],
    slots: [['option', 'Custom row content; receives { option }']],
  },
  {
    id: 'switch', name: 'ApexSwitch', group: 'Choice',
    blurb: 'A checkbox in switch form, for a setting that takes effect at once. `onLabel` and `offLabel` put the state inside the track — both words are rendered into one grid cell, so the track sizes to the longer of the two and toggling never changes its width.',
    model: true,
    base: { label: 'Accepting bookings' },
    controls: [
      { key: 'label', type: 'text' },
      { key: 'onLabel', type: 'text' }, { key: 'offLabel', type: 'text' },
      { key: 'labelPlacement', type: 'select', options: ['after', 'before'] },
      { key: 'help', type: 'text' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'boolean', 'false', 'v-model'],
      ['labelPlacement', 'ApexLabelPlacement', "'after'", 'Overridden default'],
      ['onLabel / offLabel', 'string', '—', 'Words inside the track. Keep them short'],
    ],
    events: [['update:modelValue', 'boolean'], ['change', 'boolean']],
  },
  {
    id: 'segmented', name: 'ApexSegmented', group: 'Choice',
    blurb: 'A radiogroup styled as one bar, for switching a view. Arrow keys move the selection and carry focus with it. This is the simple case on purpose — ApexSelectButton is the same idea with multiple choice, detached buttons, vertical stacking, icon-only mode and per-option colours.',
    model: 'week',
    base: {
      label: 'View',
      options: [
        { value: 'day', label: 'Day', icon: 'calendar_view_day' },
        { value: 'week', label: 'Week', icon: 'calendar_view_week' },
        { value: 'month', label: 'Month', icon: 'calendar_view_month' },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'block', type: 'bool' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown', '—', 'The chosen value'],
      ['options', 'ApexOption[] | string[]', '[]', 'Strings, or objects with icon and disabled'],
      ['block', 'boolean', 'false', 'Full width, equal segments'],
    ],
    events: [['update:modelValue', 'value'], ['change', 'value']],
    slots: [['option', 'Custom segment content; receives { option }']],
  },
  {
    id: 'selectbutton', name: 'ApexSelectButton', group: 'Choice',
    blurb: 'A row of buttons acting as one control. Single choice is a radiogroup; `multiple` turns it into independent toggles and the model becomes an array. Same options shape as the selects.',
    model: 'card',
    base: {
      label: 'Payment method',
      options: [
        { value: 'card', label: 'Card', icon: 'credit_card', help: 'Visa, Mastercard' },
        { value: 'cash', label: 'Cash', icon: 'payments', help: 'Door sales only' },
        { value: 'comp', label: 'Complimentary', icon: 'card_giftcard' },
      ],
    },
    controls: [
      { key: 'label', type: 'text' }, { key: 'multiple', type: 'bool' },
      { key: 'block', type: 'bool' }, { key: 'vertical', type: 'bool' },
      { key: 'detached', type: 'bool' }, { key: 'iconOnly', type: 'bool' },
      { key: 'color', type: 'color' }, { key: 'textColor', type: 'color' },
      { key: 'mutedColor', type: 'color' },
      { key: 'allowEmpty', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'unknown | unknown[]', '—', 'An array once multiple is on'],
      ['options', 'ApexOption[] | string[]', '[]', 'Strings, or objects with icon, image, help and disabled'],
      ['multiple', 'boolean', 'false', 'Independent toggles rather than one choice'],
      ['block / vertical', 'boolean', 'false', 'Full width; stacked'],
      ['detached', 'boolean', 'false', 'Separate buttons with a gap instead of one joined bar'],
      ['allowEmpty', 'boolean', 'true', 'Re-clicking the chosen one clears it'],
      ['iconOnly', 'boolean', 'false', 'Labels move to the tooltip and the accessible name'],
      ['color / textColor / mutedColor', 'string', '—', 'The chosen button, its label, and the unchosen labels'],
    ],
    events: [['update:modelValue', 'value | value[]'], ['change', '—']],
    slots: [['option', 'Custom button content; receives { option }']],
  },
  {
    id: 'togglebutton', name: 'ApexToggleButton', group: 'Choice',
    blurb: 'A single button holding a boolean, with its own label, icon and colour per state. It sits between ApexSwitch — a settings row — and ApexSelectButton, which is a choice among several.',
    model: false,
    base: { label: 'Bookings', onLabel: 'Live', offLabel: 'Paused', onIcon: 'play_arrow', offIcon: 'pause' },
    controls: [
      { key: 'label', type: 'text' },
      { key: 'onLabel', type: 'text' }, { key: 'offLabel', type: 'text' },
      { key: 'onIcon', type: 'text' }, { key: 'offIcon', type: 'text' },
      { key: 'variant', type: 'select', options: ['solid', 'outline'] },
      { key: 'block', type: 'bool' },
      { key: 'onColor', type: 'color' }, { key: 'onTextColor', type: 'color' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'boolean', 'false', 'v-model'],
      ['onLabel / offLabel', 'string', '—', 'Label per state; falls back to `label`'],
      ['onIcon / offIcon', 'string', '—', 'Icon per state'],
      ['variant', "'solid' | 'outline'", "'solid'", 'Outlined while on, instead of filled'],
      ['onColor / onTextColor', 'string', '—', 'The on state'],
      ['block', 'boolean', 'false', 'Full width'],
    ],
    events: [['update:modelValue', 'boolean'], ['change', 'boolean']],
    slots: [['default', 'Custom content; receives { on }']],
  },
  {
    id: 'rating', name: 'ApexRating', group: 'Choice',
    blurb: 'Star selection with half stars, any star count, four preset shapes or your own glyphs, an optional clear button and a read-only display mode. Arrow keys step by one, or by a half when allowHalf is on.',
    model: 3.5,
    base: { label: 'Rating', stars: 5, allowHalf: true, cancel: true, showValue: true },
    controls: [
      { key: 'label', type: 'text' }, { key: 'stars', type: 'number' },
      { key: 'allowHalf', type: 'bool' },
      { key: 'shape', type: 'select', options: ['star', 'triangle', 'dot', 'square'] },
      { key: 'variant', type: 'select', options: ['filled', 'outline'] },
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'starSize', type: 'number' }, { key: 'icon', type: 'text' },
      { key: 'color', type: 'color' },
      { key: 'cancel', type: 'bool' }, { key: 'showValue', type: 'bool' },
      { key: 'readonly', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'number | null', '—', 'v-model; null when cleared'],
      ['stars', 'number', '5', 'How many'],
      ['allowHalf', 'boolean', 'false', 'Half-star selection, by which half of a star you point at'],
      ['shape', "'star' | 'triangle' | 'dot' | 'square'", "'star'", 'Preset glyph; ignored when `icon` is given'],
      ['icon / emptyIcon', 'string', '—', 'Your own glyphs for the two states'],
      ['variant', "'filled' | 'outline'", "'filled'", 'Solid glyphs or outlined'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", ''],
      ['starSize', 'number', '—', 'Star size in pixels; defaults to the field size'],
      ['color', 'string', '—', 'Filled colour; defaults to the warning accent'],
      ['cancel', 'boolean', 'false', 'A × that clears the value'],
      ['showValue', 'boolean', 'false', 'Text beside the stars'],
    ],
    events: [['update:modelValue', 'number | null'], ['change', 'number | null']],
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
    id: 'colorpicker', name: 'ApexColorPicker', group: 'Dates',
    blurb: 'Composable colour picker: saturation/value area, hue and opacity sliders, swatch presets, channel boxes and a format switcher. Popover by default, inline when embedded.',
    model: '#0B5FFF',
    base: {
      label: 'Brand colour', showAlpha: true, showFormatToggle: true, showChannels: true,
      presets: ['#0B5FFF', '#137C4A', '#C24A06', '#C41E1E', '#0F141C', '#5F6C7E', '#FFFFFF'],
    },
    controls: [
      { key: 'label', type: 'text' },
      { key: 'format', type: 'select', options: ['hex', 'rgb', 'hsl', 'hsb'] },
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'showAlpha', type: 'bool' }, { key: 'showFormatToggle', type: 'bool' },
      { key: 'showChannels', type: 'bool' }, { key: 'showInput', type: 'bool' },
      { key: 'inline', type: 'bool' }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string', '—', 'v-model — a CSS colour string in the current format'],
      ['format', "'hex' | 'rgb' | 'hsl' | 'hsb'", "'hex'", 'Output format'],
      ['showAlpha', 'boolean', 'true', 'Opacity slider, and alpha in the output'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Sliders under the area, or beside it'],
      ['presets', 'string[]', '—', 'Swatch row under the picker'],
      ['showInput / showChannels / showFormatToggle', 'boolean', 'true / false / false', 'Optional parts'],
      ['inline', 'boolean', 'false', 'Render in place instead of a popover'],
    ],
    events: [['update:modelValue', 'string'], ['change', 'ApexColor']],
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

  /* Utilities — the small markers. Each renders from its props, so the stage
     is `plain`; ApexChip is the exception, because a selectable chip has a
     second model and a demo you cannot press is not a demo. */
  {
    id: 'badge', name: 'ApexBadge', group: 'Utilities',
    blurb: 'A small count or status marker. Sized from its own content with a circular minimum, so a single digit is a circle and a longer value grows into a pill rather than being clipped. ApexOverlayBadge pins one to the corner of whatever it wraps — a wrapper rather than a prop on every component, so any element can carry a badge and the badge keeps its own props instead of each host re-declaring them.',
    noField: true, demo: 'plain',
    tail: ' />',
    base: { value: '8', severity: 'primary', size: 'md', variant: 'solid' },
    controls: [
      { key: 'value', type: 'text' },
      { key: 'severity', type: 'select', options: ['primary', 'secondary', 'success', 'warn', 'danger', 'info', 'contrast'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
      { key: 'variant', type: 'select', options: ['solid', 'outlined', 'subtle'] },
      { key: 'dot', type: 'bool' },
      { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'color', type: 'color' },
      { key: 'borderColor', type: 'color' },
    ],
    props: [
      ['value', 'string | number', '—', 'Also settable as the default slot'],
      ['severity', "'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'contrast'", "'primary'", ''],
      ['size', "'sm' | 'md' | 'lg' | 'xl' | number", "'md'", 'A number is pixels; the text scales with it'],
      ['dot', 'boolean', 'false', 'Drops the value for the “something changed” case'],
      ['variant', "'solid' | 'outlined' | 'subtle'", "'solid'", ''],
      ['background / color / borderColor / radius', 'string', 'per severity', ''],
    ],
    events: [],
    slots: [['default', 'The value']],
    serviceTitle: 'ApexOverlayBadge',
    serviceRows: [
      ['position', "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'", 'Which corner of the host it sits on'],
      ['ring / ringColor', 'boolean / string', 'A ring separating the badge from a busy host — on by default'],
      ['value, severity, size, dot, variant, background, color, borderColor, radius', 'passthrough', 'Handed to the badge inside'],
      ['default slot', 'the host', 'Anything: an icon, an avatar, a button, a card'],
      ['badge slot', 'the badge', 'Replaces the value when it needs markup'],
      ['ApexButton badge / badgeSeverity', 'inline', 'Buttons carry their own badge without the wrapper'],
    ],
  },
  {
    id: 'chip', name: 'ApexChip', group: 'Utilities',
    blurb: 'A compact entity: a label with an optional icon, image or avatar, and an optional remove action. A selectable chip renders as a button and a plain one as a span — a chip that answers a click has to be keyboard reachable, and a chip that only labels something should not be a tab stop. The remove control is always its own button, so it stays separately reachable inside a selectable chip.',
    noField: true, demo: 'chip',
    tail: ' />',
    base: { label: 'Northern Harbour', icon: 'place', severity: 'neutral', variant: 'subtle', size: 'md', removable: true },
    controls: [
      { key: 'label', type: 'text' }, { key: 'icon', type: 'text' }, { key: 'trailingIcon', type: 'text' },
      { key: 'severity', type: 'select', options: ['neutral', 'primary', 'secondary', 'success', 'warn', 'danger', 'info', 'contrast'] },
      { key: 'variant', type: 'select', options: ['solid', 'subtle', 'outlined'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'removable', type: 'bool' }, { key: 'clickable', type: 'bool' },
      { key: 'selected', type: 'bool' }, { key: 'disabled', type: 'bool' },
      { key: 'radius', type: 'text' }, { key: 'width', type: 'text' },
      { key: 'padding', type: 'text' }, { key: 'gap', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'color', type: 'color' },
      { key: 'borderColor', type: 'color' }, { key: 'hoverBackground', type: 'color' },
      { key: 'selectedBackground', type: 'color' }, { key: 'selectedColor', type: 'color' },
    ],
    props: [
      ['label', 'string', '—', 'Also settable as the default slot'],
      ['icon / trailingIcon', 'string', '—', 'Leading and trailing glyphs'],
      ['image / imageAlt', 'string', '—', 'An image at the leading edge, bleeding to the chip’s edge so it reads as an avatar rather than an icon inside padding'],
      ['severity', "'neutral' | 'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'contrast'", "'neutral'", ''],
      ['variant', "'solid' | 'subtle' | 'outlined'", "'subtle'", ''],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['removable / removeIcon', 'boolean / string', "false / 'close'", 'Adds the remove control, which emits remove rather than removing itself — the list owns its own data'],
      ['clickable', 'boolean', 'false', 'Makes the chip a control: hover and press states, keyboard reachable, aria-pressed'],
      ['selected / selectedIcon', 'boolean / string', 'false / —', 'v-model:selected — for a chip acting as a filter or multi-choice option; selectedIcon replaces the leading icon while selected'],
      ['disabled', 'boolean', 'false', ''],
      ['radius / width / padding / gap', 'string', 'pill / auto / tokens', 'A radius squares off the pill'],
      ['background / color / borderColor / hoverBackground / selectedBackground / selectedColor', 'string', 'per severity', ''],
    ],
    events: [
      ['click', 'MouseEvent'],
      ['remove', 'MouseEvent — the remove control was pressed'],
      ['update:selected', 'boolean — clickable chips only'],
    ],
    slots: [
      ['default', 'The label'],
      ['leading', 'Replaces the icon or image — an avatar, a colour swatch, a spinner'],
    ],
  },
  {
    id: 'avatar', name: 'ApexAvatar', group: 'Utilities',
    blurb: 'A person or entity in a fixed square: an image, initials or an icon, with an optional status dot. Initials colour themselves from the label, so a list of people is legible without any per-row configuration.',
    noField: true, demo: 'plain',
    tail: ' />',
    base: { label: 'A. Borg', size: 'lg', autoColor: true, status: 'online' },
    controls: [
      { key: 'label', type: 'text' }, { key: 'initials', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'shape', type: 'select', options: ['circle', 'rounded', 'square'] },
      { key: 'size', type: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
      { key: 'autoColor', type: 'bool' },
      { key: 'background', type: 'color' }, { key: 'color', type: 'color' },
      { key: 'ring', type: 'bool' }, { key: 'ringColor', type: 'color' },
      { key: 'status', type: 'select', options: ['', 'online', 'busy', 'away', 'offline'] },
      { key: 'statusPosition', type: 'select', options: ['bottom-end', 'bottom-start', 'top-end', 'top-start'] },
      { key: 'badge', type: 'text' },
      { key: 'badgeSeverity', type: 'select', options: ['primary', 'success', 'warn', 'danger', 'info', 'secondary', 'contrast'] },
      { key: 'badgePosition', type: 'select', options: ['top-end', 'top-start', 'bottom-end', 'bottom-start'] },
      { key: 'badgeBackground', type: 'color' }, { key: 'badgeColor', type: 'color' },
    ],
    props: [
      ['image', 'string', '—', 'Falls back to label initials, then icon, then a person glyph'],
      ['alt', 'string', 'the label', "Alternative text for the image. Falls back to label, then to an empty string — the right answer when the avatar sits beside the same person's name, which a screen reader would otherwise read twice"],
      ['label / initials', 'string', '—', 'Initials derive from the label unless set explicitly'],
      ['icon', 'string', '—', 'Shown when there is no image or label'],
      ['shape', "'circle' | 'rounded' | 'square'", "'circle'", ''],
      ['size', "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number", "'md'", 'A number is pixels; text and icon scale with it'],
      ['autoColor', 'boolean', 'false', 'Tint the initials from the label — the same person keeps the same colour'],
      ['background / color', 'string', 'tokens', 'Explicit colours, overriding autoColor'],
      ['ring / ringColor', 'boolean / string', 'false / surface', 'Ring for stacking on busy backgrounds'],
      ['status', 'online | busy | away | offline | CSS colour', '—', 'Status dot'],
      ['statusPosition', "'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'", "'bottom-end'", ''],
      ['badge', 'string | number', '—', 'A count or short text pinned to a corner. A pill rather than a dot, so it sizes from its own content and holds two digits without clipping'],
      ['badgeSeverity', "'primary' | 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast'", "'danger'", ''],
      ['badgePosition', "'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'", "'top-end'", 'Put it opposite the status dot to show both'],
      ['badgeBackground / badgeColor', 'string', 'per severity', ''],
    ],
    events: [],
    slots: [['default', 'Overlay content inside the avatar, e.g. a badge']],
  },
  {
    id: 'skeleton', name: 'ApexSkeleton', group: 'Utilities',
    blurb: 'A placeholder standing in for content that has not arrived. The shimmer is a background-position animation on a gradient rather than a moving child element — nothing to clip or position, and one compositor property per frame however many are on screen, which matters because a loading screen is made of dozens of them.',
    noField: true, demo: 'plain',
    tail: ' />',
    base: { shape: 'rectangle', animation: 'wave', width: '100%', height: '1.25rem' },
    controls: [
      { key: 'shape', type: 'select', options: ['rectangle', 'rounded', 'square', 'circle', 'text'] },
      { key: 'animation', type: 'select', options: ['wave', 'pulse', 'none'] },
      { key: 'width', type: 'text' }, { key: 'height', type: 'text' }, { key: 'size', type: 'text' },
      { key: 'borderRadius', type: 'text' },
      { key: 'duration', type: 'text' }, { key: 'delay', type: 'text' },
      { key: 'lines', type: 'number' }, { key: 'lineGap', type: 'text' },
      { key: 'lastLineWidth', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'shimmerColor', type: 'color' },
    ],
    props: [
      ['shape', "'rectangle' | 'rounded' | 'square' | 'circle' | 'text'", "'rectangle'", 'text is a line of copy height; rounded takes the large radius'],
      ['size', 'string', "'2.5rem'", 'Diameter for circle and square. Those shapes hold a 1:1 ratio from their width, so a round placeholder stays round even at a percentage width — and cannot come out an ellipse'],
      ['width / height / borderRadius', 'string', '100% / 1rem / tokens', 'height is ignored by circle and square, whose ratio owns that axis — an oval is shape="rounded" with a radius'],
      ['animation', "'wave' | 'pulse' | 'none'", "'wave'", 'wave travels left to right; pulse fades; none is static'],
      ['duration / delay', 'string', "'1.4s' / '0s'", 'A delay staggers a stack so the rows do not shimmer in lockstep'],
      ['lines / lineGap / lastLineWidth', 'number / string / string', "1 / 8px / '65%'", 'With shape="text" and lines > 1 it renders a paragraph block, the last line shortened'],
      ['background / shimmerColor', 'string', 'tokens', 'The base and the travelling band'],
    ],
    events: [],
    serviceTitle: 'Notes',
    serviceRows: [
      ['aria-hidden', 'always', 'A skeleton is decorative — announce loading on the region it stands in for, not on each shape'],
      ['prefers-reduced-motion', 'respected', 'The animation stops; the placeholder stays visible'],
      ['composition', 'expected', 'Card, list, grid and table placeholders are a handful of these in the layout they mimic — no separate components'],
    ],
  },
  {
    id: 'progressspinner', name: 'ApexProgressSpinner', group: 'Utilities',
    blurb: 'A circular status indicator, determinate or not. One SVG circle drives both modes through stroke-dasharray — the determinate arc is the same ring the indeterminate one spins — so a spinner can become a percentage the moment the total is known without the geometry shifting. The radius is derived from the stroke width, so a thick ring never clips.',
    noField: true, demo: 'plain',
    tail: ' />',
    base: { size: 56, strokeWidth: 4, showTrack: true },
    controls: [
      { key: 'value', type: 'number' }, { key: 'max', type: 'number' },
      { key: 'size', type: 'number' }, { key: 'strokeWidth', type: 'number' },
      { key: 'showTrack', type: 'bool' }, { key: 'showValue', type: 'bool' },
      { key: 'pulse', type: 'bool' },
      { key: 'arc', type: 'number' }, { key: 'duration', type: 'text' },
      { key: 'linecap', type: 'select', options: ['round', 'butt'] },
      { key: 'severity', type: 'select', options: ['primary', 'success', 'warning', 'danger', 'auto'] },
      { key: 'color', type: 'color' }, { key: 'trackColor', type: 'color' },
      { key: 'valueColor', type: 'color' }, { key: 'valueSize', type: 'text' },
      { key: 'label', type: 'text' },
    ],
    props: [
      ['value / max', 'number', '— / 100', 'A value makes it determinate; leave it out and it spins'],
      ['size', 'number | string', '48', 'Diameter — a number is pixels'],
      ['strokeWidth', 'number', '4', 'Ring thickness, in the same units as the diameter'],
      ['showTrack / trackColor', 'boolean / string', 'true / tokens', 'The unfilled ring behind the arc — off leaves a bare arc'],
      ['showValue / valueColor / valueSize', 'boolean / string / string', 'false / tokens', 'Percentage in the middle, determinate only'],
      ['arc', 'number', '25', 'How much of the ring the spinning arc covers'],
      ['pulse', 'boolean', 'false', 'Grows and shrinks the arc as well as rotating it — the classic two-part spin'],
      ['duration', 'string', "'1.2s'", 'One rotation, or one pulse cycle'],
      ['linecap', "'round' | 'butt'", "'round'", 'Arc ends'],
      ['color / severity', 'string', "tokens / 'primary'", 'auto tints by threshold — danger under 34%, warning under 67%'],
      ['label', 'string', '—', 'Accessible name for the progressbar role'],
    ],
    events: [],
    slots: [['default', 'Replaces the middle readout; receives { value, percent, formatted }']],
  },
  {
    id: 'metergroup', name: 'ApexMeterGroup', group: 'Utilities',
    blurb: 'Several measurements sharing one track. Segments are sized as percentages of max − min in a flex track, so the bar stays honest about the remainder: whatever is unaccounted for reads as empty track rather than the segments stretching to fill it — which is what separates a meter from a stacked bar chart.',
    noField: true, demo: 'meter',
    lead: [':value="value"'],
    tail: '\n/>',
    base: {
      orientation: 'horizontal', labelPosition: 'end', labelOrientation: 'horizontal',
      showLabels: true, showValues: true, showMarkers: true, hoverable: true,
    },
    controls: [
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'labelPosition', type: 'select', options: ['end', 'start'] },
      { key: 'labelOrientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'showLabels', type: 'bool' }, { key: 'showValues', type: 'bool' },
      { key: 'showMarkers', type: 'bool' },
      { key: 'hoverable', type: 'bool' }, { key: 'animated', type: 'bool' },
      { key: 'min', type: 'number' }, { key: 'max', type: 'number' },
      { key: 'size', type: 'text' }, { key: 'length', type: 'text' },
      { key: 'radius', type: 'text' }, { key: 'segmentRadius', type: 'text' },
      { key: 'gap', type: 'text' }, { key: 'labelSize', type: 'text' },
      { key: 'trackBackground', type: 'color' }, { key: 'labelColor', type: 'color' },
    ],
    props: [
      ['value', 'MeterItem[]', '[]', '{ label, value, color, icon } — colours fall back to a six-step sequence, so a group is legible without any being set'],
      ['min / max', 'number', '0 / 100', 'The range each value is measured against'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Vertical stacks the segments from the bottom'],
      ['labelPosition / labelOrientation', "'end' | 'start' / 'horizontal' | 'vertical'", "'end' / 'horizontal'", 'Labels after or before the track, in a row or a column'],
      ['showLabels / showValues / showMarkers', 'boolean', 'true', 'The label list, the percentage after each label, and the dot before it — an item’s icon replaces its marker'],
      ['hoverable', 'boolean', 'false', 'Dims the other segments on hover, which reads more clearly than highlighting the one under the pointer'],
      ['animated', 'boolean', 'false', 'Grows the segments from zero on mount'],
      ['size / length', 'string', '9px / 100% (220px when vertical)', 'Track thickness and length — a vertical track needs a height of its own, since 100% of an auto-height parent is nothing'],
      ['radius / segmentRadius', 'string', 'pill / 0', 'The track’s corners, and each segment’s — a segment radius separates the meters visually'],
      ['gap / labelSize / labelColor / trackBackground', 'string', 'tokens', ''],
    ],
    events: [['item-click', '{ item, index } — a segment was clicked']],
    slots: [
      ['start / end', 'Content above and below the whole group; both receive { total }'],
      ['label', 'Replaces the label list; receives { items, total }. It fills the same region as the built-in list, so labelPosition still places it'],
      ['meter', 'Replaces one segment; receives { item, index, percent, color }'],
    ],
  },
  {
    id: 'inplace', name: 'ApexInplace', group: 'Utilities',
    blurb: 'Shows a value and swaps to its editor when clicked. The display half is a button rather than a clickable div, so the swap is reachable by keyboard and announced as an action. Content is only rendered once opened, which is what makes the open event a usable place to fetch — a lazy table inside a closed Inplace costs nothing until it is asked for.',
    noField: true, demo: 'inplace',
    lead: ['v-model:active="active"', 'display="John Doe"'],
    tail: '>\n  <template #content="{ close }">…</template>\n</ApexInplace>',
    base: { display: 'John Doe', displayIcon: 'edit', outlined: true, closable: true, hoverable: true },
    controls: [
      { key: 'display', type: 'text' }, { key: 'displayIcon', type: 'text' },
      { key: 'outlined', type: 'bool' }, { key: 'hoverable', type: 'bool' },
      { key: 'closable', type: 'bool' }, { key: 'autoFocus', type: 'bool' },
      { key: 'disabled', type: 'bool' }, { key: 'keepAlive', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'radius', type: 'text' }, { key: 'contentPadding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'color', type: 'color' },
      { key: 'borderColor', type: 'color' },
      { key: 'hoverBackground', type: 'color' }, { key: 'hoverColor', type: 'color' },
      { key: 'contentBackground', type: 'color' },
    ],
    props: [
      ['active', 'boolean', 'false', 'v-model:active — two-way, so a caller can open and close it too'],
      ['display / displayIcon', 'string', '—', 'The closed state when the display slot is not used'],
      ['closable / closeIcon', 'boolean / string', "false / 'close'", 'A close control at the content’s trailing edge, for content that has no buttons of its own'],
      ['autoFocus', 'boolean', 'true', 'Focus the first field in the content when it opens'],
      ['keepAlive', 'boolean', 'false', 'Keep the content mounted after the first open, so a fetched table is not re-created on every reopen'],
      ['disabled', 'boolean', 'false', 'The display stops responding'],
      ['hoverable / hoverBackground / hoverColor', 'boolean / string / string', 'true / tokens', 'Hover feedback on the closed state — off for a display that should look static'],
      ['outlined', 'boolean', 'false', 'A dashed outline hinting that the closed value is editable'],
      ['width / padding / radius', 'string', 'tokens', ''],
      ['background / color / borderColor', 'string', 'tokens', 'The closed state'],
      ['contentBackground / contentPadding', 'string', 'transparent / 0', 'The open state'],
    ],
    events: [
      ['update:active', 'boolean'],
      ['open', '— the display was activated; fetch here'],
      ['close', '—'],
    ],
    slots: [
      ['display', 'The closed state; receives { open }'],
      ['content', 'The open state; receives { close, active } — anything: a field, an image, a table'],
    ],
    serviceTitle: 'Methods',
    serviceRows: [['open() / close()', 'void', 'Drive it from outside without binding active']],
  },
  {
    id: 'blockui', name: 'ApexBlockUI', group: 'Utilities',
    blurb: 'Covers its content, or the whole document, while something is in flight. An overlay inside a positioned wrapper rather than pointer-events on the content: the cover intercepts clicks and keyboard focus, so a blocked panel cannot be tabbed into — which pointer-events alone would still allow.',
    noField: true, demo: 'block',
    lead: ['v-model:blocked="blocked"'],
    tail: '>\n  …\n</ApexBlockUI>',
    base: { spinner: true, message: 'Saving…', duration: 2500, showTimer: true, blur: true },
    controls: [
      { key: 'message', type: 'text' },
      { key: 'spinner', type: 'bool' }, { key: 'icon', type: 'text' },
      { key: 'duration', type: 'number' }, { key: 'showTimer', type: 'bool' },
      { key: 'fullScreen', type: 'bool' }, { key: 'dismissable', type: 'bool' },
      { key: 'passthrough', type: 'bool' },
      { key: 'blur', type: 'bool' }, { key: 'opacity', type: 'number' },
      { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'contentColor', type: 'color' },
    ],
    props: [
      ['blocked', 'boolean', 'false', 'v-model:blocked — bindable, so the auto-release reports back'],
      ['duration', 'number', '—', 'Releases the block by itself after this many milliseconds. A block waiting on a request that may never answer otherwise leaves the user stuck with no way out, so the timeout belongs to the block rather than each caller’s own setTimeout'],
      ['showTimer', 'boolean', 'false', 'A countdown bar along the cover’s edge while a duration runs'],
      ['fullScreen', 'boolean', 'false', 'Blocks the whole document instead of the content'],
      ['lockScroll', 'boolean', 'true', 'Stops the page scrolling while the document is blocked'],
      ['dismissable', 'boolean', 'false', 'Releases when the cover is clicked'],
      ['passthrough', 'boolean', 'false', 'Dims without intercepting — a purely visual block'],
      ['background / opacity / blur / radius', 'string / number / boolean | number | string / string', 'near-black / 0.42 / false', 'The cover. blur takes true for 3px, or a radius'],
      ['spinner / icon / message / contentColor', 'boolean / string / string / string', 'true / — / — / white', 'What shows on the cover; an icon replaces the spinner'],
      ['zIndex', 'number', '1250', 'Full-screen stack order'],
    ],
    events: [
      ['update:blocked', 'boolean'],
      ['block / unblock', '—'],
      ['timeout', '— the duration ran out, rather than a caller releasing it'],
    ],
    slots: [
      ['default', 'The content being blocked — ignored in fullScreen, which covers the document'],
      ['content', 'Replaces the spinner and message on the cover'],
    ],
  },
  {
    id: 'scrolltop', name: 'ApexScrollTop', group: 'Utilities',
    blurb: 'A button that appears past a scroll threshold and returns to the top. Against the window it is fixed to a viewport corner; inside a scroller it is fixed to coordinates measured from that scroller’s frame, with a reserved strip at the scroller’s block end so the content ends above it. The scroll read is rAF-throttled, because scroll fires far more often than a threshold can be crossed.',
    noField: true, demo: 'scrolltop',
    tail: ' />',
    base: { threshold: 120, position: 'bottom-end', size: '42px', showProgress: true, hoverLift: true },
    controls: [
      { key: 'threshold', type: 'number' },
      { key: 'position', type: 'select', options: ['bottom-end', 'bottom-start', 'bottom-center'] },
      { key: 'icon', type: 'text' }, { key: 'label', type: 'text' },
      { key: 'behavior', type: 'select', options: ['smooth', 'auto'] },
      { key: 'showProgress', type: 'bool' }, { key: 'hoverLift', type: 'bool' },
      { key: 'size', type: 'text' }, { key: 'offset', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'color', type: 'color' },
      { key: 'borderColor', type: 'color' },
      { key: 'hoverBackground', type: 'color' }, { key: 'hoverColor', type: 'color' },
      { key: 'progressColor', type: 'color' },
    ],
    props: [
      ['target', "'window' | 'parent' | selector", "'window'", 'parent binds to the nearest scrolling ancestor; a selector binds to any scroller. Inside one, the button is placed from that scroller’s measured frame and sits just below it, with the space reserved outside the scroller — so the gap is under the text and no text can ever pass behind the button'],
      ['threshold', 'number', '200', 'Scroll distance before it appears'],
      ['icon / label', 'string', "'arrow_upward' / —", 'A label turns the circle into a pill'],
      ['behavior', "'smooth' | 'auto'", "'smooth'", ''],
      ['position / offset', "'bottom-end' | 'bottom-start' | 'bottom-center' / string", "'bottom-end' / '24px'", 'Corner and inset within the band — all three placements work inside a scroller as well as against the window'],
      ['showProgress / progressColor', 'boolean / string', 'false / currentColor', 'A ring showing how far down the scroller you are — a conic gradient tracking a custom property, so a scroll is one style write and no extra element'],
      ['hoverLift', 'boolean', 'true', 'Lifts on hover; off for a button that should sit still'],
      ['size / radius / background / color / borderColor / shadow', 'string', 'tokens', ''],
      ['hoverBackground / hoverColor', 'string', 'same as resting', ''],
      ['ariaLabel', 'string', "'Scroll to top'", ''],
      ['zIndex', 'number', '1150', ''],
    ],
    events: [['click', '— the button was pressed']],
    slots: [['default', 'Replaces the icon and label entirely']],
  },

  /* The four directives. They keep a props table and a playground — the
     bindings are props in every sense that matters — but each needs a host
     element to sit on, which is what directiveName and hostTag declare. */
  {
    id: 'styleclass', name: 'ApexStyleClass', group: 'Utilities', optionsType: 'StyleClassOptions',
    blurb: 'Toggles classes on another element declaratively — v-apex-style-class="{ selector: ’@next’, toggleClass: ’open’ }". Two modes over one directive: toggleClass adds and removes a class, while the enter/leave triple runs an animation and reads its real duration off the element, so a class whose animation length changes needs no matching timeout here — a hard-coded delay is the usual reason these sequences break.',
    noField: true, directiveName: 'apex-style-class',
    hostTag: 'button', hostLabel: 'Toggle panel',
    base: {
      selector: '@next', enterFromClass: 'apex-hidden', enterActiveClass: 'apex-scale-in',
      leaveActiveClass: 'apex-scale-out', leaveToClass: 'apex-hidden',
      hideOnOutsideClick: true, hideOnEscape: true,
    },
    controls: [
      { key: 'selector', type: 'select', options: ['@next', '@prev', '@parent', '@grandparent'] },
      { key: 'toggleClass', type: 'text' },
      { key: 'enterFromClass', type: 'text' }, { key: 'enterActiveClass', type: 'text' },
      { key: 'enterToClass', type: 'text' },
      { key: 'leaveFromClass', type: 'text' }, { key: 'leaveActiveClass', type: 'text' },
      { key: 'leaveToClass', type: 'text' },
      { key: 'hideOnOutsideClick', type: 'bool' }, { key: 'hideOnEscape', type: 'bool' },
      { key: 'hideOnResize', type: 'bool' }, { key: 'resizeSelector', type: 'text' },
    ],
    props: [
      ['selector', 'string', '—', "'@next', '@prev', '@parent', '@grandparent', or any CSS selector. Resolved at click time, not at mount, so a conditionally rendered sibling still binds"],
      ['toggleClass', 'string', '—', 'Add/remove mode — the simple case, and a bare string binding is the shorthand for it on @next'],
      ['enterFromClass / enterActiveClass / enterToClass', 'string', '—', 'The reveal sequence: from is removed, active runs, then to is applied when the animation ends'],
      ['leaveFromClass / leaveActiveClass / leaveToClass', 'string', '—', 'The same in reverse'],
      ['hideOnOutsideClick', 'boolean', 'false', 'Runs the leave sequence when a click lands outside the target — for a panel behaving as an overlay'],
      ['hideOnEscape', 'boolean', 'false', 'Runs the leave sequence on Escape'],
      ['hideOnResize / resizeSelector', 'boolean / string', "false / 'window'", "Leave on resize. 'window' or 'document' listens to the browser; a CSS selector observes that element's own size, skipping the observer's initial call so it does not close on arrival"],
    ],
    events: [],
    serviceTitle: 'Animation helpers',
    serviceRows: [
      ['apex-hidden', 'display:none', 'The usual from/to class'],
      ['apex-fade-in / apex-fade-out', 'opacity', ''],
      ['apex-scale-in / apex-scale-out', 'opacity + scale', ''],
      ['apex-slide-down / apex-slide-up', 'opacity + offset', ''],
      ['apex-dur-fast / apex-dur-slow', 'duration', 'Override the 220ms default on the target'],
      ['your own classes', 'supported', 'Any class works — the directive reads whatever duration the class declares'],
    ],
  },
  {
    id: 'ripple', name: 'ApexRipple', group: 'Utilities', optionsType: 'RippleOptions',
    blurb: 'A ripple spreading from the point of contact, applied as a directive — v-apex-ripple. The radius is computed from the press to the furthest corner, so the wave always reaches the whole element however off-centre the click was. Each press creates its own ink element and removes it when the animation ends: one reused node cannot show two overlapping presses, and restarting it mid-flight makes a rapid double click read as one interrupted ripple.',
    noField: true, directiveName: 'apex-ripple',
    hostTag: 'div', hostLabel: 'Press me',
    base: { color: '', opacity: 0.28, duration: '600ms', centered: false, keyboard: true },
    controls: [
      { key: 'color', type: 'color' }, { key: 'opacity', type: 'number' },
      { key: 'duration', type: 'text' },
      { key: 'centered', type: 'bool' }, { key: 'keyboard', type: 'bool' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['color', 'string', "the host's text colour", 'Any CSS colour. Without one the ink is a tint of currentColor, so it suits a dark and a light host without being set'],
      ['opacity', 'number', '0.28', 'The ink’s opacity at the start of the wave'],
      ['duration', 'string', "'600ms'", 'How long one ripple takes'],
      ['centered', 'boolean', 'false', 'Start from the element’s centre instead of the pointer'],
      ['keyboard', 'boolean', 'true', 'Also ripple on Enter or Space, from the centre — so a keyboard press gets the same feedback as a click'],
      ['disabled', 'boolean', 'false', 'v-apex-ripple="false" is the shorthand'],
    ],
    events: [],
    serviceTitle: 'Notes',
    serviceRows: [
      ['v-apex-ripple="’#fff’"', 'shorthand', 'A bare string is the colour'],
      ['host element', 'untouched', 'The wave is clipped by a layer the directive adds inside the host, so the host keeps overflow:visible — a button’s badge or an avatar’s status dot is not cut off by having a ripple'],
      ['rapid presses', 'stack', 'Each press has its own ink, so two overlapping ripples both play out'],
      ['prefers-reduced-motion', 'respected', 'The animation collapses to 1ms rather than being removed, so nothing is left painted'],
    ],
  },
  {
    id: 'focustrap', name: 'ApexFocusTrap', group: 'Utilities', optionsType: 'FocusTrapOptions',
    blurb: 'Keeps Tab inside a container, applied as a directive — v-apex-focus-trap. Implemented with a keydown handler on the container rather than sentinel elements at its edges, because the tabbable set is read at the moment Tab is pressed: a trap that captured its boundaries on mount would leak as soon as a field was disabled, revealed or added.',
    noField: true, directiveName: 'apex-focus-trap',
    hostTag: 'div', hostLabel: '… form fields …',
    base: { disabled: false, autoFocus: true, restoreFocus: true },
    controls: [
      { key: 'disabled', type: 'bool' }, { key: 'autoFocus', type: 'bool' },
      { key: 'restoreFocus', type: 'bool' }, { key: 'initialFocus', type: 'text' },
    ],
    props: [
      ['disabled', 'boolean', 'false', 'Turns the trap off without removing the directive — v-apex-focus-trap="false" is the shorthand'],
      ['autoFocus', 'boolean', 'true', 'Focus the first tabbable element on mount; an [autofocus] element wins'],
      ['initialFocus', 'string', '—', 'A selector inside the container to focus instead of the first tabbable. A selector that matches nothing falls back to the autoFocus path rather than leaving the panel unfocused'],
      ['restoreFocus', 'boolean', 'true', 'Return focus to whatever was focused before, on unmount — so closing a trapped panel does not drop the caret at the top of the page'],
    ],
    events: [],
    serviceTitle: 'Behaviour',
    serviceRows: [
      ['Tab at the last element', 'wraps', 'To the first, and Shift+Tab from the first wraps to the last'],
      ['focus outside the container', 'returns', 'A programmatic move out is pulled back to the nearest edge rather than continuing out of the trap'],
      ['no tabbable children', 'holds', 'Tab is swallowed rather than escaping to the page'],
      ['ApexDialog / ApexDrawer', 'built in', 'Both trap focus already — this directive is for your own panels'],
    ],
  },
  {
    id: 'animateonscroll', name: 'ApexAnimateOnScroll', group: 'Utilities', optionsType: 'AnimateOnScrollOptions',
    blurb: 'Plays an animation as an element enters or leaves the viewport, applied as a directive — v-apex-animate-on-scroll="{ enterClass, leaveClass }". Built on IntersectionObserver rather than scroll maths: it fires off the main thread and costs nothing while the element is far away, so a page can carry a hundred of these without a scroll handler each.',
    noField: true, directiveName: 'apex-animate-on-scroll',
    hostTag: 'div', hostLabel: 'Card',
    base: {
      enterClass: 'apex-anim-enter apex-fade apex-from-b apex-dur-700',
      leaveClass: 'apex-anim-leave apex-fade apex-dur-200',
      threshold: 0.15, once: false,
    },
    controls: [
      { key: 'enterClass', type: 'text' }, { key: 'leaveClass', type: 'text' },
      { key: 'threshold', type: 'number' }, { key: 'rootMargin', type: 'text' },
      { key: 'once', type: 'bool' },
    ],
    props: [
      ['enterClass', 'string', '—', 'Classes applied when the element enters, e.g. "apex-anim-enter apex-fade apex-from-b"'],
      ['leaveClass', 'string', '—', 'Classes applied when it leaves; omit and the element stays as it is once shown'],
      ['root', 'Element | string', 'viewport', 'A scroll container, as an element or a selector'],
      ['threshold', 'number', '0.15', 'How much must be visible to count as entered'],
      ['rootMargin', 'string', "'0px'", 'Grows or shrinks the trigger area — "-80px 0px" fires later'],
      ['once', 'boolean', 'false', 'Animate the entrance once, then stop observing'],
    ],
    events: [],
    serviceTitle: 'Animation classes',
    serviceRows: [
      ['apex-anim-enter / apex-anim-leave', 'required', 'The animation itself — everything below only sets where it starts from'],
      ['apex-fade / apex-fade-10 / apex-fade-25', 'opacity', 'The opacity it starts from'],
      ['apex-from-t / -b / -l / -r', 'offset', 'Slides in from that side'],
      ['apex-dist-sm / apex-dist-lg', 'distance', 'How far it slides — 0.75rem or 4rem instead of the default 2rem'],
      ['apex-zoom-50 / -75 / -90 / -110', 'scale', 'The scale it starts from'],
      ['apex-spin-45 / apex-spin-n45 / apex-spin-90', 'rotation', 'The rotation it starts from'],
      ['apex-dur-200 … apex-dur-1000', 'duration', ''],
      ['apex-delay-100 / -200 / -300', 'delay', 'Stagger a row of cards'],
    ],
  },

  {
    id: 'toast', name: 'ApexToast', group: 'Messages',
    blurb: 'Service-driven messages in a fixed overlay stack. Built on ApexMessage — severity tints, variants, the blur, the close button all inherited — so a toast is that component in a positioned stack with a life timer around it. Mount one in the app shell and every add() call in the app lands in it.',
    noField: true, demo: 'overlay',
    lead: [],
    tail: '\n/>',
    base: { position: 'top-right', mode: 'expanded', variant: 'filled', size: 'md' },
    controls: [
      { key: 'position', type: 'select', options: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'center'] },
      { key: 'mode', type: 'select', options: ['expanded', 'stacked'] },
      { key: 'variant', type: 'select', options: ['filled', 'outlined', 'simple'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'max', type: 'number' }, { key: 'life', type: 'number' },
      { key: 'blur', type: 'bool' }, { key: 'newestOnTop', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'offset', type: 'text' },
    ],
    props: [
      ['position', "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center'", "'top-right'", 'Bottom stacks grow upward, so the newest is always nearest the edge'],
      ['mode', "'stacked' | 'expanded'", "'expanded'", 'stacked keeps the newest on top with the rest peeking behind, and fans them out on hover'],
      ['group', 'string', '—', 'Only renders messages carrying this group, so one app can have several containers'],
      ['max', 'number', '5', 'Caps the visible column'],
      ['life', 'number', '3000', 'Fallback for messages that set none — a message’s own life wins'],
      ['variant / size / blur', 'string / string / boolean | number | string', "'filled' / 'md' / false", 'Passed through to ApexMessage'],
      ['width / offset', 'string', "'360px' / '20px'", 'Stack width, and its distance from the viewport edge'],
      ['newestOnTop', 'boolean', 'true', 'false appends below instead'],
      ['zIndex', 'number', '1200', ''],
    ],
    events: [['close', 'ToastMessage — the dismiss button'], ['life-end', 'ToastMessage — the timer ran out']],
    slots: [
      ['message', 'Replaces a toast outright; receives { message, close, index } — for links, buttons, or any markup'],
      ['actions', 'Keeps the default toast and adds to it; receives { message, close }'],
    ],
    serviceTitle: 'Service options',
    serviceRows: [
      ['add(message)', 'number | string', 'Queues a toast and returns its id'],
      ['update(id, patch)', 'void', 'Replaces a queued toast in place — a loading toast becoming a result'],
      ['remove(id)', 'void', ''],
      ['removeAll(group?)', 'void', 'Clears everything, or one group'],
      ['message.severity', "'info' | 'success' | 'warn' | 'error' | 'secondary' | 'contrast'", 'Tint and default icon'],
      ['message.summary / detail', 'string', 'Bold first line, and the body under it'],
      ['message.life / sticky', 'number / boolean', 'Auto-dismiss delay; sticky stays until removed'],
      ['message.icon / closable', 'string / boolean', 'Overrides the severity icon; closable defaults to true'],
      ['message.group', 'string', 'Routes it to a named container'],
      ['message.data', 'unknown', 'Anything your own template needs'],
      /* Two fields on ToastMessage the gallery's table omits. The Timed close
         section below uses showTimer, so leaving it out would demonstrate an
         option the reader cannot look up. */
      ['message.id', 'number | string', 'Assigned by add(); pass your own to update or remove a specific toast'],
      ['message.showTimer', 'boolean', 'Draws a bar counting the life down'],
    ],
  },

  {
    id: 'alert', name: 'ApexAlert', group: 'Overlays', optionsType: 'AlertOptions',
    blurb: 'One centred alert that says something and waits. confirm() asks a yes/no question, notify() reports an outcome, and run() carries a single alert through confirm → progress → result without closing in between — so a delete reads as one continuous act rather than a dialog, a pause, and then an unrelated message in the corner. The figure is drawn from the tone rather than being an icon with an effect applied.',
    noField: true,
    service: {
      composable: 'useApexAlert', handle: 'alert', method: 'confirm',
      host: 'ApexAlert', trigger: 'Ask',
      extras: [['Report', 'notify'], ['Close', 'close']],
    },
    hostLabel: 'The alert opens centred over the page, not inside this box — its host is mounted once at the app root.',
    base: {
      tone: 'warn',
      title: 'Delete area?',
      message: '“Main Hall” will be deleted. This cannot be undone.',
      cancelText: 'Cancel',
      acceptLabel: 'Delete',
    },
    controls: [
      { key: 'tone', type: 'select', options: ['success', 'danger', 'warn', 'info'] },
      { key: 'title', type: 'text' }, { key: 'message', type: 'text' },
      { key: 'cancelText', type: 'text' }, { key: 'acceptLabel', type: 'text' },
      { key: 'icon', type: 'text' },
      { key: 'iconPosition', type: 'select', options: ['top', 'left', 'right', 'bottom'] },
      { key: 'iconAnimation', type: 'select', options: ['none', 'pulse', 'shake', 'bounce'] },
      { key: 'footnote', type: 'text' },
      { key: 'closable', type: 'bool' }, { key: 'dismissableMask', type: 'bool' },
      { key: 'width', type: 'text' },
    ],
    props: [
      ['tone', "'success' | 'danger' | 'warn' | 'info'", 'warn asking, success reporting', 'Chooses the drawn figure and the ring colour'],
      ['title / header', 'string', '—', 'header is the name ApexConfirmDialog used, kept for its callers'],
      ['message', 'string', '—', ''],
      ['changes', 'AlertChange[]', '—', 'A from→to list, so an edit-confirm can be read rather than trusted'],
      ['confirmText / cancelText', 'string', 'translated', 'Omit cancelText for a one-button alert; notify() never shows one'],
      ['copyText', 'string', '—', 'Adds a Copy button, and leaves the alert open — the value is usually being read as well as copied'],
      ['icon', 'string', '—', 'Replaces the tone figure. Without it you get the drawn one'],
      ['iconPosition', "'top' | 'left' | 'right' | 'bottom'", 'top', ''],
      ['iconAnimation', "'none' | 'pulse' | 'shake' | 'bounce'", 'none', 'No spin: a confirmation is not loading, and spinning its icon says otherwise'],
      ['iconColor', 'string', 'the tone ring', ''],
      ['image / imageAlt', 'string', '—', 'An image instead of a figure or an icon'],
      ['buttons', 'AlertButton[]', '—', 'Replaces the default pair entirely'],
      ['acceptLabel / rejectLabel', 'string', 'translated', ''],
      ['acceptIcon / rejectIcon', 'string', '—', ''],
      ['acceptSeverity / rejectSeverity', 'AlertSeverity', 'primary / secondary', 'A danger tone makes the accepting button danger unless you say otherwise'],
      ['footnote', 'string', '—', 'A note or link under the buttons'],
      ['width / padding / background / radius', 'string', 'tokens', 'The panel'],
      ['maskColor / maskBlur', 'string / boolean', 'tokens', 'The backdrop'],
      ['closable', 'boolean', 'false', 'Adds a close control in the corner'],
      ['dismissableMask', 'boolean', 'true', 'Whether clicking the backdrop dismisses'],
      ['autoClose', 'number', '—', 'Milliseconds. Never counts down over the work — dismissing a progress stage on a timer would abandon an action in flight'],
      ['showTimer', 'boolean', 'false', 'Draws the countdown as a bar'],
      ['transition', "'scale' | 'slide' | 'fade' | 'none'", 'scale', ''],
      ['enterClass / leaveClass', 'string', '—', 'Your own animation classes'],
      ['target / side / align', 'unknown / string', '—', 'Anchors a confirm() to an element, which routes it to ApexConfirmPopup instead. run() ignores it: a staged flow cannot follow a popup anchored to the button just pressed'],
      ['group', 'string', '—', 'Only a host carrying the same group answers, for a per-kind alert'],
      ['accept / reject', '() => void', '—', 'Fired alongside the promise resolving'],
      ['onCustom', '(button, index) => void', '—', 'Fired for a button that is neither accept nor reject'],
    ],
    events: [],
    slots: [
      ['container', 'The whole panel. Handed state, buttons and press — the real press, so a replacement can still settle the caller’s promise'],
      ['icon', 'The figure well'],
      ['message', 'The body, for markup a string cannot carry'],
      ['footer', 'The button row'],
    ],
    serviceTitle: 'Service',
    serviceRows: [
      ['confirm(options)', 'Promise<boolean>', 'Asks. Resolves true only if the accepting button was pressed'],
      ['notify(options)', 'Promise<void>', 'Reports an outcome with a single button, and waits for acknowledgement'],
      ['run({ confirm, progressTitle, action, interpret })', 'Promise<boolean>', 'Confirms, runs and reports — in one alert that never closes in between'],
      ['press(button, index)', 'Promise<void>', 'Runs a button’s action and honours its role. What both hosts call'],
      ['close()', 'void', 'Closes, settling anyone still waiting as cancel'],
      ['state', 'readonly', 'The live request, if you want to render your own'],
      ['setAlertInterpreter(fn)', 'void', 'Registers how to read an action’s outcome — an Inertia app reads its flash bag here, and no call site changes'],
    ],
  },
  {
    id: 'tooltip', name: 'ApexTooltip', group: 'Overlays',
    optionsType: 'TooltipOptions',
    blurb: 'Advisory text on hover or focus, applied as a directive — v-apex-tooltip="’Save changes’". Written against the DOM rather than as a component, so it attaches to anything, including elements the kit does not own.',
    noField: true, directiveName: 'apex-tooltip',
    hostTag: 'button', hostLabel: 'Hover me',
    base: {
      value: 'Saved to your library', position: 'right', showDelay: 0, hideDelay: 0,
      event: 'hover', autoHide: true, escape: true, showArrow: true,
    },
    controls: [
      { key: 'value', type: 'text' },
      { key: 'position', type: 'select', options: ['right', 'top', 'bottom', 'left'] },
      { key: 'showDelay', type: 'number' }, { key: 'hideDelay', type: 'number' },
      { key: 'event', type: 'select', options: ['hover', 'focus', 'both'] },
      { key: 'autoHide', type: 'bool' }, { key: 'escape', type: 'bool' },
      { key: 'showArrow', type: 'bool' }, { key: 'gap', type: 'number' },
      { key: 'maxWidth', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'color', type: 'color' },
    ],
    props: [
      ['value', 'string', '—', 'The text, or HTML when escape is false — a bare string binding is shorthand for this'],
      ['position', "'top' | 'bottom' | 'left' | 'right'", "'right'", 'Also settable as a modifier: v-apex-tooltip.top'],
      ['showDelay / hideDelay', 'number', '0 / 0', 'Milliseconds before it appears and before it goes'],
      ['event', "'hover' | 'focus' | 'both'", "'hover'", 'Pointer enter, focus, or both'],
      ['autoHide', 'boolean', 'true', 'false keeps it while the pointer is over it, so links inside are reachable'],
      ['escape', 'boolean', 'true', 'false renders value as HTML'],
      ['disabled', 'boolean', 'false', 'Suppresses it, and closes it if open — bind a condition here'],
      ['gap / showArrow', 'number / boolean', '8 / true', 'Distance from the target, and the arrow'],
      ['maxWidth / background / color', 'string', 'tokens', 'Chrome'],
      ['class', 'string', '—', 'Your own class on the tooltip node'],
      ['zIndex', 'number', '1200', 'Above dialogs and popovers'],
    ],
    events: [],
    /* The gallery heads this table "Forms", which is a copy-paste slip from a
       neighbouring entry — the rows below are the four ways to apply the
       directive, so the heading says that instead. Rows are verbatim. */
    serviceTitle: 'Usage',
    serviceRows: [
      ['v-apex-tooltip="’Text’"', 'string', 'The short form — default position, no delay'],
      ['v-apex-tooltip.top="’Text’"', 'modifier', 'top, bottom, left or right'],
      ['v-apex-tooltip="{ value, … }"', 'object', 'Every option above, and reactive — a live tooltip picks up new text without a re-hover'],
      ['app.use(ApexUI)', 'plugin', 'Registers the directive; import { apexTooltip } to register it yourself'],
    ],
  },
  {
    id: 'megamenu', name: 'ApexMegaMenu', group: 'Menu',
    blurb: 'A nav bar whose submenus open as full panels. The model carries the panel — a root item holds columns, and a column holds links, an optional heading, a heading image, or a grid of image cards — so a link grid, category thumbnails, a card row and a featured promo are all data rather than rebuilt markup.',
    noField: true, demo: 'menu',
    lead: [':items="items"'],
    tail: '\n/>',
    base: { orientation: 'horizontal', trigger: 'hover', columnMinWidth: '190px', cardMinWidth: '150px', panelImagePosition: 'end' },
    controls: [
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'trigger', type: 'select', options: ['hover', 'click'] },
      { key: 'columnMinWidth', type: 'text' }, { key: 'cardMinWidth', type: 'text' },
      { key: 'panelImagePosition', type: 'select', options: ['end', 'start'] },
      { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'panelBackground', type: 'color' },
      { key: 'borderColor', type: 'color' }, { key: 'activeColor', type: 'color' },
    ],
    props: [
      ['items', 'MegaItem[]', '[]', 'Root items: { label, icon, href, command, disabled, columns, panel }'],
      [' columns', 'MegaColumn[]', '—', '{ header, headerIcon, image, imageAlt, layout, span, items, footer } — image puts a thumbnail above the column, layout: "cards" turns its items into image tiles, span widens it'],
      [' columns[].items', 'MegaLink[]', '—', '{ label, help, icon, image, badge, href, target, command, disabled } — image replaces the icon with a thumbnail'],
      [' panel', 'MegaPanel', '—', '{ image, imageAlt, title, text, href, linkLabel, cards } — a featured image and copy beside the columns, plus an image-card row beneath them'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Vertical opens each panel to the side'],
      ['trigger', "'hover' | 'click'", "'hover'", 'What opens the FIRST panel. Either way, once a panel is open, hovering another root item switches to it — and hovering a plain link closes it. Hover keeps a grace period so the pointer can reach the panel'],
      ['columnMinWidth / cardMinWidth', 'string', "'190px' / '150px'", 'The panel grid and the card grid are auto-fit, so column count follows the width'],
      ['panelImagePosition', "'end' | 'start'", "'end'", 'Which side the featured image sits on'],
      ['background / panelBackground / borderColor / radius / padding / activeColor', 'string', 'tokens', 'Chrome'],
      ['zIndex', 'number', '900', 'Panels sit above page content, below dialogs'],
    ],
    events: [['item-click', '{ item, originalEvent } — fired for a root item, a link or a card; its own command runs first']],
    slots: [
      ['start / end', 'Bar edges — a logo, a search box, an avatar'],
      ['item', 'Replaces a link; receives { item, layout }'],
      ['panel', 'Replaces a whole panel; receives { item, close }'],
    ],
  },
  {
    id: 'menu', name: 'ApexMenu', group: 'Menu',
    blurb: 'A vertical command menu, inline or as a popup. Groups are items with their own items: a top-level group is a section label with its children shown, a nested one collapses. Open state is an expandedKeys map with two-way binding, so the menu can be driven from outside — expand all, collapse all, restore a saved state.',
    noField: true, demo: 'menu',
    lead: [':items="items"'],
    tail: '\n/>',
    base: { width: '260px', labelCaps: true },
    controls: [
      { key: 'labelCaps', type: 'bool' }, { key: 'popup', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'maxHeight', type: 'text' },
      { key: 'padding', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'textColor', type: 'color' }, { key: 'iconColor', type: 'color' },
      { key: 'labelColor', type: 'color' },
      { key: 'hoverBackground', type: 'color' }, { key: 'hoverTextColor', type: 'color' },
      { key: 'activeColor', type: 'color' }, { key: 'activeBackground', type: 'color' },
      { key: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'] },
      { key: 'align', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'gap', type: 'number' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
    ],
    props: [
      ['items', 'MenuItem[]', '[]', 'Each takes { key, label, icon, help, hint, badge, href, target, command, disabled, active, separator, items, toggleable }'],
      ['expandedKeys', 'Record<string, boolean>', '{}', 'v-model:expandedKeys — which toggleable groups are open, keyed by the item’s key (or its label)'],
      [' item.toggleable', 'boolean', 'depth > 0', 'Overrides the default: a nested group collapses, a top-level one is a static label'],
      [' item.active', 'boolean', 'false', 'Marks the current page — tinted row'],
      ['popup', 'boolean', 'false', 'Overlay anchored to whatever called toggle(event)'],
      ['side / align / gap', 'string / string / number', "'bottom' / 'start' / 6", 'Popup placement, flipping and shifting like the popover'],
      ['labelCaps', 'boolean', 'true', 'Section labels in small caps; off for sentence case'],
      ['width / maxHeight / padding / background / borderColor / radius', 'string', 'tokens', 'Chrome — maxHeight makes a long menu scroll'],
      ['textColor / iconColor / labelColor', 'string', 'tokens', 'Row text, row icons, section labels'],
      ['hoverBackground / hoverTextColor', 'string', 'tokens', 'A row on hover — the icon follows the text colour'],
      ['activeColor / activeBackground', 'string', 'tokens', 'The row marked active'],
      ['zIndex', 'number', '1100', 'Popup stack order'],
    ],
    events: [
      ['update:expandedKeys', 'Record<string, boolean>'],
      ['item-click', '{ item, originalEvent } — the item’s own command runs first'],
      ['show / hide', '— popup only'],
    ],
    slots: [
      ['start / end', 'Above and below the list — a profile block, a footer action'],
      ['item', 'Replaces a row; receives { item, depth }'],
      ['submenulabel', 'Replaces a group’s label; receives { item, depth }'],
    ],
    serviceTitle: 'Methods',
    serviceRows: [
      ['toggle(event) / show(event) / hide()', 'void', 'Popup mode — anchored to the event’s element'],
      ['expandAll() / collapseAll()', 'void', 'Every toggleable group at once'],
      ['visible', 'boolean', 'Popup open state'],
    ],
  },
  {
    id: 'menubar', name: 'ApexMenubar', group: 'Menu',
    blurb: 'A horizontal menu whose root items drop cascading submenus. The dropdowns are the shared overlay renderer, so nesting, separators, hints and the off-screen flip behave as they do in the context menu — and once one menu is open, moving along the bar switches menus without another click.',
    noField: true, demo: 'menu',
    lead: [':items="items"'],
    tail: '\n/>',
    base: { trigger: 'hover', size: 'md' },
    controls: [
      { key: 'trigger', type: 'select', options: ['hover', 'click'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
      { key: 'textColor', type: 'color' },
      { key: 'hoverBackground', type: 'color' }, { key: 'hoverTextColor', type: 'color' },
      { key: 'openBackground', type: 'color' }, { key: 'openTextColor', type: 'color' },
      { key: 'iconColor', type: 'color' },
    ],
    props: [
      ['items', 'MenuItem[]', '[]', 'Root items; an item with its own items drops a menu. Children take { label, icon, hint, href, target, command, disabled, separator, header, items }'],
      ['trigger', "'hover' | 'click'", "'hover'", 'What opens the FIRST menu; hover always switches once one is open'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['textColor', 'string', 'tokens', 'Root item text'],
      ['hoverBackground / hoverTextColor', 'string', 'tokens', 'Root item on hover'],
      ['openBackground / openTextColor', 'string', 'tokens', 'Root item while its menu is open'],
      ['iconColor', 'string', 'tokens', 'Root item icons'],
      ['background / borderColor / radius / padding', 'string', 'tokens', 'Bar chrome'],
      ['zIndex', 'number', '60', 'Dropdown stack order'],
    ],
    events: [['item-click', '{ item, originalEvent } — fired for a root item or a child; its own command runs first']],
    slots: [
      ['start / end', 'Bar edges — a logo, a search box, an avatar'],
      ['item', 'Replaces a dropdown row’s contents; receives { item, depth, branch }'],
    ],
  },
  {
    id: 'tieredmenu', name: 'ApexTieredMenu', group: 'Menu',
    blurb: 'A vertical menu whose submenus open as nested overlays to the side. Rows come from the shared overlay renderer, so nesting, hover-open, separators, hints and the off-screen flip are already handled — this component owns the outer panel and, in popup mode, its placement.',
    noField: true, demo: 'menu',
    lead: [':items="items"'],
    tail: '\n/>',
    base: { width: '220px' },
    controls: [
      { key: 'popup', type: 'bool' },
      { key: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'] },
      { key: 'align', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'gap', type: 'number' }, { key: 'width', type: 'text' },
      { key: 'radius', type: 'text' }, { key: 'rowRadius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
      { key: 'textColor', type: 'color' }, { key: 'iconColor', type: 'color' },
      { key: 'hoverBackground', type: 'color' }, { key: 'hoverTextColor', type: 'color' },
      { key: 'headerColor', type: 'color' }, { key: 'hintColor', type: 'color' },
      { key: 'separatorColor', type: 'color' },
    ],
    props: [
      ['items', 'MenuItem[]', '[]', 'Nest an items array on a row and it opens a submenu overlay to the side; also takes { icon, hint, href, target, command, disabled, separator, header }'],
      ['popup', 'boolean', 'false', 'Overlay anchored to whatever called toggle(event)'],
      ['side / align / gap', 'string / string / number', "'bottom' / 'start' / 6", 'Popup placement, flipping and shifting like the popover'],
      ['width', 'string', "'220px'", 'Minimum panel width'],
      ['background / borderColor / radius', 'string', 'tokens', 'Panel chrome'],
      ['textColor / iconColor', 'string', 'tokens', 'Row text, and row icons'],
      ['hoverBackground / hoverTextColor', 'string', 'tokens', 'A row on hover'],
      ['headerColor / hintColor', 'string', 'tokens', 'Section headers, and the shortcut column'],
      ['separatorColor', 'string', 'borderColor', 'Divider rows — follows borderColor unless set'],
      ['padding / rowRadius', 'string', 'tokens', 'Panel inner padding, and a row’s corner radius'],
      ['zIndex', 'number', '1100', 'Popup stack order'],
    ],
    events: [['item-click', '{ item, originalEvent } — the item’s own command runs first'], ['show / hide', '— popup only']],
    slots: [['item', 'Replaces a row’s contents; receives { item, depth, branch } — the row keeps its click, hover and submenu behaviour']],
    /* The gallery writes `serviceFn: 'ref'` here, which is its way of saying
       the table below lists ref methods rather than a service. Ours carries
       that in the title, and has no such field — copying it verbatim was a
       typecheck error, not parity. */
    serviceTitle: 'Methods',
    serviceRows: [
      ['toggle(event) / show(event) / hide()', 'void', 'Popup mode — anchored to the event’s element'],
      ['visible', 'boolean', 'Popup open state'],
    ],
  },
  {
    id: 'popover', name: 'ApexPopover', group: 'Overlays',
    blurb: 'A panel anchored to whatever opened it. Driven through its ref — toggle(event), show(event) and hide() — so one popover can serve several triggers, with v-model:visible available when the state must live outside.',
    noField: true, demo: 'overlay',
    lead: ['ref="pov"'],
    tail: '\n>\n  <p>Popover content.</p>\n</ApexPopover>',
    base: { side: 'bottom', align: 'center', gap: 10, showArrow: true, width: '260px' },
    controls: [
      { key: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'] },
      { key: 'align', type: 'select', options: ['center', 'start', 'end'] },
      { key: 'gap', type: 'number' }, { key: 'showArrow', type: 'bool' },
      { key: 'dismissable', type: 'bool' }, { key: 'closeOnEscape', type: 'bool' },
      { key: 'autoFocus', type: 'bool' }, { key: 'trapFocus', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'maxHeight', type: 'text' },
      { key: 'padding', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
    ],
    props: [
      ['visible', 'boolean', 'false', 'v-model:visible — optional; the ref methods are the usual route'],
      ['target', 'Element | string | ref', '—', 'A default anchor, when no event is passed to show()'],
      ['side', "'top' | 'bottom' | 'left' | 'right'", "'bottom'", 'Preferred side; flips when it will not fit'],
      ['align', "'start' | 'center' | 'end'", "'center'", 'Along the target’s cross axis'],
      ['gap', 'number', '10', 'Distance from the target, in pixels'],
      ['showArrow', 'boolean', 'true', 'The arrow tracks the target’s centre even after a shift'],
      ['dismissable / closeOnEscape', 'boolean', 'true / true', 'Outside click and Escape'],
      ['autoFocus / trapFocus', 'boolean', 'true / false', 'Focus [data-autofocus] or the first control on open; keep Tab inside'],
      ['width / maxHeight / padding / radius / background / borderColor', 'string', 'tokens', 'Sizing and chrome'],
      ['zIndex', 'number', '1100', 'Above a dialog, so a popover can open over one'],
      /* Declared on the component but absent from the gallery's table, which
         left it undocumented; the coverage checker is right to want it. */
      ['contentClass', 'string', '—', 'Your own class on the panel'],
    ],
    events: [['update:visible', 'boolean'], ['show / hide', '—']],
    slots: [['default', 'Popover content; receives { hide } so your own controls can close it']],
    serviceTitle: 'Methods',
    serviceRows: [
      ['show(event, target?)', 'void', 'Opens, anchored to the event’s element — or to `target` when given'],
      ['hide()', 'void', 'Closes'],
      ['toggle(event, target?)', 'void', 'The usual trigger handler'],
      ['reposition()', 'void', 'Re-measures against the current anchor, e.g. after the content changed'],
      ['visible', 'boolean', 'Read the open state off the ref'],
    ],
  },
  {
    id: 'drawer', name: 'ApexDrawer', group: 'Overlays',
    blurb: 'A panel that slides in from an edge of the screen. Shares the dialog’s overlay mechanics — mask, focus trap, Escape and mask dismissal, scroll lock — but moves along an axis, so `size` is the panel’s thickness on that axis.',
    noField: true, demo: 'overlay',
    lead: ['v-model:visible="open"'],
    tail: '\n>\n  <p>Drawer content.</p>\n</ApexDrawer>',
    base: { header: 'Drawer Title', position: 'left', size: '320px', modal: true, dismissableMask: true },
    controls: [
      { key: 'header', type: 'text' }, { key: 'subtitle', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'position', type: 'select', options: ['left', 'right', 'top', 'bottom', 'full'] },
      { key: 'size', type: 'text' }, { key: 'responsiveSize', type: 'text' }, { key: 'breakpoint', type: 'text' },
      { key: 'modal', type: 'bool' }, { key: 'closable', type: 'bool' },
      { key: 'dismissableMask', type: 'bool' }, { key: 'maskBlur', type: 'bool' },
      { key: 'showHeader', type: 'bool' },
      { key: 'inset', type: 'text' }, { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'maskColor', type: 'color' },
    ],
    props: [
      ['visible', 'boolean', 'false', 'v-model:visible'],
      ['header / subtitle / icon', 'string', '—', 'Header content; the header slot replaces all three'],
      ['position', "'left' | 'right' | 'top' | 'bottom' | 'full'", "'left'", 'Which edge it slides from; full covers the viewport'],
      ['size', 'string', "'320px'", 'Thickness on its own axis — width for left and right, height for top and bottom'],
      ['responsiveSize / breakpoint', 'string', "— / '640px'", 'Thickness below the breakpoint, for narrow screens'],
      ['modal', 'boolean', 'true', 'Blocks the page behind, traps focus, and locks page scroll'],
      ['closable / closeOnEscape / dismissableMask', 'boolean', 'true / true / false', 'Dismissal routes'],
      ['showHeader', 'boolean', 'true', 'Set false to drop the header row entirely'],
      ['inset', 'string', '0', 'Gap between the panel and the viewport edges — pair with radius for a floating drawer'],
      ['padding / radius / background / borderColor', 'string', 'tokens', 'Chrome'],
      ['maskColor / maskBlur', 'string / boolean', 'tokens / false', 'The overlay behind'],
      ['zIndex', 'number', '1000', 'Stack order for a drawer opened over a dialog'],
      ['contentClass', 'string', '—', 'Your own class on the panel'],
    ],
    events: [['update:visible', 'boolean'], ['show / hide', '—'], ['after-hide', 'once the leave transition ends']],
    slots: [
      ['default', 'Body'],
      ['header', 'Replaces the header content'],
      ['footer', 'Footer, usually actions'],
      ['container', 'Headless — replaces header, body and footer; receives { close }'],
    ],
  },
  {
    id: 'dialog', name: 'ApexDialog', group: 'Overlays',
    blurb: 'A modal window, teleported to the body. Owns the overlay mechanics every dialog needs — nine positions, focus trap and restore, Escape and mask dismissal, dragging, and the enter and leave animation.',
    noField: true, demo: 'overlay',
    lead: ['v-model:visible="open"'],
    tail: '\n>\n  <p>Dialog content.</p>\n</ApexDialog>',
    base: { header: 'Confirm', subtitle: 'This cannot be undone', position: 'center', modal: true },
    controls: [
      { key: 'header', type: 'text' }, { key: 'subtitle', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'position', type: 'select', options: ['center', 'top', 'bottom', 'left', 'right', 'topleft', 'topright', 'bottomleft', 'bottomright'] },
      { key: 'transition', type: 'select', options: ['scale', 'slide', 'fade', 'none'] },
      { key: 'modal', type: 'bool' }, { key: 'draggable', type: 'bool' },
      { key: 'closable', type: 'bool' }, { key: 'dismissableMask', type: 'bool' },
      { key: 'maskBlur', type: 'bool' },
      { key: 'autoClose', type: 'number' }, { key: 'showTimer', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'padding', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'maskColor', type: 'color' },
    ],
    props: [
      ['visible', 'boolean', 'false', 'v-model:visible'],
      ['header / subtitle / icon', 'string', '—', 'Header content; the header slot replaces all three'],
      ['position', '9 values', "'center'", 'center, top, bottom, left, right and the four corners'],
      ['modal', 'boolean', 'true', 'Blocks the page behind, traps focus, and locks page scroll'],
      ['draggable', 'boolean', 'false', 'Drag by the header'],
      ['closable / closeOnEscape / dismissableMask', 'boolean', 'true / true / false', 'Dismissal routes'],
      ['autoClose / showTimer', 'number / boolean', '—', 'Close after n ms, with an optional countdown bar'],
      ['transition', "'scale' | 'slide' | 'fade' | 'none'", "'scale'", ''],
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes'],
      ['width / maxWidth / padding / radius / background / borderColor', 'string', 'tokens', 'Sizing and chrome'],
      ['maskColor / maskBlur', 'string / boolean', 'tokens / false', 'The overlay behind'],
      ['zIndex', 'number', '1000', 'Stack order for a dialog opened over another'],
      ['contentClass', 'string', '—', 'Your own class on the panel'],
    ],
    events: [['update:visible', 'boolean'], ['show / hide', '—'], ['after-hide', 'once the leave transition ends']],
    slots: [['default', 'Body'], ['header', 'Replaces the header'], ['footer', 'Footer, usually actions']],
  },
  {
    id: 'message', name: 'ApexMessage', group: 'Messages',
    blurb: 'An inline message for feedback next to the thing it concerns. Three variants over one box — filled tints the surface, outlined keeps the page background with a coloured edge, simple drops the frame for a line of coloured text under a field — plus an optional blur that frosts whatever sits behind it, the same idea as the dialog’s mask blur.',
    noField: true, demo: 'plain', slotText: 'Your account is now ready.',
    lead: [], tail: '>Your account is now ready.</ApexMessage>',
    base: { severity: 'success', variant: 'filled', size: 'md', closable: true },
    controls: [
      { key: 'severity', type: 'select', options: ['info', 'success', 'warn', 'error', 'secondary', 'contrast'] },
      { key: 'variant', type: 'select', options: ['filled', 'outlined', 'simple'] },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'icon', type: 'text' },
      { key: 'closable', type: 'bool' }, { key: 'block', type: 'bool' },
      { key: 'life', type: 'number' }, { key: 'showTimer', type: 'bool' },
      { key: 'blur', type: 'bool' }, { key: 'translucent', type: 'bool' },
      { key: 'radius', type: 'text' }, { key: 'padding', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'textColor', type: 'color' },
      { key: 'borderColor', type: 'color' }, { key: 'iconColor', type: 'color' },
    ],
    props: [
      ['visible', 'boolean', 'true', 'v-model:visible — so a closed message can be brought back'],
      ['severity', "'info' | 'success' | 'warn' | 'error' | 'secondary' | 'contrast'", "'info'", 'Sets the tint and the default icon'],
      ['variant', "'filled' | 'outlined' | 'simple'", "'filled'", ''],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['icon', 'string', 'per severity', 'Overrides the icon; an empty string removes it, and the icon slot replaces it outright'],
      ['closable', 'boolean', 'false', 'Adds the dismiss button'],
      ['life / showTimer', 'number / boolean', '— / false', 'Dismiss after n milliseconds, with an optional countdown bar'],
      ['blur', 'boolean | number | string', 'false', 'Frosts what sits behind the message — true for 8px, or give a radius. Implies translucent, since a solid surface has nothing to show through'],
      ['translucent', 'boolean', 'false', 'Makes the surface see-through without blurring'],
      ['background / textColor / borderColor / iconColor', 'string', 'per severity', 'Chrome'],
      ['radius / padding', 'string', 'tokens', ''],
      ['block', 'boolean', 'true', 'false hugs the content instead of filling the container'],
    ],
    events: [['update:visible', 'boolean'], ['close', '— the dismiss button'], ['life-end', '— the timer ran out']],
    slots: [
      ['default', 'The message'],
      ['icon', 'Replaces the icon — an avatar, an image, a spinner'],
      ['actions', 'Between the text and the close button — a link or a small button'],
    ],
  },
  {
    id: 'dynamicdialog', name: 'ApexDynamicDialog', group: 'Messages',
    blurb: 'Opens any component in a dialog through a service, so a caller needs no visible state and no dialog markup. Mount one ApexDynamicDialog in the app shell and every open() call renders there — stacked, each with its own options.',
    noField: true, demo: 'overlay',
    lead: [], tail: ' />',
    base: {},
    controls: [],
    props: [
      ['—', '—', '—', 'The component takes no props: each dialog’s chrome comes from the options passed to open()'],
    ],
    events: [],
    slots: [],
    serviceTitle: 'Service',
    serviceRows: [
      ['open(component, options)', '→ { id, close(data) }', 'Opens the component in a dialog; the handle closes it from the caller’s side'],
      ['options.props', 'object', 'ApexDialog props — header, width, position, modal, draggable and the rest'],
      ['options.contentProps', 'object', 'Props for the loaded component itself'],
      ['options.data', 'any', 'Read by the component through its injected dialogRef'],
      ['options.emits', 'Record<string, fn>', 'Handlers for events the loaded component emits'],
      ['options.templates', '{ header, footer }', 'Components rendered into the dialog’s header and footer slots'],
      ['options.onClose', '({ data }) => void', 'Fires after the leave transition, with whatever dialogRef.close() passed'],
      ['close(id, data) / closeAll()', 'void', 'Close one dialog, or all of them — e.g. on a route change'],
      ['dialogRef (injected)', '{ data, options, close(data) }', "A plain object, so it reads the same in both APIs — inject('dialogRef').close(value) in script setup, this.dialogRef.close(value) in the Options API"],
    ],
  },
  {
    id: 'fileupload', name: 'ApexFileUpload', group: 'File',
    blurb: 'File selection and upload, with drag and drop, per-file progress and validation. Two modes from one implementation — basic is a single button, advanced adds the button row, the drop area and the file list — and every region is a slot, so a custom dropzone or an image grid is a template rather than a different component.',
    noField: true, demo: 'plain',
    lead: [], tail: '\n/>',
    base: { mode: 'advanced', multiple: true, maxFileSize: 5242880, layout: 'list', previewSize: 44, dropzone: true, showButtons: true },
    controls: [
      { key: 'mode', type: 'select', options: ['advanced', 'basic'] },
      { key: 'multiple', type: 'bool' }, { key: 'auto', type: 'bool' },
      { key: 'accept', type: 'text' },
      { key: 'maxFileSize', type: 'number' }, { key: 'maxTotalSize', type: 'number' },
      { key: 'maxFiles', type: 'number' },
      { key: 'layout', type: 'select', options: ['list', 'grid'] },
      { key: 'previewSize', type: 'number' },
      { key: 'dropzone', type: 'bool' }, { key: 'showButtons', type: 'bool' },
      { key: 'disabled', type: 'bool' },
      { key: 'chooseLabel', type: 'text' }, { key: 'uploadLabel', type: 'text' }, { key: 'cancelLabel', type: 'text' },
      { key: 'chooseSeverity', type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'contrast'] },
      { key: 'uploadSeverity', type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'contrast'] },
      { key: 'cancelSeverity', type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'contrast'] },
      { key: 'chooseVariant', type: 'select', options: ['solid', 'outlined', 'text'] },
      { key: 'uploadVariant', type: 'select', options: ['solid', 'outlined', 'text'] },
      { key: 'cancelVariant', type: 'select', options: ['solid', 'outlined', 'text'] },
      { key: 'buttonSize', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'buttonsRounded', type: 'bool' },
      { key: 'emptyLabel', type: 'text' }, { key: 'hint', type: 'text' },
      { key: 'width', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
    ],
    props: [
      ['modelValue', 'File[]', '[]', 'v-model — the current selection'],
      ['mode', "'basic' | 'advanced'", "'advanced'", 'One button, or the full uploader'],
      ['maxFileSize', 'number', '—', 'Size limit per file, in bytes. A file over it is rejected with a message, and the limit also becomes the drop-area hint'],
      ['maxTotalSize', 'number', '—', 'Size limit across the whole selection, in bytes'],
      ['maxFiles', 'number', '—', 'How many files may be selected'],
      ['accept', 'string', '—', "Native syntax — 'image/*', '.pdf,.docx'; enforced on drop as well as on browse"],
      ['multiple', 'boolean', 'false', 'Without it, a new pick replaces the previous file'],
      ['auto', 'boolean', 'false', 'Upload as soon as files are chosen'],
      ['url / method / name / headers / withCredentials', 'string …', "— / 'POST' / 'files'", 'The request. With no url the selection itself is the result, for a form that posts the files with its own fields'],
      ['customUpload', 'boolean', 'false', 'Emits `uploader` instead of sending the request — you get { files, clear, setProgress }'],
      ['layout', "'list' | 'grid'", "'list'", 'Rows, or a thumbnail grid with the remove button on hover'],
      ['previewSize', 'number', '44', 'Thumbnail size in pixels'],
      ['dropzone / showButtons', 'boolean', 'true / true', 'The drop area, and the built-in button row'],
      ['chooseLabel / uploadLabel / cancelLabel', 'string', "'Choose' / 'Upload' / 'Cancel'", ''],
      ['chooseIcon / uploadIcon / cancelIcon', 'string', "'add' / 'upload' / 'close'", ''],
      ['chooseSeverity / uploadSeverity / cancelSeverity', 'severity', "'primary' / 'secondary' / 'secondary'", 'Colour per button — the full ApexButton set: primary, secondary, success, warning, danger, info, contrast'],
      ['chooseVariant / uploadVariant / cancelVariant', "'solid' | 'outlined' | 'text'", "'solid' / 'outlined' / 'text'", 'Weight per button'],
      ['buttonSize / buttonsRounded', "'sm' | 'md' | 'lg' / boolean", '— / false', 'Applies to all three'],
      ['emptyLabel / hint', 'string', "'Drop files or click to browse' / size limit", 'Drop area copy'],
      ['invalidTypeMessage / invalidSizeMessage / invalidLimitMessage', 'string', 'see notes', 'Templates taking {name}, {limit} and {max}'],
      ['width / background / borderColor / radius', 'string', 'tokens', 'Chrome'],
      ['disabled', 'boolean', 'false', ''],
    ],
    events: [
      ['update:modelValue', 'File[]'],
      ['select', '{ files }'],
      ['remove', '{ file, files }'],
      ['clear', '—'],
      ['before-upload', '{ formData, xhr } — add fields or headers before it goes'],
      ['progress', '{ progress }'],
      ['upload', '{ files, response }'],
      ['error', '{ files, message, xhr }'],
      ['uploader', '{ files, clear, setProgress } — only with customUpload'],
    ],
    slots: [
      ['header', 'Replaces the button row; receives every callback — { files, chooseCallback, uploadCallback, clearCallback, progress, messages }'],
      ['content', 'Replaces the file list and drop area; adds { removeFileCallback, uploadedFiles, formatSize }'],
      ['empty', 'The drop area’s own content'],
      ['file', 'One row or cell; receives { file, index, removeFileCallback, formatSize }'],
      ['footer', 'Under the list'],
    ],
    serviceTitle: 'Methods',
    serviceRows: [
      ['choose()', 'void', 'Opens the file dialog — for a trigger of your own'],
      ['upload()', 'void', 'Sends the current selection'],
      ['clear()', 'void', 'Drops the selection and its messages'],
      ['removeFile(index)', 'void', ''],
      ['files / uploadedFiles', 'UploadFile[]', 'Each carries { file, preview, progress, status }'],
      ['formatSize(bytes)', 'string', 'The same formatter the control uses'],
    ],
  },
  {
    id: 'confirmpopup', name: 'ApexConfirmPopup', group: 'Overlays',
    /*
     * The gallery's blurb says this shares the confirm service with
     * ApexConfirmDialog. AF2-186 replaced that pair: the service is now the
     * alert one, and the centred component is ApexAlert. Everything else about
     * the description held, so only the two names changed — keeping the old
     * ones would point the reader at a composable and a component that no
     * longer exist.
     */
    blurb: 'A confirmation anchored to the control that triggered it. Shares the alert service with ApexAlert — a request carrying a target lands here, one without lands in the alert, so the caller never picks a component.',
    noField: true, demo: 'overlay',
    lead: [],
    tail: '\n/>',
    base: { side: 'bottom', align: 'center', showArrow: true },
    controls: [
      { key: 'message', type: 'text' }, { key: 'icon', type: 'text' },
      { key: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'] },
      { key: 'align', type: 'select', options: ['center', 'start', 'end'] },
      { key: 'gap', type: 'number' }, { key: 'showArrow', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'iconColor', type: 'color' },
      { key: 'acceptLabel', type: 'text' }, { key: 'rejectLabel', type: 'text' },
    ],
    props: [
      ['group', 'string', '—', 'Only respond to require() calls carrying this group'],
      ['message / icon / iconColor', 'string', '—', 'Declarative defaults; a require() value overrides them'],
      ['side', "'top' | 'bottom' | 'left' | 'right'", "'bottom'", 'Preferred side; flips when it will not fit'],
      ['align', "'start' | 'center' | 'end'", "'center'", 'Along the target’s cross axis'],
      ['gap', 'number', '10', 'Distance from the target, in pixels'],
      ['showArrow', 'boolean', 'true', 'The arrow tracks the target’s centre even after a shift'],
      ['acceptLabel / rejectLabel', 'string', "'Yes' / 'Cancel'", ''],
      ['width', 'string', 'auto', ''],
      ['zIndex', 'number', '1100', 'Above a dialog, so a popup can open over one'],
    ],
    events: [],
    slots: [
      ['container', 'Headless — replaces the whole popup; receives { options, accept, reject, close, buttons }'],
      ['message', 'Replaces the icon and message; receives { options }'],
    ],
    serviceTitle: 'Request options',
    serviceRows: [
      ['target', 'Element | string | Event | ref', 'Required. Its presence is what routes the request here rather than to the dialog — pass the click event and it resolves to the button'],
      ['side / align', 'string', 'Preferred placement; the popup flips and shifts to stay on screen'],
      ['message / icon / iconColor', 'string', 'The prompt'],
      ['acceptLabel / rejectLabel', 'string', 'Button text'],
      ['acceptIcon / rejectIcon', 'string', 'Button icons'],
      ['acceptSeverity / rejectSeverity', 'severity', 'Button colours'],
      ['buttons', 'ConfirmButton[]', 'Replaces the default pair'],
      ['width / padding / background / radius', 'string', 'Popup sizing and chrome'],
      ['group', 'string', 'Routes the request to a matching popup'],
      ['accept / reject / onCustom', 'callback', 'Resolved the same way as the dialog'],
    ],
  },
];
