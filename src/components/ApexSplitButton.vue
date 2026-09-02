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
import type { ApexSize, ApexButtonAppearance } from '../types';

export type { MenuItem };

const props = withDefaults(defineProps<ApexButtonAppearance & {
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

  /* The overlay. It inherits from the root, so these ride along with the
     button's own appearance props rather than needing a second mechanism. */
  /** Overlay background, border and corner. */
  menuBackground?: string;
  menuBorderColor?: string;
  menuRadius?: string;
  /** Row text, and the row under the pointer. */
  menuColor?: string;
  menuHoverBackground?: string;
  menuHoverColor?: string;
  /** A row's leading icon, a section header, a trailing hint, a separator. */
  menuIconColor?: string;
  menuHeaderColor?: string;
  menuHintColor?: string;
  menuSeparatorColor?: string;
}>(), {
  severity: 'primary', variant: 'solid', size: 'md',
  menuIcon: 'keyboard_arrow_down', menuAlign: 'end', menuLabel: 'More options',
});

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
    [props.menuBackground, '--apex-menu-bg'],
    [props.menuBorderColor, '--apex-menu-border'],
    [props.menuRadius, '--apex-menu-radius'],
    [props.menuColor, '--apex-menu-fg'],
    [props.menuHoverBackground, '--apex-menu-hover-bg'],
    [props.menuHoverColor, '--apex-menu-hover-fg'],
    [props.menuIconColor, '--apex-menu-icon'],
    [props.menuHeaderColor, '--apex-menu-header-fg'],
    [props.menuHintColor, '--apex-menu-hint-fg'],
    [props.menuSeparatorColor, '--apex-menu-sep'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return out;
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
  <div ref="root" class="apex-split" :class="ui?.root" :style="btnStyle" :data-size="size">
    <button type="button" class="apex-btn apex-split__action" :class="ui?.action" :data-severity="severity"
            :data-variant="variant" :data-size="size" :data-raised="raised ? 'true' : 'false'"
            :data-rounded="rounded ? 'true' : 'false'" :data-loading="loading ? 'true' : 'false'"
            :disabled="disabled || loading" :aria-busy="loading || undefined" @click="emit('click', $event)">
      <ApexIcon v-if="loading" name="progress_activity" spin />
      <ApexIcon v-else-if="icon" :name="icon" />
      <span class="apex-btn__txt"><slot>{{ label }}</slot></span>
    </button>

    <button type="button" class="apex-btn apex-split__toggle" :class="ui?.toggle" :data-severity="severity"
            :data-variant="variant" :data-size="size" :data-raised="raised ? 'true' : 'false'"
            :data-rounded="rounded ? 'true' : 'false'" data-icon-only="true"
            :disabled="disabled" :aria-expanded="open" aria-haspopup="menu" :aria-label="menuLabel"
            @click="toggle">
      <ApexIcon :name="menuIcon" :data-open="open" />
    </button>

    <ul v-if="open" class="apex-menu" :class="ui?.menu" role="menu" :data-align="menuAlign">
      <ApexMenuItem v-for="(item, i) in items" :key="i" :item="item" :ui="ui" @pick="pick" />
    </ul>
  </div>
</template>
