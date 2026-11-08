/**
 * Demo material for ApexScheduler — rooms and a seeded month of bookings.
 *
 * Ported from the gallery's `web/apex-scheduler-demo.js`, which says of itself:
 * "GALLERY CONTENT, not library code … deliberately not in core/scheduler".
 * The same holds here — this is the docs app's data, not the package's.
 *
 * Seeded from a fixed number so a reload shows the same schedule and a visual
 * diff means something.
 *
 * Note the vocabulary: a resource's leaf label is `room` and an event links by
 * `roomId`. Not `name`/`resourceId` — a fixture using those renders an empty
 * timeline, which reads as a broken control rather than a bad fixture.
 */
import { MIN15, startOfDay, daysInMonth } from '@exorgroup/apex-ui';

let seed = 20260614;
const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const ri = (a: number, b: number) => a + Math.floor(rng() * (b - a + 1));

export const SCHED_ROOMS = [
  { id: 'r1', country: 'United Kingdom', building: 'Aurora Centre', level: 'Ground Floor', room: 'Main Hall', cap: 320 },
  { id: 'r2', country: 'United Kingdom', building: 'Aurora Centre', level: 'Ground Floor', room: 'Studio A', cap: 60 },
  { id: 'r3', country: 'United Kingdom', building: 'Aurora Centre', level: 'Ground Floor', room: 'The Cellar', cap: 120 },
  { id: 'r4', country: 'United Kingdom', building: 'Aurora Centre', level: 'First Floor', room: 'Studio B', cap: 40 },
  { id: 'r5', country: 'United Kingdom', building: 'Aurora Centre', level: 'First Floor', room: 'Rooftop Terrace', cap: 90 },
  { id: 'r6', country: 'United Kingdom', building: 'Riverside Hall', level: 'Ground Floor', room: 'Riverside Auditorium', cap: 500 },
  { id: 'r7', country: 'United Kingdom', building: 'Riverside Hall', level: 'Ground Floor', room: 'Green Room', cap: 20 },
  { id: 'r8', country: 'Germany', building: 'Berlin Forum', level: 'Ground Floor', room: 'Forum Saal', cap: 250 },
  { id: 'r9', country: 'Germany', building: 'Berlin Forum', level: 'Ground Floor', room: 'Werkstatt', cap: 45 },
  { id: 'r10', country: 'Germany', building: 'Berlin Forum', level: 'Upper Floor', room: 'Glass Room', cap: 30 },
  { id: 'r11', country: 'Germany', building: 'Berlin Forum', level: 'Upper Floor', room: 'Loft', cap: 80 },
  { id: 'r12', country: 'France', building: 'Lumière', level: 'Ground Floor', room: 'Salle Lumière', cap: 200 },
];

const TYPE_TITLES: Record<string, string[]> = {
  event: ['Jazz Night Live', 'Tech Meetup #42', 'Wine Tasting', 'Comedy Hour', 'Product Launch', 'Film Screening', 'Open Mic'],
  private: ['Private Hire', 'Corporate Dinner', 'Wedding Reception', 'Board Meeting', 'VIP Reception'],
  maintenance: ['Deep Clean', 'AV Check', 'Stage Reset', 'HVAC Service', 'Lighting Rig'],
  blocked: ['Hold', 'Buffer', 'Not Bookable', 'Reserved'],
};

export const SCHED_GROUP_FIELDS = [
  { key: 'country', label: 'Country', icon: 'public' },
  { key: 'building', label: 'Building', icon: 'apartment' },
  { key: 'level', label: 'Floor', icon: 'layers' },
];

let eid = 0;
const mk = (roomId: string, start: number, end: number, type: string, title?: string, rrule?: string) => ({
  id: 'ev' + (eid += 1),
  roomId,
  type,
  title: title || pick(TYPE_TITLES[type]),
  start,
  end,
  rrule: rrule || null,
});

export function seedEvents() {
  const out: ReturnType<typeof mk>[] = [];
  const today = startOfDay(new Date());
  const y = today.getFullYear();
  const m = today.getMonth();
  const dim = daysInMonth(y, m);

  out.push(mk('r8', new Date(y, m, 1, 6, 0).getTime(), new Date(y, m, 1, 7, 0).getTime(), 'maintenance', 'HVAC Service', 'FREQ=WEEKLY;BYDAY=MO,TH'));
  out.push(mk('r1', new Date(y, m, 1, 23, 0).getTime(), new Date(y, m, 1, 23, 45).getTime(), 'maintenance', 'Deep Clean', 'FREQ=DAILY'));
  out.push(mk('r3', new Date(y, m, 1, 18, 0).getTime(), new Date(y, m, 1, 20, 0).getTime(), 'event', 'Choir Rehearsal', 'FREQ=WEEKLY;BYDAY=TU'));
  out.push(mk('r12', new Date(y, m, 1, 9, 0).getTime(), new Date(y, m, 1, 9, 15).getTime(), 'event', 'Daily Stand-up', 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'));
  out.push(mk('r6', new Date(y, m, 1, 8, 0).getTime(), new Date(y, m, 1, 9, 0).getTime(), 'maintenance', 'AV Check', 'FREQ=WEEKLY;BYDAY=FR'));

  const types = ['event', 'private', 'maintenance', 'blocked'];
  SCHED_ROOMS.forEach((r) => {
    let cur = ri(28, 40);
    const n = ri(2, 4);
    for (let i = 0; i < n; i += 1) {
      cur += ri(0, 5);
      const dur = ri(4, 16);
      if (cur + dur > 92) break;
      out.push(mk(r.id, today.getTime() + cur * MIN15, today.getTime() + (cur + dur) * MIN15, pick(types)));
      cur += dur;
    }
    if (rng() < 0.5) {
      const s = ri(34, 64);
      const d = ri(4, 10);
      out.push(mk(r.id, today.getTime() + s * MIN15, today.getTime() + (s + d) * MIN15, pick(types)));
    }
  });
  SCHED_ROOMS.forEach((r) => {
    const cnt = ri(3, 7);
    for (let i = 0; i < cnt; i += 1) {
      const day = ri(1, dim);
      const s = ri(32, 74);
      const d = ri(4, 12);
      const base = new Date(y, m, day).getTime();
      out.push(mk(r.id, base + s * MIN15, base + (s + d) * MIN15, pick(types)));
    }
  });
  SCHED_ROOMS.forEach((r) => {
    for (let mm = 0; mm < 12; mm += 1) {
      if (mm === m) continue;
      const k = ri(0, 3);
      for (let i = 0; i < k; i += 1) {
        const dd = ri(1, 28);
        const s = ri(32, 72);
        const d = ri(4, 16);
        const base = new Date(y, mm, dd).getTime();
        out.push(mk(r.id, base + s * MIN15, base + (s + d) * MIN15, pick(types)));
      }
    }
  });
  return out;
}
