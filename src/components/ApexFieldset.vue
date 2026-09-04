<script setup lang="ts">
/**
 * ApexFieldset — a bordered group whose legend straddles the border, optionally
 * collapsible. A real <fieldset>/<legend> pair, so it groups form controls for
 * assistive technology as well as visually.
 */
import { computed, ref } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  legend?: string;
  icon?: string;
  /** Allow the content to collapse. */
  toggleable?: boolean;
  /** Collapsed state. Bindable. */
  collapsed?: boolean;
  expandIcon?: string;
  collapseIcon?: string;
  legendAlign?: 'start' | 'center' | 'end';

  /* presentation */
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  radius?: string;
  padding?: string;
  background?: string;
  borderColor?: string;
  legendBackground?: string;
  legendColor?: string;
  disabled?: boolean;
}>(), {
  toggleable: false, legendAlign: 'start', size: 'md', bordered: true,
  expandIcon: 'add', collapseIcon: 'remove',
});

const emit = defineEmits<{
  (e: 'update:collapsed', v: boolean): void;
  (e: 'toggle', payload: { collapsed: boolean }): void;
}>();

const localCollapsed = ref(false);
const shut = computed(() => (props.collapsed !== undefined ? props.collapsed : localCollapsed.value));

function toggle() {
  if (!props.toggleable || props.disabled) return;
  const next = !shut.value;
  localCollapsed.value = next;
  emit('update:collapsed', next);
  emit('toggle', { collapsed: next });
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.radius) s['--apex-fieldset-radius'] = props.radius;
  if (props.padding) s['--apex-fieldset-pad'] = props.padding;
  if (props.background) s['--apex-fieldset-bg'] = props.background;
  if (props.borderColor) s['--apex-fieldset-border'] = props.borderColor;
  if (props.legendBackground) s['--apex-fieldset-legend-bg'] = props.legendBackground;
  if (props.legendColor) s['--apex-fieldset-legend-fg'] = props.legendColor;
  return s;
});
</script>

<template>
  <fieldset class="apex-fs" :style="rootStyle" :data-size="size" :data-align="legendAlign"
            :data-bordered="bordered ? 'true' : 'false'" :data-collapsed="shut ? 'true' : 'false'"
            :disabled="disabled">
    <legend class="apex-fs__legend">
      <component :is="toggleable ? 'button' : 'span'" class="apex-fs__label"
                 :type="toggleable ? 'button' : undefined"
                 :aria-expanded="toggleable ? !shut : undefined"
                 :disabled="toggleable && disabled ? true : undefined"
                 @click="toggle">
        <span v-if="toggleable" class="apex-fs__toggle">
          <slot name="toggleicon" :collapsed="shut">
            <ApexIcon :name="shut ? expandIcon : collapseIcon" :size="17" />
          </slot>
        </span>
        <ApexIcon v-if="icon" :name="icon" class="apex-fs__icon" :size="17" />
        <slot name="legend">{{ legend }}</slot>
      </component>
    </legend>

    <div class="apex-fs__body" :hidden="shut">
      <slot />
    </div>
  </fieldset>
</template>
