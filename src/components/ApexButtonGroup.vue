<script setup lang="ts">
/**
 * ApexButtonGroup — wraps ApexButtons into one seamless bar: inner radii are
 * dropped and shared borders collapse. Horizontal or vertical.
 *
 * A `label` frames the group and sits on the border, like a fieldset legend.
 * Pass `hideLabel` to keep it as the accessible name only.
 */
import { computed } from 'vue';
import type { ApexSize } from '../types';

const props = withDefaults(defineProps<{
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

const framed = computed(() => !!props.label && !props.hideLabel);
</script>

<template>
  <fieldset v-if="framed" class="apex-btnframe" :data-block="block ? 'true' : 'false'">
    <legend>{{ label }}</legend>
    <div class="apex-btngroup" :data-orientation="orientation" :data-size="size"
         :data-block="block ? 'true' : 'false'">
      <slot />
    </div>
    <p v-if="help" class="apex-field__msg">{{ help }}</p>
  </fieldset>

  <div v-else class="apex-btngroup" role="group" :aria-label="label" :data-size="size"
       :data-orientation="orientation" :data-block="block ? 'true' : 'false'">
    <slot />
  </div>
</template>
