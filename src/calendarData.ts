/**
 * Demo material for ApexCalendar.
 *
 * Ported from the gallery's shell. Dates are relative to today rather than
 * fixed, so the month view always has something in it — a calendar seeded with
 * last year's events looks broken rather than empty.
 *
 * A timed event carries `start`/`end` as epoch milliseconds; an all-day one
 * carries `startDate`/`endDate` as `YYYY-MM-DD`, because "the 3rd" is a date
 * and not an instant. That distinction is the one AF2-267b had to fix in the
 * type declarations.
 */
import { dayKey, addZonedDays, parseDayKey } from '@exorgroup/apex-ui';

const TZ = 'Europe/Malta';
const key = (n: number) => dayKey(addZonedDays(Date.now(), n, TZ), TZ);
const at = (n: number, h: number, m = 0) => parseDayKey(key(n), TZ) + h * 3600000 + m * 60000;

export const CAL_TYPES = {
  event: { label: 'Event', tone: 'info' },
  hire: { label: 'Private hire', tone: 'success' },
  maintenance: { label: 'Maintenance', tone: 'warn' },
  blocked: { label: 'Blocked', tone: 'neutral' },
};

export const CAL_EVENTS = [
  { id: 'k1', title: 'Autumn conference', type: 'event', allDay: true, startDate: key(2), endDate: key(6) },
  { id: 'k2', title: 'Stage build', type: 'maintenance', allDay: true, startDate: key(1), endDate: key(2) },
  { id: 'k3', title: 'Wedding reception', type: 'hire', start: at(3, 18), end: at(3, 23, 30) },
  { id: 'k4', title: 'Board meeting', type: 'event', resourceId: 'studio', start: at(0, 9, 30), end: at(0, 11) },
  { id: 'k5', title: 'Site walkthrough', type: 'event', resourceId: 'main', start: at(0, 10, 30), end: at(0, 12) },
  { id: 'k6', title: 'Catering tasting', type: 'hire', resourceId: 'cellar', start: at(0, 14), end: at(0, 15) },
  { id: 'k7', title: 'AV check', type: 'maintenance', resourceId: 'terrace', start: at(0, 16), end: at(0, 17) },
  { id: 'k8', title: 'Ops stand-up', type: 'event', start: at(-7, 9), end: at(-7, 9, 15),
    rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' },
  { id: 'k9', title: 'Deep clean', type: 'maintenance', start: at(-7, 22), end: at(-6, 0, 30),
    rrule: 'FREQ=DAILY', exdates: [at(-2, 22)] },
  { id: 'k10', title: 'Quarterly review', type: 'event', start: at(9, 10), end: at(9, 12) },
];

/** Tinted regions rather than blocks — a closure, not a booking. */
export const CAL_BG = [
  { id: 'kb1', title: 'Venue closed', type: 'blocked', allDay: true, startDate: key(12), endDate: key(14) },
];

/**
 * Declarative rules a move or resize must satisfy, checked before the host's
 * own `validate`. `allow` narrows to a window; `deny` carves an exception out.
 */
export const CAL_RULES = [
  { mode: 'allow', minTime: 480, maxTime: 1200,
    message: 'Bookings must be inside opening hours (08:00–20:00).' },
  { mode: 'deny', startDate: key(12), endDate: key(14),
    message: 'The venue is closed that week.' },
];

/** Rooms as COLUMNS in the day view — the scheduler's transpose. */
export const CAL_ROOMS = [
  { id: 'main', title: 'Main Hall' },
  { id: 'studio', title: 'Studio A' },
  { id: 'cellar', title: 'The Cellar' },
  { id: 'terrace', title: 'Rooftop Terrace' },
];
