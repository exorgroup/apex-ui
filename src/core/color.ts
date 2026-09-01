/** Colour model for ApexColorPicker. Immutable-ish helpers; every setter returns a new ApexColor. */

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';
export type Channel = 'r' | 'g' | 'b' | 'h' | 's' | 'l' | 'v' | 'a';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, p = 0) => Number(n.toFixed(p));

const CHANNEL_RANGE: Record<Channel, [number, number]> = {
  r: [0, 255], g: [0, 255], b: [0, 255],
  h: [0, 360], s: [0, 100], l: [0, 100], v: [0, 100], a: [0, 1],
};

const FORMAT_CHANNELS: Record<ColorFormat, Channel[]> = {
  hex: ['r', 'g', 'b', 'a'],
  rgb: ['r', 'g', 'b', 'a'],
  hsl: ['h', 's', 'l', 'a'],
  hsb: ['h', 's', 'v', 'a'],
};

function rgbToHsv(r: number, g: number, b: number) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb), d = max - min;
  let h = 0;
  if (d) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max ? (d / max) * 100 : 0, v: max * 100 };
}
function hsvToRgb(h: number, s: number, v: number) {
  const S = s / 100, V = v / 100;
  const c = V * S, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = V - c;
  const seg = Math.floor(h / 60) % 6;
  const [r1, g1, b1] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg < 0 ? 0 : seg];
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
}
function rgbToHsl(r: number, g: number, b: number) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}
function hslToRgb(h: number, s: number, l: number) {
  const S = s / 100, L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - c / 2;
  const seg = Math.floor(h / 60) % 6;
  const [r1, g1, b1] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg < 0 ? 0 : seg];
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
}
const hex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');

export class ApexColor {
  r: number; g: number; b: number; a: number;
  private format: ColorFormat;

  constructor(r = 0, g = 0, b = 0, a = 1, format: ColorFormat = 'hex') {
    this.r = clamp(r, 0, 255); this.g = clamp(g, 0, 255); this.b = clamp(b, 0, 255);
    this.a = clamp(a, 0, 1); this.format = format;
  }

  /** Parses #rgb, #rrggbb, #rrggbbaa, rgb(), rgba(), hsl(), hsla(), hsb()/hsv(). */
  static parse(input: string | ApexColor | null | undefined, fallback = '#000000'): ApexColor {
    if (input instanceof ApexColor) return input.clone();
    const s = String(input ?? fallback).trim().toLowerCase();
    let m: RegExpMatchArray | null;
    if ((m = s.match(/^#([0-9a-f]{3,8})$/))) {
      const h = m[1];
      const expand = h.length === 3 || h.length === 4 ? h.split('').map((c) => c + c).join('') : h;
      const r = parseInt(expand.slice(0, 2), 16), g = parseInt(expand.slice(2, 4), 16), b = parseInt(expand.slice(4, 6), 16);
      const a = expand.length === 8 ? parseInt(expand.slice(6, 8), 16) / 255 : 1;
      return new ApexColor(r, g, b, a, 'hex');
    }
    if ((m = s.match(/^rgba?\(([^)]+)\)$/))) {
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return new ApexColor(p[0], p[1], p[2], p[3] == null ? 1 : p[3], 'rgb');
    }
    if ((m = s.match(/^hsla?\(([^)]+)\)$/))) {
      const p = m[1].split(/[,\s/%]+/).filter(Boolean).map(Number);
      const { r, g, b } = hslToRgb(p[0], p[1], p[2]);
      return new ApexColor(r, g, b, p[3] == null ? 1 : p[3], 'hsl');
    }
    if ((m = s.match(/^hs[bv]a?\(([^)]+)\)$/))) {
      const p = m[1].split(/[,\s/%]+/).filter(Boolean).map(Number);
      const { r, g, b } = hsvToRgb(p[0], p[1], p[2]);
      return new ApexColor(r, g, b, p[3] == null ? 1 : p[3], 'hsb');
    }
    return ApexColor.parse(fallback, '#000000');
  }

  static fromHsv(h: number, s: number, v: number, a = 1, format: ColorFormat = 'hex') {
    const { r, g, b } = hsvToRgb(h, s, v);
    return new ApexColor(r, g, b, a, format);
  }

  clone() { return new ApexColor(this.r, this.g, this.b, this.a, this.format); }

  /** Returns the format of the color. */
  getFormat(): ColorFormat { return this.format; }

  /** Returns the channels of the color, for its current format. */
  getChannels(): Record<string, number> {
    const f = this.format;
    if (f === 'rgb' || f === 'hex') return { r: this.r, g: this.g, b: this.b, a: round(this.a, 2) };
    if (f === 'hsl') { const { h, s, l } = rgbToHsl(this.r, this.g, this.b); return { h: round(h), s: round(s), l: round(l), a: round(this.a, 2) }; }
    const { h, s, v } = rgbToHsv(this.r, this.g, this.b);
    return { h: round(h), s: round(s), v: round(v), a: round(this.a, 2) };
  }

  /** Returns the value of one channel, in any space. */
  getChannelValue(channel: Channel): number {
    if (channel === 'r') return this.r;
    if (channel === 'g') return this.g;
    if (channel === 'b') return this.b;
    if (channel === 'a') return round(this.a, 2);
    if (channel === 'l') return round(rgbToHsl(this.r, this.g, this.b).l);
    if (channel === 'v') return round(rgbToHsv(this.r, this.g, this.b).v);
    if (channel === 'h') return round(rgbToHsv(this.r, this.g, this.b).h);
    // 's' is space-dependent; follow the current format
    return this.format === 'hsl' ? round(rgbToHsl(this.r, this.g, this.b).s) : round(rgbToHsv(this.r, this.g, this.b).s);
  }

  /** Returns the [min, max] range of a channel. */
  getChannelRange(channel: Channel): [number, number] { return CHANNEL_RANGE[channel]; }

  /** Returns a new color with one channel changed. */
  setChannelValue(channel: Channel, value: number): ApexColor {
    const [lo, hi] = this.getChannelRange(channel);
    const v = clamp(value, lo, hi);
    if (channel === 'a') { const c = this.clone(); c.a = v; return c; }
    if (channel === 'r' || channel === 'g' || channel === 'b') {
      const c = this.clone();
      c[channel] = Math.round(v);
      return c;
    }
    if (channel === 'l') {
      const { h, s } = rgbToHsl(this.r, this.g, this.b);
      const { r, g, b } = hslToRgb(h, s, v);
      return new ApexColor(r, g, b, this.a, this.format);
    }
    if (channel === 's' && this.format === 'hsl') {
      const { h, l } = rgbToHsl(this.r, this.g, this.b);
      const { r, g, b } = hslToRgb(h, v, l);
      return new ApexColor(r, g, b, this.a, this.format);
    }
    const hsv = rgbToHsv(this.r, this.g, this.b);
    const next = { ...hsv, [channel === 'v' ? 'v' : channel]: v } as { h: number; s: number; v: number };
    return ApexColor.fromHsv(next.h, next.s, next.v, this.a, this.format);
  }

  /** Increments a channel by step, clamped to its range. */
  incChannelValue(channel: Channel, step = 1): ApexColor { return this.setChannelValue(channel, this.getChannelValue(channel) + step); }
  /** Decrements a channel by step, clamped to its range. */
  decChannelValue(channel: Channel, step = 1): ApexColor { return this.setChannelValue(channel, this.getChannelValue(channel) - step); }

  /** The two axes of the 2D colour area for a given pair, e.g. 'sv'. */
  getSpaceAxes(xyChannels: string = 'sv'): { x: Channel; y: Channel; xRange: [number, number]; yRange: [number, number] } {
    const [x, y] = xyChannels.split('') as Channel[];
    return { x, y, xRange: this.getChannelRange(x), yRange: this.getChannelRange(y) };
  }

  /** Converts to another format, keeping the same colour. */
  toFormat(format: ColorFormat): ApexColor {
    const c = this.clone();
    (c as unknown as { format: ColorFormat }).format = format;
    return c;
  }

  /** Serialises to a CSS string in the given format (defaults to the current one). */
  toString(format: ColorFormat = this.format): string {
    const a = round(this.a, 2);
    if (format === 'hex') {
      const base = `#${hex2(this.r)}${hex2(this.g)}${hex2(this.b)}`;
      return a < 1 ? base + hex2(a * 255) : base;
    }
    if (format === 'rgb') return a < 1 ? `rgba(${this.r}, ${this.g}, ${this.b}, ${a})` : `rgb(${this.r}, ${this.g}, ${this.b})`;
    if (format === 'hsl') {
      const { h, s, l } = rgbToHsl(this.r, this.g, this.b);
      return a < 1 ? `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${a})` : `hsl(${round(h)}, ${round(s)}%, ${round(l)}%)`;
    }
    const { h, s, v } = rgbToHsv(this.r, this.g, this.b);
    return a < 1 ? `hsba(${round(h)}, ${round(s)}%, ${round(v)}%, ${a})` : `hsb(${round(h)}, ${round(s)}%, ${round(v)}%)`;
  }

  /** Plain object: format, channels and the serialised string. */
  toJSON() { return { format: this.format, ...this.getChannels(), css: this.toString() }; }
}

export { rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb };
