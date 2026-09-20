/**
 * The ProseMirror engine, loaded once and shared.
 *
 * Dynamic, because an editor is heavy enough not to charge a page that never
 * shows one for it — and because the whole engine is ESM.
 *
 * One promise, cached: the two editor components must end up with the SAME
 * module objects. Two independent loads would still resolve to one copy under
 * a bundler, but the reference tree's own vendoring notes are emphatic about
 * what happens when that stops being true — two `Node` classes and every
 * `instanceof` across a package boundary silently false. Sharing the promise
 * makes it structural rather than a property of how someone's bundler
 * deduplicates.
 *
 * AF2-280. The reference component reached four directories up into the
 * gallery's `web/vendor/pm/index.mjs`, which no published package can
 * resolve; the reference tree's own README says the package "imports
 * prosemirror-* as ordinary peer dependencies", which is what this does.
 * ApexHTMLEditor was already doing it this way in a Promise.all of its own —
 * one family, two strategies, and this is the one that works.
 */

export interface ApexEditorEngine {
  model: typeof import('prosemirror-model');
  state: typeof import('prosemirror-state');
  view: typeof import('prosemirror-view');
  transform: typeof import('prosemirror-transform');
  keymap: typeof import('prosemirror-keymap');
  commands: typeof import('prosemirror-commands');
  history: typeof import('prosemirror-history');
  inputrules: typeof import('prosemirror-inputrules');
  schemaList: typeof import('prosemirror-schema-list');
  tables: typeof import('prosemirror-tables');
}

let pending: Promise<ApexEditorEngine> | null = null;

export function loadEngine(): Promise<ApexEditorEngine> {
  if (!pending) {
    pending = Promise.all([
      import('prosemirror-model'), import('prosemirror-state'),
      import('prosemirror-view'), import('prosemirror-transform'),
      import('prosemirror-keymap'), import('prosemirror-commands'),
      import('prosemirror-history'), import('prosemirror-inputrules'),
      import('prosemirror-schema-list'), import('prosemirror-tables'),
    ]).then(([model, state, view, transform, keymap, commands, history, inputrules, schemaList, tables]) => ({
      model, state, view, transform, keymap, commands, history, inputrules, schemaList, tables,
    }));
    /* A failed load must not be cached as a permanent failure: a chunk that
       404s once during a deploy would otherwise leave every editor on the
       page dead until a reload. */
    pending.catch(() => { pending = null; });
  }
  return pending;
}
