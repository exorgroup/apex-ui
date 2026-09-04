<script setup lang="ts">
/**
 * ApexSegmented — a radiogroup styled as one bar. Arrow keys move the
 * selection, carrying focus with them (roving focus).
 *
 * This is the simple case on purpose. Reach for ApexSelectButton when you need
 * more than one choice, detached buttons, a vertical stack, icon-only buttons,
 * per-option help text or per-option colours — it is the same idea with all of
 * those, and a segmented bar is what you get from it with `detached` off.
 */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import type { ApexFieldProps, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  options?: ApexOptionsInput;
  /** Stretch to full width, equal segments. */
  block?: boolean;

  /* Appearance, over --apex-seg-*. Named `bar*`/`option*` rather than
     `background`/`radius`, which ApexFieldProps already defines for the
     field box. */
  barBackground?: string;
  barBorderColor?: string;
  barRadius?: string;
  /** An unselected segment, and one under the pointer. */
  optionColor?: string;
  hoverColor?: string;
  /** The selected segment. Set both, or the text may not read on the fill. */
  selectedBackground?: string;
  selectedColor?: string;
}>(), { statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void;
  (e: 'change', v: unknown): void;
}>();

const opts = computed(() => normaliseOptions(props.options));
const btns = ref<HTMLButtonElement[]>([]);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

/** Appearance prop -> CSS variable. Only what is set. */
const rootStyle = computed(() => {
  const out: Record<string, string> = {};
  const map: Array<[string | undefined, string]> = [
    [props.barBackground, '--apex-seg-bg'],
    [props.barBorderColor, '--apex-seg-border'],
    [props.barRadius, '--apex-seg-radius'],
    [props.optionColor, '--apex-seg-fg'],
    [props.hoverColor, '--apex-seg-hover-fg'],
    [props.selectedBackground, '--apex-seg-on-bg'],
    [props.selectedColor, '--apex-seg-on-fg'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return Object.keys(out).length ? out : undefined;
});

function pick(v: unknown) {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', v);
  emit('change', v);
}
/** Roving focus: the arrow keys both move the selection and follow it. */
function move(i: number, d: number) {
  if (props.disabled || props.readonly) return;
  const next = (i + d + opts.value.length) % opts.value.length;
  pick(opts.value[next].value);
  btns.value[next]?.focus();
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, ui }">
    <div class="apex-seg" :class="ui.control" :style="rootStyle" role="radiogroup" :id="id"
         :data-block="block ? 'true' : 'false'"
         :aria-describedby="describedBy" :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <button v-for="(o, i) in opts" :key="String(o.value)" ref="btns" type="button"
              class="apex-seg__btn" :class="ui.option"
              role="radio" :aria-checked="modelValue === o.value" :disabled="disabled || o.disabled"
              :tabindex="modelValue === o.value || (modelValue == null && i === 0) ? 0 : -1"
              @click="pick(o.value)"
              @keydown.right.prevent="move(i, 1)" @keydown.left.prevent="move(i, -1)"
              @keydown.down.prevent="move(i, 1)" @keydown.up.prevent="move(i, -1)">
        <ApexIcon v-if="o.icon" :name="o.icon" :size="17" />
        <slot name="option" :option="o">{{ o.label }}</slot>
      </button>
    </div>
  </ApexField>
</template>
