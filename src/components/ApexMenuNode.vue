<script setup lang="ts">
/**
 * ApexMenuNode — one row of ApexMenu: a separator, a group, or a leaf.
 *
 * Recursive, so a group nests to any depth. Top-level groups render as static
 * section labels; nested ones collapse, which is the convention users expect
 * from a sidebar. `toggleable` on the item overrides that either way, and open
 * state lives in the owner's expandedKeys so it can be driven from outside.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { MenuItem } from './ApexMenuItem';

defineOptions({ name: 'ApexMenuNode' });

const props = defineProps<{
  item: MenuItem;
  depth: number;
  expanded: Record<string, boolean>;
  /** Renders a leaf's contents, from the owner's `item` slot. */
  itemRender?: (ctx: { item: MenuItem; depth: number }) => unknown;
  /** Renders a group's label, from the owner's `submenulabel` slot. */
  labelRender?: (ctx: { item: MenuItem; depth: number }) => unknown;
}>();

const emit = defineEmits<{
  (e: 'pick', item: MenuItem, ev: MouseEvent): void;
  (e: 'toggle', item: MenuItem): void;
}>();

const group = computed(() => !!(props.item.items && props.item.items.length));
/** Nested groups collapse; top-level ones are section labels unless told otherwise. */
const toggleable = computed(() => (props.item.toggleable as boolean | undefined) ?? props.depth > 0);
const key = computed(() => String(props.item.key ?? props.item.label ?? ''));
const open = computed(() => (toggleable.value ? props.expanded[key.value] !== false && !!props.expanded[key.value] : true));
</script>

<template>
  <li v-if="item.separator" class="apex-mnu__sep" role="separator"></li>

  <li v-else-if="group" class="apex-mnu__group" :data-depth="depth" :data-open="open ? 'true' : 'false'">
    <component :is="toggleable ? 'button' : 'div'" class="apex-mnu__label"
               :type="toggleable ? 'button' : undefined" :data-toggleable="toggleable ? 'true' : 'false'"
               :aria-expanded="toggleable ? open : undefined" @click="toggleable && emit('toggle', item)">
      <component v-if="labelRender" :is="{ render: () => labelRender!({ item, depth }) }" />
      <template v-else>
        <ApexIcon v-if="item.icon" :name="item.icon" :size="17" class="apex-mnu__icon" />
        <span class="apex-mnu__labeltext">{{ item.label }}</span>
        <ApexIcon v-if="toggleable" name="expand_more" :size="18" class="apex-mnu__chev" />
      </template>
    </component>

    <ul v-if="open" class="apex-mnu__sub" role="menu">
      <ApexMenuNode v-for="(child, i) in item.items" :key="i" :item="child" :depth="depth + 1"
                    :expanded="expanded" :item-render="itemRender" :label-render="labelRender"
                    @pick="(x, e) => emit('pick', x, e)" @toggle="(x) => emit('toggle', x)" />
    </ul>
  </li>

  <li v-else class="apex-mnu__item" :data-depth="depth">
    <component :is="item.href ? 'a' : 'button'" class="apex-mnu__row" role="menuitem"
               :type="item.href ? undefined : 'button'" :href="item.href" :target="item.target"
               :data-disabled="item.disabled ? 'true' : 'false'" :data-active="item.active ? 'true' : 'false'"
               :disabled="!item.href && item.disabled ? true : undefined"
               @click="!item.disabled && emit('pick', item, $event)">
      <component v-if="itemRender" :is="{ render: () => itemRender!({ item, depth }) }" />
      <template v-else>
        <ApexIcon v-if="item.icon" :name="item.icon" :size="18" class="apex-mnu__icon" />
        <span v-else class="apex-mnu__gap"></span>
        <span class="apex-mnu__text">
          <strong>{{ item.label }}</strong>
          <em v-if="item.help">{{ item.help }}</em>
        </span>
        <span v-if="item.badge" class="apex-mnu__badge">{{ item.badge }}</span>
        <span v-if="item.hint" class="apex-mnu__hint">{{ item.hint }}</span>
      </template>
    </component>
  </li>
</template>
