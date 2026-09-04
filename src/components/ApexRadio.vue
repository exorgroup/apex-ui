<script setup lang="ts">
/**
 * ApexRadio — one radio button.
 *
 * Usually you want ApexRadioGroup, which generates these from a list and owns
 * the shared `name`. Reach for this one when the layout is yours: radios in
 * table cells, spread across a form, or interleaved with other content.
 *
 *   <ApexRadio v-model="plan" value="pro" label="Pro" name="plan" />
 *
 * Every radio sharing a model must also share `name`, or the browser will not
 * treat them as one group and arrow keys will not move between them.
 */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import { nextId } from '../core/useFieldState';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  /** The chosen value, shared with the other radios in the group. */
  modelValue?: unknown;
  /** What this one contributes when chosen. */
  value?: unknown;
  /** Bordered choice card. */
  card?: boolean;
  icon?: string;
  image?: string;
  /** Second line under the label. */
  hint?: string;
  /**
   * Rendered by ApexRadioGroup, which owns the layout and the label. A lone
   * radio draws its own field shell; one inside a group must not, or every
   * option would repeat the group's label and message line.
   */
  bare?: boolean;
}>(), { statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void;
  (e: 'change', v: unknown): void;
}>();

const checked = computed(() => props.modelValue === props.value);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
/* Radios only group when they share a name, so fall back to a stable one
   rather than leaving it unset and silently breaking arrow-key movement. */
const group = computed(() => props.name || nextId('apex-radio'));

function pick() {
  if (props.disabled || props.readonly || checked.value) return;
  emit('update:modelValue', props.value);
  emit('change', props.value);
}
</script>

<template>
  <!-- The label element IS the control, so the whole row is the hit target. -->
  <label v-if="bare" class="apex-radio" :class="[{ 'apex-radio--card': card }, ui?.control]"
         :data-checked="checked ? 'true' : 'false'"
         :data-disabled="(disabled || readonly) ? 'true' : 'false'">
    <input type="radio" :name="group" :value="String(value)" :checked="checked"
           :disabled="disabled || readonly" @change="pick" />
    <span class="apex-radio__dot" :class="ui?.dot" aria-hidden="true"></span>
    <span class="apex-radio__txt" :class="ui?.text">
      <span class="apex-radio__lead" :class="ui?.lead">
        <img v-if="image" class="apex-radio__img" :class="ui?.thumbnail" :src="image" alt="" />
        <ApexIcon v-else-if="icon" :name="icon" :size="18" />
        <slot>{{ label }}</slot>
      </span>
      <span v-if="hint" class="apex-radio__help" :class="ui?.optionHelp">{{ hint }}</span>
    </span>
  </label>

  <ApexField v-else v-bind="fieldProps" :value="modelValue" label-placement="hidden"
             v-slot="{ id, describedBy, ui: fieldUi }">
    <label class="apex-radio" :class="[{ 'apex-radio--card': card }, fieldUi.control]"
           :data-checked="checked ? 'true' : 'false'"
           :data-disabled="(disabled || readonly) ? 'true' : 'false'">
      <input type="radio" :id="id" :name="group" :value="String(value)" :checked="checked"
             :disabled="disabled || readonly" :required="required"
             :aria-describedby="describedBy" @change="pick" />
      <span class="apex-radio__dot" :class="fieldUi.dot" aria-hidden="true"></span>
      <span class="apex-radio__txt" :class="fieldUi.text">
        <span class="apex-radio__lead" :class="fieldUi.lead">
          <img v-if="image" class="apex-radio__img" :class="fieldUi.thumbnail" :src="image" alt="" />
          <ApexIcon v-else-if="icon" :name="icon" :size="18" />
          <slot>{{ label }}</slot>
          <span v-if="required" class="apex-field__req" aria-hidden="true">*</span>
        </span>
        <span v-if="hint" class="apex-radio__help" :class="fieldUi.optionHelp">{{ hint }}</span>
      </span>
    </label>
  </ApexField>
</template>
