import type { ApexEditorClasses } from '../types';
export interface WordCountStats {
    words: number;
    chars: number;
    charsNoSpaces: number;
    blocks: number;
}
type __VLS_Props = {
    openRequest?: number;
    /**
     * A GETTER, read when the dialog opens: statistics computed on every keystroke
     * would be work nobody asked for.
     */
    stats?: (() => {
        doc: WordCountStats | null;
        selection: WordCountStats | null;
    }) | null;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare function show(): void;
declare function hide(): void;
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    show: typeof show;
    hide: typeof hide;
    doc: import("vue").Ref<{
        words: number;
        chars: number;
        charsNoSpaces: number;
        blocks: number;
    } | null, WordCountStats | {
        words: number;
        chars: number;
        charsNoSpaces: number;
        blocks: number;
    } | null>;
    selection: import("vue").Ref<{
        words: number;
        chars: number;
        charsNoSpaces: number;
        blocks: number;
    } | null, WordCountStats | {
        words: number;
        chars: number;
        charsNoSpaces: number;
        blocks: number;
    } | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    openRequest: number;
    stats: (() => {
        doc: WordCountStats | null;
        selection: WordCountStats | null;
    }) | null;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
