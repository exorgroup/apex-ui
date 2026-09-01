<script setup lang="ts">
/**
 * ApexTaskCard — the default card, driven by a field mapping rather than a fixed
 * item shape, so any dataset renders without a custom card and an absent field
 * simply does not appear.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexAvatar from './ApexAvatar.vue';
import { DEFAULT_CARD_FIELDS, type TaskBoardItem, type TaskCardFields } from '../core/taskboard';

const props = withDefaults(defineProps<{
  item: TaskBoardItem;
  fields?: TaskCardFields;
  selected?: boolean;
  dragging?: boolean;
}>(), {});

const f = computed(() => ({ ...DEFAULT_CARD_FIELDS, ...(props.fields || {}) }));
const val = (key?: string) => (key ? props.item[key] : undefined);

const labels = computed(() => (val(f.value.labels) as string[] | undefined) || []);
const assignees = computed(() => {
  const a = val(f.value.assignees);
  if (!a) return [];
  return (Array.isArray(a) ? a : [a]) as (string | { name?: string; image?: string })[];
});
const checklist = computed(() => val(f.value.checklist) as { done: number; total: number } | undefined);
const priority = computed(() => val(f.value.priority) as string | undefined);
const due = computed(() => val(f.value.due) as string | undefined);
const hasDescription = computed(() => !!val(f.value.description));
const metaChips = computed(() => (f.value.meta || [])
  .map((m) => ({ ...m, value: props.item[m.key] }))
  .filter((m) => m.value !== undefined && m.value !== null && m.value !== ''));
const name = (a: string | { name?: string }) => (typeof a === 'string' ? a : a.name || '');
const image = (a: string | { image?: string }) => (typeof a === 'string' ? undefined : a.image);
</script>

<template>
  <div class="apex-kb__body">
    <div v-if="labels.length" class="apex-kb__labels">
      <span v-for="l in labels" :key="l" class="apex-kb__label" :data-label="l">{{ l }}</span>
    </div>
    <p class="apex-kb__title">{{ val(f.title) }}</p>
    <div v-if="priority || checklist || due || hasDescription || metaChips.length || assignees.length"
         class="apex-kb__meta">
      <span v-if="priority" class="apex-kb__prio" :data-prio="String(priority).toLowerCase()">{{ priority }}</span>
      <span v-if="checklist" class="apex-kb__chip">
        <ApexIcon name="check_box" :size="14" />{{ checklist.done }}/{{ checklist.total }}
      </span>
      <span v-if="due" class="apex-kb__chip"><ApexIcon name="event" :size="14" />{{ due }}</span>
      <span v-for="m in metaChips" :key="m.key" class="apex-kb__chip">
        <ApexIcon v-if="m.icon" :name="m.icon" :size="14" />{{ m.label ? m.label + ' ' : '' }}{{ m.value }}
      </span>
      <ApexIcon v-if="hasDescription" name="notes" :size="15" class="apex-kb__note" />
      <span v-if="assignees.length" class="apex-kb__who">
        <ApexAvatar v-for="(a, i) in assignees.slice(0, 3)" :key="i" size="xs" auto-color
                    :label="name(a)" :image="image(a)" ring />
        <span v-if="assignees.length > 3" class="apex-kb__more">+{{ assignees.length - 3 }}</span>
      </span>
    </div>
  </div>
</template>
