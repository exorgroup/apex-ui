<script setup lang="ts">
/**
 * ApexSplitButton — a default action plus an overlay of related commands.
 *
 * `model` takes MenuItems: `{ label, icon, hint?, disabled?, href?, items? }`,
 * `{ separator: true }` for a rule, `{ header: '…' }` for a section heading.
 * Nesting `items` gives a submenu.
 *
 * Carries the full ApexButton vocabulary: severity, variant (solid, outlined,
 * text, link), raised, rounded, and the three sizes.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexMenuItem, { type MenuItem } from './ApexMenuItem';
import type { ApexSeverity, ApexButtonVariant } from './ApexButton.vue';
import type { ApexSize } from '../types';

export type { MenuItem };

const props = withDefaults(defineProps<{
  /** Default action label. */
  label?: string;
  /** Default action icon. */
  icon?: string;
  /** The overlay commands. */
  model?: MenuItem[];
  severity?: ApexSeverity;
  variant?: ApexButtonVariant;
  size?: ApexSize;
  raised?: boolean;
  rounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Chevron glyph. */
  menuIcon?: string;
  /** Open the overlay to the start edge instead of the end. */
  menuAlign?: 'start' | 'end';
  /** Accessible name for the chevron. */
  menuLabel?: string;
}>(), {
  severity: 'primary', variant: 'solid', size: 'md',
  menuIcon: 'keyboard_arrow_down', menuAlign: 'end', menuLabel: 'More options',
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
  (e: 'item-click', payload: { item: MenuItem; event: MouseEvent }): void;
  (e: 'show' | 'hide'): void;
}>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const items = computed(() => props.model || []);

function toggle() {
  if (props.disabled) return;
  setOpen(!open.value);
}
function setOpen(v: boolean) {
  if (open.value === v) return;
  open.value = v;
  emit(v ? 'show' : 'hide');
}
function pick(item: MenuItem, event: MouseEvent) {
  emit('item-click', { item, event });
  setOpen(false);
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') setOpen(false);
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) setOpen(false);
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) { document.addEventListener('mousedown', onDocClick); document.addEventListener('keydown', onKey); }
  else { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); }
});
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('mousedown', onDocClick);
  document.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="root" class="apex-split" :data-size="size">
    <button type="button" class="apex-btn apex-split__action" :data-severity="severity"
            :data-variant="variant" :data-size="size" :data-raised="raised ? 'true' : 'false'"
            :data-rounded="rounded ? 'true' : 'false'" :data-loading="loading ? 'true' : 'false'"
            :disabled="disabled || loading" :aria-busy="loading || undefined" @click="emit('click', $event)">
      <ApexIcon v-if="loading" name="progress_activity" spin />
      <ApexIcon v-else-if="icon" :name="icon" />
      <span class="apex-btn__txt"><slot>{{ label }}</slot></span>
    </button>

    <button type="button" class="apex-btn apex-split__toggle" :data-severity="severity"
            :data-variant="variant" :data-size="size" :data-raised="raised ? 'true' : 'false'"
            :data-rounded="rounded ? 'true' : 'false'" data-icon-only="true"
            :disabled="disabled" :aria-expanded="open" aria-haspopup="menu" :aria-label="menuLabel"
            @click="toggle">
      <ApexIcon :name="menuIcon" :data-open="open" />
    </button>

    <ul v-if="open" class="apex-menu" role="menu" :data-align="menuAlign">
      <ApexMenuItem v-for="(item, i) in items" :key="i" :item="item" @pick="pick" />
    </ul>
  </div>
</template>
