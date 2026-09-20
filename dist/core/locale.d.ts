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
/**
 * The English fallback. Every pack merges over this, so a missing label renders
 * a real word rather than a key — a half-translated UI is usable, a UI showing
 * `calendar.allDay` is not.
 */
export declare const DEFAULT_LABELS: Record<string, string>;
/**
 * The fallback pack supplies LABELS ONLY, deliberately.
 *
 * It used to carry dir/firstDay/hour12 too, and merging it under every resolve
 * meant an unregistered locale inherited English geometry: `resolve('he')` came
 * back ltr and `resolve('de')` came back Sunday-first. Geometry is asked of Intl
 * and defaulted in the resolver; only words fall back to English.
 */
export declare const EN_PACK: ApexLocalePack;
export declare function registerApexLocales(packs: ApexLocalePack[] | Record<string, ApexLocalePack>): void;
/** The system-wide selection. A component's `locale` prop still wins. */
export declare function setApexLocale(code: string): void;
export declare function getApexLocale(): string;
export declare function apexLocaleCodes(): string[];
export declare function apexLocalePack(code: string): ApexLocalePack | undefined;
export declare function derivePattern(code: string): string;
/** ISO 8601 week number — Thursday decides the year. */
export declare function isoWeek(date: Date): number;
/** The local scheme: week 1 is the one holding 1 January. */
export declare function localWeek(date: Date, firstDay: number): number;
/**
 * Merge order: English defaults ← the registered pack ← an inline override.
 *
 * `input` is a CODE (the registry path) or an object (what existing
 * ApexDatePicker callers already pass, so the conversion breaks nothing).
 */
export declare function resolveApexLocale(input?: string | Partial<ApexLocalePack>): ApexResolvedLocale;
/** Weekday labels rotated to the locale's first day — the visible half of it. */
export declare function weekdayOrder(locale: ApexResolvedLocale, style?: 'days' | 'daysShort' | 'daysMin'): string[];
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
export declare function toDateLocale(loc: ApexResolvedLocale): {
    firstDayOfWeek: number;
    dayNames: string[];
    dayNamesShort: string[];
    dayNamesMin: string[];
    monthNames: string[];
    monthNamesShort: string[];
    today: string;
    clear: string;
    now: string;
    am: string;
    pm: string;
};
