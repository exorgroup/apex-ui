<script setup lang="ts">
/**
 * ApexBlockUI — covers its content, or the whole document, while something is
 * in flight.
 *
 * An overlay inside a positioned wrapper rather than pointer-events on the
 * content itself: the cover intercepts clicks AND keyboard focus, so a blocked
 * panel cannot be tabbed into — which pointer-events alone would allow.
 *
 * `duration` releases the block by itself. A block driven by a request that may
 * never answer otherwise leaves the user stuck with no way out, so the timeout
 * is a property of the block rather than each caller's own setTimeout.
 */
import { computed, onBeforeUnmount, ref, watch, Teleport } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  /** v-model:blocked — bindable, so the auto-release reports back. */
  blocked?: boolean;
  /** Block the whole document instead of the content. */
  fullScreen?: boolean;
  /** Release automatically after this many milliseconds. */
  duration?: number;
  /** Show a countdown bar along the cover's edge while a duration runs. */
  showTimer?: boolean;
  /** Let clicks through while still dimming — a purely visual block. */
  passthrough?: boolean;
  /** Release when the cover is clicked. */
  dismissable?: boolean;
  /* chrome */
  background?: string;
  opacity?: number;
  blur?: boolean | number | string;
  radius?: string;
  /** A spinner, an icon, or nothing. */
  spinner?: boolean;
  icon?: string;
  message?: string;
  contentColor?: string;
  zIndex?: number;
  /** Stop the page scrolling while the document is blocked. */
  lockScroll?: boolean;
}>(), {
  blocked: false, spinner: true, zIndex: 1250, lockScroll: true,
});

const emit = defineEmits<{
  (e: 'update:blocked', v: boolean): void;
  (e: 'block' | 'unblock'): void;
  (e: 'timeout'): void;
}>();

const remaining = ref(1);
let timer: number | null = null;
let raf: number | null = null;

function stop() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  remaining.value = 1;
}
function release(fromTimer = false) {
  stop();
  emit('update:blocked', false);
  emit('unblock');
  if (fromTimer) emit('timeout');
}
function start() {
  stop();
  if (!props.blocked || !props.duration) return;
  const began = performance.now();
  const total = props.duration;
  timer = window.setTimeout(() => release(true), total);
  if (!props.showTimer) return;
  const tick = () => {
    remaining.value = Math.max(0, 1 - (performance.now() - began) / total);
    if (remaining.value > 0 && props.blocked) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

watch(() => props.blocked, (v) => {
  if (v) { emit('block'); start(); } else stop();
  if (typeof document === 'undefined' || !props.fullScreen || !props.lockScroll) return;
  document.documentElement.style.overflow = v ? 'hidden' : '';
}, { immediate: true });
watch(() => props.duration, start);
onBeforeUnmount(() => {
  stop();
  if (typeof document !== 'undefined' && props.fullScreen && props.lockScroll) {
    document.documentElement.style.overflow = '';
  }
});

const coverStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.background) s['--blk-bg'] = props.background;
  if (props.opacity !== undefined) s['--blk-opacity'] = String(props.opacity);
  if (props.radius) s.borderRadius = props.radius;
  if (props.contentColor) s['--blk-fg'] = props.contentColor;
  if (props.blur) {
    const r = props.blur === true ? 3 : props.blur;
    s['--blk-blur'] = typeof r === 'number' ? r + 'px' : String(r);
  }
  if (props.fullScreen) s.zIndex = String(props.zIndex);
  return s;
});
</script>

<template>
  <component :is="fullScreen ? Teleport : 'div'" :to="fullScreen ? 'body' : undefined"
             :class="fullScreen ? undefined : 'apex-blk'">
    <slot v-if="!fullScreen" />
    <Transition name="apex-blk-fade">
      <div v-if="blocked" class="apex-blk__cover" :style="coverStyle"
           :data-full="fullScreen ? 'true' : 'false'"
           :data-blur="blur ? 'true' : 'false'"
           :data-pass="passthrough ? 'true' : 'false'"
           :aria-hidden="passthrough ? 'true' : undefined"
           role="presentation" @click="dismissable && release()">
        <slot name="content">
          <div v-if="spinner || icon || message" class="apex-blk__body">
            <ApexIcon v-if="icon" :name="icon" :size="26" />
            <ApexIcon v-else-if="spinner" name="progress_activity" :size="26" spin />
            <span v-if="message" class="apex-blk__msg">{{ message }}</span>
          </div>
        </slot>
        <span v-if="duration && showTimer" class="apex-blk__timer" aria-hidden="true"
              :style="{ transform: `scaleX(${remaining})` }"></span>
      </div>
    </Transition>
  </component>
</template>
