/*
 * AF2-235: what does a control actually cost in the bundle?
 *
 * The question this answers is not "how big is ApexChart.vue" — source lines
 * say nothing about shipped bytes once a bundler has been over them, and the
 * chart pulls in eight core/chart modules that no line count of the component
 * would show.
 *
 * Method: build the library, then build it again with the control's exports
 * removed from src/index.ts, and diff. Whatever the second build is smaller
 * by is what that control costs a consumer who cannot avoid it — which is
 * every consumer today, because the plugin registers all components.
 *
 * Both raw and gzip are reported. Raw is what the disk holds; gzip is what
 * crosses the wire, and the two disagree enough on repetitive code to matter.
 *
 *   node scripts/bundle-share.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const INDEX = path.join(ROOT, 'src', 'index.ts');
const DIST = path.join(ROOT, 'dist');

/**
 * A cut: the name, and the lines of src/index.ts it removes.
 *
 * Matched on the line, not on a module graph, because the point is to
 * reproduce exactly what a consumer would drop — the export and the plugin
 * registration. Anything only that control reached falls out on its own.
 */
const CUTS = [
  {
    name: 'ApexChart (component + its 11 core/chart modules)',
    test: (l) => /ApexChart|core\/chart/.test(l),
  },
  {
    name: 'ApexTaskBoard + ApexTaskCard',
    test: (l) => /ApexTaskBoard|ApexTaskCard|core\/taskboard/.test(l),
  },
  {
    name: 'ApexDataTable',
    test: (l) => /ApexDataTable|core\/dataTable/.test(l),
  },
];

/**
 * Remove every statement the cut names, whole.
 *
 * Cutting by line looked right and was not: the chart's parts arrive in a
 * multi-line `import { … } from './core/chart/parts'`, so dropping the lines
 * that mention ApexChart left the braces open and the build died on the NEXT
 * import. A statement runs from a line beginning `import`/`export` to the
 * line that closes it, and either all of it goes or none does.
 *
 * A line inside the components map is not a statement, so it is judged alone.
 */
function cutStatements(src, test) {
  /*
   * Only an import or a re-export is treated as multi-line.
   *
   * `export const ApexUI = { install(app) { … } }` also begins with `export`,
   * and it CONTAINS the components map — so joining it into one statement made
   * `Chart: ApexChart` inside it condemn the entire plugin. Every cut then
   * reported ~90% of the bundle, which is how the first run was caught: three
   * controls cannot each be nine tenths of it.
   *
   * A line of an object literal is safely removed on its own, so everything
   * that is not a module statement is judged line by line.
   */
  const isModuleStatement = (l) =>
    /^\s*import\b/.test(l) || (/^\s*export\b/.test(l) && !/=/.test(l));

  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!isModuleStatement(lines[i])) {
      if (!test(lines[i])) out.push(lines[i]);
      continue;
    }
    const stmt = [lines[i]];
    while (!/;\s*$/.test(stmt[stmt.length - 1]) && i + 1 < lines.length) {
      stmt.push(lines[++i]);
    }
    if (!stmt.some(test)) out.push(...stmt);
  }
  return out.join('\n');
}

const build = () => {
  execFileSync('npx', ['vite', 'build'], { cwd: ROOT, stdio: 'ignore', shell: true });
  const js = fs.readFileSync(path.join(DIST, 'apex-ui.js'));
  return { raw: js.length, gz: zlib.gzipSync(js, { level: 9 }).length };
};

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const pct = (part, whole) => `${((part / whole) * 100).toFixed(1)}%`;

/**
 * The second question: what would a per-family split save?
 *
 * A cut cannot answer it — ApexChart.vue imports these modules, so removing
 * them stops the build. Replacing them with stubs of the same shape does: the
 * component still compiles, the subgraph still drops out, and the difference
 * is what those families cost.
 *
 * This is a FLOOR, not the saving. It measures the family-specific core
 * modules only. The branches inside ApexChart.vue that render a heatmap or a
 * candle series stay in the bundle, and they cannot be separated until the
 * split in AF2-236 actually exists — measuring them before then would mean
 * guessing, and a guessed number in a decision document is worse than a
 * bounded one.
 */
const STUBS = [
  {
    name: 'heatmap + candlestick + treemap (core/chart/special.ts)',
    file: path.join(ROOT, 'src', 'core', 'chart', 'special.ts'),
    stub: `/* stubbed by scripts/bundle-share.mjs */
export type HeatCell = Record<string, unknown>;
export type HeatGrid = Record<string, unknown>;
export type Candle = Record<string, unknown>;
export type CandleGeometry = Record<string, unknown>;
export type TreeNode = Record<string, unknown>;
export type TreeTile = Record<string, unknown>;
export const heatGrid = (): never => { throw new Error('stub'); };
export const heatIntensity = (): never => { throw new Error('stub'); };
export const heatBand = (): never => { throw new Error('stub'); };
export const candleTones = (): never => { throw new Error('stub'); };
export const candleGeometry = (): never => { throw new Error('stub'); };
export const treemapLayout = (): never => { throw new Error('stub'); };
`,
  },
  {
    /* The decisive one. The cut above says the chart costs 155.6 kB; this says
       how much of that is the component itself rather than the core modules
       it draws on, because only the component's half can be split by family. */
    name: 'ApexChart.vue itself (the component, not core/chart)',
    file: path.join(ROOT, 'src', 'components', 'ApexChart.vue'),
    stub: `<script setup lang="ts">
/* stubbed by scripts/bundle-share.mjs */
defineProps<{ type?: string }>();
</script>

<template><div class="apex-cht" /></template>
`,
  },
  {
    name: 'leader labels (core/chart/leaders.ts)',
    file: path.join(ROOT, 'src', 'core', 'chart', 'leaders.ts'),
    stub: `/* stubbed by scripts/bundle-share.mjs */
export type LeaderLabel = Record<string, unknown>;
export type LeaderInput = Record<string, unknown>;
export const leaderLabels = (): never => { throw new Error('stub'); };
`,
  },
];

const original = fs.readFileSync(INDEX, 'utf8');
/** Files swapped for a stub right now, so the finally can put them back. */
const stubbed = new Map();
let base;
try {
  console.log('building the library as it stands…');
  base = build();
  console.log(`  baseline  ${kb(base.raw)} raw, ${kb(base.gz)} gzip\n`);

  for (const cut of CUTS) {
    const kept = cutStatements(original, cut.test);
    fs.writeFileSync(INDEX, kept);
    let without;
    try {
      without = build();
    } catch {
      console.log(`SKIP  ${cut.name} — the build fails without it, so the cut is not clean`);
      continue;
    } finally {
      /* Put it back before the next measurement. Leaving the last cut in place
         made every stub below read ~50 kB too large — a constant offset that
         looked like a plausible number, which is the dangerous kind of wrong:
         a 106-line module was reported at 51.6 kB and only a hand measurement
         (1.2 kB) showed it up. */
      fs.writeFileSync(INDEX, original);
    }
    const raw = base.raw - without.raw;
    const gz = base.gz - without.gz;
    console.log(`${cut.name}`);
    console.log(`  raw   ${kb(raw)}  (${pct(raw, base.raw)} of the bundle)`);
    console.log(`  gzip  ${kb(gz)}  (${pct(gz, base.gz)} of the bundle)\n`);
  }
  console.log('— what a per-family split would save, measured as a floor —\n');
  for (const s of STUBS) {
    const real = fs.readFileSync(s.file, 'utf8');
    stubbed.set(s.file, real);
    fs.writeFileSync(s.file, s.stub);
    let without;
    try {
      without = build();
    } catch {
      console.log(`SKIP  ${s.name} — the stub does not satisfy its callers`);
    }
    fs.writeFileSync(s.file, real);
    stubbed.delete(s.file);
    if (!without) continue;
    const raw = base.raw - without.raw;
    const gz = base.gz - without.gz;
    console.log(`${s.name}`);
    console.log(`  raw   ${kb(raw)}  (${pct(raw, base.raw)} of the bundle)`);
    console.log(`  gzip  ${kb(gz)}  (${pct(gz, base.gz)} of the bundle)\n`);
  }
} finally {
  /* Always put every file back, even on a throw — a half-cut index or a
     stubbed module is a silently broken library, and the next build would
     bake it into dist. */
  for (const [file, real] of stubbed) fs.writeFileSync(file, real);
  fs.writeFileSync(INDEX, original);
  console.log('src/index.ts restored; rebuilding dist from it…');
  build();
}
