<script setup lang="ts">
/**
 * ApexChip — a compact entity: a label with an optional icon, image or avatar,
 * and an optional remove action.
 *
 * Selectable chips are a button, plain ones are a span: a chip that responds to
 * a click has to be reachable by keyboard, and a chip that only labels something
 * should not be a tab stop. The remove control is always its own button, so it
 * is separately reachable inside a selectable chip.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';

export type ChipSeverity =
  | 'neutral' | 'primary' | 'secondary' | 'success' | 'warn' | 'danger' | 'info' | 'contrast';

const props = withDefaults(defineProps<{
  label?: string;
  icon?: string;
  /** Trailing icon, after the label and before the remove control. */
  trailingIcon?: string;
  /** An image at the leading edge, sized and clipped like an avatar. */
  image?: string;
  imageAlt?: string;
  severity?: ChipSeverity;
  variant?: 'solid' | 'subtle' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  /** Pill by default; square corners with a radius of your own. */
  radius?: string;
  /** Adds the remove control. */
  removable?: boolean;
  removeIcon?: string;
  /** Makes the chip itself a control — hover and press states, keyboard reachable. */
  clickable?: boolean;
  /** Selected state, for a chip acting as a filter or a multi-choice option. */
  selected?: boolean;
  /** Icon shown at the leading edge while selected, replacing `icon`. */
  selectedIcon?: string;
  disabled?: boolean;
  /* chrome */
  background?: string;
  color?: string;
  borderColor?: string;
  hoverBackground?: string;
  selectedBackground?: string;
  selectedColor?: string;
  width?: string;
  padding?: string;
  gap?: string;
}>(), {
  severity: 'neutral', variant: 'subtle', size: 'md', removeIcon: 'close',
});

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void;
  (e: 'remove', ev: MouseEvent | KeyboardEvent): void;
  (e: 'update:selected', v: boolean): void;
}>();

const interactive = computed(() => props.clickable && !props.disabled);
const leadingIcon = computed(() => (props.selected && props.selectedIcon ? props.selectedIcon : props.icon));

function onClick(e: MouseEvent) {
  if (props.disabled) return;
  if (props.clickable) emit('update:selected', !props.selected);
  emit('click', e);
}
function onRemove(e: MouseEvent) {
  e.stopPropagation();
  if (props.disabled) return;
  emit('remove', e);
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.background) s['--chp-bg'] = props.background;
  if (props.color) s['--chp-fg'] = props.color;
  if (props.borderColor) s['--chp-border'] = props.borderColor;
  if (props.hoverBackground) s['--chp-hover'] = props.hoverBackground;
  if (props.selectedBackground) s['--chp-sel-bg'] = props.selectedBackground;
  if (props.selectedColor) s['--chp-sel-fg'] = props.selectedColor;
  if (props.radius) s.borderRadius = props.radius;
  if (props.width) s.inlineSize = props.width;
  if (props.padding) s['--chp-pad'] = props.padding;
  if (props.gap) s['--chp-gap'] = props.gap;
  return s;
});
</script>

<template>
  <component :is="interactive ? 'button' : 'span'" class="apex-chp" :style="rootStyle"
             :type="interactive ? 'button' : undefined"
             :data-severity="severity" :data-variant="variant" :data-size="size"
             :data-clickable="clickable ? 'true' : 'false'"
             :data-selected="selected ? 'true' : 'false'"
             :data-disabled="disabled ? 'true' : 'false'"
             :disabled="interactive && disabled ? true : undefined"
             :aria-pressed="clickable ? (selected ? 'true' : 'false') : undefined"
             @click="onClick">
    <slot name="leading">
      <img v-if="image" class="apex-chp__img" :src="image" :alt="imageAlt || ''" />
      <ApexIcon v-else-if="leadingIcon" :name="leadingIcon" class="apex-chp__icon" />
    </slot>
    <span v-if="label || $slots.default" class="apex-chp__label"><slot>{{ label }}</slot></span>
    <ApexIcon v-if="trailingIcon" :name="trailingIcon" class="apex-chp__icon" />
    <button v-if="removable" type="button" class="apex-chp__x" :aria-label="`Remove ${label || 'item'}`"
            :disabled="disabled || undefined" @click="onRemove">
      <ApexIcon :name="removeIcon" />
    </button>
  </component>
</template>
