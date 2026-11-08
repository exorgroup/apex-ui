<template>
  <div class="data-stage">
    <ApexScheduler
      v-bind="bind"
      :resources="SCHED_ROOMS"
      :events="events"
      :group-fields="SCHED_GROUP_FIELDS"
      :group-keys="groupKeys"
      :resource-sub="resourceSub"
      @update:group-keys="groupKeys = $event"
      @event-save="onSave"
      @event-move="onMove"
      @event-resize="onResize"
      @event-delete="onDelete"
      @event-click="log = 'clicked ' + $event.instance.title"
      @create-request="log = 'create requested in ' + $event.resourceId"
    />
    <p class="cfm-log">{{ log || 'Right-click a row to add, drag a one-off booking to move it.' }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for ApexScheduler.
 *
 * It owns the events, because the scheduler reports and the host applies:
 * every move, resize, save and delete comes back as a payload and nothing
 * changes until this applies it. A stage that ignored them would make the
 * control look broken on the first drag.
 *
 * Its own copy of the seed, for the reason BoardStage gives — the page
 * examples read from the same generator.
 */
import { ref } from 'vue';
import { SCHED_ROOMS, SCHED_GROUP_FIELDS, seedEvents } from '../schedulerData';

defineProps<{ bind?: Record<string, unknown> }>();

type Ev = Record<string, unknown> & { id: string };
const events = ref<Ev[]>(seedEvents());
const groupKeys = ref<string[]>(['country', 'building', 'level']);
const log = ref('');

/** The row's second line — the scheduler asks, the host decides what it says. */
const resourceSub = (r: Record<string, unknown>) => `${r.building} · cap ${r.cap}`;

/* A scoped edit can split one record into two: the payload carries `update`
   for the record that changed and `create` for the series that was split off. */
function apply(p: { id: string; update?: Record<string, unknown>; create?: Record<string, unknown> }) {
  if (p.update) events.value = events.value.map((e) => (e.id === p.id ? { ...e, ...p.update } as Ev : e));
  if (p.create) events.value = events.value.concat([p.create as Ev]);
}

function onSave(p: { id?: string; record?: Record<string, unknown> }) {
  if (p.id && p.record) {
    events.value = events.value.map((e) => (e.id === p.id ? { ...e, ...p.record } as Ev : e));
    log.value = 'saved ' + p.id;
  } else if (p.record) {
    events.value = events.value.concat([p.record as Ev]);
    log.value = 'created ' + (p.record as Ev).id;
  }
}
function onMove(p: { id: string; update?: Record<string, unknown>; create?: Record<string, unknown> }) {
  apply(p);
  log.value = (p.create ? 'move · split into 2 records · ' : 'move · ') + p.id;
}
function onResize(p: { id: string; update?: Record<string, unknown>; create?: Record<string, unknown> }) {
  apply(p);
  log.value = 'resize · ' + p.id;
}
function onDelete(p: { id: string }) {
  events.value = events.value.filter((e) => e.id !== p.id);
  log.value = 'deleted ' + p.id;
}
</script>
