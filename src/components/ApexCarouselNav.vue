<script setup lang="ts">
/**
 * ApexCarouselNav — one previous/next button.
 *
 * Disables itself at the end of the track unless the carousel loops, so the
 * affordance tells the truth about whether there is anywhere left to go.
 */
import { inject } from 'vue';
import ApexIcon from './ApexIcon.vue';
import { CAROUSEL_CTX } from '../core/carousel';

const props = withDefaults(defineProps<{
  dir?: 'prev' | 'next';
  icon?: string;
  size?: number;
}>(), { dir: 'next', size: 20 });

const ctx = inject(CAROUSEL_CTX)!;
const vertical = () => ctx.orientation.value === 'vertical';
const fallback = () => (props.dir === 'prev'
  ? (vertical() ? 'keyboard_arrow_up' : 'chevron_left')
  : (vertical() ? 'keyboard_arrow_down' : 'chevron_right'));
</script>

<template>
  <button type="button" class="apex-carousel__nav" :class="ctx.ui.value?.nav" :data-dir="dir"
          :aria-label="dir === 'prev' ? 'Previous slide' : 'Next slide'"
          :disabled="dir === 'prev' ? !ctx.canPrev.value : !ctx.canNext.value"
          @click="dir === 'prev' ? ctx.prev() : ctx.next()">
    <slot><ApexIcon :name="icon || fallback()" :size="size" /></slot>
  </button>
</template>
