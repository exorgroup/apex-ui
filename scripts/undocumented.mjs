/*
 * Props a component has but its page never mentions.
 *
 * The AF2-153 vitest guard checks the opposite direction — every documented
 * prop must exist — which catches a lie but not a silence. A prop that works,
 * is useful, and appears nowhere in the docs is invisible to every check we
 * have, and to every reader.
 *
 *   node scripts/undocumented.mjs [id ...]
 *
 * Reported rather than enforced. Some absences are deliberate: props inherited
 * from a shared interface are documented once on ApexField, and a few are
 * genuinely internal. The output is a list to judge, not a build gate.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { entryBlock, rows } from './reconcile.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'src');
const LIB = path.join(HERE, '..', '..', 'apex-ui', 'src', 'components');

const registry = fs.readFileSync(path.join(SRC, 'registry.ts'), 'utf8');
const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...registry.matchAll(/^\s*id:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);

/** Props documented once on ApexField and inherited by every field control. */
const SHARED = new Set([
  'modelValue', 'label', 'labelPlacement', 'labelWidth', 'hideLabel', 'help', 'error',
  'warning', 'success', 'required', 'disabled', 'readonly', 'size', 'invalid', 'name',
  'id', 'placeholder', 'rules', 'tone', 'ui', 'floatLabel', 'fluid', 'labelColor',
  'controlBackground', 'controlBorder', 'controlColor', 'radius', 'width',
]);

let total = 0;
for (const id of ids) {
  const block = entryBlock(registry, id);
  if (!block) continue;
  const name = (block.match(/name:\s*'([^']+)'/) || [])[1];
  const file = path.join(LIB, `${name}.vue`);
  if (!fs.existsSync(file)) continue;   // directives and foundations pages

  const src = fs.readFileSync(file, 'utf8');
  const propsBlock = (src.match(/defineProps<([\s\S]*?)>\(\)/) || [])[1] || '';
  const declared = [...propsBlock.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??\s*:/gm)].map((m) => m[1]);
  if (!declared.length) continue;

  /* Documented if the name appears anywhere in the entry — its own row, a
     merged row, or a description. A prop named in prose is not undocumented. */
  const documented = new Set();
  for (const field of ['props', 'events', 'slots', 'serviceRows']) {
    for (const row of rows(block, field)) {
      for (const cell of row) for (const w of cell.match(/[a-zA-Z][a-zA-Z0-9]*/g) || []) documented.add(w);
    }
  }

  const missing = declared.filter((p) => !documented.has(p) && !SHARED.has(p));
  if (!missing.length) continue;
  total += missing.length;
  console.log(`${name}: ${missing.join(', ')}`);
}

console.log(`\n${total} declared prop(s) named nowhere on their page.`);
