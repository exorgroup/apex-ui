<script setup lang="ts">
/**
 * ApexMenubar — a horizontal menu whose root items drop cascading submenus.
 *
 * The dropdowns are ApexMenuItem, the shared overlay row renderer, so nesting,
 * separators, headers, hints and the off-screen flip all behave as they do in
 * the context menu and split button.
 *
 * Once one menu is open, moving along the bar switches menus without another
 * click — a menubar that needed a click per root reads as broken. Moving the
 * pointer off the bar does NOT close it: like a desktop menubar, it stays until
 * a pick, a click outside, or Escape, so the pointer can travel to a row
 * without the menu disappearing on the way.
 */
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexMenuItem, { type MenuItem } from './ApexMenuItem';

const props = withDefaults(defineProps<{
  items?: MenuItem[];
  /** What opens the first menu; hover always switches once one is open. */
  trigger?: 'hover' | 'click';
  size?: 'sm' | 'md' | 'lg';
  /* chrome and colour */
  background?: string;
  borderColor?: string;
  radius?: string;
  padding?: string;
  /** Root item text. */
  textColor?: string;
  /** Root item background and text on hover. */
  hoverBackground?: string;
  hoverTextColor?: string;
  /** Root item background and text while its menu is open. */
  openBackground?: string;
  openTextColor?: string;
  iconColor?: string;
  zIndex?: number;
}>(), { trigger: 'hover', size: 'md', zIndex: 60 });

const emit = defineEmits<{
  (e: 'item-click', payload: { item: MenuItem; originalEvent: MouseEvent }): void;
}>();

const openIndex = ref(-1);
const root = ref<HTMLElement | null>(null);
/** Which side each dropdown opens on, after measuring. */
const side = ref<'end' | 'start'>('end');

const hasMenu = (item: MenuItem) => !!(item.items && item.items.length);

function fit() {
  const el = root.value?.querySelector<HTMLElement>('.apex-mbar__panel');
  const li = el?.parentElement;
  if (!el || !li) return;
  const pad = 8;
  const box = li.getBoundingClientRect();
  side.value = box.left + el.offsetWidth > document.documentElement.clientWidth - pad ? 'start' : 'end';
}

function openAt(i: number) {
  openIndex.value = i;
  side.value = 'end';
  nextTick(fit);
}
function onEnter(i: number, item: MenuItem) {
  const armed = props.trigger === 'hover' || openIndex.value >= 0;
  if (!armed) return;
  if (hasMenu(item)) { openAt(i); return; }
  if (openIndex.value >= 0) openIndex.value = -1;
}
function onRootClick(e: MouseEvent, item: MenuItem, i: number) {
  if (item.disabled) return;
  if (hasMenu(item)) {
    e.preventDefault();
    if (openIndex.value === i) openIndex.value = -1;
    else openAt(i);
    return;
  }
  openIndex.value = -1;
  if (typeof item.command === 'function') {
    (item.command as (p: unknown) => void)({ item, originalEvent: e });
  }
  emit('item-click', { item, originalEvent: e });
}
function onPick(item: MenuItem, e: MouseEvent) {
  openIndex.value = -1;
  if (typeof item.command === 'function') {
    (item.command as (p: unknown) => void)({ item, originalEvent: e });
  }
  emit('item-click', { item, originalEvent: e });
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
  if (typeof document === 'undefined') return;
  document.removeEventListener('pointerdown', onDocPointer, true);
  document.removeEventListener('keydown', onKey, true);
});

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.background) s['--mbar-bg'] = props.background;
  if (props.borderColor) s['--mbar-border'] = props.borderColor;
  if (props.radius) s['--mbar-radius'] = props.radius;
  if (props.padding) s['--mbar-pad'] = props.padding;
  if (props.textColor) s['--mbar-fg'] = props.textColor;
  if (props.hoverBackground) s['--mbar-hover-bg'] = props.hoverBackground;
  if (props.hoverTextColor) s['--mbar-hover-fg'] = props.hoverTextColor;
  if (props.openBackground) s['--mbar-open-bg'] = props.openBackground;
  if (props.openTextColor) s['--mbar-open-fg'] = props.openTextColor;
  if (props.iconColor) s['--mbar-icon'] = props.iconColor;
  return s;
});

const slots = defineSlots<{
  start?: () => unknown;
  end?: () => unknown;
  item?: (props: { item: MenuItem; depth: number; branch: boolean }) => unknown;
}>();

defineExpose({ close: () => { openIndex.value = -1; }, openIndex });
</script>

<template>
  <div ref="root" class="apex-mbar" :style="rootStyle" :data-size="size">
    <div v-if="slots.start" class="apex-mbar__edge"><slot name="start" /></div>

    <ul class="apex-mbar__list" role="menubar">
      <li v-for="(item, i) in items || []" :key="i" class="apex-mbar__root"
          :data-open="openIndex === i ? 'true' : 'false'"
          @mouseenter="onEnter(i, item)">
        <component :is="item.href && !hasMenu(item) ? 'a' : 'button'" class="apex-mbar__rootlink"
                   :type="item.href && !hasMenu(item) ? undefined : 'button'"
                   :href="item.href" :target="item.target" role="menuitem"
                   :aria-haspopup="hasMenu(item) ? 'menu' : undefined"
                   :aria-expanded="hasMenu(item) ? openIndex === i : undefined"
                   :data-disabled="item.disabled ? 'true' : 'false'"
                   @click="onRootClick($event, item, i)">
          <ApexIcon v-if="item.icon" :name="item.icon" :size="18" class="apex-mbar__rooticon" />
          <span>{{ item.label }}</span>
          <ApexIcon v-if="hasMenu(item)" name="expand_more" :size="17" class="apex-mbar__chev" />
        </component>

        <ul v-if="hasMenu(item) && openIndex === i" class="apex-mbar__panel apex-menu"
            :data-side="side" :style="{ zIndex: String(zIndex) }" role="menu">
          <ApexMenuItem v-for="(child, ci) in item.items" :key="ci" :item="child"
                        :item-render="slots.item ? (ctx) => slots.item!(ctx) : undefined"
                        @pick="onPick" />
        </ul>
      </li>
    </ul>

    <div v-if="slots.end" class="apex-mbar__edge"><slot name="end" /></div>
  </div>
</template>
