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
  const out: any[] = [];
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
  const out: any[] = [];
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

/* ── The bar, scatter and combo families (sections 27-47) ──────────────── */

export const CHT_WATERFALL = [
  { label: 'Opening', value: 42000, total: true },
  { label: 'New', value: 18500 },
  { label: 'Expansion', value: 7200 },
  { label: 'Churn', value: -6400 },
  { label: 'Discounts', value: -2100 },
  { label: 'Closing', value: 59200, total: true },
];
export const CHT_SCATTER = (function () {
  const cluster = (n: number, cx: number, cy: number, spread: number, seed: number) => {
    const out: any[] = [];
    let r = seed;
    for (let i = 0; i < n; i += 1) {
      r = (r * 1103515245 + 12345) % 2147483648;
      const a = (r / 2147483648) * Math.PI * 2;
      r = (r * 1103515245 + 12345) % 2147483648;
      const d = (r / 2147483648) * spread;
      out.push({ x: Math.round(cx + Math.cos(a) * d), y: Number((cy + Math.sin(a) * d * 0.06).toFixed(2)) });
    }
    return out;
  };
  return [
    { id: 'self', name: 'Self-serve', type: 'scatter', xKey: 'x', yKey: 'y',
      data: cluster(46, 620, 3.2, 340, 7), markerSize: 4 },
    { id: 'assisted', name: 'Sales-assisted', type: 'scatter', xKey: 'x', yKey: 'y',
      data: cluster(38, 1750, 6.1, 520, 91), markerSize: 4 },
  ];
}());
export const CHT_BUBBLE = [
  { id: 'smb', name: 'SMB', type: 'bubble', xKey: 'seats', yKey: 'retention', rKey: 'value',
    fillOpacity: 0.45, minSize: 5, maxSize: 26,
    data: [
      { seats: 12, retention: 78, value: 4200 }, { seats: 28, retention: 82, value: 9100 },
      { seats: 45, retention: 74, value: 6400 }, { seats: 63, retention: 88, value: 21000 },
      { seats: 22, retention: 69, value: 2800 }, { seats: 51, retention: 85, value: 15600 },
    ] },
  { id: 'ent', name: 'Enterprise', type: 'bubble', xKey: 'seats', yKey: 'retention', rKey: 'value',
    fillOpacity: 0.45, minSize: 5, maxSize: 26,
    data: [
      { seats: 180, retention: 94, value: 84000 }, { seats: 320, retention: 91, value: 142000 },
      { seats: 96, retention: 89, value: 46000 }, { seats: 410, retention: 96, value: 210000 },
      { seats: 240, retention: 87, value: 98000 },
    ] },
];
export const CHT_COMBO = [
  { id: 'direct', name: 'Direct', type: 'bar', stack: 'rev', xKey: 'month', yKey: 'value',
    data: pair(MONTHS, [4200, 4600, 4900, 5100, 5000, 5300, 5600, 5400, 5700, 5900, 6100, 6400]) },
  { id: 'partner', name: 'Partner', type: 'bar', stack: 'rev', xKey: 'month', yKey: 'value',
    data: pair(MONTHS, [2400, 2900, 3300, 3100, 3600, 4200, 4600, 4400, 4100, 3800, 4300, 4900]) },
  { id: 'target', name: 'Target', type: 'line', xKey: 'month', yKey: 'value',
    lineDash: [7, 5], data: pair(MONTHS, [6200, 7000, 7800, 8300, 8800, 9400, 10000, 10200, 10400, 10600, 11000, 11600]) },
  { id: 'conv', name: 'Conversion %', type: 'line', axis: 'right', xKey: 'month', yKey: 'value',
    fillOpacity: 0.12, data: pair(MONTHS, [2.1, 2.4, 2.3, 2.8, 3.1, 3.4, 3.2, 3.6, 3.9, 3.7, 4.1, 4.4]) },
];

export const CHT_MIX = [
  { label: 'Self-serve', value: 4200 }, { label: 'Sales-assisted', value: 3100 },
  { label: 'Partner', value: 1800 }, { label: 'Marketplace', value: 950 },
  { label: 'Other', value: 420 },
];

export const CHT_SEVERITY = [
  { label: 'Critical', value: 42 }, { label: 'High', value: 61 }, { label: 'Medium', value: 90 },
  { label: 'Low', value: 55 }, { label: 'Backlog', value: 18 },
];
export const CHT_DELTA = pair(MONTHS.slice(0, 8), [1.1, -0.8, 2.1, -0.35, 1.7, -1.6, 3.0, 0.6]);
export const CHT_SIZING = [{
  id: 'docks', name: 'Parcels per hour', type: 'bar', xKey: 'label', yKey: 'value',
  data: [
    { label: 'Dock 1', value: 79 }, { label: 'Dock 2', value: 54 }, { label: 'Dock 3', value: 91 },
    { label: 'Dock 4', value: 39 }, { label: 'Dock 5', value: 67 }, { label: 'Dock 6', value: 74 },
    { label: 'Dock 7', value: 87 }, { label: 'Dock 8', value: 0.3 },
  ],
}];
export const CHT_BORDER = [{
  id: 'sla', name: 'SLA checks', type: 'bar', xKey: 'month', yKey: 'value',
  fillOpacity: 1, data: pair(MONTHS.slice(0, 5), [310, 268, 402, 351, 448]),
}];
export const CHT_TARGET = [
  { id: 'target', name: 'Target', type: 'bar', xKey: 'month', yKey: 'value',
    color: 'var(--bg-muted)',
    data: pair(MONTHS.slice(0, 6), [100, 100, 105, 100, 100, 110]) },
  { id: 'actual', name: 'Actual', type: 'bar', xKey: 'month', yKey: 'value',
    data: pair(MONTHS.slice(0, 6), [78, 92, 104, 88, 95, 112]) },
];
const YEARS = ['2019', '2020', '2021', '2022', '2023'];
export const CHT_GROUPED_STACK = [
  { id: 'hw', name: 'Hardware', type: 'bar', stack: 'products', xKey: 'year', yKey: 'value',
    data: YEARS.map((y, i) => ({ year: y, value: [140, 148, 156, 152, 158][i] })) },
  { id: 'sw', name: 'Software', type: 'bar', stack: 'products', xKey: 'year', yKey: 'value',
    data: YEARS.map((y, i) => ({ year: y, value: [62, 74, 96, 128, 162][i] })) },
  { id: 'subs', name: 'Subscriptions', type: 'bar', stack: 'products', xKey: 'year', yKey: 'value',
    data: YEARS.map((y, i) => ({ year: y, value: [58, 66, 78, 92, 108][i] })) },
  { id: 'cloud', name: 'Cloud', type: 'bar', stack: 'services', xKey: 'year', yKey: 'value',
    data: YEARS.map((y, i) => ({ year: y, value: [70, 96, 132, 168, 206][i] })) },
  { id: 'prof', name: 'Professional', type: 'bar', stack: 'services', xKey: 'year', yKey: 'value',
    data: YEARS.map((y, i) => ({ year: y, value: [42, 46, 52, 58, 64][i] })) },
  { id: 'supp', name: 'Support', type: 'bar', stack: 'services', xKey: 'year', yKey: 'value',
    data: YEARS.map((y, i) => ({ year: y, value: [26, 30, 36, 44, 54][i] })) },
];
export const CHT_GANTT = [
  { task: 'Site survey', start: 0, end: 2 }, { task: 'Permits', start: 1.5, end: 5 },
  { task: 'Fiber pull', start: 4, end: 8 }, { task: 'Equipment install', start: 7, end: 10 },
  { task: 'Acceptance test', start: 9.5, end: 11.5 }, { task: 'Customer handoff', start: 11, end: 13 },
];

const AGES = ['0\u201314', '15\u201329', '30\u201344', '45\u201359', '60\u201374', '75+'];
export const CHT_PYRAMID = [
  { id: 'male', name: 'Male', type: 'bar', stack: 'pop', xKey: 'age', yKey: 'value',
    data: AGES.map((a, i) => ({ age: a, value: -[1.43, 1.05, 1.02, 0.86, 0.52, 0.26][i] })) },
  { id: 'female', name: 'Female', type: 'bar', stack: 'pop', xKey: 'age', yKey: 'value',
    data: AGES.map((a, i) => ({ age: a, value: [1.35, 1.00, 0.98, 0.85, 0.57, 0.39][i] })) },
];


export const CHT_DAILY_BARS = (function () {
  const out: any[] = [];
  for (let i = 0; i < 60; i += 1) {
    const wave = Math.sin(i / 7) * 90 + Math.sin(i / 3) * 25;
    out.push({ day: 'Day ' + (i + 1), value: Math.max(20, Math.round(210 + wave)) });
  }
  return out;
}());

export const CHT_LONGTAIL = [
  { label: 'Paid search', value: 3200 }, { label: 'Organic', value: 2400 },
  { label: 'Lifecycle email', value: 1800 }, { label: 'Partner', value: 1400 },
  { label: 'Community', value: 1200 }, { label: 'Events', value: 620 },
  { label: 'Affiliate', value: 380 }, { label: 'Podcast', value: 210 },
  { label: 'Referral', value: 140 }, { label: 'Other', value: 90 },
];

export const CHT_RENEWAL = (function () {
  const out: any[] = [];
  for (let i = 0; i < 14; i += 1) {
    const adoption = 46 + i * 3.6;
    out.push({ adoption: Number(adoption.toFixed(1)), renewal: Number((41 + i * 3.9 + (i % 3)).toFixed(1)) });
  }
  return out;
}());
export const CHT_OVERLAP = ['Product-led', 'Partner', 'Outbound'].map((name, si) => ({
  id: 'ov' + si, name: name, type: 'scatter', markerSize: 7,
  data: Array.from({ length: 9 }, (_, i) => ({
    x: 8 + i * 7 + si * 2,
    y: 30 + i * 2.6 + si * 5 + (i % 2 ? 1.5 : -1.5),
  })),
}));
export const CHT_DEPTH = [{
  id: 'depth', name: 'Deals', type: 'bubble', xKey: 'days', yKey: 'confidence', rKey: 'size',
  fillOpacity: 0.85, minSize: 8, maxSize: 30,
  color: { type: 'radial', stops: [
    { offset: 0, color: 'oklch(0.86 0.06 265)' },
    { offset: 0.55, color: 'oklch(0.66 0.15 265)' },
    { offset: 1, color: 'oklch(0.48 0.16 270)' },
  ] },
  data: Array.from({ length: 12 }, (_, i) => ({
    days: 8 + i * 6,
    confidence: 86 - i * 5 + (i % 3) * 2,
    size: 20 + ((i * 37) % 80),
  })),
}];
export const CHT_BETS = [
  { effort: 8, impact: 55 }, { effort: 13, impact: 42 }, { effort: 22, impact: 63 },
  { effort: 30, impact: 49 }, { effort: 38, impact: 76 }, { effort: 45, impact: 68 },
];
export const CHT_HUBS = [
  { hub: 'ATL', load: 34, delay: 28 }, { hub: 'DFW', load: 47, delay: 39 },
  { hub: 'LAX', load: 58, delay: 54 }, { hub: 'ORD', load: 68, delay: 61 },
  { hub: 'SEA', load: 79, delay: 73 }, { hub: 'EWR', load: 90, delay: 84 },
];

export const CHT_CLUSTERS = (function () {
  /* Deterministic clusters, so a 2D zoom has something real to isolate. */
  const mk = (n: number, cx: number, cy: number, sx: number, sy: number, seed: number) => {
    const out: any[] = [];
    let r = seed;
    for (let i = 0; i < n; i += 1) {
      r = (r * 1103515245 + 12345) % 2147483648;
      const a = (r / 2147483648) * Math.PI * 2;
      r = (r * 1103515245 + 12345) % 2147483648;
      const d = r / 2147483648;
      out.push({
        x: Math.round(cx + Math.cos(a) * d * sx),
        y: Number((cy + Math.sin(a) * d * sy).toFixed(1)),
      });
    }
    return out;
  };
  return [
    { id: 'short', name: 'Short haul', type: 'scatter', markerSize: 5,
      data: mk(40, 120, 38, 70, 12, 11) },
    { id: 'medium', name: 'Medium haul', type: 'scatter', markerSize: 5,
      data: mk(40, 280, 55, 90, 14, 907) },
    { id: 'long', name: 'Long haul', type: 'scatter', markerSize: 5,
      data: mk(40, 430, 72, 80, 13, 5501) },
  ];
}());
export const CHT_TURNAROUND = [{
  id: 'turn', name: 'Turnaround', type: 'scatter', markerSize: 5,
  data: CHT_CLUSTERS[1].data.map((p) => ({ x: p.x, y: Number((18 + p.y * 0.42).toFixed(1)) })),
}];

/* ── The radial, heatmap, treemap and candle families (sections 48-66) ── */

export const CHT_RADAR = [
  { id: 'now', name: 'This quarter', type: 'radar', xKey: 'axis', yKey: 'value',
    data: [
      { axis: 'Speed', value: 82 }, { axis: 'Reliability', value: 74 },
      { axis: 'Coverage', value: 61 }, { axis: 'Support', value: 88 },
      { axis: 'Cost', value: 55 }, { axis: 'Security', value: 79 },
    ] },
  { id: 'prev', name: 'Last quarter', type: 'radar', xKey: 'axis', yKey: 'value',
    data: [
      { axis: 'Speed', value: 64 }, { axis: 'Reliability', value: 70 },
      { axis: 'Coverage', value: 48 }, { axis: 'Support', value: 72 },
      { axis: 'Cost', value: 62 }, { axis: 'Security', value: 58 },
    ] },
];
export const CHT_ROSE = [{
  id: 'wind', name: 'Incidents', type: 'polar', xKey: 'dir', yKey: 'value',
  data: [
    { dir: 'N', value: 34 }, { dir: 'NE', value: 21 }, { dir: 'E', value: 48 },
    { dir: 'SE', value: 62 }, { dir: 'S', value: 41 }, { dir: 'SW', value: 28 },
    { dir: 'W', value: 55 }, { dir: 'NW', value: 39 },
  ],
}];

export const CHT_HEAT = (function () {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['00', '03', '06', '09', '12', '15', '18', '21'];
  const out: any[] = [];
  days.forEach((d, di) => hours.forEach((h, hi) => {
    const peak = Math.exp(-Math.pow(hi - 4.2, 2) / 5) * (di < 5 ? 1 : 0.45);
    out.push({ hour: h, day: d, value: Math.round(20 + peak * 180 + ((di * 7 + hi * 3) % 11)) });
  }));
  return out;
}());
export const CHT_OHLC = (function () {
  const out: any[] = [];
  let price = 148;
  for (let i = 0; i < 42; i += 1) {
    const drift = Math.sin(i / 5) * 2.4 + (i % 9 === 0 ? -3.2 : 0.6);
    const open = price;
    const close = Number((open + drift).toFixed(2));
    const high = Number((Math.max(open, close) + 1.1 + (i % 4) * 0.5).toFixed(2));
    const low = Number((Math.min(open, close) - 0.9 - (i % 3) * 0.4).toFixed(2));
    out.push({
      volume: Math.round(400 + ((price * 37) % 620)), day: 'D' + (i + 1), open: open, high: high, low: low, close: close });
    price = close;
  }
  return out;
}());
export const CHT_TREE = [
  { name: 'Platform', children: [
    { name: 'Compute', value: 42000 }, { name: 'Storage', value: 18500 },
    { name: 'Network', value: 9200 }, { name: 'Observability', value: 6400 },
  ] },
  { name: 'Product', children: [
    { name: 'Web app', value: 28000 }, { name: 'Mobile', value: 14200 },
    { name: 'API', value: 11800 }, { name: 'Integrations', value: 5100 },
  ] },
  { name: 'Go to market', children: [
    { name: 'Paid media', value: 22000 }, { name: 'Events', value: 8600 },
    { name: 'Content', value: 6200 },
  ] },
  { name: 'Support', children: [
    { name: 'Tier 1', value: 12400 }, { name: 'Tier 2', value: 7800 },
  ] },
];

export const CHT_HOLLOW = (function () {
  /* Both disagreement cases, several times each:
       HOLLOW + down  — opened below yesterday's close, rose, still closed lower
       SOLID  + up    — opened above yesterday's close, fell, still closed higher */
  const rows = [
    [100, 104],
    [108, 106], // solid (fell from open) but 106 > 104 → up
    [101, 103], // hollow (rose) but 103 < 106 → down
    [99, 102], // hollow but 102 < 103 → down
    [107, 105], // solid but 105 > 102 → up
    [104, 101],
    [97, 100], // hollow, 100 < 101 → down
    [103, 102], // solid, 102 > 100 → up
    [99, 104],
    [109, 106], // solid, 106 > 104 → up
    [102, 105], // hollow, 105 < 106 → down
    [100, 103], // hollow, 103 < 105 → down
    [108, 106], // solid, 106 > 103 → up
    [105, 102],
    [98, 101], // hollow, 101 < 102 → down
    [104, 107],
    [110, 108], // solid, 108 > 107 → up
    [106, 109],
    [112, 110], // solid, 110 > 109 → up
    [107, 111],
  ];
  return rows.map((r, i) => ({
    day: 'D' + (i + 1),
    open: r[0], close: r[1],
    high: Math.max(r[0], r[1]) + 2,
    low: Math.min(r[0], r[1]) - 2,
  }));
}());

/* Four decades of price, so a log axis has something to compress. */
export const CHT_BTC = (function () {
  const out: any[] = [];
  let price = 62000;
  const path = [-0.06, -0.09, -0.12, -0.07, 0.03, -0.11, -0.08, 0.05, -0.06, 0.04,
    0.08, 0.03, 0.11, 0.06, -0.04, 0.09, 0.13, 0.07, 0.15, 0.09, 0.05, 0.12, 0.08, 0.14];
  path.forEach((step, i) => {
    const o = price;
    const c = Math.max(15500, o * (1 + step));
    out.push({
      week: 'W' + (i + 1),
      open: Math.round(o), close: Math.round(c),
      high: Math.round(Math.max(o, c) * 1.05),
      low: Math.round(Math.min(o, c) * 0.94),
    });
    price = c;
  });
  return out;
}());
