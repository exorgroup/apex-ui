<script setup lang="ts">
/**
 * ApexEditorObjectBar — the floating contextual bar for a selected object.
 *
 * The SHELL, not the contents. The complaint that started this was that the
 * table bar sat in the toolbar stack, far from the table it acted on; the fix is
 * where it is drawn, not what it holds, so ApexEditorTableTools is placed by
 * this rather than rewritten by it.
 *
 * Anchored BELOW the object and flipped above only when there is no room — which
 * is the whole point: a bar over the cells being edited is exactly why the
 * original sat in the stack. Positioning comes from core/anchor.ts, so flipping
 * and the on-screen shift are the same code the popovers use.
 *
 * Not a popup: there is no outside-click or Escape dismissal, because the bar
 * belongs to the selection rather than to a click. It is visible exactly while
 * `rect` is non-null, and the editor decides that.
 *
 * Generic over objects on purpose — a table, an image and an embed are all
 * objects, and this takes a rect and a slot without knowing which.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import { anchorPosition, type AnchorSide } from '../core/anchor';

const props = withDefaults(defineProps<{
  /**
   * The object's rect in VIEWPORT coordinates. An editor whose surface is an
   * iframe must add the frame's own offset before passing it — done there, where
   * the frame is, rather than reached for from here.
   */
  rect?: DOMRect | null;
  /**
   * A GETTER for the rect, re-read on every placement.
   *
   * `rect` alone is a snapshot taken when the selection changed, so re-placing
   * on scroll put the bar back exactly where it already was — the object had
   * moved and its recorded rect had not. Anything that scrolls must therefore
   * re-measure, not just re-place.
   */
  measure?: (() => DOMRect | null) | null;
  /**
   * The box the bar must stay inside — the editor's own, normally.
   *
   * Without it the bar is clamped to the WINDOW, which is not the
   * constraint that matters: under a tall picture in a dialog it sat
   * below the dialog, on screen and plainly detached from the thing it
   * was acting on. A getter rather than a rect, for the same reason
   * `measure` is one: the dialog scrolls.
   */
  bounds?: (() => DOMRect | null) | null;
  /** What is selected, for the label and for the caller's own switching. */
  kind?: string;
  side?: AnchorSide;
  gap?: number;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { rect: null, measure: null, kind: 'object', side: 'bottom', gap: 10 });

const bar = ref<HTMLElement | null>(null);
const pos = ref({ x: 0, y: 0 });
const placed = ref<AnchorSide>('bottom');
const ready = ref(false);

const style = computed(() => ({
  position: 'fixed' as const,
  insetInlineStart: `${pos.value.x}px`,
  insetBlockStart: `${pos.value.y}px`,
  /* Hidden rather than unmounted for the first frame: the bar has to be measured
     before it can be placed, and measuring an unmounted element gives zero. */
  visibility: ready.value ? ('visible' as const) : ('hidden' as const),
}));

/** The part of the object that is actually on screen. */
function visiblePart(rect: DOMRect): DOMRect {
  const top = Math.max(rect.top, 0);
  const bottom = Math.min(rect.bottom, window.innerHeight);

  return new DOMRect(rect.x, top, rect.width, Math.max(bottom - top, 0));
}

function place() {
  const live = props.measure ? props.measure() : props.rect;
  if (!live || !bar.value) { ready.value = false; return; }
  const own = bar.value.getBoundingClientRect();

  /**
   * Anchored to the VISIBLE part of the object, then clamped.
   *
   * A picture can be taller than the window. Anchoring to its true
   * rect put the bar under its bottom edge - correct, and off the
   * bottom of the screen, where it could not be read or pressed. It
   * was reported as tools that "do not show", and it stopped a
   * Playwright probe from clicking them, which is as good a
   * demonstration as any that a person could not either.
   */
  const p = anchorPosition(visiblePart(live), { width: own.width, height: own.height },
    { side: props.side, align: 'center', gap: props.gap });

  /* Inside the editor AND inside the window: the first keeps the bar
     attached to its subject, the second is the floor under everything. */
  const box = props.bounds?.() ?? null;
  const margin = 8;
  const minX = Math.max(margin, box ? box.left + margin : margin);
  const maxX = Math.min(window.innerWidth - own.width - margin,
    box ? box.right - own.width - margin : Number.POSITIVE_INFINITY);
  const minY = Math.max(margin, box ? box.top + margin : margin);
  const maxY = Math.min(window.innerHeight - own.height - margin,
    box ? box.bottom - own.height - margin : Number.POSITIVE_INFINITY);

  pos.value = {
    x: Math.min(Math.max(p.x, minX), Math.max(minX, maxX)),
    y: Math.min(Math.max(p.y, minY), Math.max(minY, maxY)),
  };
  placed.value = p.side;
  ready.value = true;
}

watch(() => props.rect, () => { ready.value = false; nextTick(place); }, { deep: true });

onMounted(() => {
  /* Capture phase, so a scroll inside any ancestor repositions the bar and not
     only a scroll of the window. */
  window.addEventListener('scroll', place, true);
  window.addEventListener('resize', place);
  nextTick(place);
});
onUnmounted(() => {
  window.removeEventListener('scroll', place, true);
  window.removeEventListener('resize', place);
});

/**
 * Keep the editor's selection when the bar is pressed - except on a
 * FIELD.
 *
 * This was a blanket `@pointerdown.prevent`, for a good reason: a press
 * on the bar would otherwise move focus out of the editor, drop the
 * selection, and the bar would vanish along with the thing it was
 * acting on. The cost was invisible until the bar grew an input.
 * Preventing the default on a pointerdown is what stops focus moving,
 * so the caret could never enter the alternative-description box: every
 * BUTTON worked and the one field could not be typed into. Reported
 * twice, and the same shape as the image's own `preventDefault`, which
 * blocked dragging at N/027.
 *
 * A press on a field is therefore allowed through - the field takes
 * focus, and the editor's selection survives because ProseMirror keeps
 * it while the view is blurred.
 */
function keepSelection(event: PointerEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

  event.preventDefault();
}
</script>

<template>
  <Teleport to="body">
    <div v-if="rect" ref="bar" class="apex-objbar" :class="ui?.objectBar" :style="style" :data-side="placed"
         :data-kind="kind" role="group" :aria-label="`${kind} tools`"
         @pointerdown="keepSelection">
      <slot />
    </div>
  </Teleport>
</template>
