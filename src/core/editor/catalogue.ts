/**
 * The command catalogue.
 *
 * One declaration per command — label, icon, shortcut, active test, domain —
 * referenced BY NAME from every surface: the fixed toolbar, the menubar, the
 * bubble menu, the slash menu and the contextual object bars. That is what stops
 * a label or a shortcut being right in one place and wrong in another.
 *
 * The domain is what makes the menubar DERIVABLE rather than hand-built. A
 * hand-built menu drifts from the commands that actually exist, which is how
 * TinyMCE ended up with Source code in both its View and Tools menus.
 */

export type CommandDomain = 'file' | 'edit' | 'insert' | 'format' | 'table' | 'view' | 'tools';

export interface CommandSpec {
  domain: CommandDomain;
  label: string;
  icon?: string;
  keys?: string;
  activeMark?: string;
  activeBlock?: string;
  activeAttrs?: Record<string, unknown>;
  /**
   * A flag on the editor's active state, for a view TOGGLE that has no mark and
   * no block to read — its state lives on the editor, not in the document.
   */
  activeFlag?: string;
  /**
   * The toolbar's blanket `disabled` does not apply. For a command that is what
   * gets an author OUT of the state disabling everything else — the source view
   * had no exit when its own button was disabled with the rest.
   */
  ignoresDisabled?: boolean;
  /**
   * The registry entry is a FACTORY taking a value, not a command: font_size
   * sets a size, it does not toggle one. A surface that names such a command
   * without a value has named half a command, so it must supply one — see
   * valueItems().
   */
  takesValue?: boolean;
}

/**
 * A resolved item: what describe() returns for anything that is not a bare
 * string.
 *
 * The select options are narrowed here because describe() genuinely fills them
 * in — CommandSpec.label is required and the command name is assigned there — so
 * a consumer reads them directly rather than behind an assertion.
 */
export interface ResolvedItem extends Partial<CommandSpec> {
  command?: string;
  /* `overflow` and `custom` are here because `describe()` can RETURN them: a
     surface item carrying either is passed through, and the narrower union
     made the function's own return value not assignable to its declared type.
     The three shapes have to agree — they are the same object before and
     after resolution. */
  type?: 'separator' | 'select' | 'custom' | 'overflow';
  /** Names a control the surface renders in place of a row — e.g. a size grid. */
  custom?: string;
  slot?: string;
  /** The argument for a takesValue command. null is a real value: "unset". */
  value?: string | null;
  /* Every option is resolved, on both paths through describe() — see the
     note there. Declared as resolved items rather than as SurfaceItem[],
     because the toolbar reads `activeBlock` and `activeAttrs` off an option
     to decide which one the selection matches: widening this to include a
     bare string takes those away and is what the narrowing exists to
     prevent. */
  options?: ResolvedItem[];
  items?: SurfaceItem[];
}

/** A surface item: a command name, a separator, or an explicit override. */
export type SurfaceItem = string | (Partial<CommandSpec> & {
  command?: string;
  type?: 'separator' | 'select' | 'custom' | 'overflow';
  /** Names a control the surface renders in place of a row — e.g. a size grid. */
  custom?: string;
  slot?: string;
  value?: string | null;
  options?: SurfaceItem[];
  items?: SurfaceItem[];
});

export const DOMAINS: CommandDomain[] = ['file', 'edit', 'insert', 'format', 'table', 'view', 'tools'];

/* Grouped by domain so the taxonomy is visible in the source rather than
   inferred from a field on each line. The test that decides placement: does
   this command CREATE something (insert), change something already there
   (format), or inspect the document (view / tools)? */
export const CATALOGUE: Record<string, CommandSpec> = {
  /* ── file: the document as a whole, not its contents ── */
  new_document: { domain: 'file', icon: 'note_add', label: 'New document' },
  preview: { domain: 'file', icon: 'visibility', label: 'Preview' },
  print: { domain: 'file', icon: 'print', label: 'Print' },

  /* ── edit: the clipboard, history and search. Nothing about meaning. ── */
  /* The clipboard three. Their keyboard shortcuts belong to the
     BROWSER - a page cannot rebind Ctrl+C - so the hints here describe
     what already works rather than promising a binding of ours. */
  cut: { domain: 'edit', icon: 'content_cut', label: 'Cut', keys: 'Mod-X' },
  copy: { domain: 'edit', icon: 'content_copy', label: 'Copy', keys: 'Mod-C' },
  paste: { domain: 'edit', icon: 'content_paste', label: 'Paste', keys: 'Mod-V' },
  undo: { domain: 'edit', icon: 'undo', label: 'Undo', keys: 'Mod-Z' },
  redo: { domain: 'edit', icon: 'redo', label: 'Redo', keys: 'Shift-Mod-Z' },
  select_all: { domain: 'edit', icon: 'select_all', label: 'Select all', keys: 'Mod-A' },

  /* ── insert: things that did not exist before ── */
  link: { domain: 'insert', icon: 'link', label: 'Link', keys: 'Mod-K' },
  insert_image: { domain: 'insert', icon: 'add_photo_alternate', label: 'Image' },
  table_insert: { domain: 'insert', icon: 'table', label: 'Table' },
  horizontal_rule: { domain: 'insert', icon: 'horizontal_rule', label: 'Divider', keys: 'Mod-_' },
  hard_break: { domain: 'insert', icon: 'keyboard_return', label: 'Line break', keys: 'Shift-Enter' },

  /* ── format: properties of what is already there ── */
  paragraph: { domain: 'format', label: 'Paragraph', activeBlock: 'paragraph' },
  heading1: { domain: 'format', label: 'Heading 1', activeBlock: 'heading', activeAttrs: { level: 1 } },
  heading2: { domain: 'format', label: 'Heading 2', activeBlock: 'heading', activeAttrs: { level: 2 } },
  heading3: { domain: 'format', label: 'Heading 3', activeBlock: 'heading', activeAttrs: { level: 3 } },
  heading4: { domain: 'format', label: 'Heading 4', activeBlock: 'heading', activeAttrs: { level: 4 } },
  heading5: { domain: 'format', label: 'Heading 5', activeBlock: 'heading', activeAttrs: { level: 5 } },
  heading6: { domain: 'format', label: 'Heading 6', activeBlock: 'heading', activeAttrs: { level: 6 } },
  code_block: { domain: 'format', label: 'Code block', activeBlock: 'code_block' },
  strong: { domain: 'format', icon: 'format_bold', label: 'Bold', keys: 'Mod-B', activeMark: 'strong' },
  em: { domain: 'format', icon: 'format_italic', label: 'Italic', keys: 'Mod-I', activeMark: 'em' },
  underline: { domain: 'format', icon: 'format_underlined', label: 'Underline', keys: 'Mod-U', activeMark: 'underline' },
  strike: { domain: 'format', icon: 'format_strikethrough', label: 'Strikethrough', keys: 'Shift-Mod-X', activeMark: 'strike' },
  code: { domain: 'format', icon: 'code', label: 'Inline code', keys: 'Mod-`', activeMark: 'code' },
  highlight: { domain: 'format', icon: 'format_ink_highlighter', label: 'Highlight', keys: 'Shift-Mod-H', activeMark: 'highlight' },
  subscript: { domain: 'format', icon: 'subscript', label: 'Subscript', keys: 'Mod-,', activeMark: 'subscript' },
  superscript: { domain: 'format', icon: 'superscript', label: 'Superscript', keys: 'Mod-.', activeMark: 'superscript' },
  clear_marks: { domain: 'format', icon: 'format_clear', label: 'Clear formatting' },
  /* Value commands: no icon of their own, because the option list under them
     would then repeat one icon per row. The submenu that holds them carries it. */
  font_family: { domain: 'format', label: 'Font', takesValue: true },
  font_size: { domain: 'format', label: 'Font size', takesValue: true },
  text_color: { domain: 'format', label: 'Text colour', takesValue: true },
  bullet_list: { domain: 'format', icon: 'format_list_bulleted', label: 'Bullet list', keys: 'Shift-Mod-8' },
  ordered_list: { domain: 'format', icon: 'format_list_numbered', label: 'Numbered list', keys: 'Shift-Mod-9' },
  task_list: { domain: 'format', icon: 'checklist', label: 'Task list' },
  blockquote: { domain: 'format', icon: 'format_quote', label: 'Quote', keys: 'Mod->' },
  align_left: { domain: 'format', icon: 'format_align_left', label: 'Align left' },
  align_center: { domain: 'format', icon: 'format_align_center', label: 'Align centre' },
  align_right: { domain: 'format', icon: 'format_align_right', label: 'Align right' },
  align_justify: { domain: 'format', icon: 'format_align_justify', label: 'Justify' },
  align_clear: { domain: 'format', icon: 'format_clear', label: 'Clear alignment' },
  indent: { domain: 'format', icon: 'format_indent_increase', label: 'Indent', keys: 'Tab' },
  outdent: { domain: 'format', icon: 'format_indent_decrease', label: 'Outdent', keys: 'Shift-Tab' },
  /* Named for what they DO, not for what they are called elsewhere. Sitting next
     to indent/outdent in one submenu, "Indent" twice is a menu that cannot be
     read; these two shift the block's margin where the pair above nests a list
     item first. */
  page_indent: { domain: 'format', icon: 'format_indent_increase', label: 'Increase margin' },
  page_outdent: { domain: 'format', icon: 'format_indent_decrease', label: 'Decrease margin' },

  /* ── image: properties of a selected image, so they sit in format beside the
     other "change what is already there" commands. Markup only — crop, rotate
     and filters change pixels and are deliberately not here. ── */
  image_align_left: { domain: 'format', icon: 'format_align_left', label: 'Float left' },
  image_align_center: { domain: 'format', icon: 'format_align_center', label: 'Centre' },
  image_align_right: { domain: 'format', icon: 'format_align_right', label: 'Float right' },
  image_align_none: { domain: 'format', icon: 'format_align_justify', label: 'In line with text' },
  image_width: { domain: 'format', label: 'Image width', takesValue: true },
  image_delete: { domain: 'format', icon: 'delete', label: 'Delete image' },

  /* ── table: earns its own domain because there are seventeen of them and
     they only apply inside a table ── */
  table_add_row_after: { domain: 'table', icon: 'add_row_below', label: 'Row below' },
  table_add_row_before: { domain: 'table', icon: 'add_row_above', label: 'Row above' },
  table_delete_row: { domain: 'table', icon: 'delete', label: 'Delete row' },
  table_add_column_after: { domain: 'table', icon: 'add_column_right', label: 'Column right' },
  table_add_column_before: { domain: 'table', icon: 'add_column_left', label: 'Column left' },
  table_delete_column: { domain: 'table', icon: 'delete_sweep', label: 'Delete column' },
  table_merge_cells: { domain: 'table', icon: 'cell_merge', label: 'Merge cells' },
  table_split_cell: { domain: 'table', icon: 'splitscreen', label: 'Split cell' },
  /* Kept for the compact object bar, where ONE toggling button is right and two
     labelled entries would not fit. The menu uses the explicit pair above, so
     no surface offers the same affordance twice. */
  table_merge_or_split: { domain: 'table', icon: 'cell_merge', label: 'Merge or split cells' },
  table_toggle_header_row: { domain: 'table', icon: 'table_rows', label: 'Header row' },
  table_toggle_header_column: { domain: 'table', icon: 'view_column', label: 'Header column' },
  table_toggle_header_cell: { domain: 'table', icon: 'select_all', label: 'Header cell' },
  /* The TABLE's border - N/048. `takesValue`, so a surface naming one
     without a value has named half a command: the contextual bar supplies a
     free length and a picked colour, the menu supplies the presets below. */
  table_border_width: { domain: 'table', icon: 'line_weight', label: 'Border width', takesValue: true },
  table_border_color: { domain: 'table', icon: 'border_color', label: 'Border colour', takesValue: true },
  table_align_left: { domain: 'table', icon: 'format_align_left', label: 'Align left' },
  table_align_center: { domain: 'table', icon: 'format_align_center', label: 'Align centre' },
  table_align_right: { domain: 'table', icon: 'format_align_right', label: 'Align right' },
  table_delete: { domain: 'table', icon: 'grid_off', label: 'Delete table' },
  cell_text_align: { domain: 'table', label: 'Cell alignment', takesValue: true },
  cell_vertical_align: { domain: 'table', label: 'Vertical alignment', takesValue: true },
  cell_background: { domain: 'table', label: 'Cell background', takesValue: true },
  cell_border: { domain: 'table', label: 'Cell border', takesValue: true },
  cell_padding: { domain: 'table', label: 'Cell padding', takesValue: true },

  /* ── view: what the author sees of the page, never what it IS. Nothing here
     produces a transaction, which is why these live outside the command
     registry in the component and are reached by the same run(). ── */
  source_code: {
    domain: 'view', icon: 'code_blocks', label: 'Source code',
    activeFlag: 'sourceOpen',
    /* The bar's blanket `disabled` does not apply to this one: it is what gets an
       author OUT of the state that disables everything else. Disabled alongside
       the rest, the source view had no exit. */
    ignoresDisabled: true,
  },
  show_blocks: { domain: 'view', icon: 'grid_on', label: 'Show blocks' },
  visual_aids: { domain: 'view', icon: 'border_style', label: 'Visual aids' },
  /* No shortcut hints on these two until the keymap actually binds them: a menu
     that shows Ctrl+P prints the host page, and one that shows Shift+Ctrl+F does
     nothing at all. A promised shortcut that does not work is worse than none. */
  fullscreen: { domain: 'view', icon: 'fullscreen', label: 'Fullscreen' },

  /* ── tools: inspects the document and reports. ── */
  word_count: { domain: 'tools', icon: 'numbers', label: 'Word count' },
};

/* A surface names a command; everything else comes from the catalogue. That is
   what stops the toolbar and the menu disagreeing about a label or a key. */
export function describe(item: SurfaceItem): ResolvedItem {
  if (typeof item === 'string') {
    return item === 'separator'
      ? { type: 'separator' }
      : Object.assign({ command: item }, CATALOGUE[item]);
  }
  if (item.type === 'select' && item.options) {
    return Object.assign({}, item, { options: item.options.map(describe) });
  }
  /* Options are resolved here too, not only on the select path above. The
     select branch returns early, so this line is reached by a select that
     declared none and by any other item carrying them — and an unresolved
     option would make `options` a mixture of shapes the readers do not
     narrow for. One rule: what describe() returns has resolved options. */
  const { options, ...rest } = item;
  const base = rest.command ? CATALOGUE[rest.command] : null;
  const merged: ResolvedItem = base ? Object.assign({}, base, rest) : { ...rest };
  if (options) merged.options = options.map(describe);
  return merged;
}

/**
 * The option list for a takesValue command.
 *
 * Declared here rather than in each surface: the font sizes offered by the
 * menubar and by a future toolbar dropdown are the same list, and two copies of
 * it would diverge the way the two ToolbarItem declarations did.
 */
export function valueItems(
  command: string,
  options: { label: string; value: string | null }[],
): SurfaceItem[] {
  return options.map((o) => ({ command, label: o.label, value: o.value }));
}

export const FONT_FAMILIES = [
  { label: 'Default', value: null },
  { label: 'Sans-serif', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
];

export const FONT_SIZES = [
  { label: 'Default', value: null },
  { label: '12', value: '12px' }, { label: '14', value: '14px' },
  { label: '16', value: '16px' }, { label: '18', value: '18px' },
  { label: '24', value: '24px' }, { label: '32', value: '32px' },
  { label: '48', value: '48px' },
];

/* Named rather than raw hex in the label, because "#b91c1c" tells an author
   nothing about what they are about to pick. */
export const TEXT_COLOURS = [
  { label: 'Default', value: null },
  { label: 'Ink', value: '#18181b' }, { label: 'Slate', value: '#52525b' },
  { label: 'Grey', value: '#a1a1aa' }, { label: 'Red', value: '#b91c1c' },
  { label: 'Orange', value: '#c2410c' }, { label: 'Green', value: '#15803d' },
  { label: 'Blue', value: '#1d4ed8' }, { label: 'Purple', value: '#7e22ce' },
];

export const CELL_BACKGROUNDS = [
  { label: 'None', value: null },
  { label: 'Grey', value: '#f4f4f5' }, { label: 'Red', value: '#fef2f2' },
  { label: 'Orange', value: '#fff7ed' }, { label: 'Green', value: '#f0fdf4' },
  { label: 'Blue', value: '#eff6ff' },
];

export const CELL_BORDERS = [
  { label: 'None', value: null },
  { label: 'Thin', value: '1px solid #d4d4d8' },
  { label: 'Medium', value: '2px solid #a1a1aa' },
  { label: 'Thick', value: '3px solid #71717a' },
];

export const CELL_PADDINGS = [
  { label: 'Default', value: null },
  { label: 'Tight', value: '4px' }, { label: 'Normal', value: '8px' },
  { label: 'Roomy', value: '12px' }, { label: 'Wide', value: '16px' },
];

export const CELL_TEXT_ALIGNS = [
  { label: 'Left', value: 'left' }, { label: 'Centre', value: 'center' },
  { label: 'Right', value: 'right' }, { label: 'Justify', value: 'justify' },
];

export const CELL_VERTICAL_ALIGNS = [
  { label: 'Top', value: 'top' }, { label: 'Middle', value: 'middle' },
  { label: 'Bottom', value: 'bottom' },
];

/* The table border, for a MENU - which cannot hold a number box or a colour
   picker. The contextual bar has both; these are the values worth one click.
   N/048. */
export const TABLE_BORDER_WIDTHS = [
  { label: 'None', value: null },
  { label: 'Hairline (1px)', value: '1px' },
  { label: 'Medium (2px)', value: '2px' },
  { label: 'Thick (3px)', value: '3px' },
];

export const TABLE_BORDER_COLOURS = [
  { label: 'Default', value: null },
  { label: 'Grey', value: '#d0d5dd' },
  { label: 'Black', value: '#0b0b0b' },
  { label: 'White', value: '#ffffff' },
];

export const IMAGE_WIDTHS = [
  { label: 'Original', value: null },
  { label: '25%', value: '25%' }, { label: '50%', value: '50%' },
  { label: '75%', value: '75%' }, { label: 'Full width', value: '100%' },
];

/**
 * The menubar tree.
 *
 * Depth and grouping follow TinyMCE and CKEditor, which agree with each other:
 * a shallow menu of forty entries is a list, not an index. One deliberate
 * difference — table_insert lives in Insert only. Creating a table is an insert;
 * the Table menu is for the table you are already in, and putting it in both is
 * exactly the duplication this file's header criticises.
 */
export const MENUS: { label: string; items: SurfaceItem[] }[] = [
  { label: 'File', items: ['new_document', 'separator', 'preview', 'print'] },
  { label: 'Edit',
    items: ['undo', 'redo', 'separator', 'cut', 'copy', 'paste', 'separator', 'select_all'] },
  {
    label: 'Insert',
    items: ['link', 'insert_image',
      { label: 'Table', icon: 'table',
        /* The command it stands for is named even though the panel does the
           work, so reachability still sees table_insert as homed here rather
           than reporting it unreachable. */
        items: [{ custom: 'table_grid', command: 'table_insert' }] },
      'separator',
      'horizontal_rule', 'hard_break'],
  },
  {
    label: 'Format',
    items: [
      { label: 'Text', icon: 'text_fields',
        items: ['strong', 'em', 'underline', 'strike', 'code', 'highlight',
          'subscript', 'superscript'] },
      { label: 'Blocks', icon: 'segment',
        items: ['paragraph', 'heading1', 'heading2', 'heading3', 'heading4',
          'heading5', 'heading6', 'code_block', 'blockquote'] },
      { label: 'Font', icon: 'font_download', items: valueItems('font_family', FONT_FAMILIES) },
      { label: 'Font size', icon: 'format_size', items: valueItems('font_size', FONT_SIZES) },
      { label: 'Text colour', icon: 'format_color_text', items: valueItems('text_color', TEXT_COLOURS) },
      'separator',
      { label: 'Lists', icon: 'format_list_bulleted',
        items: ['bullet_list', 'ordered_list', 'task_list'] },
      { label: 'Align', icon: 'format_align_left',
        items: ['align_left', 'align_center', 'align_right', 'align_justify',
          'separator', 'align_clear'] },
      { label: 'Indent', icon: 'format_indent_increase',
        items: ['indent', 'outdent', 'page_indent', 'page_outdent'] },
      { label: 'Image', icon: 'image',
        items: ['image_align_left', 'image_align_center', 'image_align_right',
          'image_align_none',
          'separator',
          { label: 'Width', icon: 'width_normal', items: valueItems('image_width', IMAGE_WIDTHS) },
          'separator',
          { command: 'insert_image', label: 'Edit image\u2026', icon: 'edit' },
          'image_delete'] },
      'separator',
      'clear_marks',
    ],
  },
  {
    label: 'Table',
    items: [
      { label: 'Cell', icon: 'cell_merge',
        items: ['table_merge_cells', 'table_split_cell', 'table_merge_or_split',
          'separator',
          { label: 'Alignment', icon: 'format_align_left',
            items: valueItems('cell_text_align', CELL_TEXT_ALIGNS) },
          { label: 'Vertical alignment', icon: 'vertical_align_center',
            items: valueItems('cell_vertical_align', CELL_VERTICAL_ALIGNS) },
          { label: 'Background', icon: 'format_color_fill',
            items: valueItems('cell_background', CELL_BACKGROUNDS) },
          { label: 'Border', icon: 'border_all',
            items: valueItems('cell_border', CELL_BORDERS) },
          { label: 'Padding', icon: 'padding',
            items: valueItems('cell_padding', CELL_PADDINGS) }] },
      { label: 'Row', icon: 'table_rows',
        items: ['table_add_row_before', 'table_add_row_after', 'table_delete_row'] },
      { label: 'Column', icon: 'view_column',
        items: ['table_add_column_before', 'table_add_column_after', 'table_delete_column'] },
      'separator',
      'table_toggle_header_row', 'table_toggle_header_column', 'table_toggle_header_cell',
      'separator',
      { label: 'Table alignment', icon: 'format_align_center',
        items: ['table_align_left', 'table_align_center', 'table_align_right'] },
      { label: 'Table border', icon: 'border_all',
        items: [
          { label: 'Width', icon: 'line_weight',
            items: valueItems('table_border_width', TABLE_BORDER_WIDTHS) },
          { label: 'Colour', icon: 'border_color',
            items: valueItems('table_border_color', TABLE_BORDER_COLOURS) },
        ] },
      'separator',
      'table_delete',
    ],
  },
  /* Source code is in View and NOWHERE else. TinyMCE puts it in both View and
     Tools, which is the drift this file's header names: two homes means two
     labels to keep in step and an author who cannot learn where things live. */
  {
    label: 'View',
    items: ['source_code', 'separator', 'show_blocks', 'visual_aids',
      'separator', 'fullscreen'],
  },
  { label: 'Tools', items: ['word_count'] },
];

/* Reachability, asserted rather than assumed. Called by the menubar on build,
   so adding a command without giving it a menu home fails loudly in the
   console instead of the command quietly existing nowhere. */
export function unreachableCommands(): string[] {
  const seen: Record<string, boolean> = {};
  const walk = (items: SurfaceItem[] | undefined): void => {
    (items || []).forEach((raw) => {
      if (typeof raw === 'string') {
        if (raw !== 'separator') seen[raw] = true;
        return;
      }
      if (raw.items) walk(raw.items);
      else if (raw.command) seen[raw.command] = true;
    });
  };
  MENUS.forEach((menu) => walk(menu.items));
  return Object.keys(CATALOGUE).filter((name) => !seen[name]);
}

/**
 * The OTHER direction, and the one that was missing.
 *
 * unreachableCommands() asserts catalogue -> menu. Nothing asserted registry ->
 * catalogue, so eighteen implemented commands (font_family, font_size,
 * text_color, heading 4-6, insert_image, merge/split cells, the five cell
 * properties, align justify/clear, hard_break) sat in the registry with no
 * catalogue entry and were therefore reachable from no surface at all. The
 * editor knew how to do them and no user could ask.
 *
 * Pass the registry's own key set — the availability map the editor already
 * hands every surface is exactly that.
 */
export function uncataloguedCommands(registryNames: string[]): string[] {
  return (registryNames || []).filter((name) => !CATALOGUE[name]);
}
