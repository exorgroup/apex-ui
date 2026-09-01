<script setup lang="ts">
/**
 * ApexDynamicDialog — the mount point for the dialog service.
 *
 * Mount one, usually in the app shell, and every useApexDialog().open() call
 * renders here. It has no props of its own: each dialog's chrome comes from the
 * options passed to open(), which are forwarded to ApexDialog.
 */
import ApexDynamicDialogItem from './ApexDynamicDialogItem.vue';
import { __dialogState } from '../core/dialog';
</script>

<template>
  <ApexDynamicDialogItem v-for="(inst, i) in __dialogState.instances" :key="inst.id"
                         :instance="inst" :index="i" />
</template>
