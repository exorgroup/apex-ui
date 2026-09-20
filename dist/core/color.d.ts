/** Colour model for ApexColorPicker. Immutable-ish helpers; every setter returns a new ApexColor. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';
export type Channel = 'r' | 'g' | 'b' | 'h' | 's' | 'l' | 'v' | 'a';
declare function rgbToHsv(r: number, g: number, b: number): {
    h: number;
    s: number;
    v: number;
};
declare function hsvToRgb(h: number, s: number, v: number): {
    r: number;
    g: number;
    b: number;
};
declare function rgbToHsl(r: number, g: number, b: number): {
    h: number;
    s: number;
    l: number;
};
declare function hslToRgb(h: number, s: number, l: number): {
    r: number;
    g: number;
    b: number;
};
export declare class ApexColor {
    r: number;
    g: number;
    b: number;
    a: number;
    private format;
    constructor(r?: number, g?: number, b?: number, a?: number, format?: ColorFormat);
    /** Parses #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), hsb()/hsv(). */
    static parse(input: string | ApexColor | null | undefined, fallback?: string): ApexColor;
    static fromHsv(h: number, s: number, v: number, a?: number, format?: ColorFormat): ApexColor;
    clone(): ApexColor;
    /** Returns the format of the color. */
    getFormat(): ColorFormat;
    /** Returns the channels of the color, for its current format. */
    getChannels(): Record<string, number>;
    /** Returns the value of one channel, in any space. */
    getChannelValue(channel: Channel): number;
    /** Returns the [min, max] range of a channel. */
    getChannelRange(channel: Channel): [number, number];
    /** Returns a new color with one channel changed. */
    setChannelValue(channel: Channel, value: number): ApexColor;
    /** Increments a channel by step, clamped to its range. */
    incChannelValue(channel: Channel, step?: number): ApexColor;
    /** Decrements a channel by step, clamped to its range. */
    decChannelValue(channel: Channel, step?: number): ApexColor;
    /** The two axes of the 2D colour area for a given pair, e.g. 'sv'. */
    getSpaceAxes(xyChannels?: string): {
        x: Channel;
        y: Channel;
        xRange: [number, number];
        yRange: [number, number];
    };
    /** Converts to another format, keeping the same colour. */
    toFormat(format: ColorFormat): ApexColor;
    /** Serialises to a CSS string in the given format (defaults to the current one). */
    toString(format?: ColorFormat): string;
    /** Plain object: format, channels and the serialised string. */
    toJSON(): {
        css: string;
        format: ColorFormat;
    };
}
export { rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb };
