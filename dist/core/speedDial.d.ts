/** Item placement maths for ApexSpeedDial. Angles in degrees, screen coords in px. */
import type { ApexPermission } from '../types';
export type SpeedDialType = 'linear' | 'circle' | 'semi-circle' | 'quarter-circle';
export type SpeedDialDirection = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
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
/**
 * Offset for item `i` of `count`.
 * `gap` is the linear spacing; `radius` the arc radius.
 */
export declare function itemOffset(i: number, count: number, type: SpeedDialType, dir: SpeedDialDirection, radius: number, gap: number): {
    x: number;
    y: number;
};
/** Where the tooltip sits, so it never overlaps the dial. */
export declare function tooltipSide(type: SpeedDialType, dir: SpeedDialDirection): 'top' | 'bottom' | 'left' | 'right';
