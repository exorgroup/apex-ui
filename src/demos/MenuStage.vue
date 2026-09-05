<template>
  <div class="menu-stage">
    <!-- A tiered menu renders inline by default, but in popup mode it renders
         nothing until something calls toggle() — so that branch needs a trigger
         or the rail's `popup` switch would appear to blank the stage. -->
    <template v-if="id === 'tieredmenu'">
      <template v-if="bind?.popup">
        <ApexButton icon="menu" @click="tmenu?.toggle($event)">Open menu</ApexButton>
        <ApexTieredMenu ref="tmenu" :items="MENU_ITEMS" v-bind="bind" @item-click="onPick" />
      </template>
      <ApexTieredMenu v-else :items="MENU_ITEMS" v-bind="bind" @item-click="onPick" />
      <p class="menu-stage__out">Last picked: <code>{{ picked || 'nothing yet' }}</code></p>
    </template>

    <!-- The bar renders inline; its dropdowns open from the root items, so it
         needs no trigger of its own. -->
    <template v-else-if="id === 'menubar'">
      <ApexMenubar :items="BAR_ITEMS" v-bind="bind" @item-click="onPick" />
      <p class="menu-stage__out">Last picked: <code>{{ picked || 'nothing yet' }}</code></p>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for the menu family.
 *
 * Kept out of App.vue for the same reason ContainerStage and OverlayStage are:
 * each of these controls needs its own shape of host — one renders inline, one
 * needs a trigger, one needs a right-clickable target — and none of that is
 * about the page.
 *
 * Every branch must actually render something. An entry with demo: 'menu' and
 * no branch here is an empty div that warns about nothing and passes every
 * other check, which is exactly how two overlay stages once shipped blank.
 */
import { ref } from 'vue';
import { ApexTieredMenu, ApexMenubar } from '@exorgroup/apex-ui';
import type { MenuItem } from '@exorgroup/apex-ui';

defineProps<{
  /** The registry id, which decides which control is shown. */
  id: string;
  /** Live props from the playground rail. */
  bind?: Record<string, unknown>;
}>();

/**
 * One model, exercising the parts of MenuItem that differ from a plain list:
 * icons, a hint column, a section header, a separator, a disabled row, and a
 * branch deep enough to show the submenu flipping near an edge.
 */
const MENU_ITEMS: MenuItem[] = [
  { label: 'New file', icon: 'note_add', hint: '⌘N' },
  { label: 'Open recent', icon: 'history', items: [
    { label: 'invoice-2024.pdf' },
    { label: 'contract.docx' },
    { separator: true },
    { label: 'Clear list', icon: 'delete_sweep' },
  ] },
  { separator: true },
  { header: 'Share' },
  { label: 'Email', icon: 'mail' },
  { label: 'Export', icon: 'download', items: [
    { label: 'PDF' },
    { label: 'CSV' },
    { label: 'Print…', icon: 'print', hint: '⌘P' },
  ] },
  { separator: true },
  { label: 'Delete', icon: 'delete', disabled: true },
];

/** A bar with a couple of real menus, so switching between them is visible. */
const BAR_ITEMS: MenuItem[] = [
  { label: 'File', icon: 'folder', items: [
    { label: 'New', icon: 'note_add', hint: '⌘N' },
    { label: 'Open', icon: 'folder_open' },
    { separator: true },
    { label: 'Export', icon: 'download', items: [{ label: 'PDF' }, { label: 'CSV' }] },
  ] },
  { label: 'Edit', icon: 'edit', items: [
    { label: 'Undo', hint: '⌘Z' },
    { label: 'Redo', hint: '⇧⌘Z' },
    { separator: true },
    { header: 'Clipboard' },
    { label: 'Copy', icon: 'content_copy' },
    { label: 'Paste', icon: 'content_paste', disabled: true },
  ] },
  { label: 'Help', icon: 'help', href: '#' },
];

const tmenu = ref<InstanceType<typeof ApexTieredMenu> | null>(null);
const picked = ref('');
function onPick(payload: { item: MenuItem }) {
  picked.value = String(payload.item.label ?? '');
}
</script>
