<script setup lang="ts">
/**
 * ApexCarousel — the root of a composed carousel.
 *
 * Movement is native scroll-snap rather than a transformed track: the browser
 * already does momentum, snapping, touch and trackpad gestures well, and a
 * scroller stays reachable by keyboard and screen reader without extra work.
 * This component owns the state and hands it to its parts through context, so
 * nav buttons, indicators and the track can sit anywhere in the markup.
 *
 * `slide` is bindable, which is what makes a thumbnail gallery two carousels
 * sharing one index rather than a special component.
 */
import { computed, provide, ref, toRef, watch } from 'vue';
import { CAROUSEL_CTX } from '../core/carousel';

const props = withDefaults(defineProps<{
  /** v-model:slide — the active item index. */
  slide?: number;
  /** Where the active item lands in the viewport. */
  align?: 'start' | 'center' | 'end';
  /** Fractions are allowed: 2.5 shows a partial slide as an affordance. */
  slidesPerPage?: number;
  orientation?: 'horizontal' | 'vertical';
  /** Wrap past the ends instead of stopping. */
  loop?: boolean;
  /** Let items size themselves instead of dividing the track. */
  autoSize?: boolean;
  gap?: string;
  /** Off removes the indicators wherever they are composed. */
  indicators?: boolean;
  indicatorPosition?: 'left' | 'center' | 'right';
  /**
   * Where ApexCarouselControls puts the arrows: in the control row (bottom or
   * top), overlaid on the track's edges (middle), both together at either end of
   * the row, or one at each end (split).
   */
  navPosition?: 'bottom' | 'top' | 'middle' | 'both-start' | 'both-end' | 'split';
}>(), {
  slide: 0, align: 'start', slidesPerPage: 1,
  orientation: 'horizontal', gap: '16px',
  indicators: true, indicatorPosition: 'left', navPosition: 'bottom',
});

const emit = defineEmits<{ (e: 'update:slide', v: number): void }>();

const current = ref(props.slide);
const count = ref(0);
const scroller = ref<HTMLElement | null>(null);
/* True from a goTo until its scroll comes to rest. A smooth scroll passes
   through intermediate items, and two carousels bound to one index would each
   chase the other's mid-flight value. */
const settling = ref(false);
let settleTimer: number | null = null;
function markSettling() {
  settling.value = true;
  if (settleTimer) clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => { settling.value = false; settleTimer = null; }, 700);
}

watch(() => props.slide, (v) => { if (v !== current.value) goTo(v); });
watch(current, (v) => emit('update:slide', v));

function items(): HTMLElement[] {
  const el = scroller.value;
  return el ? (Array.from(el.children) as HTMLElement[]) : [];
}

/* Measured from the scroller, not from offsetParent: the track is position:static,
   so a child's offsetLeft is relative to some ancestor and every target came out
   hundreds of pixels too far. Rects plus the current scroll are exact on both
   axes and correct under RTL. */
function offsetFor(child: HTMLElement) {
  const el = scroller.value!;
  const vertical = props.orientation === 'vertical';
  const cr = child.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const start = vertical ? cr.top - er.top + el.scrollTop : cr.left - er.left + el.scrollLeft;
  const size = vertical ? cr.height : cr.width;
  const view = vertical ? el.clientHeight : el.clientWidth;
  if (props.align === 'center') return start - (view - size) / 2;
  if (props.align === 'end') return start - (view - size);
  return start;
}

function goTo(i: number, smooth = true) {
  const list = items();
  if (!list.length) { current.value = i; return; }
  const max = list.length - 1;
  const target = props.loop ? (i < 0 ? max : i > max ? 0 : i) : Math.min(max, Math.max(0, i));
  current.value = target;
  markSettling();
  const el = scroller.value!;
  const vertical = props.orientation === 'vertical';
  const to = Math.max(0, offsetFor(list[target]));
  const from = vertical ? el.scrollTop : el.scrollLeft;
  el.scrollTo(vertical
    ? { top: to, behavior: smooth ? 'smooth' : 'auto' }
    : { left: to, behavior: smooth ? 'smooth' : 'auto' });
  /* A smooth scrollTo on a mandatory snap track is sometimes swallowed outright.
     Rather than trust it, check whether anything moved and repeat without the
     animation — a jump beats an indicator claiming a slide you are not on. */
  if (!smooth || Math.abs(to - from) < 2) return;
  window.setTimeout(() => {
    const el2 = scroller.value;
    if (!el2) return;
    const now = vertical ? el2.scrollTop : el2.scrollLeft;
    if (Math.abs(now - from) < 2) {
      el2.scrollTo(vertical ? { top: to, behavior: 'auto' } : { left: to, behavior: 'auto' });
    }
  }, 260);
}

const canPrev = computed(() => props.loop || current.value > 0);
const canNext = computed(() => props.loop || current.value < count.value - 1);

provide(CAROUSEL_CTX, {
  align: toRef(props, 'align'),
  slidesPerPage: toRef(props, 'slidesPerPage'),
  orientation: toRef(props, 'orientation'),
  loop: toRef(props, 'loop') as never,
  autoSize: toRef(props, 'autoSize') as never,
  gap: toRef(props, 'gap'),
  indicators: toRef(props, 'indicators') as never,
  indicatorPosition: toRef(props, 'indicatorPosition'),
  navPosition: toRef(props, 'navPosition'),
  current, count, settling,
  setScroller(el) {
    scroller.value = el;
    count.value = el ? el.children.length : 0;
    if (el && current.value) goTo(current.value, false);
  },
  goTo,
  next: () => goTo(current.value + 1),
  prev: () => goTo(current.value - 1),
  canPrev, canNext,
});
</script>

<template>
  <div class="apex-carousel" :data-orientation="orientation">
    <slot />
  </div>
</template>
