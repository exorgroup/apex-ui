<script setup lang="ts">
/**
 * ApexColumnFilter — the filter editors for ApexDataTable, in both display modes.
 *
 * `mode="row"` renders a single inline editor that filters as you type.
 * `mode="menu"` renders a trigger icon whose popover stacks up to
 * `maxConstraints` rules joined by AND/OR, with Apply and Clear.
 *
 * Editors are native controls wearing the APEX control classes: a filter row is
 * one editor per column, so pulling in a full control per cell would cost far
 * more than it returns.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { useAnchoredOverlay } from '../core/anchoredOverlay';
import ApexIcon from './ApexIcon.vue';
import ApexDatePicker from './ApexDatePicker.vue';
import type { ApexDataTableClasses } from '../types';
import type { ColumnDef, FilterMatchMode, FilterMeta } from '../core/table';

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexDataTableClasses. */
  ui?: ApexDataTableClasses;
  column: ColumnDef;
  meta?: FilterMeta;
  mode?: 'row' | 'menu';
  /** Rules a menu filter may stack. */
  maxConstraints?: number;
  size?: 'small' | 'normal' | 'large';
}>(), { mode: 'row', maxConstraints: 3 });

const emit = defineEmits<{
  (e: 'update', v: FilterMeta): void;
  (e: 'clear'): void;
}>();

const TEXT_MODES: FilterMatchMode[] = ['startsWith', 'contains', 'notContains', 'endsWith', 'equals', 'notEquals'];
const NUMBER_MODES: FilterMatchMode[] = ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte', 'between'];
/* `between` is here because a date FILTER is nearly always a range — "what happened that
   week" — and a column offering only "is / before / after" makes the commonest question take
   two filters or none. Last in the list so the default stays `dateIs`; a column that wants the
   range says `filterMatchMode: 'between'`. */
const DATE_MODES: FilterMatchMode[] = ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter', 'between'];
const LABELS: Record<string, string> = {
  startsWith: 'Starts with', contains: 'Contains', notContains: 'Not contains', endsWith: 'Ends with',
  equals: 'Equals', notEquals: 'Not equals', lt: 'Less than', lte: 'Less or equal',
  gt: 'Greater than', gte: 'Greater or equal', between: 'Between', in: 'Any of',
  dateIs: 'Date is', dateIsNot: 'Date is not', dateBefore: 'Before', dateAfter: 'After',
};

const type = computed(() => props.column.filterType || 'text');
const modes = computed<FilterMatchMode[]>(() => {
  if (type.value === 'number') return NUMBER_MODES;
  if (type.value === 'date') return DATE_MODES;
  if (type.value === 'select' || type.value === 'multiselect') return ['in', 'equals', 'notEquals'];
  if (type.value === 'boolean') return ['equals'];
  return TEXT_MODES;
});
const defaultMode = computed<FilterMatchMode>(() => props.column.filterMatchMode || modes.value[0]);

/* ── row mode ───────────────────────────────────────────── */
const rowValue = computed(() => props.meta?.value ?? (type.value === 'multiselect' ? [] : ''));

function pushRow(value: unknown, matchMode?: FilterMatchMode) {
  emit('update', { value, matchMode: matchMode || props.meta?.matchMode || defaultMode.value });
}
function onMulti(e: Event) {
  const el = e.target as HTMLSelectElement;
  pushRow(Array.from(el.selectedOptions).map((o) => o.value));
}

/* ── menu mode ──────────────────────────────────────────── */
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const pop = ref<HTMLElement | null>(null);

/* AF2-321. The popover lives inside `.apex-dt__viewport`, which is
   `overflow: auto` so the table can scroll sideways and pin its frozen
   column. That clipped the popover the moment the table was short: with one
   row, everything below the first control was cut off. Fixed positioning
   escapes the clip; the panel stays in the DOM where it was.

   Anchored to `root` — the trigger — and aligned to its END, because this
   is the last thing in a header cell and the columns that carry filters are
   usually on the right, where a start-aligned 270px panel runs off the edge.

   Above a dialog: a DataTable inside a modal form is not hypothetical. */
const { style: popStyle } = useAnchoredOverlay({
  open, anchor: root, panel: pop, side: 'bottom', align: 'end', gap: 6, zIndex: 1150,
});
const draft = ref<{ operator: 'and' | 'or'; constraints: Array<{ value: unknown; matchMode: FilterMatchMode }> }>({
  operator: 'and', constraints: [{ value: null, matchMode: defaultMode.value }],
});

function seedDraft() {
  const m = props.meta;
  draft.value = {
    operator: (m?.operator as 'and' | 'or') || 'and',
    constraints: m?.constraints?.length
      ? m.constraints.map((c) => ({ value: c.value, matchMode: c.matchMode }))
      : [{ value: m?.value ?? null, matchMode: m?.matchMode || defaultMode.value }],
  };
}
watch(open, (v) => {
  if (v) seedDraft();
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});

const stackable = computed(() => props.maxConstraints > 1 && type.value !== 'boolean' && type.value !== 'multiselect');
function addRule() {
  if (draft.value.constraints.length >= props.maxConstraints) return;
  draft.value.constraints.push({ value: null, matchMode: defaultMode.value });
}
function removeRule(i: number) {
  draft.value.constraints.splice(i, 1);
  if (!draft.value.constraints.length) addRule();
}
function apply() {
  emit('update', {
    operator: draft.value.operator,
    constraints: draft.value.constraints.map((c) => ({ value: c.value, matchMode: c.matchMode })),
  });
  open.value = false;
}
function clear() {
  emit('clear');
  open.value = false;
}
const active = computed(() => {
  const m = props.meta;
  if (!m) return false;
  if (m.constraints) return m.constraints.some((c) => c.value != null && c.value !== '');
  return m.value != null && m.value !== '' && !(Array.isArray(m.value) && !m.value.length);
});
const ruleCount = computed(() => props.meta?.constraints?.filter((c) => c.value != null && c.value !== '').length || 0);
const inputType = computed(() => (type.value === 'number' ? 'number' : type.value === 'date' ? 'date' : 'text'));

/* Which shape the row draws. The MODE decides, not the type: a date column defaults to a single
   `dateIs` box and only becomes a pair when the column asks for `between`. */
const rowMode = computed<FilterMatchMode>(() => props.meta?.matchMode || defaultMode.value);

/* Always two slots, so a half-filled range is still a range and typing in the second box does
   not have to cope with the first being absent. */
const rowPair = computed<[string, string]>(() => {
  const v = props.meta?.value;

  return Array.isArray(v) ? [String(v[0] ?? ''), String(v[1] ?? '')] : ['', ''];
});

/* ── a DATE range is a calendar, not two boxes ─────────────────────────
   Two independent date inputs will happily take a `from` that is after its `to`, and the only
   feedback is an empty table. `ApexDatePicker` in range mode cannot produce one: it re-orders
   the pair on the second click, so the invalid state has nowhere to come from.
   Two months, because choosing a range that crosses one is the ordinary case. */
const rangeDates = computed<Date[]>(() =>
  rowPair.value
    .map((v) => (v ? new Date(v) : null))
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime())));

/* Built from the LOCAL parts, never `toISOString()`. That converts to UTC first, so anyone
   east of Greenwich loses a day off the end of their range and anyone west gains one — a bug
   that only appears for some users, in some months, which is the worst kind to be told about. */
const isoDay = (d: unknown): string => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function pushRange(value: unknown) {
  const pair = Array.isArray(value) ? value : [];
  const next: [string, string] = [isoDay(pair[0]), isoDay(pair[1])];

  /* Cleared entirely rather than left as two empty strings, so `anyFilter` stops counting it
     and the table's clear-all button goes away with the last filter. */
  emit('update', { value: next[0] || next[1] ? next : '', matchMode: 'between' });
}
</script>

<template>
  <!-- inline editor -->
  <div v-if="mode === 'row'" class="apex-dtf" :class="ui?.filter">
    <select v-if="type === 'select'" class="apex-dtf__ctl" :class="ui?.filterControl" :value="rowValue"
            :aria-label="`Filter by ${column.header}`" @change="pushRow(($event.target as HTMLSelectElement).value, 'equals')">
      <option value="">All</option>
      <option v-for="o in column.filterOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
    </select>

    <select v-else-if="type === 'multiselect'" class="apex-dtf__ctl apex-dtf__ctl--multi" :class="ui?.filterControl" multiple
            :aria-label="`Filter by ${column.header}`" @change="onMulti">
      <option v-for="o in column.filterOptions" :key="String(o.value)" :value="o.value"
              :selected="Array.isArray(rowValue) && (rowValue as unknown[]).map(String).includes(String(o.value))">
        {{ o.label }}
      </option>
    </select>

    <select v-else-if="type === 'boolean'" class="apex-dtf__ctl" :class="ui?.filterControl" :value="rowValue === '' ? '' : String(rowValue)"
            :aria-label="`Filter by ${column.header}`"
            @change="pushRow(($event.target as HTMLSelectElement).value === '' ? '' : ($event.target as HTMLSelectElement).value === 'true', 'equals')">
      <option value="">All</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>

    <!-- A date range gets the calendar; everything else keeps the two plain boxes.

         `readonly-input` because the WHOLE control has to open it. Without it the picker opens
         only from its little icon button — clicking the text focuses it to TYPE, which is the
         right default for one date and useless for a range: nobody types
         "01/09/2026 - 30/09/2026" into a box. A filter cell is small enough that hunting for
         the icon reads as a control that does not work, which is how this was reported. -->
    <template v-else-if="rowMode === 'between' && type === 'date'">
      <ApexDatePicker
        class="apex-dtf__range"
        :model-value="rangeDates"
        selection-mode="range"
        :number-of-months="2"
        :placeholder="`Filter ${column.header}`"
        :status-icon="false"
        clearable
        readonly-input
        @update:modelValue="pushRange"
      />
      <button v-if="active" type="button" class="apex-dtf__x" :class="ui?.filterRemove" aria-label="Clear filter" @click="emit('clear')">
        <ApexIcon name="close" :size="14" />
      </button>
    </template>

    <!-- A RANGE in the row for everything else, which used to be reachable only through the
         menu. Two inputs of the column's own type, and the value is the pair — the same
         `[from, to]` shape the menu's `between` constraint produces, so a host reading the
         filter model cannot tell which of the two drew it. -->
    <template v-else-if="rowMode === 'between'">
      <div class="apex-dtf__pair" :class="ui?.filterPair">
        <input class="apex-dtf__ctl" :class="ui?.filterControl" :type="inputType" placeholder="From"
               :value="rowPair[0]" :aria-label="`Filter ${column.header} from`"
               @input="pushRow([($event.target as HTMLInputElement).value, rowPair[1]], 'between')" />
        <input class="apex-dtf__ctl" :class="ui?.filterControl" :type="inputType" placeholder="To"
               :value="rowPair[1]" :aria-label="`Filter ${column.header} to`"
               @input="pushRow([rowPair[0], ($event.target as HTMLInputElement).value], 'between')" />
      </div>
      <button v-if="active" type="button" class="apex-dtf__x" :class="ui?.filterRemove" aria-label="Clear filter" @click="emit('clear')">
        <ApexIcon name="close" :size="14" />
      </button>
    </template>

    <template v-else>
      <input class="apex-dtf__ctl" :class="ui?.filterControl" :type="inputType" :value="rowValue"
             :placeholder="LABELS[meta?.matchMode || defaultMode]"
             :aria-label="`Filter by ${column.header}`"
             @input="pushRow(($event.target as HTMLInputElement).value)" />
      <button v-if="active" type="button" class="apex-dtf__x" :class="ui?.filterRemove" aria-label="Clear filter" @click="emit('clear')">
        <ApexIcon name="close" :size="14" />
      </button>
    </template>
  </div>

  <!-- menu -->
  <div v-else ref="root" class="apex-dtf__menu" :class="ui?.filterMenu">
    <button type="button" class="apex-dtf__trigger" :class="ui?.filterTrigger" :data-on="active" :aria-expanded="open"
            :aria-label="`Filter ${column.header}`" @click.stop="open = !open">
      <ApexIcon :name="active ? 'filter_alt' : 'filter_list'" :size="16" :fill="active" />
      <span v-if="ruleCount > 1" class="apex-dtf__badge" :class="ui?.filterBadge">{{ ruleCount }}</span>
    </button>

    <div v-if="open" ref="pop" class="apex-dtf__pop" :class="ui?.filterPop" :style="popStyle"
         role="dialog" :aria-label="`Filter ${column.header}`" @click.stop>
      <template v-for="(c, i) in draft.constraints" :key="i">
        <select v-if="i > 0" class="apex-dtf__op" :class="ui?.filterOp" :value="draft.operator"
                aria-label="Join rules with" @change="draft.operator = ($event.target as HTMLSelectElement).value as 'and' | 'or'">
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>

        <div class="apex-dtf__rule" :class="ui?.filterRule">
          <select class="apex-dtf__ctl" :class="ui?.filterControl" :value="c.matchMode" aria-label="Match mode"
                  @change="c.matchMode = ($event.target as HTMLSelectElement).value as FilterMatchMode">
            <option v-for="m in modes" :key="m" :value="m">{{ LABELS[m] }}</option>
          </select>

          <select v-if="type === 'select' || type === 'multiselect'" class="apex-dtf__ctl" :class="ui?.filterControl"
                  :value="c.value as string" aria-label="Value"
                  @change="c.value = ($event.target as HTMLSelectElement).value">
            <option value="">—</option>
            <option v-for="o in column.filterOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
          </select>
          <select v-else-if="type === 'boolean'" class="apex-dtf__ctl" :class="ui?.filterControl" :value="String(c.value)" aria-label="Value"
                  @change="c.value = ($event.target as HTMLSelectElement).value === 'true'">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <div v-else-if="c.matchMode === 'between'" class="apex-dtf__pair" :class="ui?.filterPair">
            <input class="apex-dtf__ctl" :class="ui?.filterControl" :type="inputType" placeholder="From"
                   :value="Array.isArray(c.value) ? (c.value as unknown[])[0] : ''" aria-label="From"
                   @input="c.value = [($event.target as HTMLInputElement).value, Array.isArray(c.value) ? (c.value as unknown[])[1] : '']" />
            <input class="apex-dtf__ctl" :class="ui?.filterControl" :type="inputType" placeholder="To"
                   :value="Array.isArray(c.value) ? (c.value as unknown[])[1] : ''" aria-label="To"
                   @input="c.value = [Array.isArray(c.value) ? (c.value as unknown[])[0] : '', ($event.target as HTMLInputElement).value]" />
          </div>
          <input v-else class="apex-dtf__ctl" :class="ui?.filterControl" :type="inputType" :value="c.value ?? ''" placeholder="Value"
                 aria-label="Value" @input="c.value = ($event.target as HTMLInputElement).value" />

          <button v-if="draft.constraints.length > 1" type="button" class="apex-dtf__x" :class="ui?.filterRemove"
                  aria-label="Remove rule" @click="removeRule(i)">
            <ApexIcon name="close" :size="15" />
          </button>
        </div>
      </template>

      <button v-if="stackable && draft.constraints.length < maxConstraints" type="button"
              class="apex-dtf__add" :class="ui?.filterAdd" @click="addRule">
        <ApexIcon name="add" :size="16" />Add rule
      </button>

      <div class="apex-dtf__actions" :class="ui?.filterActions">
        <button type="button" class="apex-btn" data-variant="text" data-severity="secondary" data-size="sm"
                @click="clear">Clear</button>
        <button type="button" class="apex-btn" data-variant="solid" data-severity="primary" data-size="sm"
                @click="apply">Apply</button>
      </div>
    </div>
  </div>
</template>
