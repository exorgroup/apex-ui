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
  /* The off state, over --apex-tb-*. Named `off*` so they cannot be confused
     with the field-box props of the same idea already on ApexFieldProps. */
  offBackground?: string;
  offColor?: string;
  offBorderColor?: string;
  offRadius?: string;
  /** Under the pointer while off. */
  hoverColor?: string;
  hoverBorderColor?: string;
}>(), { variant: 'solid', statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'change', v: boolean): void;
}>();

const on = computed(() => !!props.modelValue);
const text = computed(() => (on.value ? props.onLabel : props.offLabel) ?? props.onLabel ?? props.offLabel ?? props.label);
const glyph = computed(() => (on.value ? props.onIcon : props.offIcon) ?? props.onIcon ?? props.offIcon);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
/** Appearance prop -> CSS variable. Only what is set. */
const rootStyle = computed(() => {
  const out: Record<string, string> = {};
  const map: Array<[string | undefined, string]> = [
    [props.onColor, '--apex-tb-on'],
    [props.onTextColor, '--apex-tb-on-text'],
    [props.offBackground, '--apex-tb-bg'],
    [props.offColor, '--apex-tb-fg'],
    [props.offBorderColor, '--apex-tb-border'],
    [props.offRadius, '--apex-tb-radius'],
    [props.hoverColor, '--apex-tb-hover-fg'],
    [props.hoverBorderColor, '--apex-tb-hover-border'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return Object.keys(out).length ? out : undefined;
});

function toggle() {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', !on.value);
  emit('change', !on.value);
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size, ui }">
    <button type="button" class="apex-tb" :class="ui.control" :id="id" :style="rootStyle" :data-size="size"
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
