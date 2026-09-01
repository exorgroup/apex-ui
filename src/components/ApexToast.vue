<script setup lang="ts">
/**
 * ApexToast — service-driven messages in a fixed overlay stack.
 *
 * Built on ApexMessage: severity tints, variants, the blur, the close button and
 * the countdown bar are all inherited, so a toast is that component in a
 * positioned stack with a life timer around it.
 *
 * Two stack modes. `expanded` lays every toast out in a column. `stacked` keeps
 * the newest on top with the rest peeking behind it and fans them out on hover —
 * and while the pointer is over the stack, every life timer pauses, since a
 * toast that vanishes under the cursor is a toast you were about to read.
 */
import { computed, onBeforeUnmount, ref, Teleport, watch } from 'vue';
import ApexMessage from './ApexMessage.vue';
import { __toastState, useApexToast, type ToastMessage } from '../core/toast';

export type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';

const props = withDefaults(defineProps<{
  position?: ToastPosition;
  /** 'stacked' collapses the pile and fans it on hover; 'expanded' always shows the column. */
  mode?: 'stacked' | 'expanded';
  /** Only render messages carrying this group. */
  group?: string;
  /** Cap the visible column; the rest wait their turn. */
  max?: number;
  /** Fallback life for messages that set none. */
  life?: number;
  variant?: 'filled' | 'outlined' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  blur?: boolean | number | string;
  width?: string;
  /** Distance from the viewport edge. */
  offset?: string;
  zIndex?: number;
  /** Newest first (the default) or appended below. */
  newestOnTop?: boolean;
}>(), {
  position: 'top-right', mode: 'expanded', max: 5, variant: 'filled',
  size: 'md', width: '360px', offset: '20px', zIndex: 1200, newestOnTop: true,
});

const emit = defineEmits<{
  (e: 'close' | 'life-end', message: ToastMessage): void;
}>();

const toast = useApexToast();
const hovering = ref(false);

const queue = computed(() => {
  const all = __toastState.messages.filter((m) => (props.group ? m.group === props.group : !m.group));
  const ordered = props.newestOnTop ? [...all].reverse() : all;
  return ordered.slice(0, props.max);
});

/* One timer per id, held outside reactivity: the queue is the source of truth,
   and a timer is just bookkeeping about it. */
interface Timer { started: number; left: number; handle: number | null }
const timers = new Map<number | string, Timer>();

function lifeOf(m: ToastMessage) {
  return m.sticky ? 0 : (m.life ?? props.life ?? 3000);
}
function clear(id: number | string) {
  const t = timers.get(id);
  if (t?.handle) clearTimeout(t.handle);
  timers.delete(id);
}
function run(id: number | string, ms: number) {
  const t = timers.get(id) ?? { started: 0, left: ms, handle: null };
  t.started = performance.now();
  t.handle = window.setTimeout(() => {
    const m = __toastState.messages.find((x) => x.id === id);
    clear(id);
    toast.remove(id);
    if (m) emit('life-end', m);
  }, t.left);
  timers.set(id, t);
}
function pauseAll() {
  timers.forEach((t) => {
    if (!t.handle) return;
    clearTimeout(t.handle);
    t.handle = null;
    t.left = Math.max(80, t.left - (performance.now() - t.started));
  });
}
function resumeAll() {
  timers.forEach((t, id) => { if (!t.handle) run(id, t.left); });
}

watch(queue, (list) => {
  const live = new Set(list.map((m) => m.id));
  timers.forEach((_t, id) => { if (!live.has(id)) clear(id); });
  list.forEach((m) => {
    const ms = lifeOf(m);
    if (!ms) { clear(m.id); return; }
    if (timers.has(m.id)) return;
    timers.set(m.id, { started: 0, left: ms, handle: null });
    if (!hovering.value) run(m.id, ms);
  });
}, { deep: true, immediate: true });

watch(hovering, (v) => (v ? pauseAll() : resumeAll()));
onBeforeUnmount(() => timers.forEach((_t, id) => clear(id)));

function close(m: ToastMessage) {
  clear(m.id as number | string);
  toast.remove(m.id as number | string);
  emit('close', m);
}

/* In stacked mode the pile is depth: only the front toast is fully visible, the
   ones behind are scaled back and peek by a few pixels. */
const fanned = computed(() => props.mode === 'expanded' || hovering.value);
function stackStyle(i: number) {
  if (fanned.value) return {};
  const bottom = props.position.startsWith('bottom');
  const buried = i > 2;
  return {
    transform: `translateY(${i * 9 * (bottom ? -1 : 1)}px) scale(${1 - i * 0.045})`,
    zIndex: String(100 - i),
    /* buried toasts are gone for the pointer too: an invisible card that still
       swallowed clicks over the page was the bug here */
    opacity: buried ? '0' : '1',
    visibility: buried ? 'hidden' : 'visible',
    pointerEvents: i === 0 ? 'auto' : 'none',
  };
}

const rootStyle = computed(() => ({
  inlineSize: props.width,
  '--toast-offset': props.offset,
  zIndex: String(props.zIndex),
}));

const slots = defineSlots<{
  message?: (props: { message: ToastMessage; close: () => void; index: number }) => unknown;
  actions?: (props: { message: ToastMessage; close: () => void }) => unknown;
}>();
</script>

<template>
  <Teleport to="body">
    <div class="apex-toast" :style="rootStyle" :data-position="position" :data-mode="mode"
         :data-fanned="fanned ? 'true' : 'false'" role="log" aria-live="polite"
         @pointerenter="hovering = true" @pointerleave="hovering = false">
      <TransitionGroup name="apex-toast-item">
        <div v-for="(m, i) in queue" :key="m.id" class="apex-toast__item" :style="stackStyle(i)">
          <slot v-if="slots.message" name="message" :message="m" :close="() => close(m)" :index="i" />
          <ApexMessage v-else :severity="m.severity || 'info'" :variant="variant" :size="size"
                       :icon="m.icon" :blur="blur"
                       :closable="m.closable !== false" @close="close(m)">
            <span v-if="m.summary" class="apex-toast__summary">{{ m.summary }}</span>
            <span v-if="m.detail" class="apex-toast__detail">{{ m.detail }}</span>
            <template v-if="slots.actions" #actions>
              <slot name="actions" :message="m" :close="() => close(m)" />
            </template>
          </ApexMessage>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
