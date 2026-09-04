<script setup lang="ts">
/**
 * ApexAccordion — a set of collapsible panels.
 *
 * Panels come from an `items` array rather than child components, so a dynamic
 * accordion is a v-for over your own data with no wrapper markup. `header`,
 * `content` and `toggleicon` slots cover per-panel customisation.
 */
import { computed, ref } from 'vue';
import ApexIcon from './ApexIcon.vue';

export interface AccordionPanel {
  value: string | number;
  header?: string;
  /** Plain text content, when a `content` slot would be overkill. */
  content?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  data?: unknown;
}

const props = withDefaults(defineProps<{
  items?: AccordionPanel[];
  /** The open panel, or panels when `multiple`. Bindable. */
  value?: string | number | Array<string | number> | null;
  multiple?: boolean;
  /** Allow closing the only open panel. */
  collapsible?: boolean;
  /** Render a panel's content only once it has been opened. */
  lazy?: boolean;

  /* presentation */
  togglePosition?: 'start' | 'end';
  expandIcon?: string;
  collapseIcon?: string;
  /** Separated cards rather than one joined stack. */
  gap?: string;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';

  /* colours */
  headerBackground?: string;
  headerColor?: string;
  activeBackground?: string;
  activeColor?: string;
  contentBackground?: string;
  borderColor?: string;
  radius?: string;
}>(), {
  collapsible: true, togglePosition: 'end', size: 'md', bordered: true,
  expandIcon: 'keyboard_arrow_down', collapseIcon: 'keyboard_arrow_up',
});

const emit = defineEmits<{
  (e: 'update:value', v: string | number | Array<string | number> | null): void;
  (e: 'panel-open' | 'panel-close', panel: AccordionPanel): void;
}>();

const panels = computed(() => props.items || []);
const localValue = ref<string | number | Array<string | number> | null>(props.multiple ? [] : null);
const active = computed(() => (props.value !== undefined ? props.value : localValue.value));

const openSet = computed<Array<string | number>>(() => {
  const v = active.value;
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
});
const isOpen = (panel: AccordionPanel) => openSet.value.includes(panel.value);

/** Panels that have ever been opened, so lazy content stays mounted afterwards. */
const seen = ref<Set<string | number>>(new Set());
const shouldRender = (panel: AccordionPanel) => !props.lazy || isOpen(panel) || seen.value.has(panel.value);

function commit(next: string | number | Array<string | number> | null) {
  localValue.value = next;
  emit('update:value', next);
}
function toggle(panel: AccordionPanel) {
  if (panel.disabled) return;
  const on = isOpen(panel);
  if (!on) seen.value = new Set(seen.value).add(panel.value);

  if (props.multiple) {
    const cur = openSet.value.slice();
    commit(on ? cur.filter((v) => v !== panel.value) : [...cur, panel.value]);
  } else if (on) {
    if (!props.collapsible) return;
    commit(null);
  } else {
    commit(panel.value);
  }
  emit(on ? 'panel-close' : 'panel-open', panel);
}

/** Roving focus across the headers, skipping disabled panels. */
const headers = ref<HTMLButtonElement[]>([]);
function move(i: number, delta: number) {
  const n = panels.value.length;
  for (let step = 1; step <= n; step++) {
    const j = (i + delta * step + n * step) % n;
    if (!panels.value[j].disabled) { headers.value[j]?.focus(); return; }
  }
}
/** focus() on a disabled button is a no-op, so seek from the edge inwards. */
function focusEdge(from: 'first' | 'last') {
  const n = panels.value.length;
  for (let k = 0; k < n; k++) {
    const j = from === 'first' ? k : n - 1 - k;
    if (!panels.value[j].disabled) { headers.value[j]?.focus(); return; }
  }
}
function onKey(i: number, panel: AccordionPanel, e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); move(i, 1); break;
    case 'ArrowUp': e.preventDefault(); move(i, -1); break;
    case 'Home': e.preventDefault(); focusEdge('first'); break;
    case 'End': e.preventDefault(); focusEdge('last'); break;
    case ' ':
    case 'Enter': e.preventDefault(); toggle(panel); break;
    default: break;
  }
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.gap) s['--apex-accordion-gap'] = props.gap;
  if (props.headerBackground) s['--apex-accordion-head-bg'] = props.headerBackground;
  if (props.headerColor) s['--apex-accordion-head-fg'] = props.headerColor;
  if (props.activeBackground) s['--apex-accordion-active-bg'] = props.activeBackground;
  if (props.activeColor) s['--apex-accordion-active-fg'] = props.activeColor;
  if (props.contentBackground) s['--apex-accordion-body-bg'] = props.contentBackground;
  if (props.borderColor) s['--apex-accordion-border'] = props.borderColor;
  if (props.radius) s['--apex-accordion-radius'] = props.radius;
  return s;
});
const panelId = (panel: AccordionPanel) => `apex-ac-${String(panel.value).replace(/\W+/g, '-')}`;
defineExpose({ toggle, isOpen });
</script>

<template>
  <div class="apex-ac" :style="rootStyle" :data-size="size" :data-toggle="togglePosition"
       :data-separated="gap ? 'true' : 'false'" :data-bordered="bordered ? 'true' : 'false'">
    <section v-for="(panel, i) in panels" :key="panel.value" class="apex-ac__panel"
             :data-open="isOpen(panel) ? 'true' : 'false'"
             :data-disabled="panel.disabled ? 'true' : 'false'">
      <h3 class="apex-ac__heading">
        <button ref="headers" type="button" class="apex-ac__header" :id="`${panelId(panel)}-h`"
                :aria-expanded="isOpen(panel)" :aria-controls="panelId(panel)"
                :aria-disabled="panel.disabled || undefined" :disabled="panel.disabled"
                :data-p="isOpen(panel) ? 'active' : 'inactive'"
                @click="toggle(panel)" @keydown="onKey(i, panel, $event)">
          <span class="apex-ac__toggle">
            <slot name="toggleicon" :panel="panel" :active="isOpen(panel)">
              <ApexIcon :name="isOpen(panel) ? collapseIcon : expandIcon" :size="20" />
            </slot>
          </span>
          <ApexIcon v-if="panel.icon" :name="panel.icon" class="apex-ac__icon" :size="18" />
          <span class="apex-ac__title">
            <slot name="header" :panel="panel" :active="isOpen(panel)" :index="i">{{ panel.header }}</slot>
          </span>
          <span v-if="panel.badge != null" class="apex-dt__badge" data-tone="neutral">{{ panel.badge }}</span>
        </button>
      </h3>

      <div class="apex-ac__body" :id="panelId(panel)" role="region"
           :aria-labelledby="`${panelId(panel)}-h`" :hidden="!isOpen(panel)">
        <div v-if="shouldRender(panel)" class="apex-ac__inner">
          <slot name="content" :panel="panel" :active="isOpen(panel)" :index="i">
            <slot :panel="panel" :index="i">{{ panel.content }}</slot>
          </slot>
        </div>
      </div>
    </section>
  </div>
</template>
