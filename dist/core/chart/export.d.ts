/**
 * Chart export.
 *
 * Returns strings and blobs rather than triggering downloads: the filename, the
 * destination and whether a download happens at all belong to the application,
 * the same call the task board's export makes.
 */
import type { ResolvedSeries } from './data';
/**
 * Serializes the live SVG, resolving CSS custom properties to literal colours.
 * A standalone file has no design system to look them up in, so an exported
 * chart that kept `var(--apex-cht-series-1)` would come out black.
 */
export declare function exportSvg(svg: SVGSVGElement, options?: {
    background?: string;
}): string;
export interface RasterOptions {
    scale?: number;
    background?: string;
    type?: 'image/png' | 'image/jpeg';
    quality?: number;
}
/** Rasterises the serialized SVG through an image, so what you get is what renders. */
export declare function exportRaster(svg: SVGSVGElement, options?: RasterOptions): Promise<Blob>;
/** One row per category, one column per series — the shape a spreadsheet wants. */
export declare function exportRows(series: ResolvedSeries[], categories: string[], categorical: boolean): Record<string, unknown>[];
export declare function exportCsv(series: ResolvedSeries[], categories: string[], categorical: boolean): string;
