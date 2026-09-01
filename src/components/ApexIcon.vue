<script setup lang="ts">
/**
 * ApexIcon — Material Symbols (Outlined, weight axis) rendered as a ligature span.
 * Weight follows the surrounding text by default; `weight` pins it.
 * Swap icon sets wholesale with the plugin's `iconResolver`.
 */
import { computed, inject } from 'vue';
import { APEX_UI_OPTIONS } from '../core/symbols';
import type { ApexUiOptions } from '../types';

const props = withDefaults(defineProps<{
  name: string;
  size?: number | string;
  weight?: number;
  fill?: boolean;
  spin?: boolean;
  label?: string;
}>(), { fill: false, spin: false });

const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});
const glyph = computed(() => (opts.iconResolver ? opts.iconResolver(props.name) : props.name));
const style = computed(() => {
  const s: Record<string, string> = {};
  if (props.size) s['--apex-icon-size'] = typeof props.size === 'number' ? `${props.size}px` : props.size;
  if (props.weight) s['--apex-icon-wght'] = String(props.weight);
  if (props.fill) s['--apex-icon-fill'] = '1';
  return s;
});
</script>

<template>
  <span class="apex-icon" :data-spin="spin ? 'true' : 'false'" :style="style"
        :aria-hidden="label ? undefined : 'true'" :role="label ? 'img' : undefined" :aria-label="label">{{ glyph }}</span>
</template>
