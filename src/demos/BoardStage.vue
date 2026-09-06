<template>
  <div class="cfm-stage" style="width:100%">
    <ApexTaskBoard v-bind="bind" :items="ops" :columns="TB_OPS_COLUMNS" :swimlanes="TB_LANES"
                   :card-fields="TB_OPS_FIELDS" height="420px"
                   @card-move="onMove"
                   @wip-blocked="log = 'blocked by WIP limit'"
                   @selection-change="log = $event.items.length + ' selected'"
                   @add-card="log = 'add card in ' + $event.columnId" />
    <p class="cfm-log">{{ log || 'Drag a card, or focus one and press Ctrl with the arrow keys.' }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for ApexTaskBoard.
 *
 * Its own file for the reason every other stage is: a board with no items,
 * columns and lanes is an empty frame, and every rail control — selection
 * mode, WIP mode, density, the widths — has nothing to act on. That is the
 * blank-stage failure that shipped twice for overlays and once for the dock.
 *
 * It also has to own its copy of the data. The board never mutates `items`;
 * it emits a payload and the app applies it. Reading the seed straight from
 * the registry would have every drag here edit the array the thirteen page
 * examples render from.
 */
import { ref } from 'vue';
import { applyMove } from '@exorgroup/apex-ui';
import { TB_OPS_SEED, TB_OPS_COLUMNS, TB_LANES, TB_OPS_FIELDS } from '../registry';

defineProps<{
  /** Live props from the playground rail. */
  bind?: Record<string, unknown>;
}>();

const ops = ref(TB_OPS_SEED.map((i) => ({ ...i })));
const log = ref('');

function onMove(payload: Parameters<typeof applyMove>[1]) {
  ops.value = applyMove(ops.value, payload);
  log.value = 'moved to ' + payload.to.columnId;
}
</script>
