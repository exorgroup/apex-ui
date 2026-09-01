<script setup lang="ts">
/**
 * ApexCarouselContent — the scroll-snap track.
 *
 * Reports the active item back to the root by watching its own scroll position,
 * so a drag, a flick or a trackpad swipe updates the indicators exactly like a
 * button press. The read is rAF-throttled: scroll fires far more often than the
 * index can change.
 */
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { CAROUSEL_CTX } from '../core/carousel';

const ctx = inject(CAROUSEL_CTX)!;
const el = ref<HTMLElement | null>(null);
let raf: number | null = null;

function nearest() {
  const node = el.value;
  if (!node) return;
  /* A programmatic move owns the index until it lands. */
  if (ctx.settling.value) return;
  const vertical = ctx.orientation.value === 'vertical';
  /* A track that cannot scroll has no scroll position to derive an active item
     from — reading one anyway invented an index and, through a shared
     v-model:slide, dragged the other carousel with it. */
  const extent = vertical ? node.scrollHeight - node.clientHeight : node.scrollWidth - node.clientWidth;
  if (extent <= 1) return;
  const pos = vertical ? node.scrollTop : node.scrollLeft;
  const view = vertical ? node.clientHeight : node.clientWidth;
  const bias = ctx.align.value === 'center' ? view / 2 : ctx.align.value === 'end' ? view : 0;
  let best = 0;
  let bestD = Infinity;
  const nr = node.getBoundingClientRect();
  (Array.from(node.children) as HTMLElement[]).forEach((child, i) => {
    const cr = child.getBoundingClientRect();
    const start = vertical ? cr.top - nr.top + node.scrollTop : cr.left - nr.left + node.scrollLeft;
    const size = vertical ? cr.height : cr.width;
    const centre = start + (ctx.align.value === 'center' ? size / 2 : ctx.align.value === 'end' ? size : 0);
    const d = Math.abs(centre - (pos + bias));
    if (d < bestD) { bestD = d; best = i; }
  });
  /* At either end the nearest item may not be the furthest one reachable, which
     with centre or end alignment reads as a stuck last slide. */
  const at = vertical ? node.scrollTop : node.scrollLeft;
  if (at <= 1) best = 0;
  else if (at >= extent - 1) best = node.children.length - 1;
  ctx.current.value = best;
}

function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = null; nearest(); });
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  ctx.setScroller(el.value);
  if (el.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(() => { ctx.count.value = el.value!.children.length; });
    ro.observe(el.value);
  }
});
onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf);
  ro?.disconnect();
  ctx.setScroller(null);
});

const style = computed(() => ({
  '--car-gap': ctx.gap.value,
  '--car-per': String(ctx.slidesPerPage.value),
}));
</script>

<template>
  <div ref="el" class="apex-carousel__track" :style="style"
       :data-orientation="ctx.orientation.value" :data-align="ctx.align.value"
       :data-auto="ctx.autoSize.value ? 'true' : 'false'" @scroll="onScroll">
    <slot />
  </div>
</template>
