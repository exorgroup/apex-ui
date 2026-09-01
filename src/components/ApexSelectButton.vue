<script setup lang="ts">
/**
 * ApexSelectButton — a row of buttons acting as one control. Single choice by
 * default (a radiogroup), `multiple` for many (toggle buttons).
 *
 * Same options shape as the selects: string shorthand, or objects with icon,
 * image, help and disabled.
 */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  options?: ApexOptionsInput;
  /** Choose more than one; the model becomes an array. */
  multiple?: boolean;
  /** Stretch to full width, equal segments. */
  block?: boolean;
  /** Stack the buttons instead of laying them out in a row. */
  vertical?: boolean;
  /** Separate buttons with a gap instead of one joined bar. */
  detached?: boolean;
  /** Let the single-choice value be cleared by re-clicking it. */
  allowEmpty?: boolean;
  /** Icons only; labels move to the tooltip and the accessible name. */
  iconOnly?: boolean;
  /** Selected button background. Defaults to the accent. */
  color?: string;
  /** Selected button text colour. Defaults to white. */
  textColor?: string;
  /** Unselected label colour. */
  mutedColor?: string;
}>(), { allowEmpty: true, statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void;
  (e: 'change'): void;
}>();

const opts = computed(() => normaliseOptions(props.options));
const btns = ref<HTMLButtonElement[]>([]);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const selected = computed<unknown[]>(() => {
  if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : [];
  return props.modelValue == null ? [] : [props.modelValue];
});
const isOn = (o: ApexOption) => selected.value.includes(o.value);
const rootStyle = computed(() => ({
  '--sb-color': props.color,
  '--sb-text': props.textColor,
  '--sb-muted': props.mutedColor,
}));

function pick(o: ApexOption) {
  if (props.disabled || props.readonly || o.disabled) return;
  if (props.multiple) {
    const cur = [...selected.value];
    const i = cur.indexOf(o.value);
    if (i >= 0) cur.splice(i, 1); else cur.push(o.value);
    emit('update:modelValue', cur);
  } else {
    emit('update:modelValue', isOn(o) && props.allowEmpty ? null : o.value);
  }
  emit('change');
}
function move(i: number, d: number) {
  if (props.multiple) return;
  const n = (i + d + opts.value.length) % opts.value.length;
  pick(opts.value[n]);
  btns.value[n]?.focus();
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size }">
    <div class="apex-sb" :id="id" :style="rootStyle" :data-size="size" :data-block="block ? 'true' : 'false'"
         :data-vertical="vertical ? 'true' : 'false'" :data-detached="detached ? 'true' : 'false'"
         :data-icon-only="iconOnly ? 'true' : 'false'"
         :role="multiple ? 'group' : 'radiogroup'" :aria-describedby="describedBy"
         :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <button v-for="(o, i) in opts" :key="String(o.value)" ref="btns" type="button" class="apex-sb__btn"
              :role="multiple ? undefined : 'radio'"
              :aria-checked="multiple ? undefined : isOn(o)"
              :aria-pressed="multiple ? isOn(o) : undefined"
              :data-on="isOn(o) ? 'true' : 'false'"
              :disabled="disabled || o.disabled"
              :title="iconOnly ? o.label : undefined"
              :aria-label="iconOnly ? o.label : undefined"
              :tabindex="multiple ? 0 : (isOn(o) || (!selected.length && i === 0) ? 0 : -1)"
              @click="pick(o)"
              @keydown.right.prevent="move(i, 1)" @keydown.left.prevent="move(i, -1)"
              @keydown.down.prevent="move(i, 1)" @keydown.up.prevent="move(i, -1)">
        <img v-if="o.image" class="apex-sb__img" :src="o.image" alt="" />
        <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
        <span v-if="!iconOnly" class="apex-sb__txt">
          <slot name="option" :option="o">{{ o.label }}</slot>
          <span v-if="o.help" class="apex-sb__help">{{ o.help }}</span>
        </span>
      </button>
    </div>
  </ApexField>
</template>
