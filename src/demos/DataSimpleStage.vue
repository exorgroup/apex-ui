<template>
  <div class="data-stage">
    <ApexPaginator
      v-if="id === 'paginator'"
      v-model:first="pagerFirst"
      v-bind="bind"
    />

    <ApexProgressBar
      v-else-if="id === 'progressbar'"
      v-bind="bind"
    />

    <ApexTimeline
      v-else-if="id === 'timeline'"
      :value="SHIPMENT"
      v-bind="bind"
    >
      <template #content="{ item }">
        <div class="tl-card">
          <strong>{{ item.status }}</strong>
          <span>{{ item.note }}</span>
        </div>
      </template>
      <template #opposite="{ item }">
        <span class="tl-when"><strong>{{ item.date }}</strong><em>{{ item.time }}</em></span>
      </template>
    </ApexTimeline>

    <template v-else-if="id === 'picklist'">
      <ApexPickList
        v-model="pick"
        data-key="id"
        v-bind="bind"
        @move-to-target="onPickMove($event, 'team')"
        @move-to-source="onPickMove($event, 'available')"
      >
        <template #option="{ item }">
          <span class="pl-row">
            <ApexIcon :name="item.icon" :size="18" />
            <span class="pl-row__text"><strong>{{ item.name }}</strong><em>{{ item.role }}</em></span>
          </span>
        </template>
      </ApexPickList>
      <p class="cfm-log">{{ pickLog || 'Move someone across to see the payload.' }}</p>
    </template>

    <ApexDataView
      v-else-if="id === 'dataview'"
      :value="DV_ROWS"
      data-key="id"
      v-bind="bind"
      :layout="dvLayout"
      @update:layout="dvLayout = $event"
    >
      <template #list="{ item }">
        <div class="dv-list">
          <img :src="item.thumb" :alt="item.product" />
          <div class="dv-list__body">
            <span class="dv-eyebrow">{{ item.country }}</span>
            <h4>{{ item.product }}</h4>
            <span class="apex-dt__badge" :data-tone="stockTone(item)">{{ stockLabel(item) }}</span>
          </div>
          <div class="dv-list__end">
            <strong>{{ money(item.price) }}</strong>
            <ApexButton size="sm" icon="shopping_cart">Order</ApexButton>
          </div>
        </div>
      </template>
      <template #grid="{ item }">
        <div class="dv-card">
          <img :src="item.thumb" :alt="item.product" />
          <span class="dv-eyebrow">{{ item.country }}</span>
          <h4>{{ item.product }}</h4>
          <span class="apex-dt__badge" :data-tone="stockTone(item)">{{ stockLabel(item) }}</span>
          <div class="dv-card__foot">
            <strong>{{ money(item.price) }}</strong>
            <ApexButton size="sm" icon="shopping_cart" icon-only label="Order" />
          </div>
        </div>
      </template>
    </ApexDataView>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for the five data controls that render a list.
 *
 * Three of them are nothing without slot markup. A DataView bound to rows
 * alone renders the raw object; a Timeline renders undated bullets; a PickList
 * renders `[object Object]`. The gallery's slots are copied here verbatim,
 * because the point of the page is to show what the control looks like in use.
 *
 * ProgressBar and Paginator need no seed — they render from props — but they
 * live here rather than in the default stage because Paginator holds `first`,
 * and a pager whose page never changes looks broken.
 */
import { ref, watch } from 'vue';
import { SHIPMENT, SALES, TEAM } from '../registry';

const props = defineProps<{
  /** Which of the five to render — the registry entry's id. */
  id: string;
  /** Live props from the playground rail. */
  bind?: Record<string, unknown>;
}>();

/** Twelve is what the gallery shows: enough to fill a grid, few enough to scan. */
const DV_ROWS = SALES.slice(0, 12);

const pagerFirst = ref(0);

const pick = ref<unknown[][]>([TEAM.slice(0, 7), TEAM.slice(7)]);
const pickLog = ref('');

function onPickMove(payload: { items: { name: string }[] }, where: string) {
  pickLog.value = payload.items.map((i) => i.name).join(', ') + ' → ' + where;
}

/**
 * The layout is driven from BOTH ends.
 *
 * DataView carries its own switcher, and the rail has a `layout` control. The
 * gallery writes the emitted value straight back into the playground props;
 * here `live` is a computed that re-spreads on every read, so a write to it is
 * discarded and the switcher would appear dead. A local value the rail seeds
 * keeps both working.
 */
const dvLayout = ref<string>((props.bind?.layout as string) ?? 'grid');
watch(() => props.bind?.layout, (v) => { if (v) dvLayout.value = v as string; });

const money = (n: number) => '€' + Number(n).toFixed(2);
const stockTone = (row: { qty: number }) =>
  (row.qty > 15 ? 'success' : row.qty > 5 ? 'warning' : 'danger');
const stockLabel = (row: { qty: number }) =>
  (row.qty > 15 ? 'IN STOCK' : row.qty > 5 ? 'LOW STOCK' : 'OUT OF STOCK');
</script>
