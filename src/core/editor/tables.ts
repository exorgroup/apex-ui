/**
 * Tables.
 *
 * Built on prosemirror-tables rather than hand-rolled nodes. A table's hard part
 * is not the markup — it is keeping colspan and rowspan consistent through every
 * edit, so that deleting a column that a merged cell spans does the right thing.
 * That bookkeeping is what the library is, and reimplementing it would be
 * reimplementing the only difficult part.
 *
 * What we own here: the schema's attributes, the commands the toolbars call, and
 * the decision about what a table in *this* document is allowed to be.
 */
import type { Schema, NodeSpec, Node as PMNode } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

interface Deps {
  tables: typeof import('prosemirror-tables');
  state: typeof import('prosemirror-state');
}

/**
 * Cell attributes.
 *
 * colwidth is an array rather than a number because a cell spanning three
 * columns has three widths to remember, and collapsing them to one would lose
 * the distribution the author dragged into place.
 */
const cellAttrs = {
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: { default: null },
  /* Alignment on the cell, not a mark: the same reason as a paragraph's. */
  align: { default: null },
  /* Real CSS on the cell, for background, borders and padding.
     `align` above serialises to `data-align`, which is inert without a host
     stylesheet — fine for a prose document whose CSS ships with the editor,
     wrong for a page. So a page editor writes declarations here instead and they
     render wherever the markup lands. One string rather than parsed fields,
     because a cell can carry any declaration. */
  style: { default: null },
};

function readCellAttrs(dom: HTMLElement) {
  const widthAttr = dom.getAttribute('data-colwidth');
  const widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr)
    ? widthAttr.split(',').map(Number)
    : null;
  const colspan = Number(dom.getAttribute('colspan') || 1);
  return {
    colspan,
    rowspan: Number(dom.getAttribute('rowspan') || 1),
    /* A width list that does not match the span is stale — a merge happened
       after the drag — so it is dropped rather than applied to the wrong cells. */
    colwidth: widths && widths.length === colspan ? widths : null,
    align: dom.getAttribute('data-align') || dom.style.textAlign || null,
    style: dom.getAttribute('style') || null,
  };
}

function writeCellAttrs(node: { attrs: Record<string, unknown> }) {
  const attrs: Record<string, string> = {};
  if ((node.attrs.colspan as number) !== 1) attrs.colspan = String(node.attrs.colspan);
  if ((node.attrs.rowspan as number) !== 1) attrs.rowspan = String(node.attrs.rowspan);
  if (node.attrs.colwidth) {
    attrs['data-colwidth'] = (node.attrs.colwidth as number[]).join(',');
  }
  if (node.attrs.align) attrs['data-align'] = node.attrs.align as string;
  return attrs;
}

/**
 * The table's border, written twice: as data, and as something that renders.
 *
 * The data attributes are the record — a sanitiser on the far side of a
 * database can keep those and drop everything else. The `style` carries the
 * same two values as CUSTOM PROPERTIES, which is what makes stored markup
 * render on a page that has never heard of this editor: CSS cannot read an
 * attribute into a length or a colour, so something has to put them where a
 * declaration can reach them.
 *
 * A host that strips `style` (TBX does) maps the attributes back itself; a host
 * that does not gets a table that simply looks right.
 */
function tableBorderAttrs(node: { attrs: Record<string, unknown> }): Record<string, string> {
  const width = node.attrs.borderWidth as string | null;
  const colour = node.attrs.borderColor as string | null;
  const attrs: Record<string, string> = {};
  const style: string[] = [];

  if (width) {
    attrs['data-border-width'] = width;
    style.push(`--apex-tbl-bw:${width}`);
  }

  if (colour) {
    attrs['data-border-color'] = colour;
    style.push(`--apex-tbl-bc:${colour}`);
  }

  if (style.length) attrs.style = style.join(';');

  return attrs;
}

export const tableNodes: Record<string, NodeSpec> = {
  table: {
    content: 'table_row+',
    tableRole: 'table',
    isolating: true,
    group: 'block',
    /* The border belongs to the TABLE, not to the cells. It is what a person
       means by "table border": it survives a row being added, and it is one
       value to set rather than one per cell. Null means "whatever the host
       stylesheet says", which is not the same as zero - zero is a table
       somebody deliberately took the lines off. */
    attrs: {
      borderWidth: { default: null },
      borderColor: { default: null },
    },
    parseDOM: [{
      tag: 'table',
      getAttrs: (dom) => ({
        borderWidth: (dom as HTMLElement).getAttribute('data-border-width'),
        borderColor: (dom as HTMLElement).getAttribute('data-border-color'),
      }),
    }],
    /* The colgroup is what makes resizing work at all: without fixed layout the
       browser redistributes widths on every keystroke, and a dragged column
       would spring back as its content changed. */
    toDOM: (node) => ['table', tableBorderAttrs(node), ['tbody', 0]],
  },
  table_row: {
    content: '(table_cell | table_header)*',
    tableRole: 'row',
    parseDOM: [{ tag: 'tr' }],
    toDOM: () => ['tr', 0],
  },
  table_cell: {
    content: 'block+',
    attrs: cellAttrs,
    tableRole: 'cell',
    isolating: true,
    parseDOM: [{ tag: 'td', getAttrs: (dom) => readCellAttrs(dom as HTMLElement) }],
    toDOM: (node) => ['td', writeCellAttrs(node), 0],
  },
  table_header: {
    content: 'block+',
    attrs: cellAttrs,
    tableRole: 'header_cell',
    isolating: true,
    parseDOM: [{ tag: 'th', getAttrs: (dom) => readCellAttrs(dom as HTMLElement) }],
    toDOM: (node) => ['th', writeCellAttrs(node), 0],
  },
};

/**
 * Builds a table node.
 *
 * A header row by default, because a table without one is a grid of unlabelled
 * numbers — and someone who wants that can turn it off, where someone who
 * wanted headers and did not get them has to build them by hand.
 */
export function createTable(
  schema: Schema,
  rows: number,
  cols: number,
  withHeaderRow = true,
) {
  const cellType = schema.nodes.table_cell;
  const headerType = schema.nodes.table_header;
  const paragraph = schema.nodes.paragraph;

  /* A schema without the table nodes: both callers already answer null
     with `return false`, and until now the check was dead code, because
     this threw on `undefined.createAndFill` before it could return
     anything. An editor built without `tables` still exposes
     `insertTable`, and a caller cannot be expected to know that asking
     is fatal rather than merely useless. */
  if (!cellType || !headerType || !schema.nodes.table_row || !schema.nodes.table) return null;

  const emptyCell = (type: typeof cellType) => type.createAndFill(null, paragraph.create())!;

  const body = [];
  for (let r = 0; r < rows; r += 1) {
    const cells = [];
    const type = (withHeaderRow && r === 0) ? headerType : cellType;
    for (let c = 0; c < cols; c += 1) cells.push(emptyCell(type));
    body.push(schema.nodes.table_row.create(null, cells));
  }
  return schema.nodes.table.create(null, body);
}

/** Sets the alignment of every selected cell. */
export function setCellAlign(align: string | null, deps: Deps): Command {
  return (state, dispatch) => {
    const sel = state.selection as unknown as { ranges: { $from: { pos: number }; $to: { pos: number } }[] };
    const tr = state.tr;
    let touched = false;
    sel.ranges.forEach((range) => {
      state.doc.nodesBetween(range.$from.pos, range.$to.pos, (node, pos) => {
        if (node.type.name !== 'table_cell' && node.type.name !== 'table_header') return true;
        /* Setting the alignment already in force clears it, so the button is a
           toggle rather than a one-way switch — as with block alignment. */
        const next = node.attrs.align === align ? null : align;
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, align: next });
        touched = true;
        return false;
      });
    });
    if (!touched) return false;
    if (dispatch) dispatch(tr);
    return true;
  };
}

/**
 * The table commands, keyed by name into the same registry the toolbars read.
 *
 * Every one is guarded by prosemirror-tables' own applicability, so a toolbar
 * asking `can('table_delete_row')` outside a table gets false from the library
 * rather than from a rule we guessed.
 */
export function buildTableCommands(schema: Schema, deps: Deps): Record<string, Command> {
  const t = deps.tables;
  if (!schema.nodes.table) return {};
  return {
    table_insert: (state, dispatch) => {
      /* Inserted with replaceSelectionWith rather than at a computed position:
         the selection may be inside a list or a quote, and the schema decides
         where a table can actually land. */
      const table = createTable(schema, 3, 3, true);
      if (!table) return false;
      if (dispatch) dispatch(state.tr.replaceSelectionWith(table).scrollIntoView());
      return true;
    },
    table_add_row_before: t.addRowBefore,
    table_add_row_after: t.addRowAfter,
    table_delete_row: t.deleteRow,
    table_add_column_before: t.addColumnBefore,
    table_add_column_after: t.addColumnAfter,
    table_delete_column: t.deleteColumn,
    table_merge_cells: t.mergeCells,
    table_split_cell: t.splitCell,
    /* One button for both directions: merge when cells are selected, split when
       one merged cell is — which is what the reader means by "merge/split". */
    /* No `view`: prosemirror-tables declares both of these as
       `(state, dispatch?)`, not as a full Command. The third argument was
       being accepted and discarded — harmless at runtime, and a type error
       the moment the engine is actually declared. */
    table_merge_or_split: (state, dispatch) => (
      t.mergeCells(state, dispatch) || t.splitCell(state, dispatch)
    ),
    table_toggle_header_row: t.toggleHeaderRow,
    table_toggle_header_column: t.toggleHeaderColumn,
    table_toggle_header_cell: t.toggleHeaderCell,
    table_delete: t.deleteTable,
    table_align_left: setCellAlign('left', deps),
    table_align_center: setCellAlign('center', deps),
    table_align_right: setCellAlign('right', deps),
  };
}

/**
 * Setting one attribute on the table the selection is in.
 *
 * A value command rather than a toggle: a width of `2px` written twice is
 * still `2px`, where the media commands' toggle behaviour would erase it on
 * the second keystroke — the bug N/034 found on the image size boxes, and the
 * reason this is written as a plain set.
 */
function setTableAttr(attr: 'borderWidth' | 'borderColor'): (value: string | null) => Command {
  return (value) => (state, dispatch) => {
    const $from = (state as unknown as {
      selection: { $from: { depth: number; node: (d: number) => PMNode; before: (d: number) => number } };
    }).selection.$from;

    for (let depth = $from.depth; depth > 0; depth -= 1) {
      const node = $from.node(depth);

      if (node.type.name !== 'table') continue;
      if (!dispatch) return true;

      dispatch(state.tr.setNodeMarkup($from.before(depth), undefined, {
        ...node.attrs,
        [attr]: value || null,
      }));

      return true;
    }

    return false;
  };
}

/**
 * The table commands that need a VALUE — the border, for now.
 *
 * Kept apart from `buildTableCommands` for the reason the media ones are: a
 * registry of `Command` and a registry of `(value) => Command` are different
 * shapes, and a toolbar that cannot tell them apart runs the factory as a
 * command and silently does nothing.
 */
export function buildTableValueCommands(schema: Schema): Record<string, (value: string | null) => Command> {
  if (!schema.nodes.table) return {};

  return {
    table_border_width: setTableAttr('borderWidth'),
    table_border_color: setTableAttr('borderColor'),
  };
}

/** The border the selected table is wearing, for the bar to show. */
export function tableBorder(state: unknown, schema: Schema): { width: string | null; color: string | null } | null {
  if (!schema.nodes.table) return null;

  const $from = (state as { selection: { $from: { depth: number; node: (d: number) => PMNode } } }).selection.$from;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);

    if (node.type.name === 'table') {
      return {
        width: (node.attrs.borderWidth as string | null) ?? null,
        color: (node.attrs.borderColor as string | null) ?? null,
      };
    }
  }

  return null;
}

/**
 * The border, painted through a DECORATION — N/048.
 *
 * `toDOM` is not enough inside the editor: with `columnResizing` on, a table
 * has prosemirror-tables' own node view, which BUILDS the table element itself
 * and writes `min-width` and `--default-cell-min-width` onto its style. The
 * attributes this schema emits never reach that element, so a table with a
 * border looked bordered everywhere except the place it was being set.
 *
 * A node decoration is the seam the library leaves for exactly this: its
 * attributes are merged onto whatever DOM the node view produced, so the two
 * are no longer competing for the same attribute.
 *
 * `toDOM` keeps writing the style as well, and must: that copy is what makes
 * stored markup render on a page with no editor in it.
 */
export function tableBorderDecorations(
  schema: Schema,
  deps: { state: typeof import('prosemirror-state'); view: typeof import('prosemirror-view') },
) {
  return new deps.state.Plugin({
    props: {
      decorations(state: import('prosemirror-state').EditorState) {
        if (!schema.nodes.table) return null;

        const found: import('prosemirror-view').Decoration[] = [];

        state.doc.descendants((node, pos) => {
          if (node.type.name !== 'table') return true;

          const width = node.attrs.borderWidth as string | null;
          const colour = node.attrs.borderColor as string | null;

          /* Not observable in the DOM - prosemirror-view drops an empty
             style attribute, so a mutation deleting this line survives
             every test and rightly. It is here so a long document does
             not allocate a decoration per table to say nothing. */
          if (!width && !colour) return false;

          const style = [
            width ? `--apex-tbl-bw:${width}` : '',
            colour ? `--apex-tbl-bc:${colour}` : '',
          ].filter(Boolean).join(';');

          found.push(deps.view.Decoration.node(pos, pos + node.nodeSize, { style }));

          /* A table cannot contain another table in this schema, so there is
             nothing below worth walking into. */
          return false;
        });

        return found.length ? deps.view.DecorationSet.create(state.doc, found) : null;
      },
    },
  });
}

/** Whether the selection is inside a table, for a toolbar to show its controls. */
export function inTable(state: unknown, schema: Schema): boolean {
  if (!schema.nodes.table) return false;
  const $from = (state as { selection: { $from: { depth: number; node: (d: number) => { type: { name: string } } } } })
    .selection.$from;
  for (let d = $from.depth; d > 0; d -= 1) {
    if ($from.node(d).type.name === 'table') return true;
  }
  return false;
}

/**
 * Table keymap.
 *
 * Tab moves between cells rather than indenting, because inside a table that is
 * what Tab means everywhere else — and a table is the one place where the list
 * binding would be actively wrong.
 */
export function tableKeymap(deps: Deps): Record<string, Command> {
  const t = deps.tables;
  return {
    Tab: t.goToNextCell(1),
    'Shift-Tab': t.goToNextCell(-1),
  };
}
