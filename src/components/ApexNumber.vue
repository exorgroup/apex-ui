<script setup lang="ts">
/** ApexNumber — numeric input with unit suffix, currency prefix and min/max clamping on blur. */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import ApexIcon from './ApexIcon.vue';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: number | string | null;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  currency?: string;
  precision?: number;
  clamp?: boolean;
  /** Where the value sits inside the box. */
  align?: 'start' | 'center' | 'end';
}>(), { statusIcon: true, clamp: true, align: 'center' });

const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void; (e: 'blur' | 'focus'): void }>();
const focused = ref(false);
const filled = computed(() => props.modelValue != null && props.modelValue !== '');

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  emit('update:modelValue', raw === '' ? null : Number(raw));
}
function onBlur() {
  focused.value = false;
  emit('blur');
  if (!props.clamp || props.modelValue == null || props.modelValue === '') return;
  let n = Number(props.modelValue);
  if (props.min != null && n < props.min) n = props.min;
  if (props.max != null && n > props.max) n = props.max;
  if (props.precision != null) n = Number(n.toFixed(props.precision));
  if (n !== Number(props.modelValue)) emit('update:modelValue', n);
}
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused"
             v-slot="{ id, describedBy, invalid, statusGlyph }">
    <div class="apex-ctl apex-ctl--mono apex-ctl--num" :data-align="align" :data-focused="focused ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'">
      <span v-if="currency" class="apex-ctl__affix">{{ currency }}</span>
      <input class="apex-ctl__input" type="number" inputmode="decimal" :id="id" :name="name || id"
             :value="modelValue ?? ''" :placeholder="placeholder" :min="min" :max="max" :step="step"
             :disabled="disabled" :readonly="readonly" :required="required"
             :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
             :aria-label="labelPlacement === 'hidden' ? label : undefined"
             @input="onInput" @focus="focused = true; emit('focus')" @blur="onBlur" />
      <span v-if="unit" class="apex-ctl__affix">{{ unit }}</span>
      <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
    </div>
  </ApexField>
</template>
