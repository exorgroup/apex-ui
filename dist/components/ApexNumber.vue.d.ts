import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: number | string | null;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    currency?: string;
    precision?: number;
    clamp?: boolean;
    /** Where the value sits inside the box. */
    align?: 'start' | 'center' | 'end';
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: number | null) => void;
    blur: () => void;
    focus: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: (() => any) | undefined;
    onFocus?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: number | null) => any) | undefined;
}>, {
    statusIcon: boolean;
    clamp: boolean;
    align: "start" | "center" | "end";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
