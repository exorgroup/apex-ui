<script setup lang="ts">
/**
 * ApexToggleButton — a single button holding a boolean. Distinct label, icon
 * and colour per state; sits between ApexSwitch (settings rows) and
 * ApexSelectButton (a choice among several).
 */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: boolean;
  /** Label while on / off. Falls back to `label`. */
  onLabel?: string;
  offLabel?: string;
  /** Icon while on / off. */
  onIcon?: string;
  offIcon?: string;
  /** Full width. */
  block?: boolean;
  /** Separate on-state colours. */
  onColor?: string;
  onTextColor?: string;
  /** Outlined while off instead of tinted. */
  variant?: 'solid' | 'outline';
}>(), { variant: 'solid', statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'change', v: boolean): void;
}>();

const on = computed(() => !!props.modelValue);
const text = computed(() => (on.value ? props.onLabel : props.offLabel) ?? props.onLabel ?? props.offLabel ?? props.label);
const glyph = computed(() => (on.value ? props.onIcon : props.offIcon) ?? props.onIcon ?? props.offIcon);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const rootStyle = computed(() => ({ '--tb-on': props.onColor, '--tb-on-text': props.onTextColor }));

function toggle() {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', !on.value);
  emit('change', !on.value);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size }">
    <button type="button" class="apex-tb" :id="id" :style="rootStyle" :data-size="size"
            :data-on="on ? 'true' : 'false'" :data-variant="variant"
            :data-block="block ? 'true' : 'false'" :disabled="disabled"
            :aria-pressed="on" :aria-describedby="describedBy"
            :aria-label="labelPlacement === 'hidden' ? (label || text) : undefined"
            @click="toggle">
      <ApexIcon v-if="glyph" :name="glyph" :size="18" />
      <span v-if="text"><slot :on="on">{{ text }}</slot></span>
    </button>
  </ApexField>
</template>
