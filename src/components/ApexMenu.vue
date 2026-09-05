<script setup lang="ts">
/**
 * ApexMenu — a vertical command menu, inline or as a popup.
 *
 * Groups are items with their own `items`: a top-level group is a section label
 * with its children always shown, a nested one collapses. Open state is an
 * `expandedKeys` map with two-way binding, so a menu can be driven from outside
 * — expand all, collapse all, restore a saved state — without the component
 * hiding it.
 *
 * Popup mode anchors to whatever called `toggle(event)`, using the same
 * core/anchor placement as the popover.
 */
import { computed, nextTick, onBeforeUnmount, ref, Teleport, watch } from 'vue';
import ApexMenuNode from './ApexMenuNode.vue';
import { anchorPosition, resolveTarget, type AnchorAlign, type AnchorSide } from '../core/anchor';
import { useCan } from '../core/can';
import { filterMenu } from '../core/menuPermissions';
import type { MenuItem } from './ApexMenuItem';

const props = withDefaults(defineProps<{
  items?: MenuItem[];
  /** Bindable map of open group keys, keyed by an item's `key`. */
  expandedKeys?: Record<string, boolean>;
  /** Overlay anchored to its trigger, opened with toggle(event). */
  popup?: boolean;
  /** Popup placement. */
  side?: AnchorSide;
  align?: AnchorAlign;
  gap?: number;
  width?: string;
  maxHeight?: string;
  padding?: string;
  background?: string;
  borderColor?: string;
  radius?: string;
  /** Section labels in caps, the way a sidebar reads. */
  labelCaps?: boolean;
  /* colour — every row state is a prop, so a menu can match any surface */
  textColor?: string;
  hoverBackground?: string;
  hoverTextColor?: string;
  labelColor?: string;
  iconColor?: string;
  activeColor?: string;
  activeBackground?: string;
  zIndex?: number;
}>(), {
  side: 'bottom', align: 'start', gap: 6, labelCaps: true, zIndex: 1100,
});

const emit = defineEmits<{
  (e: 'update:expandedKeys', v: Record<string, boolean>): void;
  (e: 'item-click', payload: { item: MenuItem; originalEvent: MouseEvent }): void;
  (e: 'show' | 'hide'): void;
}>();

/*
 * Rows the resolver denies never reach the renderer, along with the groups,
 * headings and rules they leave hanging.
 *
 * Inside a computed because useCan() injects at setup, and because a resolver
 * that reads reactive state — permissions arriving with the page — must be
 * able to change the menu when it does.
 *
 * Everything downstream reads `shown` rather than props.items, expandAll and
 * collapseAll included: a group nobody can see must not appear in the
 * expandedKeys map either. A consumer watching that map to persist a sidebar's
 * open state would otherwise save keys for groups this user never had.
 */
const can = useCan();
const shown = computed(() => filterMenu(props.items, can));

/* Own state when nothing is bound, so an uncontrolled menu still toggles. */
const inner = ref<Record<string, boolean>>({ ...(props.expandedKeys || {}) });
watch(() => props.expandedKeys, (v) => { if (v) inner.value = { ...v }; }, { deep: true });
const expanded = computed(() => (props.expandedKeys ? props.expandedKeys : inner.value));

function toggle(item: MenuItem) {
  const k = String(item.key ?? item.label ?? '');
  const next = { ...expanded.value, [k]: !expanded.value[k] };
  inner.value = next;
  emit('update:expandedKeys', next);
}

function onPick(item: MenuItem, e: MouseEvent) {
  if (typeof item.command === 'function') {
    (item.command as (p: unknown) => void)({ item, originalEvent: e });
  }
  emit('item-click', { item, originalEvent: e });
  if (props.popup) hide();
}

/* ── popup ──────────────────────────────────────────────── */
const open = ref(false);
const panel = ref<HTMLElement | null>(null);
const anchor = ref<unknown>(null);
const pos = ref({ x: 0, y: 0, side: props.side as AnchorSide, arrow: 0 });
const ready = ref(false);

function place() {
  const el = panel.value;
  const target = resolveTarget(anchor.value);
  if (!el || !target) return;
  const r = el.getBoundingClientRect();
  pos.value = anchorPosition(target.getBoundingClientRect(), { width: r.width, height: r.height }, {
    side: props.side, align: props.align, gap: props.gap,
  });
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
function togglePopup(event?: unknown, target?: unknown) {
  if (open.value) hide();
  else show(event, target);
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

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.width) s['--mnu-w'] = props.width;
  if (props.maxHeight) s['--mnu-maxh'] = props.maxHeight;
  if (props.padding) s['--mnu-pad'] = props.padding;
  if (props.background) s['--mnu-bg'] = props.background;
  if (props.borderColor) s['--mnu-border'] = props.borderColor;
  if (props.radius) s['--mnu-radius'] = props.radius;
  if (props.textColor) s['--mnu-fg'] = props.textColor;
  if (props.hoverBackground) s['--mnu-hover-bg'] = props.hoverBackground;
  if (props.hoverTextColor) s['--mnu-hover-fg'] = props.hoverTextColor;
  if (props.labelColor) s['--mnu-label-fg'] = props.labelColor;
  if (props.iconColor) s['--mnu-icon'] = props.iconColor;
  if (props.activeColor) s['--mnu-active-fg'] = props.activeColor;
  if (props.activeBackground) s['--mnu-active-bg'] = props.activeBackground;
  if (props.popup) {
    s.insetInlineStart = pos.value.x + 'px';
    s.insetBlockStart = pos.value.y + 'px';
    s.zIndex = String(props.zIndex);
    s.visibility = ready.value ? 'visible' : 'hidden';
  }
  return s;
});

const slots = defineSlots<{
  start?: () => unknown;
  end?: () => unknown;
  item?: (props: { item: MenuItem; depth: number }) => unknown;
  submenulabel?: (props: { item: MenuItem; depth: number }) => unknown;
}>();

/** Expand or collapse every group that can toggle. */
function setAll(v: boolean) {
  const out: Record<string, boolean> = {};
  const walk = (list: MenuItem[], depth: number) => list.forEach((it) => {
    if (!it.items?.length) return;
    if ((it.toggleable as boolean | undefined) ?? depth > 0) out[String(it.key ?? it.label ?? '')] = v;
    walk(it.items, depth + 1);
  });
  walk(shown.value, 0);
  inner.value = out;
  emit('update:expandedKeys', out);
}

defineExpose({ show, hide, toggle: togglePopup, expandAll: () => setAll(true), collapseAll: () => setAll(false), visible: open });
</script>

<template>
  <!-- the Teleport OBJECT, not the string: a dynamic :is resolves only registered
       components, so 'Teleport' would render as an unknown element -->
  <component :is="popup ? Teleport : 'div'" :to="popup ? 'body' : undefined" :class="popup ? undefined : 'apex-mnu-host'">
    <Transition :name="popup ? 'apex-pop-fade' : 'apex-none'">
      <nav v-if="!popup || open" ref="panel" class="apex-mnu" :style="rootStyle"
           :data-popup="popup ? 'true' : 'false'" :data-caps="labelCaps ? 'true' : 'false'" role="menu">
        <div v-if="slots.start" class="apex-mnu__edge"><slot name="start" /></div>
        <ul class="apex-mnu__list">
          <ApexMenuNode v-for="(item, i) in shown" :key="i" :item="item" :depth="0" :expanded="expanded"
                        :item-render="slots.item ? (ctx) => slots.item!(ctx) : undefined"
                        :label-render="slots.submenulabel ? (ctx) => slots.submenulabel!(ctx) : undefined"
                        @pick="onPick" @toggle="toggle" />
        </ul>
        <div v-if="slots.end" class="apex-mnu__edge"><slot name="end" /></div>
      </nav>
    </Transition>
  </component>
</template>
