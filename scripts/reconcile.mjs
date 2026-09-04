/*
 * Reconcile a ported control against the original gallery.
 *
 *   node scripts/reconcile.mjs             # every control we have imported
 *   node scripts/reconcile.mjs chip badge  # just these
 *
 * For each control it compares five things against the gallery: the props,
 * events and slots tables, the playground controls, and the worked-example
 * headings. The rule it enforces is the one that matters — a ported control
 * must not LACK anything the original had.
 *
 * Three kinds of difference, deliberately weighted differently:
 *
 *   MISSING   in the gallery, absent here. This is the failure. Exit code 1.
 *   CHANGED   same row, different type/default/description. Reported for a
 *             human to judge: some are real drift, some are corrections we
 *             made on purpose (ApexScrollArea's table was rewritten in
 *             AF2-151 because the gallery documented an API it did not have).
 *   EXTRA     here but not in the gallery. Expected and healthy — the ported
 *             controls gained appearance props and `ui` class maps that the
 *             originals never had. Shown as a count only.
 *
 * This is a script and not a vitest guard on purpose. It reads the gallery
 * out of the Pando tree, which is external to this repo and read-only; a
 * test that depends on a path outside the repo would fail for anyone else
 * and would couple our CI to a folder we do not own. Run it by hand when a
 * control is finished.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, '..', 'src');

/* Read-only source of truth. We never write anything under this tree. */
const PANDO = 'C:/WorkFolder/APEX Digital Signage/Digital Singage/Apex Pando V01/rizorsi/template';
const GALLERY_JS = path.join(PANDO, 'web', 'apex-ui-docs.js');
const GALLERY_HTML = path.join(PANDO, 'APEX UI Gallery.html');

/**
 * Where we renamed an entry, ours -> the gallery's id.
 *
 * Without this the control looks absent from the gallery and is reported as
 * "nothing to compare", which reads like a clean result but means nothing was
 * checked at all. Add a line here whenever an id is renamed on import.
 */
const ALIAS = {
  cascadeselect: 'cascade',
};

// ---------------------------------------------------------------- reading

function read(p, label) {
  if (!fs.existsSync(p)) {
    console.error(`Cannot find ${label}:\n  ${p}`);
    process.exit(2);
  }
  return fs.readFileSync(p, 'utf8');
}

/**
 * Match a bracket pair starting at `open`, ignoring brackets that sit inside
 * string literals. Naive depth counting gets this wrong the moment a
 * description says "[]", which several of them do.
 */
export function matchBracket(src, open) {
  const CLOSE = { '[': ']', '{': '}' }[src[open]];
  let depth = 0;
  let quote = null;
  let comment = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    /* Comments must be skipped, not merely strings. An apostrophe in a prose
       comment — "the user's" — otherwise opens a phantom string that swallows
       every brace until the next apostrophe, and the match runs off the end
       of the file. That is what was quietly dropping ApexCascadeSelect and
       ApexDatePicker from the comparison. */
    if (comment === 'line') { if (c === '\n') comment = null; continue; }
    if (comment === 'block') { if (c === '*' && src[i + 1] === '/') { comment = null; i++; } continue; }
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && src[i + 1] === '*') { comment = 'block'; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === src[open]) depth++;
    else if (c === CLOSE) { depth--; if (!depth) return i; }
  }
  return -1;
}

/**
 * Index of the `{` that opens the object containing `pos`.
 *
 * Scanning backwards for the nearest `{` is wrong: several descriptions
 * contain a literal brace — "{ size?, minSize?, maxSize? }" — and landing
 * inside one produces an unbalanced block, whereupon the control is silently
 * skipped rather than compared. ApexDatePicker was being skipped exactly this
 * way. So track the brace depth forward from the top of the file, ignoring
 * braces inside strings and comments, and take the innermost open one.
 */
function enclosingObject(src, pos) {
  const stack = [];
  let quote = null;
  let comment = null; // 'line' | 'block'
  for (let i = 0; i < pos; i++) {
    const c = src[i];
    if (comment === 'line') { if (c === '\n') comment = null; continue; }
    if (comment === 'block') { if (c === '*' && src[i + 1] === '/') { comment = null; i++; } continue; }
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && src[i + 1] === '*') { comment = 'block'; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '{') stack.push(i);
    else if (c === '}') stack.pop();
  }
  return stack.length ? stack[stack.length - 1] : -1;
}

/** The registry object literal for one control id. */
export function entryBlock(src, id) {
  const at = src.search(new RegExp(`id:\\s*'${id}'`));
  if (at < 0) return null;
  const open = enclosingObject(src, at);
  if (open < 0) return null;
  const close = matchBracket(src, open);
  return close < 0 ? null : src.slice(open, close + 1);
}

/** A named array field inside an entry, as rows of cells. */
export function rows(block, field) {
  if (!block) return [];
  const at = block.search(new RegExp(`\\b${field}:\\s*\\[`));
  if (at < 0) return [];
  const open = block.indexOf('[', at);
  const body = block.slice(open + 1, matchBracket(block, open));

  const out = [];
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '[') continue;
    const end = matchBracket(body, i);
    if (end < 0) break;
    out.push(cells(body.slice(i + 1, end)));
    i = end;
  }
  return out;
}

/** The quoted strings at the top level of one row. */
function cells(row) {
  const out = [];
  let quote = null;
  let buf = '';
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (quote) {
      if (c === '\\') {
        /* Decode the escape rather than keeping its letters. Our registry
           writes an em-dash as the six characters backslash-u-2-0-1-4 where
           the gallery uses the character itself. They render identically, so
           comparing raw text would mark every such row "changed" and bury
           the real differences under noise. */
        const next = row[i + 1];
        if (next === 'u') { buf += String.fromCharCode(parseInt(row.slice(i + 2, i + 6), 16)); i += 5; }
        else if (next === 'n') { buf += '\n'; i++; }
        else if (next === 't') { buf += '\t'; i++; }
        else { buf += next; i++; }
        continue;
      }
      if (c === quote) { out.push(buf); buf = ''; quote = null; continue; }
      buf += c;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
  }
  return out;
}

/** Playground control keys, e.g. { key: 'layout', ... } -> layout */
export function controlKeys(block) {
  if (!block) return [];
  const at = block.search(/\bcontrols:\s*\[/);
  if (at < 0) return [];
  const open = block.indexOf('[', at);
  const body = block.slice(open + 1, matchBracket(block, open));
  return [...body.matchAll(/key:\s*'([^']+)'/g)].map((m) => m[1]);
}

/**
 * The worked-example headings for one control. Both files gate a control's
 * sections on entry.id, so the headings are the <h2> literals inside those
 * blocks. A control can own more than one block (ApexInput and ApexButton
 * both do), so every match accumulates.
 */
export function headings(src, id) {
  /* Our App.vue renders foundations pages in a separate branch keyed on
     `page!.id` rather than `entry.id`. Matching only the latter made the
     Conditional-formatting and Validation examples look absent when they
     were on the page all along. */
  const gate = new RegExp(
    `<(\\w+)([^>]*?v-if="[^"]*(?:entry|page)!?\\.id\\s*===?\\s*'${id}'[^"]*")`, 'g');
  const found = [];
  for (const m of src.matchAll(gate)) {
    const tag = m[1];
    let depth = 0;
    let i = m.index;
    let end = -1;
    const open = new RegExp(`<${tag}[\\s>]`, 'g');
    const close = new RegExp(`</${tag}>`, 'g');
    while (i < src.length) {
      open.lastIndex = i;
      close.lastIndex = i;
      const o = open.exec(src);
      const c = close.exec(src);
      if (!c) break;
      if (o && o.index < c.index) { depth++; i = o.index + 1; continue; }
      depth--;
      i = c.index + 1;
      if (!depth) { end = c.index; break; }
    }
    const body = src.slice(m.index, end < 0 ? src.length : end);
    for (const h of body.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)) {
      const text = h[1].trim();
      /* Skip interpolated headings — {{ entry.serviceTitle }} and friends
         are computed, so there is no literal to compare. */
      if (text && !text.includes('{{')) found.push(text);
    }
  }
  return found;
}

// ---------------------------------------------------------------- diffing

const key = (row) => (row[0] || '').trim();

/**
 * The names one row documents.
 *
 * Both files fold related entries into a single row — "icon / trailingIcon",
 * "href / target", "panel-1, panel-2, …" — but not always the same ones. A
 * row keyed on its whole first cell therefore makes "block / vertical" look
 * like neither `block` nor `vertical`, and the tool reports two props as
 * missing when both are documented. Acting on that would have duplicated
 * rows that already existed. So compare the names a row covers, not the
 * literal cell.
 */
function names(row) {
  return key(row)
    .split(/\s*[/,]\s*/)
    .map((n) => n.trim())
    .filter((n) => n && n !== '…' && !n.includes('…'));
}
/* Collapse runs of whitespace: the two files wrap their long descriptions at
   different columns, and a line break is not a documentation difference. */
const rest = (row) => row.slice(1).map((c) => c.trim().replace(/\s+/g, ' ')).join(' | ');

function diff(mine, theirs) {
  const index = (list) => {
    const m = new Map();
    for (const row of list) for (const n of names(row)) if (!m.has(n)) m.set(n, row);
    return m;
  };
  const mineBy = index(mine);
  const theirsBy = index(theirs);

  return {
    missing: [...theirsBy.keys()].filter((n) => !mineBy.has(n)),
    extra: [...mineBy.keys()].filter((n) => !theirsBy.has(n)),
    /* Only compare descriptions where both sides document the name in a row
       covering the same set, otherwise a merged row is diffed against a split
       one and every such pair reads as changed. */
    changed: [...theirsBy.entries()]
      .filter(([n, r]) => mineBy.has(n)
        && key(mineBy.get(n)) === key(r)
        && rest(mineBy.get(n)) !== rest(r))
      .map(([n, r]) => ({ name: n, gallery: rest(r), ours: rest(mineBy.get(n)) })),
  };
}

function diffList(mine, theirs) {
  return {
    missing: theirs.filter((x) => !mine.includes(x)),
    extra: mine.filter((x) => !theirs.includes(x)),
    changed: [],
  };
}

// ---------------------------------------------------------------- report

function main() {
  const galleryJs = read(GALLERY_JS, 'the gallery registry');
  const galleryHtml = read(GALLERY_HTML, 'the gallery page');
  const ourRegistry = read(path.join(SRC, 'registry.ts'), 'src/registry.ts');
  const ourApp = read(path.join(SRC, 'App.vue'), 'src/App.vue');

  const wanted = process.argv.slice(2);
  const ourIds = [...ourRegistry.matchAll(/^\s*id:\s*'([a-z0-9-]+)'/gm)].map((m) => m[1]);
  const ids = wanted.length ? wanted : ourIds;

  let failures = 0;
  let checked = 0;
  const notInGallery = [];

  for (const id of ids) {
    const theirId = ALIAS[id] || id;
    const theirBlock = entryBlock(galleryJs, theirId);
    const ourBlock = entryBlock(ourRegistry, id);

    /* `ids` came from our own registry unless the caller named them, so a
       missing block here means the parser choked, not that the entry is
       absent. Counting that as a pass would quietly drop a control from the
       comparison — the failure this whole script exists to prevent. */
    if (!ourBlock) {
      console.log(`\nERROR ${id}: could not parse an entry block${wanted.length ? '' : ' (it IS in our registry)'}`);
      failures++;
      continue;
    }
    if (!theirBlock) { notInGallery.push(id); continue; }

    checked++;
    const areas = {
      props: diff(rows(ourBlock, 'props'), rows(theirBlock, 'props')),
      events: diff(rows(ourBlock, 'events'), rows(theirBlock, 'events')),
      slots: diff(rows(ourBlock, 'slots'), rows(theirBlock, 'slots')),
      /* The companion table — a wrapper, a service, a set of helper classes.
         Half of ApexBadge's API is ApexOverlayBadge's rows, and nothing else
         here would notice them going missing. */
      service: diff(rows(ourBlock, 'serviceRows'), rows(theirBlock, 'serviceRows')),
      controls: diffList(controlKeys(ourBlock), controlKeys(theirBlock)),
      sections: diffList(headings(ourApp, id), headings(galleryHtml, theirId)),
    };

    const bad = Object.values(areas).some((a) => a.missing.length);
    const noteworthy = Object.values(areas).some((a) => a.missing.length || a.changed.length);
    if (bad) failures++;

    const name = (ourBlock.match(/name:\s*'([^']+)'/) || [])[1] || id;
    console.log(`\n${bad ? 'FAIL' : noteworthy ? 'note' : ' ok '}  ${name}`);

    for (const [area, a] of Object.entries(areas)) {
      if (!a.missing.length && !a.changed.length && !a.extra.length) continue;
      const bits = [];
      if (a.missing.length) bits.push(`MISSING ${a.missing.length}`);
      if (a.changed.length) bits.push(`changed ${a.changed.length}`);
      if (a.extra.length) bits.push(`+${a.extra.length} ours`);
      console.log(`        ${area.padEnd(9)} ${bits.join(', ')}`);
      if (a.missing.length) console.log(`          missing: ${a.missing.join(', ')}`);
      for (const c of a.changed) {
        console.log(`          ~ ${c.name}`);
        console.log(`              gallery: ${c.gallery.slice(0, 110)}`);
        console.log(`              ours:    ${c.ours.slice(0, 110)}`);
      }
    }
  }

  if (notInGallery.length) {
    console.log(`\n${notInGallery.length} of ours are not in the gallery (nothing to compare): ${notInGallery.join(' ')}`);
  }

  console.log(`\n${checked} compared, ${failures} with something missing.`);
  process.exit(failures ? 1 : 0);
}

/* Only report when run directly. Importing this file — as the self-check
   does — gets the extractors without triggering the run. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
