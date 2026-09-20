import type { ApexFieldProps } from '../types';
export interface PasswordRule {
    label: string;
    /** Either a regular expression or a predicate over the value. */
    test: RegExp | ((v: string) => boolean);
    /** Excluded from the score but still shown — e.g. "no spaces". */
    advisory?: boolean;
}
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | null;
    placeholder?: string;
    leadingIcon?: string;
    /** Show the eye toggle. */
    toggleMask?: boolean;
    /** Strength bar. */
    meter?: boolean;
    /** Requirements list. */
    checklist?: boolean;
    /** Put the meter and checklist in a popover that opens on focus. */
    popover?: boolean;
    /**
     * Override the default requirement list. Named `requirements` so it never
     * collides with the shared `rules` conditional-formatting prop.
     */
    requirements?: PasswordRule[];
    minLength?: number;
    /** Labels for the four strength bands. */
    strengthLabels?: [string, string, string, string];
    autocomplete?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: string) => void;
    blur: () => void;
    focus: () => void;
    strength: (payload: {
        score: number;
        label: string;
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: (() => any) | undefined;
    onFocus?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    onStrength?: ((payload: {
        score: number;
        label: string;
    }) => any) | undefined;
}>, {
    meter: boolean;
    statusIcon: boolean;
    autocomplete: string;
    minLength: number;
    toggleMask: boolean;
    checklist: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
