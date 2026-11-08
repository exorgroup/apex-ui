<template>
  <h2>Basic</h2>
  <p style="font-size:13.5px">Events are arbitrary objects; the <code>content</code> slot decides how each one reads.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexTimeline :value="SHIPMENT">
      <template #content="{ item }"><strong style="font-size:13.5px">{{ item.status }}</strong></template>
    </ApexTimeline>
  </div>

  <h2>Alignment and the opposite side</h2>
  <div class="grid grid--2" style="margin-top:12px">
    <div v-for="a in ['start','end','alternate']" :key="a" class="cell">
      <span class="cell__tag">align="{{ a }}"</span>
      <ApexTimeline :value="SHIPMENT.slice(0,4)" :align="a" icon-field="icon" color-field="color"
                     :marker-size="18">
        <template #content="{ item }"><strong style="font-size:13px">{{ item.status }}</strong></template>
        <template #opposite="{ item }"><span class="tl-when"><strong>{{ item.date }}</strong><em>{{ item.time }}</em></span></template>
      </ApexTimeline>
    </div>
    <div class="cell">
      <span class="cell__tag">no opposite slot — content only</span>
      <ApexTimeline :value="SHIPMENT.slice(0,4)" align="alternate" icon-field="icon" color-field="color" :marker-size="18">
        <template #content="{ item }"><strong style="font-size:13px">{{ item.status }}</strong></template>
      </ApexTimeline>
    </div>
  </div>

  <h2>Horizontal</h2>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexTimeline :value="SHIPMENT" layout="horizontal" icon-field="icon" color-field="color" :marker-size="20">
      <template #content="{ item }"><strong style="font-size:12.5px">{{ item.status }}</strong></template>
      <template #opposite="{ item }">{{ item.time }}</template>
    </ApexTimeline>
  </div>

  <h2>Line and marker customisation</h2>
  <p style="font-size:13.5px">Thickness, style and colour of the line; size, shape, fill and ring of the markers; and the two spacing values.</p>
  <div class="grid grid--2" style="margin-top:12px">
    <div class="cell">
      <span class="cell__tag">:line-width="4" line-style="dashed" line-color="#C24A06" :marker-size="10"</span>
      <ApexTimeline :value="SHIPMENT.slice(0,4)" :line-width="4" line-style="dashed" line-color="#C24A06"
                     :marker-size="10" marker-border-color="#C24A06" marker-color="#C24A06">
        <template #content="{ item }"><strong style="font-size:13px">{{ item.status }}</strong></template>
      </ApexTimeline>
    </div>
    <div class="cell">
      <span class="cell__tag">marker-radius="4px" — squares, thicker ring, dotted line</span>
      <ApexTimeline :value="SHIPMENT.slice(0,4)" line-style="dotted" :line-width="2" :marker-size="16"
                     marker-radius="4px" :marker-border-width="3" marker-border-color="#0F141C" gap="24px" event-gap="14px">
        <template #content="{ item }"><strong style="font-size:13px">{{ item.status }}</strong></template>
      </ApexTimeline>
    </div>
  </div>

  <h2>Rich events</h2>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexTimeline :value="SHIPMENT" align="start" icon-field="icon" color-field="color"
                   :marker-size="30" :marker-border-width="0" gap="20px" event-gap="16px">
      <template #opposite="{ item }"><span class="tl-when"><strong>{{ item.date }}</strong><em>{{ item.time }}</em></span></template>
      <template #content="{ item }">
        <div class="tl-card">
          <strong>{{ item.status }}</strong>
          <span>{{ item.note }}</span>
        </div>
      </template>
    </ApexTimeline>
  </div>

  <h2>Interactive — with a progress bar</h2>
  <p style="font-size:13.5px">The marker slot can hold anything, including a control. Click a step to complete it.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <div class="tl-head">
      <div>
        <h4 style="margin:0 0 4px;font-size:15px">Onboarding progress</h4>
        <p style="margin:0;font-size:12.5px;color:var(--fg-subtle)">{{ doneCount }} of {{ onboarding.length }} steps completed</p>
      </div>
      <ApexButton severity="secondary" variant="outlined" size="sm" icon="refresh" @click="resetSteps">Reset</ApexButton>
    </div>
    <ApexProgressBar :value="doneCount" :max="onboarding.length" severity="success" :height="8" style="margin:14px 0 20px" />
    <ApexTimeline :value="onboarding" :marker-size="30" :marker-border-width="0" gap="18px" event-gap="12px"
                   line-color="#D5DCE5">
      <template #marker="{ item, index }">
        <button type="button" class="tl-step" :data-done="item.done" :aria-pressed="item.done"
                :aria-label="item.label" @click="toggleStep(index)">
          <ApexIcon :name="item.done ? 'check' : item.icon" :size="17" />
        </button>
      </template>
      <template #content="{ item }">
        <div class="tl-stepbody" :data-done="item.done">
          <strong>{{ item.label }}</strong>
          <em v-if="!item.done">Click the marker to complete</em>
        </div>
      </template>
    </ApexTimeline>
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexTimeline.
 *
 * Ported from the gallery's own section block (APEX UI Gallery.html), which is
 * what the gallery actually runs. Its state lived on one enormous Options-API
 * instance shared by every control; here each control's examples own theirs,
 * which is the point of the split — App.vue was already 10,500 lines before
 * the nine data controls had a single section between them.
 */
import { computed, ref } from 'vue';
import { SHIPMENT } from '../../registry';

/** The interactive example: a checklist the reader can tick through. */
const onboarding = ref([
  { label: 'Account created', icon: 'person_add', done: true },
  { label: 'Email verified', icon: 'mark_email_read', done: false },
  { label: 'Profile completed', icon: 'badge', done: false },
  { label: 'First display paired', icon: 'tv', done: false },
  { label: 'Playlist published', icon: 'playlist_play', done: false },
]);
const doneCount = computed(() => onboarding.value.filter((s) => s.done).length);

/* Replaced rather than mutated in place: the timeline reads the array as a
   prop, and swapping the element is what tells it the row changed. */
function toggleStep(i: number) {
  const next = onboarding.value.slice();
  next[i] = { ...next[i], done: !next[i].done };
  onboarding.value = next;
}

function resetSteps() {
  onboarding.value = onboarding.value.map((s, i) => ({ ...s, done: i === 0 }));
}
</script>
