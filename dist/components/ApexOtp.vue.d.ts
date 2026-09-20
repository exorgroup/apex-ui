import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | null;
    /** Number of boxes. */
    length?: number;
    /** Hide the characters, like a password. */
    mask?: boolean;
    /** Digits only; blocks everything else and sets the numeric keypad. */
    integerOnly?: boolean;
    /** Higher-emphasis filled boxes instead of outlined. */
    variant?: 'outlined' | 'filled';
    /** Focus the first box on mount. */
    autofocus?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    focus: () => void;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: string) => void;
    complete: (v: string) => void;
    blur: () => void;
    focus: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: (() => any) | undefined;
    onFocus?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    onComplete?: ((v: string) => any) | undefined;
}>, {
    length: number;
    statusIcon: boolean;
    variant: "outlined" | "filled";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
