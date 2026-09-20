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
export declare const DEFAULT_SLASH_ITEMS: SlashItem[];
export interface SlashState {
    active: boolean;
    /** Where the "/" sits, so choosing an item can delete the query text. */
    from: number;
    to: number;
    query: string;
}
interface Deps {
    state: typeof import('prosemirror-state');
}
export declare function filterSlashItems(items: SlashItem[], query: string): SlashItem[];
export interface SlashPluginOptions {
    onChange: (state: SlashState) => void;
    /** True while the menu is open, so the plugin can hand it the arrow keys. */
    isOpen: () => boolean;
    onKey: (key: string) => boolean;
}
export declare function slashPlugin(deps: Deps, options: SlashPluginOptions): import("prosemirror-state").Plugin<any>;
export {};
