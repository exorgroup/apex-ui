<script setup lang="ts">
/**
 * ApexEditorSlash — the slash menu's list.
 *
 * The plugin decides when it is open and what the query is; this renders it and
 * owns the highlight. Kept apart because the trigger is a document concern and
 * the list is a presentation one — and because the plugin has to exist before
 * the view, while this cannot.
 */
import { computed, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';
import { DEFAULT_SLASH_ITEMS, filterSlashItems, type SlashItem, type SlashState } from '../core/editor/slash';

const props = withDefaults(defineProps<{
  state?: SlashState | null;
  items?: SlashItem[];
  /** Where the trigger sits, in the writing area's coordinates. */
  coords?: { x: number; y: number } | null;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), {});

const emit = defineEmits<{
  (e: 'choose', payload: { item: SlashItem; state: SlashState }): void;
  (e: 'close'): void;
}>();

const index = ref(0);
const filtered = computed(() => filterSlashItems(props.items || DEFAULT_SLASH_ITEMS, props.state?.query || ''));

/* The highlight resets whenever the query changes, because the list under it has
   changed — keeping the index would leave it pointing at a different command. */
watch(() => props.state?.query, () => { index.value = 0; });

/** Grouped for display only; the flat list is what the keyboard walks. */
const groups = computed(() => {
  const out: { name: string; items: { item: SlashItem; flat: number }[] }[] = [];
  filtered.value.forEach((item, flat) => {
    const name = item.group || '';
    let group = out.find((g) => g.name === name);
    if (!group) { group = { name, items: [] }; out.push(group); }
    group.items.push({ item, flat });
  });
  return out;
});

function move(delta: number) {
  const n = filtered.value.length;
  if (!n) return;
  /* Wraps, so holding down the arrow key cannot dead-end at either edge. */
  index.value = (index.value + delta + n) % n;
}
function choose(item?: SlashItem) {
  const picked = item || filtered.value[index.value];
  if (!picked || !props.state) return;
  emit('choose', { item: picked, state: props.state });
}

/** Handles a key the plugin handed over; returns whether it was used. */
function handleKey(key: string): boolean {
  if (key === 'ArrowDown') { move(1); return true; }
  if (key === 'ArrowUp') { move(-1); return true; }
  if (key === 'Enter' || key === 'Tab') { choose(); return true; }
  if (key === 'Escape') { emit('close'); return true; }
  return false;
}

const style = computed(() => ({
  insetInlineStart: `${props.coords?.x ?? 0}px`,
  insetBlockStart: `${props.coords?.y ?? 0}px`,
}));

defineExpose({ handleKey, hasItems: () => filtered.value.length > 0 });
</script>

<template>
  <div v-if="state?.active && filtered.length" class="apex-edslash" :class="ui?.slash" :style="style"
       role="listbox" aria-label="Insert block">
    <div v-for="group in groups" :key="group.name" class="apex-edslash__group" :class="ui?.slashGroup">
      <p v-if="group.name" class="apex-edslash__label" :class="ui?.slashLabel">{{ group.name }}</p>
      <button v-for="entry in group.items" :key="entry.item.command" type="button"
              class="apex-edslash__item" :class="ui?.slashItem" role="option"
              :aria-selected="entry.flat === index"
              :data-on="entry.flat === index ? 'true' : 'false'"
              @pointerenter="index = entry.flat"
              @pointerdown.prevent="choose(entry.item)">
        <slot name="item" :item="entry.item" :selected="entry.flat === index"
              :group="group.name" :index="entry.flat">
          <ApexIcon v-if="entry.item.icon" :name="entry.item.icon" :size="17" />
          <span>{{ entry.item.label }}</span>
        </slot>
      </button>
    </div>
  </div>
  <!-- No "no results" panel: an empty menu closes, because a reader typing past
       the last match is writing prose, not searching. -->
</template>
