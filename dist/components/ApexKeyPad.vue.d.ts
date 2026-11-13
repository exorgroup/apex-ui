import { type KeyPadOperator, type KeyPadFunctionKey } from '../core/keypad';
type __VLS_Props = {
    modelValue?: string | null;
    /** + − × ÷ — `true` for all four, or the ones wanted. */
    operators?: boolean | KeyPadOperator[];
    enter?: boolean;
    del?: boolean;
    dot?: boolean;
    clear?: boolean;
    doubleZero?: boolean;
    /** Shuffle the digits each time the pad appears. */
    randomise?: boolean;
    /** With `randomise`: shuffle again after each entry (on), or keep the layout until the pad appears again (off). */
    reshuffle?: boolean;
    /** Show ● for each digit, as a PIN pad does. */
    mask?: boolean;
    /** Digits the entry may hold. */
    maxLength?: number;
    /** Emit `enter` by itself once `max-length` digits are in. */
    autoSubmit?: boolean;
    /** Places a result may carry; a result needing more is refused, never rounded. */
    decimals?: number;
    /** `calculator`: 7-8-9 on top. `phone`: 1-2-3 on top. */
    layout?: 'calculator' | 'phone';
    /** Show the entry above the keys. */
    display?: boolean;
    /** The screen's own keys; each emits `function` with the result. */
    functionKeys?: KeyPadFunctionKey[];
    /** The label of the enter key. */
    enterLabel?: string;
    /** What the display says when empty. */
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    /** The pad's accessible name. */
    label?: string;
    /** A PIN pad that reveals nothing: shuffled, masked, no keyboard input, no pressed-key highlight, digits not spoken. */
    secure?: boolean;
};
declare function shuffle(): void;
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    shuffle: typeof shuffle;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    function: (id: string, v: string) => any;
    "update:modelValue": (v: string) => any;
    enter: (v: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onFunction?: ((id: string, v: string) => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    onEnter?: ((v: string) => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    label: string;
    del: boolean;
    mask: boolean;
    disabled: boolean;
    placeholder: string;
    modelValue: string | null;
    clear: boolean;
    enter: boolean;
    display: boolean;
    operators: boolean | KeyPadOperator[];
    dot: boolean;
    doubleZero: boolean;
    randomise: boolean;
    reshuffle: boolean;
    autoSubmit: boolean;
    decimals: number;
    layout: "calculator" | "phone";
    functionKeys: KeyPadFunctionKey[];
    enterLabel: string;
    secure: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
