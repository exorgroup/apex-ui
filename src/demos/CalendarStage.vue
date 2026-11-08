<template>
  <div class="data-stage">
    <ApexCalendar
      v-bind="bind"
      :events="events"
      :background-events="CAL_BG"
      :types="CAL_TYPES"
      @event-click="note('event-click', $event.event.title)"
      @date-click="note('date-click', $event.key)"
      @slot-click="note('slot-click', new Date($event.start).toString().slice(0, 24))"
      @more-click="note('more-click', $event.events.length + ' hidden on ' + $event.key)"
      @event-move="edit('move', $event)"
      @event-resize="edit('resize', $event)"
      @event-save="onSave"
      @event-delete="onDelete"
    />
    <p class="cfm-log">{{ log || 'Click a day, an event, empty time-grid space, or a “+N more”.' }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for ApexCalendar.
 *
 * Same contract as the scheduler: the calendar reports, the host applies. A
 * recurring event edited "this and following" comes back as an `update` plus a
 * `create` — two records, because the series was split — so both have to be
 * applied or the second half disappears.
 */
import { ref } from 'vue';
import { CAL_EVENTS, CAL_BG, CAL_TYPES } from '../calendarData';

defineProps<{ bind?: Record<string, unknown> }>();

type Ev = Record<string, unknown> & { id: string };
const events = ref<Ev[]>([...CAL_EVENTS] as Ev[]);
const log = ref('');

const note = (kind: string, text: unknown) => { log.value = kind + ' · ' + text; };

function edit(kind: string, p: { update?: Ev; create?: Ev }) {
  if (p.update) events.value = events.value.map((e) => (e.id === p.update!.id ? p.update! : e));
  if (p.create) events.value = events.value.concat([p.create]);
  note(kind, p.update?.id ?? '');
}
function onSave(p: { record?: Ev; update?: Ev }) {
  if (p.record) events.value = events.value.concat([p.record]);
  if (p.update) events.value = events.value.map((e) => (e.id === p.update!.id ? p.update! : e));
  note('event-save', (p.record ?? p.update)?.id ?? '');
}
function onDelete(p: { id: string; remove?: boolean; update?: Ev }) {
  if (p.remove) events.value = events.value.filter((e) => e.id !== p.id);
  if (p.update) events.value = events.value.map((e) => (e.id === p.id ? p.update! : e));
  note('event-delete', p.id);
}
</script>
