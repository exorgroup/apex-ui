<script setup lang="ts">
/**
 * ApexContextMenu — an overlay menu on right click.
 *
 * Attaches to a target element, or to the document with `global`. Rows come
 * from ApexMenuItem, the same renderer the split button uses, so nesting,
 * separators, headers and hints behave identically here.
 *
 * Positioned at the pointer rather than against the target: a context menu
 * belongs where the click happened, and it only shifts to stay on screen.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexMenuItem, { type MenuItem } from './ApexMenuItem';
import { resolveTarget } from '../core/anchor';

const props = withDefaults(defineProps<{
  items?: MenuItem[];
  /** Element, selector or component ref the right click is listened for on. */
  target?: unknown;
  /** Attach to the document instead of one element. */
  global?: boolean;
  disabled?: boolean;
  /** Distance kept from the viewport edges, in pixels. */
  padding?: number;
  width?: string;
  background?: string;
  radius?: string;
  borderColor?: string;
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
}>(), { padding: 8, zIndex: 1200 });

const emit = defineEmits<{
  (e: 'show' | 'hide'): void;
  (e: 'item-click', payload: { item: MenuItem; originalEvent: MouseEvent }): void;
}>();

const open = ref(false);
const panel = ref<HTMLElement | null>(null);
const pos = ref({ x: 0, y: 0 });
const ready = ref(false);
/** The element the menu was opened on — useful to a row's command. */
const context = ref<HTMLElement | null>(null);

function place() {
  const el = panel.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const pad = props.padding;
  let { x, y } = pos.value;
  /* Flip about the cursor when there is no room, then clamp — so the menu never
     sits under the pointer or off screen. */
  if (x + r.width > window.innerWidth - pad) x = Math.max(pad, x - r.width);
  if (y + r.height > window.innerHeight - pad) y = Math.max(pad, y - r.height);
  el.style.insetInlineStart = x + 'px';
  el.style.insetBlockStart = y + 'px';
  ready.value = true;
}

function show(e: MouseEvent) {
  if (props.disabled) return;
  e.preventDefault();
  pos.value = { x: e.clientX, y: e.clientY };
  context.value = e.target as HTMLElement;
  ready.value = false;
  open.value = true;
  emit('show');
  nextTick(() => {
    place();
    /* A frame after placement: the teleported panel is committed by then, so the
       focus call actually lands. */
    requestAnimationFrame(() => {
      panel.value?.querySelector<HTMLElement>('.apex-menu__row:not([data-disabled="true"])')?.focus();
    });
  });
}
function hide() {
  if (!open.value) return;
  open.value = false;
  emit('hide');
}
const toggle = (e: MouseEvent) => (open.value ? hide() : show(e));

function onPick(item: MenuItem, e: MouseEvent) {
  if (typeof item.command === 'function') {
    (item.command as (p: unknown) => void)({ item, originalEvent: e, target: context.value });
  }
  emit('item-click', { item, originalEvent: e });
  hide();
}

/* ── dismissal and keys ─────────────────────────────────── */
function onDocPointer(e: PointerEvent) {
  if (!panel.value?.contains(e.target as Node)) hide();
}
function onKey(e: KeyboardEvent) {
  if (!open.value) return;
  if (e.key === 'Escape' || e.key === 'Tab') { e.stopPropagation(); hide(); return; }
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const rows = [...(panel.value?.querySelectorAll<HTMLElement>(':scope > li > .apex-menu__row:not([data-disabled="true"])') || [])];
  if (!rows.length) return;
  e.preventDefault();
  const at = rows.indexOf(document.activeElement as HTMLElement);
  const next = e.key === 'ArrowDown' ? (at + 1) % rows.length : (at <= 0 ? rows.length - 1 : at - 1);
  rows[next].focus();
}
const reposition = () => hide();

/* ── target binding ─────────────────────────────────────── */
let bound: HTMLElement | Document | null = null;
function bind() {
  unbind();
  if (typeof document === 'undefined') return;
  bound = props.global ? document : resolveTarget(props.target);
  bound?.addEventListener('contextmenu', show as EventListener);
}
function unbind() {
  bound?.removeEventListener('contextmenu', show as EventListener);
  bound = null;
}
onMounted(bind);
watch(() => [props.target, props.global], bind);

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
  unbind();
  if (typeof document === 'undefined') return;
  document.removeEventListener('pointerdown', onDocPointer, true);
  document.removeEventListener('keydown', onKey, true);
  window.removeEventListener('resize', reposition);
  window.removeEventListener('scroll', reposition, true);
});

const panelStyle = computed(() => {
  const s: Record<string, string> = {
    zIndex: String(props.zIndex),
    visibility: ready.value ? 'visible' : 'hidden',
  };
  if (props.width) s.minInlineSize = props.width;
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
  return s;
});

const slots = defineSlots<{
  item?: (props: { item: MenuItem; depth: number; branch: boolean }) => unknown;
}>();

defineExpose({ show, hide, toggle, visible: open, target: context });
</script>

<template>
  <Teleport to="body">
    <Transition name="apex-pop-fade">
      <ul v-if="open" ref="panel" class="apex-menu apex-ctxmenu" :style="panelStyle" role="menu">
        <ApexMenuItem v-for="(item, i) in items || []" :key="i" :item="item"
                      :item-render="slots.item ? (ctx) => slots.item!(ctx) : undefined"
                      @pick="onPick" />
      </ul>
    </Transition>
  </Teleport>
</template>
