<script setup lang="ts">
/**
 * ApexTieredMenu — a vertical menu whose submenus open as nested overlays.
 *
 * Rows are ApexMenuItem, the shared overlay renderer, so nesting, hover-open,
 * separators, headers, hints and the off-screen flip all come for free — this
 * component owns only the outer panel and, in popup mode, its placement.
 */
import { computed, nextTick, onBeforeUnmount, ref, Teleport, watch } from 'vue';
import ApexMenuItem, { type MenuItem } from './ApexMenuItem';
import { anchorPosition, resolveTarget, type AnchorAlign, type AnchorSide } from '../core/anchor';

const props = withDefaults(defineProps<{
  items?: MenuItem[];
  /** Overlay anchored to whatever called toggle(event). */
  popup?: boolean;
  side?: AnchorSide;
  align?: AnchorAlign;
  gap?: number;
  width?: string;
  background?: string;
  borderColor?: string;
  radius?: string;
  /* colour and metrics — the same vocabulary as ApexMenu */
  textColor?: string;
  hoverBackground?: string;
  hoverTextColor?: string;
  iconColor?: string;
  headerColor?: string;
  hintColor?: string;
  separatorColor?: string;
  /** Panel inner padding, and the radius of a row. */
  padding?: string;
  rowRadius?: string;
  zIndex?: number;
}>(), { side: 'bottom', align: 'start', gap: 6, width: '220px', zIndex: 1100 });

const emit = defineEmits<{
  (e: 'item-click', payload: { item: MenuItem; originalEvent: MouseEvent }): void;
  (e: 'show' | 'hide'): void;
}>();

const open = ref(false);
const panel = ref<HTMLElement | null>(null);
const anchor = ref<unknown>(null);
const pos = ref({ x: 0, y: 0 });
const ready = ref(false);

function place() {
  const el = panel.value;
  const target = resolveTarget(anchor.value);
  if (!el || !target) return;
  const r = el.getBoundingClientRect();
  const p = anchorPosition(target.getBoundingClientRect(), { width: r.width, height: r.height }, {
    side: props.side, align: props.align, gap: props.gap,
  });
  pos.value = { x: p.x, y: p.y };
  ready.value = true;
}
function show(event?: unknown, target?: unknown) {
  anchor.value = target ?? event;
  ready.value = false;
  open.value = true;
  emit('show');
  nextTick(place);
}
function hide() {
  if (!open.value) return;
  open.value = false;
  emit('hide');
}
function toggle(event?: unknown, target?: unknown) {
  if (open.value) hide();
  else show(event, target);
}

function onPick(item: MenuItem, e: MouseEvent) {
  if (typeof item.command === 'function') {
    (item.command as (p: unknown) => void)({ item, originalEvent: e });
  }
  emit('item-click', { item, originalEvent: e });
  if (props.popup) hide();
}

function onDocPointer(e: PointerEvent) {
  const el = panel.value;
  const target = resolveTarget(anchor.value);
  if (!el) return;
  const node = e.target as Node;
  if (el.contains(node) || (target && target.contains(node))) return;
  hide();
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); hide(); }
}
const reposition = () => place();

watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) {
    document.addEventListener('pointerdown', onDocPointer, true);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
  } else {
    document.removeEventListener('pointerdown', onDocPointer, true);
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
  }
});
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('pointerdown', onDocPointer, true);
  document.removeEventListener('keydown', onKey, true);
  window.removeEventListener('resize', reposition);
  window.removeEventListener('scroll', reposition, true);
});

const panelStyle = computed(() => {
  const s: Record<string, string> = { minInlineSize: props.width };
  if (props.background) s['--amn-bg'] = props.background;
  if (props.borderColor) s['--amn-border'] = props.borderColor;
  if (props.radius) s.borderRadius = props.radius;
  if (props.textColor) s['--amn-fg'] = props.textColor;
  if (props.hoverBackground) s['--amn-hover-bg'] = props.hoverBackground;
  if (props.hoverTextColor) s['--amn-hover-fg'] = props.hoverTextColor;
  if (props.iconColor) s['--amn-icon'] = props.iconColor;
  if (props.headerColor) s['--amn-header-fg'] = props.headerColor;
  if (props.hintColor) s['--amn-hint-fg'] = props.hintColor;
  if (props.separatorColor) s['--amn-sep'] = props.separatorColor;
  if (props.rowRadius) s['--amn-radius'] = props.rowRadius;
  if (props.padding) s.padding = props.padding;

  if (props.popup) {
    s.position = 'fixed';
    s.insetInlineStart = pos.value.x + 'px';
    s.insetBlockStart = pos.value.y + 'px';
    s.zIndex = String(props.zIndex);
    s.visibility = ready.value ? 'visible' : 'hidden';
  }
  return s;
});

const slots = defineSlots<{
  item?: (props: { item: MenuItem; depth: number; branch: boolean }) => unknown;
}>();

defineExpose({ show, hide, toggle, visible: open });
</script>

<template>
  <!-- the Teleport OBJECT, not the string: a dynamic :is resolves only registered components -->
  <component :is="popup ? Teleport : 'div'" :to="popup ? 'body' : undefined">
    <Transition :name="popup ? 'apex-pop-fade' : 'apex-none'">
      <ul v-if="!popup || open" ref="panel" class="apex-menu apex-tmenu" :style="panelStyle" role="menu">
        <ApexMenuItem v-for="(item, i) in items || []" :key="i" :item="item"
                      :item-render="slots.item ? (ctx) => slots.item!(ctx) : undefined"
                      @pick="onPick" />
      </ul>
    </Transition>
  </component>
</template>
