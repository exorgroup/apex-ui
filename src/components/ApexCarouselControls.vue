<script setup lang="ts">
/**
 * ApexCarouselControls — the standard control row, arranged by the root's
 * navPosition and indicatorPosition.
 *
 * One tag instead of hand-composing a row per carousel; the parts stay
 * available separately for anything this arrangement does not cover.
 * `middle` lifts the arrows out of the row and overlays them on the track's
 * edges, which is why they are rendered here rather than inside the row.
 */
import { computed, inject } from 'vue';
import ApexCarouselNav from './ApexCarouselNav.vue';
import ApexCarouselIndicators from './ApexCarouselIndicators.vue';
import { CAROUSEL_CTX } from '../core/carousel';

withDefaults(defineProps<{ variant?: 'bar' | 'dot' }>(), { variant: 'bar' });
const ctx = inject(CAROUSEL_CTX)!;

const at = computed(() => ctx.navPosition.value);
const overlaid = computed(() => at.value === 'middle');
/* Arrows that lead the row: both of them, or just the previous one when split.
   For the plain row positions the arrows take the side the indicators are not
   using, which is what separates 'bottom' from the explicit 'both-end'. */
const rowLeads = computed(() => (at.value === 'bottom' || at.value === 'top') && ctx.indicatorPosition.value === 'right');
const startNav = computed(() => (at.value === 'both-start' ? 'pair' : at.value === 'split' ? 'prev' : rowLeads.value ? 'pair' : null));
const endNav = computed(() => {
  if (at.value === 'both-end') return 'pair';
  if (at.value === 'split') return 'next';
  if (overlaid.value || at.value === 'both-start' || rowLeads.value) return null;
  return 'pair';
});
const rowNeeded = computed(() => ctx.indicators.value || !!startNav.value || !!endNav.value);
</script>

<template>
  <div v-if="overlaid" class="apex-carousel__overlay" :data-orientation="ctx.orientation.value">
    <ApexCarouselNav dir="prev" />
    <ApexCarouselNav dir="next" />
  </div>
  <div v-if="rowNeeded" class="apex-carousel__controls" :data-nav="at">
    <div v-if="startNav" class="apex-carousel__navs" data-side="start">
      <ApexCarouselNav dir="prev" />
      <ApexCarouselNav v-if="startNav === 'pair'" dir="next" />
    </div>
    <ApexCarouselIndicators :variant="variant" />
    <div v-if="endNav" class="apex-carousel__navs" data-side="end">
      <ApexCarouselNav v-if="endNav === 'pair'" dir="prev" />
      <ApexCarouselNav dir="next" />
    </div>
  </div>
</template>
