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

export const EN_LOCALE: ApexDateLocale = {
  firstDayOfWeek: 0,
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  today: 'Today',
  clear: 'Clear',
  now: 'Now',
  am: 'AM',
  pm: 'PM',
};

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const dayOfYear = (d: Date) =>
  Math.floor((startOfDay(d).getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

/**
 * jQuery-UI style tokens:
 * d dd o oo D DD m mm M MM y yy @ ! '…' ''
 */
export function formatDate(date: Date | null | undefined, fmt: string, locale: ApexDateLocale = EN_LOCALE): string {
  if (!date) return '';
  let out = '';
  let i = 0;
  const look = (token: string) => {
    let count = 0;
    while (fmt[i + count] === token) count++;
    return count;
  };
  while (i < fmt.length) {
    const c = fmt[i];
    if (c === "'") {
      if (fmt[i + 1] === "'") { out += "'"; i += 2; continue; }
      i++;
      while (i < fmt.length && fmt[i] !== "'") { out += fmt[i]; i++; }
      i++;
      continue;
    }
    if ('doDmMy'.includes(c)) {
      const n = look(c);
      switch (c) {
        case 'd': out += n >= 2 ? pad(date.getDate()) : String(date.getDate()); break;
        case 'o': out += n >= 2 ? pad(dayOfYear(date), 3) : String(dayOfYear(date)); break;
        case 'D': out += n >= 2 ? locale.dayNames[date.getDay()] : locale.dayNamesShort[date.getDay()]; break;
        case 'm': out += n >= 2 ? pad(date.getMonth() + 1) : String(date.getMonth() + 1); break;
        case 'M': out += n >= 2 ? locale.monthNames[date.getMonth()] : locale.monthNamesShort[date.getMonth()]; break;
        case 'y': out += n >= 2 ? String(date.getFullYear()) : pad(date.getFullYear() % 100); break;
      }
      i += n;
      continue;
    }
    if (c === '@') { out += String(date.getTime()); i++; continue; }
    if (c === '!') { out += String(date.getTime() * 10000 + 621355968000000000); i++; continue; }
    out += c;
    i++;
  }
  return out;
}

export function formatTime(date: Date, hourFormat: '12' | '24' = '24', showSeconds = false, locale: ApexDateLocale = EN_LOCALE): string {
  const h24 = date.getHours();
  const h = hourFormat === '12' ? (h24 % 12 || 12) : h24;
  const base = `${pad(h)}:${pad(date.getMinutes())}${showSeconds ? ':' + pad(date.getSeconds()) : ''}`;
  return hourFormat === '12' ? `${base} ${h24 < 12 ? locale.am : locale.pm}` : base;
}

/** Best-effort parser for the same tokens. Returns null when the text does not fit. */
export function parseDate(text: string, fmt: string, locale: ApexDateLocale = EN_LOCALE): Date | null {
  if (!text) return null;
  const s = text.trim();
  let si = 0, fi = 0;
  let day = 1, month = 0, year = new Date().getFullYear();
  const readNumber = (max: number) => {
    let out = '';
    while (si < s.length && /\d/.test(s[si]) && out.length < max) { out += s[si]; si++; }
    return out ? parseInt(out, 10) : NaN;
  };
  const readName = (names: string[]) => {
    const low = s.slice(si).toLowerCase();
    const hit = names.findIndex((n) => low.startsWith(n.toLowerCase()));
    if (hit >= 0) si += names[hit].length;
    return hit;
  };
  while (fi < fmt.length) {
    const c = fmt[fi];
    if (c === "'") {
      if (fmt[fi + 1] === "'") { si++; fi += 2; continue; }
      fi++;
      while (fi < fmt.length && fmt[fi] !== "'") { si++; fi++; }
      fi++;
      continue;
    }
    let n = 1;
    while (fmt[fi + n] === c) n++;
    switch (c) {
      case 'd': day = readNumber(2); fi += n; break;
      case 'o': { const doy = readNumber(3); const base = new Date(year, 0, doy); day = base.getDate(); month = base.getMonth(); fi += n; break; }
      case 'D': readName(n >= 2 ? locale.dayNames : locale.dayNamesShort); fi += n; break;
      case 'm': month = readNumber(2) - 1; fi += n; break;
      case 'M': { const hit = readName(n >= 2 ? locale.monthNames : locale.monthNamesShort); if (hit >= 0) month = hit; fi += n; break; }
      case 'y': { const v = readNumber(n >= 2 ? 4 : 2); year = n >= 2 ? v : 2000 + v; fi += n; break; }
      case '@': { const v = readNumber(20); return Number.isNaN(v) ? null : new Date(v); }
      case '!': { const v = readNumber(25); return Number.isNaN(v) ? null : new Date((v - 621355968000000000) / 10000); }
      default: si++; fi++; break;
    }
  }
  if ([day, month, year].some((v) => Number.isNaN(v))) return null;
  const out = new Date(year, month, day);
  return Number.isNaN(out.getTime()) ? null : out;
}

/** Six-week grid for a month, including the leading/trailing days of the neighbours. */
export function monthGrid(year: number, month: number, firstDayOfWeek = 0) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() - firstDayOfWeek + 7) % 7;
  const start = new Date(year, month, 1 - lead);
  const cells: Array<{ date: Date; outside: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, outside: d.getMonth() !== month });
  }
  return cells;
}

export function weekdayLabels(locale: ApexDateLocale) {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) out.push(locale.dayNamesMin[(i + locale.firstDayOfWeek) % 7]);
  return out;
}
