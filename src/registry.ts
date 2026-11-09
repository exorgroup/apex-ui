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
    | 'overlay' | 'menu' | 'media' | 'board' | 'chart'
    /**
     * The nine data controls, split by what their stage has to supply.
     *
     * `data-tabular` is DataTable, TreeTable, Tree and OrgChart: each needs a
     * column or node definition AND a seed, and each holds selection and
     * expansion state the rail's controls act on. `data-simple` is Paginator,
     * ProgressBar, Timeline, DataView and PickList: a seed, and in three cases
     * the slot markup without which the control renders as bare rows.
     *
     * Two stages rather than one because a single component covering both
     * DataTable and ProgressBar is mostly branches, and rather than nine
     * because the state each group needs is the same shape.
     */
    | 'data-tabular' | 'data-simple'
    /**
     * ApexScheduler and ApexCalendar — Phase B. One stage each rather than a
     * shared one: a resource timeline and a five-view calendar have no seed,
     * no state and no toolbar in common.
     */
    | 'sched' | 'cal'
    /**
     * ApexEditor and ApexHTMLEditor — Phase C. The gallery marks these with
     * two bare boolean flags of their own, `editorDemo` and
     * `htmlEditorDemo`; ours name their stage the way every other entry
     * does, so the switch in the stage host stays one shape.
     */
    | 'editor' | 'htmleditor'
    /**
     * ApexForm — Phase D. Its own stage: the form IS the demo, and the rail's
     * props drive the shell around it rather than a control inside it.
     */
    | 'form';
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
   * A second interface whose fields this entry's props table also documents.
   *
   * ApexChart is the case: the gallery's table lists the chart's own props and
   * the per-series options together, because a reader configuring a heatmap
   * does not care which object `cellGap` hangs off. Both are real API, so the
   * guard resolves a name against either rather than the table lying about
   * where twenty-four of them live.
   */
  alsoDeclaredIn?: string;
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
  /**
   * The module those rows come from, e.g. `core/scheduler`.
   *
   * Shown as the caption above the companion table, so a reader knows the
   * functions are importable from the package rather than methods on the
   * component. Present on the gallery's entries; added to this shape at
   * AF2-271 when ApexScheduler and ApexCalendar brought it across.
   */
  serviceFn?: string;
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
/**
 * The people the context menu's per-row example acts on. Ported from the
 * gallery, where the same list backs several controls.
 */
/* ── ApexTaskBoard demo data ──────────────────────────────────────
   Ported from the gallery. Every board on the page copies its seed, so one
   demo's drags never show up in another. */
export const TB_SEED = [
  { id: 't1', columnId: 'ideas', order: 0, title: 'Persona-based onboarding paths', labels: ['activation', 'research'], priority: 'P2', assignees: ['Sarah Wilson'], description: 'Route new customers into starter flows.', points: 5 },
  { id: 't2', columnId: 'ideas', order: 1, title: 'Usage-based pricing meters', labels: ['billing', 'platform'], priority: 'P1', checklist: { done: 2, total: 5 }, due: 'Sep 13', assignees: ['James Chen'], points: 8 },
  { id: 't3', columnId: 'ideas', order: 2, title: 'Enterprise SSO buying signal', labels: ['enterprise'], priority: 'P3', description: 'Detect SSO interest from trials.', points: 3 },
  { id: 't4', columnId: 'discovery', order: 0, title: 'Mobile trial activation', labels: ['mobile'], priority: 'P2', checklist: { done: 1, total: 3 }, due: 'Sep 6', assignees: ['Maria Garcia'], points: 5 },
  { id: 't5', columnId: 'discovery', order: 1, title: 'Account health score', labels: ['analytics', 'growth'], priority: 'P3', assignees: ['Alex Kim'], description: 'Blend usage and support signals.', points: 13 },
  { id: 't6', columnId: 'ready', order: 0, title: 'Customer import wizard', labels: ['platform'], priority: 'P3', assignees: ['Lena Braun'], points: 8 },
  { id: 't7', columnId: 'ready', order: 1, title: 'Self-serve plan downgrade', labels: ['billing', 'trust'], priority: 'P2', due: 'Sep 4', assignees: ['Raj Patel'], description: 'Let customers downgrade unaided.', points: 5 },
  { id: 't8', columnId: 'ready', order: 2, title: 'Warehouse sync beta', labels: ['analytics'], priority: 'P1', due: 'Sep 9', assignees: ['James Chen'], points: 21 },
  { id: 't9', columnId: 'building', order: 0, title: 'Checkout recovery campaign', labels: ['checkout', 'growth'], priority: 'P1', checklist: { done: 3, total: 5 }, due: 'Sep 2', assignees: ['Sarah Wilson', 'Lena Braun'], points: 8 },
  { id: 't10', columnId: 'building', order: 1, title: 'Admin audit log', labels: ['enterprise', 'trust'], priority: 'P2', checklist: { done: 1, total: 3 }, assignees: ['Lena Braun'], description: 'Immutable record of admin actions.', points: 5 },
  { id: 't11', columnId: 'building', order: 2, title: 'Saved dashboard templates', labels: ['analytics'], priority: 'P3', assignees: ['James Chen'], points: 3 },
  { id: 't12', columnId: 'blocked', order: 0, title: 'Apple Pay certification', labels: ['checkout', 'trust'], priority: 'P2', due: '2d ago', assignees: ['Sarah Wilson'], description: 'Waiting on the certification queue.', points: 8 },
  { id: 't13', columnId: 'blocked', order: 1, title: 'Data residency messaging', labels: ['enterprise'], priority: 'P3', points: 2 },
];

export const TB_OPS_SEED = [
  { id: 'o1', columnId: 'intake', swimlaneId: 'north', order: 0, title: 'Quote backup generator service', priority: 'Medium', estimate: '2p', tag: '#quote', assignees: ['Priya Shah'] },
  { id: 'o2', columnId: 'scheduled', swimlaneId: 'north', order: 0, title: 'Replace freezer controller', priority: 'High', estimate: '2p', tag: '#cold-chain', assignees: ['Nils Kaur'] },
  { id: 'o3', columnId: 'onsite', swimlaneId: 'north', order: 0, title: 'Investigate gate sensor loop', priority: 'Critical', estimate: '3p', tag: '#access', assignees: ['Mona Lund'] },
  { id: 'o4', columnId: 'onsite', swimlaneId: 'north', order: 1, title: 'Refit loading dock camera', priority: 'High', estimate: '5p', tag: '#security', assignees: ['Nils Kaur'] },
  { id: 'o5', columnId: 'review', swimlaneId: 'north', order: 0, title: 'Verify night crew handoff', priority: 'Medium', estimate: '1p', tag: '#handoff', assignees: ['Sam Carter'] },
  { id: 'o6', columnId: 'closed', swimlaneId: 'north', order: 0, title: 'Close sprinkler inspection', priority: 'Low', estimate: '1p', tag: '#inspection', assignees: ['Priya Shah'] },
  { id: 'o7', columnId: 'intake', swimlaneId: 'retail', order: 0, title: 'Book signage replacement', priority: 'High', estimate: '2p', tag: '#retail', assignees: ['Elif Riza'] },
  { id: 'o8', columnId: 'intake', swimlaneId: 'retail', order: 1, title: 'Repair stockroom door strike', priority: 'High', estimate: '2p', tag: '#access', assignees: ['Vik Cruz'] },
  { id: 'o9', columnId: 'scheduled', swimlaneId: 'retail', order: 0, title: 'Stage weekend cleaning crew', priority: 'Medium', estimate: '1p', tag: '#crew', assignees: ['Vik Cruz'] },
  { id: 'o10', columnId: 'onsite', swimlaneId: 'retail', order: 0, title: 'Escalator brake fault', priority: 'Critical', estimate: '3p', tag: '#safety', assignees: ['Omar Bay'] },
  { id: 'o11', columnId: 'review', swimlaneId: 'retail', order: 0, title: 'Approve storefront glass work', priority: 'Critical', estimate: '2p', tag: '#vendor', assignees: ['Omar Bay'] },
  { id: 'o12', columnId: 'closed', swimlaneId: 'retail', order: 0, title: 'Close POS counter retrofit', priority: 'Medium', estimate: '2p', tag: '#retail', assignees: ['Elif Riza'] },
  { id: 'o13', columnId: 'intake', swimlaneId: 'airport', order: 0, title: 'Triage baggage belt alarm', priority: 'Critical', estimate: '5p', tag: '#baggage', assignees: ['Maya Patel'] },
  { id: 'o14', columnId: 'onsite', swimlaneId: 'airport', order: 0, title: 'Repair kiosk printer cluster', priority: 'High', estimate: '2p', tag: '#kiosk', assignees: ['Maya Patel'] },
  { id: 'o15', columnId: 'closed', swimlaneId: 'airport', order: 0, title: 'Close terminal HVAC alarm', priority: 'High', estimate: '3p', tag: '#hvac', assignees: ['Maya Patel'] },
];

/** 600 cards, for the virtual-scroll example. */
export const TB_BIG = (() => {
  const cols = ['intake', 'scheduled', 'onsite', 'review', 'closed'];
  const prios = ['P1', 'P2', 'P3', 'P4'];
  const who = ['Sarah Wilson', 'James Chen', 'Maria Garcia', 'Alex Kim', 'Lena Braun'];
  const out = [];
  for (let i = 0; i < 600; i += 1) {
    out.push({
      id: 'big-' + i,
      columnId: cols[i % cols.length],
      order: Math.floor(i / cols.length),
      title: 'Work item ' + (i + 1),
      priority: prios[i % prios.length],
      assignees: [who[i % who.length]],
      points: (i % 8) + 1,
    });
  }
  return out;
})();

export const TB_COLUMNS = [
  { id: 'ideas', title: 'Ideas', accent: 'oklch(0.62 0.14 250)' },
  { id: 'discovery', title: 'Discovery', accent: 'oklch(0.66 0.15 200)' },
  { id: 'ready', title: 'Ready', limit: 4, accent: 'oklch(0.68 0.16 150)' },
  { id: 'building', title: 'Building', limit: 3, accent: 'oklch(0.72 0.15 90)' },
  { id: 'blocked', title: 'Blocked', accent: 'oklch(0.62 0.19 25)' },
];

export const TB_RULE_COLUMNS = [
  { id: 'ideas', title: 'Ideas' },
  { id: 'ready', title: 'Ready', limit: 2 },
  { id: 'building', title: 'Building' },
  { id: 'review', title: 'Review', allowedTo: ['building', 'shipped'] },
  { id: 'shipped', title: 'Shipped', locked: true },
];

export const TB_OPS_COLUMNS = [
  { id: 'intake', title: 'Intake' },
  { id: 'scheduled', title: 'Scheduled' },
  { id: 'onsite', title: 'On site', limit: 3 },
  { id: 'review', title: 'Review' },
  { id: 'closed', title: 'Closed' },
];

export const TB_LANES = [
  { id: 'north', title: 'North Region', icon: 'apartment' },
  { id: 'retail', title: 'Downtown Retail', icon: 'storefront' },
  { id: 'airport', title: 'Airport Terminal', icon: 'flight' },
];

export const TB_PERM_COLUMNS = [
  { id: 'ideas', title: 'Ideas' },
  { id: 'ready', title: 'Ready' },
  { id: 'building', title: 'Building' },
  { id: 'shipped', title: 'Shipped' },
];

export const TB_GUARD_COLUMNS = [
  { id: 'ready', title: 'Ready' },
  { id: 'building', title: 'Building' },
  { id: 'shipped', title: 'Shipped' },
];

export const TB_GROUPS = [
  { id: 'shaping', title: 'Shaping', columnIds: ['backlog', 'ideas', 'discovery'], accent: 'oklch(0.62 0.14 250)' },
  { id: 'delivery', title: 'Delivery', columnIds: ['ready', 'building'], accent: 'oklch(0.68 0.16 150)' },
  { id: 'done', title: 'Done', columnIds: ['shipped'], accent: 'oklch(0.60 0.10 260)' },
];

export const TB_PHASE_COLUMNS = [
  { id: 'backlog', title: 'Backlog', pinned: 'start' as const },
  { id: 'ideas', title: 'Ideas' },
  { id: 'discovery', title: 'Discovery' },
  { id: 'ready', title: 'Ready', limit: 4 },
  { id: 'building', title: 'Building', limit: 3 },
  { id: 'shipped', title: 'Shipped', pinned: 'end' as const },
];

export const TB_ICONS: Record<string, string> = {
  ideas: 'lightbulb', discovery: 'travel_explore', ready: 'task_alt',
  building: 'construction', blocked: 'block',
};

export const TB_FIELDS = {
  title: 'title', labels: 'labels', priority: 'priority', assignees: 'assignees',
  checklist: 'checklist', due: 'due', description: 'description',
  meta: [{ key: 'points', icon: 'straighten' }],
};

export const TB_OPS_FIELDS = {
  title: 'title', priority: 'priority', assignees: 'assignees',
  meta: [{ key: 'estimate', icon: 'schedule' }, { key: 'tag' }],
};

/** The gallery's eight placeholders \u2014 every ApexGallery example uses these. */
export const GAL_IMAGES = [
  { caption: 'Coastline', background: 'linear-gradient(140deg,#8FB6D9,#DCE9F2)' },
  { caption: 'Dunes', background: 'linear-gradient(140deg,#C9A88F,#EFE2D5)' },
  { caption: 'Valley', background: 'linear-gradient(140deg,#9BB894,#E3EDDF)' },
  { caption: 'Dusk', background: 'linear-gradient(140deg,#B79BC4,#EBE1F0)' },
  { caption: 'Canyon', background: 'linear-gradient(140deg,#D99C9C,#F5E3E3)' },
  { caption: 'Harbour', background: 'linear-gradient(140deg,#9AA9BD,#E4E9EF)' },
  { caption: 'Ridge', background: 'linear-gradient(140deg,#8FA9A0,#DEEAE6)' },
  { caption: 'Field', background: 'linear-gradient(140deg,#CFC08F,#F1EBD8)' },
];

/** Two carousels share this list in the Gallery example. */
export const CAR_SHOTS = [
  { label: 'Placeholder 1', bg: 'linear-gradient(140deg,#8FB6D9,#DCE9F2)' },
  { label: 'Placeholder 2', bg: 'linear-gradient(140deg,#C9A88F,#EFE2D5)' },
  { label: 'Placeholder 3', bg: 'linear-gradient(140deg,#9BB894,#E3EDDF)' },
  { label: 'Placeholder 4', bg: 'linear-gradient(140deg,#B79BC4,#EBE1F0)' },
  { label: 'Placeholder 5', bg: 'linear-gradient(140deg,#D99C9C,#F5E3E3)' },
  { label: 'Placeholder 6', bg: 'linear-gradient(140deg,#9AA9BD,#E4E9EF)' },
];

export const CAR_TRACKS = [
  { title: 'Velvet Haze', artist: 'Aurora Skies' },
  { title: 'Dissolve', artist: 'Phantom Echo' },
  { title: 'Still Life', artist: 'Glass Arbour' },
  { title: 'Northbound', artist: 'Kite Season' },
  { title: 'Paper Lanterns', artist: 'Mira Vale' },
  { title: 'Undertow', artist: 'Low Tide Club' },
];

/** The six navPosition values, one cell each in the Controls section. */
export const CAR_NAV_POS = ['bottom', 'top', 'middle', 'both-start', 'both-end', 'split'] as const;

export const TEAM = [
  { id: 'u1', name: 'A. Borg', role: 'Founder & CEO', icon: 'person' },
  { id: 'u2', name: 'L. Rossi', role: 'Product Lead', icon: 'lightbulb' },
  { id: 'u3', name: 'K. Weber', role: 'Engineering Lead', icon: 'terminal' },
  { id: 'u4', name: 'S. de Vries', role: 'UX Designer', icon: 'draw' },
  { id: 'u5', name: 'M. Dubois', role: 'Product Manager', icon: 'assignment' },
  { id: 'u6', name: 'C. Ruiz', role: 'Frontend Engineer', icon: 'code' },
  { id: 'u7', name: 'J. Camilleri', role: 'Backend Engineer', icon: 'dns' },
  { id: 'u8', name: 'N. Farrugia', role: 'QA Engineer', icon: 'bug_report' },
  { id: 'u9', name: 'P. Zammit', role: 'Operations', icon: 'inventory_2' },
  { id: 'u10', name: 'D. Micallef', role: 'Field Technician', icon: 'handyman' },
];

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
  { key: 'info', type: 'text' },
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
  'label', 'labelIcon', 'info', 'labelPlacement', 'labelWidth', 'help', 'error', 'warning',
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
  { tag: 'info', value: '0', bind: { label: 'Max applications', info: '0 = unlimited. 20 = the first 20 tickets sold get it.' } },
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
    id: 'motion', name: 'Motion & transitions', group: 'Foundations',
    body: `
      <h2>Four props, every overlay</h2>
      <p>A form's modal, an alert, a dialog, a drawer, a popover, a confirm popup and a
      toast all take the same four: <code>enterClass</code>, <code>leaveClass</code>,
      <code>enterDuration</code>, <code>leaveDuration</code>. The three with a built-in
      choice — form, alert, dialog — also take <code>transition</code>
      (<code>scale</code> | <code>slide</code> | <code>fade</code> | <code>none</code>).
      A drawer animates by its position and a popover has one animation, so neither
      offers a preset to choose rather than offering one that does nothing.</p>

      <h2>animate.css is NOT bundled</h2>
      <p>The classes are plain strings and this library never references any animation
      package, which is what keeps it free of runtime CSS dependencies. To use
      <a href="https://animate.style" target="_blank" rel="noopener">animate.css</a>,
      install it yourself and import it once:</p>
      <pre class="doc-pre"><code>npm i animate.css</code></pre>
      <pre class="doc-pre"><code>import 'animate.css';</code></pre>
      <p>Then pass its class names. Note that animate.css needs <em>both</em> its base
      class and the animation:</p>
      <pre class="doc-pre"><code>&lt;ApexDialog
  enter-class="animate__animated animate__fadeInDown"
  leave-class="animate__animated animate__fadeOutUp"
  enter-duration="400ms"
  leave-duration="250ms"
/&gt;</code></pre>
      <p>Anything else works the same way — your own keyframes, another library, a house
      set. The library only applies the class you name.</p>

      <h2>One default for the whole app</h2>
      <p>Set it once on the plugin and every overlay follows; any component's own prop
      still wins.</p>
      <pre class="doc-pre"><code>app.use(ApexUI, {
  overlayTransition: {
    enterClass: 'animate__animated animate__fadeInDown',
    leaveClass: 'animate__animated animate__fadeOutUp',
    enterDuration: '350ms',
    leaveDuration: '200ms',
  },
})</code></pre>

      <h2>Durations</h2>
      <p>Each phase is written onto the element as it begins and removed as it ends — as
      <code>--animate-duration</code>, which animate.css reads, and as
      <code>animation-duration</code>, so the props work for hand-written classes too.
      They have to be cleared: animate.css has one duration variable shared by both
      phases, so a value left behind would make a reopened dialog enter at the leave
      speed.</p>

      <h2>Reduced motion</h2>
      <p>Every built-in preset stops under <code>prefers-reduced-motion: reduce</code>.
      Custom classes are yours to handle — animate.css carries its own
      <code>!important</code> block, so the duration props cannot override a reader who
      asked for less motion.</p>

      <h2>What does not animate</h2>
      <p>The scrim behind a modal appears at once, deliberately: a panel flying in over a
      fading backdrop reads as two things happening. A toast's <code>move-class</code>
      likewise stays on the built-in — how the pile rearranges when one closes is a
      different question from how a toast arrives.</p>`,
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

  ['--apex-treesel-row-fg', 'var(--fg-default)', 'ApexTreeSelect — a node at rest'],
  ['--apex-treesel-row-radius', 'var(--r-sm)', 'Node corner'],
  ['--apex-treesel-row-pad', '8px', 'Node vertical padding'],
  ['--apex-treesel-row-fs', '14px', 'Node text size'],
  ['--apex-treesel-row-hover-bg', 'var(--bg-muted)', 'Node under the pointer'],
  ['--apex-treesel-row-selected-bg', 'color-mix(— 12%)', 'Selected node'],
  ['--apex-treesel-row-selected-fg', 'var(--accent-primary)', 'Selected node text'],
  ['--apex-treesel-twisty-fg', 'var(--fg-subtle)', 'The expand/collapse chevron'],
  ['--apex-treesel-twisty-size', '20px', 'Chevron box — the leaf spacer reads this too, so rows stay in line'],
  ['--apex-treesel-twisty-radius', 'var(--r-xs)', 'Chevron corner'],
  ['--apex-treesel-twisty-hover-bg', 'var(--bg-subtle)', 'Chevron under the pointer'],
  ['--apex-treesel-twisty-hover-fg', 'var(--fg-default)', 'Chevron glyph on hover'],
  ['--apex-treesel-indent', '18px', 'How far each level steps in'],

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
    ['option', '.apex-tree__row', '--apex-treesel-row-fg, --apex-treesel-row-radius, --apex-treesel-row-pad, --apex-treesel-row-fs, --apex-treesel-row-hover-bg, --apex-treesel-row-selected-bg, --apex-treesel-row-selected-fg'],
    ['twisty', '.apex-tree__twisty', '--apex-treesel-twisty-fg, --apex-treesel-twisty-size, --apex-treesel-twisty-radius, --apex-treesel-twisty-hover-bg, --apex-treesel-twisty-hover-fg'],
    ['— (indent)', '.apex-tree__row padding', '--apex-treesel-indent — how far each level steps in. The leaf spacer reads the same --apex-treesel-twisty-size, so rows stay in line'],
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
    ['calendar', '.apex-cal', '--apex-dp-bg, --apex-dp-border, --apex-dp-radius, --apex-dp-shadow'],
    ['nav', '.apex-cal__nav', 'the prev/next buttons are .apex-ctl__btn inside it'],
    ['title', '.apex-cal__title', '--apex-dp-nav-fg, --apex-dp-nav-hover-bg, --apex-dp-nav-hover-fg'],
    ['months', '.apex-cal__months', 'the row of columns — layout only'],
    ['month', '.apex-cal__month', 'one column — layout only'],
    ['monthLabel', '.apex-cal__mlabel', '--apex-dp-month-fg (shown once numberOfMonths is above one)'],
    ['grid', '.apex-cal__grid', 'the seven columns — layout only'],
    ['weekday', '.apex-cal__wd', '--apex-dp-wd-fg'],
    ['day', '.apex-cal__day', '--apex-dp-day-fg, --apex-dp-day-radius, --apex-dp-day-hover-bg, --apex-dp-day-selected-bg, --apex-dp-day-selected-fg, --apex-dp-day-today-ring, --apex-dp-day-outside-fg, --apex-dp-day-range-bg'],
    ['pick', '.apex-cal__pick', '--apex-dp-pick-fg, --apex-dp-pick-hover-bg, --apex-dp-pick-selected-bg, --apex-dp-pick-selected-fg (month and year grids)'],
    ['time', '.apex-cal__time', '--apex-dp-time-border, --apex-dp-time-fg, --apex-dp-time-font'],
    ['spin', '.apex-cal__spin', '--apex-dp-spin-fg, --apex-dp-spin-hover-bg, --apex-dp-spin-hover-fg'],
    ['meridiem', '.apex-cal__mer', '--apex-dp-mer-bg, --apex-dp-mer-fg, --apex-dp-mer-border, --apex-dp-mer-hover'],
    ['bar', '.apex-cal__bar', '--apex-dp-bar-border, --apex-dp-bar-fg, --apex-dp-bar-hover-bg'],
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
  keyboard: [
    ['pad', '.apex-keyboard', '--apex-keyboard-surface, --apex-keyboard-pad, --apex-keyboard-gap, --apex-keyboard-radius, --apex-keyboard-w (max width)'],
    ['key', '.apex-keyboard__key', '--apex-keyboard-bg, --apex-keyboard-fg, --apex-keyboard-border, --apex-keyboard-key-radius, --apex-keyboard-key-max; height --apex-keyboard-key, never below 44px'],
    ['enter', '.apex-keyboard__key--enter', '--apex-keyboard-enter-bg, --apex-keyboard-enter-fg (set the fg on a light accent)'],
    ['shift', '.apex-keyboard__key[data-caps]', 'once / lock — the accent border, and a tint when locked'],
  ],
  keypad: [
    ['display', '.apex-keypad__display', '--apex-keypad-display-bg, --apex-keypad-radius (data-error="true" while a sum cannot be worked out)'],
    ['key', '.apex-keypad__key', '--apex-keypad-bg, --apex-keypad-fg, --apex-keypad-border, --apex-keypad-radius; height --apex-keypad-key, never below 44px'],
    ['operator', '.apex-keypad__key--op', '--apex-keypad-op-bg'],
    ['function', '.apex-keypad__key--fn', '--apex-keypad-fn-bg'],
    ['enter', '.apex-keypad__key--enter', '--apex-keypad-enter-bg, --apex-keypad-enter-fg (set the fg on a light accent)'],
    ['pad', '.apex-keypad', '--apex-keypad-gap, --apex-keypad-w (max width)'],
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
  --apex-treesel-row-fg: #E8EEF7;
  --apex-treesel-row-hover-bg: #1D2735;
  --apex-treesel-row-selected-bg: #16202C;
  --apex-treesel-row-selected-fg: #7AA2F7;
  --apex-treesel-twisty-fg: #6B7789;
  --apex-treesel-twisty-hover-bg: #1D2735;
  /* One step per level. The leaf spacer reads the twisty size, so a leaf
     still lines up with its siblings when you change either. */
  --apex-treesel-indent: 22px;
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
     They are sugar over --apex-dp-*, so this and the CSS below do the
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
  --apex-dp-nav-hover-fg: #7AA2F7;
  --apex-dp-wd-fg: #6B7789;
  --apex-dp-pick-selected-bg: #7AA2F7;
  --apex-dp-pick-selected-fg: #0B0F14;
  --apex-dp-time-border: #243040;
  --apex-dp-spin-hover-fg: #7AA2F7;
  --apex-dp-mer-bg: #16202C;
  --apex-dp-bar-fg: #7AA2F7;
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

  keyboard: `<!-- A till's search: the field keeps its caret while the keys are pressed. -->
<ApexInput v-model="q" leading-icon="search" @focus="kb = true" />
<ApexKeyboard v-if="kb" v-model="q" hide :extra-letters="['ċ', 'ġ', 'ħ', 'ż']"
  @enter="search" @hide="kb = false" class="till-kb" />

.till-kb {
  --apex-keyboard-enter-bg: #FFCC00;
  --apex-keyboard-enter-fg: #1A1A1A;
}`,

  keypad: `<!-- A PIN pad: no operators and no dot, so leading zeros are kept. -->
<ApexKeyPad v-model="pin" layout="phone" mask :max-length="4" auto-submit
  randomise :enter="false" label="Staff PIN" @enter="signIn" />

<!-- A till keypad: the sum's RESULT reaches the function key. -->
<ApexKeyPad v-model="entry" operators dot clear double-zero
  :function-keys="[{ id: 'qty', label: '× Qty' }, { id: 'plu', label: 'PLU' }]"
  @function="(id, value) => act(id, value)" class="till-pad" />

.till-pad {
  --apex-keypad-enter-bg: #FFCC00;
  --apex-keypad-enter-fg: #1A1A1A;
  --apex-keypad-key: 64px;
}`,

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

/* ------------------------------------------------------------------ *
 * Seed data for the nine data controls.
 *
 * Copied from the gallery's own registry (web/apex-ui-docs.js) and shell
 * (web/apex-ui-shell.js), for the reason the header of this file gives:
 * hand-writing demo data from the components' props produced a page that
 * looked plausible and rendered different demos, which is worse than useless
 * when the point is comparing the two side by side.
 *
 * The one deliberate change is the thumbnail path. The gallery is buildless
 * and serves them from `web/thumbs/`; a Vite app serves `public/` at the
 * root, so the same six files are `/thumbs/`.
 * ------------------------------------------------------------------ */

/** Sales rows for the DataTable demos. Enough to page and sort meaningfully. */
export const SALES = (function () {
  const countries = ['Malta', 'Italy', 'Germany', 'France', 'Spain', 'Netherlands'];
  const reps = ['A. Borg', 'L. Rossi', 'K. Weber', 'M. Dubois', 'C. Ruiz', 'S. de Vries'];
  const statuses = ['qualified', 'negotiation', 'renewal', 'new', 'unqualified'];
  const products = ['Totem 43"', 'Wall 55"', 'Menu board', 'Ticker strip', 'Window 32"', 'Kiosk 27"'];
  const out: Record<string, unknown>[] = [];
  for (let i = 0; i < 84; i++) {
    const qty = 1 + ((i * 7) % 24);
    const price = 180 + ((i * 53) % 1400);
    out.push({
      id: 'ORD-' + String(1001 + i),
      thumb: '/thumbs/' + products[i % products.length].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.png',
      sku: 'SKU-' + String(4200 + i * 3),
      product: products[i % products.length],
      country: countries[i % countries.length],
      rep: reps[(i * 5) % reps.length],
      status: statuses[(i * 3) % statuses.length],
      qty,
      price,
      margin: 0.08 + ((i % 9) * 0.035),
      signed: new Date(2025, i % 12, 1 + (i % 27)),
      verified: i % 3 !== 0,
    });
  }
  return out;
})();

/** The two option lists the filter and edit examples share. */
export const STATUS_OPTIONS = [
  { value: 'qualified', label: 'Qualified' }, { value: 'negotiation', label: 'Negotiation' },
  { value: 'renewal', label: 'Renewal' }, { value: 'new', label: 'New' },
  { value: 'unqualified', label: 'Unqualified' },
];
export const COUNTRY_OPTIONS = ['Malta', 'Italy', 'Germany', 'France', 'Spain', 'Netherlands']
  .map((c) => ({ value: c, label: c }));

export const SALES_COLUMNS = [
  { field: 'id', header: 'Order', sortable: true, width: '110px' },
  { field: 'product', header: 'Product', sortable: true, minWidth: '150px' },
  { field: 'country', header: 'Country', sortable: true, minWidth: '130px' },
  { field: 'rep', header: 'Representative', sortable: true, minWidth: '150px' },
  { field: 'status', header: 'Status', sortable: true, format: 'badge', minWidth: '130px',
    badgeTones: { qualified: 'success', negotiation: 'warning', renewal: 'info', 'new': 'primary', unqualified: 'danger' } },
  { field: 'qty', header: 'Qty', sortable: true, format: 'number', align: 'end', width: '80px', aggregate: 'sum' },
  { field: 'price', header: 'Unit price', sortable: true, format: 'currency', align: 'end', width: '130px', aggregate: 'avg' },
  { header: 'Net total', formula: '=qty*price/1.5', format: 'currency', align: 'end', width: '140px', aggregate: 'sum' },
  { field: 'margin', header: 'Margin', sortable: true, format: 'percent', precision: 1, align: 'end', width: '100px', aggregate: 'avg' },
  { field: 'signed', header: 'Signed', sortable: true, format: 'date', width: '120px' },
  { field: 'verified', header: 'Verified', format: 'boolean', align: 'center', width: '100px' },
];

/* TEAM — the people PickList moves between its two lists — is already
   declared above for the OrderList and Listbox demos, and is byte-identical to
   the gallery's. Reused rather than declared a second time. */

export const ORG_TREE = {
  key: 'ceo', label: 'A. Borg', subtitle: 'Founder & CEO', icon: 'person',
  children: [
    { key: 'product', label: 'L. Rossi', subtitle: 'Product Lead', icon: 'lightbulb', children: [
      { key: 'ux', label: 'S. de Vries', subtitle: 'UX Designer', icon: 'draw' },
      { key: 'pm', label: 'M. Dubois', subtitle: 'Product Manager', icon: 'assignment' },
    ] },
    { key: 'eng', label: 'K. Weber', subtitle: 'Engineering Lead', icon: 'terminal', children: [
      { key: 'fe', label: 'C. Ruiz', subtitle: 'Frontend Engineer', icon: 'code' },
      { key: 'be', label: 'J. Camilleri', subtitle: 'Backend Engineer', icon: 'dns' },
      { key: 'qa', label: 'N. Farrugia', subtitle: 'QA Engineer', icon: 'bug_report' },
    ] },
    { key: 'ops', label: 'P. Zammit', subtitle: 'Operations', icon: 'inventory_2',
      background: '#FFF1E5', borderColor: '#C24A06', color: '#6F2A03', children: [
      { key: 'field', label: 'D. Micallef', subtitle: 'Field Technician', icon: 'handyman' },
    ] },
  ],
};

export const SHIPMENT = [
  { status: 'Ordered', date: 'Oct 15, 2026', time: '10:30', icon: 'shopping_cart', color: '#0B5FFF',
    note: 'Order #12345 confirmed and queued for picking.' },
  { status: 'Payment confirmed', date: 'Oct 15, 2026', time: '10:32', icon: 'credit_card', color: '#137C4A',
    note: '€149.99 captured on card ending 4242.' },
  { status: 'Shipped', date: 'Oct 16, 2026', time: '14:15', icon: 'local_shipping', color: '#C24A06',
    note: 'Handed to the carrier. Tracking TRK-892374651.' },
  { status: 'Out for delivery', date: 'Oct 18, 2026', time: '08:05', icon: 'directions_car', color: '#7C3AED',
    note: 'On the van, 6 stops away.' },
  { status: 'Delivered', date: 'Oct 18, 2026', time: '11:20', icon: 'check_circle', color: '#137C4A',
    note: 'Signed for at the front door.' },
];

/** The file tree ApexTree renders, and the source ApexTreeTable's rows mirror. */
export const FILES = [
  { key: 'docs', label: 'Documents', icon: 'folder', children: [
    { key: 'work', label: 'Work', icon: 'folder', children: [
      { key: 'expenses', label: 'Expenses.xlsx', icon: 'description', data: { size: '18 KB' } },
      { key: 'contract', label: 'Contract.pdf', icon: 'picture_as_pdf', data: { size: '240 KB' } },
    ] },
    { key: 'home', label: 'Home', icon: 'folder', children: [
      { key: 'invoices', label: 'Invoices.zip', icon: 'folder_zip', data: { size: '1.2 MB' } },
    ] },
  ] },
  { key: 'media', label: 'Media', icon: 'folder', children: [
    { key: 'signage', label: 'Signage', icon: 'folder', children: [
      { key: 'lobby-loop', label: 'lobby-loop.mp4', icon: 'movie', data: { size: '84 MB' } },
      { key: 'menu-board', label: 'menu-board.png', icon: 'image', data: { size: '2.1 MB' } },
    ] },
    { key: 'audio', label: 'ambient.mp3', icon: 'audiotrack', data: { size: '6 MB' } },
  ] },
  { key: 'reports', label: 'Reports', icon: 'folder', children: [
    { key: 'play', label: 'proof-of-play.csv', icon: 'table_view', data: { size: '512 KB' } },
    { key: 'uptime', label: 'uptime.csv', icon: 'table_view', data: { size: '96 KB' } },
  ] },
  { key: 'readme', label: 'README.md', icon: 'article', data: { size: '3 KB' } },
];

export const TT_NODES = (function () {
  const mk = (
    key: string, name: string, type: string, size: number,
    owner: string, modified: string, icon: string, children?: unknown[],
  ) => ({ key, icon, data: { name, type, size, owner, modified }, children });
  return [
    mk('d', 'Documents', 'Folder', 75, 'A. Borg', '2026-08-02', 'folder', [
      mk('d-w', 'Work', 'Folder', 55, 'A. Borg', '2026-08-04', 'folder', [
        mk('d-w-1', 'Expenses.xlsx', 'Spreadsheet', 30, 'L. Rossi', '2026-08-04', 'description'),
        mk('d-w-2', 'Contract.pdf', 'Document', 25, 'A. Borg', '2026-07-28', 'picture_as_pdf'),
      ]),
      mk('d-h', 'Home', 'Folder', 20, 'A. Borg', '2026-06-11', 'folder', [
        mk('d-h-1', 'Invoices.zip', 'Archive', 20, 'A. Borg', '2026-06-11', 'folder_zip'),
      ]),
    ]),
    mk('m', 'Media', 'Folder', 1650, 'K. Weber', '2026-08-18', 'folder', [
      mk('m-s', 'Signage', 'Folder', 1560, 'K. Weber', '2026-08-18', 'folder', [
        mk('m-s-1', 'lobby-loop.mp4', 'Video', 1500, 'K. Weber', '2026-08-18', 'movie'),
        mk('m-s-2', 'menu-board.png', 'Image', 60, 'S. de Vries', '2026-08-12', 'image'),
      ]),
      mk('m-a', 'ambient.mp3', 'Audio', 90, 'C. Ruiz', '2026-05-30', 'audiotrack'),
    ]),
    mk('r', 'Reports', 'Folder', 608, 'M. Dubois', '2026-08-20', 'folder', [
      mk('r-1', 'proof-of-play.csv', 'Spreadsheet', 512, 'M. Dubois', '2026-08-20', 'table_view'),
      mk('r-2', 'uptime.csv', 'Spreadsheet', 96, 'M. Dubois', '2026-08-19', 'table_view'),
    ]),
    mk('x', 'README.md', 'Document', 3, 'A. Borg', '2026-04-02', 'article'),
  ];
})();

export const TT_COLUMNS: Record<string, unknown>[] = [
  { field: 'name', header: 'Name', expander: true, sortable: true, minWidth: '240px' },
  { field: 'size', header: 'Size', sortable: true, format: 'number', align: 'end', width: '110px',
    aggregate: 'sum' },
  { field: 'type', header: 'Type', sortable: true, format: 'badge', width: '150px',
    badgeTones: { Folder: 'warning', Document: 'info', Spreadsheet: 'success', Video: 'primary', Image: 'primary', Audio: 'neutral', Archive: 'neutral' } },
  { field: 'owner', header: 'Owner', sortable: true, minWidth: '140px' },
  { field: 'modified', header: 'Modified', sortable: true, format: 'date', width: '130px' },
];

/**
 * The stage's columns, with filters switched on.
 *
 * The gallery derives these from TT_COLUMNS rather than writing a second
 * array, so a change to a column's header or format cannot apply to one table
 * and not the other. Kept as a derivation for the same reason.
 */
export const TT_FILTER_COLUMNS = TT_COLUMNS.map((c) => {
  if (c.field === 'name') return { ...c, filter: true, filterType: 'text' };
  if (c.field === 'type') return { ...c, filter: true, filterType: 'select',
    filterOptions: ['Folder', 'Document', 'Spreadsheet', 'Video', 'Image', 'Audio', 'Archive']
      .map((v) => ({ value: v, label: v })) };
  if (c.field === 'size') return { ...c, filter: true, filterType: 'number', filterMatchMode: 'gte' };
  return c;
});

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
      ['info', 'string', '\u2014', 'An \u24d8 after the label that opens this explanation \u2014 click or Enter, Escape closes. For what a setting means; help is for what to type'],
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
      ['labelFor', 'boolean', 'true', 'Off for a COMPOSITE control, whose resolved id lands on a div. `for` may only point at a labelable element, so on a group it names nothing at all — such a control takes the `labelId` the slot hands out and uses `aria-labelledby` instead. ApexEditor is the first of ours to need it (AF2-280).'],
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
    id: 'keyboard', name: 'ApexKeyboard', group: 'Text', noField: true,
    blurb: "An on-screen keyboard for a touch screen with none of its own. It types into a v-model while the field it serves keeps its caret; Shift capitalises the next letter (twice locks), and a row of extra letters covers what A–Z does not — Maltese ċ ġ ħ ż.",
    model: '',
    base: { hide: true, shift: true, extraLetters: ['ċ', 'ġ', 'ħ', 'ż'], label: 'Keyboard' },
    controls: [
      { key: 'digits', type: 'bool' }, { key: 'shift', type: 'bool' }, { key: 'enter', type: 'bool' },
      { key: 'del', type: 'bool' }, { key: 'clear', type: 'bool' }, { key: 'space', type: 'bool' },
      { key: 'hide', type: 'bool' }, { key: 'maxLength', type: 'number' }, { key: 'enterLabel', type: 'text' },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] }, { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string', "''", 'v-model — the text typed; letters in lower case unless Shift'],
      ['digits', 'boolean', 'true', 'The 1–0 row (⌫ sits at its end; without it, at the end of the first letter row)'],
      ['enter / del / clear / space', 'boolean', 'true', 'Those keys'],
      ['hide', 'boolean', 'false', 'A Hide key, emitting hide'],
      ['shift', 'boolean', 'false', 'A Shift key: the next letter in capitals; a second tap locks, a third unlocks'],
      ['extraLetters', 'string[]', '[]', "Letters beyond A–Z, as their own row — ['ċ', 'ġ', 'ħ', 'ż']"],
      ['maxLength', 'number', '—', 'Characters the text may hold'],
      ['enterLabel / label', 'string', "'Enter' / 'Keyboard'", "The Enter key's text; the keyboard's accessible name"],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Key height 44 / 52 / 60px'],
      ['disabled', 'boolean', 'false', 'Every key off, the physical keyboard ignored'],
    ],
    events: [['update:modelValue', 'string'], ['enter', 'string — the text'], ['hide', '—']],
  },
  {
    id: 'keypad', name: 'ApexKeyPad', group: 'Numbers', noField: true,
    blurb: 'An on-screen number pad — a till keypad or a PIN pad. Each key switches on by itself; a sum is worked out in standard order (× ÷ first) and Enter or a function key receives the result. A sum it cannot work out says so and emits nothing. Randomise shuffles the digits for PIN entry.',
    model: '',
    base: {
      operators: true, dot: true, clear: true, doubleZero: true, layout: 'calculator',
      functionKeys: [{ id: 'qty', label: '× Qty' }, { id: 'plu', label: 'PLU' }, { id: 'off', label: '% off' }],
      label: 'Till keypad',
    },
    controls: [
      { key: 'operators', type: 'bool' }, { key: 'dot', type: 'bool' }, { key: 'clear', type: 'bool' },
      { key: 'doubleZero', type: 'bool' }, { key: 'enter', type: 'bool' }, { key: 'del', type: 'bool' },
      { key: 'layout', type: 'select', options: ['calculator', 'phone'] },
      { key: 'randomise', type: 'bool' }, { key: 'reshuffle', type: 'bool' }, { key: 'mask', type: 'bool' },
      { key: 'maxLength', type: 'number' }, { key: 'autoSubmit', type: 'bool' }, { key: 'decimals', type: 'number' },
      { key: 'display', type: 'bool' }, { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', 'string', "''", 'v-model — the entry as typed: 12.5, 3+2, 0427'],
      ['operators', "boolean | ('+' | '-' | '*' | '/')[]", 'false', 'The + − × ÷ keys: all four, or a list'],
      ['enter / del', 'boolean', 'true', 'The Enter and ⌫ keys'],
      ['dot / clear / doubleZero', 'boolean', 'false', 'The . , CL and 00 keys'],
      ['functionKeys', '{ id, label, disabled? }[]', '[]', "The screen's own keys; each emits function(id, result)"],
      ['randomise', 'boolean', 'false', 'Shuffle the ten digits (secure random) when the pad appears; the other keys keep their place'],
      ['reshuffle', 'boolean', 'true', 'With randomise: shuffle again after each entry, or keep the layout until the pad appears again'],
      ['mask', 'boolean', 'false', 'Show ● for each digit'],
      ['maxLength', 'number', '—', 'Digits the entry may hold; a longer result is refused'],
      ['autoSubmit', 'boolean', 'false', 'Emit enter by itself once maxLength digits are in'],
      ['decimals', 'number', '2', 'Places a result may carry with dot on — a result needing more is refused, never rounded'],
      ['layout', "'calculator' | 'phone'", "'calculator'", 'calculator: 7-8-9 on top; phone: 1-2-3 on top'],
      ['display', 'boolean', 'true', 'Show the entry above the keys'],
      ['enterLabel / placeholder / label', 'string', "'Enter' / '0' / 'Number pad'", "The Enter key's text, the empty display, the pad's accessible name"],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Key height 44 / 56 / 64px'],
      ['disabled', 'boolean', 'false', 'Every key off, the keyboard ignored'],
    ],
    events: [
      ['update:modelValue', 'string — after each key'],
      ['enter', 'string — the result (an entry without operators as typed, so a PIN keeps its zeros)'],
      ['function', '(id: string, result: string)'],
    ],
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
      ['model', 'MenuItem[]', '[]', '{ label, icon?, hint?, disabled?, href?, items?, can? }, { separator: true }, { header }'],
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
      ['items', 'SpeedDialItem[]', '[]', '{ icon?, label?, tooltip?, disabled?, href?, target?, can? } \u2014 plus anything else, returned on @item-click'],
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
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes, e.g. animate.css. Not bundled — install it yourself. A pair given here replaces the built-in animation. See <a href="#/motion">Motion &amp; transitions</a>'],
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. Written as <code>--animate-duration</code> and <code>animation-duration</code> while that phase runs, then removed'],
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
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. See <a href="#/motion">Motion &amp; transitions</a>'],
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
      ['ripple', 'boolean', '—', 'Ripple the answer buttons, so the ones the alert draws for itself match those the app writes with <code>v-apex-ripple</code>. Unset falls through to the plugin’s <code>ripple</code> option; OFF by default'],
      ['footnote', 'string', '—', 'A note or link under the buttons'],
      ['width / padding / background / radius', 'string', 'tokens', 'The panel'],
      ['maskColor / maskBlur', 'string / boolean', 'tokens', 'The backdrop'],
      ['closable', 'boolean', 'false', 'Adds a close control in the corner'],
      ['dismissableMask', 'boolean', 'true', 'Whether clicking the backdrop dismisses'],
      ['autoClose', 'number', '—', 'Milliseconds. Never counts down over the work — dismissing a progress stage on a timer would abandon an action in flight'],
      ['showTimer', 'boolean', 'false', 'Draws the countdown as a bar'],
      ['transition', "'scale' | 'slide' | 'fade' | 'none'", 'scale', 'A built-in preset, used when no classes are given'],
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
      ['run({ confirm, progress, result, action, interpret })', 'Promise<boolean>', 'Confirms, runs and reports — in one alert that never closes in between'],
      [' progress', 'AlertOptions', 'The working stage. An <code>icon</code> replaces the ring and spins — gears for a save. Buttons are dropped: there is nothing to decide. <code>progressTitle</code> is the shorthand for its title'],
      [' result', 'AlertOptions', 'The reporting stage, UNDERNEATH the outcome — for what the action cannot know: <code>autoClose</code>, <code>showTimer</code>, the button label. Tone, title and message stay the outcome’s'],
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
    id: 'chart', name: 'ApexChart', group: 'Charts', alsoDeclaredIn: 'ChartSeries',
    blurb: 'The chart root \u2014 series, scales, plot rect, layers and the animation clock. Slice 1 is the engine plus the line series: everything shared lives on one root, which is what will later make a combo chart behave as one chart rather than three overlaid, and cross-chart sync a matter of sharing one store. SVG by default for DOM hit testing, CSS-variable theming and real accessibility; a canvas series layer takes over past a density threshold.',
    noField: true, demo: 'chart',
    lead: [':series="series"'],
    tail: '\n/>',
    base: {
      curve: 'linear', tension: 0.5, connectNulls: 'gap', lineStrokeWidth: 2,
      markerSize: 3.5, height: 320, renderer: 'auto', animation: true,
    },
    controls: [
      { key: 'curve', type: 'select', options: ['linear', 'smooth', 'spline', 'step', 'step-before', 'step-after'] },
      { key: 'tension', type: 'number' },
      { key: 'connectNulls', type: 'select', options: ['gap', 'connect', 'zero'] },
      { key: 'stackMode', type: 'select', options: ['none', 'normal', 'percent'] },
      { key: 'markerShape', type: 'select', options: ['circle', 'square', 'triangle', 'cross', 'star', 'diamond'] },
      { key: 'dataLabels', type: 'bool' },
      { key: 'zoom', type: 'bool' }, { key: 'navigator', type: 'bool' },
      { key: 'toolbar', type: 'bool' },
      { key: 'referenceLabelPosition', type: 'select', options: ['end', 'start'] },
      { key: 'orientation', type: 'select', options: ['vertical', 'horizontal'] },
      { key: 'categoryGap', type: 'number' }, { key: 'barGap', type: 'number' },
      { key: 'barThickness', type: 'number' }, { key: 'maxBarThickness', type: 'number' },
      { key: 'minBarLength', type: 'number' },
      { key: 'barMode', type: 'select', options: ['group', 'overlap'] },
      { key: 'overlapRatio', type: 'number' },
      { key: 'borderSkipped', type: 'select', options: ['start', 'end', 'middle'] },
      { key: 'barBorderColor', type: 'color' }, { key: 'barBorderWidth', type: 'number' },
      { key: 'barPadding', type: 'number' }, { key: 'barRadius', type: 'number' },
      { key: 'innerRadius', type: 'number' }, { key: 'outerRadius', type: 'number' },
      { key: 'padAngle', type: 'number' },
      { key: 'centerValue', type: 'text' }, { key: 'centerLabel', type: 'text' },
      { key: 'locale', type: 'text' },
      { key: 'direction', type: 'select', options: ['auto', 'ltr', 'rtl'] },
      { key: 'lineStrokeWidth', type: 'number' }, { key: 'markerSize', type: 'number' },
      { key: 'showMarkers', type: 'bool' },
      { key: 'renderer', type: 'select', options: ['auto', 'svg', 'canvas'] },
      { key: 'pointHitRadius', type: 'number' },
      { key: 'animation', type: 'bool' }, { key: 'animationDuration', type: 'number' },
      { key: 'entrance', type: 'select', options: ['auto', 'draw', 'sweep', 'scale', 'grow', 'none'] },
      { key: 'pointBorderColor', type: 'color' }, { key: 'pointBorderStrokeWidth', type: 'number' },
      { key: 'entranceDirection', type: 'select', options: ['cw', 'ccw'] },
      { key: 'entranceDuration', type: 'number' },
      { key: 'dataTable', type: 'bool' },
      { key: 'title', type: 'text' }, { key: 'caption', type: 'text' },
    ],
    props: [
      ['series', 'ChartSeries[]', '[]', '{ id, name, data, xKey, yKey, color?, fillOpacity?, lineStrokeWidth?, lineDash?, showMarkers?, axis?, hidden? }. xKey and yKey are property names or accessor functions, so app data is never reshaped to suit the chart. A series array rather than compound children makes a combo chart the default case rather than a mode'],
      ['xAxis / yAxis / y2Axis', 'AxisSpec', '{}', "{ type: 'linear' | 'log' | 'time' | 'category', label, min, max, nice, includeZero, padding, tickCount, format, grid, line, ticks, rotate }. includeZero defaults false for lines \u2014 forcing zero flattens the shape a line chart exists to show \u2014 and true when any series has a fill, where the fill implies magnitude from a baseline"],
      ['title / caption', 'string', '\u2014', 'Both reduce the plot rect rather than floating over it'],
      ['legend', 'object', '{}', "{ show, position: 'top' | 'bottom', align, interactive }. Click an entry to hide that series"],
      ['tooltip', 'object', '{}', "{ show, mode: 'nearest' | 'shared-x' | 'series', snap: 'x' | 'y' | 'band' | 'xy' | 'none', crosshair, format }. A point chart defaults to nearest / 'xy', because picking by horizontal distance alone makes two points at the same x and far apart in y indistinguishable. A bar chart defaults to 'band' \u2014 the category the pointer is INSIDE, which is the only correct answer for bars, since at a band edge the nearest centre belongs to the neighbour. A turned chart snaps on 'y', because \u201csame x\u201d means \u201csame category\u201d. One hit-testing service feeds tooltip, crosshair and hover together \u2014 per-series hit logic is the reliable way to get a combo chart that snaps inconsistently between its layers"],
      ['series.type', "'line' | 'bar' | 'scatter' | 'bubble' | 'pie' | 'gauge' | 'radar' | 'polar' | 'heatmap' | 'candlestick' | 'treemap'", "'line'", 'Every type shares one root, one hit-testing service and one animation clock, which is what makes a combo chart behave as one chart rather than three overlaid \u2014 and why combo is the default case here rather than a mode'],
      ['heatmap: groupKey / colorStops / cellRadius / cellGap / showCellLabels', 'string | fn / string[] / number', '\u2014', 'xKey gives the columns, groupKey the rows, yKey the value. Columns and rows come from the data in first-seen order rather than sorted, because a heatmap\u2019s axes are usually meaningful sequences \u2014 hours, weekdays, stages \u2014 and sorting them destroys the order the reader came for. Without colorStops, intensity is opacity on a token colour: parsing oklch out of a custom property to interpolate a hue would tie the heatmap to a colour format and break theming'],
      ['candlestick: openKey / highKey / lowKey / closeKey / candleVariant / upColor / downColor', 'string | fn / string', "\u2014 / 'candle'", "candle, hollow or ohlc. Direction colours a candle rather than the palette \u2014 the reader is looking for up or down, and a palette hue would say nothing. A doji keeps a one-pixel body rather than vanishing, since \u201cno change\u201d is information, and the wick is part of the domain so highs and lows are never clipped. y resolves to the close, so hit testing, the shared crosshair and the tooltip all work without knowing the series is a candlestick"],
      ['treemap: nodes / depth / tilePadding', 'unknown[] / number / number', '\u2014 / 1 / 2', 'Squarified rather than sliced, because aspect ratio is what makes a tile comparable: a long thin sliver of equal area reads as smaller, so a layout ignoring it misreports its own data. Tiles with children are clickable to drill in, with a breadcrumb back out; depth above 1 nests inline instead'],
      ['innerRadius', 'number', '0', 'Fraction of the outer radius left hollow \u2014 0 is a pie, 0.6 a donut. A fraction rather than pixels, so a chart stays a donut at any size. Several pie series become concentric rings rather than overlays'],
      ['padAngle / startAngle / endAngle', 'number', '0 / 0 / 2\u03c0', 'Angles run from twelve o\u2019clock, clockwise \u2014 the way people read a dial. Mathematical convention would put every caller\u2019s startAngle at \u2212\u03c0/2. A partial sweep makes a gauge, and a shallow one is centred on the arc it occupies rather than on the box'],
      ['series.min / max', 'number', '0 / 100', 'Gauge bounds'],
      ['outerRadius', 'number', '1', 'Fraction of the fitted radius the ring occupies. Below 1 it leaves room for external labels \u2014 which is why the two arrived together: labels outside a ring sized to fill the box would run off the edge'],
      ['dataLabels.position', "'inside' | 'outside'", "'inside'", "Radial only. 'outside' places labels beyond the rim with leader lines. Labels cluster wherever slices are thin, so they are split by side, sorted, and pushed apart \u2014 DISPLACED rather than culled, because on a pie the collisions ARE the small slices and those are the ones most needing a label. The anchor stays on the slice\u2019s own rim and only the text end moves, so the connector always originates at the correct slice however far the text travels"],
      ['dataLabels.display', "'value' | 'percentage' | 'both' | 'label' | 'label-percentage'", "'percentage'", ''],
      ['dataLabels.labelKey', 'string', '\u2014', "Which property names a point for display 'label'. A numeric x axis has no category to fall back on, so without it the label would silently be the x value \u2014 which is already on the axis"],
      ['dataLabels.minPercentage', 'number', '0', 'The honest cull: a slice under this share carries no label at all, because displacing one would put its text a long way from the wedge it describes'],
      ['dataLabels.lineStyle', "'angled' | 'straight'", "'angled'", "Angled levels the elbow with the displaced text, so the connector reaches it; straight keeps the radial elbow, which is cleaner when nothing needed displacing"],
      ['radarRings', 'number', '4', 'Rings behind a radar. Polygons, not circles: a value is read along a spoke, and a circular ring crosses the spokes where there is nothing to read'],
      ['centerLabel / centerValue', 'string', '\u2014', 'Text in the middle of a donut or gauge'],
      ['orientation', "'vertical' | 'horizontal'", "'vertical'", 'Swaps the axes: categories run down the left and values across. A chart-level choice rather than per series, because two series cannot share a category axis pointing in different directions. Gridlines follow the value axis, since a gridline exists to read a value against'],
      ['categoryGap / barGap', 'number', '0.28 / 0.1', 'Space between CATEGORIES and space between bars WITHIN a group. Two knobs rather than one, because conflating them means you cannot tighten a group without also opening the categories. barPadding remains as an alias for categoryGap'],
      ['barThickness / maxBarThickness', 'number', '\u2014', 'Fixed width in pixels, and a cap on the computed width so a wide chart with three categories does not draw slabs'],
      ['minBarLength', 'number', '\u2014 (off)', 'Floor in pixels so a tiny value stays visible. Off by default: it helps reading and mildly hurts measuring, so it is a choice rather than a default. The floor grows AWAY from the baseline, so a tiny negative bar still hangs below zero'],
      ['barMode / overlapRatio', "'group' | 'overlap' / number", "'group' / 0.6", 'Overlap gives every series the full band at a decreasing width, painted back to front \u2014 a target reads behind an actual without the two sitting side by side. Group divides the band between STACK groups, which is why a grouped-stacked layout needs no extra concept: two stack ids give two side-by-side stacks'],
      ['series.color (per bar)', 'string | string[] | (ctx) => string | undefined', 'palette', 'An array cycles by index; a callback receives { point, index, value, category, negative, series } and returning undefined falls through to the series colour \u2014 the same contract as segmentColor, so conditional paint has one rule across the library'],
      ['barRadius', 'number | { tl, tr, br, bl }', '3', 'A number rounds the VALUE END only, because a bar rounded at the axis reads as floating above it. An object addresses visual corners directly. Under horizontal orientation the value end is remapped from an explicit table rather than computed, since a turned chart rounding the wrong edge is precisely what arithmetic would hide'],
      ['barBorderColor / barBorderWidth / barBorderDash', 'string / number / string | number[]', '\u2014 / 1', 'Strokes each bar'],
      ['borderSkipped', "'start' | 'end' | 'middle' | false", "'start'", 'Which edge omits the stroke. start is the baseline, so a bar reads as continuous with the axis. The stroke is a separate open path from the fill, since a closed path cannot express a missing edge'],
      ['barPadding / barRadius', 'number', '0.28 / 3', 'Fraction of each band left empty, and the corner radius on the value end only \u2014 a bar rounded at the axis reads as floating above it. A band is divided between STACK GROUPS rather than series, since stacked bars occupy the same ground by definition'],
      ['series.waterfall / totalKey', 'boolean / string', 'false / \u2014', 'Each bar starts where the previous ended. A row flagged by totalKey resets to the baseline, which is what makes it a subtotal rather than another step'],
      ['series.renderBar', '(ctx) => string', '\u2014', 'Replaces the bar shape; receives { x, y, width, height, point, series, index } and returns a path'],
      ['series.color (per point)', 'string | string[] | (ctx) => string | undefined', 'palette', 'Same contract as bars and line segments \u2014 an array cycles by index, a callback receives { point, index, value, category, series }, and undefined falls through to the series colour. One rule for conditional paint across every family'],
      ['pointBorderColor / pointBorderStrokeWidth', 'string / number', 'series colour / 1.25', 'Per series or chart-wide. A white border is what separates overlapping points, and it was previously unreachable because the stroke was hard-coded to the series colour'],
      ['series.color as radial gradient', "{ type: 'radial', stops }", '\u2014', 'Centred on each point and sized to it. A plot-wide linear gradient gives thirty bubbles a flat slice of the ramp each, which reads as noise rather than depth. Emitted as ONE def per series using objectBoundingBox, so it serves every point at its own radius rather than needing a def per point'],
      ['series.renderMarker', '(ctx) => string', '\u2014', 'Replaces the marker shape; receives { r, point, index, series, color } and returns a path drawn AT ORIGIN, because the chart keeps the translation \u2014 the same division as renderBar: chart owns geometry, caller owns shape'],
      ['series.rKey / minSize / maxSize', 'string | fn / number / number', '\u2014 / 4 / 22', 'Bubble radius. AREA is scaled, not radius \u2014 the eye reads a circle by its area, so mapping value to radius exaggerates large values by their square'],
      ['stackMode', "'none' | 'normal' | 'percent'", "'none'", 'Stacks series sharing a stack id. Computed across the series list rather than per series, because stacking is a relationship between series \u2014 which is also why the same code will serve stacked bars unchanged. Negatives stack downward from zero'],
      ['series.y0Key', 'string | fn', '\u2014', 'Lower edge of the band. A range area, a confidence interval and a stacked slice are the same primitive \u2014 a fill between two values \u2014 so one field serves all three and a fill to zero is just the case where every lower edge is the baseline'],
      ['series.color', 'string | ChartGradient', 'palette', 'A CSS colour, or { x1, y1, x2, y2, stops } in normalized plot coordinates. A gradient gets two defs, not one: along a stroke it reads as progression through time, under a fill as fading toward the baseline, so the default directions differ'],
      ['series.borderColor / borderStrokeWidth / borderDash / borderCap', 'string / number / string / string', '\u2014', 'A halo painted behind the line and wider than it, which keeps a series legible where it crosses area fills or other series'],
      ['series.segmentColor / segmentStrokeWidth / segmentDash / segmentFillColor', 'value | (ctx) => value | undefined', '\u2014', 'Per-segment styling. The callback receives { p0, p1, index, series }, and returning undefined falls back to the series default so only what you mean to override is. Tangents are computed from the whole run before it is cut into pieces, so a styled segment keeps the curve rather than being a straight line'],
      ['series.lineDashOffset / lineCap / lineJoin', 'number / string / string', '\u2014', ''],
      ['series.curve / tension', 'string / number', 'chart value', 'Per-series override'],
      ['markerShape / series.markerShape', "'circle' | 'square' | 'triangle' | 'cross' | 'star' | 'diamond'", "'circle'", 'With series.pointRotation to turn the shape'],
      ['dataLabels.placement', "'outside-end' | 'inside-end' | 'inside-center' | 'inside-base'", "'outside-end'", 'Bars only. Outside-end never covers the data, which is why it is the default; dense charts want inside-end. A stacked segment has nowhere outside itself to put a label, so a stacked series defaults to inside-center rather than inheriting. Placement is derived from the DRAWN RECT, so a floor-adjusted or stacked bar labels its actual geometry, and it accounts for orientation and sign together \u2014 an outside-end label on a negative bar goes past the baseline the other way. Inside labels stay legible by separating the glyph from its background rather than by guessing a contrasting colour, which is not derivable from an arbitrary token'],
      ['dataLabels', 'boolean | object', 'false', '{ show, format, offset, collision, sparse, placement }. Collisions are culled rather than overlapped \u2014 telling the caller to "label sparsely" puts the burden on them for something the component can see, and an unreadable label is worse than a missing one. Endpoints and local extremes survive first; sparse keeps only those'],
      ['hover', 'object', '{}', '{ brightness, dimOpacity, radiusMultiplier, color, borderColor, borderWidth }. One object rather than nine top-level props with overlapping names'],
      ['curve', "'linear' | 'smooth' | 'spline' | 'step' | 'step-before' | 'step-after'", "'linear'", 'smooth is monotone cubic, which never overshoots, so it cannot invent a peak that is not in the data; spline is Catmull-Rom with a tension knob for a looser curve'],
      ['connectNulls', "'gap' | 'connect' | 'zero' | boolean", "'gap'", 'A null breaks the line by default, because real data has holes and a chart that silently interpolates across them lies. zero is only honest when zero is a real value rather than missing data'],
      ['showMarkers / markerSize', 'boolean / number', 'auto / 3.5', 'Markers appear automatically at 40 points or fewer \u2014 500 markers in 600px is noise'],
      ['lineStrokeWidth / markerSize / markerShape', 'number / number / string', '2 / 3.5 / circle', 'Chart-level defaults for every line series; each series may override its own'],
      ['pointHitRadius', 'number', '12', 'Hit area, independent of drawn size, so a 2px marker is still hoverable'],
      ['renderer', "'svg' | 'canvas' | 'auto'", "'auto'", 'A prop rather than a separate root component, so the choice stays data-driven. Both renderers draw the same computed geometry \u2014 one source of truth for the shape'],
      ['decimation / decimationThreshold', 'boolean | number / number', 'true / 2000', 'LTTB downsampling, which preserves visual shape including spikes where stride sampling and averaging destroy it. Runs before the renderer choice, which is why most large datasets never need canvas. Hit testing always uses full-resolution points, so the tooltip never reports a neighbour'],
      ['entrance', "'auto' | 'draw' | 'sweep' | 'scale' | 'grow' | 'none'", "'auto'", "'draw' sweeps a reveal along the category axis so the series looks drawn; 'grow' interpolates up from the baseline; 'auto' draws when every series is a line and grows otherwise, since a sweep says nothing about a pie. It is a REVEAL rather than a value interpolation \u2014 a drawn line has to show its real shape as it appears, where interpolating toward it would move the whole curve, which is a different gesture. Implemented as one clip sweeping the plot, so the fill, markers and labels are uncovered with the line, no per-path length has to be measured, and the canvas layer applies the same rectangle"],
      ['entranceDuration', 'number', '900', ''],
      ['entrance \u2014 points', "'scale'", 'per family', 'Scatter and bubble scale in place from zero radius. Lifting a point from the baseline reads as the data moving rather than the chart arriving'],
      ['entrance \u2014 radial', "'sweep'", 'per family', "A clockwise reveal for pie, donut, gauge and rose: slices are CLAMPED to a moving cursor rather than covered by a rotating clip, so nothing exists ahead of it and an unrevealed slice cannot be hovered \u2014 a clip would leave every slice full-size and invisible-but-hoverable. A gauge FILLS from its start angle rather than appearing full-length and shrinking. Radar keeps 'grow', because an angular cursor across a polygon distorts the shape as it crosses \u2014 triangle to quadrilateral \u2014 which reads as the data changing rather than the chart arriving. The sweep eases LINEARLY, since easeOutCubic over 360\u00b0 spends most of its time crawling through the last few degrees, and its duration scales with the angle actually swept so a 90\u00b0 gauge is not as slow as a full pie"],
      ['entranceDirection', "'cw' | 'ccw'", "'cw'", 'Free, since our angles already run clockwise from twelve o\u2019clock. The clamp works in progress along the ring rather than in angles, so ccw is the same arithmetic read the other way round rather than a second code path'],
      ['entranceOnVisible', 'boolean', 'true', 'Plays when the chart is actually on screen, and only once \u2014 a chart three screens down that finished animating before it was scrolled to has not been seen to animate. Honours prefers-reduced-motion by revealing instantly'],
      ['animation / animationDuration', 'boolean / number', 'true / 620', 'Interpolation between datasets, matched per point key \u2014 so a removed point collapses and a new one grows. Entrance is the same code from a synthetic baseline frame, which is why no separate entrance animation exists'],
      ['zoom', 'boolean | object', 'false', '{ wheel, drag, pan, touch }. Wheel zooms about the cursor rather than the centre \u2014 the value under the pointer is the one you are interested in, so it stays put. Drag rubber-bands a range; shift-drag or two-finger drag pans; pinch zooms. A drag under a few pixels is treated as a click, or a stray click would zoom to nothing and trap the reader'],
      ['zoom.mode', "'x' | 'y' | 'xy'", "'xy' for points, 'x' otherwise", 'Which axes a drag selects. A scatter cluster is two-dimensional, so narrowing x alone gives a vertical slab containing everything rather than isolating the group \u2014 which is why a point chart defaults to 2D. The marquee spans the full plot on any axis the mode does not select, so it shows exactly what will be kept'],
      ['zoomRange', '[number, number] | { x, y? } | null', 'null', 'v-model:zoomRange \u2014 the visible window. An [lo, hi] pair still means x only, so callers written before two-axis zoom keep working; the emitted payload is always { x, y? }. One object rather than a second zoomRangeY prop, which would split one concept across two props that must be kept consistent. A y window overrides the derived y domain outright, and points outside it are CLIPPED rather than filtered out \u2014 dropping them would silently reduce the rendered count, which looks exactly like a working zoom. Zooming re-decimates within the window, which is what makes zooming into a large series reveal detail rather than magnify an approximation, and the y domain follows the window so a zoomed line does not sit in a domain sized by data off screen'],
      ['navigator', 'boolean | object', 'false', '{ height, series, curve } \u2014 a mini overview with a draggable window. For a point chart it draws mini points and the handle becomes a RECT that pans both axes, because a horizontal strip can only express one axis and would misreport a 2D view. Draws mini bars when the series is a bar type, since an area overview under a bar chart misrepresents what you are panning across. It always draws the full extent, that being its whole job, so it gets its own scales rather than the zoomed ones. Drag the window to pan, its edges to resize'],
      ['referenceLines', 'ChartReferenceLine[]', '[]', "{ axis: 'x' | 'y', value, label, color, dash, width }. A value may be a category name rather than an index, so a line on \u201cMar\u201d follows Mar wherever it moves to. Labels sit at the far end of the line, out of the data\u2019s way"],
      ['referenceBands', 'ChartReferenceBand[]', '[]', "{ axis, from, to, label, color, opacity }. Bands paint under the gridlines and lines over them \u2014 a band is background, a threshold line is a statement about the data"],
      ['toolbar', "boolean | { items }", 'false', "A download menu on the chart \u2014 png, svg, csv, reset-zoom. Off by default, because it is the first piece of APPLICATION chrome inside a chart and a dashboard tile rarely wants it. It calls the same export methods the ref exposes rather than duplicating them, and reset-zoom is dropped when zoom is off rather than shown disabled: a menu of things that cannot happen is worse than a shorter menu"],
      ['referenceLabelPosition / line.labelPosition', "'start' | 'end'", "'end'", "Which end a reference label sits at. 'end' keeps it out of rising data; 'start' reads as a named threshold you scan down to. Neither is universally right, so it is a choice rather than a default we hide"],
      ['plugins', 'ChartPlugin[]', '[]', '{ name, below?, above?, onHover? }. A plugin returns overlay primitives rather than drawing: direct drawing would mean one implementation per renderer and a plugin that only works in SVG, where a declarative vocabulary paints identically through both and stays inspectable in the DOM. Ships with watermarkPlugin, trendlinePlugin, statsPlugin and thresholdPlugin'],
      ['locale', 'string', 'browser default', 'BCP 47 tag for every number and date the chart formats. Passed explicitly rather than read from the document, so a chart can be formatted for its data\u2019s locale \u2014 a euro revenue chart on an English page is a real case'],
      ['direction', "'ltr' | 'rtl' | 'auto'", "'auto'", 'auto reads the rendered element\u2019s computed direction, so a chart inside a [dir=rtl] subtree follows it without being told. RTL reverses the category axis and swaps the margins so the value axis moves to the right edge \u2014 rather than mirroring the chart with a transform, which would reverse the text too'],
      ['responsive', '{ maxWidth, \u2026overrides }[]', '[]', 'Width-keyed overrides, narrowest match winning. Keyed on the chart\u2019s own measured width rather than a media query, because a query measures the viewport and says nothing about how much room this chart was given \u2014 which is the reason a legend keeps overflowing a narrow column on a wide screen'],
      ['height', 'string | number', '320', ''],
      ['dataTable / ariaLabel', 'boolean / string', 'false / auto', 'A screen-reader table of the plotted values, and the summary announced for the chart'],
    ],
    events: [
      ['point-click', '{ series, point, originalEvent }'],
      ['hover-change', 'HitResult | null \u2014 { x, entries: [{ series, point, px, py }] }'],
      ['legend-toggle', '{ series, hidden }'],
      ['update:zoomRange / zoom-change', '[number, number] | null / { range, full }'],
    ],
    slots: [
      ['legend', 'Replaces the legend entries; receives { series, colors, hidden, toggle }. The default rendering is unchanged, so this is for stat pills, grouped legends and the like rather than a variant to configure'],
      ['tooltip', 'Replaces the tooltip rows; receives { entries, category, rows, hit }. A computed total or a delta against a threshold cannot come out of a value formatter, which is why this is a slot and format stays for the simple case'],
      ['annotation', 'Custom SVG over the plot; receives { plot, scales, x, y } where x and y map data values to pixels \u2014 so content is placed in data coordinates rather than pixels the caller has to guess at'],
    ],
    serviceTitle: 'Compound parts, engine and export',
    serviceRows: [
      ['ApexChartSeries, ApexChartXAxis, ApexChartYAxis, ApexChartY2Axis', 'compound', 'Markup-first authoring. Every part is renderless \u2014 it registers configuration and draws nothing \u2014 so the markup form and the props form arrive at exactly the same inputs. One engine, two ways of writing the same chart, rather than a second implementation behind a nicer surface'],
      ['ApexChartLegend, ApexChartTooltip, ApexChartHover, ApexChartDataLabels, ApexChartZoom, ApexChartNavigator, ApexChartTitle, ApexChartCaption', 'compound', 'The option objects, as elements. A declared part wins over the equivalent prop, being the more specific declaration'],
      ['ApexChartReferenceLine, ApexChartReferenceBand', 'compound', 'Declared in order; declaring any replaces the prop array rather than adding to it'],
      ['series order', 'declaration order', 'Vue mounts children in order and a Map preserves insertion, so paint order and legend order follow the markup. Series are all-or-nothing between the two forms \u2014 mixing them would make paint order ambiguous'],
      ['createScale / numberTicks / timeTicks', 'exported', 'A tick generator per scale type rather than one generic algorithm: nice ticks for numbers want powers of ten, for time they want calendar boundaries that are not uniform in length'],
      ['computeLayout', 'exported', 'Label widths decide the plot rect and the rect decides rotation and culling \u2014 measured with a real text measurement, not a character-count guess'],
      ['lttb / findHit / applyFrame', 'exported', 'Decimation, hit testing and dataset interpolation, reusable outside the component'],
      ['seriesColor', 'exported', 'One palette from tokens (--apex-cht-series-1\u20268), never a per-chart colour array, so a hundred charts restyle at once and dark mode is free'],
      ['keyboard', 'arrows, Home, End, Esc', 'Moves the read-out point by point with a live announcement \u2014 built in from the first slice, because retrofitting accessibility into a chart is miserable'],
      ['exportSvg()', 'string', 'Serializes what is rendered, resolving custom properties to literal colours \u2014 a standalone file has no design system to look them up in, so an export keeping var(--apex-cht-series-1) would come out black'],
      ['exportImage({ scale, type, background, quality })', 'Promise<Blob>', 'Rasterises that SVG through an image, so the PNG is what renders. JPEG gets an opaque backdrop, since it has no alpha'],
      ['exportCsv() / exportRows()', 'string / object[]', 'One row per category, one column per series. Every CSV field is wrapped and quotes doubled \u2014 a series named \u201cRevenue, net\u201d is ordinary and would otherwise gain a column'],
      ['zoomTo(range) / resetZoom() / zoomRange()', 'ref methods', 'Programmatic window, so a toolbar or a URL can drive it'],
      ['ApexChartGroup syncY', 'boolean', 'false', 'Shares the y window as well as x. Off by default because two charts in a group usually plot different quantities \u2014 sessions above errors \u2014 and forcing one y window onto both would zoom a range that means nothing on the other. When off, a 2D zoom on one chart still pans the group in x rather than being refused outright'],
      ['ApexChartGroup', 'wrapper', 'Coordinates independent charts through one provided store rather than events between siblings \u2014 a chart added later joins automatically and declaration order does not matter. { zoom, crosshair, legend } choose which channels are shared, and a channel is opted out by making its setter a no-op so the charts stay unaware of what the group shares'],
      ['geometry()', 'ref method', 'Plot rect and scales, for your own overlays'],
      ['CSS variables', '--apex-cht-series-1\u20268, --apex-cht-grid, --apex-cht-axis, --apex-cht-tick', 'Structural styles, theme variables and state hooks are separate layers: restyling means overriding variables, not selectors'],
      ['state attributes', 'data-family, data-orientation, data-dir, data-zoomed, data-renderer, data-hovered, data-decimated', 'Stable hooks on the root for theming and tests \u2014 so a stylesheet or an assertion never has to inspect internals to know what the chart is doing'],
      ['element classes', '.apex-cht__line, __area, __bar, __candle, __slice, __cell, __tile, __tick, __grid, __tip, __legend', 'Named parts, each doing one job'],
    ],
    },
  {
    id: 'taskboard', name: 'ApexTaskBoard', group: 'Board',
    blurb: 'A kanban board over data the application owns. Nothing here mutates items \u2014 every interaction emits a payload describing the change, so optimistic update, rollback, undo and multi-user sync stay in the app where they belong. Items are a flat array rather than nested column arrays, which is what makes a move one field on one object instead of two splices and a rebuild of both columns, and leaves filtering and sorting to the app with no restructuring on the way in.',
    noField: true, demo: 'board',
    lead: [':items="items"', ':columns="columns"', ':swimlanes="swimlanes"'],
    tail: '\n  @card-move="onMove"\n/>',
    base: { selectionMode: 'multiple', wipMode: 'warn', density: 'normal', columnWidth: '260px', showCounts: true },
    controls: [
      { key: 'selectionMode', type: 'select', options: ['none', 'single', 'multiple'] },
      { key: 'wipMode', type: 'select', options: ['warn', 'block'] },
      { key: 'density', type: 'select', options: ['compact', 'normal', 'roomy'] },
      { key: 'draggable', type: 'bool' }, { key: 'reorderableColumns', type: 'bool' },
      { key: 'showCounts', type: 'bool' },
      { key: 'showAddCard', type: 'bool' }, { key: 'collapsibleColumns', type: 'bool' },
      { key: 'columnWidth', type: 'text' }, { key: 'laneWidth', type: 'text' },
      { key: 'gap', type: 'text' }, { key: 'height', type: 'text' },
      { key: 'cardRadius', type: 'text' },
      { key: 'accent', type: 'color' }, { key: 'columnBackground', type: 'color' },
      { key: 'cardBackground', type: 'color' },
    ],
    props: [
      ['items', 'TaskBoardItem[]', '[]', '{ id, columnId, swimlaneId?, order?, \u2026your own fields }. Never mutated \u2014 the board reads it and emits moves'],
      ['columns', 'TaskBoardColumn[]', '[]', '{ id, title, limit?, collapsed?, locked?, accent?, allowedTo? }. allowedTo restricts where cards may go from that column; locked keeps them in it'],
      ['swimlanes', 'TaskBoardSwimlane[]', '\u2014', '{ id, title, icon?, collapsed? }. Omit for a plain column board; the column model is identical either way'],
      ['columnGroups', 'TaskBoardColumnGroup[]', '\u2014', '{ id, title, columnIds, accent? } \u2014 phase headers above the columns. Each header spans exactly its own columns, and an ungrouped column keeps a track of its own'],
      ['column.pinned', "'start' | 'end'", '\u2014', 'Sticks that column to an edge while the rest scrolls under it. The inset is resolved from the tracks before it, since sticky cannot measure them itself'],
      ['reorderableColumns', 'boolean', 'false', 'Drag a header to reorder. Only reports \u2014 emits column-reorder and leaves the columns array to the app, like every other change'],
      ['permissions', 'TaskBoardPermissions', '\u2014', 'Access rules, all optional and permitted by default: hiddenColumns, canDrag(item), canDrop({ item, columnId, swimlaneId }), canCreate({ columnId, swimlaneId }), canEdit(item), canDelete(item), canReorderColumns. Functions rather than flags, because a real permission depends on the row \u2014 this user\u2019s own cards, an archived column \u2014 which a boolean per board could never express'],
      ['confirmMove', '(payload) => boolean | Promise<boolean>', '\u2014', 'Asked before a move is emitted; false abandons it. Async, so a confirmation dialog or a server check can answer \u2014 which a synchronous guard could not. Drags and keyboard moves both go through it'],
      ['cardFields', 'TaskCardFields', 'sensible names', 'Which item property feeds each part of the default card \u2014 title, labels, priority, assignees, checklist, due, description, plus meta chips. A mapping rather than a fixed shape, so any dataset renders without a custom card'],
      ['draggable', 'boolean', 'true', 'Pointer-based, so multi-card drag, a real preview, edge auto-scroll and touch all work \u2014 none of which HTML5 drag-and-drop gives'],
      ['selectionMode', "'none' | 'single' | 'multiple'", "'single'", 'Multiple allows ctrl or cmd click, and dragging a selected card drags the whole selection'],
      ['wipMode', "'warn' | 'block'", "'warn'", 'Over a column\u2019s limit: flag it, or refuse the drop and emit wip-blocked'],
      ['showCounts / showAddCard / collapsibleColumns', 'boolean', 'true', ''],
      ['virtualScroll', 'boolean', 'false', 'Renders only the cards near each cell\u2019s viewport, windowed per cell so columns scroll independently. The cells take over the vertical axis and the board keeps the horizontal one \u2014 which makes it a column-board feature: with swimlanes the lanes need the board\u2019s own vertical scroll, so it is ignored'],
      ['virtualScrollItemHeight / virtualScrollBuffer', 'number', '96 / 4', 'A starting estimate, replaced by a real measurement as soon as one card renders \u2014 a guess wrong by a third leaves blank gaps or wasted DOM. Cards of wildly variable height make the estimate less useful, so keep heights stable within a board'],
      ['columnWidth / laneWidth / gap / height / density', 'string', "'280px' / '160px' / '14px' / auto / 'normal'", 'A collapsed column narrows to a rail'],
      ['background / columnBackground / cardBackground / cardRadius / accent', 'string', 'tokens', 'A column\u2019s own accent overrides the board\u2019s'],
    ],
    events: [
      ['card-move', '{ items, from: { columnId, swimlaneId, index }, to: { \u2026 } } \u2014 one payload for drags and keyboard moves alike, so persistence never learns which it was'],
      ['card-click / card-activate / card-contextmenu', '{ item, originalEvent } \u2014 activate covers double-click and Enter'],
      ['selection-change', '{ items }'],
      ['add-card', '{ columnId, swimlaneId }'],
      ['column-collapse', '{ columnId, collapsed }'],
      ['wip-blocked', '{ columnId } \u2014 a drop refused by a limit'],
      ['column-reorder', '{ columnId, fromIndex, toIndex } \u2014 a header was dragged'],
    ],
    slots: [
      ['card', 'Replaces the card contents; receives { item, selected, canEdit, canDelete, canDrag } \u2014 so your card and menu read the same rules the board does. Drag, selection, focus and movement stay with the board'],
      ['drag-preview', '{ items, count } \u2014 replaces the preview\u2019s contents. Its positioning stays with the board, since a consumer cannot know the pointer offset the drag began from'],
      ['column-header', '{ column, count, over }'],
      ['column-footer', '{ column }'],
      ['swimlane-header', '{ swimlane, count }'],
      ['empty', '{ column, swimlane }'],
    ],
    serviceTitle: 'Data, history and rules',
    serviceRows: [
      ['items', 'Ref<TaskBoardItem[]>', 'Bind straight to the board'],
      ['move(payload)', 'void', 'Applies a card-move payload, renumbering both affected cells'],
      ['add / update / remove', 'void', 'The usual mutations, each pushed onto the history'],
      ['undo() / redo(), canUndo / canRedo', 'void / boolean', 'A stack of the payloads the board already emits. History lives here rather than in the component, which would fight an app that has its own'],
      ['applyMove(items, payload)', 'TaskBoardItem[]', 'The same index arithmetic, exported for your own store'],
      ['getState() / setState(state)', 'ref methods', 'Collapse, lane closure, selection and scroll offsets \u2014 and deliberately no rendered geometry or measured heights, which belong to this session\u2019s DOM and restore into a different viewport as a board scrolled somewhere that no longer exists'],
      ['exportJson() / exportCsv() / exportRows()', 'ref methods', 'What the board is showing, with column and lane ids resolved to titles. Returns strings rather than downloading \u2014 the file, its name and where it goes are the app\u2019s'],
      ['print', 'CSS', 'Printing unrolls the columns into a wrapping grid, drops the cells\u2019 fixed heights and hides the controls, so a board prints as a document rather than a photograph of a scroller'],
      ['hidden columns', 'removed', 'A column in hiddenColumns is not rendered at all \u2014 an emptied column with a count of zero still advertises that it exists'],
      ['canDelete', 'passthrough', 'The board never deletes; the rule is handed to your card and menu so there is one source of truth'],
      ['keyboard \u2014 moving', 'Ctrl/Cmd + arrows', 'Left and right move columns, up and down reorder, with Shift for swimlanes \u2014 a drag-only board is unusable without a mouse'],
      ['keyboard \u2014 reading', 'plain arrows', 'Roves focus to the nearest card in that direction, so reading the board never moves anything'],
      ['keyboard \u2014 selecting', 'Ctrl/Cmd+A, Escape', 'Selects the focused card\u2019s column, or clears'],
      ['shift-click', 'range', "Extends within the anchor's own cell: a board has no single sequence, so a range across columns would take in cards the user cannot see between"],
      ['clearSelection() / selectAll(columnId, swimlaneId?)', 'ref methods', 'Drive selection from a toolbar'],
    ],
  },
  {
    id: 'gallery', name: 'ApexGallery', group: 'Media',
    blurb: 'An image viewer with zoom, rotate, flip, download and a thumbnail strip. The transforms compose into one CSS transform on the stage image rather than nesting wrappers, so zoom, rotation and both flips can hold at once and every combination stays predictable. Panning turns on only once the image outgrows its frame \u2014 dragging an image that already fits reads as a broken control.',
    noField: true, demo: 'media',
    lead: [':images="images"', 'v-model="index"'],
    tail: '\n/>',
    base: { showNav: true, showThumbnails: true, thumbnailsPosition: 'bottom', toolbarPosition: 'top' },
    controls: [
      { key: 'showNav', type: 'bool' }, { key: 'hoverNav', type: 'bool' },
      { key: 'showThumbnails', type: 'bool' },
      { key: 'thumbnailsPosition', type: 'select', options: ['bottom', 'top'] },
      { key: 'hoverToolbar', type: 'bool' },
      { key: 'rotateLeft', type: 'bool' }, { key: 'rotateRight', type: 'bool' },
      { key: 'zoomIn', type: 'bool' }, { key: 'zoomOut', type: 'bool' },
      { key: 'zoomReset', type: 'bool' },
      { key: 'flipHorizontal', type: 'bool' }, { key: 'flipVertical', type: 'bool' },
      { key: 'downloadable', type: 'bool' }, { key: 'fullscreen', type: 'bool' },
      { key: 'closable', type: 'bool' },
      { key: 'toolbarPosition', type: 'select', options: ['top', 'bottom'] },
      { key: 'showCounter', type: 'bool' }, { key: 'loop', type: 'bool' },
      { key: 'aspectRatio', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'stageBackground', type: 'color' },
      { key: 'toolbarBackground', type: 'color' }, { key: 'toolbarColor', type: 'color' },
      { key: 'toolbarRadius', type: 'text' },
      { key: 'navBackground', type: 'color' }, { key: 'navColor', type: 'color' },
      { key: 'navSize', type: 'text' }, { key: 'navRadius', type: 'text' },
      { key: 'thumbSize', type: 'text' }, { key: 'thumbGap', type: 'text' },
      { key: 'thumbRadius', type: 'text' }, { key: 'thumbActiveColor', type: 'color' },
      { key: 'zoomStep', type: 'number' }, { key: 'maxZoom', type: 'number' },
    ],
    props: [
      ['images', 'GalleryImage[]', '[]', '{ src, thumbnail, alt, caption, filename } \u2014 or background for a placeholder standing in for artwork. Download fetches the bytes and saves a blob so a cross-origin URL still saves rather than navigating, falling back to opening the image when the server refuses; the button disables itself for an image with no src'],
      ['modelValue', 'number', '0', 'v-model \u2014 the active index'],
      ['open / overlay', 'boolean', 'false', 'overlay renders a full-screen viewer driven by v-model:open \u2014 the lightbox case'],
      ['actions', 'GalleryAction[]', 'rotate, zoom, flip, download, fullscreen', "Which toolbar buttons appear, in this order: 'rotate-left', 'rotate-right', 'zoom-in', 'zoom-out', 'zoom-reset', 'flip-h', 'flip-v', 'download', 'fullscreen', 'close'. An empty array removes the toolbar"],
      ['rotateLeft / rotateRight / zoomIn / zoomOut / zoomReset / flipHorizontal / flipVertical / downloadable / fullscreen / closable', 'boolean', 'undefined', 'Per-button switches. Each overrides actions for that one button; undefined leaves the array in charge, so the two can be mixed. Buttons the array does not list are appended in the toolbar\u2019s canonical order'],
      ['hoverToolbar / hoverNav', 'boolean', 'false', 'Reveal the toolbar or the arrows only on hover \u2014 they fade rather than snap, and keyboard focus counts as hover'],
      ['showNav / showThumbnails / showCounter', 'boolean', 'true / true / false', ''],
      ['thumbnailsPosition / toolbarPosition', "'bottom' | 'top' / 'top' | 'bottom'", "'bottom' / 'top'", ''],
      ['loop', 'boolean', 'false', 'Wraps past the ends'],
      ['zoomStep / maxZoom', 'number', '0.25 / 4', 'Also driven by ctrl or cmd with the wheel, and by + and \u2212'],
      ['width / height / aspectRatio / radius / padding', 'string', 'tokens', 'The frame'],
      ['stageBackground', 'string', 'near-black', 'What shows around a contained image'],
      ['toolbarBackground / toolbarColor / toolbarRadius', 'string', 'tokens', ''],
      ['navBackground / navColor / navSize / navRadius', 'string', 'tokens', ''],
      ['thumbSize / thumbGap / thumbRadius / thumbActiveColor / thumbInactiveOpacity', 'string / string / string / string / number', 'tokens / 0.55', 'The strip; inactive thumbnails dim to that opacity'],
    ],
    events: [['update:modelValue', 'number'], ['update:open', 'boolean'], ['change', 'number \u2014 the new index']],
    slots: [
      ['image', 'Replaces the stage image; receives { image, index, style } \u2014 apply the style to keep zoom, rotation and flips'],
      ['toolbar', 'Replaces the toolbar contents; receives { act } to drive any action'],
    ],
    serviceTitle: 'Methods',
    serviceRows: [
      ['act(action)', 'void', 'Runs any toolbar action from outside'],
      ['go(index)', 'void', 'Moves and resets the view'],
      ['reset()', 'void', 'Back to 1\u00d7, unrotated, unflipped'],
    ],
  },
  {
    id: 'carousel', name: 'ApexCarousel', group: 'Media',
    blurb: 'A composed content slider: a root that owns the state, a scroll-snap track, items, nav buttons and indicators. Movement is native scroll-snap rather than a transformed track \u2014 the browser already does momentum, touch and trackpad gestures well, and the track stays reachable by keyboard and screen reader. Because slide is bindable, a thumbnail gallery is two carousels sharing one index rather than a separate component.',
    noField: true, demo: 'media',
    lead: [],
    tail: '>\n  \u2026\n</ApexCarousel>',
    base: { align: 'start', slidesPerPage: 1, orientation: 'horizontal' },
    controls: [
      { key: 'align', type: 'select', options: ['start', 'center', 'end'] },
      { key: 'slidesPerPage', type: 'number' },
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'loop', type: 'bool' }, { key: 'autoSize', type: 'bool' },
      { key: 'gap', type: 'text' },
      { key: 'indicators', type: 'bool' },
      { key: 'indicatorPosition', type: 'select', options: ['left', 'center', 'right'] },
      { key: 'navPosition', type: 'select', options: ['bottom', 'top', 'middle', 'both-start', 'both-end', 'split'] },
    ],
    props: [
      ['slide', 'number', '0', 'v-model:slide \u2014 the active index, which is how two carousels drive each other'],
      ['align', "'start' | 'center' | 'end'", "'start'", 'Where the active item lands in the viewport'],
      ['slidesPerPage', 'number', '1', 'Fractions are allowed: 2.5 shows a partial slide as an affordance'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", ''],
      ['loop', 'boolean', 'false', 'Wraps past the ends instead of stopping, and keeps both nav buttons enabled'],
      ['autoSize', 'boolean', 'false', 'Items size themselves instead of dividing the track \u2014 for variable widths'],
      ['gap', 'string', "'16px'", 'Space between items'],
      ['indicators', 'boolean', 'true', 'Off removes the indicators wherever they are composed'],
      ['indicatorPosition', "'left' | 'center' | 'right'", "'left'", 'Where the indicators sit in the control row'],
      ['navPosition', "'bottom' | 'top' | 'middle' | 'both-start' | 'both-end' | 'split'", "'bottom'", 'Arrows in the control row below or above the track \u2014 taking whichever side the indicators are not using \u2014 overlaid on the track\u2019s edges (middle), both pinned to the start or the end of the row, or one at each end (split)'],
    ],
    events: [['update:slide', 'number \u2014 fires for drags and flicks too, not just button presses']],
    slots: [['default', 'The composed parts \u2014 in any arrangement']],
    serviceTitle: 'Sub-components',
    serviceRows: [
      ['ApexCarouselContent', 'track', 'The scroll-snap scroller; reports the active item back as you drag'],
      ['ApexCarouselItem', 'item', 'One snap child \u2014 sizing comes from the track'],
      ['ApexCarouselNav', 'dir="prev" | "next"', 'One button; disables itself at the end of the track unless the carousel loops. icon and size override the default chevron, or use its slot'],
      ['ApexCarouselIndicators', 'variant="bar" | "dot"', 'One control per item, doubling as position'],
      ['ApexCarouselControls', 'variant="bar" | "dot"', 'The standard control row, arranged by navPosition and indicatorPosition \u2014 one tag instead of hand-composing a row, with the parts still available separately'],
    ],
  },
  {
    id: 'compare', name: 'ApexCompare', group: 'Media',
    blurb: 'Two items stacked and revealed by a draggable divider. The before item is clipped rather than resized, so both children keep their natural layout at every position \u2014 an image never squashes, and a card inside the comparison stays the size it would be on its own. The divider is a real slider with arrow, Home and End keys, since a control that only answers to a drag is unusable by keyboard.',
    noField: true, demo: 'media',
    lead: ['v-model="value"'],
    tail: '>\n  \u2026\n</ApexCompare>',
    base: { orientation: 'horizontal', slideOnHover: false, handle: true },
    controls: [
      { key: 'orientation', type: 'select', options: ['horizontal', 'vertical'] },
      { key: 'slideOnHover', type: 'bool' }, { key: 'handle', type: 'bool' },
      { key: 'disabled', type: 'bool' },
      { key: 'height', type: 'text' }, { key: 'aspectRatio', type: 'text' },
      { key: 'radius', type: 'text' }, { key: 'dividerWidth', type: 'text' },
      { key: 'dividerColor', type: 'color' }, { key: 'background', type: 'color' },
      { key: 'handleSize', type: 'text' }, { key: 'handleRadius', type: 'text' },
      { key: 'handleBackground', type: 'color' }, { key: 'handleColor', type: 'color' },
      { key: 'handleBorderColor', type: 'color' },
      { key: 'step', type: 'number' }, { key: 'pageStep', type: 'number' },
    ],
    props: [
      ['modelValue', 'number', '50', 'v-model \u2014 the divider position as a percentage'],
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'", ''],
      ['slideOnHover', 'boolean', 'false', 'Follows the pointer without a press'],
      ['disabled', 'boolean', 'false', 'Freezes the divider and takes the handle out of the tab order'],
      ['step / pageStep', 'number', '1 / 10', 'Arrow keys, and PageUp/PageDown'],
      ['width / height / aspectRatio', 'string', '100% / \u2014 / \u2014', 'The frame; aspectRatio is usually what you want for imagery'],
      ['radius / background', 'string', 'tokens', 'Frame corners, and what shows behind the items'],
      ['dividerWidth / dividerColor', 'string', "'2px' / white", ''],
      ['handle', 'boolean', 'true', 'Off leaves the divider draggable but unadorned'],
      ['handleSize / handleRadius / handleBackground / handleColor / handleBorderColor / handleShadow', 'string', 'tokens', 'The handle \u2014 a square, a pill or a circle, in any colour'],
    ],
    events: [
      ['update:modelValue', 'number'],
      ['slide-start / slide-end', '\u2014 a drag began or ended'],
    ],
    slots: [
      ['default', 'Two ApexCompareItem children, position="before" and "after"'],
      ['handle', 'Replaces the handle contents; receives { value } \u2014 the drag, keys and positioning stay'],
    ],
    serviceTitle: 'Sub-components',
    serviceRows: [
      ['ApexCompareItem', 'position="before" | "after"', 'One side \u2014 an image, a chart, a whole card'],
    ],
  },
  {
    id: 'sidebar', name: 'ApexSidebar', group: 'Menu',
    blurb: 'A navigation panel that collapses to an icon rail or slides away entirely, inside an ApexSidebarLayout. Width is one custom property, so collapsing, hovering open and the offcanvas slide are the same transition rather than three code paths — and each panel registers under an id, so a trigger can sit in a header nowhere near it.',
    noField: true, demo: 'menu',
    /* The gallery's own lead reads :items="items", but ApexSidebar has no such
       prop and its own props table does not list one — it is a container, and
       the menu goes inside it. Copying that verbatim would have printed a
       snippet telling the reader to write a prop the component ignores. */
    lead: ['id="primary"', 'collapsible="icon"'],
    tail: '\n/>',
    base: { variant: 'sidebar', collapsible: 'icon', side: 'left', width: '260px', iconWidth: '58px' },
    controls: [
      { key: 'variant', type: 'select', options: ['sidebar', 'floating', 'inset'] },
      { key: 'collapsible', type: 'select', options: ['icon', 'offcanvas', 'none'] },
      { key: 'side', type: 'select', options: ['left', 'right'] },
      { key: 'overlay', type: 'bool' }, { key: 'openOnHover', type: 'bool' }, { key: 'backdrop', type: 'bool' },
      { key: 'width', type: 'text' }, { key: 'iconWidth', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' }, { key: 'textColor', type: 'color' },
    ],
    props: [
      ['id', 'string', "'primary'", 'Registry key an ApexSidebarTrigger targets'],
      ['open', 'boolean', 'true', 'v-model:open — also driven by the registry, so a trigger and a binding stay in step'],
      ['variant', "'sidebar' | 'floating' | 'inset'", "'sidebar'", 'Flush panel, detached card, or a card inside an inset layout'],
      ['collapsible', "'icon' | 'offcanvas' | 'none'", "'icon'", 'Collapse to a rail of icons, slide away entirely, or stay open'],
      ['side', "'left' | 'right'", "'left'", ''],
      ['overlay', 'boolean', 'false', 'Float over the content instead of pushing it — an offcanvas panel without it pushes, so the trigger that closes it stays reachable'],
      ['openOnHover', 'boolean', 'false', 'Expand an icon rail while the pointer is over it, without changing the state'],
      ['backdrop', 'boolean', 'false', 'Dim the page behind an overlay panel; clicking it closes'],
      ['width / iconWidth', 'string', "'260px' / '58px'", 'Open width, and the collapsed rail'],
      ['background / borderColor / textColor', 'string', 'tokens', 'Panel chrome'],
      ['zIndex', 'number', '40', 'Overlay panel and backdrop stack order'],
    ],
    events: [['update:open', 'boolean']],
    slots: [
      ['header / default / footer', 'Panel regions. Each receives { collapsed }, so a header can swap a wordmark for a monogram in icon mode'],
    ],
    serviceTitle: 'Family and service',
    serviceRows: [
      ['ApexSidebarLayout', 'variant, height, background, radius', 'The shell: a row of panels and one content region, so panels push content by layout rather than by margins you maintain'],
      ['ApexSidebarInset', 'scroll', 'The content region beside the panels'],
      ['ApexSidebarTrigger', 'target, icon, label, size', 'Toggles a sidebar by id, from anywhere in the tree'],
      ['useApexSidebar(id)', '{ state, show, hide, toggle, set }', 'The same registry the panels and triggers read — for a keyboard shortcut, a route guard, or a media query'],
      ['[data-sbar-label]', 'attribute', 'Put it on your own text inside the panel and icon mode hides it with the rest'],
    ],
  },
  {
    id: 'breadcrumb', name: 'ApexBreadcrumb', group: 'Menu',
    blurb: 'The trail to the current page. Items are data, so a crumb is text, an icon, or both, from one shape — and a long trail collapses in the middle behind an ellipsis rather than wrapping, since the first and last crumbs are the ones that carry meaning.',
    noField: true, demo: 'menu',
    lead: [':home="home"', ':items="items"'],
    tail: '\n/>',
    base: { separator: 'chevron_right', size: 'md', markCurrent: true },
    controls: [
      { key: 'separator', type: 'text' },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'maxItems', type: 'number' },
      { key: 'markCurrent', type: 'bool' }, { key: 'wrap', type: 'bool' },
      { key: 'gap', type: 'text' }, { key: 'padding', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'color', type: 'color' }, { key: 'activeColor', type: 'color' },
      { key: 'hoverColor', type: 'color' }, { key: 'separatorColor', type: 'color' },
      { key: 'background', type: 'color' },
    ],
    props: [
      ['items', 'CrumbItem[]', '[]', 'Each takes { label, icon, href, to, target, command, current, disabled, can } — label alone, icon alone, or both'],
      ['home', 'CrumbItem', '—', 'A leading crumb, usually the site root and usually icon-only. It counts as the first crumb'],
      [' to', 'string | object', '—', 'On a crumb: a route rather than a URL, rendered through linkComponent'],
      ['linkComponent', 'Component', '—', 'What a crumb’s `to` is rendered through — RouterLink, Inertia’s Link, anything taking a `to`. Without it a string `to` falls back to an href'],
      ['separator', 'string', "'chevron_right'", "An icon name, or any text — '/', '\u203a', '—'"],
      ['maxItems', 'number', '—', 'Collapse the middle behind an ellipsis past this many crumbs; clicking it expands the trail'],
      ['markCurrent', 'boolean', 'true', 'The last crumb reads as the current page: bold, not a link, aria-current="page". An item can force it either way with current'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", ''],
      ['wrap', 'boolean', 'false', 'By default a long trail scrolls sideways rather than wrapping'],
      ['color / activeColor / hoverColor / separatorColor', 'string', 'tokens', 'Crumb colours'],
      ['gap / padding / radius / background', 'string', 'tokens', 'Chrome — give it a background and padding for a bar'],
    ],
    events: [['item-click', '{ item, index, originalEvent } — an item’s own command runs first']],
    slots: [
      ['item', 'Replaces a crumb; receives { item, index, isCurrent } — the hook for router-link'],
      ['separator', 'Replaces every separator'],
      ['ellipsis', 'Replaces the collapsed-middle control; receives { expand }'],
    ],
  },
  {
    id: 'contextmenu', name: 'ApexContextMenu', group: 'Menu',
    blurb: 'An overlay menu on right click, attached to a target element or to the whole document. Rows come from the same renderer the split button uses, so nesting, separators, headers and hints behave identically — and the menu opens at the pointer, shifting only to stay on screen.',
    noField: true, demo: 'menu',
    lead: [':items="items"', ':target="zone"'],
    tail: '\n/>',
    base: { padding: 8 },
    controls: [
      { key: 'global', type: 'bool' }, { key: 'disabled', type: 'bool' },
      { key: 'padding', type: 'number' }, { key: 'width', type: 'text' },
      { key: 'radius', type: 'text' }, { key: 'background', type: 'color' },
    ],
    props: [
      ['items', 'MenuItem[]', '[]', 'Each takes { label, icon, hint, href, target, command, disabled, items, separator, header, can }'],
      ['target', 'Element | string | ref', '—', 'What the right click is listened for on'],
      ['global', 'boolean', 'false', 'Attach to the document instead of one element'],
      ['disabled', 'boolean', 'false', 'Lets the native menu through again'],
      ['padding', 'number', '8', 'Distance kept from the viewport edges'],
      ['width / background / borderColor / radius', 'string', 'tokens', 'Panel chrome — width sets the minimum'],
      ['textColor / iconColor / hoverBackground / hoverTextColor / headerColor / hintColor / separatorColor / rowRadius', 'string', 'tokens', 'The same colour vocabulary as ApexMenu and ApexTieredMenu'],
      ['zIndex', 'number', '1200', 'Above dialogs and popovers'],
    ],
    events: [['show / hide', '—'], ['item-click', '{ item, originalEvent } — the item’s own command runs first']],
    slots: [['item', 'Replaces a row’s contents; receives { item, depth, branch }. The row itself — click, hover, submenu — stays the component’s']],
    serviceTitle: 'Methods',
    serviceRows: [
      ['show(event)', 'void', 'Open at an event’s coordinates — for a long-press or a keyboard shortcut'],
      ['hide() / toggle(event)', 'void', ''],
      ['visible', 'boolean', 'Read the open state off the ref'],
      ['target', 'Element', 'The element the menu was opened on; a command also receives it'],
    ],
  },
  {
    id: 'dock', name: 'ApexDock', group: 'Menu',
    blurb: 'A launcher strip of icons along an edge. A dock item is either a single action or a group — give it a nested items array and it behaves like a speed dial, fanning its children out from the dock, so one slot in the strip stays useful for a whole family of actions.',
    noField: true, demo: 'menu',
    lead: [':items="items"'],
    tail: '\n/>',
    base: { position: 'bottom', magnify: true, size: 46, showLabels: true, blur: true },
    controls: [
      { key: 'position', type: 'select', options: ['bottom', 'top', 'left', 'right'] },
      { key: 'magnify', type: 'bool' }, { key: 'showLabels', type: 'bool' },
      { key: 'size', type: 'number' }, { key: 'fanGap', type: 'number' },
      { key: 'blur', type: 'bool' }, { key: 'disabled', type: 'bool' },
      { key: 'gap', type: 'text' }, { key: 'padding', type: 'text' }, { key: 'radius', type: 'text' },
      { key: 'background', type: 'color' }, { key: 'borderColor', type: 'color' },
    ],
    props: [
      ['items', 'MenuItem[]', '[]', 'Each takes { icon, label, badge, href, target, command, disabled, items, can } — a nested items array turns the slot into a speed dial'],
      ['position', "'bottom' | 'top' | 'left' | 'right'", "'bottom'", 'Which edge it sits on; children fan away from it'],
      ['magnify', 'boolean', 'true', 'Grows the hovered icon and its two neighbours — CSS only, no pointer tracking'],
      ['size', 'number', '46', 'Icon box size in pixels; the glyph scales with it'],
      ['showLabels', 'boolean', 'true', 'Label on hover, on the outward side of the strip'],
      ['fanGap', 'number', '8', 'Distance between a group’s fanned children'],
      ['gap / padding / radius / background / borderColor', 'string', 'tokens', 'Chrome'],
      ['blur', 'boolean', 'false', 'Blurs whatever sits behind the strip'],
      ['disabled', 'boolean', 'false', ''],
    ],
    events: [['item-click', '{ item, index, originalEvent } — fired for a child too; its own command runs first']],
    slots: [['item', 'Replaces an icon; receives { item, index, inGroup } — the hook for real app artwork']],
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
      ['items', 'MegaItem[]', '[]', 'Root items: { label, icon, href, command, disabled, columns, panel, can }'],
      [' columns', 'MegaColumn[]', '—', '{ header, headerIcon, image, imageAlt, layout, span, items, footer, can } — image puts a thumbnail above the column, layout: "cards" turns its items into image tiles, span widens it'],
      [' columns[].items', 'MegaLink[]', '—', '{ label, help, icon, image, badge, href, target, command, disabled, can } — image replaces the icon with a thumbnail'],
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
      ['items', 'MenuItem[]', '[]', 'Each takes { key, label, icon, help, hint, badge, href, target, command, disabled, active, separator, items, toggleable, can }'],
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
      ['items', 'MenuItem[]', '[]', 'Root items; an item with its own items drops a menu. Children take { label, icon, hint, href, target, command, disabled, separator, header, items, can }'],
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
      ['items', 'MenuItem[]', '[]', 'Nest an items array on a row and it opens a submenu overlay to the side; also takes { icon, hint, href, target, command, disabled, separator, header, can }'],
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
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes, e.g. animate.css. Not bundled — install it yourself. A pair given here replaces the built-in animation. See <a href="#/motion">Motion &amp; transitions</a>'],
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. Written as <code>--animate-duration</code> and <code>animation-duration</code> while that phase runs, then removed'],
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
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes, e.g. animate.css. Not bundled — install it yourself. A pair given here replaces the built-in animation. See <a href="#/motion">Motion &amp; transitions</a>'],
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. Written as <code>--animate-duration</code> and <code>animation-duration</code> while that phase runs, then removed'],
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
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes, e.g. animate.css. Not bundled — install it yourself. A pair given here replaces the built-in animation. See <a href="#/motion">Motion &amp; transitions</a>'],
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. Written as <code>--animate-duration</code> and <code>animation-duration</code> while that phase runs, then removed'],
      ['visible', 'boolean', 'false', 'v-model:visible'],
      ['header / subtitle / icon', 'string', '—', 'Header content; the header slot replaces all three'],
      ['position', '9 values', "'center'", 'center, top, bottom, left, right and the four corners'],
      ['modal', 'boolean', 'true', 'Blocks the page behind, traps focus, and locks page scroll'],
      ['draggable', 'boolean', 'false', 'Drag by the header'],
      ['closable / closeOnEscape / dismissableMask', 'boolean', 'true / true / false', 'Dismissal routes'],
      ['autoClose / showTimer', 'number / boolean', '—', 'Close after n ms, with an optional countdown bar'],
      ['transition', "'scale' | 'slide' | 'fade' | 'none'", 'scale', 'A built-in preset, used when no classes are given'],
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
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes, e.g. animate.css. Not bundled — install it yourself. A pair given here replaces the built-in animation. See <a href="#/motion">Motion &amp; transitions</a>'],
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. Written as <code>--animate-duration</code> and <code>animation-duration</code> while that phase runs, then removed'],
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

  /* ── Data ──────────────────────────────────────────────────────
     Entries copied from the gallery's registry (web/apex-ui-docs.js), extracted
     rather than retyped — the header of this file records what happened the
     last time demo data was written out by hand. The one change per entry is
     the stage: the gallery's bespoke `xxxDemo: true` flag becomes our `demo`
     discriminator. Paginator landed early, in AF2-250, as the harness's proof.
     The pack is complete. */

  {
    id: 'datatable', name: 'ApexDataTable', group: 'Data',
    blurb: 'Tabular data with sorting, selection, paging, frozen columns and rows, formula columns and footer aggregates. Columns are a props array, so the whole pipeline runs in computeds and only visible rows render.',
    noField: true, 
    demo: 'data-tabular',
    base: { size: 'normal', gridLines: 'horizontal', striped: true, paginator: true, rows: 8,
            selectionMode: 'checkbox', showSelectionCount: true, footerMode: 'both',
            dataKey: 'id', scrollable: false, sortMode: 'multiple' },
    controls: [
      { key: 'size', type: 'select', options: ['small', 'normal', 'large'] },
      { key: 'gridLines', type: 'select', options: ['none', 'horizontal', 'vertical', 'both'] },
      { key: 'gridLineSize', type: 'number' }, { key: 'gridLineColor', type: 'color' },
      { key: 'striped', type: 'bool' }, { key: 'stripeColor', type: 'color' },
      { key: 'headerBackground', type: 'color' }, { key: 'borderColor', type: 'color' },
      { key: 'selectionMode', type: 'select', options: ['', 'single', 'multiple', 'checkbox', 'radio'] },
      { key: 'selectionColor', type: 'color' }, { key: 'showSelectionCount', type: 'bool' },
      { key: 'sortMode', type: 'select', options: ['single', 'multiple'] },
      { key: 'removableSort', type: 'bool' },
      { key: 'paginator', type: 'bool' }, { key: 'rows', type: 'number' },
      { key: 'footerMode', type: 'select', options: ['all', 'selected', 'both'] },
      { key: 'scrollable', type: 'bool' }, { key: 'scrollHeight', type: 'text' },
      { key: 'rowFreeze', type: 'bool' },
      { key: 'editMode', type: 'select', options: ['', 'cell', 'row'] },
      { key: 'filterDisplay', type: 'select', options: ['', 'row', 'menu'] },
      { key: 'showGlobalFilter', type: 'bool' },
      { key: 'groupRowsBy', type: 'select', options: ['', 'country', 'status', 'rep'] },
      { key: 'rowGroupMode', type: 'select', options: ['subheader', 'rowspan'] },
      { key: 'expandableRowGroups', type: 'bool' }, { key: 'showGroupFooter', type: 'bool' },
      { key: 'rowExpansion', type: 'bool' },
      { key: 'expandOnRowClick', type: 'bool' }, { key: 'singleExpand', type: 'bool' },
      { key: 'loading', type: 'bool' },
      { key: 'loadingMode', type: 'select', options: ['overlay', 'skeleton'] },
      { key: 'bordered', type: 'bool' }, { key: 'hoverable', type: 'bool' },
    ],
    props: [
      ['value', 'Row[]', '[]', 'The rows'],
      ['columns', 'ColumnDef[]', '[]', 'See the column reference below'],
      ['dataKey', 'string', '—', 'Uniquely identifies a row; needed for selection and editing'],
      ['size', "'small' | 'normal' | 'large'", "'normal'", 'Cell padding'],
      ['gridLines', "'none' | 'horizontal' | 'vertical' | 'both'", "'horizontal'", 'Which borders to draw'],
      ['gridLineSize / gridLineColor', 'number / string', '1 / token', 'Border thickness and colour'],
      ['striped / stripeColor', 'boolean / string', 'false / token', 'Zebra rows'],
      ['headerBackground / borderColor', 'string', 'token', 'Chrome colours'],
      ['selection', 'Row | Row[] | null', '—', 'v-model:selection'],
      ['selectionMode', "'single' | 'multiple' | 'checkbox' | 'radio' | null", 'null', ''],
      ['selectionColor', 'string', 'accent', 'Selected-row tint'],
      ['showSelectionCount', 'boolean', 'false', 'Count chip in the metabar'],
      ['metaKeySelection', 'boolean', 'true', 'Cmd/Ctrl needed to add in multiple mode'],
      ['sortMode', "'single' | 'multiple'", "'single'", 'Cmd/Ctrl-click headers to sort by several fields'],
      ['sortField / sortOrder', 'string / 1 | -1 | 0', '—', 'Initial single sort; headers stay interactive'],
      ['multiSortMeta', 'SortMeta[]', '—', 'Initial multi-sort; each header keeps a rank badge'],
      ['removableSort', 'boolean', 'true', 'A third click clears the column'],
      ['paginator / rows / first', 'boolean / number / number', 'false / 10 / 0', 'Paging; `first` is bindable'],
      ['rowsPerPageOptions', 'number[]', '—', 'Page-size selector'],
      ['lazy / totalRecords', 'boolean / number', 'false', 'Server-side paging and sorting'],
      ['resizableColumns / columnResizeMode', "boolean / 'fit' | 'expand'", "false / 'fit'", 'Drag a boundary to resize. fit takes the difference from the next column so the table\u2019s total width never changes and no scrollbar appears mid-drag; expand lets the table grow instead. The last column has no grip \u2014 there is nothing on its right to take width from'],
      ['reorderableColumns', 'boolean', 'false', 'Drag a header to reorder. The order is written out in full rather than as a diff, since a partial order would leave later columns unranked and drifting'],
      ['columnToggle / columnToggleLabel', 'boolean / string', "false / 'Columns'", 'A picker in the toolbar. It lists every declared column including the hidden ones \u2014 a list of what is showing cannot bring back what is not'],
      ['columnGroups', '{ header, columns, align? }[]', '\u2014', 'A header row above the columns. Each group spans the run of its own columns in their CURRENT order, and a column in no group gets a blank cell, so reordering can never make a group header span columns it does not own'],
      ['columnState', '{ order, widths, hidden }', '\u2014', 'v-model:columnState. The table owns width, order and visibility by default \u2014 unlike the board\u2019s cards, a column layout is a view preference rather than the application\u2019s data \u2014 and this binds it when you want to persist or drive it'],
      ['stateKey / stateStorage', "string / 'local' | 'session'", "\u2014 / 'local'", 'Persist the column layout without bookkeeping. A blocked or malformed store is swallowed: a lost preference is not an error'],
      ['scrollable / scrollHeight', 'boolean / string', 'false', 'Vertical scroll with a sticky header'],
      ['flexible', 'boolean', 'false', 'Grow and shrink with a flex parent'],
      ['tableMinWidth', 'string', '—', 'Forces horizontal scroll below this width'],
      ['expandedRows', 'Row[]', '—', 'v-model:expandedRows — rows whose detail panel is open'],
      ['rowExpansion', 'boolean', 'false', 'Chevron column that opens a detail row; needs dataKey'],
      ['expandOnRowClick', 'boolean', 'false', 'Clicking anywhere on the row toggles it'],
      ['singleExpand', 'boolean', 'false', 'Only one row open at a time'],
      ['expandIcon / collapseIcon', 'string', "'chevron_right' / 'keyboard_arrow_down'", ''],
      ['frozenValue', 'Row[]', '—', 'v-model:frozenValue — rows pinned above the scrolling body'],
      ['rowFreeze', 'boolean', 'false', 'Padlock column that freezes and unfreezes a row on click; needs dataKey'],
      ['freezeIcon / unfreezeIcon', 'string', "'lock_open' / 'lock'", 'Padlock glyphs'],
      ['editMode', "'cell' | 'row' | null", 'null', 'Click a cell to edit it, or an editor column per row'],
      ['editingRows', 'Row[]', '—', 'v-model:editingRows — rows in row-edit mode'],
      ['commitEdits', 'boolean', 'true', 'Also write the edit into the row object; turn off when the server owns the value'],
      ['filters', 'FilterModel', '{}', 'v-model:filters — keyed by field, plus an optional global entry'],
      ['filterDisplay', "'row' | 'menu' | null", 'null', 'Inline editors under the headers, or a popover per column'],
      ['globalFilterFields', 'string[]', 'all non-formula fields', 'Fields the global filter searches'],
      ['showGlobalFilter', 'boolean', 'false', 'Search box in the metabar, bound to filters.global'],
      ['maxConstraints', 'number', '3', 'Rules a menu filter may stack, joined by AND/OR'],
      ['groupRowsBy', 'string', '—', 'Field to group contiguous rows by; it leads the sort automatically'],
      ['rowGroupMode', "'subheader' | 'rowspan'", "'subheader'", 'A header row per group, or the group column spanning its rows'],
      ['expandableRowGroups', 'boolean', 'false', 'Groups can be collapsed'],
      ['expandedRowGroups', 'string[]', '—', 'v-model:expandedRowGroups — group keys currently open'],
      ['showGroupFooter', 'boolean', 'false', 'Aggregate row under each group, from groupAggregate ?? aggregate'],
      ['showFooter / footerMode', 'boolean / all|selected|both', 'auto / all', 'Aggregate rows'],
      ['loading / loadingMode', 'boolean / overlay|skeleton', 'false / overlay', ''],
      ['rowClass / rowStyle', '(row, i) => …', '—', 'Conditional row styling'],
      ['caption', 'string', '—', 'A line in the toolbar above the table'],
      ['bordered', 'boolean', 'true', 'The frame around the table'],
      ['hoverable', 'boolean', 'true', 'Highlights the row under the pointer'],
      ['rowRipple', 'boolean', 'false', 'Ripple a row from the point of contact. NOT wired to the plugin’s app-wide <code>ripple</code> option — that one is about the buttons the kit draws for itself, and a rippling row is a far larger visual statement, so opting into one must not give you the other'],
      ['globalFilterPlaceholder', 'string', "'Search all columns'", 'Placeholder for the toolbar search'],
      ['paginatorTemplate', 'string', "'Showing {first}–{last} of {total}'", 'Summary line — the same tokens ApexPaginator takes'],
      ['skeletonRows', 'number', '5', 'Placeholder rows drawn while loading in skeleton mode'],
      ['emptyMessage', 'string', '—', 'Shown when there is nothing to list, or a filter matches nothing'],
      ['locale', 'string', '—', 'Passed to the date and number formatters'],
    ],
    events: [
      ['update:selection', 'Row | Row[] | null'],
      ['row-select / row-unselect', '{ data, index }'],
      ['row-click', '{ data, index, event }'],
      ['sort', '{ sortField, sortOrder, multiSortMeta }'],
      ['page', '{ first, rows, page }'],
      ['update:frozenValue', 'Row[]'],
      ['row-freeze / row-unfreeze', '{ data }'],
      ['update:expandedRows', 'Row[]'],
      ['row-expand / row-collapse', '{ data }'],
      ['update:editingRows', 'Row[]'],
      ['cell-edit-init', '{ data, field, value }'],
      ['cell-edit-complete', '{ data, field, value, newValue }'],
      ['cell-edit-cancel', '{ data, field }'],
      ['row-edit-init / row-edit-cancel', '{ data, index }'],
      ['row-edit-save', '{ data, newData, index }'],
      ['update:filters', 'FilterModel'],
      ['filter', '{ filters, filteredValue }'],
      ['update:expandedRowGroups', 'string[]'],
      ['rowgroup-expand / rowgroup-collapse', '{ key }'],
    ],
    slots: [
      ['cell:<field>', 'Cell content; receives { row, column, value, index }'],
      ['editor:<field>', 'Custom editor; receives { row, column, value, update }'],
      ['expansion', 'Detail panel for an expanded row; receives { row, index }'],
      ['groupheader', 'Group header content; receives { value, rows }'],
      ['groupfooter', 'Group footer cell; receives { value, rows, column }'],
      ['header:<field>', 'Header content'],
      ['empty', 'Empty state'],
      ['loading', 'Overlay content'],
      ['header / footer', 'Metabar above and content below the table'],
    ],
  },

  {
    id: 'treetable', name: 'ApexTreeTable', group: 'Data',
    blurb: 'Hierarchical data in tabular form — the data table\'s column model over the tree\'s row model. Sorting reorders siblings at every level rather than flattening the hierarchy, paging applies to root nodes so a page carries whole branches, and filtering keeps a matching branch or only what matched.',
    noField: true, 
    demo: 'data-tabular',
    lead: ['v-model:expandedKeys="expanded"', 'v-model:selectionKeys="selected"', ':value="nodes"', ':columns="columns"'],
    tail: '\n/>',
    base: { size: 'normal', gridLines: 'horizontal', selectionMode: 'checkbox', showGlobalFilter: true, scrollable: false },
    controls: [
      { key: 'size', type: 'select', options: ['small', 'normal', 'large'] },
      { key: 'gridLines', type: 'select', options: ['none', 'horizontal', 'vertical', 'both'] },
      { key: 'striped', type: 'bool' }, { key: 'bordered', type: 'bool' },
      { key: 'indent', type: 'number' },
      { key: 'selectionMode', type: 'select', options: ['', 'single', 'multiple', 'checkbox'] },
      { key: 'metaKeySelection', type: 'bool' },
      { key: 'sortMode', type: 'select', options: ['single', 'multiple'] },
      { key: 'removableSort', type: 'bool' },
      { key: 'filterDisplay', type: 'select', options: ['', 'row'] },
      { key: 'filterMode', type: 'select', options: ['lenient', 'strict'] },
      { key: 'showGlobalFilter', type: 'bool' },
      { key: 'paginator', type: 'bool' }, { key: 'rows', type: 'number' },
      { key: 'scrollable', type: 'bool' }, { key: 'scrollHeight', type: 'text' },
      { key: 'loading', type: 'bool' },
      { key: 'loadingMode', type: 'select', options: ['overlay', 'skeleton'] },
      { key: 'showFooter', type: 'bool' }, { key: 'caption', type: 'text' },
    ],
    props: [
      ['value', 'TreeNode[]', '[]', 'Each node carries its row fields on `data`, plus key, icon and children'],
      ['columns', 'TreeColumn[]', '[]', 'The ColumnDef shape, plus `expander: true` on the column that hosts the toggle'],
      ['expandedKeys', 'Record<string, boolean>', '{}', 'v-model:expandedKeys'],
      ['selectionMode', "'single' | 'multiple' | 'checkbox' | null", 'null', ''],
      ['selectionKeys', 'Record<string, boolean | { checked, partialChecked }>', '{}', 'v-model:selectionKeys — an object per key in checkbox mode'],
      ['metaKeySelection', 'boolean', 'false', 'Require Cmd/Ctrl to add in multiple mode'],
      ['size / gridLines / striped / bordered', 'see DataTable', 'normal / horizontal', 'Same chrome as ApexDataTable'],
      ['indent', 'number', '18', 'Pixels per level in the expander column'],
      ['sortMode / sortField / sortOrder / multiSortMeta / removableSort', 'see DataTable', 'single', 'Sorting reorders siblings at every level'],
      ['filters / filterDisplay / filterMode', "model / 'row' | null / 'lenient' | 'strict'", "{} / null / 'lenient'", 'lenient keeps a matching branch whole; strict keeps only matches and their ancestors'],
      ['showGlobalFilter', 'boolean', 'false', 'One search across every column'],
      ['paginator / rows / first', 'boolean / number / number', 'false / 10 / 0', 'Paging applies to root nodes'],
      ['lazy / totalRecords', 'boolean / number', 'false', 'Load roots only, children on nodeExpand'],
      ['scrollable / scrollHeight / tableMinWidth', 'boolean / string / string', 'false', 'Sticky header, horizontal scroll'],
      ['loading / loadingMode / skeletonRows', 'boolean / overlay|skeleton / number', 'false / overlay / 5', ''],
      ['showFooter', 'boolean', 'auto', 'Aggregate row; each column\'s `aggregate` runs over the leaves'],
      ['caption', 'string', '—', 'A line in the toolbar above the table'],
      ['rowsPerPageOptions', 'number[]', '—', 'Page-size choices; omit to hide the selector'],
      ['emptyMessage', 'string', '—', 'Shown when there is nothing to list, or a filter matches nothing'],
    ],
    events: [
      ['update:expandedKeys / update:selectionKeys / update:filters', 'key map'],
      ['node-expand / node-collapse', 'TreeNode'],
      ['node-select / node-unselect', 'TreeNode'],
      ['sort', '{ sortField, sortOrder, multiSortMeta }'],
      ['page', '{ first, rows, page }'],
      ['filter', '{ filters }'],
    ],
    slots: [
      ['cell:<field>', 'Cell content; receives { node, column, value, index }'],
      ['header:<field>', 'Header content'],
      ['filter:<field>', 'Custom filter editor for a column'],
      ['header / footer', 'The metabar and content below the table'],
      ['empty / loading', 'State content'],
    ],
  },

  {
    id: 'tree', name: 'ApexTree', group: 'Data',
    blurb: 'Hierarchical data as an inline tree. Rows render from a flattened list rather than a recursive component, so keyboard navigation is index-based and only visible rows exist in the DOM. Expansion and selection are both controlled through bindable key maps.',
    noField: true, 
    demo: 'data-tabular',
    lead: ['v-model:value="nodes"', 'v-model:expandedKeys="expanded"', 'v-model:selectionKeys="selected"'],
    tail: [
      '\n>',
      '\n  <template #node="{ node }">',
      '\n    {{ node.label }}',
      '\n  </template>',
      '\n</ApexTree>',
    ].join(''),
    base: { selectionMode: 'checkbox', filter: true, showSelectAll: true, scrollHeight: 300 },
    controls: [
      { key: 'selectionMode', type: 'select', options: ['', 'single', 'multiple', 'checkbox'] },
      { key: 'metaKeySelection', type: 'bool' }, { key: 'showSelectAll', type: 'bool' },
      { key: 'filter', type: 'bool' },
      { key: 'filterMode', type: 'select', options: ['lenient', 'strict'] },
      { key: 'filterBy', type: 'text' },
      { key: 'draggableNodes', type: 'bool' }, { key: 'droppableNodes', type: 'bool' },
      { key: 'loading', type: 'bool' },
      { key: 'loadingMode', type: 'select', options: ['overlay', 'skeleton'] },
      { key: 'indent', type: 'number' }, { key: 'scrollHeight', type: 'number' },
      { key: 'bordered', type: 'bool' },
      { key: 'hoverBackground', type: 'color' }, { key: 'selectedBackground', type: 'color' },
      { key: 'selectedColor', type: 'color' }, { key: 'iconColor', type: 'color' },
      { key: 'rowRadius', type: 'text' },
    ],
    props: [
      ['value', 'TreeNode[]', '[]', '{ key, label, icon?, data?, leaf?, loading?, selectable?, styleClass?, children? } — bindable, so drag-and-drop can rewrite it'],
      ['expandedKeys', 'Record<string, boolean>', '{}', 'v-model:expandedKeys — a key set to true is expanded'],
      ['selectionMode', "'single' | 'multiple' | 'checkbox' | null", 'null', ''],
      ['selectionKeys', 'Record<string, boolean | { checked, partialChecked }>', '{}', 'v-model:selectionKeys — booleans for single and multiple, an object per key in checkbox mode'],
      ['metaKeySelection', 'boolean', 'false', 'Require Cmd/Ctrl to add to a multiple selection'],
      ['showSelectAll', 'boolean', 'false', 'Header checkbox; its checked and indeterminate states derive from selectionKeys'],
      ['filter / filterBy / filterMode', "boolean / string / 'lenient' | 'strict'", "false / 'label' / 'lenient'", 'lenient keeps a matching branch whole; strict keeps only matches and the ancestors needed to reach them'],
      ['lazy', 'boolean', 'false', 'Load children on expand — set node.leaf to stop the toggle appearing, node.loading for the spinner'],
      ['loading / loadingMode', 'boolean / overlay|skeleton', 'false / overlay', ''],
      ['draggableNodes / droppableNodes', 'boolean', 'false', 'Reorder within a tree, or move between trees'],
      ['draggableScope / droppableScope', 'string', '—', 'Restrict which trees can exchange nodes'],
      ['indent / scrollHeight / rowRadius', 'number / number / string', '20 / — / token', 'Geometry'],
      ['hoverBackground / selectedBackground / selectedColor / iconColor', 'string', 'tokens', 'Colours'],
      ['filterPlaceholder', 'string', '—', 'Placeholder for the filter box'],
      ['skeletonRows', 'number', '5', 'How many placeholder rows to draw while loading in skeleton mode'],
      ['bordered', 'boolean', 'true', 'The frame around the tree'],
      ['emptyMessage', 'string', '—', 'Shown when there is nothing to list, or a filter matches nothing'],
    ],
    events: [
      ['update:value', 'TreeNode[] — after a drop'],
      ['update:expandedKeys / update:selectionKeys', 'key map'],
      ['node-expand / node-collapse', 'TreeNode'],
      ['node-select / node-unselect', 'TreeNode'],
      ['node-drop', '{ dragNode, dropNode, position, value }'],
      ['filter', '{ value }'],
    ],
    slots: [
      ['node', 'The label; receives { node, expanded, index }. The default slot works too'],
      ['nodeicon', 'Icon per node; receives { node, expanded, hasChildren }'],
      ['nodetoggleicon', 'Toggle indicator; receives { node, expanded }'],
      ['header / footer', 'Above the list and below it'],
      ['empty / loading', 'State content'],
    ],
  },

  {
    id: 'timeline', name: 'ApexTimeline', group: 'Data',
    blurb: 'A series of chained events. Each event is an arbitrary object rendered by the content slot, with an optional opposite slot for the other side of the line. Line thickness, style and colour, marker size, shape and colour, and the spacing are all props.',
    noField: true, 
    demo: 'data-simple',
    base: { align: 'start', layout: 'vertical', lineWidth: 2, markerSize: 14, iconField: 'icon', colorField: 'color' },
    controls: [
      { key: 'align', type: 'select', options: ['start', 'end', 'alternate'] },
      { key: 'layout', type: 'select', options: ['vertical', 'horizontal'] },
      { key: 'lineWidth', type: 'number' },
      { key: 'lineStyle', type: 'select', options: ['solid', 'dashed', 'dotted'] },
      { key: 'lineColor', type: 'color' },
      { key: 'markerSize', type: 'number' }, { key: 'markerBorderWidth', type: 'number' },
      { key: 'markerColor', type: 'color' }, { key: 'markerBorderColor', type: 'color' },
      { key: 'markerRadius', type: 'text' },
      { key: 'gap', type: 'text' }, { key: 'eventGap', type: 'text' },
      { key: 'iconField', type: 'text' }, { key: 'colorField', type: 'text' },
    ],
    props: [
      ['value', 'object[]', '[]', 'The events — any shape; the content slot decides how they read'],
      ['align', "'start' | 'end' | 'alternate'", "'start'", 'Which side of the line the content sits on'],
      ['layout', "'vertical' | 'horizontal'", "'vertical'", ''],
      ['lineWidth / lineStyle / lineColor', 'number / solid|dashed|dotted / string', '2 / solid / token', 'The connector'],
      ['markerSize / markerBorderWidth', 'number', '14 / 2', 'Marker geometry in pixels'],
      ['markerColor / markerBorderColor', 'string', 'tokens', 'Marker fill and ring'],
      ['markerRadius', 'string', 'full', 'Marker corner radius — a length makes squares'],
      ['iconField', 'string', '—', 'Field holding an icon name, drawn inside the marker'],
      ['colorField', 'string', '—', 'Field holding a colour, so an event can tint its own marker'],
      ['gap / eventGap', 'string', "'16px' / '6px'", 'Space across the line, and between events'],
      ['dataKey', 'string', '—', 'Stable key per event'],
    ],
    events: [],
    slots: [
      ['content', 'The event; receives { item, index }. The default slot works too'],
      ['opposite', 'Content on the other side of the line — dates, times, metadata'],
      ['marker', 'Replaces the marker contents'],
      ['connector', 'Replaces the drawn connector'],
    ],
  },

  {
    id: 'progressbar', name: 'ApexProgressBar', group: 'Data',
    blurb: 'Determinate progress, an indeterminate sweep, or a run of named steps. The sweep animates a margin rather than a transform, so it always travels the track\u2019s own width \u2014 a translate would have to know the container\u2019s width, and gets it wrong the moment the bar is resized.',
    noField: true, 
    demo: 'data-simple',
    base: { value: 62, showValue: true, height: 8, mode: 'determinate' },
    controls: [
      { key: 'value', type: 'number' }, { key: 'max', type: 'number' },
      { key: 'mode', type: 'select', options: ['determinate', 'indeterminate'] },
      { key: 'showValue', type: 'bool' },
      { key: 'valuePosition', type: 'select', options: ['inside', 'end'] },
      { key: 'insideThreshold', type: 'number' },
      { key: 'height', type: 'number' },
      { key: 'striped', type: 'bool' }, { key: 'animatedStripes', type: 'bool' },
      { key: 'sweepDuration', type: 'text' },
      { key: 'severity', type: 'select', options: ['primary', 'success', 'warning', 'danger', 'auto'] },
      { key: 'color', type: 'color' }, { key: 'trackColor', type: 'color' },
      { key: 'radius', type: 'text' }, { key: 'fillRadius', type: 'text' },
      { key: 'valueColor', type: 'color' }, { key: 'valueSize', type: 'text' },
      { key: 'label', type: 'text' },
    ],
    props: [
      ['value / max', 'number', '0 / 100', 'Progress and its scale'],
      ['mode', "'determinate' | 'indeterminate'", "'determinate'", 'The sweep for work of unknown length; value is ignored. indeterminate as a boolean still works'],
      ['steps / step / showStepLabel', 'string[] / number / boolean', '\u2014 / 0 / true', 'Named stages: the percentage comes from the current step, so the caller states where it is in a sequence instead of converting that to a number itself, and the step\u2019s name shows above the bar'],
      ['showValue / valuePosition', "boolean / 'inside' | 'end'", "false / 'inside'", 'Percentage readout'],
      ['insideThreshold', 'number', '12', 'Below this percentage the inside readout moves out, where it stays legible against the track'],
      ['height', 'number | string', '8', 'Bar thickness \u2014 a number is pixels'],
      ['severity', "'primary' | 'success' | 'warning' | 'danger' | 'auto'", "'primary'", 'auto tints by threshold \u2014 danger under 34%, warning under 67%'],
      ['color / trackColor / radius / fillRadius', 'string', 'tokens', 'Fill, track, the track\u2019s corners, and the fill\u2019s own'],
      ['valueColor / valueSize', 'string', 'white / 10px', 'The inside readout'],
      ['striped / animatedStripes', 'boolean', 'false', 'Diagonal stripes over the fill, optionally travelling'],
      ['sweepDuration', 'string', "'1.4s'", 'How long one indeterminate sweep takes'],
      ['label', 'string', '\u2014', 'Accessible name; a step\u2019s name is used when none is given'],
      ['indeterminate', 'boolean', 'false', 'Kept for existing callers — the same as mode="indeterminate"'],
    ],
    events: [],
    slots: [
      ['label', 'A row above the bar; receives { value, percent, formatted, step } \u2014 for a caption and a formatted figure on the same line'],
      ['value', 'Replaces the readout, inside or beside; receives { value, percent, formatted } \u2014 for bytes, time remaining, or a status word'],
    ],
  },

  {
    id: 'picklist', name: 'ApexPickList', group: 'Data',
    blurb: 'Move items between two lists. Controlled with a two-element model — [source, target] — with drag-and-drop across both lists, optional checkboxes with a select-all header, per-list filtering, optional reorder controls, and full control over borders, colours and control placement.',
    noField: true, 
    demo: 'data-simple',
    base: { sourceHeader: 'Available members', targetHeader: 'Team', checkbox: true, filter: true, scrollHeight: 260 },
    controls: [
      { key: 'sourceHeader', type: 'text' }, { key: 'targetHeader', type: 'text' },
      { key: 'checkbox', type: 'bool' }, { key: 'filter', type: 'bool' },
      { key: 'showSourceControls', type: 'bool' }, { key: 'showTargetControls', type: 'bool' },
      { key: 'controlsPosition', type: 'select', options: ['outside', 'start', 'end'] },
      { key: 'transferPosition', type: 'select', options: ['middle', 'end'] },
      { key: 'stacked', type: 'bool' }, { key: 'noDrag', type: 'bool' },
      { key: 'scrollHeight', type: 'number' }, { key: 'gap', type: 'text' },
      { key: 'borderColor', type: 'color' }, { key: 'borderWidth', type: 'number' }, { key: 'radius', type: 'text' },
      { key: 'headerBackground', type: 'color' }, { key: 'headerColor', type: 'color' },
      { key: 'listBackground', type: 'color' }, { key: 'itemColor', type: 'color' },
      { key: 'selectedBackground', type: 'color' }, { key: 'selectedColor', type: 'color' },
      { key: 'selectedBorderColor', type: 'color' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['modelValue', '[Item[], Item[]]', '[[], []]', 'v-model — first element is the source list, second is the target'],
      ['dataKey', 'string', '—', 'Stable key per item'],
      ['sourceHeader / targetHeader', 'string', "'Available' / 'Selected'", 'Header text'],
      ['checkbox', 'boolean', 'false', 'A box per row plus a select-all in each header; works with drag-and-drop'],
      ['filter / filterPlaceholder', 'boolean / string', 'false', 'Search box under each header'],
      ['showSourceControls / showTargetControls', 'boolean', 'false', 'Reorder controls for a list — off by default, since most pick lists only move items'],
      ['controlsPosition', "'outside' | 'start' | 'end'", "'outside'", 'Where each reorder stack sits. outside keeps them clear of the centre — source left, target right'],
      ['transferPosition', "'middle' | 'end'", "'middle'", 'Between the lists, or after both'],
      ['stacked', 'boolean', 'false', 'Stack the lists vertically; the transfer arrows rotate'],
      ['noDrag', 'boolean', 'false', 'Disable drag-and-drop'],
      ['scrollHeight', 'number', '300', 'Max list height in pixels'],
      ['borderColor / borderWidth / radius', 'string / number / string', 'tokens', 'Panel border'],
      ['headerBackground / headerColor', 'string', 'tokens', 'Header colours'],
      ['listBackground / itemColor', 'string', 'tokens', 'List colours'],
      ['selectedBackground / selectedColor / selectedBorderColor', 'string', 'accent-derived', 'Selected row'],
      ['gap', 'string', "'12px'", 'Space between the panels and the control stacks'],
      ['emptyMessage', 'string', '—', 'Note shown in a list with nothing in it'],
      ['disabled', 'boolean', 'false', 'Blocks moving, reordering and filtering'],
    ],
    events: [
      ['update:modelValue', '[Item[], Item[]]'],
      ['reorder', '{ side, from, to }'],
      ['move-to-target / move-to-source', '{ items }'],
      ['move-all-to-target / move-all-to-source', '{ items }'],
      ['selection-change', '{ side, items }'],
    ],
    slots: [
      ['option', 'Item markup; receives { item, index, side }'],
      ['sourceheader / targetheader', 'Header content for either list'],
    ],
  },

  {
    id: 'orgchart', name: 'ApexOrgChart', group: 'Data',
    blurb: 'A hierarchy drawn top-down or left-to-right with CSS connectors. Collapsing and selection are both controlled through bindable key maps, so the chart never owns state the app might need.',
    noField: true, 
    demo: 'data-tabular',
    base: { collapsible: true, selectionMode: 'single', orientation: 'vertical' },
    controls: [
      { key: 'collapsible', type: 'bool' },
      { key: 'selectionMode', type: 'select', options: ['', 'single', 'multiple', 'checkbox'] },
      { key: 'orientation', type: 'select', options: ['vertical', 'horizontal'] },
      { key: 'nodeGap', type: 'text' }, { key: 'levelGap', type: 'text' },
      { key: 'lineColor', type: 'color' }, { key: 'lineWidth', type: 'number' },
      { key: 'nodeBackground', type: 'color' }, { key: 'nodeColor', type: 'color' },
      { key: 'nodeBorderColor', type: 'color' }, { key: 'nodeBorderWidth', type: 'number' },
      { key: 'nodeRadius', type: 'text' },
      { key: 'selectedBackground', type: 'color' }, { key: 'selectedColor', type: 'color' },
      { key: 'selectedBorderColor', type: 'color' },
    ],
    props: [
      ['value', 'OrgNode | OrgNode[]', '—', '{ key, label, subtitle?, icon?, image?, type?, styleClass?, selectable?, data?, children? } plus per-node background / color / borderColor'],
      ['collapsible', 'boolean', 'false', 'Collapse control on every node with children'],
      ['collapsedKeys', 'Record<string, boolean>', '{}', 'v-model:collapsedKeys — a key set to true is collapsed; absent keys stay open'],
      ['selectionMode', "'single' | 'multiple' | 'checkbox' | null", 'null', 'Checkbox cascades to descendants'],
      ['selectionKeys', 'Record<string, boolean>', '{}', 'v-model:selectionKeys — keys set to true are selected'],
      ['orientation', "'vertical' | 'horizontal'", "'vertical'", 'Top-down or left-to-right'],
      ['lineColor / lineWidth', 'string / number', 'token / 1', 'Connector colour and thickness'],
      ['nodeBackground / nodeColor', 'string', 'tokens', 'Node fill and text colour'],
      ['nodeBorderColor / nodeBorderWidth', 'string / number', 'token / 1', 'Node border'],
      ['nodeRadius', 'string', 'var(--r-md)', 'Node corner radius'],
      ['selectedBackground / selectedColor / selectedBorderColor', 'string', 'accent-derived', 'The selected state'],
      ['partialBorderColor', 'string', 'accent 45%', 'Checkbox partial state on an ancestor'],
      ['nodeGap / levelGap', 'string', 'per orientation', 'Space between siblings and between levels. Unset, each orientation uses its own default — horizontal needs a wider level gap, since that gap carries the connector corner and the collapse control side by side'],
    ],
    events: [
      ['update:collapsedKeys', 'Record<string, boolean>'],
      ['update:selectionKeys', 'Record<string, boolean>'],
      ['node-expand / node-collapse', 'OrgNode'],
      ['node-select / node-unselect', 'OrgNode'],
    ],
    slots: [
      ['default', 'Node content; receives { node, selected, partialSelected, collapsed }. The chart still draws the card and the collapse control around it'],
      ['toggleicon', 'Collapse indicator; receives { collapsed }'],
    ],
  },

  {
    id: 'dataview', name: 'ApexDataView', group: 'Data',
    blurb: 'The same dataset as a list or a grid of cards, on the paginator and sort pipeline the table uses. Both layouts are built in — the grid is CSS grid driven by gridMinWidth, so no utility framework is needed.',
    noField: true, 
    demo: 'data-simple',
    base: { layout: 'list', paginator: true, rows: 4, showLayoutSwitcher: true, gridMinWidth: '240px' },
    controls: [
      { key: 'layout', type: 'select', options: ['list', 'grid'] },
      { key: 'showLayoutSwitcher', type: 'bool' },
      { key: 'paginator', type: 'bool' }, { key: 'rows', type: 'number' },
      { key: 'gridMinWidth', type: 'text' }, { key: 'gap', type: 'text' },
      { key: 'caption', type: 'text' }, { key: 'bordered', type: 'bool' },
      { key: 'loading', type: 'bool' },
      { key: 'loadingMode', type: 'select', options: ['skeleton', 'overlay'] },
      { key: 'skeletonCount', type: 'number' },
    ],
    props: [
      ['value', 'Row[]', '[]', 'The records'],
      ['layout', "'list' | 'grid'", "'list'", 'v-model:layout when paired with the switcher'],
      ['showLayoutSwitcher', 'boolean', 'false', 'Segmented list/grid control in the bar'],
      ['sortField / sortOrder', 'string / 1 | -1', '—', 'Bind these from your own UI'],
      ['sortOptions', '{ label, field, order }[]', '—', 'Renders a built-in sort select'],
      ['paginator / rows / first', 'boolean / number / number', 'false / 12 / 0', 'first is bindable'],
      ['rowsPerPageOptions', 'number[]', '—', 'Page-size selector'],
      ['lazy / totalRecords', 'boolean / number', 'false', 'Server-side paging and sorting'],
      ['gridMinWidth', 'string', "'240px'", 'Minimum card width; the grid fits as many as will go'],
      ['gap', 'string', "'0px'", 'Grid gap — 0 keeps the cards on a shared hairline'],
      ['dataKey', 'string', '—', 'Stable key per record'],
      ['loading / loadingMode', 'boolean / skeleton|overlay', 'false / skeleton', ''],
      ['skeletonCount', 'number', '6', 'Placeholder items while loading'],
      ['emptyMessage', 'string', "'No records found'", ''],
      ['sortPlaceholder', 'string', "'Sort by'", 'Placeholder in the sort selector'],
      ['paginatorTemplate', 'string', "'Showing {first}–{last} of {total}'", 'Summary line — the same tokens ApexPaginator takes'],
      ['bordered', 'boolean', 'true', 'The frame around the view'],
      ['caption', 'string', '—', 'A line in the toolbar above the items'],
    ],
    events: [
      ['update:layout', "'list' | 'grid'"],
      ['update:first / update:rows', 'number'],
      ['update:sortField / update:sortOrder', 'value'],
      ['page', '{ first, rows, page }'],
      ['sort', '{ sortField, sortOrder }'],
    ],
    slots: [
      ['list', 'Item markup in list layout; receives { item, index, layout }'],
      ['grid', 'Item markup in grid layout'],
      ['item', 'Used for both layouts when they are the same'],
      ['header / footer', 'Bar content and content below the paginator'],
      ['skeleton / empty / loading', 'State content'],
    ],
  },

  {
    id: 'paginator', name: 'ApexPaginator', group: 'Data',
    demo: 'data-simple',
    blurb: 'Page controls, usable on their own. `first` is the zero-based index of the first visible row, so it maps straight onto a server offset.',
    noField: true,
    base: { rows: 10, totalRecords: 84, rowsPerPageOptions: [10, 20, 50] },
    controls: [
      { key: 'rows', type: 'number' }, { key: 'totalRecords', type: 'number' },
      { key: 'pageLinks', type: 'number' }, { key: 'template', type: 'text' },
      { key: 'disabled', type: 'bool' },
    ],
    props: [
      ['first', 'number', '0', 'v-model:first — index of the first visible row'],
      ['rows', 'number', '10', 'v-model:rows — page size'],
      ['totalRecords', 'number', '0', ''],
      ['rowsPerPageOptions', 'number[]', '—', 'Page-size choices; omit to hide the selector'],
      ['pageLinks', 'number', '2', 'Page buttons either side of the current one'],
      ['template', 'string', "'Showing {first}–{last} of {total}'", 'Tokens: {first} {last} {total} {page} {pageCount}'],
      ['disabled', 'boolean', 'false', 'Blocks every page control'],
    ],
    events: [['update:first', 'number'], ['update:rows', 'number'], ['page', '{ first, rows, page }']],
  },

  /* ── Scheduler and Calendar ────────────────────────────────
     Extracted from the gallery like the nine before them. The handover's
     §2 says these two 'have no gallery entries to copy from' and must be
     authored — they do, and the payload matches its own §5.6 table
     exactly (13/44 and 19/58). Verified from the file, not the note. */
  {
    id: 'scheduler', name: 'ApexScheduler', group: 'Scheduler',
    blurb: 'A resource timeline: rooms, vehicles or people down one axis and time across the other, from a full year to 15-minute slots. Nothing here mutates events — every interaction emits a payload, the same rule ApexTaskBoard follows. The axis, the lane packing and the recurrence are pure functions in core/scheduler, shared by both implementations, because a lane index or a week boundary that differed between them is exactly the bug no browser probe would catch.',
    noField: true, 
    demo: 'sched',
    lead: [':resources="rooms"', ':events="events"', ':group-fields="groupFields"'],
    tail: '\n  @event-save="onSave"\n  @event-move="onMove"\n/>',
    base: {
      mode: 'day', leafLabel: 'Room', leafIcon: 'meeting_room', height: '420px',
      resourceWidth: '280px', draggable: true, creatable: true, inlineEditor: true,
      showToolbar: true, showGrouping: true, showLegend: true, chipsPerCell: 2, scrollToHour: 7,
    },
    controls: [
      { key: 'mode', type: 'select', options: ['year', 'month', 'day', 'quarter'] },
      { key: 'draggable', type: 'bool' }, { key: 'creatable', type: 'bool' },
      { key: 'inlineEditor', type: 'bool' },
      { key: 'showToolbar', type: 'bool' }, { key: 'showGrouping', type: 'bool' },
      { key: 'showLegend', type: 'bool' },
      { key: 'chipsPerCell', type: 'number' }, { key: 'scrollToHour', type: 'number' },
      { key: 'leafLabel', type: 'text' }, { key: 'leafIcon', type: 'text' },
      { key: 'height', type: 'text' }, { key: 'resourceWidth', type: 'text' },
    ],
    props: [
      ['resources', 'SchedulerResource[]', '[]', '{ id, room, …your own fields }. Any field can be grouped by; `room` is only the default leaf label'],
      ['events', 'SchedulerEvent[]', '[]', '{ id, roomId, type, title, start, end, rrule? } with times as epoch milliseconds. Never mutated — the component reads it and emits changes'],
      ['mode', "'year' | 'month' | 'day' | 'quarter'", "'day'", 'Two SHAPES, not four: year and month are DISCRETE (a column is a unit and an event belongs to one), day and quarter are CONTINUOUS (position is a fraction of the span). The axis carries the flag so every consumer branches once'],
      ['anchor', 'Date', 'today', 'The date the axis is built around. v-model:anchor — or leave it and let the toolbar navigate'],
      ['groupKeys', 'string[]', '[]', 'v-model:groupKeys — which resource fields to nest by, outermost first. “Building then floor” is configuration, not a code path'],
      ['groupFields', 'SchedulerGroupField[]', '[]', '{ key, label, icon? } — what the grouping bar offers, in MASTER order. Toggling reorders by that order rather than by click order, since a hierarchy decided by the order of clicks produces a tree nobody asked for. Empty hides the bar'],
      ['types', 'Record<string, SchedulerTypeMeta>', 'four demo types', "{ label, icon?, tone?, createLabel? } per event type. The app names its own types and maps each to a design-system tone — info, success, warn, danger, help, neutral — so the stylesheet never learns a consumer's vocabulary"],
      ['leafLabel / leafIcon', 'string', "'Resource' / 'meeting_room'", 'What one row is called, for the corner, the grouping bar and the editor'],
      ['resourceName / resourceSub', '(r) => string', "r.room / —", 'The row label and the line under it. Functions, because capacity, building or occupancy is the app’s knowledge'],
      ['draggable', 'boolean', 'true', 'Continuous views only — a month or year cell has no time to drop into. A RECURRING occurrence is draggable now: the shared recurrence core can express "this occurrence / this and following / all", so the gesture pauses on that question instead of being refused. The old refusal was honest with no exception model; with one it would have been a limitation'],
      ['resizable', 'boolean', 'true', 'Drag the trailing edge — the INLINE-end one, so the left in RTL — to change a booking’s length. The start is untouched and the end floors at 15 minutes, because a gesture meant to shorten a booking must not delete it. A zone of the block rather than a handle element'],
      ['newId', '(inst) => string', "id + '-' + base36 time", '"This and following" splits ONE record into TWO, and the new series needs an id — only the app knows what its ids look like'],
      ['creatable', 'boolean', 'true', 'Right-click a track for a create menu, one item per event type, at the quarter-hour under the pointer. A discrete cell has no time, so it offers midday — a better guess than 00:00'],
      ['inlineEditor', 'boolean', 'true', 'Renders the built-in popover and create/edit dialog. Off, the same gestures emit event-click and create-request and draw nothing, for a host with its own booking form'],
      ['chipsPerCell', 'number', '2', 'Events drawn in a month or year cell before it reads “+N more”'],
      ['scrollToHour', 'number', '7', 'Where a continuous view starts scrolled to — nobody opens a day view to look at 03:00'],
      ['showToolbar / showGrouping / showLegend', 'boolean', 'true', 'Each chrome strip off independently. The grouping bar also needs groupFields to be non-empty — a bar offering nothing to group by is worse than no bar — so it is the one that can be absent with its prop still true'],
      ['height / resourceWidth', 'string', "'70vh' / '300px'", 'The scroll viewport and the sticky row-head column'],
    ],
    events: [
      ['event-save', '{ id?, resourceId, type, title, start, end, rrule } — one payload for create and edit; `id` absent means create'],
      ['event-move', '{ id, resourceId, start, end, scope, occurrenceStart, update, create? } — a drag landed, snapped to the quarter hour and clamped inside the axis. `update` (and `create`, when the scope split the series) are the records to PERSIST: the split arithmetic is the core’s job. The original four fields are kept alongside, so a host written before scoped edits keeps working — but one that only patches by id silently loses the split'],
      ['event-resize', 'The same payload. Separate from event-move because an app routinely permits one and refuses the other — "you may reschedule a booking but not extend it past its paid duration"'],
      ['event-delete', '{ id }'],
      ['event-click', '{ instance, originalEvent } — the INSTANCE, so a recurring occurrence carries its own start and end'],
      ['create-request', '{ resourceId, start, type } — only with inlineEditor off'],
      ['range-change', '{ from, to, mode } — the visible window, for fetching a page of bookings'],
      ['update:mode / update:anchor / update:groupKeys', 'The toolbar and grouping bar report every navigation'],
    ],
    slots: [
      ['event', 'A timeline bar’s body. The SAME context ApexCalendar binds — `{ event, compact, clipped, tone, view, time }` — so a host using both learns one shape, not two. Geometry, drag and resize stay on the wrapper'],
      ['resource', 'A row head. Bound `{ resource, row, name, sub, group, open }`; supersedes `resourceName` / `resourceSub` for anything richer than two strings, and both keep working as the default'],
      ['column-header', 'One axis column. Bound `{ column, label, sub, today }`. The tier-1 band above it is the axis’s own summary and stays ours'],
      ['chip', 'A discrete-cell chip — its own slot rather than `#event`, because a chip is a different SHAPE from a timeline bar (icon thumb, title row, date line). Same context plus `icon`'],
      ['popover', 'The whole popover body, heading and meta included. Bound `{ ...event context, resource, close, edit, remove }` — the three actions, so a host’s own chrome can drive them'],
      ['scope-prompt', 'The "this / this and following / all" dialog. Bound `{ event, title, choose, cancel, options }`; `options` is the three scopes as DATA so a template renders them without knowing the scope strings. ApexCalendar exposes the SAME slot with the same bindings — one question asked in two places'],
    ],
    serviceTitle: 'Core and ref methods', serviceFn: 'core/scheduler',
    serviceRows: [
      ['buildAxis(mode, anchor)', 'SchedulerAxis', 'Columns, two header tiers, pixel width and the `continuous` flag'],
      ['applyScope(event, occurrenceStart, scope, patch)', '{ update, create? }', 'The SAME core function ApexCalendar uses, and the same three-choice prompt — one implementation of a question both components ask. "This occurrence" writes an override keyed by the occurrence’s original start; "this and following" closes the original series the day before and starts a new one, which is why it returns two records; "all" patches the series in place'],
      ['checkConstraints(rules, candidate)', 'ConstraintResult', 'Allows must CONTAIN the candidate, denies must not OVERLAP it, and the result names the constraint that refused so the message can be its own. Checked DURING a drag as well as on drop — seeing a position refuse before letting go is the difference between a rule and a surprise'],
      ['inlineOffset(el, clientX)', 'core/i18n', 'Every mapping of x to TIME measures from the INLINE-start edge, and the direction is read from the RENDERED element rather than a locale prop — `dir` is inherited, so a host can flip a component from any ancestor without it being told. `clientX - rect.left` is only correct in LTR: in RTL the timeline’s origin is on the right, so a left-based measurement returns a MIRRORED time while the logical-property layout looks perfectly correct'],
      ['axisOffset / axisWindow / snapToAxis', 'number / range / number', 'Where a timestamp sits, what is visible, and the quarter-hour snap the drag uses'],
      ['expandSeries(event, from, to)', 'occurrences', 'A deliberate RRULE subset — FREQ, INTERVAL, BYDAY, COUNT, UNTIL. A non-recurring event returns one occurrence rather than taking a separate path, which is where an off-by-one lives'],
      ['ruleText / ruleToRepeat / repeatToRule', 'string / preset / rule', 'The rule in words, and the presets in both directions so the editor and the stored rule share one vocabulary'],
      ['groupRooms / flattenNodes / allGroupIds', 'tree / rows / ids', 'Grouping honours the caller’s resource order, not the alphabet — floors run bottom to top'],
      ['lanesFor / rowHeight', '{ placed, laneCount } / number', 'Overlapping bookings STACK rather than paint over each other: a double booking is information, and hiding it behind whichever drew last is the one thing a scheduler must not do'],
      ['instancesByResource(events, axis)', 'Record<id, instances>', 'Bucketed once per change rather than each row filtering every event, which is O(rooms × events)'],
      ['openCreate(resourceId, start, type?)', 'ref method', 'Opens the editor from your own “New booking” button'],
      ['expandAll() / collapseAll() / goToday() / step(±1)', 'ref methods', 'Drive the tree and the axis from a host toolbar'],
      ['state attributes', 'data-tone, data-compact, data-recurring, data-draggable, data-resizable, data-today, data-group, data-apex-custom', 'Stable hooks on the rendered parts, so a stylesheet or a test never inspects internals'],
    ],
  },

  {
    id: 'calendar', name: 'ApexCalendar', group: 'Calendar',
    blurb: 'Month, week, day and agenda views over one zone-aware core. Every date question — which day an instant belongs to, how long a day is, where a bar starts — is answered in the selected time zone, because "which day is this?" has no answer without one. All-day events are DATES and timed events are INSTANTS: two shapes in the public type, collapsed once at the boundary, so the distinction cannot be forgotten halfway through. Nothing here mutates events; every interaction emits a payload.',
    noField: true, 
    demo: 'cal',
    lead: [':events="events"', 'view="month"', ':locale="locale"'],
    tail: '\n  @event-click="onEventClick"\n  @date-click="onDateClick"\n/>',
    base: {
      view: 'month', locale: 'en-GB', timeZone: 'Europe/Malta', maxEventsPerDay: 3,
      showWeekNumbers: true, fixedWeeks: false, slotDuration: 30, slotMinTime: 360,
      slotMaxTime: 1320, slotHeight: 24, listDays: 7, height: '520px',
    },
    controls: [
      { key: 'view', type: 'select', options: ['month', 'week', 'day', 'list', 'year'] },
      { key: 'yearLayout', type: 'select', options: ['grid', 'stack', 'continuous'] },
      { key: 'eventVariant', type: 'select', options: ['solid', 'soft', 'outline'] },
      { key: 'editable', type: 'bool' }, { key: 'resizable', type: 'bool' },
      { key: 'inlineEditor', type: 'bool' },
      { key: 'locale', type: 'select', options: ['en', 'en-GB', 'de-DE', 'it-IT', 'ar-EG'] },
      { key: 'timeZone', type: 'select', options: ['Europe/Malta', 'America/New_York', 'Pacific/Auckland'] },
      { key: 'maxEventsPerDay', type: 'number' }, { key: 'listDays', type: 'number' },
      { key: 'showWeekNumbers', type: 'bool' }, { key: 'fixedWeeks', type: 'bool' },
      { key: 'showToolbar', type: 'bool' },
      { key: 'slotDuration', type: 'number' }, { key: 'slotMinTime', type: 'number' },
      { key: 'slotMaxTime', type: 'number' }, { key: 'slotHeight', type: 'number' },
      { key: 'height', type: 'text' }, { key: 'rowHeight', type: 'text' },
    ],
    props: [
      ['events', 'CalendarEvent[]', '[]', 'A UNION, not a flag: a timed event is { start, end } in epoch milliseconds, an all-day one is { allDay: true, startDate, endDate } as YYYY-MM-DD with endDate INCLUSIVE. An all-day event is a DATE — push it through the timed conversion and a booking made in Auckland shows a day early in Europe. Never mutated'],
      ['backgroundEvents', 'CalendarEvent[]', '[]', 'Tinted regions. A background event is a RENDERING; a constraint is a RULE. Pass the same object to both props when you want a visible rule — that is the whole reason they are two props'],
      ['constraints', 'CalendarConstraint[]', '[]', 'Where an event MAY be. `{ mode: "allow" }` names a window bookings must fall INSIDE, `{ mode: "deny" }` one they must not touch; allows are OR-ed, so "weekdays 9–5 or Saturday mornings" is one rule rather than two competing ones. `minTime`/`maxTime` plus `weekdays` express business hours without a rule per day, and `resourceIds`/`eventTypes` scope a rule to some rooms or kinds. An ALL-DAY candidate ignores clock-based rules: "nothing before 09:00" says nothing about an event that has no time, and refusing it would be answering a question the rule never asked'],
      ['validate', '(candidate) => boolean | string', '—', 'The last word, for rules the declarative form cannot express — "not within two hours of another booking in this room". Runs AFTER the declarative pass, which is the cheap one and answers most refusals. Return a string to supply the message'],
      ['resources', 'CalendarResource[]', '[]', '{ id, title? } as COLUMNS — the transpose of ApexScheduler, which puts resources down the side and time across. The DAY view only: a week of seven days × N resources is a nested header this grid does not draw, and pretending otherwise would show one room’s bookings under another’s column. Overlap columns are computed WITHIN a resource, or two bookings in different rooms would divide a width they do not share. Dragging across columns reassigns the booking — "move this to Room B" is one gesture'],
      ['view', "'month' | 'week' | 'day' | 'list'", "'month'", 'v-model:view. Month and the all-day strip share ONE segment packer — the strip is a one-row month matrix, so multi-day bars cannot disagree between the two'],
      ['views', 'CalendarView[]', 'all four', 'What the switcher offers; one view hides it'],
      ['anchor', 'Date | number', 'now', 'v-model:anchor — or leave it and let the toolbar navigate. Each view steps by its own unit, in CALENDAR days rather than 24-hour blocks'],
      ['timeZone', 'string', "the browser's", 'An IANA name. Day boundaries, the all-day strip, the now-line and the agenda grouping all resolve through it'],
      ['locale', 'string | ApexLocalePack', 'the system selection', 'A pack code or a pack. Month and weekday names, the clock, digits, first day of week, week-number scheme and direction all come from it — Arabic gives dir="rtl", Arabic-Indic numerals and a Saturday-first header'],
      ['firstDay', 'number', "the locale's", '0 = Sunday. Overrides the pack'],
      ['types', 'Record<string, CalendarTypeMeta>', '{}', 'The app names its own event types and maps each to a design-system TONE — info, success, warn, danger, help, neutral — so the stylesheet never learns a consumer’s vocabulary'],
      ['eventVariant', "'solid' | 'soft' | 'outline'", "'solid'", 'How an event is PAINTED, not how it is structured. `soft` is a tone-tinted wash with a coloured inline-start edge and dark text; `outline` is a bordered card with an accent rule. All three render the same two lines, which is the point: the common case of "we want the softer look" needs no template, and therefore does not re-implement the compact rule, the recurring icon, the clipped dashes or the invalid stripes — four things a hand-written template gets subtly wrong. Slots are for STRUCTURE, variants for PAINT. On a multi-day bar the accent marks a START, so a segment continuing in from the previous row keeps its flat edge'],
      ['maxEventsPerDay', 'number', '3', 'Lanes drawn before a cell reads "+N more". The overflow is REPORTED, not dropped: the cell carries a count and the events themselves, for the popover'],
      ['maxAllDay', 'number', '3', 'The same cap for the all-day strip above a week or day grid, which is packed by the SAME segment code as a month row — a multi-day bar has to break across the week boundary identically in both, and a second implementation would drift on exactly that case'],
      ['slotDuration / slotMinTime / slotMaxTime', 'number', '30 / 0 / 1440', 'Minutes. The window is wall-clock minutes whatever the day’s length, so the spring-forward day shows an empty band where 02:00–03:00 did not happen — compressing the axis would misplace every other event on the day'],
      ['slotHeight', 'number', '24', 'Pixels per slot. The axis is a fixed height and a block’s top is its wall-clock fraction, so 09:30 lands in the same place either side of a transition'],
      ['scrollToTime', 'number', '480', 'Minutes from midnight the time grid opens at — nobody opens a week view to look at 03:00'],
      ['listDays', 'number', '7', 'Days the agenda covers, and the step its nav takes'],
      ['yearLayout', "'grid' | 'stack' | 'continuous'", "'grid'", 'How the twelve months are arranged — wrapped into a responsive grid, one per row, or a single continuous run. The year view is the MONTH view at a smaller scale: the same segment packer, the same bar markup, only the metrics change. A second implementation of bars-in-a-row would drift on exactly the "+N more" arithmetic and lane order it exists to get right. The grid layout shows one lane per day because a 230px month has room for one'],
      ['showZoneLabel', 'boolean', 'true', 'The zone’s short offset in the time-grid corner — "GMT+2", from Intl so it is localised and DST-correct. The corner was empty, and a component that answers every date question through an IANA zone should name the one it used: two viewers of the same data in different zones otherwise see different grids with nothing to explain it'],
      ['showWeekNumbers / fixedWeeks / showToolbar', 'boolean', 'false / false / true', 'Week numbers follow the pack’s scheme, ISO or local. fixedWeeks always draws six rows so the grid does not resize as months change'],
      ['editable / resizable', 'boolean', 'false / true', 'Drag an event to move it; drag its trailing edge — the bottom on a time grid, the right on a month bar — to change its length. The edge is a ZONE of the block rather than a handle element, since a 7px child on every event is a lot of DOM for something only the pointer ever finds'],
      ['inlineEditor', 'boolean', 'true', 'The built-in create/edit dialog: title, type, an all-day switch, a start, a duration (minutes when timed, DAYS when all-day) and a repeat preset. Off, the same gestures report and draw nothing — for a host whose booking form already exists, and whose validation and pricing belong to it rather than to a component'],
      ['durations', 'number[]', '15…240 min', 'What the editor offers. A length in days replaces it for an all-day event, because "90 minutes" is not a length an all-day booking has'],
      ['newId', '(event) => string', "id + '-' + base36 time", '"This and following" splits ONE record into TWO, and the new series needs an id — only the app knows what its ids look like'],
      ['height / rowHeight', 'string', "auto / '96px'", 'Row height is a FLOOR — a busy week grows past it rather than clipping'],
    ],
    events: [
      ['event-click', '{ event, originalEvent } — the RESOLVED event, so a recurring occurrence carries its own start, its original start and its override'],
      ['date-click', '{ date, key, originalEvent } — a month cell'],
      ['slot-click', '{ start, end, date, originalEvent } — empty time-grid space, snapped down to slotDuration'],
      ['more-click', '{ key, events } — the hidden events of one cell'],
      ['event-move', '{ event, start, end, scope, occurrenceStart, update, create? } — a drag finished. update (and create, when the scope split the series) are the records to PERSIST: the split arithmetic is the core’s job, not the host’s'],
      ['event-resize', 'The same payload. Separate from event-move because an app routinely permits one and refuses the other — "you may reschedule a booking but not extend it past its paid duration"'],
      ['edit-refused', '{ event?, start, end, resourceId?, reason, constraint? } — a gesture a constraint would not allow. Emitted rather than swallowed: the host owns the telling, and a component that only reverts leaves the author guessing whether the drag is broken or disallowed'],
      ['event-save', '{ record } for a NEW event, or { id, scope, occurrenceStart, update, create? } for an edit. A repeat change never goes through the per-occurrence scopes — an override cannot hold a rule, so changing the repeat is a change to the series by definition'],
      ['event-delete', '{ id, scope, occurrenceStart, update? , remove? } — either the record to persist (an EXDATE, or a series closed the day before) or the instruction to drop it entirely'],
      ['range-change', '{ from, to, view } — the visible window, for fetching a page of events'],
      ['update:anchor / update:view', 'Every navigation reports'],
    ],
    slots: [
      ['event', 'The event body, in every view. Bound `{ event, compact, clipped, tone, view, time }` — the facts a host cannot derive. The WRAPPER keeps geometry and state: position, size, `data-tone`, `data-compact`, `data-invalid`, the tooltip and the pointer handlers all stay ours, so drag, resize, the scope prompt and the constraint stripes work inside a custom template with the host doing nothing. `--tone-ink` is in scope, so `background: var(--tone-ink)` stays inside the design system rather than hardcoding hex. One slot serves all views and branches on `view`; its padding is dropped when supplied, so the template owns its box'],
      ['day-cell', 'A month or year cell’s day number area — where a badge or a daily total goes. Bound `{ day, number, today, outside, hidden, events, view }`: `hidden` is the "+N more" count and `events` those starting that day, so a host does not re-derive what the segment packer already knows'],
      ['day-header', 'One weekday heading. Bound `{ label, weekday, index, view }` — `weekday` is the real 0–6 weekday, not the column position, so "highlight the weekend" survives any `firstDay`'],
      ['list-item', 'An agenda row. Bound the SAME context as `#event` plus `day`, so one template can serve both'],
      ['more-popover', 'The whole "+N more" body, heading included — a bare event list under our own title is not a customisation. Bound `{ events, day, title, close }`; call `close()` to dismiss'],
      ['scope-prompt', 'The "this / this and following / all" dialog. Bound `{ event, title, choose, cancel, options }` — identical to ApexScheduler’s, because it is one question asked in two places'],
      ['toolbar-start', 'Before the navigation. Bound `{ view, anchor }`'],
      ['toolbar-end', 'Extra controls after the view switcher'],
    ],
    serviceTitle: 'Core, zones and recurrence', serviceFn: 'core/calendar',
    serviceRows: [
      ['zonedParts / fromZonedParts', 'parts ↔ instant', 'Over Intl.DateTimeFormat.formatToParts, the only zone database a browser has. The inverse guesses, measures the offset there, corrects and measures again — one refinement, because the first guess can land on the wrong side of a transition and read the wrong offset'],
      ['dayKey / parseDayKey', 'YYYY-MM-DD', 'A day’s identity, and what everything joins on. A string because a DATE has no instant: 23:30 in Malta is already tomorrow in Auckland'],
      ['addZonedDays / dayLengthHours', 'calendar arithmetic', 'A day is 23 or 25 hours twice a year. Adding a fixed 24 drifts across a transition — the bug that lost an occurrence in core/recurrence before it was measured'],
      ['monthMatrix / dayRange', 'weeks / days', 'The grid a month draws, and the day list a week or agenda uses. daysPerRow makes the all-day strip the same function'],
      ['segmentWeeks', 'row segments', 'One bar per row, longest first so lanes never cross, open-ended at row edges, overflow reported per cell'],
      ['layoutDayColumn', 'positioned events', 'Overlaps DIVIDE the column — collision clusters, a column each within a cluster, so a chain A|B, B|C agrees about B’s width. Stacking would hide a double booking, the one thing a calendar must not do'],
      ['groupByDay', 'agenda groups', 'A multi-day event appears under EVERY day it covers, because a list answers "what is happening on this day". Empty days are omitted'],
      ['expandCalendar', 'resolved instances', 'Recurrence through core/recurrence — the same expansion ApexScheduler uses, EXDATEs and overrides included'],
      ['applyScope(event, occurrenceStart, scope, patch)', '{ update, create? }', 'The three write scopes. "This occurrence" writes an override keyed by the occurrence’s ORIGINAL start; "this and following" closes the original the day before and starts a new series, which is why it returns two records; "all" patches the series in place'],
      ['the scope prompt', 'built in', 'Dragging a RECURRING occurrence pauses on the question rather than guessing, with the preview left on screen while the author decides. Cancel restores it'],
      ['checkConstraints(rules, candidate)', 'ConstraintResult', 'Allows must CONTAIN the candidate, denies must not OVERLAP it, and the result names the constraint that refused so the message can be its own. Checked DURING a drag as well as on drop — seeing a position refuse before letting go is the difference between a rule and a surprise'],
      ['inlineOffset(el, clientX)', 'core/i18n', 'Every mapping of x to TIME measures from the INLINE-start edge, and the direction is read from the RENDERED element rather than a locale prop — `dir` is inherited, so a host can flip a component from any ancestor without it being told. `clientX - rect.left` is only correct in LTR: in RTL the timeline’s origin is on the right, so a left-based measurement returns a MIRRORED time while the logical-property layout looks perfectly correct'],
      ['resource timelines', 'ApexScheduler', 'Resources as ROWS with time across is the scheduler, not this component. This one puts DATES across and time down'],
    ],
  },
  {
    id: 'editor', name: 'ApexEditor', group: 'Editor',
    blurb: 'A rich text editor over ProseMirror. The document is JSON and JSON is the source of truth \u2014 HTML is an export rather than the storage format, because a tree can be queried, validated and migrated where an HTML string can only be re-parsed and hoped over. Carries paragraphs and headings, bullet, ordered and task lists, blockquotes, code blocks and dividers; bold, italic, underline, strike, code, highlight, sub, sup and links; block alignment, markdown input rules, history, and a command registry of about thirty actions that a keyboard shortcut, a toolbar button and a slash menu all invoke identically. The writing area declares its own typography rather than inheriting the host page\u2019s, so a document looks like the document wherever it is embedded.',
    noField: true,
    demo: 'editor',
    lead: ['v-model:doc="doc"'],
    tail: '\n/>',
    base: { placeholder: 'Write something\u2026', minHeight: 180, bordered: true, size: 'md' },
    controls: [
      { key: 'placeholder', type: 'text' },
      { key: 'size', type: 'select', options: ['sm', 'md', 'lg'] },
      { key: 'minHeight', type: 'number' }, { key: 'maxHeight', type: 'number' },
      { key: 'bordered', type: 'bool' }, { key: 'readonly', type: 'bool' },
      { key: 'disabled', type: 'bool' }, { key: 'spellcheck', type: 'bool' },
      { key: 'inputRules', type: 'bool' }, { key: 'paste', type: 'bool' },
      { key: 'tables', type: 'bool' }, { key: 'resizableColumns', type: 'bool' },
      { key: 'media', type: 'bool' }, { key: 'embedOnPaste', type: 'bool' },
      { key: 'comments', type: 'bool' },
      { key: 'suggestions', type: 'bool' }, { key: 'suggesting', type: 'bool' },
      { key: 'assist', type: 'bool' },
    ],
    props: [
      ['doc', 'EditorDoc | null', 'empty', 'v-model:doc \u2014 the document as ProseMirror JSON. The editor remembers what it last emitted and ignores the echo, so only a genuinely different document counts as an external change; without that, every keystroke would round-trip through the caller\u2019s model and reset the selection and undo stack on each character'],
      ['placeholder', 'string', "'Write something\u2026'", 'Rendered as a sibling of the document, not as text inside it \u2014 placeholder text in the document would make an empty editor non-empty and export itself'],
      ['readonly / disabled', 'boolean', 'false', 'readonly is still selectable and copyable, since a reader needs to quote it; disabled is the field-level state, neither editable nor focusable'],
      ['autofocus', 'boolean', 'false', ''],
      ['minHeight / maxHeight', 'string | number', '180 / none', 'The writing area grows with content past minHeight; maxHeight makes it scroll'],
      ['bordered', 'boolean', 'true', 'false sits bare inside a caller\u2019s own frame'],
      ['size', "'sm' | 'md' | 'lg'", "'md'", 'Sizes the whole document\u2019s type scale, so headings stay proportional to body text'],
      ['spellcheck / ariaLabel', 'boolean / string', 'true / \u2014', 'Both land on the writing area itself, which is the widget the caret reaches \u2014 not on a wrapper'],
      ['suggestions / suggesting / author', 'boolean / boolean / { id, name }', 'false / false / \u2014', 'Track changes. Both an insertion and a deletion are MARKS, which is the whole design: an insertion could be either, but a deletion has no choice \u2014 the text has to stay in the document and stay VISIBLE until someone accepts it, so \u201cdeleting\u201d while suggesting means marking, never removing. Accepting a deletion is what finally removes the text'],
      ['accept and reject', 'exact inverses', 'accept insertion drops the mark and keeps the text; reject insertion removes it; accept deletion removes it; reject deletion drops the mark and keeps it. One implementation for both verbs, because they differ only in which side keeps the text \u2014 and a track-changes feature whose two verbs are not exact inverses corrupts documents quietly'],
      ['the rewrite', 'before apply', 'A transaction is rewritten before it is applied rather than vetoed by a plugin filter: a filter can only refuse, and turning a deletion into a mark means building the replacement \u2014 and once applied, the text is gone and there is nothing left to mark. Accept and reject transactions carry a flag so the rewriter lets them through, or accepting a deletion would be re-marked as a new deletion and never complete'],
      ['sourceView / toggleSource() / isSourceOpen()', 'boolean / ref methods', 'false', 'An HTML source view, the way TinyMCE\u2019s Code button works. Off by default: a document with tables and figures is far easier to break in source than to build, and most authors never want it. The markup is parsed on EXIT rather than on every keystroke \u2014 half-typed markup is invalid markup, and parsing it would destroy the document mid-edit. Markup that will not parse leaves the view open with the text intact rather than discarding it, since someone who typed it has not asked to lose it. The writing area is hidden with v-show, never v-if: v-if would destroy the element the view is mounted on'],
      ['setHtml(html)', 'ref method', '\u2014', 'Load from an HTML column. Runs through the SAME cleaner as a paste, because HTML from a database is no more trustworthy than HTML from a clipboard \u2014 it may predate the current schema, come from another editor, or have been written by hand. The schema is still the whitelist, so markup it cannot represent is dropped rather than preserved. Applied with addToHistory false, so loading a record is not an undoable edit'],
      ['storing HTML rather than JSON', 'a real trade', 'HTML is the right column type for a website: it renders without the editor, any language can read it, and a template can print it directly. What it cannot carry is EDITORIAL state \u2014 comment anchors and tracked changes are stripped on export by default, so a review workflow needs the JSON. The workable answer for a CMS is both: JSON as the record being edited, HTML written alongside it on save as the column the site renders from'],
      ['assist / onAssist', 'boolean / (request) => void', 'false / \u2014', 'AI seams. No provider is bundled and no prompt is written in the component: the editor emits a request and the APPLICATION answers it, because endpoints, model choice, auth, rate limits, cost control and prompt wording all belong to whoever owns the account. What the editor owns is what an application should not have to solve twice \u2014 where the result lands, and what the document looks like while the request is in flight'],
      ['the result lands as a suggestion', 'not a replacement', 'An assistant that silently rewrites a paragraph gives the author no way to see what changed or to refuse it. So the original range is marked DELETED and the proposal inserted beside it \u2014 exactly what a human suggesting an edit produces, which means accept and reject work on it with no code of their own and a reviewer cannot tell whether a person or a model proposed it. That reuse is why the AI seam comes after suggestions rather than before. Without suggestions enabled there is nothing to propose with, so the result replaces the range outright'],
      ['the in-flight marker', 'a decoration', 'Never part of the document, so a save mid-request cannot persist it and an undo cannot resurrect one whose request already finished \u2014 the same reasoning as the upload placeholder. It is also mapped through every transaction, so the range follows edits made elsewhere while the request is out, and the result is landed against the range READ BACK rather than the one captured when the request was sent'],
      ['comments', 'boolean', 'false', 'Comment anchors. The document stores a thread id on a range and NOTHING else \u2014 the thread, its replies, authors and timestamps live in the application\u2019s database, where they can be queried, paginated, searched and permissioned. Embedding them would make the document grow without bound and mean migrating comment schema every time the comment feature changed'],
      ['a comment is a mark', 'not a node', 'It applies to a RANGE and has to survive editing inside it: a node wrapper breaks the moment an edit crosses its boundary, where a mark is mapped through every step for free. It is not inclusive, so typing at the end of a commented range does not silently join the new text to someone else\u2019s comment \u2014 and it excludes nothing, since two people can comment on overlapping text and a mark excluding itself would make the second delete the first'],
      ['activeThread / resolvedThreads', 'string | null / string[]', '\u2014 / []', 'Painted as DECORATIONS rather than written into the mark, because \u201cactive\u201d belongs to the reader\u2019s focus rather than to the document \u2014 two people reading the same document have different active threads. A resolved thread keeps its anchor but stops competing for attention, which is what \u201cshow resolved\u201d is for'],
      ['media', 'boolean', 'true', 'Images and video embeds. Off keeps them out of the schema, so a paste cannot introduce one'],
      ['onUpload', '(request) => void', '\u2014', 'The editor never uploads. It emits an intent \u2014 { file, resolve, reject } \u2014 and the application answers with a URL, because endpoints, auth headers, retry policy and progress all belong to whoever owns the storage. What the editor does own is the part an app should not have to solve: holding a placeholder while the upload runs and keeping it attached to the right position as the document is edited around it. With no handler the file becomes a data URL \u2014 a working default rather than a silent failure, but not for production, since a data URL bloats the document'],
      ['the upload placeholder', 'a decoration', 'Not a node, for two reasons. A node would be part of the document, so a save mid-upload would persist a placeholder and an undo could resurrect one whose upload had finished. And a decoration set is mapped through every transaction for free, so it stays where the file was dropped even as text is typed above it \u2014 exactly the case a stored position gets wrong. If the placeholder is gone when the promise settles, the result is dropped rather than inserted somewhere arbitrary'],
      ['an image is a figure', 'caption is content', 'A caption is part of what an image means, and expressing it as a following paragraph would let the two drift apart \u2014 a reorder would leave the caption under someone else\u2019s picture. Absent inline content means an UNCAPTIONED image, which is a different thing from an empty caption \u2014 and an empty one shows a prompt, matched by the trailing break ProseMirror puts in every empty textblock rather than by :empty, which can never match because that break is a child'],
      ['image width', 'a ratio', 'A fraction of the container rather than pixels: a document read at 400px and at 1200px should show the same proportion, where a pixel width would be either tiny or overflowing'],
      ['embedOnPaste', 'boolean', 'true', 'A video URL on its own line becomes an embed \u2014 only when the selection is empty, since a URL over a selection means \u201clink this\u201d, and that check has to come first or a video URL would never link anything'],
      ['an embed stores provider and id', 'not an iframe', 'Storing markup would put a third party\u2019s HTML in the document, where it could not be validated, re-themed, or rendered anywhere but a browser. YouTube, Vimeo and Loom are recognised from watch, share or embed URLs \u2014 a closed list rather than \u201cany iframe\u201d, because accepting arbitrary embed HTML would be a way to put third-party script into every document that used the editor'],
      ['the embed\u2019s editing view', 'a preview card', 'Not a live iframe: an iframe inside contenteditable swallows every pointer event, so the node could not be selected, dragged or deleted \u2014 and in an editor the reader is arranging a document rather than watching a video. toDOM stays the storage shape, so a renderer builds the real iframe from the same two attributes'],
      ['tables / resizableColumns', 'boolean', 'true', 'Built on prosemirror-tables. A table\u2019s hard part is not the markup \u2014 it is keeping colspan and rowspan consistent through every edit, so deleting a column that a merged cell spans does the right thing; that bookkeeping IS the library. Turning tables off keeps them out of the SCHEMA entirely, so a paste cannot introduce one the document is not meant to hold'],
      ['table cells', 'colspan, rowspan, colwidth, align', 'colwidth is an ARRAY, because a cell spanning three columns has three widths to remember and collapsing them loses the distribution that was dragged. A width list that no longer matches the span is stale \u2014 a merge happened after the drag \u2014 so it is dropped rather than applied to the wrong cells'],
      ['table layout', 'fixed', 'What makes resizing work at all: with auto layout the browser redistributes widths on every keystroke, so a dragged column springs back as its content changes'],
      ['Tab inside a table', 'moves cells', 'Bound ahead of the list keymap, because inside a table cell movement is what Tab means everywhere else \u2014 and it is the one place the list binding would be actively wrong'],
      ['paste', 'boolean | PasteOptions', 'true', "{ plainTextOnly, parseMarkdown, linkOnPaste, stripTags }. Cleaning runs on the clipboard HTML BEFORE ProseMirror parses it, because the parser faithfully preserves anything the schema can represent \u2014 including a Word document\u2019s worth of empty spacer paragraphs \u2014 and once parsed the damage is indistinguishable from content the author wrote"],
      ['paste \u2014 Word and Docs', 'repaired', 'Both wrap a whole selection in <b style=\"font-weight:normal\">, where the tag says bold and the style says otherwise: taking the tag at its word makes the entire paste bold. Style-implied formatting is rewritten into real tags first, since a Docs span carrying weight AND italic must become <strong><em> \u2014 a parseDOM style rule per mark would each match the same element and only the last would apply'],
      ['paste \u2014 markdown', 'plain text only', 'HTML on the clipboard means the source had structure of its own, and reading its text as markdown would parse a code sample or a URL as formatting. Detection is deliberately strict \u2014 a heading, a fence, a table, or two or more list items, because one line starting with a dash is just a sentence'],
      ['paste \u2014 a URL over a selection', 'links it', 'Rather than replacing it, which is what someone with text selected and a URL copied means'],
      ['slashMenu / slashItems', 'boolean / SlashItem[]', 'true / defaults', 'The / menu. Built as a plugin rather than a keystroke listener, because it has to know the position the / was typed at \u2014 so choosing a command deletes exactly that text in the same transaction that inserts the block, rather than leaving a document where the query had gone but the block was not yet made. Fires only on a / that begins a word, since mid-sentence a slash is a slash and firing on \u201cand/or\u201d or a URL would interrupt writing constantly; never inside a code block'],
      ['inputRules', 'boolean | InputRuleOptions', 'true', "{ markdown, inlineMarks, smartQuotes, dashes }. Shorthands run exactly the command the toolbar button runs, so a document is identical whichever route produced it. smartQuotes is OFF by default: a rule that fires when the author did not mean it is worse than one that never fires, and quote conversion rewrites code and measurements typed deliberately"],
    ],
    events: [
      ['update:doc', 'EditorDoc \u2014 fired only when the document actually changed, not on caret moves'],
      ['change', '{ doc, text }'],
      ['selection-change', '{ marks, blockType, blockAttrs } \u2014 read from the state on every transaction rather than tracked separately, because a toolbar keeping its own idea of \u201cis bold on\u201d drifts the moment the caret moves'],
      ['focus / blur / ready', '\u2014 ready fires once the engine has loaded and the view is mounted'],
      ['paste', "{ kind: 'html' | 'markdown' | 'text' | 'link' | 'embed' | 'file', length }"],
      ['upload-error', '{ file, reason } \u2014 the handler rejected, and the placeholder was removed'],
      ['anchors-change', '{ threadId, from, to, text, top, height }[] \u2014 positions MEASURED from the view, because wrapping, images and tables all affect where a range sits and a gutter that guessed would drift further down with every block. Read on the next frame, since coordsAtPos needs the updated DOM'],
      ['assist-request', '{ action, text, doc, range, options, resolve, reject } \u2014 answer with resolve(text) or refuse with reject(reason). An empty selection scopes to the whole document, but the range is reported either way so a caller can distinguish: \u2018continue\u2019 wants the caret where \u2018summarise\u2019 wants everything'],
      ['assist-error', '{ action, reason } \u2014 the handler refused, and the marker was removed'],
      ['suggestions-change', '{ kind, authorId, authorName, at, from, to, text }[] \u2014 merged into contiguous runs, because a reviewer accepts a CHANGE and three adjacent text nodes from one edit are one change'],
      ['thread-click', '{ threadId } \u2014 read from the position\u2019s marks rather than the DOM, because overlapping comments nest spans and the innermost is not necessarily the one aimed at'],
    ],
    slots: [
      ['empty', 'The placeholder shown for an empty document. Bound `{ placeholder }`. A SIBLING of the document, never text inside it — putting it in the document would make an "empty" editor non-empty and export it'],
      ['loading', 'Shown while the engine loads. The engine is an ES module tree, so first load is a real wait, and an editor showing only its placeholder reads as broken rather than busy'],
      ['error', 'A load or command failure. Bound `{ message }`'],
      ['slash-item', 'One row of the slash menu, FORWARDED into ApexEditorSlash’s own `item` slot rather than duplicated. Bound `{ item, selected, group, index }`'],
      ['toolbar', 'Above the writing area. Receives { active, can, run, link, setLink, unsetLink, view } \u2014 everything a toolbar needs, so the editor never has to know what a toolbar looks like'],
      ['overlay', 'Inside the frame, for the bubble and slash menus: they position against the writing area\u2019s own coordinates, which is the space the selection was measured in'],
      ['gutter', 'Beside the writing area; receives { anchors, activeThread }. The tops are MEASURED from the view, because wrapping, images and tables all affect where a range sits. Stacking is still the caller\u2019s: a card\u2019s height depends on its own content, which the editor cannot know, so two comments closer together than a card is tall need a displacement pass in the gutter \u2014 sort by anchor top, push each card clear of the one above. The gallery\u2019s gutter is a working reference for that'],
      ['footer', 'Below it \u2014 for a word count or a save indicator'],
    ],
    serviceTitle: 'Toolbars, methods, schema and keys', serviceFn: 'ref / core/editor',
    serviceRows: [
      ['ApexEditorToolbar', "preset 'minimal' | 'standard' | 'full', or items", 'Renders from a declaration rather than fixed markup, because the same declaration drives the fixed bar, the bubble menu and the slash menu \u2014 three hand-written toolbars would drift, and the drift shows up as a button that works in one place and not another. Named presets rather than a boolean per button: twenty booleans is a configuration language nobody wants to learn to answer \u201cgive me a normal toolbar\u201d'],
      ['ApexEditorBubble', 'view, active, can, run', 'Positioned from the SELECTION\u2019s rectangle rather than the pointer, since a selection can be made by keyboard. Measures both ends, because a selection spanning lines starts and finishes on different rows, and flips below when there is no room above'],
      ['ApexEditorLink', 'href, target', 'Edits rather than replaces \u2014 it reads the link under the caret. A bare domain gets https://, but anything already carrying a scheme is left alone since prefixing mailto: would corrupt it, and an address that looks like an email becomes a mailto:'],
      ['ApexEditorSlash', 'state, items, coords', 'Rendered from the plugin\u2019s state. Label matches rank above keyword matches and prefixes above substrings, so typing \u201ch2\u201d reaches Heading 2 first. Coordinates track the TRIGGER, not the caret \u2014 otherwise the menu crawls sideways as the query grows'],
      ['table commands', '16 in the registry', 'table_insert, add/delete row and column, merge_or_split (one button, both directions \u2014 merge when cells are selected, split when one merged cell is), toggle_header_row / column / cell, align, delete. Each is guarded by prosemirror-tables\u2019 own applicability, so can(\u2018table_delete_row\u2019) outside a table is false because the library says so'],
      ['active.inTable', 'boolean', 'Rides along with the selection report rather than being asked for separately, so a toolbar sees one consistent snapshot \u2014 and can show sixteen table buttons only when there is a table, rather than a toolbar that is mostly disabled'],
      ['a disabled button', 'the document decided', 'can[name] === false comes from calling the command with no dispatch, which is ProseMirror\u2019s own applicability check. An absent entry means unknown rather than unavailable, so a registry that has not reported yet does not grey out the whole bar'],
      ['getJSON() / getText() / isEmpty()', 'ref methods', 'The document, its plain text, and whether anything has been written'],
      ['focus() / blur()', 'ref methods', ''],
      ['addComment(id) / removeComment(id) / threadsAtSelection()', 'ref methods', 'The id comes from the CALLER: the thread has to exist in the application\u2019s store before the document points at it, or a saved document would reference a thread that was never created. addComment refuses an empty selection \u2014 a comment on a caret has no text to quote and nowhere to paint'],
      ['getSuggestions() / resolveSuggestion(range, verb) / resolveAll(verb, authorId?)', 'ref methods', 'Every accessor carries a get or is prefix, without exception: on an Options-API host props and data sit on the instance and WIN over a method of the same name, so an accessor called suggestions, view, active or sourceOpen is reachable in the SFC and unreachable there. Ranges walk back to front when resolved in bulk, so resolving one does not shift those still to be resolved'],
      ['runAssist(action, options?) / isAssistBusy()', 'ref methods', 'One entry point for every action, so a toolbar button, a slash command and a keyboard shortcut all produce the same request and the same landing'],
      ['toHtml(o) / toMarkdown(o) / toText(o) / wordCount(o)', 'ref methods', 'Export from the document. HTML goes through ProseMirror\u2019s own DOMSerializer, driven by the schema\u2019s toDOM, rather than a second walker \u2014 toDOM is already the single definition of how each node renders, and a hand-written walker would drift the first time a node gained an attribute. Markdown has no such definition to borrow, so it is written to be the exact inverse of our own PARSER: the two have to round-trip, and a serialiser aimed at a dialect we do not read would produce documents we cannot re-open. Verified against a fixture containing an image and an embed \u2014 a round-trip over a document without them proves nothing about them, which is how two wrong node names once survived. One asymmetry is inherent: markdown has a single text slot per image, so an uncaptioned image with alt text re-opens with that alt as its caption \u2014 the better loss, since dropping the alt would lose the accessibility text where gaining a caption is cosmetic'],
      ['ExportOptions', "{ suggestions: 'accept' | 'reject' | 'keep', comments, pretty }", "'accept' / false / false", 'Export ACCEPTS suggestions and drops comment anchors by default, because a published document should carry neither <ins>/<del> nor anchor spans \u2014 those are editorial state rather than content. \u2018keep\u2019 is for a diff view or an audit trail. Stripping rebuilds the document THROUGH the schema, so what comes out is valid rather than merely tree-shaped: an empty paragraph left by a deleted line is legal, an empty list item may not be, and the item goes with its content rather than throwing'],
      ['toText is block-aware', 'not textContent', 'doc.textContent concatenates every block into one run, so a heading and the paragraph under it become \u201cHeadingthe paragraph\u201d'],
      ['getView() / getSchema()', 'ref methods', 'The live ProseMirror view and schema, for a caller that needs to reach past these props'],
      ['run(name) / can(name)', 'ref methods', 'Runs a registered command, or asks whether it applies here. can() calls the command with no dispatch, which is ProseMirror\u2019s own applicability check \u2014 so a disabled button is disabled because the document says so rather than because a rule was guessed. The toolbar and footer slots receive both'],
      ['commands', 'registry', 'strong, em, code, underline, strike, highlight, subscript, superscript \u00b7 paragraph, heading1\u20266, code_block, blockquote, horizontal_rule, hard_break \u00b7 bullet_list, ordered_list, task_list, indent, outdent \u00b7 align_left / center / right / justify \u00b7 clear_marks'],
      ['setLink({ href, target }) / unsetLink()', 'ref methods', 'With no selection, setLink applies to the WORD under the caret \u2014 otherwise the button would produce a zero-width link nobody can see or click \u2014 and unsetLink removes the whole link the caret sits inside rather than nothing'],
      ['undo() / redo()', 'ref methods', ''],
      ['list toggling', 'converts rather than nests', 'Pressing bullets inside an ordered list changes the wrapper in place, keeping the items and their nesting; pressing the list\u2019s own kind lifts out. Item types change too between list_item and task_item, since they are different nodes'],
      ['task_list', 'own node', 'Not a bullet list with a checkbox mark: the checked state belongs to the item, and a mark would let it apply to half a row. The box is drawn in CSS rather than a real input, which inside contenteditable would take focus from the document and be unreachable by the caret'],
      ['alignment', 'block attribute', 'Not a mark: half a paragraph cannot be centred, so a mark would allow a document nobody can render. Round-trips as data-align rather than an inline style, so the document carries intent and the stylesheet owns the look \u2014 the style is still read on the way in, because pasted HTML uses it'],
      ['highlight colour', 'a name', 'yellow, green, blue, pink, orange. A document storing #FFF3A0 cannot follow a theme into dark mode, where a named tone can'],
      ['code_block', "marks '', whitespace full", 'No marks inside, since code says the text is literal; indentation IS the content, so collapsing whitespace would break every pasted snippet. Shift-Enter exits it, because every other key inside is literal and there would otherwise be no way out'],
      ['ordered_list order', 'preserved', 'A list starting at 5 continues an earlier one, and losing that renumbers someone\u2019s document'],
      ['baseNodes / baseMarks', 'exported', 'doc, paragraph, heading, blockquote, horizontal_rule, bullet_list, ordered_list, list_item, task_list, task_item, code_block, text, hard_break; strong, em, code, underline, strike, highlight, subscript, superscript, link. Declared as a schema rather than assembled from toolbar configuration \u2014 what a document may contain has to be decidable without knowing which buttons are shown, since a toolbar can lack a bold button while the document still holds bold text from a paste'],
      ['heading marks', 'link only', 'Bold inside a heading is invisible, so allowing it would mean round-tripping styling nobody can see'],
      ['code mark', "excludes '_'", 'Code says the text is literal, so bold or italic inside it would contradict the mark'],
      ['hard_break', 'inline', 'A line break inside a paragraph is a different thing from a new paragraph, and conflating them loses the author\u2019s intent'],
      ['keyboard', 'Mod-b / Mod-i / Mod-` \u00b7 Shift-Mod-x / h \u00b7 Mod-, / . \u00b7 Shift-Mod-1\u20266 / 0 / 8 / 9 / c \u00b7 Mod-> \u00b7 Mod-_ \u00b7 Tab / Shift-Tab \u00b7 Shift-Enter \u00b7 Mod-z / Shift-Mod-z', 'Mod- resolves per platform rather than hard-coding Ctrl, which would leave every Mac user without shortcuts. Commands are plain functions, so a shortcut, a toolbar button and a slash menu all invoke the same code'],
      ['engine', 'ProseMirror', 'Vendored into web/vendor/pm as an offline module tree with one shared copy of each module \u2014 two copies would mean two Node classes and every instanceof across a package boundary silently false. The published package takes prosemirror-* as ordinary peer dependencies'],
    ],
    },

  {
    id: 'htmleditor', name: 'ApexHTMLEditor', group: 'Editor',
    blurb: 'Edits HTML pages rather than prose documents. A separate component from ApexEditor rather than a mode on it, because the two want opposite things: ApexEditor seals its writing area so a host page\u2019s CSS cannot touch the document, where a page only looks right IN its own stylesheet. Almost everything above the schema is shared \u2014 the engine, history, toolbars, comments, suggestions, the assist seam and the HTML round-trip all work on any schema by construction.',
    noField: true,
    demo: 'htmleditor',
    lead: ['v-model:html="html"', ':styles="styles"'],
    tail: '\n/>',
    base: { minHeight: '220px', editable: true, sourceView: true },
    controls: [
      { key: 'minHeight', type: 'text' },
      { key: 'bodyClass', type: 'text' },
      { key: 'editable', type: 'bool' },
      { key: 'sourceView', type: 'bool' },
    ],
    props: [
      ['html', 'string', "''", 'v-model:html \u2014 the markup IS the record here. There is no JSON source of truth, because the point of the component is that what you store is what the site renders'],
      ['the schema is a SUPERSET, not a replacement', 'permissive', 'Everything with affordances keeps a real node, so Enter still splits a paragraph and the list button still makes a list. Everything else is carried by a generic element node holding its tag and attributes, and round-trips byte-for-byte without the editor pretending to understand it. There are TWO generic containers rather than one, because a div holding paragraphs and a div holding bare text are different content models and ProseMirror cannot mix block and inline in one node \u2014 collapsing them would rewrite <div>text</div> as <div><p>text</p></div> and lose the commonest hand-written case'],
      ['elements permissive, attributes strict', 'the whitelist moves', 'Carrying <div class="grid"> is harmless; carrying onclick would make the editor an injection vector for everyone who can edit a page, which in a CMS is many people. So every on* attribute goes without exception, URL attributes are gated on a safe scheme, and a style attribute keeps its safe declarations while the suspect ones are dropped \u2014 losing every inline style because one looked wrong would break the layout'],
      ['indent / outdent', 'commands', 'Chained: list nesting is tried first, and a margin-left step is the fallback when it does not apply. The inherited commands are sinkListItem and liftListItem, list-only by construction and inert on a paragraph \u2014 correct for a prose document, wrong for a page where an author indenting a paragraph expects it to move. Outdent reports unavailable at zero rather than silently doing nothing'],
      ['undo / redo', 'commands', 'Registry entries rather than only keybindings: the toolbar names them as commands and looks them up in the registry, so they were dead buttons until they existed there \u2014 in the prose editor too. history.undo is already a Command, so availability comes free and an empty stack disables the button because the document says so'],
      ['clear formatting', 'reaches style spans', 'It iterates the schema\u2019s marks, which includes the generic inline element \u2014 so a colour, font or size span is cleared along with bold and italic. With only a caret it reports unavailable and the button disables, since there is no range to clear'],
      ['styles', 'HtmlStyle[]', '[]', "{ label, className, scope: 'block' | 'character', tag?, preview?, group? } \u2014 the application's own classes, applied the way Word's styles are: select, then click. The block/character distinction is not cosmetic: a character style applies to a run of text so it must be a MARK, where a block style belongs to the whole block so it must be an ATTRIBUTE. One control for both would mean guessing, and guessing wrong either paints half a paragraph or restyles a whole one the author meant to touch a word of"],
      ['gallery styles are exclusive within the gallery only', 'and nowhere else', 'Applying \u201cLead\u201d retires \u201cQuote\u201d because they are alternatives, but leaves a grid-item the template needs alone. A gallery that stripped every class would silently break layouts'],
      ['stylesheets / css / bodyClass', 'string[] / string / string', '[] / \u2014 / \u2014', 'Loaded into the editing surface, so the author is looking at the production cascade rather than an approximation'],
      ['the surface is an iframe', 'deliberately', 'A shadow root scopes styles, but a real site\u2019s CSS leans on :root variables, inherited properties and global resets that do not cross that boundary cleanly \u2014 the page would look NEARLY right, which is worse than looking wrong. An iframe is a real document, so the site\u2019s own stylesheet applies exactly as it will in production'],
      ['structure(action, arg) / canStructure(action, arg)', 'ref methods', "'wrap' | 'unwrap' | 'retag' | 'insert' | 'remove' | 'attrs' \u2014 one entry point, so a toolbar button and a keyboard shortcut produce the same transaction. canStructure asks the command WITHOUT dispatching, which is ProseMirror\u2019s own applicability test, so a disabled button is disabled because the document said so rather than because a rule guessed"],
      ['unwrap and delete are different verbs', 'both exist', 'Unwrap keeps the content and drops the wrapper; delete drops both. One verb for the two would mean an author removing a layout div lost the text inside it'],
      ['retag is where the design pays off', 'one setNodeMarkup', 'Because a container\u2019s tag is an ATTRIBUTE rather than a node type, turning a div into a section touches nothing inside it. A schema with one node type per tag would have to rebuild the subtree and hope the content still validated'],
      ['an inserted container arrives holding a paragraph', 'not empty', 'An empty container has nowhere to put a caret, so the author would see a box they could not type into and would have to open the source view to fix it'],
      ['attrs with a null value clears', 'set and clear in one call', 'Otherwise a caller needs two commands to swap an id for nothing'],
      ['sourceView / toggleSource() / isSourceOpen()', 'boolean / ref methods', 'true', 'ON by default here, unlike ApexEditor: in a prose editor the source view is an escape hatch most authors never want, but in a page editor it is the reliable way to reach anything the visual surface cannot. The markup is indented structurally for reading \u2014 nothing inside a tag is reflowed, since reformatting there risks changing it \u2014 and parsed on EXIT rather than per keystroke, because half-typed markup is invalid markup. Markup that will not parse leaves the view open with the text intact'],
      ['the iframe hides with v-show, not v-if', 'deliberately', 'v-if would destroy it, and its document, stylesheets and the view mounted inside would be rebuilt from nothing each time the source view closed'],
      ['the <head> is not editable content', 'by design', 'A page\u2019s title, description and meta tags are metadata, and metadata belongs in fields where it can be validated and indexed \u2014 not in a rich-text surface where an author can delete a tag by pressing Backspace. The component edits the BODY; the application owns the head, and passes stylesheets and css so the preview still renders in the production cascade'],
      /* `placeholder` dropped from this row — AF2-282. The mirror declares
         it and references it nowhere else in the file; our component does
         not have it, and a dead prop is not worth adding to keep a row.
         Waived in reconcile's GALLERY_DEFECTS. */
      ['editable / minHeight', 'boolean / string', 'true / 320px', ''],
      ['resizableColumns / resizableRows', 'boolean', 'true', 'Drag a cell border to size a column, a row border to size a row. The column half is prosemirror-tables’ own; the row half is ours, because the library has no equivalent — a page author sizing a layout table expects both to answer to the same gesture. AF2-285: both declared and documented nowhere.'],
    ],
    events: [
      ['update:html', 'string'],
      ['selection-change', '{ blockStyle, characterStyle, path } \u2014 path is the element ancestry, which is how an author sees and selects the container they are inside; a structure tree nobody asked for is the alternative'],
      ['ready / error', '\u2014 / Error'],
    ],
    slots: [
      ['— on ApexEditorImage', 'ADDITIVE slots, not replacements: the dialog is host-mounted, so a host wanting a different one simply does not render ours. `fields` (bound `{ draft, editing }`) adds a caption, credit or licence beside our Source/Alt/dimensions; `footer` (bound `{ draft, editing, save, cancel, canSave }`) replaces the actions — `canSave` is bound because the default’s rule is not obvious from the draft'],
      ['— on ApexEditorTableGrid', '`readout` only, bound `{ rows, cols, text }`. The grid IS the control, so a slot over it would replace the component rather than customise it'],
      ['status', 'The status bar. Bound `{ path, words, selectPath, sourceOpen }` — `selectPath` is bound because the default’s crumbs are CLICKABLE, and a host’s own breadcrumb needs the same power rather than a read-only copy'],
      ['source-view', 'The markup editor AND its parse error, as one slot — a host replacing the surface must be able to place the error against it, and two slots would let them drift apart. Bound `{ text, setText, error }`'],
      ['loading', 'Shown while the engine loads'],
      ['error', 'A load failure. Bound `{ message }`'],
      ['toolbar', 'Receives { styles, blockStyles, characterStyles, active, apply, clear } \u2014 the gallery is yours to render, since only you know how your styles should preview'],
    ],
    serviceTitle: 'Methods', serviceFn: 'ref',
    serviceRows: [
      ['getHtml() / setHtml(html)', 'string / void', 'setHtml applies with addToHistory false, so loading a record is not an undoable edit'],
      ['applyStyle(style) / clearStyle(scope)', 'boolean', 'Routed by the style\u2019s own scope, so one call handles both kinds'],
      ['selectPath(entry) / focus()', 'void', 'Selects a container from the element path'],
    ],
    },

  {
    id: 'form', name: 'ApexForm', group: 'Form',
    blurb: 'A schema-driven form. ApexForm is a VIEW: it renders a schema through Apex controls, validates locally for immediate feedback, and displays whatever errors it holds. It never submits — the host owns the verb, and the values live in ONE place. Given an Inertia or Precognition form, THAT object holds them and ApexForm reads and writes through it; given nothing, ApexForm makes an internal one. Never both, because two sources of truth for form state is the defect a form library exists to prevent. Three layouts (long, tabs, sidebar) in two shells (page, modal), and nothing else.',
    noField: true,
    demo: 'form',
    lead: [':schema="schema"', ':form="form"', 'layout="sidebar"'],
    tail: '\n  @submit="onSubmit"\n  @cancel="close"\n/>',
    /* shell: 'page' deliberately — a modal is position:fixed;inset:0, which in a
       docs stage would cover the nav and every section of its own page. The
       "Three layouts, two shells" section demonstrates the modal inline. */
    base: { layout: 'sidebar', shell: 'page', readonly: false, eager: false },
    controls: [
      { key: 'layout', type: 'select', options: ['long', 'tabs', 'sidebar'] },
      { key: 'shell', type: 'select', options: ['page', 'modal'] },
      { key: 'readonly', type: 'bool' }, { key: 'eager', type: 'bool' },
    ],
    props: [
      ['transition', "'scale' | 'slide' | 'fade' | 'none'", 'scale', 'A built-in preset, used when no classes are given'],
      ['enterClass / leaveClass', 'string', '—', 'Your own transition classes, e.g. animate.css. Not bundled — install it yourself. A pair given here replaces the built-in animation. See <a href="#/motion">Motion &amp; transitions</a>'],
      ['enterDuration / leaveDuration', 'string', '—', 'Any CSS time, per phase. Written as <code>--animate-duration</code> and <code>animation-duration</code> while that phase runs, then removed'],
      ['schema', 'FormSchema', '—', 'The whole form as DATA: `{ title, subtitle, icon, layout, shell, sections: [{ title, icon, columns, gap, class, fields }] }`. Sections may be omitted for a flat `fields` list, which is what a small form wants. Every part of it survives a JSON round trip, because a schema emitted by PHP cannot carry a function.<br><br><b>Laying a section out.</b> `columns` is how many the section has and a field’s `span` is how many it takes — `span: 2` of two columns is the whole row. Underneath, the grid is twelve tracks and every span is scaled, which renders identically and makes two more keys possible: a field’s <b>`span12`</b> takes N twelfths regardless of the section (a third inside a section of halves, which two tracks cannot express), and <b>`start`</b> places it at a twelfth instead of letting it flow. Both need a section whose `columns` divides 12 — every count a form uses — and are refused with a warning where it does not, rather than laid out against a grid they do not describe.<br><br><b>`gap`</b> on a section is one CSS gap value (`16`, `\'16px\'`, `\'8px 24px\'`) and overrides the app-wide `formGap` option; unset, forms keep `18px 20px`. <b>`class`</b> puts a class on that one section, which the form-wide `ui` map cannot do — `ui.cell` is every cell in the form.<br><br><b>Two CSS variables</b> are read and never declared, so a host can set them from anywhere up the tree (§4.2): `--apex-form-w` is the modal panel’s width (default `min(980px, 100%)` — a screen wanting most of the window sets `80vw`), and `--apex-form-gap` is the grid gap the section key writes for you'],
      ['form', 'InertiaForm | PrecognitionForm | null', 'null', 'The host’s form object. It is the SOURCE OF TRUTH for the values — ApexForm reads and writes through it and keeps no copy. Capability detection rather than two code paths: a Precognition form has `validate(field)`, so a field is sent to the server WHEN IT LOSES FOCUS — not on every keystroke, which asks the server about a half-typed value and then reports the answer (“that slug is taken”, three letters into a different one) — and the footer says “Checking…” while a round trip is in flight, form-wide, because that is the only scope Precognition reports. An Inertia form has no `validate()`, so the local rules are the only pre-submit feedback and the server speaks on submit. The consequence worth having: adopting Precognition later is a change of WHICH `useForm` you import — no schema and no markup change'],
      ['modelValue', 'object', '{}', 'Initial values, and the bindable model, when no host form is supplied'],
      ['layout', "'long' | 'tabs' | 'sidebar'", "schema’s", 'Tabs and sidebar are the SAME section list in two orientations — one ARIA contract, one keyboard model — so a schema switches between them without knowing which is showing. Long renders every section at once and has no tabs'],
      ['shell', "'page' | 'modal'", "schema’s", 'The same panel, lifted. Nothing about the layouts or the grid changes between them — only where the panel sits and how tall it may grow'],
      ['open', 'boolean', 'null', 'Modal visibility, and it states WHO owns dismissal. Bind it (`v-model:open`) and the host decides — it may want to hold the panel up while its own save fails. Leave it unbound and ApexForm owns it: nobody else can close it, so cancel dismisses and a submit that passed dismisses. Named `open` rather than `visible` because `visible(field)` already means field visibility here, and one word with two meanings in one component is a defect waiting to happen'],
      ['actions', 'boolean', 'true', 'The footer with Cancel and Save. Off for an EMBEDDED form whose host owns saving, or a form shown as a demonstration — the panel then ends at its last field'],
      ['ripple', 'boolean', '—', 'Ripple Save and Cancel, so the buttons the form draws for itself match the ones the app writes with <code>v-apex-ripple</code>. Unset falls through to the plugin’s <code>ripple</code> option; OFF is the default, because a library that started rippling on upgrade would change every existing screen'],
      ['readonly', 'boolean', 'false', 'Values render as TEXT, not as disabled controls: a greyed-out input reads as something the author failed to fill in. Same schema, so a detail page and an edit page are one definition. For a view dialog that must LOOK like its edit dialog, put <code>readonly: true</code> on the fields instead — real controls that refuse input and stay legible. <code>disabled</code> is the third thing and the wrong one here: it draws in the muted palette, which says “not available” rather than “not yours to change”. Either spelling ENDS THE EDITING SESSION when it takes hold: becoming uneditable — by this prop, or by every visible field carrying its own <code>readonly</code> — clears the local errors, the touched set and the dirty flag, and so does becoming editable again. A modal got that for free from opening; a PAGE never opens, so without it the browser’s complaint about a value the user abandoned outlived the mode it was typed in. Server errors are untouched: a 422 is not this component’s opinion and does not expire because the screen was locked'],
      ['eager', 'boolean', 'false', 'Validate a field the moment it changes rather than once it has been touched. Off by default because a required-field error on a pristine form is the most common form-UX mistake'],
    ],
    events: [
      ['submit', 'The values, once every VISIBLE field passes its local rules. ApexForm does not post — the host does, with whatever verb it owns'],
      ['cancel', 'The dismiss action was taken'],
      ['update:open', 'Paired with `open`, so a host that binds it stays in control of when the panel goes'],
      ['change', 'The whole value object, on any field change'],
      ['field-change', '`{ key, value }` — one field, for a host that wants to react to a specific one'],
      ['update:modelValue', 'Only when there is no host form; with one, that object is already the truth'],
    ],
    slots: [
      ['field-{key}', 'One field, by its key. Bound `{ field, value, error, update, blur }` — `update` is the setter, so a custom control participates in validation and dirty tracking exactly as a mapped one does, and `blur` is the one the default markup wires for you: call it from your control’s `@blur` or the field is touched by nothing, never marked touched, and never sent to the server for per-field validation'],
      ['actions', 'The action bar. Bound `{ submit, cancel, processing }`'],
      ['head-end', 'Beside the title — a status chip, a menu'],
    ],
    serviceTitle: 'The engine', serviceFn: 'apex-form-core',
    serviceRows: [
      ['normalise(schema)', 'FormSchema', 'One shape, so the component never branches on shorthand. Columns live on the SECTION and spans on the field: one number to reason about per group, and collapsing to a single column is a container query rather than a JS breakpoint — so it fires for a narrow modal inside a wide window, which a viewport query cannot see'],
      ['gridTracks(columns)', 'number', 'TWELVE whenever the section’s column count divides into it, which is every count a form uses (1, 2, 3, 4, 6, 12). Twelve tracks with every span scaled by `12 / columns` lays out identically to `columns` tracks spanning one — and it is what lets a section of halves hold a field that is a third. A count that does not divide 12 keeps its own tracks, because scaling would need a fractional span and a grid cannot have one'],
      ['cellPlacement(field, section)', '{ span, start? }', 'One field’s placement in those tracks. `span` is scaled, `span12` and `start` are absolute twelfths, and a field placed near the end is CLAMPED — left alone, a grid answers an overrun by inventing tracks and the row silently grows wider than the form. The component writes the result as `--cell-span` / `--cell-start` rather than as `grid-column`, because an inline property cannot be overridden by the narrow-container query, and a form that could not undo its spans grew an implicit column instead of stacking'],
      ['gridGap(section, option)', 'string | undefined', 'The section’s gap, then the app-wide `formGap`, then undefined — and undefined means the stylesheet’s own value, so a form that says nothing is unchanged and no inline value beats a host’s rule. A bare number is read as pixels. It VALIDATES: the value lands in a custom property, and an invalid one makes the whole `gap` declaration invalid at computed-value time, so a typo would flatten the form rather than fall back'],
      ['validateField(field, value, all)', 'string[]', 'One field. `required` runs FIRST and stops — a blank field should say it is required, not that it is not a valid email — and every other rule skips a blank value, matching Laravel'],
      ['validate(schema, model)', '{ errors, ok }', 'The whole form. INVISIBLE fields are skipped: blocking a submit on a field the author cannot see is the worst failure a conditional form has, and it is silent — the message names a control that is not rendered'],
      ['normaliseRules(rules)', '[{ name, args }]', 'Two authoring surfaces, one internal shape: the Laravel pipe DSL (`\'required|email|maxLength:40\'`), because it can be pasted from a FormRequest and carried inside JSON, and an object form for a typed literal'],
      ['isServerOnly(rule) / serverOnlyFields(schema)', 'boolean / string[]', 'About fifteen rules run in the browser. Laravel has ninety, and reimplementing them would guarantee drift from the FormRequest that actually decides — so anything unrecognised is retained, never evaluated locally, and REPORTED. "It looked valid and the server refused it" gets an explanation instead of being a mystery'],
      ['expandCondition(cond)', 'ApexCondition', '`{ custom: true }` means "the field `custom` equals true". The full form has no shorthand, and an object of plain keys falls through core/conditions’ default branch comparing `undefined === undefined` — which is TRUE. So a mis-shaped condition does not error: it shows every conditional field and hides every inverse one. The shorthand is real so the trap is not'],
      ['controlFor(field)', '{ tag, props }', 'A schema `type` names an intent; this decides the control and its props. It DROPS props the control does not declare and says which — four times in this project a prop name was assumed rather than read (`options` where a tree wants `nodes`, `prefix` where a number wants `currency`), and every one was silent: the control rendered and held nothing'],
      ['makeDriver(form, initial)', 'Driver', 'The one source of truth. Server errors WIN and keep winning until that field changes — after a 422 there is no revalidation, so the only way to clear an error is to edit the field, and a local rule that happens to pass must not erase what the server said'],
    ],
    },

];
