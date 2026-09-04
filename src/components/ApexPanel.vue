<script setup lang="ts">
/**
 * ApexPanel — a titled container with an optional content toggle.
 *
 * Where ApexFieldset groups form controls with a legend on the border, a panel
 * has a full header bar that can also carry actions, and a footer.
 */
import { computed, ref } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  header?: string;
  subheader?: string;
  icon?: string;
  /** Allow the content to collapse. */
  toggleable?: boolean;
  /** Collapsed state. Bindable. */
  collapsed?: boolean;
  expandIcon?: string;
  collapseIcon?: string;
  /** Put the toggle before the title rather than at the end of the bar. */
  togglePosition?: 'start' | 'end';

  /* presentation */
  size?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md';
  radius?: string;
  padding?: string;
  background?: string;
  borderColor?: string;
  headerBackground?: string;
  headerColor?: string;
  /** Drop the divider under the header. */
  flush?: boolean;
}>(), {
  toggleable: false, togglePosition: 'end', size: 'md', bordered: true, shadow: 'none',
  expandIcon: 'keyboard_arrow_down', collapseIcon: 'keyboard_arrow_up',
});

const emit = defineEmits<{
  (e: 'update:collapsed', v: boolean): void;
  (e: 'toggle', payload: { collapsed: boolean }): void;
}>();

const localCollapsed = ref(false);
const shut = computed(() => (props.collapsed !== undefined ? props.collapsed : localCollapsed.value));

function toggle() {
  if (!props.toggleable) return;
  const next = !shut.value;
  localCollapsed.value = next;
  emit('update:collapsed', next);
  emit('toggle', { collapsed: next });
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.radius) s['--apex-panel-radius'] = props.radius;
  if (props.padding) s['--apex-panel-pad'] = props.padding;
  if (props.background) s['--apex-panel-bg'] = props.background;
  if (props.borderColor) s['--apex-panel-border'] = props.borderColor;
  if (props.headerBackground) s['--apex-panel-head-bg'] = props.headerBackground;
  if (props.headerColor) s['--apex-panel-head-fg'] = props.headerColor;
  return s;
});
const hasHeader = computed(() => !!(props.header || props.subheader || props.icon || props.toggleable));
</script>

<template>
  <section class="apex-pn" :style="rootStyle" :data-size="size" :data-shadow="shadow"
           :data-bordered="bordered ? 'true' : 'false'" :data-collapsed="shut ? 'true' : 'false'"
           :data-flush="flush ? 'true' : 'false'" :data-toggle="togglePosition">
    <header v-if="hasHeader || $slots.header || $slots.icons" class="apex-pn__head">
      <button v-if="toggleable" type="button" class="apex-pn__toggle" :aria-expanded="!shut"
              :aria-label="shut ? 'Expand' : 'Collapse'" @click="toggle">
        <slot name="toggleicon" :collapsed="shut">
          <ApexIcon :name="shut ? expandIcon : collapseIcon" :size="19" />
        </slot>
      </button>

      <slot name="header">
        <ApexIcon v-if="icon" :name="icon" class="apex-pn__icon" :size="19" />
        <span class="apex-pn__titles">
          <h3 v-if="header" class="apex-pn__title">{{ header }}</h3>
          <p v-if="subheader" class="apex-pn__sub">{{ subheader }}</p>
        </span>
      </slot>

      <span v-if="$slots.icons" class="apex-pn__actions"><slot name="icons" /></span>
    </header>

    <div class="apex-pn__body" :hidden="shut"><slot /></div>

    <footer v-if="$slots.footer" class="apex-pn__foot" :hidden="shut"><slot name="footer" /></footer>
  </section>
</template>
