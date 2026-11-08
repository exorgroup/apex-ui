<template>
  <h2>Basic</h2>
  <p style="font-size:13.5px">Give it a <code>value</code> tree and it draws the hierarchy. Nodes carry a <code>key</code>, a label, an optional subtitle and either an <code>icon</code> or an <code>image</code>.</p>
  <div class="card" style="max-width:none;overflow:auto">
    <ApexOrgChart :value="ORG_TREE" />
  </div>

  <h2>Collapsible and controlled</h2>
  <p style="font-size:13.5px"><code>collapsible</code> puts a control on every node with children. <code>collapsedKeys</code> is bindable — a key set to true is collapsed, absent keys stay open — so the state is yours to read, persist or set from elsewhere.</p>
  <div class="card" style="max-width:none;overflow:auto;margin-top:12px">
    <ApexOrgChart v-model:collapsed-keys="ocCollapsed" :value="ORG_TREE" collapsible />
  </div>
  <p style="font-size:13px;margin-top:8px">Collapsed: <code>{{ ocKeys(ocCollapsed) }}</code></p>

  <h2>Custom node content and toggle icon</h2>
  <p style="font-size:13.5px">The default slot replaces the node's <em>content</em> — the chart still draws the card, the connectors and the collapse control around it. The slot gives you <code>{ node, selected, partialSelected, collapsed }</code>. <code>#toggleicon</code> receives the collapsed state.</p>
  <div class="card" style="max-width:none;overflow:auto;margin-top:12px">
    <ApexOrgChart :value="ORG_TREE" collapsible line-color="#A6C5FF" :line-width="2">
      <template #default="{ node }">
        <div class="oc-card">
          <ApexIcon :name="node.icon || 'person'" :size="18" />
          <span class="oc-card__text">
            <strong>{{ node.label }}</strong>
            <em>{{ node.subtitle }}</em>
          </span>
          <span v-if="node.children" class="apex-dt__badge" data-tone="primary">{{ node.children.length }}</span>
        </div>
      </template>
      <template #toggleicon="{ collapsed }">
        <ApexIcon :name="collapsed ? 'add' : 'remove'" :size="15" />
      </template>
    </ApexOrgChart>
  </div>

  <h2>Colours</h2>
  <p style="font-size:13.5px">Node fill, text, border and radius are props, as are the selected and partial states. A single node can override the chart by carrying its own <code>background</code>, <code>color</code> or <code>borderColor</code> — the Operations branch below does.</p>
  <div class="grid grid--2">
    <div class="cell" style="overflow:auto">
      <span class="cell__tag">chart-level colours</span>
      <ApexOrgChart :value="ORG_TREE" node-background="#0F141C" node-color="#ECEFF4"
                      node-border-color="#2A3447" node-radius="14px"
                      line-color="#5F6C7E" selection-mode="single"
                      selected-background="#0B5FFF" selected-color="#FFFFFF"
                      selected-border-color="#6BA0FF" />
    </div>
    <div class="cell" style="overflow:auto">
      <span class="cell__tag">per-node override, thicker border</span>
      <ApexOrgChart :value="ORG_TREE" :node-border-width="2" node-border-color="#A6C5FF"
                      node-radius="var(--r-full)" selection-mode="checkbox"
                      selected-background="#E7F8EE" selected-border-color="#137C4A"
                      partial-border-color="#C6EFD7" />
    </div>
  </div>

  <h2>Selection</h2>
  <div class="grid grid--2">
    <div class="cell" style="overflow:auto">
      <span class="cell__tag">selection-mode="single"</span>
      <ApexOrgChart v-model:selection-keys="ocSingle" :value="ORG_TREE" selection-mode="single" />
      <p style="font-size:12.5px;margin-top:10px">Selected: <code>{{ ocKeys(ocSingle) }}</code></p>
    </div>
    <div class="cell" style="overflow:auto">
      <span class="cell__tag">selection-mode="multiple"</span>
      <ApexOrgChart v-model:selection-keys="ocMulti" :value="ORG_TREE" selection-mode="multiple" />
      <p style="font-size:12.5px;margin-top:10px">Selected: <code>{{ ocKeys(ocMulti) }}</code></p>
    </div>
  </div>
  <div class="cell" style="overflow:auto;margin-top:18px">
    <span class="cell__tag">selection-mode="checkbox" — cascades to descendants, partial on ancestors</span>
    <ApexOrgChart v-model:selection-keys="ocCheck" :value="ORG_TREE" selection-mode="checkbox" collapsible />
    <p style="font-size:12.5px;margin-top:10px">Selected: <code>{{ ocKeys(ocCheck) }}</code></p>
  </div>

  <h2>Horizontal</h2>
  <div class="card" style="max-width:none;overflow:auto">
    <ApexOrgChart :value="ORG_TREE" orientation="horizontal" collapsible />
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexOrgChart.
 *
 * Ported from the gallery's own section block (APEX UI Gallery.html), which is
 * what the gallery actually runs. Its state lived on one enormous Options-API
 * instance shared by every control; here each control's examples own theirs,
 * which is the point of the split — App.vue was already 10,500 lines before
 * the nine data controls had a single section between them.
 */
import { ref } from 'vue';
import { ORG_TREE } from '../../registry';

const ocCollapsed = ref<Record<string, boolean>>({ ops: true });
const ocSingle = ref<Record<string, boolean>>({});
const ocMulti = ref<Record<string, boolean>>({});
const ocCheck = ref<Record<string, boolean>>({});

/** Reads a selection map back as a sentence, so the example shows its state. */
function ocKeys(map: Record<string, unknown>) {
  const k = Object.keys(map || {}).filter((x) => map[x]);
  return k.length ? k.join(', ') : 'none';
}
</script>
