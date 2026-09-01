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
import ApexIcon from './ApexIcon.vue';
import type { ColumnDef, FilterMatchMode, FilterMeta } from '../core/table';

const props = withDefaults(defineProps<{
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
const DATE_MODES: FilterMatchMode[] = ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter'];
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
</script>

<template>
  <!-- inline editor -->
  <div v-if="mode === 'row'" class="apex-dtf">
    <select v-if="type === 'select'" class="apex-dtf__ctl" :value="rowValue"
            :aria-label="`Filter by ${column.header}`" @change="pushRow(($event.target as HTMLSelectElement).value, 'equals')">
      <option value="">All</option>
      <option v-for="o in column.filterOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
    </select>

    <select v-else-if="type === 'multiselect'" class="apex-dtf__ctl apex-dtf__ctl--multi" multiple
            :aria-label="`Filter by ${column.header}`" @change="onMulti">
      <option v-for="o in column.filterOptions" :key="String(o.value)" :value="o.value"
              :selected="Array.isArray(rowValue) && (rowValue as unknown[]).map(String).includes(String(o.value))">
        {{ o.label }}
      </option>
    </select>

    <select v-else-if="type === 'boolean'" class="apex-dtf__ctl" :value="rowValue === '' ? '' : String(rowValue)"
            :aria-label="`Filter by ${column.header}`"
            @change="pushRow(($event.target as HTMLSelectElement).value === '' ? '' : ($event.target as HTMLSelectElement).value === 'true', 'equals')">
      <option value="">All</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>

    <template v-else>
      <input class="apex-dtf__ctl" :type="inputType" :value="rowValue"
             :placeholder="LABELS[meta?.matchMode || defaultMode]"
             :aria-label="`Filter by ${column.header}`"
             @input="pushRow(($event.target as HTMLInputElement).value)" />
      <button v-if="active" type="button" class="apex-dtf__x" aria-label="Clear filter" @click="emit('clear')">
        <ApexIcon name="close" :size="14" />
      </button>
    </template>
  </div>

  <!-- menu -->
  <div v-else ref="root" class="apex-dtf__menu">
    <button type="button" class="apex-dtf__trigger" :data-on="active" :aria-expanded="open"
            :aria-label="`Filter ${column.header}`" @click.stop="open = !open">
      <ApexIcon :name="active ? 'filter_alt' : 'filter_list'" :size="16" :fill="active" />
      <span v-if="ruleCount > 1" class="apex-dtf__badge">{{ ruleCount }}</span>
    </button>

    <div v-if="open" class="apex-dtf__pop" role="dialog" :aria-label="`Filter ${column.header}`" @click.stop>
      <template v-for="(c, i) in draft.constraints" :key="i">
        <select v-if="i > 0" class="apex-dtf__op" :value="draft.operator"
                aria-label="Join rules with" @change="draft.operator = ($event.target as HTMLSelectElement).value as 'and' | 'or'">
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>

        <div class="apex-dtf__rule">
          <select class="apex-dtf__ctl" :value="c.matchMode" aria-label="Match mode"
                  @change="c.matchMode = ($event.target as HTMLSelectElement).value as FilterMatchMode">
            <option v-for="m in modes" :key="m" :value="m">{{ LABELS[m] }}</option>
          </select>

          <select v-if="type === 'select' || type === 'multiselect'" class="apex-dtf__ctl"
                  :value="c.value as string" aria-label="Value"
                  @change="c.value = ($event.target as HTMLSelectElement).value">
            <option value="">—</option>
            <option v-for="o in column.filterOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
          </select>
          <select v-else-if="type === 'boolean'" class="apex-dtf__ctl" :value="String(c.value)" aria-label="Value"
                  @change="c.value = ($event.target as HTMLSelectElement).value === 'true'">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <div v-else-if="c.matchMode === 'between'" class="apex-dtf__pair">
            <input class="apex-dtf__ctl" type="number" placeholder="From"
                   :value="Array.isArray(c.value) ? (c.value as unknown[])[0] : ''" aria-label="From"
                   @input="c.value = [($event.target as HTMLInputElement).value, Array.isArray(c.value) ? (c.value as unknown[])[1] : '']" />
            <input class="apex-dtf__ctl" type="number" placeholder="To"
                   :value="Array.isArray(c.value) ? (c.value as unknown[])[1] : ''" aria-label="To"
                   @input="c.value = [Array.isArray(c.value) ? (c.value as unknown[])[0] : '', ($event.target as HTMLInputElement).value]" />
          </div>
          <input v-else class="apex-dtf__ctl" :type="inputType" :value="c.value ?? ''" placeholder="Value"
                 aria-label="Value" @input="c.value = ($event.target as HTMLInputElement).value" />

          <button v-if="draft.constraints.length > 1" type="button" class="apex-dtf__x"
                  aria-label="Remove rule" @click="removeRule(i)">
            <ApexIcon name="close" :size="15" />
          </button>
        </div>
      </template>

      <button v-if="stackable && draft.constraints.length < maxConstraints" type="button"
              class="apex-dtf__add" @click="addRule">
        <ApexIcon name="add" :size="16" />Add rule
      </button>

      <div class="apex-dtf__actions">
        <button type="button" class="apex-btn" data-variant="text" data-severity="secondary" data-size="sm"
                @click="clear">Clear</button>
        <button type="button" class="apex-btn" data-variant="solid" data-severity="primary" data-size="sm"
                @click="apply">Apply</button>
      </div>
    </div>
  </div>
</template>
