/*
 * AF2-218: our components against the ORIGINAL Vue source.
 *
 * Everything up to now compared documentation: reconcile.mjs reads Pando's
 * docs registry and the gallery's headings, and menu-pack-sweep.mjs reads the
 * props tables. None of that looks at the component. A control could document
 * a prop the gallery documents, render the section the gallery renders, and
 * still behave differently, because nothing ever compared the code.
 *
 * It turns out it can be compared: Pando carries the real package source at
 * packages/apex-ui/src — the .vue files these were ported FROM, not a built
 * bundle. So this diffs ours against those, line for line.
 *
 * Ours have deliberately diverged: every gated control gained the permission
 * filter, ApexBreadcrumb gained CrumbItem, and a handful of defects were fixed
 * on import. Those are listed below with the task that made them. Anything
 * else is drift and gets printed as a diff for a human to judge — this is a
 * report, not a gate, because a divergence is not automatically wrong.
 *
 *   node scripts/source-diff.mjs            # the menu family
 *   node scripts/source-diff.mjs ApexInput  # or anything by name
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OURS = path.join(HERE, '..', 'src');
const THEIRS = 'C:/WorkFolder/APEX Digital Signage/Digital Singage/Apex Pando V01/rizorsi/template/packages/apex-ui/src';

/** The menu pack, plus the two action controls the pack gated. */
const FAMILY = [
  'components/ApexSidebar.vue', 'components/ApexSidebarLayout.vue',
  'components/ApexSidebarInset.vue', 'components/ApexSidebarTrigger.vue',
  'components/ApexMenu.vue', 'components/ApexMenuNode.vue',
  'components/ApexMenuItem.vue', 'components/ApexTieredMenu.vue',
  'components/ApexMenubar.vue', 'components/ApexMegaMenu.vue',
  'components/ApexDock.vue', 'components/ApexContextMenu.vue',
  'components/ApexBreadcrumb.vue', 'components/ApexSplitButton.vue',
  'components/ApexSpeedDial.vue', 'components/ApexToolbar.vue',
  'core/sidebar.ts', 'core/speedDial.ts',
];

/**
 * Divergences we made on purpose, each with the task that made it. A file
 * whose only added lines match one of these is reported as expected.
 *
 * Kept as line matchers rather than a per-file allow-list: the point is to
 * name WHY a line is there, so a line nobody can account for stands out even
 * in a file that legitimately changed.
 */
const INTENDED = [
  { why: 'AF2-198…205: the permission filter', test: (l) => /useCan|filterMenu|filterItems|filterMega|menuPermissions|ApexPermission|\bshown\b|\bcan\??[:,)]|can\.|, can\b|items \|\| \[\]/.test(l) },
  { why: 'AF2-203: CrumbItem, and the breadcrumb’s `to`', test: (l) => /CrumbItem|MenuItem|linkComponent|markRaw|toRaw|cutShort|walkable|isCurrent|\bfull\b|\blist\b|\bto\?:|label\?|icon\?|href\?|target\?|disabled\?|current\?|command\?|\[key: string\]|^\s*\}$|home\?|items\?/.test(l) },
  { why: 'AF2-167: absent booleans arrive false, not undefined', test: (l) => /open: undefined/.test(l) },
  { why: 'AF2-200: the `padding` the original declares twice in one interface', test: (l) => /padding/.test(l) },
  { why: 'AF2-133/143/169: the ui class map', test: (l) => /\bui\?\.|ui\?:|ApexUiClasses|ApexContainerClasses|ApexDisplayClasses/.test(l) },
  { why: 'AF2-62/64/67/68: the shared appearance props and their style block', test: (l) => /ApexButtonAppearance|ApexContainerProps|ApexDisplayProps|(menu|action)[A-Z]\w*\?:|withDefaults\(defineProps<|btnStyle|Record<string, string>|Array<\[string \| undefined, string\]>|map\.forEach|^\s*(out|return out|\]|\);|\}\);)/.test(l) },
  { why: 'AF2-203: the breadcrumb’s routing helpers, and hiding an empty trail', test: (l) => /hrefFor|isRouted|linkAs|tagFor|all\.length|entry\.item|item\.to\b/.test(l) },
  { why: 'AF2-131/141/170: variables renamed to --apex-*', test: (l) => /--apex-[a-z]+-/.test(l) || /--(tbar|mnu|sbar|bc|dial|dock|mbar|mega)-/.test(l) },
  { why: 'AF2-202: the watch that closes a group the filter emptied', test: (l) => /^import \{ computed, ref(, watch)? \} from 'vue';$/.test(l.trim()) },
];

/**
 * Comments out, before diffing.
 *
 * Nearly every port added a comment explaining a decision, and a comment is
 * not behaviour. Left in, they were most of the report — and a continuation
 * line inside a block reads as prose, so no line-shaped rule catches them
 * reliably. Stripping makes the report about code, which is the only part
 * that can be a defect. Quotes are tracked so a `//` inside a string, or the
 * `/*` in a regex, does not eat the rest of the file.
 */
function stripComments(src) {
  /* Ours are CRLF and the originals LF, so without this every line of every
     file differs and the report is 100% noise — which is exactly how
     core/speedDial.ts first came back as 104 changed lines that were, on both
     sides, the same lines. */
  src = src.replace(/\r\n/g, '\n');
  /* Template comments too — <!-- … --> is prose in the same way, and the
     block-comment scanner below never sees inside a <template>. */
  src = src.replace(/<!--[\s\S]*?-->/g, '');
  let out = '';
  let quote = null;
  let comment = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (comment === 'line') { if (c === '\n') { comment = null; out += c; } continue; }
    if (comment === 'block') { if (c === '*' && src[i + 1] === '/') { comment = null; i++; } else if (c === '\n') out += c; continue; }
    if (quote) {
      out += c;
      if (c === '\\') { out += src[++i]; } else if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && src[i + 1] === '*') { comment = 'block'; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { quote = c; }
    out += c;
  }
  /* Lines that held nothing but a comment are now blank; drop them so the
     diff does not report the hole where one used to be. */
  return out.split('\n').filter((l) => l.trim() !== '').join('\n');
}

const wanted = process.argv.slice(2);
const files = wanted.length
  ? FAMILY.filter((f) => wanted.some((w) => f.includes(w)))
  : FAMILY;

let identical = 0;
let explained = 0;
const unexplained = [];

for (const rel of files) {
  const a = path.join(THEIRS, rel);
  const b = path.join(OURS, rel);
  if (!fs.existsSync(a)) { console.log(`—     ${rel}  (ours only — nothing to compare)`); continue; }
  if (!fs.existsSync(b)) { console.log(`GONE  ${rel}  (in the original, absent here)`); unexplained.push(rel); continue; }

  const tmp = path.join(HERE, '..', 'node_modules', '.cache');
  fs.mkdirSync(tmp, { recursive: true });
  const [ta, tb] = ['a', 'b'].map((s) => path.join(tmp, `srcdiff-${s}-${path.basename(rel)}`));
  fs.writeFileSync(ta, stripComments(fs.readFileSync(a, 'utf8')));
  fs.writeFileSync(tb, stripComments(fs.readFileSync(b, 'utf8')));

  let diff = '';
  try {
    /* stderr swallowed: git narrates a CRLF warning per file, which would be
       most of this script's output and none of its findings. */
    execFileSync('git', ['diff', '--no-index', '--unified=0', ta, tb],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    diff = e.stdout || '';           /* git exits 1 when files differ */
  }
  if (!diff.trim()) { identical++; console.log(`ok    ${rel}`); continue; }

  /*
   * Judged on the lines WE wrote — the `+` side.
   *
   * A line we edited appears twice, once as the original and once as ours;
   * accounting for our version accounts for the pair, and judging the
   * original's half as well just reports every edit twice, in a form where
   * the reason is on the other line. Deletions are still counted and shown,
   * because dropping something the original had is a different failure and
   * the one this script would otherwise be blind to.
   */
  const rows = diff.split('\n').filter((l) => /^[+-]/.test(l) && !/^[+-]{3}/.test(l));
  const added = rows.filter((l) => l[0] === '+').map((l) => l.slice(1));
  const removed = rows.filter((l) => l[0] === '-').map((l) => l.slice(1));
  const gone = removed.filter((r) => !added.some((a) => a.trim() === r.trim()));

  const odd = added.filter((l) => !INTENDED.some((r) => r.test(l)));
  if (!odd.length) {
    explained++;
    console.log(`ok    ${rel}  — ${added.length} line(s) of ours, all accounted for`
      + (gone.length ? `; ${gone.length} of the original's dropped` : ''));
    continue;
  }

  unexplained.push(rel);
  console.log(`DIFF  ${rel}  — ${odd.length} line(s) nothing accounts for:`);
  odd.slice(0, 20).forEach((l) => console.log(`        ${l.trim()}`));
  if (odd.length > 20) console.log(`        … and ${odd.length - 20} more`);
}

console.log(`\n${identical} identical, ${explained} changed on purpose, ${unexplained.length} to look at.`);
if (unexplained.length) console.log(`  ${unexplained.join('\n  ')}`);
