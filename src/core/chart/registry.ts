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
import { inject, onBeforeUnmount, provide, reactive, watchEffect, type InjectionKey } from 'vue';

export type ChartPartKind =
  | 'series' | 'xAxis' | 'yAxis' | 'y2Axis' | 'legend' | 'tooltip' | 'hover'
  | 'title' | 'caption' | 'navigator' | 'zoom' | 'referenceLine' | 'referenceBand'
  | 'dataLabels';

export interface ChartRegistry {
  /** kind → key → config. Maps, so declaration order survives. */
  parts: Record<string, Map<string, unknown>>;
  set(kind: ChartPartKind, key: string, config: unknown): void;
  remove(kind: ChartPartKind, key: string): void;
}

export const CHART_REGISTRY_KEY: InjectionKey<ChartRegistry> = Symbol('apex-chart-registry');

export function createChartRegistry(): ChartRegistry {
  const parts = reactive<Record<string, Map<string, unknown>>>({});
  return {
    parts,
    set(kind, key, config) {
      if (!parts[kind]) parts[kind] = new Map();
      /* Mutated in place, never replaced.
       *
       * This used to reassign `parts[kind] = new Map(parts[kind])` on every
       * write, on the theory that a computed reading .values() needed a new
       * reference to re-evaluate. It does not — a reactive Map tracks
       * iteration, which is what partList does — and the reassignment was an
       * infinite loop waiting for a second part: each part registers inside a
       * watchEffect that reads `parts[kind]`, so A's write invalidated B's
       * effect, B's write invalidated A's, forever. One compound part alone
       * never tripped it, because Vue does not re-run an effect on its own
       * write. Two did: "Maximum recursive updates exceeded".
       */
      parts[kind].set(key, config);
    },
    remove(kind, key) {
      if (!parts[kind]) return;
      parts[kind].delete(key);
    },
  };
}

export function provideChartRegistry(registry: ChartRegistry) {
  provide(CHART_REGISTRY_KEY, registry);
}

/** Reads a registered list in declaration order. */
export function partList<T>(registry: ChartRegistry | null, kind: ChartPartKind): T[] {
  const map = registry?.parts[kind];
  return map ? (Array.from(map.values()) as T[]) : [];
}

/** Reads a single registered part — the last one wins if several are declared. */
export function partOne<T>(registry: ChartRegistry | null, kind: ChartPartKind): T | undefined {
  const list = partList<T>(registry, kind);
  return list.length ? list[list.length - 1] : undefined;
}

let seq = 0;

/**
 * Keeps one part's configuration current for as long as it is mounted.
 *
 * A watchEffect rather than a one-time register: a part's props are reactive, so
 * `<ApexChartSeries :data="rows">` has to follow `rows` the same way the
 * `series` prop does.
 */
export function useChartPart(kind: ChartPartKind, config: () => unknown) {
  const registry = inject(CHART_REGISTRY_KEY, null);
  if (!registry) return;
  const key = `${kind}-${(seq += 1)}`;
  watchEffect(() => registry.set(kind, key, config()));
  onBeforeUnmount(() => registry.remove(kind, key));
}
