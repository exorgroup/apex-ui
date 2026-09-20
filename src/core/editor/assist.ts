/**
 * AI seams.
 *
 * No provider is bundled and no prompt is written here. The editor emits a
 * request and the application answers it — endpoints, model choice, auth,
 * rate limits, cost control and prompt wording all belong to whoever owns the
 * account. What the editor owns is the part an application should not have to
 * solve twice: where the result lands, and what the document looks like while
 * the request is in flight.
 *
 * The result lands as a SUGGESTION rather than a replacement. An assistant that
 * silently rewrites a paragraph gives the author no way to see what changed or
 * to refuse it — so slice 8's insertion and deletion marks are reused, and an AI
 * edit arrives exactly as a colleague's would. That reuse is the reason this
 * slice comes after suggestions rather than before.
 */
import { Plugin, PluginKey, type EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import type { Node as PMNode, Schema } from 'prosemirror-model';

export type AssistAction =
  | 'rewrite' | 'shorten' | 'expand' | 'proofread' | 'translate' | 'summarise' | 'continue' | string;

export interface AssistRequest {
  action: AssistAction;
  /** The selected text, or the whole document when nothing is selected. */
  text: string;
  /** The document as JSON, for an action that needs surrounding context. */
  doc: unknown;
  /** Where the text came from, so a caller can reason about scope. */
  range: { from: number; to: number; empty: boolean };
  /** Anything the caller's own UI collected — a target language, a tone. */
  options?: Record<string, unknown>;
  /** Answer with the replacement text. */
  resolve: (text: string) => void;
  reject: (reason?: unknown) => void;
  /**
   * Push a partial result. Optional: an application without streaming simply
   * resolves once, and the editor behaves identically either way.
   */
  push?: (chunk: string) => void;
}

export type AssistHandler = (request: AssistRequest) => void;

export const assistKey = new PluginKey<DecorationSet>('apexAssist');

/**
 * Marks the range a request is working on.
 *
 * A decoration rather than a node or a mark, for the same reason the upload
 * placeholder is: it is never part of the document, so a save mid-request cannot
 * persist it and an undo cannot resurrect one whose request already finished.
 * And a decoration set is mapped through every transaction, so the range follows
 * edits made elsewhere while the request is out.
 */
export function assistPlugin() {
  return new Plugin<DecorationSet>({
    key: assistKey,
    state: {
      init: () => DecorationSet.empty,
      apply(tr, set) {
        /* Mapped FIRST, so positions are current before anything is added or
           removed against them. */
        let next = set.map(tr.mapping, tr.doc);
        const action = tr.getMeta(assistKey) as
          | { add?: { from: number; to: number; id: string }; remove?: string }
          | undefined;
        if (action?.add) {
          const { from, to, id } = action.add;
          next = next.add(tr.doc, [
            from === to
              ? Decoration.widget(from, () => {
                const el = document.createElement('span');
                el.className = 'apex-ed__assist-caret';
                el.setAttribute('aria-hidden', 'true');
                return el;
              }, { id })
              : Decoration.inline(from, to, { class: 'apex-ed__assist-range' }, { id }),
          ]);
        }
        if (action?.remove) {
          next = next.remove(next.find(undefined, undefined, (spec) => spec.id === action.remove));
        }
        return next;
      },
    },
    props: {
      decorations: (state) => assistKey.getState(state),
    },
  });
}

/** Where a request's range currently sits, or null if it has been edited away. */
export function assistRange(state: EditorState, id: string): { from: number; to: number } | null {
  const set = assistKey.getState(state);
  const found = set?.find(undefined, undefined, (spec) => spec.id === id);
  if (!found?.length) return null;
  return { from: found[0].from, to: found[0].to };
}

/**
 * Turns a result into a suggestion over the original range.
 *
 * The old text is marked deleted and the new text inserted beside it, which is
 * precisely what a human suggesting an edit produces — so accept and reject work
 * on it with no code of their own, and a reviewer cannot tell whether a person or
 * a model proposed it. That is the point.
 */
export function applyAssistResult(
  schema: Schema,
  range: { from: number; to: number },
  text: string,
  author: { id: string; name?: string },
) {
  return (state: EditorState, dispatch?: (tr: unknown) => void) => {
    const insertion = schema.marks.insertion;
    const deletion = schema.marks.deletion;
    const tr = state.tr;
    const attrs = { authorId: author.id, authorName: author.name || null, at: new Date().toISOString() };

    if (!insertion || !deletion) {
      /* Without the suggestion marks there is nothing to propose WITH, so the
         result replaces the range outright — the honest fallback when the caller
         has not enabled suggestions. */
      if (dispatch) dispatch(tr.insertText(text, range.from, range.to));
      return true;
    }

    if (range.to > range.from) tr.addMark(range.from, range.to, deletion.create(attrs));
    /* Inserted AFTER the marked range, so the reader sees the original struck
       through followed by the proposal, in reading order. */
    const at = range.to;
    tr.insert(at, schema.text(text, [insertion.create(attrs)]));
    /* Flagged so the suggestion rewriter lets it through: it would otherwise see
       a content change while suggesting and mark it a second time. */
    tr.setMeta('apexSuggestionApply', true);
    if (dispatch) dispatch(tr);
    return true;
  };
}

/** The text an action should work on: the selection, or the whole document. */
export function assistScope(doc: PMNode, selection: { from: number; to: number; empty: boolean }) {
  if (!selection.empty) {
    return {
      text: doc.textBetween(selection.from, selection.to, '\n\n'),
      range: { from: selection.from, to: selection.to, empty: false },
    };
  }
  /* An empty selection means the whole document, EXCEPT for 'continue', which
     wants the caret. The caller distinguishes by action; both are reported. */
  return {
    text: doc.textBetween(0, doc.content.size, '\n\n'),
    range: { from: selection.from, to: selection.to, empty: true },
  };
}
