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
  /**
   * What the buttons show. `*Icon` takes a Material Symbols name; `*Text` takes
   * a literal character or short string and wins when both are given. Two props
   * rather than one because a single prop cannot tell the glyph name "remove"
   * from someone wanting the word remove printed on the button.
   */
  decrementIcon?: string;
  incrementIcon?: string;
  decrementText?: string;
  incrementText?: string;
  /** Where the value sits between the two buttons. */
  align?: 'start' | 'center' | 'end';
}>(), { step: 1, align: 'center', statusIcon: false, decrementIcon: 'remove', incrementIcon: 'add',
});

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
    <div class="apex-stepper" :class="ui?.control" :data-focused="focused ? 'true' : 'false'">
      <button type="button" class="apex-stepper__btn" :class="ui?.decrement"
              :aria-label="t('apexui.decrement')" :disabled="disabled || atMin" @click="bump(-1)">
        <span v-if="decrementText" class="apex-stepper__glyph">{{ decrementText }}</span>
        <ApexIcon v-else :name="decrementIcon" :size="18" />
      </button>
      <span class="apex-stepper__val" :class="ui?.value" :data-align="align" :data-unit="unit ? 'true' : 'false'">
        <input :id="id" :name="name || id" type="number" :value="modelValue ?? 0"
               :min="min" :max="max" :step="step" :disabled="disabled" :readonly="readonly"
               :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
               :aria-label="labelPlacement === 'hidden' ? label : undefined"
               @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
               @focus="focused = true" @blur="focused = false" />
        <span v-if="unit" class="apex-stepper__unit" :class="ui?.unit">{{ unit }}</span>
      </span>
      <button type="button" class="apex-stepper__btn" :class="ui?.increment"
              :aria-label="t('apexui.increment')" :disabled="disabled || atMax" @click="bump(1)">
        <span v-if="incrementText" class="apex-stepper__glyph">{{ incrementText }}</span>
        <ApexIcon v-else :name="incrementIcon" :size="18" />
      </button>
    </div>
  </ApexField>
</template>
