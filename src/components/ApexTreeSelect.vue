<script setup lang="ts">
/**
 * ApexTreeSelect — a popover tree for hierarchical data. Single selection binds
 * a node key; `multiple` or `checkbox` bind an array of keys. Built-in filter,
 * expand/collapse, and parent-child propagation with a partial state.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import ApexTreeNode, { type TreeNode, type TreeState } from './ApexTreeNode';
import { pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps } from '../types';

export type { TreeNode };

const props = withDefaults(defineProps<ApexFieldProps & {
  /** A node key, or an array of keys once multiple/checkbox is on. */
  modelValue?: string | string[] | null;
  nodes?: TreeNode[];
  placeholder?: string;
  leadingIcon?: string;
  multiple?: boolean;
  /** A checkbox per node; implies multiple and propagates to children. */
  checkbox?: boolean;
  /** Only leaves may be chosen; clicking a branch expands it. */
  leafOnly?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  expandAll?: boolean;
  clearable?: boolean;
  /** Show the whole branch in the field. */
  showPath?: boolean;
  pathSeparator?: string;
  scrollHeight?: number;
  maxChips?: number;
}>(), { pathSeparator: '›', scrollHeight: 280, statusIcon: true });

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | string[] | null): void;
  (e: 'change'): void;
  (e: 'node-expand' | 'node-collapse', node: TreeNode): void;
}>();

const t = useApexI18n();
const open = ref(false);
const focused = ref(false);
const query = ref('');
const expanded = ref<Set<string>>(new Set());
const root = ref<HTMLElement | null>(null);

const many = computed(() => props.multiple || props.checkbox);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const listId = computed(() => 'apex-tree-' + (props.id || props.name || 'list'));
const isLeaf = (n: TreeNode) => !n.children || !n.children.length;

const keys = computed<string[]>(() => {
  if (!many.value) return props.modelValue == null ? [] : [String(props.modelValue)];
  return Array.isArray(props.modelValue) ? props.modelValue.map(String) : [];
});

function walk(list: TreeNode[] | undefined, fn: (n: TreeNode, trail: TreeNode[]) => void, trail: TreeNode[] = []) {
  (list || []).forEach((n) => {
    const next = [...trail, n];
    fn(n, next);
    walk(n.children, fn, next);
  });
}
const index = computed(() => {
  const map = new Map<string, TreeNode[]>();
  walk(props.nodes, (n, trail) => map.set(n.key, trail));
  return map;
});
const chips = computed<TreeNode[]>(() =>
  keys.value.map((k) => index.value.get(k)).filter(Boolean).map((tr) => tr![tr!.length - 1]));
const overflow = computed(() => (props.maxChips != null && chips.value.length > props.maxChips ? chips.value.length - props.maxChips : 0));
const shownChips = computed(() => (overflow.value ? chips.value.slice(0, props.maxChips) : chips.value));
const singleNode = computed(() => chips.value[0]);
const singleLabel = computed(() => {
  const trail = keys.value.length ? index.value.get(keys.value[0]) : undefined;
  if (!trail) return '';
  return props.showPath ? trail.map((n) => n.label).join(` ${props.pathSeparator} `) : trail[trail.length - 1].label;
});
const filled = computed(() => keys.value.length > 0);

/** Keeps a branch when it or any descendant matches. */
function filterTree(list: TreeNode[] | undefined, q: string): TreeNode[] {
  return (list || []).reduce<TreeNode[]>((acc, n) => {
    const kids = filterTree(n.children, q);
    const self = n.label.toLowerCase().includes(q);
    if (self || kids.length) acc.push({ ...n, children: kids.length ? kids : (self ? n.children : []) });
    return acc;
  }, []);
}
const visible = computed(() => {
  const q = query.value.toLowerCase().trim();
  return q ? filterTree(props.nodes, q) : (props.nodes || []);
});
const isExpanded = (n: TreeNode) => !!query.value || props.expandAll || expanded.value.has(n.key);

function toggleBranch(n: TreeNode) {
  const s = new Set(expanded.value);
  if (s.has(n.key)) { s.delete(n.key); emit('node-collapse', n); }
  else { s.add(n.key); emit('node-expand', n); }
  expanded.value = s;
}
function descendants(n: TreeNode): string[] {
  const out: string[] = [];
  walk(n.children, (c) => { if (!c.disabled) out.push(c.key); });
  return out;
}
function selectState(n: TreeNode): TreeState {
  if (keys.value.includes(n.key)) return 'on';
  if (!props.checkbox || isLeaf(n)) return 'off';
  const kids = descendants(n);
  const hit = kids.filter((k) => keys.value.includes(k)).length;
  if (!hit) return 'off';
  return hit === kids.length ? 'on' : 'partial';
}
function pick(n: TreeNode) {
  if (props.disabled || props.readonly || n.disabled) return;
  if (props.leafOnly && !isLeaf(n)) { toggleBranch(n); return; }
  if (!many.value) {
    emit('update:modelValue', keys.value[0] === n.key ? null : n.key);
    open.value = false;
  } else {
    const set = new Set(keys.value);
    const family = props.checkbox && !isLeaf(n) ? [n.key, ...descendants(n)] : [n.key];
    const off = set.has(n.key) || (props.checkbox && selectState(n) === 'on');
    family.forEach((k) => (off ? set.delete(k) : set.add(k)));
    emit('update:modelValue', [...set]);
  }
  emit('change');
}
function clear() {
  emit('update:modelValue', many.value ? [] : null);
  emit('change');
}
function openMenu() {
  if (props.disabled || props.readonly) return;
  query.value = '';
  open.value = true;
  const s = new Set(expanded.value);
  keys.value.forEach((k) => (index.value.get(k) || []).slice(0, -1).forEach((n) => s.add(n.key)));
  expanded.value = s;
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' || e.key === 'Tab') { open.value = false; return; }
  if (!open.value && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openMenu(); }
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
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)"
             :focused="focused || open" v-slot="{ id, describedBy, invalid, statusGlyph }">
    <div ref="root" style="position:relative">
      <div class="apex-ctl apex-ctl--trigger" :class="{ 'apex-ctl--multi': many }"
           role="combobox" :id="id" :aria-expanded="open" aria-haspopup="tree" :aria-controls="listId"
           :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
           :aria-label="labelPlacement === 'hidden' ? label : undefined"
           :tabindex="disabled ? -1 : 0" :data-focused="(focused || open) ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'"
           @click="open ? (open = false) : openMenu()" @keydown="onKey"
           @focus="focused = true" @blur="focused = false">
        <img v-if="!many && singleNode && singleNode.image" class="apex-ctl__img" :src="singleNode.image" alt="" />
        <ApexIcon v-else-if="!many && singleNode && singleNode.icon" :name="singleNode.icon" class="apex-ctl__icon" />
        <ApexIcon v-else-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" />

        <template v-if="many">
          <span v-for="c in shownChips" :key="c.key" class="apex-chip">
            <ApexIcon v-if="c.icon" :name="c.icon" :size="15" />
            {{ c.label }}
            <button type="button" :aria-label="`${t('apexui.remove')} ${c.label}`" :disabled="disabled"
                    @click.stop="pick(c)"><ApexIcon name="close" /></button>
          </span>
          <span v-if="overflow" class="apex-chip apex-chip--more">+{{ overflow }}</span>
        </template>
        <span v-else-if="filled" class="apex-ctl__value">{{ singleLabel }}</span>
        <span v-if="!filled" class="apex-ctl__ph">{{ placeholder || t('apexui.select') }}</span>

        <button v-if="clearable && filled && !disabled" type="button" class="apex-ctl__btn"
                :aria-label="t('apexui.clear')" @click.stop="clear">
          <ApexIcon name="close" :size="17" />
        </button>
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
        <ApexIcon name="keyboard_arrow_down" class="apex-ctl__icon apex-ctl__chev" :size="19" :data-open="open" />
      </div>

      <div v-if="open" class="apex-pop apex-tree" :id="listId" role="tree"
           :style="{ maxHeight: scrollHeight + 'px' }">
        <div v-if="filter" class="apex-pop__filter">
          <ApexIcon name="search" />
          <input type="text" :value="query" :placeholder="filterPlaceholder || t('apexui.search')"
                 :aria-label="t('apexui.search')" autocomplete="off"
                 @input="query = ($event.target as HTMLInputElement).value" />
          <button v-if="query" type="button" class="apex-ctl__btn" :aria-label="t('apexui.clear')" @click="query = ''">
            <ApexIcon name="close" :size="16" />
          </button>
        </div>

        <ApexTreeNode v-for="node in visible" :key="node.key" :node="node" :depth="0"
                      :checkbox="!!checkbox" :state-of="selectState" :is-expanded="isExpanded"
                      @pick="pick" @toggle="toggleBranch" />
        <p v-if="!visible.length" class="apex-pop__empty">{{ t('apexui.noResults') }}</p>
      </div>
    </div>
  </ApexField>
</template>
