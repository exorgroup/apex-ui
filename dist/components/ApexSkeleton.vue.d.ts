type __VLS_Props = {
    shape?: 'rectangle' | 'rounded' | 'square' | 'circle' | 'text';
    /** Diameter for circle and square. */
    size?: string;
    width?: string;
    height?: string;
    borderRadius?: string;
    background?: string;
    /** The lighter band that travels across the base colour. */
    shimmerColor?: string;
    /** 'wave' travels left to right, 'pulse' fades, 'none' is static. */
    animation?: 'wave' | 'pulse' | 'none';
    duration?: string;
    /** Stagger the wave, so a stack of skeletons does not pulse in lockstep. */
    delay?: string;
    /** Number of stacked lines, for shape="text". The last is shortened. */
    lines?: number;
    lineGap?: string;
    /** How wide the last line of a text block is. */
    lastLineWidth?: string;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    shape: "rectangle" | "rounded" | "square" | "circle" | "text";
    duration: string;
    animation: "wave" | "pulse" | "none";
    lines: number;
    lastLineWidth: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
