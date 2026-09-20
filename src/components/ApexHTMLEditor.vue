<script setup lang="ts">
/**
 * ApexHTMLEditor — edits HTML pages rather than prose documents.
 *
 * A separate component from ApexEditor rather than a mode on it, because the two
 * want opposite things from style isolation. ApexEditor seals its writing area so
 * a host page's CSS cannot touch the document, since a document should look like
 * itself wherever it is embedded. A page is the inverse: it only looks right IN
 * its own stylesheet, so this component loads the target CSS into the editing
 * surface and lets it apply.
 *
 * That inversion is why the surface is an IFRAME. A shadow root scopes styles,
 * but a real site's CSS leans on `:root` variables, inherited properties and
 * global resets that do not cross that boundary cleanly — so the page would look
 * NEARLY right, which is worse than looking wrong. An iframe is a real document:
 * the site's own stylesheet applies exactly as it will in production.
 *
 * Everything above the schema is shared with ApexEditor — the engine, history,
 * keymaps, comments, suggestions, the assist seam and the HTML round-trip all
 * work on any schema by construction, because they go through the schema rather
 * than around it.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps, ApexHTMLEditorClasses } from '../types';
import { baseMarks, baseNodes } from '../core/editor/schema';
import { buildCommands } from '../core/editor/commands';
import { loadEngine } from '../core/editor/engine';
import { activeState, buildKeymap } from '../core/editor/keymap';
import { CATALOGUE } from '../core/editor/catalogue';
import { setLink as setLinkCmd, unsetLink as unsetLinkCmd } from '../core/editor/commands';
import {
  buildPageCommands, preserveAttrBag, readCellStyle, readTextStyle, rowResizing,
  type CellState, type TextStyleState,
} from '../core/editor/htmlStructure';
import { buildInputRules } from '../core/editor/inputRules';
import { buildTableCommands } from '../core/editor/tables';
import { createTable } from '../core/editor/tables';
import { tableNodes } from '../core/editor/tables';
import { htmlMarks, htmlNodes, withAttrBag, VOID_TAGS } from '../core/editor/htmlSchema';
import {
  activeStyle, applyBlockStyle, applyCharacterStyle, type HtmlStyle,
} from '../core/editor/htmlStyles';
import {
  CONTAINER_TAGS, deleteContainer, insertContainer, retagContainer,
  setContainerAttrs, unwrapContainer, wrapInContainer,
} from '../core/editor/htmlStructure';
import type { EditorView } from 'prosemirror-view';
/* `PMNode` is used by objectKind() and three callers and was never
   imported — TS2552 four times over, in a file that had never been
   typechecked against the engine. AF2-282. */
import type { Schema, Node as PMNode } from 'prosemirror-model';
/* Used in the registry composition below to type the align factories and the
   chained indent. Erased at runtime, so the JS mirror is unaffected and no
   browser probe can catch its absence. */
import type { Command } from 'prosemirror-state';

export interface HtmlPathEntry {
  depth: number;
  tag: string;
  pos: number;
}

export interface HtmlActiveState {
  /* This component's own reporting. */
  blockStyle: string | null;
  characterStyle: string | null;
  /** The element ancestry, for a path bar. */
  path: HtmlPathEntry[];
  /**
   * The text styles in force at the selection, read from the document rather
   * than remembered — so a colour control shows what is under the caret.
   */
  textStyle: TextStyleState;
  /**
   * Where the selection sits in a table, or null outside one — which is what
   * tells a contextual table toolbar to stay hidden.
   */
  cell: CellState | null;
  /**
   * The selected OBJECT and where it is on screen, for the floating object bar,
   * or null when the selection is in ordinary text. The rect is in VIEWPORT
   * coordinates: the writing surface is an iframe, so the frame's own offset is
   * added here where the frame is, rather than by the bar.
   */
  object: { kind: 'table' | 'image' | 'embed'; rect: DOMRect } | null;
  /** View state, so a toolbar toggle can show that it is on. */
  sourceOpen?: boolean;
  showBlocks?: boolean;
  visualAids?: boolean;
  fullscreen?: boolean;
  /* Spread in from ApexEditor's own reporter, so a toolbar bound to this object
     needs no knowledge of which editor produced it. Grounded against
     `activeState`'s return literal in core/editor/keymap.ts rather than guessed:
     a declared type that omits what the component emits is unreachable from
     typed code, which is how `textStyle` went undeclared for three rounds. */
  marks: Record<string, boolean>;
  blockType: string;
  blockAttrs: Record<string, unknown>;
  /** True when a selection spans block kinds, so a control can show mixed. */
  blockMixed: boolean;
}

const props = withDefaults(defineProps<ApexFieldProps & {
  /**
   * HTML in and out, because HTML is what this component's documents ARE. There
   * is no JSON source of truth here — the markup is the record, which is the
   * whole point of the component.
   */
  html?: string;
  /** The classes the application offers, applied the way Word's styles are. */
  styles?: HtmlStyle[];
  /** Stylesheet URLs loaded into the editing surface, so what you see is the page. */
  stylesheets?: string[];
  /** Extra CSS, for a theme that is not a file. */
  css?: string;
  /** Classes for the surface's body, since a page's look often depends on them. */
  bodyClass?: string;
  minHeight?: string;
  editable?: boolean;
  /**
   * On by DEFAULT here, unlike ApexEditor. In a prose editor the source view is
   * an escape hatch most authors never want; in a page editor it is the reliable
   * way to reach anything the visual surface cannot, so hiding it would withhold
   * the tool this component exists to complement.
   */
  sourceView?: boolean;
  /** Column widths by dragging a cell border, from prosemirror-tables. */
  resizableColumns?: boolean;
  /** Row heights by dragging a row border, which is ours — see rowResizing. */
  resizableRows?: boolean;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexHTMLEditorClasses;
}>(), {
  html: '', minHeight: '320px', editable: true, sourceView: true,
  resizableColumns: true, resizableRows: true,
});

const emit = defineEmits<{
  (e: 'update:html', html: string): void;
  (e: 'selection-change', payload: HtmlActiveState): void;
  (e: 'ready'): void;
  (e: 'error', reason: unknown): void;
  (e: 'source-error', payload: { reason: unknown; html: string }): void;
}>();

const frame = ref<HTMLIFrameElement | null>(null);
const ready = ref(false);
const failed = ref('');
/* The whole shape, not three of its six fields. The initial value is what a
   toolbar binds to for the frame between mount and the first selection
   report, and a partial one reaches it as undefined properties rather than
   as empty ones — `active.textStyle.color` throws there. */
const EMPTY_ACTIVE: HtmlActiveState = {
  blockStyle: null,
  characterStyle: null,
  path: [],
  textStyle: { color: null, fontFamily: null, fontSize: null, mixed: false },
  cell: null,
  object: null,
  /* Spread in from activeState() once a view exists; empty until then. */
  marks: {},
  blockType: 'paragraph',
  blockAttrs: {},
  blockMixed: false,
};
const active = ref<HtmlActiveState>({ ...EMPTY_ACTIVE });
const sourceOpen = ref(false);
/* View state, not document state: these change what the author SEES of the page,
   so they are not transactions and must not enter the command registry, whose
   entries are all ProseMirror commands tested by being called with a state. */
const showBlocks = ref(false);
const visualAids = ref(true);
/* A counter the link editor watches. Insert › Link is a command that needs INPUT
   before it can dispatch anything, so it opens a surface instead of running — and
   that surface is the toolbar's existing link editor rather than a second one
   that would drift from it. */
const linkRequest = ref(0);
/* Same pattern for the image dialog. `insert_image` IS in the registry, but as a
   factory taking attributes — so naming it reported success and did nothing,
   because a factory called as a command returns a function instead of
   dispatching. It needs input, so it opens the dialog and the dialog calls the
   factory. */
const imageRequest = ref(0);
/* Same pattern again for the table size picker. */
const tableRequest = ref(0);
/* Same pattern for the word count dialog. */
const countRequest = ref(0);
const fullscreen = ref(false);
const words = ref(0);
const sourceText = ref('');
const sourceError = ref('');

let view: EditorView | null = null;
let schema: Schema | null = null;
let PM: typeof import('prosemirror-view') & Record<string, unknown> | null = null;
/** What we last emitted, so the caller's echo does not reset the selection. */
let lastEmitted = '';
let commands: Record<string, unknown> = {};
const availability = ref<Record<string, boolean>>({});

const blockStyles = computed(() => (props.styles || []).filter((s) => (s.scope || 'block') === 'block'));
const characterStyles = computed(() => (props.styles || []).filter((s) => s.scope === 'character'));
const rootStyle = computed(() => ({ '--apex-hed-min-h': props.minHeight }));

/* ─── the surface ────────────────────────────────────────── */

/**
 * Stylesheets are written INTO the iframe rather than linked from the host, so
 * the author is looking at the production cascade — the whole reason this is a
 * real document rather than a scoped div.
 *
 * The CSS is FETCHED AND INLINED rather than linked. A `<link>` resolves
 * asynchronously, so the surface renders in browser defaults until it arrives —
 * serif headings, badge spans as plain text, the author's page looking nothing
 * like their page. Re-applying styles tore the link down and started that flash
 * again. Inlining puts the cascade in place in the same frame the document is
 * written, which is what "what you see is what renders" actually requires.
 *
 * Cached by href at module scope: two editors showing the same site's CSS should
 * fetch it once, and a re-mount should not flash unstyled again.
 * `undefined` = never tried · `null` = in flight · `false` = unreadable
 * (cross-origin, so the link is all it can keep) · `string` = usable.
 */
const HREF_CACHE: Record<string, string | null | false> = {};

function applyStyles() {
  const doc = frame.value?.contentDocument;
  if (!doc) return;
  doc.querySelectorAll('[data-apex-css]').forEach((el) => el.remove());

  /* The editor's own MARKUP CONVENTIONS, appended FIRST so a page stylesheet can
     override them, and marked so they travel into a print or a preview — unlike
     the affordance rules below, a task list's boxes are content appearance, not
     an editing aid, and printing it as bullets would be printing something the
     author never wrote. */
  const conventions = doc.createElement('style');
  conventions.setAttribute('data-apex-css', 'convention');
  conventions.textContent = 'ul[data-task-list]{list-style:none;padding-inline-start:1.7em}'
    + 'ul[data-task-list]>li{position:relative}'
    + 'ul[data-task-list]>li::before{content:"";position:absolute;'
    + 'inset-inline-start:-1.4em;inset-block-start:.3em;inline-size:.85em;'
    + 'block-size:.85em;border:1.5px solid currentColor;border-radius:3px;opacity:.5}'
    /* The tick replaces the empty box rather than sitting beside it, so the two
       states cannot both be visible at once. */
    + 'ul[data-task-list]>li[data-checked="true"]::before{content:"\\2713";'
    + 'display:grid;place-items:center;font-size:.72em;line-height:1;opacity:.85}';
  doc.head.appendChild(conventions);

  const inline = doc.createElement('style');
  inline.setAttribute('data-apex-css', 'inline');
  /* Only what editing itself needs. Everything visual belongs to the page's own
     CSS, which is the point of the component. */
  inline.textContent = 'html,body{margin:0}'
    + `.apex-hed__surface{outline:none;min-height:${props.minHeight}}`
    + '.ProseMirror-selectednode{outline:2px solid #4a90d9}'
    /* Editing affordances, so they live in THIS stylesheet and never in the
       author's markup or in a print. Visual aids outline what has no visible box
       of its own; show blocks names every block, which is the view that makes an
       HTML editor's structure legible. */
    + 'html.apex-hed-aids table,html.apex-hed-aids td,html.apex-hed-aids th'
    + '{outline:1px dashed rgba(120,120,130,.55)}'
    + 'html.apex-hed-blocks p,html.apex-hed-blocks h1,html.apex-hed-blocks h2,'
    + 'html.apex-hed-blocks h3,html.apex-hed-blocks h4,html.apex-hed-blocks h5,'
    + 'html.apex-hed-blocks h6,html.apex-hed-blocks blockquote,html.apex-hed-blocks pre,'
    + 'html.apex-hed-blocks ul,html.apex-hed-blocks ol,html.apex-hed-blocks div,'
    + 'html.apex-hed-blocks section,html.apex-hed-blocks article'
    + '{outline:1px solid rgba(120,120,130,.35);outline-offset:1px}'
    /* prosemirror-tables' own affordances, which the library ships as CSS rather
       than as markup. Without them the plugins still WORK and show nothing: a
       cell selection was being made and drawn nowhere, which reads as "dragging
       is not allowed", and the resize cursor class had nothing to style. */
    + '.tableWrapper{overflow-x:auto}'
    /* Positioned, so the selection overlay and the resize handle have something
       to be absolute against. */
    + 'td,th{position:relative}'
    + '.selectedCell::after{content:"";position:absolute;inset:0;z-index:2;'
    + 'background:rgba(120,160,255,.28);pointer-events:none}'
    + '.column-resize-handle{position:absolute;inset-block:0;inset-inline-end:-2px;'
    + 'width:4px;z-index:20;background:#4a90d9;pointer-events:none}'
    /* The class the plugin puts on the editor while the pointer is over a column
       border — the counterpart of the row plugin's inline cursor. */
    + '.resize-cursor{cursor:ew-resize;cursor:col-resize}'
    + (props.css || '');

  (props.stylesheets || []).forEach((href) => {
    const cached = HREF_CACHE[href];
    if (typeof cached === 'string') {
      const el = doc.createElement('style');
      el.setAttribute('data-apex-css', 'sheet');
      el.setAttribute('data-href', href);
      el.textContent = cached;
      doc.head.appendChild(el);
      return;
    }
    /* Not cached yet: link it so the author is not left unstyled while the fetch
       runs, then swap in the text. A cross-origin sheet cannot be read, so the
       link is what it keeps — the reason this falls back rather than failing. */
    const link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-apex-css', 'link');
    doc.head.appendChild(link);
    if (cached === undefined) {
      HREF_CACHE[href] = null;
      fetch(href)
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .then((text) => { HREF_CACHE[href] = text; applyStyles(); })
        .catch(() => { HREF_CACHE[href] = false; });
    }
  });

  /* Appended last, so the editing rules win over a page rule of equal
     specificity — an author's `outline` should not fight the caret. */
  doc.head.appendChild(inline);
  if (props.bodyClass) doc.body.className = props.bodyClass;
  applyViewFlags();
}

function parse(html: string) {
  const doc = frame.value?.contentDocument || document;
  const holder = doc.createElement('div');
  /* Assigned rather than run through DOMParser, so the elements live in the
     iframe's document and inherit its CSS while ProseMirror measures them. */
  holder.innerHTML = html || '';
  return (PM as never as typeof import('prosemirror-model')).DOMParser
    .fromSchema(schema as Schema).parse(holder);
}

async function build() {
  /* Through the shared loader rather than seven imports of its own. Both
     editors have to end up holding the SAME module objects: two copies of
     prosemirror-model means two `Node` classes and every `instanceof` across
     the boundary is quietly false. A bundler would probably deduplicate
     these anyway — "probably" is the part core/editor/engine.ts removes.
     The local names are kept so the rest of this function reads as it did. */
  const engine = await loadEngine();
  const { model, state, history, keymap, schemaList } = engine;
  const commandsMod = engine.commands;
  const pm = engine.view as never;
  PM = { ...(engine.view as object), ...model } as never;

  /* The prose nodes gain an attribute bag FIRST, so `<p class="lead">` keeps its
     class while still being a paragraph — the block styles gallery works by
     setting exactly that class, so without this the primary case is broken. */
  schema = new model.Schema({
    nodes: { ...withAttrBag({ ...baseNodes, ...tableNodes }), ...htmlNodes },
    /* Marks go through the same wrapper as nodes: a mark's own getAttrs reads
       its href, so leaving marks raw left that unguarded — and a
       <strong class="x"> had nowhere to keep its class. */
    marks: { ...withAttrBag(baseMarks as never), ...htmlMarks },
  } as never);

  const el = frame.value;
  if (!el) return;
  const doc = el.contentDocument as Document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>');
  doc.close();
  applyStyles();

  const mount = doc.createElement('div');
  mount.className = 'apex-hed__surface';
  doc.body.appendChild(mount);

  /* ApexEditor's own registry, keymap and input rules, unchanged: they are driven
     BY the schema rather than by a fixed node list, so they work on a permissive
     schema without knowing it is one. Building a second set would be exactly the
     drift these modules' headers warn about. */
  /* `tables` included — it was not, and the schema has carried tableNodes all
     along. `buildTableCommands` reads `deps.tables.addRowBefore` and the Tab
     binding at the foot of this function reads `deps.tables.goToNextCell`, so
     building this editor threw on the first line that touched either and the
     component reported "could not" and rendered nothing. It could never have
     mounted with tables in its schema. `inputrules` was missing the same way,
     one throw further along at `ir.emDash`. AF2-282. */
  const deps = { commands: commandsMod, schemaList, state, history, view: pm, tables: engine.tables, inputrules: engine.inputrules } as never;
  const merged = {
    ...buildCommands(schema, deps),
    ...buildTableCommands(schema, deps),
  };
  /* buildPageCommands comes LAST on purpose: its align_* entries replace the
     inherited ones, which write a data-align attribute that only a host
     stylesheet honours and this iframe deliberately lacks. */
  const page = buildPageCommands(schema) as Record<string, unknown>;
  commands = { ...preserveAttrBag(merged), ...page };
  /* The align entries are factories taking no argument from the toolbar, so they
     are pre-applied — a button calls run('align_center') with no value and must
     get a command, not another factory. */
  ['align_left', 'align_center', 'align_right', 'align_justify', 'align_clear']
    .forEach((name) => {
      const factory = page[name];
      if (typeof factory === 'function') commands[name] = (factory as () => Command)();
    });
  /* Chained rather than replaced: inside a list the inherited indent is still
     right, so list nesting is tried first and margin is the fallback when it does
     not apply. */
  if (page.page_indent) {
    const chain = commandsMod.chainCommands;
    commands.indent = merged.indent
      ? chain(merged.indent, page.page_indent as Command)
      : (page.page_indent as Command);
    commands.outdent = merged.outdent
      ? chain(merged.outdent, page.page_outdent as Command)
      : (page.page_outdent as Command);
  }

  const plugins = [
    buildInputRules(schema, deps),
    keymap.keymap(buildKeymap(schema, deps) as never),
    history.history(),
    keymap.keymap(commandsMod.baseKeymap),
  ];
  /* The table plugins were MISSING here, though ApexEditor installs them.
     tableEditing is what makes a drag across cells a CellSelection — so without
     it "merge cells" had no way to be given more than one cell to merge, and the
     entry looked broken rather than unreachable. */
  if (schema.nodes.table) {
    const tablesMod = (deps as { tables: typeof import('prosemirror-tables') }).tables;
    /* unshift, so Tab moves between cells before the base keymap treats it as
       indentation — inside a table, moving is what Tab means. */
    plugins.unshift(keymap.keymap({
      Tab: tablesMod.goToNextCell(1),
      'Shift-Tab': tablesMod.goToNextCell(-1),
    }) as never);
    plugins.push(tablesMod.tableEditing() as never);
    if (props.resizableColumns) {
      plugins.push(tablesMod.columnResizing({ cellMinWidth: 48 }) as never);
    }
    if (props.resizableRows) plugins.push(rowResizing() as never);
  }
  view = new (pm as typeof import('prosemirror-view')).EditorView(mount, {
    state: state.EditorState.create({
      doc: parse(props.html),
      plugins,
    }),
    editable: () => props.editable,
    dispatchTransaction(tr) {
      if (!view) return;
      view.updateState(view.state.apply(tr));
      if (tr.docChanged) emitHtml();
      reportSelection();
    },
  });
  ready.value = true;
  reportSelection();
  syncHeight();
  emit('ready');
}

/* ─── html in and out ────────────────────────────────────── */

function getHtml(): string {
  if (!view || !schema || !frame.value?.contentDocument) return '';
  const model = PM as never as typeof import('prosemirror-model');
  const doc = frame.value.contentDocument;
  const host = doc.createElement('div');
  host.appendChild(
    model.DOMSerializer.fromSchema(schema).serializeFragment(view.state.doc.content, { document: doc }),
  );
  /* Editor-only attributes are stripped on the way out: `data-tight` is a
     document convention that means nothing in a page, and shipping it would put
     editor bookkeeping into the author's markup. Removed here rather than in the
     schema's `toDOM`, because the editor itself uses it. */
  host.querySelectorAll('[data-tight]').forEach((el) => el.removeAttribute('data-tight'));
  return host.innerHTML;
}

function setHtml(html: string) {
  if (!view) return false;
  const next = parse(html);
  const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, next.content);
  /* addToHistory false, so loading a record is not an undoable edit. */
  tr.setMeta('addToHistory', false);
  view.dispatch(tr);
  return true;
}

function emitHtml() {
  const html = getHtml();
  lastEmitted = html;
  emit('update:html', html);
  syncHeight();
}

/**
 * The iframe has no intrinsic height, so it is told what its content needs —
 * otherwise the page would scroll inside a fixed box, which is exactly what a
 * page editor must not do.
 */
function syncHeight() {
  const body = frame.value?.contentDocument?.body;
  if (!body || !frame.value) return;
  frame.value.style.height = `${Math.max(
    parseInt(props.minHeight, 10) || 320,
    body.scrollHeight + 24,
  )}px`;
}

/**
 * Indented for reading, since a page's markup nests far deeper than a document's
 * and one long line is unusable. Structural only — no attribute reflowing,
 * because reformatting inside a tag risks changing it.
 */
function formatHtml(html: string): string {
  const parts = String(html || '').replace(/>\s*</g, '>\n<').split('\n');
  let depth = 0;
  return parts.map((line) => {
    const closing = /^<\//.test(line);
    const tag = (line.match(/^<\/?\s*([a-zA-Z0-9-]+)/) || [])[1];
    const selfClosing = /\/>$/.test(line) || (!!tag && VOID_TAGS.includes(tag.toLowerCase()));
    const pair = /^<([a-zA-Z0-9-]+)[^>]*>.*<\/\1>$/.test(line);
    if (closing) depth = Math.max(0, depth - 1);
    const out = '  '.repeat(depth) + line;
    if (!closing && !selfClosing && !pair) depth += 1;
    return out;
  }).join('\n');
}

/** Parsed on EXIT, not per keystroke: half-typed markup is invalid markup. */
function toggleSource() {
  if (!props.sourceView) return false;
  const done = toggleSourceInner();
  /* The active state carries sourceOpen, and nothing else reports after a
     view-only change — without this the toolbar's toggle stayed unlit until the
     next selection change. */
  if (view) reportSelection();
  return done;
}
function toggleSourceInner() {
  if (!props.sourceView) return false;
  if (!sourceOpen.value) {
    sourceText.value = formatHtml(getHtml());
    sourceError.value = '';
    sourceOpen.value = true;
    return true;
  }
  try {
    setHtml(sourceText.value);
    sourceError.value = '';
    sourceOpen.value = false;
  } catch (e) {
    /* Left open with the text intact rather than discarded: someone who typed
       markup we cannot parse has not asked to lose it. */
    sourceError.value = String((e as Error)?.message || e);
    emit('source-error', { reason: e, html: sourceText.value });
  }
  return true;
}

/* ─── selection and styles ───────────────────────────────── */

function reportSelection() {
  if (!view || !schema) return;
  const found = activeStyle(view.state as never, props.styles || [], schema);
  /* The element path, which is how an author sees and selects the container they
     are inside — the alternative is a structure tree nobody asked for. */
  const path: HtmlPathEntry[] = [];
  const $from = view.state.selection.$from;
  for (let d = $from.depth; d > 0; d -= 1) {
    const node = $from.node(d);
    path.unshift({
      depth: d,
      tag: (node.attrs.tag as string) || node.type.name,
      pos: $from.before(d),
    });
  }
  /* The same active state ApexEditor's toolbar reads, so bold lights up and the
     block dropdown shows the right thing without a second reporter. */
  const editorActive = activeState(view.state, schema);
  /* Availability is asked of each command WITHOUT dispatching — ProseMirror's own
     applicability test. */
  const avail: Record<string, boolean> = {};
  Object.keys(commands).forEach((name) => {
    /* The style and image commands are FACTORIES — they take a value and return
       the command — so calling them with a state would test the wrong thing. */
    if (name.startsWith('cell_')) { avail[name] = !!active.value.cell; return; }
    if (CATALOGUE[name]?.takesValue) {
      /* Asked of the command rather than approximated as "is there a selection":
         a heading declares marks: 'link' and cannot hold a styling span, and only
         the command knows that. Called with null, a value it accepts and whose
         applicability test is identical. The catalogue's own flag decides which
         entries are factories, so a new value command does not need a name list
         here edited too. */
      try {
        const made = (commands[name] as (v: unknown) => unknown)(null);
        avail[name] = typeof made === 'function'
          ? !!(made as (s: unknown) => boolean)(view!.state)
          : false;
      } catch { avail[name] = false; }
      return;
    }
    if (name === 'insert_image') { avail[name] = true; return; }
    try {
      avail[name] = !!(commands[name] as (s: unknown) => boolean)(view!.state);
    } catch { avail[name] = false; }
  });
  availability.value = avail;
  /* The view commands report availability the same way, so the menubar greys
     "Source code" on an editor built without a source view rather than offering
     a button that returns false. */
  const ui = uiCommands();
  Object.keys(ui).forEach((name) => {
    avail[name] = ui[name].can ? !!ui[name].can!() : true;
  });
  availability.value = avail;
  words.value = countWords();
  active.value = {
    ...editorActive,
    blockStyle: found.block, characterStyle: found.character, path,
    /* Read from the document, so the colour, font and size controls show what is
       under the caret rather than what was last picked. */
    textStyle: readTextStyle(view.state, schema),
    cell: readCellStyle(view.state),
    object: objectAt(),
    /* View state travels with document state, so a toolbar toggle can show that
       it is on — a source-view button reads its own state from here. */
    sourceOpen: sourceOpen.value,
    showBlocks: showBlocks.value,
    visualAids: visualAids.value,
    fullscreen: fullscreen.value,
  };
  emit('selection-change', active.value);
}

export type StructureAction = 'wrap' | 'unwrap' | 'retag' | 'insert' | 'remove' | 'attrs';

/**
 * One entry point, so a toolbar button and a keyboard shortcut produce the same
 * transaction — the pattern ApexEditor's command registry established.
 */
function structureCommand(action: StructureAction, arg?: unknown) {
  if (!schema) return null;
  switch (action) {
    case 'wrap': return wrapInContainer(schema, (arg as string) || 'div');
    case 'unwrap': return unwrapContainer(schema);
    case 'retag': return retagContainer(schema, arg as string);
    case 'insert': return insertContainer(schema, (arg as string) || 'div');
    case 'remove': return deleteContainer(schema);
    case 'attrs': return setContainerAttrs(schema, (arg as Record<string, string | null>) || {});
    default: return null;
  }
}

function structure(action: StructureAction, arg?: unknown) {
  const cmd = structureCommand(action, arg);
  if (!cmd || !view) return false;
  const ok = cmd(view.state, (tr) => view?.dispatch(tr));
  view.focus();
  return ok;
}

/**
 * Asked without dispatching, which is ProseMirror's own applicability test — so
 * a disabled button is disabled because the document said so.
 */
function canStructure(action: StructureAction, arg?: unknown) {
  const cmd = structureCommand(action, arg);
  return !!(cmd && view && cmd(view.state));
}

/* A table, an image and an embed are all OBJECTS: things a selection is inside
   or on rather than text it runs through. The floating bar is positioned at
   whichever one the selection is in, innermost first, so a table inside a table
   gets the bar for the one being edited. */
/* Read from the TAG rather than the node type: both void nodes carry an
   arbitrary tag, so an <img> and an <input> are the same node type and only the
   tag says which one the bar should describe. A lookup table keyed by node
   type stood here and could not answer that question; it was already dead
   when this was ported, and nothing had noticed. */
function objectKind(node: PMNode): 'table' | 'image' | 'embed' | null {
  const name = node.type.name;
  if (name === 'table') return 'table';
  if (name !== 'void_inline' && name !== 'void_element') return null;
  return (node.attrs as { tag?: string }).tag === 'img' ? 'image' : 'embed';
}

function objectAt(): HtmlActiveState['object'] {
  if (!view) return null;
  const sel = view.state.selection as typeof view.state.selection & { node?: PMNode };
  /* A void node is SELECTED rather than entered, so it is never an ancestor and
     the walk below would miss it entirely. */
  if (sel.node) {
    const kind = objectKind(sel.node);
    if (kind) {
      const dom = view.nodeDOM(sel.from);
      const rect = viewportRect(dom);
      if (rect) { objectDom = dom; return { kind, rect }; }
    }
  }
  const $from = sel.$from;
  for (let d = $from.depth; d > 0; d -= 1) {
    const kind = objectKind($from.node(d));
    if (!kind) continue;
    const dom = view.nodeDOM($from.before(d));
    const rect = viewportRect(dom);
    if (rect) { objectDom = dom; return { kind, rect }; }
  }
  objectDom = null;
  return null;
}

/** The selected object's DOM node, so an overlay can re-measure it on scroll. */
let objectDom: unknown = null;

/**
 * The object's rect RE-MEASURED, for an overlay that has to follow it.
 *
 * The rect inside `active` is a snapshot from the last selection change; a
 * scroll moves the object without changing it.
 */
function objectRect(): DOMRect | null {
  return objectDom ? viewportRect(objectDom) : null;
}

/* The writing surface is an IFRAME, so a node's own rect is frame-relative while
   the bar is a fixed overlay in the host document. */
function viewportRect(dom: unknown): DOMRect | null {
  const el = dom as { getBoundingClientRect?: () => DOMRect } | null;
  if (!el || typeof el.getBoundingClientRect !== 'function' || !frame.value) return null;
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  const f = frame.value.getBoundingClientRect();
  return new DOMRect(r.left + f.left, r.top + f.top, r.width, r.height);
}

/* A sentinel, because null is a real command argument ("unset this property")
   and undefined is what an optional parameter already means. */
const NO_VALUE = Symbol('apex.noValue');

/**
 * View-level commands: they change what is shown, not what the document is.
 *
 * Kept out of `commands` because everything in there is a ProseMirror command
 * and availability tests it by calling it with a state — a toggle put in that
 * map would be called as one and report nonsense. Named so a menu, a shortcut
 * and a toolbar button all reach the same one through run().
 */
interface UiCommand { run: () => boolean; can?: () => boolean }
function uiCommands(): Record<string, UiCommand> {
  return {
    source_code: { run: () => toggleSource(), can: () => !!props.sourceView },
    show_blocks: { run: () => { showBlocks.value = !showBlocks.value; applyViewFlags(); return true; } },
    visual_aids: { run: () => { visualAids.value = !visualAids.value; applyViewFlags(); return true; } },
    fullscreen: { run: () => { fullscreen.value = !fullscreen.value; return true; } },
    word_count: { run: () => { words.value = countWords(); countRequest.value += 1; return true; } },
    select_all: { run: () => selectAll(), can: () => !sourceOpen.value },
    /* Not a registry command: a link needs an address, so naming it can only
       open the editor. Its availability is real — a link needs text to attach
       to, or an existing link under the caret to edit. */
    link: {
      run: () => { linkRequest.value += 1; return true; },
      can: () => {
        if (!view || sourceOpen.value) return false;
        if (!view.state.selection.empty) return true;
        const mark = schema?.marks.link;
        if (!mark) return false;
        return !!mark.isInSet(view.state.storedMarks || view.state.selection.$from.marks());
      },
    },
    new_document: { run: () => newDocument() },
    print: { run: () => printPage() },
    preview: { run: () => previewPage() },
    insert_image: {
      run: () => { imageRequest.value += 1; return true; },
      can: () => !sourceOpen.value,
    },
    /* Shadows the registry's fixed 3×3 entry so BOTH the menu and the toolbar
       reach the size picker — a table's shape is the first thing an author
       decides, and a command that guesses it is a command they have to undo.
       `insertTable(rows, cols)` stays available for a host that mounts no
       picker. */
    table_insert: {
      run: () => { tableRequest.value += 1; return true; },
      can: () => !sourceOpen.value,
    },
  };
}

/* Built through the shared createTable, so a picked size and the registry's
   default produce the same structure — header row included. */
function insertTable(rows: number, cols: number) {
  if (!view || !schema) return false;
  const table = createTable(schema, Math.max(1, rows || 1), Math.max(1, cols || 1), true);
  if (!table) return false;
  view.dispatch(view.state.tr.replaceSelectionWith(table).scrollIntoView());
  view.focus();
  return true;
}

/* The selected image's attributes, so the dialog opens ON it rather than blank —
   editing is editing, not replacing. */
function selectedImage(): Record<string, string> | null {
  const node = (view?.state.selection as { node?: PMNode } | undefined)?.node;
  const attrs = node?.attrs as { tag?: string; attrs?: Record<string, string> } | undefined;
  if (!node || !attrs || attrs.tag !== 'img') return null;
  if (node.type.name !== 'void_inline' && node.type.name !== 'void_element') return null;
  return { ...(attrs.attrs || {}) };
}

/* One entry point for both cases: an image is selected, so this is an edit;
   nothing is, so it is an insert. The dialog does not need to know which, and
   neither does the surface that opened it. */
function applyImage(attrs: Record<string, string>) {
  if (!view) return false;
  const sel = view.state.selection as typeof view.state.selection & { node?: PMNode };
  const node = sel.node;
  const own = node?.attrs as { tag?: string } | undefined;
  const isImage = !!node && own?.tag === 'img'
    && (node.type.name === 'void_inline' || node.type.name === 'void_element');
  if (isImage) {
    view.dispatch(view.state.tr.setNodeMarkup(sel.from, null, { tag: 'img', attrs }));
    view.focus();
    return true;
  }
  return insertImage(attrs);
}

/* Both flags are classes on the iframe's own root rather than inline styles on
   each element: the author's markup is the record here, and writing outlines
   into it would put an editing affordance into the saved page. */
function applyViewFlags() {
  const root = frame.value?.contentDocument?.documentElement;
  if (!root) return;
  root.classList.toggle('apex-hed-blocks', showBlocks.value);
  root.classList.toggle('apex-hed-aids', visualAids.value);
}

function countWords() {
  if (!view) return 0;
  const text = view.state.doc.textBetween(0, view.state.doc.content.size, ' ', ' ');
  return text.trim().match(/[^\s]+/g)?.length || 0;
}

/**
 * Counted over a RANGE, so the document and a selection go through the same
 * function — two counters would eventually disagree about what a word is.
 *
 * Blocks are separated by a newline in the extracted text and by a space inside
 * a block: without the newline the last word of one paragraph and the first of
 * the next would be counted as one.
 */
function countRange(from: number, to: number) {
  const text = view!.state.doc.textBetween(from, to, '\n', ' ');
  let blocks = 0;
  view!.state.doc.nodesBetween(from, to, (node) => { if (node.isTextblock) blocks += 1; });
  return {
    words: text.match(/[^\s]+/g)?.length || 0,
    chars: text.length,
    charsNoSpaces: text.replace(/\s+/g, '').length,
    blocks,
  };
}

function wordStats() {
  if (!view) return { doc: null, selection: null };
  const sel = view.state.selection;
  return {
    doc: countRange(0, view.state.doc.content.size),
    /* null rather than a zeroed row: nothing is selected, which is not the same
       as a selection of nothing. */
    selection: sel.empty ? null : countRange(sel.from, sel.to),
  };
}

function selectAll() {
  if (!view || !PM) return false;
  const cmd = (PM as { commands?: { selectAll?: unknown } }).commands?.selectAll;
  if (typeof cmd === 'function') return run(cmd as (...a: never[]) => boolean);
  const All = (PM as { state?: { AllSelection?: new (d: unknown) => unknown } }).state?.AllSelection;
  if (!All) return false;
  view.dispatch(view.state.tr.setSelection(new All(view.state.doc) as never));
  view.focus();
  return true;
}

/* An empty paragraph rather than an empty document: a doc with no block is not
   valid against the schema, and the caret would have nowhere to go.

   NOT routed through setHtml, which suppresses history for the prop-sync path —
   correct there, wrong here. Clearing the page is a USER action and undo is what
   an author reaches for, so the step stays in history. The caret is placed and
   the view focused too: replacing the document without either left an editor
   that looked ready and could not be typed into. */
function newDocument() {
  if (!view || !PM) return false;
  const next = parse('<p></p>');
  const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, next.content);
  const S = (PM as { state?: { Selection?: { atStart: (d: unknown) => unknown } } }).state?.Selection;
  if (S) tr.setSelection(S.atStart(tr.doc) as never);
  view.dispatch(tr);
  view.focus();
  return true;
}

/* Printed and previewed from the SERIALISED markup plus the page's own
   stylesheets — not by printing the iframe, whose editing affordances (the caret
   outline, the block guides above) would come with it. Selected by the marker
   attribute, which the inline affordance stylesheet deliberately lacks. */
function renderStandalone() {
  const parts: string[] = [];
  frame.value?.contentDocument
    ?.querySelectorAll('[data-apex-css="sheet"],[data-apex-css="link"],[data-apex-css="convention"]')
    .forEach((n) => {
      if (n.tagName === 'STYLE') parts.push(`<style>${n.textContent}</style>`);
      else parts.push(`<link rel="stylesheet" href="${n.getAttribute('href')}">`);
    });
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${parts.join('')}`
    + `</head><body class="${props.bodyClass || ''}">${getHtml()}</body></html>`;
}

function openStandalone(afterLoad?: (w: Window) => void) {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.open();
  win.document.write(renderStandalone());
  win.document.close();
  if (afterLoad) win.setTimeout(() => afterLoad(win), 120);
  return true;
}
function printPage() { return openStandalone((w) => { w.focus(); w.print(); }); }
function previewPage() { return openStandalone(); }

/**
 * One registry for every surface, exactly as in ApexEditor: a toolbar button, a
 * keyboard shortcut and a slash command run the same command.
 */
function run(name: string | ((...a: never[]) => boolean), value: unknown = NO_VALUE) {
  /* View commands first and by name only: they are not ProseMirror commands, so
     they never reach the factory unwrapping below. */
  if (typeof name === 'string') {
    const ui = uiCommands()[name];
    if (ui) return !!ui.run();
  }
  let cmd = typeof name === 'function' ? name : commands[name];
  if (!cmd || !view) return false;
  /* A value means the registry entry is a FACTORY rather than a command:
     font_size SETS a size, it does not toggle one. Applied here so a menu item
     and a toolbar dropdown reach the same command instead of each unwrapping the
     factory its own way. The sentinel matters because null is a real argument —
     "unset this property" — and is not the same call as no argument at all.
     The align_* entries are pre-applied at build time and must never be called
     this way, which is why the CALLER's intent is the signal rather than a guess
     about the entry's shape. */
  if (value !== NO_VALUE) {
    if (typeof cmd !== 'function') return false;
    cmd = (cmd as (v: unknown) => typeof cmd)(value);
    if (typeof cmd !== 'function') return false;
  }
  const ok = (cmd as (s: unknown, d: unknown, v: unknown) => boolean)(
    view.state, (tr: unknown) => view?.dispatch(tr as never), view,
  );
  view.focus();
  return ok;
}
function canRun(name: string) { return availability.value[name] !== false; }

/* Links are core to a page editor: without these the toolbar's link slot has
   nothing to apply. */
function setLink(attrs: { href: string; target?: string | null }) {
  const mark = schema?.marks.link;
  return mark ? run(setLinkCmd(mark, attrs)) : false;
}
function unsetLink() {
  const mark = schema?.marks.link;
  return mark ? run(unsetLinkCmd(mark)) : false;
}
/** The href under the caret, so the editor opens on the existing link. */
function getLinkContext() {
  if (!view || !schema?.marks.link) return { href: '', target: null };
  const mark = schema.marks.link.isInSet(view.state.selection.$from.marks());
  return mark
    ? { href: String(mark.attrs.href), target: mark.attrs.target as string | null }
    : { href: '', target: null };
}
/** Value-per-property, so a colour change does not clear the font size. */
function setTextStyle(kind: string, value: string | null) {
  const factory = commands[kind];
  return typeof factory === 'function'
    ? run((factory as (v: string | null) => never)(value))
    : false;
}
/** Value-per-property, so setting a fill does not clear the border. */
function setCellStyle(prop: string, value: string | null) {
  const factory = commands[prop];
  return typeof factory === 'function'
    ? run((factory as (v: string | null) => Command)(value))
    : false;
}
function insertImage(attrs: Record<string, unknown>) {
  const factory = commands.insert_image;
  return typeof factory === 'function'
    ? run((factory as (a: Record<string, unknown>) => never)(attrs))
    : false;
}

/** One call for both kinds, routed by the style's own scope. */
function applyStyle(style: HtmlStyle | null) {
  if (!view || !schema) return false;
  const scope = style?.scope || 'block';
  const cmd = scope === 'character'
    ? applyCharacterStyle(schema, style, props.styles || [])
    : applyBlockStyle(schema, style, props.styles || []);
  const ok = cmd(view.state, (tr) => view?.dispatch(tr));
  view.focus();
  return ok;
}
function clearStyle(scope: 'block' | 'character') {
  return applyStyle({ label: '', className: null as never, scope });
}
function selectPath(entry: HtmlPathEntry) {
  if (!view || !PM) return;
  const state = PM as never as typeof import('prosemirror-state');
  view.dispatch(view.state.tr.setSelection(
    state.NodeSelection.create(view.state.doc, entry.pos) as never,
  ));
  view.focus();
}

/* ─── lifecycle ──────────────────────────────────────────── */

onMounted(async () => {
  try {
    await build();
  } catch (e) {
    failed.value = String((e as Error)?.message || e);
    emit('error', e);
  }
});
onBeforeUnmount(() => { view?.destroy(); view = null; });

watch(() => props.html, (v) => {
  /* The same echo suppression ApexEditor uses: without it every keystroke would
     round-trip through the caller's model and reset the selection. */
  if (v === lastEmitted) return;
  if (view) setHtml(v);
});
watch(() => [props.css, props.stylesheets], applyStyles, { deep: true });
watch(() => props.styles, reportSelection, { deep: true });
watch(() => props.editable, () => view?.updateState(view.state));

/* Every accessor carries a get/is prefix, without exception — the rule ApexEditor
   arrived at the hard way: on an Options-API host, props and data sit on the
   instance and win over a method of the same name. */
defineExpose({
  getView: () => view,
  getSchema: () => schema,
  getHtml,
  setHtml,
  getActive: () => active.value,
  applyStyle,
  clearStyle,
  selectPath,
  run,
  canRun,
  setLink,
  unsetLink,
  getLinkContext,
  setTextStyle,
  setCellStyle,
  insertImage,
  getCommands: () => availability.value,
  structure,
  canStructure,
  toggleSource,
  isSourceOpen: () => sourceOpen.value,
  focus: () => view?.focus(),
  isReady: () => ready.value,
});
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="html" :label-for="false"
             v-slot="{ id, describedBy, invalid, labelId }">
  <div class="apex-hed" :class="ui?.root" :id="id" role="group" :aria-labelledby="labelId"
       :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
       :aria-required="required || undefined"
       :style="rootStyle" :data-ready="ready ? 'true' : 'false'"
       :data-fullscreen="fullscreen ? 'true' : 'false'">
    <slot v-if="failed" name="error" :message="failed">
      <div class="apex-hed__error" :class="ui?.error" role="alert">{{ failed }}</div>
    </slot>
    <slot name="toolbar" :styles="styles || []" :block-styles="blockStyles"
          :character-styles="characterStyles" :active="active"
          :apply="applyStyle" :clear="clearStyle"
          :structure="structure" :can="canStructure" :containers="CONTAINER_TAGS"
          :source-open="sourceOpen" :toggle-source="toggleSource"
          :run="run" :can-run="canRun" :commands="availability"
          :object-rect="objectRect"
          :link-request="linkRequest"
          :image-request="imageRequest" :image-attrs="selectedImage()"
          :apply-image="applyImage"
          :table-request="tableRequest" :insert-table="insertTable"
          :count-request="countRequest" :word-stats="wordStats"
          :set-link="setLink" :unset-link="unsetLink" :link-context="getLinkContext"
          :set-text-style="setTextStyle" :insert-image="insertImage"
          :cell="active.cell" :set-cell-style="setCellStyle" />
    <!-- an IFRAME, because a page only looks right in its own stylesheet and a
         shadow root does not carry :root variables or global resets cleanly -->
    <!-- The source view and its parse error are ONE slot: a host replacing the
         editor surface must be able to place the error against it, and two slots
         would let them drift apart. -->
    <slot v-if="sourceOpen" name="source-view" :text="sourceText"
          :set-text="(v: string) => { sourceText = v; }" :error="sourceError">
      <textarea class="apex-ed__source" :class="ui?.source" :value="sourceText"
                spellcheck="false" aria-label="Page markup"
                @input="sourceText = ($event.target as HTMLTextAreaElement).value"></textarea>
      <p v-if="sourceError" class="apex-ed__source-error" :class="ui?.sourceError" role="alert">{{ sourceError }}</p>
    </slot>
    <!-- v-show, never v-if: v-if would destroy the iframe, and its document, its
         stylesheets and the view mounted inside would all have to be rebuilt from
         nothing every time the source view was closed -->
    <iframe v-show="!sourceOpen" ref="frame" class="apex-hed__frame" :class="ui?.frame" title="Page content"></iframe>
    <slot v-if="!ready && !failed" name="loading">
      <div class="apex-hed__loading" :class="ui?.loading">Loading the editor…</div>
    </slot>
    <slot v-if="ready" name="status" :path="active.path" :words="words"
          :select-path="selectPath" :source-open="sourceOpen">
      <nav class="apex-hed__status" :class="ui?.status" aria-label="Document status">
        <span v-if="active.path.length" class="apex-hed__path" :class="ui?.path">
          <button v-for="p in active.path" :key="p.depth" type="button"
                  class="apex-hed__crumb" :class="ui?.crumb" @click="selectPath(p)">{{ p.tag }}</button>
        </span>
        <span class="apex-hed__words" :class="ui?.words">{{ words }} {{ words === 1 ? 'word' : 'words' }}</span>
      </nav>
    </slot>
  </div>
  </ApexField>
</template>
