<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import {
  AFFIX_CASES, AUTOCOMPLETE_SNIPPET, CITIES, COMMON_CONTROLS, ENTRIES, FORMATTING_RULE,
  ICON_SLOT_CASES, KEY_FILTER_CASES, LABEL_PLACEMENTS, PLAYGROUND_DEFAULTS,
  PAGES, PG_COLORS, QUANTITY_RULES, ROLE_OPTIONS, SHARED_FIELD_PROPS, SIZES, STATE_CASES,
  ADD_NEW_CASCADED, ADD_NEW_MODAL, ADD_NEW_PERMISSION,
  BUTTON_FAMILY, DIAL_ITEMS, FIELD_PARTS, FIELD_STYLE_PROPS, FIELD_VARS, ICON_RESOLVER_SNIPPET, ICON_SETS,
  OWN_PARTS, SEVERITIES, SNIP_CLASS, SNIP_CTL, SNIP_DARK, SNIP_OWN, SNIP_PROPS, SNIP_TONE,
  SNIP_UI, SPLIT_MODEL,
  SCROLL_IN_PANEL_SNIPPET, SCROLL_VARIANTS, AUTOMOBILES, TBAR_LINKS, TBAR_MARKS,
  TAB_ITEMS, TAB_MANY, TAB_VARIANTS, TAB_PLACEMENTS, TAB_ONE_DISABLED, TAB_BADGED,
  STEP_ITEMS, STEP_PIPELINE, STEP_PLANS,
  SPLIT_MAILS, SPLIT_PAIR, SPLIT_THIRDS, SPLIT_COLLAPSIBLE, SPLIT_NESTED,
  SPLIT_EVENTS, SPLIT_STATEFUL, SPLIT_NAV, PANEL_REPEAT, LEGEND_ALIGNS,
  FAQ_PANELS, FAQ_ZONES, CARD_MEDIA,
  BDG_SEVERITIES, BDG_COUNT, MTR_DISK, MTR_COLOURS, MTR_ICONS, INP_COLUMNS, INP_ROWS,
  AOS_PLANS, AOS_PEOPLE, AOS_STATS, AOS_ZOOMS, CHIP_TAGS, CHIP_SEVERITIES, CHIP_INTERESTS, CREW,
  SUMMARY_ERRORS, SWITCH_LABEL_CASES, SWITCH_LABELS_SNIPPET,
  TOKEN_SWATCHES, TONE_CASES, UI_KEYS, ZONE_OPTIONS,
} from './registry';
import type { AddNewKind, DocEntry, DocPage } from './registry';
import { useApexDialog, useApexAlert } from '@exorgroup/apex-ui';
import { ROLES, docsRole } from './docsCan';
import LocalityForm from './demos/LocalityForm.vue';
import ContainerStage from './demos/ContainerStage.vue';
import DirectiveStage from './demos/DirectiveStage.vue';
import ServiceStage from './demos/ServiceStage.vue';

const current = ref('input');
const theme = ref<'light' | 'dark'>('dark');
const size = ref<'sm' | 'md' | 'lg'>('md');
const dir = ref<'ltr' | 'rtl'>('ltr');
const search = ref('');
const copied = ref(false);

/** v-model per control, so switching away and back keeps what you typed. */
const model = reactive<Record<string, unknown>>({});

/* ── The directives ──────────────────────────────────────────────────── */

/** Ripple's Disabled example — the switch it is bound to. */
const rpOff = ref(false);

/**
 * ApexTooltip's Event and "Disabled and reactive" examples.
 *
 * `tipText` and `tipOff` exist to prove the binding is reactive rather than
 * read once on mount: changing either while the tooltip is open must reach it
 * without a re-hover, which is the point that section makes.
 */
const tipField = ref('');
const tipText = ref('First message');
const tipOff = ref(false);

/**
 * FocusTrap's fields. The trap is about where Tab goes, so the examples need
 * real focusable content and one field deliberately outside it.
 */
const trapName = ref('');
const trapEmail = ref('');
const trapAgree = ref(false);
const trapOutside = ref('');
const trapPanel = ref(false);
const trapOff = ref(false);

/* ── ApexInplace ─────────────────────────────────────────────────────── */

/** The playground's open state and the value its editor edits. */
const inpStage = ref(false);
const inpStageValue = ref('John Doe');

/** The Basic example: two independent fields, each with its own open state. */
const inpBasic = ref(false);
const inpName = ref('');
const inpEmailOpen = ref(false);
const inpEmail = ref('ada@example.com');

/** Controlled: the buttons below the field drive it. */
const inpCtl = ref(false);
const inpImage = ref(false);

/**
 * Lazy: the content is not rendered until the display is clicked, so `open`
 * is a usable place to fetch. `keepAlive` keeps it mounted afterwards, which
 * is why the fetch counter stops climbing on a reopen — that counter is the
 * only way to see the difference.
 */
const inpLazy = ref(false);
const inpLoading = ref(false);
const inpFetches = ref(0);
const inpRows = ref<Record<string, unknown>[]>([]);
let inpTimer: ReturnType<typeof setTimeout> | undefined;
function loadInplaceRows() {
  if (inpRows.value.length) return;   // keepAlive means one fetch, not one per open
  inpFetches.value += 1;
  inpLoading.value = true;
  inpTimer = setTimeout(() => {
    inpRows.value = INP_ROWS;
    inpLoading.value = false;
  }, 700);
}

/* ── ApexBlockUI ─────────────────────────────────────────────────────── */

const blkStage = ref(false);
const blkBasic = ref(false);
const blkField = ref('');
const blkTimed = ref(false);
const blkStyled = ref(false);
const blkDoc = ref(false);
const blkLog = ref('');

onBeforeUnmount(() => clearTimeout(inpTimer));

/**
 * The determinate spinner's Run button. A spinner that only ever shows a
 * fixed number does not demonstrate the thing it is for, so this one climbs.
 * The interval is cleared on arrival and on reset, and reset also stops a run
 * already in flight — otherwise a second Run would leave two intervals going.
 */
const spinLive = ref(0);
let spinTimer: ReturnType<typeof setInterval> | undefined;
function stopSpin() {
  clearInterval(spinTimer);
  spinTimer = undefined;
}
function startSpin() {
  stopSpin();
  spinLive.value = 0;
  spinTimer = setInterval(() => {
    spinLive.value += 4;
    if (spinLive.value >= 100) { spinLive.value = 100; stopSpin(); }
  }, 90);
}
function resetSpin() {
  stopSpin();
  spinLive.value = 0;
}
onBeforeUnmount(stopSpin);

/** ApexChip's second model — a selectable chip is a two-state control. */
const chipSelected = ref(false);

/** The removable-chip example needs a list it can actually remove from, and
    a way back once it is empty. */
const chipTags = ref([...CHIP_TAGS]);

/** The multi-choice example. `remove`-style events give the answer back to
    the page, so the page is what holds the selection. */
const chipPicked = ref<string[]>(['Music', 'Travel']);
function toggleChip(label: string) {
  chipPicked.value = chipPicked.value.includes(label)
    ? chipPicked.value.filter((x) => x !== label)
    : [...chipPicked.value, label];
}

/** ApexOrderList's second model — the rows its move buttons act on. */
const orderSelection = ref<unknown[]>(['interval']);

/**
 * A fixed list for the ApexOrderList examples below the playground. They each
 * demonstrate one arrangement, so they need a stable list of their own rather
 * than the playground's, which the reader is busy reordering.
 */
const RUNNING_ORDER = [
  { value: 'doors', label: 'Doors open', help: '19:00' },
  { value: 'support', label: 'Support act', help: '19:45' },
  { value: 'interval', label: 'Interval', help: '20:30' },
  { value: 'headline', label: 'Headline set', help: '21:00' },
];

/** The playground's current order, numbered, for the "Selected" section. */
const runningOrderText = computed(() => {
  const rows = (model.orderlist ?? []) as { label?: string }[];
  return rows.map((o, i) => `${i + 1}. ${o.label}`).join('\n');
});

/**
 * Live prop overrides from the playground rail, per control. Kept apart from
 * `base` so "reset" is just clearing this, and so the other sections on the page
 * keep rendering the baseline rather than following the rail.
 */
const overrides = reactive<Record<string, Record<string, unknown>>>({});

/* Falls back to the first control so the control-page computeds stay defined while a
   Foundations page is open; the control markup is v-if'd out either way. */
const entry = computed<DocEntry>(() => ENTRIES.find((e) => e.id === current.value) ?? ENTRIES[0]);

/** The Foundations page currently open, or undefined on a control page. */
const page = computed<DocPage | undefined>(() => PAGES.find((p) => p.id === current.value));
const isDoc = computed(() => !!page.value);

const groups = computed(() => {
  const q = search.value.trim().toLowerCase();
  const all = [...PAGES, ...ENTRIES];
  const matched = q ? all.filter((e) => e.name.toLowerCase().includes(q)) : all;
  const out: Array<{ name: string; items: Array<DocEntry | DocPage> }> = [];

  matched.forEach((e) => {
    let g = out.find((x) => x.name === e.group);
    if (!g) { g = { name: e.group, items: [] }; out.push(g); }
    g.items.push(e);
  });

  return out;
});

/**
 * A control's own props, minus anything the common group already covers — the
 * entries list `label`, `required` and friends, and showing them twice would let
 * the two copies disagree.
 */
const ownControls = computed(
  () => entry.value.controls.filter((c) => !COMMON_CONTROLS.some((x) => x.key === c.key)),
);

/**
 * The shared field props, or nothing for a control with no field shell.
 *
 * ApexIcon is not a field: it has no label, tone or message line, so offering
 * those editors would be offering props it ignores. The gallery keeps `size`
 * for noField entries that honour it, but skips even that when the entry
 * declares its own — which ApexIcon does, as a pixel number rather than a
 * t-shirt size.
 */
const commonControls = computed(() => {
  if (!entry.value.noField) return COMMON_CONTROLS;
  const own = entry.value.controls;
  return COMMON_CONTROLS.filter((c) => c.key === 'size' && !own.some((x) => x.key === c.key));
});

const startingProps = (e: DocEntry) => (e.noField
  ? { ...(e.base ?? {}) }
  : { ...PLAYGROUND_DEFAULTS, ...(e.base ?? {}) });

/** The rail: what this control adds, then the field props everything shares. */
const railGroups = computed(() => [
  { title: null as string | null, items: ownControls.value },
  ...(commonControls.value.length
    ? [{ title: 'Label & state' as string | null, items: commonControls.value }]
    : []),
]);

watch(current, (id) => {
  const e = ENTRIES.find((x) => x.id === id);
  if (!e) { copied.value = false; return; }
  if (!(id in model)) model[id] = JSON.parse(JSON.stringify(e.model ?? null));
  if (!(id in overrides)) overrides[id] = startingProps(e);
  copied.value = false;
}, { immediate: true });

/* The top bar's Size drives the section grids; keep the rail's copy in step so the
   two never show different answers for the same control. */
watch(size, (v) => {
  // ApexIcon's size is a pixel number of its own; writing 'md' into it would
  // hand the component a value it cannot use.
  if (entry.value.noField) return;
  if (overrides[current.value]) overrides[current.value].size = v;
});

watch(theme, (v) => {
  document.documentElement.classList.toggle('dark', v === 'dark');
  document.documentElement.classList.toggle('light', v === 'light');
}, { immediate: true });

watch(dir, (v) => document.documentElement.setAttribute('dir', v), { immediate: true });

/** What the live demo is bound to: the playground's current state, nothing else. */
const live = computed(() => ({ ...overrides[current.value] }));

/** Baseline for the section grids — the rail must not move them around. */
const baseline = (extra: Record<string, unknown> = {}) => ({
  ...(entry.value.base ?? {}), size: size.value, ...extra,
});

function reset() {
  overrides[current.value] = startingProps(entry.value);
  model[current.value] = JSON.parse(JSON.stringify(entry.value.model ?? null));
}

/* ── ApexAlert page ─────────────────────────────────────────── */
const alert = useApexAlert();
const alertOutcome = ref('');

async function alertAsk() {
  const yes = await alert.confirm({
    tone: 'warn',
    title: 'Delete area?',
    message: '“Main Hall” will be deleted. This cannot be undone.',
    cancelText: 'Cancel',
    acceptLabel: 'Delete',
  });
  alertOutcome.value = yes ? 'confirm() resolved true' : 'confirm() resolved false';
}

async function alertReport() {
  await alert.notify({ tone: 'success', title: 'Saved', message: 'Three areas updated.' });
  alertOutcome.value = 'notify() resolved';
}

/** A fake request, so the progress stage lasts long enough to be seen. */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function alertRun() {
  const ok = await alert.run({
    confirm: {
      tone: 'danger',
      title: 'Delete area?',
      message: '“Main Hall” will be deleted.',
      cancelText: 'Cancel',
      acceptLabel: 'Delete',
    },
    progressTitle: 'Deleting…',
    action: async () => {
      await wait(1400);
      return { ok: true, title: 'Deleted', message: '“Main Hall” is gone.' };
    },
  });
  alertOutcome.value = ok ? 'run() resolved true' : 'run() resolved false';
}

async function alertRefused() {
  const ok = await alert.run({
    progressTitle: 'Deleting…',
    action: async () => {
      await wait(1200);
      /* The request finished. It was still refused, and saying "Done" here
         would be the lie this exists to prevent. */
      return { ok: false, title: 'Couldn’t delete that', message: 'The area is in use by two events.' };
    },
  });
  alertOutcome.value = `run() resolved ${ok}`;
}

async function alertChanges() {
  await alert.confirm({
    title: 'Save changes?',
    message: 'Two fields will change.',
    changes: [
      { label: 'Capacity', from: 120, to: 180 },
      { label: 'Notes', from: '', to: 'Step-free access' },
    ],
    cancelText: 'Keep editing',
    acceptLabel: 'Save',
  });
}

async function alertCopy() {
  await alert.notify({
    tone: 'info',
    title: 'Pairing key',
    message: 'It is shown once. Copy it now.',
    copyText: 'APX-4417-9930-KE2',
  });
}

async function alertCustomButtons() {
  await alert.confirm({
    title: 'How would you like to proceed?',
    message: 'Each button does its own thing.',
    buttons: [
      { label: 'Read more', close: false, action: () => { alertOutcome.value = 'stayed open'; } },
      { label: 'Cancel', role: 'reject', severity: 'secondary', variant: 'outlined' },
      { label: 'Continue', role: 'accept' },
    ],
  });
}

async function alertGated() {
  await alert.confirm({
    title: 'Main Hall',
    message: 'Only what your role allows is offered.',
    buttons: [
      { label: 'Export', can: 'export', resource: 'areas', severity: 'secondary', variant: 'outlined' },
      { label: 'Rename', can: 'update', resource: 'areas', severity: 'secondary', variant: 'outlined' },
      { label: 'Delete', can: 'delete', resource: 'areas', severity: 'danger', role: 'accept' },
      { label: 'Close', role: 'cancel', variant: 'text' },
    ],
  });
}

function alertAnchored(e: MouseEvent) {
  alert.confirm({
    message: 'Delete this row?',
    target: e.currentTarget,
    cancelText: 'No',
    acceptLabel: 'Delete',
  });
}

/** The usage snippet, generated from whatever the playground currently shows. */
const usage = computed(() => {
  const bind = overrides[current.value] ?? {};

  /* A service is called, not placed, so its snippet is script rather than
     template — and it has to show the host mount too. Leaving that out is how
     someone ends up calling add() correctly and seeing nothing at all, with
     no clue that a component is missing from their shell. */
  const svc = entry.value.service;
  if (svc) {
    const opts = Object.entries(bind)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `  ${k}: ${typeof v === 'string' ? `'${v}'` : String(v)},`);
    const host = svc.host ? `<!-- once, in your app shell -->\n<${svc.host} />\n\n` : '';
    const handle = svc.handle || 'service';
    const call = opts.length
      ? `${handle}.${svc.method}({\n${opts.join('\n')}\n})`
      : `${handle}.${svc.method}()`;
    return `${host}const ${handle} = ${svc.composable}()\n\n${call}`;
  }

  /* A directive has no tag of its own, so its snippet is a host element with
     the binding object spelled out — which is also how you would really write
     it, since the options go in one object rather than as attributes. */
  if (entry.value.directiveName) {
    const opts = Object.entries(bind)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `    ${k}: ${typeof v === 'string' ? `'${v}'` : String(v)},`);
    const tag = entry.value.hostTag === 'button' ? 'ApexButton' : 'div';
    const label = entry.value.hostLabel || 'Hover me';
    return opts.length
      ? `<${tag}\n  v-${entry.value.directiveName}="{\n${opts.join('\n')}\n  }"\n>${label}</${tag}>`
      : `<${tag} v-${entry.value.directiveName}>${label}</${tag}>`;
  }

  const lines = Object.entries(bind)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined && v !== false)
    // A snippet that spells out the defaults is noise you would delete by hand.
    .filter(([k, v]) => PLAYGROUND_DEFAULTS[k] !== v)
    .map(([k, v]) => {
      if (v === true) return `  ${k}`;
      if (typeof v === 'number') return `  :${k}="${v}"`;
      if (Array.isArray(v)) return `  :${k}="${JSON.stringify(v)}"`;
      return `  ${k}="${String(v).replace(/"/g, '&quot;')}"`;
    });

  return `<${entry.value.name} v-model="value"\n${lines.join('\n')}\n/>`;
});

/**
 * Conditional formatting demo, one value per control so switching away and back
 * keeps what you typed.
 *
 * The gallery binds this one-way, which pins it to the matched state. Binding it
 * two-way costs nothing at rest — it still opens showing the warning — and it
 * demonstrates the part that matters: rules re-evaluate on every change, so
 * typing clears the warning and clearing the field brings it back.
 */
const fmt = reactive<Record<string, unknown>>({});

/** What "empty" means for this control — the rule under test is `{ empty: true }`. */
const emptyFor = (model: unknown) => {
  if (Array.isArray(model)) return [];
  // A numeric control's empty is null, not ''. Seeding a string here fails its
  // modelValue type check on ApexStepper, ApexKnob and ApexSlider.
  if (typeof model === 'number') return null;
  return '';
};

watch(current, (id) => {
  const e = ENTRIES.find((x) => x.id === id);
  if (e && !(id in fmt)) fmt[id] = emptyFor(e.model);
}, { immediate: true });

/** Conditional formatting page: type 3, then 50 or more, to move through both rules. */
const rulesQty = ref(3);

/** One value per arc so the three knobs move independently. */
const arcDemo = reactive<Record<number, number>>({ 180: 30, 270: 55, 360: 80 });

/**
 * One model per switch on the labels section, keyed by its tag. Seeded on and
 * off in turn so the page shows both states without anyone having to click.
 */
const switchDemo = reactive<Record<string, boolean>>(
  Object.fromEntries([
    ...SWITCH_LABEL_CASES.map((s, i) => [s.tag, i % 2 === 0]),
    ...SIZES.map((s, i) => [s, i !== 1]),
  ]),
);

/**
 * The Add New demos. One section serves both choosers, so everything here is
 * keyed by control: a multiselect's model is an array, a select's is a scalar,
 * and sharing one ref would break whichever page it was not shaped for.
 */
const isMulti = computed(() => entry.value.id === 'multiselect');
const isCascade = computed(() => entry.value.id === 'cascadeselect');
const isTree = computed(() => entry.value.id === 'treeselect');
const isOrder = computed(() => entry.value.id === 'orderlist');
/** The two that place a row per level rather than one at the foot. */
const isLevelled = computed(() => isCascade.value || isTree.value);
/** Which snippet shape this page's control needs. */
const addNewKind = computed<AddNewKind>(() => {
  if (isTree.value) return 'tree';
  if (isCascade.value) return 'cascade';
  if (isOrder.value) return 'order';
  return isMulti.value ? 'multi' : 'single';
});
/* The demo borrows the page's own sample data, so a cascade gets a tree and a
   listbox gets groups rather than one shape forced on both. */
const demoOptions = computed(
  () => ((entry.value.base as Record<string, unknown> | undefined)?.options ?? []) as unknown[],
);
const demoNodes = computed(
  () => ((entry.value.base as Record<string, unknown> | undefined)?.nodes ?? []) as unknown[],
);
/**
 * Each control takes its list under a different prop — `options`, `nodes`, or
 * v-model for the order list, whose model IS the list. Binding one shape to
 * all six would render a demo that does not match the page it is on.
 */
const demoListProps = computed<Record<string, unknown>>(() => {
  if (isTree.value) {
    return { nodes: demoNodes.value, filter: true, expandAll: true, placeholder: 'Choose a zone' };
  }
  // No placeholder here: the order list has no empty state to label.
  if (isOrder.value) return { filter: true };
  return { options: demoOptions.value, filter: !isCascade.value, placeholder: 'Choose a zone' };
});

/* One entry per chooser: the multiselect holds an array, and the order list's
   model is the collection itself. */
const addNewDemo = reactive<Record<string, unknown>>({
  select: null, multiselect: [], listbox: null, cascadeselect: null, treeselect: null,
  orderlist: [{ value: 'north', label: 'North stand' }, { value: 'south', label: 'South stand' }],
});
const addNewSeen = ref('');
const onDemoAddNew = (p: { query: string; path?: Array<{ label: string }> }) => {
  addNewSeen.value = p.path && p.path.length
    ? `add-new { query: "${p.query}", path: [${p.path.map((n) => n.label).join(' › ')}] }`
    : `add-new { query: "${p.query}"${p.path ? ', path: [] — the root' : ''} }`;
};

/**
 * The working demo. Everything below is what an application would write:
 * the page owns the list and the value, and the dialog hands a record back.
 */
const dialog = useApexDialog();

/**
 * `value` and `key` are the same string on purpose: ApexCascadeSelect reads
 * `value`, ApexTreeSelect reads `key`, and carrying both lets one demo tree
 * serve both pages without a mapping layer in between.
 */
interface Node { value: string; key: string; label: string; children?: Node[] }
const node = (id: string, label: string, children?: Node[]): Node =>
  ({ value: id, key: id, label, ...(children ? { children } : {}) });

/* Flat for the three list controls and the order list. */
const localities = ref<Node[]>([node('valletta', 'Valletta'), node('mosta', 'Mosta')]);
/* Nested for the two that drill: a flat list would draw a single column, or a
   tree with no branches, and demonstrate nothing either does differently. */
const localityTree = ref<Node[]>([
  node('mt', 'Malta', [node('mt-nh', 'Northern Harbour', [node('mt-nh-valletta', 'Valletta')])]),
  node('go', 'Gozo', [node('go-c', 'Central', [node('go-c-victoria', 'Victoria')])]),
]);
const demoLocalities = computed(() => (isLevelled.value ? localityTree.value : localities.value));

const locality = reactive<Record<string, unknown>>({
  select: null, multiselect: [], listbox: null, cascadeselect: null, treeselect: null,
});
const localityLog = ref<string[]>([]);

/** Find a node by id so a record can be inserted under its parent. */
function findNode(list: Node[], id: string): Node | undefined {
  for (const n of list) {
    if (n.value === id) return n;
    const hit = n.children && findNode(n.children, id);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * One handler for all six. The cascade and the tree add `path` — the branch
 * above the column or node whose row was used — so the record lands at the
 * right level rather than always at the root.
 */
function createLocality({ query, path }: { query: string; path?: Node[] }) {
  const under = path && path.length ? path[path.length - 1] : null;
  localityLog.value.unshift(under
    ? `add-new under ${path!.map((n) => n.label).join(' › ')}`
    : `add-new fired with query "${query}"`);

  dialog.open(LocalityForm, {
    props: { header: under ? `New entry under ${under.label}` : 'New locality', width: '430px', modal: true },
    contentProps: { name: query, parent: under?.label },
    onClose: ({ data }) => {
      const raw = data as { value: string; label: string } | undefined;
      if (!raw) { localityLog.value.unshift('dismissed — nothing added'); return; }
      const rec = node(raw.value, raw.label);

      if (isLevelled.value) {
        // The page owns the tree: put it under the branch the row came from.
        const parent = under ? findNode(localityTree.value, under.value ?? under.key) : null;
        if (parent) (parent.children ||= []).push(rec);
        else localityTree.value.push(rec);
        locality[entry.value.id] = rec.value;
      } else if (isOrder.value) {
        // The order list's model IS the collection: append and it lands last,
        // ready to be dragged into place.
        orderLocalities.value = [...orderLocalities.value, rec];
      } else {
        localities.value.push(rec);
        if (isMulti.value) locality.multiselect = [...(locality.multiselect as unknown[]), rec.value];
        else locality[entry.value.id] = rec.value;
      }
      localityLog.value.unshift(isOrder.value
        ? `added "${rec.label}" to the end of the order`
        : `added "${rec.label}"${under ? ` under ${under.label}` : ''} and selected it`);
    },
  });
}

/** The order list's working demo owns its own collection. */
const orderLocalities = ref<Node[]>([node('valletta', 'Valletta'), node('mosta', 'Mosta')]);

/** ApexField demos: the bare shell, and the two restyled inputs. */
const fieldValue = ref('8080');
const styledByProps = ref('ada.lovelace@exorgroup.com');
const styledByClass = ref('ada.lovelace@exorgroup.com');

/** Sentence-case a severity or position name for a demo label. */
const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

/** The split button and speed dial both report which item was chosen. */
const actionLog = ref('');
function onMenuClick(payload: { item?: { label?: string } }) {
  actionLog.value = payload?.item?.label ?? '';
}
function onDialClick(payload: { item?: { label?: string } }) {
  actionLog.value = payload?.item?.label ?? '';
}

/** Name of the icon just copied, so the cell can confirm it. */
const copiedIcon = ref('');
let copiedIconTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Copy a glyph name. An unfocused document, a denied permission or a
 * non-secure context all reject, so the confirmation is driven by the click
 * rather than by the promise — the name is on screen either way.
 */
function copyIcon(name: string) {
  navigator.clipboard?.writeText(name).catch(() => {});
  copiedIcon.value = name;
  clearTimeout(copiedIconTimer);
  copiedIconTimer = setTimeout(() => {
    if (copiedIcon.value === name) copiedIcon.value = '';
  }, 1400);
}

/* --- ApexSlider demos --------------------------------------------- */

/** One ref behind both the slider and the number — the point of the section. */
const pairedValue = ref(45);
const rangeValue = ref([8, 18]);
const rangeValue2 = ref([9, 17]);
const vert1 = ref(60);
const vert2 = ref(40);
const vert3 = ref(75);

/* --- ApexToolbar demos -------------------------------------------- */

/** The search box in the toolbar's centre region. */
const tbarQuery = ref('');

/* --- ApexScrollArea demos ------------------------------------------ */

/** Reported by @scroll, so the vertical example shows a live number. */
const saPos = ref(0);
function onSaScroll(p: { top: number }) { saPos.value = Math.round(p.top); }

/* --- ApexTabs demos ------------------------------------------------ */

/* The tabs carry no `value`, so the model is the 1-based index — the same
   number as the panel slot, which is what makes "Go to Payment" readable. */
const tabCtl = ref<string | number>(1);
const tabActive = ref<string | number>(1);
const tabLog = ref('');
const tabForm = reactive({ username: 'john.doe', email: '' });

/** Which lazy panels have been built. Starts with the one that opens first. */
const tabLazySeen = ref<Array<string | number>>([1]);

function onTabChange(p: { value: string | number; previous: string | number }) {
  tabLog.value = `tab-change to ${p.value} (from ${p.previous})`;
}

/* Records first visits from the CHANGE EVENT, never from render: a method
   called in an interpolation that mutates reactive state re-triggers the very
   render that read it, looping until Vue's recursive-update cap. */
function onLazyVisit(p: { value: string | number }) {
  if (!tabLazySeen.value.includes(p.value)) tabLazySeen.value = [...tabLazySeen.value, p.value];
}

/* --- ApexSteps demos ----------------------------------------------- */

const stStep = ref<string | number>(1);
const stLinear = ref<string | number>(1);
const stLog = ref('');
const stForm = reactive({ email: '', plan: 'studio' });

function onStChange(p: { value: string | number; previous: string | number }) {
  stLog.value = `step-change → ${p.previous} to ${p.value}`;
}
function onStFinish(p: { index: number }) {
  stLog.value = `finish on step ${p.index + 1}`;
}

/* A linear stepper reads `incomplete` off the CURRENT step, so the gate is data
   rather than a handler that has to veto navigation after the fact. */
const linearSteps = computed(() => [
  { label: 'Account', icon: 'person', incomplete: !stForm.email },
  { label: 'Payment', icon: 'credit_card' },
  { label: 'Confirm', icon: 'task_alt' },
]);

/* --- ApexSplitter demos -------------------------------------------- */

const spSizes = ref([30, 70]);
const spNavSizes = ref([32, 68]);
const spLog = ref('');
const mailOpen = ref(0);

function onSpResize(p: { sizes: number[] }, phase: string) {
  spLog.value = `${phase} → ${p.sizes.map((n) => `${Math.round(n)}%`).join(' / ')}`;
}
function onSpCollapse(p: { index: number }) {
  spLog.value = `collapse panel ${p.index + 1}`;
}

/* --- ApexPanel / ApexFieldset / ApexCard / ApexAccordion demos ----- */

/** Both `collapsed` models, driven from a button outside the container. */
const pnShut = ref(false);
const fsShut = ref(false);

/** The accordion's three models: multiple, single controlled, and dynamic. */
const acMulti = ref<Array<string | number>>(['about', 'plan']);
const acCtl = ref<string | number>('secure');
const acOpen = ref<string | number>('about');

/* --- ApexInput-only sections ------------------------------------- */

/** Autocomplete demo state — both cells share one value, as the gallery has it. */
const acValue = ref('');
const acHits = ref<unknown[]>([]);
const acBusy = ref(false);
let acTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Stands in for a server call: the control debounces the keystrokes, this
 * resolves the query. The delay is deliberate — without it the loading state
 * never has time to show and the demo misrepresents what a real fetch looks like.
 */
function acSearch(e: { query?: string }) {
  acBusy.value = true;
  const q = (e.query || '').toLowerCase();

  clearTimeout(acTimer);
  acTimer = setTimeout(() => {
    acHits.value = CITIES.filter((c) => c.label.toLowerCase().includes(q));
    acBusy.value = false;
  }, 240);
}

/** Key-filter demos are two-way bound, so a rejected keystroke visibly does nothing. */
const kf = reactive<Record<string, string>>(
  Object.fromEntries(KEY_FILTER_CASES.map((c) => [c.key, c.seed])),
);

async function copyUsage() {
  try {
    await navigator.clipboard.writeText(usage.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="docs">
    <aside class="side">
      <div class="brand"><b>APEX UI</b><span>v0.1.0</span></div>

      <div class="side-search">
        <input v-model="search" type="search" placeholder="Search controls" aria-label="Search controls" />
      </div>

      <nav>
        <div v-for="g in groups" :key="g.name" class="navgroup">
          <h4>{{ g.name }}</h4>
          <button
            v-for="e in g.items"
            :key="e.id"
            class="navitem"
            :aria-current="current === e.id ? 'true' : 'false'"
            @click="current = e.id"
          >
            {{ e.name }}
          </button>
        </div>
        <p v-if="groups.length === 0" class="navempty">No control matches that.</p>
      </nav>

      <!-- Said out loud rather than left to be discovered: this harness covers
           the controls reviewed so far, not the whole library. Counted from the
           registry rather than written down, so it cannot go stale again. -->
      <p class="side-note">
        {{ ENTRIES.length }} of 84 controls, plus the Foundations pages.
        The rest arrive as each is reviewed.
      </p>
    </aside>

    <main>
      <div class="topbar">
        <span class="topbar__label">Theme</span>
        <div class="seg">
          <button :aria-pressed="theme === 'light'" @click="theme = 'light'">Light</button>
          <button :aria-pressed="theme === 'dark'" @click="theme = 'dark'">Dark</button>
        </div>

        <span class="topbar__label">Size</span>
        <div class="seg">
          <button v-for="s in SIZES" :key="s" :aria-pressed="size === s" @click="size = s">{{ s }}</button>
        </div>

        <span class="topbar__label">Direction</span>
        <div class="seg">
          <button :aria-pressed="dir === 'ltr'" @click="dir = 'ltr'">LTR</button>
          <button :aria-pressed="dir === 'rtl'" @click="dir = 'rtl'">RTL</button>
        </div>
      </div>

      <!-- Foundations: prose, with a live demo where one earns its place. -->
      <div v-if="isDoc" class="page">
        <h1>{{ page!.name }}</h1>

        <!-- Static, authored copy from the library's own docs — never user input. -->
        <div class="doc-body" v-html="page!.body"></div>

        <div v-if="page!.id === 'theming'" class="swatches">
          <div v-for="v in TOKEN_SWATCHES" :key="v" class="sw">
            <i :style="{ background: `var(${v})` }"></i><span>{{ v }}</span>
          </div>
        </div>

        <template v-if="page!.id === 'formatting'">
          <h2>Live</h2>
          <div class="cell cell--solo">
            <ApexNumber
              v-model="rulesQty"
              label="Quantity"
              :min="0"
              :max="200"
              help="Try 3, then 50 or more."
              :rules="QUANTITY_RULES"
            />
          </div>
        </template>

        <template v-if="page!.id === 'validation'">
          <h2>Summary + inline</h2>
          <div class="cell val-stack">
            <ApexErrorSummary :errors="SUMMARY_ERRORS" />
            <ApexInput
              model-value="ada@"
              label="Email address"
              type="email"
              leading-icon="mail"
              error="Enter a valid email address."
            />
            <ApexMultiselect
              :model-value="[]"
              label="Roles"
              :options="ROLE_OPTIONS"
              placeholder="Assign roles"
              error="Assign at least one role."
            />
            <ApexInput
              model-value="lobby-north"
              label="Slug"
              prefix="pando.app/"
              success="Checked and available."
            />
            <ApexInput
              model-value="2600"
              label="Rotation seconds"
              mono
              warning="Longer than the recommended maximum, but allowed."
            />
          </div>
        </template>
      </div>

      <div v-else class="page">
        <h1>{{ entry.name }}</h1>
        <p class="blurb">{{ entry.blurb }}</p>

        <!-- Demo on the left, live prop editors on the right. -->
        <div class="stage">
          <div class="stage__demo">
            <div class="stage__inner">
              <!-- A control without a field shell needs its own stage treatment: no
                   v-model, and in some cases slot content or room to fan out. -->
              <!-- "plain" is the whole treatment for a control that renders
                   from its props: ApexIcon, ApexBadge, ApexAvatar. -->
              <component v-if="entry.demo === 'plain'" :is="entry.name" v-bind="live" />

              <!-- A directive has no tag of its own, so it needs a host — and
                   two of the four need more than that. DirectiveStage holds
                   the four hosts. -->
              <DirectiveStage
                v-else-if="entry.directiveName"
                :id="entry.id"
                :bind="live"
                :label="entry.hostLabel"
              />

              <!-- A service has no tag at all: the stage holds the trigger,
                   and what it produces appears at the singleton host. -->
              <ServiceStage
                v-else-if="entry.service"
                :spec="entry.service"
                :bind="live"
                :hint="entry.hostLabel"
              />

              <!-- An Inplace is two states, and only the closed one shows
                   without content to swap to. -->
              <ApexInplace
                v-else-if="entry.demo === 'inplace'"
                v-bind="live"
                v-model:active="inpStage"
              >
                <template #content>
                  <ApexInput v-model="inpStageValue" placeholder="Enter name" class="inp-stage__field" />
                </template>
              </ApexInplace>

              <!-- BlockUI covers something, so the stage supplies the thing to
                   cover and the button that blocks it. The rail's `duration`
                   releases it; a block with no way out is a trapped page. -->
              <div v-else-if="entry.demo === 'block'" class="blk-stage">
                <ApexButton size="sm" @click="blkStage = true">Block</ApexButton>
                <ApexBlockUI v-model:blocked="blkStage" v-bind="live" class="blk-stage__ui">
                  <ApexCard title="Account settings" subtitle="Manage your workspace preferences">
                    Update your profile, configure notifications and control privacy.
                  </ApexCard>
                </ApexBlockUI>
              </div>

              <!-- ScrollTop needs something to scroll. Binding it to this
                   scroller rather than the window keeps the playground's
                   button inside the stage instead of floating over the docs. -->
              <div v-else-if="entry.demo === 'scrolltop'" class="st-scroller st-stage">
                <p v-for="n in 12" :key="n" class="st-para">
                  Paragraph {{ n }}. Scroll this panel to bring the button in.
                </p>
                <ApexScrollTop target="parent" v-bind="live" />
              </div>

              <!-- A meter is nothing without measurements, so the stage
                   supplies them rather than expecting the rail to. Its
                   click log is what makes item-click visible. -->
              <div v-else-if="entry.demo === 'meter'" class="meter-stage">
                <ApexMeterGroup
                  v-bind="live"
                  :value="MTR_DISK"
                  @item-click="actionLog = $event.item.label"
                />
                <p class="note stage__log">
                  Last clicked: <code>{{ actionLog || 'none yet' }}</code>
                </p>
              </div>

              <!-- A chip carries a second model. Its selected state is what
                   `clickable` exists for, so binding it is the difference
                   between a demo you can press and a picture of one. -->
              <ApexChip
                v-else-if="entry.demo === 'chip'"
                v-bind="live"
                v-model:selected="chipSelected"
                @remove="actionLog = 'remove'"
              />

              <ApexButton v-else-if="entry.demo === 'button'" v-bind="live">
                {{ live.label || 'Save changes' }}
              </ApexButton>

              <component
                v-else-if="entry.demo === 'split'"
                :is="entry.name"
                v-bind="live"
                @item-click="onMenuClick"
              />

              <!-- The dial fans items around the trigger, so the stage has to be tall
                   enough for them to land inside it. -->
              <div v-else-if="entry.demo === 'dial'" class="dial-stage">
                <component :is="entry.name" v-bind="live" @item-click="onDialClick" />
              </div>

              <ApexButtonGroup v-else-if="entry.demo === 'group'" v-bind="live">
                <ApexButton severity="secondary" variant="outlined" icon="format_align_left" icon-only label="Align left" />
                <ApexButton severity="secondary" variant="outlined" icon="format_align_center" icon-only label="Align centre" />
                <ApexButton severity="secondary" variant="outlined" icon="format_align_right" icon-only label="Align right" />
              </ApexButtonGroup>

              <!-- ApexField renders nothing on its own: it is a shell around a
                   control you supply. Wrapping a plain input is how the anatomy
                   page shows it, and it keeps the demo honest about the API. -->
              <ApexField
                v-else-if="entry.demo === 'field'"
                v-bind="live"
                :value="fieldValue"
                v-slot="{ id, describedBy, invalid, ui }"
              >
                <div class="apex-ctl" :class="ui.control">
                  <input
                    :id="id"
                    v-model="fieldValue"
                    class="apex-ctl__input"
                    :class="ui.input"
                    :aria-describedby="describedBy"
                    :aria-invalid="invalid || undefined"
                  />
                </div>
              </ApexField>

              <!-- A container is a frame around content, so it cannot be
                   rendered from props alone the way a field control can. The
                   sample content for all nine lives in ContainerStage. -->
              <ContainerStage
                v-else-if="entry.demo === 'container'"
                :id="entry.id"
                :bind="live"
              />

              <!-- Two models: the collection, and the rows the move buttons
                   act on. Without the second the buttons never enable. -->
              <ApexOrderList
                v-else-if="entry.demo === 'order'"
                v-model="model[entry.id]"
                v-model:selection="orderSelection"
                v-bind="live"
              />

              <component v-else :is="entry.name" v-model="model[entry.id]" v-bind="live" />
            </div>

            <p v-if="entry.demo === 'split' || entry.demo === 'dial'" class="note stage__log">
              Last action: <code>{{ actionLog || 'none yet' }}</code>
            </p>
          </div>

          <div class="stage__rail">
            <div class="rail-head">
              <h3>Playground</h3>
              <button class="rail-reset" @click="reset">Reset</button>
            </div>

            <template v-for="g in railGroups" :key="g.title ?? 'own'">
            <h4 v-if="g.title" class="rail-sep">{{ g.title }}</h4>

            <div v-for="c in g.items" :key="c.key" class="rail-row">
              <template v-if="c.type === 'bool'">
                <label class="rail-check">
                  <input
                    type="checkbox"
                    :checked="!!overrides[entry.id][c.key]"
                    @change="overrides[entry.id][c.key] = ($event.target as HTMLInputElement).checked"
                  />
                  <span>{{ c.key }}</span>
                </label>
              </template>

              <template v-else>
                <label class="rail-label">{{ c.key }}</label>

                <select
                  v-if="c.type === 'select'"
                  :value="overrides[entry.id][c.key] ?? ''"
                  @change="overrides[entry.id][c.key] = ($event.target as HTMLSelectElement).value || undefined"
                >
                  <option v-for="o in c.options" :key="o" :value="o">{{ o || '—' }}</option>
                </select>

                <div v-else-if="c.type === 'color'" class="pg-colors">
                  <button
                    v-for="sw in PG_COLORS"
                    :key="sw"
                    type="button"
                    class="pg-sw"
                    :style="{ background: sw }"
                    :aria-label="sw"
                    :data-on="overrides[entry.id][c.key] === sw"
                    @click="overrides[entry.id][c.key] = sw"
                  ></button>
                  <button
                    type="button"
                    class="pg-sw pg-sw--none"
                    aria-label="Default"
                    :data-on="!overrides[entry.id][c.key]"
                    @click="overrides[entry.id][c.key] = undefined"
                  >—</button>
                </div>

                <input
                  v-else
                  :type="c.type === 'number' ? 'number' : 'text'"
                  :value="overrides[entry.id][c.key] ?? ''"
                  @input="overrides[entry.id][c.key] = c.type === 'number'
                    ? Number(($event.target as HTMLInputElement).value) || undefined
                    : ($event.target as HTMLInputElement).value"
                />
              </template>
            </div>
            </template>
          </div>
        </div>

        <h2>Usage</h2>
        <div class="usage">
          <button class="usage__copy" @click="copyUsage">{{ copied ? 'Copied' : 'Copy' }}</button>
          <pre><code>{{ usage }}</code></pre>
        </div>

        <h2>Props</h2>
        <table class="doc-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead>
          <tbody>
            <tr v-for="r in entry.props" :key="r[0]">
              <td class="mono">{{ r[0] }}</td>
              <td class="mono t">{{ r[1] }}</td>
              <td class="mono">{{ r[2] }}</td>
              <td>{{ r[3] }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="!entry.noField" class="note">
          Plus every shared field prop —
          <template v-for="(p, i) in SHARED_FIELD_PROPS" :key="p"><code>{{ p }}</code><span
            v-if="i < SHARED_FIELD_PROPS.length - 1">, </span></template>.
        </p>

        <h2>Events</h2>
        <table class="doc-table">
          <thead><tr><th>Event</th><th>Payload</th></tr></thead>
          <tbody>
            <tr v-for="r in entry.events" :key="r[0]">
              <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td>
            </tr>
          </tbody>
        </table>

        <template v-if="entry.slots">
          <h2>Slots</h2>
          <table class="doc-table">
            <thead><tr><th>Slot</th><th>Use</th></tr></thead>
            <tbody>
              <tr v-for="r in entry.slots" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- What a template ref gets you, where the control offers one. -->
        <template v-if="entry.exposed">
          <h2>Exposed</h2>
          <p class="note">
            Available on a template ref, for the cases props cannot reach.
          </p>
          <table class="doc-table">
            <thead><tr><th>Name</th><th>What it does</th></tr></thead>
            <tbody>
              <tr v-for="r in entry.exposed" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- Some controls come with a companion the props table cannot
             describe: a wrapper, an imperative service, a set of helper
             classes. The gallery gives each its own titled table, and 23 of
             its entries use one — ApexBadge's is ApexOverlayBadge. Without
             this block that half of the API silently disappears on import. -->
        <template v-if="entry.serviceRows">
          <h2>{{ entry.serviceTitle || 'Service options' }}</h2>
          <table class="doc-table">
            <thead><tr><th>Name</th><th>Type</th><th>Notes</th></tr></thead>
            <tbody>
              <tr v-for="r in entry.serviceRows" :key="r[0]">
                <td class="mono">{{ r[0] }}</td>
                <td class="mono t">{{ r[1] }}</td>
                <td>{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <template v-if="!entry.noField">
        <h2>Label placement</h2>
        <div class="grid">
          <div v-for="p in LABEL_PLACEMENTS" :key="p" class="cell">
            <span class="cell__tag">labelPlacement="{{ p }}"</span>
            <component
              :is="entry.name"
              :model-value="entry.model"
              v-bind="baseline()"
              :label-placement="p"
              label-width="110px"
            />
          </div>
        </div>

        <h2>Tone, messages and required</h2>
        <div class="grid">
          <div v-for="c in TONE_CASES" :key="c.label" class="cell">
            <span class="cell__tag">{{ c.label }}</span>
            <component
              :is="entry.name"
              :model-value="c.empty ? (Array.isArray(entry.model) ? [] : null) : entry.model"
              v-bind="baseline(c.bind)"
            />
          </div>
        </div>

        <h2>Conditional formatting</h2>
        <div class="cell cell--solo">
          <span class="cell__tag">:rules="[{ when: { empty: true }, tone: 'warning', message: … }]"</span>
          <component
            :is="entry.name"
            v-model="fmt[entry.id]"
            v-bind="baseline()"
            :rules="FORMATTING_RULE"
          />
        </div>

        <h2>Sizes</h2>
        <div class="grid">
          <div v-for="s in SIZES" :key="s" class="cell">
            <span class="cell__tag">size="{{ s }}"</span>
            <component :is="entry.name" :model-value="entry.model" v-bind="baseline()" :size="s" />
          </div>
        </div>

        <h2>States</h2>
        <div class="grid">
          <div v-for="c in STATE_CASES" :key="c.label" class="cell">
            <span class="cell__tag">{{ c.label }}</span>
            <component :is="entry.name" :model-value="entry.model" v-bind="baseline(c.bind)" />
          </div>
        </div>
        </template>


        <!-- ApexField: the shared reference for every field control. -->
        <template v-if="entry.id === 'field'">
          <h2>Anatomy</h2>
          <p class="note">
            Every field is a label, a control and one message line. The message is a single
            slot with a precedence order — error, then warning, then success, then a matching
            <code>rules</code> entry, then <code>help</code> — so a field never shows two
            competing lines. Each part below is a stable class you can write CSS against.
          </p>
          <table class="doc-table">
            <thead><tr><th>Class</th><th>What it is</th><th>Rendered by</th></tr></thead>
            <tbody>
              <tr v-for="r in FIELD_PARTS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td><td class="t">{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>

          <h2>Customising</h2>
          <p class="note">
            Three ways in, smallest blast radius last. <strong>Tokens</strong> repaint the
            whole app — see Theming &amp; tokens. <strong>Props</strong> restyle one field
            without leaving your template. <strong>Classes</strong> do everything props do
            plus states, media queries and pseudo-elements. Props and classes target the same
            CSS variables, so the two cannot disagree about what they control.
          </p>

          <h2>Appearance props</h2>
          <p class="note">
            All optional, all on <code>ApexFieldProps</code> — so every control built on the
            field shell takes them, not just ApexInput. Each sets one variable on the field
            root.
          </p>
          <table class="doc-table">
            <thead><tr><th>Group</th><th>Prop</th><th>Sets</th></tr></thead>
            <tbody>
              <tr v-for="r in FIELD_STYLE_PROPS" :key="r[1]">
                <td>{{ r[0] }}</td><td class="mono">{{ r[1] }}</td><td class="mono t">{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>
          <div class="usage"><pre><code>{{ SNIP_PROPS }}</code></pre></div>

          <div class="cell cell--solo">
            <span class="cell__tag">the props above, live</span>
            <ApexInput
              v-model="styledByProps"
              label="Email address"
              leading-icon="mail"
              background="#101820"
              border-color="#C24A06"
              focus-border-color="#E4863F"
              radius="14px"
              text-color="#F5E9DF"
              label-color="#C24A06"
              icon-color="#C24A06"
              control-height="52px"
            />
          </div>

          <h2>CSS variables</h2>
          <p class="note">
            Declared on <code>.apex-field</code>, each defaulting to a design token. Set one
            anywhere it cascades — a prop, an inline style, your own class, or globally on
            <code>.apex-field</code> itself.
          </p>
          <table class="doc-table">
            <thead><tr><th>Variable</th><th>Default</th><th>Sets</th></tr></thead>
            <tbody>
              <tr v-for="r in FIELD_VARS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td><td>{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>

          <h2>Class hooks</h2>
          <p class="note">
            The part classes have always been writable against. What they could not do is
            <em>scope</em> — styling one field meant a selector that hit every field on the
            page. <code>ui</code> puts your class on this instance only.
          </p>
          <div class="usage"><pre><code>{{ SNIP_UI }}</code></pre></div>
          <table class="doc-table">
            <thead><tr><th>Key</th><th>Lands on</th><th>Honoured by</th></tr></thead>
            <tbody>
              <tr v-for="r in UI_KEYS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td><td>{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>

          <h3 class="sub">What .apex-ctl responds to</h3>
          <p class="note">
            The control box in full, as the library defines it. Override any line, or set the
            variable and leave the rule alone.
          </p>
          <div class="usage"><pre><code>{{ SNIP_CTL }}</code></pre></div>

          <h3 class="sub">Writing your own</h3>
          <p class="note">
            Put the part class beside yours — <code>.brand-box.apex-ctl</code> — and your rule
            outranks the library's without <code>!important</code>.
          </p>
          <div class="usage"><pre><code>{{ SNIP_CLASS }}</code></pre></div>

          <div class="cell cell--solo">
            <span class="cell__tag">the classes above, live — try the Light / Dark switch</span>
            <ApexInput
              v-model="styledByClass"
              label="Email address"
              leading-icon="mail"
              :ui="{ control: 'brand-box', input: 'brand-text', label: 'brand-label' }"
            />
          </div>

          <h2>Dark mode</h2>
          <p class="note">
            There is no light/dark key in the map, on purpose. The library already puts
            <code>.dark</code> on the root element, so one class covers both themes and the
            two definitions sit next to each other in your stylesheet. The demo above uses
            exactly this.
          </p>
          <div class="usage"><pre><code>{{ SNIP_DARK }}</code></pre></div>

          <h2>Tones</h2>
          <p class="note">
            One variable per tone, and it reaches the border, the label, the status glyph and
            the message together — plus the error state of every other control, from the
            slider handle to the stepper.
          </p>
          <div class="usage"><pre><code>{{ SNIP_TONE }}</code></pre></div>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">default danger</span>
              <ApexInput model-value="ada@" label="Email" error="Enter a valid email address." />
            </div>
            <div class="cell pink-errors">
              <span class="cell__tag">--apex-field-danger: #B4004E</span>
              <ApexInput model-value="ada@" label="Email" error="Enter a valid email address." />
            </div>
          </div>
        </template>

        <!-- ApexIcon: no field shell, so its sections are all about the glyph. -->
        <template v-if="entry.id === 'icon'">
          <h2>Sizes</h2>
          <div class="card iconstrip">
            <ApexIcon v-for="n in [16, 18, 20, 24, 32, 44, 64]" :key="n" name="campaign" :size="n" />
          </div>

          <h2>Weight and fill</h2>
          <p class="note">
            Weight follows the surrounding text unless you pin it. <code>fill</code> switches to
            the solid glyph — the same axis the rating control uses for its outline and filled
            variants.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">weight 200 → 700, outlined</span>
              <div class="iconstrip">
                <ApexIcon v-for="w in [200, 300, 400, 500, 600, 700]" :key="w" name="star" :size="30" :weight="w" />
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">same weights, fill</span>
              <div class="iconstrip">
                <ApexIcon v-for="w in [200, 300, 400, 500, 600, 700]" :key="w" name="star" :size="30" :weight="w" fill />
              </div>
            </div>
          </div>

          <h2>Colour and spin</h2>
          <p class="note">
            An icon paints in <code>currentColor</code>, so it inherits from whatever contains
            it — no colour prop needed.
          </p>
          <div class="card iconstrip">
            <ApexIcon name="check_circle" :size="30" fill style="color: var(--accent-success)" />
            <ApexIcon name="warning" :size="30" fill style="color: var(--accent-warning)" />
            <ApexIcon name="error" :size="30" fill style="color: var(--accent-danger)" />
            <ApexIcon name="info" :size="30" fill style="color: var(--accent-primary)" />
            <ApexIcon name="progress_activity" :size="30" spin style="color: var(--accent-primary)" />
            <span class="note">spin, for progress_activity</span>
          </div>

          <h2>In context</h2>
          <p class="note">
            Every control takes icon names rather than icon markup, and renders them through
            this component.
          </p>
          <div class="grid grid--2">
            <div class="cell val-stack">
              <ApexInput model-value="north entrance" label="Search" label-icon="search" leading-icon="search" clearable />
              <ApexSelect model-value="split" label="Zone layout" leading-icon="grid_view" :options="ZONE_OPTIONS" />
            </div>
            <div class="cell iconstrip">
              <ApexButton icon="check">Save</ApexButton>
              <ApexButton severity="secondary" variant="outlined" icon="download">Export</ApexButton>
              <ApexButton severity="danger" variant="text" icon="delete" icon-only label="Delete" />
              <ApexButton icon="refresh" loading>Syncing</ApexButton>
            </div>
          </div>

          <h2>Accessibility</h2>
          <p class="note">
            Without a <code>label</code> an icon is <code>aria-hidden</code>, which is correct for
            decoration beside text. Give it a <code>label</code> when the icon carries the meaning
            on its own — it then renders as <code>role="img"</code>.
          </p>
          <div class="card iconstrip">
            <span class="icon-inline">
              <ApexIcon name="schedule" :size="18" /> Decorative — hidden from assistive tech
            </span>
            <ApexIcon name="lock" :size="22" label="Locked" />
          </div>

          <h2>Swapping the icon set</h2>
          <p class="note">
            One plugin option remaps every name in the library, so a different icon set is a
            single change rather than a rewrite of every control.
          </p>
          <div class="usage"><pre><code>{{ ICON_RESOLVER_SNIPPET }}</code></pre></div>

          <h2>Reference</h2>
          <p class="note">A working set, by role. Click any glyph to copy its name.</p>
          <div v-for="set in ICON_SETS" :key="set.label" class="iconset">
            <span class="cell__tag">{{ set.label }}</span>
            <div class="icongrid">
              <button
                v-for="n in set.names"
                :key="n"
                type="button"
                class="iconcell"
                :data-copied="copiedIcon === n"
                :title="n"
                @click="copyIcon(n)"
              >
                <ApexIcon :name="n" :size="24" />
                <em>{{ copiedIcon === n ? 'copied' : n }}</em>
              </button>
            </div>
          </div>
        </template>

        <!-- ApexSlider: pairing, range mode and the vertical orientation. -->
        <template v-if="entry.id === 'slider'">
          <h2>Paired with ApexNumber</h2>
          <p class="note">Both bind the same ref — no glue code.</p>
          <div class="cell cell--solo">
            <span class="cell__tag">v-model="lead" on both</span>
            <div class="pair-row">
              <ApexSlider v-model="pairedValue" label="Lead time" :min="0" :max="120" :step="5" show-tooltip />
              <ApexNumber v-model="pairedValue" label="Minutes" unit="min" :min="0" :max="120" />
            </div>
          </div>

          <h2>Range</h2>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">range</span>
              <ApexSlider v-model="rangeValue" label="Operating hours" :min="0" :max="24" show-tooltip range />
            </div>
            <div class="cell">
              <span class="cell__tag">range + minStepsBetweenHandles="4"</span>
              <ApexSlider
                v-model="rangeValue2"
                label="Booking window"
                :min="0"
                :max="24"
                :min-steps-between-handles="4"
                show-tooltip
                range
              />
            </div>
          </div>

          <h2>Vertical</h2>
          <div class="card vert-row">
            <ApexSlider v-model="vert1" label="Bass" orientation="vertical" show-tooltip />
            <ApexSlider v-model="vert2" label="Mid" orientation="vertical" show-tooltip color="#137C4A" />
            <ApexSlider v-model="vert3" label="Treble" orientation="vertical" show-tooltip color="#C24A06" />
          </div>
        </template>


        <!-- ApexButton: the full vocabulary, one section per axis. -->
        <template v-if="entry.id === 'button'">
          <h2>Severity × variant</h2>
          <div class="card stack">
            <div v-for="v in ['solid', 'outlined', 'text', 'link']" :key="v" class="sev-row">
              <span class="cell__tag sev-row__tag">{{ v }}</span>
              <ApexButton v-for="sv in SEVERITIES" :key="sv" :severity="sv" :variant="v" size="sm">
                {{ cap(sv) }}
              </ApexButton>
            </div>
          </div>

          <h2>Raised</h2>
          <p class="note">Elevation shadow, and text and outlined buttons lift onto a surface.</p>
          <div class="card iconstrip">
            <ApexButton raised icon="check">Raised solid</ApexButton>
            <ApexButton raised variant="outlined" severity="secondary" icon="edit">Raised outlined</ApexButton>
            <ApexButton raised variant="text" severity="help" icon="star">Raised text</ApexButton>
            <ApexButton raised severity="success" icon="publish">Publish</ApexButton>
          </div>

          <h2>Rounded and icon-only</h2>
          <div class="card iconstrip">
            <ApexButton rounded icon="add">Rounded</ApexButton>
            <ApexButton rounded variant="outlined" severity="secondary">Pill outlined</ApexButton>
            <ApexButton icon-only icon="settings" label="Settings" severity="secondary" variant="outlined" />
            <ApexButton icon-only rounded icon="add" label="Add display" />
            <ApexButton icon-only rounded raised icon="favorite" label="Favourite" severity="danger" />
            <ApexButton icon-only rounded variant="text" icon="more_vert" label="More actions" severity="secondary" />
            <ApexButton icon-only rounded icon="delete" label="Delete" severity="danger" variant="outlined" size="sm" />
            <ApexButton icon-only rounded icon="download" label="Download" severity="contrast" size="lg" />
          </div>

          <h2>Icon position</h2>
          <div class="card iconstrip">
            <ApexButton
              v-for="pos in ['left', 'right', 'top', 'bottom']"
              :key="pos"
              :icon-pos="pos"
              icon="cloud_upload"
              severity="secondary"
              variant="outlined"
            >{{ cap(pos) }}</ApexButton>
          </div>

          <h2>Badge</h2>
          <div class="card iconstrip">
            <ApexButton icon="notifications" badge="4">Alerts</ApexButton>
            <ApexButton icon="inbox" badge="12" badge-severity="danger" variant="outlined" severity="secondary">Inbox</ApexButton>
            <ApexButton icon-only rounded icon="shopping_cart" label="Basket" badge="3" badge-severity="success" />
            <ApexButton icon-only icon="mail" label="Messages" badge="99+" badge-severity="warning" severity="secondary" variant="outlined" />
          </div>

          <h2>Link</h2>
          <div class="card iconstrip">
            <ApexButton variant="link">View documentation</ApexButton>
            <ApexButton variant="link" severity="secondary" trailing-icon="open_in_new">Release notes</ApexButton>
            <ApexButton variant="link" severity="danger">Delete this account</ApexButton>
            <ApexButton href="#" variant="link" icon="arrow_back">Back to displays</ApexButton>
          </div>

          <h2>Sizes and states</h2>
          <div class="card iconstrip">
            <ApexButton size="sm" icon="add">Small</ApexButton>
            <ApexButton size="md" icon="add">Medium</ApexButton>
            <ApexButton size="lg" icon="add">Large</ApexButton>
            <ApexButton loading>Saving</ApexButton>
            <ApexButton disabled icon="lock">Disabled</ApexButton>
            <ApexButton variant="outlined" severity="secondary" trailing-icon="arrow_forward">Continue</ApexButton>
          </div>
        </template>

        <!-- ApexSplitButton -->
        <template v-if="entry.id === 'splitbutton'">
          <h2>Severity</h2>
          <div class="card iconstrip">
            <ApexSplitButton
              v-for="sv in SEVERITIES"
              :key="sv"
              :severity="sv"
              :label="cap(sv)"
              :model="SPLIT_MODEL.slice(1, 4)"
              size="sm"
            />
          </div>

          <h2>Variants</h2>
          <div class="card stack stack--start">
            <div class="iconstrip">
              <ApexSplitButton label="Solid" icon="check" :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Outlined" icon="check" variant="outlined" severity="secondary" :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Text" icon="check" variant="text" :model="SPLIT_MODEL.slice(1, 4)" />
            </div>
            <div class="iconstrip">
              <ApexSplitButton label="Raised" icon="check" raised :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Raised text" icon="check" variant="text" raised :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Raised outlined" icon="check" variant="outlined" severity="secondary" raised :model="SPLIT_MODEL.slice(1, 4)" />
            </div>
            <div class="iconstrip">
              <ApexSplitButton label="Rounded" icon="check" rounded :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Rounded outlined" icon="check" rounded variant="outlined" severity="secondary" :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Rounded raised" icon="check" rounded raised severity="success" :model="SPLIT_MODEL.slice(1, 4)" />
            </div>
          </div>

          <h2>Menu content</h2>
          <p class="note">
            Icons, right-aligned hints, section headers, separator rules, disabled rows and
            nested submenus &mdash; hover <em>Export</em> to go two levels deep.
          </p>
          <div class="card">
            <ApexSplitButton label="Save" icon="check" :model="SPLIT_MODEL" @item-click="onMenuClick" />
          </div>

          <h2>Sizes and states</h2>
          <div class="card iconstrip">
            <ApexSplitButton size="sm" label="Small" icon="add" :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton size="md" label="Medium" icon="add" :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton size="lg" label="Large" icon="add" :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton label="Saving" loading :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton label="Disabled" icon="lock" disabled :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton label="Opens left" icon="check" menu-align="start" severity="contrast" :model="SPLIT_MODEL.slice(1, 4)" />
          </div>
        </template>

        <!-- ApexSpeedDial: every cell needs height for the items to fan into. -->
        <template v-if="entry.id === 'speeddial'">
          <h2>Types</h2>
          <div class="grid grid--2">
            <div v-for="t in ['linear', 'circle', 'semi-circle', 'quarter-circle']" :key="t" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">type="{{ t }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" :type="t" direction="up" tooltip />
            </div>
          </div>

          <h2>Linear direction</h2>
          <div class="grid grid--2">
            <div v-for="d in ['up', 'down', 'left', 'right']" :key="d" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">direction="{{ d }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS.slice(0, 3)" type="linear" :direction="d" tooltip />
            </div>
          </div>

          <h2>Quarter-circle corners</h2>
          <div class="grid grid--2">
            <div v-for="d in ['up-right', 'up-left', 'down-right', 'down-left']" :key="d" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">direction="{{ d }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS.slice(0, 4)" type="quarter-circle" :direction="d" :radius="80" tooltip />
            </div>
          </div>

          <h2>Transition delay</h2>
          <p class="note">The stagger reverses on close, so items retract in the order they appeared.</p>
          <div class="grid grid--3">
            <div v-for="ms in [0, 60, 140]" :key="ms" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">:transition-delay="{{ ms }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="circle" :radius="82" :transition-delay="ms" />
            </div>
          </div>

          <h2>Mask</h2>
          <p class="note">A modal layer behind the open items, in any colour and opacity.</p>
          <div class="grid grid--3">
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">mask</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="semi-circle" mask tooltip />
            </div>
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">mask-color="#0B5FFF" :mask-opacity="0.25"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="semi-circle" mask mask-color="#0B5FFF" :mask-opacity="0.25" severity="info" tooltip />
            </div>
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">:mask-opacity="0.75"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="semi-circle" mask :mask-opacity="0.75" severity="contrast" tooltip />
            </div>
          </div>
        </template>

        <!-- ApexButtonGroup -->
        <template v-if="entry.id === 'buttongroup'">
          <h2>Grouped</h2>
          <div class="card stack stack--start stack--wide">
            <ApexButtonGroup label="Text alignment" hide-label>
              <ApexButton severity="secondary" variant="outlined" icon="format_align_left" icon-only label="Align left" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_center" icon-only label="Align centre" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_right" icon-only label="Align right" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_justify" icon-only label="Justify" />
            </ApexButtonGroup>

            <ApexButtonGroup label="Record actions" hide-label>
              <ApexButton variant="outlined" severity="secondary" icon="save">Save</ApexButton>
              <ApexButton variant="outlined" severity="secondary" icon="content_copy">Duplicate</ApexButton>
              <ApexButton variant="outlined" severity="danger" icon="delete">Delete</ApexButton>
            </ApexButtonGroup>

            <ApexButtonGroup label="Rotation" hide-label>
              <ApexButton severity="contrast" icon="skip_previous" icon-only label="Previous" />
              <ApexButton severity="contrast" icon="play_arrow" icon-only label="Play" />
              <ApexButton severity="contrast" icon="skip_next" icon-only label="Next" />
            </ApexButtonGroup>
          </div>

          <h2>Framed with a label</h2>
          <p class="note">
            A <code>label</code> frames the group and sits on the border. Add
            <code>hideLabel</code> to keep it as the accessible name only.
          </p>
          <div class="card framed-row">
            <ApexButtonGroup label="Text alignment">
              <ApexButton severity="secondary" variant="outlined" icon="format_align_left" icon-only label="Align left" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_center" icon-only label="Align centre" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_right" icon-only label="Align right" />
            </ApexButtonGroup>
            <ApexButtonGroup label="Rotation interval" help="Applies to every display in this zone.">
              <ApexButton severity="secondary" variant="outlined">10s</ApexButton>
              <ApexButton severity="primary">30s</ApexButton>
              <ApexButton severity="secondary" variant="outlined">60s</ApexButton>
            </ApexButtonGroup>
          </div>

          <h2>Vertical</h2>
          <div class="card">
            <ApexButtonGroup orientation="vertical" label="Zoom" hide-label>
              <ApexButton severity="secondary" variant="outlined" icon="add" icon-only label="Zoom in" />
              <ApexButton severity="secondary" variant="outlined" icon="remove" icon-only label="Zoom out" />
              <ApexButton severity="secondary" variant="outlined" icon="crop_free" icon-only label="Fit" />
            </ApexButtonGroup>
          </div>

          <h2>Block</h2>
          <div class="card cell--solo">
            <ApexButtonGroup block label="View mode">
              <ApexButton severity="secondary" variant="outlined" icon="grid_view">Grid</ApexButton>
              <ApexButton severity="primary" icon="view_list">List</ApexButton>
              <ApexButton severity="secondary" variant="outlined" icon="map">Map</ApexButton>
            </ApexButtonGroup>
          </div>
        </template>


        <!-- Add New — offered by all four choosers, so one section serves them all. -->
        <template v-if="['select', 'multiselect', 'listbox', 'cascadeselect', 'treeselect', 'orderlist'].includes(entry.id)">
          <h2>Add new</h2>
          <p class="note">
            When the record the user needs is not in the list yet,
            <code>add-new</code> puts a row at the foot of the overlay. Activating it
            emits <code>add-new</code> with whatever was typed in the filter and closes
            the overlay — nothing else. The control never changes the options or the
            value, so the same handler covers a dialog, a route or an inline form, and
            your list stays the one source of truth.
          </p>
          <p v-if="isCascade" class="note">
            A tree has levels, so this control differs in one way: <em>every open
            column</em> carries its own row, and the event adds <code>path</code> —
            the branch above that column, empty at the first. That is what lets one
            handler create a country at the first column and a locality at the third.
            <code>query</code> is always empty here, because the cascade has no filter.
            <code>footerAction</code> is a different thing and can be shown alongside.
          </p>
          <p v-if="isTree" class="note">
            This control has levels too, so it works as the cascade does: <em>every
            open branch</em> carries its own row, drawn at its children's depth, and
            one more sits at the foot for a record that belongs under no branch. The
            event adds <code>path</code> — the branch above that row, root first, and
            empty at the foot. Collapse a branch and its row goes with it.
          </p>
          <p v-if="isOrder" class="note">
            Here the row is flattened into the panel rather than floating, because
            there is no overlay to close — the list stays exactly where it is. Since
            <code>v-model</code> is the collection itself, appending the new record
            puts it last, ready to be dragged into place.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">Nothing typed</span>
              <component :is="entry.name" v-model="addNewDemo[entry.id]"
                         v-bind="demoListProps" label="Zone" add-new
                         @add-new="onDemoAddNew" />
            </div>
            <div class="cell">
              <span class="cell__tag">Permission denied — the row is hidden</span>
              <!-- The order list's model IS its list, so this second copy needs
                   one of its own or it would render an empty panel. -->
              <component :is="entry.name" v-bind="demoListProps" label="Zone" add-new
                         :model-value="isOrder ? addNewDemo.orderlist : undefined"
                         :can-add-new="false" />
            </div>
          </div>
          <p v-if="addNewSeen" class="note">
            Last event: <code>{{ addNewSeen }}</code>
          </p>

          <h3>Who may see the row</h3>
          <p class="note">
            One plugin option gates every chooser in the app, so a call site names only
            what it creates. It takes a plain function and is tied to no authorisation
            library.
          </p>
          <div class="usage"><pre><code>{{ ADD_NEW_PERMISSION(entry.name, addNewKind) }}</code></pre></div>

          <h3>Opening a form in a dialog</h3>
          <p class="note">
            Working, not quoted. Type something that is not in the list, use the row,
            fill the form and save — the record joins the list and is selected. The
            form also carries a country chooser with an Add new of its own, so saving
            a country from in there opens a second dialog above the first: that is the
            cascaded case, and it needs no extra code.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">Try it</span>
              <!-- Three shapes, because the six controls take their list three
                   different ways. Feeding one shape to all of them would render
                   a demo that does not match the page it is on. -->
              <ApexTreeSelect v-if="isTree" v-model="locality.treeselect"
                              :nodes="demoLocalities" label="Locality"
                              placeholder="Choose a locality" filter expand-all add-new
                              resource="localities" @add-new="createLocality" />
              <ApexOrderList v-else-if="isOrder" v-model="orderLocalities"
                             label="Locality order" filter add-new
                             resource="localities" @add-new="createLocality" />
              <component v-else :is="entry.name" v-model="locality[entry.id]"
                         :options="demoLocalities" label="Locality"
                         placeholder="Choose a locality" filter add-new
                         resource="localities" @add-new="createLocality" />
            </div>
            <div class="cell">
              <span class="cell__tag">What happened</span>
              <p v-if="!localityLog.length" class="note">Nothing yet.</p>
              <ul v-else class="demo-log">
                <li v-for="(line, i) in localityLog.slice(0, 5)" :key="i">{{ line }}</li>
              </ul>
            </div>
          </div>
          <div class="usage"><pre><code>{{ ADD_NEW_MODAL(entry.name, addNewKind) }}</code></pre></div>

          <h3>Cascaded — a chooser inside the form it opened</h3>
          <p class="note">
            No extra work: <code>useApexDialog</code> keeps a stack, so a second form
            opened from the first sits above it and closes on its own.
          </p>
          <div class="usage"><pre><code>{{ ADD_NEW_CASCADED(entry.name) }}</code></pre></div>
        </template>

        <!-- Every field control gets a Customising section. The shared surface is
             documented once on ApexField; this covers only what this control adds. -->
        <template v-if="OWN_PARTS[entry.id]">
          <h2>Customising</h2>
          <!-- Which page carries the shared half depends on the family: the
               field controls share ApexField, the action controls ApexButton,
               and ApexIcon shares nothing at all. -->
          <p v-if="BUTTON_FAMILY.includes(entry.id)" class="note">
            The shared surface — the four severity colours, the size props and the
            <code>ui</code> hooks common to every action control — is documented once on
            <button class="linkish" @click="current = 'button'">ApexButton</button> and applies
            here unchanged. Below is what {{ entry.name }} adds on top.
          </p>
          <p v-else-if="entry.id === 'icon'" class="note">
            ApexIcon is neither a field nor a button, so it has no shared surface to
            inherit — everything it responds to is listed here.
          </p>
          <!-- Containers have their own class map. Pointing them at ApexField
               would be wrong: they have no value, label, message or tone. -->
          <p v-else-if="entry.demo === 'container'" class="note">
            A container is not a field: it has no value, no label or message line and
            no tone, so none of the ApexField surface applies. Its class map is
            <code>ApexContainerClasses</code> — <code>root</code>, <code>head</code>,
            <code>title</code>, <code>sub</code>, <code>body</code>, <code>foot</code>,
            <code>toggle</code>, <code>icon</code>, <code>panel</code> and
            <code>label</code> are shared by the nine, and the keys below are what
            {{ entry.name }} adds. A key names the part’s <em>role</em>, not its class.
          </p>
          <p v-else class="note">
            The shared surface — the box, the label, the message line, the appearance
            props and the class hooks — is documented once on
            <button class="linkish" @click="current = 'field'">ApexField</button> and applies
            here unchanged. Below is what {{ entry.name }} adds on top.
          </p>
          <table class="doc-table">
            <thead><tr><th>ui key</th><th>Part</th><th>Responds to</th></tr></thead>
            <tbody>
              <tr v-for="r in OWN_PARTS[entry.id]" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td><td class="mono">{{ r[2] }}</td>
              </tr>
            </tbody>
          </table>
          <div class="usage"><pre><code>{{ SNIP_OWN[entry.id] }}</code></pre></div>
        </template>

        <!-- The arc is the one knob property you have to see to judge. -->
        <template v-if="entry.id === 'knob'">
          <h2>Arc</h2>
          <p class="note">
            <code>arc</code> is the sweep in degrees. The gap stays centred at the bottom, so
            the dial is always symmetrical about the vertical. Drag any of these — the
            angle-to-value mapping follows the arc, so the full range is reachable on each.
          </p>
          <div class="grid grid--3">
            <div v-for="a in [180, 270, 360]" :key="a" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">:arc="{{ a }}"</span>
              <ApexKnob v-model="arcDemo[a]" :arc="a" :diameter="120" />
            </div>
          </div>
        </template>

        <!-- Ported from the gallery, seven sections. Prose and bindings are the
             gallery's; the tags are ours (PascalCase) and the inline
             font-size on each paragraph is `class="note"`, which is the same
             size and is what every other page here uses. -->
        <template v-if="entry.id === 'tooltip'">
          <h2>Basic</h2>
          <p class="note">
            The directive's value is the text. It attaches to anything — a kit control, a
            plain span, a table cell.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexButton v-apex-tooltip="'Save changes'" icon="save" /&gt;
&lt;span v-apex-tooltip="'Read-only in this plan'"&gt;Seats&lt;/span&gt;</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton v-apex-tooltip="'Save changes'" icon="save" icon-only label="Save" />
            <ApexButton
              v-apex-tooltip="'Duplicate this record'"
              severity="secondary"
              variant="outlined"
              icon="content_copy"
              icon-only
              label="Duplicate"
            />
            <span v-apex-tooltip="'Read-only in this plan'" class="tip-hint">Seats</span>
          </div>

          <h2>Position</h2>
          <p class="note">
            A modifier is the shorthand — <code>v-apex-tooltip.top</code>. The default is
            <code>right</code>, and any side flips when it will not fit.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton v-apex-tooltip.top="'Above'" severity="secondary" variant="outlined" size="sm">top</ApexButton>
            <ApexButton v-apex-tooltip.bottom="'Below'" severity="secondary" variant="outlined" size="sm">bottom</ApexButton>
            <ApexButton v-apex-tooltip.left="'Before'" severity="secondary" variant="outlined" size="sm">left</ApexButton>
            <ApexButton v-apex-tooltip.right="'After'" severity="secondary" variant="outlined" size="sm">right</ApexButton>
          </div>

          <h2>Delay</h2>
          <p class="note">
            A show delay keeps tooltips out of the way while the pointer crosses a toolbar; a
            hide delay lets it survive a brief exit.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-apex-tooltip="{ value: 'Appears after 600ms', showDelay: 600 }"
              severity="secondary"
              variant="outlined"
              size="sm"
            >showDelay 600</ApexButton>
            <ApexButton
              v-apex-tooltip="{ value: 'Lingers for 800ms', hideDelay: 800 }"
              severity="secondary"
              variant="outlined"
              size="sm"
            >hideDelay 800</ApexButton>
          </div>

          <h2>Event</h2>
          <p class="note">
            Hover by default. <code>focus</code> serves keyboard users on a field;
            <code>both</code> covers either route — tab into the input below.
          </p>
          <div class="grid grid--2" style="margin-top: 12px">
            <div class="cell">
              <span class="cell__tag">event: 'focus'</span>
              <ApexInput
                v-model="tipField"
                v-apex-tooltip="{ value: 'Your work email', event: 'focus' }"
                label="Email"
                placeholder="you@company.com"
              />
            </div>
            <div class="cell">
              <span class="cell__tag">event: 'both'</span>
              <ApexButton
                v-apex-tooltip="{ value: 'Hover or focus', event: 'both' }"
                severity="secondary"
                variant="outlined"
              >Either</ApexButton>
            </div>
          </div>

          <h2>Auto hide</h2>
          <p class="note">
            With <code>autoHide: false</code> the tooltip stays while the pointer is inside it,
            so content in it can be read or clicked. A short grace period covers the gap
            between target and panel.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-apex-tooltip="{ value: 'Move onto this tooltip &mdash; it waits. &lt;a href=&quot;#&quot;&gt;Even a link&lt;/a&gt; is reachable.', autoHide: false, escape: false, maxWidth: '220px', position: 'bottom' }"
              severity="secondary"
              variant="outlined"
              icon="ads_click"
              size="sm"
            >Interactive</ApexButton>
          </div>

          <h2>Custom</h2>
          <p class="note">
            Set <code>escape: false</code> for rich content, and override the chrome per
            tooltip.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-apex-tooltip="{ value: '&lt;strong&gt;Storage&lt;/strong&gt;&lt;br&gt;72 of 100 GB used', escape: false, position: 'top' }"
              severity="secondary"
              variant="outlined"
              size="sm"
            >HTML</ApexButton>
            <ApexButton
              v-apex-tooltip="{ value: 'This action cannot be undone', background: '#C41E1E', color: '#FFF', position: 'top' }"
              severity="danger"
              variant="outlined"
              size="sm"
            >Tinted</ApexButton>
            <ApexButton
              v-apex-tooltip="{ value: 'No arrow, wider box, and a little further out', showArrow: false, maxWidth: '180px', gap: 14, position: 'bottom' }"
              severity="secondary"
              variant="outlined"
              size="sm"
            >Chrome</ApexButton>
          </div>

          <h2>Disabled and reactive</h2>
          <p class="note">
            The binding is reactive: <code>disabled</code> suppresses the tooltip and closes it
            if open, and new text reaches an open tooltip without a re-hover.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-apex-tooltip="{ value: tipText, disabled: tipOff }"
              severity="secondary"
              variant="outlined"
            >Hover me</ApexButton>
            <ApexButton
              size="sm"
              variant="text"
              @click="tipText = tipText === 'First message' ? 'Changed while open' : 'First message'"
            >change text</ApexButton>
            <ApexButton size="sm" variant="text" @click="tipOff = !tipOff">
              {{ tipOff ? 'enable' : 'disable' }}
            </ApexButton>
          </div>
        </template>

        <!-- Ported from the gallery. StyleClass has two modes and four
             selector keywords; each example isolates one of them. -->
        <template v-if="entry.id === 'styleclass'">
          <h2>Basic</h2>
          <p class="note">
            The target is resolved with <code>selector</code> — here <code>@next</code>, the
            next sibling. No state, no handler: the panel is revealed and hidden by classes
            alone, and <code>hideOnOutsideClick</code> plus <code>hideOnEscape</code> make it
            behave as an overlay.
          </p>
          <div class="sc-block">
            <ApexButton
              v-apex-style-class="{ selector: '@next', enterFromClass: 'apex-hidden',
                enterActiveClass: 'apex-scale-in', leaveActiveClass: 'apex-scale-out',
                leaveToClass: 'apex-hidden', hideOnOutsideClick: true, hideOnEscape: true }"
              icon="expand_more"
            >Toggle panel</ApexButton>
            <div class="sc-panel apex-hidden sc-gap">
              This panel is toggled with ApexStyleClass. Click outside it or press Escape and it
              leaves the same way it arrived.
            </div>
          </div>

          <h2>Animation</h2>
          <p class="note">
            The enter and leave triples take any classes. The directive reads the animation's
            real duration off the element, so a slower class needs no matching timeout — these
            two panels differ only in the classes they are given.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">fade</span>
              <div class="iconstrip">
                <ApexButton
                  v-apex-style-class="{ selector: '.sc-box1', enterFromClass: 'apex-hidden', enterActiveClass: 'apex-fade-in' }"
                  size="sm"
                >Show</ApexButton>
                <ApexButton
                  v-apex-style-class="{ selector: '.sc-box1', leaveActiveClass: 'apex-fade-out', leaveToClass: 'apex-hidden' }"
                  size="sm"
                  severity="secondary"
                  variant="outlined"
                >Hide</ApexButton>
              </div>
              <div class="sc-box sc-box1 apex-hidden sc-gap">Fade</div>
            </div>
            <div class="cell">
              <span class="cell__tag">slide, slowed with apex-dur-slow</span>
              <div class="iconstrip">
                <ApexButton
                  v-apex-style-class="{ selector: '.sc-box2', enterFromClass: 'apex-hidden', enterActiveClass: 'apex-slide-down' }"
                  size="sm"
                >Show</ApexButton>
                <ApexButton
                  v-apex-style-class="{ selector: '.sc-box2', leaveActiveClass: 'apex-slide-up', leaveToClass: 'apex-hidden' }"
                  size="sm"
                  severity="secondary"
                  variant="outlined"
                >Hide</ApexButton>
              </div>
              <div class="sc-box sc-box2 apex-hidden apex-dur-slow sc-gap">Slide</div>
            </div>
          </div>

          <h2>Toggle class</h2>
          <p class="note">
            The other mode: <code>toggleClass</code> simply adds and removes a class, for
            anything that is a state rather than an entrance. A bare string binding is the
            shorthand for toggling on <code>@next</code>.
          </p>
          <div class="sc-block">
            <ApexButton
              v-apex-style-class="{ selector: '@next', toggleClass: 'sc-lit' }"
              severity="secondary"
              variant="outlined"
            >Toggle highlight</ApexButton>
            <div class="sc-panel sc-gap">
              This panel gains and loses a class — no animation sequence involved.
            </div>
          </div>

          <h2>Selector keywords</h2>
          <p class="note">
            Four keywords beyond plain CSS selectors, resolved at click time so a conditionally
            rendered sibling still binds.
          </p>
          <div class="card sc-keywords">
            <div class="sc-frame">
              <div class="sc-mark">@grandparent target</div>
              <div class="sc-frame sc-frame--inner">
                <div class="sc-mark">@parent target</div>
                <ApexButton v-apex-style-class="{ selector: '@parent', toggleClass: 'sc-lit' }" size="sm" variant="text">@parent</ApexButton>
                <ApexButton v-apex-style-class="{ selector: '@grandparent', toggleClass: 'sc-lit' }" size="sm" variant="text">@grandparent</ApexButton>
              </div>
            </div>
            <div class="iconstrip">
              <div class="sc-chip">@prev target</div>
              <ApexButton v-apex-style-class="{ selector: '@prev', toggleClass: 'sc-lit' }" size="sm" variant="text">@prev</ApexButton>
              <ApexButton v-apex-style-class="{ selector: '@next', toggleClass: 'sc-lit' }" size="sm" variant="text">@next</ApexButton>
              <div class="sc-chip">@next target</div>
            </div>
            <div class="iconstrip">
              <ApexButton v-apex-style-class="{ selector: '#sc-far', toggleClass: 'sc-lit' }" size="sm" variant="text">CSS selector</ApexButton>
              <div id="sc-far" class="sc-chip">#sc-far, anywhere on the page</div>
            </div>
          </div>

          <h2>Hide on resize</h2>
          <p class="note">
            <code>hideOnResize</code> runs the leave sequence when something resizes.
            <code>resizeSelector</code> chooses what to watch: <code>window</code> for the
            browser, or a selector to observe that element's own size — the observer's initial
            call is skipped, so the panel does not close the moment it opens.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">window resize</span>
              <ApexButton
                v-apex-style-class="{ selector: '.sc-win', enterFromClass: 'apex-hidden',
                  enterActiveClass: 'apex-fade-in', leaveActiveClass: 'apex-fade-out',
                  leaveToClass: 'apex-hidden', hideOnResize: true }"
                size="sm"
              >Show panel</ApexButton>
              <div class="sc-panel sc-win apex-hidden sc-gap">Resize the browser window and this closes itself.</div>
            </div>
            <div class="cell">
              <span class="cell__tag">element resize</span>
              <ApexButton
                v-apex-style-class="{ selector: '.sc-el', enterFromClass: 'apex-hidden',
                  enterActiveClass: 'apex-fade-in', leaveActiveClass: 'apex-fade-out',
                  leaveToClass: 'apex-hidden', hideOnResize: true, resizeSelector: '.sc-resizable' }"
                size="sm"
              >Show panel</ApexButton>
              <div class="sc-panel sc-el apex-hidden sc-gap">Drag the handle below and this closes itself.</div>
              <div class="sc-resizable sc-gap">Drag my corner</div>
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. Both examples scroll inside their own
             panel: `root` points the observer at that container, so the page
             itself does not have to be scrolled to see anything happen. -->
        <template v-if="entry.id === 'animateonscroll'">
          <h2>Enter and leave</h2>
          <p class="note">
            The directive takes an <code>enterClass</code> and an optional
            <code>leaveClass</code>. Any CSS animation works; the classes below ship with the
            package. Scroll the panel — <code>root</code> points the observer at that container
            instead of the viewport.
          </p>
          <div id="aos-scroller" class="aos-scroller">
            <div class="aos-hint">Scroll down<span class="aos-arrow">↓</span></div>
            <div class="aos-gap"></div>
            <div class="aos-row">
              <div
                v-for="c in AOS_PLANS"
                :key="c.title"
                v-apex-animate-on-scroll="{ root: '#aos-scroller', enterClass: 'apex-anim-enter apex-fade ' + c.from + ' apex-dur-1000', leaveClass: 'apex-anim-leave apex-fade apex-dur-200' }"
                class="aos-card"
              >
                <span class="aos-badge"><ApexIcon :name="c.icon" :size="22" /></span>
                <strong class="aos-title">{{ c.title }}</strong>
                <span class="aos-blurb">{{ c.blurb }}</span>
              </div>
            </div>
            <div class="aos-gap"></div>
            <div class="aos-row">
              <div
                v-for="(p, i) in AOS_PEOPLE"
                :key="p.name"
                v-apex-animate-on-scroll="{ root: '#aos-scroller', enterClass: 'apex-anim-enter apex-fade ' + (i % 2 ? 'apex-from-b' : 'apex-from-t') + ' apex-dist-lg apex-dur-1000', leaveClass: 'apex-anim-leave apex-fade apex-dur-200' }"
                class="aos-card"
              >
                <ApexAvatar :label="p.name" size="lg" shape="circle" auto-color />
                <strong class="aos-name">{{ p.name }}</strong>
                <span class="aos-blurb">{{ p.role }}</span>
              </div>
            </div>
            <div class="aos-gap"></div>
            <div class="aos-row">
              <div
                v-for="s in AOS_STATS"
                :key="s.label"
                v-apex-animate-on-scroll="{ root: '#aos-scroller', enterClass: 'apex-anim-enter apex-fade ' + s.anim + ' apex-from-t apex-dur-1000', leaveClass: 'apex-anim-leave apex-fade apex-dur-200' }"
                class="aos-card aos-card--solid"
              >
                <span class="aos-figure">{{ s.value }}</span>
                <strong class="aos-title">{{ s.label }}</strong>
                <span class="aos-blurb aos-blurb--on">{{ s.blurb }}</span>
              </div>
            </div>
            <div class="aos-gap"></div>
            <div class="aos-row">
              <div
                v-for="(z, i) in AOS_ZOOMS"
                :key="z.label"
                v-apex-animate-on-scroll="{ root: '#aos-scroller', enterClass: 'apex-anim-enter apex-fade ' + z.anim + ' apex-dur-1000 apex-delay-' + (i * 100 || 100), leaveClass: 'apex-anim-leave apex-fade apex-dur-200' }"
                class="aos-card aos-card--tint"
                :style="{ background: z.bg }"
              >
                <span class="aos-ring"><ApexIcon :name="z.icon" :size="22" /></span>
                <strong class="aos-title">{{ z.label }}</strong>
                <span class="aos-blurb aos-blurb--on">{{ z.blurb }}</span>
              </div>
            </div>
            <div class="aos-gap aos-gap--sm"></div>
          </div>

          <h2>Once</h2>
          <p class="note">
            Without a <code>leaveClass</code> the element stays put after its entrance;
            <code>once</code> also stops the observer, which is what you want for content that
            should settle rather than replay every time it passes.
          </p>
          <div id="aos-once" class="aos-scroller aos-scroller--short">
            <div class="aos-gap aos-gap--md"></div>
            <div class="aos-row">
              <div
                v-for="n in 3"
                :key="n"
                v-apex-animate-on-scroll="{ root: '#aos-once', once: true, enterClass: 'apex-anim-enter apex-fade apex-zoom-75 apex-dur-700 apex-delay-' + (n * 100) }"
                class="aos-card aos-card--tight"
              >
                <strong class="aos-name">Settles once</strong>
                <span class="aos-blurb">Delay {{ n * 100 }}ms</span>
              </div>
            </div>
            <div class="aos-gap aos-gap--sm"></div>
          </div>
        </template>

        <!-- Ported from the gallery. A ripple is only judged by pressing one,
             so every example here is pressable. -->
        <template v-if="entry.id === 'ripple'">
          <h2>Default</h2>
          <p class="note">
            Add <code>v-apex-ripple</code> to any element. Press near a corner and the wave
            still covers the whole box — the radius is measured to the furthest corner, not
            assumed from the centre. The boxes are focusable, so Enter and Space ripple too.
          </p>
          <div class="card iconstrip rp-strip">
            <div v-apex-ripple class="rp-box" tabindex="0">Default</div>
            <div v-apex-ripple class="rp-box rp-box--dark" tabindex="0">On dark</div>
            <div v-apex-ripple="{ centered: true }" class="rp-box" tabindex="0">Centred</div>
          </div>

          <h2>Custom</h2>
          <p class="note">
            Without a colour the ink tints from the host's own text colour, which suits a dark
            and a light surface without being set. <code>color</code>, <code>opacity</code> and
            <code>duration</code> override it per element.
          </p>
          <div class="card iconstrip rp-strip">
            <div v-apex-ripple="'var(--accent-primary)'" class="rp-box" tabindex="0">Accent</div>
            <div v-apex-ripple="{ color: '#F97316', opacity: 0.5 }" class="rp-box" tabindex="0">Warm, 50%</div>
            <div v-apex-ripple="{ color: '#0E8C86', duration: '1.4s' }" class="rp-box" tabindex="0">Slow</div>
            <div v-apex-ripple="{ duration: '260ms', opacity: 0.4 }" class="rp-box" tabindex="0">Quick</div>
          </div>

          <h2>On real controls</h2>
          <p class="note">
            The directive attaches to anything, so existing components pick it up without
            changes — buttons, cards, list rows.
          </p>
          <div class="card skl-groups">
            <div class="iconstrip rp-buttons">
              <ApexButton v-apex-ripple="{ color: '#FFF', opacity: 0.35 }">Solid button</ApexButton>
              <ApexButton v-apex-ripple severity="secondary" variant="outlined">Outlined</ApexButton>
              <ApexButton v-apex-ripple variant="text">Text</ApexButton>
              <ApexButton v-apex-ripple icon="favorite" aria-label="Like" />
            </div>
            <div class="rp-list">
              <button
                v-for="p in CREW.slice(0, 4)"
                :key="p.label"
                v-apex-ripple
                type="button"
                class="rp-row"
              >
                <ApexAvatar :label="p.label" size="sm" auto-color />
                <span class="rp-row__name">{{ p.label }}</span>
                <ApexIcon name="chevron_right" :size="18" class="rp-row__chev" />
              </button>
            </div>
          </div>

          <h2>Disabled</h2>
          <p class="note">
            <code>v-apex-ripple="false"</code> leaves the directive in place and stops the
            effect, which is what a conditionally interactive element needs.
          </p>
          <div class="iconstrip">
            <ApexSwitch v-model="rpOff" label="Ripple disabled" />
          </div>
          <div class="card iconstrip">
            <div v-apex-ripple="{ disabled: rpOff }" class="rp-box" tabindex="0">
              {{ rpOff ? 'No ripple' : 'Press me' }}
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. A trap is only observable by tabbing, so
             each example is a form with more than one field in it. -->
        <template v-if="entry.id === 'focustrap'">
          <h2>Basic</h2>
          <p class="note">
            Apply <code>v-apex-focus-trap</code> to a container and Tab cycles within it: from
            the last field it wraps to the first, and Shift+Tab from the first wraps to the
            last. Click into the form and tab through it — focus never reaches the page behind.
          </p>
          <div v-apex-focus-trap="{ autoFocus: false }" class="trap-box">
            <ApexInput v-model="trapName" label="Name" />
            <ApexInput v-model="trapEmail" label="Email" />
            <ApexCheckbox v-model="trapAgree" label="I agree to the terms and conditions" />
            <ApexButton class="trap-submit">Submit</ApexButton>
          </div>
          <p class="note">
            This field is outside the trap:
            <ApexInput v-model="trapOutside" placeholder="Unreachable by Tab from inside" class="trap-outside" />
          </p>

          <h2>Initial focus</h2>
          <p class="note">
            <code>autoFocus</code> focuses the first tabbable element on mount, and an
            <code>[autofocus]</code> element wins over it. <code>initialFocus</code> takes a
            selector when neither is the field you want — here the email.
          </p>
          <div class="iconstrip">
            <ApexButton size="sm" @click="trapPanel = !trapPanel">
              {{ trapPanel ? 'Close panel' : 'Open panel' }}
            </ApexButton>
            <span class="note">Focus returns to this button when the panel closes.</span>
          </div>
          <div
            v-if="trapPanel"
            v-apex-focus-trap="{ initialFocus: '#trap-email', restoreFocus: true }"
            class="trap-box"
          >
            <ApexInput v-model="trapName" label="Name" />
            <ApexInput id="trap-email" v-model="trapEmail" label="Email" />
            <ApexButton size="sm" severity="secondary" variant="outlined" class="trap-submit" @click="trapPanel = false">
              Close
            </ApexButton>
          </div>

          <h2>Disabled</h2>
          <p class="note">
            <code>v-apex-focus-trap="false"</code> — or <code>{ disabled: true }</code> — leaves
            the directive in place and lets Tab out again, which is what a conditionally modal
            panel needs.
          </p>
          <div class="iconstrip">
            <ApexSwitch v-model="trapOff" label="Trap disabled" />
          </div>
          <div v-apex-focus-trap="{ disabled: trapOff, autoFocus: false }" class="trap-box">
            <ApexInput v-model="trapName" label="Name" />
            <ApexButton size="sm" class="trap-submit">Submit</ApexButton>
          </div>
        </template>

        <!-- Ported from the gallery. An Inplace is two states, so every
             example is about what the second one contains. -->
        <template v-if="entry.id === 'inplace'">
          <h2>Basic</h2>
          <p class="note">
            A <code>display</code> slot for the value and a <code>content</code> slot for its
            editor. Clicking the display swaps them; the first field in the content is focused
            automatically, so typing can start straight away.
          </p>
          <div class="card inp-card">
            <strong class="inp-title">Profile</strong>
            <div>
              <span class="cell__tag">Name</span>
              <ApexInplace v-model:active="inpBasic" :display="inpName || 'John Doe'" outlined width="100%">
                <template #content="{ close }">
                  <ApexInput v-model="inpName" placeholder="Enter name" class="inp-field" />
                  <ApexButton size="sm" icon="check" severity="success" variant="text" aria-label="Save" @click="close()" />
                  <ApexButton size="sm" icon="close" severity="danger" variant="text" aria-label="Cancel" @click="inpName = ''; close()" />
                </template>
              </ApexInplace>
            </div>
            <div>
              <span class="cell__tag">Email</span>
              <ApexInplace v-model:active="inpEmailOpen" :display="inpEmail" outlined width="100%" closable>
                <template #content>
                  <ApexInput v-model="inpEmail" class="inp-field" />
                </template>
              </ApexInplace>
            </div>
          </div>

          <h2>Controlled</h2>
          <p class="note">
            <code>v-model:active</code> is two-way, so the state can be driven from outside —
            here the buttons below the field open and close it.
          </p>
          <div class="card inp-narrow">
            <span class="cell__tag">Name</span>
            <ApexInplace v-model:active="inpCtl" :display="inpName || 'John Doe'" width="100%">
              <template #content>
                <ApexInput v-model="inpName" placeholder="Enter name" class="inp-field" />
              </template>
            </ApexInplace>
            <div class="iconstrip inp-actions">
              <ApexButton size="sm" severity="secondary" variant="outlined" class="inp-actions__btn" @click="inpCtl = !inpCtl">
                {{ inpCtl ? 'Cancel' : 'Edit name' }}
              </ApexButton>
              <ApexButton v-if="inpCtl" size="sm" class="inp-actions__btn" @click="inpCtl = false">Save</ApexButton>
            </div>
          </div>

          <h2>Image</h2>
          <p class="note">
            The content is not limited to fields — anything can go inside, including media that
            should not load until asked for.
          </p>
          <div class="card inp-wide">
            <ApexInplace v-model:active="inpImage" display="View photo" display-icon="image" outlined closable>
              <template #content>
                <div class="inp-photo">Placeholder image</div>
              </template>
            </ApexInplace>
          </div>

          <h2>Lazy</h2>
          <p class="note">
            Content is only rendered once opened, so the <code>open</code> event is a usable
            place to fetch: the table below has no rows until the display is clicked.
            <code>keepAlive</code> keeps it mounted afterwards so a reopen does not re-fetch.
          </p>
          <div class="card">
            <ApexInplace
              v-model:active="inpLazy"
              display="View data"
              display-icon="table"
              outlined
              keep-alive
              closable
              @open="loadInplaceRows"
            >
              <template #content>
                <div class="inp-lazy">
                  <ApexBlockUI :blocked="inpLoading" message="Loading…" radius="10px">
                    <ApexDataTable :value="inpRows" :columns="INP_COLUMNS" size="sm" />
                  </ApexBlockUI>
                </div>
              </template>
            </ApexInplace>
            <p class="note">Fetches: <code>{{ inpFetches }}</code></p>
          </div>

          <h2>Styling and states</h2>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">outlined, tinted hover</span>
              <ApexInplace
                display="Click to edit"
                display-icon="edit"
                outlined
                hover-background="color-mix(in oklch, var(--accent-primary) 12%, transparent)"
                hover-color="var(--accent-primary)"
                radius="10px"
              >
                <template #content="{ close }">
                  <ApexInput model-value="Editing" class="inp-field" />
                  <ApexButton size="sm" icon="check" aria-label="Save" @click="close()" />
                </template>
              </ApexInplace>
            </div>
            <div class="cell">
              <span class="cell__tag">filled display, padded content</span>
              <ApexInplace
                display="Filled display"
                background="var(--bg-muted)"
                padding="10px 14px"
                radius="999px"
                content-background="var(--bg-muted)"
                content-padding="10px"
                closable
              >
                <template #content><ApexInput model-value="Editing" class="inp-field" /></template>
              </ApexInplace>
            </div>
            <div class="cell">
              <span class="cell__tag">no hover feedback</span>
              <ApexInplace display="Looks static, still opens" :hoverable="false" closable>
                <template #content><ApexInput model-value="Editing" class="inp-field" /></template>
              </ApexInplace>
            </div>
            <div class="cell">
              <span class="cell__tag">disabled</span>
              <ApexInplace display="Read only" display-icon="lock" outlined disabled>
                <template #content><ApexInput model-value="Editing" class="inp-field" /></template>
              </ApexInplace>
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. Every block here can be released: by a
             button, by its own duration, or by clicking the cover. A demo that
             can strand the reader is not a demo. -->
        <template v-if="entry.id === 'blockui'">
          <h2>Basic</h2>
          <p class="note">
            The content to block goes inside; <code>v-model:blocked</code> controls it. The
            cover intercepts clicks and focus, so tabbing cannot reach the panel underneath
            either.
          </p>
          <div class="iconstrip">
            <ApexButton size="sm" :icon="blkBasic ? 'lock_open' : 'lock'" @click="blkBasic = !blkBasic">
              {{ blkBasic ? 'Unblock' : 'Block' }}
            </ApexButton>
          </div>
          <ApexBlockUI v-model:blocked="blkBasic" class="blk-narrow">
            <ApexCard title="Account settings" subtitle="Manage your workspace preferences">
              Update your profile, configure notifications and control privacy. Block the panel
              to prevent changes while your settings are being saved.
              <template #footer>
                <ApexButton size="sm">Save</ApexButton>
                <ApexInput v-model="blkField" placeholder="Try tabbing here" class="blk-field" />
              </template>
            </ApexCard>
          </ApexBlockUI>

          <h2>Timed release</h2>
          <p class="note">
            <code>duration</code> releases the block by itself, with <code>showTimer</code>
            drawing the countdown along the cover's edge. A block waiting on a request that may
            never answer otherwise leaves the user stuck, so the timeout belongs to the block
            rather than each caller's own <code>setTimeout</code>. <code>timeout</code> fires
            when the clock ran out rather than a caller releasing it.
          </p>
          <div class="iconstrip">
            <ApexButton size="sm" @click="blkTimed = true">Block for 3 seconds</ApexButton>
            <ApexButton size="sm" severity="secondary" variant="outlined" @click="blkTimed = false">Release now</ApexButton>
          </div>
          <ApexBlockUI
            v-model:blocked="blkTimed"
            :duration="3000"
            show-timer
            message="Saving…"
            blur
            class="blk-narrow"
            @timeout="blkLog = 'released by the timer'"
            @unblock="blkLog = blkLog || 'released by the caller'"
          >
            <ApexCard title="Billing" subtitle="Card ending 4242">Charges are settled nightly.</ApexCard>
          </ApexBlockUI>
          <p class="note">
            Last release: <code>{{ blkLog || 'none yet' }}</code>
            <ApexButton size="sm" variant="text" @click="blkLog = ''">Clear</ApexButton>
          </p>

          <h2>Styling</h2>
          <p class="note">
            Cover colour, opacity, blur and corners, plus what shows on it — spinner, icon,
            message, or your own markup through the <code>content</code> slot.
          </p>
          <div class="iconstrip">
            <ApexSwitch v-model="blkStyled" label="Block all four" />
          </div>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">light cover, heavy blur</span>
              <ApexBlockUI
                :blocked="blkStyled"
                background="#FFFFFF"
                :opacity="0.55"
                :blur="6"
                content-color="var(--fg-default)"
                message="Loading…"
                radius="14px"
              >
                <div class="blk-panel">Panel content</div>
              </ApexBlockUI>
            </div>
            <div class="cell">
              <span class="cell__tag">icon instead of a spinner</span>
              <ApexBlockUI :blocked="blkStyled" icon="lock" message="Read only" background="#1B2430" :opacity="0.62" radius="14px">
                <div class="blk-panel">Panel content</div>
              </ApexBlockUI>
            </div>
            <div class="cell">
              <span class="cell__tag">passthrough — dims only</span>
              <ApexBlockUI :blocked="blkStyled" passthrough :spinner="false" :opacity="0.3" radius="14px">
                <div class="blk-panel">Still clickable</div>
              </ApexBlockUI>
            </div>
            <div class="cell">
              <span class="cell__tag">custom content, click to dismiss</span>
              <ApexBlockUI
                :blocked="blkStyled"
                dismissable
                background="var(--accent-primary)"
                :opacity="0.9"
                radius="14px"
                @unblock="blkStyled = false"
              >
                <div class="blk-panel">Panel content</div>
                <template #content>
                  <div class="blk-custom">
                    <ApexIcon name="touch_app" :size="26" />
                    <strong class="blk-custom__text">Click anywhere to release</strong>
                  </div>
                </template>
              </ApexBlockUI>
            </div>
          </div>

          <h2>Document</h2>
          <p class="note">
            <code>fullScreen</code> blocks the whole document rather than any one element, and
            holds the page still while it is up. Pair it with <code>duration</code> so a stuck
            request cannot trap the user — this one releases itself after two seconds, and the
            cover is dismissable as well.
          </p>
          <div class="iconstrip">
            <ApexButton size="sm" @click="blkDoc = true">Block the document for 2 seconds</ApexButton>
          </div>
          <ApexBlockUI
            v-model:blocked="blkDoc"
            full-screen
            dismissable
            :duration="2000"
            show-timer
            blur
            message="Publishing to 6 displays…"
          />
        </template>

        <!-- Ported from the gallery. Every example binds to its own scroller
             rather than the window, so the buttons stay inside their panels
             instead of stacking in the corner of the docs page. -->
        <template v-if="entry.id === 'scrolltop'">
          <h2>Basic</h2>
          <p class="note">
            With no <code>target</code> it watches the window and pins itself to the viewport.
            Scroll this page down and it appears in the bottom-right corner — the one on this
            page also shows the reading-progress ring.
          </p>
          <ApexScrollTop :threshold="240" show-progress progress-color="var(--accent-primary)" />

          <h2>Target element</h2>
          <p class="note">
            <code>target="parent"</code> binds it to the nearest scrolling ancestor. The button
            is placed from that scroller's own frame and sits just below it, in space reserved
            outside the scroller — the gap lands under the text, and nothing can scroll behind
            the button. A selector works too, for a scroller elsewhere in the page.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">target="parent"</span>
              <div class="st-scroller">
                <p v-for="n in 10" :key="n" class="st-para">
                  Paragraph {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut labore.
                </p>
                <ApexScrollTop target="parent" :threshold="80" offset="14px" />
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">with a progress ring</span>
              <div class="st-scroller">
                <p v-for="n in 10" :key="n" class="st-para">
                  Paragraph {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                  sed do eiusmod tempor incididunt ut labore.
                </p>
                <ApexScrollTop
                  target="parent"
                  :threshold="60"
                  offset="14px"
                  show-progress
                  progress-color="var(--accent-success)"
                />
              </div>
            </div>
          </div>

          <h2>Styling and placement</h2>
          <p class="note">
            Size, corners, colours, hover colours and the corner it sits in. A
            <code>label</code> turns the circle into a pill, and <code>hoverLift</code> off
            keeps it still.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">pill with a label, bottom-start</span>
              <div class="st-scroller">
                <p v-for="n in 10" :key="n" class="st-para">Paragraph {{ n }}. Scroll to reveal the button.</p>
                <ApexScrollTop
                  target="parent"
                  :threshold="60"
                  offset="14px"
                  position="bottom-start"
                  label="Back to top"
                  background="var(--accent-primary)"
                  color="#FFF"
                  hover-background="oklch(0.42 0.19 258)"
                />
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">squared, outlined, centred, no lift</span>
              <div class="st-scroller">
                <p v-for="n in 10" :key="n" class="st-para">Paragraph {{ n }}. Scroll to reveal the button.</p>
                <ApexScrollTop
                  target="parent"
                  :threshold="60"
                  offset="14px"
                  position="bottom-center"
                  :hover-lift="false"
                  size="36px"
                  radius="8px"
                  icon="keyboard_arrow_up"
                  background="var(--bg-elevated)"
                  color="var(--fg-default)"
                  border-color="var(--border-default)"
                  hover-background="var(--bg-muted)"
                  shadow="var(--shadow-md)"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. Both spinner modes are the same ring, so
             the examples are arranged to make that visible. -->
        <template v-if="entry.id === 'progressspinner'">
          <h2>Indeterminate</h2>
          <p class="note">
            With no <code>value</code> the ring spins. <code>arc</code> sets how much of the
            circle it covers, <code>duration</code> its pace, and <code>pulse</code> adds the
            classic growing-and-shrinking arc on top of the rotation.
          </p>
          <div class="card iconstrip psp-strip">
            <ApexProgressSpinner label="Loading" />
            <ApexProgressSpinner :arc="60" label="Loading" />
            <ApexProgressSpinner :arc="12" :stroke-width="8" duration="0.7s" label="Loading" />
            <ApexProgressSpinner pulse :show-track="false" label="Loading" />
            <ApexProgressSpinner pulse :size="72" :stroke-width="6" severity="success" label="Loading" />
          </div>

          <h2>Determinate</h2>
          <p class="note">
            Give it a <code>value</code> and the same ring becomes an arc, with
            <code>showValue</code> for the figure in the middle. Because both modes are one
            circle, switching between them does not move anything.
          </p>
          <div class="card psp-rows">
            <div class="iconstrip psp-strip">
              <ApexProgressSpinner v-for="v in [25, 50, 75, 100]" :key="v" :value="v" show-value :size="64" />
            </div>
            <div class="iconstrip psp-strip">
              <ApexProgressSpinner v-for="v in [24, 58, 91]" :key="'a' + v" :value="v" show-value :size="64" severity="auto" />
              <span class="note">severity="auto" — tinted by threshold</span>
            </div>
            <div class="iconstrip psp-run">
              <ApexProgressSpinner :value="spinLive" show-value :size="72" :stroke-width="6" />
              <ApexButton size="sm" @click="startSpin">Run</ApexButton>
              <ApexButton size="sm" severity="secondary" variant="outlined" @click="resetSpin">Reset</ApexButton>
            </div>
          </div>

          <h2>Size, stroke and colour</h2>
          <p class="note">
            The radius is derived from the stroke, so a thick ring stays inside its box at any
            diameter. <code>linecap="butt"</code> squares the ends, and <code>showTrack</code>
            off leaves a bare arc.
          </p>
          <div class="card skl-groups">
            <div class="iconstrip psp-mid">
              <ApexProgressSpinner v-for="s in [20, 32, 48, 72, 96]" :key="s" :size="s" :stroke-width="4" />
            </div>
            <div class="iconstrip psp-mid">
              <ApexProgressSpinner v-for="w in [2, 4, 8, 14, 20]" :key="w" :size="64" :stroke-width="w" :value="65" />
            </div>
            <div class="iconstrip psp-mid">
              <ApexProgressSpinner :value="70" :size="64" color="#0F141C" track-color="#E8ECF2" show-value />
              <ApexProgressSpinner :value="70" :size="64" color="oklch(0.55 0.20 300)" :show-track="false" show-value />
              <ApexProgressSpinner :value="70" :size="64" :stroke-width="10" linecap="butt" color="#F97316" />
              <ApexProgressSpinner :size="64" :stroke-width="10" linecap="butt" :arc="30" />
            </div>
          </div>

          <h2>In context</h2>
          <p class="note">
            The middle slot takes any content, so the ring can hold a figure of its own — and
            the whole thing sits inline with text or inside a button as easily as on its own.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">custom middle content</span>
              <div class="iconstrip psp-mid">
                <ApexProgressSpinner :value="33" :size="96" :stroke-width="7" show-value color="#0E8C86">
                  <template #default="{ percent }">
                    <span class="psp-figure">{{ Math.round(percent) }}<span class="psp-figure__pc">%</span></span>
                  </template>
                </ApexProgressSpinner>
                <ApexProgressSpinner :value="86" :size="96" :stroke-width="7" show-value severity="success">
                  <template #default><ApexIcon name="check" :size="34" class="psp-done" /></template>
                </ApexProgressSpinner>
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">inline and in a button</span>
              <div class="skl-col">
                <span class="note psp-inline">
                  <ApexProgressSpinner :size="16" :stroke-width="10" :show-track="false" /> Checking availability…
                </span>
                <ApexButton severity="secondary" variant="outlined" class="psp-btn">
                  <ApexProgressSpinner :size="15" :stroke-width="12" :show-track="false" color="currentColor" />
                  Saving
                </ApexButton>
                <div class="psp-pane">
                  <ApexProgressSpinner pulse :size="40" :show-track="false" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. A meter is about the remainder as much as
             the segments, so every example keeps the empty track visible. -->
        <template v-if="entry.id === 'metergroup'">
          <h2>Basic</h2>
          <p class="note">
            One value or many, all measured against <code>min</code> and <code>max</code>. The
            remainder stays as empty track — a meter is about what is used out of a whole, not
            a distribution.
          </p>
          <div class="card mtr-stack">
            <ApexMeterGroup :value="[{ label: 'Space used', value: 15 }]" />
            <ApexMeterGroup :value="MTR_DISK" />
          </div>

          <h2>Colour</h2>
          <p class="note">
            Each item takes a <code>color</code> — a CSS variable, hex, rgb or hsl. Without
            one, colours come from a six-step sequence so a group is legible before any are set.
          </p>
          <div class="card mtr-narrow">
            <ApexMeterGroup :value="MTR_COLOURS" />
          </div>

          <h2>Icons and labels</h2>
          <p class="note">
            An item's <code>icon</code> replaces its marker.
            <code>labelOrientation="vertical"</code> stacks the labels, and
            <code>labelPosition="start"</code> puts them above the track.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">icons</span>
              <ApexMeterGroup :value="MTR_ICONS" />
            </div>
            <div class="cell">
              <span class="cell__tag">vertical labels, above the track</span>
              <ApexMeterGroup :value="MTR_ICONS" label-orientation="vertical" label-position="start" />
            </div>
          </div>

          <h2>Vertical</h2>
          <p class="note">
            <code>orientation="vertical"</code> stands the track up and stacks the segments
            from the bottom.
          </p>
          <div class="card">
            <ApexMeterGroup :value="MTR_ICONS" orientation="vertical" length="220px" size="12px" />
          </div>

          <h2>Min and max</h2>
          <p class="note">
            The same values against a different range — <code>max="200"</code> halves every
            segment, which is the point of stating the range rather than pre-computing
            percentages.
          </p>
          <div class="card mtr-stack">
            <ApexMeterGroup :value="MTR_DISK" :max="100" />
            <ApexMeterGroup :value="MTR_DISK" :max="200" />
          </div>

          <h2>Styling and interaction</h2>
          <p class="note">
            <code>hoverable</code> dims the other segments on hover, which reads more clearly
            than highlighting the one under the pointer, and emits <code>item-click</code>. A
            <code>segmentRadius</code> separates the meters into distinct quantities.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">thick, separated segments</span>
              <ApexMeterGroup
                :value="MTR_COLOURS"
                size="16px"
                segment-radius="999px"
                gap="18px"
                track-background="var(--bg-subtle)"
                hoverable
                animated
                @item-click="actionLog = $event.item.label"
              />
            </div>
            <div class="cell">
              <span class="cell__tag">square, no markers or values</span>
              <ApexMeterGroup
                :value="MTR_COLOURS"
                size="22px"
                radius="4px"
                :show-values="false"
                :show-markers="false"
                label-size="12px"
                hoverable
                @item-click="actionLog = $event.item.label"
              />
            </div>
          </div>
          <p class="note">Last clicked: <code>{{ actionLog || 'none yet' }}</code></p>

          <h2>Template</h2>
          <p class="note">
            The <code>label</code> slot replaces the list, <code>start</code> and
            <code>end</code> add content around the group, and <code>meter</code> replaces a
            single segment. All receive the computed total.
          </p>
          <div class="card mtr-wide">
            <ApexMeterGroup :value="MTR_ICONS" label-position="start" gap="16px">
              <template #label="{ items }">
                <div class="grid grid--2 mtr-cards">
                  <div v-for="it in items" :key="it.label" class="mtr-card">
                    <div>
                      <span class="mtr-card__label">{{ it.label }}</span>
                      <strong class="mtr-card__value">{{ it.value }}%</strong>
                    </div>
                    <span class="mtr-badge" :style="{ background: it.color }">
                      <ApexIcon :name="it.icon" :size="18" />
                    </span>
                  </div>
                </div>
              </template>
              <template #start="{ total }">
                <div class="mtr-row">
                  <strong class="mtr-row__title">Storage</strong>
                  <span>{{ Math.round(total) }}%</span>
                  <span class="mtr-row__cap">1 TB</span>
                </div>
              </template>
              <template #end>
                <div class="iconstrip mtr-actions">
                  <ApexButton size="sm" severity="secondary" variant="outlined">Manage storage</ApexButton>
                  <ApexButton size="sm">Update plan</ApexButton>
                </div>
              </template>
            </ApexMeterGroup>
          </div>
        </template>

        <!-- Ported from the gallery. A skeleton is only convincing in the
             shape of the thing it stands in for, so the later examples are
             compositions rather than single placeholders. -->
        <template v-if="entry.id === 'skeleton'">
          <h2>Basic</h2>
          <p class="note">
            Placeholder shapes in the layout the real content will take. The shimmer travels
            left to right; a <code>delay</code> staggers a stack so the rows don't move in
            lockstep.
          </p>
          <div class="card skl-media skl-narrow">
            <ApexSkeleton shape="circle" size="2.5rem" />
            <div class="skl-lines">
              <ApexSkeleton height=".75rem" />
              <ApexSkeleton height=".75rem" width="90%" delay=".15s" />
            </div>
          </div>

          <h2>Shapes</h2>
          <p class="note">
            <code>shape</code> with <code>size</code>, <code>width</code>, <code>height</code>
            and <code>borderRadius</code>. A circle and a square size from one value, so
            neither can come out stretched.
          </p>
          <div class="card skl-groups">
            <div>
              <span class="cell__tag">circle</span>
              <div class="iconstrip skl-shapes">
                <ApexSkeleton v-for="s in ['5rem', '4rem', '3rem', '2rem']" :key="s" shape="circle" :size="s" />
              </div>
            </div>
            <div>
              <span class="cell__tag">square</span>
              <div class="iconstrip skl-shapes">
                <ApexSkeleton v-for="s in ['5rem', '4rem', '3rem', '2rem']" :key="s" shape="square" :size="s" />
              </div>
            </div>
            <div class="skl-narrow">
              <span class="cell__tag">rectangle</span>
              <div class="skl-col">
                <ApexSkeleton height="1rem" />
                <ApexSkeleton height="1rem" width="70%" />
                <ApexSkeleton height="4rem" />
              </div>
            </div>
            <div class="skl-narrow">
              <span class="cell__tag">rounded</span>
              <div class="skl-col">
                <ApexSkeleton shape="rounded" height="1rem" />
                <ApexSkeleton shape="rounded" height="4rem" />
                <ApexSkeleton height="2rem" width="60%" border-radius="999px" />
              </div>
            </div>
          </div>

          <h2>Text blocks</h2>
          <p class="note">
            <code>shape="text"</code> with <code>lines</code> renders a paragraph block at copy
            height, the last line shortened to <code>lastLineWidth</code> so it reads as prose
            rather than a bar chart.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">3 lines</span>
              <ApexSkeleton shape="text" :lines="3" />
            </div>
            <div class="cell">
              <span class="cell__tag">5 lines, wider gap, 40% last line</span>
              <ApexSkeleton shape="text" :lines="5" line-gap="12px" last-line-width="40%" />
            </div>
          </div>

          <h2>Animation and colour</h2>
          <p class="note">
            Three animations, a configurable <code>duration</code>, and both the base and the
            travelling band are colours you set.
          </p>
          <div class="card skl-anim">
            <div v-for="a in ['wave', 'pulse', 'none']" :key="a" class="iconstrip skl-anim__row">
              <span class="cell__tag skl-anim__tag">{{ a }}</span>
              <ApexSkeleton :animation="a" height="1rem" />
            </div>
            <div class="iconstrip skl-anim__row">
              <span class="cell__tag skl-anim__tag">slow</span>
              <ApexSkeleton duration="3s" height="1rem" />
            </div>
            <div class="skl-col">
              <ApexSkeleton
                height="1.25rem"
                background="color-mix(in oklch, var(--accent-primary) 18%, transparent)"
                shimmer-color="color-mix(in oklch, var(--accent-primary) 38%, #FFF)"
              />
              <ApexSkeleton height="1.25rem" background="#1B2430" shimmer-color="#33404F" />
              <ApexSkeleton
                height="1.25rem"
                background="color-mix(in oklch, var(--accent-success) 20%, transparent)"
                shimmer-color="color-mix(in oklch, var(--accent-success) 40%, #FFF)"
                border-radius="999px"
              />
            </div>
          </div>

          <h2>Card</h2>
          <p class="note">
            A card placeholder is a handful of skeletons in the card's own layout — no separate
            component.
          </p>
          <div class="card skl-cardph">
            <div class="skl-media">
              <ApexSkeleton shape="circle" size="3rem" />
              <div class="skl-lines">
                <ApexSkeleton height=".8rem" width="55%" />
                <ApexSkeleton height=".8rem" delay=".1s" />
              </div>
            </div>
            <ApexSkeleton shape="rounded" height="9rem" delay=".2s" />
            <div class="iconstrip skl-actions">
              <ApexSkeleton shape="rounded" width="5rem" height="2rem" />
              <ApexSkeleton shape="rounded" width="5rem" height="2rem" delay=".1s" />
            </div>
          </div>

          <h2>List, grid and table</h2>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">list</span>
              <div class="skl-list">
                <div v-for="n in 4" :key="n" class="skl-media">
                  <ApexSkeleton shape="circle" size="2.75rem" :delay="(n * 0.08) + 's'" />
                  <div class="skl-lines skl-lines--tight">
                    <ApexSkeleton height=".7rem" :delay="(n * 0.08) + 's'" />
                    <ApexSkeleton height=".7rem" width="72%" :delay="(n * 0.08 + 0.05) + 's'" />
                  </div>
                </div>
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">table</span>
              <div class="skl-table">
                <div class="iconstrip skl-trow">
                  <strong v-for="h in ['Code', 'Name', 'Qty']" :key="h" class="skl-th">{{ h }}</strong>
                </div>
                <div v-for="n in 5" :key="n" class="iconstrip skl-trow">
                  <ApexSkeleton v-for="col in 3" :key="col" height=".7rem" class="skl-td" :delay="(n * 0.06) + 's'" />
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid--3 skl-tiles">
            <div v-for="n in 6" :key="n" class="cell skl-tile">
              <ApexSkeleton shape="rounded" height="6rem" :delay="(n * 0.07) + 's'" />
              <div class="skl-media skl-media--tight">
                <ApexSkeleton shape="circle" size="1.75rem" :delay="(n * 0.07) + 's'" />
                <div class="skl-lines skl-lines--tight">
                  <ApexSkeleton height=".6rem" :delay="(n * 0.07) + 's'" />
                  <ApexSkeleton height=".6rem" width="70%" :delay="(n * 0.07 + 0.05) + 's'" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. An avatar's job is to be recognisable at
             a glance in a list, so the examples build up from what it shows to
             how a whole set of them reads together. -->
        <template v-if="entry.id === 'avatar'">
          <h2>Content</h2>
          <p class="note">
            An image if there is one, otherwise initials from the label, otherwise an icon —
            so a partial dataset still renders sensibly.
          </p>
          <div class="card iconstrip">
            <ApexAvatar image="/heroes/totem-43.png" label="Totem" size="lg" />
            <ApexAvatar label="A. Borg" size="lg" auto-color />
            <ApexAvatar initials="AP" size="lg" />
            <ApexAvatar icon="storefront" size="lg" />
            <ApexAvatar size="lg" />
          </div>

          <h2>Sizes and shapes</h2>
          <div class="card stack">
            <div v-for="sh in ['circle', 'rounded', 'square']" :key="sh" class="iconstrip">
              <span class="cell__tag bdg-row__tag">{{ sh }}</span>
              <ApexAvatar
                v-for="sz in ['xs', 'sm', 'md', 'lg', 'xl']"
                :key="sz"
                label="L. Rossi"
                :size="sz"
                :shape="sh"
                auto-color
              />
            </div>
          </div>

          <h2>Auto colour</h2>
          <p class="note">
            A stable hue derived from the label, so the same person keeps the same colour
            across every screen — no palette assignment per row.
          </p>
          <div class="card iconstrip">
            <ApexAvatar v-for="p in CREW" :key="p.label" :label="p.label" auto-color size="lg" />
          </div>

          <h2>Status</h2>
          <div class="card iconstrip">
            <ApexAvatar
              v-for="s in ['online', 'busy', 'away', 'offline']"
              :key="s"
              label="K. Weber"
              auto-color
              size="lg"
              :status="s"
            />
            <ApexAvatar label="Custom" auto-color size="lg" status="#7C3AED" status-position="top-end" />
          </div>

          <h2>Badge</h2>
          <p class="note">
            A count or short text pinned to a corner. It is a pill rather than a dot, so it
            sizes from its own content and holds two digits without clipping. Put it opposite
            the status dot and both show.
          </p>
          <div class="card iconstrip bdg-overlays">
            <ApexAvatar label="A. Borg" auto-color size="lg" badge="3" />
            <ApexAvatar label="L. Rossi" auto-color size="lg" badge="12" badge-severity="primary" />
            <ApexAvatar label="K. Weber" auto-color size="lg" badge="99+" badge-severity="warn" />
            <ApexAvatar label="M. Sant" auto-color size="lg" badge="New" badge-severity="success" badge-position="bottom-end" />
            <ApexAvatar image="/heroes/totem-43.png" size="lg" badge="4" badge-severity="contrast" />
            <ApexAvatar label="J. Camilleri" auto-color size="lg" badge="2" status="online" />
          </div>

          <h2>Groups</h2>
          <p class="note">
            <code>ApexAvatarGroup</code> overlaps a set and collapses the overflow into a counter.
          </p>
          <div class="card stack av-stack">
            <ApexAvatarGroup :people="CREW" auto-color />
            <ApexAvatarGroup :people="CREW" :max="4" auto-color size="lg" />
            <ApexAvatarGroup :people="CREW" :max="3" auto-color shape="rounded" size="sm" overlap="6px" />
          </div>

          <h2>Template</h2>
          <p class="note">
            The default slot overlays content inside the avatar, and the group's slot takes
            ApexAvatar children directly when the set is not uniform.
          </p>
          <div class="card stack av-stack">
            <ApexAvatarGroup>
              <ApexAvatar label="A. Borg" auto-color ring />
              <ApexAvatar image="/heroes/totem-43.png" ring />
              <ApexAvatar icon="storefront" ring background="var(--accent-primary)" color="#FFF" />
              <ApexAvatar label="+8" initials="+8" ring background="var(--fg-default)" color="var(--bg-surface)" />
            </ApexAvatarGroup>
            <div class="iconstrip bdg-overlays">
              <ApexAvatar label="Live" auto-color size="xl">
                <span class="av-tag">LIVE</span>
              </ApexAvatar>
              <ApexAvatar background="var(--bg-muted)" size="xl">
                <ApexIcon name="add" :size="26" class="av-add" />
              </ApexAvatar>
            </div>
          </div>
        </template>

        <!-- Ported from the gallery. Chips only make sense in groups, so
             every example here is a row of them rather than one specimen. -->
        <template v-if="entry.id === 'chip'">
          <h2>Basic</h2>
          <p class="note">
            A label, optionally with an icon and a remove control. <code>remove</code> is an
            event rather than the chip deleting itself — the list owns its own data.
          </p>
          <div class="card iconstrip">
            <ApexChip
              v-for="t in chipTags"
              :key="t"
              :label="t"
              removable
              @remove="chipTags = chipTags.filter((x) => x !== t)"
            />
            <ApexButton
              v-if="chipTags.length < 4"
              size="sm"
              variant="text"
              icon="refresh"
              @click="chipTags = CHIP_TAGS.slice()"
            >Reset</ApexButton>
          </div>

          <h2>Severity and variant</h2>
          <div class="card stack">
            <div v-for="v in ['subtle', 'solid', 'outlined']" :key="v" class="iconstrip">
              <span class="cell__tag bdg-row__tag">{{ v }}</span>
              <ApexChip v-for="s in CHIP_SEVERITIES" :key="s" :label="s" :severity="s" :variant="v" />
            </div>
          </div>

          <h2>Sizes, icons and images</h2>
          <div class="card stack">
            <div class="iconstrip">
              <ApexChip v-for="s in ['sm', 'md', 'lg']" :key="s" :size="s" label="Northern Harbour" icon="place" removable />
            </div>
            <div class="iconstrip">
              <ApexChip label="Verified" icon="verified" severity="success" />
              <ApexChip label="Scheduled" icon="schedule" trailing-icon="chevron_right" severity="primary" clickable />
              <ApexChip label="Amy Elsner" image="/heroes/totem-43.png" removable />
              <ApexChip label="A. Borg" removable>
                <template #leading>
                  <ApexAvatar label="A. Borg" size="xs" auto-color class="chip-lead-avatar" />
                </template>
                A. Borg
              </ApexChip>
            </div>
          </div>

          <h2>Selectable</h2>
          <p class="note">
            <code>clickable</code> turns the chip into a button — hover and press feedback,
            keyboard reachable, <code>aria-pressed</code>. With <code>v-model:selected</code> a
            row of them is a multi-choice field, and <code>selectedIcon</code> swaps the glyph
            while selected.
          </p>
          <div class="card">
            <strong class="chip-ask">What are you interested in?</strong>
            <p class="note chip-ask__hint">You can select multiple answers.</p>
            <div class="iconstrip chip-wrap">
              <ApexChip
                v-for="c in CHIP_INTERESTS"
                :key="c.label"
                :label="c.label"
                :icon="c.icon"
                selected-icon="check_circle"
                clickable
                severity="primary"
                :selected="chipPicked.includes(c.label)"
                @update:selected="toggleChip(c.label)"
              />
            </div>
            <p class="note">Selected: <code>{{ chipPicked.join(', ') || 'none' }}</code></p>
          </div>

          <h2>Styling and states</h2>
          <div class="card iconstrip">
            <ApexChip label="Squared" icon="crop_square" radius="6px" />
            <ApexChip label="Custom" background="#6D4AC4" color="#FFF" removable />
            <ApexChip label="Custom selected" clickable selected selected-background="#0E8C86" selected-color="#FFF" />
            <ApexChip label="Fixed width truncates a long label" width="170px" removable />
            <ApexChip label="Disabled" icon="block" disabled removable />
            <ApexChip label="Disabled clickable" clickable disabled />
          </div>
        </template>

        <!-- Ported from the gallery. A badge is mostly about shape and
             placement, so each example varies one of those. -->
        <template v-if="entry.id === 'badge'">
          <h2>Basic</h2>
          <p class="note">
            On its own it is an inline marker. Note the shape: one digit is a circle,
            longer values grow into a pill.
          </p>
          <div class="card iconstrip">
            <ApexBadge value="2" />
            <ApexBadge value="12" />
            <ApexBadge value="99+" />
            <ApexBadge value="New" severity="success" />
            <ApexBadge dot severity="danger" />
            <span class="note">Inline in a sentence <ApexBadge value="3" severity="danger" /> beside text.</span>
          </div>

          <h2>Severity</h2>
          <div class="card stack">
            <div v-for="v in ['solid', 'outlined', 'subtle']" :key="v" class="iconstrip">
              <span class="cell__tag bdg-row__tag">{{ v }}</span>
              <ApexBadge v-for="s in BDG_SEVERITIES" :key="s" :value="BDG_COUNT[s]" :severity="s" :variant="v" />
            </div>
            <div class="iconstrip">
              <span class="cell__tag bdg-row__tag">custom</span>
              <ApexBadge value="7" background="#6D4AC4" />
              <ApexBadge value="7" background="#0E8C86" radius="6px" />
              <ApexBadge value="7" background="transparent" color="#B4531C" border-color="#B4531C" />
            </div>
          </div>

          <h2>Size</h2>
          <div class="card iconstrip">
            <ApexBadge v-for="s in ['sm', 'md', 'lg', 'xl']" :key="s" :value="8" :size="s" />
            <ApexBadge :value="8" :size="44" />
            <ApexBadge v-for="s in ['sm', 'md', 'lg']" :key="'d' + s" dot :size="s" severity="success" />
          </div>

          <h2>Overlay</h2>
          <p class="note">
            <code>ApexOverlayBadge</code> wraps any content and pins the badge to a corner.
            Because it is a wrapper rather than a prop, the host does not need to know about
            badges at all.
          </p>
          <div class="card iconstrip bdg-overlays">
            <ApexOverlayBadge value="4">
              <ApexIcon name="notifications" :size="26" />
            </ApexOverlayBadge>
            <ApexOverlayBadge value="12" severity="primary">
              <ApexButton icon="inbox" severity="secondary" variant="outlined">Inbox</ApexButton>
            </ApexOverlayBadge>
            <ApexOverlayBadge dot severity="success">
              <ApexAvatar label="A. Borg" auto-color size="lg" />
            </ApexOverlayBadge>
            <ApexOverlayBadge value="9" position="bottom-end" severity="warn">
              <ApexAvatar image="/heroes/totem-43.png" size="lg" shape="rounded" />
            </ApexOverlayBadge>
            <ApexOverlayBadge value="Beta" severity="contrast" position="top-start" size="sm">
              <ApexCard title="Playlists" subtitle="6 active" class="bdg-card">
                Rotation across the harbour.
              </ApexCard>
            </ApexOverlayBadge>
          </div>

          <h2>Button</h2>
          <p class="note">
            Buttons carry their own badge inline through <code>badge</code> and
            <code>badgeSeverity</code>, so no wrapper is needed for the common case.
          </p>
          <div class="card iconstrip">
            <ApexButton badge="8">Notifications</ApexButton>
            <ApexButton badge="3" badge-severity="danger" severity="secondary" variant="outlined">Alerts</ApexButton>
            <ApexButton badge="12" badge-severity="success" variant="text">Approvals</ApexButton>
            <ApexButton icon="mail" badge="5" aria-label="Messages" />
          </div>
        </template>

        <!-- Ported from the gallery. Ordering is the whole point of the
             control, so each example varies one thing about how the rows are
             moved: where the controls sit, how they line up, and what happens
             when the checkboxes or the dragging are taken away. -->
        <template v-if="entry.id === 'orderlist'">
          <h2>Selected</h2>
          <p class="note">The live playground above writes back to both models. Current order:</p>
          <pre class="doc-pre">{{ runningOrderText }}</pre>
          <p class="note">Selection: <code>{{ JSON.stringify(orderSelection) }}</code></p>

          <h2>Control placement</h2>
          <div class="grid grid--2">
            <div v-for="c in ['start', 'end', 'top', 'none']" :key="c" class="cell">
              <span class="cell__tag">controls="{{ c }}"</span>
              <ApexOrderList :model-value="RUNNING_ORDER" :controls="c" :scroll-height="200" />
            </div>
          </div>

          <h2>Control alignment</h2>
          <div class="grid grid--3">
            <div v-for="a in ['start', 'center', 'end']" :key="a" class="cell">
              <span class="cell__tag">controls-align="{{ a }}"</span>
              <ApexOrderList :model-value="RUNNING_ORDER" :controls-align="a" :scroll-height="200" />
            </div>
          </div>

          <h2>Without checkboxes</h2>
          <p class="note">
            Plain click selects one row; Cmd or Ctrl-click adds to the selection when
            <code>multiple</code> is on.
          </p>
          <div class="cell cell--solo">
            <span class="cell__tag">multiple</span>
            <ApexOrderList :model-value="RUNNING_ORDER" multiple :scroll-height="200" />
          </div>

          <h2>Buttons only</h2>
          <div class="cell cell--solo">
            <span class="cell__tag">no-drag</span>
            <ApexOrderList :model-value="RUNNING_ORDER" checkbox no-drag :scroll-height="200" />
          </div>
        </template>

        <!-- Ported from the gallery. A toolbar is three regions and their
             slack, which only reads as a layout once there is real content in
             more than one of them. -->
        <template v-if="entry.id === 'toolbar'">
          <h2>Basic</h2>
          <p class="note">
            Three slots — <code>start</code>, <code>center</code>, <code>end</code>.
            The start region takes the slack, so the end region is always pushed to
            the far edge.
          </p>
          <div style="margin-top:12px">
            <ApexToolbar>
              <template #start>
                <ApexButton severity="secondary" variant="text" icon="add" icon-only label="New" />
                <ApexButton severity="secondary" variant="text" icon="print" icon-only label="Print" />
                <ApexButton severity="secondary" variant="text" icon="upload" icon-only label="Upload" />
              </template>
              <template #center>
                <ApexInput v-model="tbarQuery" placeholder="Search" leading-icon="search"
                           label-placement="hidden" label="Search" size="sm" />
              </template>
              <template #end>
                <ApexButton severity="secondary" variant="outlined" size="sm">Cancel</ApexButton>
                <ApexButton size="sm" icon="check">Save</ApexButton>
              </template>
            </ApexToolbar>
          </div>

          <h2>Sizes and chrome</h2>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:14px">
            <ApexToolbar v-for="s in SIZES" :key="s" :size="s">
              <template #start><strong style="font-size:13.5px">size="{{ s }}"</strong></template>
              <template #end>
                <ApexButton severity="secondary" variant="text" icon="more_horiz" icon-only label="More" :size="s" />
                <ApexButton :size="s" icon="check">Save</ApexButton>
              </template>
            </ApexToolbar>
            <ApexToolbar raised radius="14px">
              <template #start><strong style="font-size:13.5px">raised, radius="14px"</strong></template>
              <template #end><ApexButton size="sm" severity="secondary" variant="outlined">Action</ApexButton></template>
            </ApexToolbar>
            <ApexToolbar :bordered="false" background="#EAF2FF" color="#073C9F">
              <template #start><strong style="font-size:13.5px">tinted, borderless</strong></template>
              <template #end><ApexButton size="sm">Continue</ApexButton></template>
            </ApexToolbar>
          </div>

          <h2>Centred content</h2>
          <p class="note">
            Start and end grow equally from a zero basis, so the middle sits on the
            bar's midpoint whatever the sides hold — one button against two below,
            still centred. When the regions together outgrow the bar it scrolls
            rather than letting them overlap.
          </p>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:14px">
            <ApexToolbar>
              <template #start><ApexButton severity="secondary" variant="text" icon="arrow_back" icon-only label="Back" /></template>
              <template #center><strong style="font-size:14px">Centred title</strong></template>
              <template #end>
                <ApexButton severity="secondary" variant="text" icon="share" icon-only label="Share" />
                <ApexButton severity="secondary" variant="text" icon="more_vert" icon-only label="More" />
              </template>
            </ApexToolbar>
            <ApexToolbar>
              <template #start>
                <ApexButton severity="secondary" variant="text" icon="arrow_back" icon-only label="Back" />
                <ApexButton severity="secondary" variant="outlined" size="sm">Filters</ApexButton>
              </template>
              <template #center><strong style="font-size:14px">Still centred</strong></template>
              <template #end><ApexButton severity="secondary" variant="text" icon="more_vert" icon-only label="More" /></template>
            </ApexToolbar>
          </div>

          <h2>Custom — navigation bar</h2>
          <p class="note">
            The same three regions, restyled: a dark pill holding a brand mark, nav
            links, a search control and an avatar.
          </p>
          <div style="margin-top:12px">
            <ApexToolbar background="#0F141C" color="#fff" :bordered="false" radius="999px"
                         padding="10px 14px 10px 20px" class="tbar-nav">
              <template #start>
                <span class="tbar-brand">
                  <ApexIcon name="bolt" :size="20" fill />
                  <strong>Brand</strong>
                </span>
                <span class="tbar-links">
                  <ApexButton v-for="l in TBAR_LINKS" :key="l"
                              severity="secondary" variant="text" size="sm" class="tbar-link">{{ l }}</ApexButton>
                </span>
              </template>
              <template #end>
                <ApexButton severity="secondary" variant="text" size="sm" icon="search" icon-only
                            label="Search" class="tbar-link" />
                <ApexButton size="sm" radius="999px">Get Started</ApexButton>
                <ApexAvatar label="A. Borg" size="sm" auto-color />
              </template>
            </ApexToolbar>
          </div>

          <h2>Sticky and wrapping</h2>
          <p class="note">
            <code>sticky</code> keeps the bar at the top of a scrolling region;
            <code>wrap</code> lets the regions fold onto more lines instead of squeezing.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell" style="padding:0;overflow:hidden">
              <ApexScrollArea height="200px" padding="0">
                <ApexToolbar sticky :bordered="false" raised radius="0">
                  <template #start><strong style="font-size:13px">Sticky header</strong></template>
                  <template #end><ApexButton size="sm" icon="add">Add</ApexButton></template>
                </ApexToolbar>
                <div style="padding:14px;font-size:13.5px;color:var(--fg-muted)">
                  <p v-for="n in 8" :key="n" style="margin:0 0 12px">Row {{ n }} — scroll and the bar stays put.</p>
                </div>
              </ApexScrollArea>
            </div>
            <div class="cell">
              <span class="cell__tag">wrap</span>
              <ApexToolbar wrap>
                <template #start>
                  <ApexButton v-for="l in TBAR_MARKS" :key="l" severity="secondary"
                              variant="outlined" size="sm">{{ l }}</ApexButton>
                </template>
                <template #end>
                  <ApexButton size="sm" severity="secondary" variant="outlined">Reset</ApexButton>
                  <ApexButton size="sm">Apply</ApexButton>
                </template>
              </ApexToolbar>
            </div>
          </div>
        </template>

        <template v-if="entry.id === 'tabs'">
          <h2>Basic and dynamic</h2>
          <p class="note">
            One <code>tabs</code> array and one <code>panel-<em>n</em></code> slot
            each. Because the tabs are data, labels and panels stay in sync — the
            second example builds both from a list.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexTabs :tabs="TAB_ITEMS" bordered>
              <template #panel-1><p class="note">Update your personal information.</p></template>
              <template #panel-2><p class="note">Manage your subscription plan.</p></template>
              <template #panel-3><p class="note">Customise how the app behaves.</p></template>
            </ApexTabs>
            <ApexTabs :tabs="TAB_MANY.slice(0, 3)" bordered>
              <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n">
                <p class="note"><strong>{{ tab.label }}</strong> — panel {{ n }} of a list-driven set.</p>
              </template>
            </ApexTabs>
          </div>

          <h2>Controlled</h2>
          <p class="note">
            <code>v-model</code> puts the active tab in your hands, so anything can move it.
          </p>
          <div style="margin-top:12px">
            <div class="iconstrip" style="margin-block-end:14px">
              <ApexButton size="sm" @click="tabCtl = 2">Go to Payment</ApexButton>
              <code style="font-size:12px">value: {{ tabCtl }}</code>
            </div>
            <ApexTabs v-model="tabCtl" :tabs="TAB_ITEMS" bordered>
              <template #panel-1><p class="note">Account panel.</p></template>
              <template #panel-2><p class="note">Payment panel — reached from outside the component.</p></template>
              <template #panel-3><p class="note">Preferences panel.</p></template>
            </ApexTabs>
          </div>

          <h2>Scrollable</h2>
          <p class="note">
            A long strip scrolls, and the previous and next controls appear only
            while there is somewhere to go — the component measures its own overflow.
          </p>
          <div style="max-width:520px;margin-top:12px">
            <ApexTabs :tabs="TAB_MANY" bordered>
              <template v-for="n in 10" #[`panel-${n}`]="{ tab }" :key="n">
                <p class="note">{{ tab.label }}</p>
              </template>
            </ApexTabs>
          </div>

          <h2>Select on focus</h2>
          <p class="note">
            By default arrow keys move focus and Enter or Space activates. With
            <code>selectOnFocus</code> the tab activates as focus lands on it.
            Disabled tabs are skipped either way.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell">
              <span class="cell__tag">default — focus, then Enter</span>
              <ApexTabs :tabs="TAB_ITEMS">
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
            <div class="cell">
              <span class="cell__tag">select-on-focus</span>
              <ApexTabs :tabs="TAB_ITEMS" select-on-focus>
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
          </div>

          <h2>Lazy</h2>
          <p class="note">
            By default every panel renders and inactive ones are hidden.
            <code>lazy</code> defers a panel until its tab is first shown, which
            matters when a panel holds something expensive.
            <code>unmountInactive</code> goes further and discards it on the way
            out, so it re-initialises each visit.
          </p>
          <div style="margin-top:12px">
            <ApexTabs :tabs="TAB_ITEMS" lazy bordered @tab-change="onLazyVisit">
              <template #panel-1><p class="note">Rendered immediately — it is the active tab.</p></template>
              <template #panel-2><p class="note">Built the first time you opened this tab.</p></template>
              <template #panel-3><p class="note">Same here.</p></template>
            </ApexTabs>
          </div>
          <p class="note" style="margin-top:8px">
            Panels built so far: <code>{{ tabLazySeen.length }}</code> of 3 — open a
            tab you have not visited to see it rise.
          </p>

          <h2>Disabled</h2>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexTabs :tabs="TAB_ONE_DISABLED" bordered>
              <template #panel-1><p class="note">Arrow keys skip the blocked tab entirely.</p></template>
              <template #panel-3><p class="note">Third panel.</p></template>
            </ApexTabs>
            <ApexTabs :tabs="TAB_ITEMS" disabled bordered>
              <template #panel-1><p class="note">The whole strip is inert.</p></template>
            </ApexTabs>
          </div>

          <h2>Variants and placement</h2>
          <p class="note">
            The indicator is one element positioned from the active tab's measured
            box, so it slides between tabs on every edge and in every variant.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div v-for="v in TAB_VARIANTS" :key="v" class="cell">
              <span class="cell__tag">variant="{{ v }}"</span>
              <ApexTabs :tabs="TAB_ITEMS" :variant="v">
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
            <div class="cell">
              <span class="cell__tag">fill align="center"</span>
              <ApexTabs :tabs="TAB_ITEMS" variant="pill" fill>
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
          </div>
          <div class="grid grid--2" style="margin-top:18px">
            <div v-for="p in TAB_PLACEMENTS" :key="p" class="cell">
              <span class="cell__tag">placement="{{ p }}"</span>
              <ApexTabs :tabs="TAB_ITEMS" :placement="p" strip-width="140px">
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
          </div>

          <h2>Badges and custom indicator</h2>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell">
              <span class="cell__tag">badge + badgeSeverity</span>
              <ApexTabs :tabs="TAB_BADGED">
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
            <div class="cell">
              <span class="cell__tag">indicator-color + active-color, thick radius</span>
              <ApexTabs :tabs="TAB_ITEMS" indicator-color="#C24A06" active-color="#C24A06"
                        strip-background="#FFF1E5" radius="12px">
                <template v-for="n in 3" #[`panel-${n}`]="{ tab }" :key="n"><p class="note">{{ tab.label }}</p></template>
              </ApexTabs>
            </div>
          </div>

          <h2>Template</h2>
          <p class="note">
            A <code>tab-<em>n</em></code> slot replaces a tab's contents, and panels
            take any markup — here real controls from the kit.
          </p>
          <div class="cell" style="max-width:460px;margin-top:12px">
            <ApexTabs :tabs="TAB_ITEMS" align="center">
              <template #tab-2="{ tab, active }">
                <ApexIcon :name="tab.icon" :size="17" />
                <span>{{ tab.label }}</span>
                <span class="apex-tabs__badge" :data-tone="active ? 'primary' : 'neutral'">New</span>
              </template>
              <template #panel-1>
                <div style="display:flex;flex-direction:column;gap:14px">
                  <ApexInput v-model="tabForm.username" label="Username" leading-icon="person" />
                  <ApexInput v-model="tabForm.email" label="Email" type="email" leading-icon="mail" />
                  <ApexButton icon="check" style="align-self:flex-start">Save changes</ApexButton>
                </div>
              </template>
              <template #panel-2><p class="note">Payment details.</p></template>
              <template #panel-3><p class="note">Preferences.</p></template>
            </ApexTabs>
          </div>

          <h2>Tab menu</h2>
          <p class="note">
            <code>tabsOnly</code> drops the panels, leaving a nav strip to pair with
            a <code>router-view</code>.
          </p>
          <div style="margin-top:12px">
            <ApexTabs v-model="tabActive" :tabs="TAB_ITEMS" tabs-only @tab-change="onTabChange" />
            <div class="cell" style="margin-top:14px">
              <p class="note" style="margin:0">
                Your route component renders here. Last event: <code>{{ tabLog || 'none yet' }}</code>
              </p>
            </div>
          </div>
        </template>

        <template v-if="entry.id === 'steps'">
          <h2>Horizontal</h2>
          <p class="note">
            Give it a <code>steps</code> array and one <code>panel-<em>n</em></code>
            slot per step. Each panel slot receives
            <code>{ step, index, back, next }</code>, so your own buttons can drive
            the flow.
          </p>
          <div class="cell" style="margin-top:12px">
            <ApexSteps :steps="STEP_ITEMS">
              <template #panel-1="{ next }">
                <div class="st-pane">
                  <ApexInput v-model="stForm.email" label="Email address" type="email" leading-icon="mail" />
                  <ApexButton icon="arrow_forward" icon-pos="right" @click="next">Continue</ApexButton>
                </div>
              </template>
              <template #panel-2="{ back, next }">
                <div class="st-pane">
                  <ApexRadioGroup v-model="stForm.plan" label="Plan" card :options="STEP_PLANS" />
                  <div class="iconstrip">
                    <ApexButton severity="secondary" variant="text" icon="arrow_back" @click="back">Back</ApexButton>
                    <ApexButton icon="arrow_forward" icon-pos="right" @click="next">Continue</ApexButton>
                  </div>
                </div>
              </template>
              <template #panel-3="{ back }">
                <div class="st-pane">
                  <p class="note">
                    <strong>{{ stForm.email || 'No email yet' }}</strong> on the
                    <strong>{{ stForm.plan }}</strong> plan.
                  </p>
                  <div class="iconstrip">
                    <ApexButton severity="secondary" variant="text" icon="arrow_back" @click="back">Back</ApexButton>
                    <ApexButton severity="success" icon="check">Submit</ApexButton>
                  </div>
                </div>
              </template>
            </ApexSteps>
          </div>

          <h2>Vertical</h2>
          <p class="note">
            Each panel sits under its own header, so the two interleave and the rail
            runs down the marker column.
          </p>
          <div class="cell" style="max-width:520px;margin-top:12px">
            <ApexSteps :steps="STEP_ITEMS" orientation="vertical" show-nav>
              <template #panel-1><p class="note">Tell us who you are. Nothing here is shared.</p></template>
              <template #panel-2><p class="note">Choose how you would like to pay.</p></template>
              <template #panel-3><p class="note">Check everything over, then submit.</p></template>
            </ApexSteps>
          </div>

          <h2>Linear</h2>
          <p class="note">
            With <code>linear</code>, only the current step, those behind it, and the
            next unblocked one are reachable. A step marks itself
            <code>incomplete</code> to hold the flow — the gate is data, not a handler
            that vetoes navigation after the fact. Enter an email to unlock step&nbsp;2.
          </p>
          <div class="cell" style="margin-top:12px">
            <ApexSteps v-model="stLinear" :steps="linearSteps" linear show-nav>
              <template #panel-1>
                <ApexInput v-model="stForm.email" label="Email address" type="email" leading-icon="mail"
                           help="Required before you can continue." style="max-width:320px" />
              </template>
              <template #panel-2><p class="note">Payment details go here.</p></template>
              <template #panel-3><p class="note">All done — submit when ready.</p></template>
            </ApexSteps>
          </div>

          <h2>Steps only</h2>
          <p class="note">
            <code>stepsOnly</code> drops the panels, leaving a progress indicator you
            can place anywhere.
          </p>
          <div class="cell" style="margin-top:12px;display:flex;flex-direction:column;gap:22px">
            <ApexSteps :model-value="2" :steps="STEP_ITEMS" steps-only />
            <ApexSteps :model-value="3" :steps="STEP_ITEMS" steps-only size="sm" complete-color="#0B5FFF" />
            <ApexSteps :model-value="2" :steps="STEP_PIPELINE" steps-only hide-connector />
          </div>

          <h2>Template</h2>
          <p class="note">
            A <code>step-<em>n</em></code> slot replaces a header outright, receiving
            <code>{ step, index, active, complete }</code>. The <code>as</code> prop
            chooses what the header renders as — a <code>button</code> is focusable and
            clickable, a <code>div</code> is inert.
          </p>
          <div class="cell" style="margin-top:12px">
            <ApexSteps :model-value="2" :steps="STEP_ITEMS">
              <template v-for="n in 3" #[`step-${n}`]="{ step, active, complete }" :key="n">
                <span class="st-chip" :data-on="active" :data-done="complete">
                  <ApexIcon :name="complete ? 'check_circle' : step.icon" :size="18" />
                  {{ step.label }}
                </span>
              </template>
              <template #panel-2><p class="note">Custom headers, standard panels.</p></template>
            </ApexSteps>
          </div>

          <h2>Events</h2>
          <div class="cell" style="margin-top:12px">
            <ApexSteps v-model="stStep" :steps="STEP_ITEMS" show-nav
                       @step-change="onStChange" @finish="onStFinish">
              <template #panel-1><p class="note">Move between steps and watch the log.</p></template>
              <template #panel-2><p class="note">Still watching.</p></template>
              <template #panel-3><p class="note">Next here fires <code>finish</code> instead of advancing.</p></template>
            </ApexSteps>
          </div>
          <p class="note" style="margin-top:8px">
            Last event: <code>{{ stLog || 'none yet' }}</code> · bound value <code>{{ stStep }}</code>
          </p>

          <h2>Sizes and colours</h2>
          <div class="cell" style="margin-top:12px;display:flex;flex-direction:column;gap:22px">
            <ApexSteps v-for="s in SIZES" :key="s" :model-value="2" :steps="STEP_ITEMS" steps-only :size="s" />
            <ApexSteps :model-value="2" :steps="STEP_ITEMS" steps-only active-color="#C24A06"
                       complete-color="#7C3AED" connector-color="#FFDEC2" :marker-size="40" />
          </div>
        </template>

        <template v-if="entry.id === 'splitter'">
          <h2>Basic and vertical</h2>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexSplitter :panels="SPLIT_PAIR" height="200px">
              <template #panel-1><span class="sp-cell">1</span></template>
              <template #panel-2><span class="sp-cell">2</span></template>
            </ApexSplitter>
            <ApexSplitter :panels="SPLIT_PAIR" layout="vertical" height="200px">
              <template #panel-1><span class="sp-cell">1</span></template>
              <template #panel-2><span class="sp-cell">2</span></template>
            </ApexSplitter>
          </div>

          <h2>Sizes, minimum and maximum</h2>
          <p class="note">
            Initial sizes come from each panel's <code>size</code>; anything unset
            splits the remainder evenly. <code>minSize</code> and <code>maxSize</code>
            bound a panel during a drag.
          </p>
          <div style="margin-top:12px">
            <ApexSplitter :panels="SPLIT_THIRDS" height="180px">
              <template #panel-1="{ size }"><span class="sp-cell">25<em>min 15 · max 40 · now {{ Math.round(size) }}%</em></span></template>
              <template #panel-2="{ size }"><span class="sp-cell">50<em>{{ Math.round(size) }}%</em></span></template>
              <template #panel-3="{ size }"><span class="sp-cell">25<em>min 10 · {{ Math.round(size) }}%</em></span></template>
            </ApexSplitter>
          </div>

          <h2>Collapsible</h2>
          <p class="note">
            A <code>collapsible</code> panel snaps to <code>collapsedSize</code> once
            dragged past halfway between that and its minimum. From the keyboard it
            collapses as soon as it reaches the minimum.
          </p>
          <div style="margin-top:12px">
            <ApexSplitter :panels="SPLIT_COLLAPSIBLE" height="180px">
              <template #panel-1="{ size }">
                <span class="sp-cell">{{ size <= 5 ? '▸' : 'Sidebar' }}<em v-if="size > 5">drag me left</em></span>
              </template>
              <template #panel-2><span class="sp-cell">Content</span></template>
            </ApexSplitter>
          </div>

          <h2>Nested</h2>
          <div style="margin-top:12px">
            <ApexSplitter :panels="SPLIT_NESTED" height="240px">
              <template #panel-1><span class="sp-cell">1</span></template>
              <template #panel-2>
                <ApexSplitter :panels="SPLIT_PAIR" layout="vertical" :bordered="false" height="100%">
                  <template #panel-1><span class="sp-cell">2</span></template>
                  <template #panel-2>
                    <ApexSplitter :panels="SPLIT_PAIR" :bordered="false" height="100%">
                      <template #panel-1><span class="sp-cell">3</span></template>
                      <template #panel-2><span class="sp-cell">4</span></template>
                    </ApexSplitter>
                  </template>
                </ApexSplitter>
              </template>
            </ApexSplitter>
          </div>

          <h2>Resize events</h2>
          <div style="margin-top:12px">
            <ApexSplitter v-model:sizes="spSizes" :panels="SPLIT_EVENTS" height="170px"
                          @resizestart="onSpResize($event, 'resizestart')"
                          @resize="onSpResize($event, 'resize')"
                          @resizeend="onSpResize($event, 'resizeend')"
                          @collapse="onSpCollapse">
              <template #panel-1="{ size }"><span class="sp-cell">A<em>{{ Math.round(size) }}%</em></span></template>
              <template #panel-2="{ size }"><span class="sp-cell">B<em>{{ Math.round(size) }}%</em></span></template>
            </ApexSplitter>
          </div>
          <p class="note" style="margin-top:8px">
            Last event: <code>{{ spLog || 'none yet' }}</code> · bound sizes
            <code>[{{ spSizes.map((n) => Math.round(n)).join(', ') }}]</code>
          </p>

          <h2>Stateful</h2>
          <p class="note">
            Give it a <code>stateKey</code> and the layout survives a reload with no
            bookkeeping. Drag this one, then refresh the page.
          </p>
          <div style="margin-top:12px">
            <ApexSplitter :panels="SPLIT_STATEFUL" state-key="apex-demo-splitter" height="150px">
              <template #panel-1="{ size }"><span class="sp-cell">Persisted<em>{{ Math.round(size) }}%</em></span></template>
              <template #panel-2><span class="sp-cell">Reload to check</span></template>
            </ApexSplitter>
          </div>

          <h2>Disabled and custom</h2>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexSplitter :panels="SPLIT_PAIR" height="160px" disabled>
              <template #panel-1><span class="sp-cell">Locked</span></template>
              <template #panel-2><span class="sp-cell">Locked</span></template>
            </ApexSplitter>
            <ApexSplitter :panels="SPLIT_PAIR" height="160px" :gutter-size="14" radius="16px"
                          gutter-color="#EAF2FF" gutter-hover-color="#A6C5FF" border-color="#0B5FFF">
              <template #gutter><span class="sp-bar"></span></template>
              <template #panel-1><span class="sp-cell" style="color:#0B5FFF">Custom gutter</span></template>
              <template #panel-2><span class="sp-cell">Drag the bar</span></template>
            </ApexSplitter>
          </div>

          <h2>Advanced</h2>
          <p class="note">
            A collapsible navigation pane, a custom gutter handle and a viewport that
            adapts to the current sizes — the list switches to a compact form once its
            width drops below 28%.
          </p>
          <div style="margin-top:12px">
            <ApexSplitter v-model:sizes="spNavSizes" :panels="SPLIT_NAV" height="320px" :gutter-size="8">
              <template #gutter><span class="sp-handle"><ApexIcon name="drag_indicator" :size="14" /></span></template>
              <template #panel-1="{ size }">
                <ApexScrollArea height="100%" variant="hover" padding="6px">
                  <button v-for="(m, i) in SPLIT_MAILS" :key="i" type="button" class="sp-mail"
                          :data-compact="size < 28" :data-on="mailOpen === i" @click="mailOpen = i">
                    <ApexAvatar :label="m.from" auto-color :size="size < 28 ? 'sm' : 'md'" />
                    <span v-if="size >= 28" class="sp-mail__text">
                      <strong>{{ m.from }}<em>{{ m.time }}</em></strong>
                      <span>{{ m.subject }}</span>
                    </span>
                  </button>
                </ApexScrollArea>
              </template>
              <template #panel-2>
                <div class="sp-read">
                  <h4>{{ SPLIT_MAILS[mailOpen].subject }}</h4>
                  <p class="sp-read__meta">{{ SPLIT_MAILS[mailOpen].from }} · {{ SPLIT_MAILS[mailOpen].time }}</p>
                  <p>{{ SPLIT_MAILS[mailOpen].body }}</p>
                </div>
              </template>
            </ApexSplitter>
          </div>
        </template>

        <template v-if="entry.id === 'panel'">
          <h2>Basic</h2>
          <p class="note">A header bar, a body, and optionally a footer.</p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexPanel header="Rotation summary" icon="playlist_play">
              Three playlists across twelve displays. The morning loop starts at 06:00.
            </ApexPanel>
            <ApexPanel header="Storage" subheader="Media library" icon="folder" shadow="sm">
              <ApexProgressBar :value="68" show-value severity="auto" label="Storage used" />
              <p class="note" style="margin-top:12px">6.8 GB of 10 GB used.</p>
            </ApexPanel>
          </div>

          <h2>Toggleable</h2>
          <p class="note">
            <code>toggleable</code> adds a toggle to the header bar;
            <code>togglePosition</code> puts it before the title or at the end.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexPanel header="At the end" icon="tv" toggleable>
              The default — the toggle sits opposite the title.
            </ApexPanel>
            <ApexPanel header="At the start" toggleable toggle-position="start">
              Reads more like a disclosure row.
            </ApexPanel>
          </div>

          <h2>Controlled</h2>
          <div style="max-width:400px;margin-top:12px">
            <div class="iconstrip" style="margin-block-end:14px">
              <ApexButton size="sm" severity="secondary" variant="outlined"
                          :icon="pnShut ? 'unfold_more' : 'unfold_less'"
                          @click="pnShut = !pnShut">{{ pnShut ? 'Expand' : 'Collapse' }}</ApexButton>
              <code style="font-size:12px">collapsed: {{ pnShut }}</code>
            </div>
            <ApexPanel v-model:collapsed="pnShut" header="Scheduling" icon="calendar_month" toggleable>
              <div style="display:flex;flex-direction:column;gap:12px">
                <ApexDatePicker :model-value="null" label="Start date" show-icon />
                <ApexSegmented model-value="daily" label="Repeat" :options="PANEL_REPEAT" />
              </div>
            </ApexPanel>
          </div>

          <h2>Indicator</h2>
          <p class="note">
            The <code>toggleicon</code> slot receives <code>collapsed</code>, or render
            one glyph and let CSS rotate it from the button's
            <code>aria-expanded</code>.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexPanel header="Two glyphs" toggleable>
              <template #toggleicon="{ collapsed }">
                <ApexIcon :name="collapsed ? 'add_circle' : 'remove_circle'" :size="19" fill
                          :style="{ color: collapsed ? undefined : 'var(--accent-primary)' }" />
              </template>
              Swapped from the context value.
            </ApexPanel>
            <ApexPanel header="One glyph, rotated by CSS" toggleable>
              <template #toggleicon>
                <ApexIcon name="expand_more" :size="20" data-pn-rotate />
              </template>
              The chevron turns from <code>aria-expanded</code>.
            </ApexPanel>
          </div>

          <h2>Header and footer templates</h2>
          <p class="note">
            The <code>header</code> slot replaces the title block, <code>icons</code>
            adds actions at the end of the bar, and <code>footer</code> sits below the body.
          </p>
          <div style="max-width:440px;margin-top:12px">
            <ApexPanel toggleable shadow="sm">
              <template #header>
                <ApexAvatar label="A. Borg" auto-color size="sm" />
                <span class="apex-pn__titles">
                  <h3 class="apex-pn__title">A. Borg</h3>
                  <p class="apex-pn__sub">Founder &amp; CEO · last seen 12 minutes ago</p>
                </span>
              </template>
              <template #icons>
                <ApexButton size="sm" severity="secondary" variant="text" icon="mail" icon-only label="Message" />
                <ApexButton size="sm" severity="secondary" variant="text" icon="more_vert" icon-only label="More" />
              </template>
              Owns fourteen displays across three sites, and the morning rotation playlist.
              <template #footer>
                <ApexButton size="sm" icon="person">View profile</ApexButton>
                <ApexButton size="sm" severity="secondary" variant="outlined">Permissions</ApexButton>
              </template>
            </ApexPanel>
          </div>

          <h2>Sizes, colours and flush</h2>
          <div class="grid grid--3" style="margin-top:12px">
            <ApexPanel v-for="s in SIZES" :key="s" :header="'Size ' + s" :size="s" toggleable>
              Padding and title scale together.
            </ApexPanel>
          </div>
          <div class="grid grid--2" style="margin-top:18px">
            <ApexPanel header="Tinted header" icon="palette" header-background="#0F141C" header-color="#ECEFF4"
                       border-color="#2A3447" radius="14px" toggleable>
              A dark bar over a light body — set both header colours together.
            </ApexPanel>
            <ApexPanel header="Flush, no divider" flush :bordered="false" background="var(--bg-subtle)">
              For sectioning a page without drawing more boxes.
            </ApexPanel>
          </div>
        </template>

        <template v-if="entry.id === 'fieldset'">
          <h2>Basic</h2>
          <p class="note">
            A <code>legend</code> plus content. Because it is a real
            <code>&lt;fieldset&gt;</code>, screen readers announce the group name with
            each control inside it.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexFieldset legend="Shipping address">
              <div class="fs-grid">
                <span><em>Name</em>Jane Cooper</span>
                <span><em>Phone</em>(415) 555-0132</span>
                <span style="grid-column:1/-1"><em>Address</em>1234 Elm Street, Apt 5B<br />San Francisco, CA 94102</span>
              </div>
            </ApexFieldset>
            <ApexFieldset legend="Display settings" icon="tv">
              <div style="display:flex;flex-direction:column;gap:12px">
                <ApexInput model-value="Lobby totem" label="Name" />
                <ApexSwitch :model-value="true" label="Proof of play" />
              </div>
            </ApexFieldset>
          </div>

          <h2>Toggleable</h2>
          <p class="note">
            <code>toggleable</code> turns the legend into a button that collapses the content.
          </p>
          <div style="max-width:340px;margin-top:12px">
            <ApexFieldset legend="Invoice #1024" toggleable>
              <div class="fs-rows">
                <span>Design service<em>€120.00</em></span>
                <span>Hosting<em>€30.00</em></span>
                <span data-total>Total<em>€150.00</em></span>
              </div>
            </ApexFieldset>
          </div>

          <h2>Controlled</h2>
          <p class="note">
            <code>collapsed</code> is bindable, so the state is yours to read, persist or set.
          </p>
          <div style="max-width:340px;margin-top:12px">
            <div class="iconstrip" style="margin-block-end:14px">
              <ApexButton size="sm" severity="secondary" variant="outlined"
                          :icon="fsShut ? 'unfold_more' : 'unfold_less'"
                          @click="fsShut = !fsShut">{{ fsShut ? 'Expand' : 'Collapse' }}</ApexButton>
              <code style="font-size:12px">collapsed: {{ fsShut }}</code>
            </div>
            <ApexFieldset v-model:collapsed="fsShut" legend="Advanced options" toggleable>
              <div style="display:flex;flex-direction:column;gap:12px">
                <ApexNumber :model-value="24" label="Rotation interval" unit="sec" />
                <ApexSelect model-value="split" label="Zone layout" :options="ZONE_OPTIONS" />
              </div>
            </ApexFieldset>
          </div>

          <h2>Indicator</h2>
          <p class="note">
            The <code>toggleicon</code> slot receives <code>collapsed</code>, so it can
            swap glyphs — or render one glyph and let CSS rotate it from the button's
            <code>aria-expanded</code> state.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexFieldset legend="Two glyphs" toggleable>
              <template #toggleicon="{ collapsed }">
                <ApexIcon :name="collapsed ? 'visibility' : 'visibility_off'" :size="17" />
              </template>
              Swapped from the <code>collapsed</code> context value.
            </ApexFieldset>
            <ApexFieldset legend="One glyph, rotated by CSS" toggleable>
              <template #toggleicon>
                <ApexIcon name="chevron_right" :size="18" data-fs-rotate />
              </template>
              The chevron turns from the button's <code>aria-expanded</code> attribute.
            </ApexFieldset>
          </div>

          <h2>Alignment, sizes and colours</h2>
          <div class="grid grid--3" style="margin-top:12px">
            <ApexFieldset v-for="a in LEGEND_ALIGNS" :key="a" :legend="'Legend ' + a" :legend-align="a">
              Aligned to the {{ a }} of the border.
            </ApexFieldset>
          </div>
          <div class="grid grid--3" style="margin-top:18px">
            <ApexFieldset v-for="s in SIZES" :key="s" :legend="'Size ' + s" :size="s">
              Padding and type scale together.
            </ApexFieldset>
          </div>
          <div class="grid grid--2" style="margin-top:18px">
            <ApexFieldset legend="Tinted panel" icon="palette" background="#EAF2FF"
                          border-color="#A6C5FF" legend-background="#EAF2FF" legend-color="#073C9F" radius="14px">
              Set <code>legendBackground</code> to match the panel, so the legend sits on
              it cleanly.
            </ApexFieldset>
            <ApexFieldset legend="Borderless group" :bordered="false" toggleable>
              Useful for sectioning a long form without drawing more boxes.
            </ApexFieldset>
          </div>

          <h2>Disabled</h2>
          <p class="note">
            A disabled fieldset disables every control inside it — that is native
            behaviour, not something the component reimplements.
          </p>
          <div style="max-width:340px;margin-top:12px">
            <ApexFieldset legend="Billing (locked)" icon="lock" disabled>
              <div style="display:flex;flex-direction:column;gap:12px">
                <ApexInput model-value="ACME Ltd" label="Company" />
                <ApexButton size="sm">Save</ApexButton>
              </div>
            </ApexFieldset>
          </div>
        </template>

        <template v-if="entry.id === 'card'">
          <h2>Basic</h2>
          <p class="note">A title, a subtitle, body content and a footer — all optional.</p>
          <div class="grid grid--2" style="margin-top:12px">
            <ApexCard title="Morning rotation" subtitle="6 displays · Northern Harbour">
              Plays the ambient loop and menu boards between 06:00 and 11:00.
              <template #footer>
                <ApexButton size="sm" icon="play_arrow">Preview</ApexButton>
                <ApexButton size="sm" severity="secondary" variant="outlined">Schedule</ApexButton>
              </template>
            </ApexCard>
            <ApexCard title="No footer, no border" :bordered="false" shadow="none" background="var(--bg-subtle)">
              A quiet card for grouping content without competing with the page.
            </ApexCard>
          </div>

          <h2>With media</h2>
          <div class="grid grid--3" style="margin-top:12px">
            <ApexCard v-for="p in CARD_MEDIA" :key="p"
                      :image="`/heroes/${p}.png`" image-height="120px"
                      :title="p.replace('-', ' ')" subtitle="In service" hoverable>
              Placeholder art, not a photograph.
            </ApexCard>
          </div>

          <h2>Advanced header — media plus an overlaid avatar</h2>
          <p class="note">
            The <code>media</code> slot takes over the top region, so an avatar can
            straddle the edge.
          </p>
          <div style="max-width:340px;margin-top:12px">
            <ApexCard>
              <template #media>
                <div class="cd-hero">
                  <!-- Bound rather than literal: a literal src is compiled into an import,
                       which resolves against the build root instead of public/. -->
                  <img :src="'/heroes/menu-board.png'" alt="" />
                  <ApexAvatar label="Sakura Market" initials="SM" size="xl" ring auto-color class="cd-hero__av" />
                </div>
              </template>
              <template #header>
                <h3 class="apex-cd__title" style="margin-block-start:26px">Sakura Fresh Market</h3>
                <div class="iconstrip" style="gap:6px;margin-block-start:8px">
                  <span class="apex-dt__badge" data-tone="info">Daily</span>
                  <span class="apex-dt__badge" data-tone="success">Premium</span>
                </div>
              </template>
              Fresh local produce, snacks and daily essentials — all in one place.
              <ApexRating :model-value="4.5" :stars="5" allow-half readonly :star-size="17" show-value
                          style="margin-top:12px" />
              <template #footer>
                <ApexButton size="sm" severity="secondary" variant="outlined" icon="call">Call us</ApexButton>
                <ApexButton size="sm" icon="language">Visit site</ApexButton>
              </template>
            </ApexCard>
          </div>

          <h2>As a form container</h2>
          <div style="max-width:380px;margin-top:12px">
            <ApexCard title="Pair a display" subtitle="Enter the code shown on screen">
              <div style="display:flex;flex-direction:column;gap:14px">
                <ApexInput model-value="" label="Display name" placeholder="Lobby totem" leading-icon="tv" />
                <ApexOtp model-value="482" label="Pairing code" :length="6" integer-only />
                <ApexSwitch :model-value="true" label="Start on the morning rotation" />
              </div>
              <template #footer>
                <ApexButton size="sm" icon="link">Pair</ApexButton>
                <ApexButton size="sm" severity="secondary" variant="text">Cancel</ApexButton>
              </template>
            </ApexCard>
          </div>

          <h2>Horizontal and clickable</h2>
          <div style="display:flex;flex-direction:column;gap:14px;margin-top:12px;max-width:520px">
            <ApexCard horizontal image="/heroes/kiosk-27-square.png" title="Kiosk 27&quot;"
                      subtitle="Msida · awaiting install" hoverable>
              Delivered on 18 August. Needs a wall bracket before it can be paired.
            </ApexCard>
            <ApexCard clickable hoverable title="Open the playlist editor"
                      subtitle="A whole card as one target" shadow="md" />
          </div>
        </template>

        <template v-if="entry.id === 'accordion'">
          <h2>Basic and multiple</h2>
          <p class="note">
            One panel at a time by default; <code>multiple</code> lets several stay open
            and switches the model to an array.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell">
              <span class="cell__tag">single</span>
              <ApexAccordion v-model:value="acOpen" :items="FAQ_PANELS" />
              <p class="note" style="margin-top:10px">Open: <code>{{ acOpen || 'none' }}</code></p>
            </div>
            <div class="cell">
              <span class="cell__tag">multiple</span>
              <ApexAccordion v-model:value="acMulti" :items="FAQ_PANELS" multiple />
              <p class="note" style="margin-top:10px">Open: <code>{{ acMulti.join(', ') || 'none' }}</code></p>
            </div>
          </div>

          <h2>Controlled</h2>
          <p class="note">The value is bindable, so any UI can drive it.</p>
          <div class="cell" style="margin-top:12px">
            <div class="iconstrip" style="margin-block-end:16px">
              <ApexButton v-for="p in FAQ_PANELS.slice(0, 3)" :key="p.value" size="sm"
                          :severity="acCtl === p.value ? 'primary' : 'secondary'"
                          :variant="acCtl === p.value ? 'solid' : 'outlined'"
                          @click="acCtl = p.value">{{ p.header.slice(0, 18) }}</ApexButton>
              <ApexButton size="sm" severity="danger" variant="text" icon="close" @click="acCtl = ''">Close all</ApexButton>
            </div>
            <ApexAccordion v-model:value="acCtl" :items="FAQ_PANELS" />
          </div>

          <h2>Indicator and trigger</h2>
          <p class="note">
            The <code>toggleicon</code> slot receives <code>active</code>, so it can swap
            glyphs — or render one glyph and let CSS animate it from the header's
            <code>data-p</code> attribute.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell">
              <span class="cell__tag">two glyphs from `active`</span>
              <ApexAccordion :items="FAQ_PANELS.slice(0, 3)" toggle-position="start">
                <template #toggleicon="{ active }">
                  <ApexIcon :name="active ? 'remove_circle' : 'add_circle'" :size="20"
                            :style="{ color: active ? 'var(--accent-primary)' : undefined }" fill />
                </template>
              </ApexAccordion>
            </div>
            <div class="cell">
              <span class="cell__tag">one glyph, rotated by CSS</span>
              <ApexAccordion :items="FAQ_PANELS.slice(0, 3)">
                <template #toggleicon>
                  <ApexIcon name="chevron_right" :size="20" data-ac-rotate />
                </template>
              </ApexAccordion>
            </div>
          </div>

          <h2>Rich headers and content</h2>
          <div class="cell" style="margin-top:12px">
            <ApexAccordion :items="FAQ_PANELS" multiple gap="10px">
              <template #header="{ panel, active }">
                <span class="ac-head">
                  <strong>{{ panel.header }}</strong>
                  <em>{{ active ? 'Showing details' : 'Tap to read' }}</em>
                </span>
              </template>
              <template #content="{ panel }">
                <p class="note" style="margin:0 0 12px">{{ panel.content }}</p>
                <div class="iconstrip">
                  <ApexButton size="sm" icon="open_in_new" severity="secondary" variant="outlined">Read more</ApexButton>
                  <ApexButton size="sm" icon="thumb_up" severity="success" variant="text">Helpful</ApexButton>
                </div>
              </template>
            </ApexAccordion>
          </div>

          <h2>Disabled, sizes and separated cards</h2>
          <p class="note">
            A panel with <code>disabled</code> cannot be opened and is skipped by
            keyboard navigation. A <code>gap</code> turns the joined stack into
            separated cards.
          </p>
          <div class="grid grid--3" style="margin-top:12px">
            <div v-for="s in SIZES" :key="s" class="cell">
              <span class="cell__tag">size="{{ s }}"</span>
              <ApexAccordion :items="FAQ_PANELS.slice(0, 3)" :size="s" />
            </div>
          </div>
          <div style="margin-top:18px">
            <span class="cell__tag">gap="12px" — separated cards, radius and colours</span>
            <ApexAccordion :items="FAQ_PANELS" gap="12px" radius="14px" border-color="#A6C5FF"
                           header-background="#EAF2FF" active-background="#0B5FFF" active-color="#FFFFFF"
                           toggle-position="start" />
          </div>

          <h2>Dynamic panels and lazy content</h2>
          <p class="note">
            Panels are just data, so a dynamic accordion is a mapped array. With
            <code>lazy</code>, a body is built the first time its panel opens and kept
            afterwards.
          </p>
          <div class="cell" style="margin-top:12px">
            <ApexAccordion :items="FAQ_ZONES" lazy multiple />
          </div>

          <h2>Keyboard</h2>
          <p class="note">
            Focus a header: <strong>↑ ↓</strong> move between headers and skip disabled
            ones, <strong>Home</strong> and <strong>End</strong> jump,
            <strong>Space</strong> or <strong>Enter</strong> toggles the panel.
          </p>
        </template>

        <!-- A scrollbar cannot be judged from a code block: you have to scroll
             it. Every example here is live. -->
        <template v-if="entry.id === 'scrollarea'">
          <h2>Vertical</h2>
          <p class="note">
            Give it a height and the bar appears only if the content overflows. Scroll
            position is reported by <code>@scroll</code>: <code>{{ saPos }}px</code>.
          </p>
          <div style="max-width:280px;margin-top:12px">
            <ApexScrollArea height="220px" padding="4px" @scroll="onSaScroll">
              <div class="sa-list">
                <span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}<em>({{ c.value }})</em></span>
              </div>
            </ApexScrollArea>
          </div>

          <h2>Horizontal</h2>
          <div style="margin-top:12px">
            <ApexScrollArea padding="4px">
              <div class="sa-row">
                <span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}</span>
              </div>
            </ApexScrollArea>
          </div>

          <h2>Both axes</h2>
          <p class="note">Each bar appears independently, and the corner stays clear.</p>
          <div style="margin-top:12px">
            <ApexScrollArea height="200px" padding="4px">
              <div class="sa-grid">
                <span v-for="n in 60" :key="n">Cell {{ n }}</span>
              </div>
            </ApexScrollArea>
          </div>

          <h2>Scroll fade</h2>
          <p class="note">
            <code>mask</code> fades whichever edges can still be scrolled, so the fade
            clears when you reach an end.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell">
              <span class="cell__tag">mask, vertical</span>
              <ApexScrollArea height="200px" mask padding="4px">
                <div class="sa-list">
                  <span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}<em>({{ c.value }})</em></span>
                </div>
              </ApexScrollArea>
            </div>
            <div class="cell">
              <span class="cell__tag">mask, both axes</span>
              <ApexScrollArea height="200px" mask padding="4px">
                <div class="sa-grid">
                  <span v-for="n in 80" :key="n">Cell {{ n }}</span>
                </div>
              </ApexScrollArea>
            </div>
          </div>

          <h2>Variants</h2>
          <div class="grid grid--3" style="margin-top:12px">
            <div v-for="v in SCROLL_VARIANTS" :key="v" class="cell">
              <span class="cell__tag">variant="{{ v }}"</span>
              <ApexScrollArea height="150px" :variant="v" padding="4px">
                <div class="sa-list">
                  <span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}</span>
                </div>
              </ApexScrollArea>
            </div>
          </div>

          <h2>Custom bars</h2>
          <div class="grid grid--3" style="margin-top:12px">
            <div class="cell">
              <span class="cell__tag">thick, square, tinted track</span>
              <ApexScrollArea height="170px" :scrollbar-size="14" thumb-radius="2px"
                              thumb-color="#0B5FFF" thumb-hover-color="#073C9F" track-color="#EAF2FF" padding="4px">
                <div class="sa-list"><span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}</span></div>
              </ApexScrollArea>
            </div>
            <div class="cell">
              <span class="cell__tag">hairline</span>
              <ApexScrollArea height="170px" :scrollbar-size="3" thumb-color="#0F141C" padding="4px">
                <div class="sa-list"><span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}</span></div>
              </ApexScrollArea>
            </div>
            <div class="cell">
              <span class="cell__tag">green, always visible</span>
              <ApexScrollArea height="170px" variant="always" :scrollbar-size="10"
                              thumb-color="#137C4A" track-color="#E7F8EE" padding="4px">
                <div class="sa-list"><span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}</span></div>
              </ApexScrollArea>
            </div>
          </div>

          <h2>Inside a panel</h2>
          <div style="max-width:340px;margin-top:12px">
            <ApexPanel header="Automobiles" subheader="15 makes" icon="directions_car" toggleable>
              <ApexScrollArea max-height="180px" mask variant="hover">
                <div class="sa-list">
                  <span v-for="c in AUTOMOBILES" :key="c.label">{{ c.label }}<em>({{ c.value }})</em></span>
                </div>
              </ApexScrollArea>
            </ApexPanel>
          </div>
          <div class="usage"><pre><code>{{ SCROLL_IN_PANEL_SNIPPET }}</code></pre></div>
        </template>

        <!-- The words in the track are the one switch feature you have to
             click to judge, so these are live rather than quoted. -->
        <template v-if="entry.id === 'switch'">
          <h2>Labels in the track</h2>
          <p class="note">
            <code>on-label</code> and <code>off-label</code> put the state inside the
            track. Toggle any of these — the track does not resize as the word changes,
            because both words are rendered into the same grid cell and the hidden one
            still takes up its space. The track therefore measures the wider of the two
            and stays there. Watch the <strong>Enabled / Disabled</strong> one, where the
            two words differ most in length.
          </p>
          <div class="grid grid--3">
            <div v-for="s in SWITCH_LABEL_CASES" :key="s.tag" class="cell">
              <span class="cell__tag">{{ s.tag }}</span>
              <ApexSwitch v-model="switchDemo[s.tag]" v-bind="s.bind" />
            </div>
          </div>

          <h3 class="sub">At each size, and while disabled</h3>
          <p class="note">
            The padding that keeps the knob off the text scales with the size, so the
            word stays clear of it at all three. A disabled switch still shows its state.
          </p>
          <div class="grid grid--3">
            <div v-for="s in SIZES" :key="s" class="cell">
              <span class="cell__tag">size="{{ s }}"</span>
              <ApexSwitch v-model="switchDemo[s]" :size="s" on-label="ON" off-label="OFF"
                          label="Accepting bookings" />
            </div>
          </div>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">disabled, on</span>
              <ApexSwitch :model-value="true" disabled on-label="ON" off-label="OFF" label="Locked open" />
            </div>
            <div class="cell">
              <span class="cell__tag">disabled, off</span>
              <ApexSwitch :model-value="false" disabled on-label="ON" off-label="OFF" label="Locked shut" />
            </div>
          </div>

          <p class="note">
            Keep the words short. They live inside the track, so a long one makes a wide
            switch — at which point
            <button class="linkish" @click="current = 'togglebutton'">ApexToggleButton</button>
            is the better control: same idea, but shaped like a button, with room for an
            icon and a full phrase.
          </p>
          <div class="usage"><pre><code>{{ SWITCH_LABELS_SNIPPET }}</code></pre></div>
        </template>

        <!-- ApexNumber, like ApexInput, renders only shared parts. -->
        <template v-if="entry.id === 'number'">
          <h2>Customising</h2>
          <p class="note">
            ApexNumber adds no parts of its own — the box, the value, the status glyph and
            the <code>unit</code> / <code>currency</code> affixes are all shared, so the whole
            surface is documented on
            <button class="linkish" @click="current = 'field'">ApexField</button> and works here
            unchanged. The affixes take <code>affixColor</code>, and
            <code>ui.affix</code> reaches both of them.
          </p>
          <div class="usage"><pre><code>{{ SNIP_UI }}</code></pre></div>
        </template>

        <!-- ApexInput's customising story is short by design: everything it
             renders is shared, so the reference lives on ApexField. -->
        <template v-if="entry.id === 'input'">
          <h2>Customising</h2>
          <p class="note">
            ApexInput adds no appearance props or class hooks of its own — every part it
            renders is shared with Select, Multiselect, Tags, Number and Textarea, so the
            whole surface is documented once on
            <button class="linkish" @click="current = 'field'">ApexField</button>: the
            appearance props, the CSS variables, the class hooks and the dark-mode note.
          </p>
          <p class="note">
            The keys that reach an ApexInput are <code>root</code>, <code>label</code>,
            <code>body</code>, <code>message</code>, <code>control</code>, <code>input</code>,
            <code>icon</code>, <code>affix</code>, <code>button</code>, <code>popover</code>
            and <code>option</code> — eleven of the eighteen. The other seven belong to
            controls with parts ApexInput does not render, and are ignored here.
          </p>
          <div class="usage"><pre><code>{{ SNIP_UI }}</code></pre></div>
        </template>

        <!-- ApexInput carries four sections no other control has. The gallery
             hand-authors them in its template; here they are driven from the
             registry, but the demos are the same ones. -->
        <template v-if="entry.id === 'input'">
          <h2>Autocomplete</h2>
          <p class="note">
            Two-way bound value, a suggestion list you own, and a <code>@complete</code> handler
            that queries. The control debounces (<code>delay</code>), enforces
            <code>minLength</code>, and drives keyboard selection — ↓ ↑ move, Enter picks, Esc closes.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">:suggestions + @complete</span>
              <ApexInput
                v-model="acValue"
                label="City"
                leading-icon="location_on"
                placeholder="Start typing…"
                :suggestions="acHits"
                :loading="acBusy"
                :size="size"
                clearable
                dropdown
                @complete="acSearch"
              />
            </div>
            <div class="cell">
              <span class="cell__tag">forceSelection + completeOnFocus</span>
              <ApexInput
                v-model="acValue"
                label="City (must match)"
                leading-icon="location_on"
                :suggestions="acHits"
                :loading="acBusy"
                :min-length="0"
                :size="size"
                force-selection
                complete-on-focus
                help="Blurring with an unmatched value clears it."
                @complete="acSearch"
              />
            </div>
          </div>

          <div class="usage"><pre><code>{{ AUTOCOMPLETE_SNIPPET }}</code></pre></div>

          <h2>Icon slots</h2>
          <div class="grid grid--2">
            <div v-for="c in ICON_SLOT_CASES" :key="c.tag" class="cell">
              <span class="cell__tag">{{ c.tag }}</span>
              <ApexInput :model-value="c.value" v-bind="c.bind" :size="size" />
            </div>
          </div>

          <h2>Affixes and transforms</h2>
          <div class="grid grid--2">
            <div v-for="c in AFFIX_CASES" :key="c.tag" class="cell">
              <span class="cell__tag">{{ c.tag }}</span>
              <ApexInput :model-value="c.value" v-bind="c.bind" :size="size" />
            </div>
          </div>

          <h2>Key filter</h2>
          <p class="note">
            Rejected keystrokes never reach the value — paste and drop are filtered the same way.
            Try typing letters into any of these.
          </p>
          <div class="grid grid--2">
            <div v-for="c in KEY_FILTER_CASES" :key="c.key" class="cell">
              <span class="cell__tag">{{ c.tag }}</span>
              <ApexInput v-model="kf[c.key]" v-bind="c.bind" :size="size" />
            </div>
          </div>
        </template>

        <!-- ── ApexAlert ─────────────────────────────────────────── -->
        <template v-if="entry.id === 'alert'">
          <h2>The three calls</h2>
          <p class="doc-note">
            <code>confirm()</code> asks and resolves true or false.
            <code>notify()</code> reports and waits for an acknowledgement.
            <code>run()</code> does both with the work in between — and that is
            the one worth having: the alert never closes between stages, so a
            delete reads as one continuous act instead of a question, a blank
            pause, and then an unrelated message in the corner.
          </p>
          <div class="alert-row">
            <ApexButton @click="alertAsk">confirm()</ApexButton>
            <ApexButton severity="success" @click="alertReport">notify()</ApexButton>
            <ApexButton severity="danger" @click="alertRun">run() — the staged flow</ApexButton>
          </div>
          <p v-if="alertOutcome" class="alert-outcome">{{ alertOutcome }}</p>

          <h2>Reading an outcome</h2>
          <p class="doc-note">
            A resolved promise is not a successful outcome: a request can
            complete and still have been refused. Return <code>{ ok: false }</code>
            from the action — or register one <code>setAlertInterpreter</code> for
            the whole app, which is how an Inertia app reads its flash bag
            without a single call site changing.
          </p>
          <div class="alert-row">
            <ApexButton variant="outlined" @click="alertRefused">An action that completes, and was refused</ApexButton>
          </div>

          <h2>Showing what changes</h2>
          <p class="doc-note">
            An edit-confirm that lists its own changes can be read rather than
            trusted. Values render as text, never as markup — they come from
            records someone typed.
          </p>
          <div class="alert-row">
            <ApexButton variant="outlined" @click="alertChanges">Save changes?</ApexButton>
          </div>

          <h2>Copying a value</h2>
          <p class="doc-note">
            <code>copyText</code> adds a Copy button and leaves the alert
            standing, because the value is usually being read as well as copied.
          </p>
          <div class="alert-row">
            <ApexButton variant="outlined" @click="alertCopy">Show the generated key</ApexButton>
          </div>

          <h2>Buttons that do their own work</h2>
          <p class="doc-note">
            A button carries its own <code>action</code>, so one can open a form
            or route somewhere while another just closes. <code>role</code> is
            what <code>run()</code> reads: accept proceeds, reject aborts, and
            one with no role does its thing and stops there.
            <code>close: false</code> keeps the alert up.
          </p>
          <div class="alert-row">
            <ApexButton variant="outlined" @click="alertCustomButtons">Three buttons</ApexButton>
          </div>

          <h2>Hiding what this user may not do</h2>
          <p class="doc-note">
            Give a button a <code>can</code> and a <code>resource</code> and the
            app's resolver decides whether it appears. Hidden, not disabled — a
            greyed-out Delete still tells someone the action exists and that
            they do not have it.
          </p>
          <div class="alert-role">
            <span class="alert-role__label">Viewing as</span>
            <div class="seg">
              <button
                v-for="r in ROLES"
                :key="r"
                type="button"
                :aria-pressed="docsRole === r"
                @click="docsRole = r"
              >{{ r }}</button>
            </div>
          </div>
          <div class="alert-row">
            <ApexButton variant="outlined" @click="alertGated">Manage this area</ApexButton>
          </div>
          <p class="doc-note doc-note--warn">
            <b>This is presentation, not authorisation.</b> Hiding the button
            does not stop the delete: the handler is still in the shipped
            bundle and the endpoint behind it is still reachable. What it buys
            is an interface that tells the truth about what a user can do. The
            endpoint has to authorise the request itself.
          </p>

          <h2>Anchoring a small question</h2>
          <p class="doc-note">
            A <code>target</code> routes <code>confirm()</code> to
            <code>ApexConfirmPopup</code> instead — one service, two hosts, and
            the caller never picks a component. <code>run()</code> ignores it: a
            staged flow cannot follow a popup anchored to the button that was
            just pressed.
          </p>
          <div class="alert-row">
            <ApexButton ref="alertAnchorRef" variant="outlined" @click="alertAnchored($event)">Delete this row</ApexButton>
          </div>
        </template>
      </div>
    </main>
  </div>
  <!-- Singleton hosts for the service-backed controls. One each, at the root,
       which is exactly how an app mounts them: the service is a module-level
       store and these are its only renderer. Mounting one per page instead
       would put a toast inside the scrolling stage and stack duplicates. -->
  <ApexDynamicDialog />
  <ApexToast />
  <ApexAlert />
</template>
