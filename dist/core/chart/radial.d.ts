/**
 * Radial geometry: pie, donut, gauge, radar and polar.
 *
 * Angles are measured from twelve o'clock, clockwise, in radians — the way
 * people read a dial. Mathematical convention (zero at three o'clock, counter-
 * clockwise) would put every caller's `startAngle` at −90.
 */
export declare const TAU: number;
export interface RadialFrame {
    cx: number;
    cy: number;
    /** Outer radius. */
    r: number;
    /** Inner radius; 0 for a full pie. */
    r0: number;
    start: number;
    end: number;
}
export declare function polar(cx: number, cy: number, r: number, angle: number): {
    x: number;
    y: number;
};
/**
 * An annular sector. A full circle cannot be drawn as one arc — the start and
 * end points coincide and the renderer draws nothing — so a complete ring is
 * split into two halves.
 */
export declare function arcPath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string;
export interface PieSlice {
    index: number;
    value: number;
    fraction: number;
    a0: number;
    a1: number;
    /** Mid-angle, for a label or a leader line. */
    mid: number;
}
/**
 * Lays out values around a ring. Zero and negative values are dropped rather
 * than drawn as slivers: a part-to-whole chart has no way to show a negative
 * part, and a zero slice is a line the reader cannot hover.
 */
export declare function pieLayout(values: (number | null)[], start?: number, end?: number, padAngle?: number): PieSlice[];
/** One spoke per category, the first pointing straight up. */
export declare function spokeAngles(count: number, start?: number): number[];
export declare function radarPath(cx: number, cy: number, radii: (number | null)[], angles: number[], close?: boolean): string;
export interface GaugeGeometry {
    track: string;
    value: string;
    /** Where the needle tip sits, for a marker. */
    tip: {
        x: number;
        y: number;
    };
    fraction: number;
}
export declare function gaugeGeometry(frame: RadialFrame, value: number, min: number, max: number): GaugeGeometry;
/** Normalizes to [0, TAU) so a comparison never straddles the seam. */
export declare function normalizeAngle(a: number): number;
export declare function angleAt(cx: number, cy: number, x: number, y: number): number;
export declare function sliceAt(slices: PieSlice[], angle: number, start: number): PieSlice | null;
