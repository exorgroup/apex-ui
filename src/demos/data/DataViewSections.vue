<template>
          <h2>Building an item template</h2>
          <p style="font-size:13.5px">ApexDataView owns the shell — bar, paging, layout, states — and hands each record to a slot. Everything inside is your own markup: plain HTML, your CSS classes, and any Apex control. The slot gives you <code>{ item, index, layout }</code>.</p>

          <div class="dv-split">
            <div>
              <span class="cell__tag">the template</span>
              <pre class="doc-pre" v-pre>&lt;ApexDataView :value="orders" layout="list" data-key="id"&gt;
    &lt;template #item="{ item }"&gt;
      &lt;div class="product"&gt;
        &lt;img :src="item.thumb" :alt="item.product" /&gt;

        &lt;div class="product__body"&gt;
          &lt;span class="product__eyebrow"&gt;{{ item.country }}&lt;/span&gt;
          &lt;h4&gt;{{ item.product }}&lt;/h4&gt;
          &lt;ApexBadge :value="item.qty + ' units'" severity="success" /&gt;
        &lt;/div&gt;

        &lt;div class="product__end"&gt;
          &lt;strong&gt;{{ money(item.price) }}&lt;/strong&gt;
          &lt;ApexButton size="sm" icon="shopping_cart"&gt;Order&lt;/ApexButton&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/template&gt;
  &lt;/ApexDataView&gt;</pre>
              <span class="cell__tag" style="margin-top:14px">your CSS</span>
              <pre class="doc-pre" v-pre>.product { display: flex; align-items: center; gap: 18px }
  .product img { width: 84px; height: 84px; border-radius: 6px;
                 object-fit: cover; flex: 0 0 auto }
  .product__body { display: flex; flex-direction: column;
                   align-items: flex-start; gap: 7px; flex: 1 1 auto }
  .product__end  { display: flex; flex-direction: column;
                   align-items: flex-end; gap: 10px }</pre>
            </div>
            <div>
              <span class="cell__tag">the result</span>
              <ApexDataView :value="SALES.slice(0,3)" data-key="id" layout="list">
                <template #item="{ item }">
                  <div class="dv-list">
                    <img :src="item.thumb" :alt="item.product" />
                    <div class="dv-list__body">
                      <span class="dv-eyebrow">{{ item.country }}</span>
                      <h4>{{ item.product }}</h4>
                      <span class="apex-dt__badge" data-tone="success">{{ item.qty }} units</span>
                    </div>
                    <div class="dv-list__end">
                      <strong>{{ money(item.price) }}</strong>
                      <ApexButton size="sm" icon="shopping_cart">Order</ApexButton>
                    </div>
                  </div>
                </template>
              </ApexDataView>

              <span class="cell__tag" style="margin-top:16px">same records, a grid template</span>
              <ApexDataView :value="SALES.slice(0,4)" data-key="id" layout="grid" grid-min-width="150px">
                <template #grid="{ item }">
                  <div class="dv-card">
                    <img :src="item.thumb" :alt="item.product" />
                    <h4>{{ item.product }}</h4>
                    <div class="dv-card__foot"><strong>{{ money(item.price) }}</strong></div>
                  </div>
                </template>
              </ApexDataView>
            </div>
          </div>

          <h2>Grid layout</h2>
          <p style="font-size:13.5px">The grid is built in — <code>gridMinWidth</code> sets the smallest acceptable card and the row fits as many as will go. A <code>gap</code> of 0 keeps the cards on a shared hairline; give it a length for separated cards.</p>
          <div style="margin-top:12px">
            <ApexDataView v-model:layout="dvLayout2" :value="SALES.slice(0,8)" data-key="id"
                            caption="Catalogue" show-layout-switcher grid-min-width="200px">
              <template #grid="{ item }">
                <div class="dv-card">
                  <img :src="item.thumb" :alt="item.product" />
                  <span class="dv-eyebrow">{{ item.country }}</span>
                  <h4>{{ item.product }}</h4>
                  <div class="dv-card__foot"><strong>{{ money(item.price) }}</strong></div>
                </div>
              </template>
              <template #list="{ item }">
                <div class="dv-list">
                  <img :src="item.thumb" :alt="item.product" />
                  <div class="dv-list__body"><span class="dv-eyebrow">{{ item.country }}</span><h4>{{ item.product }}</h4></div>
                  <div class="dv-list__end"><strong>{{ money(item.price) }}</strong></div>
                </div>
              </template>
            </ApexDataView>
          </div>

          <h2>Sorting</h2>
          <p style="font-size:13.5px">Sorting is driven by the <code>sortField</code> and <code>sortOrder</code> bindings, so any UI can control it. Pass <code>sortOptions</code> and you get a select for free; bind the props yourself for anything else.</p>
          <div style="margin-top:12px">
            <ApexDataView v-model:sort-field="dvSortField" v-model:sort-order="dvSortOrder"
                            :value="SALES.slice(0,10)" :sort-options="DV_SORT" data-key="id"
                            caption="Orders" paginator :rows="4">
              <template #item="{ item }">
                <div class="dv-list">
                  <img :src="item.thumb" :alt="item.product" />
                  <div class="dv-list__body">
                    <span class="dv-eyebrow">{{ item.id }} · {{ item.country }}</span>
                    <h4>{{ item.product }}</h4>
                    <span class="apex-dt__badge" :data-tone="stockTone(item)">{{ item.qty }} units</span>
                  </div>
                  <div class="dv-list__end"><strong>{{ money(item.price) }}</strong></div>
                </div>
              </template>
            </ApexDataView>
          </div>
          <p style="font-size:13px;margin-top:8px">Sorting by <code>{{ dvSortField }}</code> {{ dvSortOrder === 1 ? 'ascending' : 'descending' }}</p>

          <h2>Pagination</h2>
          <p style="font-size:13.5px">The same <code>ApexPaginator</code> the table uses, with a bindable <code>first</code> and a page-size selector.</p>
          <div style="margin-top:12px">
            <ApexDataView v-model:first="dvFirst" :value="SALES" data-key="id" layout="grid" paginator
                            :rows="6" :rows-per-page-options="[6, 12, 24]" grid-min-width="180px">
              <template #grid="{ item }">
                <div class="dv-card">
                  <img :src="item.thumb" :alt="item.product" />
                  <h4>{{ item.product }}</h4>
                  <div class="dv-card__foot"><strong>{{ money(item.price) }}</strong></div>
                </div>
              </template>
            </ApexDataView>
          </div>
          <p style="font-size:13px;margin-top:8px">First visible record: <code>{{ dvFirst }}</code></p>

          <h2>Loading and empty</h2>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">loading (skeleton)</span>
              <ApexDataView :value="[]" loading :skeleton-count="3" />
            </div>
            <div class="cell">
              <span class="cell__tag">empty</span>
              <ApexDataView :value="[]" empty-message="No products in this category" />
            </div>
          </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexDataView.
 *
 * Ported from the gallery's own section block (APEX UI Gallery.html), which is
 * what the gallery actually runs. Its state lived on one enormous Options-API
 * instance shared by every control; here each control's examples own theirs,
 * which is the point of the split — App.vue was already 10,500 lines before
 * the nine data controls had a single section between them.
 */
import { ref } from 'vue';
import { SALES } from '../../registry';

const DV_SORT = [
  { label: 'Price — high to low', field: 'price', order: -1 },
  { label: 'Price — low to high', field: 'price', order: 1 },
  { label: 'Product A–Z', field: 'product', order: 1 },
  { label: 'Quantity — most first', field: 'qty', order: -1 },
];
const dvFirst = ref(0);
const dvLayout2 = ref('grid');
const dvSortField = ref('price');
const dvSortOrder = ref(-1);

const money = (n: number) => '€' + Number(n).toFixed(2);

const stockTone = (row: { qty: number }) =>
  (row.qty > 15 ? 'success' : row.qty > 5 ? 'warning' : 'danger');
</script>
