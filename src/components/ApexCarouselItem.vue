<script setup lang="ts">
/**
 * ApexCarouselItem — one snap child. Sizing comes from the track.
 *
 * It injects the context only to read the root's `ui` map: an item has no
 * state of its own, but a consumer classing the carousel expects `ui.item` to
 * land here rather than on a prop of every slide.
 */
import { inject } from 'vue';
import { CAROUSEL_CTX, type CarouselCtx } from '../core/carousel';

const ctx = inject(CAROUSEL_CTX) as CarouselCtx;
</script>

<template>
  <div class="apex-carousel__item" :class="ctx.ui.value?.item"><slot /></div>
</template>
