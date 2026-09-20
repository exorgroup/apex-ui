import { type KeyFilter } from '../core/keyFilter';
import type { ApexFieldProps, ApexOption, ApexOptionsInput, ApexTrailingAction } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | number | null;
    type?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'password' | 'slug';
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    leadingIcon?: string;
    trailingIcon?: string;
    trailingAction?: ApexTrailingAction;
    clearable?: boolean;
    loading?: boolean;
    mono?: boolean;
    transform?: 'lower' | 'upper' | 'slug' | 'trim';
    maxlength?: number;
    /** Native browser autofill hint. Unrelated to the suggestion list below. */
    autocomplete?: string;
    /**
     * Restrict keystrokes: 'integer' | 'number' | 'money' | 'hex' | 'alphabetic'
     * | 'alphanumeric', or a RegExp / pattern string tested against the whole value.
     * Also filters paste and drop.
     */
    keyFilter?: KeyFilter;
    /** Suggestion list. Presence of this prop turns the control into a typeahead. */
    suggestions?: ApexOptionsInput;
    /** Characters required before @complete fires. */
    minLength?: number;
    /** Debounce before @complete fires, in ms. */
    delay?: number;
    /** Query again (with the current value) when the field gains focus. */
    completeOnFocus?: boolean;
    /** Show a chevron button that queries with an empty string. */
    dropdown?: boolean;
    /** Clear the value on blur unless it matches a suggestion. */
    forceSelection?: boolean;
    /** Message shown when a query returns nothing. */
    emptyMessage?: string;
};
declare var __VLS_5: {}, __VLS_31: {}, __VLS_36: {
    option: ApexOption<unknown>;
};
type __VLS_Slots = {} & {
    leading?: (props: typeof __VLS_5) => any;
} & {
    trailing?: (props: typeof __VLS_31) => any;
} & {
    option?: (props: typeof __VLS_36) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    focus: () => void | undefined;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: string) => void;
    blur: (v: string) => void;
    change: (v: string) => void;
    focus: (v: string) => void;
    clear: () => void;
    action: () => void;
    complete: (payload: {
        query: string;
    }) => void;
    "item-select": (option: ApexOption<unknown>) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: ((v: string) => any) | undefined;
    onChange?: ((v: string) => any) | undefined;
    onFocus?: ((v: string) => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    onClear?: (() => any) | undefined;
    onAction?: (() => any) | undefined;
    onComplete?: ((payload: {
        query: string;
    }) => any) | undefined;
    "onItem-select"?: ((option: ApexOption<unknown>) => any) | undefined;
}>, {
    type: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
    statusIcon: boolean;
    minLength: number;
    delay: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
