/**
 * Locale data: packs, the registry, and the date arithmetic that depends on them.
 *
 * Ported at AF2-267a from the reference library, where all of this lives in
 * `core/i18n.ts`. It is NOT merged into ours. Our `core/i18n.ts` is a different
 * module that happens to share that filename there: it carries the UI-string
 * fallbacks and the optional vue-i18n seam (§4.7) and knows nothing about
 * dates. Theirs carries locale packs and week arithmetic and no strings at all.
 * Keeping them apart leaves each file with one job — strings, locale data, and
 * positioning in `core/anchor.ts`.
 *
 * The RTL geometry that sat at the end of their file is in `core/anchor.ts`,
 * which is where positioning already lives.
 */

/**
 * Apex i18n — locale packs for every component that shows a date or a word.
 *
 * The division of labour is deliberate. **Intl knows the calendar**: month and
 * weekday names, date and time patterns, numbering systems. **Only the developer
 * knows the product's words**: "Today", "All-day", "+3 more", "Week 36". So a
 * pack authors `labels` and normally omits `names`, which Intl fills — shipping
 * our own name tables would be a maintenance tail we own forever, and every
 * browser already has the data.
 *
 * Several packs are registered at once and one is selected, because a system can
 * be Italian, German and Arabic at the same time. A component's `locale` prop
 * overrides the selection per instance.
 */
import { reactive } from 'vue';

export interface ApexLocaleNames {
  months: string[];
  monthsShort: string[];
  days: string[];
  daysShort: string[];
  daysMin: string[];
}

export interface ApexLocalePack {
  /** BCP-47, handed to Intl. `de-DE`, `ar-EG`, `it`. */
  code: string;
  /** From the pack, never sniffed from the document. */
  dir?: 'ltr' | 'rtl';
  /** Only `gregory` is accepted — see the refusal in `resolveApexLocale`. */
  calendar?: string;
  /** e.g. `arab` for Arabic-Indic digits. Omitted: whatever the locale implies. */
  numberingSystem?: string;
  /** 0 = Sunday. Omitted: asked of Intl, then 0. */
  firstDay?: number;
  weekNumbers?: 'iso' | 'local';
  hour12?: boolean;
  /** The product's own words. `{n}`-style placeholders. */
  labels?: Record<string, string>;
  /** Escape hatch for a client who insists on their own names. */
  names?: Partial<ApexLocaleNames>;
  /**
   * Overrides the pattern derived from Intl, for a field that must NOT localise
   * (ISO-only, a legacy form). Same token vocabulary as `core/dates`.
   */
  datePattern?: string;
}

export interface ApexResolvedLocale {
  code: string;
  dir: 'ltr' | 'rtl';
  rtl: boolean;
  firstDay: number;
  weekNumbers: 'iso' | 'local';
  hour12: boolean;
  numberingSystem?: string;
  names: ApexLocaleNames;
  /** A label, with `{name}` placeholders filled. Unknown keys return the key. */
  t: (key: string, params?: Record<string, unknown>) => string;
  /** Memoised `Intl.DateTimeFormat`, Gregorian forced. */
  fmt: (date: Date | number, options: Intl.DateTimeFormatOptions) => string;
  /** Parts, for callers that need the pieces rather than the string. */
  parts: (date: Date | number, options: Intl.DateTimeFormatOptions) => Intl.DateTimeFormatPart[];
  /** Localised digits — every number goes through this, none through String(n). */
  num: (value: number) => string;
  /** Derived from Intl so display and parsing cannot disagree. */
  datePattern: string;
  weekNumber: (date: Date) => number;
}

/* Small, stable, and better than defaulting Arabic to ltr when Intl.Locale's
   textInfo is unavailable (Firefox does not implement it). */
const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ckb'];

/**
 * The English fallback. Every pack merges over this, so a missing label renders
 * a real word rather than a key — a half-translated UI is usable, a UI showing
 * `calendar.allDay` is not.
 */
export const DEFAULT_LABELS: Record<string, string> = {
  today: 'Today',
  clear: 'Clear',
  now: 'Now',
  cancel: 'Cancel',
  save: 'Save',
  close: 'Close',
  edit: 'Edit',
  delete: 'Delete',
  create: 'Create',
  previous: 'Previous',
  next: 'Next',
  /* views */
  month: 'Month',
  week: 'Week',
  day: 'Day',
  list: 'List',
  year: 'Year',
  /* calendar chrome */
  allDay: 'All-day',
  fieldTitle: 'Title',
  fieldType: 'Type',
  fieldStarts: 'Starts',
  fieldDuration: 'Duration',
  fieldLength: 'Length',
  fieldRepeat: 'Repeat',
  more: '+{n} more',
  weekNumber: 'Week {n}',
  noEvents: 'No events',
  /* scheduler chrome */
  resources: 'Resources',
  groupBy: 'Group by',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  recurring: 'Recurring',
  newBooking: 'New booking',
  editBooking: 'Edit booking',
  /* recurrence, phrased whole rather than assembled from fragments */
  repeatNone: 'Does not repeat',
  repeatDaily: 'Daily',
  repeatWeekdays: 'Every weekday (Mon–Fri)',
  repeatWeekly: 'Weekly on this day',
  repeatMonthly: 'Monthly',
  ruleEvery: 'Every {unit}',
  ruleEveryN: 'Every {n} {unit}s',
  ruleOnDays: '{rule} on {days}',
  ruleCount: '{rule}, {n} times',
  ruleUntil: '{rule}, until {date}',
  unitDay: 'day',
  unitWeek: 'week',
  unitMonth: 'month',
  unitYear: 'year',
  /* the three write scopes */
  scopeThis: 'This event',
  scopeFollowing: 'This and following events',
  scopeAll: 'All events in the series',
};

/**
 * The fallback pack supplies LABELS ONLY, deliberately.
 *
 * It used to carry dir/firstDay/hour12 too, and merging it under every resolve
 * meant an unregistered locale inherited English geometry: `resolve('he')` came
 * back ltr and `resolve('de')` came back Sunday-first. Geometry is asked of Intl
 * and defaulted in the resolver; only words fall back to English.
 */
export const EN_PACK: ApexLocalePack = {
  code: 'en',
  labels: {},
  /**
   * Pinned day-first, deliberately.
   *
   * Intl reads bare `en` as en-US, so deriving this would have flipped the
   * shipped default from `dd/mm/yy` to `mm/dd/yy` — changing what an existing
   * booking form MEANS without anyone opting in. Localisation is opt-in: register
   * `en-US` (or any pack) and the pattern is derived from it as normal.
   */
  datePattern: 'dd/mm/yy',
};

const registry = reactive<Record<string, ApexLocalePack>>({ en: EN_PACK });
const state = reactive<{ current: string }>({ current: 'en' });

/** Register one or many packs. Called again with the same code, it replaces. */
/**
 * A language code finds a registered REGIONAL pack — `de` resolves to `de-DE`.
 *
 * Without it, a system registering `de-DE` and asking for `de` gets English
 * labels back, which reads as the registry having failed. First registered wins
 * when several regions share a language (`en-GB` before `en-US`), so register the
 * one you mean first, or ask for it by its full code.
 */
function regionalFallback(code: string): ApexLocalePack | undefined {
  const lang = code.toLowerCase().split(/[-_]/)[0] + '-';
  const hit = Object.keys(registry).find((k) => k.toLowerCase().startsWith(lang));
  return hit ? registry[hit] : undefined;
}

export function registerApexLocales(packs: ApexLocalePack[] | Record<string, ApexLocalePack>) {
  /* The key wins. Written the other way round in the source, where the spread
     overwrote the `code: k` it was given and the record's keys became
     decorative — register `{ 'en-GB': { code: 'en' } }` and it landed under
     'en'. Fixed at AF2-267a. */
  const list = Array.isArray(packs) ? packs : Object.keys(packs).map((k) => ({ ...packs[k], code: k }));
  list.forEach((pack) => {
    if (!pack || !pack.code) return;
    registry[pack.code] = pack;
  });
}

/** The system-wide selection. A component's `locale` prop still wins. */
export function setApexLocale(code: string) { state.current = code; }
export function getApexLocale() { return state.current; }
export function apexLocaleCodes() { return Object.keys(registry); }
export function apexLocalePack(code: string): ApexLocalePack | undefined { return registry[code]; }

const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn('[apex-ui] ' + message);
}

/* Intl instances are expensive enough to matter in a month grid that formats 42
   cells on every render, so they are cached by locale plus option shape. */
const fmtCache = new Map<string, Intl.DateTimeFormat>();
function dtf(code: string, options: Intl.DateTimeFormatOptions, numberingSystem?: string) {
  const key = code + '|' + (numberingSystem || '') + '|' + JSON.stringify(options);
  let f = fmtCache.get(key);
  if (!f) {
    const opts: Intl.DateTimeFormatOptions = { calendar: 'gregory', ...options };
    if (numberingSystem) (opts as Record<string, unknown>).numberingSystem = numberingSystem;
    try { f = new Intl.DateTimeFormat(code, opts); } catch { f = new Intl.DateTimeFormat('en', options); }
    fmtCache.set(key, f);
  }
  return f;
}

const numCache = new Map<string, Intl.NumberFormat>();
function nf(code: string, numberingSystem?: string) {
  const key = code + '|' + (numberingSystem || '');
  let f = numCache.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat(code, numberingSystem
        ? ({ numberingSystem } as Intl.NumberFormatOptions) : undefined);
    } catch { f = new Intl.NumberFormat('en'); }
    numCache.set(key, f);
  }
  return f;
}

/* A known Sunday and a known year, so the name tables are read out of Intl
   rather than transcribed. 2024-01-07 is a Sunday. */
const SUNDAY = new Date(2024, 0, 7);
const namesCache = new Map<string, ApexLocaleNames>();

function part(f: Intl.DateTimeFormat, date: Date, type: Intl.DateTimeFormatPartTypes) {
  const hit = f.formatToParts(date).find((p) => p.type === type);
  return hit ? hit.value : '';
}

function intlNames(code: string, numberingSystem?: string): ApexLocaleNames {
  const key = code + '|' + (numberingSystem || '');
  const cached = namesCache.get(key);
  if (cached) return cached;
  const monthsF = dtf(code, { month: 'long' }, numberingSystem);
  const monthsS = dtf(code, { month: 'short' }, numberingSystem);
  const daysF = dtf(code, { weekday: 'long' }, numberingSystem);
  const daysS = dtf(code, { weekday: 'short' }, numberingSystem);
  const daysN = dtf(code, { weekday: 'narrow' }, numberingSystem);
  const out: ApexLocaleNames = { months: [], monthsShort: [], days: [], daysShort: [], daysMin: [] };
  for (let m = 0; m < 12; m += 1) {
    const d = new Date(2024, m, 15);
    out.months.push(part(monthsF, d, 'month'));
    out.monthsShort.push(part(monthsS, d, 'month'));
  }
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(SUNDAY.getFullYear(), SUNDAY.getMonth(), SUNDAY.getDate() + i);
    out.days.push(part(daysF, d, 'weekday'));
    out.daysShort.push(part(daysS, d, 'weekday'));
    out.daysMin.push(part(daysN, d, 'weekday'));
  }
  namesCache.set(key, out);
  return out;
}

/**
 * The parse pattern, read out of Intl's own output.
 *
 * Intl formats and cannot parse, so the typed-input parser needs a pattern. Read
 * it from `formatToParts` on a date whose parts are all distinguishable and the
 * two directions cannot disagree — which is the whole point. Literals holding
 * letters (Japanese `年`) are quoted for the token vocabulary in `core/dates`.
 */
const patternCache = new Map<string, string>();
export function derivePattern(code: string): string {
  const cached = patternCache.get(code);
  if (cached) return cached;
  const f = dtf(code, { year: 'numeric', month: '2-digit', day: '2-digit' });
  let out = '';
  f.formatToParts(new Date(2026, 8, 7)).forEach((p) => {
    if (p.type === 'day') out += 'dd';
    else if (p.type === 'month') out += 'mm';
    /* 'yy' is the FULL year in this token vocabulary and 'y' the two-digit one.
       Surprising, but it is the vocabulary core/dates already parses. */
    else if (p.type === 'year') out += 'yy';
    /* `relatedYear` is a real Intl part for non-Gregorian calendars but is
       absent from TypeScript's DateTimeFormatPart union, so the comparison is
       widened rather than the branch dropped: resolveApexLocale warns that only
       Gregorian arithmetic is done, it does not stop the formatter emitting it. */
    else if (p.type === 'era' || (p.type as string) === 'relatedYear') out += '';
    else out += /\p{L}/u.test(p.value) ? "'" + p.value + "'" : p.value;
  });
  const pattern = out || 'dd/mm/yy';
  patternCache.set(code, pattern);
  return pattern;
}

function intlFirstDay(code: string): number | undefined {
  try {
    const loc = new Intl.Locale(code) as Intl.Locale & { weekInfo?: { firstDay: number }; getWeekInfo?: () => { firstDay: number } };
    const info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
    /* Intl counts Monday as 1 and Sunday as 7; we count Sunday as 0. */
    if (info && typeof info.firstDay === 'number') return info.firstDay % 7;
  } catch { /* not implemented everywhere — the pack should state it */ }
  return undefined;
}

function intlDir(code: string): 'ltr' | 'rtl' {
  try {
    const loc = new Intl.Locale(code) as Intl.Locale & { textInfo?: { direction: string }; getTextInfo?: () => { direction: string } };
    const info = typeof loc.getTextInfo === 'function' ? loc.getTextInfo() : loc.textInfo;
    if (info && info.direction) return info.direction === 'rtl' ? 'rtl' : 'ltr';
  } catch { /* fall through to the language list */ }
  const lang = String(code).toLowerCase().split(/[-_]/)[0];
  return RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
}

/** ISO 8601 week number — Thursday decides the year. */
export function isoWeek(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const first = new Date(d.getFullYear(), 0, 4);
  first.setDate(first.getDate() + 3 - ((first.getDay() + 6) % 7));
  return 1 + Math.round((d.getTime() - first.getTime()) / (7 * 86400000));
}

/** The local scheme: week 1 is the one holding 1 January. */
export function localWeek(date: Date, firstDay: number): number {
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const lead = (jan1.getDay() - firstDay + 7) % 7;
  const start = new Date(date.getFullYear(), 0, 1 - lead);
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((day.getTime() - start.getTime()) / (7 * 86400000)) + 1;
}

const interpolate = (text: string, params?: Record<string, unknown>) => (params
  ? text.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined ? m : String(params[k])))
  : text);

/**
 * Merge order: English defaults ← the registered pack ← an inline override.
 *
 * `input` is a CODE (the registry path) or an object (what existing
 * ApexDatePicker callers already pass, so the conversion breaks nothing).
 */
export function resolveApexLocale(input?: string | Partial<ApexLocalePack>): ApexResolvedLocale {
  const inline = (input && typeof input === 'object') ? input : undefined;
  const code = typeof input === 'string' ? input : (inline?.code || state.current);
  const pack = registry[code] || registry[String(code).split(/[-_]/)[0]]
    || regionalFallback(String(code)) || EN_PACK;
  const merged: ApexLocalePack = { ...pack, ...(inline || {}), code: inline?.code || code };

  if (merged.calendar && merged.calendar !== 'gregory') {
    warnOnce('cal:' + merged.code, `locale pack "${merged.code}" asks for calendar "${merged.calendar}". `
      + 'Apex UI does Gregorian arithmetic only, so the field is ignored — names, digits and '
      + 'direction are still localised. Remove `calendar` from the pack to silence this.');
  }

  const numberingSystem = merged.numberingSystem;
  const derived = intlNames(merged.code, numberingSystem);
  const names: ApexLocaleNames = {
    months: merged.names?.months || derived.months,
    monthsShort: merged.names?.monthsShort || derived.monthsShort,
    days: merged.names?.days || derived.days,
    daysShort: merged.names?.daysShort || derived.daysShort,
    daysMin: merged.names?.daysMin || derived.daysMin,
  };
  const labels = { ...DEFAULT_LABELS, ...(pack.labels || {}), ...(inline?.labels || {}) };
  const dir = merged.dir || intlDir(merged.code);
  const firstDay = merged.firstDay != null ? merged.firstDay
    : (intlFirstDay(merged.code) ?? 0);
  const weekNumbers = merged.weekNumbers || 'local';
  /* Honoured only when it came from the caller or from a pack whose own code IS
     the resolved one — an inherited pack must not lend its date order to another
     region (asking for en-US and getting en's pinned dd/mm/yy). */
  const pinnedPattern = inline?.datePattern
    || (pack.datePattern && pack.code === merged.code ? pack.datePattern : undefined);

  return {
    code: merged.code,
    dir,
    rtl: dir === 'rtl',
    firstDay,
    weekNumbers,
    hour12: merged.hour12 != null ? !!merged.hour12
      : !!dtf(merged.code, { hour: 'numeric' }, numberingSystem).resolvedOptions().hour12,
    numberingSystem,
    names,
    t: (key, params) => interpolate(labels[key] !== undefined ? labels[key] : key, params),
    fmt: (date, options) => dtf(merged.code, options, numberingSystem).format(date),
    parts: (date, options) => dtf(merged.code, options, numberingSystem).formatToParts(new Date(date)),
    num: (value) => nf(merged.code, numberingSystem).format(value),
    datePattern: pinnedPattern || derivePattern(merged.code),
    weekNumber: (date) => (weekNumbers === 'iso' ? isoWeek(date) : localWeek(date, firstDay)),
  };
}

/** Weekday labels rotated to the locale's first day — the visible half of it. */
export function weekdayOrder(locale: ApexResolvedLocale, style: 'days' | 'daysShort' | 'daysMin' = 'daysMin') {
  const out: string[] = [];
  for (let i = 0; i < 7; i += 1) out.push(locale.names[style][(i + locale.firstDay) % 7]);
  return out;
}

/**
 * A resolved locale in the shape `core/dates` uses.
 *
 * The library now carries two locale vocabularies: `ApexDateLocale` in
 * `core/dates`, which ApexDatePicker and the older date controls take, and
 * `ApexLocalePack` here, which ApexCalendar and ApexScheduler take. They
 * overlap almost entirely but name everything differently, so a calendar
 * cannot hand its own locale to the date picker it embeds without this.
 *
 * A bridge rather than a merge: unifying the two is a real piece of work and
 * belongs in its own task. Added at AF2-268 because the alternative was a
 * calendar whose embedded picker silently ignored the locale.
 */
export function toDateLocale(loc: ApexResolvedLocale) {
  return {
    firstDayOfWeek: loc.firstDay,
    dayNames: loc.names.days,
    dayNamesShort: loc.names.daysShort,
    dayNamesMin: loc.names.daysMin,
    monthNames: loc.names.months,
    monthNamesShort: loc.names.monthsShort,
    today: loc.t('today'),
    clear: loc.t('clear'),
    now: loc.t('now'),
    am: loc.t('am'),
    pm: loc.t('pm'),
  };
}

