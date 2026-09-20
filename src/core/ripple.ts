import type { App, Directive, DirectiveBinding, Plugin } from 'vue';

/**
 * ApexRipple — a ripple spreading from the point of contact:
 * `v-apex-ripple` or `v-apex-ripple="{ color: '…' }"`.
 *
 * The ink element is created per press and removed when its animation ends,
 * rather than kept and restarted. A single reused node cannot show two
 * overlapping presses, and restarting its animation mid-flight makes a rapid
 * double click look like one interrupted ripple.
 *
 * The radius is computed from the press position to the furthest corner, so the
 * wave always reaches the whole element however off-centre the click was.
 */
export interface RippleOptions {
  disabled?: boolean;
  /** Any CSS colour. Defaults to a tint of the host's own text colour. */
  color?: string;
  opacity?: number;
  duration?: string;
  /** Start from the element's centre rather than the pointer. */
  centered?: boolean;
  /** Also ripple on keyboard activation, from the centre. */
  keyboard?: boolean;
}

interface State {
  options: RippleOptions;
  onPointerDown: (e: PointerEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

const STATE = new WeakMap<HTMLElement, State>();

function parse(binding: DirectiveBinding): RippleOptions {
  const v = binding.value;
  if (v === false) return { disabled: true };
  if (typeof v === 'string') return { color: v };
  return { keyboard: true, ...(v || {}) };
}

/* The wave is clipped by a layer of our own, not by the host: forcing
   overflow:hidden on the host cut off anything meant to paint outside it — a
   button's badge, an avatar's status dot. */
function layerFor(el: HTMLElement) {
  let layer = el.querySelector<HTMLElement>(':scope > .apex-ripple__layer');
  if (!layer) {
    layer = document.createElement('span');
    layer.className = 'apex-ripple__layer';
    layer.setAttribute('aria-hidden', 'true');
    el.appendChild(layer);
  }
  return layer;
}

/**
 * Ink one element, optionally sized to a LARGER box than itself.
 *
 * `bounds` is what makes a ripple span several elements: give every cell in
 * a table row the same bounds — the row — and each one draws its slice of a
 * single circle, which reads as one wave crossing the row rather than a
 * cell-sized blob. Without it each cell would size its own wave and the
 * result is a row of little circles. AF2-326.
 *
 * Exported because a `<span>` is not a legal child of `<tr>`: hosting the
 * layer on the cells is the only structurally sound way to ripple a row.
 */
export function rippleAt(
  el: HTMLElement,
  options: RippleOptions = {},
  x?: number,
  y?: number,
  bounds?: HTMLElement,
) {
  spawn(el, options, x, y, bounds);
}

function spawn(el: HTMLElement, options: RippleOptions, x?: number, y?: number, bounds?: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const cx = options.centered || x === undefined ? rect.width / 2 : x - rect.left;
  const cy = options.centered || y === undefined ? rect.height / 2 : y - rect.top;
  /* Furthest corner, so the wave covers the element from wherever it started
     — of `bounds` when one is given, so slices of one wave agree on its size. */
  const box = bounds ? bounds.getBoundingClientRect() : rect;
  const bx = options.centered || x === undefined ? box.width / 2 : x - box.left;
  const by = options.centered || y === undefined ? box.height / 2 : y - box.top;
  const radius = Math.hypot(Math.max(bx, box.width - bx), Math.max(by, box.height - by));

  const ink = document.createElement('span');
  ink.className = 'apex-ripple__ink';
  ink.style.inlineSize = ink.style.blockSize = radius * 2 + 'px';
  ink.style.insetInlineStart = cx - radius + 'px';
  ink.style.insetBlockStart = cy - radius + 'px';
  if (options.color) ink.style.background = options.color;
  if (options.opacity !== undefined) ink.style.setProperty('--rp-opacity', String(options.opacity));
  /* A wave's life scales with how far it has to travel — AF2-327.
     The kit's --ease-out is cubic-bezier(.22,1,.36,1), which is ~90% done in
     the first third of its run. On a 42px button that reads as a ripple. On
     a table row the radius is half the ROW's diagonal, so the circle is over
     2000px across and covers everything before the eye catches it moving:
     measured 0.03 opacity at 220ms. The effect was firing correctly and was
     simply invisible.

     Only ever LENGTHENS — the floor is the 600ms every small control has
     always had, so nothing existing changes — and is capped so a very wide
     surface does not linger. */
  ink.style.setProperty(
    '--rp-dur',
    options.duration ?? `${Math.round(Math.max(600, Math.min(1200, radius * 0.8)))}ms`,
  );

  /* Removed on animationend rather than reused: one node cannot show two
     overlapping presses, and restarting it mid-flight reads as a stutter. */
  ink.addEventListener('animationend', () => ink.remove());
  layerFor(el).appendChild(ink);
}

export const apexRipple: Directive<HTMLElement> = {
  mounted(el, binding) {
    const options = parse(binding);
    el.classList.add('apex-ripple');

    function onPointerDown(e: PointerEvent) {
      const state = STATE.get(el);
      if (!state || state.options.disabled) return;
      spawn(el, state.options, e.clientX, e.clientY);
    }
    function onKeyDown(e: KeyboardEvent) {
      const state = STATE.get(el);
      if (!state || state.options.disabled || state.options.keyboard === false) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.repeat) return;
      spawn(el, { ...state.options, centered: true });
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('keydown', onKeyDown);
    STATE.set(el, { options, onPointerDown, onKeyDown });
  },
  updated(el, binding) {
    const state = STATE.get(el);
    if (state) state.options = parse(binding);
  },
  unmounted(el) {
    const state = STATE.get(el);
    if (!state) return;
    el.removeEventListener('pointerdown', state.onPointerDown);
    el.removeEventListener('keydown', state.onKeyDown);
    el.classList.remove('apex-ripple');
    el.querySelector(':scope > .apex-ripple__layer')?.remove();
    STATE.delete(el);
  },
};

/** Registers v-apex-ripple; ApexUI's install does this for you. */
export const ApexRipplePlugin: Plugin = {
  install(app: App) { app.directive('apexRipple', apexRipple); },
};
