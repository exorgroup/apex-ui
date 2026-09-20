import type { ApexEditorClasses } from '../types';
/** The selected image's attributes, or null — which is what hides the bar. */
export interface ImageState {
    /** `image` (a figure) or `image_inline`. Only a figure can be captioned. */
    type?: string;
    src?: string;
    alt?: string | null;
    caption?: string | null;
    style?: string;
    width?: string | null;
    height?: string | null;
    align?: string | null;
    wrap?: string | null;
    /** What the picture actually measures, for boxes that must show a number. */
    renderedWidth?: number | null;
    renderedHeight?: number | null;
    [key: string]: unknown;
}
type __VLS_Props = {
    image?: ImageState | null;
    run?: (name: string, value?: string | null) => boolean;
    can?: Record<string, boolean> | null;
    /**
     * The whole bar, off. Separate from `can`, which is per command — the
     * size boxes write a value rather than running a named command, so
     * `can` never reaches them. AF2-281 found the same hole in the table bar.
     */
    disabled?: boolean;
    ui?: ApexEditorClasses;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    edit: () => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onEdit?: (() => any) | undefined;
}>, {
    image: ImageState | null;
    disabled: boolean;
    can: Record<string, boolean> | null;
    run: (name: string, value?: string | null) => boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
