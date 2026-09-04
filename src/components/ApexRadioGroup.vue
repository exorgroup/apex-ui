<script setup lang="ts">
/**
 * ApexRadioGroup — stacked or inline; `card` renders each option as a
 * bordered choice card.
 *
 * The rows are ApexRadio in `bare` mode, so the markup for a radio lives in
 * one place. The group owns what a group owns: the label, the message line,
 * the shared `name`, and the layout.
 */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import ApexRadio from './ApexRadio.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { nextId } from '../core/useFieldState';
import type { ApexFieldProps, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  options?: ApexOptionsInput;
  card?: boolean;
  inline?: boolean;
  /** Fixed column count instead of one per row. */
  columns?: number;
}>(), { statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void;
  (e: 'change', v: unknown): void;
}>();

const opts = computed(() => normaliseOptions(props.options));
const group = computed(() => props.name || nextId('apex-rg'));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const gridStyle = computed(() => (props.columns ? { '--apex-radio-cols': String(props.columns) } : undefined));

function pick(v: unknown) {
  emit('update:modelValue', v);
  emit('change', v);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, ui }">
    <div class="apex-radios" :class="ui.group" :id="id" role="radiogroup" :style="gridStyle"
         :data-inline="inline ? 'true' : 'false'" :data-cols="columns || undefined"
         :aria-describedby="describedBy" :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <ApexRadio v-for="o in opts" :key="String(o.value)" bare
                 :model-value="modelValue" :value="o.value" :name="group"
                 :label="o.label" :icon="o.icon" :image="o.image" :hint="o.help"
                 :card="card" :disabled="disabled || o.disabled" :readonly="readonly"
                 :ui="ui" @update:model-value="pick">
        <slot name="option" :option="o">{{ o.label }}</slot>
      </ApexRadio>
    </div>
  </ApexField>
</template>
