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

    <!-- Inline by default; in popup mode it renders nothing until toggle(), so
         that branch needs a trigger of its own. -->
    <template v-else-if="id === 'menu'">
      <template v-if="bind?.popup">
        <ApexButton icon="menu" @click="vmenu?.toggle($event)">Open menu</ApexButton>
        <ApexMenu ref="vmenu" :items="LIST_ITEMS" v-model:expandedKeys="stageKeys"
                  v-bind="bind" @item-click="onPick" />
      </template>
      <ApexMenu v-else :items="LIST_ITEMS" v-model:expandedKeys="stageKeys"
                v-bind="bind" @item-click="onPick" />
      <p class="menu-stage__out">Last picked: <code>{{ picked || 'nothing yet' }}</code></p>
    </template>

    <!-- The bar renders inline and its panels open from the root items. The
         rail can flip it vertical, which changes where the panel goes but not
         what the stage has to provide. -->
    <template v-else-if="id === 'megamenu'">
      <ApexMegaMenu :items="MEGA_ITEMS" v-bind="bind" @item-click="onPick" />
      <p class="menu-stage__out">Last picked: <code>{{ picked || 'nothing yet' }}</code></p>
    </template>

    <!-- The strip pins itself to an edge, so the stage gives it a box to sit
         in rather than letting it escape to the viewport. -->
    <template v-else-if="id === 'dock'">
      <div class="menu-stage__dock">
        <ApexDock :items="DOCK_ITEMS" v-bind="bind" @item-click="onPick" />
      </div>
      <p class="menu-stage__out">Last picked: <code>{{ picked || 'nothing yet' }}</code></p>
    </template>

    <!-- A context menu renders nothing until something is right-clicked, so
         the stage has to supply a target to right-click ON. Without it the
         playground would look inert however the rail is set. -->
    <template v-else-if="id === 'contextmenu'">
      <div ref="ctxZone" class="menu-stage__ctx" data-stage-target>Right-click anywhere in this box</div>
      <ApexContextMenu :items="MENU_ITEMS" :target="ctxZone" v-bind="bind" @item-click="onPick" />
      <p class="menu-stage__out">Last picked: <code>{{ picked || 'nothing yet' }}</code></p>
    </template>

    <!-- A trail long enough that the rail's maxItems has something to collapse. -->
    <template v-else-if="id === 'breadcrumb'">
      <ApexBreadcrumb :home="CRUMB_HOME" :items="CRUMB_ITEMS" v-bind="bind"
                      @item-click="onPick" />
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
import { ApexTieredMenu, ApexMenubar, ApexMenu, ApexMegaMenu, ApexDock, ApexContextMenu, ApexBreadcrumb } from '@exorgroup/apex-ui';
import type { MenuItem, MegaItem, CrumbItem } from '@exorgroup/apex-ui';

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

/**
 * A sidebar-shaped model: a top-level group renders as a static section label
 * with its children shown, a nested one collapses — and `active` marks the row
 * you are on.
 */
const LIST_ITEMS: MenuItem[] = [
  { key: 'main', label: 'Workspace', items: [
    { label: 'Dashboard', icon: 'dashboard', active: true },
    { label: 'Events', icon: 'event', badge: '4' },
    { key: 'reports', label: 'Reports', icon: 'bar_chart', items: [
      { label: 'Sales' },
      { label: 'Attendance' },
    ] },
  ] },
  { separator: true },
  { key: 'account', label: 'Account', items: [
    { label: 'Profile', icon: 'person', help: 'Name, email, password' },
    { label: 'Sign out', icon: 'logout' },
  ] },
];

/* Bound so the rail's popup switch and the stage's own toggling agree. */
const stageKeys = ref<Record<string, boolean>>({ reports: true });
const vmenu = ref<InstanceType<typeof ApexMenu> | null>(null);

/**
 * A panel with columns, a footer link and a promo block — enough that the
 * rail's columnMinWidth, cardMinWidth and panelImagePosition all visibly do
 * something.
 */
const MEGA_ITEMS: MegaItem[] = [
  { label: 'Shop', icon: 'storefront', columns: [
    { header: 'Camping', items: [
      { label: 'Tents', help: 'One to six berth' },
      { label: 'Sleeping bags' },
      { label: 'Stoves' },
    ], footer: { label: 'Shop all camping' } },
    { header: 'Climbing', items: [
      { label: 'Ropes' },
      { label: 'Harnesses', badge: 'New' },
      { label: 'Helmets' },
    ] },
  ], panel: { title: 'Season sale', text: 'Up to 40% off last year’s ranges.', linkLabel: 'See the sale' } },
  { label: 'Brands', icon: 'label', columns: [
    { header: 'Featured', layout: 'cards', items: [
      { label: 'Northwind' },
      { label: 'Cairn' },
      { label: 'Fjell' },
    ] },
  ] },
  { label: 'Support', icon: 'help', href: '#' },
];

/** One plain action, one badged, one disabled, and a group that fans. */
const DOCK_ITEMS: MenuItem[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'mail', label: 'Mail', badge: '3' },
  { icon: 'folder', label: 'Files', items: [
    { icon: 'description', label: 'Documents' },
    { icon: 'image', label: 'Pictures' },
    { icon: 'movie', label: 'Video' },
  ] },
  { icon: 'settings', label: 'Settings' },
  { icon: 'delete', label: 'Trash', disabled: true },
];

const CRUMB_HOME: CrumbItem = { icon: 'home', href: '#' };
const CRUMB_ITEMS: CrumbItem[] = [
  { label: 'Venues', href: '#' },
  { label: 'Teatru Manoel', href: '#' },
  { label: 'Events', href: '#' },
  { label: 'La Traviata', href: '#' },
  { label: 'Seating' },
];

const ctxZone = ref<HTMLElement | null>(null);

const tmenu = ref<InstanceType<typeof ApexTieredMenu> | null>(null);
const picked = ref('');
function onPick(payload: { item: MenuItem }) {
  picked.value = String(payload.item.label ?? '');
}
</script>
