<script setup lang="ts">
/**
 * ApexScheduler — a resource timeline over `core/scheduler`.
 *
 * Every date, lane and recurrence calculation lives in the core, which the
 * hand-written mirror (`web/apex-ui-scheduler.js`) loads too. This file is only
 * a renderer: two-tier header, grouped row heads, a continuous track for the day
 * and quarter-hour views and discrete cells for month and year.
 *
 * Nothing here mutates `events`. Every interaction emits a payload describing
 * the change, the same rule ApexTaskBoard follows, so optimistic update,
 * rollback and server validation stay with the application.
 *
 * `mode`, `anchor` and `groupKeys` are held locally and re-synced from the props
 * when they change, so the component works both controlled (bind and listen)
 * and uncontrolled (pass an initial value and let it navigate itself).
 */
import { computed, onBeforeUnmount, onMounted, nextTick, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexButton from './ApexButton.vue';
import ApexInput from './ApexInput.vue';
import ApexSelect from './ApexSelect.vue';
import ApexSelectButton from './ApexSelectButton.vue';
import ApexDatePicker from './ApexDatePicker.vue';
import ApexDialog from './ApexDialog.vue';
import {
  buildAxis, axisOffset, allGroupIds, flattenNodes, groupRooms, instancesByResource,
  lanesFor, rowHeight, ruleText, ruleToRepeat, repeatToRule, snapToAxis,
  fmtDateShort, fmtTime, sameDay,
  HOUR_MS, LANE, LANE_GAP, LANE_PAD, GROUP_H, DISCRETE_H, MONTHS_F, WD_F,
  DEFAULT_TYPES, type SchedulerTypeMeta,
  type RepeatPreset, type SchedulerEvent, type SchedulerInstance,
  type SchedulerMode, type SchedulerNode, type SchedulerResource,
} from '../core/scheduler';
import type { ApexSchedulerClasses } from '../types';
import { inlineEndDistance, inlineOffset, pointerAnchor } from '../core/anchor';
import { resolveApexLocale } from '../core/locale';
import { applyScope, type RecurrenceScope } from '../core/recurrence';

/** An event type in the app's own vocabulary, mapped to a design-system tone. */
export type { SchedulerTypeMeta };
export interface SchedulerGroupField { key: string; label: string; icon?: string }
export interface SchedulerSavePayload {
  id?: string; resourceId: string; type: string; title: string;
  start: number; end: number; rrule: string | null;
}
export interface SchedulerMovePayload {
  id: string;
  resourceId?: string;
  start: number;
  end: number;
  /** Which occurrences the change applies to. `all` for a one-off. */
  scope?: RecurrenceScope;
  occurrenceStart?: number;
  /** The record to persist, and a second one when the scope split the series. */
  update?: Record<string, unknown>;
  create?: Record<string, unknown>;
}

const TONE_COLOUR: Record<string, string> = {
  info: 'var(--apex-blue-500)', success: 'var(--accent-success)', warn: 'var(--accent-warning)',
  danger: 'var(--accent-danger)', help: 'var(--accent-help)', neutral: 'var(--apex-n-500)',
};
const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexSchedulerClasses. */
  ui?: ApexSchedulerClasses;
  resources?: SchedulerResource[];
  events?: SchedulerEvent[];
  mode?: SchedulerMode;
  anchor?: Date;
  /** Which resource fields to nest by, outermost first. */
  groupKeys?: string[];
  /** The fields the grouping bar offers, in master order. Empty hides the bar. */
  groupFields?: SchedulerGroupField[];
  types?: Record<string, SchedulerTypeMeta>;
  /** What one row is called, for the corner and the grouping bar. */
  leafLabel?: string;
  leafIcon?: string;
  /** The row's own label; defaults to the resource's `room`. */
  resourceName?: (r: SchedulerResource) => string;
  /** The line under it — capacity, building, whatever the app knows. */
  resourceSub?: (r: SchedulerResource) => string;
  height?: string;
  resourceWidth?: string;
  draggable?: boolean;
  /** Drag the trailing edge to change a booking's length. */
  resizable?: boolean;
  /**
   * The id given to the new series when a scoped write splits one.
   * "This and following" produces TWO records; the second needs an id.
   */
  newId?: (inst: SchedulerInstance) => string;
  creatable?: boolean;
  /** Render the built-in popover and create/edit dialog. Off: emit and nothing else. */
  inlineEditor?: boolean;
  showToolbar?: boolean;
  showGrouping?: boolean;
  showLegend?: boolean;
  /** Events drawn in a month or year cell before it reads "+N more". */
  chipsPerCell?: number;
  /** Where a continuous view starts scrolled to. */
  scrollToHour?: number;
}>(), {
  resizable: true,
  mode: 'day', leafLabel: 'Resource', leafIcon: 'meeting_room',
  height: '70vh', resourceWidth: '300px',
  draggable: true, creatable: true, inlineEditor: true,
  showToolbar: true, showGrouping: true, showLegend: true,
  chipsPerCell: 2, scrollToHour: 7,
  resources: () => [], events: () => [], groupKeys: () => [], groupFields: () => [],
  types: () => DEFAULT_TYPES,
  anchor: () => new Date(),
});

const emit = defineEmits<{
  (e: 'update:mode', v: SchedulerMode): void;
  (e: 'update:anchor', v: Date): void;
  (e: 'update:groupKeys', v: string[]): void;
  (e: 'event-move', payload: SchedulerMovePayload): void;
  /** The same payload. Separate because a host routinely permits one and refuses the other. */
  (e: 'event-resize', payload: SchedulerMovePayload): void;
  (e: 'event-click', payload: { instance: SchedulerInstance; originalEvent: PointerEvent | MouseEvent }): void;
  (e: 'event-save', payload: SchedulerSavePayload): void;
  (e: 'event-delete', payload: { id: string }): void;
  (e: 'create-request', payload: { resourceId: string; start: number; type: string }): void;
  (e: 'range-change', payload: { from: number; to: number; mode: SchedulerMode }): void;
}>();

const localMode = ref<SchedulerMode>(props.mode);
const localAnchor = ref<Date>(props.anchor);
const localKeys = ref<string[]>([...props.groupKeys]);
watch(() => props.mode, (v) => { localMode.value = v; });
watch(() => props.anchor, (v) => { localAnchor.value = v; });
watch(() => props.groupKeys, (v) => { localKeys.value = [...v]; });

/* Absence means OPEN, so a newly grouped tree arrives expanded. */
const expanded = ref<Record<string, boolean>>({});
const scrollEl = ref<HTMLElement | null>(null);
const nowMs = ref(Date.now());
let clock: number | undefined;

const pop = ref<{ inst: SchedulerInstance; x: number; y: number } | null>(null);
const ctx = ref<{ resourceId: string; start: number; x: number; y: number } | null>(null);
const drag = ref<{ x: number; y: number; tone: string; title: string; label: string } | null>(null);

interface EditorState {
  id?: string; resourceId: string; title: string; type: string;
  start: Date; durMin: number; repeat: RepeatPreset;
}
const editor = ref<EditorState | null>(null);

const axis = computed(() => buildAxis(localMode.value, localAnchor.value));
const tree = computed<SchedulerNode[]>(() => groupRooms(props.resources, localKeys.value));
const rows = computed(() => flattenNodes(tree.value, expanded.value));
const instances = computed(() => instancesByResource(props.events, axis.value));

const rootStyle = computed(() => ({ '--apex-sched-leftw': props.resourceWidth, '--apex-sched-h': props.height }));
const typeList = computed(() => Object.keys(props.types).map((key) => {
  const m = props.types[key];
  return {
    key,
    label: m.label,
    icon: m.icon || 'event',
    tone: m.tone || 'info',
    createLabel: m.createLabel || `Create ${m.label.toLowerCase()}`,
  };
}));
const modeOptions = [
  { label: 'Year', value: 'year' }, { label: 'Month', value: 'month' },
  { label: 'Day', value: 'day' }, { label: '15 min', value: 'quarter' },
];
const typeOptions = computed(() => typeList.value.map((t) => ({ label: t.label, value: t.key })));
const resourceOptions = computed(() => props.resources.map((r) => ({ label: name(r), value: r.id })));
const durationOptions = DURATIONS.map((d) => ({
  label: d < 60 ? `${d} min` : `${d / 60} hr${d >= 120 ? 's' : ''}`, value: d,
}));
const repeatOptions = [
  { label: 'Does not repeat', value: 'none' }, { label: 'Daily', value: 'daily' },
  { label: 'Every weekday (Mon–Fri)', value: 'weekdays' },
  { label: 'Weekly on this day', value: 'weekly' }, { label: 'Monthly', value: 'monthly' },
];

const rangeLabel = computed(() => {
  const a = localAnchor.value;
  if (localMode.value === 'year') return String(a.getFullYear());
  if (localMode.value === 'month') return `${MONTHS_F[a.getMonth()]} ${a.getFullYear()}`;
  return `${WD_F[a.getDay()]}, ${a.getDate()} ${MONTHS_F[a.getMonth()]} ${a.getFullYear()}`;
});
const cornerSub = computed(() => {
  const n = props.resources.length;
  const g = localKeys.value.length;
  return `${n} ${props.leafLabel.toLowerCase()}${n === 1 ? '' : 's'} · ${g} group level${g === 1 ? '' : 's'}`;
});

/* The column rules are painted, not drawn: one background on the track rather
   than 96 empty divs behind every row. */
const gridImage = computed(() => {
  const a = axis.value;
  if (!a.continuous) return undefined;
  const major = a.mode === 'day' ? a.colWidth : a.colWidth * 4;
  const minor = a.mode === 'day' ? a.colWidth / 4 : a.colWidth;
  return `repeating-linear-gradient(90deg, var(--border-default) 0 1px, transparent 1px ${major}px), `
    + `repeating-linear-gradient(90deg, var(--border-subtle) 0 1px, transparent 1px ${minor}px)`;
});
const nowLeft = computed(() => {
  const a = axis.value;
  if (!a.continuous || !sameDay(new Date(nowMs.value), localAnchor.value)) return null;
  return axisOffset(a, nowMs.value);
});

interface Block {
  inst: SchedulerInstance; left: number; width: number; top: number;
  compact: boolean; showTime: boolean;
}
interface Cell { key: number; today: boolean; shown: SchedulerInstance[]; more: number }
interface RowModel {
  key: string; kind: 'group' | 'cont' | 'discrete'; id: string; depth: number; height: number;
  name: string; sub?: string; icon: string; count?: string; open?: boolean;
  resourceId?: string; blocks?: Block[]; cells?: Cell[];
}

/* Built once per data change: a row that packs its own lanes inside the template
   re-runs the packing on every unrelated re-render. */
const rowModels = computed<RowModel[]>(() => {
  const a = axis.value;
  const out: RowModel[] = [];
  rows.value.forEach(({ node, depth }) => {
    if (!node.leaf) {
      const field = props.groupFields.find((f) => f.key === node.type);
      out.push({
        key: node.id, kind: 'group', id: node.id, depth, height: GROUP_H,
        name: node.name, icon: field?.icon || 'folder',
        count: `${node.count} ${node.count === 1 ? props.leafLabel.toLowerCase() : `${props.leafLabel.toLowerCase()}s`}`,
        open: expanded.value[node.id] !== false,
      });
      return;
    }
    const r = node.room;
    const evs = instances.value[r.id] || [];
    const head = {
      key: node.id, id: node.id, depth, name: name(r), sub: sub(r), icon: props.leafIcon, resourceId: r.id,
    };
    if (a.continuous) {
      const from = a.rangeStart || 0;
      const to = from + (a.span || 0);
      const { placed, laneCount } = lanesFor(evs.filter((e) => e.start < to && e.end > from));
      const height = rowHeight(laneCount);
      out.push({
        ...head, kind: 'cont', height,
        blocks: placed.map(({ ev, lane }) => {
          const left = axisOffset(a, ev.start);
          const width = Math.max(6, axisOffset(a, ev.end) - left);
          return {
            inst: ev, left, width, top: LANE_PAD + lane * (LANE + LANE_GAP),
            compact: width < 76, showTime: width > 110,
          };
        }),
      });
      return;
    }
    const cols = a.cols || [];
    out.push({
      ...head, kind: 'discrete', height: DISCRETE_H,
      cells: cols.map((c, i) => {
        const inCell = evs.filter((e) => e.start < c.end && e.end > c.start)
          .sort((x, y) => x.start - y.start);
        return {
          key: i, today: !!c.today, shown: inCell.slice(0, props.chipsPerCell),
          more: Math.max(0, inCell.length - props.chipsPerCell),
        };
      }),
    });
  });
  return out;
});

const popStyle = computed(() => {
  const p = pop.value;
  if (!p) return {};
  return {
    insetInlineStart: `${Math.min(p.x, window.innerWidth - 296)}px`,
    insetBlockStart: `${Math.min(p.y, window.innerHeight - 260)}px`,
  };
});
const ctxStyle = computed(() => {
  const c = ctx.value;
  if (!c) return {};
  return {
    insetInlineStart: `${Math.min(c.x, window.innerWidth - 226)}px`,
    insetBlockStart: `${Math.min(c.y, window.innerHeight - 60 - typeList.value.length * 36)}px`,
  };
});

function name(r: SchedulerResource) {
  return props.resourceName ? props.resourceName(r) : String(r.room ?? r.id);
}
function sub(r: SchedulerResource) { return props.resourceSub ? props.resourceSub(r) : undefined; }
function resourceLabel(id: string) {
  const r = props.resources.find((x) => x.id === id);
  return r ? name(r) : id;
}
function meta(type: string) { return props.types[type] || DEFAULT_TYPES.event; }
function tone(type: string) { return meta(type).tone || 'info'; }
function icon(type: string) { return meta(type).icon || 'event'; }
function label(type: string) { return meta(type).label; }
function toneColour(t: string) { return TONE_COLOUR[t] || TONE_COLOUR.info; }
function time(ms: number) { return fmtTime(ms); }
function dateShort(ms: number) { return fmtDateShort(ms); }
function blockTitle(inst: SchedulerInstance) {
  const base = `${inst.title} · ${fmtTime(inst.start)}–${fmtTime(inst.end)}`;
  return inst.recurring && inst.rrule ? `${base} · ${ruleText(inst.rrule)}` : base;
}
function canDrag(inst: SchedulerInstance) {
  /* A recurring occurrence IS draggable now: the shared recurrence core can
     express "this occurrence / this and following / all", so the gesture pauses on
     that question instead of being refused. The old refusal was honest with no
     exception model; with one it would be a limitation. */
  return props.draggable && axis.value.continuous && !!inst;
}
function canResize(inst: SchedulerInstance) { return props.resizable && canDrag(inst); }
/** Move or resize, from where in the block the pointer landed. */
function edgeMode(e: PointerEvent): 'move' | 'resize' {
  if (!props.resizable) return 'move';
  /* The trailing edge is the INLINE-end one, which is the left in RTL. */
  return inlineEndDistance(e.currentTarget as HTMLElement, e.clientX) <= 8 ? 'resize' : 'move';
}
const loc = computed(() => resolveApexLocale());
/**
 * The `#event` slot's bindings, declared ONCE, in the same shape ApexCalendar
 * binds — a host using both components learns one context, not two.
 */
function eventCtx(inst: SchedulerInstance, over: { compact?: boolean } = {}) {
  return {
    event: inst,
    compact: !!over.compact,
    clipped: { start: false, end: false },
    tone: tone(inst.type),
    view: localMode.value,
    time: `${fmtTime(inst.start)}–${fmtTime(inst.end)}`,
  };
}
/* A row head is built as DATA (name, sub, icon, resourceId), so the slot is
   handed the resource itself rather than making a host look it up. */
function resourceOf(row: { resourceId?: string }) {
  return row.resourceId ? props.resources.find((r) => r.id === row.resourceId) : undefined;
}
const scopePrompt = ref<{
  mode: 'move' | 'resize'; inst: SchedulerInstance; start: number; end: number;
  resourceId?: string; x: number; y: number;
} | null>(null);

/**
 * The same three operations the calendar performs, through the same core
 * function — "this and following" SPLITS the series, so the payload sometimes
 * describes two records. The existing `{ id, resourceId, start, end }` fields are
 * kept alongside, so a host written before this slice keeps working.
 */
function commitEdit(
  mode: 'move' | 'resize', inst: SchedulerInstance, start: number, end: number,
  resourceId: string | undefined, scope: RecurrenceScope,
) {
  const source = (props.events || []).find((ev) => ev.id === inst.id) || inst;
  const patch: Record<string, unknown> = { start, end };
  if (resourceId && resourceId !== inst.roomId) patch.roomId = resourceId;
  const written = applyScope(
    source as never, inst.originalStart ?? inst.start, scope, patch as never,
    props.newId ? props.newId(inst) : `${inst.id}-${Date.now().toString(36)}`,
  );
  scopePrompt.value = null;
  /* Two calls rather than a ternary event name: `emit(cond ? 'a' : 'b', p)`
     cannot resolve against a typed emits declaration (TS2769). */
  const payload = {
    id: inst.id, resourceId, start, end, scope,
    occurrenceStart: inst.originalStart ?? inst.start,
    update: written.update as unknown as Record<string, unknown>,
    create: written.create as unknown as Record<string, unknown> | undefined,
  };
  if (mode === 'resize') emit('event-resize', payload);
  else emit('event-move', payload);
}
function chooseScope(scope: RecurrenceScope) {
  const p = scopePrompt.value;
  if (p) commitEdit(p.mode, p.inst, p.start, p.end, p.resourceId, scope);
}
function cancelScope() { scopePrompt.value = null; }
/* The same expression the calendar uses — the prompt belongs AT the gesture, and
   the shared helper is the only thing that keeps them agreeing. */
/**
 * The three write scopes as DATA, so the prompt's markup does not restate them
 * and a host template can render them its own way. The same shape ApexCalendar
 * exposes — one question asked in two places, so one definition of its options.
 */
const scopeOptions = computed(() => [
  { scope: 'this' as RecurrenceScope, label: loc.value.t('scopeThis') },
  { scope: 'following' as RecurrenceScope, label: loc.value.t('scopeFollowing') },
  { scope: 'all' as RecurrenceScope, label: loc.value.t('scopeAll') },
]);
function closePop() { pop.value = null; }

const scopeStyle = computed(() => {
  const p = scopePrompt.value;
  return p ? pointerAnchor(p.x, p.y, 270, 230) : {};
});
function trackStyle(row: RowModel) {
  return {
    inlineSize: `${axis.value.timelineW}px`,
    blockSize: `${row.height}px`,
    backgroundImage: row.kind === 'cont' ? gridImage.value : undefined,
  };
}

function setMode(v: unknown) {
  if (!v) return;
  localMode.value = v as SchedulerMode;
  emit('update:mode', localMode.value);
}
function setAnchor(d: Date) { localAnchor.value = d; emit('update:anchor', d); }
function step(dir: number) {
  const a = new Date(localAnchor.value);
  if (localMode.value === 'year') a.setFullYear(a.getFullYear() + dir);
  else if (localMode.value === 'month') a.setMonth(a.getMonth() + dir);
  else a.setDate(a.getDate() + dir);
  setAnchor(a);
}
function goToday() { setAnchor(new Date()); }
function toggleKey(k: string) {
  /* Master order, not click order: "building then floor" is a hierarchy, and
     letting the order of clicks decide it produces a tree nobody asked for. */
  const has = localKeys.value.includes(k);
  const next = props.groupFields
    .map((f) => f.key)
    .filter((key) => (key === k ? !has : localKeys.value.includes(key)));
  localKeys.value = next;
  emit('update:groupKeys', next);
}
function toggleGroup(id: string) {
  expanded.value = { ...expanded.value, [id]: expanded.value[id] === false };
}
function expandAll() { expanded.value = {}; }
function collapseAll() {
  const o: Record<string, boolean> = {};
  allGroupIds(tree.value).forEach((id) => { o[id] = false; });
  expanded.value = o;
}

function openPop(inst: SchedulerInstance, e: MouseEvent) {
  emit('event-click', { instance: inst, originalEvent: e });
  if (props.inlineEditor) pop.value = { inst, x: e.clientX, y: e.clientY };
}
function openCreate(resourceId: string, start: number, type?: string) {
  const t = type || typeList.value[0]?.key || 'event';
  if (!props.inlineEditor) { emit('create-request', { resourceId, start, type: t }); return; }
  editor.value = {
    resourceId, title: '', type: t, start: new Date(start), durMin: 60, repeat: 'none',
  };
}
function openEdit(inst: SchedulerInstance) {
  pop.value = null;
  if (!props.inlineEditor) { emit('event-click', { instance: inst, originalEvent: new MouseEvent('click') }); return; }
  /* The SERIES start, not the occurrence's: editing a repeating booking from its
     third occurrence must not silently re-anchor the rule to that date. */
  const base = props.events.find((e) => e.id === inst.id) || inst;
  editor.value = {
    id: inst.id, resourceId: base.roomId, title: base.title, type: base.type,
    start: new Date(base.start), durMin: Math.max(15, Math.round((base.end - base.start) / 60000)),
    repeat: ruleToRepeat(base.rrule),
  };
}
function saveEditor() {
  const ed = editor.value;
  if (!ed) return;
  const start = ed.start.getTime();
  emit('event-save', {
    id: ed.id, resourceId: ed.resourceId, type: ed.type,
    title: ed.title || label(ed.type), start, end: start + ed.durMin * 60000,
    rrule: repeatToRule(ed.repeat, start),
  });
  editor.value = null;
}
function deleteEvent(id: string) {
  emit('event-delete', { id });
  pop.value = null;
  editor.value = null;
}
function onDialogVisible(v: boolean) { if (!v) editor.value = null; }

function onTrackContext(e: MouseEvent, resourceId: string) {
  if (!props.creatable) return;
  e.preventDefault();
  const a = axis.value;
  /* Measured from the INLINE-start edge: the timeline's time origin is on the
     right in RTL, and a left-based measurement returns a mirrored time. */
  const xRel = inlineOffset(e.currentTarget as HTMLElement, e.clientX);
  let start: number;
  if (a.continuous) start = snapToAxis(a, (a.rangeStart || 0) + (xRel / a.timelineW) * (a.span || 0));
  else {
    const cols = a.cols || [];
    const i = Math.max(0, Math.min(cols.length - 1, Math.floor(xRel / a.colWidth)));
    /* Midday, not midnight: a day cell has no time, and 00:00 is a worse guess
       than the middle of the working day. */
    start = cols.length ? cols[i].start + 12 * HOUR_MS : Date.now();
  }
  ctx.value = { resourceId, start, x: e.clientX, y: e.clientY };
}
function createFromCtx(type: string) {
  const c = ctx.value;
  if (!c) return;
  ctx.value = null;
  openCreate(c.resourceId, c.start, type);
}

/* ─── drag to move ───────────────────────────────────────────
   Pointer events, and the drop target is read from the DOM under the pointer
   rather than from geometry we would have to keep in step with the layout. */
interface DragState {
  mode: 'move' | 'resize';
  inst: SchedulerInstance; dur: number; grabOffX: number; startX: number; startY: number;
  moved: boolean; resourceId: string; newStart: number; newEnd: number;
}
let dragState: DragState | null = null;

function onBlockDown(e: PointerEvent, inst: SchedulerInstance) {
  if (!axis.value.continuous || !canDrag(inst)) {
    /* Still clickable: a block that cannot be dragged opens its popover. */
    dragState = null;
    openPop(inst, e);
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  dragState = {
    mode: edgeMode(e),
    inst, dur: inst.end - inst.start, grabOffX: inlineOffset(e.currentTarget as HTMLElement, e.clientX),
    startX: e.clientX, startY: e.clientY, moved: false,
    resourceId: inst.roomId, newStart: inst.start, newEnd: inst.end,
  };
  window.addEventListener('pointermove', onDragMove);
  window.addEventListener('pointerup', onDragUp);
}
function onDragMove(e: PointerEvent) {
  const d = dragState;
  if (!d) return;
  if (!d.moved && Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 4) {
    d.moved = true;
    document.body.dataset.schedDragging = d.mode;
  }
  if (!d.moved) return;
  const a = axis.value;
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
  const track = el?.closest('.apex-sched__track[data-resource-id]') as HTMLElement | null;
  if (track) {
    if (d.mode === 'resize') {
      /* The trailing edge follows the pointer; the start is untouched. A floor of
         15 minutes, so a gesture meant to shorten a booking cannot delete it. */
      const at = (a.rangeStart || 0) + (inlineOffset(track, e.clientX) / a.timelineW) * (a.span || 0);
      d.newEnd = Math.max(d.inst.start + 15 * 60000, snapToAxis(a, at));
      d.newStart = d.inst.start;
    } else {
      const xRel = inlineOffset(track, e.clientX) - d.grabOffX;
      d.newStart = snapToAxis(a, (a.rangeStart || 0) + (xRel / a.timelineW) * (a.span || 0), d.dur);
      d.newEnd = d.newStart + d.dur;
      d.resourceId = track.getAttribute('data-resource-id') || d.resourceId;
    }
  }
  drag.value = {
    x: e.clientX, y: e.clientY, tone: tone(d.inst.type), title: d.inst.title,
    label: `${fmtTime(d.newStart)}–${fmtTime(d.newEnd)} · ${resourceLabel(d.resourceId)}`,
  };
}
function onDragUp(e: PointerEvent) {
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragUp);
  const d = dragState;
  dragState = null;
  drag.value = null;
  delete document.body.dataset.schedDragging;
  if (!d) return;
  if (!d.moved) { openPop(d.inst, e); return; }
  /* A recurring occurrence cannot be moved without answering WHICH occurrences
     the change applies to, so the gesture pauses on the question rather than
     guessing. */
  if (d.inst.recurring) {
    scopePrompt.value = {
      mode: d.mode, inst: d.inst, start: d.newStart, end: d.newEnd,
      resourceId: d.resourceId, x: e.clientX, y: e.clientY,
    };
    return;
  }
  commitEdit(d.mode, d.inst, d.newStart, d.newEnd, d.resourceId, 'all');
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return;
  pop.value = null;
  ctx.value = null;
  scopePrompt.value = null;
}

function restoreScroll() {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollLeft = axis.value.continuous
    ? (props.scrollToHour / 24) * axis.value.timelineW
    : 0;
}

watch(axis, (a) => {
  emit('range-change', {
    from: a.continuous ? (a.rangeStart || 0) : (a.cols?.[0]?.start || 0),
    to: a.continuous ? (a.rangeStart || 0) + (a.span || 0)
      : (a.cols?.[a.cols.length - 1]?.end || 0),
    mode: a.mode,
  });
  nextTick(restoreScroll);
}, { immediate: true });

onMounted(() => {
  restoreScroll();
  window.addEventListener('keydown', onKey);
  clock = window.setInterval(() => { nowMs.value = Date.now(); }, 60000);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener('pointermove', onDragMove);
  window.removeEventListener('pointerup', onDragUp);
  if (clock) window.clearInterval(clock);
  delete document.body.dataset.schedDragging;
});

defineExpose({ openCreate, expandAll, collapseAll, goToday, step });
</script>

<template>
  <div class="apex-sched" :class="ui?.root" :style="rootStyle">
    <div v-if="showToolbar" class="apex-sched__toolbar" :class="ui?.toolbar">
      <ApexSelectButton :model-value="localMode" :options="modeOptions" :allow-empty="false"
                        label="Granularity" label-placement="hidden" @update:model-value="setMode" />
      <div class="apex-sched__nav" :class="ui?.nav">
        <button type="button" aria-label="Previous" @click="step(-1)"><ApexIcon name="chevron_left" :size="16" /></button>
        <button type="button" data-today="true" @click="goToday">Today</button>
        <button type="button" aria-label="Next" @click="step(1)"><ApexIcon name="chevron_right" :size="16" /></button>
      </div>
      <div class="apex-sched__range" :class="ui?.range">{{ rangeLabel }}</div>
      <div class="apex-sched__spacer" :class="ui?.spacer"></div>
      <div v-if="showLegend" class="apex-sched__legend" :class="ui?.legend">
        <span v-for="t in typeList" :key="t.key">
          <i class="apex-sched__swatch" :class="ui?.swatch" :style="{ background: toneColour(t.tone) }"></i>{{ t.label }}
        </span>
        <span><ApexIcon name="repeat" :size="13" />Recurring</span>
      </div>
    </div>

    <div v-if="showGrouping && groupFields.length" class="apex-sched__grouping" :class="ui?.grouping">
      <span class="apex-sched__glabel" :class="ui?.groupLabel">Group by</span>
      <button v-for="f in groupFields" :key="f.key" type="button" class="apex-sched__gchip" :class="ui?.groupChip"
              :aria-pressed="localKeys.includes(f.key)" @click="toggleKey(f.key)">
        <span v-if="localKeys.includes(f.key)" class="apex-sched__ord" :class="ui?.order">{{ localKeys.indexOf(f.key) + 1 }}</span>
        <ApexIcon v-if="f.icon" :name="f.icon" :size="14" />{{ f.label }}
      </button>
      <ApexIcon name="chevron_right" :size="13" class="apex-sched__arrow" :class="ui?.arrow" />
      <span class="apex-sched__gfixed" :class="ui?.groupFixed"><ApexIcon :name="leafIcon" :size="14" />{{ leafLabel }}</span>
      <div class="apex-sched__spacer" :class="ui?.spacer"></div>
      <div class="apex-sched__treebtns" :class="ui?.treeButtons">
        <button type="button" @click="expandAll"><ApexIcon name="unfold_more" :size="14" />Expand all</button>
        <button type="button" @click="collapseAll"><ApexIcon name="unfold_less" :size="14" />Collapse all</button>
      </div>
    </div>

    <div ref="scrollEl" class="apex-sched__scroll" :class="ui?.scroll">
      <div class="apex-sched__canvas" :class="ui?.canvas">
        <div class="apex-sched__header" :class="ui?.header">
          <div class="apex-sched__corner" :class="ui?.corner">
            <h4>{{ leafLabel }}s</h4>
            <p>{{ cornerSub }}</p>
          </div>
          <div class="apex-sched__axis" :class="ui?.axis" :style="{ inlineSize: axis.timelineW + 'px' }">
            <div class="apex-sched__tier1">
              <div v-for="(t, i) in axis.tier1" :key="i" :style="{ inlineSize: (t.width || axis.colWidth) + 'px' }">{{ t.label }}</div>
            </div>
            <div class="apex-sched__tier2">
              <div v-for="(t, i) in axis.tier2" :key="i" :data-today="t.today ? 'true' : 'false'"
                   :style="{ inlineSize: axis.colWidth + 'px' }">
                <slot name="column-header" :column="t" :label="t.label" :sub="t.sub" :today="!!t.today">
                  <span v-if="t.sub" class="apex-sched__wd" :class="ui?.weekday">{{ t.sub }}</span><span>{{ t.label }}</span>
                </slot>
              </div>
            </div>
          </div>
        </div>

        <div class="apex-sched__rows" :class="ui?.rows">
          <div v-if="nowLeft !== null" class="apex-sched__now" :class="ui?.now"
               :style="{ insetInlineStart: 'calc(var(--apex-sched-leftw) + ' + nowLeft + 'px)' }"></div>
          <div v-for="row in rowModels" :key="row.key" class="apex-sched__row" :class="ui?.row" :style="{ blockSize: row.height + 'px' }">
            <div class="apex-sched__rowhead" :class="ui?.rowHead" :data-group="row.kind === 'group' ? 'true' : 'false'"
                 :style="{ paddingInlineStart: (8 + row.depth * 16) + 'px' }">
              <button v-if="row.kind === 'group'" type="button" class="apex-sched__twirl" :class="ui?.twirl"
                      :aria-expanded="row.open ? 'true' : 'false'" :aria-label="'Toggle ' + row.name"
                      @click="toggleGroup(row.id)"></button>
              <span class="apex-sched__rhicon" :class="ui?.rowIcon" :style="row.kind === 'group' ? undefined : { marginInlineStart: '22px' }">
                <ApexIcon :name="row.icon" :size="row.kind === 'group' ? 16 : 15" />
              </span>
              <div class="apex-sched__rhbody" :class="ui?.rowBody">
                <slot name="resource" :resource="resourceOf(row)" :row="row" :name="row.name"
                      :sub="row.sub" :group="row.kind === 'group'" :open="row.open">
                  <div class="apex-sched__rhname" :class="ui?.rowName">{{ row.name }}</div>
                  <div v-if="row.sub" class="apex-sched__rhsub" :class="ui?.rowSub">{{ row.sub }}</div>
                </slot>
              </div>
              <span v-if="row.count" class="apex-sched__rhcount" :class="ui?.rowCount">{{ row.count }}</span>
            </div>
            <div class="apex-sched__track" :class="ui?.track" :data-group="row.kind === 'group' ? 'true' : 'false'"
                 :data-resource-id="row.resourceId" :style="trackStyle(row)"
                 @contextmenu="row.resourceId && onTrackContext($event, row.resourceId)">
              <template v-if="row.kind === 'cont'">
                <div v-for="b in row.blocks" :key="b.inst.instanceId" class="apex-sched__ev" :class="ui?.event" tabindex="0"
                     :data-tone="tone(b.inst.type)" :data-compact="b.compact ? 'true' : 'false'"
                     :data-recurring="b.inst.recurring ? 'true' : 'false'"
                     :data-draggable="canDrag(b.inst) ? 'true' : 'false'"
                       :data-resizable="canResize(b.inst) ? 'true' : 'false'" :title="blockTitle(b.inst)"
                       :data-apex-custom="$slots.event ? 'true' : 'false'"
                     :style="{ insetInlineStart: b.left + 'px', insetBlockStart: b.top + 'px',
                               inlineSize: b.width + 'px', blockSize: LANE + 'px', '--apex-sched-thumb': (LANE - 6) + 'px' }"
                     @pointerdown="onBlockDown($event, b.inst)"
                     @keydown.enter.prevent="openEdit(b.inst)">
                  <span class="apex-sched__evthumb" :class="ui?.eventThumb"><ApexIcon :name="icon(b.inst.type)" :size="b.compact ? 11 : 15" /></span>
                  <slot name="event" v-bind="eventCtx(b.inst, { compact: b.compact })">
                    <div v-if="!b.compact" class="apex-sched__evmain" :class="ui?.eventMain">
                      <div class="apex-sched__evrow" :class="ui?.eventRow">
                        <ApexIcon v-if="b.inst.recurring" name="repeat" :size="11" />
                        <span class="apex-sched__evtitle" :class="ui?.eventTitle">{{ b.inst.title }}</span>
                      </div>
                      <div v-if="b.showTime" class="apex-sched__evtime" :class="ui?.eventTime">{{ time(b.inst.start) }}–{{ time(b.inst.end) }}</div>
                    </div>
                  </slot>
                </div>
              </template>
              <div v-else-if="row.kind === 'discrete'" class="apex-sched__cellrow" :class="ui?.cellRow">
                <div v-for="c in row.cells" :key="c.key" class="apex-sched__cell" :class="ui?.cell"
                     :data-today="c.today ? 'true' : 'false'" :style="{ inlineSize: axis.colWidth + 'px' }">
                  <button v-for="ev in c.shown" :key="ev.instanceId" type="button" class="apex-sched__chip" :class="ui?.chip"
                          :data-tone="tone(ev.type)" :title="blockTitle(ev)"
                          :data-apex-custom="$slots.chip ? 'true' : 'false'"
                          @click.stop="openPop(ev, $event)">
                    <slot name="chip" v-bind="eventCtx(ev, { compact: true })" :icon="icon(ev.type)">
                      <span class="apex-sched__chipthumb" :class="ui?.chipThumb"><ApexIcon :name="icon(ev.type)" :size="11" /></span>
                      <span class="apex-sched__chipmain" :class="ui?.chipMain">
                        <span class="apex-sched__chiprow" :class="ui?.chipRow">
                          <ApexIcon v-if="ev.recurring" name="repeat" :size="9" />
                          <span class="apex-sched__ctitle" :class="ui?.createTitle">{{ ev.title }}</span>
                        </span>
                        <span class="apex-sched__ctime" :class="ui?.createTime">{{ localMode === 'year' ? dateShort(ev.start) : time(ev.start) }}</span>
                      </span>
                    </slot>
                  </button>
                  <span v-if="c.more" class="apex-sched__more" :class="ui?.more">+{{ c.more }} more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  <Teleport to="body">
    <template v-if="scopePrompt">
      <div class="apex-scope-catch" @click="cancelScope"></div>
      <div class="apex-scope" role="dialog"
           :style="scopeStyle">
<slot name="scope-prompt" :event="scopePrompt.inst" :title="scopePrompt.inst.title"
              :choose="chooseScope" :cancel="cancelScope" :options="scopeOptions">
          <h4>{{ scopePrompt.inst.title }}</h4>
          <p>{{ loc.t('recurring') }}</p>
          <button v-for="o in scopeOptions" :key="o.scope" type="button"
                  @click="chooseScope(o.scope)">{{ o.label }}</button>
          <button type="button" data-cancel="true" @click="cancelScope">{{ loc.t('cancel') }}</button>
        </slot>
      </div>
    </template>
    <template v-if="pop">
      <div class="apex-sched__catch" :class="ui?.catcher" @click="pop = null"></div>
      <div class="apex-sched__pop" :class="ui?.popover" :style="popStyle" role="dialog" :aria-label="pop.inst.title">
        <div class="apex-sched__popbar" :class="ui?.popoverBar" :data-tone="tone(pop.inst.type)"></div>
        <slot name="popover" v-bind="eventCtx(pop.inst)" :resource="resourceLabel(pop.inst.roomId)"
              :close="closePop" :edit="() => pop && openEdit(pop.inst)"
              :remove="() => pop && deleteEvent(pop.inst.id)">
          <div class="apex-sched__popbody" :class="ui?.popoverBody">
            <h4>{{ pop.inst.title }}</h4>
            <div class="apex-sched__popmeta" :class="ui?.popoverMeta">
              <ApexIcon :name="leafIcon" :size="14" /><span>{{ resourceLabel(pop.inst.roomId) }}</span>
              <ApexIcon name="event" :size="14" /><span>{{ dateShort(pop.inst.start) }}</span>
              <ApexIcon name="schedule" :size="14" /><span>{{ time(pop.inst.start) }} – {{ time(pop.inst.end) }}</span>
              <ApexIcon :name="icon(pop.inst.type)" :size="14" /><span>{{ label(pop.inst.type) }}</span>
            </div>
            <div v-if="pop.inst.recurring && pop.inst.rrule" class="apex-sched__poprec" :class="ui?.popoverRecurrence">
              <ApexIcon name="repeat" :size="13" />{{ ruleText(pop.inst.rrule) }}
            </div>
          </div>
    
        </slot>      <div class="apex-sched__popfoot" :class="ui?.popoverFoot">
          <ApexButton icon="delete" severity="secondary" variant="text" size="sm" icon-only label="Delete"
                      @click="deleteEvent(pop.inst.id)" />
          <ApexButton severity="secondary" variant="outlined" size="sm" label="Close"
                      style="flex:1" @click="pop = null" />
          <ApexButton icon="edit" size="sm" label="Edit" style="flex:1" @click="openEdit(pop.inst)" />
        </div>
      </div>
    </template>

    <template v-if="ctx">
      <div class="apex-sched__catch" :class="ui?.catcher" @click="ctx = null" @contextmenu.prevent="ctx = null"></div>
      <div class="apex-sched__ctx" :class="ui?.menu" :style="ctxStyle" role="menu">
        <div class="apex-sched__ctxtime" :class="ui?.menuTime">
          <b>{{ resourceLabel(ctx.resourceId) }}</b><br />{{ dateShort(ctx.start) }} · {{ time(ctx.start) }}
        </div>
        <button v-for="t in typeList" :key="t.key" type="button" class="apex-sched__ctxitem" :class="ui?.menuItem" role="menuitem"
                @click="createFromCtx(t.key)">
          <ApexIcon :name="t.icon" :size="14" />{{ t.createLabel }}
        </button>
      </div>
    </template>

    <div v-if="drag" class="apex-sched__ghost" :class="ui?.ghost" :data-tone="drag.tone" aria-hidden="true"
         :style="{ insetInlineStart: drag.x + 'px', insetBlockStart: drag.y + 'px' }">
      <b>{{ drag.title }}</b><span>{{ drag.label }}</span>
    </div>
  </Teleport>

  <ApexDialog v-if="inlineEditor" :visible="!!editor" width="480px"
              :header="editor && editor.id ? 'Edit booking' : 'New booking'"
              :subtitle="editor && editor.id ? 'Update this schedule entry.' : 'Add an entry to the schedule.'"
              :icon="editor ? icon(editor.type) : undefined" @update:visible="onDialogVisible">
    <div v-if="editor" class="apex-sched__grid" :class="ui?.grid">
      <div data-span="2"><ApexInput v-model="editor.title" label="Title" :placeholder="label(editor.type)" /></div>
      <div data-span="2"><ApexSelect v-model="editor.resourceId" :label="leafLabel" :options="resourceOptions" /></div>
      <div><ApexSelect v-model="editor.type" label="Type" :options="typeOptions" /></div>
      <div><ApexSelect v-model="editor.durMin" label="Duration" :options="durationOptions" /></div>
      <div data-span="2"><ApexDatePicker v-model="editor.start" label="Starts" show-time :step-minute="15" /></div>
      <div data-span="2"><ApexSelect v-model="editor.repeat" label="Repeat" :options="repeatOptions" /></div>
    </div>
    <template #footer>
      <ApexButton v-if="editor && editor.id" icon="delete" severity="secondary" variant="text" label="Delete"
                  style="margin-inline-end:auto" @click="deleteEvent(editor.id)" />
      <ApexButton severity="secondary" variant="text" label="Cancel" @click="editor = null" />
      <ApexButton icon="check" label="Save" @click="saveEditor" />
    </template>
  </ApexDialog>
  </div>
</template>
