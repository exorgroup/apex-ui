<script setup lang="ts">
/**
 * ApexConfirmPopup — a confirmation anchored to the control that triggered it.
 *
 * Shares the confirm service with ApexConfirmDialog: a request carrying a
 * `target` lands here, one without lands in the dialog. One service, one
 * `require()` call site, and the caller never picks a component.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import ApexButton from './ApexButton.vue';
import ApexIcon from './ApexIcon.vue';
import { anchorPosition, resolveTarget, type AnchorSide } from '../core/anchor';
import { useApexConfirm, type ConfirmButton, type ConfirmOptions } from '../core/confirm';

const props = withDefaults(defineProps<{
  group?: string;
  /* declarative defaults — a require() value wins */
  message?: string;
  icon?: string;
  iconColor?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  side?: AnchorSide;
  align?: 'start' | 'center' | 'end';
  /** Distance from the target, in pixels. */
  gap?: number;
  showArrow?: boolean;
  width?: string;
  zIndex?: number;
}>(), {
  side: 'bottom', align: 'center', gap: 10, showArrow: true,
  acceptLabel: 'Yes', rejectLabel: 'Cancel', zIndex: 1100,
});

const confirm = useApexConfirm();
const state = confirm.state;
const o = computed<ConfirmOptions>(() => state.options || {});

const mine = computed(() => {
  if (!o.value.target) return false;
  return props.group ? o.value.group === props.group : !o.value.group;
});
const open = computed(() => state.visible && mine.value);

const message = computed(() => o.value.message ?? props.message);
const icon = computed(() => o.value.icon ?? props.icon);
const iconColor = computed(() => o.value.iconColor ?? props.iconColor);
const buttons = computed<ConfirmButton[]>(() => o.value.buttons || [
  {
    label: o.value.rejectLabel ?? props.rejectLabel,
    icon: o.value.rejectIcon,
    severity: o.value.rejectSeverity || 'secondary',
    variant: 'text',
    role: 'reject',
  },
  {
    label: o.value.acceptLabel ?? props.acceptLabel,
    icon: o.value.acceptIcon,
    severity: o.value.acceptSeverity || 'primary',
    variant: 'solid',
    role: 'accept',
  },
]);

/* ── positioning ────────────────────────────────────────── */
const panel = ref<HTMLElement | null>(null);
const pos = ref({ x: 0, y: 0, side: props.side as AnchorSide, arrow: 0 });
const ready = ref(false);

/** Measures the panel, then places it — so a flip is decided on the real size. */
function place() {
  const el = panel.value;
  const target = resolveTarget(o.value.target);
  if (!el || !target) return;
  const r = el.getBoundingClientRect();
  pos.value = anchorPosition(target.getBoundingClientRect(), { width: r.width, height: r.height }, {
    side: o.value.side || props.side,
    align: o.value.align || props.align,
    gap: props.gap,
  });
  ready.value = true;
}

function onDocPointer(e: PointerEvent) {
  const el = panel.value;
  const target = resolveTarget(o.value.target);
  if (!el) return;
  const node = e.target as Node;
  // a click on the trigger itself is the caller's business, not a dismissal
  if (el.contains(node) || (target && target.contains(node))) return;
  confirm.close();
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); confirm.close(); }
}
const reposition = () => place();

watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) {
    ready.value = false;
    nextTick(() => {
      place();
      panel.value?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
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
    '--pop-arrow': pos.value.arrow + 'px',
    // hidden until measured, so it never flashes at the wrong place
    visibility: ready.value ? 'visible' : 'hidden',
  };
  const w = o.value.width || props.width;
  if (w) s['--pop-w'] = w;
  if (o.value.padding) s['--pop-pad'] = o.value.padding;
  if (o.value.background) s['--pop-bg'] = o.value.background;
  if (o.value.radius) s['--pop-radius'] = o.value.radius;
  if (iconColor.value) s['--cfm-icon'] = iconColor.value;
  return s;
});
</script>

<template>
  <Teleport to="body">
    <Transition name="apex-pop-fade">
      <div v-if="open" ref="panel" class="apex-cpop" :style="panelStyle" :data-side="pos.side"
           :data-arrow="showArrow ? 'true' : 'false'" role="dialog" :aria-label="message">
        <slot name="container" :options="o" :accept="confirm.accept" :reject="confirm.reject"
              :close="confirm.close" :buttons="buttons">
          <div class="apex-cpop__body">
            <slot name="message" :options="o">
              <ApexIcon v-if="icon" :name="icon" class="apex-cpop__icon" :size="19" />
              <span class="apex-cpop__text">{{ message }}</span>
            </slot>
          </div>
          <div class="apex-cpop__actions">
            <ApexButton v-for="(b, i) in buttons" :key="i" size="sm" :severity="b.severity"
                        :variant="b.variant" :icon="b.icon"
                        :data-autofocus="b.role === 'accept' ? '' : undefined"
                        @click="confirm.custom(b, i)">{{ b.label }}</ApexButton>
          </div>
        </slot>
        <span v-if="showArrow" class="apex-cpop__tip" aria-hidden="true"></span>
      </div>
    </Transition>
  </Teleport>
</template>
