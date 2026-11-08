<template>
  <div class="data-stage">
    <ApexDataTable
      v-if="id === 'datatable'"
      v-model:selection="tableSel"
      :value="SALES"
      :columns="SALES_COLUMNS"
      v-bind="bind"
    />

    <ApexTreeTable
      v-else-if="id === 'treetable'"
      v-model:expanded-keys="ttExpanded"
      v-model:selection-keys="ttSel"
      :value="TT_NODES"
      :columns="TT_FILTER_COLUMNS"
      v-bind="bind"
    />

    <template v-else-if="id === 'tree'">
      <ApexTree
        v-model:value="treeNodes"
        v-model:expanded-keys="treeExpanded"
        v-model:selection-keys="treeSel"
        v-bind="bind"
        @node-drop="onTreeDrop"
      />
      <p class="cfm-log">{{ treeLog || 'Drag a node onto another to move it.' }}</p>
    </template>

    <ApexOrgChart
      v-else-if="id === 'orgchart'"
      :value="ORG_TREE"
      v-bind="bind"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for the four data controls that carry a structure.
 *
 * DataTable, TreeTable, Tree and OrgChart each need two things before any rail
 * control means anything: a column or node definition, and a seed to render.
 * Bound to props alone they are an empty frame with a rail of inert switches —
 * the blank-stage failure BoardStage was written to avoid.
 *
 * They also hold state the rail acts on. Selection mode does nothing visible
 * unless something can be selected; expansion mode needs somewhere to record
 * what is open. Those live here, not in the registry, so switching pages
 * resets them.
 *
 * The tree keeps its OWN copy of the seed. Dragging reorders the array in
 * place, and reading the shared FILES export straight from the registry would
 * have every drag here rearrange the nodes the page examples render from —
 * the same reason BoardStage copies its items.
 */
import { ref } from 'vue';
import {
  SALES, SALES_COLUMNS, TT_NODES, TT_FILTER_COLUMNS, ORG_TREE, FILES,
} from '../registry';

defineProps<{
  /** Which of the four to render — the registry entry's id. */
  id: string;
  /** Live props from the playground rail. */
  bind?: Record<string, unknown>;
}>();

const tableSel = ref<unknown[]>([]);

const ttExpanded = ref<Record<string, boolean>>({ d: true, 'd-w': true });
const ttSel = ref<Record<string, unknown>>({});

const treeNodes = ref(JSON.parse(JSON.stringify(FILES)));
const treeExpanded = ref<Record<string, boolean>>({ docs: true, work: true });
const treeSel = ref<Record<string, unknown>>({});
const treeLog = ref('');

function onTreeDrop(payload: {
  dragNode: { label?: string };
  dropNode?: { label?: string } | null;
  position: string;
}) {
  treeLog.value = payload.dragNode.label + ' → ' + payload.position
    + (payload.dropNode ? ' ' + payload.dropNode.label : '');
}
</script>
