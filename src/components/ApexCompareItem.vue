<script setup lang="ts">
/**
 * ApexCompareItem — one side of the comparison.
 *
 * The `before` side is clipped to the divider; the `after` side simply sits
 * underneath it, so nothing about its layout depends on the position.
 */
withDefaults(defineProps<{ position?: 'before' | 'after' }>(), { position: 'before' });
</script>

<template>
  <div class="apex-cmp__item" :data-position="position"><slot /></div>
</template>
