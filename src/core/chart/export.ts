/**
 * Chart export.
 *
 * Returns strings and blobs rather than triggering downloads: the filename, the
 * destination and whether a download happens at all belong to the application,
 * the same call the task board's export makes.
 */
import type { ResolvedSeries } from './data';

/**
 * Serializes the live SVG, resolving CSS custom properties to literal colours.
 * A standalone file has no design system to look them up in, so an exported
 * chart that kept `var(--apex-cht-series-1)` would come out black.
 */
export function exportSvg(svg: SVGSVGElement, options?: { background?: string }): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const styles = getComputedStyle(svg);
  const rect = svg.getBoundingClientRect();

  const resolved: string[] = [];
  for (let i = 1; i <= 8; i += 1) {
    const v = styles.getPropertyValue(`--apex-cht-series-${i}`).trim();
    if (v) resolved.push(`--apex-cht-series-${i}:${v}`);
  }
  ['--apex-cht-grid', '--apex-cht-axis', '--apex-cht-tick', '--fg-default', '--fg-muted', '--fg-subtle',
    '--bg-surface', '--border-default', '--border-subtle', '--font-sans'].forEach((name) => {
    const v = styles.getPropertyValue(name).trim();
    if (v) resolved.push(`${name}:${v}`);
  });

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(Math.round(rect.width)));
  clone.setAttribute('height', String(Math.round(rect.height)));

  const css = `:root{${resolved.join(';')}}
.apex-cht__grid line{stroke:var(--apex-cht-grid)}
.apex-cht__axis line{stroke:var(--apex-cht-axis)}
.apex-cht__tick{fill:var(--apex-cht-tick);font:11px var(--font-sans,system-ui)}
.apex-cht__axis-title{fill:var(--fg-muted);font:600 11.5px var(--font-sans,system-ui)}
.apex-cht__label{fill:var(--fg-muted);font:600 10.5px var(--font-sans,system-ui)}
.apex-cht__line{fill:none;stroke-linejoin:round;stroke-linecap:round}
.apex-cht__area{stroke:none}
.apex-cht__dot{stroke:var(--bg-surface);stroke-width:1.5}`;
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = css;
  clone.insertBefore(style, clone.firstChild);

  if (options?.background) {
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', options.background);
    clone.insertBefore(bg, style.nextSibling);
  }
  return new XMLSerializer().serializeToString(clone);
}

export interface RasterOptions {
  scale?: number;
  background?: string;
  type?: 'image/png' | 'image/jpeg';
  quality?: number;
}

/** Rasterises the serialized SVG through an image, so what you get is what renders. */
export function exportRaster(svg: SVGSVGElement, options: RasterOptions = {}): Promise<Blob> {
  const scale = options.scale || 2;
  const type = options.type || 'image/png';
  /* JPEG has no alpha, so it needs an opaque backdrop or the chart comes out on
     black rather than on nothing. */
  const background = options.background
    || (type === 'image/jpeg' ? (getComputedStyle(svg).getPropertyValue('--bg-surface').trim() || '#fff') : undefined);
  const source = exportSvg(svg, { background });
  const rect = svg.getBoundingClientRect();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(rect.width * scale);
      canvas.height = Math.round(rect.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas unavailable')); return; }
      if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))),
        type, options.quality);
    };
    img.onerror = () => reject(new Error('svg load failed'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  });
}

/** One row per category, one column per series — the shape a spreadsheet wants. */
export function exportRows(series: ResolvedSeries[], categories: string[], categorical: boolean) {
  const keys: (string | number)[] = [];
  series.forEach((s) => s.points.forEach((p) => {
    if (!keys.includes(p.key)) keys.push(p.key);
  }));
  return keys.map((key) => {
    const row: Record<string, unknown> = {
      category: categorical
        ? key
        : (categories.length ? key : key),
    };
    series.forEach((s) => {
      const p = s.points.find((q) => q.key === key);
      row[s.name] = p && p.y !== null ? p.y : '';
    });
    return row;
  });
}

export function exportCsv(series: ResolvedSeries[], categories: string[], categorical: boolean) {
  const rows = exportRows(series, categories, categorical);
  const head = Object.keys(rows[0] || { category: '' });
  /* Every field wrapped and quotes doubled: a series named "Revenue, net" is
     ordinary, and an unquoted CSV would silently gain a column. */
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  /* The header goes through cell() too: it is exactly where an unquoted comma
     bites, since the column names are the series names. */
  return [head.map(cell).join(',')]
    .concat(rows.map((r) => head.map((k) => cell(r[k])).join(',')))
    .join('\n');
}
