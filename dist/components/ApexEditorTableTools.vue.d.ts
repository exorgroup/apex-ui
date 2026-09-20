import type { ApexEditorClasses } from '../types';
import { type SurfaceItem } from '../core/editor/catalogue';
export interface CellStyleState {
    style: Record<string, string>;
    rows?: number;
    cols?: number;
    selectedCells?: number;
    colspan?: number;
    rowspan?: number;
    /**
     * The TABLE's border — N/048. Not the cell's: a border is what a person
     * means by "table border", it survives a row being added, and it is one
     * value rather than one per cell.
     */
    border?: {
        width: string | null;
        color: string | null;
    };
}
type __VLS_Props = {
    /** Absent means no table under the selection, and the bar renders nothing. */
    cell?: CellStyleState | null;
    /** A value may come with the name: the border commands take one. */
    run?: (name: string, value?: string | null) => boolean;
    can?: Record<string, boolean> | null;
    /** Writes one CSS declaration onto the cell selection. */
    setCellStyle?: (prop: string, value: string | null) => void;
    /** Structure commands, in bar order. */
    items?: SurfaceItem[];
    /**
     * The whole bar, off.
     *
     * Separate from `can`, which answers "may this command run here" per
     * command — this answers "is the editor accepting input at all", so a
     * readonly or disabled editor greys the bar rather than leaving a live
     * table toolbar over a document nobody can edit. AF2-281: present in the
     * mirror, absent from the SFC, and the alignment buttons are the half that
     * `can` cannot reach — they write a style rather than running a named
     * command, so nothing gated them.
     */
    disabled?: boolean;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    items: SurfaceItem[];
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
