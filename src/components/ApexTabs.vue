<script setup lang="ts">
/**
 * ApexTabs — grouped content behind a tab strip.
 *
 * Tabs are declared as a `tabs` array and their content comes from `panel-<n>`
 * slots, matching ApexSteps and ApexSplitter. The strip can sit on any edge, and
 * the active indicator is a single element positioned from the active tab's
 * measured box, so it animates and needs no per-tab bookkeeping.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';

export interface TabItem {
  /** Stable identifier. Falls back to the 1-based index. */
  value?: string | number;
  label?: string;
  icon?: string;
  /** Count or short text badge beside the label. */
  badge?: string | number;
  badgeSeverity?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  disabled?: boolean;
  /** Render this panel only once its tab is first activated. */
  lazy?: boolean;
}

const props = withDefaults(defineProps<{
  tabs?: TabItem[];
  /** The active tab's `value`. Bindable. */
  modelValue?: string | number;
  /** Which edge the strip sits on. */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Arrow keys activate as they move, rather than only moving focus. */
  selectOnFocus?: boolean;
  /** Defer every panel until its tab is first shown. Per-tab `lazy` overrides. */
  lazy?: boolean;
  /** Discard a lazy panel when it deactivates, so it re-initialises next time. */
  unmountInactive?: boolean;
  /** Tabs without panels — a nav strip. */
  tabsOnly?: boolean;

  /* appearance */
  size?: 'sm' | 'md' | 'lg';
  /** underline = a moving bar, pill = a filled tab, enclosed = folder tabs. */
  variant?: 'underline' | 'pill' | 'enclosed';
  /** Stretch the tabs to fill the strip. */
  fill?: boolean;
  align?: 'start' | 'center' | 'end';
  activeColor?: string;
  indicatorColor?: string;
  tabColor?: string;
  stripBackground?: string;
  borderColor?: string;
  radius?: string;
  /** Panel padding. */
  padding?: string;
  bordered?: boolean;
  /** Fixed strip width for the left and right placements. */
  stripWidth?: string;
  disabled?: boolean;
}>(), {
  placement: 'top', size: 'md', variant: 'underline', align: 'start', bordered: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void;
  (e: 'tab-change', payload: { value: string | number; index: number; previous: string | number }): void;
}>();

const list = computed(() => props.tabs || []);
const valueOf = (tab: TabItem, i: number) => tab.value ?? i + 1;

const localValue = ref<string | number | undefined>(undefined);
const active = computed(() => {
  const v = props.modelValue ?? localValue.value;
  if (v !== undefined && list.value.some((t, i) => valueOf(t, i) === v)) return v;
  const first = list.value.findIndex((t) => !t.disabled);
  return list.value.length ? valueOf(list.value[Math.max(0, first)], Math.max(0, first)) : 1;
});
const activeIndex = computed(() => list.value.findIndex((t, i) => valueOf(t, i) === active.value));

/** Panels that have been shown at least once, so a lazy one mounts on first use. */
const seen = ref<Set<string | number>>(new Set());
watch(active, (v) => { seen.value = new Set(seen.value).add(v); }, { immediate: true });
const isLazy = (tab: TabItem) => tab.lazy ?? props.lazy;
function shouldRender(tab: TabItem, i: number) {
  if (i === activeIndex.value) return true;
  if (props.unmountInactive) return false;
  if (!isLazy(tab)) return true;
  return seen.value.has(valueOf(tab, i));
}

function select(i: number) {
  const tab = list.value[i];
  if (!tab || tab.disabled || props.disabled) return;
  const next = valueOf(tab, i);
  if (next === active.value) return;
  const previous = active.value;
  localValue.value = next;
  emit('update:modelValue', next);
  emit('tab-change', { value: next, index: i, previous });
}

/* ── keyboard: roving focus along the strip ─────────────── */
const buttons = ref<HTMLElement[]>([]);
const vertical = computed(() => props.placement === 'left' || props.placement === 'right');

function focusTab(i: number) {
  const el = buttons.value[i];
  el?.focus();
  if (props.selectOnFocus) select(i);
}
/** Skips disabled tabs, so arrow keys never land somewhere unusable. */
function step(from: number, dir: 1 | -1) {
  const n = list.value.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + dir * k + n * k) % n;
    if (!list.value[i].disabled) return i;
  }
  return from;
}
function onKey(i: number, e: KeyboardEvent) {
  const forward = vertical.value ? 'ArrowDown' : 'ArrowRight';
  const backward = vertical.value ? 'ArrowUp' : 'ArrowLeft';
  if (e.key === forward) { e.preventDefault(); focusTab(step(i, 1)); return; }
  if (e.key === backward) { e.preventDefault(); focusTab(step(i, -1)); return; }
  if (e.key === 'Home') { e.preventDefault(); focusTab(step(-1, 1)); return; }
  if (e.key === 'End') { e.preventDefault(); focusTab(step(list.value.length, -1)); return; }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
}

/* ── indicator + overflow ───────────────────────────────── */
const strip = ref<HTMLElement | null>(null);
const bar = ref({ pos: 0, size: 0 });
const overflow = ref({ before: false, after: false });

/**
 * The indicator is positioned from the active tab's MEASURED box rather than a
 * per-tab pseudo-element, so one element serves every tab and slides between
 * them. Re-measured on tab change, resize and font load.
 */
function measure() {
  const el = strip.value;
  const btn = buttons.value[activeIndex.value];
  if (!el || !btn) return;
  const er = el.getBoundingClientRect(), br = btn.getBoundingClientRect();
  if (vertical.value) {
    bar.value = { pos: br.top - er.top + el.scrollTop, size: br.height };
    overflow.value = {
      before: el.scrollTop > 1,
      after: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    };
  } else {
    // inline-start offset, so the bar sits correctly under RTL too
    const rtl = getComputedStyle(el).direction === 'rtl';
    const startEdge = rtl ? er.right - br.right : br.left - er.left;
    bar.value = { pos: startEdge + el.scrollLeft, size: br.width };
    const max = el.scrollWidth - el.clientWidth;
    const at = Math.abs(el.scrollLeft);
    overflow.value = { before: at > 1, after: at < max - 1 };
  }
}
const schedule = () => nextTick(measure);
watch([active, list, () => props.placement, () => props.variant, () => props.size, () => props.fill], schedule);

function scrollStrip(dir: 1 | -1) {
  const el = strip.value;
  if (!el) return;
  const amount = (vertical.value ? el.clientHeight : el.clientWidth) * 0.7 * dir;
  if (vertical.value) el.scrollBy({ top: amount, behavior: 'smooth' });
  else el.scrollBy({ left: amount, behavior: 'smooth' });
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  measure();
  if (typeof ResizeObserver !== 'undefined' && strip.value) {
    ro = new ResizeObserver(schedule);
    ro.observe(strip.value);
  }
  if (typeof document !== 'undefined' && (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts) {
    (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready.then(schedule);
  }
});
onBeforeUnmount(() => { ro?.disconnect(); ro = null; });

const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--apex-tabs-pos': bar.value.pos + 'px',
    '--apex-tabs-size': bar.value.size + 'px',
  };
  if (props.activeColor) s['--apex-tabs-active'] = props.activeColor;
  if (props.indicatorColor) s['--apex-tabs-indicator'] = props.indicatorColor;
  if (props.tabColor) s['--apex-tabs-fg'] = props.tabColor;
  if (props.stripBackground) s['--apex-tabs-strip-bg'] = props.stripBackground;
  if (props.borderColor) s['--apex-tabs-border'] = props.borderColor;
  if (props.radius) s['--apex-tabs-radius'] = props.radius;
  if (props.padding) s['--apex-tabs-pad'] = props.padding;
  if (props.stripWidth) s['--apex-tabs-strip-w'] = props.stripWidth;
  return s;
});

defineExpose({ select, measure, activeIndex });
</script>

<template>
  <div class="apex-tabs" :style="rootStyle" :data-placement="placement" :data-size="size"
       :data-variant="variant" :data-fill="fill ? 'true' : 'false'" :data-align="align"
       :data-bordered="bordered ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'"
       :data-vertical="vertical ? 'true' : 'false'">
    <div class="apex-tabs__striparea">
      <button v-if="overflow.before" type="button" class="apex-tabs__scroll" data-dir="before"
              :aria-label="vertical ? 'Scroll up' : 'Scroll back'" @click="scrollStrip(-1)">
        <ApexIcon :name="vertical ? 'keyboard_arrow_up' : 'chevron_left'" :size="18" />
      </button>

      <div ref="strip" class="apex-tabs__strip" role="tablist"
           :aria-orientation="vertical ? 'vertical' : 'horizontal'" @scroll="schedule">
        <button v-for="(tab, i) in list" :key="valueOf(tab, i)" ref="buttons" type="button"
                class="apex-tabs__tab" role="tab" :data-on="i === activeIndex"
                :aria-selected="i === activeIndex" :disabled="tab.disabled || disabled"
                :tabindex="i === activeIndex ? 0 : -1"
                @click="select(i)" @keydown="onKey(i, $event)">
          <slot :name="`tab-${i + 1}`" :tab="tab" :index="i" :active="i === activeIndex">
            <ApexIcon v-if="tab.icon" :name="tab.icon" :size="17" />
            <span class="apex-tabs__label">{{ tab.label }}</span>
            <span v-if="tab.badge !== undefined" class="apex-tabs__badge"
                  :data-tone="tab.badgeSeverity || 'neutral'">{{ tab.badge }}</span>
          </slot>
        </button>

        <span class="apex-tabs__bar" aria-hidden="true"></span>
      </div>

      <button v-if="overflow.after" type="button" class="apex-tabs__scroll" data-dir="after"
              :aria-label="vertical ? 'Scroll down' : 'Scroll forward'" @click="scrollStrip(1)">
        <ApexIcon :name="vertical ? 'keyboard_arrow_down' : 'chevron_right'" :size="18" />
      </button>
    </div>

    <div v-if="!tabsOnly" class="apex-tabs__panels">
      <div v-for="(tab, i) in list" :key="valueOf(tab, i)" class="apex-tabs__panel"
           role="tabpanel" :hidden="i !== activeIndex">
        <slot v-if="shouldRender(tab, i)" :name="`panel-${i + 1}`" :tab="tab" :index="i"
              :active="i === activeIndex" />
      </div>
    </div>
  </div>
</template>
