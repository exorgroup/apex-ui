<script setup lang="ts">
/** ApexRadioGroup — stacked or inline; `card` renders each option as a bordered choice card. */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { nextId } from '../core/useFieldState';
import type { ApexFieldProps, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  options?: ApexOptionsInput;
  card?: boolean;
  inline?: boolean;
}>(), { statusIcon: false });

const emit = defineEmits<{ (e: 'update:modelValue', v: unknown): void }>();
const opts = computed(() => normaliseOptions(props.options));
const group = computed(() => props.name || nextId('apex-rg'));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy }">
    <div class="apex-radios" :id="id" role="radiogroup" :data-inline="inline ? 'true' : 'false'"
         :aria-describedby="describedBy" :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <label v-for="o in opts" :key="String(o.value)" class="apex-radio" :class="{ 'apex-radio--card': card }"
             :data-checked="modelValue === o.value ? 'true' : 'false'"
             :data-disabled="(disabled || o.disabled) ? 'true' : 'false'">
        <input type="radio" :name="group" :value="String(o.value)" :checked="modelValue === o.value"
               :disabled="disabled || o.disabled" @change="emit('update:modelValue', o.value)" />
        <span class="apex-radio__dot" aria-hidden="true"></span>
        <span class="apex-radio__txt">
          <span style="display:inline-flex;align-items:center;gap:6px;font-weight:500">
            <ApexIcon v-if="o.icon" :name="o.icon" :size="18" />{{ o.label }}
          </span>
          <span v-if="o.help" class="apex-radio__help">{{ o.help }}</span>
        </span>
      </label>
    </div>
  </ApexField>
</template>
