import type { ApexEditorClasses } from '../types';
import { type AnchorSide } from '../core/anchor';
type __VLS_Props = {
    /**
     * The object's rect in VIEWPORT coordinates. An editor whose surface is an
     * iframe must add the frame's own offset before passing it — done there, where
     * the frame is, rather than reached for from here.
     */
    rect?: DOMRect | null;
    /**
     * A GETTER for the rect, re-read on every placement.
     *
     * `rect` alone is a snapshot taken when the selection changed, so re-placing
     * on scroll put the bar back exactly where it already was — the object had
     * moved and its recorded rect had not. Anything that scrolls must therefore
     * re-measure, not just re-place.
     */
    measure?: (() => DOMRect | null) | null;
    /**
     * The box the bar must stay inside — the editor's own, normally.
     *
     * Without it the bar is clamped to the WINDOW, which is not the
     * constraint that matters: under a tall picture in a dialog it sat
     * below the dialog, on screen and plainly detached from the thing it
     * was acting on. A getter rather than a rect, for the same reason
     * `measure` is one: the dialog scrolls.
     */
    bounds?: (() => DOMRect | null) | null;
    /** What is selected, for the label and for the caller's own switching. */
    kind?: string;
    side?: AnchorSide;
    gap?: number;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
declare var __VLS_5: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_5) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    rect: DOMRect | null;
    side: AnchorSide;
    gap: number;
    kind: string;
    measure: (() => DOMRect | null) | null;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
