<script setup lang="ts">
/**
 * ApexDynamicDialogItem — one live instance from the dialog service.
 *
 * Exists so `dialogRef` can be provided per dialog: provide() is per component
 * instance, so the v-for in ApexDynamicDialog cannot do it itself.
 */
import { computed, provide } from 'vue';
import ApexDialog from './ApexDialog.vue';
import { __dialogDestroy, __dialogHide, dialogZ } from '../core/dialog';
import type { DynamicDialogInstance } from '../core/dialog';

const props = defineProps<{ instance: DynamicDialogInstance; index: number }>();

const opts = computed(() => props.instance.options);

/* The loaded component reads data and calls close() through this. Deliberately a
   plain object rather than a ref: a ref auto-unwraps through `this` in the
   Options API but not through inject() in script setup, so `dialogRef.close()`
   would need `.value` in one API and not the other. */
const dialogRef = {
  data: opts.value.data,
  options: opts.value,
  close: (data?: unknown) => __dialogHide(props.instance.id, data),
};
provide('dialogRef', dialogRef);

const dialogProps = computed(() => ({
  zIndex: dialogZ(props.index),
  ...(opts.value.props || {}),
}));

const listeners = computed(() => opts.value.emits || {});
</script>

<template>
  <ApexDialog v-bind="dialogProps" :visible="instance.visible"
              @update:visible="(v) => { if (!v) __dialogHide(instance.id); }"
              @after-hide="__dialogDestroy(instance.id)">
    <template v-if="opts.templates?.header" #header>
      <component :is="opts.templates.header" />
    </template>
    <component :is="instance.component" v-bind="opts.contentProps" v-on="listeners" />
    <template v-if="opts.templates?.footer" #footer>
      <component :is="opts.templates.footer" />
    </template>
  </ApexDialog>
</template>
