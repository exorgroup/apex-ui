import { ApexColor, type ColorFormat } from '../core/color';
import type { ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    modelValue?: string | null;
    format?: ColorFormat;
    /** Alpha slider and alpha in the output. */
    showAlpha?: boolean;
    /** Sliders beside the area instead of under it. */
    orientation?: 'horizontal' | 'vertical';
    /** Render in place instead of in a popover. */
    inline?: boolean;
    /** Swatch row under the picker. */
    presets?: string[];
    /** Editable text field with the serialised colour. */
    showInput?: boolean;
    /** hex / rgb / hsl / hsb switcher. */
    showFormatToggle?: boolean;
    /** Numeric channel boxes. */
    showChannels?: boolean;
    placeholder?: string;
    /** The popover: surface, edge, corner, lift. */
    pickerBackground?: string;
    pickerBorderColor?: string;
    pickerRadius?: string;
    pickerShadow?: string;
    /** The saturation/value square. Its gradient is the colour maths and stays
        as it is; these are its box. */
    areaHeight?: string;
    areaWidth?: string;
    areaRadius?: string;
    /** The marker dragged across the square — its ring, not its fill, which
        always shows the colour under it. */
    thumbColor?: string;
    /** The hue and alpha tracks, and the handle on them. `sliderHeight` is the
        track's thickness; `sliderLength` its long axis, which only applies when
        orientation is vertical (horizontally it fills the width). */
    sliderHeight?: string;
    sliderLength?: string;
    sliderThumbColor?: string;
    /** Every swatch. */
    swatchSize?: string;
    swatchBorderColor?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {
    color: import("vue").ComputedRef<ApexColor>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: (v: ApexColor) => any;
    "update:modelValue": (v: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: ((v: ApexColor) => any) | undefined;
    "onUpdate:modelValue"?: ((v: string) => any) | undefined;
}>, {
    statusIcon: boolean;
    format: ColorFormat;
    showAlpha: boolean;
    orientation: "horizontal" | "vertical";
    showInput: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
