<template>
  <div class="dyn-picker">
    <p class="dyn-picker__lead">{{ prompt }}</p>
    <div class="dyn-picker__list">
      <button
        v-for="c in cities"
        :key="c.value"
        type="button"
        class="dyn-picker__row"
        @click="dialogRef?.close(c.label)"
      >
        <span>{{ c.label }}</span>
        <em>{{ c.help }}</em>
      </button>
    </div>
    <ApexButton size="sm" variant="text" @click="dialogRef?.close()">Cancel</ApexButton>
  </div>
</template>

<script setup lang="ts">
/**
 * The component the ApexDynamicDialog examples open.
 *
 * Deliberately knows nothing about dialogs: no visible state, no header, no
 * close button of its own. Everything it needs arrives through the injected
 * `dialogRef` — which is the whole point of the service, and only shows if the
 * demo opens a real component rather than inlining markup.
 *
 * Cancelling closes with no value, so `onClose` can tell "nothing chosen" from
 * a choice: close() with undefined, close(city) with one.
 */
import { inject, computed } from 'vue';
import { CITIES } from '../registry';

/** What the service provides per dialog. `data` is whatever open() was given. */
interface DialogRef {
  data?: { prompt?: string };
  close: (value?: unknown) => void;
}

const dialogRef = inject<DialogRef | null>('dialogRef', null);

const cities = CITIES.slice(0, 5);
const prompt = computed(() => dialogRef?.data?.prompt ?? 'Choose one.');
</script>
