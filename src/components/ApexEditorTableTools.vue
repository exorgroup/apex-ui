<script setup lang="ts">
/**
 * ApexEditorTableTools — the contextual bar for a selected table.
 *
 * Contextual rather than permanent: table controls are meaningless outside a
 * table, and eighteen more buttons in the main toolbar would be dead weight on
 * every document without one. It sits in the toolbar stack rather than floating
 * over the table, because an overlay would cover the very cells being edited and
 * a bar that appears on selection must not shift the document under the caret.
 *
 * Structure commands come from the shared catalogue. Appearance is written as
 * real CSS declarations on the cell's own `style` attribute — not `data-*`, which
 * is inert without a host stylesheet, and a page's whole premise is that stored
 * markup renders.
 */
import { computed, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';
import ApexColorPicker from './ApexColorPicker.vue';
import { describe, type SurfaceItem } from '../core/editor/catalogue';
import { sameStyleValue } from '../core/editor/htmlStructure';

export interface CellStyleState {
  style: Record<string, string>;
  rows?: number;
  cols?: number;
  selectedCells?: number;
  colspan?: number;
  rowspan?: number;
  /**
   * The TABLE's border — N/048. Not the cell's: a border is what a person
   * means by "table border", it survives a row being added, and it is one
   * value rather than one per cell.
   */
  border?: { width: string | null; color: string | null };
}

const props = withDefaults(defineProps<{
  /** Absent means no table under the selection, and the bar renders nothing. */
  cell?: CellStyleState | null;
  /** A value may come with the name: the border commands take one. */
  run?: (name: string, value?: string | null) => boolean;
  can?: Record<string, boolean> | null;
  /** Writes one CSS declaration onto the cell selection. */
  setCellStyle?: (prop: string, value: string | null) => void;
  /** Structure commands, in bar order. */
  items?: SurfaceItem[];
  /**
   * The whole bar, off.
   *
   * Separate from `can`, which answers "may this command run here" per
   * command — this answers "is the editor accepting input at all", so a
   * readonly or disabled editor greys the bar rather than leaving a live
   * table toolbar over a document nobody can edit. AF2-281: present in the
   * mirror, absent from the SFC, and the alignment buttons are the half that
   * `can` cannot reach — they write a style rather than running a named
   * command, so nothing gated them.
   */
  disabled?: boolean;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), {
  items: () => [
    'table_add_row_before', 'table_add_row_after', 'table_delete_row',
    'separator',
    'table_add_column_before', 'table_add_column_after', 'table_delete_column',
    'separator',
    'table_merge_or_split', 'table_toggle_header_row', 'table_toggle_header_column',
    'separator',
    'table_delete',
  ],
});

/* Fill and border are NOT here. They belong to Table ▸ Cell ▸ Background /
   Border, where they are labelled lists rather than a swatch row and a select
   competing with fifteen icon buttons for the same strip. The bar keeps what is
   worth a single click: structure, merging, alignment, delete. */
const H_ALIGN = [
  { value: 'left', icon: 'format_align_left', label: 'Align left' },
  { value: 'center', icon: 'format_align_center', label: 'Align centre' },
  { value: 'right', icon: 'format_align_right', label: 'Align right' },
];
const V_ALIGN = [
  { value: 'top', icon: 'vertical_align_top', label: 'Align top' },
  { value: 'middle', icon: 'vertical_align_center', label: 'Align middle' },
  { value: 'bottom', icon: 'vertical_align_bottom', label: 'Align bottom' },
];

const structure = computed(() => (props.items || []).map((raw) => (raw === 'separator'
  ? { type: 'separator' as const }
  : describe(raw) as Exclude<SurfaceItem, string>)));

/** What the cell already carries, so the bar reports the document. */
function current(prop: string) {
  return (props.cell && props.cell.style[prop]) || null;
}

/**
 * Both sides normalised before comparing. The palette holds hex; the document
 * holds whatever the serialiser emitted (`rgb(...)`), and a raw string compare
 * across that boundary never matches once a document has been saved and reloaded.
 */
function matches(prop: string, value: string) {
  const held = current(prop);
  if (!value) return !held;
  if (!held) return false;
  return sameStyleValue(held, value);
}

/** The bar names what it acts on: a dragged block is the unit an author works in. */
const scope = computed(() => {
  const c = props.cell;
  if (!c) return '';
  if (c.selectedCells && c.selectedCells > 1) return `${c.selectedCells} cells`;
  const span = (c.colspan || 1) > 1 || (c.rowspan || 1) > 1
    ? ` \u00b7 ${c.colspan || 1}\u00d7${c.rowspan || 1}` : '';
  return `Cell${span}`;
});

/* ── the table's border ─────────────────────────────────────────────
   A number box and the library's colour picker, asked for after the
   published article showed a table as bare rows of words with nothing in
   this bar to change it. They write to the TABLE, which is why they read
   `cell.border` rather than `cell.style`.

   Local refs, for the reason the image bar's size boxes are local: typing
   must not fight the document on every keystroke. The value is written on
   change or on Enter, and re-read whenever the selection reports a
   different table. */
const DEFAULT_BORDER = '#d0d5dd';

const borderWidth = ref('');
const borderColor = ref(DEFAULT_BORDER);

watch(() => props.cell?.border, (border) => {
  const width = parseFloat(String(border?.width ?? ''));
  borderWidth.value = Number.isFinite(width) ? String(Math.round(width)) : '';
  /* The picker needs a colour to sit on even when the table has none —
     showing black for "unset" would offer to paint the border black. */
  borderColor.value = border?.color || DEFAULT_BORDER;
}, { immediate: true, deep: true });

function commitWidth(value: string | number) {
  /* `String(...)`: Vue casts an `<input type="number">` to a NUMBER through
     v-model, and a number has no `.trim`. Empty means "no border of its
     own", which is not the same as zero. */
  const text = String(value ?? '').trim();

  props.run?.('table_border_width', text === '' ? null : `${parseInt(text, 10)}px`);
}

function commitColor(value: string | null) {
  props.run?.('table_border_color', value || null);
}

function isDisabled(name?: string) {
  if (props.disabled) return true;
  if (!name) return true;
  return props.can ? props.can[name] === false : false;
}
function apply(prop: string, value: string | null) {
  props.setCellStyle?.(prop, value);
}
function invoke(name?: string) {
  if (name) props.run?.(name);
}
</script>

<template>
  <div v-if="cell" class="apex-tbl-tools" :class="ui?.tableTools" role="toolbar" aria-label="Table">
    <span class="apex-tbl-tools__scope" :class="ui?.tableToolsScope">{{ scope }}</span>
    <template v-for="(item, i) in structure" :key="i">
      <span v-if="item.type === 'separator'" class="apex-tbl-tools__sep" :class="ui?.tableToolsSep"></span>
      <button v-else type="button" class="apex-tbl-tools__btn" :class="ui?.tableToolsButton" :disabled="isDisabled(item.command)"
              :title="item.label" :aria-label="item.label" @click="invoke(item.command)">
        <ApexIcon :name="item.icon || 'table'" :size="17" />
      </button>
    </template>
    <span class="apex-tbl-tools__sep" :class="ui?.tableToolsSep"></span>
    <button v-for="a in H_ALIGN" :key="a.value" type="button" class="apex-tbl-tools__btn" :class="ui?.tableToolsButton"
            :data-on="matches('text-align', a.value) ? 'true' : 'false'"
            :disabled="disabled"
            :title="a.label" :aria-label="a.label"
            @click="apply('text-align', matches('text-align', a.value) ? null : a.value)">
      <ApexIcon :name="a.icon" :size="17" />
    </button>
    <button v-for="v in V_ALIGN" :key="v.value" type="button" class="apex-tbl-tools__btn" :class="ui?.tableToolsButton"
            :data-on="matches('vertical-align', v.value) ? 'true' : 'false'"
            :disabled="disabled"
            :title="v.label" :aria-label="v.label"
            @click="apply('vertical-align', matches('vertical-align', v.value) ? null : v.value)">
      <ApexIcon :name="v.icon" :size="17" />
    </button>

    <!-- The border: a width in pixels and a colour, both for the whole
         table. Empty width means the table has no border of its own and
         wears whatever the page gives it - which is not the same as 0. -->
    <span class="apex-tbl-tools__sep" :class="ui?.tableToolsSep"></span>
    <label class="apex-tbl-tools__field" :class="ui?.tableToolsField">
      <span aria-hidden="true">B</span>
      <input v-model="borderWidth" type="number" min="0" max="12" inputmode="numeric"
             :disabled="disabled" aria-label="Border width in pixels"
             @change="commitWidth(borderWidth)"
             @keydown.enter.prevent="commitWidth(borderWidth)">
    </label>
    <!-- The full picker, as asked for - but shown as a SWATCH here. Its
         trigger is a swatch plus a hex field, which is right in a form and
         200px of bar next to fifteen buttons; the stylesheet hides the
         field, and the hex box inside the popover is still there for
         anyone who would rather type it. -->
    <ApexColorPicker v-model="borderColor" class="apex-tbl-tools__colour" :class="ui?.tableToolsColour"
                     :disabled="disabled" size="sm" aria-label="Border colour"
                     @change="commitColor(borderColor)" />
  </div>
</template>
