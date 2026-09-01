<script setup lang="ts">
/**
 * ApexCheckbox — a single box. Binary by default:
 *   <ApexCheckbox v-model="agreed" label="I agree" />
 * Or a member of an array, so several share one model:
 *   <ApexCheckbox v-model="roles" value="admin" label="Super Admin" />
 * `indeterminate` renders the mixed state for a parent box.
 */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: boolean | unknown[];
  /** Given, the control toggles this value inside a modelValue array. */
  value?: unknown;
  /** Mixed state — visual only; clicking still checks. */
  indeterminate?: boolean;
  /** Bordered choice card. */
  card?: boolean;
  icon?: string;
  image?: string;
  /** Second line under the label. */
  hint?: string;
}>(), { labelPlacement: 'after', statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean | unknown[]): void;
  (e: 'change', v: boolean): void;
}>();

const isGroupMember = computed(() => props.value !== undefined);
const checked = computed(() => (isGroupMember.value
  ? Array.isArray(props.modelValue) && props.modelValue.includes(props.value)
  : !!props.modelValue));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

function toggle() {
  if (props.disabled || props.readonly) return;
  if (isGroupMember.value) {
    const cur = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const i = cur.indexOf(props.value);
    if (i >= 0) cur.splice(i, 1); else cur.push(props.value);
    emit('update:modelValue', cur);
    emit('change', i < 0);
  } else {
    emit('update:modelValue', !checked.value);
    emit('change', !checked.value);
  }
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" label-placement="hidden"
             v-slot="{ id, describedBy, size }">
    <label class="apex-cb" :class="{ 'apex-cb--card': card, 'apex-cb--before': labelPlacement === 'before' }"
           :data-size="size" :data-checked="checked ? 'true' : 'false'"
           :data-indeterminate="!checked && indeterminate ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'">
      <input type="checkbox" :id="id" :name="name || id" :checked="checked" :disabled="disabled"
             :required="required" :aria-describedby="describedBy"
             :aria-checked="!checked && indeterminate ? 'mixed' : checked"
             @change="toggle" />
      <span class="apex-cb__box" aria-hidden="true">
        <ApexIcon v-if="checked" name="check" :size="14" />
        <ApexIcon v-else-if="indeterminate" name="remove" :size="14" />
      </span>
      <span class="apex-cb__txt">
        <span class="apex-cb__lead">
          <img v-if="image" class="apex-cb__img" :src="image" alt="" />
          <ApexIcon v-else-if="icon" :name="icon" :size="18" />
          <slot>{{ label }}</slot>
          <span v-if="required" class="apex-field__req" aria-hidden="true">*</span>
        </span>
        <span v-if="hint" class="apex-cb__help">{{ hint }}</span>
      </span>
    </label>
  </ApexField>
</template>
