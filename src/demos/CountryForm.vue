<script setup lang="ts">
/**
 * The innermost form in the cascaded demo. Opened from the country chooser
 * inside LocalityForm, which is itself inside a dialog — so this one proves
 * a second dialog stacks above the first and hands its record back.
 */
import { inject, reactive } from 'vue';

const props = defineProps<{ name?: string }>();

/* Provided by ApexDynamicDialogItem. A plain object, not a ref — so it is
   dialogRef.close(), with no .value. */
const dialogRef = inject<{ close: (data?: unknown) => void }>('dialogRef');

const form = reactive({ label: props.name ?? '', code: '' });

function save() {
  if (!form.label.trim()) return;
  dialogRef?.close({ value: form.label.toLowerCase().replace(/\s+/g, '-'), label: form.label.trim() });
}
</script>

<template>
  <div class="demo-form">
    <ApexInput v-model="form.label" label="Country" placeholder="e.g. Malta" />
    <ApexInput v-model="form.code" label="ISO code" placeholder="MT" />
    <div class="demo-form__actions">
      <ApexButton severity="secondary" variant="text" @click="dialogRef?.close()">Cancel</ApexButton>
      <ApexButton :disabled="!form.label.trim()" @click="save">Save country</ApexButton>
    </div>
  </div>
</template>
