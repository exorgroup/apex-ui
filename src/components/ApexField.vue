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
import type { ApexFieldClasses, ApexFieldProps } from '../types';

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
/**
 * Appearance prop -> CSS variable. The variables are declared on .apex-field in
 * apex-ui.css with the design token as their default, so an unset prop changes
 * nothing and a set one wins by being an inline style.
 */
const STYLE_VARS: Array<[keyof ApexFieldProps, string]> = [
  ['labelWidth', '--apex-label-w'],
  ['background', '--apex-ctl-bg'],
  ['borderColor', '--apex-ctl-border'],
  ['borderWidth', '--apex-ctl-border-w'],
  ['radius', '--apex-ctl-radius'],
  ['hoverBorderColor', '--apex-ctl-border-hover'],
  ['focusBorderColor', '--apex-ctl-border-focus'],
  ['focusRing', '--apex-ctl-ring'],
  ['disabledBackground', '--apex-ctl-bg-disabled'],
  ['textColor', '--apex-ctl-fg'],
  ['placeholderColor', '--apex-ctl-placeholder'],
  ['controlHeight', '--apex-ctl-h'],
  ['fontSize', '--apex-ctl-fs'],
  ['paddingInline', '--apex-ctl-pad'],
  ['iconSize', '--apex-icon-size'],
  ['iconColor', '--apex-ctl-icon'],
  ['affixColor', '--apex-ctl-affix'],
  ['buttonColor', '--apex-ctl-btn'],
  ['labelColor', '--apex-label-fg'],
  ['labelFontSize', '--apex-label-fs'],
  ['messageColor', '--apex-msg-fg'],
  ['messageFontSize', '--apex-msg-fs'],
  ['requiredColor', '--apex-field-required'],
  ['popoverBackground', '--apex-pop-bg'],
  ['popoverBorderColor', '--apex-pop-border'],
  ['optionHoverBackground', '--apex-opt-hover-bg'],
];

/**
 * The class map, always an object so a control can read `ui.control` without
 * guarding. Passed down through the slot as well, since the parts inside the
 * box are rendered by the control, not by ApexField.
 */
const ui = computed<ApexFieldClasses>(() => props.ui ?? {});

const rootStyle = computed(() => {
  const out: Record<string, string> = {};

  STYLE_VARS.forEach(([key, cssVar]) => {
    const v = props[key];
    if (v !== undefined && v !== null && v !== '') out[cssVar] = String(v);
  });

  // undefined rather than {} so Vue does not add an empty style attribute.
  return Object.keys(out).length ? out : undefined;
});
const statusGlyph = computed(() => (props.statusIcon ? TONE_ICON[st.tone.value] : ''));

defineExpose({ state: st });
</script>

<template>
  <div class="apex-field" :class="[st.ruleClass.value, ui.root]" :style="rootStyle"
       :data-size="st.size.value" :data-lp="st.labelPlacement.value" :data-tone="st.tone.value"
       :data-disabled="disabled ? 'true' : 'false'" :data-float="float ? 'true' : 'false'"
       :data-focused="focused ? 'true' : 'false'">
    <label v-if="label" class="apex-field__label" :class="ui.label" :for="st.id.value">
      <ApexIcon v-if="labelIcon" :name="labelIcon" :size="16" />
      <span>{{ label }}</span>
      <span v-if="required" class="apex-field__req" aria-hidden="true">*</span>
    </label>
    <div class="apex-field__body" :class="ui.body">
      <slot v-bind="{
        id: st.id.value,
        describedBy: st.describedBy.value,
        tone: st.tone.value,
        invalid: st.invalid.value,
        size: st.size.value,
        disabled: !!disabled,
        statusGlyph,
        ui,
      }" />
      <p v-if="st.message.value" class="apex-field__msg" :class="ui.message"
         :id="st.describedBy.value" :data-tone="st.tone.value">
        <ApexIcon v-if="st.tone.value !== 'default'" :name="TONE_ICON[st.tone.value]" />
        <span>{{ st.message.value }}</span>
      </p>
    </div>
  </div>
</template>
