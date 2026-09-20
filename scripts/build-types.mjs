/**
 * Emit the library's type declarations, and decide what counts as a failed build.
 *
 * ## Why this is a script and not just `vue-tsc` in a pipeline
 *
 * TypeScript emits declarations even when the program has errors — `noEmitOnError` is false by
 * default — but `vue-tsc` still exits 1. Chained with `&&`, that made `npm run build` fail while
 * having produced perfectly good output, which is why this package shipped without declarations
 * for its whole life: the command "failed", so nobody looked in `dist`.
 *
 * Two error classes, and they deserve opposite answers:
 *
 *   FATAL     the declaration could not be written. TS4023 is the one that bit here — an
 *             exported value whose inferred type names something that is not exported, so the
 *             emitter has no way to write it down and skips the file. `dist/index.d.ts` simply
 *             did not exist, and `package.json` pointed `types` at it anyway.
 *   COSMETIC  the declaration was written, and somewhere inside it a type is wider than its
 *             author meant. A consumer gets working IntelliSense with a soft edge.
 *
 * So the rule is not "did vue-tsc exit 0" — it is **did the entry declaration get written**.
 * That is the thing a consumer actually depends on, and it is checkable.
 *
 * The cosmetic errors are NOT swallowed: they are counted and printed every build, and
 * `npm run typecheck` still reports them in full. Making them block a release would mean no
 * releases until somebody has spent a day inside ApexChart, and shipping no types at all is a
 * worse answer to that than shipping types with a known list of soft spots.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const ENTRY = resolve('dist/index.d.ts');

/* `shell: true` so this finds `vue-tsc` from node_modules/.bin on Windows too, where the
   executable is a .cmd and spawn without a shell will not run it. */
const run = spawnSync('npx vue-tsc -p tsconfig.build.json', {
  shell: true,
  encoding: 'utf8',
});

const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
const errors = output.split('\n').filter((line) => /error TS\d+/.test(line));

if (!existsSync(ENTRY) || statSync(ENTRY).size === 0) {
  console.error(output);
  console.error(
    '\n✗ No declarations were written.\n'
    + `  ${ENTRY} is missing or empty, and package.json points "types" at it.\n`
    + '  Look for TS4023 above: an exported value using a type that is not exported.\n'
    + '  Export the type it names — that is what lets the emitter write it down.',
  );
  process.exit(1);
}

if (errors.length) {
  console.warn(output);
  console.warn(
    `\n! Declarations were written with ${errors.length} type error(s) above.\n`
    + '  They did not stop the emit, so the build stands and consumers get types.\n'
    + '  They are real debt: run `npm run typecheck` to see them on their own.',
  );
} else {
  console.log('✓ Declarations emitted with no type errors.');
}
