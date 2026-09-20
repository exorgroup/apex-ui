<script setup lang="ts">
/**
 * ApexEditor — a rich text editor over ProseMirror.
 *
 * The document is JSON, and JSON is the source of truth. HTML is an export
 * rather than the storage format: a tree can be queried, validated and migrated,
 * where an HTML string can only be re-parsed and hoped over.
 *
 * ProseMirror owns the state internally and the caller owns it externally, which
 * is the one genuinely awkward part of the integration. A naive `watch(model)`
 * that resets the state would round-trip every keystroke through the caller and
 * destroy the selection and the undo stack on each character. So the editor
 * remembers what it last emitted and ignores the echo, treating only a genuinely
 * different document as an external change.
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import ApexField from './ApexField.vue';
/* Imported, not resolved globally. The template used it and nothing
   imported it: in the gallery every component is registered on the
   window, so it resolved there and would fail for anyone importing
   this component directly — "Failed to resolve component", and the
   surface simply never appears. AF2-284. */
import ApexEditorSlash from './ApexEditorSlash.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps, ApexEditorClasses } from '../types';
import { loadEngine, type ApexEditorEngine } from '../core/editor/engine';
import { baseMarks, baseNodes, emptyDoc, sameDoc } from '../core/editor/schema';
import {
  addComment, commentMark, commentPlugin, readAnchors, removeComment, threadsAtSelection,
  type CommentAnchor,
} from '../core/editor/comments';
import {
  asSuggestion, readSuggestions, resolveAll, resolveSuggestion, suggestionMarks,
  type SuggestionAuthor, type SuggestionRange,
} from '../core/editor/suggestions';
import {
  fromHtml, toHtml, toMarkdown, toText, wordCount, type ExportOptions,
} from '../core/editor/serialise';
import {
  applyAssistResult, assistKey, assistPlugin, assistRange, assistScope,
  type AssistAction, type AssistRequest,
} from '../core/editor/assist';
import { activeState, buildKeymap } from '../core/editor/keymap';
import { readCellStyle } from '../core/editor/htmlStructure';
import { buildInputRules, type InputRuleOptions } from '../core/editor/inputRules';
import { buildCommands, setLink, toggleTask, unsetLink } from '../core/editor/commands';
import { slashPlugin, type SlashItem, type SlashState } from '../core/editor/slash';
import {
  cleanPastedHtml, looksLikeMarkdown, parseMarkdown, pastedUrl, type PasteOptions,
} from '../core/editor/paste';
import {
  buildTableCommands, buildTableValueCommands, createTable, inTable, tableBorder,
  tableBorderDecorations, tableKeymap, tableNodes,
} from '../core/editor/tables';
import {
  buildMediaCommands, buildMediaValueCommands, embedNodeView, imageNodeView,
  isImageFile, matchEmbed, mediaNodes,
  uploadPlaceholderPlugin, placeholderPos,
  type UploadHandler, type UploadPlaceholderPlugin,
} from '../core/editor/media';

export interface EditorDoc {
  type: string;
  content?: unknown[];
  [key: string]: unknown;
}

const props = withDefaults(defineProps<ApexFieldProps & {
  /** The document, as ProseMirror JSON. v-model:doc. */
  doc?: EditorDoc | null;
  placeholder?: string;
  /** Reading only, but still selectable and copyable. */
  readonly?: boolean;
  /** Not editable and not focusable, the field-level disabled state. */
  disabled?: boolean;
  autofocus?: boolean;
  /** Room the writing area takes; it grows with content beyond this. */
  minHeight?: string | number;
  maxHeight?: string | number;
  /** Draw the border and padding, or sit bare inside a caller's own frame. */
  bordered?: boolean;
  /** Sizes the type scale of the whole document. */
  size?: 'sm' | 'md' | 'lg';
  spellcheck?: boolean;
  ariaLabel?: string;
  /** Markdown shorthands and typographic replacements. See InputRuleOptions. */
  inputRules?: boolean | InputRuleOptions;
  /** The slash menu. Its items name the same commands the toolbars use. */
  slashMenu?: boolean;
  slashItems?: SlashItem[];
  /** Paste handling. See PasteOptions; true is the defaults. */
  paste?: boolean | PasteOptions;
  /** Tables. Off keeps them out of the schema entirely, so a paste cannot
   *  introduce one the document is not meant to hold. */
  tables?: boolean;
  /** Drag column edges to resize. */
  resizableColumns?: boolean;
  /** Images and video embeds. Off keeps them out of the schema. */
  media?: boolean;
  /**
   * Answers a file with a URL. The editor never uploads: it emits the intent and
   * holds a placeholder until this resolves, so endpoints, auth and retries stay
   * with the application that owns the storage.
   */
  onUpload?: UploadHandler;
  /** Turn a pasted video URL into an embed. */
  embedOnPaste?: boolean;
  /**
   * Comment anchors. The document stores a thread id on a range; the thread
   * itself belongs to the application's store, where it can be queried,
   * paginated and permissioned.
   */
  comments?: boolean;
  /** Which thread the reader is looking at, so the editor can paint it. */
  activeThread?: string | null;
  /** Threads the application considers resolved, styled differently. */
  resolvedThreads?: string[];
  /**
   * Track changes. Insertions and deletions both become marks — a deletion has
   * to stay visible until someone accepts it, so nothing is removed until then.
   */
  suggestions?: boolean;
  /** Suggesting is on: edits become suggestions rather than changes. */
  suggesting?: boolean;
  /** Who is suggesting. Carried on the mark, so a reviewer can filter by author. */
  author?: SuggestionAuthor;
  /**
   * AI seams. No provider is bundled: the editor emits a request and the
   * application answers it — endpoints, model, auth, rate limits, cost and
   * prompt wording all belong to whoever owns the account.
   */
  /**
   * An HTML source view, the way TinyMCE's Code button works. Off by default: a
   * document with tables and figures is far easier to break in source than to
   * build, and most authors never want it.
   */
  sourceView?: boolean;
  assist?: boolean;
  onAssist?: (request: AssistRequest) => void;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), {
  placeholder: 'Write something\u2026',
  minHeight: 180,
  bordered: true,
  size: 'md',
  spellcheck: true,
  slashMenu: true,
  tables: true,
  resizableColumns: true,
  media: true,
  embedOnPaste: true,
  comments: false,
  suggestions: false,
  suggesting: false,
  /**
   * Vue casts an ABSENT Boolean prop to `false`, and this one's false
   * means "plain text only" - so with no default every editor pasted
   * nothing at all. `transformPastedHTML` returned '' for every paste,
   * and because ProseMirror decides between the HTML and text branches
   * BEFORE that transform runs, it never fell back to the text: an
   * empty slice, `preventDefault`, and a document unchanged.
   *
   * Dead for every consumer of this component since the prop was
   * added, which is how a default that looks like a formality earns a
   * paragraph. N/036.
   */
  paste: true,
  /* The same trap, one prop along: `props.inputRules !== false` with an
     absent Boolean cast to false means no input rules at all - no `# `
     heading, no `- ` list, no smart quotes - for every consumer that
     did not pass the prop. Found by looking for siblings the moment
     `paste` was understood, which is the only reason it was found. */
  inputRules: true,
});

const emit = defineEmits<{
  (e: 'update:doc', doc: EditorDoc): void;
  (e: 'paste', payload: { kind: 'html' | 'markdown' | 'text' | 'link' | 'embed' | 'file'; length: number }): void;
  (e: 'upload-error', payload: { file: File; reason: unknown }): void;
  /** The anchors and where they sit, for a caller to align a gutter against. */
  (e: 'anchors-change', payload: CommentAnchor[]): void;
  (e: 'thread-click', payload: { threadId: string }): void;
  (e: 'suggestions-change', payload: SuggestionRange[]): void;
  (e: 'assist-request', payload: AssistRequest): void;
  (e: 'assist-error', payload: { action: AssistAction; reason: unknown }): void;
  (e: 'source-error', payload: { reason: unknown; html: string }): void;
  /** The clipboard refused, or the browser does not offer it to a page. */
  (e: 'clipboard-error', payload: { action: 'paste'; reason: unknown }): void;
  (e: 'change', payload: { doc: EditorDoc; text: string }): void;
  (e: 'selection-change', payload: ReturnType<typeof activeState>): void;
  (e: 'focus' | 'blur'): void;
  (e: 'ready'): void;
}>();

/* The file picker `insert_image` opens. Hidden, and outside the editing
   surface, so ProseMirror never sees it as content. */
const filePicker = ref<HTMLInputElement | null>(null);

const host = ref<HTMLElement | null>(null);
const ready = ref(false);
const failed = ref<string | null>(null);
const empty = ref(true);
const active = shallowRef<ReturnType<typeof activeState> | null>(null);

/* Held outside reactivity: an EditorView is a large mutable object that owns DOM,
   and making it reactive would have Vue walk it on every transaction. */
let view: import('prosemirror-view').EditorView | null = null;
let schema: import('prosemirror-model').Schema | null = null;
let PM: ApexEditorEngine | null = null;

/** The last document this editor emitted, to tell an echo from a real change. */
let lastEmitted: EditorDoc | null = null;
let commandRegistry: Record<string, import('prosemirror-state').Command> = {};
let uploadPlugin: UploadPlaceholderPlugin | null = null;
let anchorObserver: ResizeObserver | null = null;

const editable = computed(() => !props.readonly && !props.disabled);

/**
 * The live view, for the slot scopes.
 *
 * A function rather than the bare `view` binding: the view is deliberately not
 * reactive — it is a large mutable object that owns DOM — so a bare binding would
 * hand the slot whatever it was at that render, which is `undefined` at the
 * first one because `mount()` has not finished. Reading it through a call takes
 * the current value each time, and `ready` turning true is what guarantees the
 * render that picks it up.
 */
function getView() { return view; }
const pasteOpts = computed<PasteOptions>(() => (typeof props.paste === 'object'
  ? props.paste
  : (props.paste === false ? { plainTextOnly: true } : {})));

const slash = ref<SlashState | null>(null);
const slashCoords = ref<{ x: number; y: number } | null>(null);
const slashList = ref<{ handleKey: (k: string) => boolean; hasItems: () => boolean } | null>(null);

/**
 * The link under the caret, so the link editor edits rather than replaces.
 *
 * Read from the resolved position's marks rather than from the DOM: the DOM's
 * href has already been through `toDOM`, where the mark carries the attributes
 * the author actually set.
 */
const linkContext = computed<{ href: string | null; target: string | null }>(() => {
  void active.value;
  if (!view || !schema?.marks.link) return { href: null, target: null };
  const { $from } = view.state.selection;
  const mark = schema.marks.link.isInSet($from.marks())
    || schema.marks.link.isInSet(view.state.storedMarks || []);
  if (!mark) return { href: null, target: null };
  return { href: mark.attrs.href as string, target: (mark.attrs.target as string) || null };
});

function emitDoc() {
  if (!view) return;
  const json = view.state.doc.toJSON() as EditorDoc;
  lastEmitted = json;
  empty.value = view.state.doc.textContent.length === 0
    && view.state.doc.childCount <= 1;
  emit('update:doc', json);
  emit('change', { doc: json, text: view.state.doc.textContent });
}

/**
 * Runs one file through the application's upload handler.
 *
 * The placeholder goes in first and the promise decides its fate: a URL replaces
 * it, a rejection removes it. Nothing is written to the document until the
 * application has answered, so a failed upload leaves no broken image behind —
 * and a save mid-upload persists a document without the placeholder, because the
 * placeholder was never part of it.
 */
function uploadFile(file: File, at: number) {
  if (!view || !schema?.nodes.image || !uploadPlugin) return;
  const handler = props.onUpload;
  const id = {};
  const key = uploadPlugin.uploadKey;

  view.dispatch(view.state.tr.setMeta(key, { add: { id, pos: at } }));

  const settle = (result: { src: string; alt?: string; width?: string } | null, reason?: unknown) => {
    if (!view) return;
    /* `placeholderPos` exists for exactly this and was written with the
       plugin; reading the decoration set by hand here is what let the
       two drift apart. */
    const pos = placeholderPos(key, view.state, id);
    const tr = view.state.tr.setMeta(key, { remove: { id } });
    /* The placeholder may be gone — the paragraph holding it deleted while the
       upload ran — in which case the result is dropped rather than inserted
       somewhere arbitrary. */
    if (result && pos !== null) {
      /**
       * INSIDE a line of text, the picture is part of that line.
       *
       * A caret in the middle of a sentence means "here", and a block
       * figure cannot be here - it would split the paragraph in two
       * and land between the halves. So a paragraph that already has
       * words gets the inline picture, and an empty one (or any other
       * place) gets the figure, which is what a picture on its own
       * line is.
       */
      const $at = view.state.doc.resolve(pos);
      const inText = $at.parent.type.name === 'paragraph' && $at.parent.content.size > 0;
      const type = inText && schema!.nodes.image_inline
        ? schema!.nodes.image_inline
        : schema!.nodes.image;

      const node = type.create({
        src: result.src,
        /**
         * NO description unless the application supplies one.
         *
         * This used to be the file's own name, which reads as a
         * description and is not one: an upload arrived carrying
         * `716REunS42L._AC_UL450_SY400` and an author had to notice it
         * and clear it before writing anything. Worse, a reader's
         * software would have read that aloud.
         *
         * Null is what the bar shows as "no description" - a warning
         * icon and an empty field with a prompt in it - so the absence
         * is visible rather than papered over. N/034c.
         */
        alt: result.alt ?? null,
        width: result.width ?? null,
      });
      tr.insert(pos, node);
    }
    view.dispatch(tr);
    if (!result) emit('upload-error', { file, reason });
  };

  if (!handler) {
    /**
     * With no handler, the file becomes a data URL.
     *
     * A working default rather than a silent failure, since an editor that
     * dropped images on the floor until configured would look broken. It is
     * deliberately not for production — a data URL bloats the document — which
     * is why the docs say so rather than the component pretending otherwise.
     */
    const reader = new FileReader();
    reader.onload = () => settle({ src: String(reader.result) });
    reader.onerror = () => settle(null, reader.error);
    reader.readAsDataURL(file);
    return;
  }
  handler({ file, resolve: (result) => settle(result), reject: (reason) => settle(null, reason) });
}

/**
 * What kind of OBJECT the selection is in, and where it is on screen.
 *
 * `ApexHTMLEditor` has had this since its object bar was built, and
 * `ApexEditor` had nothing - so a host could mount `ApexEditorObjectBar`
 * and had no way to tell it what to show or where to put it. That is why
 * the table tools, which exist and carry exactly the commands an author
 * asks for (insert and delete row and column, merge, split, header
 * toggles), could not be reached from this editor at all.
 *
 * A selected node is checked FIRST: an image is selected rather than
 * entered, so it is never an ancestor and the walk below would miss it.
 */
function objectKind(node: import('prosemirror-model').Node): 'table' | 'image' | 'embed' | null {
  const name = node.type.name;
  if (name === 'image_inline') return 'image';

  return name === 'table' || name === 'image' || name === 'embed' ? name : null;
}

/** The element for a node, measured, or null when it has no box yet. */
function rectOf(dom: unknown): DOMRect | null {
  const el = dom as { getBoundingClientRect?: () => DOMRect } | null;
  if (!el || typeof el.getBoundingClientRect !== 'function') return null;
  const r = el.getBoundingClientRect();

  return r.width || r.height ? r : null;
}

/* The object's own DOM, kept so an overlay can RE-MEASURE it while the
   page scrolls: a rect taken when the selection changed is a snapshot,
   and re-placing from it puts the bar back where it already was. */
let objectDom: unknown = null;

function objectAt(): { kind: 'table' | 'image' | 'embed'; rect: DOMRect } | null {
  if (!view) return null;
  const sel = view.state.selection as typeof view.state.selection & {
    node?: import('prosemirror-model').Node;
  };

  if (sel.node) {
    const kind = objectKind(sel.node);
    if (kind) {
      const dom = view.nodeDOM(sel.from);
      const rect = rectOf(dom);
      if (rect) { objectDom = dom; return { kind, rect }; }
    }
  }

  for (let depth = sel.$from.depth; depth > 0; depth -= 1) {
    const kind = objectKind(sel.$from.node(depth));
    if (!kind) continue;
    const dom = view.nodeDOM(sel.$from.before(depth));
    const rect = rectOf(dom);
    if (rect) { objectDom = dom; return { kind, rect }; }
  }

  objectDom = null;

  return null;
}

/** Re-measured on demand, for an overlay that has to follow the object. */
function objectRect(): DOMRect | null {
  return rectOf(objectDom);
}

/**
 * The editor's own box, for an overlay that must stay inside it.
 *
 * A floating bar clamped only to the window drifts outside a dialog
 * the moment its subject is taller than the dialog - on screen,
 * detached, and pointing at nothing.
 */
function editorBounds(): DOMRect | null {
  return rectOf(host.value);
}

/**
 * One CSS declaration onto the selected cells.
 *
 * The table bar writes alignment as a style, because the page editor it
 * was built for stores real CSS on the cell. A prose document does not:
 * it keeps an `align` ATTRIBUTE, which the stylesheet reads and the
 * sanitiser allows, where a `style` attribute would be stripped on save.
 * So the one declaration the bar sends is translated to the command
 * that already exists, and anything else is refused rather than written
 * somewhere it would not survive.
 */
function setCellStyle(prop: string, value: string | null) {
  if (prop !== 'text-align') return false;

  return runCommand(`table_align_${value || 'left'}`);
}

/**
 * A table of a CHOSEN size.
 *
 * The registry's `table_insert` makes a fixed 3x3, which is the right
 * default for a keystroke and the wrong one for a toolbar: a table's shape
 * is the first thing an author decides, and a command that guesses it is a
 * command they have to undo. `ApexEditorTableGrid` picks the size and calls
 * this - the arrangement `ApexHTMLEditor` already has, mirrored here so the
 * two editors' `#table` slots take the same control.
 *
 * Built through the shared `createTable`, so a picked size and the
 * registry's default produce the same structure, header row included.
 */
function insertTable(rows: number, cols: number) {
  if (!view || !schema) return false;
  const table = createTable(schema, Math.max(1, rows || 1), Math.max(1, cols || 1), true);
  if (!table) return false;
  view.dispatch(view.state.tr.replaceSelectionWith(table).scrollIntoView());
  view.focus();
  return true;
}

/**
 * Cut and copy, driven from a button rather than a key.
 *
 * `document.execCommand` rather than a hand-rolled serialisation: it
 * raises a real `cut`/`copy` event, which ProseMirror already handles -
 * it writes both the HTML and the plain text, and marks the HTML with
 * the slice information that makes a paste back into an editor keep its
 * structure. Reimplementing that here would be a second, worse copy.
 *
 * `view.focus()` first, because a toolbar button takes focus when it is
 * pressed and `execCommand` acts on the DOM selection. ProseMirror
 * holds its own selection while blurred and restores it on focus, so
 * the right words are still the ones copied.
 */
function clipboardCommand(kind: 'cut' | 'copy'): import('prosemirror-state').Command {
  return (state, dispatch) => {
    if (state.selection.empty) return false;
    /* Not everywhere: happy-dom has no `execCommand`, and neither do
       some embedded webviews. Asked for rather than assumed, because a
       missing method here is a TypeError in the middle of a keystroke. */
    if (typeof document.execCommand !== 'function') return false;
    if (!dispatch) return true;

    view?.focus();

    return document.execCommand(kind);
  };
}

/**
 * Paste, driven from a button.
 *
 * Reading the clipboard is not something a page may simply do: the
 * browser asks the reader first, and the answer can be no. Chromium
 * and its relatives support `navigator.clipboard.read()`; Firefox does
 * not offer it to a page at all, so the BUTTON cannot work there -
 * Ctrl+V always can, and the failure says so rather than doing nothing.
 *
 * The clipboard is handed to the editor as a real `paste` event rather
 * than inserted directly, so everything a typed paste goes through -
 * the Word cleaner, the markdown reader, the image upload, the embed
 * matcher - happens here too. One path, not two.
 */
async function pasteFromClipboard(): Promise<boolean> {
  const clipboard = navigator.clipboard as Clipboard & {
    read?: () => Promise<ClipboardItem[]>;
  } | undefined;
  if (!view || !clipboard) return false;

  try {
    const data = new DataTransfer();

    if (clipboard.read) {
      for (const item of await clipboard.read()) {
        for (const type of item.types) {
          if (type !== 'text/html' && type !== 'text/plain') continue;
          data.setData(type, await (await item.getType(type)).text());
        }
      }
    } else {
      data.setData('text/plain', await clipboard.readText());
    }

    if (!data.types.length) return false;

    view.focus();
    view.dom.dispatchEvent(new ClipboardEvent('paste', {
      clipboardData: data, bubbles: true, cancelable: true,
    }));

    return true;
  } catch (reason) {
    /* Refused, unsupported, or empty. The host is told so it can say
       something better than nothing - "press Ctrl+V", most likely. */
    emit('clipboard-error', { action: 'paste', reason });

    return false;
  }
}

function applyLink(attrs: { href: string; target?: string | null }) {
  if (!schema?.marks.link) return false;
  return runCommand(setLink(schema.marks.link, attrs));
}
function removeLink() {
  if (!schema?.marks.link) return false;
  return runCommand(unsetLink(schema.marks.link));
}

const anchors = ref<CommentAnchor[]>([]);

/**
 * Re-reads the anchors and their positions.
 *
 * Deferred past the DOM update, because the positions come from `coordsAtPos`
 * and reading synchronously returns the layout from before the edit.
 *
 * A TIMER, not requestAnimationFrame: rAF is paused while the document is
 * hidden, so an editor mounted in a background tab would never take its first
 * reading and the gutter would stay empty for good — the anchors painted in the
 * text with no cards beside them. The ResizeObserver is no substitute, since a
 * hidden tab has no size changes either.
 */
function reportAnchors() {
  if (!props.comments || !view) return;
  window.setTimeout(() => {
    if (!view) return;
    const next = readAnchors(view);
    anchors.value = next;
    emit('anchors-change', next);
  }, 0);
}

const suggestions = ref<SuggestionRange[]>([]);

const sourceOpen = ref(false);
const sourceText = ref('');
const sourceError = ref('');

/**
 * Loading from an HTML column.
 *
 * Cleaned on the way in through the same path a paste takes, since stored HTML is
 * no more trustworthy than clipboard HTML — it may predate the current schema or
 * come from another editor entirely.
 *
 * With one difference: blank lines are KEPT. On a paste an empty paragraph is
 * Word's spacer and worth dropping; in a record being reopened it is spacing the
 * author typed, and removing it closed up their document behind their back.
 */
function setHtml(html: string) {
  if (!view || !schema) return false;
  const doc = fromHtml(html, schema, (h) => cleanPastedHtml(h, { keepEmptyParagraphs: true }));
  /* addToHistory false, so loading a record is not an undoable edit — the same
     rule the doc prop follows. */
  const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
  tr.setMeta('addToHistory', false);
  tr.setMeta('apexSuggestionApply', true);
  view.dispatch(tr);
  return true;
}

/** Parsed on EXIT, not per keystroke: half-typed markup is invalid markup. */
function toggleSource() {
  if (!props.sourceView) return false;
  if (!sourceOpen.value) {
    sourceText.value = view && schema
      ? toHtml(view.state.doc, schema, { suggestions: 'keep', comments: true, pretty: true })
      : '';
    sourceError.value = '';
    sourceOpen.value = true;
    return true;
  }
  try {
    setHtml(sourceText.value);
    sourceError.value = '';
    sourceOpen.value = false;
  } catch (e) {
    /* Kept open with the text intact rather than discarded: someone who typed
       markup we cannot parse has not asked to lose it. */
    sourceError.value = String((e as Error)?.message || e);
    emit('source-error', { reason: e, html: sourceText.value });
  }
  return true;
}

const assistBusy = ref(false);
let assistSeq = 0;

/**
 * One entry point for every action, so a toolbar button, a slash command and a
 * keyboard shortcut all produce the same request and the same landing.
 */
function runAssist(action: AssistAction, options?: Record<string, unknown>) {
  if (!props.assist || !view || !schema) return false;
  const scope = assistScope(view.state.doc, view.state.selection);
  assistSeq += 1;
  const id = `assist-${assistSeq}`;

  /* Marked BEFORE the request goes out, so the author can see what is being
     worked on rather than guessing. */
  view.dispatch(view.state.tr.setMeta(assistKey, {
    add: { from: scope.range.from, to: scope.range.to, id },
  }));
  assistBusy.value = true;

  let settled = false;
  const clear = () => {
    if (!view) return;
    view.dispatch(view.state.tr.setMeta(assistKey, { remove: id }));
    assistBusy.value = false;
  };
  const land = (text: string) => {
    if (settled || !view || !schema) return;
    settled = true;
    /* Read the range BACK rather than reusing the captured one: the author may
       have edited elsewhere while the request was out, and the decoration has
       been mapped through those edits. */
    const range = assistRange(view.state, id);
    clear();
    if (!range) return;
    runCommand(applyAssistResult(schema, range, text,
      props.author || { id: 'assistant', name: 'Assistant' }) as never);
  };

  const request: AssistRequest = {
    action,
    text: scope.text,
    doc: view.state.doc.toJSON(),
    range: scope.range,
    options: options || {},
    resolve: land,
    reject: (reason) => {
      if (settled) return;
      settled = true;
      clear();
      emit('assist-error', { action, reason });
    },
  };

  emit('assist-request', request);
  props.onAssist?.(request);
  return true;
}

function reportSuggestions() {
  if (!props.suggestions || !view || !schema) return;
  const next = readSuggestions(view.state.doc, schema);
  suggestions.value = next;
  emit('suggestions-change', next);
}

/* What an overlay needs and `active` has no room for: the object the
   selection is in, and the cell state the table bar reads. Refreshed
   with the selection so a bar and a toolbar never disagree. */
const objectState = ref<{ kind: 'table' | 'image' | 'embed'; rect: DOMRect } | null>(null);
const cellState = ref<ReturnType<typeof readCellStyle>>(null);

/**
 * The selected image's attributes, or null.
 *
 * `ApexEditorImageTools` hides itself when this is null - the same
 * contract the table bar has with `cell` - so without it the bar was
 * mounted, told which object was selected, and rendered NOTHING. The
 * grips appeared on the picture and no tools came with them, which is
 * how it was reported. N/033b.
 */
const imageState = ref<Record<string, unknown> | null>(null);

function reportSelection() {
  if (!view || !schema) return;
  objectState.value = objectAt();
  cellState.value = readCellStyle(view.state);

  const selected = (view.state.selection as { node?: import('prosemirror-model').Node }).node;
  if (selected?.type.name === 'image' || selected?.type.name === 'image_inline') {
    /* The RENDERED size comes with the attributes, because the size
       boxes have to show a number for a picture that has never been
       given one - "Original" is not something an author can edit. */
    const picture = (view.nodeDOM(view.state.selection.from) as HTMLElement | null)
      ?.querySelector?.('img');
    const box = picture?.getBoundingClientRect();

    imageState.value = {
      /* Which of the two picture nodes this is. The caption field is
         for a FIGURE: a `<figcaption>` cannot live inside a paragraph,
         so an inline picture has no caption to write. N/037. */
      type: selected.type.name,
      ...selected.attrs,
      renderedWidth: box?.width ? Math.round(box.width) : null,
      renderedHeight: box?.height ? Math.round(box.height) : null,
    };
  } else {
    imageState.value = null;
  }
  const next = activeState(view.state, schema);
  /* Table context rides along with the selection report rather than being asked
     for separately, so a toolbar sees one consistent snapshot. */
  (next as Record<string, unknown>).inTable = inTable(view.state, schema);
  active.value = next;
  emit('selection-change', next);
}

function parseDoc(json: EditorDoc | null | undefined) {
  if (!PM || !schema) return null;
  try {
    return PM.model.Node.fromJSON(schema, (json || emptyDoc) as never);
  } catch {
    /* A document the schema cannot represent is the caller's data, not a crash:
       fall back to empty and report rather than tearing down the editor. */
    failed.value = 'The document could not be read against this schema.';
    return PM.model.Node.fromJSON(schema, emptyDoc as never);
  }
}

async function mount() {
  if (!host.value) return;
  try {
    /* One shared, cached load — see core/editor/engine.ts. The original
       reached out of the package into the gallery's vendored copy, which
       resolves nowhere a consumer installs this. */
    PM = await loadEngine();
  } catch (e) {
    failed.value = 'The editor engine could not be loaded.';
    return;
  }

  /* Tables are added to the node set rather than being a second schema: a
     document either can hold a table or cannot, and two schemas would make a
     paste valid in one editor and rejected in the other. */
  schema = new PM.model.Schema({
    nodes: {
      ...baseNodes,
      ...(props.tables ? tableNodes : {}),
      ...(props.media ? mediaNodes : {}),
    } as never,
    marks: {
      ...baseMarks,
      ...(props.comments ? commentMark : {}),
      ...(props.suggestions ? suggestionMarks : {}),
    } as never,
  });

  const plugins = [
    PM.history.history(),
    PM.keymap.keymap(buildKeymap(schema, {
      commands: PM.commands,
      history: PM.history,
      schemaList: PM.schemaList,
    })),
    PM.keymap.keymap(PM.commands.baseKeymap),
  ];
  if (props.tables) {
    /* Before the base keymap, so Tab moves between cells rather than being
       swallowed by the list bindings — inside a table, cell movement is what Tab
       means everywhere else. */
    plugins.unshift(PM.keymap.keymap(tableKeymap({ tables: PM.tables, state: PM.state })) as never);
    plugins.push(PM.tables.tableEditing() as never);
    /* The border is painted by a DECORATION, not by the node's own DOM:
       `columnResizing` gives a table prosemirror-tables' own node view,
       which builds the element itself and writes `min-width` onto its
       style - the attributes this schema emits never reach it. N/048. */
    plugins.push(tableBorderDecorations(schema, { state: PM.state, view: PM.view }) as never);
    if (props.resizableColumns) {
      plugins.push(PM.tables.columnResizing({ cellMinWidth: 48 }) as never);
    }
  }
  if (props.media) {
    uploadPlugin = uploadPlaceholderPlugin({ state: PM.state, view: PM.view });
    plugins.push(uploadPlugin as never);
  }
  if (props.assist) plugins.push(assistPlugin() as never);
  if (props.comments) {
    plugins.push(commentPlugin({ state: PM.state, view: PM.view }, {
      activeThread: () => props.activeThread ?? null,
      resolvedThreads: () => props.resolvedThreads || [],
    }) as never);
  }
  if (props.slashMenu) {
    plugins.push(slashPlugin({ state: PM.state }, {
      onChange: (next) => {
        slash.value = next.active ? next : null;
        if (!next.active || !view) { slashCoords.value = null; return; }
        /* Coordinates come from the trigger position, not the caret: as the query
           grows the caret moves and the menu would crawl sideways. */
        const box = view.coordsAtPos(next.from);
        const host = view.dom.getBoundingClientRect();
        slashCoords.value = {
          x: box.left - host.left,
          y: box.bottom - host.top + 6,
        };
      },
      isOpen: () => !!slash.value && !!slashList.value?.hasItems(),
      onKey: (key) => !!slashList.value?.handleKey(key),
    }) as never);
  }
  if (props.inputRules !== false) {
    plugins.unshift(buildInputRules(schema, { inputrules: PM.inputrules },
      typeof props.inputRules === 'object' ? props.inputRules : {}) as never);
  }
  commandRegistry = buildCommands(schema, {
    commands: PM.commands,
    schemaList: PM.schemaList,
    state: PM.state,
    /* undo and redo are registry commands, not just keybindings: the toolbar
       names them and run() looks them up here. */
    history: PM.history,
  });
  /* The clipboard three. Not ProseMirror commands in the usual sense -
     they reach for the platform - but a toolbar should not have to know
     that, so they are registered like any other. */
  commandRegistry.cut = clipboardCommand('cut');
  commandRegistry.copy = clipboardCommand('copy');
  commandRegistry.paste = ((state, dispatch) => {
    /* Available whenever the platform offers a readable clipboard: a
       button that cannot work should be greyed rather than silent. */
    if (!navigator.clipboard) return false;
    if (dispatch) void pasteFromClipboard();

    return true;
  }) as import('prosemirror-state').Command;

  if (props.tables) {
    Object.assign(commandRegistry, buildTableCommands(schema, { tables: PM.tables, state: PM.state }));
    /* The border takes a VALUE, so it goes in the other registry — a factory
       run as a command silently does nothing, which is what `valueCommands`
       exists to prevent. */
    valueCommands = { ...valueCommands, ...buildTableValueCommands(schema) };
  }
  if (props.media) {
    Object.assign(commandRegistry, buildMediaCommands(schema, { state: PM.state }));
    valueCommands = { ...valueCommands, ...buildMediaValueCommands(schema) };


    /* `insert_image` is in the CATALOGUE and in the standard toolbar, and
       until now it was in no registry at all — so the button drew,
       reported itself available, and did nothing when pressed. Reported
       from the blog screen.
     *
     * It cannot be an ordinary command because it needs INPUT: the same
       reason ApexHTMLEditor opens a dialog for it rather than naming it.
       Here the input is a file, so the command opens the picker and the
       picker feeds `uploadFile()` — the same path a paste and a drop
       already take, so all three get the placeholder, the application's
       URL, and the removal on failure without a second implementation.
     *
     * Available whenever an image node exists in the schema: asked with
       no `dispatch`, it answers true so the toolbar enables the button;
       asked with one, it opens the picker. */
    commandRegistry.insert_image = ((_state, dispatch) => {
      if (!schema?.nodes.image) return false;
      if (dispatch) filePicker.value?.click();

      return true;
    }) as import('prosemirror-state').Command;
  }

  /* Captured, because the node view below reads it LATER - every time
     ProseMirror renders an image - and by then TypeScript can no longer
     see that the engine was loaded before this line. */
  const engine = PM;

  const state = PM.state.EditorState.create({ doc: parseDoc(props.doc) || undefined, plugins });

  view = new PM.view.EditorView(host.value, {
    state,
    editable: () => editable.value,
    /* The image gets a node view for its resize handles; the embed keeps
       the preview card it already had. Both only with `media`, since
       neither node is in the schema without it. */
    nodeViews: props.media ? {
      embed: (node) => embedNodeView(node),
      image: (node, nodeView, getPos) => imageNodeView(
        node, nodeView, getPos as () => number | undefined, { state: engine.state },
      ),
      /* The same view: an inline picture has the same grips, the same
         drag and the same sizing - only its element differs. */
      image_inline: (node, nodeView, getPos) => imageNodeView(
        node, nodeView, getPos as () => number | undefined, { state: engine.state },
      ),
    } : {},
    attributes: {
      /* The writing area is the widget, so the label and the role belong to it
         rather than to a wrapper the caret never reaches. */
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': props.ariaLabel || 'Rich text editor',
      spellcheck: String(props.spellcheck),
    },
    dispatchTransaction(tr) {
      if (!view) return;
      /* Rewritten BEFORE it is applied, because a deletion in suggestion mode has
         to become a mark rather than a removal — and once applied, the text is
         gone and there is nothing left to mark. */
      let next = tr;
      if (props.suggestions && props.suggesting && schema) {
        const rewritten = asSuggestion(view.state, tr, schema, props.author || { id: 'you' });
        if (rewritten) next = rewritten as typeof tr;
      }
      view.updateState(view.state.apply(next));
      /* docChanged separates a text edit from a caret move: emitting the document
         on every arrow key would make the caller's model churn for nothing. */
      if (next.docChanged) emitDoc();
      reportSelection();
      reportSuggestions();
      /* Anchors move when the document changes AND when it reflows, so the
         selection path reports them too — a wrap caused by typing elsewhere
         shifts every anchor below it. */
      reportAnchors();
    },
    /**
     * Paste.
     *
     * Cleaning happens on the CLIPBOARD HTML, before ProseMirror parses it,
     * because the parser faithfully preserves anything the schema can represent
     * — including a Word document's worth of empty paragraphs and spans. Once
     * parsed, the damage is in the document and indistinguishable from content
     * the author wrote.
     */
    transformPastedHTML(html) {
      if (pasteOpts.value.plainTextOnly) return '';
      return cleanPastedHtml(html, pasteOpts.value);
    },
    transformPastedText(text, plain) {
      /* `plain` is true for a deliberate paste-without-formatting, which must
         stay literal even when the text happens to look like markdown. */
      if (plain || pasteOpts.value.plainTextOnly) return text;
      return text;
    },
    handlePaste(_view, event, slice) {
      if (!view || !schema) return false;
      const text = event.clipboardData?.getData('text/plain') || '';
      const html = event.clipboardData?.getData('text/html') || '';

      /* A pasted image file is the common screenshot case, and it must be
         checked before the text paths: the clipboard carries both a file and a
         filename, and reading the filename as text loses the picture. */
      if (props.media && schema.nodes.image) {
        const files = Array.from(event.clipboardData?.files || []).filter(isImageFile);
        if (files.length) {
          files.forEach((file, i) => uploadFile(file, view!.state.selection.from + i));
          emit('paste', { kind: 'file', length: files.length });
          return true;
        }
      }

      /* A video URL on its own line becomes an embed. Only when the selection is
         empty, since a URL over a selection means "link this" — and that check
         has to come first or a video URL would never link anything. */
      if (props.media && props.embedOnPaste !== false && schema.nodes.embed
        && view.state.selection.empty) {
        const found = matchEmbed(text.trim());
        if (found) {
          const node = schema.nodes.embed.create(found);
          view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
          emit('paste', { kind: 'embed', length: text.length });
          return true;
        }
      }

      /* A URL pasted over a selection links it rather than replacing it — which
         is what someone with text selected and a URL copied means. */
      if (pasteOpts.value.linkOnPaste !== false && !view.state.selection.empty) {
        const url = pastedUrl(text);
        if (url && schema.marks.link) {
          runCommand(setLink(schema.marks.link, { href: url }));
          emit('paste', { kind: 'link', length: url.length });
          return true;
        }
      }

      /* Markdown only from PLAIN text: HTML on the clipboard means the source
         had structure of its own, and reading its text as markdown would parse
         a code sample or a URL as formatting. */
      if (pasteOpts.value.parseMarkdown !== false && !html && looksLikeMarkdown(text)) {
        try {
          const parsed = PM!.model.Node.fromJSON(schema, parseMarkdown(text) as never);
          const tr = view.state.tr.replaceSelectionWith(parsed, false);
          view.dispatch(tr.scrollIntoView());
          emit('paste', { kind: 'markdown', length: text.length });
          return true;
        } catch {
          /* A document the schema rejects falls through to the normal path
             rather than failing the paste outright. */
        }
      }
      emit('paste', { kind: html ? 'html' : 'text', length: (html || text).length });
      void slice;

      return false;
    },
    /* A checkbox click is handled here rather than by a node view: the item is
       already rendered by the schema, and a whole node view for one attribute
       toggle would be more machinery than the job needs. */
    handleClickOn(v, pos, node, nodePos, event) {
      /* A click on the PICTURE selects the figure; a click on its
         caption still places the caret, which is why the target is
         asked about rather than the node - the caption is content of
         the same node, so `node` cannot tell them apart.
       *
         It has to happen here rather than on the element, because
         ProseMirror applies its own selection after any handler on the
         image itself and would put the caret back in the caption. The
         node view does not `preventDefault` on mousedown: that is what
         lets the browser start a drag, which is how a picture is
         MOVED. */
      if (node.type.name === 'image' && PM
        && (event.target as HTMLElement)?.tagName === 'IMG') {
        v.dispatch(v.state.tr.setSelection(
          PM.state.NodeSelection.create(v.state.doc, nodePos),
        ));

        return true;
      }

      if (node.type.name !== 'task_item') return false;
      const target = event.target as HTMLElement;
      if (!target.closest('li[data-checked]')) return false;
      /* Only the marker area, so clicking the text still places the caret. */
      const li = target.closest('li[data-checked]') as HTMLElement;
      const rect = li.getBoundingClientRect();
      if (event.clientX > rect.left + 22) return false;
      return runCommand(toggleTask(nodePos));
    },
    /* Files arrive by drop or by paste, and both land here rather than in two
       code paths: the difference is only where the insertion point comes from. */
    handleDrop(v, event) {
      if (!props.media || !schema?.nodes.image) return false;

      /**
       * A drag that started HERE is a move, not an upload.
       *
       * Dragging a picture whose `src` is a real URL makes Chromium
       * put the image on the dataTransfer as a FILE as well as as
       * HTML - so this handler saw a file, uploaded it, and inserted a
       * second copy at its natural size while the original stayed
       * where it was. Reported as "dragged the image to the new
       * location and a clone of it was generated with the original
       * size instead of moved".
       *
       * `view.dragging` is set by ProseMirror on `dragstart` and only
       * for a drag out of this editor, so it answers exactly the right
       * question. Letting it through means ProseMirror moves the node
       * it already has - with its width, its caption and its
       * alignment - rather than fetching the picture again.
       */
      if (v.dragging) return false;

      const files = Array.from((event as DragEvent).dataTransfer?.files || []).filter(isImageFile);
      if (!files.length) return false;
      event.preventDefault();
      /* The drop POSITION, not the caret: someone dragging an image onto a
         paragraph means it to land there, wherever the caret happens to be. */
      const at = v.posAtCoords({ left: (event as DragEvent).clientX, top: (event as DragEvent).clientY });
      const pos = at ? at.pos : v.state.selection.from;
      files.forEach((file, i) => uploadFile(file, pos + i));
      emit('paste', { kind: 'file', length: files.length });
      return true;
    },
    /* A click on commented text opens that thread. Read from the position's
       marks rather than the DOM's data attribute, because overlapping comments
       produce nested spans and the innermost one is not necessarily the one the
       reader aimed at — the marks at the position are all of them. */
    handleClick(v, pos, event) {
      /* A click on the empty space BELOW the document.
       *
       * `event.target === view.dom` means it landed on the editable box
       * itself rather than on anything in it - the margin under the last
       * block. ProseMirror answers that by putting the caret in the
       * nearest position, which, when the document ends with a captioned
       * image, is the caption: click below the picture to escape it and
       * land back inside it.
       *
       * A paragraph is made only when there is nowhere else to go, and
       * only on the click, so a document that merely CONTAINS an image is
       * never rewritten for being looked at. */
      const last = v.state.doc.lastChild;
      if (event.target === v.dom && schema?.nodes.paragraph && PM
        && (!last || !last.isTextblock)) {
        const end = v.state.doc.content.size;
        const tr = v.state.tr.insert(end, schema.nodes.paragraph.createAndFill()!);
        tr.setSelection(PM.state.TextSelection.create(tr.doc, end + 1));
        v.dispatch(tr.scrollIntoView());
        v.focus();

        return true;
      }

      if (!props.comments || !schema?.marks.comment) return false;
      const $pos = v.state.doc.resolve(pos);
      const mark = schema.marks.comment.isInSet($pos.marks());
      if (!mark) return false;
      emit('thread-click', { threadId: String(mark.attrs.threadId) });
      return false;
    },
    handleDOMEvents: {
      focus: () => { emit('focus'); return false; },
      blur: () => { emit('blur'); return false; },
    },
  });

  empty.value = state.doc.textContent.length === 0;
  ready.value = true;
  reportSelection();
  /* Mounting fires no transaction, so the first read is explicit — and a resize
     moves every anchor below the reflow with no transaction either. */
  reportAnchors();
  reportSuggestions();
  if (props.comments && typeof ResizeObserver !== 'undefined' && host.value) {
    anchorObserver = new ResizeObserver(() => reportAnchors());
    anchorObserver.observe(host.value);
  }
  emit('ready');
  if (props.autofocus && editable.value) view.focus();
}

/* An external change replaces the document while keeping the selection where it
   still fits, so a caller resetting content does not throw the caret to the top. */
watch(() => props.doc, (next) => {
  if (!view || !PM) return;
  if (sameDoc(next, lastEmitted)) return;
  const doc = parseDoc(next);
  if (!doc) return;
  const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, doc.content);
  tr.setMeta('addToHistory', false);
  view.updateState(view.state.apply(tr));
  empty.value = view.state.doc.textContent.length === 0;
}, { deep: true });

/* editable is a function on the view, so the view has to be told to re-ask. */
watch(editable, () => view?.updateState(view.state));
/* A new active thread only changes the PAINT, so the decorations have to be
   recomputed — the plugin reads the prop through a closure, which nothing else
   would invalidate. */
watch(() => [props.activeThread, props.resolvedThreads], () => {
  if (view) view.updateState(view.state);
}, { deep: true });

onMounted(mount);
onBeforeUnmount(() => {
  anchorObserver?.disconnect();
  anchorObserver = null;
  view?.destroy();
  view = null;
});

const rootStyle = computed(() => {
  const len = (v: string | number | undefined) => (v === undefined ? undefined
    : (typeof v === 'number' ? `${v}px` : v));
  return {
    '--apex-ed-min-h': len(props.minHeight),
    '--apex-ed-max-h': len(props.maxHeight),
  };
});

/**
 * Runs a command by name, or a command function directly.
 *
 * Returns whether it applied, which is also how a toolbar asks "is this
 * available here" — calling with no dispatch is ProseMirror's own applicability
 * check, so a disabled button is disabled because the document says so rather
 * than because a rule was guessed.
 */
/**
 * Applies a slash choice.
 *
 * The query text is deleted before the command runs, in one transaction — two
 * would leave a document where "/head" had been removed but the heading not yet
 * made, and an undo landing between them.
 */
function chooseSlash(payload: { item: SlashItem; state: SlashState }) {
  if (!view) return;
  slash.value = null;
  const cmd = commandRegistry[payload.item.command];
  const tr = view.state.tr.delete(payload.state.from, payload.state.to);
  if (!cmd) { view.dispatch(tr); return; }

  /* The command runs against the state AFTER the deletion, then its steps are
     appended to the same transaction. One transaction, so one undo returns the
     author to before the slash command — two dispatches would leave an
     intermediate document where the query text had gone but the block was not
     yet made, and an undo landing on it. No step mapping is needed: the steps
     were computed against exactly the document this transaction now holds. */
  const staged = view.state.apply(tr);
  let captured: import('prosemirror-state').Transaction | null = null;
  cmd(staged, (t) => { captured = t; }, view);
  if (captured) {
    (captured as import('prosemirror-state').Transaction).steps.forEach((step) => tr.step(step));
  }
  view.dispatch(tr.scrollIntoView());
  view.focus();
}

/**
 * A file chosen through the toolbar's image button.
 *
 * Inserted at the CURRENT selection, which is where the caret was when
 * the button was pressed — the picker does not move it. The value is
 * cleared afterwards so choosing the same file twice still fires
 * `change`; without that, a second attempt at the same picture is
 * silently ignored.
 */
function onImagePicked(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = Array.from(input.files || []).find(isImageFile);

  input.value = '';

  if (file && view) uploadFile(file, view.state.selection.from);
}

/**
 * Commands that need a VALUE rather than only a press.
 *
 * A width, a height, a description, a wrapping mode: each is a factory,
 * built with the value and then run. The floating bars have always
 * called `run(name, value)` for these - the prose editor had no
 * factories at all, so its width select and its description box were
 * wired to nothing. N/034.
 */
let valueCommands: Record<string, (value: string | null) => import('prosemirror-state').Command> = {};

function runCommand(
  nameOrFn: string | import('prosemirror-state').Command,
  dispatchOrValue: boolean | string | null = true,
): boolean {
  if (!view) return false;

  /* `run(name, value)` and `run(name, false)` are both in use: the bars
     pass a value, `availability` passes false to ask without doing. */
  const asking = dispatchOrValue === false;
  const value = typeof dispatchOrValue === 'string' || dispatchOrValue === null
    ? dispatchOrValue
    : undefined;

  const factory = typeof nameOrFn === 'string' ? valueCommands[nameOrFn] : undefined;
  const cmd = factory && value !== undefined
    ? factory(value)
    : (typeof nameOrFn === 'string' ? commandRegistry[nameOrFn] : nameOrFn);
  if (!cmd) return false;

  const dispatch = !asking;
  const applied = cmd(view.state, dispatch ? view.dispatch.bind(view) : undefined, view);
  if (applied && dispatch) view.focus();

  return applied;
}

/** Which registered commands apply at the current selection. */
const availability = computed(() => {
  const out: Record<string, boolean> = {};
  if (!view) return out;
  Object.keys(commandRegistry).forEach((name) => {
    out[name] = commandRegistry[name](view!.state, undefined, view!);
  });
  return out;
});

/* Every accessor carries a get/is prefix, without exception.
   On an Options-API host — which the gallery mirror is — props and data sit on
   the instance and WIN over a method of the same name, so an accessor called
   `view` or `sourceOpen` is reachable here and unreachable there. Six of these
   had already diverged before the rule was written down. */
defineExpose({
  /** The live view, for a caller that needs to reach past these props. */
  getView: () => view,
  getSchema: () => schema,
  focus: () => view?.focus(),
  blur: () => (view?.dom as HTMLElement | undefined)?.blur(),
  getJSON: () => (view ? view.state.doc.toJSON() : null),
  getText: () => (view ? view.state.doc.textContent : ''),
  isEmpty: () => empty.value,
  getActive: () => active.value,
  getLinkContext: () => linkContext.value,
  getAnchors: () => anchors.value,
  /* The id comes from the CALLER: the thread has to exist in the application's
     store before the document points at it, or a saved document would reference
     a thread that was never created. */
  addComment: (threadId: string) => (schema?.marks.comment
    ? runCommand(addComment(schema.marks.comment, threadId))
    : false),
  removeComment: (threadId: string) => (schema?.marks.comment
    ? runCommand(removeComment(schema.marks.comment, threadId))
    : false),
  threadsAtSelection: () => (schema?.marks.comment && view
    ? threadsAtSelection(view.state, schema.marks.comment)
    : []),
  /* Not named "suggestions": that is a prop name, and on an Options-API instance
     a prop shadows a method of the same name — so an accessor called suggestions
     would work in the SFC and not in the mirror, and the two implementations
     would disagree about the API. */
  getSuggestions: () => suggestions.value,
  /* Export defaults to ACCEPTING suggestions and dropping comments, because a
     published document should carry neither <ins>/<del> nor anchor spans: those
     are editorial state rather than content. 'keep' is for a diff or an audit. */
  toHtml: (options?: ExportOptions) => (view && schema ? toHtml(view.state.doc, schema, options) : ''),
  toMarkdown: (options?: ExportOptions) => (view && schema ? toMarkdown(view.state.doc, schema, options) : ''),
  toText: (options?: ExportOptions) => (view && schema ? toText(view.state.doc, schema, options) : ''),
  wordCount: (options?: ExportOptions) => (view && schema ? wordCount(view.state.doc, schema, options) : 0),
  setHtml,
  toggleSource,
  isSourceOpen: () => sourceOpen.value,
  runAssist,
  isAssistBusy: () => assistBusy.value,
  /* Accept and reject share one implementation, because they differ only in
     which side keeps the text — and a track-changes feature whose two verbs are
     not exact inverses corrupts documents quietly. */
  resolveSuggestion: (range: SuggestionRange, verb: 'accept' | 'reject') => (schema
    ? runCommand(resolveSuggestion(schema, range, verb))
    : false),
  resolveAll: (verb: 'accept' | 'reject', authorId?: string) => (schema
    ? runCommand(resolveAll(schema, verb, authorId))
    : false),
  /* The command surface, so a toolbar built by a caller runs exactly the code the
     keyboard runs rather than reimplementing any of it. */
  run: runCommand,
  can: (name: string) => runCommand(name, false),
  commands: () => Object.keys(commandRegistry),
  setLink: (attrs: { href: string; title?: string | null; target?: string | null }) => {
    if (!schema?.marks.link) return false;
    return runCommand(setLink(schema.marks.link, attrs));
  },
  unsetLink: () => (schema?.marks.link ? runCommand(unsetLink(schema.marks.link)) : false),
  insertTable,
  undo: () => (PM ? runCommand(PM.history.undo) : false),
  redo: () => (PM ? runCommand(PM.history.redo) : false),
});
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="doc" :label-for="false"
             v-slot="{ id, describedBy, invalid, labelId }">
  <div class="apex-ed" :class="ui?.root" :id="id" role="group" :aria-labelledby="labelId"
       :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
       :aria-required="required || undefined"
       :style="rootStyle" :data-size="size"
       :data-bordered="bordered ? 'true' : 'false'"
       :data-readonly="readonly ? 'true' : 'false'"
       :data-disabled="disabled ? 'true' : 'false'"
       :data-empty="empty ? 'true' : 'false'"
       :data-ready="ready ? 'true' : 'false'">
    <input v-if="media" ref="filePicker" type="file" accept="image/*" hidden @change="onImagePicked">
    <slot name="toolbar" :active="active" :run="runCommand" :can="availability"
          :link="linkContext" :set-link="applyLink" :unset-link="removeLink"
          :insert-table="insertTable" :view="getView()" />
    <div class="apex-ed__frame" :class="ui?.frame">
      <!-- the placeholder is a sibling, not text in the document: putting it in
           the document would make an "empty" editor non-empty and export it -->
      <!-- the engine is an ES module tree, so first load is a real wait: an
           editor showing only its placeholder reads as broken rather than busy -->
      <slot v-if="!ready && !failed" name="loading">
        <p class="apex-ed__loading" :class="ui?.loading" aria-live="polite">Loading the editor…</p>
      </slot>
      <slot v-else-if="empty && !failed" name="empty" :placeholder="placeholder">
        <p class="apex-ed__placeholder" :class="ui?.placeholder" aria-hidden="true">{{ placeholder }}</p>
      </slot>
      <textarea v-if="sourceOpen" class="apex-ed__source" :class="ui?.source" :value="sourceText"
                spellcheck="false" aria-label="HTML source"
                @input="sourceText = ($event.target as HTMLTextAreaElement).value"></textarea>
      <p v-if="sourceError" class="apex-ed__source-error" :class="ui?.sourceError" role="alert">{{ sourceError }}</p>
      <!-- v-show, never v-if: v-if would destroy the element ProseMirror's view is
           mounted on, and the view cannot be re-attached to a new node -->
      <div v-show="!sourceOpen" ref="host" class="apex-ed__host" :class="ui?.host"></div>
      <!-- the gutter sits beside the writing area and receives measured anchor
           positions, so a caller aligns its own thread cards without measuring
           anything itself -->
      <slot name="gutter" :anchors="anchors" :active-thread="activeThread" />
      <slot name="overlay" :active="active" :run="runCommand" :can="availability"
            :link="linkContext" :set-link="applyLink" :unset-link="removeLink" :view="getView()"
            :object="objectState" :measure="objectRect" :bounds="editorBounds"
            :cell="cellState" :image="imageState" :set-cell-style="setCellStyle" />
      <!-- The slash list is a child component, so a host's `slash-item` is
           FORWARDED into its own `item` slot rather than duplicated here. -->
      <!-- the map goes DOWN: a child surface that quietly drops it looks
           correct until someone opens the menu, which is the ApexOrgNode
           defect in a different component -->
      <ApexEditorSlash v-if="slashMenu" ref="slashList" :state="slash" :items="slashItems"
                       :ui="ui"
                       :coords="slashCoords" @choose="chooseSlash" @close="slash = null">
        <template v-if="$slots['slash-item']" #item="ctx">
          <slot name="slash-item" v-bind="ctx" />
        </template>
      </ApexEditorSlash>
    </div>
    <slot v-if="failed" name="error" :message="failed">
      <p class="apex-ed__error" :class="ui?.error" role="alert">{{ failed }}</p>
    </slot>
    <!-- `run` and `can` are bound here as well as on the toolbar: a footer that
         reports state but cannot act on it makes a host reach for the toolbar
         slot it did not want. The mirror already bound them; the package did
         not, and a host writing `#footer="{ run }"` worked in the gallery and
         got `undefined` from the installed package. -->
    <slot name="footer" :active="active" :run="runCommand" :can="availability" />
  </div>
  </ApexField>
</template>
