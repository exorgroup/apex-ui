<script setup lang="ts">
/**
 * ApexBadge — a small count or status marker.
 *
 * Sized from its own content with a circular minimum, so a single digit is a
 * circle and a longer value grows into a pill rather than being clipped. `dot`
 * drops the value entirely for the "something changed" case.
 */
import { computed } from 'vue';

export type BadgeSeverity =
  | 'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'contrast';

const props = withDefaults(defineProps<{
  value?: string | number;
  severity?: BadgeSeverity;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /** A marker with no value. */
  dot?: boolean;
  variant?: 'solid' | 'outlined' | 'subtle';
  background?: string;
  color?: string;
  borderColor?: string;
  radius?: string;
}>(), { severity: 'primary', size: 'md', variant: 'solid' });

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (typeof props.size === 'number') s['--apex-badge-size'] = props.size + 'px';
  if (props.background) s['--apex-badge-bg'] = props.background;
  if (props.color) s['--apex-badge-fg'] = props.color;
  if (props.borderColor) s['--apex-badge-border'] = props.borderColor;
  if (props.radius) s.borderRadius = props.radius;
  return s;
});
const sizeToken = computed(() => (typeof props.size === 'number' ? undefined : props.size));
</script>

<template>
  <span class="apex-bdg" :style="rootStyle" :data-severity="severity" :data-size="sizeToken"
        :data-variant="variant" :data-dot="dot ? 'true' : 'false'">
    <slot v-if="!dot">{{ value }}</slot>
  </span>
</template>
