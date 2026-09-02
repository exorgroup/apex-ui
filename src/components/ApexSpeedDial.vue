<script setup lang="ts">
/**
 * ApexSpeedDial — a floating trigger that fans related actions out around it.
 *
 *   type:      linear | circle | semi-circle | quarter-circle
 *   direction: up | down | left | right (+ the four diagonals for linear and
 *              quarter-circle)
 *
 * `radius` sizes the arc, `gap` the linear spacing, `transitionDelay` staggers
 * each item's entrance, and `mask` dims the page behind the open dial with a
 * colour and opacity you choose.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import ApexIcon from './ApexIcon.vue';
import { itemOffset, tooltipSide, type SpeedDialDirection, type SpeedDialItem, type SpeedDialType } from '../core/speedDial';
import type { ApexSize, ApexButtonAppearance } from '../types';

export type { SpeedDialItem };

const props = withDefaults(defineProps<Omit<ApexButtonAppearance, 'radius'> & {
  items?: SpeedDialItem[];
  type?: SpeedDialType;
  direction?: SpeedDialDirection;
  /** Arc radius in pixels — circle, semi-circle and quarter-circle. */
  radius?: number;
  /** Spacing between linear items, in pixels. */
  gap?: number;
  /** Delay between each item's appearance, in milliseconds. */
  transitionDelay?: number;
  /** Trigger icon while closed / open. */
  icon?: string;
  activeIcon?: string;
  severity?: string;
  size?: ApexSize;
  /** Dim the page behind the open items. */
  mask?: boolean;
  /** Mask colour. Any CSS colour. */
  maskColor?: string;
  /** Mask opacity, 0–1. */
  maskOpacity?: number;
  /** Show a label beside each item on hover. */
  tooltip?: boolean;
  /** Open on hover instead of click. */
  hover?: boolean;
  disabled?: boolean;
  /** Accessible name for the trigger. */
  label?: string;
  /** Pin to a viewport corner instead of flowing inline. */
  position?: 'inline' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}>(), {
  type: 'linear', direction: 'up', radius: 92, gap: 48, transitionDelay: 30,
  icon: 'add', activeIcon: 'close', severity: 'primary', size: 'md',
  maskColor: '#0F141C', maskOpacity: 0.4, position: 'inline',
});

/**
 * Appearance prop -> CSS variable. Only what is set, so an untouched button
 * carries no style attribute at all.
 */
const btnStyle = computed(() => {
  const out: Record<string, string> = {};
  const map: Array<[string | undefined, string]> = [
    [props.color, '--apex-btn-color'],
    [props.hoverColor, '--apex-btn-hover'],
    [props.labelColor, '--apex-btn-label'],
    [props.tintColor, '--apex-btn-tint'],
    [props.height, '--apex-btn-h'],
    [props.fontSize, '--apex-btn-fs'],
    [props.paddingInline, '--apex-btn-pad'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return out;
});


const emit = defineEmits<{
  (e: 'update:open', v: boolean): void;
  (e: 'item-click', payload: { item: SpeedDialItem; index: number; event: MouseEvent }): void;
  (e: 'show' | 'hide'): void;
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const list = computed(() => props.items || []);
const side = computed(() => tooltipSide(props.type, props.direction));

const offsets = computed(() =>
  list.value.map((_, i) => itemOffset(i, list.value.length, props.type, props.direction, props.radius, props.gap)));

function styleFor(i: number) {
  const o = offsets.value[i];
  return {
    transform: open.value ? `translate(${o.x}px, ${o.y}px) scale(1)` : 'translate(0, 0) scale(.4)',
    transitionDelay: `${(open.value ? i : list.value.length - 1 - i) * props.transitionDelay}ms`,
    opacity: open.value ? 1 : 0,
    pointerEvents: open.value ? 'auto' : 'none',
  } as Record<string, string | number>;
}

function toggle() {
  if (props.disabled) return;
  setOpen(!open.value);
}
function setOpen(v: boolean) {
  if (open.value === v) return;
  open.value = v;
  emit('update:open', v);
  emit(v ? 'show' : 'hide');
}
function activate(item: SpeedDialItem, index: number, event: MouseEvent) {
  if (item.disabled) return;
  emit('item-click', { item, index, event });
  setOpen(false);
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') setOpen(false);
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) setOpen(false);
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) { document.addEventListener('mousedown', onDocClick); document.addEventListener('keydown', onKey); }
  else { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); }
});
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('mousedown', onDocClick);
  document.removeEventListener('keydown', onKey);
});
defineExpose({ open, setOpen });
</script>

<template>
  <div ref="root" class="apex-dial" :class="ui?.root" :style="btnStyle" :data-type="type" :data-direction="direction"
       :data-position="position" :data-open="open ? 'true' : 'false'" :data-size="size"
       @mouseenter="hover && setOpen(true)" @mouseleave="hover && setOpen(false)">
    <div v-if="mask" class="apex-dial__mask" :class="ui?.mask" :data-on="open ? 'true' : 'false'"
         :style="{ background: maskColor, opacity: open ? maskOpacity : 0 }" @click="setOpen(false)"></div>

    <ul class="apex-dial__items" :class="ui?.items" :data-open="open ? 'true' : 'false'" role="menu" :aria-hidden="!open">
      <li v-for="(item, i) in list" :key="i" class="apex-dial__item" :class="ui?.item" :style="styleFor(i)" role="none">
        <component :is="item.href ? 'a' : 'button'" class="apex-dial__btn" role="menuitem"
                   :href="item.href" :target="item.target" :type="item.href ? undefined : 'button'"
                   :disabled="item.href ? undefined : item.disabled" :tabindex="open ? 0 : -1"
                   :aria-label="item.label || item.tooltip"
                   @click="activate(item, i, $event)">
          <ApexIcon v-if="item.icon" :name="item.icon" />
        </component>
        <span v-if="tooltip && (item.tooltip || item.label)" class="apex-dial__tip" :class="ui?.tooltip" :data-side="side">
          {{ item.tooltip || item.label }}
        </span>
      </li>
    </ul>

    <button type="button" class="apex-btn apex-dial__trigger" :class="ui?.trigger" :data-severity="severity"
            data-variant="solid" :data-size="size" data-icon-only="true" data-rounded="true"
            :disabled="disabled" :aria-expanded="open" aria-haspopup="menu"
            :aria-label="label || 'Actions'" @click="toggle">
      <ApexIcon :name="open ? activeIcon : icon" />
    </button>
  </div>
</template>
