/**
 * Media.
 *
 * The editor does not upload anything. It emits an intent — "this file wants to
 * become an image" — and the application answers with a URL. Anything else would
 * mean the component knowing about endpoints, auth headers, retry policy and
 * progress reporting, all of which belong to the app that owns the storage.
 *
 * What the editor does own is the part an app should not have to solve: holding a
 * placeholder while the upload runs, keeping it attached to the right position as
 * the document is edited around it, and replacing or removing it when the promise
 * settles.
 */
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

/**
 * An image is a FIGURE, not a bare img.
 *
 * A caption is part of what an image means in a document, and expressing it as
 * a following paragraph would let the two drift apart on any edit — a reorder
 * would leave the caption under someone else's picture. So the caption is
 * content of the node.
 */
export const mediaNodes: Record<string, NodeSpec> = {
  image: {
    group: 'block',
    /**
     * An ATOM: the caption is an attribute, not content.
     *
     * It was `content: 'inline*'`, which made the figure itself a
     * textblock - and a textblock is somewhere a caret goes. Clicking
     * the picture put the caret in its caption instead of selecting
     * the node, so the alignment buttons acted on whatever contained
     * it and the picture never moved. In a table cell that meant the
     * CELL, which has an alignment of its own, and nothing appeared to
     * happen at all.
     *
     * As an attribute the caption is written in the image's own menu,
     * where it is one field among the others rather than a piece of
     * the document the caret can fall into. Old documents keep their
     * captions: the figcaption is read on parse.
     */
    atom: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
      /** The caption text. Empty means an uncaptioned image. */
      caption: { default: null },
      /**
       * A CSS length: '420px' from a drag or a typed number, or a
       * percentage from a document written before N/034.
       *
       * Pixels, chosen deliberately over the ratio this used to store:
       * an author asked to type a width expects the number they see in
       * every other editor. `max-inline-size: 100%` is what keeps a
       * 900px picture from overflowing a phone - the width becomes a
       * MAXIMUM there rather than a promise.
       */
      width: { default: null },
      /** A CSS length, or null for "whatever the aspect ratio gives". */
      height: { default: null },
      align: { default: null },
      /**
       * How text behaves around the picture - Word's question, and the
       * four answers HTML can honour truthfully:
       *
       *   inline  in line with the text, as a big letter would be
       *   left    square wrap, picture on the left, text down the right
       *   right   square wrap, the other way round
       *   block   top and bottom: the picture takes the full line
       *
       * Tight and Through are square here too: they differ only for an
       * image with transparency, and `shape-outside` on a photograph
       * gives exactly the square it already has. Behind Text and In
       * Front of Text are absent rather than faked - both need absolute
       * positioning, which in a column that reflows on a phone puts
       * text on top of the picture.
       */
      wrap: { default: null },
    },
    draggable: true,
    /* `isolating` went with the content it was protecting. It stopped a
       split escaping the caption; an atom has nothing to split. */
    parseDOM: [
      {
        tag: 'figure',
        /* The figure is claimed only when it actually holds an image, so a
           figure wrapping a table or a code sample is left to other rules. */
        getAttrs: (dom) => {
          const figure = dom as HTMLElement;
          const img = figure.querySelector('img');
          if (!img) return false;

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            /* Read as TEXT: the caption is an attribute now, so any
               markup a previous version allowed inside it is flattened
               rather than silently dropped. */
            caption: figure.querySelector('figcaption')?.textContent?.trim() || null,
            width: figure.getAttribute('data-width') || img.getAttribute('width'),
            height: figure.getAttribute('data-height') || img.getAttribute('height'),
            align: figure.getAttribute('data-align'),
            wrap: figure.getAttribute('data-wrap'),
          };
        },
      },
      /* A bare <img> belongs to `image_inline` now, not here: an
         image inside a paragraph is part of the text, and parsing it
         as a block figure is what made it impossible to place one
         mid-sentence. A FIGURE is still this node - that is what a
         block image is. */
    ],
    toDOM: (node) => {
      const { src, alt, title, width, height, align, wrap, caption } = node.attrs;
      const attrs = {
        'data-width': width || null,
        'data-height': height || null,
        'data-align': align || null,
        'data-wrap': wrap || null,
      };
      const picture = ['img', { src, alt, title }];

      /* No figcaption at all when there is no caption: an empty one
         renders as a gap under every picture, and an uncaptioned image
         is a different thing from one with an empty caption. */
      return (caption
        ? ['figure', attrs, picture, ['figcaption', caption]]
        : ['figure', attrs, picture]) as import('prosemirror-model').DOMOutputSpec;
    },
  },

  /**
   * The same picture, inside a line of text.
   *
   * A block figure can sit between paragraphs and nowhere else, so a
   * float placed before one wraps the WHOLE paragraph: there was no way
   * to start the wrap partway down, and no way to put a picture in the
   * middle of a sentence at all. Reported as "cannot place image in
   * middle of a paragraph".
   *
   * Two node types rather than one flag, because the difference is
   * structural: this one is `inline`, lives in a paragraph's content
   * and serialises to a bare `<img>`; the block one is a `<figure>`
   * and can carry a caption. Choosing a wrapping mode converts between
   * them, which is the only place the two meet.
   *
   * No caption here: a `<figcaption>` is a block, and a block cannot
   * live inside a paragraph. An inline picture that needs a caption is
   * a block picture.
   */
  image_inline: {
    inline: true,
    group: 'inline',
    atom: true,
    draggable: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      height: { default: null },
      /* `inline` (in the line, no float) or `left`/`right` (floated, the
         text running past it). `block` belongs to the other node. */
      wrap: { default: 'inline' },
    },
    parseDOM: [{
      tag: 'img[src]',
      getAttrs: (dom) => {
        const img = dom as HTMLElement;

        return {
          src: img.getAttribute('src'),
          alt: img.getAttribute('alt'),
          title: img.getAttribute('title'),
          width: img.getAttribute('data-width') || img.getAttribute('width'),
          height: img.getAttribute('data-height') || img.getAttribute('height'),
          wrap: img.getAttribute('data-wrap') || 'inline',
        };
      },
    }],
    toDOM: (node) => {
      const { src, alt, title, width, height, wrap } = node.attrs;

      return ['img', {
        src,
        alt,
        title,
        'data-width': width || null,
        'data-height': height || null,
        'data-wrap': wrap && wrap !== 'inline' ? wrap : null,
      }];
    },
  },

  /**
   * An embed stores the ORIGIN and the id, not an iframe.
   *
   * Storing markup would put a third party's HTML in the document, where it
   * could not be validated, re-themed, or rendered anywhere but a browser. The
   * iframe is built at render time from two known values.
   */
  embed: {
    group: 'block',
    atom: true,
    attrs: {
      provider: {},
      videoId: {},
      title: { default: null },
      width: { default: null },
      align: { default: null },
    },
    draggable: true,
    parseDOM: [{
      tag: 'div[data-embed]',
      getAttrs: (dom) => ({
        provider: (dom as HTMLElement).getAttribute('data-embed'),
        videoId: (dom as HTMLElement).getAttribute('data-video-id'),
        title: (dom as HTMLElement).getAttribute('data-title'),
        width: (dom as HTMLElement).getAttribute('data-width'),
        align: (dom as HTMLElement).getAttribute('data-align'),
      }),
    }],
    toDOM: (node) => ['div', {
      'data-embed': node.attrs.provider,
      'data-video-id': node.attrs.videoId,
      'data-title': node.attrs.title,
      'data-width': node.attrs.width || null,
      'data-align': node.attrs.align || null,
    }],
  },
};

/* ─── providers ──────────────────────────────────────────── */

export interface EmbedProvider {
  name: string;
  /** Pulls the id out of a watch URL, a share URL or an embed URL. */
  match: (url: string) => string | null;
  /** Builds the iframe src from the id. */
  src: (id: string) => string;
  aspect?: number;
}

/**
 * The providers we recognise.
 *
 * A closed list rather than "any iframe": an editor that accepted arbitrary
 * embed HTML would be a way to put third-party script into every document that
 * used it, and no amount of sanitising the surrounding markup changes that.
 */
export const EMBED_PROVIDERS: EmbedProvider[] = [
  {
    name: 'youtube',
    match: (url) => {
      const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url);
      return m ? m[1] : null;
    },
    src: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
    aspect: 16 / 9,
  },
  {
    name: 'vimeo',
    match: (url) => {
      const m = /vimeo\.com\/(?:video\/)?(\d{6,})/.exec(url);
      return m ? m[1] : null;
    },
    src: (id) => `https://player.vimeo.com/video/${id}`,
    aspect: 16 / 9,
  },
  {
    name: 'loom',
    match: (url) => {
      const m = /loom\.com\/(?:share|embed)\/([\w]{20,})/.exec(url);
      return m ? m[1] : null;
    },
    src: (id) => `https://www.loom.com/embed/${id}`,
    aspect: 16 / 9,
  },
];

export function matchEmbed(url: string): { provider: string; videoId: string } | null {
  for (const p of EMBED_PROVIDERS) {
    const id = p.match(url);
    if (id) return { provider: p.name, videoId: id };
  }
  return null;
}

export function embedSrc(provider: string, videoId: string): string | null {
  const p = EMBED_PROVIDERS.find((q) => q.name === provider);
  /* An unknown provider renders nothing rather than guessing a URL: a document
     from a system with a provider we do not know must not produce a broken
     iframe pointed somewhere arbitrary. */
  return p ? p.src(videoId) : null;
}

/* ─── node views ─────────────────────────────────────────── */

/**
 * The embed's editing view.
 *
 * A preview card, not a live iframe. An iframe inside contenteditable swallows
 * every pointer event, so the node cannot be selected, dragged or deleted — and
 * in an editor the reader is arranging a document rather than watching a video.
 * The real iframe is what a *renderer* builds from the same two attributes.
 *
 * Kept apart from `toDOM`, which stays the storage shape: the document should
 * serialise to provider and id, not to a third party's markup.
 */
export function embedNodeView(node: { attrs: Record<string, unknown> }) {
  const dom = document.createElement('div');
  dom.className = 'apex-ed__embed';
  dom.setAttribute('data-provider', String(node.attrs.provider));
  if (node.attrs.align) dom.setAttribute('data-align', String(node.attrs.align));
  if (node.attrs.width) dom.style.setProperty('--embed-w', String(node.attrs.width));
  /* contenteditable=false so the caret treats it as one object rather than
     trying to place itself inside the preview. */
  dom.contentEditable = 'false';

  const label = document.createElement('span');
  label.className = 'apex-ed__embed-label';
  label.textContent = String(node.attrs.provider);

  const title = document.createElement('span');
  title.className = 'apex-ed__embed-title';
  title.textContent = (node.attrs.title as string) || String(node.attrs.videoId);

  const url = embedSrc(String(node.attrs.provider), String(node.attrs.videoId));
  const link = document.createElement('a');
  link.className = 'apex-ed__embed-open';
  link.textContent = url ? 'Open' : 'Unknown provider';
  if (url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  dom.append(label, title, link);
  return { dom };
}
/**
 * The narrowest an image may be dragged, in pixels.
 *
 * Not zero: a picture dragged to nothing cannot be grabbed again, and
 * the author is left with a node they can only remove by selecting it
 * blind. 24px is still a thumbnail and still has grips to hold.
 */
export const MIN_IMAGE_WIDTH = 24;

/**
 * The width a drag would produce, in whole pixels.
 *
 * Clamped to the column: an image wider than the text it sits in is not
 * something a drag should be able to ask for, and `max-inline-size` would
 * overrule it anyway - leaving a stored number that does not match what
 * is on screen. Never below `MIN_IMAGE_WIDTH` either, since a picture
 * dragged to nothing cannot be grabbed again.
 */
export function dragWidth(startPx: number, dx: number, columnPx: number): number {
  const wanted = Math.round(startPx + dx);
  /* An unmeasurable MOVEMENT leaves the picture as it was. Falling
     through to the minimum instead would collapse an image to a
     thumbnail because a pointer event arrived without coordinates. */
  const safe = Number.isFinite(wanted) ? wanted : Math.round(startPx) || MIN_IMAGE_WIDTH;

  /* An unmeasurable COLUMN cannot clamp: a detached or display:none
     editor measures zero, and clamping to it would collapse the
     picture just as surely. */
  if (!(columnPx > 0)) return Math.max(MIN_IMAGE_WIDTH, safe);

  return Math.min(Math.round(columnPx), Math.max(MIN_IMAGE_WIDTH, safe));
}

/**
 * The image node view: a figure you can resize by dragging a corner.
 *
 * Two things it must not do, both learned elsewhere in the kit. It must
 * not dispatch a transaction per pointer move - that is one undo step per
 * pixel, and an author who resizes an image and then presses Ctrl+Z two
 * hundred times is entitled to be angry. So the drag writes a CSS custom
 * property straight onto the figure and ONE transaction lands on release.
 *
 * And the handles are not part of the document. They are chrome, appended
 * beside the content and marked `contenteditable=false`, with
 * `ignoreMutation` keeping ProseMirror from rebuilding the node every time
 * a class changes on one. The serialised shape stays exactly what `toDOM`
 * says it is.
 *
 * Four corners and no edges, deliberately. An edge handle on a node whose
 * height follows its width would promise a free-form resize the model
 * cannot store: the schema keeps a ratio of the column and nothing else,
 * so every handle does the same thing and the aspect ratio can never be
 * wrong.
 */
export function imageNodeView(
  node: import('prosemirror-model').Node,
  view: import('prosemirror-view').EditorView,
  getPos: () => number | undefined,
  deps?: { state: typeof import('prosemirror-state') },
) {
  /* A <span> for the inline picture and a <figure> for the block one:
     a figure inside a paragraph is invalid HTML, and the browser would
     close the paragraph around it. Everything else - the grips, the
     drag, the sizing - is the same for both, which is why one node
     view serves them. */
  const isInline = node.type.name === 'image_inline';
  const dom = document.createElement(isInline ? 'span' : 'figure');
  if (isInline) dom.className = 'apex-ed__img-inline';
  const img = document.createElement('img');

  /* Drawn, never edited. The caption is an attribute, so this element
     is chrome like the handles are - `contenteditable=false` keeps the
     caret out of it, which is the whole point of the change. */
  const caption = document.createElement('figcaption');
  caption.contentEditable = 'false';

  /* The node spec says `draggable`, but a node view supplies its own DOM
     and has to say so on it too - otherwise the browser never fires
     `dragstart` and ProseMirror never hears about the drag. */
  dom.draggable = true;

  const paint = (n: import('prosemirror-model').Node) => {
    img.setAttribute('src', String(n.attrs.src ?? ''));
    if (n.attrs.alt) img.setAttribute('alt', String(n.attrs.alt));
    else img.removeAttribute('alt');
    if (n.attrs.title) img.setAttribute('title', String(n.attrs.title));
    else img.removeAttribute('title');

    /* Both, and they mean different things. `data-width` is the STORED
       value, which the stylesheet and the exporter read; the custom
       property is what actually sizes the element, and is the only way an
       arbitrary percentage can render - a stylesheet cannot carry a rule
       for every value between 10 and 100. */
    if (n.attrs.width) {
      dom.setAttribute('data-width', String(n.attrs.width));
      dom.style.setProperty('--apex-ed-fig-w', String(n.attrs.width));
    } else {
      dom.removeAttribute('data-width');
      dom.style.removeProperty('--apex-ed-fig-w');
    }

    if (n.attrs.height) {
      dom.setAttribute('data-height', String(n.attrs.height));
      dom.style.setProperty('--apex-ed-fig-h', String(n.attrs.height));
    } else {
      dom.removeAttribute('data-height');
      dom.style.removeProperty('--apex-ed-fig-h');
    }

    if (n.attrs.align) dom.setAttribute('data-align', String(n.attrs.align));
    else dom.removeAttribute('data-align');

    if (n.attrs.wrap) dom.setAttribute('data-wrap', String(n.attrs.wrap));
    else dom.removeAttribute('data-wrap');

    /* An inline picture has no caption: a figcaption is a block and
       cannot live in a paragraph. */
    caption.textContent = isInline ? '' : String(n.attrs.caption ?? '');
    caption.hidden = isInline || !n.attrs.caption;
  };

  let current = node;
  paint(current);

  const handles = document.createElement('div');
  handles.className = 'apex-ed__img-handles';
  handles.contentEditable = 'false';
  /* The whole apparatus is decoration: a screen reader announcing four
     unlabelled grips around every picture would be worse than useless, and
     the width commands remain the keyboard path. */
  handles.setAttribute('aria-hidden', 'true');

  const CORNERS = ['nw', 'ne', 'sw', 'se'];
  let drag: {
    startX: number; startPx: number; columnPx: number; dir: number;
    /* Where the image STARTED, and where it is now. A drag that ends on
       the width it began with writes nothing: the browser sends a
       mousemove for a pointer that has not moved, and without this a
       click on a grip would dirty the document and put an undo step on
       the stack for a resize that never happened. */
    startPct: number; pct: number;
  } | null = null;

  function columnWidth(): number {
    /* The figure's own parent, not the whole editor: an image inside a
       quote or a table cell is sized by the box it is in. */
    const box = (dom.parentElement || view.dom) as HTMLElement;
    return box.getBoundingClientRect().width || box.clientWidth || 0;
  }

  function onMove(event: MouseEvent) {
    if (!drag) return;
    const px = dragWidth(drag.startPx, (event.clientX - drag.startX) * drag.dir, drag.columnPx);
    drag.pct = px;
    dom.style.setProperty('--apex-ed-fig-w', px + 'px');
    dom.setAttribute('data-resizing', String(px));
  }

  function stop() {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    dom.removeAttribute('data-resizing');
    drag = null;
  }

  function onUp() {
    if (!drag) return;
    const { pct, startPct } = drag;
    const pos = getPos();
    stop();

    /* ONE transaction, on release. The position may be gone if the
       document changed under the drag - an undo, a collaborator - in which
       case the size is dropped rather than written somewhere else. */
    if (pos === undefined || pct === startPct) return;

    const width = pct + 'px';
    if (width === String(current.attrs.width || '')) return;

    /* A dragged width replaces any stored HEIGHT: the two together are a
       fixed box, and dragging one corner asks for the picture's own
       proportions rather than a stretch. */
    view.dispatch(view.state.tr.setNodeMarkup(pos, undefined,
      { ...current.attrs, width, height: null }));
  }

  function onDown(event: MouseEvent, corner: string) {
    if (!view.editable) return;
    /* Both, or the browser starts a native drag of the image and
       ProseMirror moves the selection out from under the pointer. */
    event.preventDefault();
    event.stopPropagation();

    const startPx = img.getBoundingClientRect().width;
    const columnPx = columnWidth();
    const startPct = dragWidth(startPx, 0, columnPx);

    drag = {
      startX: event.clientX,
      startPx,
      columnPx,
      /* A west handle grows the image as the pointer moves LEFT. */
      dir: corner.charAt(1) === 'w' ? -1 : 1,
      startPct,
      pct: startPct,
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  /**
   * Clicking the picture SELECTS it.
   *
   * Which sounds like something ProseMirror would already do, and for a
   * leaf node it is. This node is not a leaf: its content is the caption,
   * so a click lands inside a node that has editable content elsewhere
   * and the default handling leaves the selection as text. The grips are
   * shown by `selectNode`, so without this they are in the DOM, correct,
   * and never visible - which is exactly what was reported.
   *
   * `preventDefault` as well, or the browser starts its own drag of the
   * image the moment the pointer moves.
   */
  function selectSelf(event: MouseEvent) {
    const pos = getPos();
    if (!deps || pos === undefined) return;

    /* NO `preventDefault` here, though the first version had one.
     *
     * It stopped the browser starting a native drag, and a native drag
     * is exactly how a picture is moved: ProseMirror listens for
     * `dragstart` and carries the selected node to the drop position.
     * Preventing the default made the image immovable - reported as
     * "need to have click and drag so image can be moved".
     *
     * What the preventDefault was for - the caret landing in the caption
     * instead of the node being selected - is handled by setting the
     * selection here, which runs before ProseMirror's own mousedown
     * handling and tells it there is a node under the pointer. */
    if (event.button !== 0) return;

    view.dispatch(view.state.tr.setSelection(
      deps.state.NodeSelection.create(view.state.doc, pos),
    ));
    view.focus();
  }

  /* The press selects too, so a drag beginning immediately carries the
     node rather than a text range. A press that goes NOWHERE - an
     ordinary click - is settled by `handleClickOn` in the editor: it
     runs after ProseMirror's own selection handling, which is the only
     place that can win against it. */
  img.addEventListener('mousedown', (event) => selectSelf(event as MouseEvent));

  for (const corner of CORNERS) {
    const handle = document.createElement('span');
    handle.className = 'apex-ed__img-handle';
    handle.setAttribute('data-corner', corner);
    handle.addEventListener('mousedown', (e) => onDown(e as MouseEvent, corner));
    handle.addEventListener('pointerdown', (e) => onDown(e as MouseEvent, corner));
    handles.append(handle);
  }

  if (isInline) dom.append(img, handles);
  else dom.append(img, caption, handles);

  return {
    dom,
    update(next: import('prosemirror-model').Node) {
      if (next.type !== current.type) return false;
      current = next;
      paint(next);
      return true;
    },
    /* Selected is what SHOWS the handles: four grips around every picture
       in a long article is noise, and the selection is how the author says
       which image they are working on. */
    selectNode() { dom.setAttribute('data-selected', 'true'); },
    deselectNode() { dom.removeAttribute('data-selected'); },
    /* EVERYTHING in here is ours now - the picture, the caption and the
       grips alike - so no mutation of it is a document change, and a
       re-render on every class change would rebuild the node mid-drag. */
    ignoreMutation() { return true; },
    destroy() { stop(); },
  };
}

/* ─── uploads ────────────────────────────────────────────── */

/**
 * The upload placeholder plugin.
 *
 * A decoration rather than a real node, for two reasons. A node would be part of
 * the document, so a save mid-upload would persist a placeholder and an undo
 * could resurrect one whose upload had already finished. And a decoration set is
 * mapped through every transaction for free — so the placeholder stays where the
 * file was dropped even as text is typed above it, which is exactly the case a
 * stored position gets wrong.
 */
export type UploadPlaceholderPlugin = import('prosemirror-state').Plugin & {
  /**
   * The key this plugin stores its decorations under.
   *
   * Attached to the plugin because a caller CANNOT get it any other way,
   * and the obvious guess is wrong in a way nothing reports: a
   * ProseMirror `Plugin.key` is the key's NAME, a string. `setMeta`
   * accepts that string and indexes by it, so adding a placeholder
   * appears to work — and `getState` is not a method on a string, so
   * removing one throws, the placeholder never goes, and the picture is
   * never inserted. That was the bug: an upload that succeeded on the
   * server and left a grey box in the document for ever.
   */
  uploadKey: import('prosemirror-state').PluginKey;
};

export function uploadPlaceholderPlugin(deps: {
  state: typeof import('prosemirror-state');
  view: typeof import('prosemirror-view');
}): UploadPlaceholderPlugin {
  const { Plugin, PluginKey } = deps.state;
  const { Decoration, DecorationSet } = deps.view;
  const key = new PluginKey('apexUpload');

  const plugin = new Plugin({
    key,
    state: {
      init: () => DecorationSet.empty,
      apply(tr, set) {
        /* Mapped first, so a placeholder added earlier in this same transaction
           is still positioned against the document the transaction produced. */
        let next = set.map(tr.mapping, tr.doc);
        const action = tr.getMeta(key) as
          | { add?: { id: object; pos: number }; remove?: { id: object } }
          | undefined;
        if (action?.add) {
          const widget = document.createElement('div');
          widget.className = 'apex-ed__uploading';
          widget.setAttribute('aria-label', 'Uploading an image');
          next = next.add(tr.doc, [
            Decoration.widget(action.add.pos, widget, { id: action.add.id }),
          ]);
        }
        if (action?.remove) {
          next = next.remove(next.find(undefined, undefined,
            (spec) => spec.id === action.remove!.id));
        }
        return next;
      },
    },
    props: {
      decorations: (state) => key.getState(state),
    },
  });

  return Object.assign(plugin, { uploadKey: key });
}

/** Finds a placeholder's current position, or null if it is gone. */
export function placeholderPos(
  key: import('prosemirror-state').PluginKey,
  state: import('prosemirror-state').EditorState,
  id: object,
): number | null {
  const set = key.getState(state) as import('prosemirror-view').DecorationSet | undefined;
  const found = set?.find(undefined, undefined, (spec) => spec.id === id);
  /* The document may have been edited so the placeholder no longer exists — a
     paragraph deleted with it inside. Returning null lets the caller drop the
     result rather than inserting the image somewhere arbitrary. */
  return found && found.length ? found[0].from : null;
}


export interface UploadRequest {
  file: File;
  /** Resolve with a URL to keep the image, reject to remove the placeholder. */
  resolve: (result: { src: string; alt?: string; width?: string }) => void;
  reject: (reason?: unknown) => void;
}

export type UploadHandler = (request: UploadRequest) => void;

/** Whether a dropped or pasted file is something we can turn into an image. */
export function isImageFile(file: File): boolean {
  /* The MIME type, not the extension: a file named .jpg that is not an image
     would produce a broken picture, and one named .bin that is an image is
     still an image. */
  return /^image\//.test(file.type);
}

export interface MediaCommandDeps {
  state: typeof import('prosemirror-state');
}

export function buildMediaCommands(
  schema: import('prosemirror-model').Schema,
  deps: MediaCommandDeps,
): Record<string, Command> {
  const out: Record<string, Command> = {};

  if (schema.nodes.image) {
    out.image_align_left = setMediaAttr('align', 'left');
    out.image_align_center = setMediaAttr('align', 'center');
    out.image_align_right = setMediaAttr('align', 'right');
    out.image_width_full = setMediaAttr('width', null);
    out.image_width_half = setMediaAttr('width', '50%');
    out.image_width_third = setMediaAttr('width', '33%');

    /**
     * Take the picture out of the document.
     *
     * The bar has offered this since it was written and it has never
     * worked: `image_delete` was in the markup and in no registry, so
     * the button drew, enabled, and did nothing - the same shape of
     * defect as `insert_image` at N/020.
     */
    out.image_delete = (state, dispatch) => {
      const selected = (state.selection as { node?: import('prosemirror-model').Node }).node;
      if (selected?.type !== schema.nodes.image
        && selected?.type !== schema.nodes.image_inline) return false;
      if (dispatch) dispatch(state.tr.deleteSelection().scrollIntoView());

      return true;
    };
  }
  void deps;

  return out;
}

/**
 * Moving a picture between the two node types.
 *
 * A wrapping mode is really a question about STRUCTURE: "top and
 * bottom" is a block figure between paragraphs, and everything else is
 * a picture inside the text. So choosing one converts the node when it
 * has to, and only sets an attribute when it does not.
 *
 * `replaceRangeWith` rather than `replaceWith`: going from inline back
 * to block means a block node landing where inline content was, and
 * only the range form will split the paragraph to make room.
 */
function convertImage(
  schema: import('prosemirror-model').Schema,
  wrap: string | null,
): Command {
  return (state, dispatch) => {
    const selection = state.selection as unknown as {
      node?: import('prosemirror-model').Node; from: number; to: number;
    };
    const node = selection.node;
    const block = schema.nodes.image;
    const inline = schema.nodes.image_inline;
    if (!node || !block || !inline) return false;
    if (node.type !== block && node.type !== inline) return false;

    const wanted = wrap === 'block' ? block : inline;
    const attrs = { ...node.attrs, wrap: wrap === 'block' ? null : wrap };

    if (node.type === wanted) {
      if (dispatch) {
        dispatch(state.tr.setNodeMarkup(selection.from, undefined, attrs).scrollIntoView());
      }

      return true;
    }

    if (dispatch) {
      /* `caption` exists on the block node only; carrying it into an
         inline picture would store something nothing can render, and
         dropping it on the way back would lose an author's words. It
         rides along and is simply not shown while inline. */
      const made = wanted.createAndFill(attrs);
      if (!made) return false;

      const tr = state.tr.replaceRangeWith(selection.from, selection.to, made);
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}

/**
 * The image commands that need a VALUE: a width, a height, a
 * description, a wrapping mode.
 *
 * Kept apart from the registry above because they are factories rather
 * than commands - `image_width` is not something that can be run, only
 * something that can be run WITH a number. The bar has always called
 * them (`run('image_width', value)`) and the prose editor had none of
 * them, so its width select changed nothing and its alternative
 * description could not be typed into at all.
 */
export function buildMediaValueCommands(
  schema: import('prosemirror-model').Schema,
): Record<string, (value: string | null) => Command> {
  if (!schema.nodes.image) return {};

  /* A bare number means pixels. Typing "420" in a width box is not an
     invitation to learn CSS units, and a value that already carries one
     - '50%' from an older document, '30rem' from a paste - is left as
     it is. */
  const length = (value: string | null) => {
    const text = String(value ?? '').trim();
    if (!text) return null;

    return /^[0-9.]+$/.test(text) ? `${text}px` : text;
  };

  /* `false`: none of these toggles. Each one carries the value the
     author gave it, and writing the same value twice has to mean the
     same thing as writing it once. */
  return {
    image_width: (value) => setMediaAttr('width', length(value), false),
    image_height: (value) => setMediaAttr('height', length(value), false),
    /* '' is a real answer: an empty alt marks a picture as decorative,
       which is a different statement from having no alt at all. */
    image_alt: (value) => setMediaAttr('alt', value ?? null, false),
    /* The caption became an ATTRIBUTE at N/033, so that clicking a
       picture selects the picture instead of dropping the caret into a
       caption nobody meant to edit. This is the other half of that
       trade, and it went missing for a fortnight: without a field
       writing this command, a caption could be read and never written.
       Block pictures only - a `<figcaption>` cannot live inside a
       paragraph, which is why `image_inline` has no such attribute. */
    image_caption: (value) => setMediaAttr('caption', value || null, false),
    /* Not an attribute write: a wrapping mode decides which NODE the
       picture is, so this converts when it must. */
    image_wrap: (value) => convertImage(schema, value),
  };
}

/**
 * Sets an attribute on the selected media node.
 *
 * Works from the node selection rather than a stored reference, because the
 * document may have been edited since the toolbar was drawn and a stale position
 * would set the attribute on whatever now occupies it.
 */
export function setMediaAttr(attr: string, value: string | null, toggle = true): Command {
  return (state, dispatch) => {
    const sel = state.selection as unknown as { node?: { type: { name: string }; attrs: Record<string, unknown> }; from: number };
    const node = sel.node;
    if (!node || !['image', 'image_inline', 'embed'].includes(node.type.name)) return false;
    /* Setting the value already in force clears it, so alignment and width read
       as toggles — the same rule as blocks and cells.
     *
       NOT for a typed value, which is why `toggle` exists. A description
       box that erased the text when the same words were entered twice
       would be a trap, and it was one: the alt field wrote its value on
       `input` and again on `change`, so every edit landed and was
       immediately undone. A press toggles; a value is set. */
    const next = toggle && node.attrs[attr] === value ? null : value;
    if (dispatch) {
      dispatch(state.tr.setNodeMarkup(sel.from, undefined, { ...node.attrs, [attr]: next }));
    }
    return true;
  };
}
