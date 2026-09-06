<script setup lang="ts">
/** ApexCarouselIndicators — one control per item, doubling as position. */
import { inject } from 'vue';
import { CAROUSEL_CTX } from '../core/carousel';

withDefaults(defineProps<{ variant?: 'bar' | 'dot' }>(), { variant: 'bar' });
const ctx = inject(CAROUSEL_CTX)!;
</script>

<template>
  <div v-if="ctx.indicators.value" class="apex-carousel__dots" :class="ctx.ui.value?.dots" :data-variant="variant" :data-align="ctx.indicatorPosition.value" role="tablist">
    <button v-for="i in ctx.count.value" :key="i" type="button" class="apex-carousel__dot" :class="ctx.ui.value?.dot"
            role="tab" :aria-label="`Slide ${i}`" :aria-selected="ctx.current.value === i - 1"
            :data-active="ctx.current.value === i - 1 ? 'true' : 'false'"
            @click="ctx.goTo(i - 1)"></button>
  </div>
</template>
