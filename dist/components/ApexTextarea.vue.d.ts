import { type KeyFilter } from '../core/keyFilter';
import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | null;
    placeholder?: string;
    rows?: number;
    maxlength?: number;
    counter?: boolean;
    /**
     * Draw a bar beside the counter that says whether the length is GOOD — short
     * (under half the target), good, or over. AC/003.
     */
    meter?: boolean;
    /**
     * The length to aim for. Advice, not a wall: past it the meter turns red and the
     * text is still accepted up to `maxlength`. A share description aims at 160 and is
     * valid to 300, and collapsing the two would either block allowed text or stop
     * warning exactly where the warning helps. Falls back to `maxlength`.
     */
    target?: number;
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
