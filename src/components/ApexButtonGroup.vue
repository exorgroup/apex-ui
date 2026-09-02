<script setup lang="ts">
/**
 * ApexButtonGroup — wraps ApexButtons into one seamless bar: inner radii are
 * dropped and shared borders collapse. Horizontal or vertical.
 *
 * A `label` frames the group and sits on the border, like a fieldset legend.
 * Pass `hideLabel` to keep it as the accessible name only.
 */
import { computed } from 'vue';
import type { ApexSize, ApexButtonAppearance } from '../types';

const props = withDefaults(defineProps<ApexButtonAppearance & {
  orientation?: 'horizontal' | 'vertical';
  /** Full width, with equal-width buttons. */
  block?: boolean;
  /** Group name. Rendered on the frame unless `hideLabel` is set. */
  label?: string;
  /** Keep `label` as the accessible name without drawing the frame. */
  hideLabel?: boolean;
  /** Sizes every button in the group, overriding each button's own `size`. */
  size?: ApexSize;
  /** Help text under the frame. */
  help?: string;
}>(), { orientation: 'horizontal' });

/**
 * Appearance prop -> CSS variable. Only what is set, so an untouched button
 * carries no style attribute at all.
 */
const btnStyle = computed(() => {
  const out: Record<string, string> = {};
  const map: Array<[string | undefined, string]> = [
    [props.color, '--apex-btn-color'],
    [props.hoverColor, '--apex-btn-hover'],
    [props.labelColor, '--apex-btn-label'],
    [props.tintColor, '--apex-btn-tint'],
    [props.height, '--apex-btn-h'],
    [props.fontSize, '--apex-btn-fs'],
    [props.paddingInline, '--apex-btn-pad'],
    [props.radius, '--apex-btn-radius'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return out;
});


const framed = computed(() => !!props.label && !props.hideLabel);
</script>

<template>
  <fieldset v-if="framed" class="apex-btnframe" :data-block="block ? 'true' : 'false'">
    <legend>{{ label }}</legend>
    <div class="apex-btngroup" :class="ui?.frame" :style="btnStyle" :data-orientation="orientation" :data-size="size"
         :data-block="block ? 'true' : 'false'">
      <slot />
    </div>
    <p v-if="help" class="apex-btngroup__help" :class="ui?.help">{{ help }}</p>
  </fieldset>

  <div v-else class="apex-btngroup" :class="ui?.root" :style="btnStyle" role="group" :aria-label="label" :data-size="size"
       :data-orientation="orientation" :data-block="block ? 'true' : 'false'">
    <slot />
  </div>
</template>
