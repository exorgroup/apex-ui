/**
 * The compound-component registry.
 *
 * Compound children are renderless: they register configuration and render
 * nothing. That is what keeps this a second *authoring* surface rather than a
 * second engine — everything still ends up in the same series array and the same
 * option objects the props feed, so there is one code path to reason about.
 *
 * Registration order is declaration order, since Vue mounts children in order,
 * and a Map preserves insertion — which matters because series order decides
 * paint order and legend order.
 */
import { type InjectionKey } from 'vue';
export type ChartPartKind = 'series' | 'xAxis' | 'yAxis' | 'y2Axis' | 'legend' | 'tooltip' | 'hover' | 'title' | 'caption' | 'navigator' | 'zoom' | 'referenceLine' | 'referenceBand' | 'dataLabels';
export interface ChartRegistry {
    /** kind → key → config. Maps, so declaration order survives. */
    parts: Record<string, Map<string, unknown>>;
    set(kind: ChartPartKind, key: string, config: unknown): void;
    remove(kind: ChartPartKind, key: string): void;
}
export declare const CHART_REGISTRY_KEY: InjectionKey<ChartRegistry>;
export declare function createChartRegistry(): ChartRegistry;
export declare function provideChartRegistry(registry: ChartRegistry): void;
/** Reads a registered list in declaration order. */
export declare function partList<T>(registry: ChartRegistry | null, kind: ChartPartKind): T[];
/** Reads a single registered part — the last one wins if several are declared. */
export declare function partOne<T>(registry: ChartRegistry | null, kind: ChartPartKind): T | undefined;
/**
 * Keeps one part's configuration current for as long as it is mounted.
 *
 * A watchEffect rather than a one-time register: a part's props are reactive, so
 * `<ApexChartSeries :data="rows">` has to follow `rows` the same way the
 * `series` prop does.
 */
export declare function useChartPart(kind: ChartPartKind, config: () => unknown): void;
