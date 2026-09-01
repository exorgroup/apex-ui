<script setup lang="ts">
/**
 * ApexDrawer — a panel that slides in from an edge of the screen.
 *
 * Shares ApexDialog's overlay mechanics (mask, focus trap and restore, Escape
 * and mask dismissal, scroll lock) but slides along an axis instead of scaling
 * in place, so `size` is the panel's thickness on that axis. `position="full"`
 * covers the viewport; `responsiveSize` widens it below a breakpoint.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom' | 'full';

const props = withDefaults(defineProps<{
  /** Bindable open state. */
  visible?: boolean;
  header?: string;
  /** Text under the header. */
  subtitle?: string;
  icon?: string;
  /** Which edge it slides from; `full` covers the viewport. */
  position?: DrawerPosition;
  /** Panel thickness on its axis — width for left/right, height for top/bottom. */
  size?: string;
  /** Thickness below `breakpoint`, for narrow screens. */
  responsiveSize?: string;
  /** Media width under which `responsiveSize` applies. */
  breakpoint?: string;
  /** Blocks the page behind, and traps focus. */
  modal?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  /** Click the mask to dismiss. */
  dismissableMask?: boolean;
  /** Keep the header row even with no header text. */
  showHeader?: boolean;

  /* chrome */
  padding?: string;
  background?: string;
  borderColor?: string;
  maskColor?: string;
  /** Blur the page behind the mask. */
  maskBlur?: boolean;
  /** Round the inner corners, for a drawer inset from the edge. */
  radius?: string;
  /** Gap between the panel and the viewport edges. */
  inset?: string;
  /** Stack order, for a drawer opened over a dialog. */
  zIndex?: number;
  contentClass?: string;
}>(), {
  position: 'left', modal: true, closable: true, closeOnEscape: true,
  showHeader: true, breakpoint: '640px', zIndex: 1000,
});

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'show' | 'hide' | 'after-hide'): void;
}>();

const open = ref(!!props.visible);
watch(() => props.visible, (v) => { open.value = !!v; });

const panel = ref<HTMLElement | null>(null);
let restoreFocus: HTMLElement | null = null;

/* ── responsive ─────────────────────────────────────────── */
/* The breakpoint is a prop, and a media query cannot read a custom property,
   so the match is watched in script and swaps the size variable. */
const narrow = ref(false);
let mq: MediaQueryList | null = null;
const onMq = (e: MediaQueryListEvent | MediaQueryList) => { narrow.value = e.matches; };
watch(() => props.breakpoint, (bp) => {
  if (typeof window === 'undefined' || !window.matchMedia) return;
  mq?.removeEventListener?.('change', onMq as EventListener);
  mq = window.matchMedia(`(max-width: ${bp || '640px'})`);
  mq.addEventListener?.('change', onMq as EventListener);
  onMq(mq);
}, { immediate: true });

function close() {
  open.value = false;
  emit('update:visible', false);
  emit('hide');
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
    if (props.modal) document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown, true);
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
    restoreFocus?.focus?.();
    restoreFocus = null;
  }
});
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', onKeydown, true);
  document.documentElement.style.overflow = '';
  mq?.removeEventListener?.('change', onMq as EventListener);
});

/* ── presentation ───────────────────────────────────────── */
const rootStyle = computed(() => {
  const s: Record<string, string> = { zIndex: String(props.zIndex) };
  if (props.maskColor) s['--drw-mask'] = props.maskColor;
  if (props.inset) s['--drw-inset'] = props.inset;
  return s;
});
const panelStyle = computed(() => {
  const s: Record<string, string> = {};
  const size = (narrow.value && props.responsiveSize) || props.size;
  if (size) s['--drw-size'] = size;
  if (props.padding) s['--drw-pad'] = props.padding;
  if (props.background) s['--drw-bg'] = props.background;
  if (props.radius) s['--drw-radius'] = props.radius;
  if (props.borderColor) s['--drw-border'] = props.borderColor;
  return s;
});
const axis = computed(() => (props.position === 'top' || props.position === 'bottom' ? 'y' : 'x'));

defineExpose({ close, panel });
</script>

<template>
  <Teleport to="body">
    <Transition :name="`apex-drw-${position === 'full' ? 'full' : position}`" @after-leave="emit('after-hide')">
      <div v-if="open" class="apex-drw" :style="rootStyle" :data-position="position" :data-axis="axis"
           :data-modal="modal ? 'true' : 'false'" :data-blur="maskBlur ? 'true' : 'false'"
           @click.self="dismissableMask && closable && close()">
        <div ref="panel" class="apex-drw__panel" :class="contentClass" :style="panelStyle"
             role="dialog" :aria-modal="modal || undefined" :aria-label="header || undefined"
             tabindex="-1" @click.stop>
          <slot name="container" :close="close">
            <div v-if="showHeader && (header || icon || closable || $slots.header)" class="apex-drw__head">
              <slot name="header">
                <ApexIcon v-if="icon" :name="icon" class="apex-drw__headicon" :size="20" />
                <span class="apex-drw__titles">
                  <strong v-if="header">{{ header }}</strong>
                  <em v-if="subtitle">{{ subtitle }}</em>
                </span>
              </slot>
              <button v-if="closable" type="button" class="apex-drw__close" aria-label="Close" @click="close">
                <ApexIcon name="close" :size="19" />
              </button>
            </div>

            <div class="apex-drw__body"><slot /></div>

            <div v-if="$slots.footer" class="apex-drw__foot"><slot name="footer" /></div>
          </slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
