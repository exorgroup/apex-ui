<script setup lang="ts">
/**
 * The playground stage for the nine containers.
 *
 * A container shows nothing on its own — it is a frame around content — so
 * unlike a field control it cannot be rendered from props alone. Each one gets
 * sample content here, in one file, rather than nine blocks in App.vue.
 *
 * The controls that hold a selection (tabs, steps, accordion) keep it locally:
 * the playground edits appearance, and a demo whose tabs would not switch
 * teaches the wrong thing about the control.
 */
import { ref } from 'vue';

defineProps<{
  /** The registry id, which decides what is rendered. */
  id: string;
  /** Live props from the playground rail, forwarded to the container. */
  bind?: Record<string, unknown>;
}>();

const tab = ref('sales');
const step = ref('details');
const open = ref<string | number>('hours');

const TABS = [
  { value: 'sales', label: 'Sales', icon: 'payments', badge: 3 },
  { value: 'refunds', label: 'Refunds', icon: 'undo' },
  { value: 'comps', label: 'Complimentary', icon: 'card_giftcard' },
];
const STEPS = [
  { value: 'details', label: 'Details', sub: 'Who is coming' },
  { value: 'seats', label: 'Seats', sub: 'Pick from the map' },
  { value: 'payment', label: 'Payment', sub: 'Card or cash' },
];
const PANELS = [
  { value: 'hours', header: 'Opening hours', icon: 'schedule', badge: 2,
    content: 'Doors open an hour before the performance. The box office closes fifteen minutes after curtain-up.' },
  { value: 'access', header: 'Access', icon: 'accessible',
    content: 'Step-free entry from the north side. Two wheelchair spaces per showing, bookable by phone.' },
  { value: 'refunds', header: 'Refunds', icon: 'receipt_long',
    content: 'Refunds up to 48 hours before the performance. Booking fees are retained.' },
];
</script>

<template>
  <!-- Toolbar: three regions, so the demo has to fill more than one to show
       what the component actually does with them. -->
  <ApexToolbar v-if="id === 'toolbar'" v-bind="bind">
    <template #start>
      <ApexButton severity="secondary" variant="text" icon="arrow_back" icon-only label="Back" />
      <strong style="font-size:14px">Autumn Season</strong>
    </template>
    <template #center>
      <ApexSegmented :model-value="tab" :options="[{ value: 'sales', label: 'Sales' }, { value: 'refunds', label: 'Refunds' }]"
                     @update:model-value="v => tab = String(v)" />
    </template>
    <template #end>
      <ApexButton severity="secondary" variant="outlined" icon="download">Export</ApexButton>
      <ApexButton icon="add">New event</ApexButton>
    </template>
  </ApexToolbar>

  <ApexTabs v-else-if="id === 'tabs'" v-model="tab" :tabs="TABS" v-bind="bind">
    <template #panel-1><p class="cstage__p">412 tickets sold, €18,340 taken.</p></template>
    <template #panel-2><p class="cstage__p">Six refunds this week, €270 returned.</p></template>
    <template #panel-3><p class="cstage__p">14 complimentary tickets issued against a quota of 40.</p></template>
  </ApexTabs>

  <ApexSteps v-else-if="id === 'steps'" v-model="step" :steps="STEPS" v-bind="bind">
    <template #panel-1><p class="cstage__p">Name, email and phone for the lead booker.</p></template>
    <template #panel-2><p class="cstage__p">Seats are held for ten minutes once picked.</p></template>
    <template #panel-3><p class="cstage__p">Card is taken now; cash is settled at the door.</p></template>
  </ApexSteps>

  <!-- Splitter needs real height and content on both sides, or there is
       nothing to drag the gutter between. -->
  <ApexSplitter v-else-if="id === 'splitter'" :panels="[{ key: 'l' }, { key: 'r' }]" v-bind="bind">
    <template #panel-1>
      <div class="cstage__pane"><strong>Seat map</strong><p class="cstage__p">Drag the gutter to resize.</p></div>
    </template>
    <template #panel-2>
      <div class="cstage__pane"><strong>Basket</strong><p class="cstage__p">2 × Stalls B12–B13, €44.00</p></div>
    </template>
  </ApexSplitter>

  <ApexScrollArea v-else-if="id === 'scrollarea'" height="180px" v-bind="bind">
    <p v-for="n in 12" :key="n" class="cstage__p">
      Row {{ n }} — this content is deliberately taller than the box, so the
      scrollbar has something to do.
    </p>
  </ApexScrollArea>

  <ApexPanel v-else-if="id === 'panel'" header="Fees" subheader="Applied per order" icon="payments" v-bind="bind">
    <p class="cstage__p">Booking fee 6%, admin fee €1.50. Both carry their own VAT rate.</p>
    <template #footer>
      <ApexButton severity="secondary" variant="text">Reset to defaults</ApexButton>
    </template>
  </ApexPanel>

  <ApexFieldset v-else-if="id === 'fieldset'" legend="Lead booker" icon="person" v-bind="bind">
    <div class="cstage__form">
      <ApexInput label="Name" placeholder="Ada Lovelace" />
      <ApexInput label="Email" type="email" placeholder="ada@example.com" />
    </div>
  </ApexFieldset>

  <ApexCard v-else-if="id === 'card'" title="Aida" subtitle="Teatru Manoel · 14 March" v-bind="bind">
    <p class="cstage__p">Verdi's Aida, in a new production. Sung in Italian with English surtitles.</p>
    <template #footer>
      <ApexButton severity="secondary" variant="outlined">Details</ApexButton>
      <ApexButton>Book</ApexButton>
    </template>
  </ApexCard>

  <ApexAccordion v-else-if="id === 'accordion'" v-model:value="open" :items="PANELS" v-bind="bind" />
</template>

<style>
/* Demo-only content styling. Kept out of the library stylesheet: these classes
   dress the sample content, not any part of a container. */
.cstage__p { margin: 0 0 8px; font-size: 13.5px; line-height: 1.55; color: var(--fg-muted); }
.cstage__p:last-child { margin-bottom: 0; }
.cstage__pane { padding: 14px; }
.cstage__form { display: grid; gap: 12px; }
</style>
