<script setup lang="ts">
/**
 * ApexToolbar — a bar with three regions: start, center and end. Content is
 * slotted, since a toolbar's contents are whatever the screen needs; the
 * component owns only the layout and the chrome.
 *
 * Start and end grow equally from a zero basis, so the center region sits on the
 * bar's midpoint whatever the sides hold. When the regions together outgrow the
 * bar it scrolls, so content stays reachable and the regions never overlap.
 */
import { computed } from 'vue';
import type { ApexContainerProps } from '../types';

const props = withDefaults(defineProps<ApexContainerProps & {
  size?: 'sm' | 'md' | 'lg';
  /** Gap between items within a region. */
  gap?: string;
  /** Wrap the regions onto more lines instead of scrolling. */
  wrap?: boolean;
  /* chrome */
  background?: string;
  borderColor?: string;
  color?: string;
  radius?: string;
  padding?: string;
  bordered?: boolean;
  /** Elevation instead of a border. */
  raised?: boolean;
  /** Stick to the top of the scroll container. */
  sticky?: boolean;
}>(), { size: 'md', bordered: true });

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.gap) s['--apex-toolbar-gap'] = props.gap;
  if (props.background) s['--apex-toolbar-bg'] = props.background;
  if (props.borderColor) s['--apex-toolbar-border'] = props.borderColor;
  if (props.color) s['--apex-toolbar-fg'] = props.color;
  if (props.radius) s['--apex-toolbar-radius'] = props.radius;
  if (props.padding) s['--apex-toolbar-pad'] = props.padding;
  return s;
});
</script>

<template>
  <div class="apex-tbar" :class="ui?.root" :style="rootStyle" :data-size="size" :data-wrap="wrap ? 'true' : 'false'"
       :data-bordered="bordered ? 'true' : 'false'" :data-raised="raised ? 'true' : 'false'"
       :data-sticky="sticky ? 'true' : 'false'" role="toolbar">
    <div v-if="$slots.start" class="apex-tbar__region" :class="ui?.region" data-region="start">
      <slot name="start" />
    </div>
    <div v-if="$slots.center" class="apex-tbar__region" :class="ui?.region" data-region="center">
      <slot name="center" />
    </div>
    <div v-if="$slots.end" class="apex-tbar__region" :class="ui?.region" data-region="end">
      <slot name="end" />
    </div>
    <slot />
  </div>
</template>
