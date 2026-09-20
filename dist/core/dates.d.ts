/** Date formatting, parsing and grid helpers for ApexDatePicker. No dependencies. */
export interface ApexDateLocale {
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
}
export declare const EN_LOCALE: ApexDateLocale;
export declare const startOfDay: (d: Date) => Date;
export declare const isSameDay: (a?: Date | null, b?: Date | null) => boolean;
export declare const addMonths: (d: Date, n: number) => Date;
export declare const dayOfYear: (d: Date) => number;
/**
 * jQuery-UI style tokens:
 * d dd o oo D DD m mm M MM y yy @ ! '…' ''
 */
export declare function formatDate(date: Date | null | undefined, fmt: string, locale?: ApexDateLocale): string;
export declare function formatTime(date: Date, hourFormat?: '12' | '24', showSeconds?: boolean, locale?: ApexDateLocale): string;
/** Best-effort parser for the same tokens. Returns null when the text does not fit. */
export declare function parseDate(text: string, fmt: string, locale?: ApexDateLocale): Date | null;
/** Six-week grid for a month, including the leading/trailing days of the neighbours. */
export declare function monthGrid(year: number, month: number, firstDayOfWeek?: number): {
    date: Date;
    outside: boolean;
}[];
export declare function weekdayLabels(locale: ApexDateLocale): string[];
