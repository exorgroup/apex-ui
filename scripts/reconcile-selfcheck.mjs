/*
 * Proves the reconciler actually extracts something.
 *
 * A comparison script that silently parses nothing reports every control as
 * "ok" and is worse than no script at all, because it manufactures
 * confidence. Two of the guards in this project have already been caught
 * being inert, so the reconciler does not get to be trusted on its say-so.
 *
 * The check: re-derive the gallery's example headings for the nine container
 * controls and require them to contain the list in tests/zz-docs-pages.spec.ts
 * — a map that was read off the gallery by hand and has since been verified
 * against the rendered page. If the extractor agrees with that independent
 * reading, it works. It also prints the row counts it pulled from every
 * table, so a zero is visible rather than hidden behind a passing diff.
 *
 *   node scripts/reconcile-selfcheck.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { headings, rows, entryBlock, controlKeys } from './reconcile.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'src');
const PANDO = 'C:/WorkFolder/APEX Digital Signage/Digital Singage/Apex Pando V01/rizorsi/template';

const galleryHtml = fs.readFileSync(path.join(PANDO, 'APEX UI Gallery.html'), 'utf8');
const galleryJs = fs.readFileSync(path.join(PANDO, 'web', 'apex-ui-docs.js'), 'utf8');
const ourApp = fs.readFileSync(path.join(SRC, 'App.vue'), 'utf8');
const ourRegistry = fs.readFileSync(path.join(SRC, 'registry.ts'), 'utf8');

/* Copied from tests/zz-docs-pages.spec.ts in the library repo — an
   independent, hand-made reading of the same gallery. */
const HAND_VERIFIED = {
  toolbar: ['Basic', 'Sizes and chrome', 'Centred content', 'Custom — navigation bar', 'Sticky and wrapping'],
  tabs: ['Basic and dynamic', 'Controlled', 'Scrollable', 'Select on focus', 'Lazy', 'Disabled',
    'Variants and placement', 'Badges and custom indicator', 'Template', 'Tab menu'],
  steps: ['Horizontal', 'Vertical', 'Linear', 'Steps only', 'Template', 'Events', 'Sizes and colours'],
  splitter: ['Basic and vertical', 'Sizes, minimum and maximum', 'Collapsible', 'Nested',
    'Resize events', 'Stateful', 'Disabled and custom', 'Advanced'],
  panel: ['Basic', 'Toggleable', 'Controlled', 'Indicator', 'Header and footer templates', 'Sizes, colours and flush'],
  fieldset: ['Basic', 'Toggleable', 'Controlled', 'Indicator', 'Alignment, sizes and colours', 'Disabled'],
  card: ['Basic', 'With media', 'Advanced header — media plus an overlaid avatar', 'As a form container',
    'Horizontal and clickable'],
  accordion: ['Basic and multiple', 'Controlled', 'Indicator and trigger', 'Rich headers and content',
    'Disabled, sizes and separated cards', 'Dynamic panels and lazy content', 'Keyboard'],
  scrollarea: ['Vertical', 'Horizontal', 'Both axes', 'Scroll fade', 'Variants', 'Custom bars', 'Inside a panel'],
};

let bad = 0;

console.log('headings extracted from the gallery vs the hand-verified list\n');
console.log('control       gallery  ours   verdict');
for (const [id, expected] of Object.entries(HAND_VERIFIED)) {
  const fromGallery = headings(galleryHtml, id);
  const fromOurs = headings(ourApp, id);
  const missed = expected.filter((h) => !fromGallery.includes(h));
  if (missed.length || !fromGallery.length) bad++;
  console.log(
    '  ' + id.padEnd(12),
    String(fromGallery.length).padStart(5),
    String(fromOurs.length).padStart(6),
    '  ' + (missed.length ? 'EXTRACTOR MISSED: ' + missed.join(', ') : fromGallery.length ? 'agrees' : 'EXTRACTED NOTHING'),
  );
}

console.log('\nrows pulled from each table — a column of zeros would mean the parser is inert\n');
console.log('control       props g/o  events g/o  slots g/o  controls g/o');
for (const id of Object.keys(HAND_VERIFIED)) {
  const g = entryBlock(galleryJs, id);
  const o = entryBlock(ourRegistry, id);
  if (!g || !o) { console.log('  ' + id.padEnd(12), 'NO ENTRY BLOCK FOUND'); bad++; continue; }
  const n = (b, f) => rows(b, f).length;
  if (!n(g, 'props') || !n(o, 'props')) bad++;
  console.log(
    '  ' + id.padEnd(12),
    `${n(g, 'props')}/${n(o, 'props')}`.padStart(9),
    `${n(g, 'events')}/${n(o, 'events')}`.padStart(11),
    `${n(g, 'slots')}/${n(o, 'slots')}`.padStart(10),
    `${controlKeys(g).length}/${controlKeys(o).length}`.padStart(13),
  );
}

console.log(bad ? `\n${bad} problems — the reconciler cannot be trusted as is.` : '\nThe reconciler extracts what it claims to.');
process.exit(bad ? 1 : 0);
