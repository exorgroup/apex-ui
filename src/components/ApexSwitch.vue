<script setup lang="ts">
/** ApexSwitch — a checkbox in role="switch" form. Defaults to labelPlacement="after". */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: boolean;
  onLabel?: string;
  offLabel?: string;
}>(), { labelPlacement: 'after', statusIcon: false });

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'change', v: boolean): void }>();
const on = computed(() => !!props.modelValue);
function toggle() {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', !on.value);
  emit('change', !on.value);
}
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size }">
    <button type="button" class="apex-switch" role="switch" :id="id" :data-size="size"
            :aria-checked="on" :aria-describedby="describedBy" :disabled="disabled"
            :aria-label="label && labelPlacement === 'hidden' ? label : undefined"
            @click="toggle" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle">
      <i aria-hidden="true"></i>
    </button>
  </ApexField>
</template>
