<script setup lang="ts">
/**
 * ApexOrgNode — one node and its subtree. Self-recursive, forwarding the two
 * customisation slots down so a chart of any depth uses one template.
 */
import { nextTick, onMounted, onUpdated, ref } from 'vue';
import ApexIcon from './ApexIcon.vue';

export interface OrgNode {
  key: string;
  label?: string;
  subtitle?: string;
  icon?: string;
  image?: string;
  /** Marks a node for your own styling, e.g. 'department'. */
  type?: string;
  /** Colours for this node alone, overriding the chart's. */
  background?: string;
  color?: string;
  borderColor?: string;
  styleClass?: string;
  selectable?: boolean;
  data?: Record<string, unknown>;
  children?: OrgNode[];
}

const props = defineProps<{
  node: OrgNode;
  collapsible: boolean;
  isCollapsed: (key: string) => boolean;
  selectionMode: 'single' | 'multiple' | 'checkbox' | null;
  selectState: (node: OrgNode) => 'on' | 'off' | 'partial';
}>();

const emit = defineEmits<{
  (e: 'toggle' | 'select', node: OrgNode): void;
}>();

const hasKids = (n: OrgNode) => !!n.children && n.children.length > 0;

/** A node may carry its own colours; they set the same properties the chart uses. */
function nodeStyle(n: OrgNode) {
  const s: Record<string, string> = {};
  if (n.background) s['--oc-node-bg'] = n.background;
  if (n.color) s['--oc-node-fg'] = n.color;
  if (n.borderColor) s['--oc-node-border'] = n.borderColor;
  return s;
}

/**
 * The rail spans the first child's centre to the last child's centre. Node widths
 * vary, so the span has to be measured — half-rails drawn from each child always
 * overhang or fall short at the ends.
 */
const kidsEl = ref<HTMLElement | null>(null);
function measureRail() {
  const ul = kidsEl.value;
  if (!ul) return;
  const kids = Array.from(ul.children) as HTMLElement[];
  if (kids.length < 2) return;
  const first = kids[0], last = kids[kids.length - 1];
  const horizontal = !!ul.closest('[data-orientation="horizontal"]');
  const a = horizontal ? first.offsetTop + first.offsetHeight / 2 : first.offsetLeft + first.offsetWidth / 2;
  const b = horizontal ? last.offsetTop + last.offsetHeight / 2 : last.offsetLeft + last.offsetWidth / 2;
  ul.style.setProperty('--oc-rail-start', a + 'px');
  ul.style.setProperty('--oc-rail-width', (b - a) + 'px');
}
onMounted(() => nextTick(measureRail));
onUpdated(() => nextTick(measureRail));
</script>

<template>
  <li class="apex-oc__branch"
      :data-collapsed="collapsible && hasKids(node) && isCollapsed(node.key) ? 'true' : undefined">
    <div class="apex-oc__nodewrap">
      <div class="apex-oc__node" :class="node.styleClass" :style="nodeStyle(node)" :data-type="node.type"
           :data-state="selectState(node)"
           :data-selectable="selectionMode && node.selectable !== false ? 'true' : undefined"
           :tabindex="selectionMode && node.selectable !== false ? 0 : -1"
           :role="selectionMode ? 'button' : undefined"
           :aria-pressed="selectionMode && selectionMode !== 'checkbox' ? selectState(node) === 'on' : undefined"
           @click="selectionMode && node.selectable !== false && emit('select', node)"
           @keydown.enter.prevent="selectionMode && emit('select', node)"
           @keydown.space.prevent="selectionMode && emit('select', node)">
        <slot name="node" :node="node" :selected="selectState(node) === 'on'"
              :partial-selected="selectState(node) === 'partial'"
              :collapsed="isCollapsed(node.key)">
          <span v-if="selectionMode === 'checkbox' && node.selectable !== false" class="apex-cb__box"
                :data-on="selectState(node) === 'on'" :data-partial="selectState(node) === 'partial'"
                aria-hidden="true">
            <ApexIcon v-if="selectState(node) === 'on'" name="check" :size="14" />
            <ApexIcon v-else-if="selectState(node) === 'partial'" name="remove" :size="14" />
          </span>
          <img v-if="node.image" class="apex-oc__img" :src="node.image" :alt="node.label || ''" />
          <ApexIcon v-else-if="node.icon" :name="node.icon" :size="20" class="apex-oc__icon" />
          <span class="apex-oc__text">
            <span class="apex-oc__label">{{ node.label }}</span>
            <span v-if="node.subtitle" class="apex-oc__sub">{{ node.subtitle }}</span>
          </span>
        </slot>
      </div>

      <button v-if="collapsible && hasKids(node)" type="button" class="apex-oc__toggle"
              :aria-expanded="!isCollapsed(node.key)"
              :aria-label="isCollapsed(node.key) ? 'Expand' : 'Collapse'"
              @click.stop="emit('toggle', node)">
        <slot name="toggleicon" :collapsed="isCollapsed(node.key)">
          <ApexIcon :name="isCollapsed(node.key) ? 'expand_more' : 'expand_less'" :size="16" />
        </slot>
      </button>
    </div>

    <ul v-if="hasKids(node) && !isCollapsed(node.key)" ref="kidsEl" class="apex-oc__children"
        :data-single="node.children!.length === 1 ? 'true' : 'false'">
      <ApexOrgNode v-for="child in node.children" :key="child.key" :node="child"
                   :collapsible="collapsible" :is-collapsed="isCollapsed"
                   :selection-mode="selectionMode" :select-state="selectState"
                   @toggle="emit('toggle', $event)" @select="emit('select', $event)">
        <template #node="s"><slot name="node" v-bind="s" /></template>
        <template #toggleicon="s"><slot name="toggleicon" v-bind="s" /></template>
      </ApexOrgNode>
    </ul>
  </li>
</template>
