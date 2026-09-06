<template>
  <div class="media-stage">
    <!-- A comparison needs two children to compare; the rail drives the
         divider, the orientation and every piece of its chrome. -->
    <div v-if="id === 'compare'" class="cfm-stage" style="max-width:460px">
      <ApexCompare v-bind="bind" v-model="cmpPg"
                   :aspect-ratio="(bind?.aspectRatio as string) || '16/10'" style="width:100%">
        <ApexCompareItem position="before"><div class="cmp-plate cmp-plate--a">Before</div></ApexCompareItem>
        <ApexCompareItem position="after"><div class="cmp-plate cmp-plate--b">After</div></ApexCompareItem>
      </ApexCompare>
      <p class="cfm-log">Position <code>{{ Math.round(cmpPg) }}%</code></p>
    </div>

    <!-- A carousel with no slides is an empty rail, so the stage supplies six
         and a control row — the rail's navPosition and indicatorPosition have
         nothing to arrange otherwise. -->
    <div v-else-if="id === 'carousel'" class="cfm-stage" style="max-width:520px">
      <ApexCarousel v-bind="bind" v-model:slide="carPg" style="width:100%">
        <ApexCarouselContent :style="bind?.orientation === 'vertical' ? 'height:240px' : 'height:180px'">
          <ApexCarouselItem v-for="n in 6" :key="n">
            <div class="car-tile" :style="bind?.autoSize ? { width: `${90 + n * 34}px` } : undefined">{{ n }}</div>
          </ApexCarouselItem>
        </ApexCarouselContent>
        <ApexCarouselControls />
      </ApexCarousel>
      <p class="cfm-log">Slide <code>{{ carPg + 1 }}</code> of 6</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for the media family — ApexCompare, and ApexCarousel
 * and ApexGallery as they land.
 *
 * Kept out of App.vue for the reason MenuStage and OverlayStage are: each of
 * these needs its own shape of host. A comparison is nothing without two
 * children to compare, a carousel without slides is an empty rail, and none
 * of that is about the page around it.
 *
 * Every branch must actually render something. An entry with demo: 'media'
 * and no branch here is an empty div that warns about nothing and passes
 * every other check — which is exactly how two overlay stages once shipped
 * blank, and how the dock spent a week in a plain grey box.
 */
import { ref } from 'vue';
import {
  ApexCompare, ApexCompareItem,
  ApexCarousel, ApexCarouselContent, ApexCarouselItem, ApexCarouselControls,
} from '@exorgroup/apex-ui';

defineProps<{
  /** The registry id, which decides which control is shown. */
  id: string;
  /** Live props from the playground rail. */
  bind?: Record<string, unknown>;
}>();

/** The divider position, so the rail and the drag agree on one number. */
const cmpPg = ref(50);

/** The active slide, bound so the caption follows a drag as well as a press. */
const carPg = ref(0);
</script>
