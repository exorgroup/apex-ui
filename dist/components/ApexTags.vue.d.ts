import type { ApexFieldProps, ApexOptionsInput } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string[];
    placeholder?: string;
    leadingIcon?: string;
    /** Extra key that commits a tag, e.g. ',' or ';'. Enter always works. */
    delimiter?: string;
    /** Let the same tag be added twice. */
    allowDuplicate?: boolean;
    /** Cap the number of tags. */
    max?: number;
    /** Suggestion list — presence turns typeahead on. */
    options?: ApexOptionsInput;
    /** Only allow values from `options`. */
    restrict?: boolean;
    /** Trim and drop empty entries. Defaults to true. */
    trim?: boolean;
    clearable?: boolean;
    addOnBlur?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: string[]) => void;
    add: (tag: string) => void;
    remove: (tag: string) => void;
    blur: () => void;
    focus: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: (() => any) | undefined;
    onFocus?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string[]) => any) | undefined;
    onRemove?: ((tag: string) => any) | undefined;
    onAdd?: ((tag: string) => any) | undefined;
}>, {
    trim: boolean;
    statusIcon: boolean;
    addOnBlur: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
