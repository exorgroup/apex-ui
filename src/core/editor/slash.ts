/**
 * The slash menu.
 *
 * Built as a plugin rather than a component listening for keystrokes, because
 * the menu has to know the document position the "/" was typed at — so it can
 * delete exactly that text when a command is chosen, and close itself when the
 * caret leaves. A keydown listener on the DOM knows none of that.
 *
 * The items name commands in the same registry the toolbars use. A slash menu
 * that carried its own implementations would be a third way to produce a
 * document, and the three would drift.
 */
export interface SlashItem {
  /** A command name in the editor's registry. */
  command: string;
  label: string;
  icon?: string;
  /** Extra words that should match, beyond the label. */
  keywords?: string[];
  group?: string;
}

export const DEFAULT_SLASH_ITEMS: SlashItem[] = [
  { command: 'heading1', label: 'Heading 1', icon: 'format_h1', group: 'Blocks', keywords: ['title', 'h1'] },
  { command: 'heading2', label: 'Heading 2', icon: 'format_h2', group: 'Blocks', keywords: ['h2'] },
  { command: 'heading3', label: 'Heading 3', icon: 'format_h3', group: 'Blocks', keywords: ['h3'] },
  { command: 'paragraph', label: 'Text', icon: 'notes', group: 'Blocks', keywords: ['paragraph', 'body'] },
  { command: 'bullet_list', label: 'Bullet list', icon: 'format_list_bulleted', group: 'Lists', keywords: ['ul', 'unordered'] },
  { command: 'ordered_list', label: 'Numbered list', icon: 'format_list_numbered', group: 'Lists', keywords: ['ol', 'ordered'] },
  { command: 'task_list', label: 'Task list', icon: 'checklist', group: 'Lists', keywords: ['todo', 'checkbox'] },
  { command: 'blockquote', label: 'Quote', icon: 'format_quote', group: 'Blocks', keywords: ['citation'] },
  { command: 'code_block', label: 'Code block', icon: 'code_blocks', group: 'Blocks', keywords: ['pre', 'snippet'] },
  { command: 'horizontal_rule', label: 'Divider', icon: 'horizontal_rule', group: 'Blocks', keywords: ['hr', 'rule', 'separator'] },
];

export interface SlashState {
  active: boolean;
  /** Where the "/" sits, so choosing an item can delete the query text. */
  from: number;
  to: number;
  query: string;
}

const EMPTY: SlashState = { active: false, from: 0, to: 0, query: '' };

interface Deps {
  state: typeof import('prosemirror-state');
}

/**
 * Matches only a "/" that begins a word in an empty-ish position.
 *
 * A slash mid-sentence is a slash — "and/or", a URL, a date — so firing there
 * would interrupt ordinary writing constantly. The rule is: start of the block,
 * or preceded by whitespace.
 */
function readTrigger(doc: unknown, pos: number): SlashState {
  const $pos = (doc as { resolve: (p: number) => {
    parent: { textContent: string; type: { name: string } };
    parentOffset: number;
    start: () => number;
  } }).resolve(pos);
  /* Never inside code: every character there is literal. */
  if ($pos.parent.type.name === 'code_block') return EMPTY;
  const text = $pos.parent.textContent.slice(0, $pos.parentOffset);
  const match = /(?:^|\s)\/([\w-]*)$/.exec(text);
  if (!match) return EMPTY;
  const queryStart = $pos.start() + match.index + (match[0].startsWith('/') ? 0 : 1);
  return { active: true, from: queryStart, to: pos, query: match[1] };
}

export function filterSlashItems(items: SlashItem[], query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  /* Label matches rank above keyword matches, and a prefix above a substring, so
     typing "h2" reaches Heading 2 before anything that merely mentions it. */
  const score = (item: SlashItem) => {
    const label = item.label.toLowerCase();
    if (label.startsWith(q)) return 0;
    if (label.includes(q)) return 1;
    if ((item.keywords || []).some((k) => k.toLowerCase().startsWith(q))) return 2;
    if ((item.keywords || []).some((k) => k.toLowerCase().includes(q))) return 3;
    return -1;
  };
  return items
    .map((item) => ({ item, rank: score(item) }))
    .filter((r) => r.rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map((r) => r.item);
}

export interface SlashPluginOptions {
  onChange: (state: SlashState) => void;
  /** True while the menu is open, so the plugin can hand it the arrow keys. */
  isOpen: () => boolean;
  onKey: (key: string) => boolean;
}

export function slashPlugin(deps: Deps, options: SlashPluginOptions) {
  const key = new deps.state.PluginKey('apexSlash');
  return new deps.state.Plugin({
    key,
    /* Read on every state change rather than on keypress: a paste, an undo or a
       click all move the caret, and the trigger has to reflect where it ended up
       rather than what was last typed. */
    view() {
      return {
        update(view: { state: { selection: { empty: boolean; from: number } ; doc: unknown } }) {
          const sel = view.state.selection;
          options.onChange(sel.empty ? readTrigger(view.state.doc, sel.from) : EMPTY);
        },
      };
    },
    props: {
      handleKeyDown(_view: unknown, event: KeyboardEvent) {
        if (!options.isOpen()) return false;
        /* Only the keys the menu owns; everything else keeps typing, which is
           what filters the list. */
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(event.key)) {
          return options.onKey(event.key);
        }
        return false;
      },
    },
  });
}
