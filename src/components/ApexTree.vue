<script setup lang="ts">
/**
 * ApexTree — hierarchical data as an inline tree.
 *
 * Rows are rendered from a flattened list rather than a recursive component, so
 * keyboard navigation is index-based, only visible rows exist in the DOM, and a
 * large tree stays cheap. Expansion and selection are both controlled through
 * bindable key maps.
 */
import { computed, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { ApexTreeClasses } from '../types';
import { useApexI18n } from '../core/i18n';
import {
  allLeafKeys, branchKeys, cascadeChecks, filterTree, flattenTree, moveNode,
  removeNode, setBranchChecked, type CheckState, type FlatNode, type TreeNode,
} from '../core/tree';

export type { TreeNode };

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexTreeClasses. */
  ui?: ApexTreeClasses;
  value?: TreeNode[];
  /** Keys mapped to true are expanded. Bindable. */
  expandedKeys?: Record<string, boolean>;
  selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
  /**
   * single/multiple: `{ [key]: true }`.
   * checkbox: `{ [key]: { checked, partialChecked } }`.
   * Bindable.
   */
  selectionKeys?: Record<string, boolean | CheckState>;
  /** Require Cmd/Ctrl to add to a multiple selection. */
  metaKeySelection?: boolean;
  /** Header checkbox that toggles everything. */
  showSelectAll?: boolean;

  /* filtering */
  filter?: boolean;
  filterBy?: string;
  filterMode?: 'lenient' | 'strict';
  filterPlaceholder?: string;

  /* async */
  lazy?: boolean;
  loading?: boolean;
  loadingMode?: 'overlay' | 'skeleton';
  skeletonRows?: number;

  /* drag and drop */
  draggableNodes?: boolean;
  droppableNodes?: boolean;
  /** Only trees sharing a scope can exchange nodes. */
  draggableScope?: string;
  droppableScope?: string;

  /* presentation */
  scrollHeight?: number;
  indent?: number;
  bordered?: boolean;
  emptyMessage?: string;
  /* colours */
  hoverBackground?: string;
  selectedBackground?: string;
  selectedColor?: string;
  iconColor?: string;
  rowRadius?: string;
}>(), {
  selectionMode: null, filterMode: 'lenient', filterBy: 'label',
  loadingMode: 'overlay', skeletonRows: 5, indent: 20, bordered: true,
});

const emit = defineEmits<{
  (e: 'update:value', v: TreeNode[]): void;
  (e: 'update:expandedKeys', v: Record<string, boolean>): void;
  (e: 'update:selectionKeys', v: Record<string, boolean | CheckState>): void;
  (e: 'node-expand' | 'node-collapse', node: TreeNode): void;
  (e: 'node-select' | 'node-unselect', node: TreeNode): void;
  (e: 'node-drop', payload: { dragNode: TreeNode; dropNode?: TreeNode; position: string; value: TreeNode[] }): void;
  (e: 'filter', payload: { value: string }): void;
}>();

const t = useApexI18n();
const nodes = computed(() => props.value || []);
const query = ref('');

/* ── expansion ──────────────────────────────────────────── */
const localExpanded = ref<Record<string, boolean>>({});
const expanded = computed(() => {
  // a live filter opens every surviving branch, so matches are visible
  if (query.value.trim()) return { ...(props.expandedKeys ?? localExpanded.value), ...branchKeys(shown.value) };
  return props.expandedKeys ?? localExpanded.value;
});
function setExpanded(next: Record<string, boolean>) {
  localExpanded.value = next;
  emit('update:expandedKeys', next);
}
function toggle(node: TreeNode) {
  const next = { ...expanded.value };
  if (next[node.key]) { delete next[node.key]; setExpanded(next); emit('node-collapse', node); return; }
  next[node.key] = true;
  setExpanded(next);
  emit('node-expand', node);
}

/* ── filtering ──────────────────────────────────────────── */
const fields = computed(() => props.filterBy.split(',').map((f) => f.trim()).filter(Boolean));
const shown = computed(() => (query.value.trim()
  ? filterTree(nodes.value, query.value, fields.value, props.filterMode)
  : nodes.value));
const rows = computed<FlatNode[]>(() => flattenTree(shown.value, expanded.value, props.lazy));
watch(query, (v) => emit('filter', { value: v }));

/* ── selection ──────────────────────────────────────────── */
const localSelection = ref<Record<string, boolean | CheckState>>({});
const selection = computed(() => props.selectionKeys ?? localSelection.value);
const isCheckbox = computed(() => props.selectionMode === 'checkbox');

function setSelection(next: Record<string, boolean | CheckState>) {
  localSelection.value = next;
  emit('update:selectionKeys', next);
}
const stateOf = (node: TreeNode): 'on' | 'off' | 'partial' => {
  const v = selection.value[node.key];
  if (isCheckbox.value) {
    const s = (v || {}) as CheckState;
    return s.checked ? 'on' : (s.partialChecked ? 'partial' : 'off');
  }
  return v ? 'on' : 'off';
};
function select(node: TreeNode, e?: MouseEvent | KeyboardEvent) {
  if (!props.selectionMode || node.selectable === false) return;
  const on = stateOf(node) === 'on';

  if (isCheckbox.value) {
    setSelection(setBranchChecked(nodes.value, node, !on, selection.value as Record<string, CheckState>));
  } else if (props.selectionMode === 'single') {
    setSelection(on ? {} : { [node.key]: true });
  } else {
    const additive = !props.metaKeySelection || !!(e && ((e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey));
    if (!additive) setSelection(on && Object.keys(selection.value).length === 1 ? {} : { [node.key]: true });
    else {
      const next = { ...selection.value };
      if (on) delete next[node.key]; else next[node.key] = true;
      setSelection(next);
    }
  }
  emit(on ? 'node-unselect' : 'node-select', node);
}

/* select-all header */
const leafKeys = computed(() => allLeafKeys(shown.value));
const allChecked = computed(() => leafKeys.value.length > 0
  && leafKeys.value.every((k) => (isCheckbox.value
    ? ((selection.value[k] || {}) as CheckState).checked
    : selection.value[k])));
const someChecked = computed(() => !allChecked.value
  && leafKeys.value.some((k) => (isCheckbox.value
    ? ((selection.value[k] || {}) as CheckState).checked
    : selection.value[k])));
function toggleAll() {
  if (allChecked.value) { setSelection({}); return; }
  if (isCheckbox.value) {
    const draft: Record<string, CheckState> = {};
    leafKeys.value.forEach((k) => { draft[k] = { checked: true, partialChecked: false }; });
    setSelection(cascadeChecks(shown.value, draft));
  } else {
    const draft: Record<string, boolean> = {};
    leafKeys.value.forEach((k) => { draft[k] = true; });
    setSelection(draft);
  }
}

/* ── keyboard ───────────────────────────────────────────── */
const focusIndex = ref(-1);
const listEl = ref<HTMLElement | null>(null);
function focusRow(i: number) {
  const n = rows.value.length;
  if (!n) return;
  focusIndex.value = Math.min(Math.max(0, i), n - 1);
  listEl.value?.querySelector<HTMLElement>(`[data-row="${focusIndex.value}"]`)?.focus();
}
function onKey(i: number, row: FlatNode, e: KeyboardEvent) {
  const { node, hasChildren } = row;
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); focusRow(i + 1); break;
    case 'ArrowUp': e.preventDefault(); focusRow(i - 1); break;
    case 'Home': e.preventDefault(); focusRow(0); break;
    case 'End': e.preventDefault(); focusRow(rows.value.length - 1); break;
    case 'ArrowRight':
      e.preventDefault();
      if (hasChildren && !expanded.value[node.key]) toggle(node);
      else focusRow(i + 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (hasChildren && expanded.value[node.key]) toggle(node);
      else {
        // step to the parent row
        const up = rows.value.slice(0, i).reverse().findIndex((r) => r.depth < row.depth);
        if (up >= 0) focusRow(i - 1 - up);
      }
      break;
    case ' ':
    case 'Enter': e.preventDefault(); select(node, e); break;
    default: break;
  }
}

/* ── drag and drop ──────────────────────────────────────── */
const drag = ref<{ row: FlatNode; scope?: string } | null>(null);
const dropTarget = ref<{ index: number; position: 'before' | 'after' | 'inside' } | null>(null);
/** Set when THIS tree handled its own drag, so dragend knows not to remove the node. */
const handledLocally = ref(false);

function onDragStart(row: FlatNode, e: DragEvent) {
  if (!props.draggableNodes) return;
  handledLocally.value = false;
  drag.value = { row, scope: props.draggableScope };
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-apex-tree', JSON.stringify({
      scope: props.draggableScope, path: row.path, node: row.node,
    }));
  }
}
/** Top third drops before, bottom third after, the middle drops inside. */
function positionFor(e: DragEvent, el: HTMLElement): 'before' | 'after' | 'inside' {
  const r = el.getBoundingClientRect();
  const rel = (e.clientY - r.top) / r.height;
  if (rel < 0.3) return 'before';
  if (rel > 0.7) return 'after';
  return 'inside';
}
function scopeAllowed(e: DragEvent): boolean {
  if (!props.droppableNodes) return false;
  if (!props.droppableScope) return true;
  const raw = e.dataTransfer?.types.includes('application/x-apex-tree');
  if (!raw) return false;
  // the payload is unreadable during dragover, so an in-tree drag is checked directly
  if (drag.value) return (drag.value.scope || '') === props.droppableScope;
  return true;
}
function onDragOver(i: number, e: DragEvent) {
  if (!scopeAllowed(e)) return;
  e.preventDefault();
  dropTarget.value = { index: i, position: positionFor(e, e.currentTarget as HTMLElement) };
}
function onDrop(i: number, e: DragEvent) {
  if (!props.droppableNodes) return;
  e.preventDefault();
  const target = dropTarget.value;
  dropTarget.value = null;
  const row = rows.value[i];
  let payload: { scope?: string; path: number[]; node: TreeNode } | null = null;
  try { payload = JSON.parse(e.dataTransfer?.getData('application/x-apex-tree') || 'null'); } catch { payload = null; }
  const local = drag.value;
  drag.value = null;
  if (!target || !row) return;
  if (props.droppableScope && payload && (payload.scope || '') !== props.droppableScope) return;

  if (local) {
    handledLocally.value = true;
    const next = moveNode(nodes.value, local.row.path, { path: row.path, position: target.position });
    emit('update:value', next);
    emit('node-drop', { dragNode: local.row.node, dropNode: row.node, position: target.position, value: next });
    return;
  }
  // arriving from another tree: insert a copy, the source tree removes its own
  if (payload) {
    const next = moveNode([...nodes.value, payload.node], [nodes.value.length], { path: row.path, position: target.position });
    emit('update:value', next);
    emit('node-drop', { dragNode: payload.node, dropNode: row.node, position: target.position, value: next });
  }
}
function onDropEmpty(e: DragEvent) {
  if (!props.droppableNodes) return;
  e.preventDefault();
  let payload: { scope?: string; node: TreeNode } | null = null;
  try { payload = JSON.parse(e.dataTransfer?.getData('application/x-apex-tree') || 'null'); } catch { payload = null; }
  const local = drag.value;
  drag.value = null;
  dropTarget.value = null;
  if (props.droppableScope && payload && (payload.scope || '') !== props.droppableScope) return;
  if (local) {
    handledLocally.value = true;
    const next = moveNode(nodes.value, local.row.path, { path: [nodes.value.length - 1], position: 'after' });
    emit('update:value', next);
    emit('node-drop', { dragNode: local.row.node, position: 'after', value: next });
  } else if (payload) {
    const next = [...nodes.value, payload.node];
    emit('update:value', next);
    emit('node-drop', { dragNode: payload.node, position: 'after', value: next });
  }
}
/**
 * A transfer to another tree is two halves: the receiving tree inserts, and this —
 * the source — removes. Only when the drag was actually accepted (dropEffect 'move')
 * and this tree did not handle it itself, which is the reorder case.
 */
function onDragEnd(row: FlatNode, e: DragEvent) {
  const wasLocal = handledLocally.value;
  drag.value = null;
  dropTarget.value = null;
  handledLocally.value = false;
  if (wasLocal || !props.draggableNodes) return;
  if (e.dataTransfer?.dropEffect !== 'move') return;
  emit('update:value', removeNode(nodes.value, row.path));
}

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--apex-tree-indent': props.indent + 'px' };
  if (props.scrollHeight) s['--apex-tree-h'] = props.scrollHeight + 'px';
  if (props.hoverBackground) s['--apex-tree-hover'] = props.hoverBackground;
  if (props.selectedBackground) s['--apex-tree-sel-bg'] = props.selectedBackground;
  if (props.selectedColor) s['--apex-tree-sel-fg'] = props.selectedColor;
  if (props.iconColor) s['--apex-tree-icon'] = props.iconColor;
  if (props.rowRadius) s['--apex-tree-radius'] = props.rowRadius;
  return s;
});
defineExpose({ focusRow, toggle, select });
</script>

<template>
  <div class="apex-tr" :class="ui?.root" :style="rootStyle" :data-bordered="bordered ? 'true' : 'false'"
       :data-loading="loading ? 'true' : 'false'">
    <div v-if="filter || showSelectAll || $slots.header" class="apex-tr__head" :class="ui?.head">
      <slot name="header">
        <button v-if="showSelectAll && selectionMode" type="button" class="apex-cb__box"
                :data-on="allChecked" :data-partial="someChecked" role="checkbox"
                :aria-checked="allChecked ? 'true' : someChecked ? 'mixed' : 'false'"
                aria-label="Select all nodes" @click="toggleAll">
          <ApexIcon v-if="allChecked" name="check" :size="14" />
          <ApexIcon v-else-if="someChecked" name="remove" :size="14" />
        </button>
        <div v-if="filter" class="apex-pop__filter apex-tr__filter" :class="ui?.filter">
          <ApexIcon name="search" />
          <input type="text" :value="query" :placeholder="filterPlaceholder || t('apexui.search')"
                 :aria-label="t('apexui.search')" autocomplete="off"
                 @input="query = ($event.target as HTMLInputElement).value" />
          <button v-if="query" type="button" class="apex-ctl__btn" :aria-label="t('apexui.clear')"
                  @click="query = ''"><ApexIcon name="close" :size="16" /></button>
        </div>
      </slot>
    </div>

    <div class="apex-tr__main" :class="ui?.main">
      <ul v-if="loading && loadingMode === 'skeleton'" class="apex-tr__list" :class="ui?.list" :style="{ maxHeight: scrollHeight ? scrollHeight + 'px' : undefined }">
        <li v-for="n in skeletonRows" :key="'sk' + n" class="apex-tr__row apex-tr__row--skel" :class="ui?.row"
            :style="{ paddingInlineStart: (8 + ((n % 3) * indent)) + 'px' }">
          <span class="apex-skel" style="width:18px;height:18px;border-radius:4px"></span>
          <span class="apex-skel" :style="{ width: (40 + ((n * 13) % 40)) + '%' }"></span>
        </li>
      </ul>

      <ul v-else-if="rows.length" ref="listEl" class="apex-tr__list" :class="ui?.list" role="tree"
          :aria-multiselectable="selectionMode === 'multiple' || isCheckbox || undefined"
          :style="{ maxHeight: scrollHeight ? scrollHeight + 'px' : undefined }"
          @dragover.prevent @drop="onDropEmpty">
        <li v-for="(row, i) in rows" :key="row.node.key" class="apex-tr__row" role="treeitem"
            :class="[row.node.styleClass, ui?.row]"
            :data-row="i" :data-depth="row.depth" :data-state="stateOf(row.node)"
            :data-drop="dropTarget && dropTarget.index === i ? dropTarget.position : undefined"
            :aria-expanded="row.hasChildren ? !!expanded[row.node.key] : undefined"
            :aria-selected="selectionMode ? stateOf(row.node) === 'on' : undefined"
            :aria-level="row.depth + 1"
            :style="{ paddingInlineStart: (8 + row.depth * indent) + 'px' }"
            :tabindex="i === (focusIndex < 0 ? 0 : focusIndex) ? 0 : -1"
            :draggable="draggableNodes || undefined"
            @click="select(row.node, $event)" @keydown="onKey(i, row, $event)"
            @focus="focusIndex = i"
            @dragstart="onDragStart(row, $event)" @dragover="onDragOver(i, $event)"
            @drop.stop="onDrop(i, $event)" @dragend="onDragEnd(row, $event)">
          <button v-if="row.hasChildren" type="button" class="apex-tr__toggle" :class="ui?.toggle"
                  :aria-label="expanded[row.node.key] ? 'Collapse' : 'Expand'"
                  @click.stop="toggle(row.node)">
            <slot name="nodetoggleicon" :node="row.node" :expanded="!!expanded[row.node.key]">
              <ApexIcon v-if="row.node.loading" name="progress_activity" spin :size="17" />
              <ApexIcon v-else :name="expanded[row.node.key] ? 'keyboard_arrow_down' : 'chevron_right'" :size="18" />
            </slot>
          </button>
          <span v-else class="apex-tr__spacer" :class="ui?.spacer"></span>

          <span v-if="selectionMode" class="apex-cb__box apex-tr__box" :class="ui?.checkbox"
                :data-on="stateOf(row.node) === 'on'" :data-partial="stateOf(row.node) === 'partial'"
                aria-hidden="true">
            <ApexIcon v-if="stateOf(row.node) === 'on'" name="check" :size="14" />
            <ApexIcon v-else-if="stateOf(row.node) === 'partial'" name="remove" :size="14" />
          </span>

          <slot name="nodeicon" :node="row.node" :expanded="!!expanded[row.node.key]" :has-children="row.hasChildren">
            <ApexIcon v-if="row.node.icon" :name="row.node.icon" class="apex-tr__icon" :class="ui?.icon" :size="18" />
          </slot>

          <span class="apex-tr__label" :class="ui?.label">
            <slot name="node" :node="row.node" :expanded="!!expanded[row.node.key]" :index="i">
              <slot :node="row.node" :index="i">{{ row.node.label }}</slot>
            </slot>
          </span>
        </li>
      </ul>

      <div v-else class="apex-tr__empty" :class="ui?.empty" @dragover.prevent @drop="onDropEmpty">
        <slot name="empty">
          <ApexIcon name="folder_open" :size="24" />
          <span>{{ query ? t('apexui.noResults') : (emptyMessage || 'No nodes') }}</span>
        </slot>
      </div>

      <div v-if="loading && loadingMode === 'overlay'" class="apex-tr__overlay" :class="ui?.overlay">
        <slot name="loading"><ApexIcon name="progress_activity" spin :size="28" /></slot>
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>
