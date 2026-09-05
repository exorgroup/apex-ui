<script setup lang="ts">
/**
 * ApexMegaMenu — a nav bar whose submenus open as full panels.
 *
 * The model carries the panel: a root item holds `columns`, and a column holds
 * links, an optional heading, an optional heading image, and a `cards` layout
 * for image tiles. A `panel` block adds a promo region beside the columns. That
 * covers the shapes real mega menus take — a plain link grid, thumbnails over
 * each column, a card row, a featured image with a call to action — without the
 * consumer rebuilding the overlay each time.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import { useCan } from '../core/can';
import { filterMega } from '../core/menuPermissions';
import type { ApexPermission } from '../types';

export interface MegaLink {
  label?: string;
  /** Second line under the label. */
  help?: string;
  icon?: string;
  /** Thumbnail — a URL, shown instead of the icon. */
  image?: string;
  imageAlt?: string;
  badge?: string | number;
  href?: string;
  target?: string;
  command?: (payload: unknown) => void;
  disabled?: boolean;
  /** Hide this link unless the permission resolver allows it. */
  can?: ApexPermission;
}

export interface MegaColumn {
  header?: string;
  headerIcon?: string;
  /** Image above the column, the way a category thumbnail sits over its links. */
  image?: string;
  imageAlt?: string;
  /** list is stacked links; cards is a grid of image tiles. */
  layout?: 'list' | 'cards';
  /** Columns this one spans in the panel grid. */
  span?: number;
  items?: MegaLink[];
  /** A link under the column, e.g. "Shop all". */
  footer?: MegaLink;
  /**
   * Hide the whole column unless the resolver allows it. A column left with no
   * links after its own items are filtered goes too — see core/menuPermissions.
   */
  can?: ApexPermission;
}

export interface MegaPanel {
  /** A featured image beside the columns. */
  image?: string;
  imageAlt?: string;
  title?: string;
  text?: string;
  href?: string;
  linkLabel?: string;
  /** Image tiles under the columns — the "featured brands" row. */
  cards?: MegaLink[];
}

export interface MegaItem {
  label?: string;
  icon?: string;
  href?: string;
  target?: string;
  command?: (payload: unknown) => void;
  disabled?: boolean;
  columns?: MegaColumn[];
  panel?: MegaPanel;
  /**
   * Hide this root item unless the resolver allows it. An item whose columns
   * all go is dropped with them — see core/menuPermissions.
   */
  can?: ApexPermission;
}

const props = withDefaults(defineProps<{
  items?: MegaItem[];
  orientation?: 'horizontal' | 'vertical';
  /** Open a panel on hover, or only on click. */
  trigger?: 'hover' | 'click';
  /** Panel columns, when a column does not set its own span. */
  columnMinWidth?: string;
  /** Card tile width in the cards layout. */
  cardMinWidth?: string;
  /** Where a panel's featured image sits relative to the columns. */
  panelImagePosition?: 'end' | 'start';
  /* chrome */
  background?: string;
  panelBackground?: string;
  borderColor?: string;
  radius?: string;
  padding?: string;
  activeColor?: string;
  zIndex?: number;
}>(), {
  orientation: 'horizontal', trigger: 'hover',
  columnMinWidth: '190px', cardMinWidth: '150px',
  panelImagePosition: 'end', zIndex: 900,
});

const emit = defineEmits<{
  (e: 'item-click', payload: { item: MegaItem | MegaLink; originalEvent: MouseEvent }): void;
}>();

/*
 * The panel is filtered at all three levels — root item, column, link — and the
 * levels cascade: a column emptied of its links is a heading over blank space,
 * and a root item emptied of its columns opens onto nothing.
 *
 * Inside a computed because useCan() injects at setup, and because a resolver
 * that reads reactive state — permissions arriving with the page — must be
 * able to change the bar when it does.
 */
const can = useCan();
const shown = computed(() => filterMega(props.items, can));

const openIndex = ref(-1);

/*
 * openIndex points into the rendered bar, so it has to close when that bar
 * changes shape. Denying a root item shifts the ones after it left, and a
 * stale index would open a different item's panel. The filter returns the same
 * array when nothing was denied, so this fires only on a real change.
 */
watch(shown, () => { openIndex.value = -1; });
const root = ref<HTMLElement | null>(null);

/* A panel is pinned to its root item, so one opened from the right-hand end of
   the bar would run off screen. Its inline start is computed on open — or, in a
   vertical menu with room on the other side, it flips. */
const start = ref<number | null>(null);
const flip = ref(false);
let closeTimer: number | null = null;

function fit() {
  const el = root.value?.querySelector<HTMLElement>('.apex-mega__panel');
  const li = el?.parentElement;
  if (!el || !li) return;
  /* Computed from the ROOT ITEM's rect plus the panel's layout width, never from
     the panel's own rect: that rect already carries the offset written for the
     previously open panel, so measuring it feeds a stale number back in.
     clientWidth, not innerWidth, or the scrollbar's width is left overflowing. */
  const pad = 8;
  const vw = document.documentElement.clientWidth;
  const box = li.getBoundingClientRect();
  const w = el.offsetWidth;
  const base = props.orientation === 'vertical' ? box.width + 6 : 0;

  if (props.orientation === 'vertical' && box.left + base + w > vw - pad && box.left - 6 - w >= pad) {
    flip.value = true;
    start.value = null;
    return;
  }
  flip.value = false;
  // pull left only as far as needed, and never past the viewport's start edge
  const fitted = Math.max(pad - box.left, Math.min(base, vw - pad - w - box.left));
  start.value = fitted;
}

watch(openIndex, (v) => {
  if (v < 0) { start.value = null; flip.value = false; return; }
  nextTick(fit);
});

const hasPanel = (item: MegaItem) => !!(item.columns?.length || item.panel);

function open(i: number) {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  openIndex.value = i;
}
function close() {
  /* A short delay, so the pointer can cross the gap between the bar and the
     panel without the panel vanishing underneath it. */
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => { openIndex.value = -1; closeTimer = null; }, 140);
}
  /* Hover switches panels once one is open, whatever the trigger: a menu that
     needed a second click for every sibling reads as broken. In click mode the
     first panel still waits for a click. */
function onEnter(i: number, item: MegaItem) {
  const armed = props.trigger === 'hover' || openIndex.value >= 0;
  if (!armed) return;
  if (hasPanel(item)) { open(i); return; }
  // a plain link is not a panel, so moving onto it dismisses the open one
  if (openIndex.value >= 0) close();
}
function onRootClick(e: MouseEvent, item: MegaItem, i: number) {
  if (item.disabled) return;
  if (hasPanel(item)) {
    e.preventDefault();
    if (openIndex.value === i) close();
    else open(i);
    return;
  }
  openIndex.value = -1;
  item.command?.({ item, originalEvent: e });
  emit('item-click', { item, originalEvent: e });
}
function onLink(e: MouseEvent, link: MegaLink) {
  if (link.disabled) return;
  openIndex.value = -1;
  link.command?.({ item: link, originalEvent: e });
  emit('item-click', { item: link, originalEvent: e });
}

function onDocPointer(e: PointerEvent) {
  if (!root.value?.contains(e.target as Node)) openIndex.value = -1;
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') openIndex.value = -1;
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', onDocPointer, true);
  document.addEventListener('keydown', onKey, true);
}
onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer);
  if (typeof document === 'undefined') return;
  document.removeEventListener('pointerdown', onDocPointer, true);
  document.removeEventListener('keydown', onKey, true);
});

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--mega-colw': props.columnMinWidth, '--mega-cardw': props.cardMinWidth };
  if (props.background) s['--mega-bg'] = props.background;
  if (props.panelBackground) s['--mega-panel-bg'] = props.panelBackground;
  if (props.borderColor) s['--mega-border'] = props.borderColor;
  if (props.radius) s['--mega-radius'] = props.radius;
  if (props.padding) s['--mega-pad'] = props.padding;
  if (props.activeColor) s['--mega-active'] = props.activeColor;
  /* Only a menu with an open panel takes a stacking context: with every menu on
     z-index:900, a later sibling in the DOM painted over an earlier one's panel. */
  if (openIndex.value >= 0) s.zIndex = String(props.zIndex);
  return s;
});
</script>

<template>
  <div ref="root" class="apex-mega" :style="rootStyle" :data-orientation="orientation">
    <div v-if="$slots.start" class="apex-mega__edge"><slot name="start" /></div>

    <ul class="apex-mega__bar" role="menubar">
      <li v-for="(item, i) in shown" :key="i" class="apex-mega__root"
          :data-open="openIndex === i ? 'true' : 'false'"
          @mouseenter="onEnter(i, item)" @mouseleave="close()">
        <component :is="item.href && !hasPanel(item) ? 'a' : 'button'" class="apex-mega__rootlink"
                   :type="item.href && !hasPanel(item) ? undefined : 'button'"
                   :href="item.href" :target="item.target" role="menuitem"
                   :aria-haspopup="hasPanel(item) ? 'true' : undefined"
                   :aria-expanded="hasPanel(item) ? openIndex === i : undefined"
                   :data-disabled="item.disabled ? 'true' : 'false'"
                   @click="onRootClick($event, item, i)">
          <ApexIcon v-if="item.icon" :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
          <ApexIcon v-if="hasPanel(item)" :name="orientation === 'vertical' ? 'chevron_right' : 'expand_more'"
                    :size="17" class="apex-mega__chev" />
        </component>

        <div v-if="hasPanel(item) && openIndex === i" class="apex-mega__panel"
             :data-image="item.panel?.image ? panelImagePosition : 'none'"
             :data-flip="flip ? 'true' : 'false'"
             :style="start !== null && !flip ? { insetInlineStart: start + 'px' } : undefined" role="menu">
          <slot name="panel" :item="item" :close="() => (openIndex = -1)">
            <div class="apex-mega__cols">
              <section v-for="(col, ci) in item.columns || []" :key="ci" class="apex-mega__col"
                       :style="col.span ? { gridColumn: `span ${col.span}` } : undefined">
                <img v-if="col.image" class="apex-mega__colimg" :src="col.image" :alt="col.imageAlt || col.header || ''" />
                <h4 v-if="col.header" class="apex-mega__colhead">
                  <ApexIcon v-if="col.headerIcon" :name="col.headerIcon" :size="16" />{{ col.header }}
                </h4>
                <ul class="apex-mega__list" :data-layout="col.layout || 'list'">
                  <li v-for="(link, li) in col.items || []" :key="li">
                    <slot name="item" :item="link" :layout="col.layout || 'list'">
                      <component :is="link.href ? 'a' : 'button'" class="apex-mega__link"
                                 :type="link.href ? undefined : 'button'" :href="link.href" :target="link.target"
                                 :data-disabled="link.disabled ? 'true' : 'false'" @click="onLink($event, link)">
                        <img v-if="link.image" class="apex-mega__thumb" :src="link.image" :alt="link.imageAlt || link.label || ''" />
                        <ApexIcon v-else-if="link.icon" :name="link.icon" :size="18" class="apex-mega__linkicon" />
                        <span class="apex-mega__linktext">
                          <strong>{{ link.label }}</strong>
                          <em v-if="link.help">{{ link.help }}</em>
                        </span>
                        <span v-if="link.badge" class="apex-mega__badge">{{ link.badge }}</span>
                      </component>
                    </slot>
                  </li>
                </ul>
                <a v-if="col.footer" class="apex-mega__colfoot" :href="col.footer.href || '#'"
                   @click="onLink($event, col.footer)">
                  {{ col.footer.label }}<ApexIcon name="arrow_forward" :size="16" />
                </a>
              </section>
            </div>

            <!-- featured image and copy beside the columns -->
            <aside v-if="item.panel?.image || item.panel?.title" class="apex-mega__feature">
              <img v-if="item.panel.image" :src="item.panel.image" :alt="item.panel.imageAlt || item.panel.title || ''" />
              <strong v-if="item.panel.title">{{ item.panel.title }}</strong>
              <p v-if="item.panel.text">{{ item.panel.text }}</p>
              <a v-if="item.panel.linkLabel" class="apex-mega__cta" :href="item.panel.href || '#'">
                {{ item.panel.linkLabel }}<ApexIcon name="arrow_forward" :size="16" />
              </a>
            </aside>

            <!-- image tiles under the columns -->
            <div v-if="item.panel?.cards?.length" class="apex-mega__cards">
              <a v-for="(card, di) in item.panel.cards" :key="di" class="apex-mega__card"
                 :href="card.href || '#'" @click="onLink($event, card)">
                <img v-if="card.image" :src="card.image" :alt="card.imageAlt || card.label || ''" />
                <strong>{{ card.label }}</strong>
                <em v-if="card.help">{{ card.help }}</em>
              </a>
            </div>
          </slot>
        </div>
      </li>
    </ul>

    <div v-if="$slots.end" class="apex-mega__edge"><slot name="end" /></div>
  </div>
</template>
