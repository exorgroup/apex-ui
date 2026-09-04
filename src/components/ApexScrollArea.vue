<script setup lang="ts">
/**
 * ApexScrollArea — themable scrollbars over a native scroller.
 *
 * Scrolling itself stays native (wheel, trackpad, keyboard, touch and
 * scroll-anchoring all behave normally); only the bars are ours. Thumb geometry
 * is measured, so it tracks content that changes size.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  /** Fixed height, or use maxHeight to grow until a limit. */
  height?: string;
  maxHeight?: string;
  width?: string;
  /**
   * auto    — bars appear only while the axis can scroll
   * hover   — as auto, but faded until the area is hovered
   * scroll  — visible only while scrolling
   * always  — always visible
   * hidden  — no bars, scrolling still works
   */
  variant?: 'auto' | 'hover' | 'scroll' | 'always' | 'hidden';
  /** Gradient fade at the scrollable edges. */
  mask?: boolean;
  /* appearance */
  scrollbarSize?: number;
  thumbColor?: string;
  thumbHoverColor?: string;
  trackColor?: string;
  thumbRadius?: string;
  padding?: string;
}>(), { variant: 'auto', scrollbarSize: 8 });

const emit = defineEmits<{
  (e: 'scroll', payload: { top: number; left: number }): void;
}>();

const viewport = ref<HTMLElement | null>(null);
const yBar = ref<HTMLElement | null>(null);
const xBar = ref<HTMLElement | null>(null);
const scrollable = ref({ y: false, x: false });
const thumb = ref({ ySize: 0, yPos: 0, xSize: 0, xPos: 0 });
const edges = ref({ top: false, bottom: false, left: false, right: false });
const scrolling = ref(false);
/** ARIA position, 0–100 per axis, from the same measurement the thumbs use. */
const position = ref({ y: 0, x: 0 });
let seq = 0;
const viewportId = `apex-sa-vp-${++seq}-${Math.random().toString(36).slice(2, 7)}`;
const drag = ref<{ axis: 'y' | 'x'; start: number; from: number } | null>(null);
let idle: ReturnType<typeof setTimeout> | undefined;

function measure() {
  const el = viewport.value;
  if (!el) return;
  const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = el;
  const canY = scrollHeight - clientHeight > 1;
  const canX = scrollWidth - clientWidth > 1;
  scrollable.value = { y: canY, x: canX };
  /*
   * Travel is measured against the BAR, not the viewport: the bar is inset from the
   * edges and shortened when the other axis is present, so using clientHeight here
   * would let the thumb overshoot its own track.
   */
  const yTrack = yBar.value?.clientHeight ?? clientHeight;
  const xTrack = xBar.value?.clientWidth ?? clientWidth;
  // thumb length is the visible share of the content, with a floor so it stays grabbable
  const ySize = canY ? Math.min(yTrack, Math.max(24, (clientHeight / scrollHeight) * yTrack)) : 0;
  const xSize = canX ? Math.min(xTrack, Math.max(24, (clientWidth / scrollWidth) * xTrack)) : 0;
  thumb.value = {
    ySize,
    yPos: canY ? (scrollTop / (scrollHeight - clientHeight)) * (yTrack - ySize) : 0,
    xSize,
    xPos: canX ? (scrollLeft / (scrollWidth - clientWidth)) * (xTrack - xSize) : 0,
  };
  position.value = {
    y: canY ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 0,
    x: canX ? Math.round((scrollLeft / (scrollWidth - clientWidth)) * 100) : 0,
  };
  edges.value = {
    top: scrollTop > 1,
    bottom: canY && scrollTop < scrollHeight - clientHeight - 1,
    left: scrollLeft > 1,
    right: canX && scrollLeft < scrollWidth - clientWidth - 1,
  };
}

function onScroll() {
  measure();
  const el = viewport.value;
  if (el) emit('scroll', { top: el.scrollTop, left: el.scrollLeft });
  if (props.variant !== 'scroll') return;
  scrolling.value = true;
  clearTimeout(idle);
  idle = setTimeout(() => { scrolling.value = false; }, 700);
}

/* ── dragging a thumb ───────────────────────────────────── */
function startDrag(axis: 'y' | 'x', e: PointerEvent) {
  const el = viewport.value;
  if (!el) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  drag.value = {
    axis,
    start: axis === 'y' ? e.clientY : e.clientX,
    from: axis === 'y' ? el.scrollTop : el.scrollLeft,
  };
}
function onDrag(e: PointerEvent) {
  const d = drag.value;
  const el = viewport.value;
  if (!d || !el) return;
  if (d.axis === 'y') {
    const travel = (yBar.value?.clientHeight ?? el.clientHeight) - thumb.value.ySize;
    const ratio = travel > 0 ? (el.scrollHeight - el.clientHeight) / travel : 0;
    el.scrollTop = d.from + (e.clientY - d.start) * ratio;
  } else {
    const travel = (xBar.value?.clientWidth ?? el.clientWidth) - thumb.value.xSize;
    const ratio = travel > 0 ? (el.scrollWidth - el.clientWidth) / travel : 0;
    el.scrollLeft = d.from + (e.clientX - d.start) * ratio;
  }
}
const endDrag = () => { drag.value = null; };

/** Clicking the track pages towards the click. */
function pageTo(axis: 'y' | 'x', e: MouseEvent) {
  const el = viewport.value;
  if (!el || drag.value) return;
  const track = e.currentTarget as HTMLElement;
  const r = track.getBoundingClientRect();
  if (axis === 'y') {
    const before = e.clientY - r.top < thumb.value.yPos;
    el.scrollBy({ top: before ? -el.clientHeight : el.clientHeight, behavior: 'smooth' });
  } else {
    const before = e.clientX - r.left < thumb.value.xPos;
    el.scrollBy({ left: before ? -el.clientWidth : el.clientWidth, behavior: 'smooth' });
  }
}

let ro: ResizeObserver | undefined;
onMounted(() => {
  measure();
  // the bars only render once an axis is known to scroll, so measure again with them
  requestAnimationFrame(measure);
  if (typeof ResizeObserver !== 'undefined' && viewport.value) {
    ro = new ResizeObserver(measure);
    ro.observe(viewport.value);
    const first = viewport.value.firstElementChild;
    if (first) ro.observe(first);
  }
  window.addEventListener('resize', measure);
});
onBeforeUnmount(() => {
  ro?.disconnect();
  window.removeEventListener('resize', measure);
  clearTimeout(idle);
});

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--apex-scroll-size': props.scrollbarSize + 'px' };
  if (props.height) s['--apex-scroll-h'] = props.height;
  if (props.maxHeight) s['--apex-scroll-max-h'] = props.maxHeight;
  if (props.width) s['--apex-scroll-w'] = props.width;
  if (props.thumbColor) s['--apex-scroll-thumb'] = props.thumbColor;
  if (props.thumbHoverColor) s['--apex-scroll-thumb-hover'] = props.thumbHoverColor;
  if (props.trackColor) s['--apex-scroll-track'] = props.trackColor;
  if (props.thumbRadius) s['--apex-scroll-radius'] = props.thumbRadius;
  if (props.padding) s['--apex-scroll-pad'] = props.padding;
  return s;
});
const barsVisible = computed(() => {
  if (props.variant === 'hidden') return false;
  if (props.variant === 'scroll') return scrolling.value || !!drag.value;
  return true;
});
defineExpose({ viewport, measure, scrollTo: (o: ScrollToOptions) => viewport.value?.scrollTo(o) });
</script>

<template>
  <div class="apex-sa" :style="rootStyle" :data-variant="variant"
       :data-bars="barsVisible ? 'true' : 'false'" :data-dragging="drag ? 'true' : 'false'"
       :data-mask="mask ? 'true' : 'false'"
       :data-both="scrollable.y && scrollable.x ? 'true' : 'false'"
       :data-fade-top="edges.top ? 'true' : 'false'" :data-fade-bottom="edges.bottom ? 'true' : 'false'"
       :data-fade-left="edges.left ? 'true' : 'false'" :data-fade-right="edges.right ? 'true' : 'false'">
    <div ref="viewport" :id="viewportId" class="apex-sa__viewport" tabindex="0" @scroll="onScroll">
      <div class="apex-sa__content"><slot /></div>
    </div>

    <div v-if="scrollable.y && variant !== 'hidden'" ref="yBar" class="apex-sa__bar" data-axis="y"
         @mousedown="pageTo('y', $event)">
      <span class="apex-sa__thumb" role="scrollbar" aria-orientation="vertical"
            :aria-controls="viewportId" :aria-valuemin="0" :aria-valuemax="100"
            :aria-valuenow="position.y" :aria-label="'Vertical scrollbar'"
            :style="{ blockSize: thumb.ySize + 'px', transform: `translateY(${thumb.yPos}px)` }"
            @pointerdown.stop="startDrag('y', $event)" @pointermove="onDrag" @pointerup="endDrag"
            @pointercancel="endDrag"></span>
    </div>

    <div v-if="scrollable.x && variant !== 'hidden'" ref="xBar" class="apex-sa__bar" data-axis="x"
         @mousedown="pageTo('x', $event)">
      <span class="apex-sa__thumb" role="scrollbar" aria-orientation="horizontal"
            :aria-controls="viewportId" :aria-valuemin="0" :aria-valuemax="100"
            :aria-valuenow="position.x" :aria-label="'Horizontal scrollbar'"
            :style="{ inlineSize: thumb.xSize + 'px', transform: `translateX(${thumb.xPos}px)` }"
            @pointerdown.stop="startDrag('x', $event)" @pointermove="onDrag" @pointerup="endDrag"
            @pointercancel="endDrag"></span>
    </div>
  </div>
</template>
