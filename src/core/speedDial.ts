/** Item placement maths for ApexSpeedDial. Angles in degrees, screen coords in px. */
import type { ApexPermission } from '../types';

export type SpeedDialType = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';
export type SpeedDialDirection =
  | 'up' | 'down' | 'left' | 'right'
  | 'up-left' | 'up-right' | 'down-left' | 'down-right';

export interface SpeedDialItem {
  icon?: string;
  label?: string;
  /** Tooltip text. Falls back to `label`. */
  tooltip?: string;
  disabled?: boolean;
  href?: string;
  target?: string;
  /** Hide this action unless the permission resolver allows it. */
  can?: ApexPermission;
  /** Any payload you want back on @item-click. */
  [key: string]: unknown;
}

const RAD = Math.PI / 180;

/** Start angle and sweep for each arc type + direction, in degrees (0° = right, CCW). */
function arcFor(type: SpeedDialType, dir: SpeedDialDirection): { start: number; sweep: number } {
  if (type === 'circle') return { start: 0, sweep: 360 };
  if (type === 'semi-circle') {
    switch (dir) {
      case 'down': return { start: 180, sweep: 180 };
      case 'left': return { start: 90, sweep: 180 };
      case 'right': return { start: -90, sweep: 180 };
      default: return { start: 0, sweep: 180 }; // up
    }
  }
  // quarter-circle — the corner the items fan into
  switch (dir) {
    case 'down-right': case 'down': return { start: 0, sweep: -90 };
    case 'down-left': return { start: 180, sweep: 90 };
    case 'up-left': case 'left': return { start: 90, sweep: 90 };
    default: return { start: 0, sweep: 90 }; // up-right, up, right
  }
}

/**
 * Offset for item `i` of `count`.
 * `gap` is the linear spacing; `radius` the arc radius.
 */
export function itemOffset(
  i: number,
  count: number,
  type: SpeedDialType,
  dir: SpeedDialDirection,
  radius: number,
  gap: number,
): { x: number; y: number } {
  if (type === 'linear') {
    const d = gap * (i + 1);
    switch (dir) {
      case 'down': return { x: 0, y: d };
      case 'left': return { x: -d, y: 0 };
      case 'right': return { x: d, y: 0 };
      case 'up-left': return { x: -d, y: -d };
      case 'up-right': return { x: d, y: -d };
      case 'down-left': return { x: -d, y: d };
      case 'down-right': return { x: d, y: d };
      default: return { x: 0, y: -d };
    }
  }
  const { start, sweep } = arcFor(type, dir);
  // a full circle divides evenly; an arc puts items on both endpoints
  const steps = type === 'circle' ? count : Math.max(1, count - 1);
  const angle = start + (sweep * i) / steps;
  return { x: Math.cos(angle * RAD) * radius, y: -Math.sin(angle * RAD) * radius };
}

/** Where the tooltip sits, so it never overlaps the dial. */
export function tooltipSide(type: SpeedDialType, dir: SpeedDialDirection): 'top' | 'bottom' | 'left' | 'right' {
  if (type === 'linear') {
    if (dir === 'left' || dir.endsWith('-left')) return 'top';
    if (dir === 'right' || dir.endsWith('-right')) return 'top';
    return 'right';
  }
  return 'top';
}
