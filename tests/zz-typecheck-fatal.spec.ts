import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';

/*
 * Typecheck classes that mean the code is broken, not merely untidy.
 *
 * This exists because of how the ApexTaskBoard drag bug shipped. vue-tsc had
 * been reporting
 *
 *   ApexTaskBoard.vue(341): TS18004: No value exists in scope for the
 *   shorthand property 'index'
 *
 * for the whole batch. TS18004 is a guaranteed ReferenceError — the identifier
 * does not exist — and dragging a card threw on the first pointermove, on
 * every board. It was reported after every task as "typecheck 86 / 14 TS7016",
 * a number that stayed stable while nobody read what was in it. A delta check
 * against an unexamined pool is not a check.
 *
 * So the fatal classes get a test rather than a tally. The rest of the count
 * stays as it is: unused imports and the missing dist .d.ts are real backlog,
 * but neither can throw, and folding them in here would make the gate
 * unpassable and therefore ignored — which is the failure this replaces.
 */

/** Each one means: this identifier or value is not there at runtime. */
const FATAL: Record<string, string> = {
  TS18004: 'shorthand property with no value in scope',
  TS2304: 'cannot find name',
  TS2552: 'cannot find name (did you mean …)',
  TS2448: 'block-scoped variable used before its declaration',
  TS2454: 'variable used before being assigned',
  TS2532: 'object is possibly undefined',
  TS2531: 'object is possibly null',
};

describe('no typecheck error that guarantees a runtime failure', () => {
  it('vue-tsc reports none of the fatal classes', () => {
    /* vitest runs from the package root. __dirname is not defined under this
       module config — which this gate caught in its own first run. */
    let out = '';
    try {
      execFileSync('npx', ['vue-tsc', '--noEmit', '-p', 'tsconfig.json'], {
        cwd: process.cwd(), encoding: 'utf8', shell: true,
      });
    } catch (e) {
      /* vue-tsc exits non-zero whenever it reports anything at all, including
         the tolerated classes, so its output is read either way. */
      out = (e as { stdout?: string }).stdout || '';
    }

    const found = out.split('\n')
      .filter((l) => Object.keys(FATAL).some((c) => l.includes(`error ${c}:`)))
      .map((l) => l.trim());

    expect(found, found.length
      ? `these guarantee a runtime failure:\n  ${found.join('\n  ')}`
      : '').toEqual([]);
  }, 240_000);
});
