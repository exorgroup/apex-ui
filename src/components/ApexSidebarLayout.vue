<script setup lang="ts">
/**
 * ApexSidebarLayout — the shell a sidebar lives in: a row of panels and one
 * content region. Exists so the panels can push the content by ordinary layout
 * rather than by margins the consumer has to keep in step.
 */
withDefaults(defineProps<{
  /** inset gives the whole shell padding and rounds both panel and content. */
  variant?: 'plain' | 'inset';
  /** Fixed height, for a demo or a fixed app shell; omit to fill the parent. */
  height?: string;
  background?: string;
  radius?: string;
}>(), { variant: 'plain' });
</script>

<template>
  <div class="apex-sbl" :data-variant="variant"
       :style="{ blockSize: height, '--sbl-bg': background, '--sbl-radius': radius }">
    <slot />
  </div>
</template>
