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
  /* AF2-227…239: the media, board and chart controls, which diverge from the
     original as each is normalised onto our ui map and --apex-* variables. */
  'components/ApexCompare.vue', 'components/ApexCompareItem.vue',
  'components/ApexCarousel.vue', 'components/ApexCarouselContent.vue',
  'components/ApexCarouselItem.vue', 'components/ApexCarouselControls.vue',
  'components/ApexCarouselIndicators.vue', 'components/ApexCarouselNav.vue',
  'components/ApexGallery.vue', 'components/ApexTaskBoard.vue', 'components/ApexTaskCard.vue',
  'components/ApexChart.vue', 'components/ApexChartGroup.vue',
  /* AF2-236: ours only — the families Pando kept inside ApexChart. */
  'components/ApexChartTreemap.vue', 'components/ApexChartHeat.vue',
  'core/sidebar.ts', 'core/speedDial.ts', 'core/carousel.ts', 'core/taskboard.ts',
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
  /* AF2-231 widened this: ApexGallery's ten per-button switches are the same
     trap, and there the whole toolbar was v-if'd away by it. A line of
     `name: undefined` pairs in the defaults is the shape of the fix. */
  { why: 'AF2-167/231: absent booleans arrive false, not undefined', test: (l) => /^\s*(\w+: undefined,\s*)+$/.test(l) },
  { why: 'AF2-200: the `padding` the original declares twice in one interface', test: (l) => /padding/.test(l) },
  { why: 'AF2-133/143/169: the ui class map', test: (l) => /\bui\?\.|ui\?:|ApexUiClasses|ApexContainerClasses|ApexDisplayClasses|ApexMediaClasses|ApexBoardProps|ApexBoardClasses|ApexChartProps|ApexChartClasses|:ui="ui"/.test(l) },
  /* The carousel's parts live in five files, so one map on the root travels
     through the context every part already reads. ApexCarouselItem gains a
     script for the first time purely to inject it. */
  { why: 'AF2-229: the ui map carried on the carousel context', test: (l) => /ctx\.ui\.value\?\.|ui: toRef\(props, 'ui'\)|CAROUSEL_CTX|^import \{ inject \} from 'vue';$/.test(l.trim()) },
  { why: 'AF2-62/64/67/68: the shared appearance props and their style block', test: (l) => /ApexButtonAppearance|ApexContainerProps|ApexDisplayProps|ApexMediaProps|(menu|action)[A-Z]\w*\?:|withDefaults\(defineProps<|btnStyle|Record<string, string>|Array<\[string \| undefined, string\]>|map\.forEach|^\s*(out|return out|\]|\);|\}\);)/.test(l) },
  { why: 'AF2-203: the breadcrumb’s routing helpers, and hiding an empty trail', test: (l) => /hrefFor|isRouted|linkAs|tagFor|all\.length|entry\.item|item\.to\b/.test(l) },
  { why: 'AF2-131/141/170: variables renamed to --apex-*', test: (l) => /--apex-[a-z]+-/.test(l) || /--(tbar|mnu|sbar|bc|dial|dock|mbar|mega)-/.test(l) },
  /* The chart could not mount: five identifiers were referenced and never
     declared, and one const was read eighty lines above its own line. Each
     definition is derived from an existing use site, helper or type — see the
     comments on them in the component. */
  { why: 'AF2-236: the bindings that made ApexChart mountable', test: (l) => /needsZeroBaseline|pointsOnly|zoomWindow|const zoomY|const inWindow = windowed|const uid = Math\.random|const uidClip|localZoom = ref<ZoomRange \| ZoomWindow/.test(l) },
  /* The treemap moved to its own renderer; the drill path and its breadcrumb
     stayed, because the nav renders outside the svg. */
  /* The heatmap's grid moved out; hasHeatmap stayed, because four other
     things read it — the entrance mode, the tooltip path, the axis ticks
     and data-family. */
  { why: 'AF2-236c: the heatmap extraction', test: (l) => /ApexChartHeat|^candleGeometry, candleTones,$|:locale="locale" @hover="heatHover"/.test(l.trim()) },
  { why: 'AF2-236a: the treemap extraction', test: (l) => /ApexChartTreemap|const crumbs = computed|const allSeries = computed|crumbs\.length|c in crumbs|hasTreemap|drillPath\.value\.map|:width="size\.width"|@drill="drillInto"|^candleGeometry, candleTones, heatBand, heatGrid, heatIntensity,$/.test(l.trim()) },
  /* Continuation lines of the two definitions above. The matcher reads one
     line at a time, so a wrapped expression has to name both halves. */
  { why: 'AF2-236: continuations of those bindings', test: (l) => /^(&& live\.value\.every|toWindow\(group \? group\.state\.zoom)/.test(l.trim()) },
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

  /*
   * A line that also appears on the `-` side was MOVED, not written.
   *
   * AF2-238c/d lifted the bar and candle geometry above the label pass that
   * reads it — a pure relocation, proved by the line multiset being unchanged.
   * A sequence diff cannot say "moved": it reports the whole displaced region
   * as added here and removed there, which was 74 lines of the original's own
   * code arriving as findings. Pairing them off leaves only lines that are
   * genuinely new, which is the question this script asks.
   *
   * Not the same as ignoring them: `gone` below still reports anything the
   * original had that we dropped, so a deletion disguised as a move is caught.
   */
  const pool = removed.map((r) => r.trim());
  const moved = [];
  const written = added.filter((l) => {
    const i = pool.indexOf(l.trim());
    if (i === -1) return true;
    pool.splice(i, 1);
    moved.push(l);
    return false;
  });

  const odd = written.filter((l) => !INTENDED.some((r) => r.test(l)));
  if (!odd.length) {
    explained++;
    console.log(`ok    ${rel}  — ${written.length} line(s) of ours, all accounted for`
      + (moved.length ? `; ${moved.length} moved` : '')
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
