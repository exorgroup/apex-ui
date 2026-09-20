import type { ApexEditorClasses } from '../types';
import { unreachableCommands } from '../core/editor/catalogue';
type __VLS_Props = {
    /**
     * Runs a command by name; the same registry every other surface calls. The
     * optional value is for a takesValue command, whose registry entry is a
     * factory rather than a command — font_size sets a size, it does not toggle
     * one.
     */
    run?: (name: string, value?: unknown) => boolean;
    /**
     * Availability as a MAP rather than a predicate, matching the toolbar. Absent
     * means UNKNOWN rather than unavailable, so a registry that has not reported
     * yet does not grey out the whole index.
     */
    can?: Record<string, boolean> | null;
    active?: Record<string, unknown> | null;
    /** Menus to omit, for an editor with no tables. */
    exclude?: string[];
    /**
     * Insert ▸ Table opens a size GRID rather than inserting a guess, so the
     * menubar needs the one thing a grid cannot get from a command name.
     */
    insertTable?: ((rows: number, cols: number) => boolean) | null;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    catalogue: Record<string, import("..").CommandSpec>;
    unreachableCommands: typeof unreachableCommands;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    command: (payload: {
        command: string;
        value?: unknown;
        applied: boolean;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onCommand?: ((payload: {
        command: string;
        value?: unknown;
        applied: boolean;
    }) => any) | undefined;
}>, {
    insertTable: ((rows: number, cols: number) => boolean) | null;
    exclude: string[];
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
