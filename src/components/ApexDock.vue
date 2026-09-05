<script setup lang="ts">
/**
 * ApexDock — a launcher strip of icons along an edge.
 *
 * A dock item is either a single action or a group: give it a nested `items`
 * array and it behaves like a speed dial, fanning its children out from the
 * dock rather than opening a menu panel. That keeps one slot in the strip
 * useful for a whole family of related actions.
 *
 * Magnification is CSS-driven off :hover and the two neighbouring siblings, so
 * there is no pointer tracking and no work on scroll.
 */
import { computed, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import { useCan } from '../core/can';
import { filterMenu } from '../core/menuPermissions';
import type { MenuItem } from './ApexMenuItem';

const props = withDefaults(defineProps<{
  items?: MenuItem[];
  position?: 'bottom' | 'top' | 'left' | 'right';
  /** Grow the hovered icon and its neighbours. */
  magnify?: boolean;
  /** Icon box size in pixels. */
  size?: number;
  /** Show an item's label on hover. */
  showLabels?: boolean;
  /** Distance between a group's fanned children, in pixels. */
  fanGap?: number;
  disabled?: boolean;
  /* chrome */
  gap?: string;
  padding?: string;
  radius?: string;
  background?: string;
  borderColor?: string;
  /** Blur whatever sits behind the strip. */
  blur?: boolean;
}>(), {
  position: 'bottom', magnify: true, size: 46, showLabels: true, fanGap: 8,
});

const emit = defineEmits<{
  (e: 'item-click', payload: { item: MenuItem; index: number; originalEvent: MouseEvent }): void;
}>();

/*
 * Slots the resolver denies never reach the strip, and a group left with no
 * children goes with them — an empty fan is a slot that opens onto nothing.
 *
 * Inside a computed because useCan() injects at setup, and because a resolver
 * that reads reactive state — permissions arriving with the page — must be
 * able to change the dock when it does.
 *
 * Magnification needs nothing here: it is CSS off :hover and the adjacent
 * siblings, so it follows whatever the DOM ends up holding.
 */
const can = useCan();
const shown = computed(() => filterMenu(props.items, can));

/** Index of the open group, or -1. Only one fans at a time. */
const openGroup = ref(-1);

/*
 * The open index points into the rendered strip, so it has to close when that
 * strip changes shape. Permissions arriving after first paint would otherwise
 * leave the fan open on whatever slot inherited the index. The filter returns
 * the same array when nothing was denied, so this fires only on a real change.
 */
watch(shown, () => { openGroup.value = -1; });

const vertical = computed(() => props.position === 'left' || props.position === 'right');
const isGroup = (item: MenuItem) => !!(item.items && item.items.length);

function onItem(e: MouseEvent, item: MenuItem, index: number) {
  if (props.disabled || item.disabled) return;
  if (isGroup(item)) {
    openGroup.value = openGroup.value === index ? -1 : index;
    return;
  }
  openGroup.value = -1;
  if (typeof item.command === 'function') {
    (item.command as (p: unknown) => void)({ item, index, originalEvent: e });
  }
  emit('item-click', { item, index, originalEvent: e });
}

function onChild(e: MouseEvent, child: MenuItem, parentIndex: number, index: number) {
  if (child.disabled) return;
  openGroup.value = -1;
  if (typeof child.command === 'function') {
    (child.command as (p: unknown) => void)({ item: child, index, parentIndex, originalEvent: e });
  }
  emit('item-click', { item: child, index, originalEvent: e });
}

/** Children fan away from the dock edge, one step each, staggered on open. */
function childStyle(i: number) {
  const step = props.size + props.fanGap;
  const d = (i + 1) * step;
  const axis = props.position === 'bottom' ? `translateY(${-d}px)`
    : props.position === 'top' ? `translateY(${d}px)`
      : props.position === 'left' ? `translateX(${d}px)` : `translateX(${-d}px)`;
  /* Held in a custom property so the closed state can simply not apply it. */
  return { '--dock-child-t': axis, transitionDelay: i * 35 + 'ms' };
}

const rootStyle = computed(() => {
  const s: Record<string, string> = { '--dock-size': props.size + 'px' };
  if (props.gap) s['--dock-gap'] = props.gap;
  if (props.padding) s['--dock-pad'] = props.padding;
  if (props.radius) s['--dock-radius'] = props.radius;
  if (props.background) s['--dock-bg'] = props.background;
  if (props.borderColor) s['--dock-border'] = props.borderColor;
  return s;
});
</script>

<template>
  <div class="apex-dock" :style="rootStyle" :data-position="position" :data-vertical="vertical ? 'true' : 'false'"
       :data-magnify="magnify ? 'true' : 'false'" :data-blur="blur ? 'true' : 'false'"
       :data-disabled="disabled ? 'true' : 'false'">
    <ul class="apex-dock__list" role="menubar" :aria-orientation="vertical ? 'vertical' : 'horizontal'">
      <li v-for="(item, i) in shown" :key="i" class="apex-dock__slot"
          :data-open="openGroup === i ? 'true' : 'false'">
        <!-- a group's children, fanned out speed-dial style -->
        <template v-if="isGroup(item)">
          <button v-for="(child, ci) in item.items" :key="'c' + ci" type="button"
                  class="apex-dock__item apex-dock__child" :style="childStyle(ci)"
                  :tabindex="openGroup === i ? 0 : -1" :aria-label="child.label"
                  :data-disabled="child.disabled ? 'true' : 'false'"
                  @click="onChild($event, child, i, ci)">
            <slot name="item" :item="child" :index="ci" :in-group="true">
              <ApexIcon v-if="child.icon" :name="child.icon" :size="Math.round(size * 0.46)" />
            </slot>
            <span v-if="showLabels && child.label" class="apex-dock__label">{{ child.label }}</span>
          </button>
        </template>

        <component :is="item.href && !isGroup(item) ? 'a' : 'button'" class="apex-dock__item"
                   :type="item.href && !isGroup(item) ? undefined : 'button'"
                   :href="item.href" :target="item.target" role="menuitem"
                   :aria-label="item.label" :aria-haspopup="isGroup(item) ? 'true' : undefined"
                   :aria-expanded="isGroup(item) ? openGroup === i : undefined"
                   :data-disabled="item.disabled ? 'true' : 'false'"
                   :data-group="isGroup(item) ? 'true' : 'false'"
                   @click="onItem($event, item, i)">
          <slot name="item" :item="item" :index="i" :in-group="false">
            <ApexIcon v-if="item.icon" :name="item.icon" :size="Math.round(size * 0.5)" />
          </slot>
          <span v-if="item.badge" class="apex-dock__badge">{{ item.badge }}</span>
          <span v-if="showLabels && item.label" class="apex-dock__label">{{ item.label }}</span>
          <span v-if="isGroup(item)" class="apex-dock__dot" aria-hidden="true"></span>
        </component>
      </li>
    </ul>
  </div>
</template>
