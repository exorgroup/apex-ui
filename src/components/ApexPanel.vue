<script setup lang="ts">
/**
 * ApexPanel — a titled container with an optional content toggle.
 *
 * Where ApexFieldset groups form controls with a legend on the border, a panel
 * has a full header bar that can also carry actions, and a footer.
 */
import { computed, nextTick, ref, watch } from 'vue';
import type { ApexContainerProps } from '../types';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<ApexContainerProps & {
  header?: string;
  subheader?: string;
  icon?: string;
  /** Allow the content to collapse. */
  toggleable?: boolean;
  /** Collapsed state. Bindable. */
  collapsed?: boolean;
  expandIcon?: string;
  collapseIcon?: string;
  /** Put the toggle before the title rather than at the end of the bar. */
  togglePosition?: 'start' | 'end';

  /* presentation */
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md';
  radius?: string;
  padding?: string;
  background?: string;
  borderColor?: string;
  headerBackground?: string;
  headerColor?: string;
  /** Drop the divider under the header. */
  flush?: boolean;
}>(), {
  toggleable: false, togglePosition: 'end', size: 'md', bordered: true, shadow: 'none',
  expandIcon: 'keyboard_arrow_down', collapseIcon: 'keyboard_arrow_up',
  /* Vue casts an ABSENT boolean prop to false, never undefined. Without this,
     `collapsed` reads false when nobody passed it, the check below always takes
     the controlled branch, and the local state is never consulted — so an
     uncontrolled panel cannot be toggled at all. Declaring it undefined keeps
     the prop genuinely tri-state: unset, true, or false. */
  collapsed: undefined,
});

const emit = defineEmits<{
  (e: 'update:collapsed', v: boolean): void;
  (e: 'toggle', payload: { collapsed: boolean }): void;
}>();

const localCollapsed = ref(false);
const shut = computed(() => (props.collapsed !== undefined ? props.collapsed : localCollapsed.value));

function toggle() {
  if (!props.toggleable) return;
  const next = !shut.value;
  localCollapsed.value = next;
  emit('update:collapsed', next);
  emit('toggle', { collapsed: next });
}

/* ── the garage door ──────────────────────────────────────────────────────
   Collapsing used to swap `hidden`, which reads as the content vanishing. The
   region instead rolls: it lifts a little past its own height, then runs to
   zero — and on the way back it overshoots the same amount before settling.
   The lift is what makes it read as a door on a track rather than a wipe.

   Heights have to be measured, not declared, because the content decides them,
   so this is script rather than a CSS transition. */
const OVERSHOOT = 10;   // px past the natural height, at either end
const DURATION = 260;   // ms for the whole travel

const region = ref<HTMLElement | null>(null);
/** True only while the door is moving; it keeps `hidden` off in the meantime. */
const animating = ref(false);
let run = 0;

/** Someone who asked for less motion gets the instant swap, as before. */
const wantsMotion = () =>
  typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches;

watch(shut, async (closing) => {
  const el = region.value;
  // No element, no Web Animations (happy-dom), or reduced motion: `hidden`
  // alone still gives the correct end state.
  if (!el || typeof el.animate !== 'function' || !wantsMotion()) return;

  const mine = ++run;
  /* Closing can measure now, while the region is still laid out. Opening has to
     wait for `hidden` to come off, which `animating` does on the next tick. */
  animating.value = true;
  if (!closing) await nextTick();
  const natural = el.scrollHeight;
  if (mine !== run) return;

  const peak = `${natural + OVERSHOOT}px`;
  const frames = closing
    ? [{ height: `${natural}px` }, { height: peak, offset: 0.25 }, { height: '0px' }]
    : [{ height: '0px' }, { height: peak, offset: 0.75 }, { height: `${natural}px` }];

  /* Clipped only for the duration: a permanently hidden overflow would cut off
     a menu or date picker opening out of the panel body. */
  el.style.overflow = 'hidden';
  try {
    await el.animate(frames, { duration: DURATION, easing: 'cubic-bezier(.22,1,.36,1)' }).finished;
  } catch {
    return; // superseded by a faster click; that run does the cleanup
  }
  if (mine !== run) return;
  el.style.overflow = '';
  animating.value = false;
});

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.radius) s['--apex-panel-radius'] = props.radius;
  if (props.padding) s['--apex-panel-pad'] = props.padding;
  if (props.background) s['--apex-panel-bg'] = props.background;
  if (props.borderColor) s['--apex-panel-border'] = props.borderColor;
  if (props.headerBackground) s['--apex-panel-head-bg'] = props.headerBackground;
  if (props.headerColor) s['--apex-panel-head-fg'] = props.headerColor;
  return s;
});
const hasHeader = computed(() => !!(props.header || props.subheader || props.icon || props.toggleable));
</script>

<template>
  <section class="apex-pn" :class="ui?.root" :style="rootStyle" :data-size="size" :data-shadow="shadow"
           :data-bordered="bordered ? 'true' : 'false'" :data-collapsed="shut ? 'true' : 'false'"
           :data-flush="flush ? 'true' : 'false'" :data-toggle="togglePosition">
    <header v-if="hasHeader || $slots.header || $slots.icons" class="apex-pn__head" :class="ui?.head">
      <button v-if="toggleable" type="button" class="apex-pn__toggle" :class="ui?.toggle" :aria-expanded="!shut"
              :aria-label="shut ? 'Expand' : 'Collapse'" @click="toggle">
        <slot name="toggleicon" :collapsed="shut">
          <ApexIcon :name="shut ? expandIcon : collapseIcon" :size="19" />
        </slot>
      </button>

      <slot name="header">
        <ApexIcon v-if="icon" :name="icon" class="apex-pn__icon" :class="ui?.icon" :size="19" />
        <span class="apex-pn__titles">
          <h3 v-if="header" class="apex-pn__title" :class="ui?.title">{{ header }}</h3>
          <p v-if="subheader" class="apex-pn__sub" :class="ui?.sub">{{ subheader }}</p>
        </span>
      </slot>

      <span v-if="$slots.icons" class="apex-pn__actions"><slot name="icons" /></span>
    </header>

    <!-- Body and footer travel together, so the door is one moving element
         rather than two that happen to animate alike. `hidden` stays off while
         it moves, or the content would vanish before it had gone anywhere. -->
    <div ref="region" class="apex-pn__region" :class="ui?.region" :hidden="shut && !animating">
      <div class="apex-pn__body" :class="ui?.body"><slot /></div>
      <footer v-if="$slots.footer" class="apex-pn__foot" :class="ui?.foot"><slot name="footer" /></footer>
    </div>
  </section>
</template>
