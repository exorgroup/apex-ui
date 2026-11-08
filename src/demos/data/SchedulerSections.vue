<template>
  <h2>Two shapes, four granularities</h2>
  <p style="font-size:13.5px">Year and month are <em>discrete</em> — a column is a unit and a booking belongs to one, so it renders as a chip and a cell reads “+2 more” past its limit. Day and 15-min are <em>continuous</em> — a booking's position and width are fractions of the span, and overlapping bookings stack into lanes rather than painting over each other. The axis carries a <code>continuous</code> flag so every consumer branches once instead of re-deriving it from the mode.</p>
  <div class="iconstrip" style="margin-top:12px">
    <ApexSelectButton v-model="schedDocMode" :options="['year','month','day','quarter']" size="sm" :allow-empty="false" />
    <span style="font-size:13px;color:var(--fg-subtle)">{{ schedLog || 'Right-click a row to add; drag a one-off booking to move it.' }}</span>
  </div>
  <div style="margin-top:12px">
    <ApexScheduler :resources="SCHED_ROOMS" :events="schedEvents" :mode="schedDocMode"
                    :group-fields="SCHED_GROUP_FIELDS" :group-keys="['building','level']"
                    :resource-sub="schedSub" leaf-label="Room" height="420px"
                    @event-save="schedSave" @event-move="schedMove" @event-resize="schedResize" @event-delete="schedDelete" />
  </div>

  <h2>Grouping is configuration</h2>
  <p style="font-size:13.5px">Any resource field can be a grouping level, and the bar toggles them in <em>master</em> order rather than click order — a hierarchy decided by the order someone clicked produces a tree nobody asked for. Groups keep the caller's resource order rather than sorting, since floors run bottom to top. Currently nesting: <code>{{ schedKeys.join(' → ') || 'nothing — flat' }}</code>.</p>
  <div style="margin-top:12px">
    <ApexScheduler :resources="SCHED_ROOMS" :events="schedEvents" mode="day"
                    :group-fields="SCHED_GROUP_FIELDS" :group-keys="schedKeys"
                    :resource-sub="schedSub" leaf-label="Room" height="360px"
                    :show-legend="false" @update:group-keys="schedKeys = $event"
                    @event-save="schedSave" @event-move="schedMove" @event-resize="schedResize" @event-delete="schedDelete" />
  </div>

  <h2>Recurrence</h2>
  <p style="font-size:13.5px">A deliberate RRULE subset — <code>FREQ</code>, <code>INTERVAL</code>, <code>BYDAY</code>, <code>COUNT</code>, <code>UNTIL</code> — which covers “every weekday” and “monthly on this date” without a timezone and BYSETPOS library behind it. Occurrences are expanded per visible window, each carrying its own start; the popover states the rule in words.</p>
  <p style="font-size:13.5px">A recurring occurrence <em>is</em> draggable, and used not to be. The refusal was honest while there was no exception model — moving one occurrence would have moved the series — but the shared core now expresses all three operations, so the gesture pauses on the question instead: “this event” writes an override keyed by the occurrence's original start, “this and following” closes the original series and returns a <em>second</em> record, “all” patches the series in place. The same core function and the same prompt as <code>ApexCalendar</code>, because it is one question asked in two places. Dragging the trailing edge resizes instead, with the start untouched.</p>
  <div style="margin-top:12px">
    <ApexScheduler :resources="SCHED_ROOMS" :events="schedRecEvents" mode="day"
                    :group-fields="[]" :resource-sub="schedSub" leaf-label="Room"
                    height="320px" :chips-per-cell="1" :inline-editor="false" editable
                    @event-move="schedMove" @event-resize="schedResize" />
  </div>

  <h2>Host-owned editing</h2>
  <p style="font-size:13.5px">With <code>inlineEditor</code> off, the same gestures report and draw nothing: a click emits <code>event-click</code> with the instance, a right-click emits <code>create-request</code> with the resource and the quarter-hour under the pointer. For an app whose booking form already exists, and whose validation and pricing belong to it rather than to a component.</p>
  <div style="margin-top:12px">
    <ApexScheduler :resources="SCHED_ROOMS.slice(0, 5)" :events="schedHostEvents" mode="day"
                    :group-fields="[]" :inline-editor="false" :resource-sub="schedSub"
                    leaf-label="Room" height="300px" :show-legend="false"
                    @event-click="schedHostLog = 'event-click · ' + $event.instance.title"
                    @create-request="schedHostLog = 'create-request · ' + $event.type + ' in ' + $event.resourceId + ' at ' + fmtTime($event.start)" />
  </div>
  <p style="font-size:13px;margin-top:8px">Last payload: <code>{{ schedHostLog || 'none yet' }}</code></p>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexScheduler.
 *
 * Ported from the gallery's own section block. Each example owns its events:
 * the scheduler reports and the host applies, so an example that shared a
 * model with the stage would have a drag up there rewrite the demo down here.
 */
import { ref } from 'vue';
import { SCHED_ROOMS, SCHED_GROUP_FIELDS, seedEvents } from '../../schedulerData';
/* The gallery reaches the core through a `SchedC` alias on window; here it is
   a named import from the package, which is how a consumer would do it. */
import { fmtTime } from '@exorgroup/apex-ui';

type Ev = Record<string, unknown> & { id: string };

const schedEvents = ref<Ev[]>(seedEvents());
const schedKeys = ref<string[]>(['country', 'building', 'level']);
const schedDocMode = ref('month');
const schedLog = ref('');

/** Only the recurring seeds — the Recurrence section is about those. */
const schedRecEvents = ref<Ev[]>(seedEvents().filter((e) => !!e.rrule));
/** A small slice, so the host-owned-editing example stays readable. */
const schedHostEvents = ref<Ev[]>(seedEvents().slice(0, 40));
const schedHostLog = ref('');

const schedSub = (r: Record<string, unknown>) => `${r.building} · cap ${r.cap}`;

function apply(list: typeof schedHostEvents, p: { id: string; update?: Record<string, unknown>; create?: Record<string, unknown> }) {
  if (p.update) list.value = list.value.map((e) => (e.id === p.id ? { ...e, ...p.update } as Ev : e));
  if (p.create) list.value = list.value.concat([p.create as Ev]);
}

function schedSave(p: { id?: string; record?: Record<string, unknown> }) {
  if (p.id && p.record) {
    schedHostEvents.value = schedHostEvents.value.map((e) => (e.id === p.id ? { ...e, ...p.record } as Ev : e));
    schedHostLog.value = 'saved ' + p.id;
  } else if (p.record) {
    schedHostEvents.value = schedHostEvents.value.concat([p.record as Ev]);
    schedHostLog.value = 'created ' + (p.record as Ev).id;
  }
}
function schedMove(p: { id: string; update?: Record<string, unknown>; create?: Record<string, unknown> }) {
  apply(schedHostEvents, p);
  schedHostLog.value = (p.create ? 'move · split into 2 records · ' : 'move · ') + p.id;
}
function schedResize(p: { id: string; update?: Record<string, unknown>; create?: Record<string, unknown> }) {
  apply(schedHostEvents, p);
  schedHostLog.value = 'resize · ' + p.id;
}
function schedDelete(p: { id: string }) {
  schedHostEvents.value = schedHostEvents.value.filter((e) => e.id !== p.id);
  schedHostLog.value = 'deleted ' + p.id;
}
</script>
