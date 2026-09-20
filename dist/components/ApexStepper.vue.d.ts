import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    /** Suffix tag beside the value, like ApexNumber's. */
    unit?: string;
    /**
     * What the buttons show. `*Icon` takes a Material Symbols name; `*Text` takes
     * a literal character or short string and wins when both are given. Two props
     * rather than one because a single prop cannot tell the glyph name "remove"
     * from someone wanting the word remove printed on the button.
     */
    decrementIcon?: string;
    incrementIcon?: string;
    decrementText?: string;
    incrementText?: string;
    /** Where the value sits between the two buttons. */
    align?: 'start' | 'center' | 'end';
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:modelValue": (v: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((v: number) => any) | undefined;
}>, {
    statusIcon: boolean;
    step: number;
    align: "start" | "center" | "end";
    decrementIcon: string;
    incrementIcon: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
