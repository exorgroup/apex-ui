import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: boolean;
    /**
     * Words shown inside the track, changing with state. Both are rendered into
     * the same grid cell — the hidden one still takes up space — so the track
     * sizes itself to the longer of the two and never reflows as it toggles.
     * Keep them short; this is a switch, not a button.
     */
    onLabel?: string;
    offLabel?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: boolean) => any;
    "update:modelValue": (v: boolean) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: boolean) => any) | undefined;
    "onUpdate:modelValue"?: ((v: boolean) => any) | undefined;
}>, {
    labelPlacement: import("../types").ApexLabelPlacement;
    statusIcon: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
