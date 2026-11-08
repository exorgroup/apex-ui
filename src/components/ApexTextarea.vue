<script setup lang="ts">
/** ApexTextarea — auto-grow optional, character counter optional. */
import { computed, ref, watch, nextTick } from 'vue';
import { useFloatLabel } from '../core/useFieldState';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import { guardKeydown, guardPaste, type KeyFilter } from '../core/keyFilter';
import ApexIcon from './ApexIcon.vue';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | null;
  placeholder?: string;
  rows?: number;
  maxlength?: number;
  counter?: boolean;
  /**
   * Draw a bar beside the counter that says whether the length is GOOD — short
   * (under half the target), good, or over. AC/003.
   */
  meter?: boolean;
  /**
   * The length to aim for. Advice, not a wall: past it the meter turns red and the
   * text is still accepted up to `maxlength`. A share description aims at 160 and is
   * valid to 300, and collapsing the two would either block allowed text or stop
   * warning exactly where the warning helps. Falls back to `maxlength`.
   */
  target?: number;
  autogrow?: boolean;
  mono?: boolean;
  /**
   * Restrict keystrokes: 'integer' | 'number' | 'money' | 'hex' | 'alphabetic'
   * | 'alphanumeric', or a RegExp / pattern string tested against the whole value.
   */
  keyFilter?: KeyFilter;
}>(), { rows: 4, statusIcon: true });

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'blur' | 'focus'): void }>();
const focused = ref(false);
const el = ref<HTMLTextAreaElement | null>(null);
const filled = computed(() => !!props.modelValue);
const count = computed(() => String(props.modelValue ?? '').length);

/* The scale the meter reads against, and what the counter shows as its denominator.
   With no target and no maxlength there is nothing to measure against, so no bar. */
const scale = computed(() => props.target ?? props.maxlength ?? 0);
const showMeter = computed(() => !!props.meter && scale.value > 0);
const meterState = computed(() => {
  if (count.value > scale.value) return 'over';
  if (count.value > scale.value / 2) return 'good';
  return 'short';
});
const meterWidth = computed(() => `${Math.min(100, (count.value / (scale.value || 1)) * 100)}%`);

function grow() {
  if (!props.autogrow || !el.value) return;
  el.value.style.height = 'auto';
  el.value.style.height = `${el.value.scrollHeight + 2}px`;
}
watch(() => props.modelValue, () => nextTick(grow));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const isFloat = useFloatLabel(props);
function onKey(e: KeyboardEvent) { guardKeydown(e, props.keyFilter); }
function onPaste(e: ClipboardEvent) {
  const next = guardPaste(e, props.keyFilter);
  if (next === null) return;
  emit('update:modelValue', next);
  if (el.value) el.value.value = next;
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused"
             v-slot="{ id, describedBy, invalid, statusGlyph }">
    <div class="apex-ctl apex-ctl--textarea" :class="{ 'apex-ctl--mono': mono }"
         :data-focused="focused ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'">
      <textarea ref="el" class="apex-ctl__input" :id="id" :name="name || id" :rows="rows"
                :value="modelValue ?? ''" :placeholder="placeholder" :disabled="disabled" :readonly="readonly"
                :maxlength="maxlength" :required="required" :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined" :aria-label="labelPlacement === 'hidden' ? label : undefined"
                @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
                @keydown="onKey" @paste="onPaste" @drop.prevent
                @focus="focused = true; emit('focus')" @blur="focused = false; emit('blur')"></textarea>
      <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
    </div>
    <p v-if="counter" class="apex-field__msg apex-ctl__counter" :class="[ui?.counter, { 'apex-ctl__counter--meter': showMeter }]">
      <span v-if="showMeter" class="apex-ctl__meter" role="meter" :data-state="meterState"
            :aria-valuenow="count" aria-valuemin="0" :aria-valuemax="scale"
            :aria-label="(label || 'Length') + ' ' + count + ' of ' + scale">
        <span :style="{ width: meterWidth }"></span>
      </span>
      <span class="apex-ctl__count">{{ count }}<template v-if="showMeter"> / {{ scale }}</template><template v-else-if="maxlength"> / {{ maxlength }}</template></span>
    </p>
  </ApexField>
</template>
