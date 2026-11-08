<template>
  <h2>Basic</h2>
  <p style="font-size:13.5px">Each node carries its row fields on <code>data</code>; the column marked <code>expander: true</code> hosts the toggle and the indent.</p>
  <div style="margin-top:12px">
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" v-model:expanded-keys="ttExpanded" />
  </div>

  <h2>Size and grid lines</h2>
  <div v-for="s in ['small','normal','large']" :key="s" style="margin-block-end:18px">
    <span class="cell__tag">size="{{ s }}" grid-lines="both"</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS.slice(0,4)" :size="s" grid-lines="both"
                     :expanded-keys="{ d: true }" />
  </div>
  <span class="cell__tag">striped, no grid lines</span>
  <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS.slice(0,4)" grid-lines="none" striped
                   :expanded-keys="{ d: true, 'd-w': true }" />

  <h2>Selection</h2>
  <p style="font-size:13.5px">Single, multiple (optionally requiring Cmd/Ctrl), or checkbox — which cascades to descendants and shows a partial state on ancestors, storing <code>{ checked, partialChecked }</code> per key.</p>
  <div style="margin-top:12px">
    <span class="cell__tag">selection-mode="single"</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS.slice(0,4)" selection-mode="single"
                     v-model:selection-keys="ttSingle" :expanded-keys="{ d: true }" />
    <p style="font-size:13px;margin-top:8px">Selected: <code>{{ treeKeys(ttSingle) }}</code></p>
  </div>
  <div style="margin-top:18px">
    <span class="cell__tag">selection-mode="checkbox" — cascade and partial state</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS.slice(0,4)" selection-mode="checkbox"
                     v-model:selection-keys="ttCheck" :expanded-keys="{ d: true, 'd-w': true }" />
    <p style="font-size:13px;margin-top:8px">Selected: <code>{{ treeKeys(ttCheck) }}</code></p>
  </div>

  <h2>Keyboard</h2>
  <p style="font-size:13.5px">Focus a row: <strong>↑ ↓</strong> move, <strong>→</strong> expands or steps in, <strong>←</strong> collapses or steps out, <strong>Space</strong> or <strong>Enter</strong> toggles selection, <strong>Shift + ↑ ↓</strong> extends a range. Pair <code>selectionMode="multiple"</code> with <code>metaKeySelection</code> for a keyboard-driven flow.</p>
  <div style="margin-top:12px">
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS.slice(0,4)" selection-mode="multiple"
                     meta-key-selection v-model:selection-keys="ttMulti"
                     :expanded-keys="{ d: true, 'd-w': true, m: true }" />
  </div>

  <h2>Sorting</h2>
  <p style="font-size:13.5px">Siblings reorder at every level, so the hierarchy is never flattened. A third click clears the column when <code>removableSort</code> is on. Cmd-click headers in <code>sortMode="multiple"</code>; each keeps a rank badge.</p>
  <div style="margin-top:12px">
    <span class="cell__tag">presort — sort-field="size" :sort-order="-1"</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" v-model:sort-field="ttSortField"
                     v-model:sort-order="ttSortOrder" :expanded-keys="{ d: true, m: true }" />
  </div>
  <div style="margin-top:18px">
    <span class="cell__tag">multiple presort — type ascending, then size descending</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" sort-mode="multiple"
                     v-model:multi-sort-meta="ttMultiSort" :expanded-keys="{ d: true, m: true }" />
  </div>

  <h2>Filtering</h2>
  <p style="font-size:13.5px">A filter row per column plus a global search. <code>filterMode="lenient"</code> keeps a matching branch's whole subtree; <code>strict</code> keeps only what matched and the ancestors needed to reach it.</p>
  <div style="margin-top:12px">
    <span class="cell__tag">filter-display="row" show-global-filter filter-mode="lenient"</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_FILTER_COLUMNS" filter-display="row"
                     show-global-filter v-model:filters="ttFilters" filter-mode="lenient"
                     :expanded-keys="{ d: true, 'd-w': true, m: true, 'm-s': true, r: true }" />
  </div>
  <div style="margin-top:18px">
    <span class="cell__tag">filter-mode="strict"</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_FILTER_COLUMNS" filter-display="row"
                     filter-mode="strict" :expanded-keys="{ d: true, 'd-w': true, m: true, 'm-s': true, r: true }" />
  </div>

  <h2>Paging and scrolling</h2>
  <p style="font-size:13.5px">Paging applies to root nodes, so a page always carries whole branches.</p>
  <div style="margin-top:12px">
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" paginator :rows="2"
                     :rows-per-page-options="[2, 3, 4]" :expanded-keys="{ d: true }" />
  </div>
  <div style="margin-top:18px">
    <span class="cell__tag">scrollable with a sticky header</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" scrollable scroll-height="220px"
                     :expanded-keys="{ d: true, 'd-w': true, 'd-h': true, m: true, 'm-s': true, r: true }" />
  </div>

  <h2>Footer aggregates</h2>
  <p style="font-size:13.5px">A column's <code>aggregate</code> runs over the leaves, so folder sizes are not double-counted.</p>
  <div style="margin-top:12px">
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" show-footer
                     :expanded-keys="{ d: true, 'd-w': true }" />
  </div>

  <h2>Templates</h2>
  <div style="margin-top:12px">
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" caption="File viewer"
                     :expanded-keys="{ d: true, 'd-w': true }">
      <template #cell:size="{ value }">
        <ApexProgressBar :value="Math.min(100, value / 16)" :height="6" severity="auto"
                           style="min-width:90px" />
      </template>
      <template #cell:owner="{ value }">
        <span class="tt-owner"><ApexIcon name="person" :size="16" />{{ value }}</span>
      </template>
      <template #footer>
        <div style="padding:12px 14px;display:flex;gap:8px">
          <ApexButton size="sm" icon="refresh" severity="secondary" variant="outlined">Reload</ApexButton>
          <ApexButton size="sm" icon="download">Export</ApexButton>
        </div>
      </template>
    </ApexTreeTable>
  </div>

  <h2>Lazy loading</h2>
  <p style="font-size:13.5px">Only roots are loaded; children arrive on <code>node-expand</code>.</p>
  <div style="margin-top:12px">
    <ApexTreeTable :value="ttLazy" :columns="TT_COLUMNS" lazy @node-expand="onTtLazyExpand" />
  </div>

  <h2>Loading and empty</h2>
  <div style="margin-top:12px">
    <span class="cell__tag">skeleton</span>
    <ApexTreeTable :value="[]" :columns="TT_COLUMNS" loading loading-mode="skeleton" />
  </div>
  <div style="margin-top:18px">
    <span class="cell__tag">overlay</span>
    <ApexTreeTable :value="TT_NODES" :columns="TT_COLUMNS" loading :expanded-keys="{ d: true }" />
  </div>
  <div style="margin-top:18px">
    <span class="cell__tag">empty</span>
    <ApexTreeTable :value="[]" :columns="TT_COLUMNS" empty-message="This folder is empty" />
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexTreeTable.
 *
 * Ported from the gallery's own section block, which is what the gallery
 * actually runs. Its state lived on one shared Options-API instance; here each
 * control's examples own theirs.
 */
import { ref } from 'vue';
import { TT_NODES, TT_COLUMNS, TT_FILTER_COLUMNS } from '../../registry';

const ttExpanded = ref<Record<string, boolean>>({ d: true, 'd-w': true });
const ttSingle = ref<Record<string, unknown>>({});
const ttMulti = ref<Record<string, unknown>>({});
const ttCheck = ref<Record<string, unknown>>({});
const ttFilters = ref<Record<string, unknown>>({});
const ttSortField = ref('size');
const ttSortOrder = ref(-1);
const ttMultiSort = ref([{ field: 'type', order: 1 }, { field: 'size', order: -1 }]);

interface LazyRow { key: string; icon: string; loading?: boolean; children?: unknown[];
  data: { name: string; type: string; size: number; owner: string; modified: string } }
const ttLazy = ref<LazyRow[]>([
  { key: 'z1', icon: 'folder', data: { name: 'Northern Harbour', type: 'Region', size: 0, owner: 'A. Borg', modified: '2026-08-01' } },
  { key: 'z2', icon: 'folder', data: { name: 'Southern Harbour', type: 'Region', size: 0, owner: 'L. Rossi', modified: '2026-08-03' } },
  { key: 'z3', icon: 'folder', data: { name: 'Gozo', type: 'Region', size: 0, owner: 'K. Weber', modified: '2026-07-22' } },
]);

/** Shared with the Tree examples in spirit; kept local so neither page can
    quietly change the other's readout. */
function treeKeys(map: Record<string, unknown>) {
  const on = Object.keys(map || {}).filter((k) => {
    const v = map[k] as { checked?: boolean } | boolean;
    return v === true || (!!v && typeof v === 'object' && !!v.checked);
  });
  return on.length ? on.join(', ') : 'none';
}

function onTtLazyExpand(node: LazyRow) {
  if (node.children && node.children.length) return;
  const mark = (loading: boolean, children?: unknown[]) => {
    ttLazy.value = ttLazy.value.map((n) => (n.key !== node.key
      ? n : { ...n, loading, ...(children ? { children } : {}) }));
  };
  mark(true);
  setTimeout(() => {
    mark(false, [1, 2].map((i) => ({
      key: node.key + '-' + i, icon: 'tv', leaf: true,
      data: { name: node.data.name.split(' ')[0] + ' display ' + i, type: 'Display',
              size: 40 * i, owner: node.data.owner, modified: node.data.modified },
    })));
  }, 900);
}
</script>
