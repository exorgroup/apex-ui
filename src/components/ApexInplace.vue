<script setup lang="ts">
/**
 * ApexInplace — shows a value, and swaps to its editor when clicked.
 *
 * The display half is a button rather than a clickable div, so the swap is
 * reachable by keyboard and announced as an action. Content is only rendered
 * once opened, which is what makes the `open` event a usable place to fetch —
 * a lazy table inside a closed Inplace costs nothing until it is asked for.
 */
import { computed, nextTick, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  /** v-model:active — two-way, so a caller can open and close it too. */
  active?: boolean;
  /** Text for the closed state when the display slot is not used. */
  display?: string;
  displayIcon?: string;
  disabled?: boolean;
  /** Keep the content mounted after the first open. */
  keepAlive?: boolean;
  /** Built-in close control at the content's trailing edge. */
  closable?: boolean;
  closeIcon?: string;
  /** Focus the first field in the content when it opens. */
  autoFocus?: boolean;
  /* chrome */
  width?: string;
  padding?: string;
  radius?: string;
  background?: string;
  color?: string;
  borderColor?: string;
  /** Hover feedback on the closed state. Off for a display that should look static. */
  hoverable?: boolean;
  hoverBackground?: string;
  hoverColor?: string;
  /** Dashed outline hinting that the closed value is editable. */
  outlined?: boolean;
  contentBackground?: string;
  contentPadding?: string;
}>(), {
  active: false, hoverable: true, autoFocus: true, closeIcon: 'close',
});

const emit = defineEmits<{
  (e: 'update:active', v: boolean): void;
  (e: 'open' | 'close'): void;
}>();

const root = ref<HTMLElement | null>(null);
/* Controlled when active is bound, self-driving when it is not: an Inplace
   without v-model:active could never open, because the prop it read was the only
   thing open() ever changed. */
const isActive = ref(props.active);
const opened = ref(props.active);

watch(() => props.active, (v) => {
  isActive.value = v;
  if (v) opened.value = true;
});

function open() {
  if (props.disabled || isActive.value) return;
  opened.value = true;
  isActive.value = true;
  emit('update:active', true);
  emit('open');
  if (!props.autoFocus) return;
  nextTick(() => {
    const el = root.value?.querySelector<HTMLElement>(
      'input,select,textarea,[contenteditable],button:not([data-inplace-close])',
    );
    el?.focus();
  });
}
function close() {
  if (!isActive.value) return;
  isActive.value = false;
  emit('update:active', false);
  emit('close');
}

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.width) s.inlineSize = props.width;
  if (props.radius) s['--inp-radius'] = props.radius;
  if (props.padding) s['--inp-pad'] = props.padding;
  if (props.background) s['--inp-bg'] = props.background;
  if (props.color) s['--inp-fg'] = props.color;
  if (props.borderColor) s['--inp-border'] = props.borderColor;
  if (props.hoverBackground) s['--inp-hover-bg'] = props.hoverBackground;
  if (props.hoverColor) s['--inp-hover-fg'] = props.hoverColor;
  if (props.contentBackground) s['--inp-content-bg'] = props.contentBackground;
  if (props.contentPadding) s['--inp-content-pad'] = props.contentPadding;
  return s;
});

defineExpose({ open, close });
</script>

<template>
  <div ref="root" class="apex-inp" :style="rootStyle" :data-active="isActive ? 'true' : 'false'"
       :data-outlined="outlined ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'">
    <button v-if="!isActive" type="button" class="apex-inp__display"
            :data-hoverable="hoverable && !disabled ? 'true' : 'false'"
            :disabled="disabled || undefined" @click="open">
      <slot name="display" :open="open">
        <ApexIcon v-if="displayIcon" :name="displayIcon" />
        <span>{{ display }}</span>
      </slot>
    </button>
    <div v-else-if="opened || keepAlive" class="apex-inp__content">
      <slot name="content" :close="close" :active="isActive" />
      <button v-if="closable" type="button" class="apex-inp__x" data-inplace-close
              aria-label="Close" @click="close">
        <ApexIcon :name="closeIcon" :size="17" />
      </button>
    </div>
  </div>
</template>
