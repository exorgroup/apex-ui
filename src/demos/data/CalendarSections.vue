<template>
  <h2>Multi-day bars, and what a busy day admits</h2>
  <p style="font-size:13.5px">A multi-day event becomes <em>one bar per week row</em>, open-ended where it continues past the edge. Cells, day numbers, bars and the “+N more” row are four grids sharing one column track, so a Thursday–Sunday bar <em>is</em> four cells wide at any width — no pixel arithmetic to keep in step. Past <code>maxEventsPerDay</code> the cell reports what it is not showing and hands back the events themselves, because a calendar that silently drops a booking is worse than one that admits it is full.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :background-events="CAL_BG" :types="CAL_TYPES"
                   view="month" :views="[]" locale="en-GB" time-zone="Europe/Malta"
                   :max-events-per-day="2" show-week-numbers editable height="480px"
                   @more-click="calNote('more-click', $event.events.length + ' hidden')"
                   @event-move="calEdit('move', $event)"
                   @event-resize="calEdit('resize', $event)"></ApexCalendar>
  </div>

  <h2>The time grid reads the wall clock</h2>
  <p style="font-size:13.5px">Overlapping bookings <em>divide</em> the column — collision clusters, a column each within a cluster — so a chain of overlaps agrees about every width. Stacking them would hide a double booking, which is the one thing a scheduler must not do. Heights come from wall-clock minutes against a fixed axis, so 09:30 lands in the same place on the 23-hour day as on any other; the empty band where 02:00–03:00 did not happen is what the clock actually did.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :background-events="CAL_BG" :types="CAL_TYPES"
                   view="week" :views="[]" locale="en-GB" time-zone="Europe/Malta"
                   :slot-min-time="420" :slot-max-time="1320" :slot-height="22" editable height="520px"
                   @slot-click="calNote('slot-click', new Date($event.start).toString().slice(0, 24))"
                   @event-move="calEdit('move', $event)"
                   @event-resize="calEdit('resize', $event)"></ApexCalendar>
  </div>
  <p style="font-size:13px;margin-top:8px">{{ calLog || 'Click empty space — the slot under the pointer is reported, snapped down.' }}</p>

  <h2>Editing a series is three operations, not one</h2>
  <p style="font-size:13.5px">Click empty space to create, an event to edit, and drag either to move it; drag its trailing edge to change its length. Both are editable above — the month bars by day, the time-grid blocks by slot. Dragging a <em>recurring</em> occurrence stops and asks which occurrences the change applies to, with the preview left on screen while you decide: “this event” writes an override keyed by the occurrence's original start, “this and following” closes the original series the day before and returns a <em>second</em> record, and “all” patches the series in place. The component computes both records and emits them; persisting is the app's, but the split arithmetic is not.</p>
  <p style="font-size:13px;margin-top:8px">Last payload: <code>{{ calLog || 'none yet' }}</code></p>

  <h2>A host template, rendered as given</h2>
  <p style="font-size:13.5px">The <code>#event</code> slot replaces an event's contents in every view. What it does <em>not</em> replace is geometry: position, size, the tone and compact flags, the tooltip and the pointer handlers stay on the wrapper, so drag, resize, the recurring-scope prompt and the constraint stripes keep working inside a custom template with the host doing nothing. Overlap columns and DST are still ours to get right. <code>--tone-ink</code> is in scope, so the accent below is the design system's colour rather than a hardcoded hex — and <code>view</code> is bound because one template serves month, week, day and year.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="week" :views="['week','month']"
                   locale="en-GB" time-zone="Europe/Malta" :slot-min-time="480" :slot-max-time="1200"
                   :slot-height="24" editable :inline-editor="false" height="420px"
                   @event-move="calEdit('move', $event)">
      <template #event="{ event, compact, tone, time, view, clipped }">
        <div class="galtpl" :data-tone="tone" :data-compact="compact">
          <span class="galtpl__bar"></span>
          <span class="galtpl__body">
            <b v-if="!compact">{{ time }}</b>
            <span class="galtpl__title">{{ event.title }}</span>
            <i v-if="clipped.start || clipped.end" class="galtpl__cont">continues</i>
          </span>
          <span class="galtpl__view">{{ view }}</span>
        </div>
      </template>
    </ApexCalendar>
  </div>
  <p style="font-size:13px;margin-top:8px">{{ calLog || 'Drag one — the gesture belongs to the wrapper, not the template.' }}</p>

  <h2>Paint is a prop; structure is a slot</h2>
  <p style="font-size:13.5px">The same two lines, painted three ways. This exists so that “we want the softer look” never requires a template — a hand-written one would have to re-implement the compact rule, the recurring icon, the dashed edges on a clipped event and the striped invalid state, and would get two of them wrong. On a multi-day bar the accent marks a <em>start</em>, so a segment continuing in from the previous row keeps its flat edge.</p>
  <div class="grid grid--3" style="margin-top:12px">
    <div class="cell"><span class="cell__tag">solid</span>
      <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="week" :views="[]"
                     locale="en-GB" time-zone="Europe/Malta" event-variant="solid"
                     :slot-min-time="540" :slot-max-time="1020" :slot-height="20"
                     :show-toolbar="false" height="300px"></ApexCalendar>
    </div>
    <div class="cell"><span class="cell__tag">soft</span>
      <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="week" :views="[]"
                     locale="en-GB" time-zone="Europe/Malta" event-variant="soft"
                     :slot-min-time="540" :slot-max-time="1020" :slot-height="20"
                     :show-toolbar="false" height="300px"></ApexCalendar>
    </div>
    <div class="cell"><span class="cell__tag">outline</span>
      <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="week" :views="[]"
                     locale="en-GB" time-zone="Europe/Malta" event-variant="outline"
                     :slot-min-time="540" :slot-max-time="1020" :slot-height="20"
                     :show-toolbar="false" height="300px"></ApexCalendar>
    </div>
  </div>

  <h2>A tint and a rule are different things</h2>
  <p style="font-size:13.5px">So they are two props. <code>backgroundEvents</code> draws a region; <code>constraints</code> decides what is permitted. An app usually wants one without the other — a tinted “school holidays” band that is still bookable, or an invisible rule with no band at all — and pass the same object to both when you want a visible rule. Below, opening hours are an <em>allow</em> window and the closed week is a <em>deny</em>; the closure is also a background event, so it is both. Drag a booking outside 08:00–20:00: the preview goes striped <em>while you are still holding it</em>, and the drop reverts with the constraint's own message rather than in silence.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :background-events="CAL_BG" :types="CAL_TYPES"
                   :constraints="CAL_RULES" view="week" :views="[]" locale="en-GB"
                   time-zone="Europe/Malta" :slot-min-time="360" :slot-max-time="1380"
                   :slot-height="22" editable :inline-editor="false" height="480px"
                   @event-move="calEdit('move', $event)" @event-resize="calEdit('resize', $event)"
                   @edit-refused="calNote('edit-refused', $event.reason)"></ApexCalendar>
  </div>
  <p style="font-size:13px;margin-top:8px">{{ calLog || 'Drag a booking before 08:00 or after 20:00.' }}</p>

  <h2>Resources as columns — the scheduler, transposed</h2>
  <p style="font-size:13.5px">The same day, split by room. Overlap columns are computed <em>within</em> a resource, because two bookings in different rooms do not share a width; the all-day strip becomes a stack per room, since inside one day there is nothing for a bar to span. Dragging a block across columns reassigns it — “move this to Studio A” is one gesture. If you want resources down the side with time running across, that is <code>ApexScheduler</code>, not this.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" :resources="CAL_ROOMS"
                   view="day" :views="[]" locale="en-GB" time-zone="Europe/Malta"
                   :slot-min-time="480" :slot-max-time="1200" :slot-height="26" editable
                   height="440px" @event-move="calEdit('move', $event)"
                   @event-save="calSave($event)" @event-delete="calDelete($event)"></ApexCalendar>
  </div>
  <p style="font-size:13px;margin-top:8px">{{ calLog || 'Drag a booking into another room.' }}</p>

  <h2>The agenda answers “what is happening today”</h2>
  <p style="font-size:13.5px">So a multi-day event appears under <em>every</em> day it covers: listing a week-long conference once, under its Monday, hides it from someone reading Thursday. Days with nothing are omitted — an agenda of empty headings is noise.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="list" :views="[]"
                   locale="en-GB" time-zone="Europe/Malta" :list-days="7" height="420px"></ApexCalendar>
  </div>

  <h2>A year, three ways</h2>
  <p style="font-size:13.5px">The year view is the month view at a smaller scale — the same segment packer, the same bar markup, only the metrics change. That is the point: a second implementation of bars-in-a-row would drift on exactly the “+N more” arithmetic and lane order it exists to get right. <code>grid</code> wraps the twelve months responsively and shows one lane per day, because a 230px month has room for one; <code>stack</code> gives each month a full row; <code>continuous</code> runs them together with no gaps.</p>
  <div style="margin-top:12px">
    <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="year" :views="[]"
                   locale="en-GB" time-zone="Europe/Malta" year-layout="grid" height="560px"
                   @more-click="calNote('more-click', $event.events.length + ' on ' + $event.key)"></ApexCalendar>
  </div>

  <h2>Zones and locales are the same question twice</h2>
  <p style="font-size:13.5px">“Which day is this?” has no answer without a zone: the same instant is one date in Malta and the next in Auckland. And an all-day event is a <em>date</em>, so it is never zone-shifted — the 5th is the 5th everywhere. The locale supplies names, the clock, digits, the first day of the week, the week-number scheme and the direction; Arabic gets <code>dir="rtl"</code>, Arabic-Indic numerals and a Saturday-first header from the pack alone.</p>
  <div class="grid grid--2" style="margin-top:12px">
    <div class="cell"><span class="cell__tag">Europe/Malta · de-DE</span>
      <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="list" :views="[]"
                     locale="de-DE" time-zone="Europe/Malta" :list-days="3" height="300px"></ApexCalendar>
    </div>
    <div class="cell"><span class="cell__tag">Pacific/Auckland · ar-EG</span>
      <ApexCalendar :events="CAL_EVENTS" :types="CAL_TYPES" view="list" :views="[]"
                     locale="ar-EG" time-zone="Pacific/Auckland" :list-days="3" height="300px"></ApexCalendar>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexCalendar — ten of them, one per idea.
 *
 * Ported from the gallery's own section block. Each example owns its events,
 * because the calendar reports and the host applies: a scoped edit comes back
 * as an `update` plus, when a series splits, a `create`. Apply both or the
 * second half of the series disappears.
 */
import { ref } from 'vue';
import { CAL_EVENTS, CAL_BG, CAL_TYPES, CAL_RULES, CAL_ROOMS } from '../../calendarData';

type Ev = Record<string, unknown> & { id: string };

const events = ref<Ev[]>([...CAL_EVENTS] as Ev[]);
const calLog = ref('');

const calNote = (kind: string, text: unknown) => { calLog.value = kind + ' · ' + text; };

function calEdit(kind: string, p: { update?: Ev; create?: Ev }) {
  if (p.update) events.value = events.value.map((e) => (e.id === p.update!.id ? p.update! : e));
  if (p.create) events.value = events.value.concat([p.create]);
  calNote(kind, p.update?.id ?? '');
}
function calSave(p: { record?: Ev; update?: Ev }) {
  if (p.record) events.value = events.value.concat([p.record]);
  if (p.update) events.value = events.value.map((e) => (e.id === p.update!.id ? p.update! : e));
  calNote('event-save', (p.record ?? p.update)?.id ?? '');
}
function calDelete(p: { id: string; remove?: boolean; update?: Ev }) {
  if (p.remove) events.value = events.value.filter((e) => e.id !== p.id);
  if (p.update) events.value = events.value.map((e) => (e.id === p.id ? p.update! : e));
  calNote('event-delete', p.id);
}
</script>
