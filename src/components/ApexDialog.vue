<script setup lang="ts">
/**
 * ApexDialog — a modal (or non-modal) window, teleported to <body>.
 *
 * Owns the overlay mechanics every dialog needs: nine positions, focus trap and
 * restore, Escape and mask dismissal, dragging, and the enter/leave animation.
 * ApexConfirmDialog builds on it rather than reimplementing any of this.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useOverlayTransition } from '../core/overlayTransition';
import type { ApexOverlayTransition } from '../types';
import ApexIcon from './ApexIcon.vue';

export type DialogPosition =
  | 'center' | 'top' | 'bottom' | 'left' | 'right'
  | 'topleft' | 'topright' | 'bottomleft' | 'bottomright';

const props = withDefaults(defineProps<ApexOverlayTransition & {
  /** Bindable open state. */
  visible?: boolean;
  header?: string;
  /** Text under the header. */
  subtitle?: string;
  icon?: string;
  position?: DialogPosition;
  /** Blocks the page behind, and traps focus. */
  modal?: boolean;
  /** Drag by the header. */
  draggable?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  /** Click the mask to dismiss. */
  dismissableMask?: boolean;
  /** Close automatically after this many milliseconds. */
  autoClose?: number;
  /** Show a bar counting the auto-close down. */
  showTimer?: boolean;

  /* size and chrome */
  width?: string;
  maxWidth?: string;
  padding?: string;
  background?: string;
  radius?: string;
  borderColor?: string;
  maskColor?: string;
  /** Blur the page behind the mask. */
  maskBlur?: boolean;
  /** Stack order, for a dialog opened over another. */
  zIndex?: number;
  contentClass?: string;
}>(), {
  position: 'center', modal: true, closable: true, closeOnEscape: true,
  transition: 'scale', zIndex: 1000,
});

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'show' | 'hide' | 'after-hide'): void;
}>();

const open = ref(!!props.visible);
watch(() => props.visible, (v) => { open.value = !!v; });

const root = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const offset = ref<{ x: number; y: number } | null>(null);
const drag = ref<{ px: number; py: number; ox: number; oy: number } | null>(null);
const timeLeft = ref(1);

let restoreFocus: HTMLElement | null = null;
let timer: number | null = null;
let raf: number | null = null;

function close() {
  open.value = false;
  emit('update:visible', false);
  emit('hide');
}

/* ── auto close ─────────────────────────────────────────── */
function startTimer() {
  stopTimer();
  if (!props.autoClose) return;
  const started = performance.now();
  timer = window.setTimeout(close, props.autoClose);
  if (props.showTimer) {
    const tick = () => {
      const elapsed = performance.now() - started;
      timeLeft.value = Math.max(0, 1 - elapsed / (props.autoClose as number));
      if (timeLeft.value > 0 && open.value) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
}
function stopTimer() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  timeLeft.value = 1;
}

/* ── focus ──────────────────────────────────────────────── */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function trap(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !props.modal || !panel.value) return;
  const items = [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closeOnEscape && props.closable) { e.stopPropagation(); close(); return; }
  trap(e);
}

watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) {
    restoreFocus = document.activeElement as HTMLElement;
    // a modal must not leave the page behind it scrollable
    if (props.modal) document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown, true);
    offset.value = null;
    startTimer();
    emit('show');
    nextTick(() => {
      const target = panel.value?.querySelector<HTMLElement>('[data-autofocus]')
        || panel.value?.querySelector<HTMLElement>(FOCUSABLE)
        || panel.value;
      target?.focus();
    });
  } else {
    if (props.modal) document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKeydown, true);
    stopTimer();
    restoreFocus?.focus?.();
    restoreFocus = null;
  }
});
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', onKeydown, true);
  document.documentElement.style.overflow = '';
  stopTimer();
});

/* ── dragging ───────────────────────────────────────────── */
function onDragStart(e: PointerEvent) {
  if (!props.draggable || !panel.value) return;
  /* Never capture the pointer over header controls (close, maximise, custom
     slot buttons) — capture would swallow their click. */
  if ((e.target as HTMLElement)?.closest('button,a,input,select,textarea,[role="button"]')) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  const cur = offset.value || { x: 0, y: 0 };
  drag.value = { px: e.clientX, py: e.clientY, ox: cur.x, oy: cur.y };
}
function onDragMove(e: PointerEvent) {
  const d = drag.value;
  if (!d) return;
  offset.value = { x: d.ox + (e.clientX - d.px), y: d.oy + (e.clientY - d.py) };
}
const onDragEnd = () => { drag.value = null; };

/* ── presentation ───────────────────────────────────────── */
const maskStyle = computed(() => {
  const s: Record<string, string> = { zIndex: String(props.zIndex) };
  if (props.maskColor) s['--dlg-mask'] = props.maskColor;
  return s;
});
const panelStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.width) s['--dlg-w'] = props.width;
  /* An explicit width must also raise the max, or a narrower --dlg-maxw from a
     preset (ApexConfirmDialog caps at 400px) would silently clamp it. */
  if (props.maxWidth) s['--dlg-maxw'] = props.maxWidth;
  else if (props.width) s['--dlg-maxw'] = `min(92vw, ${props.width})`;
  if (props.padding) s['--dlg-pad'] = props.padding;
  if (props.background) s['--dlg-bg'] = props.background;
  if (props.radius) s['--dlg-radius'] = props.radius;
  if (props.borderColor) s['--dlg-border'] = props.borderColor;
  if (offset.value) s.transform = `translate(${offset.value.x}px, ${offset.value.y}px)`;
  return s;
});
/* Was the only component that had this right; now it shares the resolver
   so it picks up the durations and the app-wide default too. AF2-332. */
const transitionProps = useOverlayTransition(props, 'apex-dlg');

defineExpose({ close, panel });
</script>

<template>
  <Teleport to="body">
    <Transition v-bind="transitionProps" @after-leave="emit('after-hide')">
      <div v-if="open" ref="root" class="apex-dlg" :style="maskStyle" :data-position="position"
           :data-modal="modal ? 'true' : 'false'" :data-blur="maskBlur ? 'true' : 'false'"
           @click.self="dismissableMask && closable && close()">
        <div ref="panel" class="apex-dlg__panel" :class="contentClass" :style="panelStyle"
             role="dialog" :aria-modal="modal || undefined" :aria-label="header || undefined"
             tabindex="-1" @click.stop>
          <div v-if="header || icon || closable || $slots.header" class="apex-dlg__head"
               :data-draggable="draggable ? 'true' : 'false'"
               @pointerdown="onDragStart" @pointermove="onDragMove"
               @pointerup="onDragEnd" @pointercancel="onDragEnd">
            <slot name="header">
              <ApexIcon v-if="icon" :name="icon" class="apex-dlg__headicon" :size="20" />
              <span class="apex-dlg__titles">
                <strong v-if="header">{{ header }}</strong>
                <em v-if="subtitle">{{ subtitle }}</em>
              </span>
            </slot>
            <button v-if="closable" type="button" class="apex-dlg__close" aria-label="Close" @click="close">
              <ApexIcon name="close" :size="19" />
            </button>
          </div>

          <div class="apex-dlg__body"><slot /></div>

          <div v-if="$slots.footer" class="apex-dlg__foot"><slot name="footer" /></div>

          <div v-if="autoClose && showTimer" class="apex-dlg__timer" aria-hidden="true"
               :style="{ transform: `scaleX(${timeLeft})` }"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
