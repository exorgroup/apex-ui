<script setup lang="ts">
/**
 * ApexSidebarTrigger — toggles a sidebar by id, from anywhere in the tree.
 */
import ApexIcon from './ApexIcon.vue';
import { useApexSidebar } from '../core/sidebar';

const props = withDefaults(defineProps<{
  /** Which sidebar to toggle. */
  target?: string;
  icon?: string;
  label?: string;
  size?: number;
}>(), { target: 'primary', icon: 'menu_open', label: 'Toggle sidebar', size: 20 });

const sidebar = useApexSidebar(props.target);
</script>

<template>
  <button type="button" class="apex-sbar-trigger" :aria-label="label" :aria-expanded="sidebar.state.open"
          @click="sidebar.toggle()">
    <slot><ApexIcon :name="icon" :size="size" /></slot>
  </button>
</template>
