<script setup lang="ts">
/**
 * ApexBreadcrumb — the trail to the current page.
 *
 * Items are data, so a crumb is text, an icon, or both, from one shape. Long
 * trails collapse in the middle behind an ellipsis rather than wrapping, since
 * the first and last crumbs are the ones that carry meaning.
 */
import { computed, markRaw, ref, toRaw } from 'vue';
import ApexIcon from './ApexIcon.vue';
import { useCan } from '../core/can';
import { allows } from '../core/menuPermissions';
import type { ApexPermission } from '../types';

/**
 * One crumb.
 *
 * A trail is not a menu — it has no submenus, no separators of its own, no
 * headers — so it gets its own shape rather than borrowing MenuItem and
 * leaving half of it inapplicable.
 *
 * `href` is a URL and `to` is a route: a crumb that names a route hands it to
 * the app's link component rather than reloading the page.
 */
export interface CrumbItem {
  label?: string;
  icon?: string;
  /** A plain URL. */
  href?: string;
  /** A route, for whatever router the app passes as `linkComponent`. */
  to?: string | Record<string, unknown>;
  target?: string;
  disabled?: boolean;
  /** Force — or forbid — the "you are here" treatment on this crumb. */
  current?: boolean;
  command?: (payload: unknown) => void;
  /**
   * Hide this crumb unless the permission resolver allows it. A trail is a
   * path, so a denied crumb truncates it: everything after it goes too, since
   * you cannot walk past a step you are not allowed to take.
   */
  can?: ApexPermission;
  /** Any payload you want back on the click event. */
  [key: string]: unknown;
}

const props = withDefaults(defineProps<{
  items?: CrumbItem[];
  /** A leading crumb, usually the site root — typically icon-only. */
  home?: CrumbItem;
  /** An icon name, or any text: '/', '›', '—'. */
  separator?: string;
  /** Collapse the middle behind an ellipsis past this many crumbs. */
  maxItems?: number;
  /** Mark the last crumb as the current page: bold, and not a link. */
  markCurrent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Let a long trail wrap instead of scrolling. */
  wrap?: boolean;
  /**
   * What to render a crumb's `to` through — RouterLink, Inertia's Link, or any
   * component taking a `to` prop. Without it a string `to` falls back to an
   * href, so plain URLs still work with no router in the app.
   */
  linkComponent?: unknown;
  /* chrome */
  color?: string;
  activeColor?: string;
  hoverColor?: string;
  separatorColor?: string;
  gap?: string;
  background?: string;
  padding?: string;
  radius?: string;
}>(), {
  separator: 'chevron_right', markCurrent: true, size: 'md',
});

const emit = defineEmits<{
  (e: 'item-click', payload: { item: CrumbItem; index: number; originalEvent: MouseEvent }): void;
}>();

const expanded = ref(false);
const can = useCan();

/** The trail as written, home first — home counts as the first crumb. */
const full = computed(() =>
  (props.home ? [props.home, ...(props.items || [])] : [...(props.items || [])]));

/**
 * The trail this user may walk.
 *
 * A breadcrumb is not a menu, so it does not filter — it truncates. The trail
 * is a path: Venue › Events › Shows › Seats says how you got here, and each
 * crumb is only reachable through the one before it. Deny Shows and the honest
 * answer is Venue › Events, stopping there. Dropping just the denied crumb
 * would leave Venue › Events › Seats, which offers a way in that does not
 * exist — and would be a lie about the route even when the user can reach
 * Seats by some other path, because that is not the path this trail describes.
 *
 * Deny the first crumb and there is no trail at all.
 */
const walkable = computed(() => {
  const list = full.value;
  const stop = list.findIndex((it) => !allows(it.can, can));
  return stop === -1 ? list : list.slice(0, stop);
});

/** True when the trail was cut short — the page you are on is not in it. */
const cutShort = computed(() => walkable.value.length < full.value.length);

/** The walkable trail, each crumb tagged with its index within it. */
const all = computed(() => {
  const list = walkable.value;
  return list.map((item, i) => ({ item, index: i, last: i === list.length - 1 }));
});

/* Keeps the first crumb and the last two: enough to say where you are and how
   you got in, which is what a trail is for. */
const shown = computed(() => {
  const list = all.value;
  const max = props.maxItems;
  if (!max || expanded.value || list.length <= max) return list.map((e) => ({ ...e, gap: false }));
  const head = list.slice(0, 1);
  const tail = list.slice(-Math.max(1, max - 2));
  return [
    ...head.map((e) => ({ ...e, gap: false })),
    { item: {} as CrumbItem, index: -1, last: false, gap: true },
    ...tail.map((e) => ({ ...e, gap: false })),
  ];
});

/*
 * The last crumb is "you are here" — unless the trail was truncated, in which
 * case it is not. Marking the last surviving crumb as the current page would
 * tell this user they are on Events when they are on Seats. It stays a plain
 * link instead: a place they can actually go. An explicit `current` on an item
 * still wins, since that is the author saying so outright.
 */
const isCurrent = (entry: { item: CrumbItem; last: boolean }) =>
  entry.item.current === true
  || (props.markCurrent && entry.last && !cutShort.value && entry.item.current !== false);

/*
 * A component arriving through a prop has been wrapped in the reactive proxy
 * that props are, and Vue warns when it is asked to render one. Unwrapping it
 * here means the caller passes RouterLink or Inertia's Link plainly, rather
 * than having to know to wrap it in markRaw() first.
 */
const linkAs = computed(() => {
  const c = props.linkComponent;
  return c ? markRaw(toRaw(c) as object) : undefined;
});

/** A string `to` doubles as an href, so a route works without a router wired. */
const hrefFor = (item: CrumbItem) =>
  item.href || (typeof item.to === 'string' ? item.to : undefined);

/**
 * A crumb is a routed link, a plain link, or text.
 *
 * `to` only becomes a routed link when the app passed something to render it
 * through; otherwise it degrades to the href above rather than rendering a
 * `to` attribute nothing will act on.
 */
function tagFor(entry: { item: CrumbItem; last: boolean }) {
  if (isCurrent(entry)) return 'span';
  if (entry.item.to !== undefined && linkAs.value) return linkAs.value;
  return hrefFor(entry.item) || entry.item.command ? 'a' : 'span';
}

/** True when this crumb is going through the app's own link component. */
const isRouted = (entry: { item: CrumbItem; last: boolean }) =>
  !isCurrent(entry) && entry.item.to !== undefined && !!linkAs.value;

function onClick(e: MouseEvent, item: CrumbItem, index: number) {
  if (item.disabled) { e.preventDefault(); return; }
  if (typeof item.command === 'function') {
    e.preventDefault();
    (item.command as (p: unknown) => void)({ item, index, originalEvent: e });
  }
  emit('item-click', { item, index, originalEvent: e });
}

/** A separator is an icon when it looks like an icon name, otherwise text. */
const separatorIsIcon = computed(() => /^[a-z0-9_]+$/.test(props.separator));

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.color) s['--bc-fg'] = props.color;
  if (props.activeColor) s['--bc-active'] = props.activeColor;
  if (props.hoverColor) s['--bc-hover'] = props.hoverColor;
  if (props.separatorColor) s['--bc-sep'] = props.separatorColor;
  if (props.gap) s['--bc-gap'] = props.gap;
  if (props.background) s['--bc-bg'] = props.background;
  if (props.padding) s['--bc-pad'] = props.padding;
  if (props.radius) s['--bc-radius'] = props.radius;
  return s;
});
</script>

<template>
  <!-- Nothing walkable means nothing to draw: an empty trail rendered as an
       empty bar is chrome describing a path this user has none of. -->
  <nav v-if="all.length" class="apex-bc" :style="rootStyle" :data-size="size"
       :data-wrap="wrap ? 'true' : 'false'" :data-truncated="cutShort ? 'true' : 'false'"
       aria-label="Breadcrumb">
    <ol class="apex-bc__list">
      <template v-for="(entry, i) in shown" :key="entry.gap ? 'gap' : entry.index">
        <li v-if="entry.gap" class="apex-bc__crumb">
          <slot name="ellipsis" :expand="() => (expanded = true)">
            <button type="button" class="apex-bc__more" aria-label="Show hidden crumbs"
                    @click="expanded = true">
              <ApexIcon name="more_horiz" :size="18" />
            </button>
          </slot>
        </li>
        <li v-else class="apex-bc__crumb" :data-current="isCurrent(entry) ? 'true' : 'false'"
            :data-disabled="entry.item.disabled ? 'true' : 'false'">
          <slot name="item" :item="entry.item" :index="entry.index" :is-current="isCurrent(entry)">
            <component :is="tagFor(entry)" class="apex-bc__link"
                       :href="tagFor(entry) === 'a' ? (hrefFor(entry.item) || '#') : undefined"
                       :to="isRouted(entry) ? entry.item.to : undefined"
                       :target="entry.item.target"
                       :aria-current="isCurrent(entry) ? 'page' : undefined"
                       @click="onClick($event, entry.item, entry.index)">
              <ApexIcon v-if="entry.item.icon" :name="entry.item.icon" class="apex-bc__icon" />
              <span v-if="entry.item.label" class="apex-bc__label">{{ entry.item.label }}</span>
            </component>
          </slot>
        </li>
        <li v-if="i < shown.length - 1" class="apex-bc__sepwrap" aria-hidden="true">
          <slot name="separator">
            <ApexIcon v-if="separatorIsIcon" :name="separator" class="apex-bc__sep" />
            <span v-else class="apex-bc__sep apex-bc__sep--text">{{ separator }}</span>
          </slot>
        </li>
      </template>
    </ol>
  </nav>
</template>
