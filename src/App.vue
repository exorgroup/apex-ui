<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
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
  AOS_PLANS, AOS_PEOPLE, AOS_STATS, AOS_ZOOMS, CHIP_TAGS, CHIP_SEVERITIES, CHIP_INTERESTS, CREW, TEAM, CAR_SHOTS, CAR_TRACKS, CAR_NAV_POS, GAL_IMAGES,
  TB_SEED, TB_OPS_SEED, TB_BIG, TB_COLUMNS, TB_RULE_COLUMNS, TB_OPS_COLUMNS, TB_LANES,
  TB_PERM_COLUMNS, TB_GUARD_COLUMNS, TB_GROUPS, TB_PHASE_COLUMNS, TB_ICONS, TB_FIELDS, TB_OPS_FIELDS,
  SUMMARY_ERRORS, SWITCH_LABEL_CASES, SWITCH_LABELS_SNIPPET,
  TOKEN_SWATCHES, TONE_CASES, UI_KEYS, ZONE_OPTIONS, DLG_POSITIONS, MSG_TEXT,
  TOAST_POSITIONS, TOAST_LINES,
} from './registry';
import type { AddNewKind, DocEntry, DocPage } from './registry';
/* ApexPopover is imported for its type: the five popover examples are driven
   through refs, and a ref to a component needs the component to type it. The
   tags themselves come from the plugin's global registration. */
import { applyMove } from '@exorgroup/apex-ui';
import { useApexDialog, useApexAlert, useApexToast, useCan, ApexPopover, ApexTieredMenu, ApexMenubar, ApexMenu, ApexMegaMenu, ApexDock, ApexContextMenu, ApexBreadcrumb,
  ApexSidebar, ApexSidebarLayout, ApexSidebarInset, ApexSidebarTrigger } from '@exorgroup/apex-ui';
import type { MenuItem, MegaItem, CrumbItem, SpeedDialItem } from '@exorgroup/apex-ui';
import { watermarkPlugin, trendlinePlugin, statsPlugin, thresholdPlugin } from '@exorgroup/apex-ui';
import { CHT_TRIAL, CHT_REVENUE, CHT_SHAPE, CHT_GAPPY, CHT_LOG, CHT_REGIONS,
  CHT_CHANNELS, CHT_WEATHER, CHT_DAILY, CHT_BIG, CHT_STACK, CHT_BAND, CHT_TREND,
  CHT_CROSSING, CHT_CROSSING_HALO, CHT_GRADIENT, CHT_SHAPES, CHT_STYLES,
  CHT_SYNC_A, CHT_SYNC_B, CHT_RD } from './chartData';
import { ROLES, docsRole } from './docsCan';
import LocalityForm from './demos/LocalityForm.vue';
import ContainerStage from './demos/ContainerStage.vue';
import DirectiveStage from './demos/DirectiveStage.vue';
import ServiceStage from './demos/ServiceStage.vue';
import OverlayStage from './demos/OverlayStage.vue';
import MenuStage from './demos/MenuStage.vue';
import MediaStage from './demos/MediaStage.vue';
import BoardStage from './demos/BoardStage.vue';
import ChartStage from './demos/ChartStage.vue';
/* The dynamic-dialog and confirm-popup demos appear in the stage AND in a
   section below it. One module holds their state so both report through the
   same line — see demos/overlayDemos.ts. */
import { openDynamic, dynLog, askConfirm, cfmLog } from './demos/overlayDemos';

const current = ref('input');
const theme = ref<'light' | 'dark'>('dark');
const size = ref<'sm' | 'md' | 'lg'>('md');
const dir = ref<'ltr' | 'rtl'>('ltr');
const search = ref('');
const copied = ref(false);

/** v-model per control, so switching away and back keeps what you typed. */
const model = reactive<Record<string, unknown>>({});

/* ── The directives ──────────────────────────────────────────────────── */

/* ── ApexFileUpload ──────────────────────────────────────────────────── */

/** What the custom-upload handler is doing, shown live under the demo. */
const fuCustomLog = ref('');

/**
 * The Custom upload section's handler — a stub, deliberately.
 *
 * These docs have no server, and none of the other demos sets a `url` for
 * that reason: with none, the selection itself is the result. This section is
 * the exception, because customUpload's whole point is that the control sends
 * nothing and hands you { files, clear, setProgress } instead. Showing that
 * needs a handler that actually drives setProgress, so this one walks the
 * files on a timer and reports as it goes.
 *
 * It calls clear() at the end like a real one would, so the control returns
 * to empty rather than sitting on a finished selection for ever.
 */
async function fuCustom({ files, clear, setProgress }: {
  files: File[];
  clear: () => void;
  setProgress: (n: number) => void;
}) {
  if (!files.length) return;
  for (let i = 0; i < files.length; i += 1) {
    fuCustomLog.value = `sending ${files[i].name} (${i + 1} of ${files.length})`;
    await new Promise((r) => setTimeout(r, 500));
    setProgress(Math.round(((i + 1) / files.length) * 100));
  }
  fuCustomLog.value = `done — ${files.length} file(s)`;
  clear();
}

/** "In a form": the uploader bound as a plain File[], beside a real field. */
const fuTitle = ref('');
const fuFiles = ref<File[]>([]);

/* ── ApexToast ───────────────────────────────────────────────────────── */

/** The service every toast example calls; the host is mounted at the app root. */
const toast = useApexToast();

/** Severity section: one call per tint, with a line that suits it. */
function fireToast(severity: string) {
  toast.add({ severity: severity as never, summary: severity, detail: TOAST_LINES[severity] });
}

/**
 * Promise section: a sticky loading toast that becomes its own result.
 *
 * update() is what makes this one toast rather than two — the id from add()
 * is the handle, which is also why add() returning it matters. Without that,
 * the result would appear as a second toast beside a loading one that never
 * goes away.
 */
async function runToastTask(succeeds: boolean) {
  const id = toast.add({ severity: 'secondary', summary: 'Working…', detail: 'Uploading the archive.', sticky: true });
  await new Promise((r) => setTimeout(r, 1400));
  toast.update(id, succeeds
    ? { severity: 'success', summary: 'Done', detail: 'The archive is uploaded.', sticky: false, life: 3000 }
    : { severity: 'error', summary: 'Failed', detail: 'The connection dropped.', sticky: false, life: 4000 });
}

/** Position section: which container placement the demo host is using. */
const toastPos = ref<string>('top-right');

/** Expanded-and-stacked section: the mode switch, and a burst worth stacking. */
const toastStacked = ref(false);
let burstSeq = 0;
function burstToasts() {
  for (let n = 1; n <= 5; n += 1) {
    burstSeq += 1;
    toast.add({ group: 'stackdemo', severity: 'info', summary: `Message ${burstSeq}`, detail: 'One of five sent together.' });
  }
}

/**
 * The custom-toast demo's payload, read as its real shape.
 *
 * ToastMessage.data is `unknown`, so the template has to narrow it. Doing that
 * with an inline `as { … }` inside a mustache is what vue-tsc's template
 * parser cannot read — it bails on the file and stops reporting, which drops
 * the error count and reads like an improvement.
 */
const uploadInfo = (m: { data?: unknown }) => m.data as { file: string; size: string };

/** What the actions slot last did, shown live under the buttons. */
const toastLog = ref('');

/* ── ApexMessage ─────────────────────────────────────────────────────── */

/**
 * The "Closable and life" pair, and the last event either of them reported.
 *
 * Both are v-model:visible so a dismissed message can be brought back, which
 * is the whole point of that section — a message that could only be closed
 * would need no bindable state at all.
 */
const msgLife = ref(true);
const msgManual = ref(true);
const msgLog = ref('');

/**
 * Restart the timed message.
 *
 * Setting visible back to true while it is already true changes nothing, so
 * the timer never restarts and the button looks broken on a second press. It
 * has to go false first, and the component has to see that — hence nextTick
 * rather than two assignments in a row, which Vue would batch into no change
 * at all.
 */
async function restartMsgLife() {
  msgLife.value = false;
  await nextTick();
  msgLife.value = true;
}

/** The Dynamic section's own array, and the counter that keeps keys unique. */
const msgList = ref<Array<{ id: number; severity: string; text: string }>>([]);
let msgSeq = 0;
const MSG_SEVERITIES = ['success', 'info', 'warn', 'error'] as const;
function addMsg() {
  msgSeq += 1;
  const severity = MSG_SEVERITIES[msgSeq % MSG_SEVERITIES.length];
  msgList.value.push({ id: msgSeq, severity, text: `Message ${msgSeq} — ${MSG_TEXT[severity]}` });
}

/** "In a form": empty is the error case, so it starts empty deliberately. */
const msgEmail = ref('');

/* ── The three overlays ──────────────────────────────────────────────── */

/**
 * ApexPopover's five examples.
 *
 * Each has its own ref because that is the API: the popover is opened by
 * calling toggle() or show() on it, and the event passed in becomes the
 * anchor. `povShared` is the exception that proves the point — one popover
 * serving four triggers, which only works because the anchor is the event.
 */
/* ── The three pages the pack gated afterwards ──── */
/*
 * ApexSplitButton and ApexSpeedDial had docs pages before the menu family
 * learned `can`, so their models are gated here for the Permissions section
 * each page gained. ApexToolbar is with them because it is the one control in
 * the group that does NOT gate — its contents are slots, not a model — and
 * that is worth saying where people would look for it.
 */

/*
 * Written so all three roles differ: `reports` is read, which the Coordinator
 * has and the Viewer does not; the Admin group needs `settings` and a delete,
 * which only the Admin has. So the Viewer is left with the one ungated row,
 * and the header and rule that framed the rest go with them.
 */
const splitGated: MenuItem[] = [
  { label: 'Save as…', icon: 'save_as' },
  { label: 'Export', icon: 'download', can: 'reports' },
  { separator: true },
  { header: 'Admin' },
  { label: 'Settings', icon: 'settings', can: 'settings' },
  { label: 'Delete', icon: 'delete', can: { action: 'delete', resource: 'events' } },
];

/* Every row denied, to show the primary action surviving an empty menu. */
const splitAllDenied: MenuItem[] = [
  { label: 'Delete', icon: 'delete', can: { action: 'delete', resource: 'events' } },
  { label: 'Purge', icon: 'delete_forever', can: 'settings' },
];

/* The dial is a flat list, so there is no cascade to show. What it does show
   is the fan closing up: the offsets are computed from the filtered list, so
   three items sit at three-item spacing rather than leaving gaps. */
const dialGated: SpeedDialItem[] = [
  { icon: 'edit', label: 'Edit' },
  { icon: 'download', label: 'Export', can: 'reports' },
  { icon: 'settings', label: 'Settings', can: 'settings' },
  { icon: 'delete', label: 'Delete', can: { action: 'delete', resource: 'events' } },
];

/* The toolbar has no model, so its Permissions section gates the way a caller
   would: the same resolver, read directly, driving a v-if. */
const pageCan = useCan();

/* ── ApexTaskBoard page ───────── */
/* Each example copies the seed. The board never mutates `items` — it emits a
   payload and the app applies it — so one shared array would make every drag
   on this page show up in all thirteen examples at once. */
/* Spelled out rather than derived from the seed: TB_SEED's element type is a
   union of shapes (some rows have a checklist, some a due date), so a derived
   type makes every spread of two rows a wider union again, and tbEditSave's
   `{ ...row, ...draft }` stops assigning back to the array it came from. */
type TbItem = {
  id: string;
  columnId: string;
  swimlaneId?: string;
  order?: number;
  title: string;
  labels?: string[];
  priority?: string;
  assignees?: string[];
  checklist?: { done: number; total: number };
  due?: string;
  description?: string;
  points?: number;
  [key: string]: unknown;
};

const copy = (rows: readonly Record<string, unknown>[]): TbItem[] =>
  rows.map((r) => ({ ...r })) as TbItem[];
type TbMove = Parameters<typeof applyMove>[1];

const tbItems = ref<TbItem[]>(copy(TB_SEED));
const tbOps = ref<TbItem[]>(copy(TB_OPS_SEED));
const tbPhase = ref<TbItem[]>(
  TB_SEED.map((r) => ({ ...r, columnId: r.columnId === 'blocked' ? 'backlog' : r.columnId })));
const tbPhaseColumns = ref(copy(TB_PHASE_COLUMNS));
const tbMenuItems = ref<TbItem[]>(copy(TB_SEED.filter((i2) => ['ideas', 'ready', 'building'].includes(i2.columnId))));
const tbRules = ref<TbItem[]>(copy(TB_SEED.filter((i2) => ['ideas', 'ready', 'building'].includes(i2.columnId))));
const tbPermItems = ref<TbItem[]>(copy(TB_SEED.filter((i2) => ['ideas', 'ready', 'building'].includes(i2.columnId))));
const tbGuard = ref<TbItem[]>(copy(TB_SEED.filter((i2) => ['ready', 'building'].includes(i2.columnId))));
const tbSelItems = ref<TbItem[]>(copy(TB_SEED));
const tbEditItems = ref<TbItem[]>(
  copy(TB_SEED.filter((r) => ['ideas', 'ready', 'building'].includes(r.columnId))));
const tbBig = ref<TbItem[]>(copy(TB_BIG));
const tbStateItems = ref<TbItem[]>(copy(TB_OPS_SEED));


/* ── ApexChart demo state ─────────────────────────────────────────────────
   Ported from the gallery's options object. The rail-driven props live on the
   stage; these belong to individual sections — the animation section's flip,
   the export section's output, the decimation section's node count.          */

/** Animation: chtSwap rescales the series so the chart has something to
    tween to, chtAddPoint/chtDropPoint change the point COUNT, which is the
    harder case — the chart has to reconcile a different-length dataset. */
const chtFlip = ref(false);
const chtExtra = ref(0);
function chtSwap() { chtFlip.value = !chtFlip.value; }
function chtAddPoint() { chtExtra.value = Math.min(0, chtExtra.value + 1); }
function chtDropPoint() { chtExtra.value = Math.max(-8, chtExtra.value - 1); }

const chtSeries = computed(() => {
  const scale = chtFlip.value ? 1.45 : 1;
  const shift = chtFlip.value ? -8 : 0;
  const len = Math.max(4, Math.min(12, 12 + chtExtra.value));
  return [
    {
      id: 'activated', name: 'Activated', xKey: 'month', yKey: 'value', fillOpacity: 0.16,
      data: CHT_TRIAL.slice(0, len).map((r: any) => ({
        month: r.month, value: Math.round(r.value * scale + shift),
      })),
    },
    {
      id: 'invited', name: 'Invited', xKey: 'month', yKey: 'value',
      data: CHT_TRIAL.slice(0, len).map((r: any, i: number) => ({
        month: r.month, value: Math.round((r.value * 0.62 + 8) * (chtFlip.value ? 1.2 : 1) + (i % 3)),
      })),
    },
  ];
});

const chtEntrance = ref('draw');
const chtReplay = ref(0);
const chtStack = ref('normal');
const chtLog = ref('');

/** Decimation: the count is read back out of the DOM rather than asserted,
    because the honest question is how many points were DRAWN. */
const chtDecimate = ref(true);
const chtRenderer = ref('auto');
const chtDrawn = ref<number | string>(0);
const chtBig = ref<any>(null);
function chtCount() {
  const el = chtBig.value && chtBig.value.$el;
  if (!el) { chtDrawn.value = 0; return; }
  const path = el.querySelector('.apex-cht__line');
  if (path) {
    /* Counting path commands is the honest measure of what was drawn: the
       canvas layer has no nodes to count. */
    chtDrawn.value = (path.getAttribute('d').match(/[ML]/g) || []).length;
    return;
  }
  chtDrawn.value = 'canvas layer — no DOM nodes';
}

/** Per-segment colour and dash: both take the segment context, so a line can
    change appearance partway without being split into two series. */
function chtTrendColor(ctx: any) {
  if (ctx.p1.y === null || ctx.p0.y === null) return undefined;
  return ctx.p1.y >= ctx.p0.y ? 'oklch(0.62 0.16 150)' : 'oklch(0.60 0.19 25)';
}
function chtForecastDash(ctx: any) { return ctx.p0.index >= 7 ? '6 5' : undefined; }
function chtForecastColor(ctx: any) { return ctx.p0.index >= 7 ? 'var(--fg-subtle)' : undefined; }

const chtLabels = ref('culled');
const chtLabelSpec = computed(() => {
  if (chtLabels.value === 'all') return { show: true, collision: false };
  if (chtLabels.value === 'sparse') return { show: true, sparse: true };
  return { show: true };
});

function chtSeriesAvg(s: any) {
  const vals = s.points.map((p: any) => p.y).filter((v: number | null) => v !== null);
  if (!vals.length) return '0.00';
  return (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(2);
}
function chtRowTotal(rows: any[]) {
  return Number(rows.reduce((sum, r) => sum + Number(String(r.value).replace(/[^0-9.-]/g, '')), 0).toFixed(2));
}

/** Export: exportCsv and exportSvg are synchronous strings, exportImage is a
    Promise<Blob>, so the PNG needs an object URL to be shown at all. */
const chtOut = ref('');
const chtPng = ref('');
const chtExp = ref<any>(null);
function chtExport(kind: string) {
  const chart = chtExp.value;
  if (!chart) return;
  chtPng.value = '';
  if (kind === 'csv') { chtOut.value = chart.exportCsv(); return; }
  if (kind === 'svg') { chtOut.value = chart.exportSvg().slice(0, 1400) + '…'; return; }
  chart.exportImage({ scale: 2 }).then((blob: Blob) => {
    chtOut.value = 'PNG blob — ' + Math.round(blob.size / 1024) + ' KB, type ' + blob.type;
    chtPng.value = URL.createObjectURL(blob);
  }).catch((err: Error) => { chtOut.value = 'export failed: ' + err.message; });
}

const chtZoomLabel = ref('Wheel, drag or shift-drag on the plot');
const chtZoom = ref<any>(null);
const chtGroup = ref<any>(null);
function chtOnZoom(payload: any) {
  if (payload.full || !payload.range) {
    chtZoomLabel.value = 'Showing all 50,000 points';
    return;
  }
  const span = Math.round(payload.range[1] - payload.range[0]);
  chtZoomLabel.value = 'Window: ' + Math.round(payload.range[0]).toLocaleString()
    + ' – ' + Math.round(payload.range[1]).toLocaleString()
    + ' (' + span.toLocaleString() + ' points)';
}

const chtPlugWatermark = ref(true);
const chtPlugTrend = ref(true);
const chtPlugStats = ref(false);
const chtPlugThreshold = ref(false);
const chtPlugins = computed(() => {
  const list = [];
  if (chtPlugWatermark.value) list.push(watermarkPlugin('APEX'));
  if (chtPlugTrend.value) list.push(trendlinePlugin('self'));
  if (chtPlugStats.value) list.push(statsPlugin());
  if (chtPlugThreshold.value) list.push(thresholdPlugin(25, 55));
  return list;
});

const tbLog = ref('');
const tbSel = ref(0);
const tbBlock = ref(false);
const tbRole = ref('Admin');
const tbGuardLog = ref('');
const tbSelNames = ref('');
const tbMenuLog = ref('');
const tbMenuCard = ref<TbItem | null>(null);
const tbVirtual = ref(true);
const tbRendered = ref(0);
const tbState = ref<unknown>(null);
const tbExport = ref('');
const tbDialog = ref(false);
const tbDraft = ref<Record<string, unknown>>({});

/* The first board keeps its own history, to show that undo is the app's:
   the board emits, the app decides what a stack of those payloads means. */
const tbPast = ref<TbItem[][]>([]);
const tbFuture = ref<TbItem[][]>([]);

function tbMove(payload: TbMove) {
  tbPast.value = [...tbPast.value, tbItems.value];
  tbFuture.value = [];
  tbItems.value = applyMove(tbItems.value, payload) as TbItem[];
  tbLog.value = payload.items.length > 1
    ? `${payload.items.length} cards moved to ${payload.to.columnId}`
    : `${payload.items[0].title} → ${payload.to.columnId}`;
}
function tbUndo() {
  const prev = tbPast.value[tbPast.value.length - 1];
  if (!prev) return;
  tbPast.value = tbPast.value.slice(0, -1);
  tbFuture.value = [...tbFuture.value, tbItems.value];
  tbItems.value = prev;
  tbLog.value = 'undone';
}
function tbRedo() {
  const next = tbFuture.value[tbFuture.value.length - 1];
  if (!next) return;
  tbFuture.value = tbFuture.value.slice(0, -1);
  tbPast.value = [...tbPast.value, tbItems.value];
  tbItems.value = next;
  tbLog.value = 'redone';
}
function tbReset() {
  tbItems.value = copy(TB_SEED);
  tbPast.value = [];
  tbFuture.value = [];
  tbLog.value = '';
}

/* The board reports the intent; the columns array is the app's to reorder. */
function tbReorder(payload: { columnId: string; fromIndex: number; toIndex: number }) {
  const next = tbPhaseColumns.value.slice();
  next.splice(payload.toIndex, 0, next.splice(payload.fromIndex, 1)[0]);
  tbPhaseColumns.value = next;
  tbLog.value = `${payload.columnId} moved to position ${payload.toIndex + 1}`;
}

/* Context menu — the board emits the card and the event; the menu is ours. */
const tbMenu = ref<{ show: (e: Event) => void } | null>(null);
function tbOpenMenu(payload: { item: TbItem; originalEvent: Event }) {
  payload.originalEvent.preventDefault();
  tbMenuCard.value = payload.item;
  tbMenu.value?.show(payload.originalEvent);
}
function tbMenuMove(columnId: string) {
  const card = tbMenuCard.value;
  if (!card) return;
  tbMenuItems.value = applyMove(tbMenuItems.value, {
    items: [card], from: { columnId: card.columnId, index: 0 }, to: { columnId, index: 0 },
  }) as TbItem[];
  tbMenuLog.value = `${card.title} → ${columnId}`;
}
function tbDuplicate() {
  const card = tbMenuCard.value;
  if (!card) return;
  tbMenuItems.value = [...tbMenuItems.value,
    { ...card, id: `${card.id}-copy-${Date.now()}`, title: `${card.title} (copy)` }];
  tbMenuLog.value = `duplicated ${card.title}`;
}
function tbDelete() {
  const card = tbMenuCard.value;
  if (!card) return;
  tbMenuItems.value = tbMenuItems.value.filter((i2) => i2.id !== card.id);
  tbMenuLog.value = `deleted ${card.title}`;
}
const TB_MENU = computed<MenuItem[]>(() => [
  { label: 'Open card', icon: 'open_in_new', command: () => { tbMenuLog.value = `open ${tbMenuCard.value?.title}`; } },
  { label: 'Duplicate', icon: 'content_copy', command: tbDuplicate },
  { separator: true },
  { label: 'Move to Ready', icon: 'east', command: () => tbMenuMove('ready') },
  { label: 'Move to Building', icon: 'construction', command: () => tbMenuMove('building') },
  { separator: true },
  { label: 'Delete', icon: 'delete', command: tbDelete },
]);

/*
 * The board's own permission model, not the can() seam.
 *
 * Every other control asks can(action, resource) and hides what is refused.
 * A board cannot: the answer depends on the row — whether this card is mine,
 * whether that column is archived — and there are six distinct verbs, one of
 * which (canDelete) the board only passes through to your card because it
 * never deletes anything itself. Functions per board beat a resource string
 * per card here, so ApexTaskBoard keeps TaskBoardPermissions.
 */
const tbPermissions = computed(() => {
  const mine = (item: TbItem) => (item.assignees || []).includes('Sarah Wilson');
  if (tbRole.value === 'Admin') return {};
  if (tbRole.value === 'Contributor') {
    return {
      hiddenColumns: ['shipped'],
      canDrag: mine,
      canEdit: mine,
      canDelete: () => false,
      canCreate: (cell: { columnId: string }) => cell.columnId === 'ideas',
      canReorderColumns: false,
    };
  }
  return {
    canDrag: () => false, canEdit: () => false, canDelete: () => false,
    canCreate: () => false, canReorderColumns: false,
  };
});

/* Async by design: the guard answers when the user does, and the board waits
   rather than emitting a move it may have to undo. Our alert service already
   returns a promise, so the gallery's confirm dialog becomes one await. */
async function tbConfirm(payload: TbMove) {
  if (payload.to.columnId !== 'shipped') return true;
  const titles = payload.items.map((c: TbItem) => c.title).join(', ');
  const yes = await alert.confirm({
    tone: 'info',
    title: 'Ship this work?',
    message: `${titles} will be marked shipped. This is announced to the team.`,
    confirmText: 'Ship it',
    cancelText: 'Not yet',
  });
  tbGuardLog.value = `${yes ? 'confirmed' : 'declined'} — ${titles}`;
  return yes;
}

/* Activation is an event, not a built-in editor. */
function tbEdit(item: TbItem | null, columnId?: string) {
  tbDraft.value = item ? { ...item } : { title: '', priority: 'P3', due: '', columnId: columnId || 'ideas' };
  tbDialog.value = true;
}
function tbEditSave() {
  const draft = tbDraft.value as TbItem;
  tbEditItems.value = draft.id
    ? tbEditItems.value.map((i2) => (i2.id === draft.id ? { ...i2, ...draft } : i2))
    : [...tbEditItems.value, { ...draft, id: `new-${Date.now()}`, order: 999 }];
  tbDialog.value = false;
}
function tbEditDelete() {
  tbEditItems.value = tbEditItems.value.filter((i2) => i2.id !== tbDraft.value.id);
  tbDialog.value = false;
}

/* Windowing, state and export all read the board through its ref. */
const tbBigBoard = ref<{ $el: HTMLElement } | null>(null);
const tbSelBoard = ref<{ selectAll: (c: string) => void; clearSelection: () => void } | null>(null);
const tbStateBoard = ref<{
  getState: () => unknown; setState: (s: unknown) => void;
  exportJson: () => string; exportCsv: () => string;
} | null>(null);

function tbCountRendered() {
  /* [data-kb-card], not the [data-tb-card] the gallery counted: the board has
     always written data-kb-card, so that counter read zero however many cards
     were on screen. Fixed on import rather than ported. */
  tbRendered.value = tbBigBoard.value?.$el.querySelectorAll('[data-kb-card]').length ?? 0;
}
function tbPrint() { window.print(); }
function tbSave() { tbState.value = tbStateBoard.value?.getState(); tbLog.value = 'state saved'; }
function tbRestore() { tbStateBoard.value?.setState(tbState.value); tbLog.value = 'state restored'; }
function tbShow(kind: 'json' | 'csv') {
  const b = tbStateBoard.value;
  tbExport.value = (kind === 'json' ? b?.exportJson() : b?.exportCsv()) || '';
}

/** The ui map's parts, for the Customising table. */
const TB_PARTS: string[][] = [
  ['root / grid', 'The board, and the stack of rows inside it'],
  ['head / column / columnTitle / count', 'The header row, one header, its title and its count'],
  ['group', 'One column-group cell above the headers'],
  ['lane / laneTitle', "A swimlane's header, and its title"],
  ['cell / empty / add', 'One column × lane cell, its empty note, its add-card button'],
  ['card / indicator / preview', 'One card, the drop indicator, the clone under the pointer'],
  ['body / cardTitle / labels / label / meta / chip', "ApexTaskCard's own parts — only while the default card is in use"],
];

/* ── ApexGallery page ─────────────── */
const galBasic = ref(0);
const galTbA = ref(0);
const galTbB = ref(0);
const galSwA = ref(0);
const galSwB = ref(0);
const galHover = ref(0);
const galStyleA = ref(0);
const galStyleB = ref(0);
/* The lightbox: an index and whether it is up. */
const galLbIndex = ref(0);
const galLbOpen = ref(false);

/** The ui map's parts, for the Customising table. */
const GAL_PARTS: string[][] = [
  ['root', 'The ApexGallery element itself'],
  ['stage', 'The image frame'],
  ['img', 'The picture, or the placeholder standing in for one'],
  ['bar', 'The floating toolbar'],
  ['act', 'One toolbar button'],
  ['nav', 'A prev or next arrow'],
  ['count', 'The \u201c3 / 8\u201d counter'],
  ['thumbs', 'The thumbnail strip'],
  ['thumb', 'One thumbnail'],
];

/* ── ApexCarousel page ────────────────── */
const carCard = ref(0);
/* Two carousels share this one index — that is the Gallery example. */
const carGallery = ref(0);

/** The ui map's parts, for the Customising table. */
const CAR_PARTS: string[][] = [
  ['root', 'The ApexCarousel element itself'],
  ['track', 'The scroll-snap scroller'],
  ['item', 'One snap child'],
  ['nav', 'A prev or next button'],
  ['dots', 'The indicator row'],
  ['dot', 'One indicator'],
];

/* ── ApexCompare page ─────────────────── */
/** The ui map's parts, for the Customising table. */
const CMP_PARTS: string[][] = [
  ['root', 'The frame both items sit in'],
  ['item', 'One side — set on ApexCompareItem, not the parent'],
  ['divider', 'The line at the current position'],
  ['handle', 'The draggable control on it'],
  ['grip', 'The chevron pair inside the handle'],
  ['chev', 'One chevron'],
];

/* One position per demo, so dragging one comparison does not move the rest. */
const cmpBasic = ref(50);
const cmpHandleA = ref(45);
const cmpHandleB = ref(55);
const cmpHandleC = ref(50);
const cmpHover = ref(50);
const cmpVert = ref(50);
const cmpCtl = ref(50);
const cmpTpl = ref(50);

/* ── ApexSidebar page ──────────────────────────── */
/*
 * The gallery's own models, ported.
 *
 * Four of the six are computed rather than constant, because the gallery's
 * demos are wired both ways: a row's `command` writes state, and the row's own
 * `active` or `icon` reads it back. ApexMenu has no selection of its own, so
 * "which row is current" lives in the page, exactly as it would in an app.
 */
const sbNarrow = ref(false);
const sbIdeNarrow = ref(false);
const sbIdePanel = ref(true);
const sbIdeSection = ref('General');
const sbRespOpen = ref(true);
const sbWorkspace = ref('Acme Inc');
const sbAsk = ref('');
const sbFile = ref('Q1 Report');
const sbFilePath = ref<string[]>(['Documents', 'Work', 'Projects', 'Q1 Report']);
const sbFileKeys = ref<Record<string, boolean>>({ documents: true, work: true, projects: true });
const sbChat = ref('Apex Sidebar component');
const sbChatLog = ref('');

/* The two popup menus in the "With menu" shell are driven through their refs,
   the way a real header's workspace and account menus would be. */
const wsMenu = ref<InstanceType<typeof ApexMenu> | null>(null);
const userMenu = ref<InstanceType<typeof ApexMenu> | null>(null);

/** Grouped application navigation: a static section label per group. */
const SB_NAV: MenuItem[] = [
  { label: 'Navigation', items: [
    { label: 'Home', icon: 'home', active: true },
    { label: 'Inbox', icon: 'inbox', badge: 12 },
    { label: 'Search', icon: 'search' },
    { label: 'Notifications', icon: 'notifications', badge: 3 },
  ] },
  { label: 'Projects', items: [
    { key: 'analytics', label: 'Analytics', icon: 'bar_chart', toggleable: true, items: [
      { label: 'Overview', icon: 'donut_small' },
      { label: 'Reports', icon: 'description' },
      { label: 'Real-time', icon: 'bolt' },
    ] },
    { label: 'Team', icon: 'group' },
    { label: 'Calendar', icon: 'calendar_month' },
  ] },
  { label: 'Billing', items: [
    { label: 'Payments', icon: 'credit_card' },
    { label: 'Orders', icon: 'shopping_cart' },
    { label: 'Subscriptions', icon: 'star' },
  ] },
];

/** The workspace switcher: the tick follows the choice. */
const SB_WORKSPACES = computed<MenuItem[]>(() =>
  ['Acme Inc', 'Globex Corp', 'Initech'].map((w) => ({
    label: w,
    icon: sbWorkspace.value === w ? 'check' : 'business',
    command: () => { sbWorkspace.value = w; },
  })));

/** The narrow icon rail of the two-panel example. */
const SB_IDE_RAIL: MenuItem[] = [
  { label: 'Project', items: [
    { label: 'Home', icon: 'home', active: true },
    { label: 'Database', icon: 'database' },
    { label: 'Authentication', icon: 'key' },
    { label: 'Edge Functions', icon: 'bolt' },
    { label: 'Storage', icon: 'cloud' },
    { label: 'SQL Editor', icon: 'code' },
  ] },
];

/** The settings panel beside it — every row marks itself active. */
const SB_IDE_PANEL = computed<MenuItem[]>(() => {
  const row = (label: string, extra: Partial<MenuItem> = {}): MenuItem => ({
    label,
    active: sbIdeSection.value === label,
    command: () => { sbIdeSection.value = label; },
    ...extra,
  });
  return [
    { label: 'Configuration', items: [
      row('General'), row('Compute and Disk'), row('Infrastructure'),
      row('Integrations'), row('API Keys'), row('JWT Keys'),
      row('Log Drains'), row('Add-ons'),
    ] },
    { label: 'Integrations', items: [
      row('Data API', { hint: '\u2197' }),
      row('Vault', { badge: 'Beta' }),
    ] },
    { label: 'Billing', items: [
      row('Subscription', { hint: '\u2197' }),
      row('Usage', { hint: '\u2197' }),
    ] },
  ];
});

/** A file tree: leaves set both the open file and the trail beside it. */
const SB_FILES = computed<MenuItem[]>(() => {
  const leaf = (label: string, path: string[]): MenuItem => ({
    label,
    active: sbFile.value === label,
    command: () => { sbFile.value = label; sbFilePath.value = path; },
  });
  return [
    { label: 'Files', items: [
      { key: 'documents', label: 'Documents', icon: 'folder', toggleable: true, items: [
        { key: 'work', label: 'Work', toggleable: true, items: [
          { key: 'projects', label: 'Projects', toggleable: true, items: [
            leaf('Q1 Report', ['Documents', 'Work', 'Projects', 'Q1 Report']),
            leaf('Q2 Report', ['Documents', 'Work', 'Projects', 'Q2 Report']),
            leaf('Roadmap', ['Documents', 'Work', 'Projects', 'Roadmap']),
          ] },
          leaf('Invoices', ['Documents', 'Work', 'Invoices']),
          leaf('Contracts', ['Documents', 'Work', 'Contracts']),
        ] },
        { key: 'personal', label: 'Personal', toggleable: true, items: [
          leaf('Recipes', ['Documents', 'Personal', 'Recipes']),
          leaf('Travel', ['Documents', 'Personal', 'Travel']),
        ] },
      ] },
    ] },
    { label: 'Media', items: [
      { key: 'photos', label: 'Photos', icon: 'image', toggleable: true, items: [
        leaf('2024', ['Photos', '2024']), leaf('2025', ['Photos', '2025']),
      ] },
      { key: 'videos', label: 'Videos', icon: 'videocam', toggleable: true, items: [
        leaf('Tutorials', ['Videos', 'Tutorials']), leaf('Recordings', ['Videos', 'Recordings']),
      ] },
    ] },
  ];
});

/** Conversations grouped by age, for the chat example. */
const SB_CHATS = [
  { label: 'Today', items: ['Apex Sidebar component', 'How to use Vue composables', 'Fix TypeScript generics'] },
  { label: 'Yesterday', items: ['Design system architecture', 'Vue 3 new features', 'CSS light-dark()'] },
  { label: 'Previous 7 days', items: ['Build a dashboard layout', 'Node API authentication', 'Monorepo with pnpm'] },
];

/*
 * The gated model for the Permissions section. Nothing here is
 * sidebar-specific: the rows carry `can`, ApexMenu resolves it, and
 * Administration disappears with its children rather than becoming a heading
 * over nothing.
 */
const sbGated: MenuItem[] = [
  { key: 'main', label: 'Workspace', items: [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Events', icon: 'event' },
  ] },
  { key: 'admin', label: 'Administration', items: [
    { label: 'Users', icon: 'person', can: 'settings' },
    { label: 'Roles', icon: 'shield', can: 'settings' },
  ] },
];

/* ── ApexBreadcrumb page ───────────────────────── */
const bcLog = ref('');
const bcRoute = ref('');

const CRUMB_HOME: CrumbItem = { icon: 'home', href: '#' };
const CRUMBS: CrumbItem[] = [
  { label: 'Components', href: '#' },
  { label: 'Menu', href: '#' },
  { label: 'Breadcrumb' },
];
const LONG_CRUMBS: CrumbItem[] = [
  { label: 'Components', href: '#' },
  { label: 'Form', href: '#' },
  { label: 'Input', href: '#' },
  { label: 'InputText', href: '#' },
  { label: 'Variants', href: '#' },
  { label: 'Filled', href: '#' },
  { label: 'Outlined' },
];

/* The gated trail. A breadcrumb is a path, so a denied crumb truncates it
   rather than closing a gap: what follows was reached THROUGH the denied
   one, and showing it would describe a route this user has no way to walk. */
const bcGated: CrumbItem[] = [
  { label: 'Events', href: '#' },
  { label: 'Reports', href: '#', can: 'reports' },
  { label: 'Settings', href: '#', can: 'settings' },
  { label: 'Audit log' },
];

/* ── ApexContextMenu page ──────────────────────── */
const ctxLog = ref('');
const ctxGlobal = ref(false);
const ctxRow = ref('');
const ctxRowLog = ref('');

/* Every zone is right-clicked, so each needs its own element to bind to. */
const ctxBasic = ref<HTMLElement | null>(null);
const ctxSub = ref<HTMLElement | null>(null);
const ctxRowsEl = ref<HTMLElement | null>(null);
const ctxTpl = ref<HTMLElement | null>(null);
const ctxLinks = ref<HTMLElement | null>(null);
const ctxGate = ref<HTMLElement | null>(null);

const CTX_ITEMS: MenuItem[] = [
  { label: 'Cut', icon: 'content_cut', hint: '\u2318X' },
  { label: 'Copy', icon: 'content_copy', hint: '\u2318C' },
  { label: 'Paste', icon: 'content_paste', hint: '\u2318V' },
  { label: 'Rename', icon: 'edit' },
  { separator: true },
  { label: 'Delete', icon: 'delete' },
];

const CTX_NESTED: MenuItem[] = [
  { header: 'Edit' },
  { label: 'Cut', icon: 'content_cut', hint: '\u2318X' },
  { label: 'Copy', icon: 'content_copy', hint: '\u2318C' },
  { separator: true },
  { header: 'Share' },
  { label: 'Share', icon: 'share', items: [
    { label: 'Copy link', icon: 'link' },
    { label: 'Email', icon: 'mail' },
    { label: 'More\u2026', icon: 'more_horiz', items: [
      { label: 'Slack', icon: 'chat' },
      { label: 'Teams', icon: 'groups' },
    ] },
  ] },
  { label: 'Add to favourites', icon: 'bookmark' },
  { label: 'Preview', icon: 'visibility' },
  { separator: true },
  { label: 'Delete', icon: 'delete' },
];

/* The gated model: deny `reports` and the Admin header goes with its rows. */
const ctxGated: MenuItem[] = [
  { label: 'Open', icon: 'folder_open' },
  { label: 'Export', icon: 'download', can: 'reports' },
  { separator: true },
  { header: 'Admin' },
  { label: 'Settings', icon: 'settings', can: 'settings' },
  { label: 'Delete', icon: 'delete', can: { action: 'delete', resource: 'events' } },
];

/* ── ApexDock page ─────────────────────────────── */
const dockPos = ref('bottom');
const dockLog = ref('');
const dockDialog = ref(false);
const dockWall = ref<HTMLElement | null>(null);

const DOCK_ITEMS: MenuItem[] = [
  { icon: 'folder', label: 'Finder' },
  { icon: 'terminal', label: 'Terminal' },
  { icon: 'apps', label: 'App Store' },
  { icon: 'explore', label: 'Safari' },
  { icon: 'photo_library', label: 'Photos' },
  { icon: 'delete', label: 'Trash' },
];

/** A plain action beside two slots that fan, which is the section's point. */
const DOCK_MIXED: MenuItem[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'add', label: 'New', items: [
    { icon: 'description', label: 'Document' },
    { icon: 'table_chart', label: 'Spreadsheet' },
    { icon: 'slideshow', label: 'Deck' },
  ] },
  { icon: 'share', label: 'Share', items: [
    { icon: 'link', label: 'Copy link' },
    { icon: 'mail', label: 'Email' },
  ] },
  { icon: 'settings', label: 'Settings' },
];

/** `tint` is not a dock prop — it rides along for the item slot to read. */
const DOCK_TILES: MenuItem[] = [
  { icon: 'draw', label: 'Design', tint: '#0B5FFF' },
  { icon: 'code', label: 'Code', tint: '#137C4A' },
  { icon: 'insights', label: 'Analytics', tint: '#C24A06' },
  { icon: 'more_horiz', label: 'More', tint: '#5F6C7E', items: [
    { icon: 'bug_report', label: 'Issues', tint: '#C41E1E' },
    { icon: 'science', label: 'Labs', tint: '#7C3AED' },
  ] },
];

/* One item opens a dialog. The dock does not own it — it calls the callback. */
const DOCK_DESK = computed<MenuItem[]>(() => [
  { icon: 'folder', label: 'Finder' },
  { icon: 'terminal', label: 'Terminal' },
  { icon: 'info', label: 'About', command: () => { dockDialog.value = true; } },
  { icon: 'add', label: 'New', items: [
    { icon: 'description', label: 'Document' },
    { icon: 'folder', label: 'Folder' },
    { icon: 'terminal', label: 'Shell' },
  ] },
  { icon: 'delete', label: 'Trash' },
]);

/* The gated strip for the Permissions section. */
const dockGated: MenuItem[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'bar_chart', label: 'Reports', can: 'reports' },
  { icon: 'settings', label: 'Settings', can: 'settings' },
  { icon: 'delete', label: 'Trash', can: { action: 'delete', resource: 'events' } },
];

/* ── ApexMegaMenu page ─────────────────────────── */
const megaLog = ref('');
const megaTrigger = ref<'hover' | 'click'>('hover');
const megaQuery = ref('');

/**
 * A gradient placeholder as a data URI, the gallery's helper.
 *
 * The image examples need real artwork to mean anything, and the docs ship no
 * binaries — so the thumbnails are generated SVG. Pass real URLs in
 * `column.image` and `card.image`; nothing about the component changes.
 */
function ph(a: string, b: string, label?: string): string {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
    + `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>`
    + '</linearGradient></defs><rect width="320" height="240" fill="url(#g)"/>'
    + (label ? `<text x="160" y="128" text-anchor="middle" font-family="sans-serif" font-size="20"`
      + ` fill="rgba(255,255,255,.92)">${label}</text>` : '')
    + '</svg>';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const MEGA_BASIC: MegaItem[] = [
  { label: 'Furniture', icon: 'chair', columns: [
    { header: 'Living room', items: [{ label: 'Accessories', href: '#' }, { label: 'Armchair', href: '#' }, { label: 'Coffee table', href: '#' }, { label: 'Couch', href: '#' }] },
    { header: 'Kitchen', items: [{ label: 'Bar stool', href: '#' }, { label: 'Chair', href: '#' }, { label: 'Table', href: '#' }, { label: 'Cookware', href: '#' }] },
    { header: 'Bedroom', items: [{ label: 'Bed', href: '#' }, { label: 'Chaise longue', href: '#' }, { label: 'Cupboard', href: '#' }, { label: 'Dresser', href: '#' }] },
    { header: 'Office', items: [{ label: 'Bookcase', href: '#' }, { label: 'Desk', href: '#' }, { label: 'Executive chair', href: '#' }, { label: 'Lamp', href: '#' }] },
  ] },
  { label: 'Electronics', icon: 'devices', columns: [
    { header: 'Computer', items: [{ label: 'Monitor', href: '#' }, { label: 'Mouse', href: '#' }, { label: 'Notebook', href: '#' }, { label: 'Keyboard', href: '#' }] },
    { header: 'Home theatre', items: [{ label: 'Projector', href: '#' }, { label: 'Speakers', href: '#' }, { label: 'TVs', href: '#' }] },
    { header: 'Gaming', items: [{ label: 'Accessories', href: '#' }, { label: 'Console', href: '#' }, { label: 'PC', href: '#' }, { label: 'Video games', href: '#' }] },
  ] },
  { label: 'Sports', icon: 'sports_soccer', columns: [
    { header: 'Football', items: [{ label: 'Kits', href: '#' }, { label: 'Shoes', href: '#' }, { label: 'Shorts', href: '#' }, { label: 'Training', href: '#' }] },
    { header: 'Running', items: [{ label: 'Accessories', href: '#' }, { label: 'Shoes', href: '#' }, { label: 'T-shirts', href: '#' }, { label: 'Shorts', href: '#' }] },
    { header: 'Swimming', items: [{ label: 'Kickboard', href: '#' }, { label: 'Nose clip', href: '#' }, { label: 'Swimsuits', href: '#' }, { label: 'Paddles', href: '#' }] },
    { header: 'Tennis', items: [{ label: 'Balls', href: '#' }, { label: 'Rackets', href: '#' }, { label: 'Shoes', href: '#' }, { label: 'Training', href: '#' }] },
  ] },
  { label: 'Pricing', icon: 'sell', href: '#' },
];

const MEGA_IMAGES: MegaItem[] = [
  { label: '3 Stripe Life', columns: [
    { header: "What's new?", image: ph('#3A3F47', '#0F141C', 'Campaign'), items: [
      { label: 'Impossible is Nothing', href: '#' }, { label: 'New arrivals', href: '#' },
      { label: 'Best sellers', href: '#' }, { label: 'Release dates', href: '#' }] },
    { header: 'Collaborations', image: ph('#8A6F5A', '#3B2E24', 'IVY PARK'), items: [
      { label: 'IVY PARK', href: '#' }, { label: 'Pharrell', href: '#' },
      { label: 'Prada', href: '#' }, { label: 'Y-3', href: '#' }] },
    { header: 'Our world', image: ph('#E4E7EC', '#B6C0CD', 'Sustainability'), items: [
      { label: 'Give back', href: '#' }, { label: 'Sustainability', href: '#' },
      { label: 'Futurecraft', href: '#' }, { label: 'adiClub', href: '#' }] },
    { header: 'Sports', image: ph('#2F6B3A', '#12331B', 'Football'), items: [
      { label: 'Football', href: '#' }, { label: 'Running', href: '#' },
      { label: 'Basketball', href: '#' }, { label: 'Outdoor', href: '#' }] },
    { header: 'Originals', image: ph('#EDEFF3', '#CBD3DE', 'Superstar'), items: [
      { label: 'Superstar', href: '#' }, { label: 'Samba', href: '#' },
      { label: 'Gazelle', href: '#' }, { label: 'Stan Smith', href: '#' }] },
  ] },
  { label: 'Men', href: '#' },
  { label: 'Women', href: '#' },
  { label: 'Sale', href: '#' },
];

const MEGA_CARDS: MegaItem[] = [
  { label: 'Recipes', columns: [
    { span: 1, header: 'Collections', items: [
      { label: 'Easter', href: '#' }, { label: 'Family dinners', href: '#' },
      { label: 'Spring entertaining', href: '#' }, { label: 'Healthy', href: '#' },
      { label: 'Baking', href: '#' }], footer: { label: 'See all recipes', href: '#' } },
    { span: 3, header: 'Trending recipes', layout: 'cards', items: [
      { label: 'Stuffed lemon-poppy seed scones', image: ph('#E8C170', '#B98A2E'), href: '#' },
      { label: 'BLT bean salad', image: ph('#7FA35B', '#3D5A2A'), href: '#' },
      { label: 'The best baked salmon', image: ph('#E08A6B', '#A24B2E'), href: '#' },
      { label: 'Frittata with asparagus', image: ph('#E3B95C', '#8C6A1F'), href: '#' },
    ] },
  ] },
  { label: 'Shows', href: '#' },
  { label: 'Chefs', href: '#' },
  { label: 'Shop', href: '#' },
];

const MEGA_PROMO: MegaItem[] = [
  { label: 'Solutions', columns: [
    { header: 'By capability', items: [
      { label: 'Chemistry', help: 'Powerful cleaning formulations', icon: 'science', href: '#' },
      { label: 'Equipment', help: 'Delivering exceptional performance', icon: 'precision_manufacturing', href: '#' },
      { label: 'Digital tech', help: 'Embracing the future', icon: 'memory', href: '#' },
      { label: 'Service', help: 'For our direct-to-market regions', icon: 'support_agent', href: '#' },
      { label: 'Distribution', help: 'More solutions we stand behind', icon: 'local_shipping', href: '#' },
    ], footer: { label: 'See all chemistry products', href: '#' } },
    { header: 'By market', items: [
      { label: 'Food service', href: '#' }, { label: 'Food processing', href: '#' },
      { label: 'Agriculture', href: '#' }, { label: 'Automotive', href: '#', badge: 'New' },
    ] },
  ], panel: {
    image: ph('#0B5FFF', '#062E7A', 'Featured'),
    title: 'Autolux Concentrates',
    text: 'A single line of concentrates across the whole wash bay, mixed on site.',
    linkLabel: 'Explore the range', href: '#',
    cards: [
      { label: 'Autolux', help: 'Concentrates', image: ph('#7A1F1F', '#3A0D0D'), href: '#' },
      { label: 'TurtleWax Pro', help: 'Retail line', image: ph('#1F5F3A', '#0C2E1C'), href: '#' },
      { label: 'Private label', help: 'Your brand', image: ph('#3A3F47', '#14181F'), href: '#' },
      { label: 'Custom blending', help: 'To spec', image: ph('#2D5A7A', '#122A3B'), href: '#' },
    ],
  } },
  { label: 'Markets', href: '#' },
  { label: 'Resources', href: '#' },
  { label: 'Contact', href: '#' },
];

/*
 * The gated bar: a denied root item takes its whole panel, a denied column
 * goes from the panel that keeps its siblings, and a denied link goes from
 * its column — three levels, one rule.
 */
const megaGated: MegaItem[] = [
  { label: 'Catalogue', icon: 'inventory_2', columns: [
    { header: 'Public', items: [
      { label: 'Events', href: '#' },
      { label: 'Venues', href: '#' },
    ] },
    { header: 'Internal', can: 'reports', items: [
      { label: 'Sales', href: '#' },
      { label: 'Attendance', href: '#' },
    ] },
  ] },
  { label: 'Administration', icon: 'shield', can: 'settings', columns: [
    { header: 'Access', items: [{ label: 'Users', href: '#' }, { label: 'Roles', href: '#' }] },
  ] },
  { label: 'Support', icon: 'help', href: '#' },
];

/* ── ApexMenu page ────────────────────────────── */
const vmCtl = ref<InstanceType<typeof ApexMenu> | null>(null);
const vmPop = ref<InstanceType<typeof ApexMenu> | null>(null);
const vmGate = ref<InstanceType<typeof ApexMenu> | null>(null);
const vmPicked = ref('');
const vmRadio = ref('recent');
const vmChecks = ref<Record<string, boolean>>({ paid: true });
const vmKeys = ref<Record<string, boolean>>({ reports: true });
const vmGateKeys = ref<Record<string, boolean>>({});

const vmBasic: MenuItem[] = [
  { key: 'main', label: 'Workspace', items: [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Events', icon: 'event', badge: '4' },
    { label: 'Venues', icon: 'place' },
  ] },
  { separator: true },
  { key: 'account', label: 'Account', items: [
    { label: 'Profile', icon: 'person', help: 'Name, email, password' },
    { label: 'Sign out', icon: 'logout' },
  ] },
];

/* `kind` is the demo's own field, read by the item slot. MenuItem carries an
   index signature, so anything the caller puts on a row reaches the slot. */
const vmChoice: MenuItem[] = [
  { key: 'filters', label: 'Filters', items: [
    { key: 'paid', label: 'Paid', kind: 'check' },
    { key: 'comp', label: 'Complimentary', kind: 'check' },
    { key: 'refunded', label: 'Refunded', kind: 'check' },
  ] },
  { separator: true },
  { key: 'sort', label: 'Sort by', items: [
    { key: 'recent', label: 'Most recent', kind: 'radio' },
    { key: 'name', label: 'Name', kind: 'radio' },
  ] },
];

/* Both defaults overridden: a top-level group that collapses, and a nested one
   left open as a plain label. */
const vmToggle: MenuItem[] = [
  { key: 'reports', label: 'Reports', toggleable: true, items: [
    { label: 'Sales', icon: 'payments' },
    { label: 'Attendance', icon: 'groups' },
    { key: 'exports', label: 'Exports', toggleable: false, items: [
      { label: 'CSV' },
      { label: 'PDF' },
    ] },
  ] },
  { key: 'admin', label: 'Administration', toggleable: true, items: [
    { label: 'Users', icon: 'person' },
    { label: 'Roles', icon: 'shield' },
  ] },
];

const vmRouter: MenuItem[] = [
  { key: 'nav', label: 'Navigation', items: [
    { label: 'Overview', icon: 'home', href: '#overview' },
    { label: 'Events', icon: 'event', href: '#events', active: true },
    { label: 'Docs', icon: 'open_in_new', href: 'https://example.com/docs', target: '_blank' },
  ] },
  { separator: true },
  { key: 'actions', label: 'Actions', items: [
    { label: 'Refresh', icon: 'refresh', command: () => { vmPicked.value = 'Refresh (its own command ran first)'; } },
  ] },
];

/*
 * Gated, and written so expandAll() tells the story: Reports is a toggleable
 * group whose children are gated, so for a role without them the group goes and
 * its key never reaches expandedKeys.
 */
const vmGated: MenuItem[] = [
  { key: 'main', label: 'Workspace', items: [
    { label: 'Dashboard', icon: 'dashboard' },
    { label: 'Settings', icon: 'settings', can: 'settings' },
  ] },
  { key: 'reports', label: 'Reports', toggleable: true, items: [
    { label: 'Sales', can: 'reports' },
    { label: 'Attendance', can: 'reports' },
  ] },
  { key: 'admin', label: 'Administration', toggleable: true, can: 'settings', items: [
    { label: 'Users' },
  ] },
];

/* ── ApexMenubar page ────────────────────────────────────── */
const mbPicked = ref('');

const mbBasic: MenuItem[] = [
  { label: 'File', icon: 'folder', items: [
    { label: 'New', icon: 'note_add', hint: '⌘N' },
    { label: 'Open', icon: 'folder_open' },
    { separator: true },
    { label: 'Export', icon: 'download', items: [{ label: 'PDF' }, { label: 'CSV' }] },
  ] },
  { label: 'Edit', icon: 'edit', items: [
    { label: 'Undo', hint: '⌘Z' },
    { label: 'Redo', hint: '⇧⌘Z' },
    { separator: true },
    { header: 'Clipboard' },
    { label: 'Copy', icon: 'content_copy' },
    { label: 'Paste', icon: 'content_paste', disabled: true },
  ] },
  { label: 'Help', icon: 'help', href: '#' },
];

const mbCommand: MenuItem[] = [
  { label: 'Actions', icon: 'bolt', items: [
    { label: 'Publish', icon: 'publish', command: () => { mbPicked.value = 'Publish (its own command ran first)'; } },
    { label: 'Archive', icon: 'archive' },
  ] },
  { label: 'Docs', icon: 'open_in_new', href: 'https://example.com/docs', target: '_blank' },
];

/*
 * Gated at both levels: Settings is a denied child, Admin a denied root item,
 * and Reports a root item whose children are all denied — so it goes with them
 * rather than dropping an empty panel.
 */
const mbGated: MenuItem[] = [
  { label: 'File', icon: 'folder', items: [
    { label: 'New', icon: 'note_add' },
    { label: 'Settings', icon: 'settings', can: 'settings' },
  ] },
  { label: 'Admin', icon: 'shield', can: 'settings', items: [{ label: 'Users' }] },
  { label: 'Reports', icon: 'bar_chart', items: [
    { label: 'Sales', can: 'reports' },
    { label: 'Attendance', can: 'reports' },
  ] },
];

/* ── ApexTieredMenu page ─────────────────────────────────── */
const tmPop = ref<InstanceType<typeof ApexTieredMenu> | null>(null);
const tmPop2 = ref<InstanceType<typeof ApexTieredMenu> | null>(null);
const tmPicked = ref('');

const tmBasic: MenuItem[] = [
  { label: 'New file', icon: 'note_add', hint: '⌘N' },
  { label: 'Open recent', icon: 'history', items: [
    { label: 'invoice-2024.pdf' },
    { label: 'contract.docx' },
    { separator: true },
    { label: 'Clear list', icon: 'delete_sweep' },
  ] },
  { separator: true },
  { header: 'Share' },
  { label: 'Email', icon: 'mail' },
  { label: 'Export', icon: 'download', items: [
    { label: 'PDF' }, { label: 'CSV' },
    { label: 'Print…', icon: 'print', hint: '⌘P' },
  ] },
  { separator: true },
  { label: 'Delete', icon: 'delete', disabled: true },
];

/* Carries a `count` the item slot renders as a badge — the slot replaces the
   row's contents, so anything on the item is available to it. */
const tmTemplate: MenuItem[] = [
  { label: 'Inbox', icon: 'inbox', count: 12 },
  { label: 'Drafts', icon: 'edit_note', count: 3 },
  { label: 'Folders', icon: 'folder', items: [
    { label: 'Clients', count: 8 },
    { label: 'Archive', count: 240 },
  ] },
  { separator: true },
  { label: 'Trash', icon: 'delete' },
];

const tmCommand: MenuItem[] = [
  { label: 'Save', icon: 'save', command: () => { tmPicked.value = 'Save (its own command ran first)'; } },
  { label: 'Documentation', icon: 'open_in_new', href: 'https://example.com/docs', target: '_blank' },
  { separator: true },
  { label: 'More', icon: 'more_horiz', items: [
    { label: 'Duplicate', icon: 'content_copy' },
    { label: 'Archive', icon: 'archive' },
  ] },
];

/*
 * The gated model. Every `can` here is resolved through the same docsCan the
 * whole page uses, so the role switch drives it rather than a local flag.
 *
 * Written so the cascade is visible: deny `reports` and the branch goes with
 * its children, which leaves the Admin header labelling nothing and the rules
 * around it framing a gap — so those go too.
 */
const tmGated: MenuItem[] = [
  { label: 'Open', icon: 'folder_open' },
  { label: 'Export', icon: 'download', can: { action: 'export', resource: 'events' } },
  { separator: true },
  { header: 'Admin' },
  { label: 'Settings', icon: 'settings', can: 'settings' },
  { label: 'Reports', icon: 'bar_chart', items: [
    { label: 'Sales', can: 'reports' },
    { label: 'Attendance', can: 'reports' },
  ] },
];

const povBasic = ref<InstanceType<typeof ApexPopover> | null>(null);
const povCtl = ref<InstanceType<typeof ApexPopover> | null>(null);
const povShared = ref<InstanceType<typeof ApexPopover> | null>(null);
const povPlace = ref<InstanceType<typeof ApexPopover> | null>(null);
const povRich = ref<InstanceType<typeof ApexPopover> | null>(null);
/** The Controlled example's outside state, shown live next to the buttons. */
const povOn = ref(false);
/** Which row the shared popover is currently describing. */
const povRow = ref(CITIES[0]);
const povSide = ref<'top' | 'bottom' | 'left' | 'right'>('bottom');

/** ApexDrawer's four examples. */
const drwPos = ref<'left' | 'right' | 'top' | 'bottom' | 'full'>('left');
const drwEx = ref(false);
const drwResp = ref(false);
const drwTpl = ref(false);
const drwFloat = ref(false);
const drwHeadless = ref(false);
/** The Template example's form — real controls, so the drawer holds a surface. */
const drwForm = reactive({ name: '', zone: null as unknown, notes: '' });

/**
 * ApexDialog's two examples.
 *
 * `dlgPos` doubles as the open state: null is closed, and any position both
 * opens the dialog and places it, so the nine buttons need no separate flag.
 */
const dlgPos = ref<string | null>(null);
const dlgDrag = ref(false);
const dlgTimer = ref(false);

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
              <component v-if="entry.demo === 'plain'" :is="entry.name" v-bind="live">
                <!-- Only for the controls that are a box around content; the
                     rest pass nothing and render from props alone. -->
                <template v-if="entry.slotText">{{ entry.slotText }}</template>
              </component>

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

              <!-- An overlay renders nothing until something opens it, so the
                   stage supplies the trigger. OverlayStage holds all three. -->
              <OverlayStage
                v-else-if="entry.demo === 'overlay'"
                :id="entry.id"
                :bind="live"
              />

              <!-- A menu needs a model to be worth looking at, and one of them
                   renders nothing at all until a trigger opens it. MenuStage
                   holds the shape each one needs. -->
              <MenuStage
                v-else-if="entry.demo === 'menu'"
                :id="entry.id"
                :bind="live"
              />

              <!-- A comparison, a carousel and a gallery each need their own
                   shape of host — see MediaStage. -->
              <!-- One series would leave stackMode and the legend inert, so the
                   chart's stage carries two. -->
              <ChartStage
                v-else-if="entry.demo === 'chart'"
                :bind="live"
              />

              <!-- A board with no items, columns or lanes is an empty frame with a
                   rail of inert controls, every one of them apparently dead. -->
              <BoardStage
                v-else-if="entry.demo === 'board'"
                :bind="live"
              />

              <MediaStage
                v-else-if="entry.demo === 'media'"
                :id="entry.id"
                :bind="live"
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

          <h2>Permissions</h2>
          <p class="note">
            A row carrying <code>can</code> is hidden from anyone the resolver denies, and
            the removals cascade — a section header left labelling nothing goes with its
            rows, and the rule that framed them collapses. Nothing is greyed out: a command
            you may not run is not a command you should have to read past.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexSplitButton label="Save" :model="[
  { label: 'Export', can: 'reports' },
  { header: 'Admin' },
  { label: 'Settings', can: 'settings' },
  { label: 'Delete', can: { action: 'delete', resource: 'events' } },
]" /&gt;</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div class="card iconstrip">
            <ApexSplitButton label="Save" icon="check" :model="splitGated" @item-click="onMenuClick" />
          </div>
          <p class="note">
            As the Viewer only <em>Save as…</em> is left, and the header and separator that
            framed the rest have gone with it.
          </p>

          <h2>Permissions — the default action</h2>
          <p class="note">
            The primary action is not part of the model, so denying every row still leaves a
            working button. That is the behaviour you want when Save is allowed and only the
            extras are not — the filter must never take away the thing the button is for.
          </p>
          <p class="note">
            The chevron stays as well, and opens onto an empty menu. It is the one place in
            the family where a doorway to nothing survives the filter, because the toggle
            belongs to the button rather than to the model — hide it with a
            <code>v-if</code> if an empty menu would confuse the role that sees it.
          </p>
          <div class="card iconstrip">
            <ApexSplitButton label="Save" icon="check" :model="splitAllDenied" @item-click="onMenuClick" />
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

          <h2>Permissions</h2>
          <p class="note">
            The dial takes the same <code>can</code> as the menus, resolved through the same
            seam. Its list is flat, so there is no cascade to watch — what there is instead
            is geometry: the offsets are computed from the filtered list, so the remaining
            actions fan at their own spacing rather than leaving holes where the denied ones
            would have sat.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexSpeedDial :items="[
  { icon: 'edit', label: 'Edit' },
  { icon: 'download', label: 'Export', can: 'reports' },
  { icon: 'delete', label: 'Delete', can: { action: 'delete', resource: 'events' } },
]" type="circle" /&gt;</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <!-- data-gated marks the demo the docs guard reads, so it does not have to
               guess which dial on the page is the gated one. -->
          <div class="grid grid--2" data-gated>
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">type="circle"</span>
              <ApexSpeedDial :items="dialGated" type="circle" :radius="82" tooltip />
            </div>
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">type="linear"</span>
              <ApexSpeedDial :items="dialGated" type="linear" direction="up" tooltip />
            </div>
          </div>
          <p class="note">
            Open both as the Admin and again as the Viewer: four actions become one, and the
            one sits where the first of four did. A dial that kept the gaps would tell the
            user something had been taken away, which is the opposite of hiding it.
          </p>

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

        <!-- Ported from the gallery, four sections. The prose is the gallery's;
             the code snippet is not, because its useApexConfirm().require()
             was replaced by the alert service in AF2-186 and would no longer
             run. A snippet that cannot be pasted is worse than none. -->
        <template v-if="entry.id === 'confirmpopup'">
          <h2>Basic</h2>
          <p class="note">
            Pass the click event as <code>target</code> and the popup anchors to whatever was
            clicked. That <code>target</code> is also what routes the request here — the same
            call without one opens the alert instead.
          </p>
          <pre class="doc-pre" v-pre>const alert = useApexAlert();

function save(event) {
  alert.confirm({
    target: event,            // anchors here, and routes to ApexConfirmPopup
    message: 'Are you sure you want to proceed?',
    icon: 'warning',
    accept: () =&gt; form.submit(),
  });
}</pre>
          <div class="iconstrip" style="margin-top: 14px">
            <ApexButton
              severity="secondary"
              variant="outlined"
              @click="askConfirm({ target: $event, message: 'Are you sure you want to proceed?', icon: 'warning' })"
            >Save</ApexButton>
            <ApexButton
              severity="danger"
              icon="delete"
              @click="askConfirm({ target: $event, message: 'Delete this record?', icon: 'delete', iconColor: '#C41E1E', acceptLabel: 'Delete', acceptSeverity: 'danger' })"
            >Delete</ApexButton>
          </div>
          <p class="msg-event">Last outcome: <code>{{ cfmLog || 'none yet' }}</code></p>

          <h2>Placement</h2>
          <p class="note">
            A preferred <code>side</code> and <code>align</code>, but the popup flips to the
            opposite side when the preferred one will not hold it, then shifts along the cross
            axis to stay on screen. Try the edge buttons — several will flip.
          </p>
          <div class="cpop-grid" style="margin-top: 12px">
            <ApexButton
              v-for="s in (['top', 'bottom', 'left', 'right'] as const)"
              :key="s"
              size="sm"
              severity="secondary"
              variant="outlined"
              @click="askConfirm({ target: $event, message: `side='${s}'`, icon: 'my_location', side: s })"
            >{{ s }}</ApexButton>
            <ApexButton
              v-for="a in (['start', 'center', 'end'] as const)"
              :key="a"
              size="sm"
              severity="secondary"
              variant="text"
              @click="askConfirm({ target: $event, message: `align='${a}'`, icon: 'align_horizontal_left', align: a })"
            >align {{ a }}</ApexButton>
          </div>
          <div class="cpop-edges" style="margin-top: 14px">
            <ApexButton
              size="sm"
              severity="secondary"
              variant="outlined"
              @click="askConfirm({ target: $event, message: 'Flipped upward — no room below.', icon: 'swap_vert', side: 'bottom' })"
            >Near the bottom edge</ApexButton>
            <ApexButton
              size="sm"
              severity="secondary"
              variant="outlined"
              class="cpop-edges__right"
              @click="askConfirm({ target: $event, message: 'Shifted back on screen, arrow still on target.', icon: 'swap_horiz', side: 'bottom', align: 'start' })"
            >Near the right edge</ApexButton>
          </div>

          <h2>Template</h2>
          <p class="note">
            The <code>message</code> slot replaces the icon and text while keeping the popup's
            frame and buttons.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              severity="secondary"
              variant="outlined"
              icon="inventory_2"
              @click="askConfirm({ group: 'tpl', target: $event, acceptLabel: 'Archive', rejectLabel: 'Keep' })"
            >Custom message</ApexButton>
          </div>
          <ApexConfirmPopup group="tpl" width="260px">
            <template #message>
              <div class="cpop-tpl">
                <ApexAvatar label="Lobby totem" size="sm" auto-color />
                <div>
                  <strong>Archive this display?</strong>
                  <span>It stops playing immediately and moves to the archive.</span>
                </div>
              </div>
            </template>
          </ApexConfirmPopup>

          <h2>Headless</h2>
          <p class="note">
            A <code>container</code> slot replaces the entire popup. It receives
            <code>accept</code> and <code>reject</code>, so your own controls still resolve the
            request.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              severity="secondary"
              variant="outlined"
              icon="dashboard_customize"
              @click="askConfirm({ group: 'cpop-headless', target: $event })"
            >Open headless</ApexButton>
          </div>
          <ApexConfirmPopup group="cpop-headless" width="240px">
            <template #container="{ accept, reject }">
              <div class="cpop-headless">
                <p>Move this item to the bin?</p>
                <button type="button" class="cpop-headless__go" @click="accept">
                  <ApexIcon name="delete" :size="17" /> Move to bin
                </button>
                <button type="button" class="cpop-headless__no" @click="reject">Not now</button>
              </div>
            </template>
          </ApexConfirmPopup>
        </template>

        <!-- Ported from the gallery, nine sections. None of these sets a url:
             with none the selection itself is the result, so every demo is
             live without a server behind it. Custom upload is the exception
             and stubs its own handler. -->
        <template v-if="entry.id === 'fileupload'">
          <h2>Basic</h2>
          <p class="note">
            One button, and the chosen file beside it. <code>maxFileSize</code> is the size
            limit in bytes — a file over it is rejected with a message, and the limit doubles as
            the hint.
          </p>
          <div class="card fu-card" style="margin-top: 12px">
            <ApexFileUpload mode="basic" :max-file-size="1048576" choose-label="Choose file" />
          </div>

          <h2>Auto</h2>
          <p class="note">
            With <code>auto</code> a file is sent the moment it is chosen. With no
            <code>url</code>, as here, the selection itself is the result — which is what a form
            posting files alongside its own fields wants.
          </p>
          <div class="card fu-card" style="margin-top: 12px">
            <ApexFileUpload mode="basic" auto choose-label="Upload now" :max-file-size="2097152" />
          </div>

          <h2>Advanced</h2>
          <p class="note">
            The button row, the drop area and the file list, with per-file status and a progress
            bar while a request is in flight. Drag files onto the area or click to browse.
          </p>
          <div class="card fu-card fu-card--wide" style="margin-top: 12px">
            <ApexFileUpload multiple :max-file-size="5242880" :max-files="6" accept="image/*,.pdf" />
          </div>
          <p class="msg-event">
            Limits above: <code>maxFileSize: 5242880</code> (5 MB each), <code>maxFiles: 6</code>,
            <code>accept: "image/*,.pdf"</code>.
          </p>

          <h2>Validation</h2>
          <p class="note">
            Three independent limits, each with its own message template — <code>{name}</code>,
            <code>{limit}</code> and <code>{max}</code> are filled in. Try a large file, or a type
            outside <code>accept</code>.
          </p>
          <div class="grid grid--2" style="margin-top: 12px">
            <div class="cell">
              <span class="cell__tag">maxFileSize: 51200 (50 KB)</span>
              <ApexFileUpload multiple :max-file-size="51200" empty-label="Drop something small" />
            </div>
            <div class="cell">
              <span class="cell__tag">maxTotalSize: 204800 (200 KB)</span>
              <ApexFileUpload multiple :max-total-size="204800" hint="200 KB across the selection" />
            </div>
          </div>

          <h2>Button styling</h2>
          <p class="note">
            The three built-in buttons are ApexButtons, so each takes its own severity and
            variant — plus a shared <code>buttonSize</code> and <code>buttonsRounded</code>.
            Replace them outright with the <code>header</code> slot when the row itself needs to
            change.
          </p>
          <div class="grid grid--2" style="margin-top: 12px">
            <div class="cell">
              <span class="cell__tag">success / danger, all solid</span>
              <ApexFileUpload
                multiple
                :max-file-size="2097152"
                :dropzone="false"
                choose-severity="success"
                upload-severity="success"
                cancel-severity="danger"
                cancel-variant="outlined"
                upload-variant="solid"
              />
            </div>
            <div class="cell">
              <span class="cell__tag">contrast, outlined, rounded, sm</span>
              <ApexFileUpload
                multiple
                :max-file-size="2097152"
                :dropzone="false"
                choose-severity="contrast"
                choose-variant="outlined"
                upload-severity="info"
                cancel-severity="secondary"
                button-size="sm"
                buttons-rounded
              />
            </div>
            <div class="cell">
              <span class="cell__tag">warning solid, lg</span>
              <ApexFileUpload
                multiple
                :max-file-size="2097152"
                :dropzone="false"
                choose-severity="warning"
                upload-severity="warning"
                upload-variant="outlined"
                cancel-severity="warning"
                button-size="lg"
              />
            </div>
            <div class="cell">
              <span class="cell__tag">basic mode, danger</span>
              <ApexFileUpload
                mode="basic"
                :max-file-size="2097152"
                choose-severity="danger"
                upload-severity="danger"
                choose-label="Attach file"
              />
            </div>
          </div>

          <h2>Custom upload</h2>
          <p class="note">
            With <code>customUpload</code> the control emits <code>uploader</code> instead of
            sending anything. You get the files, a <code>clear</code> and a
            <code>setProgress</code> — so an S3 signature, a chunked upload or an Inertia post all
            fit.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexFileUpload custom-upload multiple @uploader="send" /&gt;

async function send({ files, clear, setProgress }) {
  for (const [i, file] of files.entries()) {
    await put(file);
    setProgress(Math.round(((i + 1) / files.length) * 100));
  }
  clear();
}</pre>
          <div class="card fu-card fu-card--wide" style="margin-top: 12px">
            <ApexFileUpload custom-upload multiple @uploader="fuCustom" />
          </div>
          <p class="msg-event">Handler: <code>{{ fuCustomLog || 'idle' }}</code></p>

          <h2>Dropzone</h2>
          <p class="note">
            The <code>empty</code> slot owns the drop area's content, and <code>content</code>
            replaces the list — here a compact one built from <code>removeFileCallback</code>.
          </p>
          <div class="card fu-card fu-card--wide" style="margin-top: 12px">
            <ApexFileUpload multiple :show-buttons="false" accept="image/*" :max-file-size="2097152">
              <template #empty>
                <ApexIcon name="backup" :size="40" class="fu-drop__icon" />
                <strong>Drop files here</strong>
                <em>or click to browse</em>
              </template>
              <template #content="{ files, removeFileCallback, chooseCallback, formatSize }">
                <div v-if="files.length" class="fu-chips">
                  <span v-for="(f, i) in files" :key="i" class="fu-chip">
                    <img v-if="f.preview" :src="f.preview" :alt="f.file.name" />
                    <b>{{ f.file.name }}</b><em>{{ formatSize(f.file.size) }}</em>
                    <button type="button" aria-label="Remove" @click="removeFileCallback(i)">
                      <ApexIcon name="close" :size="15" />
                    </button>
                  </span>
                  <ApexButton size="sm" variant="text" icon="add" @click="chooseCallback()">Add more</ApexButton>
                </div>
              </template>
            </ApexFileUpload>
          </div>

          <h2>Image preview</h2>
          <p class="note">
            <code>layout="grid"</code> lays the selection out as thumbnails, with the remove
            button appearing on hover. The <code>header</code> slot replaces the button row.
          </p>
          <div class="card fu-card fu-card--wide" style="margin-top: 12px">
            <ApexFileUpload
              multiple
              accept="image/*"
              layout="grid"
              :preview-size="96"
              :max-file-size="5242880"
            >
              <template #header="{ files, chooseCallback, uploadCallback, clearCallback }">
                <div class="apex-fu__bar">
                  <ApexButton severity="secondary" variant="outlined" icon="add" @click="chooseCallback()">
                    Add images
                  </ApexButton>
                  <ApexButton v-if="files.length" icon="upload" @click="uploadCallback()">Upload all</ApexButton>
                  <ApexButton v-if="files.length" variant="text" severity="secondary" @click="clearCallback()">
                    Clear
                  </ApexButton>
                </div>
              </template>
            </ApexFileUpload>
          </div>

          <h2>In a form</h2>
          <p class="note">
            <code>v-model</code> binds the selection as a plain <code>File[]</code>, so the
            uploader sits in a form like any other control.
          </p>
          <div class="card fu-form" style="margin-top: 12px">
            <ApexInput v-model="fuTitle" label="Document title" placeholder="Q3 report" />
            <ApexFileUpload v-model="fuFiles" multiple :max-file-size="5242880" empty-label="Attachments" />
            <p class="fu-bound">Bound value: <code>{{ fuFiles.length }}</code> file(s)</p>
          </div>
        </template>

        <!-- Ported from the gallery, three sections. -->
        <template v-if="entry.id === 'dynamicdialog'">
          <h2>The service</h2>
          <p class="note">
            Mount one <code>&lt;ApexDynamicDialog /&gt;</code> in the app shell and open any
            component from anywhere. The caller keeps no visible state, and the component it
            opens needs no dialog markup.
          </p>
          <pre class="doc-pre" v-pre>import { useApexDialog } from '@exorgroup/apex-ui';
import CityPicker from './CityPicker.vue';

const dialog = useApexDialog();

function pickCity() {
  dialog.open(CityPicker, {
    props: { header: 'Pick a city', width: '380px' },
    data: { cities },
    onClose({ data }) { if (data) selected.value = data; },
  });
}</pre>

          <h2>Passing data, and returning a value</h2>
          <p class="note">
            The loaded component injects <code>dialogRef</code>: it reads what it was opened
            with, and returns a value by closing with it. Whatever it passes reaches
            <code>onClose</code> — after the leave transition, so the caller never sees a
            half-closed dialog.
          </p>
          <pre class="doc-pre" v-pre>const dialogRef = inject('dialogRef');
const cities = dialogRef.data.cities;

function pick(city) {
  dialogRef.close(city);   // → onClose({ data: city })
}</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton icon="open_in_new" @click="openDynamic()">Select a city</ApexButton>
            <ApexButton
              severity="secondary"
              variant="outlined"
              icon="layers"
              @click="openDynamic('nested')"
            >Open over a dialog</ApexButton>
          </div>
          <p class="msg-event">Last outcome: <code>{{ dynLog || 'none yet' }}</code></p>

          <h2>Stacking</h2>
          <p class="note">
            Every <code>open()</code> pushes an instance, each with its own options and
            z-index — base 1000, ten per level — so a picker over a form is ordinary.
            <code>closeAll()</code> clears the stack, e.g. on a route change.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton severity="secondary" variant="outlined" size="sm" @click="dialog.closeAll()">
              closeAll()
            </ApexButton>
          </div>
        </template>

        <!-- Ported from the gallery, eight sections. Each demo that needs its
             own container gives it a group, so its toasts cannot land in the
             app-root host or in another section's stack. -->
        <template v-if="entry.id === 'toast'">
          <h2>Service</h2>
          <p class="note">
            Mount one <code>ApexToast</code> in the app shell; every <code>add()</code> call
            anywhere in the app lands in it, so a caller announces something without owning any
            visible state. <code>add()</code> returns the toast's id, which is what makes
            <code>update()</code> and <code>remove()</code> safe when several are in flight.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              size="sm"
              @click="toast.add({ severity: 'success', summary: 'Saved', detail: 'Your changes are live.' })"
            >Show a toast</ApexButton>
            <ApexButton size="sm" severity="secondary" variant="outlined" @click="toast.removeAll()">
              Clear all
            </ApexButton>
          </div>

          <h2>Severity</h2>
          <p class="note">
            The same six severities as ApexMessage, each with its tint and default icon.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="s in (['success', 'info', 'warn', 'error', 'secondary', 'contrast'] as const)"
              :key="s"
              size="sm"
              variant="outlined"
              severity="secondary"
              @click="fireToast(s)"
            >{{ s }}</ApexButton>
          </div>

          <h2>Timed close</h2>
          <p class="note">
            Every toast dismisses itself after <code>life</code> milliseconds — 3000 by default,
            or set it per message. <code>showTimer</code> draws the countdown. Hovering the stack
            pauses every timer, since a toast that vanishes under the cursor is a toast you were
            about to read.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              size="sm"
              variant="outlined"
              severity="secondary"
              @click="toast.add({ severity: 'info', summary: 'One second', life: 1000 })"
            >life 1000</ApexButton>
            <ApexButton
              size="sm"
              variant="outlined"
              severity="secondary"
              @click="toast.add({ severity: 'info', summary: 'Eight seconds', detail: 'Hover me to hold it open.', life: 8000, showTimer: true })"
            >life 8000 with timer</ApexButton>
          </div>

          <h2>Sticky</h2>
          <p class="note">
            <code>sticky</code> overrides the life entirely — the toast waits for the user or for
            a <code>remove()</code>. Use it for anything needing a decision, or for a loading
            state.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              size="sm"
              variant="outlined"
              severity="secondary"
              @click="toast.add({ severity: 'warn', summary: 'Sticky', detail: 'This one waits for you.', sticky: true })"
            >Show a sticky toast</ApexButton>
          </div>

          <h2>Promise</h2>
          <p class="note">
            A sticky loading toast, then <code>update()</code> in place when the task settles —
            the same toast becomes the result rather than a second one appearing beside it.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton size="sm" @click="runToastTask(true)">Task that succeeds</ApexButton>
            <ApexButton size="sm" severity="danger" variant="outlined" @click="runToastTask(false)">
              Task that fails
            </ApexButton>
          </div>

          <h2>Position</h2>
          <p class="note">
            Seven positions. Bottom stacks grow upward, so the newest is always nearest the edge.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="p in TOAST_POSITIONS"
              :key="p"
              size="sm"
              variant="text"
              @click="toastPos = p; toast.add({ group: 'posdemo', severity: 'info', summary: p, detail: `Positioned at ${p}.` })"
            >{{ p }}</ApexButton>
          </div>
          <ApexToast group="posdemo" :position="toastPos" />

          <h2>Expanded and stacked</h2>
          <p class="note">
            <code>expanded</code> lays every toast out in a column. <code>stacked</code> keeps the
            newest in front with the rest peeking behind it, and fans the pile out on hover —
            useful when a burst of messages would otherwise fill the screen. Timers pause while
            the pile is hovered in either mode.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexSwitch v-model="toastStacked" label="Stacked mode" />
            <ApexButton size="sm" variant="outlined" severity="secondary" @click="burstToasts()">
              Send five at once
            </ApexButton>
          </div>
          <ApexToast
            group="stackdemo"
            :mode="toastStacked ? 'stacked' : 'expanded'"
            position="bottom-right"
            :life="9000"
          />

          <h2>Custom content and actions</h2>
          <p class="note">
            The <code>actions</code> slot keeps the default toast and adds to it; the
            <code>message</code> slot replaces it outright. Both receive the message and its
            <code>close</code> function, so a button can act and dismiss in one go.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              size="sm"
              variant="outlined"
              severity="secondary"
              @click="toast.add({ group: 'actiondemo', severity: 'info', summary: 'File deleted', detail: 'report-q3.pdf', sticky: true })"
            >Toast with an action</ApexButton>
            <ApexButton
              size="sm"
              variant="outlined"
              severity="secondary"
              @click="toast.add({ group: 'customdemo', severity: 'success', summary: 'Upload complete', data: { file: 'assets.zip', size: '4.2 MB' }, sticky: true })"
            >Fully custom toast</ApexButton>
          </div>
          <p class="msg-event">Last action: <code>{{ toastLog || 'none yet' }}</code></p>
          <ApexToast group="actiondemo" position="top-center">
            <template #actions="{ message, close }">
              <ApexButton
                size="sm"
                variant="text"
                @click="toastLog = `undo ${message.detail}`; close()"
              >Undo</ApexButton>
            </template>
          </ApexToast>
          <ApexToast group="customdemo" position="bottom-center" width="320px">
            <template #message="{ message, close }">
              <div class="toast-custom">
                <ApexIcon name="folder_zip" :size="26" class="toast-custom__icon" />
                <div class="toast-custom__body">
                  <strong>{{ message.summary }}</strong>
                  <span>{{ uploadInfo(message).file }} · {{ uploadInfo(message).size }}</span>
                  <ApexProgressBar :value="100" class="toast-custom__bar" />
                </div>
                <ApexButton size="sm" variant="text" icon="close" aria-label="Dismiss" @click="close()" />
              </div>
            </template>
          </ApexToast>
        </template>

        <!-- Ported from the gallery, eight sections. -->
        <template v-if="entry.id === 'message'">
          <h2>Severity</h2>
          <p class="note">Six severities, each with its own tint and default icon.</p>
          <div class="msg-stack" style="margin-top: 12px">
            <ApexMessage severity="success" closable>Your account is now ready.</ApexMessage>
            <ApexMessage severity="info" closable>Upgrade now and save 5%.</ApexMessage>
            <ApexMessage severity="warn" closable>Your subscription is about to expire.</ApexMessage>
            <ApexMessage severity="error" closable>Something went wrong.</ApexMessage>
            <ApexMessage severity="secondary" closable>Processing may take a few moments.</ApexMessage>
            <ApexMessage severity="contrast" closable>You are currently in offline mode.</ApexMessage>
          </div>

          <h2>Variant</h2>
          <p class="note">
            <code>outlined</code> keeps the page behind it; <code>simple</code> drops the frame
            entirely, which is what belongs under a field.
          </p>
          <div class="grid grid--2" style="margin-top: 12px">
            <div class="cell">
              <span class="cell__tag">outlined</span>
              <div class="msg-stack">
                <ApexMessage
                  v-for="s in (['success', 'info', 'warn', 'error'] as const)"
                  :key="s"
                  :severity="s"
                  variant="outlined"
                  closable
                >{{ MSG_TEXT[s] }}</ApexMessage>
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">simple</span>
              <div class="msg-stack">
                <ApexMessage
                  v-for="s in (['success', 'info', 'warn', 'error'] as const)"
                  :key="s"
                  :severity="s"
                  variant="simple"
                  closable
                >{{ MSG_TEXT[s] }}</ApexMessage>
              </div>
            </div>
          </div>

          <h2>Icon</h2>
          <p class="note">
            Override with the <code>icon</code> prop, remove it with an empty string, or replace
            it outright with the <code>icon</code> slot — an avatar, an image, a spinner.
          </p>
          <div class="msg-stack msg-narrow" style="margin-top: 12px">
            <ApexMessage severity="warn" icon="receipt_long">Your subscription is about to expire.</ApexMessage>
            <ApexMessage severity="info" icon="">No icon at all.</ApexMessage>
            <ApexMessage severity="info">
              <template #icon><ApexAvatar label="Amy Elsner" size="sm" /></template>
              How may I help you?
            </ApexMessage>
            <ApexMessage severity="secondary">
              <template #icon><ApexIcon name="progress_activity" spin :size="18" /></template>
              Processing may take a few moments.
            </ApexMessage>
          </div>

          <h2>Sizes</h2>
          <div class="msg-stack msg-narrow" style="margin-top: 12px">
            <ApexMessage
              v-for="s in (['sm', 'md', 'lg'] as const)"
              :key="s"
              :size="s"
              severity="success"
              closable
            >Size {{ s }} — your account is now ready.</ApexMessage>
          </div>

          <h2>Blur</h2>
          <p class="note">
            <code>blur</code> frosts whatever sits behind the message — the dialog's mask blur
            applied to an inline surface. It implies <code>translucent</code>, since a solid tint
            has nothing to show through; pass a number or CSS length for the radius. Useful over
            imagery or a busy panel.
          </p>
          <div class="msg-glass" style="margin-top: 12px">
            <div class="msg-stack">
              <ApexMessage severity="success" blur closable>Frosted at the default 8px.</ApexMessage>
              <ApexMessage severity="warn" :blur="16" closable>A heavier 16px blur.</ApexMessage>
              <ApexMessage severity="contrast" blur closable>Contrast severity, translucent and frosted.</ApexMessage>
              <ApexMessage severity="info" translucent closable>Translucent with no blur.</ApexMessage>
            </div>
          </div>

          <h2>Closable and life</h2>
          <p class="note">
            <code>closable</code> adds the dismiss button; <code>life</code> dismisses after n
            milliseconds, with <code>showTimer</code> for a countdown bar.
            <code>v-model:visible</code> means a dismissed message can be brought back.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              size="sm"
              severity="secondary"
              variant="outlined"
              @click="restartMsgLife()"
            >Show a timed message</ApexButton>
            <ApexButton size="sm" variant="text" @click="msgManual = true">Restore the dismissed one</ApexButton>
          </div>
          <div class="msg-stack msg-narrow" style="margin-top: 12px">
            <ApexMessage
              v-model:visible="msgLife"
              severity="info"
              :life="4000"
              show-timer
              closable
              @life-end="msgLog = 'life ended'"
            >Gone in four seconds.</ApexMessage>
            <ApexMessage
              v-model:visible="msgManual"
              severity="success"
              closable
              @close="msgLog = 'dismissed'"
            >Dismiss me, then restore me.</ApexMessage>
          </div>
          <p class="msg-event">Last event: <code>{{ msgLog || 'none yet' }}</code></p>

          <h2>Dynamic</h2>
          <p class="note">
            Nothing special is needed for a list — a <code>v-for</code> over your own array, each
            message closing itself out of it.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton size="sm" @click="addMsg()">Add message</ApexButton>
            <ApexButton size="sm" severity="secondary" variant="outlined" @click="msgList = []">Clear</ApexButton>
          </div>
          <div class="msg-stack msg-narrow" style="margin-top: 12px">
            <ApexMessage
              v-for="m in msgList"
              :key="m.id"
              :severity="m.severity"
              closable
              @close="msgList = msgList.filter((x) => x.id !== m.id)"
            >{{ m.text }}</ApexMessage>
          </div>

          <h2>In a form</h2>
          <p class="note">
            The <code>simple</code> variant under a field is the validation case — the same
            component, no frame.
          </p>
          <div class="card msg-form" style="margin-top: 12px">
            <ApexInput v-model="msgEmail" label="Email address" placeholder="you@company.com" />
            <ApexMessage v-if="!msgEmail" severity="error" variant="simple" size="sm">
              An email address is required.
            </ApexMessage>
            <ApexMessage v-else severity="success" variant="simple" size="sm">Looks good.</ApexMessage>
          </div>
        </template>

        <!-- Ported from the gallery, five sections. The popover is reached
             through its ref throughout, which is how it is meant to be used —
             so each example declares its own ref rather than sharing one. -->
        <!--
          The gallery's seven, ported. Each is a real application shell: the
          panel only means anything beside the content it pushes, and the
          demos I wrote instead were toys that made the control look broken.
        -->
        <!-- The gallery's six, ported. -->
        <!-- The gallery's thirteen, ported. -->
        <!-- ApexChart, sections 1-26: the line and area half of the
             gallery's 66. Ported verbatim; the datasets are in chartData.ts. -->
        <template v-if="entry.id === 'chart'">
      <h2>Basic</h2>
      <p style="font-size:13.5px">A line connects points to show a trend. <code>xKey</code> and <code>yKey</code> name the properties to read, so app data is never reshaped to suit the chart. Note the y domain: a line does not force a zero baseline, because forcing one flattens the shape the chart exists to show.</p>
      <div class="cht-frame">
        <ApexChart :series="[{ id: 'activation', name: 'Activated', data: CHT_TRIAL, xKey: 'month', yKey: 'value' }]"
                    :legend="{ show: false }" height="300" />
      </div>

      <h2>Area</h2>
      <p style="font-size:13.5px"><code>fillOpacity</code> fills the region beneath the line — <code>0</code> draws only the line, anything above it makes an area. An area <em>is</em> a line with a fill, so there is no separate type; and because a fill implies magnitude from a baseline, the y domain now includes zero on its own.</p>
      <div class="cht-frame">
        <ApexChart :series="[{ id: 'revenue', name: 'Revenue', data: CHT_REVENUE, xKey: 'month', yKey: 'value', fillOpacity: 0.22 }]"
                    :legend="{ show: false }" curve="smooth" height="300" />
      </div>

      <h2>Multiple series and the palette</h2>
      <p style="font-size:13.5px">Series colours resolve from tokens — <code>--apex-cht-series-1</code> through <code>8</code>, eight hues at one lightness and chroma so no series shouts louder than its neighbours. A hundred charts restyle at once, and dark mode costs nothing. Click a legend entry to hide that series.</p>
      <div class="cht-frame">
        <ApexChart :series="CHT_CHANNELS" :legend="{ position: 'bottom' }" height="320"
                    @legend-toggle="chtLog = $event.series + ($event.hidden ? ' hidden' : ' shown')" />
      </div>
      <p style="font-size:13px;margin-top:8px">{{ chtLog || 'Nothing toggled yet' }}</p>

      <h2>Curve types</h2>
      <p style="font-size:13.5px"><code>smooth</code> is monotone cubic and never overshoots, so it cannot invent a peak that is not in the data. <code>spline</code> is Catmull-Rom with a <code>tension</code> knob for a looser curve. The step variants draw discrete transitions, which is what state and threshold data actually did.</p>
      <div class="grid grid--2" style="margin-top:12px">
        <div v-for="c in ['linear','smooth','spline','step','step-before','step-after']" :key="c" class="cell">
          <span class="cell__tag">{{ c }}</span>
          <ApexChart :series="[{ id: c, name: c, data: CHT_SHAPE, xKey: 'hour', yKey: 'value', showMarkers: true }]"
                      :curve="c" :tension="0.6" :legend="{ show: false }"
                      :x-axis="{ ticks: false }" :y-axis="{ ticks: false, grid: false }" height="140" />
        </div>
      </div>

      <h2>Null handling</h2>
      <p style="font-size:13.5px">A <code>null</code> breaks the line by default, because real data has holes and a chart that silently interpolates across them lies. <code>connect</code> bridges the gap; <code>zero</code> reads nulls as zero, which is only honest when zero is a real value rather than missing data.</p>
      <div class="grid grid--3" style="margin-top:12px">
        <div v-for="n in ['gap','connect','zero']" :key="n" class="cell">
          <span class="cell__tag">{{ n }}</span>
          <ApexChart :series="[{ id: n, name: n, data: CHT_GAPPY, xKey: 'month', yKey: 'value', showMarkers: true }]"
                      :connect-nulls="n" :legend="{ show: false }" height="170" />
        </div>
      </div>

      <h2>Scales</h2>
      <p style="font-size:13.5px">Four scale types, each with its own tick generator rather than one generic algorithm — nice ticks for numbers want powers of ten, for time they want calendar boundaries that are not uniform in length. Axis label widths are measured, not estimated, so the plot rect is right and labels rotate or cull only when they would collide.</p>
      <div class="grid grid--2" style="margin-top:12px">
        <div class="cell"><span class="cell__tag">time — 90 days</span>
          <ApexChart :series="[{ id: 'daily', name: 'Sessions', data: CHT_DAILY, xKey: 'date', yKey: 'value', fillOpacity: 0.16 }]"
                      :x-axis="{ type: 'time' }" :legend="{ show: false }" height="220" />
        </div>
        <div class="cell"><span class="cell__tag">log — four decades</span>
          <ApexChart :series="[{ id: 'growth', name: 'Requests', data: CHT_LOG, xKey: 'month', yKey: 'value' }]"
                      :y-axis="{ type: 'log' }" :legend="{ show: false }" height="220" />
        </div>
        <div class="cell"><span class="cell__tag">long category labels — rotated automatically</span>
          <ApexChart :series="[{ id: 'regions', name: 'Deployments', data: CHT_REGIONS, xKey: 'region', yKey: 'value', fillOpacity: 0.18 }]"
                      :legend="{ show: false }" height="250" />
        </div>
        <div class="cell"><span class="cell__tag">two y axes — different units</span>
          <ApexChart :series="CHT_WEATHER" :y-axis="{ label: 'Temperature (°C)' }"
                      :y2-axis="{ label: 'Rainfall (mm)' }" curve="smooth"
                      :legend="{ position: 'bottom' }" height="250" />
        </div>
      </div>

      <h2>Animation</h2>
      <p style="font-size:13.5px">Animation is interpolation between two datasets, matched per point key — so a removed point collapses and a new one grows, rather than the series being replaced. Entrance is the same code with a synthetic previous frame at the baseline, which is why no separate entrance animation exists. Swap the dataset and watch the line move rather than flicker.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexButton size="sm" @click="chtSwap()">Swap dataset</ApexButton>
        <ApexButton size="sm" severity="secondary" variant="outlined" @click="chtAddPoint()">Append a point</ApexButton>
        <ApexButton size="sm" variant="text" @click="chtDropPoint()">Remove one</ApexButton>
      </div>
      <div class="cht-frame">
        <ApexChart :series="chtSeries" :legend="{ position: 'bottom' }" curve="smooth" height="300" />
      </div>

      <h2>Entrance</h2>
      <p style="font-size:13.5px">A line or area sweeps into view as though drawn, once, when the chart is actually on screen. It is a <em>reveal</em> rather than a value interpolation: a drawn line has to show its real shape as it appears, where interpolating toward it would move the whole curve — a different gesture, and the one <code>grow</code> still gives you. One clip sweeps the plot, so the fill, the markers and the labels are uncovered along with the line.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexSelectButton v-model="chtEntrance" :options="['draw','grow','none']" size="sm" />
        <ApexButton size="sm" severity="secondary" variant="outlined" icon="replay"
                     @click="chtReplay += 1">Replay</ApexButton>
        <span style="font-size:13px;color:var(--fg-subtle)">Reduced-motion users get it instantly.</span>
      </div>
      <div class="grid grid--2" style="margin-top:12px">
        <div class="cell"><span class="cell__tag">area</span>
          <ApexChart :key="'ent-a-' + chtReplay + chtEntrance" :entrance="chtEntrance"
                      :series="[{ id: 'r', name: 'Revenue', data: CHT_REVENUE, xKey: 'month', yKey: 'value', fillOpacity: 0.22 }]"
                      curve="smooth" :legend="{ show: false }" height="260" />
        </div>
        <div class="cell"><span class="cell__tag">multi-series with markers</span>
          <ApexChart :key="'ent-b-' + chtReplay + chtEntrance" :entrance="chtEntrance"
                      :series="CHT_CHANNELS" :show-markers="true" curve="smooth"
                      :legend="{ position: 'bottom' }" height="260" />
        </div>
      </div>

      <h2>Decimation</h2>
      <p style="font-size:13.5px">50,000 points. LTTB downsamples to roughly two per pixel before drawing, preserving spikes where stride sampling and averaging would flatten them — and because it runs before the renderer choice, most large datasets never need canvas at all. Hit testing still uses the full-resolution array, so the tooltip reports the point under the cursor rather than a neighbour.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexSwitch v-model="chtDecimate" label="Decimation" />
        <ApexSelectButton v-model="chtRenderer" :options="['auto','svg','canvas']" size="sm" />
        <span style="font-size:13px;color:var(--fg-subtle)">Drawn vertices: <code>{{ chtDrawn }}</code> of 50,000</span>
        <ApexButton size="sm" variant="text" @click="chtCount">Recount</ApexButton>
      </div>
      <div class="cht-frame">
        <ApexChart ref="chtBig" :series="[{ id: 'signal', name: 'Signal', data: CHT_BIG, xKey: 'i', yKey: 'v' }]"
                    :x-axis="{ type: 'linear' }" :decimation="chtDecimate" :renderer="chtRenderer"
                    :legend="{ show: false }" :animation="false" height="300" />
      </div>

      <h2>Stacked area</h2>
      <p style="font-size:13.5px"><code>stackMode</code> stacks series sharing a <code>stack</code> id. It is computed across the series list rather than per series, because stacking is a relationship <em>between</em> series — which is also why the same code will serve stacked bars unchanged. <code>percent</code> normalizes each category to 100.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexSelectButton v-model="chtStack" :options="['none','normal','percent']" size="sm" />
      </div>
      <div class="cht-frame">
        <ApexChart :series="CHT_STACK" :stack-mode="chtStack" curve="smooth"
                    :legend="{ position: 'bottom' }" height="320" />
      </div>

      <h2>Range area</h2>
      <p style="font-size:13.5px"><code>y0Key</code> gives a point its lower edge, so the fill becomes a band rather than a fill to zero. A range area, a confidence interval and a stacked slice are the same primitive — a fill between two values — so there is one code path, not three.</p>
      <div class="cht-frame">
        <ApexChart :series="[
                      { id: 'band', name: 'Forecast range', data: CHT_BAND, xKey: 'month', yKey: 'high', y0Key: 'low', fillOpacity: 0.2, lineStrokeWidth: 0 },
                      { id: 'actual', name: 'Actual', data: CHT_BAND, xKey: 'month', yKey: 'mid' }
                    ]" curve="smooth" :legend="{ position: 'bottom' }" height="300" />
      </div>

      <h2>Segment styling</h2>
      <p style="font-size:13.5px">Each of <code>segmentColor</code>, <code>segmentStrokeWidth</code>, <code>segmentDash</code> and <code>segmentFillColor</code> takes a static value or a callback on the two endpoints; returning <code>undefined</code> falls back to the series default. Tangents come from the whole run before it is cut into pieces, so a styled segment keeps its curve. This is the case people otherwise fake with three overlapping series.</p>
      <div class="grid grid--2" style="margin-top:12px">
        <div class="cell"><span class="cell__tag">trend colours — rising green, falling red</span>
          <ApexChart :series="[{ id: 'trend', name: 'Price', data: CHT_TREND, xKey: 'month', yKey: 'value',
                        showMarkers: true, segmentColor: chtTrendColor }]"
                      :legend="{ show: false }" height="240" />
        </div>
        <div class="cell"><span class="cell__tag">forecast — dashed past the boundary</span>
          <ApexChart :series="[{ id: 'fc', name: 'Bookings', data: CHT_TRIAL, xKey: 'month', yKey: 'value',
                        fillOpacity: 0.14, segmentDash: chtForecastDash, segmentColor: chtForecastColor }]"
                      curve="smooth" :legend="{ show: false }" height="240" />
        </div>
      </div>

      <h2>Line border</h2>
      <p style="font-size:13.5px"><code>borderColor</code> paints a halo behind the line, wider than the line itself. It is what keeps a series legible where it crosses an area fill or another series — compare the two panels.</p>
      <div class="grid grid--2" style="margin-top:12px">
        <div class="cell"><span class="cell__tag">no halo</span>
          <ApexChart :series="CHT_CROSSING" curve="smooth" :legend="{ show: false }" height="240" />
        </div>
        <div class="cell"><span class="cell__tag">halo</span>
          <ApexChart :series="CHT_CROSSING_HALO" curve="smooth" :legend="{ show: false }" height="240" />
        </div>
      </div>

      <h2>Gradients</h2>
      <p style="font-size:13.5px">Pass an object to <code>color</code>: <code>{ x1, y1, x2, y2, stops }</code> in normalized plot coordinates. A gradient gets two definitions rather than one, because along a stroke it reads as progression through time while under a fill it reads as fading toward the baseline — so the defaults differ, horizontal for strokes and vertical for fills.</p>
      <div class="cht-frame">
        <ApexChart :series="CHT_GRADIENT" curve="smooth" :legend="{ position: 'bottom' }" height="300" />
      </div>

      <h2>Markers</h2>
      <p style="font-size:13.5px">Six shapes, with <code>pointRotation</code> to turn them and <code>markerSize</code> for the radius. Markers appear automatically at 40 points or fewer, because 500 markers in 600px is noise.</p>
      <div class="cht-frame">
        <ApexChart :series="CHT_SHAPES" :legend="{ position: 'bottom' }" :marker-size="5" height="300" />
      </div>

      <h2>Line styling</h2>
      <p style="font-size:13.5px"><code>lineStrokeWidth</code>, <code>lineDash</code> with <code>lineDashOffset</code>, and <code>lineCap</code> / <code>lineJoin</code> for endings and corners. Also per-series <code>curve</code>, so one chart can mix a smooth actual with a straight target.</p>
      <div class="cht-frame">
        <ApexChart :series="CHT_STYLES" :legend="{ position: 'bottom' }" height="300" />
      </div>

      <h2>Data labels</h2>
      <p style="font-size:13.5px">Collisions are culled, not overlapped: endpoints and local extremes survive first, so a dense series degrades to its readable points rather than a smear. <code>sparse</code> keeps only those; <code>collision: false</code> draws everything if you want to see why culling exists.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexSelectButton v-model="chtLabels" :options="['culled','sparse','all']" size="sm" />
      </div>
      <div class="cht-frame">
        <ApexChart :series="[{ id: 'dense', name: 'Sessions', data: CHT_DAILY.slice(0, 45), xKey: 'date', yKey: 'value', fillOpacity: 0.14 }]"
                    :x-axis="{ type: 'time' }" curve="smooth" :legend="{ show: false }"
                    :data-labels="chtLabelSpec" height="300" />
      </div>

      <h2>Hover</h2>
      <p style="font-size:13.5px">One <code>hover</code> object rather than nine top-level props with overlapping names: <code>brightness</code>, <code>dimOpacity</code> to fade the series you are not on, <code>radiusMultiplier</code>, and colour overrides for the active point.</p>
      <div class="cht-frame">
        <ApexChart :series="CHT_CHANNELS" :hover="{ dimOpacity: 0.25, radiusMultiplier: 2.4, brightness: 1.15 }"
                    curve="smooth" :legend="{ position: 'bottom' }" height="300" />
      </div>

      <h2>Export</h2>
      <p style="font-size:13.5px">SVG, PNG and CSV. Each returns a string or a blob rather than triggering a download, because the filename and where it goes are the application's business. The SVG export resolves custom properties to literal colours — a standalone file has no design system to look them up in.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexButton size="sm" severity="secondary" variant="outlined" icon="code" @click="chtExport('svg')">Export SVG</ApexButton>
        <ApexButton size="sm" severity="secondary" variant="outlined" icon="image" @click="chtExport('png')">Export PNG</ApexButton>
        <ApexButton size="sm" variant="text" icon="table_view" @click="chtExport('csv')">Export CSV</ApexButton>
      </div>
      <div class="cht-frame">
        <ApexChart ref="chtExp" title="Revenue by month" :series="[{ id: 'revenue', name: 'Revenue', data: CHT_REVENUE, xKey: 'month', yKey: 'value', fillOpacity: 0.2 }]"
                    curve="smooth" :legend="{ show: false }" height="280" />
      </div>
      <img v-if="chtPng" :src="chtPng" alt="Exported chart" style="max-width:340px;margin-top:10px;border:1px solid var(--border-default);border-radius:8px" />
      <pre v-if="chtOut" class="doc-pre" style="margin-top:10px;max-height:200px;overflow:auto">{{ chtOut }}</pre>

      <h2>Zoom and pan</h2>
      <p style="font-size:13.5px">Wheel to zoom about the cursor — the value under the pointer is the one you care about, so it stays put. Drag to rubber-band a range, shift-drag to pan, pinch on touch. Zooming re-decimates <em>within the window</em>, so 50,000 points reveal real detail rather than a magnified approximation, and the y domain follows the window so a zoomed trace does not sit in a domain sized by data off screen.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexButton size="sm" severity="secondary" variant="outlined" icon="zoom_out_map"
                     @click="chtZoom.resetZoom()">Reset zoom</ApexButton>
        <span style="font-size:13px;color:var(--fg-subtle)">{{ chtZoomLabel }}</span>
      </div>
      <div class="cht-frame">
        <ApexChart ref="chtZoom" :series="[{ id: 'signal', name: 'Signal', data: CHT_BIG, xKey: 'i', yKey: 'v', fillOpacity: 0.12 }]"
                    :x-axis="{ type: 'linear' }" zoom :legend="{ show: false }" :animation="false"
                    height="320" @zoom-change="chtOnZoom" />
      </div>

      <h2>Navigator</h2>
      <p style="font-size:13.5px">A mini overview with a draggable window: drag the middle to pan, the edges to resize. It always draws the full extent — that is its whole job — so it keeps its own scales rather than the zoomed ones, and what it dims is what you are <em>not</em> looking at.</p>
      <div class="cht-frame">
        <ApexChart :series="[{ id: 'daily', name: 'Sessions', data: CHT_DAILY, xKey: 'date', yKey: 'value', fillOpacity: 0.16 }]"
                    :x-axis="{ type: 'time' }" zoom navigator curve="smooth"
                    :legend="{ show: false }" height="300" />
      </div>

      <h2>Reference lines and bands</h2>
      <p style="font-size:13.5px">Bands paint under the gridlines and lines over them — a band is background, a threshold line is a statement about the data. A value can be a category name rather than an index, so a marker on "Aug" follows August wherever it moves to.</p>
      <div class="cht-frame">
        <ApexChart :series="[{ id: 'mrr', name: 'MRR', data: CHT_REVENUE, xKey: 'month', yKey: 'value' }]"
                    curve="smooth" :legend="{ show: false }" height="300"
                    :reference-bands="[{ from: 15000, to: 22000, label: 'Healthy range' }]"
                    :reference-lines="[
                      { value: 20000, label: 'Target', color: 'var(--accent-primary)', dash: '6 4' },
                      { axis: 'x', value: 'Jul', label: 'H2 start' }
                    ]" />
      </div>

      <h2>Annotations</h2>
      <p style="font-size:13.5px">The <code>annotation</code> slot receives the plot rect and both mapping functions, so custom content is placed in data coordinates rather than pixels you have to work out. It is ordinary SVG, which is the reason to render in SVG at all.</p>
      <div class="cht-frame">
        <ApexChart :series="[{ id: 'trial', name: 'Activated', data: CHT_TRIAL, xKey: 'month', yKey: 'value', fillOpacity: 0.14 }]"
                    curve="smooth" :legend="{ show: false }" height="300">
          <template #annotation="{ plot, x, y }">
            <line :x1="x(4)" :y1="y(53)" :x2="x(4)" :y2="plot.y + 26" stroke="var(--fg-subtle)" stroke-width="1" />
            <circle :cx="x(4)" :cy="y(53)" r="5" fill="none" stroke="var(--fg-default)" stroke-width="1.5" />
            <rect :x="x(4) - 52" :y="plot.y + 8" width="104" height="18" rx="4" fill="var(--fg-default)" />
            <text :x="x(4)" :y="plot.y + 21" text-anchor="middle" font-size="10.5" font-weight="650"
                  fill="var(--bg-surface)">Pricing change</text>
          </template>
        </ApexChart>
      </div>

      <h2>Plugins</h2>
      <p style="font-size:13.5px">A plugin returns overlay primitives rather than drawing. Direct drawing would mean one implementation per renderer and plugins that only work in SVG; a declarative vocabulary paints identically through both and stays inspectable in the DOM. Four ship with the package.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexSwitch v-model="chtPlugWatermark" label="Watermark" />
        <ApexSwitch v-model="chtPlugTrend" label="Trendline" />
        <ApexSwitch v-model="chtPlugStats" label="Live stats" />
        <ApexSwitch v-model="chtPlugThreshold" label="Threshold bands" />
      </div>
      <div class="cht-frame">
        <ApexChart :series="CHT_CHANNELS" :plugins="chtPlugins" curve="smooth"
                    :legend="{ position: 'bottom' }" height="320" />
      </div>

      <h2>Synced charts</h2>
      <p style="font-size:13.5px"><code>ApexChartGroup</code> provides one store rather than relaying events between siblings, so a chart added later joins automatically and declaration order does not matter. Zoom on either chart, hover either one, or click a legend entry — all three channels are shared, and each can be switched off.</p>
      <div class="iconstrip" style="margin-top:12px">
        <ApexButton size="sm" severity="secondary" variant="outlined" @click="chtGroup.resetZoom()">Reset both</ApexButton>
        <span style="font-size:13px;color:var(--fg-subtle)">Drag on either plot to zoom both.</span>
      </div>
      <ApexChartGroup ref="chtGroup" style="margin-top:12px">
        <div class="cht-frame" style="margin-top:0">
          <ApexChart title="Sessions" :series="CHT_SYNC_A" :x-axis="{ type: 'time' }" zoom
                      curve="smooth" :legend="{ position: 'bottom' }" height="220" />
        </div>
        <div class="cht-frame">
          <ApexChart title="Errors" :series="CHT_SYNC_B" :x-axis="{ type: 'time' }" zoom navigator
                      curve="smooth" :legend="{ position: 'bottom' }" height="220" />
        </div>
      </ApexChartGroup>

      <h2>Legend, tooltip and toolbar</h2>
      <p style="font-size:13.5px">The <code>legend</code> and <code>tooltip</code> slots replace their contents while everything else stays the chart's. A computed total or a delta against a threshold cannot come out of a value formatter, which is why the tooltip is a slot and <code>format</code> stays for the simple case. The <code>toolbar</code> is off by default — it is the first piece of <em>application</em> chrome inside a chart, so a dashboard tile has to ask for it.</p>
      <div class="cht-frame">
        <ApexChart :series="CHT_RD" toolbar :legend="{ position: 'top' }" height="340"
                    :reference-lines="[{ value: 2.73, label: 'OECD average', labelPosition: 'end',
                                         color: 'var(--accent-danger)' }]">
          <template #legend="{ series, colors, toggle }">
            <button v-for="(s, i) in series" :key="s.id" type="button" class="cht-pill"
                    :data-off="s.hidden ? 'true' : 'false'" @click="toggle(s)">
              <span class="cht-pill__dot" :style="{ background: colors[i] }"></span>
              {{ s.name }}
              <em>avg {{ chtSeriesAvg(s) }}%</em>
            </button>
          </template>
          <template #tooltip="{ category, rows }">
            <span class="apex-cht__tip-title">{{ category }}</span>
            <span v-for="r in rows" :key="r.key" class="apex-cht__tip-row">
              <span class="apex-cht__swatch" :style="{ background: r.color }"></span>
              <span class="apex-cht__tip-name">{{ r.name }}</span><b>{{ r.value }}</b>
            </span>
            <span class="cht-tip-total">
              <span class="apex-cht__tip-name">Total</span>
              <b>{{ chtRowTotal(rows) }}</b>
              <em :data-up="chtRowTotal(rows) >= 2.73 ? 'true' : 'false'">
                {{ (chtRowTotal(rows) - 2.73).toFixed(2) }} vs avg
              </em>
            </span>
          </template>
        </ApexChart>
      </div>
      <p style="font-size:13px;margin-top:8px">Legend entries carry their own averages; the tooltip adds a computed total and a signed delta. Open the menu top-right to export.</p>
        </template>

        <template v-if="entry.id === 'taskboard'">
          <h2>Data binding</h2>
          <p class="note">
            The board reads a flat <code>items</code> array and emits every change. Nothing
            moves until the app applies the payload — here through a small history of
            its own, which is what <code>useApexTaskBoard()</code> packages. Drag a card, or
            focus one and press Ctrl with the arrow keys: both produce the same
            <code>card-move</code>.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexButton size="sm" severity="secondary" variant="outlined" icon="undo"
                        :disabled="!tbPast.length" @click="tbUndo">Undo</ApexButton>
            <ApexButton size="sm" severity="secondary" variant="outlined" icon="redo"
                        :disabled="!tbFuture.length" @click="tbRedo">Redo</ApexButton>
            <ApexButton size="sm" variant="text" @click="tbReset">Reset board</ApexButton>
            <span class="note">{{ tbLog || 'No moves yet' }}</span>
          </div>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbItems" :columns="TB_COLUMNS" :card-fields="TB_FIELDS"
                           selection-mode="multiple" height="420px" column-width="260px"
                           @card-move="tbMove" @card-activate="tbLog = 'opened ' + $event.item.title"
                           @selection-change="tbSel = $event.items.length" />
          </div>
          <p class="note" style="margin-top:8px">
            Selected: <code>{{ tbSel }}</code> — ctrl or cmd click to add to the selection,
            then drag any of them and the whole set moves.
          </p>

          <h2>Swimlanes</h2>
          <p class="note">
            Lanes group cards into horizontal rows over the same column model — the columns
            and their limits are unchanged, and a card's <code>swimlaneId</code> is the only
            difference in the data. Lane headers stay put as the board scrolls sideways.
          </p>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbOps" :columns="TB_OPS_COLUMNS" :swimlanes="TB_LANES"
                           :card-fields="TB_OPS_FIELDS" height="460px" column-width="230px"
                           lane-width="150px" density="compact"
                           @card-move="tbOps = applyMove(tbOps, $event); tbLog = 'moved to ' + $event.to.columnId" />
          </div>

          <h2>Column groups and pinned columns</h2>
          <p class="note">
            Phase headers sit above the columns, each spanning exactly its own.
            <code>pinned</code> sticks a column to an edge while the rest scrolls under it —
            the inset is resolved from the tracks before it, since sticky cannot measure them
            itself. Drag a header to reorder: <code>reorderableColumns</code> emits
            <code>column-reorder</code> and leaves the array to the app, like every other
            change.
          </p>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbPhase" :columns="tbPhaseColumns" :column-groups="TB_GROUPS"
                           :card-fields="TB_FIELDS" reorderable-columns height="420px" column-width="220px"
                           @card-move="tbPhase = applyMove(tbPhase, $event); tbLog = 'moved to ' + $event.to.columnId"
                           @column-reorder="tbReorder" />
          </div>
          <p class="note" style="margin-top:8px">
            Backlog is pinned to the start and Shipped to the end.
            {{ tbLog || 'Drag a column header to reorder the phases.' }}
          </p>

          <h2>Context menu</h2>
          <p class="note">
            The board emits <code>card-contextmenu</code> with the card and the event; the menu
            itself is the app's, so its items can be anything. Right-click a card.
          </p>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbMenuItems" :columns="[TB_COLUMNS[0], TB_COLUMNS[2], TB_COLUMNS[3]]"
                           :card-fields="TB_FIELDS" height="340px" column-width="240px"
                           @card-contextmenu="tbOpenMenu"
                           @card-move="tbMenuItems = applyMove(tbMenuItems, $event)" />
            <ApexContextMenu ref="tbMenu" :items="TB_MENU" />
          </div>
          <p class="note" style="margin-top:8px">Last action: <code>{{ tbMenuLog || 'none yet' }}</code></p>

          <h2>WIP limits and rules</h2>
          <p class="note">
            A column's <code>limit</code> warns when exceeded; <code>wipMode="block"</code>
            refuses the drop instead and emits <code>wip-blocked</code>. <code>allowedTo</code>
            restricts where cards may go from a column, and <code>locked</code> keeps them where
            they are — the drop indicator turns red before you release.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSwitch v-model="tbBlock" label="Block over the limit" />
            <span class="note">Ready holds 2; Shipped is locked; Review only accepts from Building.</span>
          </div>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbRules" :columns="TB_RULE_COLUMNS" :card-fields="TB_FIELDS"
                           :wip-mode="tbBlock ? 'block' : 'warn'" height="380px" column-width="240px"
                           @card-move="tbRules = applyMove(tbRules, $event); tbLog = 'moved'"
                           @wip-blocked="tbLog = 'refused — ' + $event.columnId + ' is at its limit'" />
          </div>

          <h2>Card fields</h2>
          <p class="note">
            The default card is driven by a mapping, so a dataset with different property names
            renders without a custom card. These two boards share one component and one dataset
            shape — only <code>cardFields</code> differs.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell"><span class="cell__tag">full anatomy</span>
              <ApexTaskBoard :items="tbItems.slice(0, 4)" :columns="[TB_COLUMNS[0], TB_COLUMNS[1]]"
                             :card-fields="TB_FIELDS" :show-add-card="false" column-width="210px" />
            </div>
            <div class="cell"><span class="cell__tag">title and points only</span>
              <ApexTaskBoard :items="tbItems.slice(0, 4)" :columns="[TB_COLUMNS[0], TB_COLUMNS[1]]"
                             :card-fields="{ title: 'title', meta: [{ key: 'points', icon: 'straighten' }] }"
                             :show-add-card="false" column-width="210px" />
            </div>
          </div>

          <h2>Permissions</h2>
          <p class="note">
            Rules are functions, not flags, because a real permission depends on the row rather
            than the board. Switch roles: a viewer sees no add controls and cannot drag; a
            contributor may move their own cards only, and the Shipped column disappears for
            them entirely — a column with a count of zero still advertises that it exists.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSelectButton v-model="tbRole" :options="['Admin', 'Contributor', 'Viewer']" />
            <span class="note">Contributor owns the cards assigned to Sarah Wilson.</span>
          </div>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbPermItems" :columns="TB_PERM_COLUMNS" :card-fields="TB_FIELDS"
                           :permissions="tbPermissions" reorderable-columns height="380px" column-width="230px"
                           @card-move="tbPermItems = applyMove(tbPermItems, $event); tbLog = 'moved'"
                           @card-activate="tbLog = 'opened ' + $event.item.title"
                           @add-card="tbLog = 'add card in ' + $event.columnId">
              <template #card="{ item, canDrag, canEdit }">
                <div style="display:flex;align-items:flex-start;gap:8px">
                  <div style="flex:1;min-width:0">
                    <ApexTaskCard :item="item" :fields="TB_FIELDS" />
                  </div>
                  <ApexIcon v-if="!canDrag || !canEdit" name="lock" :size="15" style="color:var(--fg-subtle)" />
                </div>
              </template>
            </ApexTaskBoard>
          </div>
          <p class="note" style="margin-top:8px">{{ tbLog || 'Try dragging a card that is not yours.' }}</p>
          <p class="note">
            This is the one control in the library that does not use the
            <code>can()</code> seam, and deliberately: the answer here depends on the row, there
            are six distinct verbs, and one of them — <code>canDelete</code> — the board
            only hands to your card, because it never deletes anything itself.
          </p>

          <h2>Guarded transitions</h2>
          <p class="note">
            <code>confirmMove</code> is asked before a move is emitted and can answer
            asynchronously, so a dialog or a server check decides — a synchronous guard could
            not. Drags and keyboard moves both go through it. Here anything entering Shipped
            needs confirming.
          </p>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbGuard" :columns="TB_GUARD_COLUMNS" :card-fields="TB_FIELDS"
                           :confirm-move="tbConfirm" height="360px" column-width="230px"
                           @card-move="tbGuard = applyMove(tbGuard, $event); tbLog = 'shipped'" />
          </div>
          <p class="note" style="margin-top:8px">Last decision: <code>{{ tbGuardLog || 'none yet' }}</code></p>

          <h2>Selection and keyboard</h2>
          <p class="note">
            Plain arrows rove focus so reading the board moves nothing; Ctrl or Cmd with the
            arrows moves the card. Shift-click extends a range within the card's own column —
            a board has no single sequence, so a range across columns would take in cards you
            cannot see between. Ctrl+A selects the focused column, Escape clears, and dragging
            any selected card brings the whole set.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexButton size="sm" severity="secondary" variant="outlined"
                        @click="tbSelBoard?.selectAll('ready')">Select the Ready column</ApexButton>
            <ApexButton size="sm" variant="text" @click="tbSelBoard?.clearSelection()">Clear</ApexButton>
            <span class="note">{{ tbSelNames || 'Nothing selected' }}</span>
          </div>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard ref="tbSelBoard" :items="tbSelItems" :columns="TB_COLUMNS" :card-fields="TB_FIELDS"
                           selection-mode="multiple" height="380px" column-width="240px"
                           @selection-change="tbSelNames = $event.items.map((c: TbItem) => c.title).join(', ')"
                           @card-move="tbSelItems = applyMove(tbSelItems, $event)">
              <template #drag-preview="{ items, count }">
                <div class="tb-preview">
                  <ApexIcon name="drag_indicator" :size="18" />
                  <strong style="font-size:13px">{{ count === 1 ? items[0].title : count + ' cards' }}</strong>
                </div>
              </template>
            </ApexTaskBoard>
          </div>

          <h2>Editing</h2>
          <p class="note">
            Activation is an event, not a built-in editor: double-click a card or press Enter and
            the app opens whatever it likes. This one edits the app's array directly, so the
            board re-renders from the data.
          </p>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbEditItems" :columns="[TB_COLUMNS[0], TB_COLUMNS[2], TB_COLUMNS[3]]"
                           :card-fields="TB_FIELDS" height="340px" column-width="240px"
                           @card-activate="tbEdit($event.item)"
                           @add-card="tbEdit(null, $event.columnId)"
                           @card-move="tbEditItems = applyMove(tbEditItems, $event)" />
          </div>
          <ApexDialog v-model:visible="tbDialog" :header="tbDraft.id ? 'Edit card' : 'New card'" width="420px">
            <div style="display:flex;flex-direction:column;gap:12px">
              <ApexInput v-model="tbDraft.title" label="Title" />
              <ApexSelect v-model="tbDraft.priority" label="Priority" :options="['P1', 'P2', 'P3', 'P4']" />
              <ApexInput v-model="tbDraft.due" label="Due" placeholder="Sep 12" />
            </div>
            <template #footer>
              <ApexButton v-if="tbDraft.id" severity="danger" variant="text" icon="delete"
                          @click="tbEditDelete">Delete</ApexButton>
              <ApexButton severity="secondary" variant="outlined" @click="tbDialog = false">Cancel</ApexButton>
              <ApexButton @click="tbEditSave">Save</ApexButton>
            </template>
          </ApexDialog>

          <h2>Virtual scroll</h2>
          <p class="note">
            600 cards across five columns. Windowing is per cell, since each cell is its own
            scroller — a board-wide window would have to assume every column scrolls together.
            The height estimate is replaced by a real measurement once a card has rendered.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSwitch v-model="tbVirtual" label="Virtual scroll" />
            <span class="note">Rendered card elements: <code>{{ tbRendered }}</code> of {{ tbBig.length }}</span>
            <ApexButton size="sm" variant="text" @click="tbCountRendered">Recount</ApexButton>
          </div>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard ref="tbBigBoard" :items="tbBig" :columns="TB_OPS_COLUMNS" :card-fields="TB_FIELDS"
                           :virtual-scroll="tbVirtual" :virtual-scroll-item-height="96" :virtual-scroll-buffer="4"
                           height="420px" column-width="230px" :show-add-card="false"
                           @card-move="tbBig = applyMove(tbBig, $event)" />
          </div>

          <h2>State, export and print</h2>
          <p class="note">
            <code>getState()</code> returns collapse, lane closure, selection and scroll offsets
            — and nothing about rendered geometry, which belongs to this session's DOM. Export
            returns strings rather than downloading, because the file and where it goes are the
            app's business. Print unrolls the columns into a wrapping grid so the board prints as
            a document.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexButton size="sm" severity="secondary" variant="outlined" icon="bookmark"
                        @click="tbSave">Save state</ApexButton>
            <ApexButton size="sm" severity="secondary" variant="outlined" icon="restore"
                        :disabled="!tbState" @click="tbRestore">Restore</ApexButton>
            <ApexButton size="sm" variant="text" icon="data_object" @click="tbShow('json')">Export JSON</ApexButton>
            <ApexButton size="sm" variant="text" icon="table_view" @click="tbShow('csv')">Export CSV</ApexButton>
            <ApexButton size="sm" variant="text" icon="print" @click="tbPrint">Print</ApexButton>
          </div>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard ref="tbStateBoard" :items="tbStateItems" :columns="TB_OPS_COLUMNS" :swimlanes="TB_LANES"
                           :card-fields="TB_FIELDS" selection-mode="multiple" height="360px" column-width="220px"
                           lane-width="140px" density="compact"
                           @card-move="tbStateItems = applyMove(tbStateItems, $event)" />
          </div>
          <pre v-if="tbExport" class="doc-pre" style="margin-top:10px;max-height:220px;overflow:auto">{{ tbExport }}</pre>

          <h2>Custom cards and chrome</h2>
          <p class="note">
            The <code>card</code> slot replaces the contents entirely while the board keeps drag,
            selection, focus and movement. <code>column-header</code>,
            <code>swimlane-header</code>, <code>column-footer</code> and <code>empty</code> do the
            same for the surrounding chrome.
          </p>
          <div class="tb-frame" style="margin-top:12px">
            <ApexTaskBoard :items="tbItems" :columns="TB_COLUMNS" height="380px" column-width="250px"
                           accent="oklch(0.55 0.20 300)" card-radius="12px"
                           @card-move="tbMove">
              <template #column-header="{ column, count, over }">
                <ApexIcon :name="TB_ICONS[column.id] || 'view_column'" :size="17" style="color:var(--fg-subtle)" />
                <span class="apex-kb__col-title">{{ column.title }}</span>
                <ApexBadge :value="count" :severity="over ? 'danger' : 'secondary'" size="sm" />
              </template>
              <template #card="{ item, selected }">
                <div class="tb-mine">
                  <div class="tb-mine__row">
                    <strong style="font-size:13.5px">{{ item.title }}</strong>
                    <ApexIcon v-if="selected" name="check_circle" :size="16" style="color:var(--accent-primary)" />
                  </div>
                  <ApexProgressBar :value="item.checklist ? (item.checklist.done / item.checklist.total) * 100 : 0"
                                   :height="4" />
                  <div class="tb-mine__row" style="font-size:11.5px;color:var(--fg-subtle)">
                    <span>{{ item.due || 'No date' }}</span>
                    <ApexAvatar v-if="item.assignees && item.assignees[0]" :label="item.assignees[0]" size="xs" auto-color />
                  </div>
                </div>
              </template>
              <template #empty><p class="apex-kb__empty">Nothing here — drop a card in</p></template>
            </ApexTaskBoard>
          </div>

          <h2>Customising</h2>
          <p class="note">
            One <code>ui</code> map classes the board's fifteen parts and, while the default card
            is in use, its six as well. Every metric and colour prop writes a matching
            <code>--apex-kb-*</code> variable.
          </p>
          <table class="doc-table">
            <thead><tr><th>ui keys</th><th>Parts</th></tr></thead>
            <tbody>
              <tr v-for="r in TB_PARTS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- The gallery's seven, ported. -->
        <template v-if="entry.id === 'gallery'">
          <h2>Basic</h2>
          <p class="note">
            A collection of images with arrows and a thumbnail strip. Arrow keys move
            between images, <code>+</code> and <code>−</code> zoom, <code>0</code> resets, and
            ctrl or cmd with the wheel zooms on the stage. Placeholders stand in for
            artwork here — real <code>src</code> values drop in unchanged.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexGallery v-model="galBasic" :images="GAL_IMAGES" show-counter loop
                         style="max-width:560px;margin:0 auto" />
          </div>

          <h2>Toolbar</h2>
          <p class="note">
            <code>actions</code> chooses which buttons appear and in what order; an empty
            array removes the toolbar entirely. Zoom past 1× and the stage becomes
            draggable.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell"><span class="cell__tag">zoom and reset only</span>
              <ApexGallery v-model="galTbA" :images="GAL_IMAGES" :actions="['zoom-in', 'zoom-out', 'zoom-reset']"
                           :show-thumbnails="false" toolbar-position="bottom" />
            </div>
            <div class="cell"><span class="cell__tag">no toolbar</span>
              <ApexGallery v-model="galTbB" :images="GAL_IMAGES" :actions="[]" :show-thumbnails="false" show-counter />
            </div>
          </div>

          <h2>Per-button switches</h2>
          <p class="note">
            Each button also has its own prop — <code>zoomIn</code>, <code>rotateLeft</code>,
            <code>downloadable</code>, <code>fullscreen</code> and so on. A switch overrides
            <code>actions</code> for that one button and undefined leaves the array in charge,
            so the two can be mixed: keep the default set and drop just the flips, or start
            from an empty array and turn on the two you want.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell"><span class="cell__tag">default set, flips and download off</span>
              <ApexGallery v-model="galSwA" :images="GAL_IMAGES" :flip-horizontal="false" :flip-vertical="false"
                           :downloadable="false" :show-thumbnails="false" />
            </div>
            <div class="cell"><span class="cell__tag">empty array, two switched on</span>
              <ApexGallery v-model="galSwB" :images="GAL_IMAGES" :actions="[]" zoom-in zoom-out
                           :show-thumbnails="false" />
            </div>
          </div>
          <p class="note" style="margin-top:8px">
            The download button disables itself when the active image has no <code>src</code>
            — which is the case for these placeholders. Given a real URL it fetches the
            bytes and saves a blob, so a cross-origin image still saves rather than
            navigating away.
          </p>

          <h2>Hover chrome</h2>
          <p class="note">
            <code>hoverToolbar</code> and <code>hoverNav</code> keep the controls out of the
            way until the pointer is over the gallery. They fade rather than snap, and
            keyboard focus counts as hover so the controls are still reachable without a
            mouse.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexGallery v-model="galHover" :images="GAL_IMAGES" hover-toolbar hover-nav show-counter
                         style="max-width:560px;margin:0 auto" />
          </div>

          <h2>Styling</h2>
          <p class="note">
            Stage, toolbar, arrows and thumbnails each take their own colours, sizes and
            corners.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell"><span class="cell__tag">light stage, square chrome</span>
              <ApexGallery v-model="galStyleA" :images="GAL_IMAGES" stage-background="var(--bg-muted)"
                           radius="18px" toolbar-background="var(--bg-elevated)" toolbar-color="var(--fg-default)"
                           toolbar-radius="10px" nav-background="var(--bg-elevated)" nav-color="var(--fg-default)"
                           nav-radius="10px" nav-size="32px" thumb-radius="10px" thumb-size="58px" />
            </div>
            <div class="cell"><span class="cell__tag">thumbnails on top, accent active</span>
              <ApexGallery v-model="galStyleB" :images="GAL_IMAGES" thumbnails-position="top"
                           thumb-active-color="var(--accent-success)" :thumb-inactive-opacity="0.3"
                           thumb-size="90px" thumb-gap="12px" toolbar-position="bottom" />
            </div>
          </div>

          <h2>Single</h2>
          <p class="note">
            One image, no strip and no arrows — the viewer reduces to a stage with its
            toolbar.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexGallery :images="[GAL_IMAGES[2]]"
                         :actions="['zoom-in', 'zoom-out', 'rotate-right', 'download', 'fullscreen']"
                         style="max-width:460px;margin:0 auto" />
          </div>

          <h2>Grid lightbox</h2>
          <p class="note">
            <code>overlay</code> with <code>v-model:open</code> makes the same viewer a
            full-screen lightbox: a grid of thumbnails sets the index and opens it. Escape
            closes it, and the page behind stops scrolling while it is up.
          </p>
          <div class="gal-grid" style="margin-top:12px">
            <button v-for="(im, i) in GAL_IMAGES" :key="i" type="button" class="gal-cell"
                    :style="{ background: im.background }" @click="galLbIndex = i; galLbOpen = true">
              <span>{{ im.caption }}</span>
            </button>
          </div>
          <ApexGallery v-model="galLbIndex" v-model:open="galLbOpen" overlay :images="GAL_IMAGES" loop show-counter
                       :actions="['rotate-left', 'rotate-right', 'zoom-in', 'zoom-out', 'flip-h', 'flip-v', 'download', 'close']" />

          <h2>Customising</h2>
          <p class="note">
            The <code>ui</code> map classes the nine parts of the viewer. Every colour, size
            and corner also has a prop, and each writes the matching
            <code>--apex-gal-*</code> variable — so the Styling section above and this map
            are two routes to the same thing.
          </p>
          <table class="doc-table">
            <thead><tr><th>ui key</th><th>Part</th></tr></thead>
            <tbody>
              <tr v-for="r in GAL_PARTS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <!-- The gallery's eight, ported. -->
        <template v-if="entry.id === 'carousel'">
          <h2>Basic</h2>
          <p class="note">
            Five parts: the root owns the state, <code>ApexCarouselContent</code> is the
            scroll-snap track, and items, nav buttons and indicators read from the root
            through context — so they can sit anywhere in the markup.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCarousel align="center">
              <ApexCarouselContent style="height:210px">
                <ApexCarouselItem v-for="n in 5" :key="n"><div class="car-tile">{{ n }}</div></ApexCarouselItem>
              </ApexCarouselContent>
              <div class="car-bar">
                <ApexCarouselIndicators />
                <div class="iconstrip">
                  <ApexCarouselNav dir="prev" />
                  <ApexCarouselNav dir="next" />
                </div>
              </div>
            </ApexCarousel>
          </div>

          <h2>Controls</h2>
          <p class="note">
            <code>ApexCarouselControls</code> is the standard row — one tag instead of
            hand-composing nav buttons and indicators per carousel. <code>navPosition</code>
            places the arrows and <code>indicatorPosition</code> the dots;
            <code>indicators</code> off removes them wherever they are composed. The
            individual parts stay available for anything this arrangement doesn't cover.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell" v-for="p in CAR_NAV_POS" :key="p"><span class="cell__tag">navPosition {{ p }}</span>
              <ApexCarousel :nav-position="p" align="center">
                <ApexCarouselContent style="height:130px">
                  <ApexCarouselItem v-for="n in 5" :key="n"><div class="car-tile car-tile--sm">{{ n }}</div></ApexCarouselItem>
                </ApexCarouselContent>
                <ApexCarouselControls />
              </ApexCarousel>
            </div>
          </div>
          <div class="grid grid--2" style="margin-top:14px">
            <div class="cell" v-for="p in (['left', 'center', 'right'] as const)" :key="p">
              <span class="cell__tag">indicatorPosition {{ p }}</span>
              <ApexCarousel :indicator-position="p" align="center">
                <ApexCarouselContent style="height:110px">
                  <ApexCarouselItem v-for="n in 5" :key="n"><div class="car-tile car-tile--sm">{{ n }}</div></ApexCarouselItem>
                </ApexCarouselContent>
                <ApexCarouselControls />
              </ApexCarousel>
            </div>
            <div class="cell"><span class="cell__tag">indicators off</span>
              <ApexCarousel :indicators="false" align="center">
                <ApexCarouselContent style="height:110px">
                  <ApexCarouselItem v-for="n in 5" :key="n"><div class="car-tile car-tile--sm">{{ n }}</div></ApexCarouselItem>
                </ApexCarouselContent>
                <ApexCarouselControls />
              </ApexCarousel>
            </div>
          </div>

          <h2>Alignment</h2>
          <p class="note">
            <code>align</code> sets where the active item lands. <code>slidesPerPage</code>
            takes fractions — 2.5 leaves a partial slide showing, which is what tells the
            user there is more to the right.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell" v-for="a in (['start', 'center', 'end'] as const)" :key="a">
              <span class="cell__tag">align {{ a }}, 2.5 per page</span>
              <ApexCarousel :align="a" :slides-per-page="2.5">
                <ApexCarouselContent style="height:120px">
                  <ApexCarouselItem v-for="n in 8" :key="n"><div class="car-tile car-tile--sm">{{ n }}</div></ApexCarouselItem>
                </ApexCarouselContent>
                <div class="car-bar"><ApexCarouselIndicators variant="dot" /></div>
              </ApexCarousel>
            </div>
          </div>

          <h2>Orientation</h2>
          <p class="note">
            Set <code>orientation</code> to <code>vertical</code> and the track snaps on the
            block axis instead; the nav buttons pick up the matching chevrons on their own.
          </p>
          <div class="car-frame" style="margin-top:12px;max-width:340px">
            <ApexCarousel orientation="vertical" align="center">
              <ApexCarouselContent style="height:260px">
                <ApexCarouselItem v-for="n in 5" :key="n"><div class="car-tile">{{ n }}</div></ApexCarouselItem>
              </ApexCarouselContent>
              <div class="car-bar">
                <ApexCarouselIndicators />
                <div class="iconstrip">
                  <ApexCarouselNav dir="prev" />
                  <ApexCarouselNav dir="next" />
                </div>
              </div>
            </ApexCarousel>
          </div>

          <h2>Loop</h2>
          <p class="note">
            <code>loop</code> wraps past the ends, so neither nav button ever disables —
            next at the last item returns to the first.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCarousel loop :slides-per-page="2.5" gap="12px">
              <ApexCarouselContent style="height:150px">
                <ApexCarouselItem v-for="n in 7" :key="n"><div class="car-tile car-tile--sm">{{ n }}</div></ApexCarouselItem>
              </ApexCarouselContent>
              <div class="car-bar">
                <ApexCarouselIndicators />
                <div class="iconstrip">
                  <ApexCarouselNav dir="prev" />
                  <ApexCarouselNav dir="next" />
                </div>
              </div>
            </ApexCarousel>
          </div>

          <h2>Variable size</h2>
          <p class="note">
            <code>autoSize</code> stops the track dividing itself and lets each item keep its
            own width.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCarousel auto-size align="center">
              <ApexCarouselContent style="height:150px">
                <ApexCarouselItem v-for="n in 6" :key="n">
                  <div class="car-tile car-tile--sm" :style="{ width: `${80 + n * 40}px` }">{{ n }}</div>
                </ApexCarouselItem>
              </ApexCarouselContent>
              <div class="car-bar">
                <ApexCarouselIndicators />
                <div class="iconstrip">
                  <ApexCarouselNav dir="prev" />
                  <ApexCarouselNav dir="next" />
                </div>
              </div>
            </ApexCarousel>
          </div>

          <h2>Content cards</h2>
          <p class="note">
            An item holds any markup — here a media card with its own actions.
            Placeholders stand in for artwork; drop real images in and the layout is
            unchanged.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCarousel :slides-per-page="3.2" gap="14px" v-model:slide="carCard">
              <div class="car-head">
                <strong style="font-size:14px">Last played</strong>
                <div class="iconstrip">
                  <ApexCarouselNav dir="prev" />
                  <ApexCarouselNav dir="next" />
                </div>
              </div>
              <ApexCarouselContent style="padding-block-end:4px">
                <ApexCarouselItem v-for="t in CAR_TRACKS" :key="t.title">
                  <div class="car-card">
                    <div class="car-card__art">{{ t.title.charAt(0) }}</div>
                    <strong style="font-size:13.5px">{{ t.title }}</strong>
                    <span style="font-size:12.5px;color:var(--fg-subtle)">{{ t.artist }}</span>
                  </div>
                </ApexCarouselItem>
              </ApexCarouselContent>
            </ApexCarousel>
          </div>

          <h2>Gallery</h2>
          <p class="note">
            Two carousels bound to the same index — <code>v-model:slide</code> on both.
            Picking a thumbnail moves the stage; dragging the stage moves the thumbnails,
            because the track reports the active item as it scrolls rather than only on a
            button press.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCarousel v-model:slide="carGallery" align="center">
              <ApexCarouselContent style="height:300px">
                <ApexCarouselItem v-for="(sh, i) in CAR_SHOTS" :key="i">
                  <div class="car-shot" :style="{ background: sh.bg }">{{ sh.label }}</div>
                </ApexCarouselItem>
              </ApexCarouselContent>
            </ApexCarousel>
            <ApexCarousel v-model:slide="carGallery" align="center" :slides-per-page="4.5"
                          gap="10px" style="margin-top:10px">
              <ApexCarouselContent style="height:66px">
                <ApexCarouselItem v-for="(sh, i) in CAR_SHOTS" :key="i">
                  <button type="button" class="car-thumb" :data-active="carGallery === i ? 'true' : 'false'"
                          :style="{ background: sh.bg }" @click="carGallery = i">{{ i + 1 }}</button>
                </ApexCarouselItem>
              </ApexCarouselContent>
            </ApexCarousel>
          </div>

          <h2>Customising</h2>
          <p class="note">
            The parts live in five components, so the <code>ui</code> map goes on the root
            and travels through the same context the parts already read their state from.
            One object classes the whole carousel.
          </p>
          <table class="doc-table">
            <thead><tr><th>ui key</th><th>Part</th></tr></thead>
            <tbody>
              <tr v-for="r in CAR_PARTS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
          <p class="note">
            <code>gap</code> and <code>slidesPerPage</code> reach the same
            <code>--apex-car-*</code> variables the classes do.
          </p>
        </template>

        <template v-if="entry.id === 'compare'">
          <h2>Basic</h2>
          <p class="note">
            Two <code>ApexCompareItem</code> children, one <code>before</code> and one
            <code>after</code>. Drag the divider, or focus the handle and use the arrow keys
            — Home and End jump to either extreme. Placeholders stand in for artwork; real
            images drop in unchanged.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCompare v-model="cmpBasic" aspect-ratio="16/9" style="max-width:520px;margin:0 auto">
              <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
              <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
            </ApexCompare>
          </div>

          <h2>Custom handle</h2>
          <p class="note">
            Colour, size, corners and shadow are props; the <code>handle</code> slot replaces
            the contents outright while keeping the drag, the keys and the positioning.
            <code>handle</code> off leaves the divider draggable but unadorned.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell"><span class="cell__tag">props only</span>
              <ApexCompare v-model="cmpHandleA" aspect-ratio="16/10" handle-size="44px" handle-radius="12px"
                           handle-background="var(--accent-primary)" handle-color="#FFF"
                           divider-color="var(--accent-primary)" divider-width="3px" radius="16px">
                <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
                <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
              </ApexCompare>
            </div>
            <div class="cell"><span class="cell__tag">handle slot</span>
              <ApexCompare v-model="cmpHandleB" aspect-ratio="16/10" handle-size="52px"
                           handle-background="#101720" handle-border-color="#2A3542"
                           handle-shadow="0 8px 20px rgba(0,0,0,.35)">
                <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
                <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
                <template #handle="{ value }">
                  <span style="font-size:11px;font-weight:700;color:#F2F6FB">{{ Math.round(value) }}%</span>
                </template>
              </ApexCompare>
            </div>
            <div class="cell"><span class="cell__tag">handle off</span>
              <ApexCompare v-model="cmpHandleC" aspect-ratio="16/10" :handle="false" divider-width="4px">
                <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
                <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
              </ApexCompare>
            </div>
            <div class="cell"><span class="cell__tag">disabled</span>
              <ApexCompare :model-value="38" aspect-ratio="16/10" disabled>
                <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
                <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
              </ApexCompare>
            </div>
          </div>

          <h2>Hover</h2>
          <p class="note">
            <code>slideOnHover</code> follows the pointer without a press. Dragging still
            works, and a drag that leaves the frame is not fought by the hover handler.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCompare v-model="cmpHover" slide-on-hover aspect-ratio="16/9" style="max-width:520px;margin:0 auto">
              <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
              <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
            </ApexCompare>
          </div>

          <h2>Vertical</h2>
          <p class="note">
            <code>orientation="vertical"</code> clips on the block axis instead; the handle
            picks up the matching cursor and chevrons.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCompare v-model="cmpVert" orientation="vertical" aspect-ratio="4/3" style="max-width:400px;margin:0 auto">
              <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
              <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
            </ApexCompare>
          </div>

          <h2>Controlled</h2>
          <p class="note">
            Bind with <code>v-model</code> when other UI has to stay in step with the divider.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCompare v-model="cmpCtl" aspect-ratio="16/9" style="max-width:520px;margin:0 auto">
              <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
              <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
            </ApexCompare>
            <div class="iconstrip" style="justify-content:center;margin-top:12px">
              <ApexButton v-for="v in [25, 50, 75]" :key="v" size="sm" variant="outlined" severity="secondary"
                          @click="cmpCtl = v">{{ v }}%</ApexButton>
              <ApexSlider v-model="cmpCtl" :min="0" :max="100" style="width:180px" />
            </div>
          </div>

          <h2>Template</h2>
          <p class="note">
            Neither side has to be an image — any markup works, and because the before side
            is clipped rather than resized, a card inside keeps the size it would have on its
            own.
          </p>
          <div class="car-frame" style="margin-top:12px">
            <ApexCompare v-model="cmpTpl" height="300px" style="max-width:460px;margin:0 auto"
                         background="var(--bg-muted)">
              <ApexCompareItem position="before">
                <div class="cmp-card-wrap cmp-card-wrap--free">
                  <div class="cmp-card">
                    <div class="cmp-card__head">
                      <ApexAvatar label="Amy Elsner" size="sm" />
                      <div>
                        <strong style="font-size:13.5px">Amy Elsner</strong>
                        <span style="display:block;font-size:12px;color:var(--fg-subtle)">Free plan</span>
                      </div>
                    </div>
                    <div class="cmp-card__row"><span>Storage</span><span>7.2 GB / 10 GB</span></div>
                    <ApexProgressBar :value="72" />
                    <ApexButton size="sm" severity="secondary" variant="outlined" style="width:100%">Settings</ApexButton>
                  </div>
                </div>
              </ApexCompareItem>
              <ApexCompareItem position="after">
                <div class="cmp-card-wrap cmp-card-wrap--pro">
                  <div class="cmp-card">
                    <div class="cmp-card__head">
                      <ApexAvatar label="Amy Elsner" size="sm" />
                      <div>
                        <strong style="font-size:13.5px">Amy Elsner</strong>
                        <span style="display:block;font-size:12px;color:var(--accent-primary)">Pro plan</span>
                      </div>
                    </div>
                    <div class="cmp-card__row"><span>Storage</span><span>7.2 GB / 2 TB</span></div>
                    <ApexProgressBar :value="4" />
                    <ApexButton size="sm" style="width:100%">Manage plan</ApexButton>
                  </div>
                </div>
              </ApexCompareItem>
            </ApexCompare>
          </div>

          <h2>Customising</h2>
          <p class="note">
            Two ways in. <strong>Props</strong> restyle one comparison from the template —
            every frame, divider and handle dimension above is one. <strong>Classes</strong>
            do everything props do plus states, media queries and pseudo-elements, through
            the <code>ui</code> map.
          </p>
          <table class="doc-table">
            <thead><tr><th>ui key</th><th>Part</th></tr></thead>
            <tbody>
              <tr v-for="r in CMP_PARTS" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td>{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
          <p class="note">
            Both routes reach the same <code>--apex-cmp-*</code> variables, so a prop and a
            class cannot disagree about what they control.
          </p>
        </template>

        <template v-if="entry.id === 'sidebar'">
          <h2>Variants</h2>
          <p class="note">
            The playground above drives every prop. <code>variant</code> changes the panel's
            frame, <code>collapsible</code> what collapsing means, and <code>overlay</code>
            whether the panel pushes the content or floats over it. Pair
            <code>collapsible="icon"</code> with <code>openOnHover</code> for a rail that
            expands under the pointer.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexSidebarLayout height="420px"&gt;
  &lt;ApexSidebar id="main" collapsible="icon" open-on-hover&gt;
    &lt;template #header="{ collapsed }"&gt;…&lt;/template&gt;
    &lt;ApexMenu :items="nav" /&gt;
    &lt;template #footer&gt;…&lt;/template&gt;
  &lt;/ApexSidebar&gt;
  &lt;ApexSidebarInset scroll&gt;
    &lt;ApexSidebarTrigger target="main" /&gt;
  &lt;/ApexSidebarInset&gt;
&lt;/ApexSidebarLayout&gt;</pre>

          <h2>With menu</h2>
          <p class="note">
            Application chrome: a workspace switcher in the header, grouped navigation from
            ApexMenu, and a user menu in the footer. Collapsing to icon mode hides every
            label in the panel — whichever component drew it — so nothing has to be
            duplicated for the rail.
          </p>
          <div class="sb-demo">
            <ApexSidebarLayout height="460px">
              <ApexSidebar id="chrome" collapsible="icon">
                <template #header="{ collapsed }">
                  <button type="button" class="sb-brand sb-brand--btn" @click="wsMenu?.toggle($event)">
                    <span class="sb-mark">{{ sbWorkspace.charAt(0) }}</span>
                    <strong v-if="!collapsed">{{ sbWorkspace }}</strong>
                    <ApexIcon v-if="!collapsed" name="expand_more" :size="18"
                              style="margin-inline-start:auto;color:var(--fg-subtle)" />
                  </button>
                  <ApexMenu ref="wsMenu" popup width="230px"
                            :items="[{ label: 'Companies', items: SB_WORKSPACES }, { separator: true },
                                     { label: 'Add company', icon: 'add' }]" />
                </template>
                <ApexMenu :items="SB_NAV" width="100%" />
                <template #footer="{ collapsed }">
                  <button type="button" class="sb-user sb-user--btn" @click="userMenu?.toggle($event)">
                    <ApexAvatar label="John Doe" size="sm" />
                    <span v-if="!collapsed"><strong>John Doe</strong><em>john@acme.io</em></span>
                  </button>
                  <ApexMenu ref="userMenu" popup side="top" width="220px"
                            :items="[{ label: 'Account', icon: 'person' }, { label: 'Billing', icon: 'credit_card' },
                                     { separator: true }, { label: 'Sign out', icon: 'logout' }]" />
                </template>
              </ApexSidebar>
              <ApexSidebarInset scroll>
                <div class="sb-topbar"><ApexSidebarTrigger target="chrome" /><strong>Dashboard</strong></div>
                <div class="sb-content"><div class="sb-block"></div><div class="sb-block sb-block--tall"></div></div>
              </ApexSidebarInset>
            </ApexSidebarLayout>
          </div>

          <h2>Responsive</h2>
          <p class="note">
            One flag from <code>matchMedia</code> chooses the mode: below the breakpoint the
            panel becomes an offcanvas overlay with a backdrop, above it stays an icon rail
            pushing the inset. The panel itself does not change.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexSwitch v-model="sbNarrow" label="Simulate a narrow viewport" />
          </div>
          <div class="sb-demo">
            <ApexSidebarLayout height="420px">
              <ApexSidebar id="resp" :collapsible="sbNarrow ? 'offcanvas' : 'icon'"
                           :overlay="sbNarrow" :backdrop="sbNarrow" v-model:open="sbRespOpen">
                <template #header="{ collapsed }">
                  <div class="sb-brand"><span class="sb-mark">A</span><strong v-if="!collapsed">Acme Inc</strong></div>
                </template>
                <ApexMenu :items="SB_NAV" width="100%" />
              </ApexSidebar>
              <ApexSidebarInset scroll>
                <div class="sb-topbar">
                  <ApexSidebarTrigger target="resp" />
                  <strong>{{ sbNarrow ? 'Offcanvas + backdrop' : 'Icon rail' }}</strong>
                </div>
                <div class="sb-content"><div class="sb-block"></div></div>
              </ApexSidebarInset>
            </ApexSidebarLayout>
          </div>

          <h2>Dual sidebar</h2>
          <p class="note">
            Two panels on opposite sides of one layout — navigation on the left, an
            assistant panel on the right — each targeted by its own trigger through
            <code>id</code>.
          </p>
          <div class="sb-demo">
            <ApexSidebarLayout height="460px">
              <ApexSidebar id="dual-left" collapsible="icon" width="230px">
                <template #header="{ collapsed }">
                  <div class="sb-brand"><span class="sb-mark">A</span><strong v-if="!collapsed">Acme Inc</strong></div>
                </template>
                <ApexMenu :items="SB_NAV" width="100%" />
              </ApexSidebar>
              <ApexSidebarInset scroll>
                <div class="sb-topbar">
                  <ApexSidebarTrigger target="dual-left" />
                  <strong>Dashboard</strong>
                  <ApexSidebarTrigger target="dual-right" icon="smart_toy" label="Toggle assistant"
                                      style="margin-inline-start:auto" />
                </div>
                <div class="sb-content"><div class="sb-block sb-block--tall"></div></div>
              </ApexSidebarInset>
              <ApexSidebar id="dual-right" side="right" collapsible="offcanvas" width="280px" :open="false">
                <template #header><strong style="font-size:13.5px">Weekly metrics</strong></template>
                <div class="sb-chat">
                  <p class="sb-chat__q">Show me this week's metrics</p>
                  <p class="sb-chat__a">Here are your key metrics for this week:</p>
                  <dl class="sb-stats">
                    <div><dt>Page views</dt><dd>12,482</dd></div>
                    <div><dt>New users</dt><dd>342</dd></div>
                    <div><dt>Bounce rate</dt><dd>34%</dd></div>
                  </dl>
                </div>
                <template #footer>
                  <ApexInput v-model="sbAsk" placeholder="Reply…" label="Reply"
                             label-placement="hidden" size="sm" />
                </template>
              </ApexSidebar>
            </ApexSidebarLayout>
          </div>

          <h2>Multi sidebar</h2>
          <p class="note">
            Two panels stacked on the same side of one layout: a hover-to-open icon bar and
            a secondary panel that stays open on desktop and collapses to an offcanvas
            overlay on smaller screens. The rail keeps its 52px of layout while the expanded
            panel floats over the second one, so nothing reflows as it opens.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexSwitch v-model="sbIdeNarrow" label="Simulate a narrow viewport" />
          </div>
          <div class="sb-demo">
            <ApexSidebarLayout height="520px">
              <ApexSidebar id="ide-rail" collapsible="icon" :open="false" open-on-hover
                           width="210px" icon-width="52px">
                <template #header="{ collapsed }">
                  <div class="sb-brand"><span class="sb-mark">A</span><strong v-if="!collapsed">Acme Inc</strong></div>
                </template>
                <ApexMenu :items="SB_IDE_RAIL" width="100%" :label-caps="false" />
                <template #footer="{ collapsed }">
                  <div class="sb-user">
                    <ApexIcon name="settings" :size="20" style="color:var(--fg-subtle)" />
                    <strong v-if="!collapsed">Settings</strong>
                  </div>
                </template>
              </ApexSidebar>
              <ApexSidebar id="ide-panel" collapsible="offcanvas" width="230px"
                           :overlay="sbIdeNarrow" :backdrop="sbIdeNarrow" v-model:open="sbIdePanel">
                <template #header><strong style="font-size:14px">Settings</strong></template>
                <ApexMenu :items="SB_IDE_PANEL" width="100%" />
              </ApexSidebar>
              <ApexSidebarInset scroll>
                <div class="sb-topbar">
                  <ApexSidebarTrigger target="ide-panel" />
                  <strong>Table Editor</strong>
                  <span style="font-size:13px;color:var(--fg-subtle)">/ {{ sbIdeSection.toLowerCase() }}</span>
                </div>
                <div class="sb-content"><div class="sb-block"></div><div class="sb-block sb-block--tall"></div></div>
              </ApexSidebarInset>
            </ApexSidebarLayout>
          </div>
          <p class="note">
            Section: <code>{{ sbIdeSection }}</code> — hover the icon rail to expand it
            over the panel.
          </p>

          <h2>Nested menu</h2>
          <p class="note">
            Groups inside the panel collapse to reveal deep trees, with the current node
            marked — the sidebar holds the frame, ApexMenu holds the tree and its
            <code>expandedKeys</code>.
          </p>
          <div class="sb-demo">
            <ApexSidebarLayout height="480px">
              <ApexSidebar id="files" collapsible="icon" width="250px">
                <template #header="{ collapsed }">
                  <div class="sb-brand"><span class="sb-mark">F</span><strong v-if="!collapsed">File Manager</strong></div>
                </template>
                <ApexMenu :items="SB_FILES" v-model:expandedKeys="sbFileKeys" width="100%" />
                <template #footer="{ collapsed }">
                  <div class="sb-user"><ApexAvatar label="John Doe" size="sm" /><strong v-if="!collapsed">John Doe</strong></div>
                </template>
              </ApexSidebar>
              <ApexSidebarInset scroll>
                <div class="sb-topbar"><ApexSidebarTrigger target="files" /><strong>{{ sbFile }}</strong></div>
                <div class="sb-content">
                  <h3 style="margin:0">{{ sbFile }}</h3>
                  <ApexBreadcrumb :items="sbFilePath.map((p) => ({ label: p }))" separator="/" />
                </div>
              </ApexSidebarInset>
            </ApexSidebarLayout>
          </div>

          <h2>Chat application</h2>
          <p class="note">
            A history panel: pinned shortcuts at the top, conversations grouped by age, and
            a delete action that appears on hover — all ordinary content inside the panel
            body.
          </p>
          <div class="sb-demo">
            <ApexSidebarLayout height="480px">
              <ApexSidebar id="chat" collapsible="offcanvas" width="250px">
                <template #header>
                  <div class="sb-brand"><span class="sb-mark sb-mark--dark">✦</span><strong>Apex Chat</strong></div>
                </template>
                <ApexMenu :items="[{ label: 'Search', icon: 'search' }, { label: 'New chat', icon: 'edit_square' },
                                   { label: 'Browse web', icon: 'language' }]" width="100%" />
                <div v-for="grp in SB_CHATS" :key="grp.label" class="sb-chatgroup">
                  <h5>{{ grp.label }}</h5>
                  <button v-for="c in grp.items" :key="c" type="button" class="sb-chatitem"
                          :data-on="sbChat === c ? 'true' : 'false'" @click="sbChat = c">
                    <span>{{ c }}</span>
                    <em @click.stop="sbChatLog = 'deleted: ' + c"><ApexIcon name="delete" :size="16" /></em>
                  </button>
                </div>
                <template #footer>
                  <div class="sb-user"><ApexAvatar label="John Doe" size="sm" /><strong>John Doe</strong></div>
                </template>
              </ApexSidebar>
              <ApexSidebarInset scroll>
                <div class="sb-topbar"><ApexSidebarTrigger target="chat" /><strong>{{ sbChat }}</strong></div>
                <div class="sb-content"><div class="sb-block"></div><div class="sb-block sb-block--tall"></div></div>
              </ApexSidebarInset>
            </ApexSidebarLayout>
          </div>
          <p class="note">Hover action: <code>{{ sbChatLog || 'none yet' }}</code></p>

          <h2>Permissions</h2>
          <p class="note">
            The panel itself has no <code>can</code>, because it holds content rather than
            rows — the gating belongs to whatever is inside it. An <code>ApexMenu</code>
            in a sidebar filters exactly as it does anywhere else, which is the whole reason
            the panel is a container and not a menu.
          </p>
          <p class="note">
            That composition is worth stating plainly: nothing here is sidebar-specific.
            The rows carry <code>can</code>, the menu resolves it, and a group whose children
            have all gone takes its section label with it — so a role with nothing under
            Administration sees no Administration heading either.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div class="sb-demo">
            <ApexSidebarLayout height="260px">
              <ApexSidebar id="sb-gate" width="230px">
                <ApexMenu :items="sbGated" width="100%" />
              </ApexSidebar>
              <ApexSidebarInset>
                <div class="sb-topbar">
                  <ApexSidebarTrigger target="sb-gate" />
                  <strong>The panel stays; its contents are what the role changes.</strong>
                </div>
              </ApexSidebarInset>
            </ApexSidebarLayout>
          </div>
        </template>

        <!-- The gallery's seven, ported. -->
        <template v-if="entry.id === 'breadcrumb'">
          <h2>Basic</h2>
          <p class="note">
            A <code>home</code> crumb and an <code>items</code> array. The last crumb reads
            as the current page — bold, not a link, and <code>aria-current="page"</code>.
          </p>
          <pre class="doc-pre" v-pre>const home = { icon: 'home', href: '/' };
const items = [
  { label: 'Components', href: '/components' },
  { label: 'Menu', href: '/components/menu' },
  { label: 'Breadcrumb' },
];</pre>
          <div class="card" style="margin-top:12px">
            <ApexBreadcrumb :home="CRUMB_HOME" :items="CRUMBS"
                            @item-click="bcLog = 'clicked: ' + ($event.item.label || 'home')" />
          </div>
          <p class="note">Last event: <code>{{ bcLog || 'none yet' }}</code></p>

          <h2>Text, icons, or both</h2>
          <p class="note">
            One item shape covers all three: a <code>label</code> alone, an
            <code>icon</code> alone, or the pair.
          </p>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:12px">
            <div class="cell"><span class="cell__tag">labels only</span>
              <ApexBreadcrumb :items="[{ label: 'Fleet', href: '#' }, { label: 'Vehicles', href: '#' }, { label: 'VW Beetle' }]" />
            </div>
            <div class="cell"><span class="cell__tag">icons only</span>
              <ApexBreadcrumb :items="[{ icon: 'home', href: '#' }, { icon: 'folder', href: '#' }, { icon: 'description' }]" />
            </div>
            <div class="cell"><span class="cell__tag">icons and labels</span>
              <ApexBreadcrumb :items="[{ icon: 'home', label: 'Home', href: '#' }, { icon: 'inventory_2', label: 'Products', href: '#' }, { icon: 'memory', label: 'Electronics' }]" />
            </div>
            <div class="cell"><span class="cell__tag">mixed — icon-only root, labels after</span>
              <ApexBreadcrumb :home="CRUMB_HOME" :items="[{ label: 'Settings', href: '#' }, { icon: 'lock', label: 'Security', href: '#' }, { label: 'Two-factor' }]" />
            </div>
          </div>

          <h2>Route</h2>
          <p class="note">
            The <code>item</code> slot is the hook for a router: render a
            <code>router-link</code> for anything but the current crumb, which stays plain
            text. Items also take a <code>command</code>, which runs before
            <code>item-click</code>.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexBreadcrumb :home="home" :items="items"&gt;
  &lt;template #item="{ item, isCurrent }"&gt;
    &lt;span v-if="isCurrent" class="apex-bc__link"&gt;{{ item.label }}&lt;/span&gt;
    &lt;router-link v-else :to="item.to" class="apex-bc__link"&gt;
      &lt;ApexIcon v-if="item.icon" :name="item.icon" /&gt;
      {{ item.label }}
    &lt;/router-link&gt;
  &lt;/template&gt;
&lt;/ApexBreadcrumb&gt;</pre>
          <div class="card" style="margin-top:12px">
            <ApexBreadcrumb :items="[{ icon: 'home', command: () => (bcRoute = '/') },
                                     { label: 'Components', command: () => (bcRoute = '/components') },
                                     { label: 'Form', command: () => (bcRoute = '/components/form') },
                                     { label: 'Input' }]" />
            <p class="note" style="margin:10px 0 0">Navigated to: <code>{{ bcRoute || '—' }}</code></p>
          </div>

          <h2>Custom separator</h2>
          <p class="note">
            Pass an icon name or plain text to <code>separator</code>, or take the slot for
            anything else.
          </p>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:12px">
            <div class="cell"><span class="cell__tag">separator="/"</span>
              <ApexBreadcrumb :items="CRUMBS" separator="/" />
            </div>
            <div class="cell"><span class="cell__tag">separator="chevron_right" (default)</span>
              <ApexBreadcrumb :items="CRUMBS" />
            </div>
            <div class="cell"><span class="cell__tag">separator="arrow_forward"</span>
              <ApexBreadcrumb :items="CRUMBS" separator="arrow_forward" />
            </div>
            <div class="cell"><span class="cell__tag">#separator slot</span>
              <ApexBreadcrumb :items="CRUMBS">
                <template #separator><span class="bc-dot"></span></template>
              </ApexBreadcrumb>
            </div>
          </div>

          <h2>Ellipsis</h2>
          <p class="note">
            Past <code>maxItems</code> the middle collapses to one control; clicking it
            expands the whole trail. Without it, a long trail scrolls sideways — or wraps
            with <code>wrap</code>.
          </p>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:12px">
            <div class="cell"><span class="cell__tag">maxItems="4"</span>
              <ApexBreadcrumb :home="CRUMB_HOME" :items="LONG_CRUMBS" :max-items="4" />
            </div>
            <div class="cell"><span class="cell__tag">wrap</span>
              <ApexBreadcrumb :home="CRUMB_HOME" :items="LONG_CRUMBS" wrap />
            </div>
          </div>

          <h2>Custom item</h2>
          <p class="note">
            The <code>item</code> slot takes over a crumb entirely — here a badge on the
            current page and an avatar on one of the links.
          </p>
          <div class="card" style="margin-top:12px">
            <ApexBreadcrumb :items="[{ icon: 'groups', label: 'Teams', href: '#' },
                                     { label: 'Sarah Anderson', avatar: true, href: '#' },
                                     { label: 'Draft', badge: 'unsaved' }]">
              <template #item="{ item }">
                <span v-if="item.badge" class="apex-bc__link bc-badge">{{ item.label }}<em>{{ item.badge }}</em></span>
                <a v-else-if="item.avatar" href="#" class="apex-bc__link">
                  <ApexAvatar label="Sarah Anderson" size="xs" />{{ item.label }}
                </a>
                <a v-else href="#" class="apex-bc__link">
                  <ApexIcon v-if="item.icon" :name="String(item.icon)" class="apex-bc__icon" />{{ item.label }}
                </a>
              </template>
            </ApexBreadcrumb>
          </div>

          <h2>Sizes and chrome</h2>
          <p class="note">
            Three sizes, and every colour is a prop — a breadcrumb can sit bare above a
            title or as a filled bar.
          </p>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:12px">
            <div v-for="s in SIZES" :key="s" class="cell"><span class="cell__tag">{{ s }}</span>
              <ApexBreadcrumb :home="CRUMB_HOME" :items="CRUMBS" :size="s" />
            </div>
            <div class="cell"><span class="cell__tag">as a bar</span>
              <ApexBreadcrumb :home="CRUMB_HOME" :items="CRUMBS" background="var(--bg-muted)"
                              padding="10px 14px" radius="10px" hover-color="var(--accent-info)" />
            </div>
          </div>

          <h2>Permissions</h2>
          <p class="note">
            A trail is a path, so <code>can</code> does something here it does nowhere else
            in the family: rather than closing the gap, the trail stops at the first denied
            crumb. Everything after it was reached THROUGH that crumb, and a path this user
            cannot walk is not a path worth drawing.
          </p>
          <p class="note">
            The current-page styling moves with the truncation, and a trail with nothing
            left renders no bar at all — an empty one is chrome describing a path the
            reader has none of.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div class="card" style="margin-top:12px">
            <ApexBreadcrumb :home="CRUMB_HOME" :items="bcGated" />
          </div>
        </template>

        <template v-if="entry.id === 'contextmenu'">
          <h2>Basic</h2>
          <p class="note">
            Give it a <code>target</code> and an <code>items</code> array. Right-clicking
            inside the target opens the menu at the pointer; the native menu is suppressed
            only there.
          </p>
          <pre class="doc-pre" v-pre>&lt;div ref="zone"&gt;Right-click here&lt;/div&gt;
&lt;ApexContextMenu :target="zone" :items="items" /&gt;</pre>
          <div ref="ctxBasic" class="ctx-zone" style="margin-top:12px">Right-click here</div>
          <ApexContextMenu :items="CTX_ITEMS" :target="() => ctxBasic"
                           @item-click="ctxLog = $event.item.label || ''" />
          <p class="note">Last command: <code>{{ ctxLog || 'none yet' }}</code></p>

          <h2>Submenus</h2>
          <p class="note">
            Nest an <code>items</code> array on a row and it becomes a branch, opening to
            the side on hover. <code>separator</code> and <code>header</code> rows structure
            a long menu, and <code>hint</code> puts a shortcut on the right.
          </p>
          <div ref="ctxSub" class="ctx-zone" style="margin-top:12px">Right-click for a nested menu</div>
          <ApexContextMenu :items="CTX_NESTED" :target="() => ctxSub"
                           @item-click="ctxLog = $event.item.label || ''" />

          <h2>Global</h2>
          <p class="note">
            <code>global</code> attaches the menu to the document, for an app-wide menu.
            Toggle it on and right-click anywhere on this page — including outside the
            boxes.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSwitch v-model="ctxGlobal" label="Global context menu" />
          </div>
          <ApexContextMenu v-if="ctxGlobal" global :items="CTX_ITEMS"
                           @item-click="ctxLog = $event.item.label || ''" />

          <h2>Command</h2>
          <p class="note">
            A row's <code>command</code> runs when it is picked, receiving
            <code>{ item, originalEvent, target }</code> — <code>target</code> being the
            element the menu was opened on, which is what a per-row menu in a list needs.
          </p>
          <ul ref="ctxRowsEl" class="ctx-list" style="margin-top:12px">
            <li v-for="p in TEAM.slice(0, 5)" :key="p.name"
                :data-on="ctxRow === p.name ? 'true' : 'false'"
                @contextmenu="ctxRow = p.name">
              <ApexAvatar :label="p.name" size="sm" />
              <strong>{{ p.name }}</strong>
              <span class="ctx-role">{{ p.role }}</span>
            </li>
          </ul>
          <ApexContextMenu :target="() => ctxRowsEl"
                           :items="[{ header: 'Role' },
                                    { label: 'Admin', icon: 'shield_person', command: () => (ctxRowLog = ctxRow + ' \u2192 Admin') },
                                    { label: 'Member', icon: 'person', command: () => (ctxRowLog = ctxRow + ' \u2192 Member') },
                                    { label: 'Guest', icon: 'person_outline', command: () => (ctxRowLog = ctxRow + ' \u2192 Guest') },
                                    { separator: true },
                                    { label: 'Remove from team', icon: 'person_remove', command: () => (ctxRowLog = ctxRow + ' removed') }]" />
          <p class="note">Result: <code>{{ ctxRowLog || 'right-click a person' }}</code></p>

          <h2>Template</h2>
          <p class="note">
            The <code>item</code> slot replaces a row's contents while the row keeps its
            click, hover and submenu behaviour — so a custom template never reimplements
            the menu.
          </p>
          <div ref="ctxTpl" class="ctx-zone" style="margin-top:12px">Right-click for a custom template</div>
          <ApexContextMenu :items="CTX_ITEMS" :target="() => ctxTpl">
            <template #item="{ item, branch }">
              <ApexIcon v-if="item.icon" :name="item.icon" :size="18" style="color:var(--accent-primary)" />
              <span class="apex-menu__label" style="font-weight:600">{{ item.label }}</span>
              <em v-if="item.hint" class="ctx-kbd">{{ item.hint }}</em>
              <ApexIcon v-if="branch" name="chevron_right" :size="18" class="apex-menu__chev" />
            </template>
          </ApexContextMenu>

          <h2>Router and links</h2>
          <p class="note">
            A row with <code>href</code> renders an anchor — <code>target="_blank"</code>
            and all. For programmatic routing use <code>command</code> and call the router
            there.
          </p>
          <div ref="ctxLinks" class="ctx-zone" style="margin-top:12px">Right-click for links</div>
          <ApexContextMenu :target="() => ctxLinks"
                           :items="[{ label: 'Open docs', icon: 'open_in_new', href: 'https://vuejs.org', target: '_blank' },
                                    { label: 'Go to dashboard', icon: 'dashboard', command: () => (ctxLog = 'router.push(/dashboard)') },
                                    { separator: true },
                                    { label: 'Unavailable', icon: 'block', disabled: true }]" />

          <h2>Permissions</h2>
          <p class="note">
            <code>can</code> hides a row from anyone the resolver denies, and the removals
            cascade: a submenu whose children have all gone is dropped with them, the header
            left over nothing goes, and the rules that framed the gap collapse.
          </p>
          <p class="note">
            This is the one control in the family with arrow-key navigation, and it walks
            the rendered rows rather than the model — so a denied row is not merely
            invisible, it is not in the cycle either.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div ref="ctxGate" class="ctx-zone" style="margin-top:12px">Right-click as the role above</div>
          <ApexContextMenu :items="ctxGated" :target="() => ctxGate" />
        </template>

        <!-- The gallery's six, ported. A dock only reads as a dock against
             the wallpaper it pins itself to. -->
        <template v-if="entry.id === 'dock'">
          <h2>Basic</h2>
          <p class="note">
            An <code>items</code> array of icons. The hovered icon and its neighbours grow,
            and the label appears on the outward side. <code>position</code> moves the strip
            to any edge.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSelectButton v-model="dockPos" :options="['bottom', 'top', 'left', 'right']" size="sm" />
          </div>
          <div class="dock-stage" :data-position="dockPos" style="margin-top:12px">
            <ApexDock :items="DOCK_ITEMS" :position="dockPos" blur
                      @item-click="dockLog = $event.item.label || ''" />
          </div>
          <p class="note">Last launched: <code>{{ dockLog || 'none yet' }}</code></p>

          <h2>Single action, or a speed dial</h2>
          <p class="note">
            A plain item runs its <code>command</code> on click. Give the same item a nested
            <code>items</code> array and the slot becomes a speed dial: clicking fans the
            children out from the dock, away from its edge, staggered. The dot under an icon
            marks a slot that holds more.
          </p>
          <pre class="doc-pre" v-pre>const items = [
  { icon: 'home', label: 'Home', command: goHome },        // single action
  { icon: 'add', label: 'New', items: [                    // speed dial
    { icon: 'description', label: 'Document', command: newDoc },
    { icon: 'table', label: 'Spreadsheet', command: newSheet },
    { icon: 'slideshow', label: 'Deck', command: newDeck },
  ] },
];</pre>
          <div class="dock-stage dock-stage--tall" data-position="bottom" style="margin-top:12px">
            <ApexDock :items="DOCK_MIXED" blur @item-click="dockLog = $event.item.label || ''" />
          </div>
          <p class="note">
            Last launched: <code>{{ dockLog || 'none yet' }}</code> — click
            <strong>New</strong> or <strong>Share</strong> to fan.
          </p>

          <h2>Badges and disabled</h2>
          <p class="note">
            An item takes a <code>badge</code> for a count, and <code>disabled</code> to grey
            out without removing it from the strip.
          </p>
          <div class="dock-stage" data-position="bottom" style="margin-top:12px">
            <ApexDock blur :items="[{ icon: 'mail', label: 'Inbox', badge: 12 },
                                    { icon: 'chat', label: 'Messages', badge: 3 },
                                    { icon: 'calendar_month', label: 'Calendar' },
                                    { icon: 'cloud_off', label: 'Offline', disabled: true }]" />
          </div>

          <h2>Size, chrome and magnification</h2>
          <p class="note">
            Every dimension is a prop, so the same component covers a chunky desktop dock and
            a compact toolbar rail. Turn <code>magnify</code> off where growth would be noise.
          </p>
          <div class="grid grid--2" style="margin-top:12px">
            <div class="cell"><span class="cell__tag">size="64", radius="26px"</span>
              <ApexDock :items="DOCK_ITEMS.slice(0, 4)" :size="64" radius="26px" blur />
            </div>
            <div class="cell"><span class="cell__tag">size="34", :magnify="false", no labels</span>
              <ApexDock :items="DOCK_ITEMS.slice(0, 4)" :size="34" :magnify="false"
                        :show-labels="false" radius="12px" />
            </div>
          </div>

          <h2>Custom item</h2>
          <p class="note">
            The <code>item</code> slot replaces an icon, which is where real app artwork or a
            tinted tile goes. It receives <code>inGroup</code>, so a fanned child can look
            different from a top-level slot.
          </p>
          <div class="dock-stage" data-position="bottom" style="margin-top:12px">
            <ApexDock :items="DOCK_TILES" blur :size="52">
              <template #item="{ item, inGroup }">
                <span class="dock-tile"
                      :style="{ background: String(item.tint), transform: inGroup ? 'scale(.86)' : 'none' }">
                  <ApexIcon :name="String(item.icon)" :size="inGroup ? 20 : 24" />
                </span>
              </template>
            </ApexDock>
          </div>

          <h2>Advanced — a desktop</h2>
          <p class="note">
            The dock with the rest of the kit: a toolbar as the menu bar, a right-click
            context menu on the wallpaper, and a dialog opened from a dock item.
          </p>
          <div class="dock-desk" style="margin-top:12px">
            <ApexToolbar size="sm" class="dock-desk__bar">
              <template #start>
                <ApexIcon name="apps" :size="18" />
                <strong style="font-size:12.5px">Apex OS</strong>
              </template>
              <template #end>
                <ApexIcon name="wifi" :size="16" />
                <ApexIcon name="volume_up" :size="16" />
                <span style="font-size:12px">13:07</span>
              </template>
            </ApexToolbar>
            <div ref="dockWall" class="dock-desk__wall">
              <p class="dock-desk__hint">Right-click the wallpaper · click a dock icon</p>
              <!-- The gallery marks this dock dock-desk__dock and styles nothing with it;
                   dropped rather than carried as a class that does nothing. -->
              <ApexDock blur :items="DOCK_DESK"
                        @item-click="dockLog = $event.item.label || ''" />
            </div>
            <ApexContextMenu :target="() => dockWall"
                             :items="[{ label: 'New folder', icon: 'create_new_folder' },
                                      { label: 'Change wallpaper', icon: 'wallpaper' },
                                      { separator: true },
                                      { label: 'View', icon: 'grid_view', items: [
                                        { label: 'Icons', icon: 'apps' },
                                        { label: 'List', icon: 'list' } ] }]" />
          </div>
          <ApexDialog v-model:visible="dockDialog" header="About this Mac" width="360px" dismissable-mask>
            <p>
              Opened from a dock item's <code>command</code>. The dock does not own the
              dialog — it just calls the callback.
            </p>
          </ApexDialog>

          <h2>Permissions</h2>
          <p class="note">
            <code>can</code> removes a slot from the strip, and the strip closes up around it
            — a dock is a row of positions, so a gap would read as a missing icon rather
            than as one you were never offered.
          </p>
          <p class="note">
            A group whose children are all denied goes with them, dot and all: an empty slot
            that fans onto nothing is worse than no slot.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div class="dock-stage" data-position="bottom" style="margin-top:12px">
            <ApexDock :items="dockGated" blur />
          </div>
        </template>

        <!-- The gallery's eight, ported. -->
        <template v-if="entry.id === 'megamenu'">
          <h2>Basic</h2>
          <p class="note">
            A root item with a <code>columns</code> array opens a panel; one without is a
            plain link. The panel grid is auto-fit on <code>columnMinWidth</code>, so the
            column count follows the available width.
          </p>
          <pre class="doc-pre" v-pre>const items = [
  { label: 'Sports', icon: 'sports_soccer', columns: [
    { header: 'Football', items: [{ label: 'Kits', href: '/kits' }, …] },
    { header: 'Running', items: […] },
  ] },
  { label: 'Pricing', href: '/pricing' },   // no panel
];</pre>
          <div class="mega-demo">
            <ApexMegaMenu :items="MEGA_BASIC" @item-click="megaLog = $event.item.label || ''" />
          </div>
          <p class="note">Last click: <code>{{ megaLog || 'none yet' }}</code></p>

          <h2>Trigger — hover or click</h2>
          <p class="note">
            <code>trigger</code> decides what opens the <em>first</em> panel. Either way,
            once one is open, moving across the bar switches panels without a second click
            — and moving onto a plain link closes it.
          </p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSegmented v-model="megaTrigger"
                           :options="[{ value: 'hover', label: 'hover' }, { value: 'click', label: 'click' }]"
                           label="trigger" label-placement="before" />
          </div>
          <div class="mega-demo">
            <ApexMegaMenu :items="MEGA_BASIC" :trigger="megaTrigger"
                          @item-click="megaLog = $event.item.label || ''" />
          </div>
          <p class="note">
            With <code>hover</code>, sweep the bar — Furniture, Electronics and Sports open
            as you pass. With <code>click</code>, the first panel waits for a click, then the
            same sweep works.
          </p>

          <h2>Images — category thumbnails</h2>
          <p class="note">
            A column takes an <code>image</code>, which sits above its heading. This is the
            retail shape: one thumbnail per category, links underneath.
          </p>
          <div class="mega-demo">
            <ApexMegaMenu :items="MEGA_IMAGES" column-min-width="150px"
                          @item-click="megaLog = $event.item.label || ''" />
          </div>
          <p class="note">
            The artwork here is placeholder SVG — pass real URLs in
            <code>column.image</code>.
          </p>

          <h2>Images — card grid</h2>
          <p class="note">
            A column with <code>layout="cards"</code> renders its items as image tiles
            instead of a list, and <code>span</code> widens it — here a narrow list of
            collections beside a three-column strip of recipes. A column's
            <code>footer</code> adds the closing link.
          </p>
          <div class="mega-demo">
            <ApexMegaMenu :items="MEGA_CARDS" card-min-width="140px"
                          @item-click="megaLog = $event.item.label || ''" />
          </div>

          <h2>Images — featured panel</h2>
          <p class="note">
            A <code>panel</code> block adds a featured image with copy and a call to action
            beside the columns, plus a row of image cards beneath them. Links can carry
            <code>help</code> for a second line, and <code>panelImagePosition</code> moves
            the feature to the other side.
          </p>
          <div class="mega-demo">
            <ApexMegaMenu :items="MEGA_PROMO" @item-click="megaLog = $event.item.label || ''" />
          </div>

          <h2>Vertical</h2>
          <p class="note">
            With <code>orientation="vertical"</code> the bar stacks and each panel opens to
            the side — for a sidebar nav.
          </p>
          <div class="mega-vert">
            <ApexMegaMenu :items="MEGA_BASIC" orientation="vertical" column-min-width="160px" />
          </div>

          <h2>Template — bar edges</h2>
          <p class="note">
            The <code>start</code> and <code>end</code> slots hold whatever the bar needs
            around the links: a brand mark, a search control, an avatar. Use them with
            <code>trigger="click"</code> when hover is too eager.
          </p>
          <div class="mega-demo">
            <ApexMegaMenu :items="MEGA_BASIC.slice(0, 3)" trigger="click" radius="999px" padding="8px 12px">
              <template #start>
                <ApexIcon name="bolt" :size="22" style="color:var(--accent-primary)" />
                <strong style="font-size:14px;letter-spacing:-.01em">APEX</strong>
              </template>
              <template #end>
                <ApexInput v-model="megaQuery" placeholder="Search" leading-icon="search"
                           label="Search" label-placement="hidden" size="sm" />
                <ApexAvatar label="Sarah Anderson" size="sm" />
              </template>
            </ApexMegaMenu>
          </div>

          <h2>Command and router</h2>
          <p class="note">
            Any link takes a <code>command</code>, which runs before <code>item-click</code>
            — that is the hook for programmatic routing. A link with <code>href</code>
            renders an anchor, so external URLs and <code>target="_blank"</code> work as they
            are.
          </p>
          <div class="mega-demo">
            <ApexMegaMenu :items="[{ label: 'Docs', columns: [
                            { header: 'Programmatic', items: [
                              { label: 'Dashboard', icon: 'dashboard', command: () => (megaLog = 'router.push(/dashboard)') },
                              { label: 'Settings', icon: 'settings', command: () => (megaLog = 'router.push(/settings)') }] },
                            { header: 'External', items: [
                              { label: 'Vue docs', icon: 'open_in_new', href: 'https://vuejs.org', target: '_blank' },
                              { label: 'Unavailable', icon: 'block', disabled: true }] }] },
                          { label: 'Support', href: '#' }]"
                          @item-click="megaLog = $event.item.label || ''" />
          </div>
          <p class="note">Result: <code>{{ megaLog || 'none yet' }}</code></p>

          <h2>Permissions</h2>
          <p class="note">
            The filter runs at all three levels of the model: a denied root item takes its
            whole panel with it, a denied column goes from a panel whose siblings stay, and a
            denied link goes from its column. One rule, applied wherever there is a list.
          </p>
          <p class="note">
            A root item whose columns have all gone is dropped too — a bar entry that opens
            an empty panel is worse than one that was never there.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div class="mega-demo">
            <ApexMegaMenu :items="megaGated" />
          </div>
        </template>

        <template v-if="entry.id === 'menu'">
          <h2>Basic</h2>
          <p class="note">
            Rows are data. A row with its own <code>items</code> is a group, and the
            default depends on depth: a top-level group is a static section label with its
            children shown, a nested one collapses. Sections are separated by
            <code>separator</code> rows, exactly as in the overlay menus.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexMenu :items="items" width="260px" /&gt;

const items = [
  { key: 'main', label: 'Workspace', items: [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Events', icon: 'event', badge: '4' },
  ] },
  { separator: true },
  { key: 'account', label: 'Account', items: [
    { label: 'Profile', icon: 'person', help: 'Name, email, password' },
  ] },
]</pre>
          <div class="tmenu-row">
            <ApexMenu :items="vmBasic" width="260px" />
          </div>

          <h2>Group — checkbox and radio rows</h2>
          <p class="note">
            A row is only markup until you put a control in it. The <code>item</code> slot
            keeps the row's behaviour and replaces its contents, so a filter list or a
            single-choice group lives in the menu rather than beside it.
          </p>
          <div class="tmenu-row">
            <ApexMenu :items="vmChoice" width="260px">
              <template #item="{ item }">
                <ApexCheckbox v-if="item.kind === 'check'"
                              v-model="vmChecks[String(item.key)]" :label="item.label" />
                <ApexRadio v-else-if="item.kind === 'radio'"
                           v-model="vmRadio" :value="String(item.key)" :label="item.label" />
                <span v-else class="vm-plain">
                  <ApexIcon v-if="item.icon" :name="item.icon" :size="18" />{{ item.label }}
                </span>
              </template>
            </ApexMenu>
          </div>
          <p class="pov-state">sort: <code>{{ vmRadio }}</code></p>

          <h2>Toggleable</h2>
          <p class="note">
            <code>toggleable</code> on the item overrides the depth default either way: a
            top-level group that collapses, or a nested one that stays open as a plain
            label.
          </p>
          <div class="tmenu-row">
            <ApexMenu :items="vmToggle" width="260px" />
          </div>

          <h2>Controlled</h2>
          <p class="note">
            Open state is an <code>expandedKeys</code> map with two-way binding, keyed by
            an item's <code>key</code> (or its label). Bind it and the menu can be driven
            from outside — expand all, collapse all, or restore what the user had
            last time.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexMenu :items="items" v-model:expandedKeys="open" /&gt;</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton size="sm" variant="text" @click="vmCtl?.expandAll()">expandAll()</ApexButton>
            <ApexButton size="sm" variant="text" @click="vmCtl?.collapseAll()">collapseAll()</ApexButton>
          </div>
          <div class="tmenu-row">
            <ApexMenu ref="vmCtl" :items="vmToggle" v-model:expandedKeys="vmKeys" width="260px" />
          </div>
          <p class="pov-state">expandedKeys: <code>{{ JSON.stringify(vmKeys) }}</code></p>

          <h2>Popup</h2>
          <p class="note">
            With <code>popup</code> the menu renders nothing until
            <code>toggle(event)</code> is called, and anchors to whatever was clicked
            — the same placement the popover uses.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton icon="account_circle" @click="vmPop?.toggle($event)">Account</ApexButton>
          </div>
          <ApexMenu ref="vmPop" :items="vmBasic" popup width="240px" side="bottom" align="start" />

          <h2>Template</h2>
          <p class="note">
            <code>start</code> and <code>end</code> bracket the list — a profile
            block above, a footer action below — and <code>submenulabel</code>
            replaces a group's label without touching its rows.
          </p>
          <div class="tmenu-row">
            <ApexMenu :items="vmBasic" width="260px">
              <template #start>
                <div class="vm-profile">
                  <ApexAvatar label="DD" size="sm" shape="circle" />
                  <span class="vm-profile__name">Duncan</span>
                </div>
              </template>
              <template #submenulabel="{ item }">
                <span class="vm-label">{{ item.label }}</span>
              </template>
              <template #end>
                <ApexButton size="sm" variant="text" icon="add">New workspace</ApexButton>
              </template>
            </ApexMenu>
          </div>

          <h2>Colour</h2>
          <p class="note">
            Every row state is a prop — resting, hovered, and the row marked
            <code>active</code> — so the menu can sit on a dark rail or a tinted
            panel without a stylesheet override. The icon follows the text colour on hover.
          </p>
          <div class="tmenu-row">
            <ApexMenu
              :items="vmBasic" width="240px"
              background="#101828" borderColor="#1f2a3c" textColor="#c7d2e4"
              labelColor="#7d8aa3" iconColor="#7aa2ff"
              hoverBackground="#182338" hoverTextColor="#ffffff"
              activeColor="#ffffff" activeBackground="#233250" radius="12px"
            />
          </div>

          <h2>Router and active state</h2>
          <p class="note">
            A row with an <code>href</code> renders as a real link, so middle-click and
            copy-address keep working; <code>active</code> marks the one you are on. A row
            runs its own <code>command</code> first, then the menu emits
            <code>item-click</code>.
          </p>
          <pre class="doc-pre" v-pre>{ label: 'Events', href: '/events', active: route.path === '/events' }</pre>
          <div class="tmenu-row">
            <ApexMenu :items="vmRouter" width="260px"
                      @item-click="vmPicked = $event.item.label || ''" />
          </div>
          <p class="pov-state">item-click: <code>{{ vmPicked || 'nothing yet' }}</code></p>

          <h2>Permissions</h2>
          <p class="note">
            <code>can</code> hides a row from anyone the resolver denies, and the removals
            cascade: a group whose children have all gone is dropped with them, since
            opening it would show nothing.
          </p>
          <p class="note">
            This menu has a second consequence the others do not.
            <code>expandAll()</code> and <code>collapseAll()</code> build the
            <code>expandedKeys</code> map by walking the model, and they walk the
            <em>filtered</em> one — so a group this user cannot see never appears in
            the map either. A consumer persisting that map to restore a sidebar between
            visits would otherwise save, and later reload, state for a menu it never
            showed.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
            <ApexButton size="sm" variant="text" @click="vmGate?.expandAll()">expandAll()</ApexButton>
          </div>
          <div class="tmenu-row">
            <ApexMenu ref="vmGate" :items="vmGated" v-model:expandedKeys="vmGateKeys" width="260px" />
          </div>
          <p class="pov-state">expandedKeys: <code>{{ JSON.stringify(vmGateKeys) }}</code></p>
        </template>

        <template v-if="entry.id === 'menubar'">
          <h2>Basic and submenus</h2>
          <p class="note">
            Root items sit on the bar; give one its own <code>items</code> and it drops a
            menu. The dropdown is the same renderer the context menu uses, so nesting,
            separators, headers and hints all behave identically. Once a menu is open,
            moving along the bar switches menus without another click — a bar that needed
            a second click for every sibling reads as broken.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexMenubar :items="items" /&gt;

const items = [
  { label: 'File', icon: 'folder', items: [
    { label: 'New', hint: '⌘N' },
    { separator: true },
    { label: 'Export', items: [{ label: 'PDF' }, { label: 'CSV' }] },
  ] },
  { label: 'Help', href: '/help' },
]</pre>
          <ApexMenubar :items="mbBasic" />

          <h2>Colour</h2>
          <p class="note">
            A root item has three states worth colouring — resting, hovered, and open —
            so a bar can sit on a dark chrome or a brand surface without a stylesheet
            override.
          </p>
          <ApexMenubar
            :items="mbBasic" class="mbar-demo"
            background="#101828" borderColor="#1f2a3c" textColor="#e6edf7"
            iconColor="#7aa2ff" hoverBackground="#182338" hoverTextColor="#ffffff"
            openBackground="#233250" openTextColor="#ffffff" radius="10px"
          />

          <h2>Template — bar edges</h2>
          <p class="note">
            <code>start</code> and <code>end</code> are the bar's edges: a logo on one
            side, a search box or an avatar on the other. The menus stay in the middle
            and keep their own behaviour.
          </p>
          <ApexMenubar :items="mbBasic" class="mbar-demo">
            <template #start>
              <span class="mbar-brand"><ApexIcon name="bolt" :size="18" /> Apex</span>
            </template>
            <template #end>
              <ApexAvatar label="DD" size="sm" shape="circle" />
            </template>
          </ApexMenubar>

          <h2>Command and router</h2>
          <p class="note">
            A row runs its own <code>command</code> first, then the bar emits
            <code>item-click</code> — for a root item or a child alike. A row with an
            <code>href</code> renders as a real link, so middle-click and copy-address
            keep working.
          </p>
          <ApexMenubar :items="mbCommand" class="mbar-demo"
                       @item-click="mbPicked = $event.item.label || ''" />
          <p class="pov-state">item-click: <code>{{ mbPicked || 'nothing yet' }}</code></p>

          <h2>Permissions</h2>
          <p class="note">
            <code>can</code> works at both levels here. A denied child is dropped from its
            dropdown; a denied root item leaves the bar entirely — and so does one whose
            children have all gone, since opening it would show an empty panel.
          </p>
          <p class="note">
            The bar's open index follows the filtered list, so a hidden root item cannot
            be reached by index either. As everywhere, this is presentation: the endpoint
            behind the row still has to authorise the request.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <ApexMenubar :items="mbGated" class="mbar-demo" />
          <p class="pov-state">
            A Viewer loses Settings from File, the whole Admin menu, and Reports — which
            had only gated children.
          </p>
        </template>

        <template v-if="entry.id === 'tieredmenu'">
          <h2>Basic</h2>
          <p class="note">
            Rows are data. Nest an <code>items</code> array on one and it becomes a branch,
            opening its submenu to the side — no extra component, and the overlay handles
            its own flip when it runs out of room.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexTieredMenu :items="items" /&gt;

const items = [
  { label: 'New file', icon: 'note_add', hint: '⌘N' },
  { label: 'Export', icon: 'download', items: [
    { label: 'PDF' }, { label: 'CSV' },
  ] },
  { separator: true },
  { header: 'Danger' },
  { label: 'Delete', icon: 'delete', disabled: true },
]</pre>
          <div class="tmenu-row">
            <ApexTieredMenu :items="tmBasic" width="240px" />
          </div>

          <h2>Popup</h2>
          <p class="note">
            With <code>popup</code> the panel renders nothing until
            <code>toggle(event)</code> is called, and anchors to whatever was clicked —
            the same placement the popover uses, so it flips and shifts to stay on screen.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexButton @click="tm.toggle($event)"&gt;File&lt;/ApexButton&gt;
&lt;ApexTieredMenu ref="tm" :items="items" popup side="bottom" align="start" /&gt;</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton icon="folder_open" @click="tmPop?.toggle($event)">File</ApexButton>
            <ApexButton severity="secondary" variant="outlined" icon="more_horiz"
                        @click="tmPop2?.toggle($event)">Anchored right</ApexButton>
          </div>
          <ApexTieredMenu ref="tmPop" :items="tmBasic" popup side="bottom" align="start" />
          <ApexTieredMenu ref="tmPop2" :items="tmBasic" popup side="bottom" align="end" />

          <h2>Template</h2>
          <p class="note">
            The <code>item</code> slot replaces a row's contents and nothing else — the row
            keeps its click, its hover, and its submenu, so a custom row never has to
            reimplement the menu.
          </p>
          <div class="tmenu-row">
            <ApexTieredMenu :items="tmTemplate" width="260px">
              <template #item="{ item, branch }">
                <ApexIcon v-if="item.icon" :name="item.icon" :size="18" />
                <span class="tmenu-tpl__label">{{ item.label }}</span>
                <ApexBadge v-if="item.count" :value="item.count" severity="info" />
                <ApexIcon v-if="branch" name="chevron_right" :size="18" class="tmenu-tpl__chev" />
              </template>
            </ApexTieredMenu>
          </div>

          <h2>Colour</h2>
          <p class="note">
            Every row state is a prop, so a menu can sit on a dark panel or a coloured
            surface without a stylesheet override.
          </p>
          <div class="tmenu-row">
            <ApexTieredMenu
              :items="tmBasic" width="230px"
              background="#101828" borderColor="#1f2a3c" textColor="#e6edf7"
              iconColor="#7aa2ff" hoverBackground="#182338" hoverTextColor="#ffffff"
              headerColor="#7d8aa3" hintColor="#5f6b82" separatorColor="#1f2a3c"
              radius="12px" rowRadius="8px" padding="8px"
            />
            <ApexTieredMenu
              :items="tmBasic" width="230px"
              background="#f4f0ff" borderColor="#ddd3ff" textColor="#2b1a5e"
              iconColor="#7c3aed" hoverBackground="#e9e0ff" hoverTextColor="#1a0f3d"
              radius="12px" rowRadius="8px"
            />
          </div>

          <h2>Command and router</h2>
          <p class="note">
            A row runs its own <code>command</code> first, then the menu emits
            <code>item-click</code>. Give a row an <code>href</code> instead and it renders
            as a real link — right-click, middle-click and copy-address all keep working.
          </p>
          <pre class="doc-pre" v-pre>{ label: 'Docs', href: '/docs', target: '_blank' }
{ label: 'Save', command: ({ item }) =&gt; save(item) }</pre>
          <div class="tmenu-row">
            <ApexTieredMenu :items="tmCommand" width="240px" @item-click="tmPicked = $event.item.label || ''" />
          </div>
          <p class="pov-state">item-click: <code>{{ tmPicked || 'nothing yet' }}</code></p>

          <h2>Permissions</h2>
          <p class="note">
            Give a row <code>can</code> and it is hidden from anyone the resolver denies.
            A bare string is the resource, asked about with <code>read</code>; the long form
            names the action. Hidden, not disabled — a greyed-out Delete still tells someone
            the action exists and that they do not have it.
          </p>
          <p class="note">
            The removals cascade, which is most of the work: a branch whose children all go
            is dropped with them, a header left over nothing goes, and the separators that
            framed the gap collapse. Nothing here authorises anything — the endpoint behind
            the row still has to.
          </p>
          <pre class="doc-pre" v-pre>app.use(ApexUI, {
  can: (action, resource) =&gt; auth.can(resource, action),
})

const items = [
  { label: 'Open' },
  { label: 'Settings', can: 'settings' },
  { label: 'Delete', can: { action: 'delete', resource: 'events' } },
]</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div class="tmenu-row">
            <ApexTieredMenu :items="tmGated" width="250px" />
          </div>
          <p class="pov-state">
            Nothing on this page is hard-coded to a role: the switch above changes one
            resolver, and the menu re-gates because the filter runs in a computed that
            reads it.
          </p>
        </template>

        <template v-if="entry.id === 'popover'">
          <h2>Basic</h2>
          <p class="note">
            The popover is reached through its ref, and the trigger's own event is the anchor —
            so nothing has to hold visible state or know where the panel will sit.
          </p>
          <pre class="doc-pre" v-pre>&lt;ApexButton @click="pov.toggle($event)"&gt;Show popover&lt;/ApexButton&gt;
&lt;ApexPopover ref="pov" width="280px"&gt;
  &lt;p&gt;Anything can go in here.&lt;/p&gt;
&lt;/ApexPopover&gt;</pre>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton icon="info" @click="povBasic?.toggle($event)">Show popover</ApexButton>
          </div>
          <ApexPopover ref="povBasic" width="280px">
            <p class="pov-lead">Anything can go in here</p>
            <p class="pov-body">
              Text, controls, a small form. The panel scrolls once it passes
              <code>maxHeight</code>.
            </p>
          </ApexPopover>

          <h2>Controlled</h2>
          <p class="note">
            Bind <code>v-model:visible</code> when the state belongs elsewhere — a keyboard
            shortcut, a route, another component. Pass the trigger element to
            <code>show()</code> to keep it anchored.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <span id="pov-anchor">
              <ApexButton severity="secondary" variant="outlined" icon="my_location">Anchor</ApexButton>
            </span>
            <ApexButton size="sm" variant="text" @click="povCtl?.show()">show()</ApexButton>
            <ApexButton size="sm" variant="text" @click="povCtl?.hide()">hide()</ApexButton>
            <ApexButton size="sm" variant="text" @click="povOn = !povOn">toggle v-model</ApexButton>
          </div>
          <p class="pov-state">visible: <code>{{ povOn }}</code></p>
          <ApexPopover ref="povCtl" v-model:visible="povOn" target="#pov-anchor" width="260px" side="right">
            <p class="pov-body">Open state lives outside, so the popover follows it either way.</p>
          </ApexPopover>

          <h2>One popover, several triggers</h2>
          <p class="note">
            Because the anchor comes from the event, a list needs one popover rather than one
            per row.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="c in CITIES.slice(0, 4)"
              :key="c.value"
              severity="secondary"
              variant="outlined"
              size="sm"
              @click="povRow = c; povShared?.show($event)"
            >{{ c.label }}</ApexButton>
          </div>
          <ApexPopover ref="povShared" width="240px">
            <p class="pov-lead">{{ povRow.label }}</p>
            <p class="pov-body">{{ povRow.help }}</p>
          </ApexPopover>

          <h2>Placement</h2>
          <p class="note">
            A preferred <code>side</code> and <code>align</code>, but the panel flips to the
            opposite side when the preferred one will not hold it, then shifts along the cross
            axis to stay on screen — the arrow keeps pointing at the trigger.
          </p>
          <div class="cpop-grid" style="margin-top: 12px">
            <ApexButton
              v-for="s in (['top', 'bottom', 'left', 'right'] as const)"
              :key="s"
              severity="secondary"
              variant="outlined"
              size="sm"
              @click="povSide = s; povPlace?.show($event)"
            >{{ s }}</ApexButton>
          </div>
          <ApexPopover ref="povPlace" :side="povSide" width="200px">
            <p class="pov-body">side="{{ povSide }}"</p>
          </ApexPopover>

          <h2>Rich content</h2>
          <p class="note">
            The default slot receives <code>hide</code>, so controls inside can close the panel.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              severity="secondary"
              variant="outlined"
              icon="flight"
              @click="povRich?.toggle($event)"
            >Track flight</ApexButton>
          </div>
          <ApexPopover ref="povRich" width="320px" padding="0" trap-focus>
            <template #default="{ hide }">
              <div class="pov-card">
                <div class="pov-card__head">
                  <span><strong>British Airways</strong><em>BA 178</em></span>
                  <span class="pov-card__tag">On time</span>
                </div>
                <div class="pov-card__leg">
                  <div><b>LHR</b><em>London</em><i>14:30</i></div>
                  <div class="pov-card__dur">8h 15m</div>
                  <div class="pov-card__to"><b>JFK</b><em>New York</em><i>18:45</i></div>
                </div>
                <div class="pov-card__foot">
                  <em>Gate B12 · Terminal 5</em>
                  <ApexButton size="sm" variant="text" icon="arrow_forward" @click="hide()">Done</ApexButton>
                </div>
              </div>
            </template>
          </ApexPopover>
        </template>

        <!-- Ported from the gallery, four sections. -->
        <template v-if="entry.id === 'drawer'">
          <h2>Position</h2>
          <p class="note">
            Four edges, plus <code>full</code> for a drawer that covers the viewport.
            <code>size</code> is the thickness on the panel's own axis, so the same value reads
            as width on the sides and height on the top and bottom.
          </p>
          <div class="cpop-grid" style="margin-top: 12px">
            <ApexButton
              v-for="p in (['left', 'right', 'top', 'bottom', 'full'] as const)"
              :key="p"
              severity="secondary"
              variant="outlined"
              size="sm"
              @click="drwPos = p; drwEx = true"
            >{{ p }}</ApexButton>
          </div>
          <ApexDrawer
            v-model:visible="drwEx"
            :position="drwPos"
            :header="`position='${drwPos}'`"
            size="340px"
            dismissable-mask
          >
            <p>Click the mask, press Escape, or use the close button.</p>
          </ApexDrawer>

          <h2>Responsive</h2>
          <p class="note">
            <code>responsiveSize</code> takes over below <code>breakpoint</code> — a 380px
            sidebar that becomes near full-width on a phone. Narrow the window to see it swap.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton severity="secondary" variant="outlined" icon="resize" @click="drwResp = true">
              Open responsive drawer
            </ApexButton>
          </div>
          <ApexDrawer
            v-model:visible="drwResp"
            header="Filters"
            size="380px"
            responsive-size="92vw"
            breakpoint="820px"
            dismissable-mask
          >
            <p>Below 820px this panel is 92vw wide; above it, 380px.</p>
          </ApexDrawer>

          <h2>Template</h2>
          <p class="note">
            Header, body and footer are slots, so a drawer holds a real working surface — here
            controls from the kit.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton severity="secondary" variant="outlined" icon="tune" @click="drwTpl = true">
              Open with a form
            </ApexButton>
          </div>
          <ApexDrawer
            v-model:visible="drwTpl"
            position="right"
            size="400px"
            header="New project"
            subtitle="Everything can be changed later"
            icon="folder"
            dismissable-mask
          >
            <div class="drw-form">
              <ApexInput v-model="drwForm.name" label="Project name" placeholder="Northwind" />
              <ApexSelect v-model="drwForm.zone" label="Region" :options="ZONE_OPTIONS" />
              <ApexTextarea v-model="drwForm.notes" label="Notes" :rows="3" />
            </div>
            <template #footer>
              <div class="cfm-actions">
                <ApexButton severity="secondary" variant="outlined" @click="drwTpl = false">Cancel</ApexButton>
                <ApexButton icon="check" @click="drwTpl = false">Create</ApexButton>
              </div>
            </template>
          </ApexDrawer>

          <h2>Floating and headless</h2>
          <p class="note">
            <code>inset</code> lifts the panel off the viewport edges and pairs with
            <code>radius</code> for a floating drawer. A <code>container</code> slot replaces
            header, body and footer outright, receiving <code>close</code>.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton severity="secondary" variant="outlined" icon="crop_free" @click="drwFloat = true">
              Floating
            </ApexButton>
            <ApexButton severity="secondary" variant="outlined" icon="code" @click="drwHeadless = true">
              Headless
            </ApexButton>
          </div>
          <ApexDrawer
            v-model:visible="drwFloat"
            position="right"
            size="360px"
            inset="16px"
            radius="16px"
            header="Floating"
            mask-blur
            dismissable-mask
          >
            <p>An inset of 16px and a matching radius, with the page behind blurred.</p>
          </ApexDrawer>
          <ApexDrawer v-model:visible="drwHeadless" position="bottom" size="220px" dismissable-mask>
            <template #container="{ close }">
              <div class="drw-headless">
                <strong>Your own surface</strong>
                <p>No header row, no body padding — just the panel and its slide-in.</p>
                <ApexButton
                  size="sm"
                  icon="close"
                  severity="secondary"
                  variant="outlined"
                  @click="close()"
                >Dismiss</ApexButton>
              </div>
            </template>
          </ApexDrawer>
        </template>

        <!-- Ported from the gallery, two sections. -->
        <template v-if="entry.id === 'dialog'">
          <h2>Positions</h2>
          <p class="note">
            Nine positions from one flex box — no per-position offsets to keep in step.
          </p>
          <div class="cfm-grid" style="margin-top: 12px">
            <ApexButton
              v-for="p in DLG_POSITIONS"
              :key="p"
              size="sm"
              severity="secondary"
              variant="outlined"
              @click="dlgPos = p"
            >{{ p }}</ApexButton>
          </div>
          <ApexDialog
            :visible="!!dlgPos"
            :position="dlgPos || 'center'"
            :header="dlgPos || ''"
            subtitle="Opened at this position"
            @update:visible="dlgPos = null"
          >
            <p>
              The panel is placed by <code>align-items</code> and <code>justify-content</code>
              on the mask.
            </p>
          </ApexDialog>

          <h2>Draggable, non-modal and timed</h2>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton severity="secondary" variant="outlined" icon="drag_pan" @click="dlgDrag = true">
              Draggable
            </ApexButton>
            <ApexButton severity="secondary" variant="outlined" icon="timer" @click="dlgTimer = true">
              Auto close
            </ApexButton>
          </div>
          <ApexDialog
            v-model:visible="dlgDrag"
            header="Drag me"
            subtitle="Grab the header"
            draggable
            icon="open_with"
            :modal="false"
          >
            <p>
              A non-modal dialog leaves the page behind interactive, so this one can be moved
              and left open while you scroll.
            </p>
          </ApexDialog>
          <ApexDialog
            v-model:visible="dlgTimer"
            header="Closing shortly"
            :auto-close="5000"
            show-timer
            icon="schedule"
          >
            <p>The bar at the foot drains as the timer runs.</p>
          </ApexDialog>
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

          <h2>Permissions</h2>
          <p class="note">
            The toolbar has no <code>can</code>, because it has no model — its three regions
            are slots, and a slot's contents belong to the caller. So the gating here is
            yours, written the way you would write any other conditional: ask the resolver
            and use a <code>v-if</code>.
          </p>
          <pre class="doc-pre" v-pre>const can = useCan();

&lt;ApexToolbar&gt;
  &lt;template #start&gt;
    &lt;ApexButton v-if="can('delete', 'events')" icon="delete"&gt;Delete&lt;/ApexButton&gt;
  &lt;/template&gt;
&lt;/ApexToolbar&gt;</pre>
          <p class="note">
            The other half is composition: a control that <em>does</em> gate keeps gating
            inside a toolbar. The split button below is the same one from its own page, and
            it filters here for the same reason it filters there — the bar is not involved.
          </p>
          <div class="iconstrip" style="margin-top: 12px">
            <ApexButton
              v-for="r in ROLES" :key="r" size="sm"
              :variant="docsRole === r ? 'filled' : 'outlined'"
              :severity="docsRole === r ? 'primary' : 'secondary'"
              @click="docsRole = r"
            >{{ r }}</ApexButton>
          </div>
          <div style="margin-top:12px" data-gated>
            <ApexToolbar>
              <template #start>
                <ApexButton severity="secondary" variant="text" icon="add" size="sm">New</ApexButton>
                <ApexButton v-if="pageCan('delete', 'events')" severity="danger" variant="text"
                            icon="delete" size="sm">Delete</ApexButton>
              </template>
              <template #end>
                <ApexSplitButton label="Save" icon="check" size="sm" :model="splitGated"
                                 @item-click="onMenuClick" />
              </template>
            </ApexToolbar>
          </div>
          <p class="note">
            As the Viewer the Delete button is gone from the bar and the split button's menu
            is down to one row. Two mechanisms, one resolver — which is the point of the
            resolver being an app-level function rather than a prop on each control.
          </p>

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
  <!-- The groupless popup, which is what a confirm() carrying a target but no
       group lands in. The Template and Headless sections mount their own,
       grouped, so those requests reach them instead of this one. -->
  <ApexConfirmPopup />
</template>
