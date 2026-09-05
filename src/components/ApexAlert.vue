<template>
  <Teleport to="body">
    <div
      v-if="state.open && !state.target"
      class="apex-alert-overlay"
      :class="ui?.overlay"
      :style="overlayStyle"
      @mousedown.self="onMaskDown"
    >
      <!-- The whole panel, for a caller who wants the service's sequencing and
           none of its chrome. Everything it needs is handed down. -->
      <slot
        v-if="$slots.container"
        name="container"
        :state="state"
        :buttons="buttons"
        :press="press"
        :close="close"
      />

      <div
        v-else
        ref="alertEl"
        class="apex-alert"
        :class="[state.enterClass, transitionClass, ui?.panel]"
        :style="panelStyle"
        :data-tone="state.stage === 'progress' ? 'info' : state.tone"
        :data-icon-pos="state.iconPosition || 'top'"
        role="alertdialog"
        aria-modal="true"
        :aria-label="state.title"
      >
        <button
          v-if="state.closable"
          type="button"
          class="apex-alert-close"
          :class="ui?.close"
          :aria-label="t('apexui.clear')"
          @click="onDismiss"
        ><ApexIcon name="close" :size="18" /></button>

        <!-- Keyed on the stage so the draw animation replays each time. Without
             this the tick is drawn once and every later stage shows it already
             complete — the same replay-by-remount trick the scroll directive
             needs, for the same reason. -->
        <div :key="figureKey" class="apex-alert-figure" :class="ui?.figure" :style="figureStyle">
          <slot name="icon" :state="state">
            <ApexProgressSpinner
              v-if="state.stage === 'progress'"
              :size="88"
              :stroke-width="6"
              color="var(--apex-alert-ring)"
            />

            <!-- An image or an icon replaces the drawn figure. The tone figure
                 is what you get without asking; these are for the cases that
                 need a particular picture. -->
            <img
              v-else-if="state.image"
              class="apex-alert-image"
              :src="state.image"
              :alt="state.imageAlt ?? ''"
            />

            <ApexIcon
              v-else-if="state.icon"
              class="apex-alert-icon"
              :name="state.icon"
              :size="64"
              :data-anim="state.iconAnimation || 'none'"
              :style="{ color: state.iconColor || 'var(--apex-alert-ring)' }"
            />

            <template v-else>
              <div class="apex-alert-pulse"></div>
              <svg class="apex-alert-svg" viewBox="0 0 168 168" aria-hidden="true">
                <circle class="apex-alert-circle" cx="84" cy="84" r="75" />

                <!-- `--len` is each path's own draw length, so a stroke-dash
                     animation covers exactly its own geometry. It has to be
                     inline: no class can know how long an arbitrary path is. -->
                <template v-if="state.tone === 'success'">
                  <path class="apex-alert-mark" :style="{ '--len': 100 }" d="M52 88 L74 110 L118 62" />
                </template>

                <template v-else-if="state.tone === 'danger'">
                  <path class="apex-alert-mark" :style="{ '--len': 70 }" d="M60 60 L108 108" />
                  <path
                    class="apex-alert-mark"
                    :style="{ '--len': 70, animationDelay: '0.75s' }"
                    d="M108 60 L60 108"
                  />
                </template>

                <template v-else-if="state.tone === 'warn'">
                  <path class="apex-alert-mark" :style="{ '--len': 50 }" d="M84 48 L84 96" />
                  <circle class="apex-alert-dot" cx="84" cy="120" r="5.5" />
                </template>

                <!-- info: the dot first, then the stem — an i drawn upside down,
                     which reads as deliberate where a top-down stem does not. -->
                <template v-else>
                  <circle class="apex-alert-dot" cx="84" cy="52" r="5.5" />
                  <path
                    class="apex-alert-mark"
                    :style="{ '--len': 50, animationDelay: '0.7s' }"
                    d="M84 72 L84 120"
                  />
                </template>
              </svg>
            </template>
          </slot>
        </div>

        <div :key="stageSig" class="apex-alert-content" :class="ui?.content">
          <h2 class="apex-alert-title" :class="ui?.title">{{ state.title }}</h2>

          <slot name="message" :state="state">
            <p v-if="state.message" class="apex-alert-text" :class="ui?.text">{{ state.message }}</p>
          </slot>

          <!-- Values are rendered as text, never as markup: they come from
               records a user typed. -->
          <ul v-if="state.changes && state.changes.length" class="apex-alert-changes" :class="ui?.changes">
            <li v-for="(c, i) in state.changes" :key="i">
              <span class="apex-alert-changes__label">{{ c.label }}:</span>
              <span class="apex-alert-changes__from">{{ c.from ?? '—' }}</span>
              <span class="apex-alert-changes__arrow">→</span>
              <span class="apex-alert-changes__to">{{ c.to ?? '—' }}</span>
            </li>
          </ul>

          <!-- Nothing to press while the work runs. -->
          <div v-if="state.stage !== 'progress'" class="apex-alert-actions" :class="ui?.actions">
            <slot name="footer" :buttons="buttons" :press="press">
              <ApexButton
                v-for="(b, i) in buttons"
                :key="i"
                :severity="b.severity"
                :variant="b.variant"
                :icon="b.icon"
                @click="press(b, i)"
              >{{ b.label }}</ApexButton>

              <ApexButton
                v-if="state.copyText"
                severity="success"
                :icon="copied ? 'check' : 'content_copy'"
                @click="onCopy"
              >{{ copied ? t('apexui.alert.copied') : t('apexui.alert.copy') }}</ApexButton>
            </slot>
          </div>

          <p v-if="state.footnote" class="apex-alert-footnote" :class="ui?.footnote">{{ state.footnote }}</p>

          <div v-if="showTimer" class="apex-alert-timer" :class="ui?.timer" :style="{ '--apex-alert-life': `${state.autoClose}ms` }"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * The one host for the alert service — mount it once, near the app root.
 *
 * Presentational only: it reads the shared state and settles the press. All
 * the sequencing lives in core/alert.ts, which is what lets a caller await a
 * question from anywhere without this component being in scope.
 *
 * The figure is drawn per tone rather than being an icon with an effect
 * applied: a tick that draws itself, a cross whose second stroke lands after
 * the first, an exclamation, an inverted i. That is the part of Pando's
 * version worth keeping, so it is the default; `icon` and `image` replace it
 * for the cases that need a particular picture.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useApexAlert } from '../core/alert';
import { useAlertButtons } from '../core/alertButtons';
import type { ApexAlertClasses } from '../types';
import { useApexI18n } from '../core/i18n';
import ApexButton from './ApexButton.vue';
import ApexIcon from './ApexIcon.vue';
import ApexProgressSpinner from './ApexProgressSpinner.vue';

/**
 * Props are the app-wide fallbacks. A per-call option always wins — the caller
 * knows what this particular alert is about; the host only knows the house
 * style.
 */
const props = withDefaults(defineProps<{
  /** Only render requests carrying this group, for a per-kind host. */
  group?: string;
  /** Default title, when a call gives none. */
  header?: string;
  message?: string;
  icon?: string;
  iconPosition?: 'top' | 'left' | 'right' | 'bottom';
  /** Pulse, shake or bounce an icon on open. Not spin: this is not loading. */
  iconAnimation?: 'none' | 'pulse' | 'shake' | 'bounce';
  iconColor?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  width?: string;
  /** Your own class on any part. See ApexAlertClasses. */
  ui?: ApexAlertClasses;
}>(), {
  iconPosition: 'top',
  iconAnimation: 'none',
});

const { state, settle, press, close } = useApexAlert();
const t = useApexI18n();

const alertEl = ref<HTMLElement | null>(null);

/* ── the button row ─────────────────────────────────────────── */

/* Built and gated in one place, because ApexConfirmPopup answers the same
   request with the same buttons. */
const buttons = useAlertButtons({
  acceptLabel: props.acceptLabel,
  rejectLabel: props.rejectLabel,
});

/* ── copy ───────────────────────────────────────────────────── */

/* Copy leaves the alert open — the point is usually to read the value as well
   as copy it, and closing would take it away mid-glance. */
const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

async function onCopy() {
  try {
    await navigator.clipboard.writeText(String(state.copyText ?? ''));
    copied.value = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => { copied.value = false; }, 1600);
  } catch {
    /* Clipboard access is denied outside a secure context. Nothing useful to
       say about that here, and throwing would take the alert down with it. */
  }
}

/* ── dismissal ──────────────────────────────────────────────── */

/* Overlay click and Escape: ignored while the work runs, since there is no
   abort to offer. Otherwise they mean cancel, or dismiss a one-button stage. */
function onDismiss() {
  if (state.stage === 'progress') return;
  settle(state.cancelText ? 'cancel' : 'confirm');
}

function onMaskDown() {
  if (state.dismissableMask === false) return;
  onDismiss();
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') onDismiss();
}

/* ── auto close ─────────────────────────────────────────────── */

/**
 * Never while the work is running: dismissing a progress stage on a timer
 * would abandon an action mid-flight and leave the reader believing it was
 * finished. It applies to a notify and to a result, which are reports.
 */
const showTimer = computed(() =>
  !!state.autoClose && state.showTimer && state.stage !== 'progress');

let autoTimer: ReturnType<typeof setTimeout> | undefined;

watch(() => [state.stage, state.seq], () => {
  clearTimeout(autoTimer);
  if (!state.autoClose || state.stage === 'progress') return;
  autoTimer = setTimeout(() => onDismiss(), state.autoClose);
});

/* ── appearance ─────────────────────────────────────────────── */

const overlayStyle = computed(() => ({
  background: state.maskColor,
  backdropFilter: state.maskBlur === false ? 'none' : undefined,
}));

const panelStyle = computed(() => ({
  maxWidth: state.width ?? props.width,
  padding: state.padding,
  background: state.background,
  borderRadius: state.radius,
}));

const figureStyle = computed(() => ({
  color: state.iconColor ?? props.iconColor,
}));

const transitionClass = computed(() =>
  (state.transition && state.transition !== 'scale' ? `apex-alert--${state.transition}` : ''));

/* ── stage animation ────────────────────────────────────────── */

const figureKey = computed(() => `${state.stage}-${state.tone}-${state.seq}`);

/** Everything that changes the panel's height, so the ease can be triggered. */
const stageSig = computed(() => [
  state.stage, state.tone, state.title, state.message,
  state.changes?.length ?? 0, buttons.value.length,
].join('|'));

const reducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* The pop-in covers the first content of each opening; only stage-to-stage
   changes get the height ease, or the entrance animates twice. */
let animatedThisOpen = false;

watch(() => state.open, (open) => {
  if (open) {
    animatedThisOpen = false;
    copied.value = false;
    window.addEventListener('keydown', onKey);
  } else {
    clearTimeout(autoTimer);
    window.removeEventListener('keydown', onKey);
  }
});

/**
 * Ease the panel between its old and new height across a stage change.
 *
 * Measured in JS because `height: auto` cannot be transitioned. This runs on
 * the default 'pre' flush, so offsetHeight here is still the previous height —
 * which is exactly what the animation needs as its starting point.
 */
watch(stageSig, () => {
  if (!state.open) return;
  if (!animatedThisOpen) { animatedThisOpen = true; return; }
  const el = alertEl.value;
  if (!el || reducedMotion()) return;

  const start = el.offsetHeight;
  nextTick(() => {
    el.style.height = 'auto';
    const target = el.scrollHeight;
    if (target === start) { el.style.height = ''; return; }
    el.style.height = `${start}px`;
    el.style.overflow = 'hidden';
    void el.offsetHeight; // force a reflow, or the two heights coalesce
    el.style.transition = 'height 350ms var(--ease-out)';
    el.style.height = `${target}px`;
    const done = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.style.height = '';
      el.style.overflow = '';
      el.style.transition = '';
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done);
  });
});

onBeforeUnmount(() => {
  clearTimeout(copiedTimer);
  clearTimeout(autoTimer);
  window.removeEventListener('keydown', onKey);
});
</script>
