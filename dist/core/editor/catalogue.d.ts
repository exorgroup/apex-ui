/**
 * The command catalogue.
 *
 * One declaration per command — label, icon, shortcut, active test, domain —
 * referenced BY NAME from every surface: the fixed toolbar, the menubar, the
 * bubble menu, the slash menu and the contextual object bars. That is what stops
 * a label or a shortcut being right in one place and wrong in another.
 *
 * The domain is what makes the menubar DERIVABLE rather than hand-built. A
 * hand-built menu drifts from the commands that actually exist, which is how
 * TinyMCE ended up with Source code in both its View and Tools menus.
 */
export type CommandDomain = 'file' | 'edit' | 'insert' | 'format' | 'table' | 'view' | 'tools';
export interface CommandSpec {
    domain: CommandDomain;
    label: string;
    icon?: string;
    keys?: string;
    activeMark?: string;
    activeBlock?: string;
    activeAttrs?: Record<string, unknown>;
    /**
     * A flag on the editor's active state, for a view TOGGLE that has no mark and
     * no block to read — its state lives on the editor, not in the document.
     */
    activeFlag?: string;
    /**
     * The toolbar's blanket `disabled` does not apply. For a command that is what
     * gets an author OUT of the state disabling everything else — the source view
     * had no exit when its own button was disabled with the rest.
     */
    ignoresDisabled?: boolean;
    /**
     * The registry entry is a FACTORY taking a value, not a command: font_size
     * sets a size, it does not toggle one. A surface that names such a command
     * without a value has named half a command, so it must supply one — see
     * valueItems().
     */
    takesValue?: boolean;
}
/**
 * A resolved item: what describe() returns for anything that is not a bare
 * string.
 *
 * The select options are narrowed here because describe() genuinely fills them
 * in — CommandSpec.label is required and the command name is assigned there — so
 * a consumer reads them directly rather than behind an assertion.
 */
export interface ResolvedItem extends Partial<CommandSpec> {
    command?: string;
    type?: 'separator' | 'select' | 'custom' | 'overflow';
    /** Names a control the surface renders in place of a row — e.g. a size grid. */
    custom?: string;
    slot?: string;
    /** The argument for a takesValue command. null is a real value: "unset". */
    value?: string | null;
    options?: ResolvedItem[];
    items?: SurfaceItem[];
}
/** A surface item: a command name, a separator, or an explicit override. */
export type SurfaceItem = string | (Partial<CommandSpec> & {
    command?: string;
    type?: 'separator' | 'select' | 'custom' | 'overflow';
    /** Names a control the surface renders in place of a row — e.g. a size grid. */
    custom?: string;
    slot?: string;
    value?: string | null;
    options?: SurfaceItem[];
    items?: SurfaceItem[];
});
export declare const DOMAINS: CommandDomain[];
export declare const CATALOGUE: Record<string, CommandSpec>;
export declare function describe(item: SurfaceItem): ResolvedItem;
/**
 * The option list for a takesValue command.
 *
 * Declared here rather than in each surface: the font sizes offered by the
 * menubar and by a future toolbar dropdown are the same list, and two copies of
 * it would diverge the way the two ToolbarItem declarations did.
 */
export declare function valueItems(command: string, options: {
    label: string;
    value: string | null;
}[]): SurfaceItem[];
export declare const FONT_FAMILIES: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const FONT_SIZES: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const TEXT_COLOURS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const CELL_BACKGROUNDS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const CELL_BORDERS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const CELL_PADDINGS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const CELL_TEXT_ALIGNS: {
    label: string;
    value: string;
}[];
export declare const CELL_VERTICAL_ALIGNS: {
    label: string;
    value: string;
}[];
export declare const TABLE_BORDER_WIDTHS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const TABLE_BORDER_COLOURS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
export declare const IMAGE_WIDTHS: ({
    label: string;
    value: null;
} | {
    label: string;
    value: string;
})[];
/**
 * The menubar tree.
 *
 * Depth and grouping follow TinyMCE and CKEditor, which agree with each other:
 * a shallow menu of forty entries is a list, not an index. One deliberate
 * difference — table_insert lives in Insert only. Creating a table is an insert;
 * the Table menu is for the table you are already in, and putting it in both is
 * exactly the duplication this file's header criticises.
 */
export declare const MENUS: {
    label: string;
    items: SurfaceItem[];
}[];
export declare function unreachableCommands(): string[];
/**
 * The OTHER direction, and the one that was missing.
 *
 * unreachableCommands() asserts catalogue -> menu. Nothing asserted registry ->
 * catalogue, so eighteen implemented commands (font_family, font_size,
 * text_color, heading 4-6, insert_image, merge/split cells, the five cell
 * properties, align justify/clear, hard_break) sat in the registry with no
 * catalogue entry and were therefore reachable from no surface at all. The
 * editor knew how to do them and no user could ask.
 *
 * Pass the registry's own key set — the availability map the editor already
 * hands every surface is exactly that.
 */
export declare function uncataloguedCommands(registryNames: string[]): string[];
