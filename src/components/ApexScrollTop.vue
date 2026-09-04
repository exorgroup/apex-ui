<script setup lang="ts">
/**
 * ApexScrollTop — a button that appears past a scroll threshold and returns to
 * the top.
 *
 * Against the window it is simply fixed to a viewport corner. Inside a scroller
 * it sits BELOW the scroller's frame, in space reserved outside it. Any lane
 * inside the scrollport — a padding strip, a sticky band — is somewhere the
 * content scrolls through, so a button there is always over text at some scroll
 * position; only space outside the scroller is space nothing can reach.
 *
 * The scroll read is rAF-throttled: scroll fires far more often than a threshold
 * can be crossed.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  /** 'window', 'parent', or a selector for any scroller. */
  target?: 'window' | 'parent' | string;
  /** Scroll distance before it appears. */
  threshold?: number;
  icon?: string;
  /** Text beside the icon, which turns it into a pill. */
  label?: string;
  ariaLabel?: string;
  behavior?: 'smooth' | 'auto';
  /* placement */
  position?: 'bottom-end' | 'bottom-start' | 'bottom-center';
  offset?: string;
  /* chrome */
  size?: string;
  radius?: string;
  background?: string;
  color?: string;
  borderColor?: string;
  shadow?: string;
  hoverBackground?: string;
  hoverColor?: string;
  /** Lift the button on hover. Off for a button that should sit still. */
  hoverLift?: boolean;
  /** Ring showing how far down the scroller you are. */
  showProgress?: boolean;
  progressColor?: string;
  zIndex?: number;
}>(), {
  target: 'window', threshold: 200, icon: 'arrow_upward', behavior: 'smooth',
  position: 'bottom-end', offset: '24px', size: '42px', hoverLift: true, zIndex: 1150,
});

const emit = defineEmits<{ (e: 'click'): void }>();

const root = ref<HTMLElement | null>(null);
const btn = ref<HTMLElement | null>(null);
const docked = computed(() => props.target !== 'window');
const visible = ref(false);
const inFrame = ref(true);
const progress = ref(0);
const spot = ref<{ top: number; left: number } | null>(null);
let scroller: HTMLElement | Window | null = null;
let raf: number | null = null;
let reservePrev = '';

const offsetPx = computed(() => parseFloat(props.offset) || 0);

function metrics() {
  if (!scroller) return { top: 0, span: 0 };
  if (scroller === window) {
    const doc = document.documentElement;
    return { top: window.scrollY, span: doc.scrollHeight - doc.clientHeight };
  }
  const el = scroller as HTMLElement;
  return { top: el.scrollTop, span: el.scrollHeight - el.clientHeight };
}

/** Coordinates from the scroller's own frame, so the strip is never scrolled. */
function place() {
  if (!docked.value || !scroller || scroller === window) { spot.value = null; return; }
  const el = scroller as HTMLElement;
  const r = el.getBoundingClientRect();
  const b = btn.value?.getBoundingClientRect();
  const w = b?.width || parseFloat(props.size) || 42;
  const h = b?.height || parseFloat(props.size) || 42;
  /* a panel scrolled off the page should not leave its button floating */
  inFrame.value = r.bottom > -offsetPx.value && r.top < window.innerHeight;
  const left = props.position === 'bottom-start'
    ? r.left + offsetPx.value
    : props.position === 'bottom-center'
      ? r.left + (r.width - w) / 2
      : r.right - offsetPx.value - w;
  spot.value = { top: r.bottom + offsetPx.value, left };
}

function read() {
  const { top, span } = metrics();
  visible.value = top > props.threshold;
  progress.value = span > 0 ? Math.min(1, top / span) : 0;
  place();
}
function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = null; read(); });
}

function resolveScroller() {
  if (props.target === 'window') return window;
  if (props.target === 'parent') return root.value?.parentElement ?? window;
  return (typeof document !== 'undefined' && document.querySelector<HTMLElement>(props.target)) || window;
}

/** Space for the button, reserved OUTSIDE the scroller so nothing scrolls into it. */
function applyReserve() {
  const el = scroller as HTMLElement | null;
  if (!docked.value || !el || el === (window as unknown as HTMLElement)) return;
  reservePrev = el.style.marginBlockEnd || '';
  el.style.marginBlockEnd = `calc(${props.size} + ${props.offset} * 2)`;
}
function clearReserve() {
  const el = scroller as HTMLElement | null;
  if (!docked.value || !el || el === (window as unknown as HTMLElement)) return;
  el.style.marginBlockEnd = reservePrev;
}

onMounted(() => {
  scroller = resolveScroller();
  scroller.addEventListener('scroll', onScroll, { passive: true });
  applyReserve();
  if (docked.value) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  read();
});
onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf);
  scroller?.removeEventListener('scroll', onScroll);
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  clearReserve();
});
watch(() => [props.size, props.offset, props.label, props.position], () => { place(); });

function scrollTopOf() {
  if (!scroller) return 0;
  return scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
}
/**
 * A smooth scrollTo is sometimes swallowed outright — a sandboxed frame, a
 * restrictive scroll-behavior, an interrupted animation. Rather than trust it,
 * check whether anything moved and repeat without the animation: a jump beats a
 * button that appears to do nothing.
 */
function toTop() {
  if (!scroller) return;
  const from = scrollTopOf();
  const go = (behavior: ScrollBehavior) => {
    if (scroller === window) window.scrollTo({ top: 0, behavior });
    else (scroller as HTMLElement).scrollTo({ top: 0, behavior });
  };
  go(props.behavior);
  emit('click');
  if (props.behavior !== 'smooth' || from <= 0) return;
  window.setTimeout(() => {
    if (Math.abs(scrollTopOf() - from) < 2) go('auto');
  }, 250);
}

const shown = computed(() => visible.value && (!docked.value || inFrame.value));

const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--apex-scrolltop-size': props.size,
    '--apex-scrolltop-offset': props.offset,
    zIndex: String(props.zIndex),
  };
  if (props.radius) s['--apex-scrolltop-radius'] = props.radius;
  if (props.background) s['--apex-scrolltop-bg'] = props.background;
  if (props.color) s['--apex-scrolltop-fg'] = props.color;
  if (props.borderColor) s['--apex-scrolltop-border'] = props.borderColor;
  if (props.shadow) s['--apex-scrolltop-shadow'] = props.shadow;
  if (props.hoverBackground) s['--apex-scrolltop-hover-bg'] = props.hoverBackground;
  if (props.hoverColor) s['--apex-scrolltop-hover-fg'] = props.hoverColor;
  if (props.progressColor) s['--apex-scrolltop-progress'] = props.progressColor;
  s['--apex-scrolltop-pct'] = Math.round(progress.value * 100) + '%';
  if (spot.value) {
    s.insetBlockStart = spot.value.top + 'px';
    s.insetInlineStart = spot.value.left + 'px';
  }
  return s;
});
</script>

<template>
  <div ref="root" class="apex-stt__dock">
    <button ref="btn" type="button" class="apex-stt" :style="rootStyle"
            :data-visible="shown ? 'true' : 'false'"
            :tabindex="shown ? 0 : -1" :aria-hidden="shown ? undefined : 'true'"
            :data-mode="docked ? 'docked' : 'fixed'" :data-position="position"
            :data-lift="hoverLift ? 'true' : 'false'"
            :data-progress="showProgress ? 'true' : 'false'"
            :aria-label="ariaLabel || label || 'Scroll to top'" @click="toTop">
      <slot>
        <ApexIcon :name="icon" :size="20" />
        <span v-if="label" class="apex-stt__label">{{ label }}</span>
      </slot>
    </button>
  </div>
</template>
