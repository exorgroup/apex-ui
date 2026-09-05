/*
 * AF2-216: the menu pack, row by row, untruncated.
 *
 * reconcile.mjs answers the question that matters — does a ported control
 * LACK anything the gallery had — and for this pack it answers no. What it
 * cannot do is show you WHY a row is marked "changed": it prints the first
 * hundred characters of each side, and every row in this pack differs near
 * the end of a long description, exactly where the truncation falls. Read
 * that output and eleven controls look plausibly fine; the one thing you
 * cannot see is the part that changed.
 *
 * So this prints the full text of both sides of every changed row, for the
 * eleven controls in the menu pack, and asserts what each difference is
 * allowed to be: the `can` field the gallery never had, and — on the
 * breadcrumb alone — the CrumbItem rename and its `to`.
 *
 * It also prints the row counts it pulled per control. reconcile-selfcheck
 * covers the nine containers; a parser that returned nothing for THESE
 * eleven would report them all "ok" and this sweep would agree with it.
 *
 *   node scripts/menu-pack-sweep.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { entryBlock, rows, controlKeys } from './reconcile.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PANDO = 'C:/WorkFolder/APEX Digital Signage/Digital Singage/Apex Pando V01/rizorsi/template';

const gallery = fs.readFileSync(path.join(PANDO, 'web', 'apex-ui-docs.js'), 'utf8');
const ours = fs.readFileSync(path.join(HERE, '..', 'src', 'registry.ts'), 'utf8');

/** The pack: the eight new pages, plus the three that were gated afterwards. */
const PACK = [
  'tieredmenu', 'menubar', 'menu', 'megamenu', 'dock', 'contextmenu',
  'breadcrumb', 'sidebar', 'splitbutton', 'speeddial', 'toolbar',
];

/**
 * Fields we added to an item type that the gallery's has no equivalent of.
 * Stripped from inside a `{ … }` shape only, never from prose — "to" is a
 * word as well as a field, and a blanket replace would quietly rewrite
 * descriptions instead of comparing them.
 */
const ADDED_FIELDS = new Set(['can', 'to']);

/** Drop the added fields from every `{ … }` group in a cell. */
function stripAdded(text) {
  return text.replace(/\{[^{}]*\}/g, (group) => {
    const kept = group.slice(1, -1).split(',')
      .filter((part) => !ADDED_FIELDS.has(part.trim().replace(/\?$/, '').split(':')[0].trim()));
    return `{${kept.join(',')}}`;
  });
}

/**
 * The deliberate changes, applied cumulatively: normalise ours back towards
 * the gallery's wording, and whatever still differs is drift.
 *
 * Each entry says what it undoes, so the report names the reason rather than
 * merely passing. A rule that stops applying to any row is dead weight and is
 * reported at the end — an allowance nothing needs is an allowance that has
 * silently started excusing something else.
 */
const RULES = [
  {
    why: 'the fields we added to the item type — `can`, and the breadcrumb’s `to`',
    apply: stripAdded,
  },
  {
    why: 'CrumbItem — AF2-203 gave the breadcrumb its own item type',
    apply: (t) => t.replace(/CrumbItem/g, 'MenuItem'),
  },
  {
    /* Not a field but a correction: the gallery's own component counts `home`
       as the first crumb for maxItems, and its table never said so. */
    why: 'the note that `home` counts as the first crumb',
    apply: (t) => t.replace('. It counts as the first crumb', ''),
  },
];

/*
 * The three tables are rows of cells. `controls` is NOT — it is a list of
 * objects, so rows() finds no [ … ] rows in it and returns a count of
 * whatever nested arrays it does find, which is the `options` on a select.
 * Counting those and calling them controls is exactly the inert-parser
 * failure this sweep prints counts to catch, so controls go through
 * controlKeys and are counted, not diffed — reconcile already reports a key
 * we lack.
 */
const FIELDS = ['props', 'events', 'slots'];
let unexplained = 0;

console.log('control          props g/o  events g/o  slots g/o  controls g/o');
for (const id of PACK) {
  const g = entryBlock(gallery, id);
  const o = entryBlock(ours, id);
  if (!o) { console.log(`  ${id}  — no entry of ours`); unexplained++; continue; }
  if (!g) { console.log(`  ${id}  — nothing in the gallery to compare`); continue; }

  const counts = FIELDS.map((f) => `${rows(g, f).length}/${rows(o, f).length}`);
  counts.push(`${controlKeys(g).length}/${controlKeys(o).length}`);
  console.log(`  ${id.padEnd(15)}${counts[0].padStart(8)}${counts[1].padStart(12)}${counts[2].padStart(11)}${counts[3].padStart(14)}`);
}

console.log('\nEvery row the gallery and we both have, where the text differs:\n');
for (const id of PACK) {
  const g = entryBlock(gallery, id);
  const o = entryBlock(ours, id);
  if (!g || !o) continue;

  for (const field of FIELDS) {
    const mine = new Map(rows(o, field).map((r) => [r[0], r]));
    for (const row of rows(g, field)) {
      const ours_ = mine.get(row[0]);
      if (!ours_) continue;                       // reconcile reports absences
      const a = row.join(' | ');
      const b = ours_.join(' | ');
      if (a === b) continue;

      /* Apply every rule, and keep the ones that actually moved this row —
         so the reason printed is the reason, not the whole list. */
      const used = [];
      let normalised = b;
      for (const rule of RULES) {
        const next = rule.apply(normalised);
        if (next !== normalised) { used.push(rule); normalised = next; }
      }
      used.forEach((r) => r.fired = true);

      /* Dropping a field leaves the spacing around the brace different from
         the gallery's. That is the strip's own doing, not a difference in the
         text, so the comparison ignores whitespace next to the punctuation. */
      const squash = (t) => t.replace(/\s+/g, ' ').replace(/\s*([{},])\s*/g, '$1');
      const ok = squash(normalised) === squash(stripAdded(a));
      console.log(`${ok ? 'ok  ' : 'DRIFT'}  ${id}.${field}.${row[0]}`);
      if (ok) { used.forEach((r) => console.log(`        ${r.why}`)); continue; }
      unexplained++;
      console.log(`        gallery: ${a}`);
      console.log(`        ours:    ${b}`);
      console.log(`        left over after every allowance: ${normalised}`);
    }
  }
}

const idle = RULES.filter((r) => !r.fired);
if (idle.length) {
  console.log('\nAllowances no row needed — delete them, or find out what changed:');
  idle.forEach((r) => console.log(`  ${r.why}`));
}

console.log(unexplained
  ? `\n${unexplained} difference(s) nothing accounts for.`
  : '\nEvery difference in the pack is one we made on purpose.');
process.exit(unexplained || idle.length ? 1 : 0);
