<script setup lang="ts">
/**
 * ApexEditorMenubar — the complete index of what the editor can do.
 *
 * Every catalogued command has a home here, disabled when inapplicable rather
 * than hidden: a greyed-out "Merge cells" teaches that merging exists, where a
 * hidden one teaches nothing. The toolbar is a frequent subset of the same
 * catalogue, so a label or a shortcut can only be wrong in one place.
 *
 * Built on ApexMenubar, so hover-to-open, keyboard navigation, submenu flipping
 * and the off-screen shift come from the component that already solves them.
 */
import { computed, onMounted } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexMenubar from './ApexMenubar.vue';
import {
  CATALOGUE, MENUS, describe, unreachableCommands, uncataloguedCommands,
  type SurfaceItem,
} from '../core/editor/catalogue';
import ApexEditorTableGrid from './ApexEditorTableGrid.vue';

const props = withDefaults(defineProps<{
  /**
   * Runs a command by name; the same registry every other surface calls. The
   * optional value is for a takesValue command, whose registry entry is a
   * factory rather than a command — font_size sets a size, it does not toggle
   * one.
   */
  run?: (name: string, value?: unknown) => boolean;
  /**
   * Availability as a MAP rather than a predicate, matching the toolbar. Absent
   * means UNKNOWN rather than unavailable, so a registry that has not reported
   * yet does not grey out the whole index.
   */
  can?: Record<string, boolean> | null;
  active?: Record<string, unknown> | null;
  /** Menus to omit, for an editor with no tables. */
  exclude?: string[];
  /**
   * Insert ▸ Table opens a size GRID rather than inserting a guess, so the
   * menubar needs the one thing a grid cannot get from a command name.
   */
  insertTable?: ((rows: number, cols: number) => boolean) | null;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { exclude: () => [], insertTable: null });

const emit = defineEmits<{
  (e: 'command', payload: { command: string; value?: unknown; applied: boolean }): void;
}>();

onMounted(() => {
  /* Loud on mount rather than silent: a command with no menu home is
     unreachable, and that is the failure this structure exists to prevent. */
  const missing = unreachableCommands();
  if (missing.length) {
    console.warn(`[ApexEditorMenubar] commands with no menu home: ${missing.join(', ')}`);
  }
  /* The registry is the OTHER side of the same assertion: a command the editor
     implements but nothing catalogues is unreachable too, and that failure is
     invisible from the catalogue's side. */
  const uncatalogued = uncataloguedCommands(Object.keys(props.can || {}));
  if (uncatalogued.length) {
    console.warn('[ApexEditorMenubar] registry commands with no catalogue entry: '
      + uncatalogued.join(', '));
  }
});

function isAvailable(name?: string) {
  if (!name) return false;
  if (!props.can) return true;
  /* Absent means UNKNOWN only while the map is EMPTY — a registry that has not
     reported yet must not grey out the whole index. Once it is populated,
     absence is meaningful: the registry has reported and does not have this
     command, so the entry is disabled rather than looking clickable and doing
     nothing. That is what made Insert > Link read as broken: `link` is not a
     registry command at all. */
  if (!Object.keys(props.can).length) return true;
  return Object.prototype.hasOwnProperty.call(props.can, name)
    ? props.can[name] !== false
    : false;
}

/** Mod reads as the platform's own key: a Mac user shown Ctrl-B will try Ctrl-B. */
function prettyKeys(keys: string) {
  const mac = typeof navigator !== 'undefined'
    && /Mac|iPhone|iPad/.test((navigator as { platform?: string }).platform || '');
  return keys
    .replace(/Mod/g, mac ? '\u2318' : 'Ctrl')
    .replace(/Shift/g, mac ? '\u21e7' : 'Shift')
    .replace(/-/g, mac ? '' : '+');
}

/* hasValue rather than value !== undefined: null is a real argument here
   ("unset this property"), and a factory called with no argument at all is a
   different call from one called with null. */
function invoke(name?: string, value?: unknown, hasValue?: boolean) {
  if (!name || !props.run) return;
  const applied = hasValue ? props.run(name, value) : props.run(name);
  emit('command', { command: name, value: hasValue ? value : undefined, applied });
}

/* A type alias, not an interface, on purpose: this is handed to ApexMenu,
   whose MenuItem carries an index signature for the caller's own payload.
   TypeScript gives an implicit index signature to a type ALIAS and never to
   an interface, so the interface form is rejected with nothing actually
   wrong with the shape. */
type MenuNode = {
  label?: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
  separator?: boolean;
  custom?: string;
  items?: MenuNode[];
  command?: () => void;
};

const items = computed<MenuNode[]>(() => {
  const build = (list?: SurfaceItem[]): MenuNode[] => (list || []).map((raw) => {
    if (raw === 'separator') return { separator: true };
    /* A panel item carries no command: it IS a control, and the panel slot
       renders it. */
    if (typeof raw !== 'string' && raw.custom) return { custom: raw.custom };
    const item = describe(raw) as Exclude<SurfaceItem, string>;
    if (item.items) return { label: item.label, icon: item.icon, items: build(item.items) };
    const name = item.command;
    /* A takesValue command is a FACTORY: naming it without a value names half a
       command. Read per item so each option row carries its own argument. */
    const hasValue = Object.prototype.hasOwnProperty.call(item, 'value');
    return {
      label: item.label,
      icon: item.icon,
      hint: item.keys ? prettyKeys(item.keys) : undefined,
      /* Disabled, not hidden — the menu stays a complete index. */
      disabled: !isAvailable(name),
      command: () => invoke(name, item.value, hasValue),
    };
  });
  return MENUS
    .filter((menu) => !props.exclude.includes(menu.label.toLowerCase()))
    .map((menu) => ({ label: menu.label, items: build(menu.items) }));
});

defineExpose({ catalogue: CATALOGUE, unreachableCommands });
</script>

<template>
  <ApexMenubar class="apex-ed__menubar" :class="ui?.menubar" :items="items" trigger="click">
    <template #panel="{ item, close }">
      <ApexEditorTableGrid v-if="item.custom === 'table_grid'" inline :insert="insertTable"
                           @insert="close()" />
    </template>
  </ApexMenubar>
</template>
