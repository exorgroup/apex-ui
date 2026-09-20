/**
 * Comments.
 *
 * The document stores an ANCHOR — a thread id on a range of text — and nothing
 * else. The thread itself, its replies, authors and timestamps live in the
 * application's database, because that is where they can be queried, paginated,
 * searched and permissioned. Embedding them in the document would make it grow
 * without bound, and would mean migrating comment schema every time the comment
 * feature changed.
 *
 * A mark rather than a node, because a comment applies to a RANGE of text and has
 * to survive editing inside that range. A node wrapper breaks the moment an edit
 * crosses its boundary; a mark is mapped through every step for free.
 */
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

export const commentMark: Record<string, MarkSpec> = {
  comment: {
    attrs: { threadId: {} },
    /**
     * Not inclusive, so typing at the very end of a commented range does not
     * silently join the new text to someone else's comment.
     */
    inclusive: false,
    /* Deliberately excludes nothing: two people can comment on overlapping text,
       and a mark that excluded itself would make the second comment delete the
       first. */
    excludes: '',
    parseDOM: [{
      tag: 'span[data-comment-thread]',
      getAttrs: (dom) => ({ threadId: (dom as HTMLElement).getAttribute('data-comment-thread') }),
    }],
    toDOM: (mark) => ['span', { 'data-comment-thread': mark.attrs.threadId }, 0],
  },
};

export interface CommentAnchor {
  threadId: string;
  from: number;
  to: number;
  /** The commented text, so a thread card can quote what it is about. */
  text: string;
  /** Distance from the top of the writing area, for aligning a gutter. */
  top: number;
  height: number;
}

/**
 * Reads every anchor in the document, with its on-screen position.
 *
 * The positions are measured from the view rather than computed, because line
 * wrapping, images and tables all affect where a range actually sits — and a
 * gutter that guessed would drift further down the document with every block.
 */
export function readAnchors(
  view: {
    state: { doc: { descendants: (fn: (node: unknown, pos: number) => void) => void } };
    coordsAtPos: (pos: number) => { top: number; bottom: number };
    dom: HTMLElement;
  },
): CommentAnchor[] {
  const found = new Map<string, { from: number; to: number; text: string }>();

  view.state.doc.descendants((node, pos) => {
    const n = node as { isText?: boolean; marks?: { type: { name: string }; attrs: Record<string, unknown> }[]; nodeSize: number; text?: string };
    if (!n.isText || !n.marks?.length) return;
    n.marks.forEach((mark) => {
      if (mark.type.name !== 'comment') return;
      const id = String(mark.attrs.threadId);
      const existing = found.get(id);
      /* A thread can span several text nodes — the range may contain bold or a
         link — so the anchor is the union rather than the first run found. */
      if (existing) {
        existing.to = pos + n.nodeSize;
        existing.text += n.text || '';
      } else {
        found.set(id, { from: pos, to: pos + n.nodeSize, text: n.text || '' });
      }
    });
  });

  const host = view.dom.getBoundingClientRect();
  return Array.from(found.entries()).map(([threadId, range]) => {
    const start = view.coordsAtPos(range.from);
    const end = view.coordsAtPos(range.to);
    return {
      threadId,
      from: range.from,
      to: range.to,
      text: range.text,
      top: start.top - host.top,
      height: Math.max(end.bottom - start.top, 0),
    };
  }).sort((a, b) => a.from - b.from);
}

/**
 * Marks the selection as a comment anchor.
 *
 * The id comes from the CALLER, not from here: the thread has to exist in the
 * application's store before the document points at it, or a saved document
 * would reference a thread that was never created.
 */
export function addComment(
  markType: import('prosemirror-model').MarkType,
  threadId: string,
): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    /* No selection means nothing to anchor to. A comment on a caret position
       would have no text to quote and nowhere to paint. */
    if (empty) return false;
    if (dispatch) dispatch(state.tr.addMark(from, to, markType.create({ threadId })));
    return true;
  };
}

/** Removes one thread's anchor, wherever it sits in the document. */
export function removeComment(
  markType: import('prosemirror-model').MarkType,
  threadId: string,
): Command {
  return (state, dispatch) => {
    const ranges: { from: number; to: number }[] = [];
    state.doc.descendants((node, pos) => {
      const n = node as unknown as { isText?: boolean; marks?: { type: unknown; attrs: Record<string, unknown> }[]; nodeSize: number };
      if (!n.isText) return;
      const mark = n.marks?.find((mk) => mk.type === markType && mk.attrs.threadId === threadId);
      if (mark) ranges.push({ from: pos, to: pos + n.nodeSize });
    });
    if (!ranges.length) return false;
    if (dispatch) {
      const tr = state.tr;
      /* Back to front, so removing one range does not shift the positions of the
         ranges still to be removed. */
      ranges.reverse().forEach((r) => tr.removeMark(r.from, r.to, markType));
      dispatch(tr);
    }
    return true;
  };
}

/** The thread ids under the caret, so a caller can open the right thread. */
export function threadsAtSelection(state: unknown, markType: unknown): string[] {
  const s = state as {
    selection: { $from: { marks: () => { type: unknown; attrs: Record<string, unknown> }[] }; from: number; to: number; empty: boolean };
    doc: { nodesBetween: (a: number, b: number, fn: (node: unknown) => void) => void };
  };
  const ids = new Set<string>();
  if (s.selection.empty) {
    s.selection.$from.marks().forEach((mk) => {
      if (mk.type === markType) ids.add(String(mk.attrs.threadId));
    });
  } else {
    s.doc.nodesBetween(s.selection.from, s.selection.to, (node) => {
      const n = node as { marks?: { type: unknown; attrs: Record<string, unknown> }[] };
      n.marks?.forEach((mk) => {
        if (mk.type === markType) ids.add(String(mk.attrs.threadId));
      });
    });
  }
  return Array.from(ids);
}

/**
 * The plugin that paints the active thread.
 *
 * A decoration rather than a class on the mark's own span, because "active"
 * belongs to the reader's current focus rather than to the document — two people
 * reading the same document have different active threads, and writing it into
 * the mark would make the document differ per reader.
 */
export function commentPlugin(deps: {
  state: typeof import('prosemirror-state');
  view: typeof import('prosemirror-view');
}, options: { activeThread: () => string | null; resolvedThreads: () => string[] }) {
  const { Plugin, PluginKey } = deps.state;
  const { Decoration, DecorationSet } = deps.view;
  const key = new PluginKey('apexComments');

  return new Plugin({
    key,
    props: {
      decorations(state) {
        const active = options.activeThread();
        const resolved = new Set(options.resolvedThreads());
        const decos: import('prosemirror-view').Decoration[] = [];
        state.doc.descendants((node, pos) => {
          if (!node.isText || !node.marks.length) return;
          node.marks.forEach((mark) => {
            if (mark.type.name !== 'comment') return;
            const id = String(mark.attrs.threadId);
            const classes = ['apex-ed__comment'];
            if (id === active) classes.push('is-active');
            if (resolved.has(id)) classes.push('is-resolved');
            decos.push(Decoration.inline(pos, pos + node.nodeSize, { class: classes.join(' ') }));
          });
        });
        return DecorationSet.create(state.doc, decos);
      },
    },
  });
}
