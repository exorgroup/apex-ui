import type { ApexEditorClasses } from '../types';
type __VLS_Props = {
    active?: {
        marks: Record<string, boolean>;
    } | null;
    /** The href under the caret, when there is one. */
    href?: string | null;
    target?: string | null;
    disabled?: boolean;
    /**
     * A COUNTER, not a boolean: Insert › Link has to be able to open this a second
     * time after the author closed it, and a boolean that is already true fires no
     * watcher. Bumped by the editor's own `link` command, so the menu entry
     * reaches the same popover the toolbar button opens rather than a second link
     * editor that would drift from it.
     */
    openRequest?: number;
    /** Prefix a bare domain with this, so "example.com" is a usable link. */
    defaultScheme?: string;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    remove: () => any;
    apply: (payload: {
        href: string;
        target: string | null;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onRemove?: (() => any) | undefined;
    onApply?: ((payload: {
        href: string;
        target: string | null;
    }) => any) | undefined;
}>, {
    openRequest: number;
    defaultScheme: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
