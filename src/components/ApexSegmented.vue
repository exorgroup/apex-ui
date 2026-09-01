<script setup lang="ts">
/** ApexSegmented — radiogroup styled as one bar. Arrow keys move the selection (roving focus). */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import type { ApexFieldProps, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  options?: ApexOptionsInput;
  block?: boolean;
}>(), { statusIcon: false });

const emit = defineEmits<{ (e: 'update:modelValue', v: unknown): void }>();
const opts = computed(() => normaliseOptions(props.options));
const btns = ref<HTMLButtonElement[]>([]);

function pick(v: unknown) { if (!props.disabled) emit('update:modelValue', v); }
function move(i: number, d: number) {
  const next = (i + d + opts.value.length) % opts.value.length;
  pick(opts.value[next].value);
  btns.value[next]?.focus();
}
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy }">
    <div class="apex-seg" role="radiogroup" :id="id" :data-block="block ? 'true' : 'false'"
         :aria-describedby="describedBy" :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <button v-for="(o, i) in opts" :key="String(o.value)" ref="btns" type="button" class="apex-seg__btn"
              role="radio" :aria-checked="modelValue === o.value" :disabled="disabled || o.disabled"
              :tabindex="modelValue === o.value || (modelValue == null && i === 0) ? 0 : -1"
              @click="pick(o.value)"
              @keydown.right.prevent="move(i, 1)" @keydown.left.prevent="move(i, -1)">
        <ApexIcon v-if="o.icon" :name="o.icon" :size="17" />
        {{ o.label }}
      </button>
    </div>
  </ApexField>
</template>
