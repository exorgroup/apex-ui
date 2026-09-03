<script setup lang="ts">
/**
 * ApexCascadeSelect — ApexSelect over a nested tree. Groups open a panel to the
 * side; only leaves are selectable. Same trigger, same popover styling.
 *
 *   <ApexCascadeSelect v-model="city" :options="countries" heading="Available countries"
 *                      show-path :footer-action="{ label:'Add new', icon:'add' }" @action="…" />
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import { useCanCreate } from '../core/canCreate';
import type { ApexFieldProps } from '../types';

export interface CascadeOption {
  value?: unknown;
  label: string;
  icon?: string;
  image?: string;
  help?: string;
  disabled?: boolean;
  children?: CascadeOption[];
}

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  options?: CascadeOption[];
  placeholder?: string;
  leadingIcon?: string;
  clearable?: boolean;
  loading?: boolean;
  /** Heading above the first panel. */
  heading?: string;
  /** Show the whole branch in the field, not just the leaf. */
  showPath?: boolean;
  pathSeparator?: string;
  /** Button under the first panel; emits @action. */
  footerAction?: { label: string; icon?: string };

  /**
   * Offer an "Add new" row at the foot of every open column. Unlike the flat
   * choosers, a cascade has levels, so the event carries the branch the row
   * sits under: `path` is the chain of options above it, empty at the first
   * column. That is what lets a handler create in the right place.
   *
   * Distinct from `footerAction`, which is a general button on the first
   * column. Both can be shown at once.
   */
  addNew?: boolean;
  /** Row text. This control has no filter, so it never carries a query. */
  addNewLabel?: string;
  /** What is being created, passed to the app-level canCreate resolver. */
  resource?: string;
  /** Overrides the resolver. Set it and no resolver is consulted. */
  canAddNew?: boolean;
}>(), {
  statusIcon: true,
  pathSeparator: '›',
  /* Tri-state: yes, no, or "ask the resolver". Vue casts an absent boolean
     prop to false, which would read as a denial and silence the resolver. */
  canAddNew: undefined,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void;
  (e: 'change'): void;
  (e: 'action'): void;
  /**
   * A column's Add New row was used. `path` is the branch above that column,
   * so `[]` means the first level. `query` is always empty here — the shape
   * matches the other choosers so one handler can serve any of them.
   */
  (e: 'add-new', payload: { query: string; path: CascadeOption[] }): void;
}>();

const t = useApexI18n();
const focused = ref(false);
const open = ref(false);
/** One entry per open level: the index chosen in that level's panel. */
const branch = ref<number[]>([]);
const active = ref<[number, number]>([0, -1]);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLElement | null>(null);

const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const isLeaf = (o: CascadeOption) => !o.children || !o.children.length;

const canCreate = useCanCreate();
const showAddNew = computed(() => props.addNew && canCreate(props.canAddNew, props.resource));

/** The options chosen above a column: [] for the first, one per level after. */
function pathTo(level: number): CascadeOption[] {
  const out: CascadeOption[] = [];
  for (let i = 0; i < level; i += 1) {
    const parent = panels.value[i]?.[branch.value[i]];
    if (!parent) break;
    out.push(parent);
  }
  return out;
}

function pickAddNew(level: number) {
  /* Close first: a dialog or a route is about to take over. */
  open.value = false;
  emit('add-new', { query: '', path: pathTo(level) });
}

/** Panels currently shown, left to right. */
const panels = computed<CascadeOption[][]>(() => {
  const out: CascadeOption[][] = [props.options || []];
  branch.value.forEach((idx, level) => {
    const parent = out[level]?.[idx];
    if (parent && parent.children?.length) out.push(parent.children);
  });
  return out;
});

/** Depth-first search for the selected leaf, returning its ancestor labels. */
function findPath(list: CascadeOption[] | undefined, target: unknown, trail: CascadeOption[] = []): CascadeOption[] | null {
  for (const o of list || []) {
    const next = [...trail, o];
    if (isLeaf(o) && o.value === target) return next;
    const hit = findPath(o.children, target, next);
    if (hit) return hit;
  }
  return null;
}
const selectedPath = computed(() => (props.modelValue == null ? null : findPath(props.options, props.modelValue)));
const selectedLeaf = computed(() => selectedPath.value?.[selectedPath.value.length - 1]);
const displayValue = computed(() => {
  if (!selectedPath.value) return '';
  return props.showPath
    ? selectedPath.value.map((o) => o.label).join(` ${props.pathSeparator} `)
    : selectedLeaf.value!.label;
});
const filled = computed(() => !!selectedPath.value);
const listId = computed(() => 'apex-cs-' + (props.id || props.name || 'list'));

function enter(level: number, index: number) {
  const o = panels.value[level][index];
  if (o.disabled) return;
  active.value = [level, index];
  branch.value = branch.value.slice(0, level);
  if (!isLeaf(o)) branch.value.push(index);
}
function choose(level: number, index: number) {
  const o = panels.value[level][index];
  if (o.disabled) return;
  if (!isLeaf(o)) { enter(level, index); return; }
  emit('update:modelValue', o.value);
  emit('change');
  open.value = false;
  nextTick(() => trigger.value?.focus());
}
function openMenu() {
  if (props.disabled || props.readonly) return;
  open.value = true;
  branch.value = [];
  active.value = [0, 0];
}
function onKey(e: KeyboardEvent) {
  if (props.disabled) return;
  if (e.key === 'Escape' || e.key === 'Tab') { open.value = false; return; }
  if (!open.value && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openMenu(); return; }
  if (!open.value) return;
  const [lv, ix] = active.value;
  const list = panels.value[lv] || [];
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = [lv, Math.min(ix + 1, list.length - 1)]; }
  if (e.key === 'ArrowUp') { e.preventDefault(); active.value = [lv, Math.max(ix - 1, 0)]; }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const o = list[ix];
    if (o && !isLeaf(o)) { enter(lv, ix); active.value = [lv + 1, 0]; }
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (lv > 0) { active.value = [lv - 1, branch.value[lv - 1] ?? 0]; branch.value = branch.value.slice(0, lv - 1); }
  }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (list[ix]) choose(lv, ix); }
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused || open"
             v-slot="{ id, describedBy, invalid, statusGlyph, ui }">
    <div ref="root" style="position:relative">
      <div ref="trigger" class="apex-ctl apex-ctl--trigger" :class="ui.control" role="combobox" :id="id"
           :aria-expanded="open" aria-haspopup="tree" :aria-controls="listId"
           :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
           :aria-label="labelPlacement === 'hidden' ? label : undefined"
           :tabindex="disabled ? -1 : 0" :data-focused="(focused || open) ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'"
           @click="open ? (open = false) : openMenu()" @keydown="onKey"
           @focus="focused = true" @blur="focused = false">
        <img v-if="selectedLeaf && selectedLeaf.image" class="apex-ctl__img" :class="ui.thumbnail" :src="selectedLeaf.image" alt="" />
        <ApexIcon v-else-if="selectedLeaf && selectedLeaf.icon" :name="selectedLeaf.icon" class="apex-ctl__icon" :class="ui.icon" />
        <ApexIcon v-else-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" :class="ui.icon" />
        <span v-if="filled" class="apex-ctl__value" :class="ui.value">{{ displayValue }}</span>
        <span v-else class="apex-ctl__ph" :class="ui.placeholder">{{ placeholder || t('apexui.select') }}</span>
        <ApexIcon v-if="loading" name="progress_activity" spin class="apex-ctl__icon" :class="ui.icon" />
        <button v-if="clearable && filled && !disabled" type="button" class="apex-ctl__btn" :class="ui.button"
                :aria-label="t('apexui.clear')" @click.stop="emit('update:modelValue', null)">
          <ApexIcon name="close" :size="17" />
        </button>
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
        <ApexIcon name="keyboard_arrow_down" class="apex-ctl__icon apex-ctl__chev" :class="ui.chevron" :size="19" :data-open="open" />
      </div>

      <div v-if="open" class="apex-cascade" :class="ui.cascade" :id="listId" role="tree">
        <div v-for="(list, level) in panels" :key="level" class="apex-pop apex-cascade__panel" :class="ui.column" role="group">
          <p v-if="level === 0 && heading" class="apex-cascade__heading" :class="ui.heading">{{ heading }}</p>
          <button v-for="(o, i) in list" :key="String(o.value ?? o.label)" type="button" class="apex-pop__opt" :class="ui.option"
                  role="treeitem" :aria-expanded="!isLeaf(o) ? (branch[level] === i) : undefined"
                  :aria-selected="isLeaf(o) && o.value === modelValue"
                  :data-active="active[0] === level && active[1] === i ? 'true' : 'false'"
                  :disabled="o.disabled"
                  @mouseenter="enter(level, i)" @click="choose(level, i)">
            <img v-if="o.image" class="apex-pop__img" :class="ui.thumbnail" :src="o.image" alt="" />
            <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
            <span>
              {{ o.label }}
              <span v-if="o.help" class="apex-pop__help" :class="ui.optionHelp">{{ o.help }}</span>
            </span>
            <ApexIcon v-if="!isLeaf(o)" name="chevron_right" class="apex-pop__tick" :class="ui.tick" />
            <ApexIcon v-else-if="o.value === modelValue" name="check" class="apex-pop__tick" :class="ui.tick" />
          </button>
          <p v-if="!list.length" class="apex-pop__empty" :class="ui.empty">{{ t('apexui.noResults') }}</p>
          <button v-if="showAddNew" type="button" class="apex-pop__add" :class="ui.addNew"
                  @click="pickAddNew(level)">
            <ApexIcon name="add" :size="18" />
            <span>{{ addNewLabel || t('apexui.addNew') }}</span>
          </button>
          <button v-if="level === 0 && footerAction" type="button" class="apex-cascade__footer" :class="ui.footer" @click="emit('action')">
            <ApexIcon v-if="footerAction.icon" :name="footerAction.icon" :size="17" />
            {{ footerAction.label }}
          </button>
        </div>
      </div>
    </div>
  </ApexField>
</template>
