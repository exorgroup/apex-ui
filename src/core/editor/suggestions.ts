/**
 * Suggestions — track changes.
 *
 * Both an insertion and a deletion are MARKS, which is the whole design. An
 * insertion could be a mark or a node, but a deletion has no choice: the text has
 * to stay in the document and stay visible until someone accepts it, so
 * "deleting" in suggestion mode means marking, never removing. Accepting a
 * deletion is what finally removes the text.
 *
 * That symmetry is what makes accept and reject inverses of each other:
 *   accept  insertion → drop the mark, keep the text
 *   reject  insertion → remove the text
 *   accept  deletion  → remove the text
 *   reject  deletion  → drop the mark, keep the text
 */
import type { MarkSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';

/** Who made a suggestion, carried on the mark so a reviewer can filter by author. */
export interface SuggestionAuthor {
  id: string;
  name?: string;
}

function authorAttrs(dom: HTMLElement) {
  return {
    authorId: dom.getAttribute('data-author') || 'unknown',
    authorName: dom.getAttribute('data-author-name'),
    at: dom.getAttribute('data-at'),
  };
}

const shared = {
  authorId: { default: 'unknown' },
  authorName: { default: null },
  /* An ISO timestamp, so a reviewer can order suggestions and a stale one can be
     spotted — the document is the only place this survives a page reload. */
  at: { default: null },
};

export const suggestionMarks: Record<string, MarkSpec> = {
  insertion: {
    attrs: { ...shared },
    inclusive: false,
    /* Not excluded from anything: someone can suggest bold text, and the two
       marks have to coexist on the same run. */
    excludes: '',
    parseDOM: [{ tag: 'ins[data-author]', getAttrs: (d) => authorAttrs(d as HTMLElement) }],
    toDOM: (mark) => ['ins', {
      'data-author': mark.attrs.authorId,
      'data-author-name': mark.attrs.authorName,
      'data-at': mark.attrs.at,
    }, 0],
  },
  deletion: {
    attrs: { ...shared },
    inclusive: false,
    excludes: '',
    parseDOM: [{ tag: 'del[data-author]', getAttrs: (d) => authorAttrs(d as HTMLElement) }],
    toDOM: (mark) => ['del', {
      'data-author': mark.attrs.authorId,
      'data-author-name': mark.attrs.authorName,
      'data-at': mark.attrs.at,
    }, 0],
  },
};

export interface SuggestionRange {
  kind: 'insertion' | 'deletion';
  authorId: string;
  authorName: string | null;
  at: string | null;
  from: number;
  to: number;
  text: string;
}

/** Every suggestion in the document, merged into contiguous runs. */
export function readSuggestions(doc: unknown, schema: unknown): SuggestionRange[] {
  const s = schema as { marks: Record<string, unknown> };
  const out: SuggestionRange[] = [];
  (doc as { descendants: (fn: (node: unknown, pos: number) => void) => void })
    .descendants((node, pos) => {
      const n = node as { isText?: boolean; text?: string; nodeSize: number; marks?: { type: { name: string }; attrs: Record<string, unknown> }[] };
      if (!n.isText || !n.marks?.length) return;
      n.marks.forEach((mark) => {
        const kind = mark.type.name;
        if (kind !== 'insertion' && kind !== 'deletion') return;
        const last = out[out.length - 1];
        /* Merged when the previous run is the same kind by the same author and
           ends exactly here: a reviewer accepts a change, not a text node, and
           three adjacent nodes from one edit are one change. */
        if (last && last.kind === kind && last.authorId === mark.attrs.authorId && last.to === pos) {
          last.to = pos + n.nodeSize;
          last.text += n.text || '';
          return;
        }
        out.push({
          kind,
          authorId: String(mark.attrs.authorId),
          authorName: (mark.attrs.authorName as string) || null,
          at: (mark.attrs.at as string) || null,
          from: pos,
          to: pos + n.nodeSize,
          text: n.text || '',
        });
      });
    });
  void s;
  return out;
}

/**
 * Rewrites a transaction so deletions become marks.
 *
 * Applied to the transaction before it is dispatched rather than as a plugin
 * filter, because a filter can only veto: to turn a deletion INTO something else
 * the replacement has to be built, and only the dispatcher has both the original
 * transaction and the state it came from.
 *
 * Returns null when the transaction needs no rewriting, so the ordinary path
 * stays untouched — most transactions are selection changes.
 */
export function asSuggestion(
  state: unknown,
  tr: unknown,
  schema: unknown,
  author: SuggestionAuthor,
): unknown | null {
  const s = state as {
    doc: { textBetween: (a: number, b: number, sep?: string) => string; rangeHasMark: (a: number, b: number, t: unknown) => boolean };
    tr: unknown;
  };
  const t = tr as {
    docChanged: boolean;
    steps: { jsonID?: string; from?: number; to?: number; slice?: { size: number } }[];
    getMeta: (k: string) => unknown;
  };
  if (!t.docChanged) return null;
  /* Our own accept/reject transactions must pass through, or accepting a deletion
     would be re-marked as a new deletion and never complete. */
  if (t.getMeta('apexSuggestionApply')) return null;

  const marks = (schema as { marks: Record<string, { create: (a: unknown) => unknown }> }).marks;
  const insertion = marks.insertion;
  const deletion = marks.deletion;
  if (!insertion || !deletion) return null;

  const attrs = {
    authorId: author.id,
    authorName: author.name || null,
    at: new Date().toISOString(),
  };

  /* Only replace steps are handled: a mark toggle or an attribute change is not
     a content change, so it applies directly rather than becoming a suggestion. */
  const replaces = t.steps.filter((step) => step.jsonID === 'replace' || step.jsonID === 'replaceAround');
  if (!replaces.length) return null;

  const next = s.tr as {
    insert: (pos: number, content: unknown) => unknown;
    addMark: (a: number, b: number, m: unknown) => unknown;
    setSelection: (sel: unknown) => unknown;
    setMeta: (k: string, v: unknown) => unknown;
    doc: unknown;
  };

  let changed = false;
  /* Back to front, so each rewrite leaves the positions of the earlier steps
     alone — the same reason removeComment walks its ranges in reverse. */
  [...replaces].reverse().forEach((step) => {
    const from = step.from ?? 0;
    const to = step.to ?? 0;
    if (to > from) {
      /* A deletion becomes a MARK: the text has to stay visible until someone
         accepts it, so nothing is removed here. */
      next.addMark(from, to, deletion.create(attrs));
      changed = true;
    }
  });
  if (!changed) return null;
  next.setMeta('apexSuggestionApply', true);
  return next;
}

/**
 * Accepts or rejects one suggestion range.
 *
 * The two verbs share one function because they differ only in which side of the
 * pair keeps the text — writing them separately invites the two to drift, and a
 * track-changes feature whose accept and reject are not exact inverses corrupts
 * documents quietly.
 */
export function resolveSuggestion(
  schema: { marks: Record<string, unknown> },
  range: { kind: 'insertion' | 'deletion'; from: number; to: number },
  verb: 'accept' | 'reject',
): Command {
  return (state, dispatch) => {
    const markType = schema.marks[range.kind] as import('prosemirror-model').MarkType;
    if (!markType) return false;
    /* An insertion accepted keeps its text; a deletion accepted loses it. Reject
       is the same table with the verbs swapped. */
    const keepText = (range.kind === 'insertion') === (verb === 'accept');
    if (dispatch) {
      const tr = state.tr;
      if (keepText) tr.removeMark(range.from, range.to, markType);
      else tr.delete(range.from, range.to);
      /* Flagged so the rewriter lets it through: without this, deleting text to
         accept a deletion would be re-marked as a new deletion. */
      tr.setMeta('apexSuggestionApply', true);
      dispatch(tr);
    }
    return true;
  };
}

/** Accepts or rejects everything, optionally from one author only. */
export function resolveAll(
  schema: { marks: Record<string, unknown> },
  verb: 'accept' | 'reject',
  authorId?: string,
): Command {
  return (state, dispatch) => {
    const ranges = readSuggestions(state.doc, schema)
      .filter((r) => !authorId || r.authorId === authorId);
    if (!ranges.length) return false;
    if (dispatch) {
      const tr = state.tr;
      /* Back to front, so resolving one range does not shift those still to be
         resolved. */
      ranges.reverse().forEach((range) => {
        const markType = schema.marks[range.kind] as import('prosemirror-model').MarkType;
        const keepText = (range.kind === 'insertion') === (verb === 'accept');
        if (keepText) tr.removeMark(range.from, range.to, markType);
        else tr.delete(range.from, range.to);
      });
      tr.setMeta('apexSuggestionApply', true);
      dispatch(tr);
    }
    return true;
  };
}
