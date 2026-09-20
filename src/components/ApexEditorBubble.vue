<script setup lang="ts">
/**
 * ApexEditorBubble — the toolbar that appears over a selection.
 *
 * Positioned from the selection's own rectangle rather than the pointer: the
 * selection can be made by keyboard, and a menu that only knew where the mouse
 * was would appear in the wrong place or not at all.
 *
 * It renders the same declaration the fixed toolbar does, so a button cannot
 * exist in one surface and be missing from the other.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexEditorToolbar, { type ToolbarItem } from './ApexEditorToolbar.vue';

const props = withDefaults(defineProps<{
  /** The live editor view, from the editor's `view()`. */
  view?: unknown;
  active?: { marks: Record<string, boolean>; blockType: string; blockAttrs: Record<string, unknown>; blockMixed?: boolean } | null;
  can?: Record<string, boolean>;
  run?: (name: string) => boolean;
  items?: (ToolbarItem | string)[];
  /** Show it for a caret too, not only a range. Off, because a menu that follows
   *  the caret while typing is in the way of the writing. */
  onCaret?: boolean;
  offset?: number;
  disabled?: boolean;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { offset: 10 });

const DEFAULT_ITEMS: (ToolbarItem | string)[] = [
  { command: 'strong', icon: 'format_bold', label: 'Bold', keys: 'Mod-B', activeMark: 'strong' },
  { command: 'em', icon: 'format_italic', label: 'Italic', keys: 'Mod-I', activeMark: 'em' },
  { command: 'underline', icon: 'format_underlined', label: 'Underline', keys: 'Mod-U', activeMark: 'underline' },
  { command: 'strike', icon: 'format_strikethrough', label: 'Strikethrough', activeMark: 'strike' },
  { command: 'code', icon: 'code', label: 'Code', activeMark: 'code' },
  'separator',
  { type: 'custom', slot: 'link', label: 'Link' },
  { command: 'highlight', icon: 'format_ink_highlighter', label: 'Highlight', activeMark: 'highlight' },
];

const open = ref(false);
const pos = ref({ x: 0, y: 0, flip: false });
const el = ref<HTMLElement | null>(null);

interface ViewLike {
  state: { selection: { empty: boolean; from: number; to: number } };
  coordsAtPos: (pos: number) => { left: number; right: number; top: number; bottom: number };
  dom: HTMLElement;
  hasFocus: () => boolean;
}

function place() {
  const view = props.view as ViewLike | undefined;
  if (!view || props.disabled) { open.value = false; return; }
  const sel = view.state.selection;
  if (sel.empty && !props.onCaret) { open.value = false; return; }
  if (!view.hasFocus()) { open.value = false; return; }

  /* Both ends, because a selection spanning lines has a start and an end on
     different rows and the midpoint of the two is where a reader looks. */
  const start = view.coordsAtPos(sel.from);
  const end = view.coordsAtPos(sel.to);
  const host = view.dom.getBoundingClientRect();
  const left = (Math.min(start.left, end.left) + Math.max(start.right, end.right)) / 2;
  const top = Math.min(start.top, end.top);
  const bottom = Math.max(start.bottom, end.bottom);

  const height = el.value?.offsetHeight || 38;
  /* Above the selection, unless there is no room — then below, so the menu never
     sits off the top of the scroll container. */
  const flip = top - host.top < height + props.offset;
  pos.value = {
    x: left - host.left,
    y: flip ? bottom - host.top + props.offset : top - host.top - props.offset,
    flip,
  };
  open.value = true;
}

/* The selection changes without any DOM event of its own, so the trigger is the
   editor's own reporting — `active` changes on every transaction. */
watch(() => [props.active, props.view], place, { deep: true, flush: 'post' });

function onScroll() { if (open.value) place(); }
watch(open, (v) => {
  if (typeof window === 'undefined') return;
  if (v) {
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
  } else {
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', onScroll);
  }
});
onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('scroll', onScroll, true);
  window.removeEventListener('resize', onScroll);
});

const style = computed(() => ({
  insetInlineStart: `${pos.value.x}px`,
  insetBlockStart: `${pos.value.y}px`,
  transform: pos.value.flip ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
}));
</script>

<template>
  <Transition name="apex-edbub">
    <div v-if="open" ref="el" class="apex-edbub" :class="ui?.bubble" :style="style" :data-flip="pos.flip ? 'true' : 'false'"
         @pointerdown.prevent>
      <ApexEditorToolbar :items="items || DEFAULT_ITEMS" :active="active" :can="can" :run="run" size="sm">
        <template #link="scope"><slot name="link" v-bind="scope" /></template>
      </ApexEditorToolbar>
    </div>
  </Transition>
</template>
