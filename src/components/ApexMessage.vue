<script setup lang="ts">
/**
 * ApexMessage — an inline message for feedback next to the thing it concerns.
 *
 * Three variants over one box: `filled` tints the surface, `outlined` keeps the
 * page background with a coloured edge, `simple` drops the frame entirely for a
 * line of coloured text under a field.
 *
 * `blur` frosts whatever sits behind the message — the same idea as the dialog's
 * mask blur, so a message over an image or a busy panel stays legible without a
 * solid block of colour.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';

export type MessageSeverity = 'info' | 'success' | 'warn' | 'error' | 'secondary' | 'contrast';

const DEFAULT_ICONS: Record<MessageSeverity, string> = {
  info: 'info', success: 'check_circle', warn: 'warning', error: 'error',
  secondary: 'chat_bubble', contrast: 'bolt',
};

const props = withDefaults(defineProps<{
  /** Bindable, so a closed message can be brought back. */
  visible?: boolean;
  severity?: MessageSeverity;
  variant?: 'filled' | 'outlined' | 'simple';
  size?: 'sm' | 'md' | 'lg';
  /** Overrides the severity's icon; empty string removes it. */
  icon?: string;
  closable?: boolean;
  /** Dismiss automatically after this many milliseconds. */
  life?: number;
  /** Show a bar counting the life down. */
  showTimer?: boolean;
  /** Frost what sits behind the message; a number or CSS length sets the radius. */
  blur?: boolean | number | string;
  /** Make the surface translucent, so a blur has something to show through. */
  translucent?: boolean;
  /* chrome */
  background?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
  radius?: string;
  padding?: string;
  /** Stretch to the container, or hug its content. */
  block?: boolean;
}>(), {
  visible: true, severity: 'info', variant: 'filled', size: 'md',
  closable: false, block: true,
});

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'close' | 'life-end'): void;
}>();

const open = ref(props.visible);
watch(() => props.visible, (v) => { open.value = v; if (v) start(); });

const timeLeft = ref(1);
let timer: number | null = null;
let raf: number | null = null;

function stop() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  timeLeft.value = 1;
}
function close(fromLife = false) {
  stop();
  open.value = false;
  emit('update:visible', false);
  emit(fromLife ? 'life-end' : 'close');
}
function start() {
  stop();
  if (!props.life || !open.value) return;
  const began = performance.now();
  timer = window.setTimeout(() => close(true), props.life);
  if (!props.showTimer) return;
  const tick = () => {
    timeLeft.value = Math.max(0, 1 - (performance.now() - began) / (props.life as number));
    if (timeLeft.value > 0 && open.value) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
watch(() => props.life, start, { immediate: true });
onBeforeUnmount(stop);

const icon = computed(() => (props.icon !== undefined ? props.icon : DEFAULT_ICONS[props.severity]));

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.background) s['--msg-bg'] = props.background;
  if (props.textColor) s['--msg-fg'] = props.textColor;
  if (props.borderColor) s['--msg-border'] = props.borderColor;
  if (props.iconColor) s['--msg-icon'] = props.iconColor;
  if (props.radius) s['--msg-radius'] = props.radius;
  if (props.padding) s['--msg-pad'] = props.padding;
  if (props.blur) {
    const r = props.blur === true ? 8 : props.blur;
    s['--msg-blur'] = typeof r === 'number' ? r + 'px' : String(r);
  }
  return s;
});
</script>

<template>
  <Transition name="apex-msg">
    <div v-if="open" class="apex-msg" :style="rootStyle" :data-severity="severity" :data-variant="variant"
         :data-size="size" :data-block="block ? 'true' : 'false'"
         :data-blur="blur ? 'true' : 'false'" :data-translucent="translucent || !!blur ? 'true' : 'false'"
         role="alert">
      <slot name="icon">
        <ApexIcon v-if="icon" :name="icon" class="apex-msg__icon" />
      </slot>
      <span class="apex-msg__text"><slot /></span>
      <slot name="actions" />
      <button v-if="closable" type="button" class="apex-msg__close" aria-label="Close" @click="close()">
        <ApexIcon name="close" :size="17" />
      </button>
      <span v-if="life && showTimer" class="apex-msg__timer" aria-hidden="true"
            :style="{ transform: `scaleX(${timeLeft})` }"></span>
    </div>
  </Transition>
</template>
