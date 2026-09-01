<script setup lang="ts">
/**
 * ApexPopover — a panel anchored to whatever opened it.
 *
 * Driven through its ref rather than a prop: `toggle(event)`, `show(event)` and
 * `hide()`. The event (or an element passed as the second argument) is the
 * anchor, so one popover can serve several triggers, and `v-model:visible` is
 * available when the state must live outside.
 *
 * Placement, flipping and shifting come from core/anchor, shared with
 * ApexConfirmPopup and ApexTooltip.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { anchorPosition, resolveTarget, type AnchorAlign, type AnchorSide } from '../core/anchor';

const props = withDefaults(defineProps<{
  /** Bindable open state, for a controlled popover. */
  visible?: boolean;
  /** A default anchor, when no event is passed to show(). */
  target?: unknown;
  side?: AnchorSide;
  align?: AnchorAlign;
  /** Distance from the target, in pixels. */
  gap?: number;
  showArrow?: boolean;
  /** Click outside to dismiss. */
  dismissable?: boolean;
  closeOnEscape?: boolean;
  /** Focus the first focusable element, or [data-autofocus], on open. */
  autoFocus?: boolean;
  /** Keep Tab inside the panel while it is open. */
  trapFocus?: boolean;

  /* size and chrome */
  width?: string;
  maxHeight?: string;
  padding?: string;
  background?: string;
  radius?: string;
  borderColor?: string;
  /** Stack order, for a popover opened over a dialog. */
  zIndex?: number;
  contentClass?: string;
}>(), {
  side: 'bottom', align: 'center', gap: 10, showArrow: true,
  dismissable: true, closeOnEscape: true, autoFocus: true, zIndex: 1100,
});

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'show' | 'hide'): void;
}>();

const open = ref(!!props.visible);
watch(() => props.visible, (v) => { if (!!v !== open.value) { open.value = !!v; } });

const panel = ref<HTMLElement | null>(null);
const anchor = ref<unknown>(props.target);
const pos = ref({ x: 0, y: 0, side: props.side as AnchorSide, arrow: 0 });
const ready = ref(false);

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Measures the panel, then places it — so a flip is decided on the real size. */
function place() {
  const el = panel.value;
  const target = resolveTarget(anchor.value ?? props.target);
  if (!el || !target) return;
  const r = el.getBoundingClientRect();
  pos.value = anchorPosition(target.getBoundingClientRect(), { width: r.width, height: r.height }, {
    side: props.side, align: props.align, gap: props.gap,
  });
  ready.value = true;
}

function setOpen(v: boolean) {
  if (open.value === v) return;
  open.value = v;
  emit('update:visible', v);
  emit(v ? 'show' : 'hide');
}

/* ── public API ─────────────────────────────────────────── */
/** `target` wins when given; otherwise the event's own element is the anchor. */
function show(event?: unknown, target?: unknown) {
  anchor.value = target ?? event ?? props.target;
  setOpen(true);
}
function hide() { setOpen(false); }
function toggle(event?: unknown, target?: unknown) {
  if (open.value) hide();
  else show(event, target);
}

function onDocPointer(e: PointerEvent) {
  if (!props.dismissable) return;
  const el = panel.value;
  const target = resolveTarget(anchor.value ?? props.target);
  if (!el) return;
  const node = e.target as Node;
  // a click on the trigger is the caller's business — its own toggle() handles it
  if (el.contains(node) || (target && target.contains(node))) return;
  hide();
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEscape) { e.stopPropagation(); hide(); return; }
  if (e.key !== 'Tab' || !props.trapFocus || !panel.value) return;
  const items = [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
/** Re-measures against the current anchor, e.g. after the content changed. */
const reposition = () => place();

watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) {
    ready.value = false;
    nextTick(() => {
      place();
      if (!props.autoFocus) return;
      const el = panel.value?.querySelector<HTMLElement>('[data-autofocus]')
        || panel.value?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    });
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
  const s: Record<string, string> = {
    insetInlineStart: pos.value.x + 'px',
    insetBlockStart: pos.value.y + 'px',
    zIndex: String(props.zIndex),
    '--pov-arrow': pos.value.arrow + 'px',
    // hidden until measured, so it never flashes at the wrong place
    visibility: ready.value ? 'visible' : 'hidden',
  };
  if (props.width) s['--pov-w'] = props.width;
  if (props.maxHeight) s['--pov-maxh'] = props.maxHeight;
  if (props.padding) s['--pov-pad'] = props.padding;
  if (props.background) s['--pov-bg'] = props.background;
  if (props.radius) s['--pov-radius'] = props.radius;
  if (props.borderColor) s['--pov-border'] = props.borderColor;
  return s;
});

defineExpose({ show, hide, toggle, reposition, visible: open, panel });
</script>

<template>
  <Teleport to="body">
    <Transition name="apex-pov">
      <div v-if="open" ref="panel" class="apex-pov" :class="contentClass" :style="panelStyle"
           :data-side="pos.side" :data-arrow="showArrow ? 'true' : 'false'" role="dialog" tabindex="-1">
        <div class="apex-pov__content"><slot :hide="hide" /></div>
        <span v-if="showArrow" class="apex-pov__tip" aria-hidden="true"></span>
      </div>
    </Transition>
  </Teleport>
</template>
