<script setup lang="ts">
/**
 * ApexOtp — one-time-password entry. Controlled with v-model (the whole code as
 * one string); paste, arrow keys and backspace move between boxes.
 */
import { computed, nextTick, ref } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | null;
  /** Number of boxes. */
  length?: number;
  /** Hide the characters, like a password. */
  mask?: boolean;
  /** Digits only; blocks everything else and sets the numeric keypad. */
  integerOnly?: boolean;
  /** Higher-emphasis filled boxes instead of outlined. */
  variant?: 'outlined' | 'filled';
  /** Focus the first box on mount. */
  autofocus?: boolean;
}>(), { length: 6, variant: 'outlined', statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'complete', v: string): void;
  (e: 'focus' | 'blur'): void;
}>();

const boxes = ref<HTMLInputElement[]>([]);
const focused = ref(false);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

const chars = computed(() => {
  const s = String(props.modelValue ?? '');
  return Array.from({ length: props.length }, (_, i) => s[i] ?? '');
});

function push(next: string[]) {
  const text = next.join('').slice(0, props.length);
  emit('update:modelValue', text);
  if (text.length === props.length) emit('complete', text);
}
function focusBox(i: number) {
  nextTick(() => boxes.value[Math.max(0, Math.min(props.length - 1, i))]?.focus());
}
function onInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement;
  let v = el.value.replace(/\s/g, '');
  if (props.integerOnly) v = v.replace(/\D/g, '');
  if (!v) { el.value = ''; return; }
  const next = [...chars.value];
  // typing over a filled box, or a burst from a soft keyboard
  Array.from(v).forEach((c, k) => { if (i + k < props.length) next[i + k] = c; });
  push(next);
  el.value = next[i] ?? '';
  focusBox(i + v.length);
}
function onKey(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace') {
    e.preventDefault();
    const next = [...chars.value];
    if (next[i]) { next[i] = ''; push(next); }
    else if (i > 0) { next[i - 1] = ''; push(next); focusBox(i - 1); }
    return;
  }
  if (e.key === 'Delete') { e.preventDefault(); const next = [...chars.value]; next[i] = ''; push(next); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); focusBox(i - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); focusBox(i + 1); }
  if (e.key === 'Home') { e.preventDefault(); focusBox(0); }
  if (e.key === 'End') { e.preventDefault(); focusBox(props.length - 1); }
  if (props.integerOnly && e.key.length === 1 && !/\d/.test(e.key) && !e.metaKey && !e.ctrlKey) e.preventDefault();
}
function onPaste(i: number, e: ClipboardEvent) {
  e.preventDefault();
  let text = (e.clipboardData?.getData('text') || '').replace(/\s/g, '');
  if (props.integerOnly) text = text.replace(/\D/g, '');
  if (!text) return;
  const next = [...chars.value];
  Array.from(text).forEach((c, k) => { if (i + k < props.length) next[i + k] = c; });
  push(next);
  focusBox(i + text.length);
}
defineExpose({ focus: () => focusBox(0) });
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="!!modelValue" :focused="focused"
             v-slot="{ id, describedBy, invalid, size }">
    <div class="apex-otp" :data-size="size" :data-variant="variant" :data-disabled="disabled ? 'true' : 'false'"
         role="group" :aria-label="label || 'One-time password'" :aria-describedby="describedBy">
      <input v-for="(c, i) in chars" :key="i" ref="boxes" class="apex-otp__box"
             :id="i === 0 ? id : undefined" :name="name ? `${name}-${i + 1}` : undefined"
             :type="mask ? 'password' : 'text'"
             :inputmode="integerOnly ? 'numeric' : 'text'" :pattern="integerOnly ? '[0-9]*' : undefined"
             maxlength="1" autocomplete="one-time-code" :value="c"
             :disabled="disabled" :readonly="readonly" :aria-invalid="invalid || undefined"
             :aria-label="`Digit ${i + 1} of ${length}`" :data-filled="c ? 'true' : 'false'"
             @input="onInput(i, $event)" @keydown="onKey(i, $event)" @paste="onPaste(i, $event)"
             @focus="focused = true; ($event.target as HTMLInputElement).select(); emit('focus')"
             @blur="focused = false; emit('blur')" />
    </div>
  </ApexField>
</template>
