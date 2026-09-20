import { type KeyFilter } from '../core/keyFilter';
import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | null;
    placeholder?: string;
    rows?: number;
    maxlength?: number;
    counter?: boolean;
    autogrow?: boolean;
    mono?: boolean;
    /**
     * Restrict keystrokes: 'integer' | 'number' | 'money' | 'hex' | 'alphabetic'
     * | 'alphanumeric', or a RegExp / pattern string tested against the whole value.
     */
    keyFilter?: KeyFilter;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: string) => void;
    blur: () => void;
    focus: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: (() => any) | undefined;
    onFocus?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
}>, {
    statusIcon: boolean;
    rows: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
