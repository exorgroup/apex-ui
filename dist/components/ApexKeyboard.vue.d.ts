type __VLS_Props = {
    modelValue?: string | null;
    enter?: boolean;
    del?: boolean;
    clear?: boolean;
    space?: boolean;
    /** A Hide key, emitting `hide`. */
    hide?: boolean;
    /** The digits row. */
    digits?: boolean;
    /** A Shift key: the next letter in capitals; twice locks. */
    shift?: boolean;
    /** Letters the language needs beyond A–Z, shown as their own row (e.g. ['ċ', 'ġ', 'ħ', 'ż']). */
    extraLetters?: string[];
    /** Characters the text may hold. */
    maxLength?: number;
    enterLabel?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /** The keyboard's accessible name. */
    label?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    hide: () => any;
    "update:modelValue": (v: string) => any;
    enter: (v: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onHide?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    onEnter?: ((v: string) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    label: string;
    shift: boolean;
    del: boolean;
    disabled: boolean;
    hide: boolean;
    modelValue: string | null;
    clear: boolean;
    enter: boolean;
    enterLabel: string;
    space: boolean;
    digits: boolean;
    extraLetters: string[];
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
