<script setup lang="ts">
/**
 * ApexField — owns label, help, message, tone and a11y wiring.
 * Every control renders one internally; use it directly for custom layouts:
 *
 *   <ApexField label="Port" :rules="[{ when:{ gt: 65535 }, tone:'danger', message:'Out of range' }]"
 *              v-slot="{ id, describedBy, invalid }" :value="port">
 *     <input :id="id" :aria-describedby="describedBy" :aria-invalid="invalid" v-model="port" />
 *   </ApexField>
 */
import { computed, toRef } from 'vue';
import { useFieldState } from '../core/useFieldState';
import { TONE_ICON } from '../core/utils';
import ApexIcon from './ApexIcon.vue';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  /** Current value — only used to evaluate `rules`. */
  value?: unknown;
  /** Set by controls so the floating label knows to lift. */
  filled?: boolean;
  focused?: boolean;
}>(), { statusIcon: true });

const valueRef = toRef(props, 'value');
const st = useFieldState(props, valueRef);

const float = computed(() => props.filled || props.focused);
const rootStyle = computed(() => (props.labelWidth ? { '--apex-label-w': props.labelWidth } : undefined));
const statusGlyph = computed(() => (props.statusIcon ? TONE_ICON[st.tone.value] : ''));

defineExpose({ state: st });
</script>

<template>
  <div class="apex-field" :class="st.ruleClass.value" :style="rootStyle"
       :data-size="st.size.value" :data-lp="st.labelPlacement.value" :data-tone="st.tone.value"
       :data-disabled="disabled ? 'true' : 'false'" :data-float="float ? 'true' : 'false'"
       :data-focused="focused ? 'true' : 'false'">
    <label v-if="label" class="apex-field__label" :for="st.id.value">
      <ApexIcon v-if="labelIcon" :name="labelIcon" :size="16" />
      <span>{{ label }}</span>
      <span v-if="required" class="apex-field__req" aria-hidden="true">*</span>
    </label>
    <div class="apex-field__body">
      <slot v-bind="{
        id: st.id.value,
        describedBy: st.describedBy.value,
        tone: st.tone.value,
        invalid: st.invalid.value,
        size: st.size.value,
        disabled: !!disabled,
        statusGlyph,
      }" />
      <p v-if="st.message.value" class="apex-field__msg" :id="st.describedBy.value" :data-tone="st.tone.value">
        <ApexIcon v-if="st.tone.value !== 'default'" :name="TONE_ICON[st.tone.value]" />
        <span>{{ st.message.value }}</span>
      </p>
    </div>
  </div>
</template>
