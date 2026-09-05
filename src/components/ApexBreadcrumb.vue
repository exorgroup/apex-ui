<script setup lang="ts">
/**
 * ApexBreadcrumb — the trail to the current page.
 *
 * Items are data, so a crumb is text, an icon, or both, from one shape. Long
 * trails collapse in the middle behind an ellipsis rather than wrapping, since
 * the first and last crumbs are the ones that carry meaning.
 */
import { computed, ref } from 'vue';
import ApexIcon from './ApexIcon.vue';
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

/** The full trail, home first, each crumb tagged with its real index. */
const all = computed(() => {
  const list = props.home ? [props.home, ...(props.items || [])] : [...(props.items || [])];
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

const isCurrent = (entry: { item: CrumbItem; last: boolean }) =>
  entry.item.current === true || (props.markCurrent && entry.last && entry.item.current !== false);

const tagFor = (entry: { item: CrumbItem; last: boolean }) =>
  (!isCurrent(entry) && (entry.item.href || entry.item.command) ? 'a' : 'span');

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
  <nav class="apex-bc" :style="rootStyle" :data-size="size" :data-wrap="wrap ? 'true' : 'false'"
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
                       :href="tagFor(entry) === 'a' ? (entry.item.href || '#') : undefined"
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
