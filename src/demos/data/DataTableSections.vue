<template>
          <h2>Column control</h2>
          <p style="font-size:13.5px">Drag a boundary to resize, a header to reorder, and use the picker to show or hide. The table owns all three by default — a column layout is a view preference rather than the application's data — and <code>v-model:columnState</code> binds it when you want to persist or drive it. <code>stateKey</code> does the persisting for you.</p>
          <div class="iconstrip" style="margin-top:12px">
            <ApexSelectButton v-model="dtResize" :options="['fit','expand']" size="sm" />
            <span style="font-size:13px;color:var(--fg-subtle)">
              fit takes width from the next column; expand widens the table
            </span>
          </div>
          <ApexDataTable :value="SALES" :columns="DT_COLS" data-key="id" style="margin-top:12px"
                           resizable-columns :column-resize-mode="dtResize" reorderable-columns
                           column-toggle scrollable table-min-width="720px"
                           v-model:column-state="dtColState"
                           @column-resize="dtLog = 'resized ' + $event.field + ' to ' + $event.width + 'px'"
                           @column-reorder="dtLog = 'moved ' + $event.field + ' to position ' + ($event.toIndex + 1)"
                           @column-toggle="dtLog = $event.field + ($event.hidden ? ' hidden' : ' shown')" />
          <p style="font-size:13px;margin-top:8px">{{ dtLog || 'Drag a header boundary, or a header itself.' }}</p>
          <pre class="doc-pre" style="margin-top:8px;max-height:140px;overflow:auto">{{ dtColState }}</pre>

          <h2>Column groups</h2>
          <p style="font-size:13.5px">Groups span the run of their own columns <em>in the current order</em>, and a column belonging to no group gets a blank cell — so reordering can never leave a group header spanning columns it does not own. Try dragging a header across a group boundary.</p>
          <ApexDataTable :value="SALES" :columns="DT_COLS" data-key="id" style="margin-top:12px"
                           :column-groups="DT_GROUPS" reorderable-columns resizable-columns
                           scrollable table-min-width="720px" />
          <h2>Column reference</h2>
          <table class="doc-table">
            <thead><tr><th>Key</th><th>Type</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>field</td><td>string</td><td colspan="2">Dotted paths work: <code>customer.name</code></td></tr>
              <tr><td>header</td><td>string</td><td colspan="2">Column heading</td></tr>
              <tr><td>width / minWidth</td><td>string</td><td colspan="2">Any CSS length. A <code>minWidth</code> keeps columns from squeezing when the table scrolls</td></tr>
              <tr><td>align</td><td>start | center | end</td><td colspan="2">Numeric formats align to the end automatically</td></tr>
              <tr><td>sortable</td><td>boolean</td><td colspan="2">Makes the header interactive</td></tr>
              <tr><td>format</td><td>text | number | currency | percent | date | datetime | badge | boolean</td><td colspan="2">Locale-aware display</td></tr>
              <tr><td>currency / precision</td><td>string / number</td><td colspan="2">For the numeric formats</td></tr>
              <tr><td>formula</td><td>string</td><td colspan="2">Spreadsheet-style over sibling fields: <code>=qty*price/1.5</code>. Arithmetic, parentheses and min/max/abs/round/floor/ceil only — nothing from the row can execute</td></tr>
              <tr><td>aggregate</td><td>sum | avg | min | max | count | distinct</td><td colspan="2">Footer total for the column</td></tr>
              <tr><td>frozen / alignFrozen</td><td>boolean / left | right</td><td colspan="2">Pin during horizontal scroll, to either edge</td></tr>
              <tr><td>color / background / headerBackground</td><td>string</td><td colspan="2">Per-column colours</td></tr>
              <tr><td>cellClass</td><td>string | (row) =&gt; string</td><td colspan="2">Conditional cell styling</td></tr>
              <tr><td>badgeTones</td><td>Record&lt;value, tone&gt;</td><td colspan="2">Maps a value to primary / success / warning / danger / info / neutral</td></tr>
              <tr><td>hidden / fixed</td><td>boolean</td><td colspan="2">Hide without removing; <code>fixed</code> keeps it out of the column toggle</td></tr>
            </tbody>
          </table>

          <h2>Formula column</h2>
          <p style="font-size:13.5px">The Net total column above is <code>=qty*price/1.5</code> — computed per row, sortable, and included in the footer sum.</p>

          <h2>Density</h2>
          <div v-for="s in ['small','normal','large']" :key="s" style="margin-block-end:18px">
            <span class="cell__tag">size="{{ s }}"</span>
            <ApexDataTable :value="SALES.slice(0,4)" :columns="SALES_COLUMNS.slice(0,6)" :size="s" grid-lines="both" />
          </div>

          <h2>Grid lines</h2>
          <div v-for="g in ['none','horizontal','vertical','both']" :key="g" style="margin-block-end:18px">
            <span class="cell__tag">grid-lines="{{ g }}"</span>
            <ApexDataTable :value="SALES.slice(0,4)" :columns="SALES_COLUMNS.slice(0,6)" :grid-lines="g" />
          </div>
          <span class="cell__tag">:grid-line-size="2" grid-line-color="#0B5FFF"</span>
          <ApexDataTable :value="SALES.slice(0,4)" :columns="SALES_COLUMNS.slice(0,6)" grid-lines="both"
                           :grid-line-size="2" grid-line-color="#A6C5FF" />

          <h2>Striped rows</h2>
          <span class="cell__tag">striped stripe-color="color-mix(in srgb, var(--accent-primary) 7%, transparent)"</span>
          <ApexDataTable :value="SALES.slice(0,6)" :columns="SALES_COLUMNS.slice(0,6)" striped
                         stripe-color="color-mix(in srgb, var(--accent-primary) 7%, transparent)" />
          <p style="font-size:13px;margin-top:8px">The gallery passes a fixed
            <code>#EAF2FF</code> here, which is light-mode only: in dark mode the striped
            rows keep that pale fill and their own text disappears into it. A stripe is a
            tint of the surface it sits on, so it wants a token or a
            <code>color-mix</code>, not a hex. Omit <code>stripeColor</code> entirely and
            the control uses its own themed default.</p>

          <h2>Colours</h2>
          <p style="font-size:13.5px">Chrome is props: <code>headerBackground</code>,
            <code>borderColor</code>, <code>gridLineColor</code> and <code>stripeColor</code>
            dress the whole table, and any column can override the body with its own
            <code>background</code>, <code>color</code> or <code>headerBackground</code> —
            the Country column below does.</p>
          <div class="grid grid--2">
            <div class="cell" style="overflow:auto">
              <span class="cell__tag">table-level chrome</span>
              <ApexDataTable :value="SALES.slice(0,5)" :columns="SALES_COLUMNS.slice(0,5)"
                             header-background="color-mix(in srgb, var(--accent-primary) 12%, transparent)"
                             border-color="var(--accent-primary)"
                             grid-line-color="color-mix(in srgb, var(--accent-primary) 25%, transparent)"
                             grid-lines="both" />
            </div>
            <div class="cell" style="overflow:auto">
              <span class="cell__tag">per-column override</span>
              <ApexDataTable :value="SALES.slice(0,5)" :columns="COLOURED_COLUMNS" striped />
            </div>
          </div>

          <h2>Selection</h2>
          <p style="font-size:13.5px">Arrow keys move focus, Space or Enter toggles the focused row, Shift+arrow extends a range. Radio and checkbox modes give an explicit control column.</p>
          <div style="margin-top:14px">
            <span class="cell__tag">selection-mode="radio"</span>
            <ApexDataTable v-model:selection="selRadio" :value="SALES.slice(0,5)" :columns="SALES_COLUMNS.slice(0,6)"
                             selection-mode="radio" data-key="id" show-selection-count />
          </div>
          <div style="margin-top:18px">
            <span class="cell__tag">selection-mode="checkbox" selection-color="#137C4A" footer-mode="selected"</span>
            <ApexDataTable v-model:selection="selCheck" :value="SALES.slice(0,6)" :columns="SALES_COLUMNS"
                             selection-mode="checkbox" data-key="id" show-selection-count
                             selection-color="#137C4A" footer-mode="selected" />
          </div>

          <h2>Scrollable with a sticky header</h2>
          <ApexDataTable :value="SALES.slice(0,40)" :columns="SALES_COLUMNS.slice(0,6)" scrollable scroll-height="260px" />

          <h2>Frozen columns and rows</h2>
          <p style="font-size:13.5px">Order and Product are pinned to the left, Signed and Verified to the right, and the first three rows stay put while the body scrolls. Offsets are measured, so any number of columns and rows stack correctly.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(3, 22)" :columns="FROZEN_COLUMNS" :frozen-value="SALES.slice(0,3)"
                             scrollable scroll-height="260px" table-min-width="1200px" grid-lines="both" striped />
          </div>

          <h2>Image cells</h2>
          <p style="font-size:13.5px">A column with <code>format: 'image'</code> renders a thumbnail from the field value, sized by <code>imageSize</code> and shaped by <code>imageRadius</code>. Any column can also carry a <code>subField</code> for a quieter second line — here the SKU under the product name. The thumbnails below are flat placeholder swatches, not photographs.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(0,6)" :columns="IMAGE_COLUMNS" data-key="id" grid-lines="horizontal" />
          </div>
          <div style="margin-top:18px">
            <span class="cell__tag">imageRadius="var(--r-full)" — avatar shape</span>
            <ApexDataTable :value="SALES.slice(6,10)" :columns="AVATAR_COLUMNS" data-key="id" grid-lines="none" />
          </div>

          <h2>Cell edit</h2>
          <p style="font-size:13.5px">With <code>editMode="cell"</code>, clicking a cell whose column is <code>editable</code> swaps it for an editor chosen by <code>editorType</code>. Enter commits, Escape reverts, blur commits. <code>cell-edit-complete</code> reports <code>{ data, field, value, newValue }</code>; <code>commitEdits</code> (on by default) also writes into the row, so local data just works. Formula and footer columns recompute as you go.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="editCellData" :columns="EDIT_COLUMNS" edit-mode="cell" data-key="id"
                             selection-mode="checkbox" v-model:selection="editSel" show-selection-count
                             grid-lines="both" show-footer @cell-edit-complete="onCellEdit" />
          </div>
          <p style="font-size:13px;margin-top:8px">Last edits: <code>{{ editLog.length ? editLog.join(' · ') : 'none yet' }}</code></p>

          <h2>Row edit</h2>
          <p style="font-size:13.5px"><code>editMode="row"</code> adds a control column: the pencil puts a row into edit, the tick saves, the cross reverts. Every editable cell becomes an editor at once, edits are held in a draft until you save, and <code>row-edit-save</code> reports <code>{ data, newData, index }</code>. <code>editingRows</code> is bindable, so you can open a row programmatically.</p>
          <div style="margin-top:12px">
            <ApexDataTable v-model:editing-rows="editingRowRefs" :value="editRowsData" :columns="EDIT_COLUMNS"
                             edit-mode="row" data-key="id" grid-lines="horizontal" striped show-footer
                             @row-edit-save="onRowSave" />
          </div>
          <p style="font-size:13px;margin-top:8px">Editing: <code>{{ editingRowRefs.length ? editingRowRefs.map(function(r){return r.id;}).join(', ') : 'none' }}</code></p>

          <h2>Filter — row display</h2>
          <p style="font-size:13.5px">Set <code>filterDisplay="row"</code> and mark columns with <code>filter: true</code>. Each column picks its editor from <code>filterType</code> — text, number, select, multiselect, date or boolean — and filters as you type. The global search in the metabar binds to <code>filters.global</code> and covers <code>globalFilterFields</code>.</p>
          <div style="margin-top:12px">
            <ApexDataTable v-model:filters="rowFilters" :value="SALES" :columns="FILTER_COLUMNS"
                             filter-display="row" show-global-filter data-key="id"
                             :global-filter-fields="['id','product','country','rep']"
                             paginator :rows="6" grid-lines="both" striped
                             empty-message="No orders match these filters" />
          </div>

          <h2>Filter — menu display</h2>
          <p style="font-size:13.5px">With <code>filterDisplay="menu"</code> each filterable header gets a trigger icon. The popover exposes a match mode per rule and stacks up to <code>maxConstraints</code> rules joined by AND/OR, with Apply and Clear. The badge shows how many rules are live.</p>
          <div style="margin-top:12px">
            <ApexDataTable v-model:filters="menuFilters" :value="SALES" :columns="FILTER_COLUMNS"
                             filter-display="menu" show-global-filter data-key="id"
                             paginator :rows="6" grid-lines="horizontal" />
          </div>

          <h2>Row group — subheader</h2>
          <p style="font-size:13.5px">Group with <code>groupRowsBy</code>. The group field leads the sort automatically so groups stay contiguous. <code>showGroupFooter</code> adds a per-group aggregate row from each column's <code>groupAggregate</code> — total sales per country, here.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(0,24)" :columns="GROUP_COLUMNS" group-rows-by="country"
                             show-group-footer show-footer data-key="id" grid-lines="horizontal" />
          </div>

          <h2>Row group — custom header and footer</h2>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(0,24)" :columns="GROUP_COLUMNS" group-rows-by="country"
                             show-group-footer data-key="id" grid-lines="horizontal">
              <template #groupheader="{ value, rows }">
                <span class="dt-gh">
                  <ApexIcon name="public" :size="18" />
                  <strong>{{ value }}</strong>
                  <em>{{ rows.length }} orders · {{ sumQty(rows) }} units</em>
                </span>
              </template>
            </ApexDataTable>
          </div>

          <h2>Row group — expandable</h2>
          <p style="font-size:13.5px"><code>expandableRowGroups</code> makes each header a toggle; <code>expandedRowGroups</code> is bindable.</p>
          <div style="margin-top:12px">
            <ApexDataTable v-model:expanded-row-groups="openGroupKeys" :value="SALES.slice(0,24)"
                             :columns="GROUP_COLUMNS" group-rows-by="rep" expandable-row-groups
                             show-group-footer data-key="id" grid-lines="horizontal" striped />
          </div>

          <h2>Row group — rowspan</h2>
          <p style="font-size:13.5px"><code>rowGroupMode="rowspan"</code> drops the header rows and spans the grouping column across its group instead.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(0,18)" :columns="GROUP_COLUMNS" group-rows-by="country"
                             row-group-mode="rowspan" data-key="id" grid-lines="both" />
          </div>

          <h2>Row expansion</h2>
          <p style="font-size:13.5px">With <code>rowExpansion</code> a chevron column opens a detail row beneath. The <code>expansion</code> slot receives <code>{ row, index }</code>; without it you get an automatic definition list of every column. <code>expandOnRowClick</code> makes the whole row the trigger, <code>singleExpand</code> keeps one open at a time.</p>
          <div style="margin-top:12px">
            <ApexDataTable v-model:expanded-rows="openRows" :value="SALES.slice(0,6)"
                             :columns="EXPAND_COLUMNS" row-expansion data-key="id" grid-lines="horizontal">
              <template #expansion="{ row }">
                <div class="dt-detail">
                  <div>
                    <h4>{{ row.product }}</h4>
                    <p class="dt-detail__sku">{{ row.id }} · {{ row.country }}</p>
                    <ApexRating :model-value="Math.round(row.margin * 12)" :stars="5" readonly :star-size="18" show-value />
                  </div>
                  <dl>
                    <div><dt>Representative</dt><dd>{{ row.rep }}</dd></div>
                    <div><dt>Quantity</dt><dd>{{ row.qty }} units</dd></div>
                    <div><dt>Unit price</dt><dd>€{{ row.price.toFixed(2) }}</dd></div>
                    <div><dt>Net total</dt><dd>€{{ (row.qty * row.price / 1.5).toFixed(2) }}</dd></div>
                    <div><dt>Signed</dt><dd>{{ row.signed.toLocaleDateString() }}</dd></div>
                    <div><dt>Verified</dt><dd>{{ row.verified ? 'Yes' : 'No' }}</dd></div>
                  </dl>
                </div>
              </template>
            </ApexDataTable>
          </div>
          <p style="font-size:13px;margin-top:8px">Open: <code>{{ openRows.length ? openRows.map(function(r){return r.id;}).join(', ') : 'none' }}</code></p>

          <div style="margin-top:22px">
            <span class="cell__tag">expand-on-row-click single-expand — default detail panel</span>
            <ApexDataTable v-model:expanded-rows="openRows2" :value="SALES.slice(6,11)"
                             :columns="EXPAND_COLUMNS" row-expansion expand-on-row-click single-expand
                             data-key="id" grid-lines="horizontal" striped />
          </div>

          <h2>Freeze rows on demand</h2>
          <p style="font-size:13.5px">With <code>rowFreeze</code> a padlock column appears. Click it to pin a row above the scrolling body; click again to release it. <code>frozenValue</code> is bindable, so the pinned set is yours to read.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(0,18)" :columns="SALES_COLUMNS.slice(0,8)"
                             v-model:frozen-value="pinnedRows" row-freeze data-key="id"
                             scrollable scroll-height="240px" striped grid-lines="horizontal" />
          </div>
          <p style="font-size:13px;margin-top:8px">Pinned: <code>{{ pinnedRows.length ? pinnedRows.map(function(r){return r.id;}).join(', ') : 'none' }}</code></p>

          <h2>Conditional styling</h2>
          <p style="font-size:13.5px">A <code>rowClass</code> callback marks unqualified orders, and the margin column colours itself below 15%.</p>
          <div style="margin-top:12px">
            <ApexDataTable :value="SALES.slice(0,8)" :columns="CONDITIONAL_COLUMNS" :row-class="rowTone" grid-lines="horizontal" />
          </div>

          <h2>States</h2>
          <span class="cell__tag">loading loading-mode="skeleton"</span>
          <ApexDataTable :value="SALES.slice(0,4)" :columns="SALES_COLUMNS.slice(0,6)" loading loading-mode="skeleton" />
          <div style="margin-top:18px">
            <span class="cell__tag">loading (overlay)</span>
            <ApexDataTable :value="SALES.slice(0,4)" :columns="SALES_COLUMNS.slice(0,6)" loading />
          </div>
          <div style="margin-top:18px">
            <span class="cell__tag">empty</span>
            <ApexDataTable :value="[]" :columns="SALES_COLUMNS.slice(0,6)" empty-message="No orders match this filter" />
          </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexDataTable — twenty-four of them, the largest set
 * in the library.
 *
 * Ported from the gallery's own section block, which is split in TWO across
 * the page: an earlier session measured only the first and reported the table
 * as having 2 sections when it has 24 (§5.3). The column definitions are
 * derived from SALES_COLUMNS exactly as the gallery derives them, rather than
 * written out again, so a change to a shared column reaches every example.
 */
import { ref } from 'vue';
import {
  SALES, SALES_COLUMNS, STATUS_OPTIONS, COUNTRY_OPTIONS,
} from '../../registry';

type Col = Record<string, unknown>;
type Row = Record<string, unknown>;
const copy = (c: Col, extra: Col): Col => ({ ...c, ...extra });

/* ── the column sets, each a view of SALES_COLUMNS ─────────────── */
const FROZEN_COLUMNS = SALES_COLUMNS.map((c) => {
  if (c.field === 'id') return copy(c, { frozen: true, width: '110px' });
  if (c.field === 'product') return copy(c, { frozen: true, width: '150px' });
  if (c.field === 'verified' || c.field === 'signed') return copy(c, { frozen: true, alignFrozen: 'right' });
  return c;
});

const CONDITIONAL_COLUMNS = SALES_COLUMNS.map((c) => {
  if (c.field === 'margin') {
    return copy(c, { cellClass: (row: Row) => ((row.margin as number) < 0.15 ? 'dt-low' : undefined) });
  }
  if (c.field === 'country') {
    return copy(c, { background: 'color-mix(in srgb, var(--accent-primary) 5%, transparent)' });
  }
  return c;
});

const FILTER_COLUMNS = SALES_COLUMNS.map((c) => {
  if (c.field === 'id') return copy(c, { filter: true, filterType: 'text', filterMatchMode: 'startsWith' });
  if (c.field === 'product') return copy(c, { filter: true, filterType: 'text' });
  if (c.field === 'country') return copy(c, { filter: true, filterType: 'select', filterOptions: COUNTRY_OPTIONS });
  if (c.field === 'status') return copy(c, { filter: true, filterType: 'select', filterOptions: STATUS_OPTIONS });
  if (c.field === 'qty' || c.field === 'price') return copy(c, { filter: true, filterType: 'number', filterMatchMode: 'gte' });
  if (c.field === 'verified') return copy(c, { filter: true, filterType: 'boolean' });
  return c;
});

const GROUP_COLUMNS = SALES_COLUMNS
  .filter((c) => ['country', 'product', 'rep', 'qty', 'price'].includes(c.field as string) || c.header === 'Net total')
  .map((c) => {
    if (c.field === 'qty') return copy(c, { groupAggregate: 'sum' });
    if (c.field === 'price') return copy(c, { groupAggregate: 'avg' });
    if (c.header === 'Net total') return copy(c, { groupAggregate: 'sum' });
    return c;
  });

const DT_COLS = SALES_COLUMNS
  .filter((c) => ['product', 'country', 'category', 'status', 'qty', 'price'].includes(c.field as string))
  .map((c) => copy(c, { sortable: true }));

/* The Colours example's per-column override. The gallery's own "Colours"
   section for this control shows two ApexOrgCharts and describes node fill —
   it is ApexOrgChart's section, pasted in. Rebuilt here against what
   ApexDataTable actually offers, the same way its props table was at
   AF2-262b. */
const COLOURED_COLUMNS = SALES_COLUMNS.slice(0, 5).map((c) => (c.field === 'country'
  ? copy(c, {
    background: 'color-mix(in srgb, var(--accent-success) 10%, transparent)',
    headerBackground: 'color-mix(in srgb, var(--accent-success) 22%, transparent)',
  })
  : c));

const DT_GROUPS = [
  { header: 'Item', columns: ['product', 'category'] },
  { header: 'Fulfilment', columns: ['country', 'status'], align: 'center' },
  { header: 'Money', columns: ['qty', 'price'], align: 'end' },
];

const EXPAND_COLUMNS = SALES_COLUMNS
  .filter((c) => ['product', 'country', 'status', 'qty', 'price'].includes(c.field as string));

const BADGE_TONES = { qualified: 'success', negotiation: 'warning', renewal: 'info', new: 'primary', unqualified: 'danger' };

const IMAGE_COLUMNS = [
  { field: 'thumb', header: '', format: 'image', width: '76px', imageSize: 44, imageAlt: 'product', align: 'center' },
  { field: 'product', header: 'Product', sortable: true, subField: 'sku', minWidth: '170px' },
  { field: 'country', header: 'Country', sortable: true, minWidth: '120px' },
  { field: 'status', header: 'Status', format: 'badge', minWidth: '130px', badgeTones: BADGE_TONES },
  { field: 'qty', header: 'Qty', format: 'number', align: 'end', width: '80px' },
  { field: 'price', header: 'Unit price', format: 'currency', align: 'end', width: '130px' },
];

const AVATAR_COLUMNS = [
  { field: 'thumb', header: 'Representative', format: 'image', imageSize: 36,
    imageRadius: 'var(--r-full)', imageAlt: 'rep', subField: 'country', minWidth: '190px' },
  { field: 'rep', header: 'Name', minWidth: '150px' },
  { field: 'qty', header: 'Units', format: 'number', align: 'end', width: '90px' },
  { field: 'price', header: 'Value', format: 'currency', align: 'end', width: '130px' },
];

const EDIT_COLUMNS = [
  { field: 'thumb', header: '', format: 'image', width: '68px', imageSize: 38, imageAlt: 'product', align: 'center' },
  { field: 'product', header: 'Product', editable: true, editorType: 'select', minWidth: '160px',
    editorOptions: ['Totem 43"', 'Wall 55"', 'Menu board', 'Ticker strip', 'Window 32"', 'Kiosk 27"']
      .map((v) => ({ value: v, label: v })) },
  { field: 'rep', header: 'Representative', editable: true, editorType: 'text', minWidth: '150px' },
  { field: 'status', header: 'Status', format: 'badge', editable: true, editorType: 'select', minWidth: '140px',
    editorOptions: STATUS_OPTIONS, badgeTones: BADGE_TONES },
  { field: 'qty', header: 'Qty', format: 'number', editable: true, editorType: 'number', align: 'end', width: '90px', aggregate: 'sum' },
  { field: 'price', header: 'Unit price', format: 'currency', editable: true, editorType: 'number', align: 'end', width: '140px' },
  { header: 'Net total', formula: '=qty*price/1.5', format: 'currency', align: 'end', width: '140px', aggregate: 'sum' },
  { field: 'verified', header: 'Verified', format: 'boolean', editable: true, editorType: 'switch', align: 'center', width: '100px' },
];

/* ── the state each example owns ───────────────────────────────── */
const dtColState = ref({ order: [] as string[], widths: {} as Record<string, number>, hidden: [] as string[] });
const dtResize = ref('fit');
const dtLog = ref('');

const rowFilters = ref<Record<string, unknown>>({});
const menuFilters = ref<Record<string, unknown>>({});

const openGroupKeys = ref<string[] | null>(null);
const openRows = ref<Row[]>([]);
const openRows2 = ref<Row[]>([]);
const pinnedRows = ref<Row[]>([]);

const selCheck = ref<Row[]>([]);
const selRadio = ref<Row | null>(null);
const editSel = ref<Row[]>([]);

/* Editable copies, so the demos can write back without touching SALES. */
const editRowsData = ref(SALES.slice(0, 6).map((r) => ({ ...r })));
const editCellData = ref(SALES.slice(6, 12).map((r) => ({ ...r })));
const editingRowRefs = ref<Row[]>([]);
const editLog = ref<string[]>([]);

function onCellEdit(p: { field: string; value: unknown; newValue: unknown }) {
  editLog.value = [p.field + ': ' + JSON.stringify(p.value) + ' → ' + JSON.stringify(p.newValue)]
    .concat(editLog.value).slice(0, 4);
}
function onRowSave(p: { data: { id?: unknown } }) {
  editLog.value = ['saved ' + p.data.id].concat(editLog.value).slice(0, 4);
}
/** The group header's unit total. A helper rather than an inline reduce: the
    gallery's `rows.reduce(function(a,r){...})` has untyped parameters, which
    is two implicit-any errors in a typed SFC. */
function sumQty(rows: Row[]) { return rows.reduce((a, r) => a + Number(r.qty ?? 0), 0); }

/** Applied through rowClass, so the class never appears in the markup. */
function rowTone(row: Row) { return row.status === 'unqualified' ? 'dt-flagged' : undefined; }
</script>
