/**
 * Anchored overlay positioning, shared by ConfirmPopup, Popover and Tooltip.
 *
 * Placement is resolved against the viewport: the preferred side is used when it
 * fits, otherwise the overlay flips to the opposite side, and it is then shifted
 * along the cross axis to stay on screen. Coordinates are viewport-relative, for
 * a `position: fixed` overlay — so the anchor cannot drift inside a scrolled or
 * transformed ancestor.
 */

export type AnchorSide = 'top' | 'bottom' | 'left' | 'right';
export type AnchorAlign = 'start' | 'center' | 'end';

export interface AnchorResult {
  x: number;
  y: number;
  /** The side actually used, after any flip. */
  side: AnchorSide;
  /** Arrow offset along the overlay's cross axis, in pixels. */
  arrow: number;
}

const OPPOSITE: Record<AnchorSide, AnchorSide> = {
  top: 'bottom', bottom: 'top', left: 'right', right: 'left',
};

export function resolveTarget(target: unknown): HTMLElement | null {
  if (!target) return null;
  /* A getter, so a template can pass () => $refs.zone and still resolve after
     mount rather than capturing an undefined ref. */
  if (typeof target === 'function') return resolveTarget((target as () => unknown)());
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  if (target instanceof Event) return (target.currentTarget || target.target) as HTMLElement;
  if (target instanceof HTMLElement) return target;
  const maybe = target as { $el?: HTMLElement; getBoundingClientRect?: () => DOMRect };
  if (maybe.$el instanceof HTMLElement) return maybe.$el;
  if (typeof maybe.getBoundingClientRect === 'function') return target as HTMLElement;
  return null;
}

export function anchorPosition(
  targetRect: DOMRect,
  overlay: { width: number; height: number },
  opts: { side?: AnchorSide; align?: AnchorAlign; gap?: number; padding?: number; flip?: boolean } = {},
): AnchorResult {
  const side0 = opts.side || 'bottom';
  const align = opts.align || 'center';
  const gap = opts.gap ?? 8;
  const pad = opts.padding ?? 8;
  const vw = window.innerWidth, vh = window.innerHeight;

  const room = {
    top: targetRect.top - pad,
    bottom: vh - targetRect.bottom - pad,
    left: targetRect.left - pad,
    right: vw - targetRect.right - pad,
  };
  const need = (s: AnchorSide) => (s === 'top' || s === 'bottom' ? overlay.height : overlay.width) + gap;

  // flip only when the preferred side cannot hold it and the opposite one can
  let side = side0;
  if (opts.flip !== false && room[side0] < need(side0) && room[OPPOSITE[side0]] >= need(side0)) {
    side = OPPOSITE[side0];
  }

  const vertical = side === 'top' || side === 'bottom';
  let x: number, y: number;

  if (vertical) {
    y = side === 'bottom' ? targetRect.bottom + gap : targetRect.top - overlay.height - gap;
    const startX = targetRect.left;
    const centerX = targetRect.left + targetRect.width / 2 - overlay.width / 2;
    const endX = targetRect.right - overlay.width;
    x = align === 'start' ? startX : align === 'end' ? endX : centerX;
    x = Math.min(Math.max(pad, x), vw - overlay.width - pad);
  } else {
    x = side === 'right' ? targetRect.right + gap : targetRect.left - overlay.width - gap;
    const startY = targetRect.top;
    const centerY = targetRect.top + targetRect.height / 2 - overlay.height / 2;
    const endY = targetRect.bottom - overlay.height;
    y = align === 'start' ? startY : align === 'end' ? endY : centerY;
    y = Math.min(Math.max(pad, y), vh - overlay.height - pad);
  }

  /* The arrow tracks the target's centre even after the overlay has been shifted
     back on screen, so it keeps pointing at what opened it. */
  const arrow = vertical
    ? Math.min(Math.max(12, targetRect.left + targetRect.width / 2 - x), overlay.width - 12)
    : Math.min(Math.max(12, targetRect.top + targetRect.height / 2 - y), overlay.height - 12);

  return { x, y, side, arrow };
}
