<script setup lang="ts">
/**
 * ApexOverlayBadge — pins a badge to the corner of whatever it wraps.
 *
 * A wrapper rather than a prop on every component: any element can carry a
 * badge this way, and the badge keeps its own props instead of each host
 * re-declaring them.
 */
import ApexBadge, { type BadgeSeverity } from './ApexBadge.vue';

withDefaults(defineProps<{
  value?: string | number;
  severity?: BadgeSeverity;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  dot?: boolean;
  variant?: 'solid' | 'outlined' | 'subtle';
  position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
  background?: string;
  color?: string;
  borderColor?: string;
  radius?: string;
  /** Ring separating the badge from a busy host. */
  ring?: boolean;
  ringColor?: string;
}>(), { severity: 'danger', size: 'md', variant: 'solid', position: 'top-end', ring: true });
</script>

<template>
  <span class="apex-obdg" :data-pos="position" :style="ringColor ? { '--apex-badge-ring': ringColor } : undefined">
    <slot />
    <ApexBadge class="apex-obdg__badge" :data-ring="ring ? 'true' : 'false'"
               :value="value" :severity="severity" :size="size" :dot="dot" :variant="variant"
               :background="background" :color="color" :border-color="borderColor" :radius="radius">
      <slot name="badge">{{ value }}</slot>
    </ApexBadge>
  </span>
</template>
