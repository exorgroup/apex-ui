<template>
  <h2>Basic and controlled</h2>
  <p style="font-size:13.5px">Expansion is a bindable key map — a key set to true is expanded. Read it, persist it, or open a branch from elsewhere.</p>
  <div class="grid grid--2" style="margin-top:12px">
    <div class="cell">
      <span class="cell__tag">uncontrolled</span>
      <ApexTree :value="FILES" />
    </div>
    <div class="cell">
      <span class="cell__tag">v-model:expanded-keys</span>
      <ApexTree :value="FILES" v-model:expanded-keys="treeExpanded" />
      <p style="font-size:12.5px;margin-top:10px">Expanded: <code>{{ Object.keys(treeExpanded).join(', ') || 'none' }}</code></p>
    </div>
  </div>

  <h2>Selection</h2>
  <p style="font-size:13.5px">Single, multiple, or checkbox. In checkbox mode a click cascades to every descendant and ancestors show a partial state; the key map holds <code>{ checked, partialChecked }</code> per key.</p>
  <div class="grid grid--3" style="margin-top:12px">
    <div class="cell">
      <span class="cell__tag">single</span>
      <ApexTree :value="FILES" v-model:selection-keys="treeSingle" selection-mode="single" :scroll-height="220" />
      <p style="font-size:12px;margin-top:8px">{{ treeKeys(treeSingle) }}</p>
    </div>
    <div class="cell">
      <span class="cell__tag">multiple + meta-key</span>
      <ApexTree :value="FILES" v-model:selection-keys="treeMulti" selection-mode="multiple"
                 meta-key-selection :scroll-height="220" />
      <p style="font-size:12px;margin-top:8px">{{ treeKeys(treeMulti) }}</p>
    </div>
    <div class="cell">
      <span class="cell__tag">checkbox + select all</span>
      <ApexTree :value="FILES" v-model:selection-keys="treeCheck" selection-mode="checkbox"
                 show-select-all :scroll-height="220" />
      <p style="font-size:12px;margin-top:8px">{{ treeKeys(treeCheck) }}</p>
    </div>
  </div>

  <h2>Keyboard</h2>
  <p style="font-size:13.5px">Focus a row and use the keyboard: <strong>↑ ↓</strong> move, <strong>→</strong> expands or steps in, <strong>←</strong> collapses or steps out to the parent, <strong>Home</strong> and <strong>End</strong> jump, <strong>Space</strong> or <strong>Enter</strong> toggles selection.</p>

  <h2>Filtering</h2>
  <p style="font-size:13.5px">Matching branches open automatically while a query is active. <code>lenient</code> keeps a matching branch whole; <code>strict</code> keeps only the matches and the ancestors needed to reach them. <code>filterBy</code> takes a comma-separated list of fields — <code>label,size</code> here searches the metadata too.</p>
  <div class="grid grid--2" style="margin-top:12px">
    <div class="cell">
      <span class="cell__tag">filter-mode="lenient"</span>
      <ApexTree :value="FILES" filter filter-mode="lenient" filter-placeholder="Try: media"
                 filter-by="label,size" :scroll-height="240" />
    </div>
    <div class="cell">
      <span class="cell__tag">filter-mode="strict"</span>
      <ApexTree :value="FILES" filter filter-mode="strict" filter-placeholder="Try: csv"
                 filter-by="label,size" :scroll-height="240" />
    </div>
  </div>

  <h2>Custom node, icon and toggle</h2>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexTree :value="FILES" v-model:expanded-keys="treeExpanded" :indent="24">
      <template #nodeicon="{ node, expanded, hasChildren }">
        <ApexIcon :name="hasChildren ? (expanded ? 'folder_open' : 'folder') : node.icon"
                   class="apex-tr__icon" :size="18" :fill="hasChildren" />
      </template>
      <template #nodetoggleicon="{ expanded }">
        <ApexIcon :name="expanded ? 'remove' : 'add'" :size="15" />
      </template>
      <template #node="{ node }">
        <span class="tr-row">
          <span>{{ node.label }}</span>
          <em v-if="node.data && node.data.size">{{ node.data.size }}</em>
        </span>
      </template>
    </ApexTree>
  </div>

  <h2>Lazy loading</h2>
  <p style="font-size:13.5px">Children arrive on expand. Set <code>node.loading</code> for the spinner and <code>node.leaf</code> once a node is known to have none.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexTree :value="lazyNodes" lazy @node-expand="onLazyExpand" />
  </div>

  <h2>Drag and drop</h2>
  <p style="font-size:13.5px">Drop near the top or bottom of a row to place before or after it; drop in the middle to move inside. <code>value</code> is bindable, so the tree rewrites itself and <code>@node-drop</code> reports the move.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexTree v-model:value="treeDrag" draggable-nodes droppable-nodes @node-drop="onTreeDrop" />
  </div>
  <p style="font-size:13px;margin-top:8px">Last drop: <code>{{ treeLog || 'none yet' }}</code></p>

  <div style="margin-top:22px">
    <span class="cell__tag">between trees — scopes allow start → end only</span>
    <div class="tr-pair">
      <ApexTree v-model:value="treeA" draggable-nodes draggable-scope="start" :scroll-height="200" />
      <ApexTree v-model:value="treeB" droppable-nodes droppable-scope="start" :scroll-height="200"
                 empty-message="Drag nodes here" />
    </div>
  </div>

  <h2>Loading and empty</h2>
  <div class="grid grid--3" style="margin-top:12px">
    <div class="cell"><span class="cell__tag">skeleton</span>
      <ApexTree :value="[]" loading loading-mode="skeleton" :skeleton-rows="5" /></div>
    <div class="cell"><span class="cell__tag">overlay</span>
      <ApexTree :value="FILES" loading /></div>
    <div class="cell"><span class="cell__tag">empty</span>
      <ApexTree :value="[]" empty-message="No files in this folder" /></div>
  </div>

  <h2>Colours and density</h2>
  <div class="grid grid--2" style="margin-top:12px">
    <div class="cell">
      <span class="cell__tag">dark rows, square selection, tight indent</span>
      <ApexTree :value="FILES" v-model:expanded-keys="treeExpanded" selection-mode="single"
                 :indent="14" row-radius="2px" hover-background="#E8ECF2"
                 selected-background="#0F141C" selected-color="#FFFFFF" icon-color="#8794A6" />
    </div>
    <div class="cell">
      <span class="cell__tag">green checkbox tree, roomy indent</span>
      <ApexTree :value="FILES" selection-mode="checkbox" show-select-all :indent="28"
                 row-radius="var(--r-md)" selected-background="#E7F8EE" selected-color="#094825"
                 icon-color="#137C4A" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexTree.
 *
 * Ported from the gallery's own section block, which is what the gallery
 * actually runs. Its state lived on one shared Options-API instance; here each
 * control's examples own theirs.
 */
import { ref } from 'vue';
import { FILES } from '../../registry';

/* Each example owns its own copy. Drag-and-drop reorders the array in place,
   and sharing one with the stage would have a drag down here rearrange the
   playground above. */
const treeExpanded = ref<Record<string, boolean>>({ docs: true, work: true });
const treeSingle = ref<Record<string, unknown>>({});
const treeMulti = ref<Record<string, unknown>>({});
const treeCheck = ref<Record<string, unknown>>({});
const treeDrag = ref(JSON.parse(JSON.stringify(FILES)));
const treeLog = ref('');

const treeA = ref([
  { key: 'a1', label: '.github', icon: 'folder', children: [{ key: 'a1a', label: 'workflows', icon: 'folder' }] },
  { key: 'a2', label: 'public', icon: 'folder', children: [{ key: 'a2a', label: 'favicon.ico', icon: 'image' }] },
  { key: 'a3', label: 'index.html', icon: 'html' },
  { key: 'a4', label: 'vite.config.ts', icon: 'settings' },
]);
const treeB = ref<unknown[]>([]);

interface LazyNode { key: string; label: string; icon: string; loading?: boolean; children?: unknown[]; leaf?: boolean }
const lazyNodes = ref<LazyNode[]>([
  { key: 'l1', label: 'Northern Harbour', icon: 'folder' },
  { key: 'l2', label: 'Southern Harbour', icon: 'folder' },
  { key: 'l3', label: 'Gozo', icon: 'folder' },
]);

/** Reads a selection map back as a sentence. Checkbox mode stores an object. */
function treeKeys(map: Record<string, unknown>) {
  const on = Object.keys(map || {}).filter((k) => {
    const v = map[k] as { checked?: boolean } | boolean;
    return v === true || (!!v && typeof v === 'object' && !!v.checked);
  });
  return on.length ? on.join(', ') : 'none';
}

function onTreeDrop(p: { dragNode: { label?: string }; dropNode?: { label?: string } | null; position: string }) {
  treeLog.value = p.dragNode.label + ' → ' + p.position + (p.dropNode ? ' ' + p.dropNode.label : '');
}

/** Children arrive on expand. The node is replaced, not mutated: the tree
    reads the array as a prop and swapping the element is what tells it. */
function onLazyExpand(node: LazyNode) {
  if (node.children && node.children.length) return;
  const mark = (loading: boolean, children?: unknown[]) => {
    lazyNodes.value = lazyNodes.value.map((n) => (n.key !== node.key
      ? n : { ...n, loading, ...(children ? { children } : {}) }));
  };
  mark(true);
  setTimeout(() => {
    mark(false, [1, 2, 3].map((i) => ({
      key: node.key + '-' + i, label: node.label.split(' ')[0] + ' display ' + i,
      icon: 'tv', leaf: true,
    })));
  }, 900);
}
</script>
