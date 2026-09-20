<script setup lang="ts">
/** ApexSwitch — a checkbox in role="switch" form. Defaults to labelPlacement="after". */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: boolean;
  /**
   * Words shown inside the track, changing with state. Both are rendered into
   * the same grid cell — the hidden one still takes up space — so the track
   * sizes itself to the longer of the two and never reflows as it toggles.
   * Keep them short; this is a switch, not a button.
   */
  onLabel?: string;
  offLabel?: string;
}>(), { labelPlacement: 'after', statusIcon: false });

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'change', v: boolean): void }>();
const on = computed(() => !!props.modelValue);
/** Only widen the track when there is actually something to show. */
const hasText = computed(() => !!(props.onLabel || props.offLabel));
function toggle() {
  if (props.disabled || props.readonly) return;
  emit('update:modelValue', !on.value);
  emit('change', !on.value);
}
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size, ui }">
    <button type="button" class="apex-switch" :class="ui.control" role="switch" :id="id" :data-size="size"
            :data-on="on ? 'true' : 'false'" :data-labelled="hasText ? 'true' : 'false'"
            :data-readonly="readonly ? 'true' : 'false'"
            :aria-checked="on" :aria-describedby="describedBy" :disabled="disabled"
            :aria-readonly="readonly || undefined"
            :aria-label="label && labelPlacement === 'hidden' ? label : undefined"
            @click="toggle" @keydown.enter.prevent="toggle" @keydown.space.prevent="toggle">
      <!-- Both words, one grid cell: the track measures the wider of the two,
           so toggling never changes its width. aria-hidden because the switch
           already reports its state through role and aria-checked. -->
      <span v-if="hasText" class="apex-switch__text" :class="ui.text" aria-hidden="true">
        <span class="apex-switch__on">{{ onLabel }}</span>
        <span class="apex-switch__off">{{ offLabel }}</span>
      </span>
      <i aria-hidden="true" :class="ui.handle"></i>
    </button>
  </ApexField>
</template>
