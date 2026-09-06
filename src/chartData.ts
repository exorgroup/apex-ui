/**
 * Chart demo data, lifted from the gallery.
 *
 * Twenty-one datasets, verbatim: the shapes are what the examples are about —
 * a gappy series that proves connectNulls, a 50,000-point series that proves
 * decimation, a log series that spans four orders of magnitude. Rewriting them
 * "cleanly" would quietly change what the sections demonstrate.
 *
 * Kept out of App.vue because the page is already long, and out of registry.ts
 * because it is demo data, not documentation.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Row builder: one label column plus a value, which is the shape every
    category example wants. */
const pair = (labels: string[], values: (number | null)[], key?: string) => labels.map((m, i) => {
  const row: Record<string, unknown> = { value: values[i] };
  row[key || 'month'] = m;
  return row;
}) as any[];

export const CHT_TRIAL = pair(MONTHS, [41, 46, 49, 45, 53, 58, 57, 61, 64, 62, 68, 72]);
export const CHT_REVENUE = pair(MONTHS, [12400, 14200, 16800, 15300, 18900, 21500, 24100, 22800, 19600, 17200, 15300, 18200]);
export const CHT_SHAPE = pair(['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
  [12, 15, 19, 24, 26, 23, 20, 16], 'hour');
export const CHT_GAPPY = pair(MONTHS.slice(0, 9), [42, 48, null, null, 65, 72, null, 80, 76]);
export const CHT_LOG = pair(MONTHS, [140, 380, 920, 2400, 6100, 14000, 31000, 62000, 118000, 240000, 460000, 880000]);
export const CHT_REGIONS = [
  { region: 'Northern Europe', value: 34 }, { region: 'Southern Europe', value: 28 },
  { region: 'North America East', value: 46 }, { region: 'North America West', value: 39 },
  { region: 'Asia Pacific South', value: 22 }, { region: 'Middle East and Africa', value: 17 },
];
export const CHT_CHANNELS = [
  { id: 'self', name: 'Self-serve', data: pair(MONTHS, [42, 45, 47, 50, 53, 55, 56, 58, 57, 59, 61, 64]), xKey: 'month', yKey: 'value' },
  { id: 'assist', name: 'Sales-assist', data: pair(MONTHS, [28, 30, 31, 33, 35, 36, 38, 39, 40, 41, 41, 43]), xKey: 'month', yKey: 'value' },
  { id: 'partner', name: 'Partner', data: pair(MONTHS, [18, 17, 19, 20, 22, 23, 23, 24, 25, 25, 27, 29]), xKey: 'month', yKey: 'value' },
];
export const CHT_WEATHER = [
  { id: 'temp', name: 'Temperature (\u00b0C)', data: pair(MONTHS, [2, 4, 9, 14, 19, 24, 26, 25, 20, 13, 7, 3]), xKey: 'month', yKey: 'value' },
  { id: 'rain', name: 'Rainfall (mm)', data: pair(MONTHS, [82, 61, 66, 54, 47, 31, 29, 38, 57, 70, 76, 84]), xKey: 'month', yKey: 'value', axis: 'right' },
];
export const CHT_DAILY = (function () {
  const out = [];
  const start = Date.UTC(2026, 4, 1);
  let v = 480;
  for (let i = 0; i < 90; i += 1) {
    v += Math.sin(i / 6) * 34 + (i % 7 === 0 ? -60 : 12) + (i % 13 === 0 ? 45 : 0);
    out.push({ date: start + i * 864e5, value: Math.max(120, Math.round(v)) });
  }
  return out;
}());
/* 50k points: the case decimation exists for. Deterministic, so the shape is
   the same every reload and the spikes are visible rather than random. */
export const CHT_BIG = (function () {
  const out = [];
  let v = 50;
  for (let i = 0; i < 50000; i += 1) {
    v += Math.sin(i / 900) * 0.9 + Math.sin(i / 37) * 0.35;
    const spike = i % 8137 === 0 ? 22 : (i % 5231 === 0 ? -18 : 0);
    out.push({ i: i, v: Number((v + spike).toFixed(2)) });
  }
  return out;
}());

export const CHT_STACK = [
  { id: 'direct', name: 'Direct', stack: 'traffic', xKey: 'month', yKey: 'value', fillOpacity: 0.5,
    data: pair(MONTHS, [4200, 4600, 4900, 5100, 5000, 5300, 5600, 5400, 5700, 5900, 6100, 6400]) },
  { id: 'organic', name: 'Organic', stack: 'traffic', xKey: 'month', yKey: 'value', fillOpacity: 0.5,
    data: pair(MONTHS, [6100, 6800, 7400, 7200, 7900, 8600, 9100, 8800, 9400, 9900, 10400, 11200]) },
  { id: 'paid', name: 'Paid', stack: 'traffic', xKey: 'month', yKey: 'value', fillOpacity: 0.5,
    data: pair(MONTHS, [2400, 2900, 3300, 3100, 3600, 4200, 4600, 4400, 4100, 3800, 4300, 4900]) },
];
export const CHT_BAND = MONTHS.map((m, i) => {
  const mid = [8, 11, 15, 19, 24, 29, 32, 31, 27, 21, 14, 9][i];
  return { month: m, mid: mid, low: mid - (3 + i % 4), high: mid + (4 + (i * 2) % 6) };
});
export const CHT_TREND = pair(MONTHS, [142, 155, 148, 162, 158, 172, 165, 178, 170, 185, 180, 195]);
export const CHT_CROSSING = [
  { id: 'a', name: 'Plan', xKey: 'month', yKey: 'value', fillOpacity: 0.3,
    data: pair(MONTHS.slice(0, 6), [42, 51, 49, 58, 68, 71]) },
  { id: 'b', name: 'Actual', xKey: 'month', yKey: 'value', fillOpacity: 0.3,
    data: pair(MONTHS.slice(0, 6), [38, 50, 52, 55, 63, 72]) },
];
export const CHT_CROSSING_HALO = CHT_CROSSING.map((sr) => Object.assign({}, sr, {
  borderColor: 'var(--bg-surface)', borderStrokeWidth: 6,
}));
export const CHT_GRADIENT = [
  { id: 'sessions', name: 'Sessions', xKey: 'month', yKey: 'value', fillOpacity: 0.55,
    data: pair(MONTHS, [48, 52, 61, 58, 67, 73, 79, 76, 70, 64, 59, 66]),
    color: { stops: [
      { offset: 0, color: 'oklch(0.66 0.15 195)' },
      { offset: 1, color: 'oklch(0.66 0.15 195)', opacity: 0.05 },
    ] } },
  { id: 'signups', name: 'Signups', xKey: 'month', yKey: 'value', lineStrokeWidth: 3,
    data: pair(MONTHS, [22, 26, 29, 31, 36, 41, 44, 46, 43, 40, 44, 50]),
    color: { stops: [
      { offset: 0, color: 'oklch(0.62 0.19 25)' },
      { offset: 1, color: 'oklch(0.58 0.17 300)' },
    ] } },
];
export const CHT_SHAPES = ['circle', 'square', 'triangle', 'cross', 'star', 'diamond'].map((shape, i) => ({
  id: shape, name: shape, xKey: 'month', yKey: 'value', markerShape: shape, showMarkers: true,
  data: pair(MONTHS.slice(0, 7), [20, 34, 28, 42, 36, 50, 44].map((v) => v + i * 9)),
}));
export const CHT_STYLES = [
  { id: 'actual', name: 'Actual', xKey: 'month', yKey: 'value', curve: 'smooth', lineStrokeWidth: 3,
    data: pair(MONTHS.slice(0, 7), [4200, 4600, 5100, 5400, 5200, 6100, 6800]) },
  { id: 'target', name: 'Target', xKey: 'month', yKey: 'value', curve: 'linear',
    lineDash: [8, 5], lineStrokeWidth: 2,
    data: pair(MONTHS.slice(0, 7), [4000, 4500, 5000, 5500, 6000, 6500, 7000]) },
  { id: 'floor', name: 'Floor', xKey: 'month', yKey: 'value', curve: 'step',
    lineDash: [2, 4], lineCap: 'butt',
    data: pair(MONTHS.slice(0, 7), [3800, 3800, 4400, 4400, 4400, 5000, 5000]) },
];

export const CHT_SYNC_A = [{
  id: 'sessions', name: 'Sessions', xKey: 'date', yKey: 'value', fillOpacity: 0.14,
  data: CHT_DAILY,
}];
export const CHT_SYNC_B = [{
  id: 'errors', name: 'Errors', xKey: 'date', yKey: 'value',
  data: CHT_DAILY.map((r, i) => ({
    date: r.date,
    value: Math.max(0, Math.round(r.value / 26 + Math.sin(i / 4) * 4 + (i % 11 === 0 ? 14 : 0))),
  })),
}];

const RD_COUNTRIES = ['Korea', 'US', 'Japan', 'Germany', 'France', 'UK', 'Canada', 'Italy'];

export const CHT_RD = [
  { id: 'business', name: 'Business', type: 'bar', xKey: 'country', yKey: 'value',
    data: RD_COUNTRIES.map((c, i) => ({ country: c, value: [3.2, 2.5, 2.6, 2.1, 1.5, 1.7, 0.95, 0.95][i] })) },
  { id: 'gov', name: 'Government', type: 'bar', xKey: 'country', yKey: 'value',
    data: RD_COUNTRIES.map((c, i) => ({ country: c, value: [0.35, 0.22, 0.23, 0.5, 0.29, 0.11, 0.16, 0.14][i] })) },
  { id: 'higher', name: 'Higher education', type: 'bar', xKey: 'country', yKey: 'value',
    data: RD_COUNTRIES.map((c, i) => ({ country: c, value: [0.4, 0.28, 0.29, 0.55, 0.4, 0.44, 0.62, 0.42][i] })) },
];
