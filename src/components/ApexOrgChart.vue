<script setup lang="ts">
/**
 * ApexOrgChart — a hierarchy drawn top-down with CSS connectors.
 *
 * Collapsing and selection are both controlled through bindable key maps, so the
 * chart never owns state the app might need: `collapsedKeys` marks what is shut
 * (absent keys stay open) and `selectionKeys` marks what is picked. Checkbox
 * selection cascades to descendants and shows a partial state on ancestors.
 */
import { computed, ref } from 'vue';
import ApexOrgNode, { type OrgNode } from './ApexOrgNode.vue';
import type { ApexOrgChartClasses } from '../types';

export type { OrgNode };

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexOrgChartClasses. */
  ui?: ApexOrgChartClasses;
  /** One root, or several. */
  value?: OrgNode | OrgNode[];
  /** Show a collapse control on every node with children. */
  collapsible?: boolean;
  /** Keys mapped to true are collapsed. Bindable. */
  collapsedKeys?: Record<string, boolean>;
  selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
  /** Keys mapped to true are selected. Bindable. */
  selectionKeys?: Record<string, boolean>;
  /** Lay the chart out left-to-right instead of top-down. */
  orientation?: 'vertical' | 'horizontal';
  /** Connector colour and thickness. */
  lineColor?: string;
  lineWidth?: number;
  /* node colours — any CSS colour; unset falls back to the design tokens */
  nodeBackground?: string;
  nodeColor?: string;
  nodeBorderColor?: string;
  nodeBorderWidth?: number;
  nodeRadius?: string;
  /** The selected and partially-selected states. */
  selectedBackground?: string;
  selectedColor?: string;
  selectedBorderColor?: string;
  partialBorderColor?: string;
  /**
   * Gap between siblings, and between levels. Left unset, each orientation uses
   * its own default — a horizontal chart needs a wider level gap, because that gap
   * has to hold the connector AND the collapse control side by side.
   */
  nodeGap?: string;
  levelGap?: string;
}>(), {
  collapsible: false, selectionMode: null, orientation: 'vertical', lineWidth: 1,
});

const emit = defineEmits<{
  (e: 'update:collapsedKeys', v: Record<string, boolean>): void;
  (e: 'update:selectionKeys', v: Record<string, boolean>): void;
  (e: 'node-expand' | 'node-collapse', node: OrgNode): void;
  (e: 'node-select' | 'node-unselect', node: OrgNode): void;
}>();

const roots = computed<OrgNode[]>(() => {
  const v = props.value;
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
});

/* ── collapsing ─────────────────────────────────────────── */
const localCollapsed = ref<Record<string, boolean>>({});
const collapsed = computed(() => props.collapsedKeys ?? localCollapsed.value);
const isCollapsed = (key: string) => !!collapsed.value[key];

function toggle(node: OrgNode) {
  const next = { ...collapsed.value };
  if (next[node.key]) delete next[node.key];
  else next[node.key] = true;
  localCollapsed.value = next;
  emit('update:collapsedKeys', next);
  emit(next[node.key] ? 'node-collapse' : 'node-expand', node);
}

/* ── selection ──────────────────────────────────────────── */
const localSelection = ref<Record<string, boolean>>({});
const selection = computed(() => props.selectionKeys ?? localSelection.value);

function descendants(node: OrgNode): OrgNode[] {
  const out: OrgNode[] = [];
  const walk = (n: OrgNode) => (n.children || []).forEach((c) => { out.push(c); walk(c); });
  walk(node);
  return out;
}
function selectState(node: OrgNode): 'on' | 'off' | 'partial' {
  if (selection.value[node.key]) return 'on';
  if (props.selectionMode !== 'checkbox') return 'off';
  const kids = descendants(node).filter((n) => n.selectable !== false);
  if (!kids.length) return 'off';
  const hit = kids.filter((n) => selection.value[n.key]).length;
  if (!hit) return 'off';
  return hit === kids.length ? 'on' : 'partial';
}
function select(node: OrgNode) {
  if (!props.selectionMode) return;
  const on = selectState(node) === 'on';
  let next: Record<string, boolean>;

  if (props.selectionMode === 'single') {
    next = on ? {} : { [node.key]: true };
  } else if (props.selectionMode === 'multiple') {
    next = { ...selection.value };
    if (on) delete next[node.key]; else next[node.key] = true;
  } else {
    // checkbox: the node and everything under it move together
    next = { ...selection.value };
    const family = [node, ...descendants(node)].filter((n) => n.selectable !== false);
    family.forEach((n) => { if (on) delete next[n.key]; else next[n.key] = true; });
  }
  localSelection.value = next;
  emit('update:selectionKeys', next);
  emit(on ? 'node-unselect' : 'node-select', node);
}

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--apex-oc-line-w': props.lineWidth + 'px' };
  if (props.lineColor) s['--apex-oc-line'] = props.lineColor;
  if (props.nodeGap) s['--apex-oc-gap'] = props.nodeGap;
  if (props.levelGap) s['--apex-oc-level'] = props.levelGap;
  if (props.nodeBackground) s['--apex-oc-node-bg'] = props.nodeBackground;
  if (props.nodeColor) s['--apex-oc-node-fg'] = props.nodeColor;
  if (props.nodeBorderColor) s['--apex-oc-node-border'] = props.nodeBorderColor;
  if (props.nodeBorderWidth != null) s['--apex-oc-node-border-w'] = props.nodeBorderWidth + 'px';
  if (props.nodeRadius) s['--apex-oc-node-radius'] = props.nodeRadius;
  if (props.selectedBackground) s['--apex-oc-sel-bg'] = props.selectedBackground;
  if (props.selectedColor) s['--apex-oc-sel-fg'] = props.selectedColor;
  if (props.selectedBorderColor) s['--apex-oc-sel-border'] = props.selectedBorderColor;
  if (props.partialBorderColor) s['--apex-oc-partial-border'] = props.partialBorderColor;
  return s;
});
</script>

<template>
  <div class="apex-oc" :class="ui?.root" :style="rootStyle" :data-orientation="orientation">
    <ul class="apex-oc__root" :class="ui?.top">
      <ApexOrgNode v-for="root in roots" :key="root.key" :node="root" :ui="ui"
                   :collapsible="collapsible" :is-collapsed="isCollapsed"
                   :selection-mode="selectionMode" :select-state="selectState"
                   @toggle="toggle" @select="select">
        <template v-if="$slots.default" #node="s"><slot v-bind="s" /></template>
        <template v-if="$slots.toggleicon" #toggleicon="s"><slot name="toggleicon" v-bind="s" /></template>
      </ApexOrgNode>
    </ul>
  </div>
</template>
