import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    /** The chosen, cropped file — or null when nothing has been chosen. */
    modelValue?: File | null;
    /** An instruction to clear what is stored. See the docblock. */
    removed?: boolean;
    /** What is stored now. A url the host resolved; this control never builds one. */
    previewUrl?: string | null;
    /** Output size. Omit and the crop is optional and the result merely capped. */
    target?: {
        width: number;
        height: number;
    } | null;
    lockRatio?: boolean;
    accept?: string;
    /** Refused before the cropper opens, so a 40 MB file never reaches a canvas. */
    maxFileSize?: number;
    type?: string;
    quality?: number;
    maxDim?: number | null;
    /** Width of the preview box. The height follows the target's ratio. */
    previewWidth?: number;
    chooseLabel?: string;
    replaceLabel?: string;
    removeLabel?: string;
    /** Shown under the preview when nothing is stored and nothing is picked. */
    emptyLabel?: string;
    hint?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    warning: (v: {
        code: string;
        message: string;
    }) => any;
    error: (v: {
        message: string;
    }) => any;
    "update:modelValue": (v: File | null) => any;
    "update:removed": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onWarning?: ((v: {
        code: string;
        message: string;
    }) => any) | undefined;
    onError?: ((v: {
        message: string;
    }) => any) | undefined;
    "onUpdate:modelValue"?: ((v: File | null) => any) | undefined;
    "onUpdate:removed"?: ((v: boolean) => any) | undefined;
}>, {
    type: string;
    modelValue: File | null;
    target: {
        width: number;
        height: number;
    } | null;
    accept: string;
    maxFileSize: number;
    chooseLabel: string;
    emptyLabel: string;
    lockRatio: boolean;
    quality: number;
    maxDim: number | null;
    removed: boolean;
    previewUrl: string | null;
    previewWidth: number;
    replaceLabel: string;
    removeLabel: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
