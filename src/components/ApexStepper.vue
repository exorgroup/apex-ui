<script setup lang="ts">
/** ApexStepper — small integer entry. Buttons disable at the bounds. */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  /** Suffix tag beside the value, like ApexNumber's. */
  unit?: string;
  /** Where the value sits between the two buttons. */
  align?: 'start' | 'center' | 'end';
}>(), { step: 1, align: 'center', statusIcon: false });

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();
const t = useApexI18n();
const focused = ref(false);
const val = computed(() => Number(props.modelValue ?? 0));
const atMin = computed(() => props.min != null && val.value <= props.min);
const atMax = computed(() => props.max != null && val.value >= props.max);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

function bump(d: number) {
  if (props.disabled) return;
  let n = val.value + d * props.step;
  if (props.min != null) n = Math.max(props.min, n);
  if (props.max != null) n = Math.min(props.max, n);
  emit('update:modelValue', Number(n.toFixed(6)));
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="true" :focused="focused"
             v-slot="{ id, describedBy, invalid }">
    <div class="apex-stepper" :data-focused="focused ? 'true' : 'false'">
      <button type="button" :aria-label="t('apexui.decrement')" :disabled="disabled || atMin" @click="bump(-1)">
        <ApexIcon name="remove" :size="18" />
      </button>
      <span class="apex-stepper__val" :data-align="align" :data-unit="unit ? 'true' : 'false'">
        <input :id="id" :name="name || id" type="number" :value="modelValue ?? 0"
               :min="min" :max="max" :step="step" :disabled="disabled" :readonly="readonly"
               :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
               :aria-label="labelPlacement === 'hidden' ? label : undefined"
               @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
               @focus="focused = true" @blur="focused = false" />
        <span v-if="unit" class="apex-stepper__unit">{{ unit }}</span>
      </span>
      <button type="button" :aria-label="t('apexui.increment')" :disabled="disabled || atMax" @click="bump(1)">
        <ApexIcon name="add" :size="18" />
      </button>
    </div>
  </ApexField>
</template>
