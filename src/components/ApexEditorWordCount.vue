<script setup lang="ts">
/**
 * ApexEditorWordCount — document statistics, and the selection's beside them.
 *
 * Document AND selection side by side rather than one number that silently
 * changes meaning: an author who has selected a paragraph wants to know its
 * length without losing sight of the whole.
 *
 * Pages and Lines are deliberately absent. A page has no meaning in a document
 * with no pagination, and a line in HTML is wherever the viewport happens to
 * wrap — reporting either would be reporting a guess as a fact.
 */
import { ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';

export interface WordCountStats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  blocks: number;
}

const props = withDefaults(defineProps<{
  openRequest?: number;
  /**
   * A GETTER, read when the dialog opens: statistics computed on every keystroke
   * would be work nobody asked for.
   */
  stats?: (() => { doc: WordCountStats | null; selection: WordCountStats | null }) | null;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { openRequest: 0, stats: null });

const ROWS: { key: keyof WordCountStats; label: string }[] = [
  { key: 'words', label: 'Words' },
  { key: 'chars', label: 'Characters (with spaces)' },
  { key: 'charsNoSpaces', label: 'Characters (no spaces)' },
  { key: 'blocks', label: 'Paragraphs' },
];

const open = ref(false);
const doc = ref<WordCountStats | null>(null);
const selection = ref<WordCountStats | null>(null);

function show() {
  const read = props.stats?.() || null;
  doc.value = read?.doc || null;
  selection.value = read?.selection || null;
  open.value = true;
}
function hide() { open.value = false; }

watch(() => props.openRequest, show);

const fmt = (n?: number) => (typeof n === 'number' ? n.toLocaleString() : '\u2014');

defineExpose({ show, hide, doc, selection });
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="apex-eddlg__scrim" :class="ui?.dialogScrim" @pointerdown.self="hide">
      <div class="apex-eddlg" :class="ui?.dialog" role="dialog" aria-modal="true" aria-label="Word count"
           @keydown.esc.stop="hide">
        <header class="apex-eddlg__head" :class="ui?.dialogHead">
          <h2 class="apex-eddlg__title" :class="ui?.dialogTitle">Word count</h2>
          <button type="button" class="apex-eddlg__x" :class="ui?.dialogX" aria-label="Close" @click="hide">
            <ApexIcon name="close" :size="18" />
          </button>
        </header>
        <table class="apex-edwc" :class="ui?.wordCount">
          <thead>
            <tr>
              <th scope="col">Statistic</th>
              <th scope="col">Document</th>
              <!-- the column appears only when there IS a selection, rather than
                   standing there full of dashes -->
              <th v-if="selection" scope="col">Selection</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in ROWS" :key="row.key">
              <th scope="row">{{ row.label }}</th>
              <td>{{ fmt(doc?.[row.key]) }}</td>
              <td v-if="selection">{{ fmt(selection[row.key]) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!selection" class="apex-eddlg__note" :class="ui?.dialogNote">Select some text to count only that.</p>
        <footer class="apex-eddlg__foot" :class="ui?.dialogFoot">
          <button type="button" class="apex-eddlg__close" :class="ui?.dialogClose" @click="hide">Close</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
