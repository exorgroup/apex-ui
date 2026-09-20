<script setup lang="ts">
/**
 * ApexEditorToolbar — the fixed toolbar.
 *
 * It renders from a declaration rather than fixed markup, because the same
 * declaration has to drive three surfaces: this bar, the bubble menu that
 * appears over a selection, and the slash menu. Three hand-written toolbars
 * would drift, and the drift shows up as a button that works in one place and
 * not another.
 *
 * Nothing here knows what a command does. Every item names a command in the
 * editor's registry, and the editor answers whether it applies — so a disabled
 * button is disabled because the document says so.
 */
import { computed, ref } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';
import ApexMenu from './ApexMenu.vue';
import { describe, type ResolvedItem, type SurfaceItem } from '../core/editor/catalogue';

/**
 * A resolved toolbar item.
 *
 * DERIVED from the catalogue's item type rather than declared alongside it. Two
 * hand-written copies had already diverged on two fields — `type` carried
 * 'group' and 'button' the template never branches on, and `options` required
 * properties the shared type left optional — which made neither comparable to
 * the other. The catalogue removed that duplication for commands; this removes
 * it for their container, so the divergence cannot recur.
 */
export type ToolbarItem = ResolvedItem;

export type ToolbarPreset = 'minimal' | 'standard' | 'full';

const props = withDefaults(defineProps<{
  /** What the editor reports at the selection. */
  active?: { marks: Record<string, boolean>; blockType: string; blockAttrs: Record<string, unknown>; blockMixed?: boolean } | null;
  /** Which commands apply here, from the editor. */
  can?: Record<string, boolean>;
  /** Runs a command by name. */
  run?: (name: string) => boolean;
  /** A named set, or your own items. */
  items?: (ToolbarItem | string)[];
  /**
   * Names to leave OUT of whichever set resolves - the preset, `items`, and
   * the overflow alike.
   *
   * "standard, without the source view" is a common request, and the honest
   * answer to it is not a hand-copied sixteen-entry `items` list: that copy
   * stops tracking the preset the day anything is added to it. A command
   * name, a custom slot name (`link`, `table`) or an option of the block
   * select all match.
   *
   * Separators around what goes are tidied away, because a divider with
   * nothing left on one side of it is a stray line.
   */
  exclude?: string[];
  /**
   * Names, like `items`. Null takes the preset's own overflow; an explicit []
   * is how a caller says "no overflow button".
   */
  overflowItems?: (ToolbarItem | string)[] | null;
  preset?: ToolbarPreset;
  size?: 'sm' | 'md';
  /** Sticks to the top of the scroll container as the document runs past. */
  sticky?: boolean;
  /** Wrap onto more rows, or keep one row and overflow into a menu. */
  wrap?: boolean;
  disabled?: boolean;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { preset: 'standard', size: 'sm', wrap: true, overflowItems: null });

const emit = defineEmits<{
  (e: 'command', payload: { command: string; applied: boolean }): void;
}>();

/**
 * The presets.
 *
 * Named sets rather than a boolean per button: "give me a normal toolbar" is the
 * common request, and twenty booleans is a configuration language nobody wants
 * to learn to answer it.
 */
const STANDARD_CORE: SurfaceItem[] = [
  { type: 'select', label: 'Block',
    options: ['paragraph', 'heading1', 'heading2', 'heading3', 'code_block'] },
  'separator',
  'strong', 'em', 'underline', 'strike', 'code',
  'separator',
  { type: 'custom', slot: 'link', label: 'Link' },
  'highlight',
  'separator',
  'insert_image', { type: 'custom', slot: 'table', label: 'Table' },
  'bullet_list', 'ordered_list', 'task_list', 'blockquote',
  'separator',
  /* Alignment is first-tier, not second. It was in the overflow, behind
     the three dots, where it was reported as "we do not have any
     alignment buttons" - which is what a control one click away and
     unlabelled amounts to. The same four act on the selected IMAGE as
     well as on text, because `setAlign` writes to any node whose type
     carries an `align` attribute and the figure does. */
  'align_left', 'align_center', 'align_right', 'align_justify',
];

/* The tail every preset ends with. Declared once rather than sliced off the end
   of STANDARD by index — that arithmetic broke silently the moment anything was
   appended, which is a coupling nobody can see. */
const STANDARD_TAIL: SurfaceItem[] = ['separator', { type: 'overflow' },
  'separator', 'cut', 'copy', 'paste',
  'separator', 'undo', 'redo', 'separator', 'source_code'];

const STANDARD: SurfaceItem[] = [...STANDARD_CORE, ...STANDARD_TAIL];

const PRESETS: Record<ToolbarPreset, SurfaceItem[]> = {
  minimal: ['strong', 'em', 'code', 'separator', 'bullet_list', 'ordered_list'],
  standard: STANDARD,
  /* full is standard plus the rest, declared once rather than retyped. */
  full: [...STANDARD_CORE,
    'subscript', 'superscript',
    'separator',
    'outdent', 'indent',
    'separator',
    'horizontal_rule', 'clear_marks',
    ...STANDARD_TAIL],
};

/**
 * The overflow: the SECOND-tier commands, one click away behind a ⋮.
 *
 * Declared rather than measured. A width-measuring bar has to render twice to
 * find out what fits, and it moves buttons around as the pane resizes — a
 * toolbar whose contents shift under the pointer is worse than one with a
 * predictable overflow. The subset is a name list because the catalogue carries
 * everything else.
 *
 * `standard` plus its overflow is exactly `full`, so the two presets differ in
 * PRESENTATION and not in what the bar can do. Nothing is unreachable either
 * way: the menubar remains the complete index.
 */
const OVERFLOW: Record<ToolbarPreset, SurfaceItem[]> = {
  minimal: [],
  standard: [
    'subscript', 'superscript',
    'separator',
    'outdent', 'indent',
    'separator',
    'horizontal_rule', 'clear_marks',
  ],
  /* full already shows everything inline; an overflow holding nothing would
     still draw its button. */
  full: [],
};

const more = ref<InstanceType<typeof ApexMenu> | null>(null);

/* Kept by NAME, whichever way the item names itself: a command, the slot a
   custom control renders into, or the control name. An item with none of
   the three - a separator, the overflow marker - is never matched, since
   the set cannot hold the empty string unless a caller puts it there. */
const excluded = computed(() => new Set(props.exclude || []));

const keep = (item: ToolbarItem) => !excluded.value.has(item.command || '')
  && !excluded.value.has(item.slot || '')
  && !excluded.value.has(item.custom || '');

/**
 * Drop the excluded, then tidy the separators they leave behind.
 *
 * A select is pruned by its OPTIONS as well, so excluding `code_block`
 * takes it out of the block dropdown and not only off the bar; a select
 * left with nothing to offer goes with them.
 *
 * Applied on every path, not only when `exclude` is set: a well-formed
 * preset has no leading, trailing or doubled separator, so tidying one
 * returns it unchanged.
 */
function prune(items: ToolbarItem[]): ToolbarItem[] {
  const out: ToolbarItem[] = [];

  for (const item of items) {
    if (!keep(item)) continue;

    const resolvedItem = item.options
      ? Object.assign({}, item, { options: item.options.filter(keep) })
      : item;

    if (resolvedItem.type === 'select' && !resolvedItem.options?.length) continue;
    if (resolvedItem.type === 'separator'
      && (!out.length || out[out.length - 1].type === 'separator')) continue;

    out.push(resolvedItem);
  }

  while (out.length && out[out.length - 1].type === 'separator') out.pop();

  return out;
}

const resolved = computed<ToolbarItem[]>(() => prune((props.items || PRESETS[props.preset] || [])
  .map((item) => describe(item))));

/* Declared as an ITEM so its position is part of the preset rather than hardcoded
   at the end — the second-tier FORMATTING belongs beside the formatting groups,
   not after undo, redo and the source view. */
const hasOverflowItem = computed(() => resolved.value.some((i) => i.type === 'overflow'));

/* A select or a slot cannot be a menu row: the block dropdown needs its own
   control and a custom slot renders arbitrary markup. They stay in the bar
   rather than being silently dropped. */
const resolvedOverflow = computed<ToolbarItem[]>(() =>
  prune((props.overflowItems || OVERFLOW[props.preset] || [])
    .map((item) => describe(item))
    .filter((i) => i.type !== 'select' && i.type !== 'custom')));

/* A type alias, not an interface, on purpose: this is handed to ApexMenu,
   whose MenuItem carries an index signature for the caller's own payload.
   TypeScript gives an implicit index signature to a type ALIAS and never to
   an interface, so the interface form is rejected with nothing actually
   wrong with the shape. */
type OverflowRow = {
  label?: string; icon?: string; hint?: string;
  disabled?: boolean; separator?: boolean; command?: () => void;
};

/* Built from the SAME describe() output the bar renders, so a label or a
   shortcut cannot differ between the button and its overflow row. */
const overflowMenuItems = computed<OverflowRow[]>(() => {
  const out: OverflowRow[] = [];
  resolvedOverflow.value.forEach((item) => {
    if (item.type === 'separator') {
      /* A separator at either edge, or two in a row, reads as a rendering fault
         rather than a grouping. */
      if (out.length && !out[out.length - 1].separator) out.push({ separator: true });
      return;
    }
    if (!item.command) return;
    const name = item.command;
    out.push({
      label: item.label,
      icon: item.icon,
      hint: item.keys ? prettyKeys(item.keys) : undefined,
      disabled: isDisabled(item),
      command: () => invoke(name),
    });
  });
  while (out.length && out[out.length - 1].separator) out.pop();
  return out;
});

/** A mark button lights from the marks; a block button from the block and its attrs. */
function isActive(item: ToolbarItem): boolean {
  const a = props.active;
  if (!a) return false;
  /* A view TOGGLE has no mark and no block to read — its state lives on the
     editor, not in the document. Without this a source-view button never showed
     that it was on. */
  if (item.activeFlag) return !!(a as unknown as Record<string, unknown>)[item.activeFlag];
  if (item.activeMark) return !!a.marks[item.activeMark];
  if (item.activeBlock) {
    if (a.blockType !== item.activeBlock) return false;
    if (!item.activeAttrs) return true;
    /* Attributes have to match too, or every heading level would light at once. */
    return Object.keys(item.activeAttrs).every((k) => a.blockAttrs[k] === item.activeAttrs![k]);
  }
  return false;
}

function isDisabled(item: ToolbarItem): boolean {
  if (props.disabled && !item.ignoresDisabled) return true;
  if (!item.command || !props.can) return false;
  /* Absent means UNKNOWN only while the map is EMPTY: a registry that has not
     reported yet must not grey out the whole bar. Once it is populated, absence
     means the registry reported and does not have this command — the same rule
     the menubar uses, so a button and its menu row cannot disagree about being
     available. */
  if (!Object.keys(props.can).length) return false;
  return !Object.prototype.hasOwnProperty.call(props.can, item.command)
    || props.can[item.command] === false;
}

/** The block select shows what the selection IS, or nothing when it is mixed. */
const blockValue = computed(() => {
  const a = props.active;
  if (!a || a.blockMixed) return '';
  const select = resolved.value.find((i) => i.type === 'select');
  const match = select?.options?.find((o) => {
    if (o.activeBlock !== a.blockType) return false;
    if (!o.activeAttrs) return true;
    return Object.keys(o.activeAttrs).every((k) => a.blockAttrs[k] === o.activeAttrs![k]);
  });
  return match ? match.command : '';
});

function invoke(name?: string) {
  if (!name || !props.run) return;
  const applied = props.run(name);
  emit('command', { command: name, applied });
}

function prettyKeys(keys: string) {
  /* The platform's own symbol, since "Mod" means nothing to a reader. */
  const mac = typeof navigator !== 'undefined' && /Mac|iP(hone|[oa]d)/.test(navigator.platform);
  return keys
    .replace(/Mod-/g, mac ? '\u2318' : 'Ctrl+')
    .replace(/Shift-/g, mac ? '\u21e7' : 'Shift+');
}

function title(item: ToolbarItem) {
  if (!item.keys) return item.label;
  return `${item.label} \u00b7 ${prettyKeys(item.keys)}`;
}
</script>

<template>
  <div class="apex-edbar" :class="ui?.toolbar" :data-size="size" :data-sticky="sticky ? 'true' : 'false'"
       :data-wrap="wrap ? 'true' : 'false'" role="toolbar" aria-label="Formatting">
    <template v-for="(item, i) in resolved" :key="i">
      <span v-if="item.type === 'separator'" class="apex-edbar__sep" :class="ui?.toolbarSep" role="separator"></span>
      <!-- the second tier, one click away. The menubar is still the complete
           index; this is the frequent-enough-to-keep-close set -->
      <template v-else-if="item.type === 'overflow'">
        <button v-if="overflowMenuItems.length" type="button" class="apex-edbar__btn" :class="ui?.toolbarButton"
                :disabled="disabled" title="More formatting" aria-label="More formatting"
                aria-haspopup="menu"
                @click="more?.toggle($event, $event.currentTarget as HTMLElement)">
          <ApexIcon name="more_vert" :size="size === 'sm' ? 18 : 20" />
        </button>
        <ApexMenu v-if="overflowMenuItems.length" ref="more" :items="overflowMenuItems"
                  popup side="bottom" align="end" />
      </template>

      <!-- a native select rather than a custom menu: the block type is a short
           closed list, and the platform control is keyboard- and
           screen-reader-correct without any work from us -->
      <select v-else-if="item.type === 'select'" class="apex-edbar__select" :class="ui?.toolbarSelect"
              :value="blockValue" :disabled="disabled"
              :aria-label="item.label || 'Block type'"
              @change="invoke(($event.target as HTMLSelectElement).value)">
        <option v-if="!blockValue" value="">{{ active?.blockMixed ? 'Mixed' : '\u2014' }}</option>
        <option v-for="opt in item.options" :key="opt.command" :value="opt.command">{{ opt.label }}</option>
      </select>

      <slot v-else-if="item.type === 'custom'" :name="item.slot" :item="item"
            :active="active" :can="can" :run="run" />

      <button v-else type="button" class="apex-edbar__btn" :class="ui?.toolbarButton"
              :data-on="isActive(item) ? 'true' : 'false'"
              :disabled="isDisabled(item)"
              :title="title(item)" :aria-label="item.label" :aria-pressed="item.activeMark ? isActive(item) : undefined"
              @click="invoke(item.command)">
        <ApexIcon v-if="item.icon" :name="item.icon" :size="size === 'sm' ? 18 : 20" />
        <span v-else>{{ item.label }}</span>
      </button>
    </template>
    <!-- appended only when no preset placed it, so a caller passing its own items
         still gets an overflow rather than losing it silently -->
    <template v-if="!hasOverflowItem && overflowMenuItems.length">
      <span class="apex-edbar__sep" :class="ui?.toolbarSep" role="separator"></span>
      <button type="button" class="apex-edbar__btn" :class="ui?.toolbarButton" :disabled="disabled"
              title="More formatting" aria-label="More formatting" aria-haspopup="menu"
              @click="more?.toggle($event, $event.currentTarget as HTMLElement)">
        <ApexIcon name="more_vert" :size="size === 'sm' ? 18 : 20" />
      </button>
      <ApexMenu ref="more" :items="overflowMenuItems" popup side="bottom" align="end" />
    </template>
    <slot name="end" />
  </div>
</template>
